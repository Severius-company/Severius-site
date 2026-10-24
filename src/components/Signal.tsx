'use client'

import dynamic from 'next/dynamic'
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { selectSignalMode, type SignalMode } from '@/lib/signal-mode'
import type { SiteCopy } from '@/lib/copy'
import { SignalStatic } from './SignalStatic'

const SignalFull = dynamic(() => import('./SignalFull'), { ssr: false, loading: () => null })

/** Captura falha de chunk ou de contexto WebGL e devolve o controle ao fallback estático. */
class SignalBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onError() }
  render() { return this.state.failed ? null : this.props.children }
}

function hasWebGL() {
  try { const canvas = document.createElement('canvas'); return !!(canvas.getContext('webgl2') || canvas.getContext('webgl')) } catch { return false }
}

/**
 * Palco pinado do hero: a rolagem NATIVA conduz uma linha do tempo (scrub) que move o Signal, borra o título e revela a frase final.
 * Nada captura wheel/touch nem trava o body — teclado, leitores de tela e âncoras continuam funcionando.
 * GSAP só é carregado fora do modo estático; ao sair dele (ex.: reduced motion), `revert()` devolve o hero ao estado original.
 */
function useHeroScrub(enabled: boolean, short: boolean, progress: { current: number }, onPhase: (phase: number) => void) {
  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let revert = () => {}
    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      const hero = document.getElementById('inicio')
      if (cancelled || !hero) return
      gsap.registerPlugin(ScrollTrigger)
      const ctx = gsap.context(() => {
        hero.dataset.scrub = 'on'
        gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: hero, start: 'top top', end: () => `+=${Math.round(window.innerHeight * (short ? 1.8 : 2.6))}`,
            pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: self => { progress.current = self.progress; onPhase(Math.min(3, Math.floor(self.progress * 4))) },
          },
        })
          .to('.hero-copy h1, .hero-copy > p', { opacity: 0, y: -24, scale: 0.96, filter: 'blur(10px)', duration: 0.35 }, 0)
          .to('.hero-scroll', { opacity: 0, duration: 0.05 }, 0)
          .fromTo('.hero-payoff', { opacity: 0, y: 20, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.18 }, 0.82)
          .fromTo('.hero-progress span', { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
      }, hero)
      requestAnimationFrame(() => ScrollTrigger.refresh())
      revert = () => { ctx.revert(); delete hero.dataset.scrub; progress.current = 0 }
    })()
    return () => { cancelled = true; revert() }
  }, [enabled, short, progress, onPhase])
}

/** O pin só faz sentido quando o conteúdo do hero cabe na tela; com zoom, espaçamento de texto ou paisagem curta ele rola normalmente (WCAG 1.4.4/1.4.12). */
function useHeroFits() {
  const [fits, setFits] = useState(true)
  useEffect(() => {
    const hero = document.getElementById('inicio')
    const grid = hero?.querySelector<HTMLElement>('.hero-grid')
    if (!hero || !grid) return
    const measure = () => {
      const style = getComputedStyle(hero)
      setFits(grid.offsetHeight + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) <= window.innerHeight)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(grid)
    window.addEventListener('resize', measure)
    return () => { observer.disconnect(); window.removeEventListener('resize', measure) }
  }, [])
  return fits
}

/** Escalona o trabalho pesado para depois da hidratação, evitando uma única long task. */
function useIdle(active: boolean) {
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    if (!active) return
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setIdle(true), { timeout: 1500 })
      return () => window.cancelIdleCallback(id)
    }
    const timer = setTimeout(() => setIdle(true), 300)
    return () => clearTimeout(timer)
  }, [active])
  return active && idle
}

export function Signal({ text }: { text: SiteCopy }) {
  const [mode, setMode] = useState<SignalMode>('static')
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const [phase, setPhase] = useState(0)
  const progress = useRef(0)
  const onFailure = useCallback(() => setFailed(true), [])
  const onReady = useCallback(() => setReady(true), [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const narrow = window.matchMedia('(max-width: 767px)')
    const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)
    const update = () => setMode(selectSignalMode({ reducedMotion: media.matches, webgl: hasWebGL(), narrow: narrow.matches, saveData }))
    update(); media.addEventListener('change', update); narrow.addEventListener('change', update)
    return () => { media.removeEventListener('change', update); narrow.removeEventListener('change', update) }
  }, [])

  const effective: SignalMode = failed ? 'static' : mode
  const animated = effective !== 'static'
  const fits = useHeroFits()
  const sceneIdle = useIdle(effective === 'full')
  useHeroScrub(animated && fits && (effective !== 'full' || ready), effective === 'lite', progress, setPhase)

  // A criação do contexto WebGL pode falhar depois da detecção (sem erro capturável): sem `ready` em 6s, cai para o estático.
  useEffect(() => {
    if (effective !== 'full' || ready) return
    const timer = window.setTimeout(onFailure, 6000)
    return () => window.clearTimeout(timer)
  }, [effective, ready, onFailure])

  return <div className="signal" data-mode={effective} data-phase={animated ? phase : undefined} aria-label={text.signal.label}>
    <div className="signal-viewport" aria-hidden="true">
      {(effective !== 'full' || !ready) && <SignalStatic />}
      {effective === 'full' && sceneIdle && <div className="signal-layer"><SignalBoundary onError={onFailure}><SignalFull progress={progress} onReady={onReady} onFail={onFailure} /></SignalBoundary></div>}
    </div>
    {effective === 'full' && !ready && <p className="signal-fallback" role="status">{text.signal.loading}</p>}
    {failed && <p className="signal-fallback" role="status">{text.signal.fallback}</p>}
    <ol className="signal-states" aria-live="off">{text.signal.states.map(([name, description], index) => <li key={name} data-active={animated && phase === index ? 'true' : undefined}><strong>{name}</strong><span>{description}</span></li>)}</ol>
  </div>
}
