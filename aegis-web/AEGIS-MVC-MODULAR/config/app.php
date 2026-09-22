<?php

define('BASE_URL', '/AEGIS-MVC-MODULAR/public');
define('ROOT_PATH', dirname(__DIR__));

function url(string $path = ''): string
{
    return BASE_URL . $path;
}

function asset(string $path): string
{
    if (str_starts_with($path, 'http')) {
        return $path;
    }

    return BASE_URL . '/' . ltrim($path, '/');
}

function avatar_url(?string $seed, int $size = 100): string
{
    $seed = urlencode(trim((string) ($seed ?: 'aegis')));

    return "https://i.pravatar.cc/{$size}?u={$seed}";
}

function tiempo_relativo(string $fecha): string
{
    $diff = time() - strtotime($fecha);

    if ($diff < 60) {
        return 'Hace un momento';
    }

    if ($diff < 3600) {
        $min = (int) floor($diff / 60);

        return 'Hace ' . $min . ($min === 1 ? ' minuto' : ' minutos');
    }

    if ($diff < 86400) {
        $horas = (int) floor($diff / 3600);

        return 'Hace ' . $horas . ($horas === 1 ? ' hora' : ' horas');
    }

    if ($diff < 172800) {
        return 'Ayer';
    }

    $dias = (int) floor($diff / 86400);

    return 'Hace ' . $dias . ($dias === 1 ? ' día' : ' días');
}

function reacciones_simuladas(int $id): int
{
    return (abs(crc32((string) $id)) % 850) + 50;
}
