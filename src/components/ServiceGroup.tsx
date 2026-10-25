import { IconBox } from '@/components/IconBox'
import { Reveal } from '@/components/Reveal'
import { pad2 } from '@/lib/slug'

export function ServiceGroup({ title, items, delay }: { title: string; items: string[]; delay?: number }) {
  return (
    <Reveal delay={delay} className="overflow-hidden rounded-r border border-line">
      <h3 className="m-0 border-b border-line bg-surface px-6 py-[18px] text-lg font-medium text-muted">{title}</h3>
      <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-px bg-line p-0">
        {items.map((label, i) => (
          <li key={label} className="flex flex-col gap-4 bg-bg px-6 py-[22px]">
            <IconBox size={38}>{pad2(i + 1)}</IconBox>
            <span className="text-base leading-[1.5]">{label}</span>
          </li>
        ))}
      </ol>
    </Reveal>
  )
}
