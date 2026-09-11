import type { MoveRecord } from '../core/types'

export interface MoveHistoryProps {
  history: MoveRecord[]
}

interface MoveRow {
  number: number
  white?: string
  black?: string
}

function toRows(history: MoveRecord[]): MoveRow[] {
  const rows: MoveRow[] = []

  for (let i = 0; i < history.length; i += 2) {
    rows.push({
      number: i / 2 + 1,
      white: history[i]?.san,
      black: history[i + 1]?.san,
    })
  }

  return rows
}

/**
 * Presentational: renders move history as "1. e4 e5" rows.
 */
export default function MoveHistory({ history }: MoveHistoryProps) {
  const rows = toRows(history)

  if (rows.length === 0) {
    return (
      <div className="move-history move-history--empty">
        No moves yet
      </div>
    )
  }

  return (
    <div className="move-history">
      {rows.map((row) => (
        <div className="move-history-row" key={row.number}>
          <span className="move-number">{row.number}.</span>
          <span className="move-white">{row.white ?? ''}</span>
          <span className="move-black">{row.black ?? ''}</span>
        </div>
      ))}
    </div>
  )
}
