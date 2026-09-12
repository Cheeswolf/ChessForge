import type { BoardPlugin } from './BoardPlugin'
import DefaultBoard from './DefaultBoard/DefaultBoard'

/**
 * Default interactive board: click-to-move, drag-to-move (pointer
 * events), legal-move dots, selection highlight, last-move highlight
 * and check highlight.
 */
export const defaultBoardPlugin: BoardPlugin = {
  id: 'default-board',
  name: 'Default Board',
  Component: DefaultBoard,
}
