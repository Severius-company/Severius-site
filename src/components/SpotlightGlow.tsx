'use client'

import { useEffect } from 'react'

/**
 * Sincroniza um único spotlight com todas as superfícies de vidro.
 * O desenho permanece no CSS; este componente só atualiza a posição do ponteiro.
 */
export function SpotlightGlow() {
  useEffect(() => {
    const root = document.documentElement
    const finePointer = window.matchMedia('(pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!finePointer.matches || reducedMotion.matches) return

    let frame = 0
    let x = -1000
    let y = -1000

    const paint = () => {
      root.style.setProperty('--spotlight-x', `${x.toFixed(2)}px`)
      root.style.setProperty('--spotlight-y', `${y.toFixed(2)}px`)
      frame = 0
    }

    const queuePaint = () => {
      if (!frame) frame = requestAnimationFrame(paint)
    }

    const onPointerMove = (event: PointerEvent) => {
      x = event.clientX
      y = event.clientY
      queuePaint()
    }

    const onPointerLeave = () => {
      x = -1000
      y = -1000
      queuePaint()
    }

    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onPointerLeave)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('mouseleave', onPointerLeave)
      root.style.removeProperty('--spotlight-x')
      root.style.removeProperty('--spotlight-y')
    }
  }, [])

  return null
}
