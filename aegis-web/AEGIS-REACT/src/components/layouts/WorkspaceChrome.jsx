import { useLocation } from 'react-router-dom'
import { navigateTo, route } from '../shared/presentation'

const LINKS = [
  { href: '/', label: 'Inicio', icon: '⌂' },
  { href: '/productos', label: 'Marketplace', icon: '▦' },
  { href: '/comunidades', label: 'Comunidades', icon: '◎' },
  { href: '/foro', label: 'Foro', icon: '☰' },
  { href: '/mensajes', label: 'Mensajes', icon: '✉' },
  { label: 'Guardados', icon: '☆', unavailable: true },
  { href: '/perfil', label: 'Perfil', icon: '◉' },
  { href: '/ajustes', label: 'Ajustes', icon: '⚙' },
  { href: '/puntos-fisicos', label: 'Puntos verificados', icon: '✓' },
]
const ADMIN = { href: '/admin', label: 'Administración', icon: '▤' }
const PUBLISH = { href: '/productos/crear', label: 'Publicar', icon: '+' }
const BOTTOM_LINKS = [LINKS[0], LINKS[1], PUBLISH, LINKS[2], LINKS[6]]

function isCurrent(pathname, href) {
  if (href === '/') return pathname === '/' || pathname === '/home'
  if (href === '/perfil') return pathname === '/perfil'
  if (href === '/ajustes') {
    return ['/ajustes', '/perfil/editar', '/datos-personales', '/seguridad'].includes(pathname)
  }
  if (href === '/productos' && pathname === '/novedades') return true
  if (href === '/foro' && pathname === '/publicacion') return true
  if (href === '/productos' && pathname === PUBLISH.href) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}

function WorkspaceLink({ item, pathname, onNavigate, compact = false, menu = false }) {
  const className = menu
    ? 'header-mobile-link'
    : compact ? 'workspace-bottom-nav__link' : 'workspace-nav__link'
  const iconClass = compact ? 'workspace-bottom-nav__icon' : 'workspace-nav__icon'
  if (item.unavailable) {
    return (
      <span className={className} aria-disabled="true" title="Próximamente">
        <span aria-hidden="true" className={iconClass}>{item.icon}</span>
        <span className="workspace-nav__label">Guardados · próximamente</span>
      </span>
    )
  }
  return (
    <a
      aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
      className={className}
      href={route(item.href)}
      onClick={(event) => {
        event.preventDefault()
        navigateTo(item.href, onNavigate)
      }}
      title={!compact && !menu ? item.label : undefined}
    >
      <span aria-hidden="true" className={iconClass}>{item.icon}</span>
      <span className={compact ? 'workspace-bottom-nav__label' : 'workspace-nav__label'}>
        {item.label}
      </span>
    </a>
  )
}

export function WorkspacePrimaryNav({ auth, onNavigate, menu = false }) {
  const { pathname } = useLocation()
  const items = auth?.isAdmin ? [...LINKS, ADMIN] : LINKS
  return (
    <nav className={menu ? 'header-mobile-primary' : 'workspace-nav'} aria-label="Principal">
      {items.map((item) => (
        <WorkspaceLink key={item.href || item.label} item={item} pathname={pathname} onNavigate={onNavigate} menu={menu} />
      ))}
      {menu && <WorkspaceLink item={PUBLISH} pathname={pathname} onNavigate={onNavigate} menu />}
    </nav>
  )
}

export default function WorkspaceChrome({ children, auth, onNavigate }) {
  const { pathname } = useLocation()
  const hasContext = ['/', '/home', '/comunidades'].includes(pathname)

  return (
    <div className={`workspace-shell${hasContext ? ' workspace-shell--context' : ''}`}>
      <aside className="workspace-left-rail" aria-label="Navegación lateral">
        <WorkspacePrimaryNav auth={auth} onNavigate={onNavigate} />
      </aside>
      <div className="workspace-content">{children}</div>
      {hasContext && (
        <aside className="workspace-context" aria-label="Contexto de AEGIS">
          <section className="workspace-context-card">
            <h2>Tu espacio AEGIS</h2>
            <p>{auth?.isAuthenticated
              ? 'Descubre productos, participa en la comunidad y gestiona tu perfil.'
              : 'Explora productos y comunidad. Algunas acciones requieren iniciar sesión.'}</p>
            <a href={route('/productos')} onClick={(event) => { event.preventDefault(); navigateTo('/productos', onNavigate) }}>Explorar productos</a>
            <a href={route('/foro')} onClick={(event) => { event.preventDefault(); navigateTo('/foro', onNavigate) }}>Ir a comunidad</a>
          </section>
        </aside>
      )}
      <nav className="workspace-bottom-nav" aria-label="Navegación móvil">
        {BOTTOM_LINKS.map((item) => (
          <WorkspaceLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} compact />
        ))}
      </nav>
    </div>
  )
}
