'use client'

import { useState } from 'react'
import { Icon } from '@/components/Icon'
import { Reveal } from '@/components/Reveal'
import { cx } from '@/lib/cx'
import { pad2 } from '@/lib/slug'

/** Acordeão: um item aberto por vez (o primeiro começa aberto, como no protótipo). */
export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0)
  return (
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,480px),1fr))] gap-x-12 border-t border-line p-0">
      {faqs.map((f, i) => {
        const isOpen = open === i
        return (
          <Reveal as="li" key={f.q} delay={(i % 2) * 60} className="border-b border-line">
            <h3 className="m-0">
              <button
                type="button"
                id={`faq-q-${i}`}
                aria-expanded={isOpen}
                aria-controls={`faq-a-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className={cx('flex w-full items-center gap-4 bg-transparent py-5 text-left transition-colors duration-150', isOpen ? 'text-accent' : 'text-text hover:text-accent')}
              >
                <span aria-hidden="true" className="flex size-12 flex-none items-center justify-center rounded-rb bg-surface2 text-[17px] font-semibold">{pad2(i + 1)}</span>
                <span className="flex-1 text-[17px] leading-[1.35] font-medium">{f.q}</span>
                <span aria-hidden="true" className="flex text-[22px]"><Icon name={isOpen ? 'x' : 'plus'} /></span>
              </button>
            </h3>
            <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={!isOpen} className="pb-[22px] pl-16 text-[15px] leading-[1.65] text-muted">
              {f.a}
            </div>
          </Reveal>
        )
      })}
    </ul>
  )
}
