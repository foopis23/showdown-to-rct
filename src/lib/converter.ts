import type {
  ConversionOptions,
  ParsedPokemon,
  ParsedTeam,
  RCTGimmicks,
  RCTPokemon,
  RCTStatBlock,
  RCTTrainer,
  ShowdownStat,
} from './types.js'
import {
  mapGender,
  mapStatName,
  toAbilityId,
  toItemId,
  toMoveId,
  toNatureId,
  toSpeciesId,
} from './utils.js'
import { parseShowdownTeam } from './parser.js'
import { applyCorrections } from './corrections.js'

const DEFAULT_LEVEL = 100
const DEFAULT_IV = 31
const DEFAULT_EV = 0
const ALL_STATS: ShowdownStat[] = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe']

/**
 * Convert a parsed Showdown team into an RCT trainer JSON object.
 */
export function convertToRCT(
  team: ParsedTeam,
  options: ConversionOptions,
): RCTTrainer {
  const trainer: RCTTrainer = {
    name: options.trainerName,
    ai: {
      type: 'rct',
      data: {
        moveBias: 1,
        switchBias: 0.5,
        statMoveBias: 1,
        itemBias: 0.8,
        maxSelectMargin: 0.15,
      },
    },
    battleRules: {
      maxItemUses: -1,
    },
    team: team.pokemon.map((mon) => convertPokemon(mon)),
  }

  if (options.battleFormat) {
    trainer.battleFormat = options.battleFormat
  }

  return trainer
}

function convertPokemon(mon: ParsedPokemon): RCTPokemon {
  const rctMon: RCTPokemon = {
    species: toSpeciesId(mon.species),
    gender: mapGender(mon.gender),
    level: mon.level ?? DEFAULT_LEVEL,
    shiny: mon.shiny ?? false,
    moveset: mon.moves.map(toMoveId),
    evs: buildFullEVs(mon.evs),
    ivs: buildFullIVs(mon.ivs),
  }

  if (mon.nickname) {
    rctMon.nickname = mon.nickname
  }

  if (mon.ability) {
    rctMon.ability = toAbilityId(mon.ability)
  }

  if (mon.nature) {
    rctMon.nature = toNatureId(mon.nature)
  }

  if (mon.item) {
    rctMon.heldItem = [toItemId(mon.item)]
  }

  // Gimmicks
  const gimmicks: RCTGimmicks = {}
  if (mon.teraType) {
    gimmicks.tera = mon.teraType.toLowerCase()
  }
  if (Object.keys(gimmicks).length > 0) {
    rctMon.gimmicks = gimmicks
  }

  // Apply data-driven corrections (regional forms, etc.)
  applyCorrections(rctMon)

  return rctMon
}

function buildFullEVs(
  stats: Partial<Record<ShowdownStat, number>>,
): RCTStatBlock {
  const block: RCTStatBlock = {}
  for (const stat of ALL_STATS) {
    block[mapStatName(stat)] = stats[stat] ?? DEFAULT_EV
  }
  return block
}

function buildFullIVs(
  stats: Partial<Record<ShowdownStat, number>>,
): RCTStatBlock {
  const block: RCTStatBlock = {}
  for (const stat of ALL_STATS) {
    block[mapStatName(stat)] = stats[stat] ?? DEFAULT_IV
  }
  return block
}

/**
 * Convenience: parse raw text and convert in one step.
 */
export function parseAndConvert(
  text: string,
  options: ConversionOptions,
): RCTTrainer {
  const team = parseShowdownTeam(text)
  return convertToRCT(team, options)
}
