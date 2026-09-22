-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-05-2026 a las 11:18:47
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `aegis_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calificaciones`
--

CREATE TABLE `calificaciones` (
  `id` int(11) NOT NULL,
  `encuentro_id` int(11) NOT NULL,
  `autor_id` int(11) NOT NULL,
  `receptor_id` int(11) NOT NULL,
  `puntuacion` int(11) NOT NULL CHECK (`puntuacion` between 1 and 5),
  `comentario` text DEFAULT NULL,
  `fecha_calificacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Celulares', 'Smartphones y accesorios'),
(2, 'Computadores', 'Portátiles y PCs'),
(3, 'Componentes', 'Tarjetas gráficas, RAM, etc'),
(4, 'Consolas', 'PlayStation, Xbox, Nintendo'),
(5, 'Periféricos', 'Mouse, teclados, audífonos');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `codigos_qr`
--

CREATE TABLE `codigos_qr` (
  `id` int(11) NOT NULL,
  `encuentro_id` int(11) NOT NULL,
  `codigo` varchar(255) NOT NULL,
  `estado` enum('activo','usado','expirado') DEFAULT 'activo',
  `fecha_generacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentarios_foro`
--

CREATE TABLE `comentarios_foro` (
  `id` int(11) NOT NULL,
  `publicacion_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `comentario` text NOT NULL,
  `fecha_comentario` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `comentarios_foro`
--

INSERT INTO `comentarios_foro` (`id`, `publicacion_id`, `usuario_id`, `comentario`, `fecha_comentario`) VALUES
(1, 1, 2, 'De milagro prende el PC bro.', '2026-05-27 05:04:12'),
(2, 1, 1, 'Facto', '2026-05-27 05:04:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `encuentros`
--

CREATE TABLE `encuentros` (
  `id` int(11) NOT NULL,
  `comprador_id` int(11) NOT NULL,
  `vendedor_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `punto_fisico_id` int(11) NOT NULL,
  `fecha_encuentro` date NOT NULL,
  `hora_encuentro` time NOT NULL,
  `estado` enum('pendiente','confirmado','cancelado','finalizado') DEFAULT 'pendiente',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagenes_producto`
--

CREATE TABLE `imagenes_producto` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `imagen` varchar(255) NOT NULL,
  `principal` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `imagenes_producto`
--

INSERT INTO `imagenes_producto` (`id`, `producto_id`, `imagen`, `principal`) VALUES
(1, 1, 'prod_1_1779855160.jpeg', 1),
(2, 2, 'prod_2_1779857290.jpeg', 1),
(3, 3, 'prod_3_1779857683.webp', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `mensaje` text NOT NULL,
  `leida` tinyint(1) DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text NOT NULL,
  `precio` decimal(12,2) NOT NULL,
  `estado_producto` enum('nuevo','usado','reacondicionado') DEFAULT 'usado',
  `ciudad` varchar(100) DEFAULT NULL,
  `estado_publicacion` enum('activo','vendido','oculto') DEFAULT 'activo',
  `fecha_publicacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `usuario_id`, `categoria_id`, `titulo`, `descripcion`, `precio`, `estado_producto`, `ciudad`, `estado_publicacion`, `fecha_publicacion`) VALUES
(1, 2, 3, 'Tarjeta Gráfica RTX 4070', 'Está en Perfectas condiciones, poco tiempo de uso, jamás destapada y en su caja con accesorios', 1800000.00, 'usado', 'Cali', 'activo', '2026-05-27 04:12:40'),
(2, 2, 2, 'Portatil HP 14 DK0357', 'Espectacular Portatil HP con Ryzen 5 3500u que alcanza hasta los 3,7 GHz de velocidad, 8GB RAM DDR4, 128GB SSD y 1TB SSD', 1200000.00, 'usado', 'Barrancabermeja', 'activo', '2026-05-27 04:48:10'),
(3, 3, 4, 'Consola PS4 de Segunda', 'PS4 PRO con 2 mandos, 1TB de almacenamiento, 4 juegos incluidos y el Game PASS incluido.', 70000.00, 'usado', 'Bogota', 'activo', '2026-05-27 04:54:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicaciones_foro`
--

CREATE TABLE `publicaciones_foro` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `contenido` text NOT NULL,
  `fecha_publicacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `publicaciones_foro`
--

INSERT INTO `publicaciones_foro` (`id`, `usuario_id`, `titulo`, `contenido`, `fecha_publicacion`) VALUES
(1, 3, 'Es posible correr Monster Hunter Wilds en una GT 730?', 'Me ha encantado la saga de Monster Hunter desde hace mucho tiempo y me gustaría saber si mi PC puede correrlo de milagro', '2026-05-27 05:03:11');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `puntos_fisicos`
--

CREATE TABLE `puntos_fisicos` (
  `id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `direccion` varchar(255) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `reputacion` decimal(3,2) DEFAULT 5.00,
  `estado` enum('activo','pendiente','suspendido') DEFAULT 'pendiente',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `puntos_fisicos`
--

INSERT INTO `puntos_fisicos` (`id`, `owner_id`, `nombre`, `descripcion`, `direccion`, `ciudad`, `telefono`, `imagen`, `reputacion`, `estado`, `fecha_registro`) VALUES
(1, 1, 'Tech Zone', 'Excelente servicio tecnico las 23 horas', 'Carrera 14 - 23', 'Popayán', '312 354 5934', 'default.png', 5.00, 'activo', '2026-05-26 23:46:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes`
--

CREATE TABLE `reportes` (
  `id` int(11) NOT NULL,
  `usuario_reporta_id` int(11) NOT NULL,
  `usuario_reportado_id` int(11) NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` enum('pendiente','revisado','resuelto') DEFAULT 'pendiente',
  `fecha_reporte` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT 'default.png',
  `descripcion` text DEFAULT NULL,
  `reputacion` decimal(3,2) DEFAULT 5.00,
  `rol` enum('usuario','owner','admin') DEFAULT 'usuario',
  `estado` enum('activo','suspendido','baneado') DEFAULT 'activo',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `username`, `email`, `password`, `telefono`, `ciudad`, `foto_perfil`, `descripcion`, `reputacion`, `rol`, `estado`, `fecha_registro`) VALUES
(1, 'Admin', 'AEGIS', 'admin', 'admin@aegis.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '312 354 5934', 'Popayán', 'user_1_1779871380.jpg', 'Soy una persona casual', 5.00, 'admin', 'activo', '2026-05-26 23:38:38'),
(2, 'Pachito', 'Salazar', 'xd', 'xd@1234.com', '$2y$10$RNyYWrESxTti9toD0R7df.fc4fYYYswmgAAs/qnkjDUHA8zIfQu1G', NULL, NULL, 'user_2_1779871559.jpg', NULL, 5.00, 'usuario', 'activo', '2026-05-27 03:42:02'),
(3, 'Sr', 'Robinson', 'messi', 'Messi@gmail.com', '$2y$10$ijE9OaL.noXlYaW3Pmv3p.ny6iJqb8JcxzMerlqPaittMJhFqVE/O', '311 547 3408', 'Medellín', 'user_3_1779870505.jpg', 'Apasionado del Futbol, el gaming y la programación, gg no Jungla.', 5.00, 'usuario', 'activo', '2026-05-27 04:49:22');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `encuentro_id` (`encuentro_id`),
  ADD KEY `autor_id` (`autor_id`),
  ADD KEY `receptor_id` (`receptor_id`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `codigos_qr`
--
ALTER TABLE `codigos_qr`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `encuentro_id` (`encuentro_id`);

--
-- Indices de la tabla `comentarios_foro`
--
ALTER TABLE `comentarios_foro`
  ADD PRIMARY KEY (`id`),
  ADD KEY `publicacion_id` (`publicacion_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `encuentros`
--
ALTER TABLE `encuentros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `comprador_id` (`comprador_id`),
  ADD KEY `vendedor_id` (`vendedor_id`),
  ADD KEY `producto_id` (`producto_id`),
  ADD KEY `punto_fisico_id` (`punto_fisico_id`);

--
-- Indices de la tabla `imagenes_producto`
--
ALTER TABLE `imagenes_producto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Indices de la tabla `publicaciones_foro`
--
ALTER TABLE `publicaciones_foro`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `puntos_fisicos`
--
ALTER TABLE `puntos_fisicos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indices de la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_reporta_id` (`usuario_reporta_id`),
  ADD KEY `usuario_reportado_id` (`usuario_reportado_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `codigos_qr`
--
ALTER TABLE `codigos_qr`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `comentarios_foro`
--
ALTER TABLE `comentarios_foro`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `encuentros`
--
ALTER TABLE `encuentros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `imagenes_producto`
--
ALTER TABLE `imagenes_producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `publicaciones_foro`
--
ALTER TABLE `publicaciones_foro`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `puntos_fisicos`
--
ALTER TABLE `puntos_fisicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD CONSTRAINT `calificaciones_ibfk_1` FOREIGN KEY (`encuentro_id`) REFERENCES `encuentros` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `calificaciones_ibfk_2` FOREIGN KEY (`autor_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `calificaciones_ibfk_3` FOREIGN KEY (`receptor_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `codigos_qr`
--
ALTER TABLE `codigos_qr`
  ADD CONSTRAINT `codigos_qr_ibfk_1` FOREIGN KEY (`encuentro_id`) REFERENCES `encuentros` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `comentarios_foro`
--
ALTER TABLE `comentarios_foro`
  ADD CONSTRAINT `comentarios_foro_ibfk_1` FOREIGN KEY (`publicacion_id`) REFERENCES `publicaciones_foro` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comentarios_foro_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `encuentros`
--
ALTER TABLE `encuentros`
  ADD CONSTRAINT `encuentros_ibfk_1` FOREIGN KEY (`comprador_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `encuentros_ibfk_2` FOREIGN KEY (`vendedor_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `encuentros_ibfk_3` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `encuentros_ibfk_4` FOREIGN KEY (`punto_fisico_id`) REFERENCES `puntos_fisicos` (`id`);

--
-- Filtros para la tabla `imagenes_producto`
--
ALTER TABLE `imagenes_producto`
  ADD CONSTRAINT `imagenes_producto_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);

--
-- Filtros para la tabla `publicaciones_foro`
--
ALTER TABLE `publicaciones_foro`
  ADD CONSTRAINT `publicaciones_foro_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `puntos_fisicos`
--
ALTER TABLE `puntos_fisicos`
  ADD CONSTRAINT `puntos_fisicos_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`usuario_reporta_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `reportes_ibfk_2` FOREIGN KEY (`usuario_reportado_id`) REFERENCES `usuarios` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
