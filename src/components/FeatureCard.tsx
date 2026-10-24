import { Icon, type IconName } from '@/components/Icon'
import { IconBox } from '@/components/IconBox'
import { Reveal } from '@/components/Reveal'

export function FeatureCard({ icon, title, body, delay }: { icon: IconName; title: string; body: string; delay?: number }) {
  return (
    <Reveal delay={delay} className="glass-panel flex flex-col gap-3.5 p-7">
      <IconBox size={52}><Icon name={icon} /></IconBox>
      <h3 className="m-0 text-[19px] font-semibold">{title}</h3>
      <p className="m-0 text-[15px] leading-[1.6] text-muted">{body}</p>
    </Reveal>
  )
}
