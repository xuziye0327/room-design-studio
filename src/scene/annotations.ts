import { Vector3 } from 'three'
import type { Group, OrthographicCamera } from 'three'
import { DESK, ROOM } from '../data/proposals.ts'
import type { Vector3Cm } from '../data/proposals.ts'
import { group, lines } from './geometry.ts'

export interface SceneAnnotation {
  id: string
  title: string
  detail?: string
  position: Vector3Cm
  kind: 'dimension' | 'power' | 'network'
  from?: Vector3Cm
  to?: Vector3Cm
  leaderFrom?: Vector3Cm
}

export const DIMENSION_ANNOTATIONS: SceneAnnotation[] = [
  {
    id: 'room-width',
    title: `宽 ${ROOM.width} cm`,
    position: [ROOM.width / 2, 0, ROOM.depth + 34],
    kind: 'dimension',
    from: [0, 0, ROOM.depth + 23],
    to: [ROOM.width, 0, ROOM.depth + 23],
  },
  {
    id: 'room-depth',
    title: `深 ${ROOM.depth} cm`,
    position: [ROOM.width + 35, 0, ROOM.depth / 2],
    kind: 'dimension',
    from: [ROOM.width + 23, 0, 0],
    to: [ROOM.width + 23, 0, ROOM.depth],
  },
  {
    id: 'room-height',
    title: `高 ${ROOM.height} cm`,
    position: [ROOM.width + 35, ROOM.height / 2, -4],
    kind: 'dimension',
    from: [ROOM.width + 23, 0, -4],
    to: [ROOM.width + 23, ROOM.height, -4],
  },
  {
    id: 'desk-size',
    title: `桌面 ${DESK.width} × ${DESK.depth} cm`,
    detail: `完成面高 ${DESK.height} cm`,
    position: [DESK.x + DESK.width / 2, DESK.height + 12, DESK.depth + 12],
    kind: 'dimension',
    from: [DESK.x, DESK.height, DESK.depth + 6],
    to: [DESK.x + DESK.width, DESK.height, DESK.depth + 6],
  },
]

export const ELECTRICAL_ANNOTATIONS: SceneAnnotation[] = [
  {
    id: 'U',
    title: 'U1–U3',
    detail: '桌上 · H90 cm',
    position: [5, 118, 10],
    leaderFrom: [60, 90, 1],
    kind: 'power',
  },
  {
    id: 'V',
    title: 'V1–V3',
    detail: '桌上 · H90 cm',
    position: [276, 118, 10],
    leaderFrom: [225, 90, 1],
    kind: 'power',
  },
  {
    id: 'A',
    title: 'A1–A4',
    detail: '桌下 · H55 cm',
    position: [88, 30, 12],
    leaderFrom: [105, 55, 1],
    kind: 'power',
  },
  {
    id: 'B',
    title: 'B1–B4',
    detail: '桌下 · H55 cm',
    position: [244, 30, 12],
    leaderFrom: [228, 55, 1],
    kind: 'power',
  },
  {
    id: 'W1',
    title: 'W1',
    detail: '右侧单口网络',
    position: [145, 70, 4],
    leaderFrom: [170, 55, 1],
    kind: 'network',
  },
  {
    id: 'SW1',
    title: 'SW1',
    detail: '桌下交换机',
    position: [197, 99, 30],
    leaderFrom: [200, 61, 28],
    kind: 'network',
  },
  {
    id: 'L1',
    title: 'L1',
    detail: '柜灯 · H220 cm',
    position: [50, 238, 4],
    leaderFrom: [50, 220, 1],
    kind: 'power',
  },
  {
    id: 'C1',
    title: 'C1',
    detail: '主灯 · H280 cm',
    position: [140, 298, 110],
    leaderFrom: [140, 280, 110],
    kind: 'power',
  },
  {
    id: 'K1',
    title: 'K1',
    detail: '双键开关 · H120 cm',
    position: [270, 166, 120],
    leaderFrom: [280, 120, 120],
    kind: 'power',
  },
  {
    id: 'S1',
    title: 'S1',
    detail: '通用五孔 · H30 cm',
    position: [9, 55, 195],
    leaderFrom: [0, 30, 195],
    kind: 'power',
  },
  {
    id: 'PC1',
    title: '左主机',
    detail: '网络分线',
    position: [131, -18, 22],
    leaderFrom: [131, 25, 20],
    kind: 'network',
  },
  {
    id: 'PC2',
    title: '右主机',
    detail: '网络分线',
    position: [221, -18, 22],
    leaderFrom: [246, 25, 20],
    kind: 'network',
  },
]

export const SCENE_ANNOTATIONS = [
  ...DIMENSION_ANNOTATIONS,
  ...ELECTRICAL_ANNOTATIONS,
]

export function buildDimensionLines(parent: Group) {
  const dimensions = group(parent, 'dimensions')
  for (const annotation of DIMENSION_ANNOTATIONS) {
    const item = group(dimensions, `dimension-${annotation.id}`)
    const a = annotation.from!
    const b = annotation.to!
    const points: Vector3Cm[] = [a, b]
    for (const p of [a, b]) {
      if (annotation.id === 'room-height')
        points.push([p[0] - 3, p[1] - 3, p[2]], [p[0] + 3, p[1] + 3, p[2]])
      else points.push([p[0] - 3, p[1], p[2] - 3], [p[0] + 3, p[1], p[2] + 3])
    }
    if (annotation.id === 'room-width')
      points.push([0, 0, ROOM.depth], a, [ROOM.width, 0, ROOM.depth], b)
    if (annotation.id === 'room-depth')
      points.push([ROOM.width, 0, 0], a, [ROOM.width, 0, ROOM.depth], b)
    if (annotation.id === 'room-height')
      points.push([ROOM.width, 0, -4], a, [ROOM.width, ROOM.height, -4], b)
    lines(item, points, '#2859d6', 0.7)
  }
  dimensions.visible = false
  return dimensions
}

/** HTML labels use the same camera projection as the geometry, at a readable CSS font size. */
export function projectAnnotations(
  elements: Map<string, HTMLElement>,
  camera: OrthographicCamera,
  viewport: { width: number; height: number },
  dimensions: Group,
  showDimensions: boolean,
  electrical: boolean,
  officeVisible: boolean,
) {
  const point = new Vector3()
  const start = new Vector3()
  const end = new Vector3()
  for (const annotation of SCENE_ANNOTATIONS) {
    const element = elements.get(annotation.id)
    if (!element) continue
    let visible = annotation.kind === 'dimension' ? showDimensions : electrical
    if (annotation.id === 'desk-size' && !officeVisible) visible = false
    if (annotation.from && annotation.to) {
      start.set(...annotation.from).project(camera)
      end.set(...annotation.to).project(camera)
      const length = Math.hypot(
        ((start.x - end.x) * viewport.width) / 2,
        ((start.y - end.y) * viewport.height) / 2,
      )
      visible = visible && length > 28
      dimensions.getObjectByName(`dimension-${annotation.id}`)!.visible =
        visible
    }
    point.set(...annotation.position).project(camera)
    visible =
      visible &&
      Math.abs(point.x) < 1 &&
      Math.abs(point.y) < 1 &&
      Math.abs(point.z) < 1
    element.style.display = visible ? 'block' : 'none'
    if (visible) {
      element.style.transform = `translate(${((point.x + 1) * viewport.width) / 2}px, ${((1 - point.y) * viewport.height) / 2}px) translate(-50%, -50%)`
    }
  }
}
