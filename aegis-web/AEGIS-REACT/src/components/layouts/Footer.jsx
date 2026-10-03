import { navigateTo, route } from '../shared/presentation'

export default function Footer({ onNavigate }) {
    const go = (event, path) => {
        if (event) event.preventDefault()
        navigateTo(path, onNavigate)
    }

    return (
        <footer className="main-footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <img src="/favicon.svg" alt="AEGIS" className="logo-img" />
                        <span className="logo-text">AEGIS</span>
                    </div>
                    <p className="footer-description">
                        Tu plataforma de confianza para comprar, vender y gestionar productos de tecnología y componentes.
                    </p>
                </div>

                <div className="footer-links-group">
                    <div className="footer-column">
                        <h4>Navegación</h4>
                        <ul>
                            <li><a href={route('/puntos-fisicos')} onClick={(e) => go(e, '/puntos-fisicos')}>Puntos Verificados</a></li>
                            <li><a href={route('/foro')} onClick={(e) => go(e, '/foro')}>Foro</a></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Soporte</h4>
                        <ul>
                            <li><a href={route('/plantilla?origen=centro-ayuda')} onClick={(e) => go(e, '/plantilla?origen=centro-ayuda')}>Centro de Ayuda</a></li>
                            <li><a href={route('/plantilla?origen=preguntas-frecuentes')} onClick={(e) => go(e, '/plantilla?origen=preguntas-frecuentes')}>Preguntas Frecuentes</a></li>
                            <li><a href={route('/plantilla?origen=terminos-y-condiciones')} onClick={(e) => go(e, '/plantilla?origen=terminos-y-condiciones')}>Términos y Condiciones</a></li>
                            <li><a href={route('/plantilla?origen=politica-privacidad')} onClick={(e) => go(e, '/plantilla?origen=politica-privacidad')}>Políticas de Privacidad</a></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Contacto</h4>
                        <p>Email: soporte@aegis.com</p>
                        <p>Tel: +57 (602) 800-0000</p>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} AEGIS. Todos los derechos reservados.</p>
            </div>
        </footer>
    )
}
