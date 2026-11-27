import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PublicarProducto from './PublicarProducto'
import { productApi } from '../../../services/api'

vi.mock('../../../auth/useAuth', () => ({
  useAuth: () => ({ token: 'test-token' }),
}))
vi.mock('../../layouts/Header', () => ({ default: () => <header /> }))
vi.mock('../../layouts/Footer', () => ({ default: () => <footer /> }))
vi.mock('../../layouts/WorkspaceChrome', () => ({
  default: ({ children }) => <div>{children}</div>,
}))
vi.mock('../../../services/api', () => ({
  productApi: {
    categories: vi.fn(),
    create: vi.fn(),
  },
}))

afterEach(cleanup)

describe('publicar producto', () => {
  beforeEach(() => {
    productApi.categories.mockResolvedValue({ data: [{ id: 1, nombre: 'Audio' }] })
  })

  it('mantiene una sola carga multimedia dentro del formulario centrado', async () => {
    render(<PublicarProducto auth={{ user: { nombre: 'Usuario' } }} />)

    const upload = await screen.findByRole('button', { name: /Añadir imágenes o video/ })
    expect(upload.closest('.publish-card')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: 'Publicar' })).toHaveLength(1)
  })
})
