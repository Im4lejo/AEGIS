import { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { avatarUrl, formatCurrency, route } from '../../shared/presentation'
import { productApi, savedApi } from '../../../services/api'
import { agregarProducto } from '../../carrito/carritoDemo'
import '../css/detalle.css'


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
  const [respuesta, setRespuesta] = useState({ id: null, producto: {}, error: '' })
  const [preguntas, setPreguntas] = useState([])
  const [nuevaPregunta, setNuevaPregunta] = useState('')
  const [mensajeAccion, setMensajeAccion] = useState('')
  useEffect(() => {
    let active = true
    productApi.show(id)
      .then(({ data }) => {
        if (!active) return
        setRespuesta({ id, error: '', producto: {
          ...data,
          nombre: data.titulo,
          categoria: data.categoria?.nombre || '',
          estado: data.estado_producto,
          imagen: data.imagen_principal || data.imagenes?.[0]?.imagen || '',
          fotos: (data.imagenes || []).map((imagen) => imagen.imagen).filter((imagen) => imagen !== data.imagen_principal),
          vendedor: data.vendedor ? {
            ...data.vendedor,
            nombre: `${data.vendedor.nombre} ${data.vendedor.apellido || ''}`.trim(),
            avatar: data.vendedor.foto_perfil,
          } : null,
        } })
        setPreguntas(data.preguntas || [])
      })
      .catch((error) => {
        if (active) setRespuesta({ id, producto: {}, error: error.message })
      })
    return () => { active = false }
  }, [id])

  const cargando = respuesta.id !== id
  const producto = cargando ? {} : respuesta.producto
  const errorProducto = cargando ? '' : respuesta.error
  const titulo = producto.nombre || producto.titulo || 'Producto'
  const imagen = producto.imagen || ''
  const infoVendedor = producto?.vendedor && producto.vendedor.nombre
    ? producto.vendedor
    : { nombre: 'Vendedor', reputacion: 0 }
  const vendedor = infoVendedor

  const insignia = insigniasVendedor(vendedor.reputacion)

  let imagenes = imagen ? [imagen] : ['']
  if (producto.fotos && producto.fotos.length > 0) imagenes = [imagen].concat(producto.fotos)

  const irVendedor = () => {
    if (String(auth?.user?.id) === String(producto.usuario_id)) {
      if (onNavigate) onNavigate('/perfil')
    }
  }

  const [indiceImagen, setIndiceImagen] = useState(0)
  const imagenActiva = Math.min(indiceImagen, imagenes.length - 1)
  const [productoAgregado, setProductoAgregado] = useState(null)
  const agregado = String(productoAgregado) === String(id)

  const agregarAlCarrito = () => {
    if (producto.id) {
      agregarProducto(producto.id)
      setProductoAgregado(producto.id)
    }
  }

  const guardarProducto = async () => {
    if (!auth?.isAuthenticated) {
      onNavigate?.('/login')
      return
    }
    try {
      await savedApi.save({
        recurso_tipo: 'producto',
        recurso_id: producto.id,
      }, auth.token)
      setMensajeAccion('Producto guardado')
    } catch (requestError) {
      setMensajeAccion(requestError.message)
    }
  }

  const enviarPregunta = async (event) => {
    event.preventDefault()
    if (!auth?.isAuthenticated) {
      onNavigate?.('/login')
      return
    }
    const texto = nuevaPregunta.trim()
    if (!texto) return
    try {
      await productApi.ask(producto.id, texto, auth.token)
      setNuevaPregunta('')
      setMensajeAccion('Pregunta enviada al vendedor')
    } catch (requestError) {
      setMensajeAccion(requestError.message)
    }
  }

  const imagenAnterior = () =>
    setIndiceImagen((i) => (i === 0 ? imagenes.length - 1 : i - 1))
  const imagenSiguiente = () =>
    setIndiceImagen((i) => (i === imagenes.length - 1 ? 0 : i + 1))

  const caracteristicas = Object.keys(CAMPOS_FICHAS).filter((campo) => producto[campo])

  useEffect(() => {
    if (!producto?.seo) return
    document.title = producto.seo.title
    let description = document.querySelector('meta[name="description"]')
    if (!description) {
      description = document.createElement('meta')
      description.name = 'description'
      document.head.appendChild(description)
    }
    description.content = producto.seo.description
    let robots = document.querySelector('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.appendChild(robots)
    }
    robots.content = producto.seo.robots
  }, [producto?.seo?.title, producto?.seo?.description, producto?.seo?.robots])

  if (cargando) {
    return <main className="no-products-message">Cargando producto...</main>
  }
  if (errorProducto || !producto.id) {
    return (
      <div className="page-layout">
        <Header title="AEGIS | Producto" auth={auth} onNavigate={onNavigate} />
        <main className="no-products-message" role="alert">{errorProducto || 'No se encontró el producto.'}</main>
        <Footer onNavigate={onNavigate} />
      </div>
    )
  }

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
                    onClick={() => setIndiceImagen(indice)}
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

            <section className="detail-section" aria-labelledby="preguntas-titulo">
              <h2 id="preguntas-titulo">Preguntas públicas</h2>
              {preguntas.length === 0 && (
                <p className="detail-text">Aún no hay preguntas respondidas.</p>
              )}
              {preguntas.map((pregunta) => (
                <article className="detail-question" key={pregunta.id}>
                  <strong>{pregunta.pregunta}</strong>
                  {pregunta.respuesta && <p>{pregunta.respuesta}</p>}
                </article>
              ))}
              {auth?.isAuthenticated ? (
                <form onSubmit={enviarPregunta}>
                  <label htmlFor="pregunta-producto">Pregunta al vendedor</label>
                  <textarea
                    id="pregunta-producto"
                    value={nuevaPregunta}
                    maxLength={2000}
                    onChange={(event) => setNuevaPregunta(event.target.value)}
                  />
                  <button type="submit" className="detail-btn outline">Enviar pregunta</button>
                </form>
              ) : (
                <button type="button" className="detail-btn outline" onClick={() => onNavigate?.('/login')}>
                  Inicia sesión para preguntar
                </button>
              )}
              {mensajeAccion && <p role="status">{mensajeAccion}</p>}
            </section>

            <section className="detail-section" aria-labelledby="seguridad-titulo">
              <h2 id="seguridad-titulo">Políticas y seguridad</h2>
              <p className="detail-text">{producto.politicas || 'El vendedor no ha publicado políticas adicionales.'}</p>
              <p className="detail-text">
                {producto.permite_encuentro
                  ? 'Se permite acordar punto de encuentro.'
                  : 'No se ofrece punto de encuentro para este anuncio.'}
              </p>
              <p className="detail-text">No compartas datos personales ni pagos fuera de canales seguros.</p>
            </section>

          </div>

          <aside className="detail-info">
            <div className="detail-heading">
              <p className="detail-code">Código de producto: {producto.id}</p>
              <h1 className="detail-title">{titulo}</h1>
              <p className="detail-brand">{producto.ciudad || 'Sin ciudad'}</p>
            </div>

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
                  onClick={() => onNavigate && onNavigate(auth?.isAuthenticated ? `/mensajes?id=${producto.id}` : '/login')}
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
                <button type="button" className="detail-btn outline" onClick={guardarProducto}>
                  Guardar
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
