import { Reveal } from '@/components/Reveal'
import { cx } from '@/lib/cx'

/** Passo numerado (Process: 84px; Our Story: 64px com título verde). */
export function StepCard({ n, title, body, label, variant = 'process', delay }: { n: string; title: string; body: string; label?: string; variant?: 'process' | 'story'; delay?: number }) {
  const story = variant === 'story'
  return (
    <Reveal as="li" delay={delay} className={cx('glass-panel flex flex-col', story ? 'gap-4 p-7' : 'gap-[18px] p-8')}>
      <div className={cx('flex items-end', story ? 'gap-4' : 'gap-[18px]')}>
        <span aria-hidden="true" className={cx('font-semibold tracking-[-0.02em] text-num', story ? 'text-[64px] leading-[.85]' : 'text-[84px] leading-[.82]')}>
          {n}
        </span>
        <h3
          className={cx(
            'm-0 flex-1 border-b border-line',
            story ? 'pb-2 text-xl font-semibold text-accent' : 'pb-2.5 text-[22px] font-medium',
          )}
        >
          {label ? <span className="sr-only">{`${label} ${n}: `}</span> : null}
          {title}
        </h3>
      </div>
      <p className="m-0 text-[15px] leading-[1.65] text-muted">{body}</p>
    </Reveal>
  )
}
