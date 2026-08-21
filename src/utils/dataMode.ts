export type DataMode = 'auto' | 'demo'

const STORAGE_KEY = 'wander-data-mode'

export function getDataMode(): DataMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'demo' || stored === 'auto') return stored
  return 'auto'
}

export function setDataMode(mode: DataMode) {
  localStorage.setItem(STORAGE_KEY, mode)
}

export function isDemoMode(): boolean {
  const mode = getDataMode()
  if (mode === 'demo') return true
  const apiKey = import.meta.env.VITE_ORS_API_KEY
  return !apiKey
}
