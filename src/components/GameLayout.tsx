import type { ReactNode } from 'react'
import type { GameStatus as GameStatusModel, MoveRecord } from '../core/types'
import GameStatus from './GameStatus'
import MoveHistory from './MoveHistory'
import GameControls from './GameControls'

export interface GameLayoutProps {
  header?: ReactNode
  board: ReactNode
  status: GameStatusModel
  history: MoveRecord[]
  onUndo(): void
  onReset(): void
}

/**
 * Presentational page skeleton: header + main (board area + side panel).
 * Wiring to GameCore happens in a later task; this only lays out props.
 */
export default function GameLayout({
  header,
  board,
  status,
  history,
  onUndo,
  onReset,
}: GameLayoutProps) {
  return (
    <div className="game-layout">
      <header className="game-header">
        {header ?? <h1>Plugin Chess</h1>}
      </header>

      <main className="game-main">
        <section className="board-area">{board}</section>

        <aside className="side-panel">
          <GameStatus status={status} />
          <MoveHistory history={history} />
          <GameControls onUndo={onUndo} onReset={onReset} />
        </aside>
      </main>
    </div>
  )
}
