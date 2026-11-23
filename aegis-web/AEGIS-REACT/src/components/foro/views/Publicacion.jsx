import { useEffect, useRef, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { useAuth } from '../../../auth/useAuth'
import { forumApi } from '../../../services/api'
import '../css/foro.css'

export default function Publicacion({ id, auth, onNavigate }) {
  const { token } = useAuth()
  const [publicacion, setPublicacion] = useState(null)
  const [comentario, setComentario] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [errorComentario, setErrorComentario] = useState('')
  const comentarioRef = useRef(null)

  useEffect(() => {
    let active = true
    forumApi.show(id)
      .then(({ data }) => {
        if (!active) return
        const found = data
        if (!found) {
          setError('No encontramos esta publicación.')
          return
        }
        setPublicacion({
          ...found,
          autor: found.usuario?.username || `${found.usuario?.nombre || ''} ${found.usuario?.apellido || ''}`.trim(),
          avatar: found.usuario?.foto_perfil,
          fecha: found.fecha_publicacion ? new Date(found.fecha_publicacion).toLocaleString('es-CO') : '',
          cuerpo: found.contenido,
          imagen: found.imagenes?.[0]?.imagen || null,
          comentarios: (found.comentarios || []).map((item) => ({
            ...item,
            autor: item.usuario?.username || item.usuario?.nombre || 'Usuario',
            avatar: item.usuario?.foto_perfil,
            texto: item.comentario,
          })),
        })
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setCargando(false)
      })
    return () => { active = false }
  }, [id])

  const agregarComentario = async (event) => {
    event.preventDefault()
    if (!auth?.isAuthenticated) {
      if (onNavigate) onNavigate('/login')
      return
    }
    const texto = comentario.trim()
    if (!texto || !publicacion) return
    try {
      const { data } = await forumApi.comment(publicacion.id, texto, token)
      const nuevo = {
        id: data.id,
        autor: data.usuario?.username || data.usuario?.nombre || auth.user.nombre,
        avatar: data.usuario?.foto_perfil,
        texto: data.comentario,
      }
      setPublicacion((actual) => ({ ...actual, comentarios: [...actual.comentarios, nuevo] }))
      setComentario('')
      setErrorComentario('')
    } catch (requestError) {
      setErrorComentario(requestError.message)
    }
  }

  const compartir = async () => {
    if (!navigator.clipboard) {
      setErrorComentario('No se pudo copiar el enlace.')
      return
    }
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      setErrorComentario('No se pudo copiar el enlace.')
    }
  }

  return (
    <div className="page-layout foro-layout">
      <Header title="AEGIS | Publicación" auth={auth} onNavigate={onNavigate} />
      <main className="foro-container foro-container--publicacion">
        <section className="foro-feed">
          <button className="pub-volver" type="button" onClick={() => onNavigate && onNavigate('/foro')}>
            ← Volver al foro
          </button>
          {cargando && <div className="foro-empty">Cargando publicación...</div>}
          {!cargando && error && <div className="foro-empty" role="alert">{error}</div>}
          {!cargando && !error && publicacion && (
            <article className="foro-post pub-post">
              <div className="foro-post-header">
                <div className="foro-post-avatar">
                  <img src={publicacion.avatar || '/avatar-defecto.svg'} alt={publicacion.autor} />
                </div>
                <div>
                  <div className="foro-post-author">{publicacion.autor}</div>
                  <div className="foro-post-date">{publicacion.fecha}</div>
                </div>
              </div>
              <h1 className="pub-title">{publicacion.titulo}</h1>
              {publicacion.tipo && (
                <span className="foro-thread-type">{publicacion.tipo}</span>
              )}
              {publicacion.interaccion_estado === 'cerrado' && (
                <span className="foro-thread-type" role="status">Hilo cerrado</span>
              )}
              <p className="foro-post-body">{publicacion.cuerpo}</p>
              {publicacion.imagen && <img className="foro-post-image" src={publicacion.imagen} alt={publicacion.titulo} />}
              <div className="foro-post-actions">
                {auth?.isAuthenticated && (
                  <>
                    <button
                      className="foro-action"
                      type="button"
                      onClick={() => forumApi.subscribe(publicacion.id, token).catch((e) => setErrorComentario(e.message))}
                    >
                      Suscribirme
                    </button>
                    {(auth?.user?.id === publicacion.usuario_id || auth?.isAdmin) && (
                      <button
                        className="foro-action"
                        type="button"
                        onClick={() => {
                          const estado = publicacion.interaccion_estado === 'cerrado' ? 'abierto' : 'cerrado'
                          forumApi.toggleThread(publicacion.id, estado, token)
                            .then(() => setPublicacion((actual) => ({ ...actual, interaccion_estado: estado })))
                            .catch((e) => setErrorComentario(e.message))
                        }}
                      >
                        {publicacion.interaccion_estado === 'cerrado' ? 'Reabrir hilo' : 'Cerrar hilo'}
                      </button>
                    )}
                  </>
                )}
                <button className="foro-action" type="button" onClick={() => comentarioRef.current?.focus()}>
                  {publicacion.comentarios.length} Comentarios
                </button>
                <button className="foro-action" type="button" onClick={compartir}>Compartir</button>
              </div>
              <div className="foro-comments">
                {publicacion.comentarios.map((item) => (
                  <div className="foro-comment" key={item.id}>
                    <div className="foro-comment-avatar">
                      <img src={item.avatar || '/avatar-defecto.svg'} alt={item.autor} />
                    </div>
                    <div className="foro-comment-bubble">
                      <strong>{item.autor}</strong>
                      <p>{item.texto}</p>
                      {auth?.isAuthenticated && auth?.user?.id === publicacion.usuario_id && (
                        <button
                          type="button"
                          className="foro-action"
                          onClick={() => forumApi.setSolution(publicacion.id, item.id, true, token)
                            .then(() => setErrorComentario('Respuesta marcada como solución'))
                            .catch((e) => setErrorComentario(e.message))}
                        >
                          Marcar solución
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <form className="foro-comment-form" onSubmit={agregarComentario}>
                  <input
                    ref={comentarioRef}
                    type="text"
                    placeholder={auth?.isAuthenticated ? 'Escribe un comentario...' : 'Inicia sesión para comentar'}
                    value={comentario}
                    onChange={(event) => setComentario(event.target.value)}
                    readOnly={!auth?.isAuthenticated}
                  />
                  <button className="foro-btn foro-btn--primary" type="submit">Comentar</button>
                </form>
                {errorComentario && <p className="foro-empty" role="alert">{errorComentario}</p>}
              </div>
            </article>
          )}
        </section>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
