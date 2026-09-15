import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import type { Color, PieceType } from '../../../core/types'
import PixelPiece from './PixelPiece'

const COLORS: readonly Color[] = ['white', 'black']
const TYPES: readonly PieceType[] = [
  'king',
  'queen',
  'rook',
  'bishop',
  'knight',
  'pawn',
]

const UNICODE_GLYPHS = /[♔♕♖♗♘♙♚♛♜♝♞♟]/

describe('PixelPiece', () => {
  test('renders a labelled 32x32 crisp-edge svg with no text glyph', () => {
    render(<PixelPiece piece={{ color: 'white', type: 'king' }} title="white king" />)

    const king = screen.getByLabelText('white king')
    expect(king.tagName.toLowerCase()).toBe('svg')
    expect(king).toHaveAttribute('viewBox', '0 0 32 32')
    expect(king).toHaveAttribute('shape-rendering', 'crispEdges')
    expect(king).toHaveAttribute('data-piece', 'white-king')
    expect(king.textContent).toBe('')
  })

  test('renders every color/type combination with a data-piece marker', () => {
    for (const color of COLORS) {
      for (const type of TYPES) {
        const { container, unmount } = render(
          <PixelPiece piece={{ color, type }} />,
        )
        const svg = container.querySelector(`[data-piece="${color}-${type}"]`)
        expect(svg).not.toBeNull()
        // A real silhouette sprite, not an empty frame.
        expect(svg!.querySelectorAll('rect').length).toBeGreaterThan(10)
        unmount()
      }
    }
  })

  test('never renders unicode chess glyphs', () => {
    for (const color of COLORS) {
      for (const type of TYPES) {
        const { container, unmount } = render(
          <PixelPiece piece={{ color, type }} />,
        )
        expect(container.textContent ?? '').not.toMatch(UNICODE_GLYPHS)
        unmount()
      }
    }
  })

  test('all six silhouettes of a color are visually distinct', () => {
    const markups = new Set<string>()
    for (const type of TYPES) {
      const { container, unmount } = render(
        <PixelPiece piece={{ color: 'white', type }} />,
      )
      markups.add(container.innerHTML)
      unmount()
    }
    expect(markups.size).toBe(TYPES.length)
  })

  test('white pieces use the warm palette and black pieces the cool palette', () => {
    const { container: white, unmount: unmountWhite } = render(
      <PixelPiece piece={{ color: 'white', type: 'pawn' }} />,
    )
    const whiteFills = new Set(
      [...white.querySelectorAll('rect')].map((rect) =>
        rect.getAttribute('fill'),
      ),
    )
    expect(whiteFills).toContain('#f2e7c9')
    expect(whiteFills).toContain('#493521')
    unmountWhite()

    const { container: black } = render(
      <PixelPiece piece={{ color: 'black', type: 'pawn' }} />,
    )
    const blackFills = new Set(
      [...black.querySelectorAll('rect')].map((rect) =>
        rect.getAttribute('fill'),
      ),
    )
    expect(blackFills).toContain('#9eacb7')
    expect(blackFills).toContain('#101827')
  })

  test('applies a custom className to the svg', () => {
    const { container } = render(
      <PixelPiece piece={{ color: 'black', type: 'rook' }} className="board-piece" />,
    )
    expect(container.querySelector('svg')).toHaveClass('board-piece')
  })
})
