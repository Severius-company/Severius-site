'use client'

import { useState } from 'react'
import { Chip } from '@/components/Chip'
import { Reveal } from '@/components/Reveal'
import { WorkCard, type WorkCardData } from '@/components/WorkCard'
import type { WorkFilter, WorkUiDict } from '@/content/types'
import { filterWorks } from '@/lib/filters'
import { fill, type Locale } from '@/lib/i18n'

const FILTERS: WorkFilter[] = ['All', 'Web', 'Mobile', 'Software']

export function WorkGrid({ works, locale, t }: { works: WorkCardData[]; locale: Locale; t: WorkUiDict }) {
  const [filter, setFilter] = useState<WorkFilter>('All')
  const list = filterWorks(works, filter)
  return (
    <>
      <div role="group" aria-label={t.filterAria} className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <Chip key={f} on={f === filter} onClick={() => setFilter(f)}>{t.filters[f]}</Chip>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{fill(t.count, { n: list.length })}</p>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] gap-5 p-0">
        {list.map((w, i) => (
          <Reveal as="li" key={w.slug} delay={(i % 2) * 80}>
            <WorkCard work={w} locale={locale} shotTemplate={t.shot} />
          </Reveal>
        ))}
      </ul>
    </>
  )
}
