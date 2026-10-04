import './App.css'
import { useEffect, useState } from 'react'
import { route } from './components/shared/presentation'
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
import PuntosFisicos from './components/puntosFisicos/views/Index'
import Mensajes from './components/mensajes/views/Mensajes'
import Encuentros from './components/puntosFisicos/views/Encuentros'
import Admin from './components/admin/views/Dashboard'
import Plantilla from './components/shared/Plantilla'

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
  '/publicacion': Publicacion,
  '/productos': ProductosIndex,
  '/productos/crear': PublicarProducto,
  '/productos/detalle': DetalleProducto,
  '/productos/mis-productos': MisProductos,
  '/perfil': Perfil,
  '/perfil/editar': EditarPerfil,
  '/vendedor': Vendedor,
  '/puntos-fisicos': PuntosFisicos,
  '/mensajes': Mensajes,
  '/configurar-encuentro': Encuentros,
  '/admin': Admin,
  '/login': Login,
  '/register': Register,
}

const getHashPath = () => {
  const hash = window.location.hash.substring(1)
  return hash.split('?')[0] || '/'
}

const getHashParams = () => {
  const hash = window.location.hash.substring(1)
  const queryIndex = hash.indexOf('?')
  const params = {}
  if (queryIndex === -1) return params

  const consulta = hash.substring(queryIndex + 1)
  const partes = consulta.split('&')
  for (let i = 0; i < partes.length; i++) {
    const separador = partes[i].indexOf('=')
    if (separador !== -1) {
      const clave = decodeURIComponent(partes[i].substring(0, separador))
      const valor = decodeURIComponent(partes[i].substring(separador + 1))
      params[clave] = valor
    }
  }
  return params
}

function App() {
  const [path, setPath] = useState(getHashPath())
  const [params, setParams] = useState(getHashParams())
  const [navegacion, setNavegacion] = useState(0)

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
      setNavegacion((n) => n + 1)
    } else {
      window.location.hash = target
    }
    window.scrollTo(0, 0)
  }

  const Page = PAGES[path] || Plantilla

  return (
    <Page
      auth={DEFAULT_AUTH}
      onNavigate={navigate}
      origen={params.origen || path || '/'}
      filtros={{
        busqueda: params.buscar || '',
        categoria: params.categoria || '',
        filtro: params.filtro || '',
        navegacion: navegacion,
      }}
      id={params.id}
    />
  )
}

export default App