import { Component } from 'react'
import type { ReactNode } from 'react'

interface GameErrorBoundaryProps {
  children: ReactNode
}

interface GameErrorBoundaryState {
  hasError: boolean
}

/**
 * Isolates a crashing board so the rest of the page (status, history,
 * controls) keeps working instead of the whole app white-screening.
 */
export default class GameErrorBoundary extends Component<
  GameErrorBoundaryProps,
  GameErrorBoundaryState
> {
  state: GameErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): GameErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown): void {
    console.error('Board failed to render:', error)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div role="alert" className="board-error">
          <div>棋盘加载失败</div>
          <div>请重新开始游戏</div>
        </div>
      )
    }

    return this.props.children
  }
}
