'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import { WorkCard, type WorkCardData } from '@/components/WorkCard'
import type { Locale } from '@/lib/i18n'

type StackStyle = CSSProperties & {
  '--stack-index': number
  '--stack-scale': number
  '--stack-opacity': number
}

export function StackedWork({ works, locale, shotTemplate }: { works: WorkCardData[]; locale: Locale; shotTemplate: string }) {
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (!list || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const items = Array.from(list.querySelectorAll<HTMLElement>('[data-stack-card]'))
    let frame = 0

    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const listRect = list.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        if (listRect.bottom < 0 || listRect.top > viewportHeight) return

        const compact = window.innerWidth < 768
        const baseTop = compact ? 84 : 96
        const step = compact ? 10 : 18
        const start = viewportHeight * 0.86
        const rects = items.map(item => item.getBoundingClientRect())

        items.forEach((item, index) => {
          const nextRect = rects[index + 1]
          const end = baseTop + (index + 1) * step
          const progress = nextRect ? Math.min(Math.max((start - nextRect.top) / Math.max(start - end, 1), 0), 1) : 0
          const scaleDrop = (items.length - 1 - index) * (compact ? 0.012 : 0.025)

          item.style.setProperty('--stack-scale', (1 - scaleDrop * progress).toFixed(4))
          item.style.setProperty('--stack-opacity', (1 - progress * 0.12).toFixed(4))
        })
      })
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [works.length])

  return (
    <ul ref={listRef} className="work-stack m-0 list-none p-0">
      {works.map((work, index) => (
        <li
          key={work.slug}
          data-stack-card
          className="work-stack-item"
          style={{ '--stack-index': index, '--stack-scale': 1, '--stack-opacity': 1 } as StackStyle}
        >
          <WorkCard work={work} locale={locale} shotTemplate={shotTemplate} className="work-stack-link" />
        </li>
      ))}
    </ul>
  )
}
