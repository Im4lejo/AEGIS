import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Foro from './Foro'
import { forumApi, videoApi } from '../../../services/api'

vi.mock('../../../auth/useAuth', () => ({
  useAuth: () => ({ token: null }),
}))

vi.mock('../../../services/api', () => ({
  forumApi: { list: vi.fn() },
  savedApi: { report: vi.fn() },
  videoApi: { capabilities: vi.fn() },
}))

vi.mock('../../layouts/Header', () => ({ default: () => null }))
vi.mock('../../layouts/WorkspaceChrome', () => ({
  default: ({ children }) => children,
}))
vi.mock('../../layouts/Footer', () => ({ default: () => null }))
vi.mock('../../layouts/Sidebar', () => ({ default: () => null }))

afterEach(cleanup)

beforeEach(() => {
  vi.clearAllMocks()
  forumApi.list.mockResolvedValue({ data: [], meta: {} })
  videoApi.capabilities.mockResolvedValue({ vod: false, live: false })
})

describe('banners del foro', () => {
  it('lleva cada banner al Marketplace', async () => {
    const onNavigate = vi.fn()
    render(<Foro auth={null} onNavigate={onNavigate} />)

    const banners = await screen.findAllByRole('link', {
      name: 'OFERTAS INCREÍBLES HASTA -50% DTO.',
    })
    expect(banners).toHaveLength(2)
    expect(banners[0].getAttribute('href')).toBe('#/productos')

    fireEvent.click(banners[0])
    expect(onNavigate).toHaveBeenCalledWith('/productos')
  })
})
