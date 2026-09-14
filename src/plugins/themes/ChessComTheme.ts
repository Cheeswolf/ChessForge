import type { ThemePlugin } from './ThemePlugin'

/**
 * Default theme: Chess.com style — cream/green board, dark panel.
 * Values live in tokens only so UI components never hardcode colors;
 * they are injected into the DOM as CSS custom properties via
 * {@link themeToCssVariables} in `./themeCss`.
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
