import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Home from './Home'
import { advancedContentApi, productApi } from '../../../services/api'

vi.mock('../../../services/api', () => ({
  advancedContentApi: { stories: vi.fn() },
  productApi: { home: vi.fn(), list: vi.fn() },
}))

vi.mock('../../layouts/Header', () => ({ default: () => null }))
vi.mock('../../layouts/Footer', () => ({ default: () => null }))

const products = [
  {
    id: 1,
    titulo: 'Reloj inteligente',
    precio: 120000,
    categoria: { nombre: 'Relojes' },
  },
  {
    id: 2,
    titulo: 'Reloj deportivo',
    precio: 150000,
    categoria: { nombre: 'Relojes' },
  },
  {
    id: 3,
    titulo: 'Celular de prueba',
    precio: 800000,
    categoria: { nombre: 'Celulares' },
  },
  {
    id: 4,
    titulo: 'Portátil gamer',
    precio: 3500000,
    categoria: { nombre: 'Computadores' },
  },
  {
    id: 5,
    titulo: 'Audífonos inalámbricos',
    precio: 480000,
    categoria: { nombre: 'Audio' },
  },
  {
    id: 6,
    titulo: 'Monitor gaming',
    precio: 890000,
    categoria: { nombre: 'Monitores' },
  },
  {
    id: 7,
    titulo: 'Cámara mirrorless',
    precio: 2100000,
    categoria: { nombre: 'Fotografía' },
  },
]

afterEach(cleanup)

beforeEach(() => {
  vi.clearAllMocks()
  productApi.home.mockResolvedValue({ data: products })
  productApi.list.mockResolvedValue({ data: products })
  advancedContentApi.stories.mockResolvedValue({ data: [] })
})

describe('Home', () => {
  it('separa el carrusel y los reels con títulos y crea carruseles por categoría', async () => {
    render(<Home auth={null} onNavigate={vi.fn()} />)

    expect(await screen.findByRole('heading', { name: 'Relojes' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Productos destacados' })).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'Ofertas destacadas de la semana' }),
    ).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Productos de Relojes' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Celulares' })).toBeNull()
    const reels = await screen.findAllByRole('button', { name: /^Ver reel de / })
    expect(reels).toHaveLength(7)
    expect(reels.every((reel) => reel.classList.contains('aegis-story--promo'))).toBe(true)
    const banner = screen.getByRole('link', { name: 'Explorar marketplace' })
    expect(banner.getAttribute('href')).toBe('#/productos')
    expect(productApi.list).toHaveBeenCalledWith({
      per_page: 50,
      sort: 'reciente',
    })
  })

  it('lleva el banner a productos en oferta y muestra solo descuentos reales', async () => {
    const navigate = vi.fn()
    productApi.list.mockResolvedValue({
      data: [
        { ...products[0], descuento: 20 },
        { ...products[1], descuento: 0 },
      ],
    })

    render(<Home auth={null} onNavigate={navigate} />)

    const banner = await screen.findByRole('link', {
      name: 'Ver todos los productos en oferta',
    })
    expect(banner.getAttribute('href')).toBe('#/productos?filtro=ofertas')
    expect(banner.textContent).toContain('Reloj inteligente')
    expect(banner.textContent).not.toContain('Reloj deportivo')

    fireEvent.click(banner)
    expect(navigate).toHaveBeenCalledWith('/productos?filtro=ofertas')
  })
})
