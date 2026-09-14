import { useMemo } from 'react'
import PixelButton from '../../components/PixelButton'
import PixelPanel from '../../components/PixelPanel'
import { defaultMatchConfig } from '../../config/defaultGameConfig'
import type { MatchConfig } from '../../app/MatchConfig'
import type { PluginRegistry } from '../../core/PluginRegistry'
import { validateMatchConfig } from '../../app/MatchConfig'
import PluginSelector from './PluginSelector'
import './MatchSetupPage.css'

function getPluginName(
  registry: PluginRegistry,
  key: keyof MatchConfig,
  id: string,
): string {
  try {
    switch (key) {
      case 'ruleId':
        return registry.getRule(id).name
      case 'whitePlayerId':
      case 'blackPlayerId':
        return registry.getPlayer(id).name
      case 'boardId':
        return registry.getBoard(id).name
      case 'themeId':
        return registry.getTheme(id).name
      case 'storageId':
        return registry.getStorage(id).name
      default:
        return 'Unknown'
    }
  } catch {
    return 'Unavailable'
  }
}

export interface MatchSetupPageProps {
  config: MatchConfig
  registry: PluginRegistry
  onChange(config: MatchConfig): void
  onStart(config: MatchConfig): void
  onBack(): void
}

function RuleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function WhitePlayerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
      <path d="M12 10c-4 0-7 2-7 5v2h14v-2c0-3-3-5-7-5z" />
    </svg>
  )
}

function BlackPlayerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
      <path d="M12 10c-4 0-7 2-7 5v2h14v-2c0-3-3-5-7-5z" />
    </svg>
  )
}

function BoardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function ThemeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 3a9 9 0 0 1 0 18 9 9 0 0 1 0-18z" fill="currentColor" opacity="0.4" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  )
}

function StorageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L2 7l10 5 10-5-10-5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 17l10 5 10-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CrossedSwordsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14.5 17.5L20 22M3 22l5.5-4.5M20 2l-2 6-4-2 2-6M4 2l2 6 4-2-2-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const SELECTORS: Array<{
  key: keyof MatchConfig
  label: string
  sublabel: string
  icon: React.ReactNode
}> = [
  { key: 'ruleId', label: 'Rule Plugin', sublabel: '规则插件', icon: <RuleIcon /> },
  { key: 'whitePlayerId', label: 'White Player', sublabel: '白方玩家', icon: <WhitePlayerIcon /> },
  { key: 'blackPlayerId', label: 'Black Player', sublabel: '黑方玩家', icon: <BlackPlayerIcon /> },
  { key: 'boardId', label: 'Board Plugin', sublabel: '棋盘插件', icon: <BoardIcon /> },
  { key: 'themeId', label: 'Theme Plugin', sublabel: '主题插件', icon: <ThemeIcon /> },
  { key: 'storageId', label: 'Storage Plugin', sublabel: '存储插件', icon: <StorageIcon /> },
]

export default function MatchSetupPage({
  config,
  registry,
  onChange,
  onStart,
  onBack,
}: MatchSetupPageProps) {
  const errors = useMemo(() => validateMatchConfig(config, registry), [config, registry])
  const canStart = errors.length === 0

  const rulePlugins = useMemo(() => registry.getRulePlugins(), [registry])
  const playerPlugins = useMemo(() => registry.getPlayerPlugins(), [registry])
  const boardPlugins = useMemo(() => registry.getBoardPlugins(), [registry])
  const themePlugins = useMemo(() => registry.getThemePlugins(), [registry])
  const storagePlugins = useMemo(() => registry.getStoragePlugins(), [registry])

  const pluginLists: Record<string, Array<{ id: string; name: string }>> = {
    ruleId: rulePlugins,
    whitePlayerId: playerPlugins,
    blackPlayerId: playerPlugins,
    boardId: boardPlugins,
    themeId: themePlugins,
    storageId: storagePlugins,
  }

  const loadout = useMemo(
    () =>
      SELECTORS.map(({ key, sublabel }) => ({
        key,
        label: sublabel,
        name: getPluginName(registry, key, config[key]),
      })),
    [config, registry],
  )

  function handleChange(key: keyof MatchConfig, id: string) {
    onChange({ ...config, [key]: id })
  }

  function handleReset() {
    onChange({ ...defaultMatchConfig })
  }

  return (
    <div className="match-setup-page">
      <main className="match-setup-content">
        <PixelPanel className="match-setup-panel">
          <header className="match-setup-header">
            <button
              type="button"
              className="match-setup-back"
              onClick={onBack}
              aria-label="返回"
            >
              <BackArrowIcon />
              <span>返回</span>
            </button>

            <div className="match-setup-brand">
              <h1 className="match-setup-brand__title">CHESSFORGE</h1>
            </div>

            <div className="match-setup-titles">
              <h2 className="match-setup-titles__main">MATCH SETUP</h2>
              <h3 className="match-setup-titles__sub">配置本局插件</h3>
            </div>
          </header>

          <section className="match-setup-selectors" aria-label="插件配置">
            {SELECTORS.map(({ key, label, sublabel, icon }) => (
              <PluginSelector
                key={key}
                label={label}
                sublabel={sublabel}
                icon={icon}
                value={config[key]}
                options={pluginLists[key]}
                onChange={(id) => handleChange(key, id)}
              />
            ))}
          </section>

          <PixelPanel className="match-setup-loadout" role="region" aria-label="Current loadout">
            <h3 className="match-setup-loadout__title">CURRENT LOADOUT</h3>
            <ul className="match-setup-loadout__list">
              {loadout.map(({ key, label, name }) => (
                <li key={key} className="match-setup-loadout__item">
                  <span className="match-setup-loadout__label">{label}</span>
                  <span className="match-setup-loadout__value">{name}</span>
                </li>
              ))}
            </ul>
          </PixelPanel>

          {errors.length > 0 && (
            <div className="match-setup-errors" role="alert">
              {errors.map((error) => (
                <p key={error} className="match-setup-error">
                  {error}
                </p>
              ))}
            </div>
          )}

          <div className="match-setup-actions">
            <PixelButton
              variant="primary"
              className="match-setup-start-btn"
              disabled={!canStart}
              onClick={() => onStart(config)}
              aria-label="START MATCH"
            >
              <CrossedSwordsIcon aria-hidden="true" />
              <span className="match-setup-start-btn__text" aria-hidden="true">
                <span className="match-setup-start-btn__zh">开始游戏</span>
                <span className="match-setup-start-btn__en">START MATCH</span>
              </span>
            </PixelButton>

            <PixelButton
              variant="secondary"
              className="match-setup-reset-btn"
              onClick={handleReset}
            >
              <GearIcon />
              使用默认配置
            </PixelButton>
          </div>
        </PixelPanel>
      </main>

      <footer className="match-setup-footer">
        &ldquo;DIFFERENT RULES. NEW POSSIBILITIES.&rdquo;
      </footer>
    </div>
  )
}
