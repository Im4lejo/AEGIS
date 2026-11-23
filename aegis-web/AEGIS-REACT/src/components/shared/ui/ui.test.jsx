import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Dropdown,
  Drawer,
  EmptyState,
  ErrorBoundary,
  ErrorState,
  Input,
  Modal,
  PostCard,
  ProductCard,
  Select,
  Skeleton,
  Tabs,
  Textarea,
  Toast,
} from './index'
import { ThemeProvider, ThemeSelector } from '../../../theme/ThemeProvider'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  delete document.documentElement.dataset.theme
})

describe('shared accessible components', () => {
  it('associates input labels and validation messages with the control', () => {
    render(<Input id="email" label="Correo" error="Formato inválido" />)
    const input = screen.getByLabelText('Correo')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(
      document.getElementById(input.getAttribute('aria-describedby'))
        .textContent,
    ).toBe('Formato inválido')
  })

  it('renders select and textarea as labelled native controls', () => {
    render(
      <>
        <Select label="Categoría">
          <option>Hardware</option>
        </Select>
        <Textarea label="Descripción" />
      </>,
    )
    expect(screen.getByLabelText('Categoría').tagName).toBe('SELECT')
    expect(screen.getByLabelText('Descripción').tagName).toBe('TEXTAREA')
  })

  it('keeps disabled buttons non-interactive', () => {
    render(<Button disabled>Guardar</Button>)
    expect(screen.getByRole('button', { name: 'Guardar' }).disabled).toBe(true)
  })

  it('supports arrow-key navigation between tabs', () => {
    render(
      <Tabs
        tabs={[
          { id: 'for-you', label: 'Para ti', content: 'Productos para ti' },
          { id: 'recent', label: 'Recientes', content: 'Productos recientes' },
        ]}
      />,
    )
    const firstTab = screen.getByRole('tab', { name: 'Para ti' })
    firstTab.focus()
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' })
    expect(
      screen
        .getByRole('tab', { name: 'Recientes' })
        .getAttribute('aria-selected'),
    ).toBe('true')
    expect(screen.getByRole('tabpanel').textContent).toBe('Productos recientes')
  })

  it('traps modal focus and closes with Escape', async () => {
    function ModalHarness() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>Abrir</button>
          <Modal open={open} onClose={() => setOpen(false)} title="Confirmar">
            <button>Continuar</button>
          </Modal>
        </>
      )
    }

    render(<ModalHarness />)
    const trigger = screen.getByRole('button', { name: 'Abrir' })
    trigger.focus()
    fireEvent.click(trigger)
    screen.getByRole('dialog', { name: 'Confirmar' })
    await waitFor(() =>
      expect(document.activeElement.getAttribute('aria-label')).toBe(
        'Cerrar diálogo',
      ),
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it('renders a drawer as a modal dialog', () => {
    render(
      <Drawer open onClose={() => {}} title="Menú">
        Contenido
      </Drawer>,
    )
    expect(
      screen.getByRole('dialog', { name: 'Menú' }).getAttribute('aria-modal'),
    ).toBe('true')
  })

  it('opens dropdown items by keyboard and invokes their action', () => {
    const onSelect = vi.fn()
    render(
      <Dropdown label="Opciones" items={[{ label: 'Editar', onSelect }]} />,
    )
    const trigger = screen.getByRole('button', { name: 'Opciones' })
    fireEvent.click(trigger)
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    const item = screen.getByRole('menuitem', { name: 'Editar' })
    expect(document.activeElement).toBe(item)
    fireEvent.click(item)
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('announces toast, empty, and error states accessibly', () => {
    render(
      <>
        <Toast message="Guardado" tone="success" />
        <EmptyState title="Sin productos" message="Prueba otros filtros." />
        <ErrorState error={{ status: 403, message: 'No permitido.' }} />
      </>,
    )
    expect(screen.getByText('Guardado').closest('[role="status"]')).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toContain('No permitido.')
    expect(screen.getByText('Prueba otros filtros.')).toBeTruthy()
  })

  it('renders avatar fallback, badge, card, and skeleton without decorative actions', () => {
    const { container } = render(
      <>
        <Avatar name="Ana Pérez" />
        <Badge tone="success">Verificado</Badge>
        <Card as="article">Información</Card>
        <Skeleton width="8rem" />
      </>,
    )
    expect(screen.getByRole('img', { name: 'Ana Pérez' }).textContent).toBe(
      'AP',
    )
    expect(screen.getByText('Verificado')).toBeTruthy()
    expect(screen.getByText('Información').closest('article')).toBeTruthy()
    expect(
      container.querySelector('.ui-skeleton').getAttribute('aria-hidden'),
    ).toBe('true')
    expect(container.querySelectorAll('button')).toHaveLength(0)
  })

  it('links product cards to the existing detail route and keeps post content semantic', () => {
    render(
      <>
        <ProductCard product={{ id: 21, titulo: 'Teclado', precio: 120000 }} />
        <PostCard
          post={{
            autor: 'ana',
            titulo: 'Consulta',
            contenido: '¿Qué recomiendan?',
          }}
        />
      </>,
    )
    expect(
      screen.getByRole('link', { name: /Teclado/ }).getAttribute('href'),
    ).toBe('#/productos/detalle?id=21')
    expect(screen.getByRole('article').textContent).toContain(
      '¿Qué recomiendan?',
    )
  })

  it('closes confirmations and shows rejected actions instead of hiding failures', async () => {
    const rejectedAction = vi
      .fn()
      .mockRejectedValue(new Error('No se pudo guardar'))
    render(
      <ConfirmDialog
        open
        onClose={() => {}}
        onConfirm={rejectedAction}
        title="Eliminar"
        message="¿Continuar?"
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect((await screen.findByRole('alert')).textContent).toContain(
      'No se pudo guardar',
    )
    expect(rejectedAction).toHaveBeenCalledOnce()
  })

  it('stores the theme preference and applies the selected theme', async () => {
    render(
      <ThemeProvider>
        <ThemeSelector />
      </ThemeProvider>,
    )
    fireEvent.change(screen.getByLabelText('Preferencia de apariencia'), {
      target: { value: 'dark' },
    })
    await waitFor(() =>
      expect(document.documentElement.dataset.theme).toBe('dark'),
    )
    expect(window.localStorage.getItem('aegis.theme.preference.v1')).toBe(
      'dark',
    )
  })

  it('renders a safe error boundary fallback', () => {
    function BrokenView() {
      throw new Error('private internal detail')
    }
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <BrokenView />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert').textContent).toContain('Algo salió mal')
    expect(screen.queryByText('private internal detail')).toBeNull()
    error.mockRestore()
  })
})
