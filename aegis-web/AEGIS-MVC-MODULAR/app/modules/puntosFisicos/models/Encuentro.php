<?php

class Encuentro extends Model
{
    public function findById(int $id): ?array
    {
        return $this->fetch(
            'SELECT e.*,
                    p.titulo AS producto_titulo,
                    pf.nombre AS punto_nombre,
                    uc.nombre AS comprador_nombre,
                    uv.nombre AS vendedor_nombre
             FROM encuentros e
             JOIN productos p ON e.producto_id = p.id
             JOIN puntos_fisicos pf ON e.punto_fisico_id = pf.id
             JOIN usuarios uc ON e.comprador_id = uc.id
             JOIN usuarios uv ON e.vendedor_id = uv.id
             WHERE e.id = ?',
            [$id]
        ) ?: null;
    }

    public function getByPunto(int $puntoId): array
    {
        return $this->fetchAll(
            'SELECT e.*,
                    p.titulo AS producto_titulo,
                    uc.nombre AS comprador_nombre,
                    uv.nombre AS vendedor_nombre
             FROM encuentros e
             JOIN productos p ON e.producto_id = p.id
             JOIN usuarios uc ON e.comprador_id = uc.id
             JOIN usuarios uv ON e.vendedor_id = uv.id
             WHERE e.punto_fisico_id = ?
             ORDER BY e.fecha_encuentro DESC, e.hora_encuentro DESC',
            [$puntoId]
        );
    }

    public function getByUsuario(int $usuarioId): array
    {
        return $this->fetchAll(
            'SELECT e.*,
                    p.titulo AS producto_titulo,
                    pf.nombre AS punto_nombre
             FROM encuentros e
             JOIN productos p ON e.producto_id = p.id
             JOIN puntos_fisicos pf ON e.punto_fisico_id = pf.id
             WHERE e.comprador_id = ? OR e.vendedor_id = ?
             ORDER BY e.fecha_encuentro DESC',
            [$usuarioId, $usuarioId]
        );
    }

    public function create(array $data): int
    {
        $sql = 'INSERT INTO encuentros
                (comprador_id, vendedor_id, producto_id, punto_fisico_id, fecha_encuentro, hora_encuentro, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?)';

        $this->query($sql, [
            $data['comprador_id'],
            $data['vendedor_id'],
            $data['producto_id'],
            $data['punto_fisico_id'],
            $data['fecha_encuentro'],
            $data['hora_encuentro'],
            $data['estado'] ?? 'pendiente',
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function updateEstado(int $id, string $estado): bool
    {
        return (bool) $this->query(
            'UPDATE encuentros SET estado = ? WHERE id = ?',
            [$estado, $id]
        );
    }

    public function countByEstado(string $estado): int
    {
        $row = $this->fetch(
            'SELECT COUNT(*) AS total FROM encuentros WHERE estado = ?',
            [$estado]
        );

        return (int) ($row['total'] ?? 0);
    }
}
