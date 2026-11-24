import './App.css'
import { lazy, Suspense, useState } from 'react'
import {
  HashRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  useSearchParams,
  Navigate,
} from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/useAuth'
import Home from './components/home/views/Home'
const Foro = lazy(() => import('./components/foro/views/Foro'))
const Publicacion = lazy(() => import('./components/foro/views/Publicacion'))
const ProductosIndex = lazy(() => import('./components/productos/views/Index'))
const PublicarProducto = lazy(() => import('./components/productos/views/PublicarProducto'))
const DetalleProducto = lazy(() => import('./components/productos/views/Detalle'))
const MisProductos = lazy(() => import('./components/productos/views/MisProductos'))
const Perfil = lazy(() => import('./components/perfil/views/Perfil'))
const Vendedor = lazy(() => import('./components/perfil/views/Vendedor'))
const EditarPerfil = lazy(() => import('./components/perfil/views/Editar'))
const Login = lazy(() => import('./components/auth/views/Login'))
const Register = lazy(() => import('./components/auth/views/Register'))
const ForgotPassword = lazy(() => import('./components/auth/views/ForgotPassword'))
const ResetPassword = lazy(() => import('./components/auth/views/ResetPassword'))
const VerifyEmail = lazy(() => import('./components/auth/views/VerifyEmail'))
const EmailVerified = lazy(() => import('./components/auth/views/EmailVerified'))
const AccountSecurity = lazy(() => import('./components/auth/views/AccountSecurity'))
const PuntosFisicos = lazy(() => import('./components/puntosFisicos/views/Index'))
const Mensajes = lazy(() => import('./components/mensajes/views/Mensajes'))
const Encuentros = lazy(() => import('./components/puntosFisicos/views/Encuentros'))
const Admin = lazy(() => import('./components/admin/views/Dashboard'))
const AdminReportes = lazy(() => import('./components/admin/views/Reportes'))
const AdminUsuarios = lazy(() => import('./components/admin/views/Usuarios'))
const AdminAuditoria = lazy(() => import('./components/admin/views/Auditoria'))
const AdminConfiguracion = lazy(() => import('./components/admin/views/Configuracion'))
const Plantilla = lazy(() => import('./components/shared/Plantilla'))
import { NotFoundPage } from './components/shared/ApiState'
import { AccessRestrictedState } from './components/shared/ui'
import { ErrorBoundary } from './components/shared/ui'
import { ThemeProvider } from './theme/ThemeProvider'
const Comunidades = lazy(() => import('./components/comunidades/views/Comunidades'))
const Tiendas = lazy(() => import('./components/tiendas/views/Tiendas'))
const Negociacion = lazy(() => import('./components/negociacion/views/Negociacion'))
const Notificaciones = lazy(() => import('./components/notificaciones/views/Notificaciones'))
const Busqueda = lazy(() => import('./components/busqueda/views/Busqueda'))
const Ajustes = lazy(() => import('./components/ajustes/views/Ajustes'))
const MisReportes = lazy(() => import('./components/notificaciones/views/MisReportes'))
const DatosPersonales = lazy(() => import('./components/ajustes/views/DatosPersonales'))
import './design-system/design-system.css'

function RouteLoadingFallback() {
  return (
    <main className="route-loading" role="status" aria-live="polite">
      <div className="route-loading__bar" aria-hidden="true" />
      Cargando contenido…
    </main>
  )
}

