import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Ajustes from './Ajustes'
import { preferenceApi } from '../../../services/api'

vi.mock('../../layouts/Header', () => ({ default: () => <header /> }))
vi.mock('../../layouts/Footer', () => ({ default: () => <footer /> }))
vi.mock('../../../services/api', () => ({
  preferenceApi: {
    get: vi.fn(),
    update: vi.fn(),
    reset: vi.fn(),
  },
}))

afterEach(cleanup)

describe('vista de ajustes', () => {
  beforeEach(() => {
    preferenceApi.get.mockResolvedValue({
      data: {
        apariencia: {
          tema: 'dark',
          acento: 'indigo',
          densidad: 'normal',
          contraste: 'estandar',
        },
      },
      version: 1,
    })
  })

  it('muestra el menú de ajustes sin la navegación lateral general', async () => {
    render(
      <MemoryRouter>
        <Ajustes auth={{ token: 'test-token' }} />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('navigation', { name: 'Categorías de ajustes' })).toBeTruthy()
    expect(screen.queryByRole('navigation', { name: 'Navegación lateral' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Ajustes de la cuenta' })).toBeTruthy()
  })
})
