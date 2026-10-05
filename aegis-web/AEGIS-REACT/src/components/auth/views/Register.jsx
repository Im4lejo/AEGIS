import { useState } from 'react'
import { route } from '../../shared/presentation'
import '../css/auth.css'

export default function Register({ error, success, onNavigate }) {
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmar, setConfirmar] = useState('')
    const [errorLocal, setErrorLocal] = useState('')

    const crearCuenta = (event) => {
        event.preventDefault()
        if (nombre.trim() === '') {
            setErrorLocal('Ingresa tu nombre completo.')
            return
        }
        if (email.indexOf('@') === -1) {
            setErrorLocal('Ingresa un correo electrónico válido.')
            return
        }
        if (password.length < 6) {
            setErrorLocal('La contraseña debe tener al menos 6 caracteres.')
            return
        }
        if (password !== confirmar) {
            setErrorLocal('Las contraseñas no coinciden.')
            return
        }
        const usuarios = JSON.parse(localStorage.getItem('usuariosAegis') || '[]')
        usuarios.push({ nombre: nombre, email: email, password: password })
        localStorage.setItem('usuariosAegis', JSON.stringify(usuarios))
        localStorage.setItem('sesionAegis', JSON.stringify({ email: email, nombre: nombre }))
        setErrorLocal('')
        if (onNavigate) onNavigate('/home')
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
                    <p>Compra y vende productos tecnológicos con total confianza, respaldados por validación digital y puntos de encuentro físicos.</p>
                    <div className="features">
                        {['Verificación de Identidad AEGIS', 'Transacciones protegidas con código QR', 'Centros de reuniones certificados', 'Protección total contra fraude'].map((item) => (
                            <div className="feature-item" key={item}>
                                <span className="check-icon"><i className="fa-solid fa-check" /></span>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="right-panel">
                <div className="form-container">
                    <div className="steps">
                        <a href={route('/login')} className="back-arrow" aria-label="Volver al inicio de sesión">←</a>
                        <div className="step active">1</div>
                        <div className="line" />
                        <div className="step">2</div>
                    </div>
                    <h2>Crea Tu Cuenta</h2>
                    <p className="subtitle">Ingresa tus datos y rellena para empezar.</p>
                    {alerta && <div className="auth-alert auth-alert--error">{alerta}</div>}
                    {success && <div className="auth-alert auth-alert--success">{success}</div>}

                    <form onSubmit={crearCuenta}>
                        <div className="input-group">
                            <label htmlFor="nombre">Nombre Completo</label>
                            <input
                                id="nombre"
                                name="nombre"
                                required
                                value={nombre}
                                onChange={(event) => setNombre(event.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="email">Correo electrónico</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                minLength="6"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password_confirm">Confirma la Contraseña</label>
                            <input
                                type="password"
                                id="password_confirm"
                                name="password_confirm"
                                required
                                minLength="6"
                                value={confirmar}
                                onChange={(event) => setConfirmar(event.target.value)}
                            />
                        </div>

                        <button type="submit" className="login-btn"><i className="fa-solid fa-lock" /> Crear cuenta</button>
                    </form>
                </div>
            </section>
        </main>
    )
}
