import { LinkButton } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { IconBox } from '@/components/IconBox'
import { Reveal } from '@/components/Reveal'
import type { Service } from '@/content'
import { fill, localePath, type Locale } from '@/lib/i18n'

export function ServiceCard({ service, locale, learnMore, learnMoreAria, delay }: { service: Service; locale: Locale; learnMore: string; learnMoreAria: string; delay?: number }) {
  return (
    <Reveal delay={delay} className="glass-panel flex flex-col gap-[18px] px-7 py-8">
      <IconBox size={56}><Icon name={service.icon} /></IconBox>
      <h3 className="m-0 text-2xl font-semibold">{service.title}</h3>
      <p className="m-0 flex-1 text-[15px] leading-[1.6] text-muted">{service.body}</p>
      <LinkButton
        href={localePath(locale, `/services?tab=${service.id}`)}
        variant="surface"
        className="min-h-[50px] w-full"
        aria-label={fill(learnMoreAria, { title: service.title })}
      >
        {learnMore}
      </LinkButton>
    </Reveal>
  )
}
