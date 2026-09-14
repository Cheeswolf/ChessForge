import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App'

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

test('renders the app shell starting on the home page', () => {
  render(<App />)

  expect(screen.getByRole('heading', { name: 'CHESSFORGE' })).toBeInTheDocument()
  expect(screen.queryByTestId('square-e2')).not.toBeInTheDocument()
})
