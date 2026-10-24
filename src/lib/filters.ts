import type { JobFilter, WorkFilter } from '@/content/types'

export function filterWorks<T extends { type: string }>(works: T[], filter: WorkFilter): T[] {
  return filter === 'All' ? works : works.filter(w => w.type === filter)
}

export function filterJobs<T extends { group: string }>(jobs: T[], filter: JobFilter): T[] {
  return filter === 'All' ? jobs : jobs.filter(j => j.group === filter)
}

export function jobCountLabel(count: number, one: string, many: string): string {
  return (count === 1 ? one : many).replace('{n}', String(count))
}

export function toggleInList<T>(list: readonly T[], item: T): T[] {
  return list.includes(item) ? list.filter(x => x !== item) : [...list, item]
}
