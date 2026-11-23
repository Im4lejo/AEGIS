import { route } from '../../shared/presentation'
import '../css/auth.css'
import '../css/auth-account.css'

export default function AuthFrame({ title, subtitle, children }) {
  return (
    <main className="auth-page login-page auth-account-page">
      <section className="left-panel">
        <div className="security-wrapper">
          <img src="/aegis-logo.png" alt="AEGIS" className="auth-logo-panel" />
          <h1>Protege tu cuenta</h1>
          <p>
            Gestiona el acceso a tu cuenta AEGIS con controles claros y sesiones
            que puedes revocar.
          </p>
        </div>
      </section>
      <section className="right-panel">
        <div className="form-container">
          <a href={route('/home')} className="back-home">
            Volver a AEGIS
          </a>
          <h2>{title}</h2>
          {subtitle && <p className="subtitle">{subtitle}</p>}
          {children}
        </div>
      </section>
    </main>
  )
}
