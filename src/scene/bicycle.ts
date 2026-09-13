import {
  CatmullRomCurve3,
  Mesh,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three'
import type { Object3D } from 'three'
import { BICYCLE } from '../data/proposals.ts'
import type { Vector3Cm } from '../data/proposals.ts'
import { box, group, lines, tube } from './geometry.ts'
import type { RoomMaterials } from './geometry.ts'

export function buildBicycle(parent: Object3D, m: RoomMaterials) {
  const bicycle = group(parent, 'bicycle')
  bicycle.userData.dimensionsCm = { ...BICYCLE }
  const z = BICYCLE.wheelPlane
  const height = BICYCLE.bottom + BICYCLE.wheelRadius
  const rear: Vector3Cm = [BICYCLE.x + BICYCLE.wheelRadius, height, z]
  const front: Vector3Cm = [rear[0] + BICYCLE.wheelbase, height, z]
  for (const center of [rear, front]) {
    const wheel = group(bicycle, 'wheel')
    wheel.position.set(...center)
    for (const [radius, thickness, material] of [
      [32.25, 1.25, m.dark],
      [30.4, 0.65, m.metal],
    ] as const) {
      const ring = new Mesh(
        new TorusGeometry(radius, thickness, 10, 64),
        material,
      )
      ring.castShadow = true
      wheel.add(ring)
    }
    const spokes: Vector3Cm[] = []
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2
      spokes.push(
        [0, 0, i % 2 ? 1.6 : -1.6],
        [Math.cos(angle) * 30, Math.sin(angle) * 30, 0],
      )
    }
    lines(wheel, spokes, '#889496')
    tube(wheel, [0, 0, -3], [0, 0, 3], 2, m.metal)
  }
  const crank: Vector3Cm = [90, 44, z]
  const seat: Vector3Cm = [76, 93, z]
  const headTop: Vector3Cm = [132, 99, z]
  const headBottom: Vector3Cm = [136, 84, z]
  for (const [a, b, radius] of [
    [rear, seat, 1.15],
    [rear, crank, 1.4],
    [seat, crank, 1.85],
    [seat, headTop, 1.7],
    [crank, headBottom, 2.2],
    [headTop, headBottom, 1.8],
  ] as [Vector3Cm, Vector3Cm, number][])
    tube(bicycle, a, b, radius, m.green)
  for (const offset of [-2, 2])
    tube(
      bicycle,
      [headBottom[0], headBottom[1], z + offset],
      [front[0], front[1], z + offset],
      1.2,
      m.green,
    )
  tube(bicycle, seat, [74, 105, z], 1.2, m.metal)
  box(bicycle, 'saddle', [19, 2.8, 9], [73, 105.5, z], m.dark, 1.2)
  tube(bicycle, headTop, [138, 113.8, z], 1.5, m.metal)
  tube(bicycle, [138, 113.8, z], [149, 113.8, z], 1.3, m.dark)
  tube(bicycle, [149, 113.8, 176.2], [149, 113.8, 217.8], 1.2, m.dark)
  for (const barZ of [176.2, 217.8]) {
    const curve = new CatmullRomCurve3([
      new Vector3(149, 113.8, barZ),
      new Vector3(158, 110, barZ),
      new Vector3(160, 103, barZ),
      new Vector3(153, 98, barZ),
    ])
    const drop = new Mesh(new TubeGeometry(curve, 24, 1.2, 8, false), m.dark)
    drop.castShadow = true
    bicycle.add(drop)
  }
  const chainring = new Mesh(new TorusGeometry(7.6, 0.7, 6, 32), m.metal)
  chainring.position.set(crank[0], crank[1], z + 4)
  bicycle.add(chainring)
  tube(bicycle, [90, 50, z + 4], [rear[0], height + 3, z + 4], 0.4, m.metal)
  tube(bicycle, [90, 37, z + 4], [rear[0], height - 3, z + 4], 0.4, m.metal)
  for (const side of [-1, 1]) {
    tube(
      bicycle,
      [90, 44, z + side * 4],
      [90 + side * 11, 44 - side * 8, z + side * 4],
      0.9,
      m.metal,
    )
    box(
      bicycle,
      'pedal',
      [7, 1.8, 7],
      [90 + side * 11, 44 - side * 8, z + side * 7],
      m.dark,
      0.5,
    )
  }
  const hanger = group(parent, 'bicycle-hanger')
  for (const x of [77, 111]) {
    box(hanger, 'wall-bracket', [5, 15, 1.5], [x, 92, 219.25], m.metal, 0.4)
    tube(hanger, [x, 94, 219], [x, 94, z], 1.1, m.metal)
    tube(hanger, [x, 94, z], [x, 99, z], 1.1, m.metal)
  }
  return bicycle
}
