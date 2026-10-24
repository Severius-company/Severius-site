'use client'

import { useState } from 'react'
import { Chip } from '@/components/Chip'
import type { IconName } from '@/components/Icon'
import { JobCard } from '@/components/JobCard'
import { Reveal } from '@/components/Reveal'
import { H2_SM } from '@/components/SectionHeader'
import type { CareersDict, JobFilter, JobGroup } from '@/content/types'
import { filterJobs, jobCountLabel, toggleInList } from '@/lib/filters'

const FILTERS: JobFilter[] = ['All', 'Design', 'Development', 'Management', 'QA']

type JobItem = { id: number; group: JobGroup; icon: IconName; title: string; desc: string }

export function CareersJobs({ jobs, t }: { jobs: JobItem[]; t: Omit<CareersDict, 'jobs' | 'perks'> }) {
  const [group, setGroup] = useState<JobFilter>('All')
  const [applied, setApplied] = useState<number[]>([])
  const list = filterJobs(jobs, group)
  return (
    <section aria-labelledby="openings-title">
      <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 id="openings-title" className={H2_SM}>{t.openingsTitle}</h2>
          <span className="text-[15px] text-muted" aria-live="polite">{jobCountLabel(list.length, t.countOne, t.countMany)}</span>
        </div>
        <div role="group" aria-label={t.filterAria} className="flex flex-wrap gap-2">
          {FILTERS.map(g => (
            <Chip key={g} on={g === group} onClick={() => setGroup(g)}>{t.groups[g]}</Chip>
          ))}
        </div>
      </Reveal>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] gap-4 p-0">
        {list.map((job, i) => (
          <Reveal as="li" key={job.id} delay={(i % 3) * 80}>
            <JobCard
              job={{ ...job, groupLabel: t.opening.replace('{group}', t.groups[job.group]) }}
              labels={t}
              applied={applied.includes(job.id)}
              onApply={() => setApplied(a => toggleInList(a, job.id))}
            />
          </Reveal>
        ))}
      </ul>
    </section>
  )
}
