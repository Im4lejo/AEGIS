<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdjuntoMensaje;
use App\Models\Conversacion;
use App\Models\Mensaje;
use App\Models\ParticipanteConversacion;
use App\Models\Producto;
use App\Models\Usuario;
use App\Services\MediaManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MensajeController extends Controller
{
    public function __construct(private MediaManager $media) {}

    public function inbox(Request $request)
    {
        $participantIds = ParticipanteConversacion::query()
            ->where('usuario_id', $request->user()->id)
            ->where('estado', 'activo')
            ->whereNull('oculto_en')
            ->pluck('conversacion_id');

        $conversations = Conversacion::query()
            ->whereIn('id', $participantIds)
            ->where('estado', 'activa')
            ->with([
                'producto:id,titulo,precio,estado_publicacion,usuario_id',
                'usuarios:id,nombre,apellido,username,foto_perfil_url',
            ])
            ->with(['mensajes' => fn ($query) => $query
                ->with('autor:id,nombre,apellido,username')
                ->where('estado', '!=', 'eliminado')
                ->latest('fecha_envio')
                ->limit(1)])
            ->orderByDesc('ultimo_mensaje_en')
            ->paginate((int) $request->integer('per_page', 30));

        return response()->json([
            'data' => $conversations->items(),
            'meta' => [
                'current_page' => $conversations->currentPage(),
                'per_page' => $conversations->perPage(),
                'total' => $conversations->total(),
                'last_page' => $conversations->lastPage(),
            ],
        ]);
    }

    public function openDirect(Request $request)
    {
        $validated = $request->validate([
            'usuario_id' => ['required', 'integer', 'exists:usuarios,id', 'different:'.($request->user()->id)],
            'producto_id' => ['nullable', 'integer', 'exists:productos,id'],
        ]);
        $other = Usuario::query()->findOrFail($validated['usuario_id']);
        if ($this->isBlocked($request->user()->id, $other->id)) {
            return response()->json([
                'message' => 'No puedes iniciar una conversación con esta cuenta.',
                'code' => 'MESSAGE_BLOCKED',
            ], 403);
        }

        $product = isset($validated['producto_id'])
            ? Producto::query()->findOrFail($validated['producto_id'])
            : null;
        $ids = collect([$request->user()->id, $other->id])->sort()->values()->all();
        $key = 'direct:'.$ids[0].':'.$ids[1].':'.($product?->id ?? 0);

        $conversation = Conversacion::query()->where('contexto_clave', $key)->first();
        if (! $conversation) {
            $conversation = DB::transaction(function () use ($key, $product, $request, $other) {
                $conversation = Conversacion::query()->create([
                    'tipo' => 'directa',
                    'titulo' => null,
                    'producto_id' => $product?->id,
                    'contexto_clave' => $key,
                    'estado' => 'activa',
                ]);
                foreach ([$request->user()->id, $other->id] as $userId) {
                    ParticipanteConversacion::query()->create([
                        'conversacion_id' => $conversation->id,
                        'usuario_id' => $userId,
                        'rol' => 'miembro',
                        'estado' => 'activo',
                        'notificar' => true,
                    ]);
                }

                return $conversation;
            });
        }

        foreach ($conversation->participantes()->where('usuario_id', $request->user()->id)->get() as $participant) {
            $participant->update(['oculto_en' => null, 'estado' => 'activo']);
        }

        return response()->json([
            'data' => $this->conversationPayload($conversation, $request->user()),
        ], 201);
    }

    public function createGroup(Request $request)
    {
        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:150'],
            'usuario_ids' => ['required', 'array', 'min:1', 'max:50'],
            'usuario_ids.*' => ['integer', 'exists:usuarios,id', 'distinct'],
        ]);

        $conversation = DB::transaction(function () use ($request, $validated) {
            $conversation = Conversacion::query()->create([
                'tipo' => 'grupal',
                'titulo' => trim($validated['titulo']),
                'estado' => 'activa',
            ]);
            ParticipanteConversacion::query()->create([
                'conversacion_id' => $conversation->id,
                'usuario_id' => $request->user()->id,
                'rol' => 'owner',
                'estado' => 'activo',
            ]);
            foreach (array_unique($validated['usuario_ids']) as $userId) {
                if ((int) $userId === (int) $request->user()->id) {
                    continue;
                }
                if ($this->isBlocked($request->user()->id, (int) $userId)) {
                    throw ValidationException::withMessages([
                        'usuario_ids' => ['Hay un usuario bloqueado en la invitación.'],
                    ]);
                }
                ParticipanteConversacion::query()->create([
                    'conversacion_id' => $conversation->id,
                    'usuario_id' => (int) $userId,
                    'rol' => 'miembro',
                    'estado' => 'activo',
                ]);
            }

            return $conversation;
        });

        return response()->json([
            'data' => $this->conversationPayload($conversation, $request->user()),
        ], 201);
    }

    public function show(Request $request, int $conversacion)
    {
        $conversation = Conversacion::query()->findOrFail($conversacion);
        $participant = $this->participant($conversation, $request->user());
        if (! $participant) {
            return response()->json(['message' => 'Sin acceso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }

        return response()->json([
            'data' => $this->conversationPayload($conversation, $request->user(), $participant),
        ]);
    }

    public function messages(Request $request, int $conversacion)
    {
        $conversation = Conversacion::query()->findOrFail($conversacion);
        $participant = $this->participant($conversation, $request->user());
        if (! $participant) {
            return response()->json(['message' => 'Sin acceso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }
        $validated = $request->validate([
            'before_id' => ['nullable', 'integer'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = $conversation->mensajes()
            ->with([
                'autor:id,nombre,apellido,username,foto_perfil_url',
                'adjuntos',
            ])
            ->orderByDesc('fecha_envio')
            ->orderByDesc('id');
        if (! empty($validated['before_id'])) {
            $query->where('id', '<', (int) $validated['before_id']);
        }
        $perPage = $validated['per_page'] ?? 30;
        $messages = $query->limit($perPage + 1)->get();
        $hasMore = $messages->count() > $perPage;
        $items = $messages->take($perPage)->values()->reverse()->values();
        $nextBefore = $hasMore ? $items->first()?->id : null;

        return response()->json([
            'data' => $items,
            'meta' => [
                'per_page' => $perPage,
                'next_before_id' => $nextBefore,
                'has_more' => $hasMore,
            ],
        ]);
    }

    public function send(Request $request, int $conversacion)
    {
        $conversation = Conversacion::query()->findOrFail($conversacion);
        $participant = $this->participant($conversation, $request->user());
        if (! $participant || $participant->estado !== 'activo') {
            return response()->json(['message' => 'Sin acceso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }
        if ($conversation->estado !== 'activa') {
            return response()->json(['message' => 'Conversación cerrada.', 'code' => 'CONVERSATION_CLOSED'], 403);
        }

        $recent = Mensaje::query()
            ->where('autor_id', $request->user()->id)
            ->where('fecha_envio', '>=', now()->subMinute())
            ->count();
        if ($recent >= 30) {
            return response()->json([
                'message' => 'Límite temporal de mensajes alcanzado.',
                'code' => 'MESSAGE_RATE_LIMIT',
            ], 429);
        }

        $validated = $request->validate([
            'contenido' => ['nullable', 'string', 'max:5000'],
            'respondido_a_id' => ['nullable', 'integer', 'exists:mensajes,id'],
            'adjuntos' => ['nullable', 'array', 'max:5'],
            'adjuntos.*' => ['required', 'file'],
        ]);
        if (trim((string) ($validated['contenido'] ?? '')) === '' && empty($validated['adjuntos'])) {
            throw ValidationException::withMessages([
                'contenido' => ['Escribe un mensaje o adjunta un archivo.'],
            ]);
        }
        if (! empty($validated['respondido_a_id'])) {
            $quoted = Mensaje::query()
                ->whereKey($validated['respondido_a_id'])
                ->where('conversacion_id', $conversation->id)
                ->exists();
            if (! $quoted) {
                throw ValidationException::withMessages([
                    'respondido_a_id' => ['El mensaje citado no pertenece a esta conversación.'],
                ]);
            }
        }

        $message = DB::transaction(function () use ($conversation, $request, $validated) {
            $message = Mensaje::query()->create([
                'conversacion_id' => $conversation->id,
                'autor_id' => $request->user()->id,
                'respondido_a_id' => $validated['respondido_a_id'] ?? null,
                'contenido' => trim((string) ($validated['contenido'] ?? '')),
                'estado' => 'activo',
                'fecha_envio' => now(),
            ]);
            foreach ($validated['adjuntos'] ?? [] as $file) {
                $uploaded = $this->media->upload(
                    $file,
                    'mensajes',
                    'Conversacion/'.$conversation->id,
                );
                AdjuntoMensaje::query()->create([
                    'mensaje_id' => $message->id,
                    'public_id' => $uploaded['public_id'],
                    'url' => $uploaded['url'],
                    'nombre_original' => $file->getClientOriginalName(),
                    'mime_type' => $uploaded['mime_type'],
                    'size' => $uploaded['size'],
                ]);
            }
            $conversation->update(['ultimo_mensaje_en' => now()]);

            return $message;
        });

        return response()->json([
            'data' => $message->load(['autor:id,nombre,apellido,username,foto_perfil_url', 'adjuntos']),
        ], 201);
    }

    public function markRead(Request $request, int $conversacion)
    {
        $conversation = Conversacion::query()->findOrFail($conversacion);
        $participant = $this->participant($conversation, $request->user());
        if (! $participant) {
            return response()->json(['message' => 'Sin acceso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }

        $now = now();
        $participant->update(['ultimo_leido_en' => $now]);
        if ($participant->recibos_opt_in) {
            $ids = $conversation->mensajes()
                ->where('autor_id', '!=', $request->user()->id)
                ->pluck('id');
            foreach ($ids as $messageId) {
                DB::table('lecturas_mensaje')->updateOrInsert(
                    ['mensaje_id' => $messageId, 'usuario_id' => $request->user()->id],
                    ['leido_en' => $now],
                );
            }
        }

        return response()->json(['data' => ['ultimo_leido_en' => $now->toISOString()]]);
    }

    public function preferences(Request $request, int $conversacion)
    {
        $conversation = Conversacion::query()->findOrFail($conversacion);
        $participant = $this->participant($conversation, $request->user());
        if (! $participant) {
            return response()->json(['message' => 'Sin acceso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }
        $validated = $request->validate([
            'notificar' => ['sometimes', 'boolean'],
            'recibos_opt_in' => ['sometimes', 'boolean'],
            'archivar' => ['sometimes', 'boolean'],
            'silenciar' => ['sometimes', 'boolean'],
        ]);

        if (isset($validated['notificar'])) {
            $participant->notificar = $validated['notificar'];
        }
        if (isset($validated['recibos_opt_in'])) {
            $participant->recibos_opt_in = $validated['recibos_opt_in'];
        }
        if (! empty($validated['archivar'])) {
            $participant->oculto_en = now();
        } elseif (array_key_exists('archivar', $validated)) {
            $participant->oculto_en = null;
        }
        if (! empty($validated['silenciar'])) {
            $participant->estado = 'silenciado';
        } elseif (array_key_exists('silenciar', $validated)) {
            $participant->estado = 'activo';
        }
        $participant->save();

        return response()->json(['data' => $participant->fresh()]);
    }

    public function leave(Request $request, int $conversacion)
    {
        $conversation = Conversacion::query()->findOrFail($conversacion);
        $participant = $this->participant($conversation, $request->user());
        if (! $participant) {
            return response()->json(['message' => 'Sin acceso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }
        $participant->update(['estado' => 'salido', 'oculto_en' => now()]);

        return response()->json(['message' => 'Has salido de la conversación.']);
    }

    public function report(Request $request, int $conversacion)
    {
        $conversation = Conversacion::query()->findOrFail($conversacion);
        $this->participant($conversation, $request->user())
            ?? abort(403, 'Sin acceso.');
        $validated = $request->validate([
            'mensaje_id' => ['nullable', 'integer', 'exists:mensajes,id'],
            'motivo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string', 'max:2000'],
        ]);

        DB::table('reportes_mensaje')->insert([
            'conversacion_id' => $conversation->id,
            'mensaje_id' => $validated['mensaje_id'] ?? null,
            'reportante_id' => $request->user()->id,
            'motivo' => trim($validated['motivo']),
            'descripcion' => $validated['descripcion'] ?? null,
            'estado' => 'pendiente',
            'fecha' => now(),
        ]);

        return response()->json(['message' => 'Reporte enviado.'], 201);
    }

    public function deleteMessage(Request $request, int $conversacion, int $mensaje)
    {
        $conversation = Conversacion::query()->findOrFail($conversacion);
        $participant = $this->participant($conversation, $request->user());
        if (! $participant) {
            return response()->json(['message' => 'Sin acceso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }
        $message = Mensaje::query()
            ->whereKey($mensaje)
            ->where('conversacion_id', $conversation->id)
            ->firstOrFail();
        if ((int) $message->autor_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'Solo puedes eliminar tus mensajes.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }
        $message->update(['estado' => 'eliminado', 'contenido' => null, 'editado_en' => now()]);

        return response()->json(['message' => 'Mensaje eliminado para otros participantes.', 'code' => 'RESOURCE_DELETED']);
    }

    public function search(Request $request)
    {
        $validated = $request->validate([
            'busqueda' => ['required', 'string', 'max:200'],
            'conversacion_id' => ['nullable', 'integer', 'exists:conversaciones,id'],
        ]);
        $participantIds = ParticipanteConversacion::query()
            ->where('usuario_id', $request->user()->id)
            ->where('estado', 'activo')
            ->pluck('conversacion_id');

        $query = Mensaje::query()
            ->whereIn('conversacion_id', $participantIds)
            ->where('estado', '!=', 'eliminado')
            ->where('contenido', 'like', '%'.$validated['busqueda'].'%')
            ->with('conversacion:id,titulo,tipo')
            ->latest('fecha_envio');
        if (! empty($validated['conversacion_id'])) {
            $query->where('conversacion_id', $validated['conversacion_id']);
        }

        $messages = $query->paginate((int) $request->integer('per_page', 30));

        return response()->json([
            'data' => $messages->items(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
                'last_page' => $messages->lastPage(),
            ],
        ]);
    }

    private function participant(Conversacion $conversation, Usuario $user): ?ParticipanteConversacion
    {
        return ParticipanteConversacion::query()
            ->where('conversacion_id', $conversation->id)
            ->where('usuario_id', $user->id)
            ->first();
    }

    private function isBlocked(int $userId, int $otherId): bool
    {
        return DB::table('bloqueos_usuario')
            ->where('tipo', 'bloqueo')
            ->where(function ($query) use ($userId, $otherId): void {
                $query->where(function ($sub) use ($userId, $otherId): void {
                    $sub->where('bloqueador_id', $userId)->where('bloqueado_id', $otherId);
                })->orWhere(function ($sub) use ($userId, $otherId): void {
                    $sub->where('bloqueador_id', $otherId)->where('bloqueado_id', $userId);
                });
            })
            ->exists();
    }

    private function conversationPayload(
        Conversacion $conversation,
        Usuario $user,
        ?ParticipanteConversacion $participant = null,
    ): array {
        $participant = $participant ?? $this->participant($conversation, $user);
        $conversation->load([
            'producto:id,titulo,precio,estado_publicacion,usuario_id',
            'usuarios:id,nombre,apellido,username,foto_perfil_url',
        ]);

        return [
            'id' => $conversation->id,
            'tipo' => $conversation->tipo,
            'titulo' => $conversation->tipo === 'directa'
                ? $conversation->usuarios->firstWhere('id', '!=', $user->id)?->nombre
                    ?? 'Conversación'
                : $conversation->titulo,
            'producto' => $conversation->producto,
            'estado' => $conversation->estado,
            'ultimo_mensaje_en' => $conversation->ultimo_mensaje_en,
            'participantes' => $conversation->usuarios,
            'mi_rol' => $participant?->rol,
            'mi_estado' => $participant?->estado,
            'retencion' => 'Los mensajes se conservan hasta eliminación o cierre conforme a la política vigente.',
        ];
    }
}
