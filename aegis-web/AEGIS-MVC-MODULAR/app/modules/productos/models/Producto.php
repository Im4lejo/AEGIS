<?php

class Producto extends Model
{
    public function findById(int $id): ?array
    {
        return $this->fetch(
            'SELECT p.*, c.nombre AS categoria_nombre, u.nombre AS vendedor_nombre, u.id AS vendedor_id
             FROM productos p
             JOIN categorias c ON p.categoria_id = c.id
             JOIN usuarios u ON p.usuario_id = u.id
             WHERE p.id = ?',
            [$id]
        ) ?: null;
    }

    public function findByCategoria(string $categoria): array
    {
        return $this->fetchAll(
            "SELECT p.*, c.nombre AS categoria_nombre
             FROM productos p
             JOIN categorias c ON p.categoria_id = c.id
             WHERE c.nombre LIKE ? AND p.estado_publicacion = 'activo'
             ORDER BY p.fecha_publicacion DESC",
            ['%' . $categoria . '%']
        );
    }

    public function getRecientes(int $limit = 12): array
    {
        return $this->fetchAll(
            "SELECT p.*, c.nombre AS categoria_nombre, u.nombre AS vendedor_nombre, u.reputacion AS vendedor_reputacion, u.id AS vendedor_id, u.email AS vendedor_email,
                    (SELECT imagen FROM imagenes_producto WHERE producto_id = p.id ORDER BY principal DESC, id ASC LIMIT 1) AS imagen_principal
             FROM productos p
             JOIN categorias c ON p.categoria_id = c.id
             JOIN usuarios u ON p.usuario_id = u.id
             WHERE p.estado_publicacion = 'activo'
             ORDER BY p.fecha_publicacion DESC
             LIMIT {$limit}"
        );
    }

    public function create(array $data): int
    {
        $sql = 'INSERT INTO productos
                (usuario_id, categoria_id, titulo, descripcion, precio, estado_producto, ciudad, estado_publicacion)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

        $this->query($sql, [
            $data['usuario_id'],
            $data['categoria_id'],
            $data['titulo'],
            $data['descripcion'],
            $data['precio'],
            $data['estado_producto'],
            $data['ciudad'],
            $data['estado_publicacion'] ?? 'activo',
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $sql = 'UPDATE productos
                SET titulo = ?, descripcion = ?, precio = ?, estado_producto = ?, ciudad = ?, estado_publicacion = ?
                WHERE id = ?';

        return (bool) $this->query($sql, [
            $data['titulo'],
            $data['descripcion'],
            $data['precio'],
            $data['estado_producto'],
            $data['ciudad'],
            $data['estado_publicacion'] ?? 'activo',
            $id,
        ]);
    }

    public function delete(int $id): bool
    {
        return (bool) $this->query('DELETE FROM productos WHERE id = ?', [$id]);
    }

    public function findByUsuario(int $usuarioId): array
    {
        return $this->fetchAll(
            "SELECT p.*, c.nombre AS categoria_nombre,
                    (SELECT imagen FROM imagenes_producto WHERE producto_id = p.id ORDER BY principal DESC, id ASC LIMIT 1) AS imagen_principal
             FROM productos p
             JOIN categorias c ON p.categoria_id = c.id
             WHERE p.usuario_id = ?
             ORDER BY p.fecha_publicacion DESC",
            [$usuarioId]
        );
    }

    public function countActivos(): int
    {
        $row = $this->fetch(
            "SELECT COUNT(*) AS total FROM productos WHERE estado_publicacion = 'activo'"
        );

        return (int) ($row['total'] ?? 0);
    }

    public function searchAndFilter(array $filters): array
    {
        $sql = "SELECT p.*, c.nombre AS categoria_nombre, u.nombre AS vendedor_nombre, u.reputacion AS vendedor_reputacion, u.id AS vendedor_id, u.email AS vendedor_email,
                       (SELECT imagen FROM imagenes_producto WHERE producto_id = p.id ORDER BY principal DESC, id ASC LIMIT 1) AS imagen_principal
                FROM productos p
                JOIN categorias c ON p.categoria_id = c.id
                JOIN usuarios u ON p.usuario_id = u.id
                WHERE p.estado_publicacion = 'activo'";

        $params = [];

        // Búsqueda por título o descripción
        if (!empty($filters['busqueda'])) {
            $sql .= " AND (p.titulo LIKE ? OR p.descripcion LIKE ?)";
            $searchTerm = '%' . $filters['busqueda'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Filtro por precio máximo
        if (isset($filters['precio_max']) && $filters['precio_max'] > 0) {
            $sql .= " AND p.precio <= ?";
            $params[] = (float) $filters['precio_max'];
        }

        // Filtro por estado del producto
        if (!empty($filters['estado']) && $filters['estado'] !== 'todo') {
            $sql .= " AND p.estado_producto = ?";
            $params[] = $filters['estado'];
        }

        // Filtro por categoría
        if (!empty($filters['categoria'])) {
            $sql .= " AND c.nombre LIKE ?";
            $params[] = '%' . $filters['categoria'] . '%';
        }

        // Ordenamiento
        $sort = $filters['sort'] ?? 'reciente';
        switch ($sort) {
            case 'precio-asc':
                $sql .= " ORDER BY p.precio ASC";
                break;
            case 'precio-desc':
                $sql .= " ORDER BY p.precio DESC";
                break;
            case 'reciente':
            default:
                $sql .= " ORDER BY p.fecha_publicacion DESC";
                break;
        }

        // Paginación
        $limit = isset($filters['limit']) ? (int) $filters['limit'] : 24;
        $offset = isset($filters['offset']) ? (int) $filters['offset'] : 0;
        
        $sql .= " LIMIT {$limit} OFFSET {$offset}";

        return $this->fetchAll($sql, $params);
    }

    public function countSearchResults(array $filters): int
    {
        $sql = "SELECT COUNT(*) AS total FROM productos p
                JOIN categorias c ON p.categoria_id = c.id
                JOIN usuarios u ON p.usuario_id = u.id
                WHERE p.estado_publicacion = 'activo'";

        $params = [];

        // Búsqueda por título o descripción
        if (!empty($filters['busqueda'])) {
            $sql .= " AND (p.titulo LIKE ? OR p.descripcion LIKE ?)";
            $searchTerm = '%' . $filters['busqueda'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Filtro por precio máximo
        if (isset($filters['precio_max']) && $filters['precio_max'] > 0) {
            $sql .= " AND p.precio <= ?";
            $params[] = (float) $filters['precio_max'];
        }

        // Filtro por estado del producto
        if (!empty($filters['estado']) && $filters['estado'] !== 'todo') {
            $sql .= " AND p.estado_producto = ?";
            $params[] = $filters['estado'];
        }

        // Filtro por categoría
        if (!empty($filters['categoria'])) {
            $sql .= " AND c.nombre LIKE ?";
            $params[] = '%' . $filters['categoria'] . '%';
        }

        $row = $this->fetch($sql, $params);
        return (int) ($row['total'] ?? 0);
    }
}
