import type { HotspotDefinition } from './narrativeData'

type HotspotNoteVertical = 'above' | 'below'
type HotspotNoteAlign = 'align-left' | 'align-center' | 'align-right'

interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

export interface HotspotNotePlacement {
  vertical: HotspotNoteVertical
  align: HotspotNoteAlign
  className: string
  bounds: Rect
}

export const hotspotNoteStageBounds: Rect = {
  left: 1,
  top: 1,
  right: 99,
  bottom: 99,
}

export const hotspotUiReservedZones = {
  hud: {
    left: 1,
    top: 1,
    right: 34,
    bottom: 19,
  },
  actions: {
    left: 77,
    top: 72,
    right: 99,
    bottom: 99,
  },
} as const

const noteGap = 2.2
const noteHeight = 5.4

const overlapArea = (a: Rect, b: Rect) => {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
  return width * height
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const estimateNoteWidth = (label: string) => {
  const charCount = [...label].length
  return clamp(5.8 + charCount * 1.4, 8.2, 15.5)
}

const preferredAlignFor = (centerX: number): HotspotNoteAlign => {
  if (centerX < 26) {
    return 'align-left'
  }

  if (centerX > 74) {
    return 'align-right'
  }

  return 'align-center'
}

const buildBounds = (
  hotspot: HotspotDefinition,
  vertical: HotspotNoteVertical,
  align: HotspotNoteAlign,
): Rect => {
  const noteWidth = estimateNoteWidth(hotspot.label)
  const rawLeft =
    align === 'align-left'
      ? hotspot.x
      : align === 'align-right'
        ? hotspot.x + hotspot.w - noteWidth
        : hotspot.x + hotspot.w / 2 - noteWidth / 2

  const left = clamp(rawLeft, hotspotNoteStageBounds.left, hotspotNoteStageBounds.right - noteWidth)
  const top = vertical === 'below' ? hotspot.y + hotspot.h + noteGap : hotspot.y - noteGap - noteHeight

  return {
    left,
    top,
    right: left + noteWidth,
    bottom: top + noteHeight,
  }
}

const scoreBounds = (bounds: Rect, vertical: HotspotNoteVertical, preferredAlign: HotspotNoteAlign, align: HotspotNoteAlign) => {
  const overflowPenalty =
    Math.max(0, hotspotNoteStageBounds.top - bounds.top) * 1000 +
    Math.max(0, bounds.bottom - hotspotNoteStageBounds.bottom) * 1000

  const hudPenalty = overlapArea(bounds, hotspotUiReservedZones.hud) * 100
  const actionPenalty = overlapArea(bounds, hotspotUiReservedZones.actions) * 100
  const verticalPenalty = vertical === 'below' ? 0 : 1
  const alignPenalty = align === preferredAlign ? 0 : 0.2

  return overflowPenalty + hudPenalty + actionPenalty + verticalPenalty + alignPenalty
}

export function computeHotspotNotePlacement(hotspot: HotspotDefinition): HotspotNotePlacement {
  const centerX = hotspot.x + hotspot.w / 2
  const preferredAlign = preferredAlignFor(centerX)
  const alignCandidates: HotspotNoteAlign[] = [preferredAlign, 'align-center', 'align-left', 'align-right'].filter(
    (value, index, list): value is HotspotNoteAlign => list.indexOf(value) === index,
  )

  let bestPlacement: HotspotNotePlacement | undefined
  let bestScore = Number.POSITIVE_INFINITY

  ;(['below', 'above'] as const).forEach((vertical) => {
    alignCandidates.forEach((align) => {
      const bounds = buildBounds(hotspot, vertical, align)
      const score = scoreBounds(bounds, vertical, preferredAlign, align)

      if (score < bestScore) {
        bestScore = score
        bestPlacement = {
          vertical,
          align,
          className: `${vertical} ${align}`,
          bounds,
        }
      }
    })
  })

  return bestPlacement!
}