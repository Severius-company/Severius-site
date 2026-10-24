import { Reveal } from '@/components/Reveal'
import type { Quote } from '@/content/types'
import { initials } from '@/lib/slug'

export function TestimonialCard({ quote, delay }: { quote: Quote; delay?: number }) {
  return (
    <Reveal as="figure" delay={delay} className="glass-panel m-0 flex flex-col gap-3.5 rounded-r border p-7">
      <blockquote className="m-0 flex flex-1 flex-col gap-3.5">
        <p className="m-0 text-[19px] leading-[1.35] font-medium text-accent">{quote.title}</p>
        <p className="m-0 flex-1 text-[15px] leading-[1.6] text-muted">{quote.body}</p>
      </blockquote>
      <figcaption className="flex items-center gap-3 border-t border-line pt-4">
        <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-full bg-surface2 text-sm font-semibold">
          {initials(quote.name)}
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-base font-medium">{quote.name}</span>
          <span className="text-sm text-muted">{quote.role}</span>
        </span>
      </figcaption>
    </Reveal>
  )
}
