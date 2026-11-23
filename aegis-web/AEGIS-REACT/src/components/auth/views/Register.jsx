import { useState } from 'react'
import { route } from '../../shared/presentation'
import { useAuth } from '../../../auth/useAuth'
import '../css/auth.css'

export default function Register({ error, success, message, onNavigate }) {
  const { register } = useAuth()
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [errorLocal, setErrorLocal] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [passwordsVisible, setPasswordsVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const crearCuenta = async (event) => {
    event.preventDefault()
    setErrorLocal('')
    setFieldErrors({})
    if (nombre.trim() === '') {
      setErrorLocal('Ingresa tu nombre.')
      return
    }
    if (apellido.trim() === '') {
      setErrorLocal('Ingresa tu apellido.')
      return
    }
    if (email.indexOf('@') === -1) {
      setErrorLocal('Ingresa un correo electrónico válido.')
      return
    }
    if (
      password.length < 12 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setErrorLocal(
        'Usa 12 caracteres como mínimo, con mayúsculas, minúsculas y números.',
      )
      return
    }
    if (password !== confirmar) {
      setErrorLocal('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      await register({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        username: username.trim() || undefined,
        email: email.trim().toLowerCase(),
        password,
        password_confirmation: confirmar,
      })
      if (onNavigate) {
        onNavigate('/verify-email')
      }
    } catch (requestError) {
      setErrorLocal(requestError.message)
      setFieldErrors(requestError.errors || {})
    } finally {
      setLoading(false)
    }
  }

  const alerta = error || errorLocal

  return (
    <main className="auth-page register-page">
      <section className="left-panel">
        <div className="logo">
          <img src="/aegis-logo.png" alt="" className="auth-logo-panel" />
          <span>AEGIS</span>
        </div>
        <div className="left-content">
          <h1>Únete al mercado de tecnología segura</h1>
          <p>
            Compra y vende productos tecnológicos con total confianza,
            respaldados por validación digital y puntos de encuentro físicos.
          </p>
          <div className="features">
            {[
              'Verificación de Identidad AEGIS',
              'Transacciones protegidas con código QR',
              'Centros de reuniones certificados',
              'Protección total contra fraude',
            ].map((item) => (
              <div className="feature-item" key={item}>
                <span className="check-icon">
                  <i className="fa-solid fa-check" />
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="right-panel">
        <div className="auth-mobile-brand" aria-label="AEGIS">
          <img src="/aegis-logo.png" alt="" className="auth-logo-panel" />
        </div>
        <div className="form-container">
          <div className="steps">
            <a
              href={route('/login')}
              className="back-arrow"
              aria-label="Volver al inicio de sesión"
            >
              ←
            </a>
            <div className="step active">1</div>
            <div className="line" />
            <div className="step">2</div>
          </div>
          <h2>Crea Tu Cuenta</h2>
          <p className="subtitle">Ingresa tus datos y rellena para empezar.</p>
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

          <form onSubmit={crearCuenta}>
            <div className="input-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                required
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="apellido">Apellido</label>
              <input
                id="apellido"
                name="apellido"
                required
                value={apellido}
                onChange={(event) => setApellido(event.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="username">Nombre de usuario (opcional)</label>
              <input
                id="username"
                name="username"
                maxLength="50"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                aria-invalid={Boolean(fieldErrors.username)}
              />
              {fieldErrors.username?.[0] && (
                <span className="field-error">{fieldErrors.username[0]}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
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
              <input
                type={passwordsVisible ? 'text' : 'password'}
                id="password"
                name="password"
                autoComplete="new-password"
                required
                minLength="12"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(fieldErrors.password)}
              />
              {fieldErrors.password?.[0] && (
                <span className="field-error">{fieldErrors.password[0]}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="password_confirm">Confirma la Contraseña</label>
              <input
                type={passwordsVisible ? 'text' : 'password'}
                id="password_confirm"
                name="password_confirm"
                autoComplete="new-password"
                required
                minLength="12"
                value={confirmar}
                onChange={(event) => setConfirmar(event.target.value)}
                aria-invalid={Boolean(fieldErrors.password_confirmation)}
              />
              {fieldErrors.password_confirmation?.[0] && (
                <span className="field-error">
                  {fieldErrors.password_confirmation[0]}
                </span>
              )}
            </div>

            <button
              type="button"
              className="password-visibility-toggle"
              onClick={() => setPasswordsVisible((visible) => !visible)}
            >
              {passwordsVisible ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
            </button>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
