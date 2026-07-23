import type { ParsedPokemon, ParsedTeam, ShowdownStat } from './types.js'

const STAT_NAMES: readonly string[] = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe']

/**
 * Parse a PokePaste / Pokemon Showdown team export into structured data.
 */
export function parseShowdownTeam(text: string): ParsedTeam {
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0)

  const pokemon: ParsedPokemon[] = []

  for (const block of blocks) {
    const mon = parsePokemonBlock(block)
    if (mon) pokemon.push(mon)
  }

  return { pokemon }
}

function parsePokemonBlock(block: string): ParsedPokemon | null {
  const lines = block.split('\n').map((l) => l.trim())
  if (lines.length === 0) return null

  const mon: ParsedPokemon = {
    species: '',
    evs: {},
    ivs: {},
    moves: [],
  }

  // Parse first line: [Nickname] (Species) [(Gender)] [ @ Item]
  const first = parseFirstLine(lines[0])
  mon.species = first.species
  mon.nickname = first.nickname
  mon.gender = first.gender
  mon.item = first.item

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.length === 0) continue

    if (line.startsWith('-')) {
      // Move line
      const move = line.slice(1).trim()
      // Only take the first option if multiple are listed
      const firstOption = move.split('/')[0].trim()
      mon.moves.push(firstOption)
      continue
    }

    // Attribute lines
    if (line.startsWith('Ability:')) {
      mon.ability = line.slice('Ability:'.length).trim()
      continue
    }

    if (line.startsWith('Level:')) {
      const val = parseInt(line.slice('Level:'.length).trim(), 10)
      if (!isNaN(val)) mon.level = val
      continue
    }

    if (line.startsWith('Shiny:')) {
      const val = line.slice('Shiny:'.length).trim().toLowerCase()
      mon.shiny = val === 'yes'
      continue
    }

    if (line.startsWith('Happiness:')) {
      const val = parseInt(line.slice('Happiness:'.length).trim(), 10)
      if (!isNaN(val)) mon.happiness = val
      continue
    }

    if (line.startsWith('EVs:')) {
      mon.evs = parseStatLine(line.slice('EVs:'.length).trim())
      continue
    }

    if (line.startsWith('IVs:')) {
      mon.ivs = parseStatLine(line.slice('IVs:'.length).trim())
      continue
    }

    if (line.startsWith('Tera Type:')) {
      mon.teraType = line.slice('Tera Type:'.length).trim()
      continue
    }

    // Nature line: "XXXXXX Nature"
    const natureMatch = line.match(/^(.+?)\s+Nature$/)
    if (natureMatch) {
      mon.nature = natureMatch[1].trim()
      continue
    }
  }

  return mon
}

interface FirstLineResult {
  nickname?: string
  species: string
  gender?: 'M' | 'F'
  item?: string
}

function parseFirstLine(line: string): FirstLineResult {
  let item: string | undefined
  const atIndex = line.indexOf(' @ ')
  if (atIndex !== -1) {
    item = line.slice(atIndex + 3).trim()
    line = line.slice(0, atIndex).trim()
  }

  let gender: 'M' | 'F' | undefined
  if (line.endsWith(' (F)')) {
    gender = 'F'
    line = line.slice(0, -4).trim()
  } else if (line.endsWith(' (M)')) {
    gender = 'M'
    line = line.slice(0, -4).trim()
  }

  let nickname: string | undefined
  let species: string

  // Nickname (Species) format
  const match = line.match(/^(.+?)\s*\(([^)]+)\)\s*$/)
  if (match) {
    nickname = match[1].trim()
    species = match[2].trim()
  } else {
    species = line.trim()
  }

  return { nickname, species, gender, item }
}

function parseStatLine(line: string): Partial<Record<ShowdownStat, number>> {
  const result: Partial<Record<ShowdownStat, number>> = {}
  const parts = line.split('/')

  for (const part of parts) {
    const trimmed = part.trim()
    // Match: "252 Atk" or "252 HP"
    const m = trimmed.match(/^(\d+)\s+(.+)$/)
    if (!m) continue

    const val = parseInt(m[1], 10)
    const statName = m[2].trim()

    if (STAT_NAMES.includes(statName)) {
      result[statName as ShowdownStat] = val
    }
  }

  return result
}
