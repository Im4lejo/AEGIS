import { cleanup, fireEvent, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Sidebar from './Sidebar'

afterEach(cleanup)

describe('navegación contextual del foro', () => {
  it('muestra Comunidades bajo Popular con el mismo estilo y navega a la página', () => {
    const onNavigate = vi.fn()
    const { container } = render(
      <Sidebar
        busqueda=""
        onNavigate={onNavigate}
        orden="populares"
        setBusqueda={vi.fn()}
        setOrden={vi.fn()}
        setTemaActivo={vi.fn()}
        temaActivo={null}
      />,
    )
    const nav = container.querySelector('.foro-side-nav')
    const links = nav.querySelectorAll('.foro-side-link')

    expect([...links].map((link) => link.textContent.trim())).toEqual([
      'Principal',
      'Popular',
      'Comunidades',
    ])
    expect(links[2].classList.contains('foro-side-link')).toBe(true)

    fireEvent.click(within(nav).getByRole('link', { name: 'Comunidades' }))
    expect(onNavigate).toHaveBeenCalledWith('/comunidades')
  })
})
