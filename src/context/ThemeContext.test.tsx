/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider, useTheme } from './ThemeContext'

function mockMatchMedia(prefersDark: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = []
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: prefersDark,
      media: query,
      onchange: null,
      addEventListener: vi.fn((event: string, cb: () => void) => {
        if (event === 'change') listeners.push(cb)
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
  return listeners
}

function TestComponent() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="resolved">{resolvedTheme}</div>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    mockMatchMedia(false)
  })

  afterEach(() => {
    cleanup()
  })

  it('defaults to system theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme').textContent).toBe('system')
  })

  it('applies dark class when dark theme is set', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByText('Set Dark'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(screen.getByTestId('resolved').textContent).toBe('dark')
  })

  it('removes dark class when light theme is set', () => {
    document.documentElement.classList.add('dark')
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByText('Set Light'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('persists theme preference to localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByText('Set Dark'))
    expect(localStorage.getItem('family-planner-theme')).toBe('dark')
  })

  it('respects system preference when theme is system and system prefers dark', () => {
    mockMatchMedia(true)
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('resolved').textContent).toBe('dark')
  })

  it('restores theme from localStorage on mount', () => {
    localStorage.setItem('family-planner-theme', 'dark')
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme').textContent).toBe('dark')
    expect(screen.getByTestId('resolved').textContent).toBe('dark')
  })
})
