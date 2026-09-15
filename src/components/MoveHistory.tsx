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
 * Presentational: the MOVE LOG panel — zero-padded numbered SAN rows.
 */
export default function MoveHistory({ history }: MoveHistoryProps) {
  const rows = toRows(history)

  return (
    <section className="move-history" aria-label="棋谱记录">
      <h2 className="move-history__heading">MOVE LOG</h2>
      {rows.length === 0 ? (
        <p className="move-history__empty">NO MOVES YET</p>
      ) : (
        <div className="move-history__rows">
          {rows.map((row) => (
            <div className="move-history-row" key={row.number}>
              <span className="move-number">
                {String(row.number).padStart(2, '0')}
              </span>
              <span className="move-white">{row.white ?? ''}</span>
              <span className="move-black">{row.black ?? '—'}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
