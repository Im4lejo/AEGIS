import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../../auth/useAuth'
import { authApi } from '../../../services/api'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import './account-security.css'

function formatDate(value) {
  if (!value) return 'No disponible'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'No disponible' : date.toLocaleString()
}

export default function AccountSecurity({ auth, onNavigate }) {
  const { token, user, clearSession } = useAuth()
  const [sessions, setSessions] = useState([])
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({})
  const [passwordsVisible, setPasswordsVisible] = useState(false)
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const loadSecurityData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [sessionResponse, noticeResponse] = await Promise.all([
        authApi.sessions(token),
        authApi.securityNotices(token),
      ])
      setSessions(sessionResponse.data)
      setNotices(noticeResponse.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [sessionResponse, noticeResponse] = await Promise.all([
          authApi.sessions(token),
          authApi.securityNotices(token),
        ])
        if (active) {
          setSessions(sessionResponse.data)
          setNotices(noticeResponse.data)
        }
      } catch (requestError) {
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [token])

  const revokeSession = async (session) => {
    if (!window.confirm('¿Quieres revocar esta sesión?')) return
    setStatus('')
    setError('')
    try {
      await authApi.revokeSession(session.id, token)
      if (session.current) {
        clearSession()
        onNavigate('/login', {
          message: 'La sesión actual fue cerrada.',
        })
        return
      }
      setStatus('Sesión revocada.')
      await loadSecurityData()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const revokeAll = async () => {
    if (
      !window.confirm(
        'Se cerrarán todas las sesiones, incluida esta. ¿Continuar?',
      )
    )
      return
    setError('')
    try {
      await authApi.revokeAllSessions(token)
      clearSession()
      onNavigate('/login', {
        message: 'Todas las sesiones fueron cerradas.',
      })
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const resendVerification = async () => {
    setStatus('')
    setError('')
    try {
      const response = await authApi.resendAuthenticatedVerification(token)
      setStatus(response.message)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const changePassword = async (event) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordFieldErrors({})
    setError('')
    setPasswordBusy(true)
    try {
      const response = await authApi.changePassword(
        {
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmation,
        },
        token,
      )
      clearSession()
      onNavigate('/login', { message: response.message })
    } catch (requestError) {
      setPasswordError(requestError.message)
      setPasswordFieldErrors(requestError.errors || {})
    } finally {
      setPasswordBusy(false)
    }
  }

  return (
    <div className="page-layout">
      <Header title="Seguridad de cuenta" auth={auth} onNavigate={onNavigate} />
      <main className="account-security-page">
        <header className="account-security-heading">
          <div>
            <p className="account-security-eyebrow">Cuenta AEGIS</p>
            <h1>Seguridad y sesiones</h1>
            <p>
              Revisa la verificación, las sesiones activas y los avisos
              recientes.
            </p>
          </div>
        </header>

        {error && (
          <p className="account-security-error" role="alert">
            {error}
          </p>
        )}
        {status && (
          <p className="account-security-status" role="status">
            {status}
          </p>
        )}

        <section
          className="account-security-card"
          aria-labelledby="email-status-title"
        >
          <div>
            <h2 id="email-status-title">Correo electrónico</h2>
            <p>{user?.email}</p>
          </div>
          {user?.email_verified_at ? (
            <span className="account-security-badge">Verificado</span>
          ) : (
            <div className="account-security-actions">
              <span className="account-security-badge account-security-badge--pending">
                Pendiente
              </span>
              <button
                className="account-security-button"
                onClick={resendVerification}
                type="button"
              >
                Reenviar verificación
              </button>
            </div>
          )}
        </section>

        <section
          className="account-security-card"
          aria-labelledby="sessions-title"
        >
          <div className="account-security-section-heading">
            <div>
              <h2 id="sessions-title">Sesiones y tokens</h2>
              <p>
                Revoca el acceso de cualquier dispositivo que no reconozcas.
              </p>
            </div>
            <button
              className="account-security-button account-security-button--danger"
              disabled={loading || sessions.length === 0}
              onClick={revokeAll}
              type="button"
            >
              Cerrar todas
            </button>
          </div>

          {loading ? (
            <p aria-live="polite">Cargando sesiones…</p>
          ) : sessions.length === 0 ? (
            <p>No hay sesiones activas.</p>
          ) : (
            <ul className="account-session-list">
              {sessions.map((session) => (
                <li className="account-session" key={session.id}>
                  <div>
                    <strong>
                      {session.name === 'aegis-web'
                        ? 'Navegador web'
                        : session.name === 'aegis-movil'
                          ? 'Aplicación móvil'
                          : 'Otra sesión'}
                    </strong>
                    {session.current && (
                      <span className="account-session-current">
                        Esta sesión
                      </span>
                    )}
                    <span>Creada: {formatDate(session.created_at)}</span>
                    <span>Último uso: {formatDate(session.last_used_at)}</span>
                    {session.expires_at && (
                      <span>Expira: {formatDate(session.expires_at)}</span>
                    )}
                  </div>
                  <button
                    className="account-security-button"
                    onClick={() => revokeSession(session)}
                    type="button"
                  >
                    Revocar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          className="account-security-card"
          aria-labelledby="notices-title"
        >
          <h2 id="notices-title">Avisos de inicio de sesión</h2>
          {notices.length === 0 ? (
            <p>No hay avisos recientes.</p>
          ) : (
            <ul className="account-security-notices">
              {notices.map((notice) => (
                <li key={notice.id}>
                  <strong>{notice.title}</strong>
                  <p>{notice.message}</p>
                  <time dateTime={notice.created_at}>
                    {formatDate(notice.created_at)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          className="account-security-card"
          aria-labelledby="password-title"
        >
          <div>
            <h2 id="password-title">Cambiar contraseña</h2>
            <p>
              El cambio cerrará las demás sesiones y te pedirá iniciar sesión de
              nuevo.
            </p>
          </div>
          {passwordError && (
            <p className="account-security-error" role="alert">
              {passwordError}
            </p>
          )}
          <form className="account-password-form" onSubmit={changePassword}>
            <button
              aria-label={
                passwordsVisible ? 'Ocultar contraseñas' : 'Mostrar contraseñas'
              }
              className="account-password-toggle"
              onClick={() => setPasswordsVisible((visible) => !visible)}
              type="button"
            >
              {passwordsVisible ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
            </button>
            <label>
              Contraseña actual
              <input
                autoComplete="current-password"
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                type={passwordsVisible ? 'text' : 'password'}
                value={currentPassword}
              />
              {passwordFieldErrors.current_password?.[0] && (
                <span className="field-error">
                  {passwordFieldErrors.current_password[0]}
                </span>
              )}
            </label>
            <label>
              Nueva contraseña (12 caracteres, mayúsculas, minúsculas y números)
              <input
                autoComplete="new-password"
                minLength={12}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                type={passwordsVisible ? 'text' : 'password'}
                value={newPassword}
              />
              {passwordFieldErrors.password?.[0] && (
                <span className="field-error">
                  {passwordFieldErrors.password[0]}
                </span>
              )}
            </label>
            <label>
              Confirmar nueva contraseña
              <input
                autoComplete="new-password"
                minLength={12}
                onChange={(event) => setConfirmation(event.target.value)}
                required
                type={passwordsVisible ? 'text' : 'password'}
                value={confirmation}
              />
              {passwordFieldErrors.password_confirmation?.[0] && (
                <span className="field-error">
                  {passwordFieldErrors.password_confirmation[0]}
                </span>
              )}
            </label>
            <button
              className="account-security-button"
              disabled={passwordBusy}
              type="submit"
            >
              {passwordBusy ? 'Guardando…' : 'Cambiar contraseña'}
            </button>
          </form>
        </section>

        <p className="account-security-unavailable">
          MFA y passkeys todavía no están configurados. No se consideran
          habilitados para esta cuenta.
        </p>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
