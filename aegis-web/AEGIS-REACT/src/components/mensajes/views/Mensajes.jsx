import { useEffect, useRef, useState } from 'react'
import Header from '../../layouts/Header'
import { useAuth } from '../../../auth/useAuth'
import { messageApi, productApi } from '../../../services/api'
import '../css/mensajes.css'

export default function Mensajes({ id, auth, onNavigate }) {
  const { token } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [adjuntos, setAdjuntos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [beforeId, setBeforeId] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const zoneRef = useRef(null)
  const fileRef = useRef(null)

  const loadInbox = async (silent = false) => {
    if (!token) return
    try {
      const { data } = await messageApi.inbox(token)
      setConversations(data)
      setError('')
      if (!silent && !activeId && data.length) setActiveId(data[0].id)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return undefined
    loadInbox()
    const interval = window.setInterval(() => loadInbox(true), 5000)
    return () => window.clearInterval(interval)
  }, [token])

  useEffect(() => {
    if (!id || !token) return
    let active = true
    productApi.show(id)
      .then(({ data }) => {
        if (!active || !data.usuario_id || data.usuario_id === auth?.user?.id) return
        return messageApi.openDirect(data.usuario_id, id, token)
      })
      .then((result) => {
        if (result?.data) {
          setActiveId(result.data.id)
          loadInbox(true)
        }
      })
      .catch((requestError) => setError(requestError.message))
    return () => { active = false }
  }, [id, token])

  const loadMessages = async (conversationId, before = null) => {
    if (!conversationId || !token) return
    try {
      const { data, meta } = await messageApi.messages(conversationId, token, before)
      setBeforeId(meta.next_before_id)
      setHasMore(meta.has_more)
      setMessages((actual) => before ? [...data, ...actual] : data)
      await messageApi.markRead(conversationId, token)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  useEffect(() => {
    if (!activeId) return
    loadMessages(activeId)
    const interval = window.setInterval(() => loadMessages(activeId), 5000)
    return () => window.clearInterval(interval)
  }, [activeId])

  const active = conversations.find((item) => item.id === activeId)

  const submit = async (event) => {
    event.preventDefault()
    if (!activeId || (!texto.trim() && adjuntos.length === 0)) return
    try {
      const { data } = await messageApi.send(activeId, {
        contenido: texto.trim(),
        adjuntos,
      }, token)
      setMessages((actual) => [...actual, data])
      setTexto('')
      setAdjuntos([])
      await loadInbox(true)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const search = async (event) => {
    const value = event.target.value
    setBusqueda(value)
    if (!value.trim()) return
    try {
      await messageApi.search(value.trim(), token, activeId)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const loadPrevious = () => {
    if (beforeId) loadMessages(activeId, beforeId)
  }

  return (
    <div className="page-layout mensajes-layout">
      <Header title="AEGIS | Mensajes" auth={auth} onNavigate={onNavigate} />
      <div className="msg-pagina">
        <aside className="msg-lista">
          <div className="msg-lista-top">
            <h1 className="msg-titulo">Mensajes</h1>
          </div>
          <div className="msg-buscar">
            <input
              type="search"
              placeholder="Buscar conversaciones..."
              value={busqueda}
              onChange={search}
            />
          </div>
          {loading ? (
            <p className="msg-vacio">Cargando conversaciones...</p>
          ) : conversations.length === 0 ? (
            <p className="msg-vacio">No tienes conversaciones.</p>
          ) : (
            <div className="msg-conversaciones">
              {conversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  className={conversation.id === activeId ? 'msg-item msg-item-activo' : 'msg-item'}
                  onClick={() => setActiveId(conversation.id)}
                >
                  <span className="msg-item-info">
                    <strong>{conversation.tipo === 'directa'
                      ? (conversation.usuarios?.find((user) => user.id !== auth?.user?.id)?.nombre || 'Conversación')
                      : conversation.titulo}</strong>
                    {conversation.producto && (
                      <span>{conversation.producto.titulo} · COP {Number(conversation.producto.precio || 0).toLocaleString('es-CO')}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="msg-chat">
          {active?.producto && (
            <div className="msg-producto">
              <div className="msg-producto-info">
                <h2>{active.producto.titulo}</h2>
                <p>COP {Number(active.producto.precio || 0).toLocaleString('es-CO')}</p>
                <p>Estado: {active.producto.estado_publicacion}</p>
              </div>
              <button type="button" onClick={() => onNavigate?.(`/productos/detalle?id=${active.producto.id}`)}>
                Ver producto
              </button>
            </div>
          )}
          <div className="msg-seguridad">
            Mantén conversaciones y pagos dentro de AEGIS.
          </div>
          {error && <p className="msg-vacio" role="alert">{error}</p>}
          {hasMore && (
            <button type="button" onClick={loadPrevious}>Cargar mensajes anteriores</button>
          )}
          <div className="msg-zona" ref={zoneRef}>
            {messages.map((message) => (
              <div key={message.id} className={message.autor_id === auth?.user?.id ? 'msg-fila msg-fila-mio' : 'msg-fila'}>
                <div className="msg-burbuja">
                  {message.contenido && <p>{message.estado === 'eliminado' ? 'Mensaje eliminado' : message.contenido}</p>}
                  {(message.adjuntos || []).map((adjunto) => (
                    <a key={adjunto.id} href={adjunto.url} target="_blank" rel="noreferrer">
                      {adjunto.nombre_original || 'Adjunto'}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <form className="msg-composer" onSubmit={submit}>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" multiple hidden
              onChange={(event) => setAdjuntos(Array.from(event.target.files || []))} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={!activeId}>Adjuntar</button>
            <input type="text" value={texto} onChange={(event) => setTexto(event.target.value)} placeholder="Escribe un mensaje..." />
            <button type="submit" disabled={!activeId}>Enviar</button>
          </form>
        </section>
      </div>
    </div>
  )
}
