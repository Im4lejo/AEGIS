import { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import WorkspaceChrome from '../../layouts/WorkspaceChrome'
import Footer from '../../layouts/Footer'
import '../css/verificados.css'
import { meetingApi } from '../../../services/api'

function InfoLugar({ punto }) {
  const servicios = Array.isArray(punto.servicios) ? punto.servicios : []

  return (
    <div className="pv-info">
      <div className="pv-verificado">
        <i className="fa-solid fa-location-dot" aria-hidden="true" />
        <span>Punto de encuentro registrado</span>
      </div>
      <h2 className="pv-nombre">{punto.nombre}</h2>
      {punto.direccion && <p className="pv-dato">{punto.direccion}</p>}
      {punto.ciudad && <p className="pv-dato">{punto.ciudad}</p>}
      {punto.horario && <p className="pv-dato"><strong>Horario:</strong> {punto.horario}</p>}
      {servicios.map((servicio) => {
        const texto = typeof servicio === 'string' ? servicio : servicio.texto
        return (
          <p className="pv-servicio" key={texto}>
            <i className="fa-solid fa-circle-check" aria-hidden="true" />
            <span>{texto}</span>
          </p>
        )
      })}
      <p className="pv-aviso">Confirma la dirección y las condiciones del punto antes de desplazarte.</p>
    </div>
  )
}

export default function Index({ auth, onNavigate }) {
  const [selectedId, setSelectedId] = useState(null)
  const [points, setPoints] = useState([])
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    meetingApi.points({ ciudad: city, per_page: 50 })
      .then(({ data }) => {
        if (active) {
          setPoints(data)
          setSelectedId(null)
        }
      })
      .catch((requestError) => {
        if (active) {
          setPoints([])
          setError(requestError.message)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [city])

  const selected = points.find((point) => point.id === selectedId)

  return (
    <div className="page-layout verificados-layout">
      <Header title="AEGIS | Puntos Verificados" auth={auth} onNavigate={onNavigate} />
      <WorkspaceChrome auth={auth} onNavigate={onNavigate}>
        <main className="pv-contenido">
          <header className="pv-encabezado">
            <p>Puntos físicos disponibles</p>
            <h1>Puntos de encuentro</h1>
            <p>Consulta la información publicada. La ruta y distancia no están disponibles en este momento.</p>
          </header>
          <label className="pv-ciudad-filtro">
            Ciudad
            <input
              type="search"
              value={city}
              onChange={(event) => {
                const nextCity = event.target.value
                if (nextCity !== city) {
                  setLoading(true)
                  setError('')
                  setPoints([])
                  setSelectedId(null)
                  setCity(nextCity)
                }
              }}
            />
          </label>
          <div className="pv-fila">
            <section className="pv-lista" aria-label="Puntos de encuentro disponibles">
              {loading && <p role="status">Cargando puntos...</p>}
              {error && <p role="alert">{error}</p>}
              {!loading && !error && points.length === 0 && (
                <p role="status">No hay puntos registrados para esta búsqueda.</p>
              )}
              {points.map((point) => (
                <button
                  key={point.id}
                  type="button"
                  className={selectedId === point.id ? 'pv-lugar pv-lugar-activo' : 'pv-lugar'}
                  aria-pressed={selectedId === point.id}
                  onClick={() => setSelectedId(point.id)}
                >
                  <strong>{point.nombre}</strong>
                  {point.direccion && <span>{point.direccion}</span>}
                  {point.ciudad && <span>{point.ciudad}</span>}
                </button>
              ))}
            </section>
            {selected && (
              <aside className="pv-panel" aria-label={`Detalles de ${selected.nombre}`}>
                <button type="button" className="pv-cerrar" onClick={() => setSelectedId(null)} aria-label="Cerrar detalles">
                  <i className="fa-solid fa-xmark" aria-hidden="true" />
                </button>
                <InfoLugar punto={selected} />
              </aside>
            )}
            <div className="pv-mapa-placeholder" role="note">
              <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
              <strong>Mapa no disponible</strong>
              <span>No se muestran marcadores ni tiempos de ruta porque el servicio de mapas no está configurado.</span>
            </div>
          </div>
        </main>
      </WorkspaceChrome>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
