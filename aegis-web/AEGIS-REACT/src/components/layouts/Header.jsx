import { useEffect, useRef, useState } from 'react'
import { avatarUrl, navigateTo, route } from '../shared/presentation'
import { useAuth } from '../../auth/useAuth'
import { productApi } from '../../services/api'
import Head from './Head'
import Navbar from './Navbar'
import WorkspaceChrome from './WorkspaceChrome'
import { ThemeSelector } from '../../theme/ThemeProvider'
import CarritoPanel from '../carrito/CarritoPanel'
import { totalUnidades } from '../carrito/carritoDemo'
import './css/layouts.css'

export default function Header({ title, stylesheet, auth, onNavigate, forumMode = false, forumMenuOpen = false, onForumMenuToggle }) {
    const { logout } = useAuth()
    const [profileOpen, setProfileOpen] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [carritoAbierto, setCarritoAbierto] = useState(false)
    const [menuAbierto, setMenuAbierto] = useState(false)
    const [categoriasAbiertas, setCategoriasAbiertas] = useState(false)
    const [categorias, setCategorias] = useState([])
    const [errorCategorias, setErrorCategorias] = useState('')
    const [unidades, setUnidades] = useState(totalUnidades())
    const profileRef = useRef(null)

    useEffect(() => {
        if (!categoriasAbiertas) return
        let active = true
        productApi.categories()
            .then(({ data }) => {
                if (active) {
                    setCategorias(data)
                    setErrorCategorias('')
                }
            })
            .catch((error) => {
                if (active) setErrorCategorias(error.message)
            })
        return () => { active = false }
    }, [categoriasAbiertas])

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

    useEffect(() => {
        if (!menuAbierto) return
        const overflowAnterior = document.body.style.overflow
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setMenuAbierto(false)
        }
        document.body.style.overflow = 'hidden'
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.body.style.overflow = overflowAnterior
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [menuAbierto])

    const go = (event, path) => {
        if (event) event.preventDefault()
        setMenuAbierto(false)
        setCategoriasAbiertas(false)
        navigateTo(path, onNavigate)
    }

    const buscar = (event) => {
        if (event) event.preventDefault()
        const termino = busqueda.trim()
        setMenuAbierto(false)
        navigateTo(termino ? `/productos?buscar=${encodeURIComponent(termino)}` : '/productos', onNavigate)
    }

    const navegarDesdeMenu = (path) => {
        setMenuAbierto(false)
        setCategoriasAbiertas(false)
        navigateTo(path, onNavigate)
    }

    const usuario = auth && auth.user ? auth.user : null
    const nombreMostrar = usuario ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() : 'Invitado'
    const apodoMostrar = usuario && usuario.username ? `@${usuario.username}` : ''
    const avatar = usuario?.foto_perfil_url || usuario?.avatar || avatarUrl(usuario)

    const cerrarSesion = async (event) => {
        if (event) event.preventDefault()
        setMenuAbierto(false)
        setProfileOpen(false)
        try {
            await logout()
            navigateTo('/login', onNavigate)
        } catch (error) {
            if (onNavigate) onNavigate('/login', { message: error.message })
        }
    }

    return (
        <>
            <Head title={title} stylesheet={stylesheet} />
            <header className={`main-header${menuAbierto ? ' menu-open' : ''}${forumMode ? ' main-header--forum' : ''}`}>
                <div className="header-container">
                    {forumMode && (
                        <button
                            className="forum-menu-toggle"
                            type="button"
                            aria-label={forumMenuOpen ? 'Cerrar menú del foro' : 'Abrir menú del foro'}
                            aria-expanded={forumMenuOpen}
                            onClick={onForumMenuToggle}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <circle cx="5" cy="12" r="1.8" />
                                <circle cx="12" cy="12" r="1.8" />
                                <circle cx="19" cy="12" r="1.8" />
                            </svg>
                        </button>
                    )}

                    <button className="header-logo" type="button" aria-label="AEGIS, ir al inicio" onClick={() => go(null, '/')}>
                        <img src="/aegis-logo.png" alt="AEGIS" className="logo-img" />
                        <span className="logo-text">AEGIS</span>
                    </button>

                    <button
                        className="menu-toggle"
                        type="button"
                        aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
                        aria-expanded={menuAbierto}
                        aria-controls="header-mobile-menu"
                        onClick={() => setMenuAbierto(!menuAbierto)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>

                    <div id="header-mobile-menu" className={`header-mobile-menu${menuAbierto ? ' is-open' : ''}`}>
                        <div className="header-mobile-top">
                            <div className="header-mobile-topbar">
                                <div className="header-mobile-brand">
                                    <img src="/aegis-logo.png" alt="" className="logo-img" />
                                    <span>AEGIS</span>
                                </div>
                                <button className="header-mobile-close" type="button" onClick={() => setMenuAbierto(false)} aria-label="Cerrar menú">
                                    <span />
                                    <span />
                                </button>
                            </div>

                            <a className="header-mobile-profile" href={route(usuario ? '/perfil' : '/login')} onClick={(event) => go(event, usuario ? '/perfil' : '/login')}>
                                <img src={avatar} alt="" className="profile-img" />
                                <span className="header-mobile-profile-data">
                                    <strong>{nombreMostrar}</strong>
                                    <span>Ir a ajustes de cuenta</span>
                                </span>
                            </a>
                        </div>

                        <Navbar onNavigate={navegarDesdeMenu} />

                        <nav className="header-mobile-links" aria-label="Navegación móvil">
                            <div className="header-mobile-group">
                                <span className="header-mobile-heading">Explorar</span>
                                <button
                                    className="header-mobile-link header-mobile-category-toggle"
                                    type="button"
                                    aria-expanded={categoriasAbiertas}
                                    onClick={() => setCategoriasAbiertas(!categoriasAbiertas)}
                                >
                                    Categorías <span aria-hidden="true">{categoriasAbiertas ? '−' : '+'}</span>
                                </button>
                                {categoriasAbiertas && (
                                    <div className="header-mobile-categories">
                                        {errorCategorias && <span className="header-mobile-link">{errorCategorias}</span>}
                                        {categorias.map((categoria) => (
                                            <a
                                                className="header-mobile-link"
                                                href={route(`/productos?categoria=${encodeURIComponent(categoria.nombre)}`)}
                                                key={categoria.id}
                                                onClick={(event) => go(event, `/productos?categoria=${encodeURIComponent(categoria.nombre)}`)}
                                            >
                                                {categoria.nombre}
                                            </a>
                                        ))}
                                    </div>
                                )}
                                <a className="header-mobile-link" href={route('/productos?filtro=ofertas')} onClick={(event) => go(event, '/productos?filtro=ofertas')}>Ofertas</a>
                                <a className="header-mobile-link" href={route('/productos?filtro=gaming')} onClick={(event) => go(event, '/productos?filtro=gaming')}>Gaming</a>
                                <a className="header-mobile-link" href={route('/productos?filtro=reacondicionado')} onClick={(event) => go(event, '/productos?filtro=reacondicionado')}>Reacondicionado</a>
                                <a className="header-mobile-link" href={route('/novedades')} onClick={(event) => go(event, '/novedades')}>Novedades</a>
                            </div>
                        </nav>
                        <ThemeSelector className="theme-select--mobile" />

                        {usuario
                            ? <a className="header-mobile-link header-mobile-logout" href={route('/login')} onClick={cerrarSesion}>Cerrar sesión</a>
                            : <a className="header-mobile-link header-mobile-logout" href={route('/login')} onClick={(event) => go(event, '/login')}>Iniciar sesión</a>}
                        {usuario && (
                            <a className="header-mobile-link" href={route('/seguridad')} onClick={(event) => go(event, '/seguridad')}>
                                Seguridad de cuenta
                            </a>
                        )}
                    </div>

                    <div className="header-search">
                        <input
                        aria-label="Buscar productos"
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
                        <a className="header-message-link" href={route('/mensajes')} onClick={(event) => go(event, '/mensajes')}>
                            Mensajes
                        </a>
                        <span className="header-notification-status" role="status" title="La bandeja de notificaciones aún no está disponible">
                            Notificaciones · próximamente
                        </span>
                        <ThemeSelector className="theme-select--desktop" />
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
                                    {usuario ? (
                                        <>
                                            <a href={route('/perfil')} onClick={(e) => go(e, '/perfil')}>Mi Perfil</a>
                                            <a href={route('/seguridad')} onClick={(e) => go(e, '/seguridad')}>Seguridad de cuenta</a>
                                            <hr />
                                            <a href={route('/login')} onClick={cerrarSesion} className="logout-link">Cerrar Sesión</a>
                                        </>
                                    ) : (
                                        <>
                                            <a href={route('/login')} onClick={(e) => go(e, '/login')}>Iniciar Sesión</a>
                                            <a href={route('/register')} onClick={(e) => go(e, '/register')}>Crear cuenta</a>
                                        </>
                                    )}
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

            <WorkspaceChrome auth={auth} onNavigate={onNavigate} />

            {carritoAbierto && (
                <CarritoPanel
                    onCerrar={() => setCarritoAbierto(false)}
                    onNavigate={onNavigate}
                />
            )}
        </>
    )
}
