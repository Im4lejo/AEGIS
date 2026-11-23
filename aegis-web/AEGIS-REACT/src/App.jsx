import './App.css'
import { useState } from 'react'
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
import Foro from './components/foro/views/Foro'
import Publicacion from './components/foro/views/Publicacion'
import ProductosIndex from './components/productos/views/Index'
import PublicarProducto from './components/productos/views/PublicarProducto'
import DetalleProducto from './components/productos/views/Detalle'
import MisProductos from './components/productos/views/MisProductos'
import Perfil from './components/perfil/views/Perfil'
import Vendedor from './components/perfil/views/Vendedor'
import EditarPerfil from './components/perfil/views/Editar'
import Login from './components/auth/views/Login'
import Register from './components/auth/views/Register'
import ForgotPassword from './components/auth/views/ForgotPassword'
import ResetPassword from './components/auth/views/ResetPassword'
import VerifyEmail from './components/auth/views/VerifyEmail'
import EmailVerified from './components/auth/views/EmailVerified'
import AccountSecurity from './components/auth/views/AccountSecurity'
import PuntosFisicos from './components/puntosFisicos/views/Index'
import Mensajes from './components/mensajes/views/Mensajes'
import Encuentros from './components/puntosFisicos/views/Encuentros'
import Admin from './components/admin/views/Dashboard'
import Plantilla from './components/shared/Plantilla'
import { NotFoundPage } from './components/shared/ApiState'
import { AccessRestrictedState } from './components/shared/ui'
import { ErrorBoundary } from './components/shared/ui'
import { ThemeProvider } from './theme/ThemeProvider'
import Comunidades from './components/comunidades/views/Comunidades'
import './design-system/design-system.css'

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
    location.pathname === '/admin'
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
            <Routes>
              <Route path="/" element={<Vista Componente={Home} />} />
              <Route path="/home" element={<Vista Componente={Home} />} />
              <Route path="/foro" element={<Vista Componente={Foro} />} />
              <Route path="/comunidades" element={<Vista Componente={Comunidades} />} />
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
          </HashRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
