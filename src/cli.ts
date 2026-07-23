#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Command } from 'commander'
import { parseAndConvert } from './lib/index.js'
import type { RCTBattleFormat } from './lib/types.js'

const VALID_FORMATS: RCTBattleFormat[] = [
  'GEN_9_SINGLES',
  'GEN_9_DOUBLES',
  'GEN_9_TRIPLES',
  'GEN_9_MULTI',
  'GEN_9_ROYAL',
]

const program = new Command()

program
  .name('showdown-to-rct')
  .description('Convert Pokemon Showdown / PokePaste teams to RCT trainer JSON')
  .version('0.1.0')
  .argument('<file>', 'Path to a text file containing a Showdown team export')
  .option('-n, --name <name>', 'Trainer name', 'Trainer')
  .option('-i, --id <id>', 'Trainer identity / ID')
  .option(
    '-f, --format <format>',
    `Battle format (${VALID_FORMATS.join(', ')})`,
    'GEN_9_SINGLES',
  )
  .option('-o, --output <file>', 'Output JSON file (defaults to stdout)')
  .action((file: string, options) => {
    const format = options.format as RCTBattleFormat
    if (!VALID_FORMATS.includes(format)) {
      console.error(`Error: Invalid battle format "${format}"`)
      console.error(`Valid formats: ${VALID_FORMATS.join(', ')}`)
      process.exit(1)
    }

    let input = ''
    try {
      const path = resolve(file)
      input = readFileSync(path, 'utf-8')
    } catch (err) {
      console.error(`Error: Could not read file "${file}"`)
      if (err instanceof Error) {
        console.error(err.message)
      }
      process.exit(1)
    }

    let trainer: ReturnType<typeof parseAndConvert> | undefined
    try {
      trainer = parseAndConvert(input, {
        trainerName: options.name,
        trainerId: options.id,
        battleFormat: format,
      })
    } catch (err) {
      console.error('Error: Failed to parse team')
      if (err instanceof Error) {
        console.error(err.message)
      }
      process.exit(1)
    }

    const json = JSON.stringify(trainer, null, 2)

    if (options.output) {
      try {
        writeFileSync(resolve(options.output), json, 'utf-8')
        console.log(`Trainer JSON written to ${options.output}`)
      } catch (err) {
        console.error(`Error: Could not write to "${options.output}"`)
        if (err instanceof Error) {
          console.error(err.message)
        }
        process.exit(1)
      }
    } else {
      console.log(json)
    }
  })

program.parse()
