import { useEffect, useMemo } from 'react'
import { GameCore } from './core/GameCore'
import { PluginRegistry } from './core/PluginRegistry'
import {
  defaultGameConfig,
  type AppGameConfig,
} from './config/defaultGameConfig'
import { useGameCore } from './hooks/useGameCore'
import { themeToCssVariables } from './plugins/themes/ChessComTheme'
import GameLayout from './components/GameLayout'
import PromotionDialog from './components/PromotionDialog'
import GameResultDialog from './components/GameResultDialog'

interface AppProps {
  config?: AppGameConfig
}

export default function App({ config = defaultGameConfig }: AppProps) {
  const core = useMemo(
    () =>
      new GameCore({
        rules: config.rules,
        players: config.players,
        storage: config.storage,
      }),
    [config],
  )

  const { theme, board } = useMemo(() => {
    const registry = new PluginRegistry()
    registry.registerTheme(config.theme)
    registry.registerBoard(config.board)
    return {
      theme: registry.getTheme(config.theme.id),
      board: registry.getBoard(config.board.id),
    }
  }, [config])

  useEffect(() => {
    const variables = themeToCssVariables(theme)
    const rootStyle = document.documentElement.style

    for (const [name, value] of Object.entries(variables)) {
      rootStyle.setProperty(name, value)
    }

    return () => {
      for (const name of Object.keys(variables)) {
        rootStyle.removeProperty(name)
      }
    }
  }, [theme])

  const {
    state,
    legalMoves,
    selectedSquare,
    pendingPromotion,
    selectSquare,
    move,
    selectPromotion,
    cancelPromotion,
    undo,
    reset,
  } = useGameCore(core)

  const lastMove = state.history[state.history.length - 1]

  const BoardComponent = board.Component

  return (
    <>
      <GameLayout
        board={
          <BoardComponent
            position={state.board}
            status={state.status}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            onSquareSelect={selectSquare}
            onMove={move}
          />
        }
        status={state.status}
        history={state.history}
        onUndo={undo}
        onReset={reset}
      />

      {pendingPromotion && (
        <PromotionDialog
          color={pendingPromotion.color}
          onSelect={selectPromotion}
          onCancel={cancelPromotion}
        />
      )}

      <GameResultDialog
        status={state.status}
        onReset={reset}
        onViewHistory={() => {
          const historyPanel = document.querySelector('.move-history')
          if (
            historyPanel &&
            typeof historyPanel.scrollIntoView === 'function'
          ) {
            historyPanel.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }
        }}
      />
    </>
  )
}
