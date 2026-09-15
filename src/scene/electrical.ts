import { CircleGeometry, Mesh, MeshStandardMaterial } from 'three'
import type { Group } from 'three'
import { COMPUTERS, ELECTRICAL_POINTS } from '../data/proposals.ts'
import type { Vector3Cm } from '../data/proposals.ts'
import { ELECTRICAL_ANNOTATIONS } from './annotations.ts'
import { box, group, lines } from './geometry.ts'
import type { RoomMaterials } from './geometry.ts'

export function buildElectrical(parent: Group, m: RoomMaterials) {
  const electrical = group(parent, 'electrical')
  const socketColor = new MeshStandardMaterial({
    color: '#ce9847',
    roughness: 0.7,
  })
  const networkColor = new MeshStandardMaterial({
    color: '#087c91',
    roughness: 0.6,
  })
  for (const point of ELECTRICAL_POINTS) {
    const marker = group(electrical, `point-${point.id}`)
    marker.position.set(...point.position)
    marker.userData.point = point
    if (point.wall === 'east') marker.rotation.y = -Math.PI / 2
    if (point.wall === 'west') marker.rotation.y = Math.PI / 2
    if (point.wall === 'ceiling') marker.rotation.x = Math.PI / 2
    const color = point.kind === 'network' ? networkColor : socketColor
    if (point.wall === 'ceiling') {
      const lamp = new Mesh(new CircleGeometry(12, 40), m.light)
      lamp.position.z = 0.2
      marker.add(lamp)
    } else {
      box(marker, 'panel-outline', [8.6, 8.6, 0.7], [0, 0, 0.35], color, 0.3)
      box(marker, 'panel-face', [7.8, 7.8, 0.55], [0, 0, 0.97], m.trim, 0.25)
      if (point.kind === 'socket') {
        for (const [x, y, angle] of [
          [-1.4, 1.9, 0],
          [1.4, 1.9, 0],
          [0, -0.5, 0],
          [-1.8, -2, -0.4],
          [1.8, -2, 0.4],
        ]) {
          const hole = box(
            marker,
            'socket-hole',
            [0.6, 1.6, 0.08],
            [x, y, 1.28],
            m.dark,
          )
          hole.rotation.z = angle
        }
      } else if (point.kind === 'network') {
        box(marker, 'W1-port', [3.4, 2.8, 0.2], [0, 0, 1.3], networkColor)
        box(
          marker,
          'network-port-opening',
          [2.5, 1.8, 0.1],
          [0, 0.1, 1.45],
          m.dark,
        )
      } else if (point.kind === 'switch') {
        for (const x of [-1.8, 1.8])
          box(marker, 'switch-key', [3, 6, 0.5], [x, 0, 1.3], m.paper, 0.25)
      } else {
        box(
          marker,
          'lamp-terminal',
          [2.6, 2.6, 0.2],
          [0, 0, 1.3],
          socketColor,
          0.3,
        )
      }
    }
  }
  const path = (points: Vector3Cm[], color: string) => {
    const segments = points.flatMap((point, index) =>
      index < points.length - 1 ? [point, points[index + 1]] : [],
    )
    return lines(electrical, segments, color, 0.85)
  }
  path(
    [
      [170, 55, 2],
      [170, 52, 10],
      [200, 52, 10],
      [200, 61, 34],
    ],
    '#087c91',
  )
  path(
    [
      [246, 55, 2],
      [246, 48, 14],
      [208, 48, 14],
      [208, 60, 26],
    ],
    '#ad792d',
  )
  for (const pc of COMPUTERS) {
    const x = pc.x + pc.width / 2
    path(
      [
        [200, 61, 34],
        [200, 52, 40],
        [x, 52, 40],
        [x, 25, 20],
      ],
      '#087c91',
    )
    box(
      electrical,
      `network-${pc.id}`,
      [3, 3, 3],
      [x, 25, 20],
      networkColor,
      0.5,
    )
  }
  for (const annotation of ELECTRICAL_ANNOTATIONS) {
    path(
      [annotation.leaderFrom, annotation.position],
      annotation.kind === 'network' ? '#087c91' : '#ad792d',
    )
  }
  electrical.visible = false
  return electrical
}
