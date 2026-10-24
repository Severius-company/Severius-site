'use client'

import { useEffect } from 'react'

export function ScrollProgress({ targetId, variable }: { targetId: string; variable: `--${string}` }) {
  useEffect(() => {
    const target = document.getElementById(targetId)
    if (!target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect()
        const distance = Math.max(target.offsetHeight - window.innerHeight, 1)
        const progress = Math.min(Math.max(-rect.top / distance, 0), 1)
        target.style.setProperty(variable, progress.toFixed(4))
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
  }, [targetId, variable])

  return null
}
