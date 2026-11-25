import Header from '../layouts/Header'
import WorkspaceChrome from '../layouts/WorkspaceChrome'
import Footer from '../layouts/Footer'
import { Button } from './ui'
import './ApiState.css'

export {
  AccessRestrictedState,
  EmptyState,
  ErrorState,
  FeedbackMessage,
  LoadingState,
} from './ui'

export function NotFoundPage({ auth, onNavigate }) {
  return (
    <div className="page-layout">
      <Header
        title="AEGIS | Página no encontrada"
        auth={auth}
        onNavigate={onNavigate}
      />
      <WorkspaceChrome auth={auth} onNavigate={onNavigate}>
      <main className="not-found-page">
        <span className="not-found-page__code">404</span>
        <h1>No encontramos esta página</h1>
        <p>Es posible que el enlace haya cambiado o ya no esté disponible.</p>
        <Button onClick={() => onNavigate?.('/')}>Volver al inicio</Button>
      </main>
      </WorkspaceChrome>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
