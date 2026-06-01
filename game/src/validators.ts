const asSet = (flags: Iterable<string>) => new Set(flags)

export const studyRequiredFlags = ['study_draft', 'study_finance', 'study_letter', 'study_chess']

export const relicTeachingSolution = {
  teaching1: 'bari-idol',
  teaching2: 'blood-spear',
  teaching3: 'ram-horn',
  teaching4: 'gold-breastplate',
} as const

export const constellationSolution = {
  north: 'lamb',
  east: 'serpent',
  south: 'eagle',
  west: 'lion',
} as const

export const letterAssignmentSolution = {
  soldier1: 'letter1',
  soldier2: 'letter2',
  soldier3: 'letter3',
} as const

export const canAdvanceFromStudy = (flags: Iterable<string>) => {
  const flagSet = asSet(flags)
  return studyRequiredFlags.every((flag) => flagSet.has(flag))
}

export const validateRelicTeachings = (selection: Record<string, string>) =>
  Object.entries(relicTeachingSolution).every(([slot, answer]) => selection[slot] === answer)

export const validateConstellationPlacement = (selection: Record<string, string>) =>
  Object.entries(constellationSolution).every(([slot, answer]) => selection[slot] === answer)

export const evaluateFireHold = (durationMs: number) => {
  if (durationMs < 900) {
    return 'too-short'
  }

  if (durationMs > 2100) {
    return 'too-long'
  }

  return 'stable'
}

export const validateLetterAssignments = (selection: Record<string, string>) =>
  Object.entries(letterAssignmentSolution).every(([slot, answer]) => selection[slot] === answer)

export const canFinishEnding = (flags: Iterable<string>) => {
  const flagSet = asSet(flags)
  return ['villagers_heard', 'sheep_saved', 'children_met'].every((flag) => flagSet.has(flag))
}