import { render } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import PixelSprite from './PixelSprite'

const ART = [
  '.aa.',
  'abba',
  'aaaa',
] as const

const PALETTE = { a: '#ffffff', b: '#000000' }

describe('PixelSprite', () => {
  test('renders a crisp-edges svg sized from the art grid', () => {
    const { container } = render(
      <PixelSprite art={ART} palette={PALETTE} className="sprite" />,
    )

    const svg = container.querySelector('svg.sprite')
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute('viewBox', '0 0 4 3')
    expect(svg).toHaveAttribute('shape-rendering', 'crispEdges')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg?.textContent).toBe('')
  })

  test('merges consecutive same-color cells into single rects', () => {
    const { container } = render(
      <PixelSprite art={ART} palette={PALETTE} />,
    )

    const rects = [...container.querySelectorAll('rect')]
    // Row 0: 'aa' at x1..2 -> one rect; row 1: 'a','bb','a' -> three
    // rects; row 2: 'aaaa' -> one rect. Total 5 rects.
    expect(rects).toHaveLength(5)

    const firstRow = rects.find(
      (r) => r.getAttribute('y') === '0',
    )
    expect(firstRow).toHaveAttribute('x', '1')
    expect(firstRow).toHaveAttribute('width', '2')
    expect(firstRow).toHaveAttribute('fill', '#ffffff')
  })

  test('renders an outline layer behind the fill when outline is set', () => {
    const { container } = render(
      <PixelSprite art={['.a.']} palette={PALETTE} outline="#123456" />,
    )

    const rects = [...container.querySelectorAll('rect')]
    const outlineRects = rects.filter(
      (r) => r.getAttribute('fill') === '#123456',
    )
    // The in-grid empty neighbours of the filled cell are the two cells
    // flanking it; out-of-grid neighbours are not painted.
    expect(outlineRects).toHaveLength(2)
    expect(outlineRects[0]).toHaveAttribute('x', '0')
    expect(outlineRects[1]).toHaveAttribute('x', '2')
    // Outline layer is painted before the fill layer.
    expect(rects[rects.length - 1]).toHaveAttribute('fill', '#ffffff')
  })
})
