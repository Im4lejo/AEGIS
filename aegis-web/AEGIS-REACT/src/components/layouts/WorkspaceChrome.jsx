import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { navigateTo, route } from '../shared/presentation'

const PRIMARY_LINKS = [
  { href: '/', label: 'Inicio', icon: '⌂' },
  { href: '/productos', label: 'Marketplace', icon: '▦' },
  { href: '/foro', label: 'Comunidad', icon: '◎' },
  { href: '/mensajes', label: 'Mensajes', icon: '✉' },
  { href: '/perfil', label: 'Perfil', icon: '◉' },
  { href: '/perfil/editar', label: 'Ajustes', icon: '⚙' },
  { href: '/puntos-fisicos', label: 'Puntos verificados', icon: '✓' },
]

const BOTTOM_LINKS = [
  PRIMARY_LINKS[0],
  PRIMARY_LINKS[1],
  { href: '/productos/crear', label: 'Publicar', icon: '+' },
  PRIMARY_LINKS[2],
  PRIMARY_LINKS[4],
]

function isCurrent(pathname, href) {
  if (href === '/') return pathname === '/' || pathname === '/home'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function WorkspaceLink({
  href,
  label,
  icon,
  pathname,
  onNavigate,
  compact = false,
}) {
  const current = isCurrent(pathname, href)
  return (
    <a
      aria-current={current ? 'page' : undefined}
      aria-label={compact ? label : undefined}
      className={compact ? 'workspace-bottom-nav__link' : 'workspace-nav__link'}
      href={route(href)}
      onClick={(event) => {
        event.preventDefault()
        navigateTo(href, onNavigate)
      }}
      title={compact ? undefined : label}
    >
      <span
        aria-hidden="true"
        className={
          compact ? 'workspace-bottom-nav__icon' : 'workspace-nav__icon'
        }
      >
        {icon}
      </span>
      <span
        className={
          compact ? 'workspace-bottom-nav__label' : 'workspace-nav__label'
        }
      >
        {label}
      </span>
    </a>
  )
}

export default function WorkspaceChrome({ auth, onNavigate }) {
  const { pathname } = useLocation()

  useEffect(() => {
    document.body.classList.add('aegis-workspace')
    return () => document.body.classList.remove('aegis-workspace')
  }, [])

  const contextMessage =
    pathname === '/mensajes'
      ? 'Las conversaciones disponibles actualmente son una vista de demostración local.'
      : auth?.isAuthenticated
        ? 'Descubre productos, participa en la comunidad y gestiona tu perfil.'
        : 'Explora productos y comunidad. Algunas acciones requieren iniciar sesión.'

  return (
    <>
      <aside className="workspace-left-rail" aria-label="Navegación lateral">
        <nav className="workspace-nav" aria-label="Principal">
          {PRIMARY_LINKS.map((item) => (
            <WorkspaceLink
              key={item.href}
              {...item}
              onNavigate={onNavigate}
              pathname={pathname}
            />
          ))}
        </nav>
      </aside>

      <aside className="workspace-context" aria-label="Contexto de AEGIS">
        <section className="workspace-context-card">
          <h2>Tu espacio AEGIS</h2>
          <p>{contextMessage}</p>
          <a
            href={route('/productos')}
            onClick={(event) => {
              event.preventDefault()
              navigateTo('/productos', onNavigate)
            }}
          >
            Explorar productos
          </a>
          <a
            href={route('/foro')}
            onClick={(event) => {
              event.preventDefault()
              navigateTo('/foro', onNavigate)
            }}
          >
            Ir a comunidad
          </a>
        </section>
      </aside>

      <nav className="workspace-bottom-nav" aria-label="Navegación móvil">
        {BOTTOM_LINKS.map((item) => (
          <WorkspaceLink
            key={item.href}
            {...item}
            compact
            onNavigate={onNavigate}
            pathname={pathname}
          />
        ))}
      </nav>
    </>
  )
}
