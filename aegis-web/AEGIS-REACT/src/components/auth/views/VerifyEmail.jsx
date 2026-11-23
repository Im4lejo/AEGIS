import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { route } from '../../shared/presentation'
import { useAuth } from '../../../auth/useAuth'
import { authApi } from '../../../services/api'
import AuthFrame from '../components/AuthFrame'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const { token } = useAuth()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [loading, setLoading] = useState(false)

  const resend = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setFieldError('')
    setMessage('')
    try {
      const response = token
        ? await authApi.resendAuthenticatedVerification(token)
        : await authApi.resendVerification(email.trim())
      setMessage(response.message)
    } catch (requestError) {
      setError(requestError.message)
      setFieldError(requestError.errors?.email?.[0] || '')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame
      title="Verifica tu correo"
      subtitle="La verificación permite proteger las acciones de tu cuenta."
    >
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
      <form className="auth-form" onSubmit={resend}>
        {!token && (
          <div className="input-group">
            <label htmlFor="verify-email-address">Correo electrónico</label>
            <input
              autoComplete="email"
              id="verify-email-address"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
              aria-invalid={Boolean(fieldError)}
            />
            {fieldError && <span className="field-error">{fieldError}</span>}
          </div>
        )}
        <button className="login-btn" disabled={loading} type="submit">
          {loading ? 'Enviando…' : 'Enviar enlace de verificación'}
        </button>
      </form>
      <div className="auth-form-links">
        <a href={route('/login')}>Volver a iniciar sesión</a>
      </div>
    </AuthFrame>
  )
}
