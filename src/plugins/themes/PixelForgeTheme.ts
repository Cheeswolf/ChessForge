import type { ThemePlugin } from './ThemePlugin'

/**
 * Pixel Forge UI V2 theme: high-contrast pixel-art palette with warm
 * parchment squares on a dark cool-grey page. Values are injected into
 * the DOM as CSS custom properties via {@link themeToCssVariables}.
 */
export const pixelForgeTheme: ThemePlugin = {
  id: 'pixel-forge-theme',
  name: 'Pixel Forge',
  tokens: {
    pageBackground: '#111827',
    panelBackground: '#182235',
    textPrimary: '#f2e7c9',
    textMuted: '#a9a184',
    lightSquare: '#d8c39a',
    darkSquare: '#75533b',
    selectedSquare: '#d9ad45',
    previousMove: '#9a7938',
    legalMove: '#4e8f78',
    checkSquare: '#8b3434',
    borderRadius: '0px',
    shadow: '4px 4px 0 rgba(0, 0, 0, 0.42)',
  },
}
