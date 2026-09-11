import {
  chessComTheme,
  themeToCssVariables,
} from './ChessComTheme'

const REQUIRED_TOKENS = [
  'pageBackground',
  'panelBackground',
  'textPrimary',
  'textMuted',
  'lightSquare',
  'darkSquare',
  'selectedSquare',
  'previousMove',
  'legalMove',
  'checkSquare',
  'borderRadius',
  'shadow',
] as const

test('provides all required theme tokens', () => {
  expect(
    chessComTheme.tokens.lightSquare,
  ).toBeTruthy()

  expect(
    chessComTheme.tokens.darkSquare,
  ).toBeTruthy()

  expect(
    chessComTheme.tokens.legalMove,
  ).toBeTruthy()
})

test('exposes a non-empty id and name', () => {
  expect(chessComTheme.id).toBeTruthy()
  expect(chessComTheme.name).toBeTruthy()
})

test('provides every ThemeTokens entry as a non-empty string', () => {
  for (const key of REQUIRED_TOKENS) {
    const value = chessComTheme.tokens[key]
    expect(value).toEqual(expect.any(String))
    expect(value).toMatch(/\S/)
  }
})

test('exposes exactly the ThemeTokens keys', () => {
  expect(
    Object.keys(chessComTheme.tokens).sort(),
  ).toEqual([...REQUIRED_TOKENS].sort())
})

test('maps every token to a CSS custom property', () => {
  const vars = themeToCssVariables(chessComTheme)

  expect(vars['--page-background']).toBe(
    chessComTheme.tokens.pageBackground,
  )
  expect(vars['--panel-background']).toBe(
    chessComTheme.tokens.panelBackground,
  )
  expect(vars['--text-primary']).toBe(
    chessComTheme.tokens.textPrimary,
  )
  expect(vars['--text-muted']).toBe(
    chessComTheme.tokens.textMuted,
  )
  expect(vars['--light-square']).toBe(
    chessComTheme.tokens.lightSquare,
  )
  expect(vars['--dark-square']).toBe(
    chessComTheme.tokens.darkSquare,
  )
  expect(vars['--selected-square']).toBe(
    chessComTheme.tokens.selectedSquare,
  )
  expect(vars['--previous-move']).toBe(
    chessComTheme.tokens.previousMove,
  )
  expect(vars['--legal-move']).toBe(
    chessComTheme.tokens.legalMove,
  )
  expect(vars['--check-square']).toBe(
    chessComTheme.tokens.checkSquare,
  )
  expect(vars['--border-radius']).toBe(
    chessComTheme.tokens.borderRadius,
  )
  expect(vars['--shadow']).toBe(
    chessComTheme.tokens.shadow,
  )
})
