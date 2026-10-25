import './App.css'
import { useState } from 'react'
import { HashRouter, Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
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

function Vista({ Componente }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [navegacion, setNavegacion] = useState(0)

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

  return (
    <Componente
      auth={DEFAULT_AUTH}
      onNavigate={onNavigate}
      origen={origen}
      filtros={filtros}
      id={id}
      vista={location.pathname}
      message={location.state && location.state.message}
    />
  )
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Vista Componente={Home} />} />
        <Route path="/home" element={<Vista Componente={Home} />} />
        <Route path="/foro" element={<Vista Componente={Foro} />} />
        <Route path="/publicacion" element={<Vista Componente={Publicacion} />} />
        <Route path="/productos" element={<Vista Componente={ProductosIndex} />} />
        <Route path="/novedades" element={<Vista Componente={ProductosIndex} />} />
        <Route path="/productos/crear" element={<Vista Componente={PublicarProducto} />} />
        <Route path="/productos/detalle" element={<Vista Componente={DetalleProducto} />} />
        <Route path="/productos/mis-productos" element={<Vista Componente={MisProductos} />} />
        <Route path="/perfil" element={<Vista Componente={Perfil} />} />
        <Route path="/perfil/editar" element={<Vista Componente={EditarPerfil} />} />
        <Route path="/vendedor" element={<Vista Componente={Vendedor} />} />
        <Route path="/puntos-fisicos" element={<Vista Componente={PuntosFisicos} />} />
        <Route path="/mensajes" element={<Vista Componente={Mensajes} />} />
        <Route path="/configurar-encuentro" element={<Vista Componente={Encuentros} />} />
        <Route path="/admin" element={<Vista Componente={Admin} />} />
        <Route path="/login" element={<Vista Componente={Login} />} />
        <Route path="/register" element={<Vista Componente={Register} />} />
        <Route path="*" element={<Vista Componente={Plantilla} />} />
      </Routes>
    </HashRouter>
  )
}

export default App
