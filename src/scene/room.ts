import { Group } from 'three'
import type { Vector3 } from 'three'
import { ROOM, SOUTH_ART, SOUTH_BOOKS } from '../data/proposals.ts'
import type { Proposal, Vector3Cm } from '../data/proposals.ts'
import { buildBicycle } from './bicycle.ts'
import {
  artwork,
  buildNorthFurniture,
  buildOffice,
  buildSouthBooks,
} from './furnishings.ts'
import { box, createMaterials, group, lines, outline } from './geometry.ts'
import type { RoomMaterials } from './geometry.ts'

function buildArchitecture(root: Group, m: RoomMaterials) {
  const t = ROOM.wallThickness
  const { width: w, depth: d, height: h } = ROOM
  const floor = group(root, 'floor')
  outline(
    box(
      floor,
      'foundation',
      [w + 2 * t, ROOM.floorThickness, d + 2 * t],
      [w / 2, -ROOM.floorThickness / 2, d / 2],
      m.cabinetBack,
    ),
  )
  box(floor, 'room-floor', [w, 0.2, d], [w / 2, -0.1, d / 2], m.floor)
  const plankLines: Vector3Cm[] = []
  for (let x = 0; x <= w; x += 20) {
    plankLines.push([x, 0.02, 0], [x, 0.02, d])
    for (let z = x % 40 ? 55 : 110; z < d; z += 110) {
      if (x < w) plankLines.push([x, 0.02, z], [x + 20, 0.02, z])
    }
  }
  lines(floor, plankLines, '#c5bfb2', 0.34)

  const north = group(root, 'wall-north')
  outline(
    box(north, 'north-wall', [w + t * 2, h, t], [w / 2, h / 2, -t / 2], m.wall),
  )
  box(north, 'north-skirting', [w, 7, 1.2], [w / 2, 3.5, 0.6], m.trim)

  const south = group(root, 'wall-south')
  outline(
    box(
      south,
      'south-wall',
      [w + t * 2, h, t],
      [w / 2, h / 2, d + t / 2],
      m.wall,
    ),
  )
  box(south, 'south-skirting', [w, 7, 1.2], [w / 2, 3.5, d - 0.6], m.trim)

  const west = group(root, 'wall-west')
  const window = ROOM.window
  const windowEnd = window.fromNorth + window.width
  box(
    west,
    'west-north-pier',
    [t, h, window.fromNorth],
    [-t / 2, h / 2, window.fromNorth / 2],
    m.sideWall,
  )
  box(
    west,
    'west-south-pier',
    [t, h, d - windowEnd],
    [-t / 2, h / 2, (windowEnd + d) / 2],
    m.sideWall,
  )
  box(
    west,
    'window-spandrel',
    [t, window.sill, window.width],
    [-t / 2, window.sill / 2, window.fromNorth + window.width / 2],
    m.sideWall,
  )
  const lintel = h - window.sill - window.height
  box(
    west,
    'window-lintel',
    [t, lintel, window.width],
    [-t / 2, h - lintel / 2, window.fromNorth + window.width / 2],
    m.sideWall,
  )
  const glazing = box(
    west,
    'window-glass',
    [0.6, window.height - 4, window.width - 4],
    [
      -t / 2,
      window.sill + window.height / 2,
      window.fromNorth + window.width / 2,
    ],
    m.window,
  )
  glazing.castShadow = false
  for (const z of [
    window.fromNorth + 1,
    window.fromNorth + window.width / 2,
    windowEnd - 1,
  ]) {
    box(
      west,
      'window-mullion',
      [3, window.height, 2],
      [0, window.sill + window.height / 2, z],
      m.trim,
    )
  }
  for (const y of [
    window.sill + 1,
    window.sill + window.height / 2,
    window.sill + window.height - 1,
  ]) {
    box(
      west,
      'window-rail',
      [3, 2, window.width],
      [0, y, window.fromNorth + window.width / 2],
      m.trim,
    )
  }
  box(
    west,
    'window-sill',
    [9, 2.5, window.width + 5],
    [0.5, window.sill - 1.25, window.fromNorth + window.width / 2],
    m.trim,
    0.5,
  )
  box(west, 'west-skirting', [1.2, 7, d], [0.6, 3.5, d / 2], m.trim)

  const east = group(root, 'wall-east')
  const door = ROOM.door
  box(
    east,
    'east-north-pier',
    [t, h, door.fromNorth],
    [w + t / 2, h / 2, door.fromNorth / 2],
    m.sideWall,
  )
  box(
    east,
    'east-south-pier',
    [t, h, door.southReturn],
    [w + t / 2, h / 2, d - door.southReturn / 2],
    m.sideWall,
  )
  box(
    east,
    'door-lintel',
    [t, h - door.height, door.width],
    [w + t / 2, (h + door.height) / 2, door.fromNorth + door.width / 2],
    m.sideWall,
  )
  for (const z of [door.fromNorth, door.fromNorth + door.width]) {
    box(
      east,
      'door-jamb',
      [t + 2, door.height, 1.8],
      [w + t / 2, door.height / 2, z],
      m.trim,
    )
  }
  const doorLeaf = box(
    east,
    'door-leaf',
    [door.width, door.height, 3.2],
    [w - door.width / 2, door.height / 2, door.fromNorth + door.width],
    m.oak,
    0.5,
  )
  outline(doorLeaf)
  box(
    east,
    'door-handle',
    [8, 1.4, 2],
    [w - door.width + 10, 100, door.fromNorth + door.width - 2.5],
    m.gold,
    0.5,
  )
  box(
    east,
    'east-skirting',
    [1.2, 7, door.fromNorth],
    [w - 0.6, 3.5, door.fromNorth / 2],
    m.trim,
  )

  const arc: Vector3Cm[] = []
  for (let i = 0; i < 40; i += 2) {
    for (const step of [i, i + 1]) {
      const angle = ((step / 40) * Math.PI) / 2
      arc.push([
        w - Math.sin(angle) * door.width,
        0.08,
        door.fromNorth + door.width - Math.cos(angle) * door.width,
      ])
    }
  }
  arc.push(
    [w, 0.08, door.fromNorth + door.width],
    [w - door.width, 0.08, door.fromNorth + door.width],
  )
  lines(floor, arc, '#ad8650', 0.75)
  return { north, south, west, east }
}

