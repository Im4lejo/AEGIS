<?php

class CodigoQR extends Model
{
    public function findByEncuentro(int $encuentroId): ?array
    {
        return $this->fetch(
            'SELECT * FROM codigos_qr WHERE encuentro_id = ? LIMIT 1',
            [$encuentroId]
        ) ?: null;
    }

    public function createForEncuentro(int $encuentroId): int
    {
        $codigo = bin2hex(random_bytes(16));

        $sql = 'INSERT INTO codigos_qr (encuentro_id, codigo, estado) VALUES (?, ?, ?)';

        $this->query($sql, [$encuentroId, $codigo, 'activo']);

        return (int) $this->db->lastInsertId();
    }

    public function marcarUsado(int $encuentroId): bool
    {
        return (bool) $this->query(
            "UPDATE codigos_qr SET estado = 'usado' WHERE encuentro_id = ?",
            [$encuentroId]
        );
    }
}
