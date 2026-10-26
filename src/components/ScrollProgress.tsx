'use client'

import { useEffect } from 'react'

/** Fase nomeada da cena: a variável `--{name}` vai de 0 a 1 (com easing) entre `from` e `to` do progresso. */
export type ScrollPhase = { name: `--${string}`; from: number; to: number }

const smoothstep = (x: number) => x * x * (3 - 2 * x)

/** Progresso 0→1 da fase, já suavizado. */
export function phaseValue(progress: number, from: number, to: number): number {
  if (to <= from) return progress >= to ? 1 : 0
  return smoothstep(Math.min(Math.max((progress - from) / (to - from), 0), 1))
}

/**
 * Progresso de rolagem compartilhado por todas as cenas da home.
 *
 * - Escreve `variable` (0→1 cru) e cada fase em `phases` como variáveis CSS no próprio alvo;
 *   o CSS só usa essas variáveis em transform/opacity (nada de width/height/top/left).
 * - `stickyTop`: deslocamento do palco sticky (altura do header), para o progresso começar em 0 no topo.
 * - Só escuta `scroll` enquanto o alvo está na viewport (IntersectionObserver) e marca `data-scene-active`
 *   (o CSS liga `will-change` só nesse intervalo).
 * - prefers-reduced-motion: não faz nada; o CSS mostra a versão estática.
 * - Limpa listeners, frames e variáveis no unmount (o CSS volta ao estado padrão/sem JS).
 */
export function ScrollProgress({ targetId, variable, phases = [], stickyTop = 0 }: { targetId: string; variable: `--${string}`; phases?: ScrollPhase[]; stickyTop?: number }) {
  useEffect(() => {
    const target = document.getElementById(targetId)
    if (!target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let listening = false
    const write = () => {
      frame = 0
      const rect = target.getBoundingClientRect()
      const distance = Math.max(target.offsetHeight - (window.innerHeight - stickyTop), 1)
      const progress = Math.min(Math.max((stickyTop - rect.top) / distance, 0), 1)
      target.style.setProperty(variable, progress.toFixed(4))
      for (const p of phases) target.style.setProperty(p.name, phaseValue(progress, p.from, p.to).toFixed(4))
    }
    const update = () => {
      if (!frame) frame = requestAnimationFrame(write)
    }
    const listen = (on: boolean) => {
      if (on === listening) return
      listening = on
      target.toggleAttribute('data-scene-active', on)
      if (on) {
        window.addEventListener('scroll', update, { passive: true })
        window.addEventListener('resize', update)
        update()
      } else {
        window.removeEventListener('scroll', update)
        window.removeEventListener('resize', update)
        write() // fixa o estado final ao sair da viewport (0 acima, 1 abaixo)
      }
    }
    const observer = new IntersectionObserver(entries => listen(entries.some(e => e.isIntersecting)), { rootMargin: '10% 0px' })
    observer.observe(target)
    write()

    return () => {
      observer.disconnect()
      listen(false)
      cancelAnimationFrame(frame)
      target.removeAttribute('data-scene-active')
      target.style.removeProperty(variable)
      for (const p of phases) target.style.removeProperty(p.name)
    }
    // phases é estático por cena; serializado para não re-executar a cada render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, variable, stickyTop, JSON.stringify(phases)])

  return null
}
