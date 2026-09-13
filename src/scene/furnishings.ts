import {
  CircleGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  TorusGeometry,
} from 'three'
import type { Group, Object3D } from 'three'
import {
  CHAIRS,
  COMPUTERS,
  DESK,
  DESK_TOP,
  MONITORS,
  NETWORK_TRAY,
  SCREEN,
} from '../data/proposals.ts'
import type {
  BoxCm,
  CabinetSpec,
  Proposal,
  Vector3Cm,
} from '../data/proposals.ts'
import {
  box,
  ellipsoid,
  fromSpec,
  group,
  instanceBoxes,
  lines,
  outline,
  tube,
} from './geometry.ts'
import type { RoomMaterials } from './geometry.ts'

function figure(
  parent: Object3D,
  x: number,
  bottom: number,
  south: number,
  height: number,
  material: RoomMaterials['blue'],
  m: RoomMaterials,
) {
  const toy = group(parent, 'collectible')
  toy.position.set(x, bottom, south)
  const u = height / 10
  const sphere = (position: Vector3Cm, radii: Vector3Cm, finish = material) =>
    ellipsoid(
      toy,
      position.map((v) => v * u) as Vector3Cm,
      radii.map((v) => v * u) as Vector3Cm,
      finish,
    )
  sphere([0, 4.5, 0], [1.65, 2.3, 1.25])
  sphere([0, 7.6, 0], [2.05, 1.8, 1.5])
  sphere([-1.45, 9.15, 0], [0.85, 0.85, 0.7])
  sphere([1.45, 9.15, 0], [0.85, 0.85, 0.7])
  sphere([-2.05, 4.5, 0], [0.7, 1.75, 0.7])
  sphere([2.05, 4.5, 0], [0.7, 1.75, 0.7])
  sphere([-0.9, 1.6, 0.25], [0.75, 1.6, 0.95])
  sphere([0.9, 1.6, 0.25], [0.75, 1.6, 0.95])
  sphere([-0.7, 7.9, 1.4], [0.16, 0.22, 0.1], m.dark)
  sphere([0.7, 7.9, 1.4], [0.16, 0.22, 0.1], m.dark)
  sphere([0, 7.15, 1.4], [0.7, 0.45, 0.28], m.cream)
  return toy
}

function books(
  parent: Object3D,
  x: number,
  bottom: number,
  south: number,
  count: number,
  m: RoomMaterials,
  height = 28,
) {
  const palette = [m.green, m.cream, m.blue, m.paper, m.terracotta]
  for (let index = 0; index < count; index++) {
    const h = height - (index % 3) * 2.4
    const book = box(
      parent,
      'book',
      [3.7, h, 17],
      [x + index * 4.4, bottom + h / 2, south],
      palette[index % palette.length],
      0.25,
    )
    box(book, 'book-spine', [2.1, 0.45, 0.12], [0, h * 0.25, 8.55], m.paper)
  }
}

export function headphones(
  parent: Object3D,
  position: Vector3Cm,
  m: RoomMaterials,
) {
  const object = group(parent, 'headphones')
  object.position.set(...position)
  const band = new Mesh(new TorusGeometry(6.8, 0.9, 8, 24, Math.PI), m.metal)
  band.castShadow = true
  object.add(band)
  box(object, 'ear-left', [3, 7, 3.5], [-6.8, -2, 0], m.dark, 1)
  box(object, 'ear-right', [3, 7, 3.5], [6.8, -2, 0], m.dark, 1)
  return object
}

function pegboard(parent: Object3D, spec: BoxCm, m: RoomMaterials) {
  const board = group(parent, spec.id)
  fromSpec(board, { ...spec, id: `${spec.id}-panel` }, m.pegboard, 0.6)
  const positions: Vector3Cm[] = []
  for (let x = 3; x < spec.width - 2; x += 5) {
    for (let height = 3; height < spec.height - 2; height += 5) {
      positions.push([spec.x + x, spec.bottom + height, spec.depth + 0.015])
    }
  }
  const holes = new InstancedMesh(
    new CircleGeometry(0.24, 8),
    m.holes,
    positions.length,
  )
  const matrix = new Matrix4()
  positions.forEach((position, index) =>
    holes.setMatrixAt(index, matrix.makeTranslation(...position)),
  )
  holes.instanceMatrix.needsUpdate = true
  board.add(holes)
  return board
}

