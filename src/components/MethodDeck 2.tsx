'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { ExperienceCopy } from '@/content/homeExperience'

type DeckStyle = CSSProperties & { '--card-index': number }

export function MethodDeck({ copy }: { copy: ExperienceCopy['method'] }) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect()
        const range = Math.max(rect.height - window.innerHeight, 1)
        const progress = Math.min(1, Math.max(0, -rect.top / range))
        section.style.setProperty('--deck-progress', progress.toFixed(4))
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])

  return (
    <section ref={sectionRef} className="method-deck" aria-labelledby="method-title">
      <div className="method-sticky">
        <div className="method-copy">
          <p className="flow-eyebrow">{copy.eyebrow}</p><h2 id="method-title">{copy.title}</h2><p>{copy.body}</p>
        </div>
        <ol className="method-cards">
          {copy.steps.map((step, index) => (
            <li key={step.number} style={{ '--card-index': index } as DeckStyle}>
              <span>{step.number}</span><h3>{step.title}</h3><p>{step.body}</p><small>{step.output}</small>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
