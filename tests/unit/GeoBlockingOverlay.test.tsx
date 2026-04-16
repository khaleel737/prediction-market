import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import GeoBlockingOverlay from '@/components/GeoBlockingOverlay'

vi.mock('radix-ui', () => ({
  Dialog: {
    Root: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'dialog-root', ...props }, children),
    Portal: ({ children }: any) => React.createElement('div', { 'data-testid': 'dialog-portal' }, children),
    Overlay: (props: any) => React.createElement('div', { 'data-testid': 'dialog-overlay', ...props }),
    Content: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'dialog-content', ...props }, children),
    Title: ({ children, ...props }: any) => React.createElement('h2', props, children),
    Description: ({ children, ...props }: any) => React.createElement('p', props, children),
    Close: ({ children, ...props }: any) => React.createElement('button', props, children),
    Trigger: ({ children, ...props }: any) => React.createElement('button', props, children),
  },
}))

describe('geoBlockingOverlay', () => {
  it('renders nothing when blockedCountries is empty', () => {
    const { container } = render(
      <GeoBlockingOverlay
        blockedCountries={[]}
        message="Blocked"
        customGeoHeader=""
      />,
    )

    expect(container.innerHTML).toBe('')
  })

  it('renders nothing initially before geo check completes', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ country: null })),
    )

    const { container } = render(
      <GeoBlockingOverlay
        blockedCountries={['US']}
        message="Blocked"
        customGeoHeader=""
      />,
    )

    expect(container.querySelector('[data-testid="dialog-root"]')).toBeNull()
  })

  it('fetches from /api/geo without custom header by default', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ country: null })),
    )

    render(
      <GeoBlockingOverlay
        blockedCountries={['US']}
        message="Blocked"
        customGeoHeader=""
      />,
    )

    expect(fetchSpy).toHaveBeenCalledWith('/api/geo')
  })

  it('fetches with custom header param when provided', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ country: null })),
    )

    render(
      <GeoBlockingOverlay
        blockedCountries={['US']}
        message="Blocked"
        customGeoHeader="CF-IPCountry"
      />,
    )

    expect(fetchSpy).toHaveBeenCalledWith('/api/geo?header=CF-IPCountry')
  })

  it('shows dialog when country is in blocked list', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ country: 'US' })),
    )

    render(
      <GeoBlockingOverlay
        blockedCountries={['US', 'CN']}
        message="Not available in your region."
        customGeoHeader=""
      />,
    )

    expect(await screen.findByText('Region Restricted')).toBeTruthy()
    expect(screen.getByText('Not available in your region.')).toBeTruthy()
  })

  it('does not show dialog when country is not blocked', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ country: 'DE' })),
    )

    const { container } = render(
      <GeoBlockingOverlay
        blockedCountries={['US', 'CN']}
        message="Blocked"
        customGeoHeader=""
      />,
    )

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="dialog-root"]')).toBeNull()
    })
  })

  it('shows default message when custom message is empty', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ country: 'US' })),
    )

    render(
      <GeoBlockingOverlay
        blockedCountries={['US']}
        message=""
        customGeoHeader=""
      />,
    )

    expect(await screen.findByText('This platform is not available in your region.')).toBeTruthy()
  })
})
