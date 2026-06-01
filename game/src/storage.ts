export interface SaveState {
  currentScene: string
  flags: string[]
  updatedAt: number
}

export const SAVE_KEY = 'war-and-peace-save-v1'

export const createInitialSaveState = (): SaveState => ({
  currentScene: 'farmhouse',
  flags: [],
  updatedAt: Date.now(),
})

const isSaveState = (value: unknown): value is SaveState => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.currentScene === 'string' &&
    Array.isArray(candidate.flags) &&
    candidate.flags.every((flag) => typeof flag === 'string') &&
    typeof candidate.updatedAt === 'number'
  )
}

export const loadState = (): SaveState => {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    if (!raw) {
      return createInitialSaveState()
    }

    const parsed = JSON.parse(raw) as unknown
    return isSaveState(parsed) ? parsed : createInitialSaveState()
  } catch {
    return createInitialSaveState()
  }
}

export const persistState = (state: SaveState) => {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(state))
}

export const clearSavedState = () => {
  window.localStorage.removeItem(SAVE_KEY)
}