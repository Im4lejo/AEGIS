<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VideoController extends Controller
{
    public function capabilities()
    {
        $vodConfigured = filled(config('cloudinary.cloud_url'))
            && ! str_contains((string) config('cloudinary.cloud_url'), 'cloudinary://:')
            && ! str_contains((string) config('cloudinary.cloud_url'), 'cloudinary://@');
        $liveEnabled = (bool) config('video.live_enabled')
            && in_array(strtolower((string) config('video.live_provider')), ['cloudinary', 'mux'], true);

        return response()->json([
            'vod' => [
                'available' => $vodConfigured,
                'formats' => ['video/mp4', 'video/webm', 'video/quicktime'],
                'max_size_bytes' => 25 * 1024 * 1024,
                'adaptive' => false,
            ],
            'live' => [
                'available' => $liveEnabled,
                'provider' => $liveEnabled ? config('video.live_provider') : null,
            ],
        ]);
    }

    public function liveUnavailable(Request $request)
    {
        DB::table('sesiones_live')->insert([
            'usuario_id' => $request->user()->id,
            'proveedor' => strtolower((string) config('video.live_provider', 'ninguno')),
            'estado' => 'no_disponible',
            'motivo' => 'No existe un proveedor Live correctamente configurado.',
            'creada_en' => now(),
        ]);

        return response()->json([
            'message' => 'Transmisión en vivo no disponible.',
            'code' => 'LIVE_UNAVAILABLE',
            'live' => ['available' => false],
        ], 503);
    }
}
