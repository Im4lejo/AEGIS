import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Index from './Index'
import { productApi } from '../../../services/api'

vi.mock('../../../services/api', () => ({
  productApi: {
    categories: vi.fn(),
    list: vi.fn(),
    compare: vi.fn(),
  },
}))

vi.mock('../../layouts/Header', () => ({ default: () => null }))
vi.mock('../../layouts/WorkspaceChrome', () => ({
  default: ({ children }) => children,
}))
vi.mock('../../layouts/Footer', () => ({ default: () => null }))

afterEach(cleanup)

beforeEach(() => {
  vi.clearAllMocks()
  productApi.categories.mockResolvedValue({ data: [] })
  productApi.list.mockResolvedValue({
    data: [
      {
        id: 101,
        titulo: 'Audífonos con descuento',
        precio: 120000,
        descuento: 15,
        estado_producto: 'nuevo',
        categoria: { nombre: 'Audio' },
        imagenes: [],
        vendedor: { nombre: 'Tienda A' },
      },
      {
        id: 102,
        titulo: 'Teclado sin descuento',
        precio: 80000,
        descuento: 0,
        estado_producto: 'nuevo',
        categoria: { nombre: 'Periféricos' },
        imagenes: [],
        vendedor: { nombre: 'Tienda B' },
      },
    ],
  })
})

describe('catálogo de ofertas', () => {
  it('filtra los productos sin descuento y permite quitar el filtro', async () => {
    const onNavigate = vi.fn()
    render(
      <Index
        auth={null}
        filtros={{ filtro: 'ofertas' }}
        onNavigate={onNavigate}
        vista="/productos"
      />,
    )

    expect(
      await screen.findByRole('heading', { name: 'Audífonos con descuento' }),
    ).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Productos en oferta' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Teclado sin descuento' })).toBeNull()
    expect(window.location.hash).toContain('filtro=ofertas')

    fireEvent.click(screen.getByRole('button', { name: /Solo productos en oferta/ }))
    expect(onNavigate).toHaveBeenCalledWith('/productos')
  })
})

describe('búsqueda de productos', () => {
  it('solicita y muestra los productos para el término recibido desde la barra', async () => {
    productApi.list.mockResolvedValueOnce({
      data: [
        {
          id: 103,
          titulo: 'Reloj inteligente',
          precio: 180000,
          descuento: 0,
          estado_producto: 'nuevo',
          categoria: { nombre: 'Relojes' },
          imagenes: [],
          vendedor: { nombre: 'Tienda C' },
        },
      ],
    })

    render(
      <Index
        auth={null}
        filtros={{ busqueda: 'reloj inteligente' }}
        onNavigate={vi.fn()}
        vista="/productos"
      />,
    )

    expect(await screen.findByRole('heading', { name: 'Reloj inteligente' })).toBeTruthy()
    expect(productApi.list).toHaveBeenCalledWith(
      expect.objectContaining({ busqueda: 'reloj inteligente' }),
    )
  })
})
