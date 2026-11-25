import { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import WorkspaceChrome from '../../layouts/WorkspaceChrome'
import Footer from '../../layouts/Footer'
import { meetingApi, productApi } from '../../../services/api'
import '../css/encuentros.css'

const HORAS = [
  { valor: '14:00', etiqueta: '02:00 PM' },
  { valor: '15:00', etiqueta: '03:00 PM' },
  { valor: '16:00', etiqueta: '04:00 PM' },
  { valor: '17:00', etiqueta: '05:00 PM' },
  { valor: '18:00', etiqueta: '06:00 PM' },
]

const SEGURIDAD = [
  { icono: 'fa-solid fa-location-dot', titulo: 'Puntos disponibles', texto: 'Selecciona un punto publicado y confirma sus datos antes de desplazarte.' },
  { icono: 'fa-solid fa-qrcode', titulo: 'Validación QR', texto: 'La generación y validación de códigos QR no está disponible en este flujo.' },
  { icono: 'fa-solid fa-user-shield', titulo: 'Protección al Usuario', texto: 'Mantén toda la comunicación dentro de AEGIS.' },
]

function fechaLocalActual() {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
}

export default function Encuentros({ id, auth, onNavigate }) {
  const [producto, setProducto] = useState(null)
  const [cargandoProducto, setCargandoProducto] = useState(true)
  const [errorProducto, setErrorProducto] = useState('')
  const titulo = producto?.nombre || producto?.titulo || 'Producto'
  const vendedor = producto?.vendedor || { nombre: 'Vendedor' }

  const [punto, setPunto] = useState('')
  const [fecha, setFecha] = useState(fechaLocalActual)
  const [hora, setHora] = useState('16:00')
  const [notas, setNotas] = useState('')
  const [confirmado, setConfirmado] = useState(false)
  const [puntosReales, setPuntosReales] = useState([])
  const [puntosCargando, setPuntosCargando] = useState(true)
  const [errorEncuentro, setErrorEncuentro] = useState('')

  useEffect(() => {
    let active = true
    productApi.show(id)
      .then(({ data }) => {
        if (!active) return
        setProducto({
          ...data,
          nombre: data.titulo,
          imagen: data.imagen_principal || data.imagenes?.[0]?.imagen || '',
          vendedor: data.vendedor
            ? { ...data.vendedor, nombre: `${data.vendedor.nombre} ${data.vendedor.apellido || ''}`.trim() }
            : null,
        })
      })
      .catch((requestError) => {
        if (active) setErrorProducto(requestError.message)
      })
      .finally(() => {
        if (active) setCargandoProducto(false)
      })
    return () => { active = false }
  }, [id])

  useEffect(() => {
    let active = true
    meetingApi.points({ per_page: 50 })
      .then(({ data }) => {
        if (active) {
          setPuntosReales(data)
          setPunto(data[0]?.id || '')
        }
      })
      .catch((error) => {
        if (active) setErrorEncuentro(error.message)
      })
      .finally(() => {
        if (active) setPuntosCargando(false)
      })
    return () => { active = false }
  }, [])

  const partes = fecha.split('-')
  const fechaTexto = partes.length === 3 ? partes[2] + '/' + partes[1] + '/' + partes[0] : fecha
  const horaTexto = HORAS.find((opcion) => opcion.valor === hora)?.etiqueta || hora

  const volver = () => {
    if (onNavigate) onNavigate('/mensajes?id=' + (producto?.id || id))
  }

  const confirmar = async (event) => {
    event.preventDefault()
    if (!auth?.token) {
      setErrorEncuentro('Inicia sesión para confirmar el encuentro.')
      return
    }
    if (!producto) {
      setErrorEncuentro('No se pudo cargar el producto del encuentro.')
      return
    }
    const selected = puntosReales.find((item) => String(item.id) === String(punto))
    if (!selected) {
      setErrorEncuentro('No hay puntos aprobados disponibles.')
      return
    }
    try {
      await meetingApi.create({
        producto_id: producto.id,
        punto_fisico_id: selected.id,
        fecha_encuentro: fecha,
        hora_encuentro: hora,
        notas,
      }, auth.token)
      setConfirmado(true)
    } catch (error) {
      setErrorEncuentro(error.message)
    }
  }

  return (
    <div className="page-layout">
      <Header title="AEGIS | Configurar Encuentro" auth={auth} onNavigate={onNavigate} />
      <WorkspaceChrome auth={auth} onNavigate={onNavigate}>

      <main className="enc-pagina">
        <button type="button" className="enc-volver" onClick={volver}>
          <i className="fa-solid fa-arrow-left" />
          <span>Volver a mensajes</span>
        </button>

        <div className="enc-cabecera">
          <span className="enc-cabecera-icono">
            <i className="fa-solid fa-calendar-days" />
          </span>
          <div>
            <h1 className="enc-titulo">Configurar Encuentro</h1>
            <p className="enc-subtitulo">Coordina un lugar seguro para revisar el producto.</p>
          </div>
        </div>

        <div className="enc-columnas">
          <section className="enc-panel">
            <article className="enc-producto">
              {producto?.imagen && <img className="enc-producto-img" src={producto.imagen} alt="" />}
              <div className="enc-producto-info">
                <h2 className="enc-producto-nombre">{titulo}</h2>
                {producto?.precio != null && <p className="enc-producto-precio">COP {Number(producto.precio).toLocaleString('es-CO')}</p>}
                <p className="enc-producto-vendedor">
                  Publicado por <strong>{vendedor.nombre}</strong>
                </p>
              </div>
            </article>

            {confirmado ? (
              <div className="enc-exito">
                <i className="fa-solid fa-circle-check" />
                <h2>¡Encuentro confirmado!</h2>
                <p className="enc-exito-datos">{puntosReales.find((item) => String(item.id) === String(punto))?.nombre}</p>
                <p className="enc-exito-datos">{fechaTexto} · {horaTexto}</p>
                <p className="enc-exito-nota">El encuentro quedó registrado. La validación QR no está disponible en este flujo.</p>
                <button type="button" className="enc-btn-confirmar" onClick={volver}>
                  <i className="fa-solid fa-comments" />
                  Volver a mensajes
                </button>
              </div>
            ) : (
              <form className="enc-formulario" onSubmit={confirmar}>
                {cargandoProducto && <p role="status">Cargando producto...</p>}
                {errorProducto && <p role="alert">{errorProducto}</p>}
                {errorEncuentro && <p role="alert">{errorEncuentro}</p>}
                <label className="enc-campo">
                  <span>Selecciona punto de encuentro</span>
                  <span className="enc-select">
                    <i className="fa-solid fa-location-dot" />
                    <select value={punto} onChange={(e) => setPunto(e.target.value)} disabled={puntosReales.length === 0}>
                      {puntosReales.length === 0 && <option value="">{puntosCargando ? 'Cargando puntos...' : 'No hay puntos disponibles'}</option>}
                      {puntosReales.map((item) => (
                        <option key={item.id} value={item.id}>{item.nombre}</option>
                      ))}
                    </select>
                  </span>
                </label>
                {puntosCargando && <p role="status">Cargando puntos disponibles...</p>}
                {!puntosCargando && puntosReales.length === 0 && !errorEncuentro && (
                  <p role="status">No se puede confirmar un encuentro hasta que haya puntos registrados disponibles.</p>
                )}

                <div className="enc-fila">
                  <label className="enc-campo">
                    <span>Fecha</span>
                    <input
                      type="date"
                      value={fecha}
                      min={fechaLocalActual()}
                      onChange={(e) => setFecha(e.target.value)}
                    />
                  </label>

                  <label className="enc-campo">
                    <span>Hora</span>
                    <span className="enc-select">
                      <i className="fa-solid fa-clock" />
                      <select value={hora} onChange={(e) => setHora(e.target.value)}>
                        {HORAS.map((opcion) => (
                          <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
                        ))}
                      </select>
                    </span>
                  </label>
                </div>

                <label className="enc-campo">
                  <span>Notas adicionales</span>
                  <textarea
                    rows="4"
                    placeholder="Detalles importantes para el encuentro..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                  />
                </label>

                <div className="enc-acciones">
                  <button type="button" className="enc-btn-cancelar" onClick={volver}>
                    Cancelar
                  </button>
                  <button type="submit" className="enc-btn-confirmar" disabled={!producto || cargandoProducto || !!errorProducto || puntosCargando || !punto}>
                    <i className="fa-solid fa-calendar-days" />
                    Confirmar Encuentro
                  </button>
                </div>
              </form>
            )}
          </section>

          <aside className="enc-seguridad">
            <div className="enc-seguridad-titulo">
              <span><i className="fa-solid fa-shield-halved" /></span>
              <h3>Seguridad AEGIS</h3>
            </div>

            <div className="enc-seguridad-lista">
              {SEGURIDAD.map((item) => (
                <div className="enc-seguridad-item" key={item.titulo}>
                  <span className="enc-seguridad-icono">
                    <i className={item.icono} />
                  </span>
                  <div>
                    <h4>{item.titulo}</h4>
                    <p>{item.texto}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="enc-seguridad-nota">
              Tu seguridad es nuestra prioridad. AEGIS está contigo en cada paso.
            </p>
          </aside>
        </div>
      </main>

      </WorkspaceChrome>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
