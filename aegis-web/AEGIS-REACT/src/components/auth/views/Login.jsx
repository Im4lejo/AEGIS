import { useState } from 'react'
import { route } from '../../shared/presentation'
import { useAuth } from '../../../auth/useAuth'
import '../css/auth.css'

export default function Login({
  error,
  success,
  message,
  onNavigate,
  returnTo,
}) {
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorLocal, setErrorLocal] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const iniciarSesion = async (event) => {
    event.preventDefault()
    setErrorLocal('')
    setFieldErrors({})
    if (email.indexOf('@') === -1) {
      setErrorLocal('Ingresa un correo electrónico válido.')
      return
    }
    setLoading(true)
    try {
      await login({ email: email.trim(), password })
      const destination =
        typeof returnTo === 'string' &&
        returnTo.startsWith('/') &&
        !returnTo.startsWith('//')
          ? returnTo
          : '/home'
      if (onNavigate) onNavigate(destination)
    } catch (requestError) {
      setErrorLocal(requestError.message)
      setFieldErrors(requestError.errors || {})
    } finally {
      setLoading(false)
    }
  }

  const alerta = error || errorLocal

  return (
    <main className="auth-page login-page">
      <section className="left-panel">
        <div className="security-wrapper">
          <img src="/aegis-logo.png" alt="AEGIS" className="auth-logo-panel" />
          <h1>Acceso Seguro</h1>
          <p>
            Tu cuenta está protegida por encriptaciones y múltiples sistemas de
            seguridad y autenticación.
          </p>
          <div className="security-card">
            <h3>Indicadores de Seguridad</h3>
            {[
              '256-bit SSL encriptación',
              'Alertas de inicio de sesión',
              'Monitoreo en sesión activa',
            ].map((item) => (
              <div className="security-item" key={item}>
                <i className="fa-solid fa-check" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="right-panel">
        <div className="auth-mobile-brand">
          <img src="/aegis-logo.png" alt="AEGIS" className="auth-logo-panel" />
        </div>
        <div className="form-container">
          <a href={route('/home')} className="back-home">
            Back to Home
          </a>
          <h2>Bienvenido de nuevo</h2>
          {alerta && (
            <div className="auth-alert auth-alert--error" role="alert">
              {alerta}
            </div>
          )}
          {(success || message) && (
            <div className="auth-alert auth-alert--success" role="status">
              {success || message}
            </div>
          )}

          <form onSubmit={iniciarSesion}>
            <div className="input-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                placeholder="alex@gmail.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(fieldErrors.email)}
              />
              {fieldErrors.email?.[0] && (
                <span className="field-error">{fieldErrors.email[0]}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Contraseña"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.password)}
                />
                <button
                  type="button"
                  className="eye-icon"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {fieldErrors.password?.[0] && (
                <span className="field-error">{fieldErrors.password[0]}</span>
              )}
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="register-hint">
            <a href={route('/forgot-password')}>¿Olvidaste tu contraseña?</a>
          </p>
          <p className="register-hint">
            <a href={route('/verify-email')}>¿Necesitas verificar tu correo?</a>
          </p>
          <p className="register-hint">
            ¿No tienes cuenta? <a href={route('/register')}>Regístrate</a>
          </p>
        </div>
      </section>
    </main>
  )
}
