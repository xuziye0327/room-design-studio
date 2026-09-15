import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  Box3,
  BoxGeometry,
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  Texture,
  Vector3,
} from 'three'
import {
  DESK,
  DESK_TOP,
  MONITORS,
  PROPOSALS,
  ROOM,
  northFixtures,
} from '../../src/data/proposals.ts'
import { fitRoomCamera } from '../../src/scene/camera.ts'
import { disposeModel, instances } from '../../src/scene/geometry.ts'
import { VIEW_PRESETS } from '../../src/scene/projection.ts'
import { createRoomModel, updateRoomVisibility } from '../../src/scene/room.ts'

const near = (a: number, b: number, tolerance = 0.001) =>
  assert.ok(Math.abs(a - b) < tolerance, `Expected ${a} ≈ ${b}`)

for (const proposal of PROPOSALS) {
  test(`${proposal.name}: built geometry keeps centimetre dimensions and identity scale`, () => {
    const model = createRoomModel(proposal)
    model.root.updateMatrixWorld(true)
    const boundsOf = (id: string) => {
      const object = model.root.getObjectByName(id)
      assert.ok(object, `Object ${id} exists`)
      return new Box3().setFromObject(object)
    }
    const desk = boundsOf('desk')
    near(desk.min.x, DESK.x)
    near(desk.max.x, DESK.x + DESK.width)
    near(desk.max.y, 75)
    near(desk.min.z, 0)
    near(desk.max.z, 80)
    const top = boundsOf(DESK_TOP.id).getSize(new Vector3())
    near(top.x, 240)
    near(top.y, 4)
    near(top.z, 80)
    const floor = boundsOf('room-floor').getSize(new Vector3())
    near(floor.x, ROOM.width)
    near(floor.z, ROOM.depth)
    for (const fixture of northFixtures(proposal).filter((f) =>
      f.id.startsWith('cabinet'),
    )) {
      const bounds = boundsOf(fixture.id)
      near(bounds.min.x, fixture.x)
      near(bounds.max.x, fixture.x + fixture.width)
      near(bounds.min.y, fixture.bottom)
      near(bounds.max.y, fixture.bottom + fixture.height)
      near(bounds.min.z, 0)
      near(bounds.max.z, fixture.depth)
    }
    for (const monitor of MONITORS) {
      const size = boundsOf(`${monitor.id}-screen`).getSize(new Vector3())
      near(
        size.x / size.y,
        monitor.orientation === 'landscape' ? 16 / 9 : 9 / 16,
      )
    }
    const bike = boundsOf('bicycle')
    near(bike.min.x, 10)
    near(bike.max.x, 185)
    near(bike.min.y, 15)
    near(bike.max.y, 115, 0.05)
    near(bike.min.z, 175, 0.05)
    model.root.traverse((object) => {
      assert.deepEqual(
        object.scale.toArray(),
        [1, 1, 1],
        `Identity scale for ${object.name}`,
      )
    })
    disposeModel(model.root)
    assert.equal(model.root.children.length, 0)
  })
}

test('cutaway follows all four sides and restores a complete enclosure', () => {
  const model = createRoomModel(PROPOSALS[0])
  updateRoomVisibility(model, new Vector3(530, 440, 610), true)
  assert.equal(model.walls.north.visible, true)
  assert.equal(model.walls.south.visible, false)
  assert.equal(model.walls.west.visible, true)
  assert.equal(model.walls.east.visible, false)
  assert.equal(model.office.visible, true)
  updateRoomVisibility(model, new Vector3(-300, 440, -500), true)
  assert.equal(model.walls.north.visible, false)
  assert.equal(model.walls.east.visible, true)
  assert.equal(model.southFurniture.visible, true)
  assert.equal(model.northFurniture.visible, false)
  assert.equal(model.office.visible, false)
  assert.equal(model.walls.east.getObjectByName('door-leaf')!.visible, false)
  updateRoomVisibility(model, new Vector3(-300, 440, -500), false)
  assert.ok(Object.values(model.walls).every((wall) => wall.visible))
  assert.equal(model.walls.east.getObjectByName('door-leaf')!.visible, true)
  assert.equal(model.office.visible, true)
  disposeModel(model.root)
})

test('instanced geometry keeps placement and disposes shared resources once', (t) => {
  const root = new Group()
  const geometry = new BoxGeometry(2, 4, 6)
  const texture = new Texture()
  const material = new MeshStandardMaterial({
    map: texture,
    emissiveMap: texture,
  })
  const mesh = instances(
    root,
    'repeated-boxes',
    geometry,
    [
      [1, 2, 3],
      [4, 5, 6],
    ],
    material,
  )
  root.add(new Mesh(geometry, [material, material]))
  const matrix = new Matrix4()
  for (let i = 0; i < mesh.count; i++) {
    mesh.getMatrixAt(i, matrix)
    assert.deepEqual(
      new Vector3().setFromMatrixPosition(matrix).toArray(),
      i === 0 ? [1, 2, 3] : [4, 5, 6],
    )
  }
  assert.equal(mesh.castShadow, true)
  const disposals = [geometry, material, texture, mesh].map((resource) =>
    t.mock.method(resource, 'dispose'),
  )
  disposeModel(root)
  for (const dispose of disposals) assert.equal(dispose.mock.callCount(), 1)
  assert.equal(root.children.length, 0)
})

test('all camera presets fit the room without stretching after resize', () => {
  for (const preset of Object.values(VIEW_PRESETS)) {
    for (const [width, height, withAnnotations] of [
      [1000, 600, false],
      [375, 480, false],
      [812, 300, false],
      [1000, 600, true],
      [375, 480, true],
      [812, 300, true],
    ] as const) {
      const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 2500)
      camera.position.set(...preset.position)
      camera.lookAt(new Vector3(...preset.target))
      fitRoomCamera(camera, width, height, withAnnotations)
      near(
        (camera.right - camera.left) / width,
        (camera.top - camera.bottom) / height,
      )
      for (const x of [0, ROOM.width])
        for (const y of [0, ROOM.height])
          for (const z of [0, ROOM.depth]) {
            const point = new Vector3(x, y, z).project(camera)
            assert.ok(
              Math.abs(point.x) < 1 && Math.abs(point.y) < 1,
              `${point.toArray()} inside viewport`,
            )
          }
    }
  }
})
