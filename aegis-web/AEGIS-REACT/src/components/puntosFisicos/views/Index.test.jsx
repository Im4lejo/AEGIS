import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Index from './Index'
import { meetingApi } from '../../../services/api'

vi.mock('../../layouts/Header', () => ({ default: () => <header /> }))
vi.mock('../../layouts/Footer', () => ({ default: () => <footer /> }))
vi.mock('../../layouts/WorkspaceChrome', () => ({
  default: ({ children }) => <div>{children}</div>,
}))
vi.mock('../../../services/api', () => ({
  meetingApi: { points: vi.fn() },
}))

afterEach(cleanup)

describe('puntos de encuentro', () => {
  beforeEach(() => {
    meetingApi.points.mockResolvedValue({
      data: [
        {
          id: 1,
          nombre: 'Punto AEGIS Centro',
          direccion: 'Carrera 9 # 7-45',
          ciudad: 'Popayán',
          horario: 'Lunes a viernes',
          servicios: ['Zona segura'],
        },
        {
          id: 2,
          nombre: 'Punto AEGIS Norte',
          direccion: 'Calle 5 # 10-20',
          ciudad: 'Popayán',
          servicios: [],
        },
      ],
    })
  })

  it('expande los detalles debajo del punto seleccionado y permite cerrarlos', async () => {
    render(<Index />)
    const list = await screen.findByRole('region', { name: 'Puntos de encuentro disponibles' })
    const firstPoint = within(list).getByRole('button', { name: /Punto AEGIS Centro/ })

    fireEvent.click(firstPoint)
    expect(firstPoint.getAttribute('aria-expanded')).toBe('true')
    expect(within(list).getByRole('region', { name: 'Detalles de Punto AEGIS Centro' })).toBeTruthy()
    expect(within(list).getByText('Zona segura')).toBeTruthy()

    fireEvent.click(firstPoint)
    expect(firstPoint.getAttribute('aria-expanded')).toBe('false')
    expect(within(list).queryByRole('region', { name: 'Detalles de Punto AEGIS Centro' })).toBeNull()
  })
})
