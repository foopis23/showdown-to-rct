import { useState, useCallback } from 'react'
import './App.css'
import { parseAndConvert } from './lib/index.js'
import type { RCTBattleFormat } from './lib/types.js'

const SAMPLE_INPUT = `Raging-bolt @ Leftovers
Ability: Protosynthesis
Tera Type: Fairy
EVs: 252 HP / 188 Def / 63 SpA
Modest Nature
- Thunderclap
- Dragon Pulse
- Volt Switch
- Calm Mind

Koraidon @ Life Orb
Ability: Orichalcum Pulse
Tera Type: Fire
EVs: 236 HP / 196 Atk / 4 Def / 4 SpD
Impish Nature
- Flare Blitz
- Close Combat
- Flame Charge
- Protect

Arcanine-hisui @ Eject Button
Ability: Intimidate
Tera Type: Water
EVs: 4 HP / 252 Atk / 252 SpD
Jolly Nature
- Flare Blitz
- Rock Slide
- Extreme Speed
- Protect

Great Tusk @ Rocky Helmet
Ability: Protosynthesis
Tera Type: Steel
EVs: 252 HP / 4 Atk / 252 Def
Jolly Nature
- Headlong Rush
- Ice Spinner
- Rapid Spin
- Stealth Rock`

const BATTLE_FORMATS: RCTBattleFormat[] = [
  'GEN_9_SINGLES',
  'GEN_9_DOUBLES',
  'GEN_9_TRIPLES',
  'GEN_9_MULTI',
  'GEN_9_ROYAL',
]

export default function App() {
  const [input, setInput] = useState(SAMPLE_INPUT)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [trainerName, setTrainerName] = useState('Ace Trainer')
  const [battleFormat, setBattleFormat] = useState<RCTBattleFormat>('GEN_9_DOUBLES')
  const [copied, setCopied] = useState(false)

  const handleConvert = useCallback(() => {
    setError('')
    setOutput('')
    try {
      const trainer = parseAndConvert(input, {
        trainerName,
        battleFormat,
      })
      setOutput(JSON.stringify(trainer, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [input, trainerName, battleFormat])

  const handleCopy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [output])

  return (
    <div className="converter-app">
      <header className="app-header">
        <h1>Showdown to RCT Mod</h1>
        <p>Convert PokePaste / Showdown teams to Radical Cobblemon Trainer JSON</p>
      </header>

      <section className="settings-bar">
        <label className="setting">
          <span>Trainer Name</span>
          <input
            type="text"
            value={trainerName}
            onChange={(e) => setTrainerName(e.target.value)}
            placeholder="Trainer name"
          />
        </label>

        <label className="setting">
          <span>Battle Format</span>
          <select
            value={battleFormat}
            onChange={(e) => setBattleFormat(e.target.value as RCTBattleFormat)}
          >
            {BATTLE_FORMATS.map((f) => (
              <option key={f} value={f}>
                {f.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="btn-primary" onClick={handleConvert}>
          Convert
        </button>
      </section>

      <div className="panes">
        <div className="pane">
          <label className="pane-title">PokePaste / Showdown Input</label>
          <textarea
            className="pane-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your team here..."
            spellCheck={false}
          />
        </div>

        <div className="pane">
          <div className="pane-header">
            <label className="pane-title">RCT Trainer JSON</label>
            {output && (
              <button type="button" className="btn-copy" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          <textarea
            className="pane-textarea output"
            value={output}
            readOnly
            placeholder="Output will appear here..."
            spellCheck={false}
          />
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      <footer className="app-footer">
        <p>
          <strong>Note:</strong> Move, ability, item, and species names are
          converted to compact lowercase IDs (no spaces or separators). Regional
          forms and cross-mod items are corrected via the data-driven
          corrections file. You may still need to verify IDs match your
          Cobblemon installation.
        </p>
      </footer>
    </div>
  )
}
