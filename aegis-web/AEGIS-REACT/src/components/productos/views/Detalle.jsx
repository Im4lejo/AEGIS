import { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { avatarUrl, formatCurrency, route } from '../../shared/presentation'
import { buscarProducto, buscarVendedor } from '../productosDemo'
import { agregarProducto } from '../../carrito/carritoDemo'
import '../css/detalle.css'


const CLAVE_COMENTARIOS = 'comentariosProducto'

function comentariosDe(productoId) {
  const todos = JSON.parse(localStorage.getItem(CLAVE_COMENTARIOS) || '{}')
  return todos[productoId] || []
}

function guardarComentarios(productoId, lista) {
  const todos = JSON.parse(localStorage.getItem(CLAVE_COMENTARIOS) || '{}')
  todos[productoId] = lista
  localStorage.setItem(CLAVE_COMENTARIOS, JSON.stringify(todos))
}


function insigniasVendedor(reputacion) {
  const rep = Number(reputacion || 0)
  let nivel = 'Nivel 1'
  if (rep >= 4.5) nivel = 'Nivel 3'
  else if (rep >= 3.5) nivel = 'Nivel 2'

  return {
    servicio: 'Plataforma',
    estrella: nivel,
    rating: rep.toFixed(1),
    estrellas: rep > 0 ? '★'.repeat(Math.round(rep)) : '☆☆☆☆☆',
  }
}

function etiquetaEstado(estado) {
  if (estado === 'nuevo') return 'Nuevo'
  if (estado === 'reacondicionado') return 'Reacondicionado'
  return 'Usado - En buen estado'
}

const CAMPOS_FICHAS = {
  cpu: 'Procesador (CPU)',
  gpu: 'Tarjeta gráfica',
  ram: 'Memoria RAM',
  almacenamiento: 'Almacenamiento',
  almacenamientoTipo: 'Tipo de almacenamiento',
  pulgadas: 'Tamaño de pantalla',
  resolucion: 'Resolución',
  panel: 'Panel',
  refresco: 'Tasa de refresco',
  sistema: 'Sistema operativo / Smart TV',
  so: 'Sistema operativo',
  camara: 'Cámara principal',
  vram: 'Memoria VRAM',
  uso: 'Uso principal',
  tipo: 'Tipo',
  conectividad: 'Conectividad',
  iluminacion: 'Iluminación',
  switch: 'Switch',
  modelo: 'Modelo',
  stock: 'Stock disponible',
}

export default function Detalle({ id, auth, onNavigate }) {
  const producto = buscarProducto(id) || {}
  const titulo = producto.nombre || producto.titulo || 'Producto'
  const imagen = producto.imagen || ''
  const infoVendedor = producto.vendedor && producto.vendedor.nombre
    ? producto.vendedor
    : { nombre: 'Vendedor', reputacion: 0 }
  const vendedorBuscado = infoVendedor.id ? buscarVendedor(infoVendedor.id) : null
  const vendedor = vendedorBuscado || infoVendedor

  const insignia = insigniasVendedor(vendedor.reputacion)

  let imagenes = [imagen, imagen, imagen, imagen]
  if (producto.fotos && producto.fotos.length > 0) imagenes = [imagen].concat(producto.fotos)

  const irVendedor = () => {
    if (producto.mio) {
      if (onNavigate) onNavigate('/perfil')
      return
    }
    if (onNavigate) onNavigate(`/vendedor?id=${vendedor.id}`)
  }

  const [imagenActiva, setImagenActiva] = useState(0)
  const [agregado, setAgregado] = useState(false)
  const [comentarios, setComentarios] = useState([])
  const [comentarioNuevo, setComentarioNuevo] = useState('')

  const agregarAlCarrito = () => {
    if (producto.id) {
      agregarProducto(producto.id)
      setAgregado(true)
    }
  }

  const publicarComentario = (event) => {
    event.preventDefault()
    const texto = comentarioNuevo.trim()
    if (!texto || !producto.id) return
    const autor = auth && auth.user && auth.user.nombre ? auth.user.nombre : 'Usuario AEGIS'
    const nuevo = {
      id: Date.now(),
      autor: autor,
      fecha: new Date().toLocaleDateString('es-CO'),
      texto: texto,
    }
    const actualizados = comentarios.concat(nuevo)
    setComentarios(actualizados)
    guardarComentarios(producto.id, actualizados)
    setComentarioNuevo('')
  }

  useEffect(() => {
    setAgregado(false)
    setImagenActiva(0)
    setComentarios(comentariosDe(producto.id))
    setComentarioNuevo('')
  }, [id])

  const imagenAnterior = () =>
    setImagenActiva((i) => (i === 0 ? imagenes.length - 1 : i - 1))
  const imagenSiguiente = () =>
    setImagenActiva((i) => (i === imagenes.length - 1 ? 0 : i + 1))

  const caracteristicas = Object.keys(CAMPOS_FICHAS).filter((campo) => producto[campo])

  return (
    <div className="page-layout">
      <Header title={`AEGIS | ${titulo}`} auth={auth} onNavigate={onNavigate} />

      <main className="product-detail-page">
        <nav className="detail-breadcrumb" aria-label="Ruta de navegación">
          <a
            href={route('/')}
            onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('/') }}
          >
            Inicio
          </a>
          <span>/</span>
          {producto.categoria && (
            <>
              <a
                href={route(`/productos?categoria=${producto.categoria}`)}
                onClick={(e) => {
                  e.preventDefault()
                  if (onNavigate) onNavigate(`/productos?categoria=${producto.categoria}`)
                }}
              >
                {producto.categoria}
              </a>
              <span>/</span>
            </>
          )}
          <strong>{titulo}</strong>
        </nav>

        <section className="detail-top">
          <div className="detail-left">
            <article className="detail-gallery">
              <div className="detail-thumbs">
                {imagenes.map((foto, indice) => (
                  <button
                    key={indice}
                    type="button"
                    className={'detail-thumb' + (imagenActiva === indice ? ' active' : '')}
                    onClick={() => setImagenActiva(indice)}
                  >
                    {foto
                      ? <img src={foto} alt={`Vista ${indice + 1} de ${titulo}`} />
                      : <i className="fa-regular fa-image" />}
                  </button>
                ))}
              </div>
              <div className="detail-main-image">
                <span className="detail-counter">
                  {imagenActiva + 1}/{imagenes.length}
                </span>
                <button
                  type="button"
                  className="detail-arrow left"
                  aria-label="Imagen anterior"
                  onClick={imagenAnterior}
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
                {imagenes[imagenActiva] ? <img src={imagenes[imagenActiva]} alt={titulo} /> : <i className="fa-regular fa-image" />}
                <button
                  type="button"
                  className="detail-arrow right"
                  aria-label="Imagen siguiente"
                  onClick={imagenSiguiente}
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </div>
            </article>

            {caracteristicas.length > 0 && (
              <section className="detail-section detail-features-section">
                <h2>Características principales</h2>
                <ul className="detail-features">
                  {caracteristicas.map((campo) => (
                    <li key={campo}>
                      <span>{CAMPOS_FICHAS[campo]}:</span> <strong>{producto[campo]}</strong>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="detail-section detail-description-section">
              <h2>Descripción</h2>
              <p className="detail-text">{producto.descripcion || 'Sin descripción disponible'}</p>
            </section>

            <section className="detail-section detail-comments-section">
              <div className="detail-comments-head">
                <h2>Comentarios del Vendedor ({comentarios.length})</h2>
                <select className="detail-comments-filter">
                  <option>Filtro: Todas las valoraciones</option>
                </select>
              </div>

              <form className="detail-comment-form" onSubmit={publicarComentario}>
                <input
                  className="detail-comment-input"
                  type="text"
                  value={comentarioNuevo}
                  onChange={(event) => setComentarioNuevo(event.target.value)}
                  placeholder="Escribe un comentario..."
                />
                <button className="detail-comment-btn" type="submit">Publicar</button>
              </form>

              {comentarios.length === 0 && (
                <p className="detail-comments-empty">Todavía no hay comentarios. Sé el primero en comentar.</p>
              )}

              {comentarios.map((comentario) => (
                <article className="detail-comment" key={comentario.id}>
                  <div className="detail-comment-head">
                    <span className="detail-comment-user">
                      <i className="fa-solid fa-circle-user" />
                      <strong>{comentario.autor}</strong>
                      <span>• {comentario.fecha}</span>
                    </span>
                    {comentario.verificado && (
                      <span className="detail-comment-verified">Compra Verificada</span>
                    )}
                  </div>
                  <p>{comentario.texto}</p>
                  <small>{titulo}</small>
                </article>
              ))}
            </section>
          </div>

          <aside className="detail-info">
            <div className="detail-heading">
              <p className="detail-code">Código de producto: {producto.id}</p>
              <h1 className="detail-title">{titulo}</h1>
              <p className="detail-brand">{producto.marca || 'Sin marca'}</p>

              <div
                className="detail-seller"
                role="button"
                tabIndex={0}
                onClick={irVendedor}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') irVendedor()
                }}
              >
                <img className="detail-seller-avatar" src={vendedor.avatar || avatarUrl(vendedor, 100)} alt={vendedor.nombre} />
                <div className="detail-seller-data">
                  <strong className="detail-seller-name">{vendedor.nombre}</strong>
                  <div className="detail-badges">
                    <span className="detail-badge blue" title={`Nivel de Servicio: ${insignia.servicio}`}>
                      <i className="fa-solid fa-crown" />
                    </span>
                    <span className="detail-badge purple" title={`Vendedor Estrella: ${insignia.estrella}`}>
                      <i className="fa-solid fa-shield" />
                    </span>
                    <span className="detail-badge rating" title={`Reputación: ${insignia.rating}`}>
                      <i className="fa-regular fa-star" /> {insignia.rating}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="detail-seller-arrow"
                  aria-label="Ver perfil del vendedor"
                  onClick={irVendedor}
                >
                  <i className="fa-solid fa-arrow-right" />
                </button>
              </div>
            </div>

            <div className="detail-specs">
              <div className="detail-specs-row">
                <p><span>Categoría:</span> <strong>{producto.categoria || 'Sin categoría'}</strong></p>
                <p><span>Estado:</span> <strong>{etiquetaEstado(producto.estado)}</strong></p>
              </div>
            </div>

            <p className="detail-shipping">
              <i className="fa-solid fa-truck-fast" />
              <span>{producto.envioRapido ? 'Envío rápido disponible' : 'Envío estándar a domicilio'}</span>
            </p>

            <div className="detail-purchase-bar">
              <div className="detail-price">
                {producto.descuento > 0 && (
                  <span className="detail-discount">-{producto.descuento}%</span>
                )}
                <strong className="detail-price-now">COP {formatCurrency(producto.precio)}</strong>
                {producto.precioAnterior && (
                  <span className="detail-price-old">COP {formatCurrency(producto.precioAnterior)}</span>
                )}
              </div>
              <p className="detail-stock">
                {typeof producto.stock === 'number'
                  ? (producto.stock > 0 ? `(${producto.stock} disponibles)` : '(Agotado)')
                  : (producto.stock === false ? '(Agotado)' : '(Único Disponible)')}
              </p>
              <div className="detail-actions">
                <button
                  type="button"
                  className="detail-btn primary"
                  onClick={() => onNavigate && onNavigate(`/mensajes?id=${producto.id}`)}
                >
                  Comprar Ahora
                </button>
                <button type="button" className="detail-btn outline" onClick={agregarAlCarrito}>
                  {agregado ? (
                    <>
                      <i className="fa-solid fa-check" /> Agregado al carrito
                    </>
                  ) : (
                    'Agregar al Carrito'
                  )}
                </button>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}
