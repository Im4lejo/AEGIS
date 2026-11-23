import { useEffect, useRef, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { avatarUrl, formatCurrency, route } from '../../shared/presentation'
import { useAuth } from '../../../auth/useAuth'
import { forumApi, profileApi, reviewApi } from '../../../services/api'
import '../css/perfil.css'

function etiquetaEstado(estado) {
  if (estado === 'nuevo') return 'Nuevo'
  if (estado === 'reacondicionado') return 'Reacondicionado'
  return 'Usado'
}

function badgeEstado(estado) {
  if (estado === 'nuevo') return 'badge-new'
  if (estado === 'reacondicionado') return 'badge-refurbished'
  return 'badge-used'
}

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

const IconClose = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const ORDENES = [
  { id: 'recientes', label: 'Más recientes' },
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

export default function Perfil({ auth, onNavigate }) {
  const { user, token } = useAuth()
  const [perfil, setPerfil] = useState(null)
  const [cargandoPerfil, setCargandoPerfil] = useState(true)
  const [errorPerfil, setErrorPerfil] = useState('')
  const userId = auth?.user?.id || user?.id
  const [pestana, setPestana] = useState('publicaciones')
  const [paginaPestana, setPaginaPestana] = useState(1)
  const [datosPestana, setDatosPestana] = useState(null)
  const [errorPestana, setErrorPestana] = useState('')

  useEffect(() => {
    let active = true
    Promise.resolve()
      .then(() => {
        if (!userId) throw new Error('No se pudo identificar la sesión activa.')
        return profileApi.show(userId)
      })
      .then(({ data }) => {
        if (active) {
          setPerfil(data)
          setErrorPerfil('')
        }
      })
      .catch((error) => {
        if (active) setErrorPerfil(error.message)
      })
      .finally(() => {
        if (active) setCargandoPerfil(false)
      })
    return () => { active = false }
  }, [userId])

  useEffect(() => {
    if (!userId) return undefined
    let active = true
    if (pestana === 'resenas') {
      Promise.all([
        reviewApi.summary('vendedor', userId),
        reviewApi.list('vendedor', userId, paginaPestana, 12),
      ])
        .then(([summary, reviews]) => {
          if (!active) return
          setDatosPestana({
            data: reviews.data,
            meta: reviews.meta,
            resumen: summary.data,
          })
          setErrorPestana('')
        })
        .catch((error) => {
          if (active) setErrorPestana(error.message)
        })
      return () => { active = false }
    }
    profileApi.tab(userId, pestana, paginaPestana, 12)
      .then(({ data, meta }) => {
        if (active) {
          setDatosPestana({ data, meta })
          setErrorPestana('')
        }
      })
      .catch((error) => {
        if (active) setErrorPestana(error.message)
      })
    return () => { active = false }
  }, [userId, pestana, paginaPestana])

  const datosUsuario = perfil?.perfil || auth?.user || user || {}
  const yo = {
    ...datosUsuario,
    apodo: datosUsuario.username || '',
    lugar: datosUsuario.ciudad || '',
    fechaRegistro: datosUsuario.fecha_registro
      ? new Date(datosUsuario.fecha_registro).toLocaleDateString('es-CO')
      : '',
  }
  const pubsDemo = (perfil?.publicaciones || []).map((post) => ({
    ...post,
    autor: post.usuario?.username || post.usuario?.nombre || yo.username || yo.nombre,
    avatar: post.usuario?.foto_perfil,
    fecha: post.fecha_publicacion ? new Date(post.fecha_publicacion).toLocaleString('es-CO') : '',
    cuerpo: post.contenido,
    imagen: post.imagenes?.[0]?.imagen || null,
    comentarios: (post.comentarios || []).map((comentario) => ({
      ...comentario,
      autor: comentario.usuario?.username || comentario.usuario?.nombre || 'Usuario',
      texto: comentario.comentario,
    })),
  }))
  const prodsDemo = (perfil?.productos || []).map((producto) => ({
    ...producto,
    nombre: producto.titulo,
    estado: producto.estado_producto,
    imagen: producto.imagen_principal || producto.imagenes?.[0]?.imagen || '',
  }))
  const avatar = yo.foto_perfil_url || avatarUrl(yo, 160)
  const [orden, setOrden] = useState('recientes')
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
  if (orden === 'comentados') publicacionesList.sort((a, b) => contarComentarios(b) - contarComentarios(a))

  const alternarComentarios = (id) => setComentariosAbiertos((prev) => ({ ...prev, [id]: !prev[id] }))

  const publicarComentario = async (id) => {
    const texto = (textosComentario[id] || '').trim()
    if (!texto) return
    try {
      const { data } = await forumApi.comment(id, texto, token)
      setComentariosNuevos((prev) => ({
        ...prev,
        [id]: [...(prev[id] || []), {
          autor: data.usuario?.username || data.usuario?.nombre || yo.nombre,
          avatar: data.usuario?.foto_perfil,
          texto: data.comentario,
        }],
      }))
      setTextosComentario((prev) => ({ ...prev, [id]: '' }))
      setToast('Comentario publicado')
    } catch (error) {
      setToast(error.message)
    }
  }

  const compartir = async (publicacion) => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setToast(`Enlace copiado: "${publicacion.titulo.slice(0, 40)}..."`)
    } catch {
      setToast('No se pudo copiar el enlace.')
    }
  }

  if (cargandoPerfil) return <main className="perfil-empty">Cargando perfil...</main>
  if (errorPerfil || !perfil) {
    return <main className="perfil-empty" role="alert">{errorPerfil || 'No se pudo cargar el perfil.'}</main>
  }

  return (
    <div className="page-layout layout-perfil">
      <Header title="AEGIS | Mi Perfil" auth={auth} onNavigate={onNavigate} />

      <main className="perfil-page">
        <section className="perfil-card">
          <div
            className="perfil-cover"
            style={yo.img_background_url ? { backgroundImage: `url(${yo.img_background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          >
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
                  <strong>{Number(yo.reputacion || 0).toFixed(1)}</strong>
                </span>
                <span className="perfil-stat-label">Reseñas</span>
                <span className="perfil-stat-stars">{'★'.repeat(Math.max(0, Math.min(5, Math.round(Number(yo.reputacion || 0)))))}</span>
              </div>
            </div>
          </div>
          <nav className="perfil-tabs" aria-label="Secciones del perfil">
            {[
              ['publicaciones', 'Publicaciones'],
              ['productos', 'Productos'],
              ['comunidades', 'Comunidades'],
              ['resenas', 'Reseñas'],
              ['informacion', 'Información'],
            ].map(([id, label]) => (
              <button
                type="button"
                key={id}
                className={pestana === id ? 'active' : ''}
                aria-current={pestana === id ? 'page' : undefined}
                onClick={() => {
                  setPestana(id)
                  setPaginaPestana(1)
                }}
              >
                {label}
              </button>
            ))}
          </nav>
          {errorPestana && <p className="perfil-empty" role="alert">{errorPestana}</p>}
          {pestana === 'resenas' && datosPestana?.resumen && (
            <div className="perfil-review-summary" aria-label="Resumen de reputación comercial">
              <strong>{Number(datosPestana.resumen.promedio).toFixed(1)} / 5</strong>
              <span>{datosPestana.resumen.cantidad} reseñas verificadas elegibles</span>
            </div>
          )}
          {datosPestana?.meta && (
            <div className="perfil-tab-pagination" aria-label="Paginación de pestaña">
              <button type="button" disabled={datosPestana.meta.current_page <= 1} onClick={() => setPaginaPestana((page) => page - 1)}>Anterior</button>
              <span>Página {datosPestana.meta.current_page} de {datosPestana.meta.last_page}</span>
              <button type="button" disabled={datosPestana.meta.current_page >= datosPestana.meta.last_page} onClick={() => setPaginaPestana((page) => page + 1)}>Siguiente</button>
            </div>
          )}
        </section>

        <div className="perfil-grid">
          <div className="perfil-col">
            <section className="perfil-panel">
              <h2 className="perfil-panel-title">Descripción</h2>
              <p className="perfil-desc-text">{yo.descripcion || 'Sin descripción disponible.'}</p>
              <div className="perfil-info-row">
                <span className="perfil-info-label">Lugar de residencia</span>
                <span className="perfil-info-value">{yo.lugar || 'No registrada'}</span>
              </div>
              <div className="perfil-info-row">
                <span className="perfil-info-label">Fecha de nacimiento</span>
                <span className="perfil-info-value">No registrada</span>
              </div>
              <div className="perfil-info-row">
                <span className="perfil-info-label">Fecha de registro de cuenta</span>
                <span className="perfil-info-value">{yo.fechaRegistro || 'No disponible'}</span>
              </div>
              <div className="perfil-info-row">
                <span className="perfil-info-label">Productos publicados</span>
                <span className="perfil-info-value">
                  <span className="perfil-chip">{prodsDemo.length}</span>
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
                const nuevos = comentariosNuevos[id] || []
                const comentarios = contarComentarios(publicacion) + nuevos.length
                const lista = [...listaBaseComentarios(publicacion), ...nuevos]
                const abierto = comentariosAbiertos[id]
                const cuerpo = publicacion.cuerpo || publicacion.contenido || ''

                return (
                  <article className="perfil-post" key={id}>
                    <div className="perfil-post-head">
                      <img
                        className="perfil-post-avatar"
                        src={publicacion.avatar || avatarUrl(yo, 80)}
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
                        className={`perfil-action ${abierto ? 'active' : ''}`}
                        onClick={() => alternarComentarios(id)}
                      >
                        <IconComment />
                        {comentarios} Comentarios
                      </button>
                      <button type="button" className="perfil-action" onClick={() => compartir(publicacion)}>
                        <IconShare />
                      </button>
                    </div>

                    {abierto && (
                      <div className="perfil-comments">
                        {lista.length === 0 && <p className="perfil-empty">Sé el primero en comentar.</p>}
                        {lista.map((comentario, index) => (
                          <div className="perfil-comment" key={index}>
                            <img
                              className="perfil-comment-avatar"
                              src={comentario.avatar || avatarUrl(yo, 60)}
                              alt={comentario.autor}
                            />
                            <div>
                              <strong>
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
                      <img src={producto.imagen} alt={producto.nombre || producto.titulo} />
                      <span className={`product-state-tag ${badgeEstado(producto.estado)}`}>
                        {etiquetaEstado(producto.estado)}
                      </span>
                    </span>
                    <span className="perfil-product-body">
                      <span className="perfil-product-name">{producto.nombre || producto.titulo}</span>
                      {producto.precioAnterior && (
                        <span className="perfil-product-old">COP {formatCurrency(producto.precioAnterior)}</span>
                      )}
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
