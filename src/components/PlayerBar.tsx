import type { Color } from '../core/types'

export interface PlayerBarProps {
  color: Color
  /** True when it is this side's turn (and the game is still running). */
  active?: boolean
}

/**
 * Presentational: the player bar above/below the board. The active side
 * gets the `--active` class (gold edge + lit gem).
 */
export default function PlayerBar({ color, active = false }: PlayerBarProps) {
  const classes = [
    'player-bar',
    `player-bar--${color}`,
    active ? 'player-bar--active' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} data-testid={`player-bar-${color}`}>
      <span className="player-bar__gem" aria-hidden="true" />
      <span className="player-bar__label">
        {color === 'white' ? 'WHITE' : 'BLACK'}
      </span>
      <span className="player-bar__name">
        {color === 'white' ? '白方' : '黑方'}
      </span>
    </div>
  )
}
