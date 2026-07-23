import type { RCTStatBlock } from './types.js'

/**
 * Convert a display name to a compact lowercase ID with no separators.
 * Used for moves, abilities, items, and species in RCT format.
 * Examples:
 *   "Brave Bird"     → "bravebird"
 *   "U-turn"         → "uturn"
 *   "Power-Up Punch" → "poweruppunch"
 *   "Will-O-Wisp"    → "willowisp"
 *   "Mr. Mime"       → "mrmime"
 *   "Type: Null"     → "typenull"
 *   "Farfetch'd"     → "farfetchd"
 *   "Great Tusk"     → "greattusk"
 *   "Raging Bolt"    → "ragingbolt"
 */
export function toCompactId(input: string): string {
  return input
    .toLowerCase()
    .replace(/[.'\u2640\u2642]/g, '') // remove apostrophes, periods, ♀/♂
    .replace(/[^a-z0-9]+/g, '')      // strip all non-alphanumeric chars
}

/**
 * Convert species name to Cobblemon species ID.
 * Handles Nidoran symbols.
 */
export function toSpeciesId(input: string): string {
  let cleaned = input
    .replace(/\u2640/g, '-f')
    .replace(/\u2642/g, '-m')

  return toCompactId(cleaned)
}

/**
 * Convert ability name to RCT ability ID.
 */
export function toAbilityId(input: string): string {
  return toCompactId(input)
}

/**
 * Convert move name to RCT move ID.
 * Strips Hidden Power / Natural Gift type annotations.
 */
export function toMoveId(input: string): string {
  let cleaned = input
    // Remove bracketed type: "Hidden Power [Fire]" → "Hidden Power"
    .replace(/\s*\[[^\]]+\]\s*$/, '')
    // Remove trailing type word ONLY for Hidden Power / Natural Gift old style
    .replace(
      /\b(Hidden Power|Natural Gift)\s+(?:fire|water|grass|electric|ice|fighting|poison|ground|flying|psychic|bug|rock|ghost|dragon|dark|steel|fairy|normal)$/i,
      '$1',
    )

  return toCompactId(cleaned)
}

/**
 * Convert item name to RCT item ID.
 * Items use snake_case in RCT (e.g. "life_orb", "rocky_helmet").
 */
export function toItemId(input: string): string {
  return input
    .toLowerCase()
    .replace(/[.'\u2640\u2642]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
}

/**
 * Convert nature name to RCT nature ID.
 */
export function toNatureId(input: string): string {
  return input.toLowerCase().trim()
}

/**
 * Map Showdown gender shorthand to RCT gender enum.
 */
export function mapGender(g?: 'M' | 'F'): 'MALE' | 'FEMALE' | 'GENDERLESS' {
  if (g === 'M') return 'MALE'
  if (g === 'F') return 'FEMALE'
  return 'GENDERLESS'
}

/**
 * Map Showdown stat abbreviation to RCT stat key.
 */
export function mapStatName(stat: string): keyof RCTStatBlock {
  const map: Record<string, keyof RCTStatBlock> = {
    HP: 'hp',
    Atk: 'atk',
    Def: 'def',
    SpA: 'spa',
    SpD: 'spd',
    Spe: 'spe',
  }
  return map[stat] ?? (stat.toLowerCase() as keyof RCTStatBlock)
}
