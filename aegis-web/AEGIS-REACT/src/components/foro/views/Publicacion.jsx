import { useState, useRef, useEffect } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import Sidebar from '../../layouts/Sidebar'
import { POSTS_EJEMPLO } from './Foro'
import { USUARIOS_DEMO, usuarioGenerico, fotoUsuario } from '../../shared/usuariosDemo'
import '../css/foro.css'

const ORDENES_COMENTARIOS = [
  { id: 'destacados', label: 'Destacados' },
  { id: 'recientes', label: 'Más recientes' },
  { id: 'antiguos', label: 'Más antiguos' },
]

const IconFlecha = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const IconCorazon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const IconComentario = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

const IconCompartir = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)

export default function Publicacion({ id, auth, onNavigate }) {
  let post = null
  if (!id) post = POSTS_EJEMPLO[0] || null
  if (id) post = POSTS_EJEMPLO.find((p) => String(p.id) === String(id)) || null

  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState('')
  const [temaActivo, setTemaActivo] = useState(null)
  const [ordenComentario, setOrdenComentario] = useState('destacados')
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [comentariosNuevos, setComentariosNuevos] = useState([])
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post ? post.likes : 0)
  const [toast, setToast] = useState(null)

  const comentarioRef = useRef(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  let usuario = 'Usuario AEGIS'
  if (auth && auth.user && auth.user.nombre) usuario = auth.user.nombre

  const perfilGuardado = JSON.parse(localStorage.getItem('perfilAegis') || '{}')
  const miFoto = perfilGuardado.avatar || ''

  const autor = post ? post.autor : ''
  let datosAutor = USUARIOS_DEMO[autor]
  if (!datosAutor) datosAutor = usuarioGenerico(autor)
  let fotoAutor = fotoUsuario(autor, 160)
  if (autor === usuario && miFoto) fotoAutor = miFoto

  let comentarios = []
  if (post) comentarios = [...post.comentarios, ...comentariosNuevos]
  if (ordenComentario === 'destacados') comentarios.sort((a, b) => (b.likes || 0) - (a.likes || 0))
  if (ordenComentario === 'recientes') comentarios.sort((a, b) => b.id - a.id)
  if (ordenComentario === 'antiguos') comentarios.sort((a, b) => a.id - b.id)

  const irAtras = () => onNavigate && onNavigate('/foro')

  const irPerfil = (nombre) => onNavigate && onNavigate('/perfil?id=' + encodeURIComponent(nombre))

  const toggleLike = () => {
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)
  }

  const agregarComentario = () => {
    const texto = nuevoComentario.trim()
    if (!texto) return
    const nuevo = { id: Date.now(), autor: usuario, texto, likes: 0, fecha: 'Ahora mismo' }
    setComentariosNuevos([...comentariosNuevos, nuevo])
    setNuevoComentario('')
    setToast('Comentario publicado ✓')
  }

  const enfocarComentario = () => {
    if (comentarioRef.current) comentarioRef.current.focus()
  }

  const compartir = () => {
    const enlace = `${window.location.origin}${window.location.pathname}#/publicacion?id=${post.id}`
    if (!navigator.clipboard) {
      setToast('No se pudo copiar el enlace')
      return
    }
    navigator.clipboard.writeText(enlace)
      .then(function () {
        setToast('Enlace copiado al portapapeles 🔗')
      })
      .catch(function () {
        setToast('No se pudo copiar el enlace')
      })
  }

  return (
    <div className="page-layout foro-layout">
      <Header title="AEGIS | Publicación" auth={auth} onNavigate={onNavigate} />

      <div className="foro-container foro-container--publicacion">
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
          <button className="pub-volver" type="button" onClick={irAtras}>
            <IconFlecha /> Volver al foro
          </button>

          {post ? (
            <article className="foro-post pub-post">
              <div className="foro-post-header" onClick={() => irPerfil(autor)}>
                <div className="foro-post-avatar">
                  <img src={fotoAutor} alt={autor} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div className="foro-post-author">{post.autor}</div>
                  <div className="foro-post-date">{post.fecha}</div>
                </div>
              </div>

              <h1 className="pub-title">{post.titulo}</h1>

              {post.cuerpo && <p className="foro-post-body">{post.cuerpo}</p>}

              {post.imagen && <img className="foro-post-image" src={post.imagen} alt={post.titulo} />}

              <div className="foro-post-actions">
                <button className={`foro-action ${liked ? 'liked' : ''}`} type="button" onClick={toggleLike}>
                  <IconCorazon filled={liked} /> {likes} Likes
                </button>
                <button className="foro-action" type="button" onClick={enfocarComentario}>
                  <IconComentario /> {comentarios.length} Comentarios
                </button>
                <button className="foro-action" type="button" aria-label="Compartir" title="Compartir" onClick={compartir}>
                  <IconCompartir />
                </button>
              </div>

              <div className="foro-comment-form pub-caja">
                <input
                  ref={comentarioRef}
                  type="text"
                  placeholder="Únete a la conversación"
                  value={nuevoComentario}
                  onChange={(event) => setNuevoComentario(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter') agregarComentario() }}
                />
                <button className="foro-btn foro-btn--primary" type="button" onClick={agregarComentario}>
                  Comentar
                </button>
              </div>

              <div className="pub-orden">
                <span>Ordenar por:</span>
                <select
                  className="pub-select"
                  value={ordenComentario}
                  onChange={(event) => setOrdenComentario(event.target.value)}
                >
                  {ORDENES_COMENTARIOS.map((opcion) => (
                    <option key={opcion.id} value={opcion.id}>{opcion.label}</option>
                  ))}
                </select>
              </div>

              <div className="foro-comments">
                {comentarios.length === 0 && (
                  <p className="pub-vacio">Sé el primero en comentar. 💬</p>
                )}
                {comentarios.map((comentario) => (
                  <div className="foro-comment" key={comentario.id}>
                    <div className="foro-comment-avatar">
                      <img src={comentario.autor === usuario && miFoto ? miFoto : fotoUsuario(comentario.autor, 64)} alt={comentario.autor} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                    <div className="foro-comment-bubble">
                      <strong>
                        <button className="pub-autor-link" type="button" onClick={() => irPerfil(comentario.autor)}>
                          {comentario.autor}
                        </button>
                        <span className="pub-comment-fecha"> · {comentario.fecha || 'Ahora mismo'}</span>
                      </strong>
                      <p>{comentario.texto}</p>
                      <div className="pub-comment-meta">
                        <span>{comentario.likes || 0} likes</span>
                        <button type="button" onClick={enfocarComentario}>Responder</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ) : (
            <div className="foro-empty">
              No encontramos esta publicación. 🔍
            </div>
          )}
        </main>

        {post && (
          <aside
            className={datosAutor.portada ? 'pub-autor con-portada' : 'pub-autor sin-portada'}
            onClick={() => irPerfil(autor)}
          >
            {datosAutor.portada && <img className="pub-portada" src={datosAutor.portada} alt="" />}
            <img className="pub-foto" src={fotoAutor} alt={autor} />
            <div className="pub-autor-info">
              <h3>{autor}</h3>
              <p>{datosAutor.seUnio ? 'Se unió a AEGIS el ' + datosAutor.seUnio : 'Miembro de AEGIS'}</p>
              <button className="foro-btn foro-btn--primary pub-ver-perfil" type="button">
                Ver perfil
              </button>
            </div>
          </aside>
        )}
      </div>

      {toast && <div className="foro-toast">{toast}</div>}

      <Footer onNavigate={onNavigate} />
    </div>
  )
}
