import { navigateTo } from '../shared/presentation'

const IconSearch = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)

const IconHome = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
)

const IconTrend = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
)

const TEMAS = ['Celulares', 'Computadores', 'Televisores', 'Más']

export default function Sidebar({ busqueda, setBusqueda, orden, setOrden, temaActivo, setTemaActivo, onNavigate }) {
    const irPlantilla = (origen) => navigateTo(`/plantilla?origen=${origen}`, onNavigate)

    return (
        <aside className="foro-sidebar">
            <div className="foro-search">
                <input
                    type="text"
                    placeholder="Buscar Conversación"
                    value={busqueda}
                    onChange={(event) => setBusqueda(event.target.value)}
                />
                <span className="foro-search-icon"><IconSearch /></span>
            </div>

            <nav className="foro-side-nav">
                <button
                    type="button"
                    className={`foro-side-link ${!busqueda ? 'active' : ''}`}
                    onClick={() => setBusqueda('')}
                >
                    <IconHome /> Principal
                </button>
                <button
                    type="button"
                    className={`foro-side-link ${orden === 'populares' ? 'active' : ''}`}
                    onClick={() => setOrden('populares')}
                >
                    <IconTrend /> Popular
                </button>
            </nav>

            <hr className="foro-side-divider" />

            <div className="foro-side-section-title">Temas</div>
            <div className="foro-side-nav">
                {TEMAS.map((tema) => (
                    <button
                        key={tema}
                        type="button"
                        className={`foro-topic-link ${temaActivo === tema ? 'active' : ''}`}
                        onClick={() => setTemaActivo(temaActivo === tema ? null : tema)}
                    >
                        {tema}
                    </button>
                ))}
            </div>

            <hr className="foro-side-divider" />

            <div className="foro-side-nav">
                <button type="button" className="foro-info-link" onClick={() => irPlantilla('reglas-del-foro')}>
                    Reglas del foro
                </button>
                <button type="button" className="foro-info-link" onClick={() => irPlantilla('politica-privacidad')}>
                    Política Privacidad
                </button>
                <button type="button" className="foro-info-link" onClick={() => irPlantilla('terminos-y-condiciones')}>
                    Terminos y Condiciones
                </button>
                <button type="button" className="foro-info-link" onClick={() => irPlantilla('ayuda')}>
                    Ayuda
                </button>
            </div>
        </aside>
    )
}
