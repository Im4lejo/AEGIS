<?php

class Auth
{
    public static function login(array $user): void
    {
        unset($user['password']);
        $_SESSION['user'] = $user;
    }

    public static function logout(): void
    {
        $_SESSION = [];

        if (session_id() !== '') {
            session_destroy();
        }

        header('Location: ' . url('/login'));
        exit;
    }

    public static function check(): bool
    {
        return isset($_SESSION['user']);
    }

    public static function user(): ?array
    {
        return $_SESSION['user'] ?? null;
    }

    public static function id(): ?int
    {
        return self::user()['id'] ?? null;
    }

    public static function isAdmin(): bool
    {
        return self::check() && (self::user()['rol'] ?? '') === 'admin';
    }

    public static function isOwner(): bool
    {
        return self::check() && (self::user()['rol'] ?? '') === 'owner';
    }

    public static function isUsuario(): bool
    {
        return self::check() && (self::user()['rol'] ?? '') === 'usuario';
    }
}
