import { useEffect, useState } from 'react'
import PageFrame from '../../shared/PageFrame'
import { route } from '../../shared/presentation'
import { adminApi } from '../../../services/api'

const ICONS = {
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5.5a3 3 0 0 1 0 5.8M18 14a5 5 0 0 1 3 4.6" /></>,
  posts: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 12h6M9 16h6" /></>,
  products: <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="M4 7v10l8 4 8-4V7M12 11v10" /></>,
  communities: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5.5a3 3 0 0 1 0 5.8M18 14a5 5 0 0 1 3 4.6" /></>,
  reports: <><path d="M12 3 2.8 20h18.4L12 3Z" /><path d="M12 9v4M12 17h.01" /></>,
  points: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  operations: <><path d="M7 7h13l-3-3M17 17H4l3 3" /><path d="M20 7a8 8 0 0 1-2 5M4 17a8 8 0 0 1 2-5" /></>,
  audit: <><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.7-1.4-2.4L7.1 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2Z" /></>,
}

function AdminIcon({ name }) {
  return (
    <svg
      aria-hidden="true"
      className="admin-icon"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {ICONS[name]}
    </svg>
  )
}

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
    { label: 'Cuentas totales', value: metrics.data.cuentas_total, icon: 'users' },
    { label: 'Cuentas nuevas', value: metrics.data.cuentas_nuevas, icon: 'users' },
    { label: 'Posts', value: metrics.data.posts_total, icon: 'posts' },
    { label: 'Posts nuevos', value: metrics.data.posts_nuevos, icon: 'posts' },
    { label: 'Productos', value: metrics.data.productos_total, icon: 'products' },
    { label: 'Productos nuevos', value: metrics.data.productos_nuevos, icon: 'products' },
    { label: 'Comunidades', value: metrics.data.comunidades_total, icon: 'communities' },
    { label: 'Reportes pendientes', value: metrics.data.reportes_pendientes, icon: 'reports' },
    { label: 'Puntos físicos', value: metrics.data.puntos_total, icon: 'points' },
    { label: 'Operaciones', value: metrics.data.operaciones_total, icon: 'operations' },
  ] : []
  const links = [
    { href: '/admin/usuarios', label: 'Usuarios', icon: 'users' },
    { href: '/admin/reportes', label: 'Reportes y moderación', icon: 'reports' },
    { href: '/admin/auditoria', label: 'Auditoría', icon: 'audit' },
    { href: '/admin/configuracion', label: 'Configuración', icon: 'settings' },
  ]

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
          {cards.map(({ label, value, icon }) => (
            <div className="admin-stat-card" key={label}>
              <span className="admin-stat-card__icon"><AdminIcon name={icon} /></span>
              <div className="admin-stat-card__content">
                <strong>{label}</strong>
                <p>{value ?? 0}</p>
              </div>
            </div>
          ))}
        </div>
        <nav className="admin-links" aria-label="Secciones administrativas">
          {links.map(({ href, label, icon }) => (
            <a
              href={route(href)}
              key={href}
              onClick={(event) => { event.preventDefault(); onNavigate?.(href) }}
            >
              <AdminIcon name={icon} />
              <span>{label}</span>
            </a>
          ))}
        </nav>
      </main>
    </PageFrame>
  )
}