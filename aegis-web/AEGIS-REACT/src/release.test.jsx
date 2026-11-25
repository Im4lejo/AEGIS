import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('./auth/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    token: null,
    user: null,
    loading: false,
    error: null,
  }),
}))

import Home from './components/home/views/Home'
import { NotFoundPage } from './components/shared/ApiState'
import { ThemeProvider } from './theme/ThemeProvider'
import { MemoryRouter } from 'react-router-dom'

describe('release web honest states', () => {
  it('keeps following unavailable instead of presenting a fake feed', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Home auth={{ isAuthenticated: false }} onNavigate={vi.fn()} />
        </MemoryRouter>
      </ThemeProvider>,
    )
    expect(
      screen.getByRole('tab', { name: 'Siguiendo' }).hasAttribute('disabled'),
    ).toBe(true)
  })

  it('renders a real not-found state', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <NotFoundPage onNavigate={vi.fn()} />
        </MemoryRouter>
      </ThemeProvider>,
    )
    expect(
      screen.getByRole('heading', { name: 'No encontramos esta página' }),
    ).toBeTruthy()
  })
})
