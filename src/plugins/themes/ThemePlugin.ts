import type { Plugin } from '../../core/types'

export interface ThemeTokens {
  pageBackground: string
  panelBackground: string
  textPrimary: string
  textMuted: string

  lightSquare: string
  darkSquare: string

  selectedSquare: string
  previousMove: string
  legalMove: string
  checkSquare: string

  borderRadius: string
  shadow: string
}

export interface ThemePlugin extends Plugin {
  tokens: ThemeTokens
}
