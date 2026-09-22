<?php

class Comentario extends Model
{
    public function findByPublicacion($publicacionId)
    {
        return $this->fetchAll(
            'SELECT c.*, u.nombre, u.username, u.foto_perfil
             FROM comentarios_foro c
             JOIN usuarios u ON c.usuario_id = u.id
             WHERE c.publicacion_id = ?
             ORDER BY c.fecha_comentario ASC',
            [$publicacionId]
        );
    }

    public function create($data)
    {
        $sql = "INSERT INTO comentarios_foro (publicacion_id, usuario_id, comentario) 
                VALUES (?, ?, ?)";
        
        $this->db->prepare($sql)->execute([
            $data['publicacion_id'],
            $data['usuario_id'],
            $data['comentario']
        ]);

        return $this->db->lastInsertId();
    }
}
