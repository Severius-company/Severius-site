import { cx } from '@/lib/cx'

/** Vetor original inspirado no gesto de pincel do símbolo Severius enviado pela marca. */
export function SeveriusBrushMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className={cx('h-full w-full', className)}>
      <path d="M19 42C28 17 65 7 96 27" stroke="#9EFF00" strokeWidth="17" strokeLinecap="round" />
      <path d="M22 35C39 19 70 14 99 31" stroke="#D8FF97" strokeWidth="5" strokeLinecap="round" opacity=".95" />
      <path d="M29 50C51 50 79 58 82 76C86 96 62 110 37 102C24 98 16 91 13 82" stroke="#73BF00" strokeWidth="19" strokeLinecap="round" />
      <path d="M31 55C52 57 69 63 70 76C72 88 55 98 38 94C27 92 21 87 17 80" stroke="#B8FF45" strokeWidth="8" strokeLinecap="round" />
      <path d="M35 99C24 96 17 90 13 82" stroke="#C6FF69" strokeWidth="5" strokeLinecap="round" />
      <path d="M25 46C43 43 74 51 83 67" stroke="#345900" strokeWidth="3" strokeLinecap="round" opacity=".8" />
    </svg>
  )
}

export function LogoMark({ size = 36, className }: { size?: 32 | 36 | 64 | 72 | 96; className?: string }) {
  const s = {
    32: 'size-8 rounded-mark',
    36: 'size-9 rounded-mark',
    64: 'size-16 rounded-mark-l',
    72: 'size-[72px] rounded-mark-l',
    96: 'size-24 rounded-mark-l',
  }[size]
  return (
    <span aria-hidden="true" className={cx('severius-logo-mark flex flex-none items-center justify-center overflow-hidden border border-white/10 bg-[#111]', s, className)}>
      <SeveriusBrushMark />
    </span>
  )
}
