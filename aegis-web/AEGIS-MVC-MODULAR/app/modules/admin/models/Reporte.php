<?php

class Reporte extends Model
{
    public function create(array $data): int
    {
        $sql = 'INSERT INTO reportes (usuario_reporta_id, usuario_reportado_id, motivo, descripcion, estado)
                VALUES (?, ?, ?, ?, ?)';

        $this->query($sql, [
            $data['usuario_reporta_id'],
            $data['usuario_reportado_id'],
            $data['motivo'],
            $data['descripcion'] ?? '',
            'pendiente',
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function getAll(): array
    {
        return $this->fetchAll(
            'SELECT r.*,
                    u1.nombre AS reporta_nombre,
                    u2.nombre AS reportado_nombre
             FROM reportes r
             JOIN usuarios u1 ON r.usuario_reporta_id = u1.id
             JOIN usuarios u2 ON r.usuario_reportado_id = u2.id
             ORDER BY r.fecha_reporte DESC'
        );
    }

    public function getPendientes(): array
    {
        return $this->fetchAll(
            "SELECT * FROM reportes WHERE estado = 'pendiente' ORDER BY fecha_reporte DESC"
        );
    }

    public function updateEstado(int $id, string $estado): bool
    {
        return (bool) $this->query(
            'UPDATE reportes SET estado = ? WHERE id = ?',
            [$estado, $id]
        );
    }
}
