import { navigateTo, route } from '../shared/presentation'

// Enlaces de navegación del encabezado principal.
export default function Navbar({ onNavigate }) {
    const go = (event, path) => {
        if (event) event.preventDefault()
        navigateTo(path, onNavigate)
    }

    return (
        <nav className="header-nav">
            <a href={route('/productos/crear')} onClick={(event) => go(event, '/productos/crear')}>Publicar Producto</a>
            <a href={route('/foro')} onClick={(event) => go(event, '/foro')}>Foro</a>
            <a href={route('/puntos-fisicos')} onClick={(event) => go(event, '/puntos-fisicos')}>Puntos Físicos</a>
        </nav>
    )
}
