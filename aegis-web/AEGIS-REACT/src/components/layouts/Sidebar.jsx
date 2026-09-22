import { route } from '../shared/presentation'

export default function Sidebar() {
    return (
        <aside className="sidebar-layout">
            <h3>Navegación</h3>
            <nav>
                <a href={route('/home')}>Inicio</a>
                <a href={route('/productos')}>Productos</a>
                <a href={route('/foro')}>Foro</a>
                <a href={route('/perfil')}>Perfil</a>
            </nav>
        </aside>
    )
}