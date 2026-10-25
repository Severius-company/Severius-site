import Link from 'next/link'
import { Icon } from '@/components/Icon'
import { IconBox } from '@/components/IconBox'
import { Tag } from '@/components/Tag'
import { WorkShot } from '@/components/WorkShot'
import type { WorkType } from '@/content/types'
import { fill, localePath, type Locale } from '@/lib/i18n'

export type WorkCardData = { slug: string; client: string; url: string; type: WorkType; category: string }

/** Texto do placeholder listrado (en: "web mockup · chic boutique"; pt: "mockup web · chic boutique"). */
export function shotLabel(template: string, work: Pick<WorkCardData, 'type' | 'client'>) {
  return fill(template, { type: work.type.toLowerCase(), client: work.client.toLowerCase() })
}

export function WorkCard({ work, locale, shotTemplate }: { work: WorkCardData; locale: Locale; shotTemplate: string }) {
  return (
    <Link
      href={localePath(locale, `/work/${work.slug}`)}
      className="glass-panel group flex h-full flex-col gap-[18px] rounded-r border p-6 text-left transition-[border-color,box-shadow,transform] duration-200 motion-safe:hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_26px_70px_rgba(0,0,0,.3)]"
    >
      <span className="text-[15px] text-muted">{work.category}</span>
      <WorkShot label={shotLabel(shotTemplate, work)} className="aspect-[16/10] rounded-rb" />
      <div className="flex w-full items-center gap-3">
        <div className="flex flex-1 flex-col items-start gap-2">
          <h3 className="m-0 text-xl font-semibold">{work.client}</h3>
          <Tag variant="muted">{work.url}</Tag>
        </div>
        <IconBox size={48} className="transition-colors duration-150 group-hover:bg-accent group-hover:text-on-accent">
          <Icon name="arrowUR" />
        </IconBox>
      </div>
    </Link>
  )
}
