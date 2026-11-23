<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Historia;
use App\Models\VisualizacionHistoria;
use App\Models\Comunidad;
use App\Models\MembresiaComunidad;
use App\Models\EventoComunidad;
use App\Models\ParticipacionEvento;
use App\Services\MediaManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ContenidoAvanzadoController extends Controller
{
    public function __construct(private MediaManager $media) {}

    public function createStory(Request $request)
    {
        $validated = $request->validate([
            'archivo' => ['required', 'file'],
            'audiencia' => ['required', 'in:publica,seguidores,grupo_privado'],
            'comunidad_id' => ['nullable', 'integer', 'exists:comunidades,id'],
            'texto' => ['nullable', 'string', 'max:500'],
            'horas' => ['nullable', 'integer', 'min:1', 'max:168'],
        ]);
        if ($validated['audiencia'] === 'grupo_privado') {
            $communityId = (int) ($validated['comunidad_id'] ?? 0);
            $member = MembresiaComunidad::query()
                ->where('comunidad_id', $communityId)
                ->where('usuario_id', $request->user()->id)
                ->where('estado', 'activo')
                ->exists();
            if (! $member) {
                return response()->json([
                    'message' => 'La historia privada requiere pertenecer a la comunidad.',
                    'code' => 'PRIVATE_STORY_COMMUNITY_REQUIRED',
                ], 403);
            }
        }
        $file = $validated['archivo'];
        $mime = strtolower((string) $file->getMimeType());
        $allowVideo = str_starts_with($mime, 'video/');
        $uploaded = $this->media->upload(
            $file,
            'historias',
            'Usuario/'.$request->user()->id,
            $allowVideo,
        );
        $story = Historia::query()->create([
            'usuario_id' => $request->user()->id,
            'comunidad_id' => $validated['audiencia'] === 'grupo_privado'
                ? ($validated['comunidad_id'] ?? null)
                : null,
            'tipo_media' => $allowVideo ? 'video' : 'imagen',
            'media_url' => $uploaded['url'],
            'media_public_id' => $uploaded['public_id'],
            'mime_type' => $uploaded['mime_type'],
            'texto' => trim((string) ($validated['texto'] ?? '')),
            'audiencia' => $validated['audiencia'],
            'estado' => 'activa',
            'expira_en' => now()->addHours($validated['horas'] ?? 24),
        ]);

        return response()->json(['data' => $story], 201);
    }

    public function stories(Request $request)
    {
        $viewerId = $request->user()?->id;
        $blockedIds = $viewerId
            ? DB::table('bloqueos_usuario')
                ->where(function ($query) use ($viewerId): void {
                    $query->where('bloqueador_id', $viewerId)
                        ->orWhere('bloqueado_id', $viewerId);
                })
                ->get(['bloqueador_id', 'bloqueado_id'])
                ->flatMap(fn ($row) => [(int) $row->bloqueador_id, (int) $row->bloqueado_id])
                ->unique()
                ->filter(fn ($id) => $id !== (int) $viewerId)
                ->values()
            : collect();
        $active = Historia::query()
            ->where('estado', 'activa')
            ->where('expira_en', '>', now())
            ->whereNotIn('usuario_id', $blockedIds)
            ->where(function ($query) use ($request, $viewerId): void {
                $query->where('audiencia', 'publica');
                if ($request->user()) {
                    $followed = DB::table('seguimientos')
                        ->where('seguidor_id', $request->user()->id)
                        ->where('estado', 'aceptado')
                        ->pluck('seguido_id');
                    $query->orWhere(function ($sub) use ($followed): void {
                        $sub->where('audiencia', 'seguidores')
                            ->whereIn('usuario_id', $followed);
                    });
                    $communityIds = MembresiaComunidad::query()
                        ->where('usuario_id', $viewerId)
                        ->where('estado', 'activo')
                        ->pluck('comunidad_id');
                    $query->orWhere(function ($sub) use ($communityIds): void {
                        $sub->where('audiencia', 'grupo_privado')
                            ->whereIn('comunidad_id', $communityIds);
                    });
                    $query->orWhere('usuario_id', $request->user()->id);
                }
            })
            ->with('usuario:id,nombre,apellido,username,foto_perfil_url')
            ->latest('fecha_creacion')
            ->paginate((int) $request->integer('per_page', 50));

        return response()->json([
            'data' => $active->items(),
            'meta' => [
                'current_page' => $active->currentPage(),
                'per_page' => $active->perPage(),
                'total' => $active->total(),
                'last_page' => $active->lastPage(),
            ],
        ]);
    }

    public function viewStory(Request $request, int $historia)
    {
        $story = Historia::query()->findOrFail($historia);
        if ($story->estado !== 'activa' || $story->expira_en->isPast()) {
            return response()->json(['message' => 'La historia expiró.', 'code' => 'STORY_EXPIRED'], 410);
        }
        $viewer = $request->user();
        if ($viewer) {
            $blocked = DB::table('bloqueos_usuario')
                ->where(function ($query) use ($viewer, $story): void {
                    $query->where(function ($sub) use ($viewer, $story): void {
                        $sub->where('bloqueador_id', $viewer->id)
                            ->where('bloqueado_id', $story->usuario_id);
                    })->orWhere(function ($sub) use ($viewer, $story): void {
                        $sub->where('bloqueador_id', $story->usuario_id)
                            ->where('bloqueado_id', $viewer->id);
                    });
                })
                ->exists();
            if ($blocked) {
                return response()->json(['message' => 'Contenido no disponible.', 'code' => 'BLOCKED_CONTENT'], 403);
            }
        }
        if ($story->audiencia === 'seguidores') {
            if (! $viewer) {
                return response()->json(['message' => 'Debes iniciar sesión.', 'code' => 'AUTH_REQUIRED'], 401);
            }
            $follows = DB::table('seguimientos')
                ->where('seguidor_id', $viewer->id)
                ->where('seguido_id', $story->usuario_id)
                ->where('estado', 'aceptado')
                ->exists();
            if (! $follows && (int) $story->usuario_id !== (int) $viewer->id) {
                return response()->json(['message' => 'Sin acceso.', 'code' => 'PRIVATE_STORY'], 403);
            }
        }
        if ($story->audiencia === 'grupo_privado') {
            if (! $viewer) {
                return response()->json(['message' => 'Debes iniciar sesión.', 'code' => 'AUTH_REQUIRED'], 401);
            }
            $member = MembresiaComunidad::query()
                ->where('comunidad_id', $story->comunidad_id)
                ->where('usuario_id', $viewer->id)
                ->where('estado', 'activo')
                ->exists();
            if (! $member && (int) $story->usuario_id !== (int) $viewer->id) {
                return response()->json(['message' => 'Sin acceso a esta historia privada.', 'code' => 'PRIVATE_STORY'], 403);
            }
        }
        if ($request->user()) {
            VisualizacionHistoria::query()->firstOrCreate([
                'historia_id' => $story->id,
                'usuario_id' => $request->user()->id,
            ], ['fecha' => now()]);
            $story->update([
                'visualizaciones' => VisualizacionHistoria::query()
                    ->where('historia_id', $story->id)
                    ->count(),
            ]);
        }

        return response()->json(['data' => $story->load('usuario:id,nombre,username,foto_perfil_url')]);
    }

    public function deleteStory(Request $request, int $historia)
    {
        $story = Historia::query()->findOrFail($historia);
        if ((int) $story->usuario_id !== (int) $request->user()->id
            && $request->user()->rol !== 'admin'
        ) {
            return response()->json(['message' => 'Sin permiso.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }
        $story->update(['estado' => 'eliminada']);

        if ($story->media_public_id) {
            $this->media->destroyWithRetry(
                $story->media_public_id,
                $story->tipo_media === 'video' ? 'video' : 'image',
                'historia-'.$story->id,
            );
        }

        return response()->json(['message' => 'Historia eliminada.', 'code' => 'RESOURCE_DELETED']);
    }

    public function createEvent(Request $request, int $comunidad)
    {
        $community = Comunidad::query()->findOrFail($comunidad);
        $membership = MembresiaComunidad::query()
            ->where('comunidad_id', $community->id)
            ->where('usuario_id', $request->user()->id)
            ->where('estado', 'activo')
            ->first();
        if (! $membership || ! in_array($membership->rol, ['owner', 'moderador'], true)) {
            return response()->json(['message' => 'Solo owner/moderador puede crear eventos.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }
        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:200'],
            'descripcion' => ['nullable', 'string', 'max:5000'],
            'lugar' => ['nullable', 'string', 'max:255'],
            'fecha_inicio' => ['required', 'date', 'after:now'],
            'fecha_fin' => ['nullable', 'date', 'after:fecha_inicio'],
            'cupo' => ['nullable', 'integer', 'min:1', 'max:100000'],
        ]);
        $event = EventoComunidad::query()->create([
            'comunidad_id' => $community->id,
            'creador_id' => $request->user()->id,
            ...$validated,
        ]);

        return response()->json(['data' => $event], 201);
    }

    public function events(Request $request, int $comunidad)
    {
        $community = Comunidad::query()->findOrFail($comunidad);
        if ($community->visibilidad === 'privada' || $community->visibilidad === 'invitacion') {
            $viewer = $request->user();
            $member = $viewer
                ? MembresiaComunidad::query()
                    ->where('comunidad_id', $community->id)
                    ->where('usuario_id', $viewer->id)
                    ->where('estado', 'activo')
                    ->exists()
                : false;
            if (! $member && (! $viewer || (int) $community->owner_id !== (int) $viewer->id)) {
                return response()->json([
                    'message' => 'Debes solicitar acceso a esta comunidad.',
                    'code' => 'COMMUNITY_ACCESS_REQUIRED',
                ], 403);
            }
        }
        $events = EventoComunidad::query()
            ->where('comunidad_id', $community->id)
            ->where('estado', 'activo')
            ->where('fecha_inicio', '>=', now())
            ->withCount(['participaciones as asistentes_count' => fn ($q) => $q
                ->where('estado', 'asistira')])
            ->orderBy('fecha_inicio')
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json([
            'data' => $events->items(),
            'meta' => [
                'current_page' => $events->currentPage(),
                'per_page' => $events->perPage(),
                'total' => $events->total(),
                'last_page' => $events->lastPage(),
            ],
        ]);
    }

    public function cancelEvent(Request $request, int $evento)
    {
        $event = EventoComunidad::query()->with('comunidad')->findOrFail($evento);
        $membership = MembresiaComunidad::query()
            ->where('comunidad_id', $event->comunidad_id)
            ->where('usuario_id', $request->user()->id)
            ->where('estado', 'activo')
            ->first();
        $canCancel = (int) $event->creador_id === (int) $request->user()->id
            || $request->user()->rol === 'admin'
            || ($membership && in_array($membership->rol, ['owner', 'moderador'], true));
        if (! $canCancel) {
            return response()->json(['message' => 'Sin permiso para cancelar el evento.', 'code' => 'FORBIDDEN_RESOURCE'], 403);
        }
        $event->update(['estado' => 'cancelado']);

        return response()->json(['data' => $event]);
    }

    public function participate(Request $request, int $evento)
    {
        $event = EventoComunidad::query()->findOrFail($evento);
        if ($event->estado !== 'activo' || $event->fecha_inicio->isPast()) {
            return response()->json(['message' => 'El evento no acepta participaciones.', 'code' => 'EVENT_CLOSED'], 409);
        }
        $validated = $request->validate([
            'estado' => ['required', 'in:asistira,interesado,cancelado'],
            'recordatorio' => ['sometimes', 'boolean'],
        ]);
        if ($validated['estado'] === 'asistira' && $event->cupo) {
            $attendees = $event->participaciones()->where('estado', 'asistira')->count();
            $existing = $event->participaciones()
                ->where('usuario_id', $request->user()->id)
                ->where('estado', 'asistira')
                ->exists();
            if (! $existing && $attendees >= $event->cupo) {
                throw ValidationException::withMessages(['evento' => ['El cupo está completo.']]);
            }
        }
        $participation = ParticipacionEvento::query()->updateOrCreate(
            ['evento_id' => $event->id, 'usuario_id' => $request->user()->id],
            [
                'estado' => $validated['estado'],
                'recordatorio' => $validated['recordatorio'] ?? true,
                'recordar_en' => ($validated['recordatorio'] ?? true)
                    ? $event->fecha_inicio->copy()->subHour()
                    : null,
                'fecha' => now(),
            ],
        );

        return response()->json(['data' => $participation], 201);
    }
}