function cabinet(parent: Object3D, spec: CabinetSpec, m: RoomMaterials) {
  const object = group(parent, spec.id)
  object.userData.dimensionsCm = { ...spec }
  object.position.set(spec.x, spec.bottom, spec.south)
  const { width: w, height: h, depth: d } = spec
  const t = 1.8
  const parts: [Vector3Cm, Vector3Cm, RoomMaterials['oak']][] = [
    [[w, h, 1.2], [w / 2, h / 2, 0.6], m.cabinetBack],
    [[t, h, d], [t / 2, h / 2, d / 2], m.cabinet],
    [[t, h, d], [w - t / 2, h / 2, d / 2], m.cabinet],
    [[w - t * 2, t, d], [w / 2, h - t / 2, d / 2], m.cabinet],
    [[w - t * 2, t, d], [w / 2, t / 2, d / 2], m.oak],
  ]
  for (const [size, position, material] of parts)
    outline(box(object, 'cabinet-shell', size, position, material))
  for (const level of spec.shelfHeights) {
    box(
      object,
      'cabinet-shelf',
      [w - t * 2, t, d - 1.2],
      [w / 2, level + t / 2, d / 2],
      m.oak,
    )
  }
  box(
    object,
    'cabinet-light',
    [w - 8, 0.5, 1],
    [w / 2, h - 2.2, d - 4],
    m.light,
  ).castShadow = false
  const glass = box(
    object,
    'cabinet-glass',
    [w - t * 2, h - t * 2, 0.35],
    [w / 2, h / 2, d - 0.175],
    m.glass,
  )
  glass.castShadow = false
  box(
    object,
    'cabinet-handle',
    [0.6, 8, 0.7],
    [w - 4, h * 0.45, d - 0.35],
    m.gold,
    0.2,
  )
  if (spec.contents === 'large-figure') {
    figure(
      object,
      w / 2,
      t,
      d / 2 + 1,
      spec.shelfHeights.length ? 45 : 48,
      m.cream,
      m,
    )
  } else if (spec.contents === 'figures') {
    figure(object, w * 0.29, t, d / 2, 26, m.blue, m)
    figure(object, w * 0.7, t, d / 2, 24, m.terracotta, m)
  } else {
    books(object, 6, t, d / 2, Math.floor((w * 0.55) / 4.4), m, 30)
    if (!spec.shelfHeights.length)
      figure(object, w * 0.8, t, d / 2, 27, m.blue, m)
  }
  if (spec.shelfHeights.length) {
    const level = spec.shelfHeights[0] + t
    figure(object, w * 0.27, level, d / 2, 24, m.blue, m)
    figure(object, w * 0.7, level, d / 2, 22, m.terracotta, m)
  }
  return object
}

export function artwork(
  parent: Object3D,
  spec: BoxCm,
  m: RoomMaterials,
  facingSouth = true,
) {
  const object = group(parent, spec.id)
  object.userData.dimensionsCm = { ...spec }
  object.position.set(spec.x, spec.bottom, spec.south)
  box(
    object,
    'picture-frame',
    [spec.width, spec.height, spec.depth],
    [spec.width / 2, spec.height / 2, spec.depth / 2],
    m.oak,
    0.3,
  )
  const front = facingSouth ? spec.depth + 0.02 : -0.02
  box(
    object,
    'picture-paper',
    [spec.width - 2.6, spec.height - 2.6, 0.08],
    [spec.width / 2, spec.height / 2, front],
    m.paper,
  )
  const art = box(
    object,
    'picture-landscape',
    [spec.width - 9, spec.height - 9, 0.1],
    [spec.width / 2, spec.height / 2, front + (facingSouth ? 0.08 : -0.08)],
    m.green,
  )
  art.userData.artTexture = true
  return object
}

