'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import type { Dictionary } from '@/content/types'

type StoryStyle = CSSProperties & { '--story-progress'?: number; '--word-index'?: number; '--word-count'?: number }

/**
 * Frase que "acende" palavra a palavra conforme a rolagem + 3 números com contagem.
 *
 * Acessibilidade/robustez:
 * - SSR e sem JS: progresso = 1 (texto todo legível) e números finais no HTML.
 * - Palavra "apagada" nunca fica abaixo de 4.5:1 (texto grande, AAA 1.4.6) — ver .scroll-story-copy no CSS.
 * - Números animados ficam aria-hidden; o leitor de tela recebe o valor final (sr-only).
 * - prefers-reduced-motion: nada é animado (CSS + early return aqui).
 * - Listeners e frames são limpos no unmount.
 */
export function ScrollStory({ t }: { t: Dictionary['scrollStory'] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([])
  const words = t.statement.split(' ')

  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const targets = [...numberRefs.current]

    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect()
        const distance = Math.max(section.offsetHeight - window.innerHeight, 1)
        const progress = Math.min(Math.max(-rect.top / distance, 0), 1)
        section.style.setProperty('--story-progress', progress.toFixed(4))
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    // Contagem só se os números ainda não estão visíveis (evita "piscar" de 250 para 0).
    const stats = statsRef.current
    let countFrame = 0
    let observer: IntersectionObserver | null = null
    if (stats && stats.getBoundingClientRect().top > window.innerHeight) {
      targets.forEach(el => { if (el) el.textContent = `0${el.dataset.suffix ?? ''}` })
      observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return
        observer?.disconnect()
        const startedAt = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - startedAt) / 1400, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          targets.forEach(el => {
            if (el) el.textContent = `${Math.round(Number(el.dataset.value) * eased)}${el.dataset.suffix ?? ''}`
          })
          if (p < 1) countFrame = requestAnimationFrame(tick)
        }
        countFrame = requestAnimationFrame(tick)
      }, { threshold: 0.35 })
      observer.observe(stats)
    }

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(countFrame)
      observer?.disconnect()
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      section.style.removeProperty('--story-progress')
      targets.forEach(el => { if (el) el.textContent = `${el.dataset.value}${el.dataset.suffix ?? ''}` })
    }
  }, [t])

  return (
    <section ref={sectionRef} className="scroll-story border-b border-line" aria-labelledby="scroll-story-title">
      <div className="scroll-story-sticky mx-auto flex max-w-[1280px] min-[1800px]:max-w-[1600px] flex-col justify-center px-[clamp(20px,4vw,48px)]">
        <h2 id="scroll-story-title" className="scroll-story-copy m-0 text-[length:clamp(34px,5.1vw,76px)] leading-[1.15] font-medium tracking-[-0.025em]">
          <span className="sr-only">{t.statement}</span>
          {words.map((word, index) => (
            <span aria-hidden="true" key={`${word}-${index}`} style={{ '--word-index': index, '--word-count': words.length } as StoryStyle}>{word} </span>
          ))}
        </h2>
        <div ref={statsRef} className="scroll-story-stats grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-3">
          {t.stats.map((stat, index) => (
            <article key={stat.label} className="metric-frame bg-bg p-7 sm:p-9">
              <span aria-hidden="true" className="text-xs text-muted">0{index + 1}</span>
              <p className="m-0">
                <strong className="mt-8 block text-[length:clamp(44px,5vw,72px)] leading-none font-normal tracking-[-0.04em]">
                  <span aria-hidden="true" ref={el => { numberRefs.current[index] = el }} data-value={stat.value} data-suffix={stat.suffix}>
                    {stat.value}{stat.suffix}
                  </span>
                  <span className="sr-only">{`${stat.value}${stat.suffix} ${stat.label}`}</span>
                </strong>
                <span aria-hidden="true" className="mt-3 block text-sm leading-[1.5] text-muted">{stat.label}</span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
