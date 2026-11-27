import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import CarritoPanel from './CarritoPanel'
import { agregarProducto, vaciarCarrito } from './carritoDemo'

afterEach(() => {
  cleanup()
  vaciarCarrito()
})

describe('carrito', () => {
  it('muestra la ficha real del producto añadido desde su detalle', () => {
    agregarProducto('api-product-42', {
      id: 'api-product-42',
      titulo: 'Audífonos de prueba',
      marca: 'AEGIS Audio',
      precio: 125000,
      imagen: '/audifonos.jpg',
    })

    render(<CarritoPanel />)

    const item = screen.getByRole('img', { name: 'Audífonos de prueba' }).closest('.car-item')
    expect(within(item).getByText('Audífonos de prueba')).toBeTruthy()
    expect(within(item).getByText('$125.000')).toBeTruthy()
    expect(item.querySelector('img').getAttribute('src')).toBe('/audifonos.jpg')
  })
})
