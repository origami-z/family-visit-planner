/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { MobileNav } from './MobileNav'

import { useIsMobile } from '@/hooks/use-mobile'

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
}))

const mockUseIsMobile = vi.mocked(useIsMobile)
const mockUseLocation = vi.mocked(useLocation)
const mockUseNavigate = vi.mocked(useNavigate)

describe('MobileNav', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
    mockUseNavigate.mockReturnValue(mockNavigate)
    mockUseLocation.mockReturnValue({ pathname: '/' } as ReturnType<
      typeof useLocation
    >)
  })

  afterEach(() => {
    cleanup()
  })

  it('renders nothing on desktop', () => {
    mockUseIsMobile.mockReturnValue(false)

    const { container } = render(<MobileNav />)

    expect(container.firstChild).toBeNull()
  })

  it('renders navigation bar on mobile', () => {
    mockUseIsMobile.mockReturnValue(true)

    render(<MobileNav />)

    const nav = screen.getByRole('navigation')
    expect(nav).toBeTruthy()

    expect(screen.getByText('Dashboard')).toBeTruthy()
    expect(screen.getByText('Members')).toBeTruthy()
    expect(screen.getByText('Calendar')).toBeTruthy()
    expect(screen.getByText('Settings')).toBeTruthy()
  })

  it('shows active state for dashboard on root path', () => {
    mockUseIsMobile.mockReturnValue(true)
    mockUseLocation.mockReturnValue({ pathname: '/' } as ReturnType<
      typeof useLocation
    >)

    render(<MobileNav />)

    const dashboardButton = screen.getByText('Dashboard').closest('button')
    const membersButton = screen.getByText('Members').closest('button')

    expect(dashboardButton?.getAttribute('data-active')).toBe('true')
    expect(membersButton?.getAttribute('data-active')).toBe('false')
  })

  it('shows active state for current route', () => {
    mockUseIsMobile.mockReturnValue(true)
    mockUseLocation.mockReturnValue({ pathname: '/members' } as ReturnType<
      typeof useLocation
    >)

    render(<MobileNav />)

    const dashboardButton = screen.getByText('Dashboard').closest('button')
    const membersButton = screen.getByText('Members').closest('button')

    expect(dashboardButton?.getAttribute('data-active')).toBe('false')
    expect(membersButton?.getAttribute('data-active')).toBe('true')
  })

  it('navigates when menu item is clicked', () => {
    mockUseIsMobile.mockReturnValue(true)

    render(<MobileNav />)

    const calendarButton = screen.getByText('Calendar').closest('button')
    fireEvent.click(calendarButton!)

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/calendar' })
  })

  it('navigates to each page correctly', () => {
    mockUseIsMobile.mockReturnValue(true)

    render(<MobileNav />)

    fireEvent.click(screen.getByText('Dashboard').closest('button')!)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })

    fireEvent.click(screen.getByText('Members').closest('button')!)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/members' })

    fireEvent.click(screen.getByText('Settings').closest('button')!)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/settings' })
  })

  it('has accessible navigation label', () => {
    mockUseIsMobile.mockReturnValue(true)

    render(<MobileNav />)

    const nav = screen.getByRole('navigation')
    expect(nav.getAttribute('aria-label')).toBe('Mobile navigation')
  })
})
