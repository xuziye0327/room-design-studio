import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Box3 } from 'three'
import { PROPOSALS, SOUTH_BOOKS } from '../../src/data/proposals.ts'
import { disposeModel } from '../../src/scene/geometry.ts'
import { createRoomModel } from '../../src/scene/room.ts'

test('the south reading display fits the 90 × 15 cm ledge', () => {
  const model = createRoomModel(PROPOSALS[0])
  const display = model.root.getObjectByName('south-books')!
  const bounds = new Box3().setFromObject(display)
  try {
    assert.ok(bounds.min.x >= SOUTH_BOOKS.x - 0.001)
    assert.ok(bounds.max.x <= SOUTH_BOOKS.x + SOUTH_BOOKS.width + 0.001)
    assert.ok(bounds.min.z >= SOUTH_BOOKS.south - 0.001)
    assert.ok(
      bounds.max.z <= SOUTH_BOOKS.south + SOUTH_BOOKS.depth + 0.001,
      `Display ends at ${bounds.max.z} cm; south wall is at ${SOUTH_BOOKS.south + SOUTH_BOOKS.depth} cm`,
    )
  } finally {
    disposeModel(model.root)
  }
})
