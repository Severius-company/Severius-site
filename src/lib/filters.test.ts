import { describe, expect, it } from 'vitest'
import { getDictionary, getJobs, getWorks } from '@/content'
import { filterJobs, filterWorks, jobCountLabel, toggleInList } from './filters'

const en = getDictionary('en')
const pt = getDictionary('pt-br')

describe('filtros', () => {
  it('filtra works por tipo', () => {
    const works = getWorks(en)
    expect(filterWorks(works, 'All')).toHaveLength(10)
    expect(filterWorks(works, 'Web').map(w => w.client)).toEqual(['Chic Boutique', 'Dream Homes Realty', 'EduConnect', 'ConnectCRM'])
    expect(filterWorks(works, 'Mobile')).toHaveLength(3)
    expect(filterWorks(works, 'Software')).toHaveLength(3)
  })
  it('filtra vagas por grupo e pluraliza o contador nos dois idiomas', () => {
    expect(filterJobs(getJobs(en), 'All')).toHaveLength(12)
    expect(filterJobs(getJobs(en), 'QA').map(j => j.title)).toEqual(['QA Tester', 'SQL Tester', 'Manual Tester'])
    expect(jobCountLabel(1, en.careers.countOne, en.careers.countMany)).toBe('1 open role')
    expect(jobCountLabel(3, pt.careers.countOne, pt.careers.countMany)).toBe('3 vagas abertas')
  })
  it('toggleInList adiciona e remove', () => {
    expect(toggleInList([1, 2], 2)).toEqual([1])
    expect(toggleInList([1], 2)).toEqual([1, 2])
  })
})
