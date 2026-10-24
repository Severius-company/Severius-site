import { Icon } from '@/components/Icon'
import { cx } from '@/lib/cx'

/** Marca: cubo em quadrado verde + "Severius". */
export function LogoMark({ size = 36, className }: { size?: 32 | 36 | 64 | 72 | 96; className?: string }) {
  const s = {
    32: 'size-8 text-lg rounded-mark',
    36: 'size-9 text-xl rounded-mark',
    64: 'size-16 text-[30px] rounded-mark-l',
    72: 'size-[72px] text-4xl rounded-mark',
    96: 'size-24 text-5xl rounded-mark-l shadow-glow',
  }[size]
  return (
    <span aria-hidden="true" className={cx('flex flex-none items-center justify-center bg-accent text-on-accent', s, className)}>
      <Icon name="box" />
    </span>
  )
}
