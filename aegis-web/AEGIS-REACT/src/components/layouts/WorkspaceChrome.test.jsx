import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import WorkspaceChrome from './WorkspaceChrome'
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
        <WorkspaceChrome auth={{ isAdmin: false }} onNavigate={navigate}>
          <main>Contenido</main>
        </WorkspaceChrome>
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
        <WorkspaceChrome auth={{ isAdmin: true }}><main>Contenido</main></WorkspaceChrome>
      </MemoryRouter>,
    )
    const nav = screen.getByRole('navigation', { name: 'Principal' })
    expect(within(nav).getByRole('link', { name: 'Administración' }).getAttribute('aria-current')).toBe('page')
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
})
