import assert from 'node:assert/strict'
import { test } from 'node:test'
import { OrthographicCamera, Vector3 } from 'three'
import {
  DESK,
  ELECTRICAL_POINTS,
  PROPOSALS,
  ROOM,
} from '../../src/data/proposals.ts'
import {
  DIMENSION_ANNOTATIONS,
  projectAnnotations,
  SCENE_ANNOTATIONS,
} from '../../src/scene/annotations.ts'
import { fitRoomCamera } from '../../src/scene/camera.ts'
import { disposeModel } from '../../src/scene/geometry.ts'
import { VIEW_PRESETS } from '../../src/scene/projection.ts'
import { createRoomModel, updateRoomVisibility } from '../../src/scene/room.ts'

const near = (a: number, b: number) =>
  assert.ok(Math.abs(a - b) < 1e-6, `${a} ≈ ${b}`)

test('dimension lines measure the real room and desk geometry', () => {
  const expectedLengths = [ROOM.width, ROOM.depth, ROOM.height, DESK.width]
  DIMENSION_ANNOTATIONS.forEach((annotation, index) => {
    near(
      new Vector3(...annotation.from).distanceTo(new Vector3(...annotation.to)),
      expectedLengths[index],
    )
  })
  assert.equal(DIMENSION_ANNOTATIONS[3].title, '桌面 240 × 80 cm')
  assert.equal(DIMENSION_ANNOTATIONS[3].detail, '完成面高 75 cm')
})

for (const proposal of PROPOSALS) {
  test(`${proposal.name}: actual electrical marker centers match the source coordinates`, () => {
    const model = createRoomModel(proposal)
    model.root.updateMatrixWorld(true)
    for (const point of ELECTRICAL_POINTS) {
      const marker = model.root.getObjectByName(`point-${point.id}`)!
      assert.ok(marker)
      assert.deepEqual(
        marker.getWorldPosition(new Vector3()).toArray(),
        point.position,
      )
      if (point.kind === 'socket')
        assert.equal(
          marker.getObjectsByProperty('name', 'socket-hole').length,
          5,
        )
    }
    assert.equal(
      model.electrical
        .getObjectByName('point-W1')!
        .getObjectsByProperty('name', 'W1-port').length,
      1,
    )
    assert.equal(
      model.electrical.children.filter((node) => node.name.startsWith('point-'))
        .length,
      19,
    )
    disposeModel(model.root)
  })
}

test('electrical presentation and dimensions restore furniture materials and visibility', () => {
  const model = createRoomModel(PROPOSALS[0])
  const camera = new Vector3(530, 440, 610)
  updateRoomVisibility(model, camera, true, 'electrical', true)
  assert.equal(model.electrical.visible, true)
  assert.equal(model.dimensions.visible, true)
  assert.equal(model.northFurniture.visible, false)
  assert.equal(model.southFurniture.visible, false)
  assert.equal(model.equipment.visible, false)
  assert.equal(model.seating.visible, false)
  assert.equal(model.office.visible, true)
  assert.equal(model.deskMaterials.top.opacity, 0.22)
  assert.equal(model.materials.oak.opacity, 1)
  updateRoomVisibility(model, camera, true, 'furniture', false)
  assert.equal(model.electrical.visible, false)
  assert.equal(model.dimensions.visible, false)
  assert.equal(model.northFurniture.visible, true)
  assert.equal(model.equipment.visible, true)
  assert.equal(model.seating.visible, true)
  assert.equal(model.deskMaterials.top.opacity, 1)
  assert.equal(model.deskMaterials.top.depthWrite, true)
  disposeModel(model.root)
})

test('annotations use the camera projection and hide dimensions parallel to the view direction', () => {
  const model = createRoomModel(PROPOSALS[0])
  const elements = new Map(
    SCENE_ANNOTATIONS.map((annotation) => [
      annotation.id,
      { style: {} } as HTMLElement,
    ]),
  )
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 2500)
  const preset = VIEW_PRESETS.north
  camera.position.set(...preset.position)
  camera.lookAt(new Vector3(...preset.target))
  fitRoomCamera(camera, 800, 600, true)
  projectAnnotations(
    elements,
    camera,
    { width: 800, height: 600 },
    model.dimensions,
    true,
    false,
    true,
  )
  assert.equal(elements.get('room-width')!.style.display, 'block')
  assert.equal(elements.get('room-height')!.style.display, 'block')
  assert.equal(elements.get('room-depth')!.style.display, 'none')
  const projected = new Vector3(...DIMENSION_ANNOTATIONS[0].position).project(
    camera,
  )
  assert.equal(
    elements.get('room-width')!.style.transform,
    `translate(${(projected.x + 1) * 400}px, ${(1 - projected.y) * 300}px) translate(-50%, -50%)`,
  )
  camera.position.set(...VIEW_PRESETS.top.position)
  camera.lookAt(new Vector3(...VIEW_PRESETS.top.target))
  fitRoomCamera(camera, 375, 480, true)
  projectAnnotations(
    elements,
    camera,
    { width: 375, height: 480 },
    model.dimensions,
    true,
    false,
    true,
  )
  assert.equal(elements.get('room-height')!.style.display, 'none')
  assert.equal(elements.get('room-depth')!.style.display, 'block')
  disposeModel(model.root)
})
