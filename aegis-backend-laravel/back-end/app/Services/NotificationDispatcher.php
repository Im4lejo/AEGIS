<?php

namespace App\Services;

use App\Models\Notificacion;
use Illuminate\Support\Facades\DB;

class NotificationDispatcher
{
    public function emit(
        int $destinatarioId,
        string $categoria,
        string $tipo,
        string $titulo,
        string $mensaje,
        ?int $actorId = null,
        ?string $objetoTipo = null,
        ?int $objetoId = null,
        ?string $destino = null,
        ?string $dedupeKey = null,
    ): ?Notificacion {
        if ($categoria !== 'seguridad') {
            $preference = DB::table('preferencias_notificacion')
                ->where('usuario_id', $destinatarioId)
                ->where('categoria', $categoria)
                ->first();
            if ($preference && ! (bool) $preference->in_app) {
                return null;
            }
        }

        $attributes = [
            'usuario_id' => $destinatarioId,
            'categoria' => $categoria,
            'tipo' => $tipo,
            'actor_id' => $actorId,
            'objeto_tipo' => $objetoTipo,
            'objeto_id' => $objetoId,
            'destino' => $destino,
            'titulo' => $titulo,
            'mensaje' => $mensaje,
            'fecha_creacion' => now(),
        ];
        if ($dedupeKey) {
            $attributes['dedupe_key'] = $dedupeKey;

            return Notificacion::query()->firstOrCreate(
                [
                    'usuario_id' => $destinatarioId,
                    'dedupe_key' => $dedupeKey,
                ],
                $attributes,
            );
        }

        return Notificacion::query()->create($attributes);
    }
}
