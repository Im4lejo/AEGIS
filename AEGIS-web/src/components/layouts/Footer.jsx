import { route } from '../shared/presentation'

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <div className="footer-logo"><span className="footer-logo-icon"><i className="fa-solid fa-shield-halved" /></span><span>AEGIS</span></div>
                    <p>Plataforma enfocada en la compra y venta segura de productos tecnológicos.</p>
                </div>
                <div className="footer-links">
                    <div className="footer-column"><h4>Navegación</h4><a href={route('/home')}>Inicio</a><a href={route('/productos')}>Productos</a><a href={route('/foro')}>Foro</a></div>
                    <div className="footer-column"><h4>Cuenta</h4><a href={route('/perfil')}>Mi perfil</a><a href={route('/login')}>Iniciar sesión</a><a href={route('/register')}>Registrarse</a></div>
                    <div className="footer-column"><h4>Seguridad</h4><a href="#">Puntos verificados</a><a href="#">Encuentros seguros</a><a href="#">Reportes</a></div>
                </div>
            </div>
            <div className="footer-bottom"><p>© 2026 AEGIS. Todos los derechos reservados.</p></div>
        </footer>
    )
}