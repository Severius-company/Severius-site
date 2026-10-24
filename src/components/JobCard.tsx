import { Icon, type IconName } from '@/components/Icon'
import { IconBox } from '@/components/IconBox'
import { cx } from '@/lib/cx'

export type JobCardData = { id: number; title: string; desc: string; icon: IconName; groupLabel: string }
export type JobCardLabels = { apply: string; applied: string; applyAria: string; appliedAria: string }

export function JobCard({ job, applied, onApply, labels }: { job: JobCardData; applied: boolean; onApply: () => void; labels: JobCardLabels }) {
  return (
    <article className={cx('glass-panel flex h-full flex-col gap-3.5 rounded-r border p-6 transition-colors duration-150', applied ? 'border-accent' : 'border-line')}>
      <div className="flex items-center gap-3.5">
        <IconBox size={48}><Icon name={job.icon} /></IconBox>
        <div className="flex flex-1 flex-col gap-[3px]">
          <h3 className="m-0 text-lg font-semibold">{job.title}</h3>
          <span className="text-sm text-muted">{job.groupLabel}</span>
        </div>
      </div>
      <p className="m-0 flex-1 text-[15px] leading-[1.6] text-muted">{job.desc}</p>
      <button
        type="button"
        onClick={onApply}
        aria-pressed={applied}
        aria-label={(applied ? labels.appliedAria : labels.applyAria).replace('{title}', job.title)}
        className={cx(
          'h-12 rounded-rb text-[15px] font-semibold transition-colors duration-150',
          applied ? 'glass-control border text-accent' : 'glass-accent text-on-accent',
        )}
      >
        {applied ? labels.applied : labels.apply}
      </button>
    </article>
  )
}
