'use client'

import { useLayoutEffect, useRef, type ComponentPropsWithoutRef, type ElementType } from 'react'

type RevealProps<T extends ElementType> = {
  as?: T
  /** atraso em ms (stagger em grids/listas) */
  delay?: number
} & Omit<ComponentPropsWithoutRef<T>, 'as'>

/**
 * Fade-in + translateY ao entrar na viewport (uma vez).
 * - SSR/sem JS: renderiza visível (sem data-reveal).
 * - No cliente, só esconde o que está abaixo da dobra no momento da montagem.
 * - prefers-reduced-motion: não anima (e o CSS força visível).
 * Só usa opacity/transform: não causa layout shift.
 */
export function Reveal<T extends ElementType = 'div'>({ as, delay = 0, style, ...rest }: RevealProps<T>) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (el.getBoundingClientRect().top < window.innerHeight) return

    el.dataset.reveal = 'hidden'
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          el.dataset.reveal = 'shown'
          observer.unobserve(el)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const Tag = (as ?? 'div') as ElementType
  return <Tag ref={ref} style={delay ? { transitionDelay: `${delay}ms`, ...style } : style} {...rest} />
}
