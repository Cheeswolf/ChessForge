import type { ThemePlugin } from './ThemePlugin'

/**
 * Maps a theme's tokens to CSS custom property names, ready for
 * injection onto a DOM element (e.g. `document.documentElement.style`).
 */
export function themeToCssVariables(
  theme: ThemePlugin,
): Record<string, string> {
  return {
    '--page-background': theme.tokens.pageBackground,
    '--panel-background': theme.tokens.panelBackground,
    '--text-primary': theme.tokens.textPrimary,
    '--text-muted': theme.tokens.textMuted,
    '--light-square': theme.tokens.lightSquare,
    '--dark-square': theme.tokens.darkSquare,
    '--selected-square': theme.tokens.selectedSquare,
    '--previous-move': theme.tokens.previousMove,
    '--legal-move': theme.tokens.legalMove,
    '--check-square': theme.tokens.checkSquare,
    '--border-radius': theme.tokens.borderRadius,
    '--shadow': theme.tokens.shadow,
  }
}
