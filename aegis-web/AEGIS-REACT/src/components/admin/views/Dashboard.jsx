import PageFrame from '../../shared/PageFrame'
import { route } from '../../shared/presentation'

export default function Dashboard({ stats = {}, auth }) {
    const cards = [['Usuarios', stats.usuarios], ['Productos activos', stats.productos], ['Reportes pendientes', stats.reportes], ['Encuentros pendientes', stats.encuentros]]
    return <PageFrame title="AEGIS | Panel Admin" auth={auth}><main style={{ maxWidth: 1100, margin: '30px auto', padding: '0 20px' }}><h1>Panel Admin</h1><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>{cards.map(([label, value]) => <div key={label} style={{ background: '#fff', borderRadius: 10, padding: 14 }}><strong>{label}</strong><p>{value || 0}</p></div>)}</div><nav style={{ marginTop: 14, display: 'flex', gap: 10 }}><a href={route('/admin/usuarios')}>Usuarios</a><a href={route('/admin/productos')}>Productos</a><a href={route('/admin/reportes')}>Reportes</a></nav></main></PageFrame>
}