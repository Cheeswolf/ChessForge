import type { Color, Plugin } from '../core/types'
import type { PlayerPlugin } from '../plugins/players/PlayerPlugin'
import type { StoragePlugin } from '../plugins/storage/StoragePlugin'

/**
 * Factory definition for a player plugin. The registry holds definitions
 * (not instances) because a player is created per match with a color;
 * MatchSetupPage enumerates these so the user can pick who plays each side.
 */
export interface PlayerPluginDefinition extends Plugin {
  create(color: Color): PlayerPlugin
}

/**
 * Factory definition for a storage plugin. Instances are created per match
 * so a stale session handle can't leak between games.
 */
export interface StoragePluginDefinition extends Plugin {
  create(): StoragePlugin
}
