import { useLocation } from 'react-router-dom'
import { navigateTo, route } from '../shared/presentation'
import { HEADER_LINKS } from './headerNavigation'

const LINKS = [
  { href: '/', label: 'Inicio', icon: 'home' },
  { href: '/productos', label: 'Marketplace', icon: 'marketplace' },
  { href: '/comunidades', label: 'Comunidades', icon: 'communities' },
  { href: '/foro', label: 'Foro', icon: 'forum' },
  { href: '/mensajes', label: 'Mensajes', icon: 'messages' },
  { label: 'Guardados', icon: 'saved', unavailable: true },
  { href: '/perfil', label: 'Perfil', icon: 'profile' },
  { href: '/ajustes', label: 'Ajustes', icon: 'settings' },
  { href: '/puntos-fisicos', label: 'Puntos verificados', icon: 'points' },
]
const ADMIN = { href: '/admin', label: 'Administración', icon: 'admin' }
const PUBLISH = { href: '/productos/crear', label: 'Publicar', icon: 'publish' }
const BOTTOM_LINKS = [LINKS[0], LINKS[1], PUBLISH, LINKS[2], LINKS[6]]

const ICONS = {
  home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
  marketplace: <><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></>,
  communities: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5.5a3 3 0 0 1 0 5.8M18 14a5 5 0 0 1 3 4.6" /></>,
  forum: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6a7.5 7.5 0 1 1 17-3.5Z" /><path d="M8 11h8M8 14h5" /></>,
  messages: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  saved: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.7-1.4-2.4L7.1 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2Z" /></>,
  points: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  admin: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
  publish: <><path d="M12 5v14M5 12h14" /></>,
}

function WorkspaceIcon({ name }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {ICONS[name]}
    </svg>
  )
}

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
        <span aria-hidden="true" className={iconClass}><WorkspaceIcon name={item.icon} /></span>
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
      <span aria-hidden="true" className={iconClass}><WorkspaceIcon name={item.icon} /></span>
      <span className={compact ? 'workspace-bottom-nav__label' : 'workspace-nav__label'}>
        {item.label}
      </span>
    </a>
  )
}

export function WorkspacePrimaryNav({ auth, onNavigate, menu = false }) {
  const { pathname } = useLocation()
  const allItems = auth?.isAdmin ? [...LINKS, ADMIN] : LINKS
  const items = menu
    ? allItems
    : allItems.filter((item) => {
      if (HEADER_LINKS.some((headerLink) => headerLink.href === item.href)) return false
      if (
        pathname === '/foro' &&
        ['/', '/comunidades', '/mensajes', '/perfil'].includes(item.href)
      ) {
        return false
      }
      return true
    })
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
