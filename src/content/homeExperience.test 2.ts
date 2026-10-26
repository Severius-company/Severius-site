import { describe, expect, it } from 'vitest'
import { getExperienceCopy } from './homeExperience'

describe('home experience content', () => {
  it.each(['en', 'pt-br'] as const)('keeps the %s variant explicit and honest', locale => {
    const copy = getExperienceCopy(locale)
    const serialized = JSON.stringify(copy)

    expect(copy.services.items).toHaveLength(4)
    expect(copy.method.steps).toHaveLength(4)
    expect(copy.pipeline.items).toHaveLength(4)
    expect(copy.work.disclaimer.toLowerCase()).toMatch(/demonstr|conceit/)
    expect(serialized).not.toMatch(/desenrolai/i)
  })
})
