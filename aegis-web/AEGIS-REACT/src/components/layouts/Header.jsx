import { useEffect, useRef, useState } from 'react'
import { avatarUrl, navigateTo, route } from '../shared/presentation'
import { USUARIOS_DEMO } from '../shared/usuariosDemo'
import Head from './Head'
import Navbar from './Navbar'
import CarritoPanel from '../carrito/CarritoPanel'
import { totalUnidades } from '../carrito/carritoDemo'
import './css/layouts.css'

export default function Header({ title, stylesheet, auth, onNavigate }) {
    const [profileOpen, setProfileOpen] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [carritoAbierto, setCarritoAbierto] = useState(false)
    const [unidades, setUnidades] = useState(totalUnidades())
    const profileRef = useRef(null)

    useEffect(() => {
        const actualizar = () => setUnidades(totalUnidades())
        window.addEventListener('carrito-cambio', actualizar)
        return () => window.removeEventListener('carrito-cambio', actualizar)
    }, [])

    useEffect(() => {
        if (!profileOpen) return
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [profileOpen])

    const go = (event, path) => {
        if (event) event.preventDefault()
        navigateTo(path, onNavigate)
    }

    const buscar = (event) => {
        if (event) event.preventDefault()
        const termino = busqueda.trim()
        navigateTo(termino ? `/productos?buscar=${encodeURIComponent(termino)}` : '/productos', onNavigate)
    }

    const usuario = auth && auth.user ? auth.user : null
    const guardado = JSON.parse(localStorage.getItem('perfilAegis') || '{}')
    const demo = usuario && USUARIOS_DEMO[usuario.nombre] ? USUARIOS_DEMO[usuario.nombre] : null
    const nombreMostrar = demo ? `${demo.nombre} ${demo.apellido}` : (usuario ? usuario.nombre : 'Invitado')
    const apodoMostrar = demo && demo.apodo ? `@${demo.apodo}` : ''
    let avatar = guardado.avatar || (usuario && usuario.avatar ? usuario.avatar : avatarUrl(usuario))

    return (
        <>
            <Head title={title} stylesheet={stylesheet} />
            <header className="main-header">
                <div className="header-container">
                    <div className="header-logo" onClick={() => go(null, '/')}>
                        <img src="/favicon.svg" alt="AEGIS" className="logo-img" />
                        <span className="logo-text">AEGIS</span>
                    </div>

                    <Navbar onNavigate={onNavigate} />

                    <div className="header-search">
                        <input
                            type="text"
                            placeholder="Busca tu producto aquí..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') buscar(e) }}
                        />
                        <button className="search-btn" type="button" aria-label="Buscar" onClick={buscar}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <circle cx="11" cy="11" r="7" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </button>
                    </div>

                    <div className="header-user-actions">
                        <div className="profile-dropdown-container" ref={profileRef}>
                            <button
                                className="profile-btn"
                                aria-haspopup="true"
                                aria-expanded={profileOpen}
                                onClick={() => setProfileOpen(!profileOpen)}
                                type="button"
                            >
                                <img src={avatar} alt="Perfil" className="profile-img" />
                                <span className="profile-caret" aria-hidden="true">▼</span>
                            </button>

                            {profileOpen && (
                                <div className="profile-menu">
                                    <div className="profile-menu-user">
                                        <img src={avatar} alt="" className="profile-menu-avatar" />
                                        <div className="profile-menu-datos">
                                            <strong>{nombreMostrar}</strong>
                                            {apodoMostrar && <span>{apodoMostrar}</span>}
                                        </div>
                                    </div>
                                    <a href={route('/perfil')} onClick={(e) => go(e, '/perfil')}>Mi Perfil</a>
                                    <a href={route('/plantilla?origen=mis-compras')} onClick={(e) => go(e, '/plantilla?origen=mis-compras')}>Mis Compras</a>
                                    <a href={route('/perfil/editar')} onClick={(e) => go(e, '/perfil/editar')}>Configuración</a>
                                    <hr />
                                    <a href={route('/login')} onClick={(e) => go(e, '/login')} className="logout-link">Cerrar Sesión</a>
                                </div>
                            )}
                        </div>

                        <button
                            className="cart-btn"
                            aria-label="Carrito de compras"
                            type="button"
                            onClick={() => setCarritoAbierto(!carritoAbierto)}
                        >
                            🛒
                            <span className="cart-badge">{unidades}</span>
                        </button>
                    </div>
                </div>
            </header>

            {carritoAbierto && (
                <CarritoPanel
                    onCerrar={() => setCarritoAbierto(false)}
                    onNavigate={onNavigate}
                />
            )}
        </>
    )
}
