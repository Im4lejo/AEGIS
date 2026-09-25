import { Header } from '../home/views/Home'

/**
 * Plantilla base para páginas todavía no asignadas.
 * Banners y tarjetas de producto navegan aquí hasta que se
 * les asigne su página definitiva.
 */
export default function Plantilla({ origen = 'Página', auth, onNavigate }) {
  return (
    <div className="page-layout">
      <Header auth={auth} onNavigate={onNavigate} />

      <main className="plantilla-container">
        <div className="plantilla-card">
          <span className="plantilla-icon" role="img" aria-label="En construcción">🚧</span>
          <h1>Página en construcción</h1>
          <p>Estás viendo la <strong>plantilla base</strong> para:</p>
          <p className="plantilla-origen">«{origen}»</p>
          <p>Su página definitiva será asignada próximamente.</p>
          <button
            className="plantilla-back-btn"
            type="button"
            onClick={() => onNavigate && onNavigate('/')}
          >
            ← Volver al Inicio
          </button>
        </div>
      </main>
    </div>
  )
}