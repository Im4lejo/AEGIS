import { useEffect, useRef, useState } from 'react'
import { avatarUrl, navigateTo, route } from '../shared/presentation'
import Head from './Head'
import Navbar from './Navbar'

// Encabezado del sitio: título/meta (Head), logo, navegación, buscador y menú de usuario.
export default function Header({ title, stylesheet, auth, onNavigate }) {
    const [profileOpen, setProfileOpen] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const profileRef = useRef(null)

    // Cierra el menú desplegable al hacer clic fuera de él
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
    let avatar = ''
    if (usuario && usuario.avatar) {
        avatar = usuario.avatar
    } else {
        avatar = avatarUrl(usuario)
    }

    return (
        <>
            <Head title={title} stylesheet={stylesheet} />
            <header className="main-header">
                <div className="header-container">
                    {/* Logo */}
                    <div className="header-logo" onClick={() => go(null, '/')}>
                        <img src="/favicon.svg" alt="AEGIS" className="logo-img" />
                        <span className="logo-text">AEGIS</span>
                    </div>

                    <Navbar onNavigate={onNavigate} />

                    {/* Buscador */}
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
                                    <a href={route('/perfil')} onClick={(e) => go(e, '/perfil')}>Mi Perfil</a>
                                    <a href={route('/plantilla?origen=mis-compras')} onClick={(e) => go(e, '/plantilla?origen=mis-compras')}>Mis Compras</a>
                                    <a href={route('/plantilla?origen=configuracion')} onClick={(e) => go(e, '/plantilla?origen=configuracion')}>Configuración</a>
                                    <hr />
                                    <a href={route('/login')} onClick={(e) => go(e, '/login')} className="logout-link">Cerrar Sesión</a>
                                </div>
                            )}
                        </div>

                        <button className="cart-btn" aria-label="Carrito de compras" type="button">
                            🛒
                            <span className="cart-badge">0</span>
                        </button>
                    </div>
                </div>
            </header>
        </>
    )
}
