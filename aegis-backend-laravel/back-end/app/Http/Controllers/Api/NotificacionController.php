<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use App\Services\NotificationDispatcher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificacionController extends Controller
{
    public function __construct(private NotificationDispatcher $dispatcher) {}

    public function index(Request $request)
    {
        $validated = $request->validate([
            'categoria' => ['nullable', 'in:social,marketplace,comunidad,seguridad,sistema'],
            'estado' => ['nullable', 'in:todas,no_leidas,leidas,archivadas'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);
        $query = Notificacion::query()
            ->where('usuario_id', $request->user()->id)
            ->with('usuario:id,nombre,username');

        if (! empty($validated['categoria'])) {
            $query->where('categoria', $validated['categoria']);
        }
        $estado = $validated['estado'] ?? 'todas';
        if ($estado === 'archivadas') {
            $query->whereNotNull('archivada_en');
        } else {
            $query->whereNull('archivada_en');
            if ($estado === 'no_leidas') {
                $query->where('leida', false);
            } elseif ($estado === 'leidas') {
                $query->where('leida', true);
            }
        }
        $query->latest('fecha_creacion');
        $notifications = $query->paginate($validated['per_page'] ?? 20);

        $unread = Notificacion::query()
            ->where('usuario_id', $request->user()->id)
            ->whereNull('archivada_en')
            ->where('leida', false)
            ->count();

        return response()->json([
            'data' => $notifications->items(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'last_page' => $notifications->lastPage(),
                'no_leidas' => $unread,
            ],
        ]);
    }

    public function unread(Request $request)
    {
        $count = Notificacion::query()
            ->where('usuario_id', $request->user()->id)
            ->whereNull('archivada_en')
            ->where('leida', false)
            ->count();

        return response()->json(['data' => ['no_leidas' => $count]]);
    }

    public function read(Request $request, int $notificacion)
    {
        $notification = Notificacion::query()
            ->whereKey($notificacion)
            ->where('usuario_id', $request->user()->id)
            ->firstOrFail();
        $notification->update([
            'leida' => true,
            'leida_en' => now(),
        ]);

        return response()->json(['data' => $notification]);
    }

    public function readAll(Request $request)
    {
        $validated = $request->validate([
            'categoria' => ['nullable', 'in:social,marketplace,comunidad,seguridad,sistema'],
        ]);
        $query = Notificacion::query()
            ->where('usuario_id', $request->user()->id)
            ->whereNull('archivada_en')
            ->where('leida', false);
        if (! empty($validated['categoria'])) {
            $query->where('categoria', $validated['categoria']);
        }
        $query->update([
            'leida' => true,
            'leida_en' => now(),
        ]);

        return response()->json(['message' => 'Notificaciones marcadas como leídas.']);
    }

    public function archive(Request $request, int $notificacion)
    {
        $notification = Notificacion::query()
            ->whereKey($notificacion)
            ->where('usuario_id', $request->user()->id)
            ->firstOrFail();
        $notification->update([
            'archivada_en' => now(),
        ]);

        return response()->json(['message' => 'Notificación archivada.']);
    }

    public function delete(Request $request, int $notificacion)
    {
        Notificacion::query()
            ->whereKey($notificacion)
            ->where('usuario_id', $request->user()->id)
            ->delete();

        return response()->json(['message' => 'Notificación descartada.']);
    }

    public function preferences(Request $request)
    {
        $categories = ['social', 'marketplace', 'comunidad', 'seguridad', 'sistema'];
        $preferences = DB::table('preferencias_notificacion')
            ->where('usuario_id', $request->user()->id)
            ->get()
            ->keyBy('categoria');
        $data = [];
        foreach ($categories as $category) {
            $row = $preferences->get($category);
            $data[] = [
                'categoria' => $category,
                'in_app' => $category === 'seguridad'
                    ? true
                    : ($row ? (bool) $row->in_app : true),
                'email' => $row ? (bool) $row->email : false,
                'push_web' => $row ? (bool) $row->push_web : false,
            ];
        }

        return response()->json(['data' => $data]);
    }

    public function updatePreferences(Request $request)
    {
        $validated = $request->validate([
            'categoria' => ['required', 'in:social,marketplace,comunidad,seguridad,sistema'],
            'in_app' => ['sometimes', 'boolean'],
            'email' => ['sometimes', 'boolean'],
            'push_web' => ['sometimes', 'boolean'],
        ]);
        $category = $validated['categoria'];
        $row = DB::table('preferencias_notificacion')
            ->where('usuario_id', $request->user()->id)
            ->where('categoria', $category)
            ->first();
        $values = [
            'in_app' => $category === 'seguridad'
                ? true
                : ($validated['in_app'] ?? ($row ? (bool) $row->in_app : true)),
            'email' => $validated['email'] ?? ($row ? (bool) $row->email : false),
            'push_web' => $validated['push_web'] ?? ($row ? (bool) $row->push_web : false),
            'updated_at' => now(),
            'created_at' => $row ? $row->created_at : now(),
        ];
        DB::table('preferencias_notificacion')->updateOrInsert(
            ['usuario_id' => $request->user()->id, 'categoria' => $category],
            $values,
        );

        return response()->json([
            'data' => [
                'categoria' => $category,
                ...$values,
            ],
        ]);
    }

    public function emitTest(Request $request)
    {
        $validated = $request->validate([
            'categoria' => ['required', 'in:social,marketplace,comunidad,seguridad,sistema'],
            'tipo' => ['required', 'string', 'max:100'],
            'titulo' => ['required', 'string', 'max:150'],
            'mensaje' => ['required', 'string', 'max:1000'],
            'destino' => ['nullable', 'string', 'max:255'],
        ]);
        $notification = $this->dispatcher->emit(
            $request->user()->id,
            $validated['categoria'],
            $validated['tipo'],
            $validated['titulo'],
            $validated['mensaje'],
            $request->user()->id,
            null,
            null,
            $validated['destino'] ?? null,
            'manual:'.$request->user()->id.':'.hash('sha256', json_encode($validated)),
        );

        return response()->json(['data' => $notification], 201);
    }
}
