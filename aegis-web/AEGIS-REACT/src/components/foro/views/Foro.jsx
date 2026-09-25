import { useState, useRef, useEffect, useMemo } from 'react'
import { Header, Footer } from '../../home/views/Home'
import { avatarUrl } from '../../shared/presentation'
import '../css/foro.css'

// --- ICONOS (SVG inline, mismo estilo que el resto del proyecto) ---
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const IconHome = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const IconTrend = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

const IconHeart = ({ filled }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const IconComment = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const IconShare = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)

const IconFlag = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
)

const IconImage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

const IconChevron = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

// --- DATOS DE EJEMPLO (mismo contenido de la imagen) ---
const POSTS_EJEMPLO = [
  {
    id: 1,
    autor: 'TheDarkMoon7456',
    fecha: 'Hace 2 h',
    titulo: '¿Alguien sabe si mi GTX 1050 puede correr Cyberpunk 2077 en ultra?',
    cuerpo: 'He visto vídeos dispares y quiero asegurarme antes de comprarlo.\nTengo un i5 y 16GB de RAM.\n\n¿Alguna sugerencia sobre rendimiento?',
    imagen: null,
    likes: 892,
    comentarios: [
      { id: 1, autor: 'TechFan01', texto: 'En ultra te va a costar, mejor bajos-medios con DLSS.' },
      { id: 2, autor: 'GamerCol', texto: 'Con ese setup mejor medium, ¡pero va a ir fluido!' },
    ],
  },
  {
    id: 2,
    autor: 'TheDarkMoon7456',
    fecha: 'Hace 5 h',
    titulo: '¿Alguien sabe cómo arreglar mi PC? Se queda en pantalla azul (BSOD) constantemente y no arranca.',
    cuerpo: '',
    imagen: '/bsod-demo.svg',
    likes: 341,
    comentarios: [
      { id: 1, autor: 'SoporteAegis', texto: 'Prueba entrando en modo seguro y desinstalando el último controlador.' },
    ],
  },
  {
    id: 3,
    autor: 'NovaKatana',
    fecha: 'Hace 1 d',
    titulo: 'Recomendación de laptop para programar y estudiar',
    cuerpo: 'Necesito una laptop con buen rendimiento para desarrollo (VS Code, Docker, React) y que la batería dure bastante.\n\n¿Alguna recomendación por menos de $3.000.000?',
    imagen: null,
    likes: 127,
    comentarios: [],
  },
]

const TEMAS = ['Celulares', 'Computadores', 'Televisores', 'Más']

const ORDENES = [
  { id: 'recientes', label: 'Más recientes' },
  { id: 'populares', label: 'Más populares' },
  { id: 'comentados', label: 'Más comentados' },
]

