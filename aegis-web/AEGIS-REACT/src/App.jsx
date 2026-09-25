import { useEffect, useState } from 'react'
import { route } from './components/shared/presentation'
import Home from './components/home/views/Home'
import Foro from './components/foro/views/Foro'
import ProductosIndex from './components/productos/views/Index'
import CrearProducto from './components/productos/views/Crear'
import DetalleProducto from './components/productos/views/Detalle'
import MisProductos from './components/productos/views/MisProductos'
import Perfil from './components/perfil/views/Perfil'
import EditarPerfil from './components/perfil/views/Editar'
import Login from './components/auth/views/Login'
import Register from './components/auth/views/Register'
import PuntosFisicos from './components/puntosFisicos/views/Index'
import Admin from './components/admin/views/Dashboard'
import Plantilla from './components/shared/Plantilla'
import './components/home/css/home.css'
import './App.css'

// Sesión de demostración mientras no exista backend conectado.
const DEFAULT_AUTH = {
  isAuthenticated: true,
  isAdmin: false,
  user: {
    nombre: 'Usuario AEGIS',
    email: 'usuario@aegis.com',
    avatar: '',
  },
}

const PAGES = {
  '/': Home,
  '/home': Home,
  '/foro': Foro,
  '/productos': ProductosIndex,
  '/productos/crear': CrearProducto,
  '/productos/detalle': DetalleProducto,
  '/productos/mis-productos': MisProductos,
  '/perfil': Perfil,
  '/perfil/editar': EditarPerfil,
  '/puntos-fisicos': PuntosFisicos,
  '/admin': Admin,
  '/login': Login,
  '/register': Register,
}

const getHashPath = () => {
  const hash = window.location.hash.replace(/^#/, '')
  return hash.split('?')[0] || '/'
}

const getHashParams = () => {
  const hash = window.location.hash.replace(/^#/, '')
  const queryIndex = hash.indexOf('?')
  if (queryIndex === -1) return {}
  return Object.fromEntries(new URLSearchParams(hash.slice(queryIndex + 1)))
}

function App() {
  const [path, setPath] = useState(getHashPath())
  const [params, setParams] = useState(getHashParams())

  useEffect(() => {
    const onHashChange = () => {
      setPath(getHashPath())
      setParams(getHashParams())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = (to) => {
    const target = route(to)
    if (window.location.hash === target) {
      setPath(getHashPath())
      setParams(getHashParams())
    } else {
      window.location.hash = target
    }
    window.scrollTo(0, 0)
  }

  // Cualquier ruta que no exista todavía cae en la plantilla de "página en construcción".
  const Page = PAGES[path] || Plantilla
  const pageProps = {
    auth: DEFAULT_AUTH,
    onNavigate: navigate,
    origen: params.origen || path || '/',
    filtros: { busqueda: params.buscar || '' },
  }

  return <Page {...pageProps} />
}

export default App