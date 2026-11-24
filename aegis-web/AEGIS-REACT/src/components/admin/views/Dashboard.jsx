import { useEffect, useState } from 'react'
import PageFrame from '../../shared/PageFrame'
import { route } from '../../shared/presentation'
import { adminApi } from '../../../services/api'

export default function Dashboard({ auth, onNavigate }) {
  const [periodo, setPeriodo] = useState('30d')
  const [metrics, setMetrics] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    adminApi.dashboard(periodo, auth?.token)
      .then((response) => {
        if (active) setMetrics(response)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
    return () => { active = false }
  }, [periodo, auth?.token])

  const cards = metrics ? [
    ['Cuentas totales', metrics.data.cuentas_total],
    ['Cuentas nuevas', metrics.data.cuentas_nuevas],
    ['Posts', metrics.data.posts_total],
    ['Posts nuevos', metrics.data.posts_nuevos],
    ['Productos', metrics.data.productos_total],
    ['Productos nuevos', metrics.data.productos_nuevos],
    ['Comunidades', metrics.data.comunidades_total],
    ['Reportes pendientes', metrics.data.reportes_pendientes],
    ['Puntos físicos', metrics.data.puntos_total],
    ['Operaciones', metrics.data.operaciones_total],
  ] : []

  return (
    <PageFrame title="AEGIS | Panel Admin" auth={auth}>
      <main className="admin-page">
        <h1>Centro administrativo</h1>
        {error && <p role="alert">{error}</p>}
        <label>
          Periodo
          <select value={periodo} onChange={(event) => setPeriodo(event.target.value)}>
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
          </select>
        </label>
        {metrics && (
          <p role="status">
            Medición desde {new Date(metrics.desde).toLocaleString('es-CO')} hasta {new Date(metrics.hasta).toLocaleString('es-CO')}
          </p>
        )}
        <div className="admin-stats">
          {cards.map(([label, value]) => (
            <div className="admin-stat-card" key={label}>
              <strong>{label}</strong>
              <p>{value ?? 0}</p>
            </div>
          ))}
        </div>
        <nav className="admin-links" aria-label="Secciones administrativas">
          <a href={route('/admin/usuarios')} onClick={(event) => { event.preventDefault(); onNavigate?.('/admin/usuarios') }}>Usuarios</a>
          <a href={route('/admin/reportes')} onClick={(event) => { event.preventDefault(); onNavigate?.('/admin/reportes') }}>Reportes y moderación</a>
          <a href={route('/admin/auditoria')} onClick={(event) => { event.preventDefault(); onNavigate?.('/admin/auditoria') }}>Auditoría</a>
          <a href={route('/admin/configuracion')} onClick={(event) => { event.preventDefault(); onNavigate?.('/admin/configuracion') }}>Configuración</a>
        </nav>
      </main>
    </PageFrame>
  )
}