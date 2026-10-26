'use client'

import Link from 'next/link'
import { useEffect, useRef, type CSSProperties } from 'react'
import { ScrollProgress, type ScrollPhase } from '@/components/ScrollProgress'
import type { Dictionary } from '@/content/types'

type StoryStyle = CSSProperties & { '--word-index'?: number; '--word-count'?: number }

const PHASES: ScrollPhase[] = [{ name: '--story-cta', from: 0.82, to: 1 }]

/**
 * Frase que "acende" palavra a palavra conforme a rolagem + 3 números com contagem, em cards com
 * colchetes nos cantos, e uma pílula de CTA que passa de branco para o verde da marca no fim.
 *
 * Acessibilidade/robustez:
 * - O progresso vem do ScrollProgress compartilhado (sem JS = 1: tudo aceso, números finais, CTA verde).
 * - Palavra "apagada" nunca fica abaixo de 4.5:1 (texto grande, AAA 1.4.6) — ver .scroll-story-copy no CSS.
 * - Números animados ficam aria-hidden; o leitor de tela recebe o valor final (sr-only).
 * - prefers-reduced-motion: nada é animado (CSS + early return aqui).
 */
export function ScrollStory({ t, cta }: { t: Dictionary['scrollStory']; cta: { href: string; label: string } }) {
  const statsRef = useRef<HTMLDivElement>(null)
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([])
  const words = t.statement.split(' ')

  useEffect(() => {
    const stats = statsRef.current
    if (!stats || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const targets = [...numberRefs.current]
    const finalText = (el: HTMLSpanElement) => `${el.dataset.value}${el.dataset.suffix ?? ''}`

    // Contagem só se os números ainda não estão visíveis (evita "piscar" de 250 para 0).
    if (stats.getBoundingClientRect().top <= window.innerHeight) return
    let countFrame = 0
    targets.forEach(el => { if (el) el.textContent = `0${el.dataset.suffix ?? ''}` })
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer.disconnect()
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

    return () => {
      cancelAnimationFrame(countFrame)
      observer.disconnect()
      targets.forEach(el => { if (el) el.textContent = finalText(el) })
    }
  }, [t])

  return (
    <section id="scroll-story" className="scroll-story" aria-labelledby="scroll-story-title">
      <ScrollProgress targetId="scroll-story" variable="--story-progress" phases={PHASES} stickyTop={73} />
      <div className="scroll-story-sticky mx-auto flex max-w-[1280px] min-[1800px]:max-w-[1600px] flex-col justify-center px-[clamp(20px,4vw,48px)]">
        <h2 id="scroll-story-title" className="scroll-story-copy m-0 text-[length:clamp(34px,5.1vw,76px)] leading-[1.15] font-medium tracking-[-0.025em]">
          <span className="sr-only">{t.statement}</span>
          {words.map((word, index) => (
            <span aria-hidden="true" key={`${word}-${index}`} style={{ '--word-index': index, '--word-count': words.length } as StoryStyle}>{word} </span>
          ))}
        </h2>
        <div ref={statsRef} className="scroll-story-stats grid grid-cols-1 gap-4 md:grid-cols-3">
          {t.stats.map((stat, index) => (
            <article key={stat.label} className="metric-frame p-7 sm:p-9">
              <span aria-hidden="true" className="text-xs text-muted">0{index + 1}</span>
              <p className="m-0">
                <strong className="mt-6 block text-[length:clamp(44px,5vw,72px)] leading-none font-normal tracking-[-0.04em]">
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
        <div className="flex justify-center">
          <Link href={cta.href} className="story-cta inline-flex min-h-12 items-center justify-center rounded-full px-8 text-base font-semibold">
            {cta.label}
          </Link>
        </div>
      </div>
    </section>
  )
}
