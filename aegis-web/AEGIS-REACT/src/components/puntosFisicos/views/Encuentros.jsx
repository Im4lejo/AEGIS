import { useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { buscarProducto } from '../../productos/productosDemo'
import '../css/encuentros.css'

const PUNTOS = [
  'AEGIS Centro Comercial Titán',
  'Punto AEGIS Parque Caldas',
  'Punto AEGIS Los Almendros',
  'Punto AEGIS Centro Comercial',
]

const HORAS = ['02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM']

const SEGURIDAD = [
  { icono: 'fa-solid fa-location-dot', titulo: 'Puntos Verificados', texto: 'Todos los encuentros se realizan en lugares seguros.' },
  { icono: 'fa-solid fa-qrcode', titulo: 'QR Único', texto: 'Se generará un código QR para validar el encuentro.' },
  { icono: 'fa-solid fa-user-shield', titulo: 'Protección al Usuario', texto: 'Mantén toda la comunicación dentro de AEGIS.' },
]

export default function Encuentros({ id, auth, onNavigate }) {
  const producto = buscarProducto(id) || buscarProducto(1) || {}
  const titulo = producto.nombre || producto.titulo || 'Producto'
  const vendedor = producto.vendedor ? producto.vendedor : { nombre: 'Vendedor' }

  const [punto, setPunto] = useState(PUNTOS[0])
  const [fecha, setFecha] = useState('2025-05-24')
  const [hora, setHora] = useState('04:00 PM')
  const [notas, setNotas] = useState('')
  const [confirmado, setConfirmado] = useState(false)

  const partes = fecha.split('-')
  const fechaTexto = partes.length === 3 ? partes[2] + '/' + partes[1] + '/' + partes[0] : fecha

  const volver = () => {
    if (onNavigate) onNavigate('/mensajes?id=' + producto.id)
  }

  const confirmar = (event) => {
    event.preventDefault()
    setConfirmado(true)
  }

  return (
    <div className="page-layout">
      <Header title="AEGIS | Configurar Encuentro" auth={auth} onNavigate={onNavigate} />

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
              <img className="enc-producto-img" src={producto.imagen} alt={titulo} />
              <div className="enc-producto-info">
                <h2 className="enc-producto-nombre">{titulo}</h2>
                <p className="enc-producto-precio">
                  COP ${producto.precio ? producto.precio.toLocaleString('es-CO') : '0'}
                </p>
                <p className="enc-producto-vendedor">
                  Publicado por <strong>{vendedor.nombre}</strong>{' '}
                  <i className="fa-solid fa-circle-check" />
                </p>
              </div>
            </article>

            {confirmado ? (
              <div className="enc-exito">
                <i className="fa-solid fa-circle-check" />
                <h2>¡Encuentro confirmado!</h2>
                <p className="enc-exito-datos">{punto}</p>
                <p className="enc-exito-datos">{fechaTexto} · {hora}</p>
                <p className="enc-exito-nota">Se generará un código QR para validar el encuentro.</p>
                <button type="button" className="enc-btn-confirmar" onClick={volver}>
                  <i className="fa-solid fa-comments" />
                  Volver a mensajes
                </button>
              </div>
            ) : (
              <form className="enc-formulario" onSubmit={confirmar}>
                <label className="enc-campo">
                  <span>Selecciona Punto Verificado</span>
                  <span className="enc-select">
                    <i className="fa-solid fa-location-dot" />
                    <select value={punto} onChange={(e) => setPunto(e.target.value)}>
                      {PUNTOS.map((nombre) => (
                        <option key={nombre} value={nombre}>{nombre}</option>
                      ))}
                    </select>
                  </span>
                </label>

                <div className="enc-fila">
                  <label className="enc-campo">
                    <span>Fecha</span>
                    <input
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                    />
                  </label>

                  <label className="enc-campo">
                    <span>Hora</span>
                    <span className="enc-select">
                      <i className="fa-solid fa-clock" />
                      <select value={hora} onChange={(e) => setHora(e.target.value)}>
                        {HORAS.map((valor) => (
                          <option key={valor} value={valor}>{valor}</option>
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
                  <button type="submit" className="enc-btn-confirmar">
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

      <Footer onNavigate={onNavigate} />
    </div>
  )
}
