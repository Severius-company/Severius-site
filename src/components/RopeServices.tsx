'use client'

import { useEffect, useRef } from 'react'
import type { ExperienceCopy } from '@/content/homeExperience'

export function RopeServices({ copy }: { copy: ExperienceCopy['services'] }) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: none)').matches || typeof IntersectionObserver === 'undefined') return
    const cards = Array.from(gridRef.current?.querySelectorAll<HTMLElement>('[data-rope-card]') ?? [])
    const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.target.toggleAttribute('data-active', entry.isIntersecting)), { rootMargin: '-28% 0px -28%', threshold: 0.25 })
    cards.forEach(card => observer.observe(card))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="capacidades" className="flow-section rope-services" aria-labelledby="services-flow-title">
      <div className="flow-section-heading">
        <p className="flow-eyebrow">{copy.eyebrow}</p>
        <h2 id="services-flow-title">{copy.title}</h2>
        <p>{copy.body}</p>
      </div>
      <div ref={gridRef} className="rope-services-grid">
        {copy.items.map(item => (
          <article key={item.id} className="rope-service-card" data-rope-card tabIndex={0}>
            <svg className="rope-service-art" viewBox="0 0 700 460" preserveAspectRatio="none" aria-hidden="true">
              <path className="rope-service-shadow" d="M-40 390 C120 120 250 520 390 240 S610 80 760 240" />
              <path className="rope-service-line" pathLength="1" d="M-40 390 C120 120 250 520 390 240 S610 80 760 240" />
            </svg>
            <span className="rope-service-number">{item.number}</span>
            <div className="rope-service-content">
              <h3>{item.title}</h3><p>{item.body}</p>
              <ul aria-label={`${item.title} tags`}>{item.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
            </div>
            <span className="rope-service-arrow" aria-hidden="true">↗</span>
          </article>
        ))}
      </div>
    </section>
  )
}