// --- PÁGINA DEL FORO ---
export default function Foro({ auth, onNavigate }) {
  const [posts, setPosts] = useState(POSTS_EJEMPLO)
  const [busqueda, setBusqueda] = useState('')
  const [temaActivo, setTemaActivo] = useState(null)
  const [orden, setOrden] = useState('recientes')
  const [ordenOpen, setOrdenOpen] = useState(false)
  const [comentariosAbiertos, setComentariosAbiertos] = useState({})
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [textoPublicacion, setTextoPublicacion] = useState('')
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [imagenNueva, setImagenNueva] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [toast, setToast] = useState(null)

  const ordenRef = useRef(null)
  const fileInputRef = useRef(null)

  // Cierra el menú "Ordenar Por" al hacer clic fuera
  useEffect(() => {
    if (!ordenOpen) return
    const handleClickOutside = (event) => {
      if (ordenRef.current && !ordenRef.current.contains(event.target)) setOrdenOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ordenOpen])

  // Cierra el lightbox con la tecla ESC
  useEffect(() => {
    if (!lightbox) return
    const handleKey = (event) => {
      if (event.key === 'Escape') setLightbox(null)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [lightbox])

  // Auto-oculta el toast después de 2.5s
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  // Filtrado y ordenamiento de publicaciones
  const postsVisibles = useMemo(() => {
    const term = busqueda.trim().toLowerCase()
    let lista = posts.filter((post) => {
      const coincideBusqueda =
        !term ||
        post.titulo.toLowerCase().includes(term) ||
        post.cuerpo.toLowerCase().includes(term) ||
        post.autor.toLowerCase().includes(term)
      return coincideBusqueda
    })

    if (orden === 'populares') lista = [...lista].sort((a, b) => b.likes - a.likes)
    if (orden === 'comentados') lista = [...lista].sort((a, b) => b.comentarios.length - a.comentarios.length)

    return lista
  }, [posts, busqueda, orden])

  const usuario = auth?.user?.nombre || 'Usuario AEGIS'

  // --- ACCIONES ---
  const toggleLike = (id) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    )
  }

  const toggleComentarios = (id) => {
    setComentariosAbiertos((prev) => ({ ...prev, [id]: !prev[id] }))
    setNuevoComentario('')
  }

  const agregarComentario = (id) => {
    const texto = nuevoComentario.trim()
    if (!texto) return
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? {
              ...post,
              comentarios: [...post.comentarios, { id: Date.now(), autor: usuario, texto }],
            }
          : post
      )
    )
    setNuevoComentario('')
    setToast('Comentario publicado ✓')
  }

  const compartir = async (post) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#/plantilla?origen=post-${post.id}`)
      setToast('Enlace copiado al portapapeles 🔗')
    } catch {
      setToast('No se pudo copiar el enlace')
    }
  }

  const reportar = (post) => {
    setToast(`Publicación "${post.titulo.slice(0, 30)}..." reportada 🚩`)
  }

  const publicar = () => {
    const texto = textoPublicacion.trim()
    if (!texto && !imagenNueva) return

    const primerasLineas = texto.split('\n').filter(Boolean)
    const titulo = primerasLineas[0] || 'Nueva publicación'
    const cuerpo = primerasLineas.slice(1).join('\n')

    setPosts((prev) => [
      {
        id: Date.now(),
        autor: usuario,
        fecha: 'Ahora mismo',
        titulo,
        cuerpo,
        imagen: imagenNueva,
        liked: false,
        likes: 0,
        comentarios: [],
      },
      ...prev,
    ])

    setTextoPublicacion('')
    setImagenNueva(null)
    setPanelAbierto(false)
    setToast('¡Publicación creada! ✓')
  }

  const seleccionarImagen = (event) => {
    const [file] = event.target.files
    if (!file) return
    const reader = new FileReader()
    reader.onload = (loadEvent) => setImagenNueva(loadEvent.target.result)
    reader.readAsDataURL(file)
  }

  const irPlantilla = (origen) => onNavigate && onNavigate(`/plantilla?origen=${origen}`)

  return (
    <div className="page-layout">
      <Header auth={auth} onNavigate={onNavigate} />

      <div className="foro-container">
        {/* ============ SIDEBAR IZQUIERDO ============ */}
        <aside className="foro-sidebar">
          <div className="foro-search">
            <input
              type="text"
              placeholder="Buscar Conversación"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
            <span className="foro-search-icon"><IconSearch /></span>
          </div>

          <nav className="foro-side-nav">
            <button
              type="button"
              className={`foro-side-link ${!busqueda ? 'active' : ''}`}
              onClick={() => setBusqueda('')}
            >
              <IconHome /> Principal
            </button>
            <button
              type="button"
              className={`foro-side-link ${orden === 'populares' ? 'active' : ''}`}
              onClick={() => setOrden('populares')}
            >
              <IconTrend /> Popular
            </button>
          </nav>

          <hr className="foro-side-divider" />

          <div className="foro-side-section-title">Temas</div>
          <div className="foro-side-nav">
            {TEMAS.map((tema) => (
              <button
                key={tema}
                type="button"
                className={`foro-topic-link ${temaActivo === tema ? 'active' : ''}`}
                onClick={() => setTemaActivo(temaActivo === tema ? null : tema)}
              >
                {tema}
              </button>
            ))}
          </div>

          <hr className="foro-side-divider" />

          <div className="foro-side-nav">
            <button type="button" className="foro-info-link" onClick={() => irPlantilla('reglas-del-foro')}>
              Reglas del foro
            </button>
            <button type="button" className="foro-info-link" onClick={() => irPlantilla('politica-privacidad')}>
              Política Privacidad
            </button>
            <button type="button" className="foro-info-link" onClick={() => irPlantilla('terminos-y-condiciones')}>
              Terminos y Condiciones
            </button>
            <button type="button" className="foro-info-link" onClick={() => irPlantilla('ayuda')}>
              Ayuda
            </button>
          </div>
        </aside>

        {/* ============ FEED CENTRAL ============ */}
        <main className="foro-feed">
          {/* Compositor de publicación */}
          {!panelAbierto ? (
            <div className="foro-composer">
              <div className="foro-composer-avatar">?</div>
              <div className="foro-composer-field">
                <input
                  className="foro-composer-input"
                  type="text"
                  placeholder="Publica Aqui...."
                  value={textoPublicacion}
                  onChange={(event) => setTextoPublicacion(event.target.value)}
                  onFocus={() => setPanelAbierto(true)}
                />
                <button
                  className="foro-composer-imgbtn"
                  type="button"
                  aria-label="Agregar imagen"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IconImage />
                </button>
              </div>
            </div>
          ) : (
            <div className="foro-composer-panel">
              <div className="foro-composer" style={{ border: 'none', boxShadow: 'none', padding: 0 }}>
                <div className="foro-composer-avatar">?</div>
                <div className="foro-composer-field">
                  <input
                    className="foro-composer-input"
                    type="text"
                    placeholder="Escribe el título de tu publicación..."
                    value={textoPublicacion.split('\n')[0]}
                    onChange={(event) => {
                      const resto = textoPublicacion.split('\n').slice(1).join('\n')
                      setTextoPublicacion(event.target.value + (resto ? '\n' + resto : ''))
                    }}
                  />
                </div>
              </div>
              <textarea
                placeholder="Cuéntanos más detalles... (Opcional)"
                value={textoPublicacion.split('\n').slice(1).join('\n')}
                onChange={(event) =>
                  setTextoPublicacion(textoPublicacion.split('\n')[0] + (event.target.value ? '\n' + event.target.value : ''))
                }
              />
              {imagenNueva && <img className="foro-composer-preview" src={imagenNueva} alt="Vista previa" />}
              <div className="foro-composer-actions">
                <button className="foro-btn foro-btn--ghost" type="button" onClick={() => fileInputRef.current?.click()}>
                  📷 Imagen
                </button>
                <button className="foro-btn foro-btn--ghost" type="button" onClick={() => { setPanelAbierto(false); setTextoPublicacion(''); setImagenNueva(null) }}>
                  Cancelar
                </button>
                <button className="foro-btn foro-btn--primary" type="button" onClick={publicar}>
                  Publicar
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={seleccionarImagen}
          />

          {/* Barra "Ordenar Por" */}
          <div className="foro-toolbar">
            <div className="foro-sort" ref={ordenRef}>
              <button className="foro-sort-btn" type="button" onClick={() => setOrdenOpen(!ordenOpen)}>
                Ordenar Por <IconChevron open={ordenOpen} />
              </button>
              {ordenOpen && (
                <div className="foro-sort-menu">
                  {ORDENES.map((opcion) => (
                    <button
                      key={opcion.id}
                      type="button"
                      className={orden === opcion.id ? 'active' : ''}
                      onClick={() => { setOrden(opcion.id); setOrdenOpen(false) }}
                    >
                      {opcion.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lista de publicaciones */}
          {postsVisibles.length === 0 ? (
            <div className="foro-empty">
              No se encontraron publicaciones que coincidan con tu búsqueda. 🔍
            </div>
          ) : (
            postsVisibles.map((post) => (
              <article className="foro-post" key={post.id}>
                <div className="foro-post-header">
                  <div className="foro-post-avatar">
                    <img src={avatarUrl({ username: post.autor })} alt={post.autor} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div className="foro-post-author">{post.autor}</div>
                    <div className="foro-post-date">{post.fecha}</div>
                  </div>
                  <button
                    className="foro-post-report"
                    type="button"
                    aria-label="Reportar publicación"
                    title="Reportar publicación"
                    onClick={() => reportar(post)}
                  >
                    <IconFlag />
                  </button>
                </div>

                <button
                  className="foro-post-title"
                  type="button"
                  onClick={() => irPlantilla(`post-${post.id}`)}
                >
                  {post.titulo}
                </button>

                {post.cuerpo && <p className="foro-post-body">{post.cuerpo}</p>}

                {post.imagen && (
                  <img
                    className="foro-post-image"
                    src={post.imagen}
                    alt={post.titulo}
                    onClick={() => setLightbox(post.imagen)}
                  />
                )}

                <div className="foro-post-actions">
                  <button
                    className={`foro-action ${post.liked ? 'liked' : ''}`}
                    type="button"
                    onClick={() => toggleLike(post.id)}
                  >
                    <IconHeart filled={post.liked} /> {post.likes} Likes
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
                    aria-label="Compartir"
                    title="Compartir"
                    onClick={() => compartir(post)}
                  >
                    <IconShare />
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
                          <img src={avatarUrl({ username: comentario.autor })} alt={comentario.autor} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        </div>
                        <div className="foro-comment-bubble">
                          <strong>{comentario.autor}</strong>
                          <p>{comentario.texto}</p>
                        </div>
                      </div>
                    ))}
                    <div className="foro-comment-form">
                      <input
                        type="text"
                        placeholder="Escribe un comentario..."
                        value={nuevoComentario}
                        onChange={(event) => setNuevoComentario(event.target.value)}
                        onKeyDown={(event) => { if (event.key === 'Enter') agregarComentario(post.id) }}
                      />
                      <button className="foro-btn foro-btn--primary" type="button" onClick={() => agregarComentario(post.id)}>
                        Responder
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
        </main>

        {/* ============ SIDERECHO (BANNERS) ============ */}
        <aside className="foro-banners">
          <button className="foro-banner" type="button" onClick={() => irPlantilla('banner-ofertas-1')}>
            <img src="/ofertas-banner.svg" alt="OFERTAS INCREÍBLES HASTA -50% DTO." />
          </button>
          <button className="foro-banner" type="button" onClick={() => irPlantilla('banner-ofertas-2')}>
            <img src="/ofertas-banner.svg" alt="OFERTAS INCREÍBLES HASTA -50% DTO." />
          </button>
        </aside>
      </div>

      {/* Lightbox de imagen */}
      {lightbox && (
        <div className="foro-lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Imagen ampliada" />
        </div>
      )}

      {/* Toast de notificación */}
      {toast && <div className="foro-toast">{toast}</div>}

      <Footer onNavigate={onNavigate} />
    </div>
  )
}