<?php

class Usuario extends Model
{
    public function findByEmail(string $email): ?array
    {
        return $this->fetch(
            'SELECT * FROM usuarios WHERE email = ? LIMIT 1',
            [$email]
        ) ?: null;
    }

    public function findById(int $id): ?array
    {
        return $this->fetch(
            'SELECT * FROM usuarios WHERE id = ? LIMIT 1',
            [$id]
        ) ?: null;
    }

    public function getAll(): array
    {
        return $this->fetchAll('SELECT * FROM usuarios ORDER BY fecha_registro DESC');
    }

    public function generateUsername(string $email): string
    {
        $base = preg_replace('/[^a-z0-9]/i', '', explode('@', $email)[0]);
        $username = strtolower(substr($base, 0, 20));

        if ($username === '') {
            $username = 'user';
        }

        $candidate = $username;
        $counter = 1;

        while ($this->fetch('SELECT id FROM usuarios WHERE username = ? LIMIT 1', [$candidate])) {
            $candidate = $username . $counter;
            $counter++;
        }

        return $candidate;
    }

    public function create(array $data): bool
    {
        $sql = 'INSERT INTO usuarios (nombre, apellido, username, email, password, rol, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?)';

        return (bool) $this->query($sql, [
            $data['nombre'],
            $data['apellido'] ?? 'Usuario',
            $data['username'],
            $data['email'],
            $data['password'],
            $data['rol'] ?? 'usuario',
            $data['estado'] ?? 'activo',
        ]);
    }

    public function updateEstado(int $id, string $estado): bool
    {
        return (bool) $this->query(
            'UPDATE usuarios SET estado = ? WHERE id = ?',
            [$estado, $id]
        );
    }

    public function countAll(): int
    {
        $row = $this->fetch('SELECT COUNT(*) AS total FROM usuarios');

        return (int) ($row['total'] ?? 0);
    }
}
