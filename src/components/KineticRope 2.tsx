'use client'

import { useEffect, useRef } from 'react'

export function KineticRope() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pointer = { x: 0.62, y: 0.42 }
    let scroll = window.scrollY
    let velocity = 0
    let previousScroll = scroll
    let raf = 0
    let width = 1
    let height = 1
    let dpr = 1

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 1.6)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const drawRope = (offset: number, alpha: number, lineWidth: number) => {
      const travel = (scroll * 0.12 + offset) % (height * 1.4)
      const drift = reduceMotion.matches ? 0 : velocity * 1.8
      context.beginPath()
      context.moveTo(width * 0.84, -height * 0.22 + travel - height * 0.7)
      context.bezierCurveTo(
        width * (0.42 + pointer.x * 0.12), height * (0.08 + pointer.y * 0.06) + drift,
        width * (0.95 - pointer.x * 0.08), height * 0.45 - drift,
        width * 0.54, height * 0.7,
      )
      context.bezierCurveTo(width * 0.15, height * 0.98, width * 0.76, height * 1.1, width * 0.24, height * 1.38)
      context.strokeStyle = `rgba(158, 255, 0, ${alpha})`
      context.lineWidth = lineWidth
      context.lineCap = 'round'
      context.stroke()
    }

    const render = () => {
      const current = window.scrollY
      velocity += (current - previousScroll - velocity) * 0.12
      velocity *= 0.9
      scroll = current
      previousScroll = current
      context.clearRect(0, 0, width, height)
      context.globalCompositeOperation = 'lighter'
      drawRope(0, 0.035, 22)
      drawRope(14, 0.11, 2)
      drawRope(32, 0.055, 1)
      context.globalCompositeOperation = 'source-over'
      raf = window.requestAnimationFrame(render)
    }

    const onPointer = (event: PointerEvent) => {
      pointer.x = event.clientX / Math.max(width, 1)
      pointer.y = event.clientY / Math.max(height, 1)
    }

    resize()
    render()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [])

  return <canvas ref={canvasRef} className="kinetic-rope" aria-hidden="true" />
}
