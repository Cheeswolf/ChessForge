import type { GameConfig } from '../core/GameCore'
import type { PluginRegistry } from '../core/PluginRegistry'
import type { Color, Plugin } from '../core/types'
import type { BoardPlugin } from '../plugins/board/BoardPlugin'
import type { PlayerPlugin } from '../plugins/players/PlayerPlugin'
import type { StoragePlugin } from '../plugins/storage/StoragePlugin'
import type { ThemePlugin } from '../plugins/themes/ThemePlugin'

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

/**
 * Serializable match configuration: ids that can be persisted, shared, or
 * selected in the match setup UI and then resolved against a PluginRegistry.
 */
export interface MatchConfig {
  ruleId: string
  whitePlayerId: string
  blackPlayerId: string
  boardId: string
  themeId: string
  storageId: string
}

/**
 * Fully resolved match configuration, ready to feed into GameCore plus the
 * UI-only plugins (board + theme) that the core does not know about.
 */
export interface ResolvedMatchConfig extends GameConfig {
  board: BoardPlugin
  theme: ThemePlugin
}

/**
 * Validates that every plugin id in the config is registered. Returns an
 * array of human-readable errors in field order; returns an empty array when
 * the config is valid. Never constructs plugin instances.
 */
export function validateMatchConfig(
  config: MatchConfig,
  registry: PluginRegistry,
): string[] {
  const errors: string[] = []

  try {
    registry.getRule(config.ruleId)
  } catch {
    errors.push(`Rule plugin is unavailable: ${config.ruleId}`)
  }

  try {
    registry.getPlayer(config.whitePlayerId)
  } catch {
    errors.push(`White player plugin is unavailable: ${config.whitePlayerId}`)
  }

  try {
    registry.getPlayer(config.blackPlayerId)
  } catch {
    errors.push(`Black player plugin is unavailable: ${config.blackPlayerId}`)
  }

  try {
    registry.getBoard(config.boardId)
  } catch {
    errors.push(`Board plugin is unavailable: ${config.boardId}`)
  }

  try {
    registry.getTheme(config.themeId)
  } catch {
    errors.push(`Theme plugin is unavailable: ${config.themeId}`)
  }

  try {
    registry.getStorage(config.storageId)
  } catch {
    errors.push(`Storage plugin is unavailable: ${config.storageId}`)
  }

  return errors
}

/**
 * Resolves a MatchConfig to live plugin instances via the registry. Throws
 * if any configured plugin id is missing.
 */
export function resolveMatchConfig(
  config: MatchConfig,
  registry: PluginRegistry,
): ResolvedMatchConfig {
  const errors = validateMatchConfig(config, registry)
  if (errors.length > 0) {
    throw new Error(`Invalid match config: ${errors.join('; ')}`)
  }

  return {
    rules: registry.getRule(config.ruleId),
    players: {
      white: registry.getPlayer(config.whitePlayerId).create('white'),
      black: registry.getPlayer(config.blackPlayerId).create('black'),
    },
    board: registry.getBoard(config.boardId),
    theme: registry.getTheme(config.themeId),
    storage: registry.getStorage(config.storageId).create(),
  }
}
