import { useMemo } from 'react'
import PixelButton from '../../components/PixelButton'
import PixelPanel from '../../components/PixelPanel'
import PixelSprite from '../../components/pixel/PixelSprite'
import {
  ICON_BACK_ART,
  ICON_BOARD_ART,
  ICON_GEAR_ART,
  ICON_PLAYER_ART,
  ICON_RULE_ART,
  ICON_STORAGE_ART,
  ICON_SWORDS_ART,
  ICON_THEME_ART,
  ICON_THEME_PALETTE,
} from '../../components/pixel/sprites'
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

const SELECTORS: Array<{
  key: keyof MatchConfig
  label: string
  sublabel: string
  icon: React.ReactNode
}> = [
  {
    key: 'ruleId',
    label: 'Rule Plugin',
    sublabel: '规则插件',
    icon: <PixelSprite art={ICON_RULE_ART} palette={{ m: '#d9ad45' }} />,
  },
  {
    key: 'whitePlayerId',
    label: 'White Player',
    sublabel: '白方玩家',
    icon: <PixelSprite art={ICON_PLAYER_ART} palette={{ m: '#f2e7c9' }} />,
  },
  {
    key: 'blackPlayerId',
    label: 'Black Player',
    sublabel: '黑方玩家',
    icon: <PixelSprite art={ICON_PLAYER_ART} palette={{ m: '#7c8ea6' }} />,
  },
  {
    key: 'boardId',
    label: 'Board Plugin',
    sublabel: '棋盘插件',
    icon: <PixelSprite art={ICON_BOARD_ART} palette={{ m: '#d9ad45' }} />,
  },
  {
    key: 'themeId',
    label: 'Theme Plugin',
    sublabel: '主题插件',
    icon: <PixelSprite art={ICON_THEME_ART} palette={ICON_THEME_PALETTE} />,
  },
  {
    key: 'storageId',
    label: 'Storage Plugin',
    sublabel: '存储插件',
    icon: <PixelSprite art={ICON_STORAGE_ART} palette={{ m: '#d9ad45' }} />,
  },
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
              <PixelSprite
                art={ICON_BACK_ART}
                palette={{ m: 'currentColor' }}
              />
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
              <PixelSprite
                art={ICON_SWORDS_ART}
                palette={{ m: 'currentColor' }}
                className="match-setup-start-btn__icon"
              />
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
              <PixelSprite
                art={ICON_GEAR_ART}
                palette={{ m: 'currentColor' }}
              />
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
