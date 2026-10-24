'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import { SectionHeader } from '@/components/SectionHeader'
import { ServiceGroup } from '@/components/ServiceGroup'
import { Tag } from '@/components/Tag'
import type { ServiceId, ServiceText } from '@/content/types'
import { localePath, type Locale } from '@/lib/i18n'
import { cx } from '@/lib/cx'

type Item = ServiceText & { id: ServiceId }

export function ServicesTabs({ services, locale, tabsAria, initialIndex = 0 }: { services: Item[]; locale: Locale; tabsAria: string; initialIndex?: number }) {
  const [index, setIndex] = useState(initialIndex)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const svc = services[index]

  const select = (i: number) => {
    setIndex(i)
    window.history.replaceState(null, '', localePath(locale, `/services?tab=${services[i].id}`))
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const next = (index + dir + services.length) % services.length
    select(next)
    tabs.current[next]?.focus()
  }

  return (
    <>
      <div role="tablist" aria-label={tabsAria} className="mb-11 flex max-w-[560px] gap-1.5 rounded-seg bg-surface2 p-1.5">
        {services.map((s, i) => {
          const on = i === index
          return (
            <button
              key={s.id}
              ref={el => { tabs.current[i] = el }}
              type="button"
              role="tab"
              id={`tab-${s.id}`}
              aria-selected={on}
              aria-controls={`panel-${s.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => select(i)}
              onKeyDown={onKeyDown}
              className={cx(
                'h-[46px] flex-1 rounded-seg-in px-2 text-[15px] leading-tight font-semibold transition-colors duration-150',
                on ? 'bg-accent text-on-accent' : 'text-text hover:bg-surface-hover',
              )}
            >
              {s.tab}
            </button>
          )
        })}
      </div>
      <div role="tabpanel" id={`panel-${svc.id}`} aria-labelledby={`tab-${svc.id}`}>
        <SectionHeader key={`h-${svc.id}`} title={svc.title} body={svc.body} aside={<Tag>{svc.include}</Tag>} />
        <div className="flex flex-col gap-7">
          {svc.groups.map(g => (
            <ServiceGroup key={`${svc.id}-${g.title}`} title={g.title} items={g.items} />
          ))}
        </div>
      </div>
    </>
  )
}
