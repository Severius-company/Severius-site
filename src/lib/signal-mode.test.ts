import { describe, expect, it } from 'vitest'
import { selectSignalMode } from './signal-mode'

describe('selectSignalMode', () => {
  it('uses static mode when motion is reduced or WebGL is unavailable', () => {
    expect(selectSignalMode({ reducedMotion: true, webgl: true, narrow: false, saveData: false })).toBe('static')
    expect(selectSignalMode({ reducedMotion: false, webgl: false, narrow: false, saveData: false })).toBe('static')
  })

  it('uses lite mode for a narrow viewport or data saver', () => {
    expect(selectSignalMode({ reducedMotion: false, webgl: true, narrow: true, saveData: false })).toBe('lite')
    expect(selectSignalMode({ reducedMotion: false, webgl: true, narrow: false, saveData: true })).toBe('lite')
  })

  it('uses full mode only when every capability condition allows it', () => {
    expect(selectSignalMode({ reducedMotion: false, webgl: true, narrow: false, saveData: false })).toBe('full')
  })
})
