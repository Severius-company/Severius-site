'use client'

import { useEffect, useRef, type ReactNode } from 'react'

export function AdaptiveHeader({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const header = ref.current
    if (!header) return
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => header.toggleAttribute('data-compact', window.scrollY > 72))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update) }
  }, [])

  return <header ref={ref} className="site-header fixed inset-x-0 top-0 z-20">{children}</header>
}
