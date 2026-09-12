import { useEffect, useMemo, useState } from 'react'
import { GameCore } from './core/GameCore'
import { PluginRegistry } from './core/PluginRegistry'
import {
  defaultGameConfig,
  type AppGameConfig,
} from './config/defaultGameConfig'
import { useGameCore } from './hooks/useGameCore'
import {
  chessComTheme,
  themeToCssVariables,
} from './plugins/themes/ChessComTheme'
import type { ThemePlugin } from './plugins/themes/ThemePlugin'
import GameLayout from './components/GameLayout'
import GameErrorBoundary from './components/GameErrorBoundary'
import PromotionDialog from './components/PromotionDialog'
import GameResultDialog from './components/GameResultDialog'

interface AppProps {
  config?: AppGameConfig
}

/**
 * Resolves the configured theme defensively: if it is missing from the
 * registry or its tokens are malformed, fall back to the built-in
 * Chess.com theme so a broken theme never takes the app down.
 */
function resolveTheme(
  configTheme: ThemePlugin,
  registry: PluginRegistry,
): ThemePlugin {
  try {
    const theme = registry.getTheme(configTheme.id)
    // Validate eagerly so a malformed theme falls back before it is
    // injected into the DOM.
    themeToCssVariables(theme)
    return theme
  } catch {
    return chessComTheme
  }
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
      theme: resolveTheme(config.theme, registry),
      board: registry.getBoard(config.board.id),
    }
  }, [config])

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const off = core.on('error', (error) => {
      setErrorMessage(error.message)
    })
    return off
  }, [core])

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
      {errorMessage && (
        <div role="alert" className="error-banner">
          {errorMessage}
        </div>
      )}

      <GameLayout
        board={
          <GameErrorBoundary>
            <BoardComponent
              position={state.board}
              status={state.status}
              selectedSquare={selectedSquare}
              legalMoves={legalMoves}
              lastMove={lastMove}
              onSquareSelect={selectSquare}
              onMove={move}
            />
          </GameErrorBoundary>
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
