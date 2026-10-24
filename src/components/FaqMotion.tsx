'use client'

import { useEffect, useState } from 'react'

/**
 * Entrada por rolagem do FAQ: título ganha foco (blur) e os itens revelam em cascata, uma vez.
 * Com prefers-reduced-motion o GSAP nem é carregado — o `<details>` já funciona sozinho, sem JS.
 */
export function FaqMotion() {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update(); media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (reduced) return
    let cancelled = false
    let revert = () => {}
    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)
      const ctx = gsap.context(() => {
        const root = document.querySelector<HTMLElement>('.faq')
        const items = root?.querySelectorAll<HTMLElement>('.faq-list > li')
        if (!root || !items?.length) return
        gsap.fromTo(root.querySelector('h2'), { opacity: 0, y: 24, filter: 'blur(8px)' }, {
          opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: root, start: 'top 80%', once: true },
        })
        gsap.fromTo(items, { opacity: 0, y: 20 }, {
          opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08,
          scrollTrigger: { trigger: root.querySelector('.faq-list'), start: 'top 85%', once: true },
        })
      })
      revert = () => ctx.revert()
      ScrollTrigger.refresh()
    })()
    return () => { cancelled = true; revert() }
  }, [reduced])
  return null
}
