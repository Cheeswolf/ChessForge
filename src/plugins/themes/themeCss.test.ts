import { pixelForgeTheme } from './PixelForgeTheme'
import { themeToCssVariables } from './themeCss'

test('maps Pixel Forge theme to stable css variables', () => {
  const variables = themeToCssVariables(pixelForgeTheme)
  expect(variables['--page-background']).toBe('#111827')
  expect(variables['--light-square']).toBe('#d8c39a')
  expect(variables['--dark-square']).toBe('#75533b')
  expect(variables['--border-radius']).toBe('0px')
})
