export interface PixelSpriteProps {
  /** Rows of the sprite. Each character maps to a palette color; '.' and ' ' are transparent. */
  art: readonly string[]
  /** Maps art characters to CSS colors. `currentColor` is allowed. */
  palette: Record<string, string>
  /** When set, transparent cells adjacent to filled cells are painted with this color first, producing a crisp 1px outline. */
  outline?: string
  className?: string
  /** Accessible name. When set, the svg is exposed as `role="img"` instead of being hidden from assistive tech. */
  title?: string
  /** Extra attributes forwarded to the svg element (e.g. `data-piece`). */
  svgProps?: Record<string, string>
}

interface RectSpec {
  x: number
  y: number
  width: number
  fill: string
}

function colorAt(
  art: readonly string[],
  x: number,
  y: number,
): string | undefined {
  const ch = art[y]?.[x]
  return ch && ch !== '.' && ch !== ' ' ? ch : undefined
}

function collectRuns(
  cells: Array<string | undefined>,
  y: number,
  resolve: (key: string) => string | undefined,
): RectSpec[] {
  const runs: RectSpec[] = []
  let x = 0
  while (x < cells.length) {
    const key = cells[x]
    const fill = key ? resolve(key) : undefined
    if (!fill) {
      x += 1
      continue
    }
    let width = 1
    while (x + width < cells.length) {
      const nextKey = cells[x + width]
      if (!nextKey || resolve(nextKey) !== fill) break
      width += 1
    }
    runs.push({ x, y, width, fill })
    x += width
  }
  return runs
}

/**
 * Renders character-map pixel art as an SVG of integer rects with
 * `shape-rendering="crispEdges"`. No curves, no antialiasing, no text.
 */
export default function PixelSprite({
  art,
  palette,
  outline,
  className,
  title,
  svgProps,
}: PixelSpriteProps) {
  const height = art.length
  const width = art.reduce((max, row) => Math.max(max, row.length), 0)

  const outlineRects: RectSpec[] = []
  if (outline) {
    for (let y = 0; y < height; y += 1) {
      const row: Array<string | undefined> = []
      for (let x = 0; x < width; x += 1) {
        if (colorAt(art, x, y)) {
          row.push(undefined)
          continue
        }
        let touchesFill = false
        for (let dy = -1; dy <= 1 && !touchesFill; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (dx === 0 && dy === 0) continue
            if (colorAt(art, x + dx, y + dy)) {
              touchesFill = true
              break
            }
          }
        }
        row.push(touchesFill ? '__outline__' : undefined)
      }
      outlineRects.push(
        ...collectRuns(row, y, (key) =>
          key === '__outline__' ? outline : undefined,
        ),
      )
    }
  }

  const fillRects: RectSpec[] = []
  for (let y = 0; y < height; y += 1) {
    const row: Array<string | undefined> = []
    for (let x = 0; x < width; x += 1) {
      row.push(colorAt(art, x, y))
    }
    fillRects.push(...collectRuns(row, y, (key) => palette[key]))
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...svgProps}
    >
      {[...outlineRects, ...fillRects].map((rect, index) => (
        <rect
          key={index}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={1}
          fill={rect.fill}
        />
      ))}
    </svg>
  )
}
