'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { Locale } from '@/lib/i18n'

const copy = {
  'pt-br': {
    statement: 'Você não precisa acompanhar cada detalhe para saber que o projeto está avançando. Nosso processo é silencioso, transparente e orientado a resultados: um time focado transformando complexidade em software sólido.',
    stats: [
      { value: 250, suffix: '+', label: 'empresas confiam na Severius' },
      { value: 3, suffix: '', label: 'disciplinas trabalhando como uma só' },
      { value: 10, suffix: '', label: 'soluções no portfólio' },
    ],
  },
  en: {
    statement: 'You should not need to check every detail to know the project is moving forward. Our process is quiet, transparent and outcome-led: one focused team turning complexity into solid software.',
    stats: [
      { value: 250, suffix: '+', label: 'companies trust Severius' },
      { value: 3, suffix: '', label: 'disciplines working as one' },
      { value: 10, suffix: '', label: 'solutions in our portfolio' },
    ],
  },
} as const

type StoryStyle = CSSProperties & { '--story-progress': number; '--word-index'?: number; '--word-count'?: number }

export function ScrollStory({ locale }: { locale: Locale }) {
  const sectionRef = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const [values, setValues] = useState([0, 0, 0])
  const t = copy[locale]
  const words = useMemo(() => t.statement.split(' '), [t.statement])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      section.style.setProperty('--story-progress', '1')
      const reducedFrame = requestAnimationFrame(() => setValues(t.stats.map(stat => stat.value)))
      return () => cancelAnimationFrame(reducedFrame)
    }

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

    const stats = statsRef.current
    let countFrame = 0
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      const startedAt = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / 1400, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setValues(t.stats.map(stat => Math.round(stat.value * eased)))
        if (progress < 1) countFrame = requestAnimationFrame(tick)
      }
      countFrame = requestAnimationFrame(tick)
      observer.disconnect()
    }, { threshold: 0.35 })
    if (stats) observer.observe(stats)

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(countFrame)
      observer.disconnect()
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [t])

  return (
    <section ref={sectionRef} className="scroll-story border-b border-line" style={{ '--story-progress': 0 } as StoryStyle} aria-labelledby="scroll-story-title">
      <div className="scroll-story-sticky mx-auto flex max-w-[1280px] min-[1800px]:max-w-[1600px] flex-col justify-center px-[clamp(20px,4vw,48px)]">
        <h2 id="scroll-story-title" className="scroll-story-copy m-0 text-[length:clamp(34px,5.1vw,76px)] leading-[1.08] font-medium tracking-[-0.025em]">
          {words.map((word, index) => (
            <span key={`${word}-${index}`} style={{ '--word-index': index, '--word-count': words.length } as StoryStyle}>{word} </span>
          ))}
        </h2>
        <div ref={statsRef} className="scroll-story-stats grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-3">
          {t.stats.map((stat, index) => (
            <article key={stat.label} className="metric-frame bg-bg p-7 sm:p-9">
              <span className="text-xs text-muted">0{index + 1}</span>
              <strong className="mt-8 block text-[length:clamp(44px,5vw,72px)] leading-none font-normal tracking-[-0.04em]">{values[index]}{stat.suffix}</strong>
              <p className="mt-3 mb-0 text-sm leading-[1.5] text-muted">{stat.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
