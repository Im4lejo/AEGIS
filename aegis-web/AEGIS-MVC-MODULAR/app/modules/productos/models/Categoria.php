<?php

class Categoria extends Model
{
    public function findById($id)
    {
        return $this->fetch("SELECT * FROM categorias WHERE id = ?", [$id]);
    }

    public function getAll()
    {
        return $this->fetchAll("SELECT * FROM categorias ORDER BY nombre");
    }

    public function create($data)
    {
        $sql = "INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)";
        $this->db->prepare($sql)->execute([
            $data['nombre'],
            $data['descripcion']
        ]);
        return $this->db->lastInsertId();
    }
}
