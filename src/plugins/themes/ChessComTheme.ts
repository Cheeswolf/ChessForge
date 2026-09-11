import type { ThemePlugin } from './ThemePlugin'

/**
 * Default theme: Chess.com style — cream/green board, dark panel.
 * Values live in tokens only so UI components never hardcode colors;
 * they are injected into the DOM as CSS custom properties via
 * {@link themeToCssVariables}.
 */
export const chessComTheme: ThemePlugin = {
  id: 'chesscom-theme',
  name: 'Chess.com Theme',
  tokens: {
    pageBackground: '#312e2b',
    panelBackground: '#262421',
    textPrimary: '#ffffff',
    textMuted: '#9a9a9a',

    lightSquare: '#ebecd0',
    darkSquare: '#779556',

    selectedSquare: '#f6f669',
    previousMove: '#cdd26a',
    legalMove: 'rgba(20, 85, 30, 0.5)',
    checkSquare: 'rgba(255, 0, 0, 0.5)',

    borderRadius: '4px',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
  },
}

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
