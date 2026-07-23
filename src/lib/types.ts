/* ============================================================================
 * PokePaste / Showdown Format Types
 * ============================================================================ */

export interface ParsedPokemon {
  species: string
  nickname?: string
  gender?: 'M' | 'F'
  item?: string
  ability?: string
  level?: number
  shiny?: boolean
  happiness?: number
  nature?: string
  evs: Partial<Record<ShowdownStat, number>>
  ivs: Partial<Record<ShowdownStat, number>>
  moves: string[]
  teraType?: string
}

export type ShowdownStat = 'HP' | 'Atk' | 'Def' | 'SpA' | 'SpD' | 'Spe'

export interface ParsedTeam {
  pokemon: ParsedPokemon[]
}

/* ============================================================================
 * RCT Trainer Format Types
 * ============================================================================ */

export type RCTGender = 'MALE' | 'FEMALE' | 'GENDERLESS'

export type RCTBattleFormat =
  | 'GEN_9_SINGLES'
  | 'GEN_9_DOUBLES'
  | 'GEN_9_TRIPLES'
  | 'GEN_9_MULTI'
  | 'GEN_9_ROYAL'

export interface RCTStatBlock {
  hp?: number
  atk?: number
  def?: number
  spa?: number
  spd?: number
  spe?: number
}

export interface RCTGimmicks {
  tera?: string
  dynamax?: boolean
  gmax?: boolean
}

export interface RCTPokemon {
  species: string
  nickname?: string
  gender: RCTGender
  level: number
  nature?: string
  ability?: string
  moveset: string[]
  ivs?: RCTStatBlock
  evs?: RCTStatBlock
  shiny: boolean
  heldItem?: string | string[]
  aspects?: string[]
  gimmicks?: RCTGimmicks
}

export interface RCTBagItem {
  item: string
  quantity?: number
}

export interface RCTAI {
  type: string
  data?: Record<string, unknown>
}

export interface RCTBattleRules {
  maxItemUses?: number
  adjustNPCLevels?: boolean
  adjustPlayerLevels?: boolean
  healPlayers?: boolean
}

export interface RCTTrainer {
  name: string
  identity?: string
  ai?: RCTAI
  battleFormat?: RCTBattleFormat
  battleRules?: RCTBattleRules
  battleTheme?: string
  bag?: RCTBagItem[]
  team: RCTPokemon[]
}

/* ============================================================================
 * Conversion Options
 * ============================================================================ */

export interface ConversionOptions {
  trainerName: string
  trainerId?: string
  battleFormat?: RCTBattleFormat
}
