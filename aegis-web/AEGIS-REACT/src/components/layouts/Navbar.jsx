import { navigateTo, route } from '../shared/presentation'

// Enlaces de navegación del encabezado principal.
export default function Navbar({ onNavigate, isOpen = false, onClose }) {
    const go = (event, path) => {
        if (event) event.preventDefault()
        navigateTo(path, onNavigate)
        if (onClose) onClose()
    }

    return (
        <nav id="primary-navigation" className={`header-nav${isOpen ? ' is-open' : ''}`}>
            <a href={route('/productos/crear')} onClick={(event) => go(event, '/productos/crear')}>Publicar Producto</a>
            <a href={route('/foro')} onClick={(event) => go(event, '/foro')}>Foro</a>
            <a href={route('/puntos-fisicos')} onClick={(event) => go(event, '/puntos-fisicos')}>Puntos Físicos</a>
        </nav>
    )
}
