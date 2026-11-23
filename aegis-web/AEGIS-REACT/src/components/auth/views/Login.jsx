import { useState } from 'react'
import { route } from '../../shared/presentation'
import { useAuth } from '../../../auth/useAuth'
import '../css/auth.css'

export default function Login({ error, success, message, onNavigate }) {
    const { login } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorLocal, setErrorLocal] = useState('')

    const iniciarSesion = async (event) => {
        event.preventDefault()
        if (email.indexOf('@') === -1) {
            setErrorLocal('Ingresa un correo electrónico válido.')
            return
        }
        if (password.length < 8) {
            setErrorLocal('La contraseña debe tener al menos 8 caracteres.')
            return
        }
        try {
            await login({ email, password })
            setErrorLocal('')
            if (onNavigate) onNavigate('/home')
        } catch (requestError) {
            setErrorLocal(requestError.message)
        }
    }

    const alerta = error || errorLocal

    return (
        <main className="auth-page login-page">
            <section className="left-panel">
                <div className="security-wrapper">
                    <img src="/aegis-logo.png" alt="AEGIS" className="auth-logo-panel" />
                    <h1>Acceso Seguro</h1>
                    <p>Tu cuenta está protegida por encriptaciones y múltiples sistemas de seguridad y autenticación.</p>
                    <div className="security-card">
                        <h3>Indicadores de Seguridad</h3>
                        {['256-bit SSL encriptación', 'Alertas de inicio de sesión', 'Monitoreo en sesión activa'].map((item) => (
                            <div className="security-item" key={item}>
                                <i className="fa-solid fa-check" />
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
                    <a href={route('/home')} className="back-home">Back to Home</a>
                    <h2>Bienvenido de nuevo</h2>
                    {alerta && <div className="auth-alert auth-alert--error">{alerta}</div>}
                    {(success || message) && <div className="auth-alert auth-alert--success">{success || message}</div>}

                    <form onSubmit={iniciarSesion}>
                        <div className="input-group">
                            <label htmlFor="email">Correo electrónico</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="alex@gmail.com"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Contraseña</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    placeholder="Contraseña"
                                    required
                                    minLength="8"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                />
                                <button
                                    type="button"
                                    className="eye-icon"
                                    onClick={() => setShowPassword((value) => !value)}
                                    aria-label="Mostrar contraseña"
                                >
                                    <i className={showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'} />
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="login-btn">
                            <i className="fa-solid fa-lock" /> Iniciar Sesión
                        </button>
                    </form>

                    <p className="register-hint">¿No tienes cuenta? <a href={route('/register')}>Regístrate</a></p>
                </div>
            </section>
        </main>
    )
}
