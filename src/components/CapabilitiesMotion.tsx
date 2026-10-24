'use client'

import { useEffect, useState } from 'react'

/**
 * Movimento da seção de capacidades: a espinha se desenha com a rolagem e cada grupo "se conecta" ao entrar.
 * Só anima transform/opacity/blur sobre a rolagem NATIVA; o conteúdo permanece no DOM e legível sem JS.
 * Com prefers-reduced-motion o GSAP nem é carregado; se a preferência mudar em runtime, o efeito reverte ou inicia.
 */
export function CapabilitiesMotion() {
  const [reduced, setReduced] = useState(true) // até saber a preferência, assume-se reduzido: nada é importado nem animado
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
        const root = document.querySelector<HTMLElement>('.capabilities')
        const field = root?.querySelector<HTMLElement>('.capability-field')
        if (!root || !field) return
        const focusIn = { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' }
        const focusOut = { opacity: 0, y: 28, filter: 'blur(8px)' }

        gsap.fromTo(field, { '--spine': 0 }, { '--spine': 1, ease: 'none', scrollTrigger: { trigger: field, start: 'top 75%', end: 'bottom 65%', scrub: 0.6 } })

        gsap.timeline({ scrollTrigger: { trigger: root.querySelector('.section-intro'), start: 'top 82%', once: true } })
          .fromTo(root.querySelector('.section-intro h2'), focusOut, focusIn)
          .fromTo(root.querySelector('.section-intro > p'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.15)

        root.querySelectorAll<HTMLElement>('.capability-group').forEach(group => {
          const mark = group.querySelector('.connection-mark')
          gsap.timeline({ scrollTrigger: { trigger: group, start: 'top 80%', once: true } })
            .fromTo(group, { '--draw': 0 }, { '--draw': 1, duration: 0.9, ease: 'power2.inOut' }, 0)
            .fromTo(mark, { scale: 0 }, { scale: 1, duration: 0.55, ease: 'back.out(2.4)', onComplete: () => mark?.classList.add('is-live') }, 0.1)
            .fromTo(group.querySelector('h3'), focusOut, focusIn, 0.2)
            .fromTo(group.querySelector('header p'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.35)
            .fromTo(group.querySelectorAll('li'), { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', stagger: 0.09 }, 0.4)
        })

        gsap.fromTo(root.querySelector('.contextual-link'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: root.querySelector('.contextual-link'), start: 'top 92%', once: true } })
      })
      revert = () => ctx.revert()
      ScrollTrigger.refresh()
    })()
    return () => { cancelled = true; revert() }
  }, [reduced])
  return null
}
