'use client'

import { useEffect, useState } from 'react'
import { SeveriusBrushMark } from '@/components/Logo'

export function SiteLoader({ label }: { label: string }) {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => setDone(true), reduced ? 0 : 1150)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="site-loader" data-done={done || undefined} aria-hidden={done || undefined}>
      <div className="site-loader-mark" aria-hidden="true">
        <SeveriusBrushMark />
      </div>
      <p role="status" className="site-loader-label">{label}</p>
    </div>
  )
}