function Vista({ Componente }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [navegacion, setNavegacion] = useState(0)
  const session = useAuth()

  const onNavigate = (to, state) => {
    const actual = location.pathname + location.search
    if (to === actual) {
      setNavegacion((n) => n + 1)
    } else {
      navigate(to, state ? { state } : undefined)
    }
    window.scrollTo(0, 0)
  }

  const id = searchParams.get('id') || undefined

  const filtros = {
    busqueda: searchParams.get('buscar') || '',
    categoria: searchParams.get('categoria') || '',
    filtro: searchParams.get('filtro') || '',
    navegacion: navegacion,
  }

  const origen = searchParams.get('origen') || location.pathname || '/'
  const auth = {
    isAuthenticated: session.isAuthenticated,
    isAdmin: session.user?.rol === 'admin',
    isOwner: session.user?.rol === 'owner',
    isSuspended: session.user?.estado && session.user.estado !== 'activo',
    capabilities: session.user?.capabilities || {},
    user: session.user,
    token: session.token,
  }
  const requiereSesion = [
    '/productos/crear',
    '/productos/mis-productos',
    '/perfil',
    '/perfil/editar',
    '/seguridad',
    '/mensajes',
    '/configurar-encuentro',
    '/admin',
    '/admin/reportes',
    '/admin/usuarios',
    '/admin/auditoria',
    '/admin/configuracion',
    '/mis-reportes',
    '/datos-personales',
  ].includes(location.pathname)

  if (requiereSesion && session.loading) {
    return (
      <main className="auth-loading" aria-live="polite">
        Verificando sesión...
      </main>
    )
  }
  if (requiereSesion && session.token && session.error) {
    return (
      <main className="auth-loading" role="alert">
        <p>No se pudo verificar tu sesión: {session.error}</p>
        <button type="button" onClick={session.retrySession}>
          Reintentar
        </button>
      </main>
    )
  }
  if (requiereSesion && !session.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (session.isAuthenticated && session.user?.estado !== 'activo') {
    return (
      <AccessRestrictedState
        message="Cuenta suspendida: no puedes realizar operaciones ni acceder a funciones protegidas."
      />
    )
  }
  if (
    location.pathname.startsWith('/admin')
    && session.isAuthenticated
    && session.user?.rol !== 'admin'
  ) {
    return (
      <AccessRestrictedState
        message="Esta sección requiere permisos de administración."
      />
    )
  }

  return (
    <Componente
      auth={auth}
      onNavigate={onNavigate}
      origen={origen}
      filtros={filtros}
      id={id}
      vista={location.pathname}
      message={location.state && location.state.message}
      success={location.state && location.state.message}
      returnTo={location.state && location.state.from}
    />
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <HashRouter>
            <Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
              <Route path="/" element={<Vista Componente={Home} />} />
              <Route path="/home" element={<Vista Componente={Home} />} />
              <Route path="/foro" element={<Vista Componente={Foro} />} />
              <Route path="/comunidades" element={<Vista Componente={Comunidades} />} />
              <Route path="/tiendas" element={<Vista Componente={Tiendas} />} />
              <Route path="/negociacion" element={<Vista Componente={Negociacion} />} />
              <Route path="/notificaciones" element={<Vista Componente={Notificaciones} />} />
              <Route path="/busqueda" element={<Vista Componente={Busqueda} />} />
              <Route path="/ajustes" element={<Vista Componente={Ajustes} />} />
              <Route path="/mis-reportes" element={<Vista Componente={MisReportes} />} />
              <Route path="/datos-personales" element={<Vista Componente={DatosPersonales} />} />
              <Route
                path="/publicacion"
                element={<Vista Componente={Publicacion} />}
              />
              <Route
                path="/productos"
                element={<Vista Componente={ProductosIndex} />}
              />
              <Route
                path="/novedades"
                element={<Vista Componente={ProductosIndex} />}
              />
              <Route
                path="/productos/crear"
                element={<Vista Componente={PublicarProducto} />}
              />
              <Route
                path="/productos/detalle"
                element={<Vista Componente={DetalleProducto} />}
              />
              <Route
                path="/productos/mis-productos"
                element={<Vista Componente={MisProductos} />}
              />
              <Route path="/perfil" element={<Vista Componente={Perfil} />} />
              <Route
                path="/perfil/editar"
                element={<Vista Componente={EditarPerfil} />}
              />
              <Route
                path="/vendedor"
                element={<Vista Componente={Vendedor} />}
              />
              <Route
                path="/puntos-fisicos"
                element={<Vista Componente={PuntosFisicos} />}
              />
              <Route
                path="/mensajes"
                element={<Vista Componente={Mensajes} />}
              />
              <Route
                path="/configurar-encuentro"
                element={<Vista Componente={Encuentros} />}
              />
              <Route path="/admin" element={<Vista Componente={Admin} />} />
              <Route path="/admin/reportes" element={<Vista Componente={AdminReportes} />} />
              <Route path="/admin/usuarios" element={<Vista Componente={AdminUsuarios} />} />
              <Route path="/admin/auditoria" element={<Vista Componente={AdminAuditoria} />} />
              <Route path="/admin/configuracion" element={<Vista Componente={AdminConfiguracion} />} />
              <Route path="/login" element={<Vista Componente={Login} />} />
              <Route
                path="/forgot-password"
                element={<Vista Componente={ForgotPassword} />}
              />
              <Route
                path="/reset-password"
                element={<Vista Componente={ResetPassword} />}
              />
              <Route
                path="/verify-email"
                element={<Vista Componente={VerifyEmail} />}
              />
              <Route
                path="/email-verified"
                element={<Vista Componente={EmailVerified} />}
              />
              <Route
                path="/seguridad"
                element={<Vista Componente={AccountSecurity} />}
              />
              <Route
                path="/register"
                element={<Vista Componente={Register} />}
              />
              <Route
                path="/plantilla"
                element={<Vista Componente={Plantilla} />}
              />
              <Route path="*" element={<Vista Componente={NotFoundPage} />} />
            </Routes>
            </Suspense>
          </HashRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
