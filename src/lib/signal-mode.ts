export type SignalMode = 'full' | 'lite' | 'static'

export type SignalCapabilities = {
  reducedMotion: boolean
  webgl: boolean
  narrow: boolean
  saveData: boolean
}

export function selectSignalMode(capabilities: SignalCapabilities): SignalMode {
  if (capabilities.reducedMotion || !capabilities.webgl) return 'static'
  if (capabilities.narrow || capabilities.saveData) return 'lite'
  return 'full'
}
