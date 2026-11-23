import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { route } from '../../shared/presentation'
import { authApi } from '../../../services/api'
import AuthFrame from '../components/AuthFrame'

export default function ResetPassword() {
  const [searchParams, setSearchParams] = useSearchParams()
  const emailFromLink = searchParams.get('email') || ''
  const [token] = useState(searchParams.get('token') || '')
  const [email, setEmail] = useState(emailFromLink)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!searchParams.has('token') && !searchParams.has('email')) return
    const sanitizedParams = new URLSearchParams(searchParams)
    sanitizedParams.delete('token')
    sanitizedParams.delete('email')
    setSearchParams(sanitizedParams, { replace: true })
  }, [searchParams, setSearchParams])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setFieldErrors({})
    setMessage('')
    setLoading(true)
    try {
      const response = await authApi.resetPassword({
        email: email.trim(),
        token,
        password,
        password_confirmation: confirmation,
      })
      setMessage(response.message)
    } catch (requestError) {
      setError(requestError.message)
      setFieldErrors(requestError.errors || {})
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame
      title="Elige una contraseña nueva"
      subtitle="Usa al menos 12 caracteres, mayúsculas, minúsculas y números."
    >
      {!token && (
        <div className="auth-alert auth-alert--error" role="alert">
          El enlace está incompleto. Solicita uno nuevo.
        </div>
      )}
      {error && (
        <div className="auth-alert auth-alert--error" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="auth-alert auth-alert--success" role="status">
          {message}
        </div>
      )}
      {!message && token && (
        <form className="auth-form" onSubmit={submit}>
          <div className="input-group">
            <label htmlFor="reset-email">Correo electrónico</label>
            <input
              autoComplete="email"
              id="reset-email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email?.[0] && (
              <span className="field-error">{fieldErrors.email[0]}</span>
            )}
          </div>
          <div className="input-group">
            <label htmlFor="reset-password">Nueva contraseña</label>
            <div className="password-wrapper">
              <input
                autoComplete="new-password"
                id="reset-password"
                minLength={12}
                onChange={(event) => setPassword(event.target.value)}
                required
                type={visible ? 'text' : 'password'}
                value={password}
                aria-invalid={Boolean(fieldErrors.password)}
              />
              <button
                aria-label={
                  visible ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
                className="eye-icon"
                onClick={() => setVisible((value) => !value)}
                type="button"
              >
                {visible ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {fieldErrors.password?.[0] && (
              <span className="field-error">{fieldErrors.password[0]}</span>
            )}
          </div>
          <div className="input-group">
            <label htmlFor="reset-confirmation">Confirma la contraseña</label>
            <input
              autoComplete="new-password"
              id="reset-confirmation"
              minLength={12}
              onChange={(event) => setConfirmation(event.target.value)}
              required
              type={visible ? 'text' : 'password'}
              value={confirmation}
              aria-invalid={Boolean(fieldErrors.password_confirmation)}
            />
            {fieldErrors.password_confirmation?.[0] && (
              <span className="field-error">
                {fieldErrors.password_confirmation[0]}
              </span>
            )}
          </div>
          <button className="login-btn" disabled={loading} type="submit">
            {loading ? 'Guardando…' : 'Restablecer contraseña'}
          </button>
        </form>
      )}
      {message && (
        <div className="auth-form-links">
          <a href={route('/login')}>Ir a iniciar sesión</a>
        </div>
      )}
    </AuthFrame>
  )
}
