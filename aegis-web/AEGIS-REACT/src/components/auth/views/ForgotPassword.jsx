import { useState } from 'react'
import { route } from '../../shared/presentation'
import { authApi } from '../../../services/api'
import AuthFrame from '../components/AuthFrame'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setFieldError('')
    setMessage('')
    try {
      const response = await authApi.forgotPassword(email.trim())
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
      title="Recupera tu contraseña"
      subtitle="Te enviaremos instrucciones si existe una cuenta con ese correo."
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
      <form className="auth-form" onSubmit={submit}>
        <div className="input-group">
          <label htmlFor="recovery-email">Correo electrónico</label>
          <input
            autoComplete="email"
            id="recovery-email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
            aria-invalid={Boolean(fieldError)}
          />
          {fieldError && <span className="field-error">{fieldError}</span>}
        </div>
        <button className="login-btn" disabled={loading} type="submit">
          {loading ? 'Enviando…' : 'Enviar instrucciones'}
        </button>
      </form>
      <div className="auth-form-links">
        <a href={route('/login')}>Volver a iniciar sesión</a>
      </div>
    </AuthFrame>
  )
}
