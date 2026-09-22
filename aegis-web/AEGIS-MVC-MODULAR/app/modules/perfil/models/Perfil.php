<?php

class Perfil extends Model
{
    public function findByUsuarioId(int $usuarioId): ?array
    {
        return $this->fetch(
            'SELECT * FROM usuarios WHERE id = ?',
            [$usuarioId]
        ) ?: null;
    }

    public function update(int $usuarioId, array $data): bool
    {
        $fields = [];
        $params = [];

        if (array_key_exists('descripcion', $data)) {
            $fields[] = 'descripcion = ?';
            $params[] = $data['descripcion'];
        }

        if (array_key_exists('ciudad', $data)) {
            $fields[] = 'ciudad = ?';
            $params[] = $data['ciudad'];
        }

        if (array_key_exists('telefono', $data)) {
            $fields[] = 'telefono = ?';
            $params[] = $data['telefono'];
        }

        if (array_key_exists('foto_perfil', $data)) {
            $fields[] = 'foto_perfil = ?';
            $params[] = $data['foto_perfil'];
        }

        if (empty($fields)) {
            return false;
        }

        $sql = 'UPDATE usuarios SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $params[] = $usuarioId;

        return (bool) $this->query($sql, $params);
    }

    public function getPublicaciones(int $usuarioId, int $limit = 10): array
    {
        return $this->fetchAll(
            'SELECT * FROM publicaciones_foro
             WHERE usuario_id = ?
             ORDER BY fecha_publicacion DESC
             LIMIT ' . (int) $limit,
            [$usuarioId]
        );
    }
}