export function buildNorthFurniture(
  parent: Object3D,
  proposal: Proposal,
  m: RoomMaterials,
) {
  const object = group(parent, 'north-furniture')
  proposal.pegboards.forEach((spec) => pegboard(object, spec, m))
  proposal.cabinets.forEach((spec) => cabinet(object, spec, m))
  proposal.shelves.forEach((spec) => {
    outline(fromSpec(object, spec, m.oak, 0.5))
    const bottom = spec.bottom + spec.height
    if (spec.id === 'shelf-center') {
      figure(object, 111, bottom, 7, 24, m.blue, m)
      figure(object, 151, bottom, 7, 20, m.terracotta, m)
    } else {
      books(object, 192, bottom, 11, 5, m, 25)
      figure(object, 239, bottom, 11, 22, m.cream, m)
    }
  })
  if (proposal.artwork) artwork(object, proposal.artwork, m)
  if (proposal.id === 'twin') {
    headphones(object, [113, 213, 5], m)
    box(object, 'pegboard-tray', [37, 3, 9], [153, 189, 5.5], m.cabinet, 0.5)
    box(object, 'pegboard-camera', [16, 9, 5], [147, 200, 5], m.metal, 1.5)
    ellipsoid(object, [147, 200, 8], [3, 3, 1.2], m.dark)
  }
  for (const x of [43, 239])
    box(object, 'accessory-ledge', [28, 2, 8], [x, 154, 6], m.cabinet, 0.5)
  return object
}

function chair(
  parent: Object3D,
  x: number,
  south: number,
  name: string,
  m: RoomMaterials,
) {
  const object = group(parent, name)
  object.position.set(x, 0, south)
  box(object, 'seat', [48, 5, 45], [0, 46, 0], m.chair, 2.4)
  box(object, 'back-frame', [46, 44, 4.5], [0, 80, 23], m.metal, 2)
  box(object, 'back-mesh', [42, 39, 1.2], [0, 80, 25.4], m.chair, 0.55)
  const stripes: Vector3Cm[] = []
  for (let i = -19; i <= 19; i += 2)
    stripes.push([i, 62, 26.05], [i, 98, 26.05])
  lines(object, stripes, '#b5c2b7', 0.48)
  for (const sign of [-1, 1]) {
    tube(object, [sign * 21, 46, 9], [sign * 25, 64, 9], 1.6, m.metal)
    box(object, 'armrest', [5, 3, 28], [sign * 25, 63, 5], m.metal, 1.2)
  }
  tube(object, [0, 10, 0], [0, 44, 0], 2.4, m.metal)
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5
    const end: Vector3Cm = [Math.cos(angle) * 26, 6, Math.sin(angle) * 26]
    tube(object, [0, 12, 0], end, 1.6, m.metal)
    box(object, 'caster', [5, 5, 4], [end[0], 3, end[2]], m.dark, 1.5)
  }
  return object
}

