import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
}))

vi.mock('../../../auth/useAuth', () => ({
  useAuth: () => ({
    login: mocks.login,
    register: mocks.register,
    token: null,
  }),
}))

vi.mock('../../../services/api', () => ({
  authApi: {
    forgotPassword: mocks.forgotPassword,
    resetPassword: mocks.resetPassword,
  },
}))

import Login from './Login'
import Register from './Register'
import ForgotPassword from './ForgotPassword'
import ResetPassword from './ResetPassword'

function LocationProbe() {
  const { search } = useLocation()
  return <output data-testid="location-search">{search}</output>
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('account access flows', () => {
  it('returns a verified login to its requested internal page', async () => {
    mocks.login.mockResolvedValue({
      email_verified_at: '2026-11-23T12:00:00Z',
    })
    const onNavigate = vi.fn()

    render(
      <MemoryRouter>
        <Login onNavigate={onNavigate} returnTo="/productos/crear" />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'ana@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'password' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() =>
      expect(onNavigate).toHaveBeenCalledWith('/productos/crear'),
    )
    expect(mocks.login).toHaveBeenCalledWith({
      email: 'ana@example.com',
      password: 'password',
    })
  })

  it('sends registration to the verification step without logging in', async () => {
    mocks.register.mockResolvedValue({ message: 'Instrucciones enviadas.' })
    const onNavigate = vi.fn()

    render(
      <MemoryRouter>
        <Register onNavigate={onNavigate} />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Ana' },
    })
    fireEvent.change(screen.getByLabelText('Apellido'), {
      target: { value: 'Pérez' },
    })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'ana@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'StrongPassword123' },
    })
    fireEvent.change(screen.getByLabelText('Confirma la Contraseña'), {
      target: { value: 'StrongPassword123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    await waitFor(() =>
      expect(onNavigate).toHaveBeenCalledWith('/verify-email'),
    )
    expect(mocks.register).toHaveBeenCalledOnce()
  })

  it('shows the same password-recovery confirmation after submission', async () => {
    mocks.forgotPassword.mockResolvedValue({
      message: 'Si existe una cuenta, recibirás instrucciones.',
    })

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'ana@example.com' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Enviar instrucciones' }),
    )

    expect((await screen.findByRole('status')).textContent).toContain(
      'Si existe una cuenta, recibirás instrucciones.',
    )
    expect(mocks.forgotPassword).toHaveBeenCalledWith('ana@example.com')
  })

  it('submits the token and matching password from the reset link', async () => {
    mocks.resetPassword.mockResolvedValue({
      message: 'Contraseña restablecida.',
    })

    render(
      <MemoryRouter
        initialEntries={[
          '/reset-password?token=reset-token&email=ana%40example.com',
        ]}
      >
        <ResetPassword />
        <LocationProbe />
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(screen.getByTestId('location-search').textContent).toBe(''),
    )
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'NewStrongPassword123' },
    })
    fireEvent.change(screen.getByLabelText('Confirma la contraseña'), {
      target: { value: 'NewStrongPassword123' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Restablecer contraseña' }),
    )

    await waitFor(() =>
      expect(mocks.resetPassword).toHaveBeenCalledWith({
        email: 'ana@example.com',
        token: 'reset-token',
        password: 'NewStrongPassword123',
        password_confirmation: 'NewStrongPassword123',
      }),
    )
    expect(
      (await screen.findByText('Contraseña restablecida.')).textContent,
    ).toBe('Contraseña restablecida.')
  })
})
