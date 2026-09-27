import { useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { avatarUrl, formatCurrency } from '../../shared/presentation'
import { buscarProducto } from '../productosDemo'
import '../css/detalle.css'

// Comentarios de ejemplo del vendedor.
const COMENTARIOS = [
  {
    id: 1,
    autor: 'Timmy Turner',
    fecha: 'Mes Pasado',
    verificado: true,
    texto: 'El producto llegó tal como se describía, sin daños y a tiempo. El vendedor respondió rápido todas mis preguntas. Volvería a comprarles en el futuro.',
  },
  {
    id: 2,
    autor: 'Marta Ruiz',
    fecha: 'Hace 2 semanas',
    verificado: true,
    texto: 'Muy buena experiencia, el producto es tal cual las fotos y el precio estuvo bien. Atención amable por parte del vendedor.',
  },
  {
    id: 3,
    autor: 'Andrés Gómez',
    fecha: 'Hace 1 mes',
    verificado: false,
    texto: 'La entrega se demoró un poco pero todo llegó completo y funcionando. Recomendado.',
  },
]

// Insignias del vendedor calculadas con su reputación
// (mismas insignias de la página de Perfil).
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

export default function Detalle({ id, auth, onNavigate }) {
  const producto = buscarProducto(id) || {}
  const titulo = producto.nombre || producto.titulo || 'Producto'
  const imagen = producto.imagen || ''
  const vendedor = producto.vendedor && producto.vendedor.nombre
    ? producto.vendedor
    : { nombre: 'Vendedor', reputacion: 0 }

  const insignia = insigniasVendedor(vendedor.reputacion)

  // La captura muestra 4 miniaturas (misma foto principal).
  const [imagenActiva, setImagenActiva] = useState(0)
  const miniaturas = [0, 1, 2, 3]

  return (
    <div className="page-layout">
      <Header title={`AEGIS | ${titulo}`} auth={auth} onNavigate={onNavigate} />

      <main className="product-detail-page">
        {/* ===== FILA SUPERIOR: galería + información esencial ===== */}
        <section className="detail-top">
          <article className="detail-gallery">
            <div className="detail-thumbs">
              {miniaturas.map((indice) => (
                <button
                  key={indice}
                  type="button"
                  className={'detail-thumb' + (imagenActiva === indice ? ' active' : '')}
                  onClick={() => setImagenActiva(indice)}
                >
                  {imagen
                    ? <img src={imagen} alt={`Vista ${indice + 1} de ${titulo}`} />
                    : <i className="fa-regular fa-image" />}
                </button>
              ))}
            </div>
            <div className="detail-main-image">
              {imagen ? <img src={imagen} alt={titulo} /> : <i className="fa-regular fa-image" />}
            </div>
          </article>

          <article className="detail-info">
            <h1 className="detail-title">{titulo}</h1>

            <div
              className="detail-seller"
              role="button"
              tabIndex={0}
              onClick={() => onNavigate && onNavigate(`/vendedor?id=${vendedor.id}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onNavigate && onNavigate(`/vendedor?id=${vendedor.id}`)
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
                onClick={() => onNavigate && onNavigate(`/vendedor?id=${vendedor.id}`)}
              >
                <i className="fa-solid fa-arrow-right" />
              </button>
            </div>

            <div className="detail-price">
              <h2>COP {formatCurrency(producto.precio)}</h2>
              <span>(Único Disponible)</span>
            </div>

            <div className="detail-specs">
              <div className="detail-specs-row">
                <p><span>Categoría:</span> <strong>{producto.categoria || 'Sin categoría'}</strong></p>
                <p><span>Marca:</span> <strong>{producto.marca || 'Sin marca'}</strong></p>
              </div>
              <div className="detail-specs-row">
                <p><span>Estado:</span> <strong>{etiquetaEstado(producto.estado)}</strong></p>
              </div>
            </div>

            <div className="detail-actions">
              <button type="button" className="detail-btn primary">Contactar</button>
              <button type="button" className="detail-btn outline">Agregar al Carrito</button>
            </div>
          </article>
        </section>

        {/* ===== DESCRIPCIÓN (hacia abajo) ===== */}
        <section className="detail-section">
          <h2>Descripción</h2>
          <p className="detail-text">{producto.descripcion || 'Sin descripción disponible'}</p>
        </section>

        {/* ===== MÁS INFORMACIÓN DEL VENDEDOR (hacia abajo) ===== */}
        <section className="detail-section">
          <h2>Más información sobre este vendedor</h2>
          <div className="seller-info-grid">
            <img
              className="seller-info-avatar"
              src={vendedor.avatar || avatarUrl(vendedor, 160)}
              alt={vendedor.nombre}
              title="Ver perfil del vendedor"
              onClick={() => onNavigate && onNavigate(`/vendedor?id=${vendedor.id}`)}
            />
            <div className="seller-info-stat">
              <span className="seller-info-icon blue"><i className="fa-solid fa-crown" /></span>
              <h4>Nivel de Servicio</h4>
              <span className="seller-info-badge blue">{insignia.servicio}</span>
            </div>
            <div className="seller-info-stat">
              <span className="seller-info-icon purple"><i className="fa-solid fa-shield" /></span>
              <h4>Vendedor Estrella</h4>
              <span className="seller-info-badge purple">{insignia.estrella}</span>
            </div>
            <div className="seller-info-stat">
              <span className="seller-info-icon light"><i className="fa-regular fa-star" /> {insignia.rating}</span>
              <h4>Reseñas</h4>
              <span className="seller-info-stars">{insignia.estrellas}</span>
            </div>
          </div>
        </section>

        {/* ===== COMENTARIOS (hacia abajo) ===== */}
        <section className="detail-section">
          <div className="detail-comments-head">
            <h2>Comentarios del Vendedor ({COMENTARIOS.length})</h2>
            <select className="detail-comments-filter">
              <option>Filtro: Todas las valoraciones</option>
            </select>
          </div>

          {COMENTARIOS.map((comentario) => (
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
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}
