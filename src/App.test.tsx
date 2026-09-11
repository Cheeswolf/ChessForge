import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App'

test('renders application title', () => {
  render(<App />)
  expect(screen.getByText('Plugin Chess')).toBeInTheDocument()
})
