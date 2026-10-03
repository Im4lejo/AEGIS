import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { avatarUrl, formatCurrency, route } from '../../shared/presentation'
import { buscarVendedor, productosDelVendedor } from '../../productos/productosDemo'
import { POSTS_EJEMPLO } from '../../foro/views/Foro'
import '../css/perfil.css'

const IconCrown = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 8l4 4 5-7 5 7 4-4-1.6 9.5H4.6L3 8z" />
  </svg>
)

const IconDollar = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.5v19" />
    <path d="M16.5 7.5c0-1.8-2-2.9-4.5-2.9s-4.5 1.2-4.5 3.1c0 4.3 9 2.4 9 6.7 0 2-2 3.3-4.5 3.3s-4.5-1.3-4.5-3.3" />
  </svg>
)

const IconStar = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.5l-5.88 3.11 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z" />
  </svg>
)

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

export default function Vendedor({ id, auth, onNavigate }) {
  const vendedor = buscarVendedor(id) || {}
  const insignia = insigniasVendedor(vendedor.reputacion)

  const publicaciones = POSTS_EJEMPLO.filter((post) => post.autor === vendedor.usuarioForo)
  const productos = productosDelVendedor(vendedor)

  return (
    <div className="page-layout">
      <Header title={`AEGIS | ${vendedor.nombre || 'Vendedor'}`} auth={auth} onNavigate={onNavigate} />

      <main className="perfil-page">
        <section className="perfil-card">
          <div className="perfil-cover" />

          <div className="perfil-identity">
            <div className="perfil-id-left">
              <div className="perfil-avatar-wrap">
                <img className="perfil-avatar" src={vendedor.avatar || avatarUrl(vendedor, 160)} alt={vendedor.nombre || 'Vendedor'} />
              </div>
              <h1 className="perfil-name">{vendedor.nombre || 'Vendedor'}</h1>
            </div>

            <div className="perfil-stats">
              <div className="perfil-stat">
                <span className="perfil-stat-icon blue"><IconCrown /></span>
                <span className="perfil-stat-label">Nivel de Servicio</span>
                <span className="perfil-stat-badge blue">{insignia.servicio}</span>
              </div>
              <div className="perfil-stat">
                <span className="perfil-stat-icon purple"><IconDollar /></span>
                <span className="perfil-stat-label">Vendedor Estrella</span>
                <span className="perfil-stat-badge purple">{insignia.estrella}</span>
              </div>
              <div className="perfil-stat">
                <span className="perfil-stat-rating">
                  <IconStar />
                  <strong>{insignia.rating}</strong>
                </span>
                <span className="perfil-stat-label">Reseñas</span>
                <span className="perfil-stat-stars">{insignia.estrellas}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="perfil-grid">
          <div className="perfil-col">
            <section className="perfil-panel">
              <h2 className="perfil-panel-title">Descripción</h2>
              <p className="perfil-desc-text">{vendedor.descripcion || 'Sin descripción disponible.'}</p>
              <div className="perfil-info-row">
                <span className="perfil-info-label">Lugar de residencia</span>
                <span className="perfil-info-value">{vendedor.lugar || 'Sin información'}</span>
              </div>
              <div className="perfil-info-row">
                <span className="perfil-info-label">Fecha de registro de cuenta</span>
                <span className="perfil-info-value">{vendedor.fechaRegistro || 'Sin información'}</span>
              </div>
              <div className="perfil-info-row">
                <span className="perfil-info-label">Usuario en el foro</span>
                <span className="perfil-info-value">
                  <span className="perfil-chip">{vendedor.usuarioForo || 'Sin usuario'}</span>
                </span>
              </div>
            </section>

            <section className="perfil-panel">
              <h2 className="perfil-panel-title">Publicaciones en el foro</h2>

              {publicaciones.length === 0 ? (
                <p className="perfil-empty">Este vendedor aún no ha publicado en el foro.</p>
              ) : (
                <>
                  <p className="perfil-desc-text">
                    Sí ha publicado en el foro: {publicaciones.length}
                    {publicaciones.length === 1 ? ' publicación.' : ' publicaciones.'}
                  </p>

                  {publicaciones.map((post) => (
                    <article className="perfil-post" key={post.id}>
                      <div className="perfil-post-head">
                        <img
                          className="perfil-post-avatar"
                          src={avatarUrl({ username: post.autor }, 80)}
                          alt={post.autor}
                        />
                        <div>
                          <div className="perfil-post-author">{post.autor}</div>
                          <div className="perfil-post-date">{post.fecha}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="perfil-post-title"
                        onClick={() => onNavigate && onNavigate('/foro')}
                      >
                        {post.titulo}
                      </button>

                      {post.cuerpo && <p className="perfil-post-body">{post.cuerpo}</p>}
                    </article>
                  ))}
                </>
              )}
            </section>
          </div>

          <div className="perfil-col">
            <section className="perfil-panel">
              <h2 className="perfil-panel-title">Productos del Vendedor</h2>

              {productos.length === 0 && (
                <p className="perfil-empty">Este vendedor no tiene productos publicados.</p>
              )}

              <div className="perfil-products">
                {productos.map((producto) => (
                  <a
                    key={producto.id}
                    className="perfil-product"
                    href={route(`/productos/detalle?id=${producto.id}`)}
                    onClick={(event) => {
                      event.preventDefault()
                      onNavigate && onNavigate(`/productos/detalle?id=${producto.id}`)
                    }}
                  >
                    <span className="perfil-product-img">
                      <img src={producto.imagen} alt={producto.nombre || producto.titulo} />
                    </span>
                    <span className="perfil-product-body">
                      <span className="perfil-product-name">{producto.nombre || producto.titulo}</span>
                      <span className="perfil-product-old">COP {formatCurrency(producto.precioAnterior || producto.precio)}</span>
                      <span className="perfil-product-price">COP {formatCurrency(producto.precio)}</span>
                    </span>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}
