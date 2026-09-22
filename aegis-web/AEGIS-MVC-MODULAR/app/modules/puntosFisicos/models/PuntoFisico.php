<?php

class PuntoFisico extends Model
{
    public function findByOwner(int $ownerId): ?array
    {
        return $this->fetch(
            'SELECT * FROM puntos_fisicos WHERE owner_id = ? LIMIT 1',
            [$ownerId]
        ) ?: null;
    }

    public function findById(int $id): ?array
    {
        return $this->fetch(
            'SELECT p.*, u.nombre AS owner_nombre
             FROM puntos_fisicos p
             JOIN usuarios u ON p.owner_id = u.id
             WHERE p.id = ?',
            [$id]
        ) ?: null;
    }

    public function getActivos(): array
    {
        return $this->fetchAll(
            "SELECT p.*, u.nombre AS owner_nombre
             FROM puntos_fisicos p
             JOIN usuarios u ON p.owner_id = u.id
             WHERE p.estado = 'activo'
             ORDER BY p.nombre ASC"
        );
    }

    public function create(array $data): int
    {
        $sql = 'INSERT INTO puntos_fisicos
                (owner_id, nombre, descripcion, direccion, ciudad, telefono, imagen, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

        $this->query($sql, [
            $data['owner_id'],
            $data['nombre'],
            $data['descripcion'] ?? '',
            $data['direccion'],
            $data['ciudad'],
            $data['telefono'] ?? '',
            $data['imagen'] ?? 'default.png',
            $data['estado'] ?? 'pendiente',
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $sql = 'UPDATE puntos_fisicos
                SET nombre = ?, descripcion = ?, direccion = ?, ciudad = ?, telefono = ?
                WHERE id = ?';

        return (bool) $this->query($sql, [
            $data['nombre'],
            $data['descripcion'] ?? '',
            $data['direccion'],
            $data['ciudad'],
            $data['telefono'] ?? '',
            $id,
        ]);
    }
}
