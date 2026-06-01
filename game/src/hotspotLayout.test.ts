import { describe, expect, it } from 'vitest'

import { sceneDefinitions } from './narrativeData'
import { computeHotspotNotePlacement, hotspotNoteStageBounds, hotspotUiReservedZones } from './hotspotLayout'

const intersects = (
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number },
) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

describe('hotspot note layout', () => {
  it('keeps all hotspot labels inside the stage bounds', () => {
    Object.values(sceneDefinitions).forEach((scene) => {
      scene.hotspots.forEach((hotspot) => {
        const { bounds } = computeHotspotNotePlacement(hotspot)

        expect(bounds.left).toBeGreaterThanOrEqual(hotspotNoteStageBounds.left)
        expect(bounds.right).toBeLessThanOrEqual(hotspotNoteStageBounds.right)
        expect(bounds.top).toBeGreaterThanOrEqual(hotspotNoteStageBounds.top)
        expect(bounds.bottom).toBeLessThanOrEqual(hotspotNoteStageBounds.bottom)
      })
    })
  })

  it('keeps all hotspot labels clear of the HUD and action dock', () => {
    Object.values(sceneDefinitions).forEach((scene) => {
      scene.hotspots.forEach((hotspot) => {
        const { bounds } = computeHotspotNotePlacement(hotspot)

        expect(intersects(bounds, hotspotUiReservedZones.hud)).toBe(false)
        expect(intersects(bounds, hotspotUiReservedZones.actions)).toBe(false)
      })
    })
  })
})