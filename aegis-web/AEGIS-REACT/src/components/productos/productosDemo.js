// Catálogo de productos de demostración (compartido).
// El Home muestra los destacados, el Perfil muestra los del vendedor
// y la vista de Detalle busca en ambos para que al abrir cualquier
// tarjeta se vea el mismo producto, precio, vendedor y descripción.

export const PRODUCTOS_DESTACADOS = [
  {
    id: 1,
    nombre: 'Televisor LG OLED 55" 4K Smart TV AI ThinQ',
    descripcion: 'Procesador α9 Gen6 - 120Hz Refresh Rate - Dolby Vision / Atmos',
    estado: 'nuevo',
    categoria: 'Televisores',
    marca: 'LG',
    precio: 3899999,
    descuento: 15,
    vendedor: { id: 1, nombre: 'LG Store Oficial', reputacion: 4.8 },
    imagen: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800'
  },
  {
    id: 2,
    nombre: 'Laptop Lenovo IdeaPad Slim 5 16" AMD Ryzen 7',
    descripcion: 'Almacenamiento: 512GB SSD - RAM: 16GB DDR5 - Pantalla FHD+',
    estado: 'nuevo',
    categoria: 'Laptops',
    marca: 'Lenovo',
    precio: 2899999,
    descuento: 20,
    vendedor: { id: 2, nombre: 'Lenovo Colombia', reputacion: 4.6 },
    imagen: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800'
  },
  {
    id: 3,
    nombre: 'iPhone 15 Pro Max 256GB Titanio Natural',
    descripcion: 'Pantalla Super Retina XDR 6.7" - Chip A17 Pro - Cámara 48MP',
    estado: 'reacondicionado',
    categoria: 'Celulares',
    marca: 'Apple',
    precio: 4999999,
    descuento: 10,
    vendedor: { id: 3, nombre: 'Charlie Kit', reputacion: 4.3 },
    imagen: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800'
  }
]

// Productos que se ven en el Perfil ("Productos del Vendedor").
// El vendedor es el usuario del perfil (misma reputación de su página).
export const PRODUCTOS_PERFIL = [
  {
    id: 4,
    titulo: 'Xiaomi Redmi 13C 4GB-64GB - Negro',
    precio: 1085999,
    precioAnterior: 1299999,
    imagen: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600',
    descripcion: 'Pantalla HD+ de 6.74", 4GB de RAM, 64GB de almacenamiento y batería de 5000mAh.',
    estado: 'usado',
    categoria: 'Celulares',
    marca: 'Xiaomi',
    vendedor: { id: 4, nombre: 'Luis Alejandro Montenegro Ojeda', reputacion: 4.7 }
  },
  {
    id: 5,
    titulo: 'Xiaomi Redmi Note 13 Pro 8GB-256GB - Azul',
    precio: 1085999,
    precioAnterior: 1399999,
    imagen: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=600',
    descripcion: 'Pantalla AMOLED 120Hz, 8GB de RAM, 256GB de almacenamiento y cámara de 200MP.',
    estado: 'nuevo',
    categoria: 'Celulares',
    marca: 'Xiaomi',
    vendedor: { id: 4, nombre: 'Luis Alejandro Montenegro Ojeda', reputacion: 4.7 }
  },
  {
    id: 6,
    titulo: 'Xiaomi Redmi 12 5G 8GB-256GB - Verde',
    precio: 1085999,
    precioAnterior: 1259999,
    imagen: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600',
    descripcion: 'Pantalla FHD+ 120Hz, 8GB de RAM, 256GB de almacenamiento y conexión 5G.',
    estado: 'usado',
    categoria: 'Celulares',
    marca: 'Xiaomi',
    vendedor: { id: 4, nombre: 'Luis Alejandro Montenegro Ojeda', reputacion: 4.7 }
  },
  {
    id: 7,
    titulo: 'Xiaomi Poco X6 8GB-256GB - Blanco',
    precio: 1085999,
    precioAnterior: 1499999,
    imagen: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=600',
    descripcion: 'Pantalla AMOLED 120Hz, 8GB de RAM, 256GB de almacenamiento y carga rápida de 67W.',
    estado: 'nuevo',
    categoria: 'Celulares',
    marca: 'POCO',
    vendedor: { id: 4, nombre: 'Luis Alejandro Montenegro Ojeda', reputacion: 4.7 }
  },
  {
    id: 8,
    titulo: 'Xiaomi Redmi Note 12 6GB-128GB - Gris',
    precio: 1085999,
    precioAnterior: 1199999,
    imagen: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=600',
    descripcion: 'Pantalla AMOLED 90Hz, 6GB de RAM, 128GB de almacenamiento y batería de 5000mAh.',
    estado: 'usado',
    categoria: 'Celulares',
    marca: 'Xiaomi',
    vendedor: { id: 4, nombre: 'Luis Alejandro Montenegro Ojeda', reputacion: 4.7 }
  }
]

