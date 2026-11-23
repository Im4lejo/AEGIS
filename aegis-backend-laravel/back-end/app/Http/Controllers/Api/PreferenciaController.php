<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PreferenciaUsuario;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PreferenciaController extends Controller
{
    private const VERSION = 1;

    public function defaults()
    {
        return response()->json([
            'version' => self::VERSION,
            'data' => $this->defaultPreferences(),
        ]);
    }

    public function show(Request $request)
    {
        $preference = PreferenciaUsuario::query()
            ->where('usuario_id', $request->user()->id)
            ->first();
        $values = $preference
            ? array_replace_recursive($this->defaultPreferences(), $preference->preferencias)
            : $this->defaultPreferences();

        return response()->json([
            'version' => $preference?->version ?? self::VERSION,
            'data' => $values,
            'guardado_en' => $preference?->ultima_sincronizacion,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'version' => ['sometimes', 'integer', 'in:1'],
            'preferencias' => ['required', 'array'],
        ]);
        $this->validatePreferences($validated['preferencias']);
        $normalized = $this->normalizePreferences($validated['preferencias']);

        $preference = PreferenciaUsuario::query()->updateOrCreate(
            ['usuario_id' => $request->user()->id],
            [
                'version' => self::VERSION,
                'preferencias' => $normalized,
                'ultima_sincronizacion' => now(),
            ],
        );

        return response()->json([
            'message' => 'Preferencias guardadas.',
            'version' => self::VERSION,
            'data' => $normalized,
            'guardado_en' => $preference->ultima_sincronizacion,
        ]);
    }

    public function reset(Request $request)
    {
        $values = $this->defaultPreferences();
        PreferenciaUsuario::query()->updateOrCreate(
            ['usuario_id' => $request->user()->id],
            [
                'version' => self::VERSION,
                'preferencias' => $values,
                'ultima_sincronizacion' => now(),
            ],
        );

        return response()->json([
            'message' => 'Preferencias restablecidas.',
            'version' => self::VERSION,
            'data' => $values,
        ]);
    }

    private function defaultPreferences(): array
    {
        return [
            'apariencia' => [
                'tema' => 'system',
                'acento' => 'indigo',
                'densidad' => 'normal',
                'contenido_ancho' => 'normal',
                'tamano_texto' => 'normal',
                'contraste' => 'estandar',
                'movimiento' => 'system',
            ],
            'feed' => [
                'inicio' => 'para-ti',
                'categorias_favoritas' => [],
                'sugerencias' => true,
            ],
            'marketplace' => [
                'ciudad_aprox' => null,
                'formato_regional' => 'es-CO',
                'moneda' => 'COP',
            ],
            'mensajeria' => [
                'mensajes_desconocidos' => 'solicitud',
                'confirmaciones_lectura' => false,
                'notificar_mensajes' => true,
            ],
            'privacidad' => [
                'perfil_publico' => true,
                'mostrar_seguidores' => true,
                'mostrar_presencia' => false,
                'audiencia_publicacion' => 'publica',
            ],
            'accesibilidad' => [
                'reducir_movimiento' => 'system',
                'subrayar_enlaces' => false,
                'lector_pantalla' => false,
            ],
            'idioma' => 'es',
        ];
    }

    private function validatePreferences(array $preferences): void
    {
        $allowed = [
            'apariencia.tema' => ['system', 'light', 'dark'],
            'apariencia.acento' => ['indigo', 'violet', 'blue', 'green'],
            'apariencia.densidad' => ['compacta', 'normal', 'espaciada'],
            'apariencia.contenido_ancho' => ['normal', 'ancho', 'compacto'],
            'apariencia.tamano_texto' => ['pequeno', 'normal', 'grande'],
            'apariencia.contraste' => ['estandar', 'alto'],
            'apariencia.movimiento' => ['system', 'reducido', 'completo'],
            'feed.inicio' => ['para-ti', 'siguiendo', 'recientes'],
            'marketplace.moneda' => ['COP'],
            'marketplace.formato_regional' => ['es-CO'],
            'mensajeria.mensajes_desconocidos' => ['todos', 'solicitud', 'nadie'],
            'privacidad.audiencia_publicacion' => ['publica', 'privada', 'seguidores'],
            'accesibilidad.reducir_movimiento' => ['system', 'si', 'no'],
            'idioma' => ['es', 'en'],
        ];
        $errors = [];
        foreach ($allowed as $path => $values) {
            $value = data_get($preferences, $path);
            if ($value !== null && ! in_array($value, $values, true)) {
                $errors[$path] = ['Valor no permitido.'];
            }
        }
        if (! empty($preferences['feed']['categorias_favoritas'])
            && (! is_array($preferences['feed']['categorias_favoritas'])
                || count($preferences['feed']['categorias_favoritas']) > 20)
        ) {
            $errors['feed.categorias_favoritas'] = ['Máximo 20 categorías.'];
        }
        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }

    private function normalizePreferences(array $preferences): array
    {
        $normalized = array_replace_recursive($this->defaultPreferences(), $preferences);
        $normalized['feed']['categorias_favoritas'] = array_values(
            array_unique(
                array_map(
                    fn ($value) => mb_substr(trim((string) $value), 0, 100),
                    $normalized['feed']['categorias_favoritas'] ?? [],
                ),
            ),
        );

        return $normalized;
    }
}