export function createRoomModel(proposal: Proposal) {
  const root = new Group()
  root.name = `proposal-${proposal.id}`
  root.userData.unit = 'cm'
  const materials = createMaterials()
  const walls = buildArchitecture(root, materials)
  const northFurniture = buildNorthFurniture(root, proposal, materials)
  const southFurniture = group(root, 'south-furniture')
  buildBicycle(southFurniture, materials)
  buildSouthBooks(southFurniture, SOUTH_BOOKS, materials)
  artwork(southFurniture, SOUTH_ART, materials, false)
  const office = buildOffice(root, materials)
  return { root, materials, walls, northFurniture, southFurniture, ...office }
}

export type RoomModel = ReturnType<typeof createRoomModel>

/** View-dependent cutaways reveal wall-mounted objects from their interior side. */
export function updateRoomVisibility(
  model: RoomModel,
  camera: Vector3,
  cutaway: boolean,
) {
  const visible = {
    north: !cutaway || camera.z >= 0,
    south: !cutaway || camera.z <= ROOM.depth,
    west: !cutaway || camera.x >= 0,
    east: !cutaway || camera.x <= ROOM.width,
  }
  for (const side of ['north', 'south', 'west', 'east'] as const)
    model.walls[side].visible = visible[side]
  for (const name of ['door-leaf', 'door-handle']) {
    model.walls.east.getObjectByName(name)!.visible = !cutaway
  }
  model.northFurniture.visible = visible.north
  model.southFurniture.visible = visible.south
  model.office.visible = visible.north
}
