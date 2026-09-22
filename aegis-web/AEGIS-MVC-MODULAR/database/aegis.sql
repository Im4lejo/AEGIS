-- =========================================================
-- BASE DE DATOS AEGIS
-- VERSION MVC MODULAR BASICA
-- MySQL / PHP PDO
-- =========================================================

CREATE DATABASE IF NOT EXISTS aegis_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE aegis_db;

-- =========================================================
-- TABLA: usuarios
-- =========================================================

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,

    username VARCHAR(50) UNIQUE,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,

    telefono VARCHAR(20),
    ciudad VARCHAR(100),

    foto_perfil VARCHAR(255) DEFAULT 'default.png',
    descripcion TEXT,

    reputacion DECIMAL(3,2) DEFAULT 5.00,

    rol ENUM(
        'usuario',
        'owner',
        'admin'
    ) DEFAULT 'usuario',

    estado ENUM(
        'activo',
        'suspendido',
        'baneado'
    ) DEFAULT 'activo',

    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- TABLA: categorias
-- =========================================================

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- =========================================================
-- TABLA: productos
-- =========================================================

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,
    categoria_id INT NOT NULL,

    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,

    precio DECIMAL(12,2) NOT NULL,

    estado_producto ENUM(
        'nuevo',
        'usado',
        'reacondicionado'
    ) DEFAULT 'usado',

    ciudad VARCHAR(100),

    estado_publicacion ENUM(
        'activo',
        'vendido',
        'oculto'
    ) DEFAULT 'activo',

    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE,

    FOREIGN KEY (categoria_id)
    REFERENCES categorias(id)
);

-- =========================================================
-- TABLA: imagenes_producto
-- =========================================================

CREATE TABLE imagenes_producto (
    id INT AUTO_INCREMENT PRIMARY KEY,

    producto_id INT NOT NULL,

    imagen VARCHAR(255) NOT NULL,

    principal BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (producto_id)
    REFERENCES productos(id)
    ON DELETE CASCADE
);

-- =========================================================
-- TABLA: publicaciones_foro
-- =========================================================

CREATE TABLE publicaciones_foro (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,

    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,

    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- =========================================================
-- TABLA: comentarios_foro
-- =========================================================

CREATE TABLE comentarios_foro (
    id INT AUTO_INCREMENT PRIMARY KEY,

    publicacion_id INT NOT NULL,
    usuario_id INT NOT NULL,

    comentario TEXT NOT NULL,

    fecha_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (publicacion_id)
    REFERENCES publicaciones_foro(id)
    ON DELETE CASCADE,

    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- =========================================================
-- TABLA: puntos_fisicos
-- =========================================================

CREATE TABLE puntos_fisicos (
    id INT AUTO_INCREMENT PRIMARY KEY,

    owner_id INT NOT NULL,

    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,

    direccion VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,

    telefono VARCHAR(30),

    imagen VARCHAR(255),

    reputacion DECIMAL(3,2) DEFAULT 5.00,

    estado ENUM(
        'activo',
        'pendiente',
        'suspendido'
    ) DEFAULT 'pendiente',

    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- =========================================================
-- TABLA: encuentros
-- =========================================================

CREATE TABLE encuentros (
    id INT AUTO_INCREMENT PRIMARY KEY,

    comprador_id INT NOT NULL,
    vendedor_id INT NOT NULL,

    producto_id INT NOT NULL,
    punto_fisico_id INT NOT NULL,

    fecha_encuentro DATE NOT NULL,
    hora_encuentro TIME NOT NULL,

    estado ENUM(
        'pendiente',
        'confirmado',
        'cancelado',
        'finalizado'
    ) DEFAULT 'pendiente',

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (comprador_id)
    REFERENCES usuarios(id),

    FOREIGN KEY (vendedor_id)
    REFERENCES usuarios(id),

    FOREIGN KEY (producto_id)
    REFERENCES productos(id),

    FOREIGN KEY (punto_fisico_id)
    REFERENCES puntos_fisicos(id)
);

-- =========================================================
-- TABLA: codigos_qr
-- =========================================================

CREATE TABLE codigos_qr (
    id INT AUTO_INCREMENT PRIMARY KEY,

    encuentro_id INT NOT NULL UNIQUE,

    codigo VARCHAR(255) NOT NULL,

    estado ENUM(
        'activo',
        'usado',
        'expirado'
    ) DEFAULT 'activo',

    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (encuentro_id)
    REFERENCES encuentros(id)
    ON DELETE CASCADE
);

-- =========================================================
-- TABLA: reportes
-- =========================================================

CREATE TABLE reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_reporta_id INT NOT NULL,
    usuario_reportado_id INT NOT NULL,

    motivo VARCHAR(255) NOT NULL,
    descripcion TEXT,

    estado ENUM(
        'pendiente',
        'revisado',
        'resuelto'
    ) DEFAULT 'pendiente',

    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_reporta_id)
    REFERENCES usuarios(id),

    FOREIGN KEY (usuario_reportado_id)
    REFERENCES usuarios(id)
);

-- =========================================================
-- TABLA: notificaciones
-- =========================================================

CREATE TABLE notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,

    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,

    leida BOOLEAN DEFAULT FALSE,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- =========================================================
-- TABLA: calificaciones
-- =========================================================

CREATE TABLE calificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,

    encuentro_id INT NOT NULL,

    autor_id INT NOT NULL,
    receptor_id INT NOT NULL,

    puntuacion INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),

    comentario TEXT,

    fecha_calificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (encuentro_id)
    REFERENCES encuentros(id)
    ON DELETE CASCADE,

    FOREIGN KEY (autor_id)
    REFERENCES usuarios(id),

    FOREIGN KEY (receptor_id)
    REFERENCES usuarios(id)
);

-- =========================================================
-- DATOS INICIALES
-- =========================================================

INSERT INTO categorias (nombre, descripcion) VALUES
('Celulares', 'Smartphones y accesorios'),
('Computadores', 'Portátiles y PCs'),
('Componentes', 'Tarjetas gráficas, RAM, etc'),
('Consolas', 'PlayStation, Xbox, Nintendo'),
('Periféricos', 'Mouse, teclados, audífonos');

-- =========================================================
-- ADMIN INICIAL
-- =========================================================

INSERT INTO usuarios (
    nombre,
    apellido,
    username,
    email,
    password,
    rol
)
VALUES (
    'Admin',
    'AEGIS',
    'admin',
    'admin@aegis.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin'
);


