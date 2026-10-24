import type { ReactNode } from 'react'
import { Reveal } from '@/components/Reveal'
import { cx } from '@/lib/cx'

export const H2 = 'm-0 text-[length:clamp(32px,3.6vw,48px)] leading-[1.1] font-semibold tracking-[-0.01em]'
export const H2_SM = 'm-0 text-[length:clamp(28px,3vw,40px)] leading-[1.1] font-semibold tracking-[-0.01em]'

/** Título (h2) + texto de apoio em duas colunas, alinhados à base. */
export function SectionHeader({ title, body, id, aside, className }: { title: ReactNode; body?: ReactNode; id?: string; aside?: ReactNode; className?: string }) {
  return (
    <Reveal className={cx('mb-9 grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-x-16 gap-y-4', className)}>
      <div className="flex flex-col items-start gap-3.5">
        <h2 id={id} className={H2}>{title}</h2>
        {aside}
      </div>
      {body ? <p className="m-0 max-w-[56ch] text-[17px] leading-[1.6] text-muted">{body}</p> : null}
    </Reveal>
  )
}
