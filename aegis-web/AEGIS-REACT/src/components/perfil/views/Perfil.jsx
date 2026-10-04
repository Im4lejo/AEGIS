import { useEffect, useRef, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { avatarUrl, formatCurrency, route } from '../../shared/presentation'
import { USUARIOS_DEMO, usuarioGenerico, fotoUsuario } from '../../shared/usuariosDemo'
import { VENDEDORES, productosDelVendedor } from '../../productos/productosDemo'
import { POSTS_EJEMPLO } from '../../foro/views/Foro'
import '../css/perfil.css'

const IconPencil = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
  </svg>
)

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

const IconChevron = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const IconCheck = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const IconHeart = ({ filled }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const IconComment = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const IconShare = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)

const IconFlag = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
)

const IconClose = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const USUARIO_EJEMPLO = {
  nombre: 'Luis Alejandro',
  apellido: 'Montenegro Ojeda',
  apodo: 'Usuario AEGIS',
  descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus tempor elementum justo finibus tempus.',
  lugar: 'Popayán, Caucá',
  fechaNacimiento: '29 de marzo del 2008',
  fechaRegistro: '30/04/2026',
  productosVendidos: 'Tarjetas Gráficas',
}

const ORDENES = [
  { id: 'recientes', label: 'Más recientes' },
  { id: 'populares', label: 'Más populares' },
  { id: 'comentados', label: 'Más comentados' },
]

const contarComentarios = (publicacion) => {
  if (typeof publicacion.comentarios === 'number') return publicacion.comentarios
  if (Array.isArray(publicacion.comentarios)) return publicacion.comentarios.length
  return 0
}

const listaBaseComentarios = (publicacion) => {
  if (Array.isArray(publicacion.lista)) return publicacion.lista
  if (Array.isArray(publicacion.comentarios)) return publicacion.comentarios
  return []
}

