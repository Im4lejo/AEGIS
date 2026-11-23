import { route } from '../../shared/presentation'
import AuthFrame from '../components/AuthFrame'

export default function EmailVerified() {
  return (
    <AuthFrame
      title="Correo verificado"
      subtitle="Tu correo quedó verificado. Ya puedes iniciar sesión en AEGIS."
    >
      <div className="auth-alert auth-alert--success" role="status">
        Verificación completada correctamente.
      </div>
      <div className="auth-form-links">
        <a href={route('/login')}>Iniciar sesión</a>
      </div>
    </AuthFrame>
  )
}
