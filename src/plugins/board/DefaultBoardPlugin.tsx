import type { BoardPlugin } from './BoardPlugin'
import DefaultBoard from './DefaultBoard/DefaultBoard'

/**
 * Default interactive board: click-to-move, drag-to-move (pointer
 * events), legal-move/capture markers, selection highlight, last-move
 * highlight and check highlight — rendered as the Pixel Forge board.
 * The id stays `default-board` so existing match configs keep resolving.
 */
export const defaultBoardPlugin: BoardPlugin = {
  id: 'default-board',
  name: 'Pixel Board',
  Component: DefaultBoard,
}