export function buildOffice(parent: Object3D, m: RoomMaterials) {
  const office = group(parent, 'office')
  const desk = group(office, DESK.id)
  desk.userData.dimensionsCm = { ...DESK }
  outline(fromSpec(desk, DESK_TOP, m.oak, 0.8))
  for (const x of [26, 254]) {
    for (const z of [7, 73])
      box(desk, 'desk-leg', [4, 71, 4], [x, 35.5, z], m.trim, 0.5)
  }
  box(desk, 'desk-crossbar', [224, 5, 4], [140, 66, 9], m.trim)
  box(desk, 'desk-apron', [224, 4, 3], [140, 68, 74], m.trim)

  const equipment = group(office, 'equipment')
  for (const spec of MONITORS) {
    const object = group(equipment, spec.id)
    object.userData.dimensionsCm = { ...spec }
    outline(
      fromSpec(object, { ...spec, id: `${spec.id}-body` }, m.dark, 0.55),
      '#566970',
      0.45,
    )
    const monitorScreen = box(
      object,
      `${spec.id}-screen`,
      [spec.width - SCREEN.bezel * 2, spec.height - SCREEN.bezel * 2, 0.1],
      [
        spec.x + spec.width / 2,
        spec.bottom + spec.height / 2,
        spec.south + spec.depth + 0.06,
      ],
      m.screen,
    )
    monitorScreen.castShadow = false
    const x = spec.x + spec.width / 2
    box(equipment, 'monitor-clamp', [6, 2, 7], [x, 75, 6], m.dark, 0.5)
    tube(equipment, [x, 76, 7], [x, 110, 7], 1.25, m.metal)
    tube(
      equipment,
      [x, 109, 7],
      [x, spec.bottom + spec.height / 2, 17],
      1.2,
      m.metal,
    )
  }
  for (const x of [72, 195]) {
    box(equipment, 'desk-mat', [65, 0.35, 28], [x, 75.2, 55], m.chairMesh, 1)
    box(equipment, 'keyboard', [35, 1.1, 12], [x - 6, 76, 54], m.trim, 0.5)
    const keys: Vector3Cm[] = []
    for (let col = 0; col < 15; col++)
      for (let row = 0; row < 5; row++)
        keys.push([x - 21 + col * 2.1, 76.7, 50 + row * 2])
    instanceBoxes(
      equipment,
      'keyboard-keys',
      [1.7, 0.3, 1.5],
      keys,
      m.cabinetBack,
    )
    ellipsoid(equipment, [x + 20, 76.2, 55], [3, 1.4, 4.5], m.trim)
  }
  for (const spec of COMPUTERS) {
    const object = group(equipment, spec.id)
    fromSpec(object, { ...spec, id: `${spec.id}-body` }, m.dark, 0.6)
    box(
      object,
      'pc-top',
      [spec.width - 1, 0.5, spec.depth - 1],
      [
        spec.x + spec.width / 2,
        spec.height - 0.25,
        spec.south + spec.depth / 2,
      ],
      m.metal,
    )
    for (const y of [12, 30]) {
      const fan = new Mesh(new TorusGeometry(5.7, 0.45, 6, 24), m.metal)
      fan.position.set(
        spec.x + spec.width / 2,
        y,
        spec.south + spec.depth + 0.05,
      )
      object.add(fan)
    }
    box(
      object,
      'pc-led',
      [0.7, 0.7, 0.12],
      [spec.x + spec.width - 3, 42, spec.south + spec.depth + 0.06],
      m.light,
    )
  }
  const seating = group(office, 'seating')
  for (const spec of CHAIRS) chair(seating, spec.x, spec.south, spec.id, m)
  headphones(equipment, [114, 62, 76], m)
  const network = buildNetworkTray(office, m)
  return { office, desk, equipment, seating, network }
}

export function buildNetworkTray(parent: Group, m: RoomMaterials) {
  const network = group(parent, 'network')
  fromSpec(network, NETWORK_TRAY, m.metal)
  box(network, 'network-switch', [23, 3, 12], [200, 61.5, 28], m.dark, 0.4)
  const ports: Vector3Cm[] = Array.from({ length: 5 }, (_, i) => [
    191 + i * 4.3,
    61.6,
    34.05,
  ])
  instanceBoxes(network, 'network-ports', [2.8, 1.4, 0.2], ports, m.gold)
  return network
}

export function buildSouthBooks(
  parent: Object3D,
  spec: BoxCm,
  m: RoomMaterials,
) {
  const object = group(parent, 'south-books')
  fromSpec(object, spec, m.oak, 0.4)
  box(
    object,
    'book-ledge-lip',
    [spec.width, 4, 1.6],
    [spec.x + spec.width / 2, spec.bottom + 3.6, spec.south + 0.8],
    m.oak,
  )
  books(
    object,
    spec.x + 8,
    spec.bottom + spec.height,
    spec.south + 8.5,
    9,
    m,
    28,
  )
  return object
}