// Productos de los banners del Home (carrusel y promociones).
export const PRODUCTOS_PROMOCION = [
  {
    id: 9,
    nombre: 'Tarjeta Gráfica NVIDIA GeForce RTX 4070 Ti SUPER 12GB',
    descripcion: '12GB GDDR6X | Arquitectura Ada Lovelace | DLSS 3 y Ray Tracing',
    estado: 'nuevo',
    categoria: 'Componentes PC',
    marca: 'NVIDIA',
    precio: 3499999,
    vendedor: { id: 5, nombre: 'NVIDIA Store', reputacion: 4.9 },
    imagen: '/rtx-4070.jpg'
  },
  {
    id: 10,
    nombre: 'Portátil HP Victus Gaming',
    descripcion: 'Procesador Intel Core i5 | 16GB RAM | 512GB SSD | Gráficos NVIDIA RTX',
    estado: 'nuevo',
    categoria: 'Laptops',
    marca: 'HP',
    precio: 1899900,
    vendedor: { id: 6, nombre: 'HP Store Oficial', reputacion: 4.5 },
    imagen: '/hp-victus.jpg'
  }
]

// Vendedores del catálogo: cada producto apunta aquí por su id
// y con eso se abre su página de perfil (/vendedor?id=N).
export const VENDEDORES = [
  {
    id: 1,
    nombre: 'LG Store Oficial',
    reputacion: 4.8,
    descripcion: 'Tienda oficial de LG en Colombia. Vendemos televisores y electrodomésticos con garantía de fábrica y envío a todo el país.',
    lugar: 'Bogotá, D.C.',
    fechaRegistro: '12/01/2024',
    usuarioForo: 'LGStoreOficial'
  },
  {
    id: 2,
    nombre: 'Lenovo Colombia',
    reputacion: 4.6,
    descripcion: 'Distribuidor autorizado de laptops y computadores Lenovo, con soporte técnico y garantía local en cada compra.',
    lugar: 'Medellín, Antioquia',
    fechaRegistro: '05/03/2024',
    usuarioForo: 'LenovoColombia'
  },
  {
    id: 3,
    nombre: 'Charlie Kit',
    reputacion: 4.3,
    descripcion: 'Venta de celulares y equipos Apple reacondicionados, con pruebas de funcionamiento y garantía por 3 meses.',
    lugar: 'Cali, Valle del Cauca',
    fechaRegistro: '18/09/2024',
    usuarioForo: 'NovaKatana'
  },
  {
    id: 4,
    nombre: 'Luis Alejandro Montenegro Ojeda',
    reputacion: 4.7,
    descripcion: 'Vendedor particular de celulares Xiaomi. Respondo rápido por chat y hago entregas en Popayán y alrededores.',
    lugar: 'Popayán, Caucá',
    fechaRegistro: '30/04/2026',
    usuarioForo: 'TheDarkMoon7456'
  },
  {
    id: 5,
    nombre: 'NVIDIA Store',
    reputacion: 4.9,
    descripcion: 'Tienda especializada en tarjetas gráficas y componentes PC de alto rendimiento para gaming y creación de contenido.',
    lugar: 'Barranquilla, Atlántico',
    fechaRegistro: '20/07/2024',
    usuarioForo: 'NVIDIAStore'
  },
  {
    id: 6,
    nombre: 'HP Store Oficial',
    reputacion: 4.5,
    descripcion: 'Tienda oficial de HP Colombia. Laptops, impresores y accesorios con garantía y soporte directo del fabricante.',
    lugar: 'Bogotá, D.C.',
    fechaRegistro: '02/11/2024',
    usuarioForo: 'HPColombia'
  }
]

// Busca un vendedor por su id (sin id se muestra el primero).
export function buscarVendedor(id) {
  if (id === undefined || id === null || id === '') return VENDEDORES[0]
  const encontrado = VENDEDORES.find((item) => String(item.id) === String(id))
  return encontrado || null
}

// Productos publicados por un vendedor (para su página de perfil).
export function productosDelVendedor(vendedor) {
  const todos = [...PRODUCTOS_DESTACADOS, ...PRODUCTOS_PROMOCION, ...PRODUCTOS_PERFIL]
  return todos.filter((item) => item.vendedor && vendedor && String(item.vendedor.id) === String(vendedor.id))
}

// Busca un producto por su id en todo el catálogo.
// Sin id se muestra el primero (demo) y si no existe devuelve null.
export function buscarProducto(id) {
  if (id === undefined || id === null || id === '') return PRODUCTOS_DESTACADOS[0]
  const todos = [...PRODUCTOS_DESTACADOS, ...PRODUCTOS_PROMOCION, ...PRODUCTOS_PERFIL]
  const encontrado = todos.find((item) => String(item.id) === String(id))
  return encontrado || null
}