function MenuOpciones({ trigger, triggerClass = 'perfil-menu-btn', valor, opciones, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="perfil-menu-wrap" ref={ref}>
      <button type="button" className={triggerClass} onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="true">
        {trigger}
      </button>
      {open && (
        <div className="perfil-menu" role="menu">
          {opciones.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              className={opcion.id === valor ? 'active' : ''}
              role="menuitem"
              onClick={() => {
                onSelect(opcion.id)
                setOpen(false)
              }}
            >
              {opcion.label}
              {opcion.id === valor && <IconCheck />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Perfil({ id, usuario = {}, publicaciones, productos, esPropio = true, auth, onNavigate }) {
  let datosUsuario = usuario
  if (id) {
    const demo = USUARIOS_DEMO[id]
    datosUsuario = demo || usuarioGenerico(id)
  }
  const esMiPerfil = !id || id === 'Usuario AEGIS'
  const guardado = esMiPerfil ? JSON.parse(localStorage.getItem('perfilAegis') || '{}') : {}
  const yo = { ...USUARIO_EJEMPLO, ...datosUsuario, ...guardado }

  const handle = id || (auth && auth.user && auth.user.nombre) || 'Usuario AEGIS'
  const pubsDemo = publicaciones && publicaciones.length > 0
    ? publicaciones
    : POSTS_EJEMPLO.filter((item) => item.autor === handle)

  const vendedor = VENDEDORES.find((item) => item.usuarioForo === handle) ||
    VENDEDORES.find((item) => item.nombre === `${yo.nombre} ${yo.apellido}`.trim())
  const prodsDemo = productos && productos.length > 0
    ? productos
    : (vendedor ? productosDelVendedor(vendedor) : [])

  const avatar = yo.avatar || avatarUrl(yo, 160)
  const [orden, setOrden] = useState('recientes')
  const [likesActivos, setLikesActivos] = useState({})
  const [reportadas, setReportadas] = useState({})
  const [comentariosAbiertos, setComentariosAbiertos] = useState({})
  const [textosComentario, setTextosComentario] = useState({})
  const [comentariosNuevos, setComentariosNuevos] = useState({})
  const [lightbox, setLightbox] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!lightbox) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setLightbox(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [lightbox])

  let publicacionesList = [...pubsDemo]
  if (orden === 'populares') publicacionesList.sort((a, b) => Number(b.likes || 0) - Number(a.likes || 0))
  if (orden === 'comentados') publicacionesList.sort((a, b) => contarComentarios(b) - contarComentarios(a))

  const alternarLike = (id) => setLikesActivos((prev) => ({ ...prev, [id]: !prev[id] }))

  const alternarComentarios = (id) => setComentariosAbiertos((prev) => ({ ...prev, [id]: !prev[id] }))

  const publicarComentario = (id) => {
    const texto = (textosComentario[id] || '').trim()
    if (!texto) return
    setComentariosNuevos((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), { autor: 'Tu cuenta', texto }],
    }))
    setTextosComentario((prev) => ({ ...prev, [id]: '' }))
    setToast('Comentario publicado')
  }

  const compartir = (publicacion) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(function () {
        console.log('No se pudo copiar el enlace')
      })
    }
    setToast(`Enlace copiado: "${publicacion.titulo.slice(0, 40)}..."`)
  }

  const reportar = (publicacion) => {
    setReportadas((prev) => ({ ...prev, [publicacion.id]: true }))
    setToast('Gracias, la publicación fue reportada')
  }

  return (
    <div className="page-layout layout-perfil">
      <Header title={id ? 'AEGIS | Perfil' : 'AEGIS | Mi Perfil'} auth={auth} onNavigate={onNavigate} />

      <main className="perfil-page">
        <section className="perfil-card">
          <div
            className="perfil-cover"
            style={guardado.portada ? { backgroundImage: `url(${guardado.portada})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          >
            {esMiPerfil && (
              <button type="button" className="perfil-cover-btn" onClick={() => onNavigate && onNavigate('/perfil/editar')}>
                <IconPencil /> Editar Perfil
              </button>
            )}
          </div>

          <div className="perfil-identity">
            <div className="perfil-id-left">
              <div className="perfil-avatar-wrap">
                <img className="perfil-avatar" src={avatar} alt="Foto de perfil" />
              </div>
              <h1 className="perfil-name">{yo.nombre} {yo.apellido}</h1>
              {yo.apodo && <span className="perfil-apodo">@{yo.apodo}</span>}
            </div>

            <div className="perfil-stats">
              <div className="perfil-stat">
                <span className="perfil-stat-icon blue"><IconCrown /></span>
                <span className="perfil-stat-label">Nivel de Servicio</span>
                <span className="perfil-stat-badge blue">Plataforma</span>
              </div>
              <div className="perfil-stat">
                <span className="perfil-stat-icon purple"><IconDollar /></span>
                <span className="perfil-stat-label">Vendedor Estrella</span>
                <span className="perfil-stat-badge purple">Nivel 3</span>
              </div>
              <div className="perfil-stat">
                <span className="perfil-stat-rating">
                  <IconStar />
                  <strong>4.7</strong>
                </span>
                <span className="perfil-stat-label">Reseñas</span>
                <span className="perfil-stat-stars">
                  ★★★★<span className="perfil-star-half">★</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="perfil-grid">
          <div className="perfil-col">
            <section className="perfil-panel">
              <h2 className="perfil-panel-title">Descripción</h2>
              <p className="perfil-desc-text">{yo.descripcion || 'Sin descripción disponible.'}</p>
              <div className="perfil-info-row">
                <span className="perfil-info-label">Lugar de residencia</span>
                <span className="perfil-info-value">{yo.lugar || yo.ciudad || 'Popayán, Caucá'}</span>
              </div>
              <div className="perfil-info-row">
                <span className="perfil-info-label">Fecha de nacimiento</span>
                <span className="perfil-info-value">{yo.fechaNacimiento || '29 de marzo del 2008'}</span>
              </div>
              <div className="perfil-info-row">
                <span className="perfil-info-label">Fecha de registro de cuenta</span>
                <span className="perfil-info-value">{yo.fechaRegistro || '30/04/2026'}</span>
              </div>
              <div className="perfil-info-row">
                <span className="perfil-info-label">Productos más vendidos</span>
                <span className="perfil-info-value">
                  <span className="perfil-chip">{yo.productosVendidos || 'Tarjetas Gráficas'}</span>
                </span>
              </div>
            </section>

            <section className="perfil-panel">
              <div className="perfil-pub-head">
                <h2 className="perfil-panel-title">Publicaciones</h2>
                <MenuOpciones
                  triggerClass="perfil-pill"
                  trigger={<>Ordenar Por <IconChevron /></>}
                  valor={orden}
                  opciones={ORDENES}
                  onSelect={setOrden}
                />
              </div>

              {publicacionesList.length === 0 && (
                <p className="perfil-empty">No hay publicaciones para este perfil.</p>
              )}

              {publicacionesList.map((publicacion) => {
                const id = publicacion.id
                const liked = likesActivos[id]
                const nuevos = comentariosNuevos[id] || []
                const comentarios = contarComentarios(publicacion) + nuevos.length
                const lista = [...listaBaseComentarios(publicacion), ...nuevos]
                const abierto = comentariosAbiertos[id]
                const cuerpo = publicacion.cuerpo || publicacion.contenido || ''

                return (
                  <article className="perfil-post" key={id}>
                    <div
                      className="perfil-post-head"
                      onClick={() => onNavigate && onNavigate('/perfil?id=' + encodeURIComponent(publicacion.autor))}
                    >
                      <img
                        className="perfil-post-avatar"
                        src={fotoUsuario(publicacion.autor, 80)}
                        alt={publicacion.autor}
                      />
                      <div>
                        <div className="perfil-post-author">{publicacion.autor}</div>
                        <div className="perfil-post-date">{publicacion.fecha}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="perfil-post-title"
                      onClick={() => onNavigate && onNavigate(`/publicacion?id=${publicacion.id}`)}
                    >
                      {publicacion.titulo}
                    </button>

                    {cuerpo && <p className="perfil-post-body">{cuerpo}</p>}

                    {publicacion.imagen && (
                      <button
                        type="button"
                        className="perfil-post-image"
                        title="Ver imagen"
                        onClick={() => setLightbox(publicacion.imagen)}
                      >
                        <img src={publicacion.imagen} alt={publicacion.titulo} />
                      </button>
                    )}

                    <div className="perfil-post-actions">
                      <button
                        type="button"
                        className={`perfil-action ${liked ? 'active' : ''}`}
                        onClick={() => alternarLike(id)}
                      >
                        <IconHeart filled={liked} />
                        {Number(publicacion.likes || 0) + (liked ? 1 : 0)} Likes
                      </button>
                      <button
                        type="button"
                        className={`perfil-action ${abierto ? 'active' : ''}`}
                        onClick={() => alternarComentarios(id)}
                      >
                        <IconComment />
                        {comentarios} Comentarios
                      </button>
                      <button type="button" className="perfil-action" onClick={() => compartir(publicacion)}>
                        <IconShare />
                      </button>
                      <button
                        type="button"
                        className={`perfil-action perfil-action-flag ${reportadas[id] ? 'active' : ''}`}
                        title="Reportar publicación"
                        onClick={() => reportar(publicacion)}
                      >
                        <IconFlag />
                      </button>
                    </div>

                    {abierto && (
                      <div className="perfil-comments">
                        {lista.length === 0 && <p className="perfil-empty">Sé el primero en comentar.</p>}
                        {lista.map((comentario, index) => (
                          <div className="perfil-comment" key={index}>
                            <img
                              className="perfil-comment-avatar"
                              src={fotoUsuario(comentario.autor, 60)}
                              alt={comentario.autor}
                            />
                            <div>
                              <strong onClick={() => onNavigate && onNavigate('/perfil?id=' + encodeURIComponent(comentario.autor))}>
                                {comentario.autor}
                              </strong>
                              <p>{comentario.texto}</p>
                            </div>
                          </div>
                        ))}
                        <form
                          className="perfil-comment-form"
                          onSubmit={(event) => {
                            event.preventDefault()
                            publicarComentario(id)
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Escribe un comentario..."
                            value={textosComentario[id] || ''}
                            onChange={(event) =>
                              setTextosComentario((prev) => ({ ...prev, [id]: event.target.value }))
                            }
                          />
                          <button type="submit">Comentar</button>
                        </form>
                      </div>
                    )}
                  </article>
                )
              })}
            </section>
          </div>

          <div className="perfil-col">
            <section className="perfil-panel">
              <h2 className="perfil-panel-title">Productos del Vendedor</h2>
              {prodsDemo.length === 0 && (
                <div className="perfil-empty-wrap">
                  <img className="perfil-empty-icon" src="/sin-productos.png" alt="" />
                  <p className="perfil-empty">Este usuario aún no ha publicado productos.</p>
                </div>
              )}
              <div className="perfil-products">
                {prodsDemo.map((producto) => (
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
                      <img src={producto.imagen} alt={producto.titulo} />
                    </span>
                    <span className="perfil-product-body">
                      <span className="perfil-product-name">{producto.titulo}</span>
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

      {lightbox && (
        <div className="perfil-lightbox" role="dialog" aria-label="Vista de imagen" onClick={() => setLightbox(null)}>
          <button type="button" className="perfil-lightbox-close" aria-label="Cerrar" onClick={() => setLightbox(null)}>
            <IconClose />
          </button>
          <img src={lightbox} alt="Vista ampliada" onClick={(event) => event.stopPropagation()} />
        </div>
      )}

      {toast && <div className="perfil-toast">{toast}</div>}
    </div>
  )
}
