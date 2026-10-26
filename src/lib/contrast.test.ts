import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { contrastRatio, over } from './contrast'

/** Lê os tokens do @theme direto do globals.css (fonte da verdade). */
const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8')
const theme = css.slice(css.indexOf('@theme'), css.indexOf('}', css.indexOf('@keyframes')))
const token = (name: string) => {
  const m = theme.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{3,6})`))
  if (!m) throw new Error(`token --color-${name} não encontrado`)
  return m[1]
}

const bg = token('bg')
const surface = token('surface')
const surface2 = token('surface2')
// Pior caso dos painéis de vidro (globals.css): pico do brilho branco + brilho verde no canto,
// sem o spotlight do mouse (transitório e desligado com reduced-motion).
const glassPanelWorst = over('#ffffff', 0.06, over('#9eff00', 0.06, over(surface, 0.62, bg)))
const glassControlWorst = over('#ffffff', 0.1, over(surface2, 0.68, bg))
const heroTop = over('#9eff00', 0.12, '#111111')
const stripes = '#222222'
const brightestRing = '#f6ffe3' // centro do núcleo / reflexo mais claro dos anéis
const panelOverCore = over('#0a0a0a', 0.7, brightestRing)
const panelCardOverCore = over('#0a0a0a', 0.6, panelOverCore)
const heroScrimOverRing = over('#090909', 0.84, brightestRing)

/** Pares texto/fundo declarados no design (AAA 1.4.6: 7:1 texto normal, 4.5:1 texto grande). */
const PAIRS: [string, string, string, string, number][] = [
  ['text', token('text'), 'bg', bg, 7],
  ['text', token('text'), 'surface2', surface2, 7],
  ['text', token('text'), 'glass-control (pior caso)', glassControlWorst, 7],
  ['muted', token('muted'), 'bg', bg, 7],
  ['muted', token('muted'), 'surface', surface, 7],
  ['muted', token('muted'), 'surface2', surface2, 7],
  ['muted', token('muted'), 'glass-panel (pior caso)', glassPanelWorst, 7],
  ['hero-muted', token('hero-muted'), 'hero (topo com brilho verde)', heroTop, 7],
  ['hero-muted', token('hero-muted'), 'glass-control (pior caso)', glassControlWorst, 7],
  ['placeholder', token('placeholder'), 'bg (campo)', bg, 7],
  ['accent', token('accent'), 'bg', bg, 7],
  ['accent', token('accent'), 'glass-panel (pior caso)', glassPanelWorst, 7],
  ['on-accent', token('on-accent'), 'accent', token('accent'), 7],
  ['on-accent', token('on-accent'), 'accent-hover', token('accent-hover'), 7],
  ['num (texto grande)', token('num'), 'bg', bg, 4.5],
  ['err', token('err'), 'surface', surface, 7],
  ['err', token('err'), 'glass-panel (pior caso)', glassPanelWorst, 7],
  ['st-text', token('st-text'), 'stripes', stripes, 7],
  ['palavra apagada da ScrollStory (texto grande)', '#8a8a8a', '#0d0d0d', '#0d0d0d', 4.5],
  // Cena do hero (home-motion.css), pior caso = ponto mais claro do núcleo/anéis (#f6ffe3) atrás do vidro/véu
  ['text', token('text'), 'painel de vidro 70% sobre o núcleo', panelOverCore, 7],
  ['muted', token('muted'), 'card do painel (60%) sobre painel sobre o núcleo', panelCardOverCore, 7],
  ['accent (índice 01)', token('accent'), 'card do painel sobre o núcleo', panelCardOverCore, 7],
  ['text', token('text'), 'véu do texto do hero (84%) sobre anel claro', heroScrimOverRing, 7],
  ['hero-muted', token('hero-muted'), 'véu do texto do hero (84%) sobre anel claro', heroScrimOverRing, 7],
  ['hero-muted', token('hero-muted'), 'cartão de depoimento (84%) sobre anel claro', heroScrimOverRing, 7],
  ['on-accent (CTA final, início)', token('on-accent'), 'pílula branca', '#ffffff', 7],
  ['on-accent (CTA final, fim)', token('on-accent'), 'pílula verde', token('accent'), 7],
]

describe('contraste dos tokens (WCAG 1.4.6 AAA)', () => {
  for (const [fgName, fg, bgName, bgColor, min] of PAIRS) {
    it(`${fgName} ${fg} sobre ${bgName} ${bgColor} >= ${min}:1`, () => {
      expect(contrastRatio(fg, bgColor)).toBeGreaterThanOrEqual(min)
    })
  }
  it('borda de campo de formulário >= 3:1 (1.4.11)', () => {
    expect(contrastRatio(token('field-border'), bg)).toBeGreaterThanOrEqual(3)
  })
  it('anel de foco (accent) >= 3:1 contra o fundo e contra superfícies (2.4.13)', () => {
    for (const b of [bg, surface, surface2, glassControlWorst]) expect(contrastRatio(token('accent'), b)).toBeGreaterThanOrEqual(3)
  })
  it('calculadora confere com valores conhecidos', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(contrastRatio('#98989a', '#262626')).toBeLessThan(7) // valor antigo do muted reprovaria
  })
})
