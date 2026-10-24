import { LinkButton } from '@/components/Button'
import { getDictionary } from '@/content'

/**
 * not-found não recebe params: renderiza os dois idiomas e o CSS mostra só o do <html lang>
 * (definido pelo layout do locale). Sem JS e sem script inline.
 */
export default function NotFound() {
  const versions = [
    { cls: 'i18n-en', href: '/', t: getDictionary('en').notFound },
    { cls: 'i18n-pt', href: '/pt-br', t: getDictionary('pt-br').notFound },
  ]
  return (
    <section className="border-b border-line bg-hero">
      {versions.map(v => (
        <div key={v.cls} className={`${v.cls} mx-auto flex max-w-[1280px] flex-col items-center gap-[18px] px-[clamp(20px,4vw,48px)] py-[clamp(64px,10vw,140px)] text-center`}>
          <h1 className="m-0 text-[length:clamp(40px,5vw,68px)] leading-[1.06] font-semibold">{v.t.title}</h1>
          <p className="m-0 text-lg text-hero-muted">{v.t.body}</p>
          <LinkButton href={v.href} className="h-14 px-7 text-base">{v.t.back}</LinkButton>
        </div>
      ))}
    </section>
  )
}
