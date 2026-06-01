import { describe, expect, it } from 'vitest'

import {
  canAdvanceFromStudy,
  canFinishEnding,
  evaluateFireHold,
  validateConstellationPlacement,
  validateLetterAssignments,
  validateRelicTeachings,
} from './validators'

describe('story progression gates', () => {
  it('requires all four study clues before enlistment', () => {
    expect(canAdvanceFromStudy(['study_draft', 'study_finance', 'study_letter'])).toBe(false)
    expect(canAdvanceFromStudy(['study_draft', 'study_finance', 'study_letter', 'study_chess'])).toBe(true)
  })

  it('requires all act four village interactions before ending', () => {
    expect(canFinishEnding(['villagers_heard', 'children_met'])).toBe(false)
    expect(canFinishEnding(['villagers_heard', 'children_met', 'sheep_saved'])).toBe(true)
  })
})

describe('puzzle validators', () => {
  it('validates relic teachings correctly', () => {
    expect(
      validateRelicTeachings({
        teaching1: 'bari-idol',
        teaching2: 'blood-spear',
        teaching3: 'ram-horn',
        teaching4: 'gold-breastplate',
      }),
    ).toBe(true)

    expect(
      validateRelicTeachings({
        teaching1: 'ram-horn',
        teaching2: 'blood-spear',
        teaching3: 'bari-idol',
        teaching4: 'gold-breastplate',
      }),
    ).toBe(false)
  })

  it('validates constellation directions correctly', () => {
    expect(
      validateConstellationPlacement({ north: 'lamb', east: 'serpent', south: 'eagle', west: 'lion' }),
    ).toBe(true)

    expect(
      validateConstellationPlacement({ north: 'lion', east: 'serpent', south: 'eagle', west: 'lamb' }),
    ).toBe(false)
  })

  it('judges fire holding durations', () => {
    expect(evaluateFireHold(500)).toBe('too-short')
    expect(evaluateFireHold(1400)).toBe('stable')
    expect(evaluateFireHold(2600)).toBe('too-long')
  })

  it('matches letters to casualties correctly', () => {
    expect(
      validateLetterAssignments({ soldier1: 'letter1', soldier2: 'letter2', soldier3: 'letter3' }),
    ).toBe(true)

    expect(
      validateLetterAssignments({ soldier1: 'letter3', soldier2: 'letter2', soldier3: 'letter1' }),
    ).toBe(false)
  })
})