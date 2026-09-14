import { useEffect, useState } from 'react'
import { defaultMatchConfig } from '../config/defaultGameConfig'
import { themeToCssVariables } from '../plugins/themes/themeCss'
import { pixelForgeTheme } from '../plugins/themes/PixelForgeTheme'
import HomePage from '../pages/HomePage/HomePage'
import type { MatchConfig } from './MatchConfig'
import type { AppScreen } from './AppScreen'

export default function AppShell() {
  const [screen, setScreen] = useState<AppScreen>('home')
  const [draftConfig, setDraftConfig] = useState<MatchConfig>(() => ({
    ...defaultMatchConfig,
  }))
  const [activeMatchConfig, setActiveMatchConfig] =
    useState<Readonly<MatchConfig> | null>(null)

  useEffect(() => {
    const variables = themeToCssVariables(pixelForgeTheme)
    const rootStyle = document.documentElement.style

    for (const [name, value] of Object.entries(variables)) {
      rootStyle.setProperty(name, value)
    }

    return () => {
      for (const name of Object.keys(variables)) {
        rootStyle.removeProperty(name)
      }
    }
  }, [])

  const startMatch = (config: MatchConfig) => {
    const frozen = Object.freeze({ ...config })
    setActiveMatchConfig(frozen)
    setScreen('game')
  }

  const startSetup = () => {
    setDraftConfig({ ...defaultMatchConfig })
    setScreen('setup')
  }

  const quickStart = () => {
    startMatch(defaultMatchConfig)
  }

  switch (screen) {
    case 'home':
      return (
        <HomePage onStartSetup={startSetup} onQuickStart={quickStart} />
      )

    case 'setup':
      return (
        <div className="match-setup-stub">
          <h1>MATCH SETUP</h1>
          <p className="match-setup-stub-hint">
            {draftConfig.ruleId}
          </p>
        </div>
      )

    case 'game':
      return (
        <div
          data-testid="game-page-placeholder"
          data-rule={activeMatchConfig?.ruleId}
        >
          GAME
        </div>
      )
  }
}
