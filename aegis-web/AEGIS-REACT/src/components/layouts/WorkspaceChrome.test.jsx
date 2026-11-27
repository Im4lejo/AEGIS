import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import WorkspaceChrome, { WorkspacePrimaryNav } from './WorkspaceChrome'
import Header from './Header'
import { ThemeProvider } from '../../theme/ThemeProvider'

vi.mock('../../auth/useAuth', () => ({
  useAuth: () => ({ logout: vi.fn() }),
}))

afterEach(cleanup)

describe('navegación compartida', () => {
  it('marks the active section and keeps unavailable functions non-interactive', () => {
    const navigate = vi.fn()
    render(
      <MemoryRouter initialEntries={['/perfil/editar']}>
        <WorkspacePrimaryNav auth={{ isAdmin: false }} onNavigate={navigate} />
      </MemoryRouter>,
    )
    const nav = screen.getByRole('navigation', { name: 'Principal' })
    expect(within(nav).getByRole('link', { name: 'Ajustes' }).getAttribute('aria-current')).toBe('page')
    expect(within(nav).getByRole('link', { name: 'Perfil' }).hasAttribute('aria-current')).toBe(false)
    expect(within(nav).queryByRole('link', { name: /Guardados/ })).toBeNull()
    expect(within(nav).queryByRole('link', { name: 'Administración' })).toBeNull()
    fireEvent.click(within(nav).getByRole('link', { name: 'Comunidades' }))
    expect(navigate).toHaveBeenCalledWith('/comunidades')
  })

  it('shows administration only for an admin', () => {
    render(
      <MemoryRouter initialEntries={['/admin/usuarios']}>
        <WorkspacePrimaryNav auth={{ isAdmin: true }} />
      </MemoryRouter>,
    )
    const nav = screen.getByRole('navigation', { name: 'Principal' })
    expect(within(nav).getByRole('link', { name: 'Administración' }).getAttribute('aria-current')).toBe('page')
  })

  it('does not repeat the header destinations in the desktop workspace navigation', () => {
    render(
      <MemoryRouter initialEntries={['/productos']}>
        <WorkspacePrimaryNav auth={{ isAdmin: false }} />
      </MemoryRouter>,
    )
    const nav = screen.getByRole('navigation', { name: 'Principal' })

    for (const label of ['Marketplace', 'Foro', 'Puntos verificados']) {
      expect(within(nav).queryByRole('link', { name: label })).toBeNull()
    }
    expect(within(nav).getByRole('link', { name: 'Comunidades' })).toBeTruthy()
    expect(within(nav).getByRole('link', { name: 'Mensajes' })).toBeTruthy()
  })

  it('does not render the global sidebar on any workspace view', () => {
    render(
      <MemoryRouter initialEntries={['/foro']}>
        <WorkspaceChrome auth={{ isAdmin: false }}><main>Contenido</main></WorkspaceChrome>
      </MemoryRouter>,
    )
    expect(screen.queryByRole('navigation', { name: 'Navegación lateral' })).toBeNull()
    expect(screen.getByRole('main').textContent).toBe('Contenido')
  })

  it('locks scrolling and restores focus after closing the mobile menu', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Header auth={{ isAuthenticated: false }} />
        </MemoryRouter>
      </ThemeProvider>,
    )
    const trigger = screen.getByRole('button', { name: 'Abrir menú' })
    trigger.focus()
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog', { name: 'Menú principal' })).toBeTruthy()
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(trigger)
  })

  it('keeps each primary destination single in the mobile menu', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Header auth={{ isAuthenticated: false }} />
        </MemoryRouter>
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
    const menu = screen.getByRole('dialog', { name: 'Menú principal' })
    const primaryNav = within(menu).getByRole('navigation', { name: 'Principal' })

    for (const path of ['/productos', '/productos/crear', '/foro', '/puntos-fisicos']) {
      expect(primaryNav.querySelectorAll(`a[href="#${path}"]`)).toHaveLength(1)
    }
  })

  it('shows marketplace, publishing, forum, and physical points in the header', () => {
    const { container } = render(
      <ThemeProvider>
        <MemoryRouter>
          <Header auth={{ isAuthenticated: false }} />
        </MemoryRouter>
      </ThemeProvider>,
    )
    const nav = container.querySelector('.header-nav')

    for (const path of ['/productos', '/productos/crear', '/foro', '/puntos-fisicos']) {
      const link = nav.querySelector(`a[href="#${path}"]`)
      expect(link).toBeTruthy()
      expect(link.querySelector('svg')).toBeTruthy()
    }
  })

  it('searches marketplace products from the header', () => {
    const onNavigate = vi.fn()
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Header auth={{ isAuthenticated: false }} onNavigate={onNavigate} />
        </MemoryRouter>
      </ThemeProvider>,
    )

    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar productos' }), {
      target: { value: 'reloj inteligente' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(onNavigate).toHaveBeenCalledWith('/productos?buscar=reloj%20inteligente')
  })

  it('offers settings from the profile dropdown', () => {
    const navigate = vi.fn()
    const { container } = render(
      <ThemeProvider>
        <MemoryRouter>
          <Header
            auth={{ user: { id: 7, nombre: 'Usuario registrado' } }}
            onNavigate={navigate}
          />
        </MemoryRouter>
      </ThemeProvider>,
    )

    fireEvent.click(container.querySelector('.profile-btn'))
    const settingsLink = within(container.querySelector('.profile-menu')).getByRole('link', { name: 'Ajustes' })
    expect(settingsLink.getAttribute('href')).toBe('#/ajustes')
    fireEvent.click(settingsLink)
    expect(navigate).toHaveBeenCalledWith('/ajustes')
  })

  it('hides message and notification actions from guests', () => {
    const { container } = render(
      <ThemeProvider>
        <MemoryRouter>
          <Header auth={{ isAuthenticated: false }} />
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(container.querySelector('.header-message-link')).toBeNull()
    expect(container.querySelector('.header-notification-button')).toBeNull()
  })

  it('keeps message and notification actions available as labeled icons', () => {
    const navigate = vi.fn()
    const { container } = render(
      <ThemeProvider>
        <MemoryRouter>
          <Header
            auth={{ user: { id: 7, nombre: 'Usuario registrado' } }}
            onNavigate={navigate}
          />
        </MemoryRouter>
      </ThemeProvider>,
    )

    const messages = container.querySelector('.header-user-actions .header-message-link')
    expect(messages).toBeTruthy()
    expect(messages.getAttribute('href')).toBe('#/mensajes')
    expect(messages.querySelector('svg')).toBeTruthy()
    fireEvent.click(messages)
    expect(navigate).toHaveBeenCalledWith('/mensajes')

    const notifications = container.querySelector('.header-user-actions .header-notification-button')
    expect(notifications).toBeTruthy()
    expect(notifications.querySelector('svg')).toBeTruthy()
    fireEvent.click(notifications)
    expect(screen.getByRole('region', { name: 'Novedades' })).toBeTruthy()
  })

  it('shows message and notification actions to an admin', () => {
    const { container } = render(
      <ThemeProvider>
        <MemoryRouter>
          <Header auth={{ isAdmin: true }} />
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(container.querySelector('.header-message-link')).toBeTruthy()
    expect(container.querySelector('.header-notification-button')).toBeTruthy()
  })
})
