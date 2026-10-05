import PageFrame from '../../shared/PageFrame'
import { route } from '../../shared/presentation'

export default function Dashboard({ stats = {}, auth }) {
    const cards = [['Usuarios', stats.usuarios], ['Productos activos', stats.productos], ['Reportes pendientes', stats.reportes], ['Encuentros pendientes', stats.encuentros]]
    return <PageFrame title="AEGIS | Panel Admin" auth={auth}><main className="admin-page"><h1>Panel Admin</h1><div className="admin-stats">{cards.map(([label, value]) => <div className="admin-stat-card" key={label}><strong>{label}</strong><p>{value || 0}</p></div>)}</div><nav className="admin-links"><a href={route('/admin/usuarios')}>Usuarios</a><a href={route('/admin/productos')}>Productos</a><a href={route('/admin/reportes')}>Reportes</a></nav></main></PageFrame>
}