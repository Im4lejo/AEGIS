import { useState, useRef, useEffect } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import Sidebar from '../../layouts/Sidebar'
import { EmptyState, ErrorState, LoadingState } from '../../shared/ApiState'
import { useAuth } from '../../../auth/useAuth'
import { forumApi, savedApi, videoApi } from '../../../services/api'
import '../css/foro.css'

const IconComment = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const IconShare = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)

const IconPlus = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const IconChevron = ({ open }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: open ? 'rotate(180deg)' : 'none',
      transition: 'transform 0.2s',
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const ORDENES = [
  { id: 'recientes', label: 'Más recientes' },
  { id: 'comentados', label: 'Más comentados' },
]

export default function Foro({ auth, onNavigate }) {
  const { token } = useAuth()
  const [posts, setPosts] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorFeed, setErrorFeed] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [temaActivo, setTemaActivo] = useState(null)
  const [foroMenuAbierto, setForoMenuAbierto] = useState(false)
  const [orden, setOrden] = useState('recientes')
  const [ordenOpen, setOrdenOpen] = useState(false)
  const [comentariosAbiertos, setComentariosAbiertos] = useState({})
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [textoPublicacion, setTextoPublicacion] = useState('')
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [imagenNueva, setImagenNueva] = useState(null)
  const [archivoNuevo, setArchivoNuevo] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [toast, setToast] = useState(null)
  const [feedTab, setFeedTab] = useState('recientes')
  const [nextCursor, setNextCursor] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [tipoPost, setTipoPost] = useState('discusion')
  const [productoReferencia, setProductoReferencia] = useState('')
  const [videoCapabilities, setVideoCapabilities] = useState(null)

  const ordenRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    let active = true
    videoApi.capabilities()
      .then(({ vod, live }) => {
        if (active) setVideoCapabilities({ vod, live })
      })
      .catch(() => {
        if (active) setVideoCapabilities(null)
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    forumApi
      .list(feedTab)
      .then(({ data, meta }) => {
        if (!active) return
        setPosts(
          data.map((publicacion) => ({
            id: publicacion.id,
            usuarioId: publicacion.usuario?.id,
            autor:
              publicacion.usuario?.username ||
              `${publicacion.usuario?.nombre || ''} ${publicacion.usuario?.apellido || ''}`.trim(),
            avatar: publicacion.usuario?.foto_perfil,
            fecha: publicacion.fecha_publicacion
              ? new Date(publicacion.fecha_publicacion).toLocaleString('es-CO')
              : '',
            titulo: publicacion.titulo,
            cuerpo: publicacion.contenido,
            imagen: publicacion.imagenes?.[0]?.imagen || null,
            video: publicacion.imagenes?.[0]?.mime_type?.startsWith('video/')
              ? publicacion.imagenes[0]
              : null,
            referencias: publicacion.referencias || [],
            comentarios: (publicacion.comentarios || []).map((comentario) => ({
              id: comentario.id,
              autor:
                comentario.usuario?.username ||
                comentario.usuario?.nombre ||
                'Usuario',
              avatar: comentario.usuario?.foto_perfil,
              texto: comentario.comentario,
              fecha: comentario.fecha_comentario || '',
            })),
          })),
        )
        setErrorFeed(null)
        setNextCursor(meta?.next_cursor || null)
      })
      .catch((error) => {
        if (active) setErrorFeed(error)
      })
      .finally(() => {
        if (active) setCargando(false)
      })
    return () => {
      active = false
    }
  }, [feedTab])

  useEffect(() => {
    if (!foroMenuAbierto) return
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setForoMenuAbierto(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [foroMenuAbierto])

  useEffect(() => {
    if (!ordenOpen) return
    const handleClickOutside = (event) => {
      if (ordenRef.current && !ordenRef.current.contains(event.target))
        setOrdenOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ordenOpen])

  useEffect(() => {
    if (!lightbox) return
    const handleKey = (event) => {
      if (event.key === 'Escape') setLightbox(null)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [lightbox])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  const termino = busqueda.trim().toLowerCase()
  let postsVisibles = posts.filter((post) => {
    if (!termino) return true
    return (
      post.titulo.toLowerCase().includes(termino) ||
      post.cuerpo.toLowerCase().includes(termino) ||
      post.autor.toLowerCase().includes(termino)
    )
  })

  if (orden === 'comentados')
    postsVisibles.sort((a, b) => b.comentarios.length - a.comentarios.length)

  const usuario = auth?.user?.username || auth?.user?.nombre || 'Invitado'
  const miFoto = auth?.user?.foto_perfil_url || ''

  const toggleComentarios = (id) => {
    setComentariosAbiertos((prev) => ({ ...prev, [id]: !prev[id] }))
    setNuevoComentario('')
  }

  const agregarComentario = async (id) => {
    const texto = nuevoComentario.trim()
    if (!texto) return
    if (!auth?.isAuthenticated) {
      if (onNavigate) onNavigate('/login')
      return
    }
    try {
      const { data } = await forumApi.comment(id, texto, token)
      const nuevo = {
        id: data.id,
        autor: data.usuario?.username || data.usuario?.nombre || usuario,
        avatar: data.usuario?.foto_perfil,
        texto: data.comentario,
      }
      setPosts((prev) =>
        prev.map((post) =>
          post.id === id
            ? { ...post, comentarios: [...post.comentarios, nuevo] }
            : post,
        ),
      )
      setNuevoComentario('')
      setToast('Comentario publicado ✓')
    } catch (error) {
      setToast(error.message)
    }
  }

  const compartir = (post) => {
    const enlace = `${window.location.origin}${window.location.pathname}#/publicacion?id=${post.id}`
    if (!navigator.clipboard) {
      setToast('No se pudo copiar el enlace')
      return
    }
    navigator.clipboard
      .writeText(enlace)
      .then(function () {
        setToast('Enlace copiado al portapapeles 🔗')
      })
      .catch(function () {
        setToast('No se pudo copiar el enlace')
      })
  }

  const cargarMas = async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const { data, meta } = await forumApi.list(feedTab, nextCursor, 20)
      const nuevas = data.map((publicacion) => ({
        id: publicacion.id,
        usuarioId: publicacion.usuario?.id,
        autor: publicacion.usuario?.username || publicacion.usuario?.nombre || 'Usuario',
        avatar: publicacion.usuario?.foto_perfil,
        fecha: publicacion.fecha_publicacion
          ? new Date(publicacion.fecha_publicacion).toLocaleString('es-CO')
          : '',
        titulo: publicacion.titulo,
        cuerpo: publicacion.contenido,
        imagen: publicacion.imagenes?.[0]?.imagen || null,
        referencias: publicacion.referencias || [],
        comentarios: publicacion.comentarios || [],
      }))
      setPosts((previas) => [...previas, ...nuevas])
      setNextCursor(meta?.next_cursor || null)
    } catch (error) {
      setToast(error.message)
    } finally {
      setLoadingMore(false)
    }
  }

  const publicar = async () => {
    const texto = textoPublicacion.trim()
    if (!auth?.isAuthenticated) {
      if (onNavigate) onNavigate('/login')
      return
    }
    if (!texto) {
      setToast('Escribe el contenido de tu publicación.')
      return
    }

    const primerasLineas = texto.split('\n').filter((linea) => linea !== '')
    const titulo = primerasLineas[0] || 'Nueva publicación'
    try {
      const { data: publicacion } = await forumApi.create(
        {
          titulo,
          contenido: texto,
          imagen: archivoNuevo,
          tipo: tipoPost,
          producto_id: productoReferencia || undefined,
        },
        token,
      )
      const nueva = {
        id: publicacion.id,
        usuarioId: publicacion.usuario?.id,
        autor: publicacion.usuario?.username || usuario,
        avatar: publicacion.usuario?.foto_perfil,
        fecha: publicacion.fecha_publicacion
          ? new Date(publicacion.fecha_publicacion).toLocaleString('es-CO')
          : 'Ahora mismo',
        titulo: publicacion.titulo,
        cuerpo: publicacion.contenido,
        imagen: publicacion.imagenes?.[0]?.imagen || null,
        referencias: publicacion.referencias || [],
        comentarios: [],
      }
      setPosts((prev) => [nueva, ...prev])
      setTextoPublicacion('')
      setImagenNueva(null)
      setArchivoNuevo(null)
      setProductoReferencia('')
      setProductoReferencia('')
      setPanelAbierto(false)
      setToast('¡Publicación creada! ✓')
    } catch (error) {
      setToast(error.message)
    }
  }

  const reportPost = async (post) => {
    if (!auth?.isAuthenticated) {
      onNavigate?.('/login')
      return
    }
    const reason = window.prompt(
      'Motivo: spam, estafa, acoso, contenido_prohibido o suplantacion',
    )
    if (!reason) return
    const allowed = ['spam', 'estafa', 'acoso', 'contenido_prohibido', 'suplantacion']
    if (!allowed.includes(reason.trim())) {
      setToast('Selecciona uno de los motivos permitidos.')
      return
    }
    try {
      await savedApi.report({
        recurso_tipo: 'post',
        recurso_id: post.id,
        motivo: reason.trim(),
        descripcion: 'Reporte enviado desde el contexto de la publicación.',
      }, token)
      setToast('Reporte enviado de forma privada.')
    } catch (requestError) {
      setToast(requestError.message)
    }
  }

  const seleccionarImagen = (event) => {
    const file = event.target.files[0]
    if (!file) return
    setArchivoNuevo(file)
    const reader = new FileReader()
    reader.onload = (loadEvent) => setImagenNueva(loadEvent.target.result)
    reader.readAsDataURL(file)
  }

  const irPlantilla = (origen) =>
    onNavigate && onNavigate(`/plantilla?origen=${origen}`)

  return (
    <div className="page-layout foro-layout">
      <Header
        title="AEGIS | Foro"
        auth={auth}
        onNavigate={onNavigate}
        forumMode
        forumMenuOpen={foroMenuAbierto}
        onForumMenuToggle={() => setForoMenuAbierto((abierto) => !abierto)}
      />
      <label className="foro-composer-type">
        Referencia comercial
        <input
          type="number"
          min="1"
          value={productoReferencia}
          onChange={(event) => setProductoReferencia(event.target.value)}
          placeholder="ID de anuncio"
        />
      </label>
      <label className="foro-composer-type">
        Tipo de publicación
        <select value={tipoPost} onChange={(event) => setTipoPost(event.target.value)}>
          <option value="discusion">Discusión</option>
          <option value="pregunta">Pregunta</option>
          <option value="tutorial">Tutorial</option>
          <option value="encuesta">Encuesta</option>
          <option value="anuncio">Anuncio de grupo</option>
        </select>
      </label>

      {foroMenuAbierto && (
        <div className="foro-sidebar-overlay">
          <button
            className="foro-sidebar-backdrop"
            type="button"
            aria-label="Cerrar menú del foro"
            onClick={() => setForoMenuAbierto(false)}
          />
          <Sidebar
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            orden={orden}
            setOrden={setOrden}
            temaActivo={temaActivo}
            setTemaActivo={setTemaActivo}
            onNavigate={onNavigate}
          />
        </div>
      )}

      <div className="foro-container">
        <Sidebar
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          orden={orden}
          setOrden={setOrden}
          temaActivo={temaActivo}
          setTemaActivo={setTemaActivo}
          onNavigate={onNavigate}
        />

        <main className="foro-feed">
          <nav className="foro-feed-tabs" aria-label="Filtros del feed">
            {[
              ['para-ti', 'Para ti'],
              ['siguiendo', 'Siguiendo'],
              ['recientes', 'Recientes'],
              ['marketplace', 'Marketplace'],
            ].map(([id, label]) => (
              <button
                type="button"
                key={id}
                className={feedTab === id ? 'active' : ''}
                aria-current={feedTab === id ? 'page' : undefined}
                onClick={() => setFeedTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>
          {!panelAbierto ? (
            <div className="foro-composer">
              <div className="foro-composer-avatar">
                {miFoto ? <img src={miFoto} alt="Mi foto" /> : '?'}
              </div>
              <div className="foro-composer-field">
                <input
                  className="foro-composer-input"
                  type="text"
                  placeholder={
                    auth?.isAuthenticated
                      ? 'Publica aquí...'
                      : 'Inicia sesión para publicar'
                  }
                  value={textoPublicacion}
                  onChange={(event) => setTextoPublicacion(event.target.value)}
                  readOnly={!auth?.isAuthenticated}
                  onFocus={() => {
                    if (auth?.isAuthenticated) setPanelAbierto(true)
                    else if (onNavigate) onNavigate('/login')
                  }}
                />
                <button
                  className="foro-composer-imgbtn"
                  type="button"
                  aria-label="Agregar imagen"
                  title="Agregar imagen"
                  onClick={() => {
                    if (!auth?.isAuthenticated) {
                      if (onNavigate) onNavigate('/login')
                    } else if (fileInputRef.current)
                      fileInputRef.current.click()
                  }}
                >
                  <IconPlus />
                </button>
              </div>
            </div>
          ) : (
            <div className="foro-composer-panel">
              <div
                className="foro-composer"
                style={{ border: 'none', boxShadow: 'none', padding: 0 }}
              >
                <div className="foro-composer-avatar">
                  {miFoto ? <img src={miFoto} alt="Mi foto" /> : '?'}
                </div>
                <div className="foro-composer-field">
                  <input
                    className="foro-composer-input"
                    type="text"
                    placeholder="Escribe el título de tu publicación..."
                    value={textoPublicacion.split('\n')[0]}
                    onChange={(event) => {
                      const resto = textoPublicacion
                        .split('\n')
                        .slice(1)
                        .join('\n')
                      setTextoPublicacion(
                        event.target.value + (resto ? '\n' + resto : ''),
                      )
                    }}
                  />
                </div>
              </div>
              <textarea
                placeholder="Cuéntanos más detalles..."
                required
                value={textoPublicacion.split('\n').slice(1).join('\n')}
                onChange={(event) =>
                  setTextoPublicacion(
                    textoPublicacion.split('\n')[0] +
                      (event.target.value ? '\n' + event.target.value : ''),
                  )
                }
              />
              {imagenNueva && (
                <img
                  className="foro-composer-preview"
                  src={imagenNueva}
                  alt="Vista previa"
                />
              )}
              <div className="foro-composer-actions">
                <button
                  className="foro-btn foro-btn--ghost"
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.click()
                  }}
                >
                  📷 Imagen
                </button>
                <button
                  className="foro-btn foro-btn--ghost"
                  type="button"
                  onClick={() => {
                    setPanelAbierto(false)
                    setTextoPublicacion('')
                    setImagenNueva(null)
                    setArchivoNuevo(null)
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="foro-btn foro-btn--primary"
                  type="button"
                  onClick={publicar}
                >
                  Publicar
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            hidden
            onChange={seleccionarImagen}
          />

          {videoCapabilities && (
            <p className="media-capability-status" role="status">
              {videoCapabilities.vod.available
                ? 'Video bajo demanda disponible.'
                : 'Video bajo demanda no disponible hasta configurar Cloudinary.'}
              {' '}Live: {videoCapabilities.live.available ? 'Disponible.' : 'No disponible.'}
            </p>
          )}

          <div className="foro-toolbar">
            <div className="foro-sort" ref={ordenRef}>
              <button
                className="foro-sort-btn"
                type="button"
                onClick={() => setOrdenOpen(!ordenOpen)}
              >
                Ordenar Por <IconChevron open={ordenOpen} />
              </button>
              {ordenOpen && (
                <div className="foro-sort-menu">
                  {ORDENES.map((opcion) => (
                    <button
                      key={opcion.id}
                      type="button"
                      className={orden === opcion.id ? 'active' : ''}
                      onClick={() => {
                        setOrden(opcion.id)
                        setOrdenOpen(false)
                      }}
                    >
                      {opcion.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {errorFeed && <ErrorState error={errorFeed} compact />}
          {cargando ? (
            <LoadingState message="Cargando publicaciones..." compact />
          ) : !errorFeed && postsVisibles.length === 0 ? (
            <EmptyState
              title="Sin publicaciones"
              message={
                posts.length
                  ? 'No se encontraron publicaciones que coincidan con tu búsqueda.'
                  : 'Todavía no hay publicaciones en el foro.'
              }
              compact
            />
          ) : (
            !errorFeed &&
            postsVisibles.map((post) => (
              <article className="foro-post" key={post.id}>
                <div
                  className="foro-post-header"
                  onClick={() => {
                    if (auth?.user?.id === post.usuarioId && onNavigate)
                      onNavigate('/perfil')
                  }}
                >
                  <div className="foro-post-avatar">
                    <img
                      src={
                        post.avatar ||
                        (post.autor === usuario && miFoto) ||
                        '/avatar-defecto.svg'
                      }
                      alt={post.autor}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                  <div>
                    <div className="foro-post-author">{post.autor}</div>
                    <div className="foro-post-date">{post.fecha}</div>
                  </div>
                  {auth?.user?.id === post.usuarioId && (
                    <div className="foro-post-owner-actions">
                      <button
                        type="button"
                        onClick={async () => {
                          const contenido = window.prompt('Editar publicación', post.cuerpo || '')
                          if (contenido === null) return
                          try {
                            await forumApi.update(post.id, { contenido: contenido.trim() }, token)
                            setPosts((previas) => previas.map((item) =>
                              item.id === post.id
                                ? { ...item, cuerpo: contenido.trim(), titulo: contenido.trim().split('\n')[0] }
                                : item,
                            ))
                            setToast('Publicación editada')
                          } catch (error) {
                            setToast(error.message)
                          }
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm('¿Archivar esta publicación?')) return
                          try {
                            await forumApi.archive(post.id, token)
                            setPosts((previas) => previas.filter((item) => item.id !== post.id))
                            setToast('Publicación archivada')
                          } catch (error) {
                            setToast(error.message)
                          }
                        }}
                      >
                        Archivar
                      </button>
                    </div>
                  )}
                </div>

                <button
                  className="foro-post-title"
                  type="button"
                  onClick={() => onNavigate(`/publicacion?id=${post.id}`)}
                >
                  {post.titulo}
                </button>

                {post.cuerpo && (
                  <p
                    className="foro-post-body pub-abrir"
                    onClick={() => onNavigate(`/publicacion?id=${post.id}`)}
                  >
                    {post.cuerpo}
                  </p>
                )}

                {post.video?.procesamiento_estado === 'procesando' && (
                  <div className="media-processing" role="status">Procesando video...</div>
                )}
                {post.video?.procesamiento_estado === 'error' && (
                  <div className="media-error" role="alert">El video no pudo procesarse.</div>
                )}
                {post.video?.procesamiento_estado !== 'procesando'
                  && post.video?.procesamiento_estado !== 'error'
                  && post.video
                  && (
                    <video
                      className="foro-post-image"
                      controls
                      preload="metadata"
                      poster={post.video.poster_url || undefined}
                      src={post.video.playback_url || post.video.imagen}
                    >
                      {post.video.alt_text || 'Video de la publicación'}
                    </video>
                  )}
                {!post.video && post.imagen && (
                  <img
                    className="foro-post-image"
                    src={post.imagen}
                    alt={post.titulo}
                    onClick={() => setLightbox(post.imagen)}
                  />
                )}
                {(post.referencias || []).filter((reference) => reference.tipo === 'producto').map((reference) => (
                  <article className="foro-product-reference" key={reference.id || reference.producto_id}>
                    {reference.producto ? (
                      <button
                        type="button"
                        onClick={() => onNavigate?.(`/productos/detalle?id=${reference.producto.id}`)}
                      >
                        <strong>{reference.producto.titulo}</strong>
                        <span>COP {Number(reference.producto.precio || 0).toLocaleString('es-CO')}</span>
                        <span>{reference.producto.estado_publicacion}</span>
                      </button>
                    ) : (
                      <p>El anuncio ya no está disponible.</p>
                    )}
                  </article>
                ))}

                <div className="foro-post-actions">
                  <button
                    className="foro-action"
                    type="button"
                    onClick={async () => {
                      try {
                        await forumApi.react(post.id, 'me_gusta', token)
                        setToast('Reacción agregada')
                      } catch (error) {
                        setToast(error.message)
                      }
                    }}
                  >
                    Me gusta
                  </button>
                  <button
                    className="foro-action"
                    type="button"
                    onClick={() => toggleComentarios(post.id)}
                  >
                    <IconComment /> {post.comentarios.length} Comentarios
                  </button>
                  <button
                    className="foro-action"
                    type="button"
                    onClick={() => reportPost(post)}
                  >
                    Reportar
                  </button>
                  <button
                    className="foro-action"
                    type="button"
                    aria-label="Compartir"
                    title="Compartir"
                    onClick={() => compartir(post)}
                  >
                    <IconShare />
                  </button>
                  <button
                    className="foro-action"
                    type="button"
                    onClick={async () => {
                      try {
                        await forumApi.repost(post.id, '', token)
                        setToast('Publicación compartida')
                      } catch (error) {
                        setToast(error.message)
                      }
                    }}
                  >
                    Compartir
                  </button>
                  <button
                    className="foro-action"
                    type="button"
                    onClick={async () => {
                      try {
                        await savedApi.save({
                          recurso_tipo: 'post',
                          recurso_id: post.id,
                        }, token)
                        setToast('Guardado en tu colección')
                      } catch (error) {
                        setToast(error.message)
                      }
                    }}
                  >
                    Guardar
                  </button>
                </div>

                {comentariosAbiertos[post.id] && (
                  <div className="foro-comments">
                    {post.comentarios.length === 0 && (
                      <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>
                        Sé el primero en comentar.
                      </p>
                    )}
                    {post.comentarios.map((comentario) => (
                      <div className="foro-comment" key={comentario.id}>
                        <div className="foro-comment-avatar">
                          <img
                            src={
                              comentario.avatar ||
                              (comentario.autor === usuario && miFoto) ||
                              '/avatar-defecto.svg'
                            }
                            alt={comentario.autor}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                        <div className="foro-comment-bubble">
                          <strong
                            onClick={() => {
                              if (
                                auth?.user?.username === comentario.autor &&
                                onNavigate
                              )
                                onNavigate('/perfil')
                            }}
                          >
                            {comentario.autor}
                          </strong>
                          <p>{comentario.texto}</p>
                        </div>
                      </div>
                    ))}
                    <div className="foro-comment-form">
                      <input
                        type="text"
                        placeholder={
                          auth?.isAuthenticated
                            ? 'Escribe un comentario...'
                            : 'Inicia sesión para comentar'
                        }
                        value={nuevoComentario}
                        onChange={(event) =>
                          setNuevoComentario(event.target.value)
                        }
                        readOnly={!auth?.isAuthenticated}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') agregarComentario(post.id)
                        }}
                      />
                      <button
                        className="foro-btn foro-btn--primary"
                        type="button"
                        onClick={() => agregarComentario(post.id)}
                      >
                        Responder
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
          {nextCursor && (
            <button
              type="button"
              className="foro-btn foro-btn--ghost"
              disabled={loadingMore}
              onClick={cargarMas}
            >
              {loadingMore ? 'Cargando...' : 'Cargar más'}
            </button>
          )}
        </main>

        <aside className="foro-banners">
          <button
            className="foro-banner"
            type="button"
            onClick={() => irPlantilla('banner-ofertas-1')}
          >
            <img
              src="/ofertas-banner.svg"
              alt="OFERTAS INCREÍBLES HASTA -50% DTO."
            />
          </button>
          <button
            className="foro-banner"
            type="button"
            onClick={() => irPlantilla('banner-ofertas-2')}
          >
            <img
              src="/ofertas-banner.svg"
              alt="OFERTAS INCREÍBLES HASTA -50% DTO."
            />
          </button>
        </aside>
      </div>

      {lightbox && (
        <div className="foro-lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Imagen ampliada" />
        </div>
      )}

      {toast && <div className="foro-toast">{toast}</div>}

      <Footer onNavigate={onNavigate} />
    </div>
  )
}
