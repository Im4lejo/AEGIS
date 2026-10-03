import { useEffect, useRef, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { buscarProducto } from '../../productos/productosDemo'
import { CHATS } from '../mensajesDemo'
import '../css/mensajes.css'

const moverArriba = (chat) => {
  const posicion = CHATS.indexOf(chat)
  if (posicion > 0) {
    CHATS.splice(posicion, 1)
    CHATS.unshift(chat)
  }
}

export default function Mensajes({ id, auth, onNavigate }) {
  const chatExistente = CHATS.find((c) => String(c.productoId) === String(id))
  const productoNuevo = id && !chatExistente ? buscarProducto(id) : null

  let activoInicial = CHATS[0].productoId
  if (chatExistente) {
    activoInicial = chatExistente.productoId
  } else if (productoNuevo) {
    CHATS.unshift({
      productoId: productoNuevo.id,
      hora: 'Ahora',
      noLeidos: 0,
      mensajes: [],
    })
    activoInicial = productoNuevo.id
  }

  const [listaChats, setListaChats] = useState(CHATS.slice())
  const [activo, setActivo] = useState(activoInicial)
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const zonaMensajes = useRef(null)
  const archivoRef = useRef(null)

  const chat = listaChats.find((c) => c.productoId === activo) || listaChats[0]
  const producto = buscarProducto(chat.productoId) || {}
  const titulo = producto.nombre || producto.titulo || 'Producto'
  const vendedor = producto.vendedor ? producto.vendedor : { nombre: 'Vendedor' }

  const bajar = () => {
    if (zonaMensajes.current) {
      zonaMensajes.current.scrollTop = zonaMensajes.current.scrollHeight
    }
  }

  useEffect(() => {
    bajar()
  }, [listaChats, activo])

  const abrirChat = (productoId) => {
    setActivo(productoId)
    const chat = listaChats.find((c) => c.productoId === productoId)
    if (chat) {
      chat.noLeidos = 0
    }
    setListaChats(CHATS.slice())
  }

  const enviar = (event) => {
    event.preventDefault()
    const mensaje = texto.trim()
    if (!mensaje) return

    const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

    const chat = listaChats.find((c) => c.productoId === activo)
    if (chat) {
      chat.mensajes = chat.mensajes.concat({ id: chat.mensajes.length + 1, mio: true, texto: mensaje, hora })
      chat.hora = hora
      chat.noLeidos = 0
      moverArriba(chat)
      setListaChats(CHATS.slice())
    }
    setTexto('')
  }

  const adjuntar = (event) => {
    const archivo = event.target.files && event.target.files[0]
    if (!archivo) return

    const url = URL.createObjectURL(archivo)
    const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

    const chat = listaChats.find((c) => c.productoId === activo)
    if (chat) {
      chat.mensajes = chat.mensajes.concat({ id: chat.mensajes.length + 1, mio: true, texto: '', imagen: url, hora })
      chat.hora = hora
      chat.noLeidos = 0
      moverArriba(chat)
      setListaChats(CHATS.slice())
    }
    event.target.value = ''
  }

  const chatsVisibles = listaChats.filter((c) => {
    const p = buscarProducto(c.productoId) || {}
    const nombre = (p.nombre || p.titulo || '') + ' ' + (p.vendedor ? p.vendedor.nombre : '')
    return nombre.toLowerCase().indexOf(busqueda.toLowerCase()) !== -1
  })

  return (
    <div className="page-layout mensajes-layout">
      <Header title="AEGIS | Mensajes" auth={auth} onNavigate={onNavigate} />

      <div className="msg-pagina">
        <aside className="msg-lista">
          <div className="msg-lista-top">
            <h1 className="msg-titulo">Mensajes</h1>
          </div>

          <div className="msg-buscar">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="msg-conversaciones">
            {chatsVisibles.map((c) => {
              const p = buscarProducto(c.productoId) || {}
              const nombreProducto = p.nombre || p.titulo || 'Producto'
              const nombreVendedor = p.vendedor ? p.vendedor.nombre : 'Vendedor'
              const ultimo = c.mensajes.length > 0 ? c.mensajes[c.mensajes.length - 1].texto : ''
              return (
                <button
                  key={c.productoId}
                  type="button"
                  className={c.productoId === activo ? 'msg-item msg-item-activo' : 'msg-item'}
                  onClick={() => abrirChat(c.productoId)}
                >
                  <img className="msg-item-img" src={p.imagen} alt="" />
                  <span className="msg-item-info">
                    <span className="msg-item-fila">
                      <strong className="msg-item-nombre">{nombreProducto}</strong>
                      <span className="msg-item-hora">{c.hora}</span>
                    </span>
                    <span className="msg-item-vendedor">{nombreVendedor}</span>
                    <span className="msg-item-fila">
                      <span className="msg-item-preview">{ultimo}</span>
                      {c.noLeidos > 0 && <span className="msg-item-badge">{c.noLeidos}</span>}
                    </span>
                  </span>
                </button>
              )
            })}
            {chatsVisibles.length === 0 && (
              <p className="msg-vacio">No se encontraron conversaciones.</p>
            )}
          </div>
        </aside>

        <span className="msg-separador" />

        <section className="msg-chat">
          <div className="msg-producto">
            <img className="msg-producto-img" src={producto.imagen} alt={titulo} />
            <div className="msg-producto-info">
              <h2 className="msg-producto-nombre">{titulo}</h2>
              <p className="msg-producto-precio">
                {producto.precio ? '$' + producto.precio.toLocaleString('es-CO') : ''}
              </p>
              <p className="msg-producto-vendedor">
                Publicado por <strong>{vendedor.nombre}</strong>{' '}
                <i className="fa-solid fa-circle-check" />
              </p>
            </div>
            <div className="msg-producto-acciones">
              <button
                type="button"
                className="msg-btn-ver"
                onClick={() => onNavigate && onNavigate('/productos/detalle?id=' + activo)}
              >
                Ver producto
              </button>
              <button type="button" className="msg-btn-mas">Más opciones</button>
            </div>
          </div>

          <div className="msg-seguridad">
            <i className="fa-solid fa-shield-halved" />
            <span>Por tu seguridad, mantén todas las conversaciones y pagos dentro de AEGIS.</span>
          </div>

          <div className="msg-zona" ref={zonaMensajes}>
            {chat.mensajes.length > 0 && <span className="msg-hoy">Hoy</span>}

            {chat.mensajes.map((m) => (
              <div
                key={m.id}
                className={m.mio ? 'msg-fila msg-fila-mio' : 'msg-fila msg-fila-vendedor'}
              >
                {!m.mio && (
                  <span className="msg-avatar msg-avatar-vendedor">
                    <i className="fa-solid fa-shield-halved" />
                  </span>
                )}
                <div className={m.mio ? 'msg-burbuja msg-burbuja-mio' : 'msg-burbuja msg-burbuja-vendedor'}>
                  {m.imagen && <img className="msg-imagen" src={m.imagen} alt="Imagen enviada" onLoad={bajar} />}
                  {m.texto && <p className="msg-texto">{m.texto}</p>}
                  <span className="msg-hora-burbuja">
                    {m.hora}
                    {m.mio && <i className="fa-solid fa-check-double" />}
                  </span>
                </div>
                {m.mio && <span className="msg-avatar msg-avatar-mio">US</span>}
              </div>
            ))}

            <div className="msg-encuentro">
              <span className="msg-encuentro-icono">
                <i className="fa-solid fa-calendar-days" />
              </span>
              <div className="msg-encuentro-info">
                <h4>Configurar encuentro</h4>
                <p>Coordina fecha, hora y lugar para revisar el producto en persona.</p>
                <button
                  type="button"
                  className="msg-encuentro-btn"
                  onClick={() => onNavigate && onNavigate('/puntos-fisicos')}
                >
                  Configurar encuentro
                </button>
              </div>
            </div>
          </div>

          <form className="msg-input" onSubmit={enviar}>
            <input
              ref={archivoRef}
              type="file"
              accept="image/*"
              className="msg-archivo-oculto"
              onChange={adjuntar}
            />
            <button
              type="button"
              className="msg-clip"
              aria-label="Adjuntar"
              onClick={() => archivoRef.current && archivoRef.current.click()}
            >
              <i className="fa-solid fa-paperclip" />
            </button>
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            <button type="submit" className="msg-enviar" aria-label="Enviar">
              <i className="fa-solid fa-arrow-up" />
            </button>
          </form>
        </section>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}
