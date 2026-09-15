import { useEffect, useMemo, useState } from 'react'
import { GameCore } from '../../core/GameCore'
import type { PluginRegistry } from '../../core/PluginRegistry'
import { resolveMatchConfig } from '../../app/MatchConfig'
import type { MatchConfig } from '../../app/MatchConfig'
import { useGameCore } from '../../hooks/useGameCore'
import { pixelForgeTheme } from '../../plugins/themes/PixelForgeTheme'
import { themeToCssVariables } from '../../plugins/themes/themeCss'
import type { ThemePlugin } from '../../plugins/themes/ThemePlugin'
import GameStatus from '../../components/GameStatus'
import MoveHistory from '../../components/MoveHistory'
import GameControls from '../../components/GameControls'
import PlayerBar from '../../components/PlayerBar'
import WizardGuide from '../../components/WizardGuide'
import GameErrorBoundary from '../../components/GameErrorBoundary'
import PromotionDialog from '../../components/PromotionDialog'
import GameResultDialog from '../../components/GameResultDialog'
import './GamePage.css'

export interface GamePageProps {
  matchConfig: Readonly<MatchConfig>
  registry: PluginRegistry
  onExit(): void
}

/**
 * Resolves the configured theme defensively: a theme whose tokens are
 * malformed falls back to the built-in Pixel Forge theme so a broken
 * theme never takes the match down.
 */
function resolveTheme(theme: ThemePlugin): ThemePlugin {
  try {
    themeToCssVariables(theme)
    return theme
  } catch {
    return pixelForgeTheme
  }
}

/**
 * The live match screen. Owns everything a running game needs — GameCore
 * assembly from the frozen MatchConfig, theme variable injection, the
 * Pixel Forge HUD (top bar, player bars, status/match-info/move-log/
 * wizard/controls) and the match dialogs — and nothing about Home/Setup
 * navigation beyond the `onExit` callback.
 */
export default function GamePage({
  matchConfig,
  registry,
  onExit,
}: GamePageProps) {
  const resolved = useMemo(
    () => resolveMatchConfig(matchConfig, registry),
    [matchConfig, registry],
  )

  const theme = useMemo(() => resolveTheme(resolved.theme), [resolved])

  const core = useMemo(
    () =>
      new GameCore({
        rules: resolved.rules,
        players: resolved.players,
        storage: resolved.storage,
      }),
    [resolved],
  )

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [pluginsOpen, setPluginsOpen] = useState(false)

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

    // On exit, restore the app-level Pixel Forge baseline that AppShell
    // injected, rather than stripping variables the shell still needs.
    return () => {
      const baseline = themeToCssVariables(pixelForgeTheme)
      for (const [name, value] of Object.entries(baseline)) {
        rootStyle.setProperty(name, value)
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
  const playing = state.status.phase === 'playing'

  const BoardComponent = resolved.board.Component

  const loadout = [
    { label: 'RULE', name: registry.getRule(matchConfig.ruleId).name },
    {
      label: 'WHITE',
      name: registry.getPlayer(matchConfig.whitePlayerId).name,
    },
    {
      label: 'BLACK',
      name: registry.getPlayer(matchConfig.blackPlayerId).name,
    },
    { label: 'BOARD', name: registry.getBoard(matchConfig.boardId).name },
    { label: 'THEME', name: registry.getTheme(matchConfig.themeId).name },
    {
      label: 'STORAGE',
      name: registry.getStorage(matchConfig.storageId).name,
    },
  ]

  // Top-bar chips highlight the four "material" plugins; the full
  // six-entry loadout lives in the match-info panel and loadout popover.
  const chips = loadout.filter((entry) =>
    ['RULE', 'BOARD', 'THEME', 'STORAGE'].includes(entry.label),
  )

  return (
    <div className="game-page">
      {errorMessage && (
        <div role="alert" className="error-banner">
          {errorMessage}
        </div>
      )}

      <header className="game-topbar">
        <div className="game-topbar__brand">
          <h1 className="game-page-brand">CHESSFORGE</h1>
          <span className="game-topbar__match">
            MATCH · PIXEL FORGE LOADOUT
          </span>
        </div>

        <ul className="plugin-chips" data-testid="plugin-chips">
          {chips.map((entry) => (
            <li key={entry.label} className="plugin-chip">
              <span className="plugin-chip__kind">{entry.label}</span>
              <span className="plugin-chip__name">{entry.name}</span>
            </li>
          ))}
        </ul>

        <div className="game-topbar__actions">
          <button
            type="button"
            className="game-page-header-btn"
            aria-expanded={pluginsOpen}
            onClick={() => setPluginsOpen((open) => !open)}
          >
            本局插件
          </button>
          <button
            type="button"
            className="game-page-header-btn"
            onClick={onExit}
          >
            退出对局
          </button>
        </div>
      </header>

      <div className="game-arena">
        <section className="game-board-column" aria-label="棋盘">
          <PlayerBar
            color="black"
            active={playing && state.status.turn === 'black'}
          />
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
          <PlayerBar
            color="white"
            active={playing && state.status.turn === 'white'}
          />
        </section>

        <aside className="game-hud" aria-label="对局面板">
          <GameStatus status={state.status} />

          <section className="match-info" data-testid="match-info">
            <h2 className="match-info__heading">对局信息</h2>
            <dl className="match-info__list">
              {loadout.map((entry) => (
                <div key={entry.label} className="match-info__row">
                  <dt>{entry.label}</dt>
                  <dd>{entry.name}</dd>
                </div>
              ))}
            </dl>
          </section>

          <MoveHistory history={state.history} />

          <WizardGuide status={state.status} history={state.history} />

          <GameControls onUndo={undo} onReset={reset} />
        </aside>
      </div>

      {pluginsOpen && (
        <section
          className="game-page-plugins"
          data-testid="loadout-panel"
          aria-label="本局插件配置"
        >
          <h2 className="game-page-plugins__title">CURRENT LOADOUT</h2>
          <dl className="game-page-plugins__list">
            {loadout.map((entry) => (
              <div key={entry.label} className="game-page-plugins__item">
                <dt>{entry.label}</dt>
                <dd>{entry.name}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

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
    </div>
  )
}
