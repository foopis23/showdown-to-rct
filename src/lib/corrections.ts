import type { RCTPokemon } from './types.js'
import rawCorrections from './corrections.json' with { type: 'json' }

export type ThenOp = { $set: unknown } | { $append: unknown } | { $prepend: unknown } | { $remove: unknown }

export interface CorrectionRule {
  match: Record<string, string | { $regex: string }>
  then: Record<string, ThenOp>
}

export interface CorrectionSet {
  pokemon: CorrectionRule[]
}

const corrections: CorrectionSet = rawCorrections as unknown as CorrectionSet

/**
 * Apply all matching correction rules to a pokemon object.
 *
 * Match syntax (per field):
 *   "exact_value"                  — exact string match
 *   { "$regex": "^(\\w+)hisui$" }  — regex match, capture groups available
 *
 * Then syntax (per field):
 *   { "$set": "value" }            — set field to value
 *   { "$append": "value" }         — append to array field
 *   { "$prepend": "value" }        — prepend to array field
 *   { "$remove": "value" }         — remove from array field
 *
 * Values can reference capture groups: "$1", "$2", etc.
 */
export function applyCorrections(mon: RCTPokemon): void {
  for (const rule of corrections.pokemon) {
    const groups = tryMatch(mon, rule.match)
    if (groups) {
      applyThen(mon, rule.then, groups)
    }
  }
}

/**
 * Try to match all conditions in the rule's `match` object.
 * Returns capture groups if all conditions match, null otherwise.
 */
function tryMatch(
  mon: RCTPokemon,
  conditions: Record<string, string | { $regex: string }>,
): string[] | null {
  const allGroups: string[] = []

  for (const [field, condition] of Object.entries(conditions)) {
    const value = getField(mon, field)
    if (typeof value !== 'string') return null

    if (typeof condition === 'string') {
      if (value !== condition) return null
    } else if ('$regex' in condition) {
      const re = new RegExp(condition.$regex)
      const m = re.exec(value)
      if (!m) return null
      // m[0] is full match, m[1..] are capture groups
      for (let i = 1; i < m.length; i++) {
        allGroups[i] = m[i] ?? ''
      }
    }
  }

  return allGroups
}

/**
 * Apply all `then` operations, substituting capture group references.
 */
function applyThen(
  mon: RCTPokemon,
  then: Record<string, ThenOp>,
  groups: string[],
): void {
  const target = mon as unknown as Record<string, unknown>

  for (const [field, op] of Object.entries(then)) {
    if ('$set' in op) {
      target[field] = substitute(op.$set, groups)
    } else if ('$append' in op) {
      const arr = (target[field] as unknown[] | undefined) ?? []
      const val = substitute(op.$append, groups)
      target[field] = Array.isArray(arr) ? [...arr, val] : [arr, val]
    } else if ('$prepend' in op) {
      const arr = (target[field] as unknown[] | undefined) ?? []
      const val = substitute(op.$prepend, groups)
      target[field] = Array.isArray(arr) ? [val, ...arr] : [val, arr]
    } else if ('$remove' in op) {
      const arr = target[field] as unknown[] | undefined
      const val = substitute(op.$remove, groups)
      if (Array.isArray(arr)) {
        target[field] = arr.filter((v) => v !== val)
      }
    }
  }
}

/**
 * Substitute $1, $2, etc. in a value with capture groups.
 * If value is a string, does regex substitution.
 * If value is not a string, returns as-is.
 */
function substitute(value: unknown, groups: string[]): unknown {
  if (typeof value !== 'string') return value
  return value.replace(/\$(\d+)/g, (_, n) => groups[Number(n)] ?? '')
}

/**
 * Get a top-level field from the pokemon object.
 */
function getField(mon: RCTPokemon, field: string): unknown {
  return (mon as unknown as Record<string, unknown>)[field]
}
