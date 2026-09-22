import { route, avatarUrl } from '../shared/presentation'

export default function Navbar({ auth = {}, onNavigate }) {
    const navigate = (event, path) => {
        if (onNavigate) {
            event.preventDefault()
            onNavigate(path)
        }
    }

    return (
        <header className="navbar">
            <div className="nav-left">
                <a className="logo" href={route('/home')} onClick={(event) => navigate(event, '/home')}>
                    <span className="logo-icon"><i className="fa-solid fa-shield-halved" /></span>
                    <span>AEGIS</span>
                </a>
                <nav className="nav-links">
                    <a href={route('/home')}>Inicio</a>
                    <a href={route('/productos')}>Productos</a>
                    <a href={route('/foro')}>Foro</a>
                    {auth.isAuthenticated && <a href={route('/productos/crear')}>Publicar</a>}
                    {auth.isAuthenticated && <a href={route('/puntos-fisicos')}>Puntos físicos</a>}
                </nav>
            </div>
            <div className="nav-right">
                {auth.isAuthenticated ? (
                    <div className="profile-dropdown">
                        <button type="button" className="profile-btn">
                            <img src={auth.user?.avatar || avatarUrl(auth.user)} alt="Usuario" />
                            <i className="fa-solid fa-chevron-down" />
                        </button>
                        <div className="dropdown-menu">
                            <a href={route('/perfil')}>Mi perfil</a>
                            {auth.isAdmin && <a href={route('/admin')}>Panel admin</a>}
                            <a href={route('/logout')} className="logout">Salir</a>
                        </div>
                    </div>
                ) : (
                    <>
                        <a href={route('/login')}>Iniciar sesión</a>
                        <a href={route('/register')}>Registro</a>
                    </>
                )}
            </div>
        </header>
    )
}