import type { Vector3Cm } from '../data/proposals.ts'

export const VIEW_PRESETS = {
  overview: {
    label: '整体',
    position: [530, 440, 610],
    target: [140, 125, 100],
  },
  north: { label: '北墙', position: [140, 150, 850], target: [140, 140, 0] },
  south: { label: '南墙', position: [140, 240, -650], target: [140, 130, 200] },
  top: { label: '俯视', position: [140, 950, 110.01], target: [140, 0, 110] },
} satisfies Record<
  string,
  { label: string; position: Vector3Cm; target: Vector3Cm }
>

export type ViewPreset = keyof typeof VIEW_PRESETS

/** Equal centimetres per pixel on both axes, regardless of the viewport shape. */
export function orthographicFrustum(
  widthPx: number,
  heightPx: number,
  projectedWidthCm: number,
  projectedHeightCm: number,
  padding = 1.16,
) {
  if (Math.min(widthPx, heightPx, projectedWidthCm, projectedHeightCm) <= 0) {
    throw new RangeError('Viewport and projected bounds must be positive')
  }
  const aspect = widthPx / heightPx
  const halfHeight =
    Math.max(projectedHeightCm / 2, projectedWidthCm / (2 * aspect)) * padding
  return {
    left: -halfHeight * aspect,
    right: halfHeight * aspect,
    top: halfHeight,
    bottom: -halfHeight,
  }
}

export function centimetresPerPixel(
  frustum: { top: number; bottom: number },
  heightPx: number,
  zoom = 1,
) {
  return (frustum.top - frustum.bottom) / (heightPx * zoom)
}
