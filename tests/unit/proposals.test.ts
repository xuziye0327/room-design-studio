import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  BICYCLE,
  COMPUTERS,
  DESK,
  DESK_TOP,
  ELECTRICAL_POINTS,
  MONITORS,
  NETWORK_TRAY,
  PROPOSALS,
  ROOM,
  SCREEN,
  centerOf,
  northFixtures,
  sizeOf,
} from '../../src/data/proposals.ts'
import {
  centimetresPerPixel,
  orthographicFrustum,
} from '../../src/scene/projection.ts'

const close = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≈ ${expected}`)

test('room, desk and opening coordinates follow the centimetre source dimensions', () => {
  assert.deepEqual([ROOM.width, ROOM.depth, ROOM.height], [280, 220, 280])
  assert.equal(ROOM.area, 6.16)
  assert.deepEqual(sizeOf(DESK), [240, 75, 80])
  assert.deepEqual(centerOf(DESK), [140, 37.5, 40])
  assert.equal(DESK.x, 20)
  assert.equal(ROOM.width - DESK.x - DESK.width, 20)
  assert.equal(DESK_TOP.bottom + DESK_TOP.height, 75)
  assert.equal(
    ROOM.door.fromNorth + ROOM.door.width + ROOM.door.southReturn,
    ROOM.depth,
  )
  assert.deepEqual(ROOM.window, {
    fromNorth: 50,
    width: 120,
    sill: 90,
    height: 120,
  })
})

test('the three proposals reproduce the distinct north-wall layouts', () => {
  assert.deepEqual(
    PROPOSALS.map((p) => [p.id, p.cabinets.length]),
    [
      ['twin', 2],
      ['shelf', 3],
      ['frame', 3],
    ],
  )
  const [twin, shelf, frame] = PROPOSALS
  assert.deepEqual(
    twin.cabinets.map((c) => [c.x, c.bottom, c.width, c.depth, c.height]),
    [
      [20, 175, 60, 30, 90],
      [200, 175, 60, 30, 90],
    ],
  )
  assert.deepEqual(
    shelf.cabinets.map((c) => [c.x, c.bottom, c.width, c.depth, c.height]),
    [
      [20, 183, 60, 30, 70],
      [102, 216, 56, 26, 41],
      [185, 183, 75, 30, 46],
    ],
  )
  assert.deepEqual(frame.cabinets, shelf.cabinets)
  const centerShelf = shelf.shelves.find((s) => s.id === 'shelf-center')!
  assert.deepEqual(
    [
      centerShelf.x,
      centerShelf.bottom,
      centerShelf.width,
      centerShelf.depth,
      centerShelf.height,
    ],
    [90, 178, 85, 14, 3],
  )
  assert.deepEqual(
    [
      frame.artwork!.x,
      frame.artwork!.bottom,
      frame.artwork!.width,
      frame.artwork!.height,
      frame.artwork!.depth,
    ],
    [100, 175, 60, 30, 1.6],
  )
  assert.equal(frame.shelves.length, 1)
  assert.equal(twin.pegboards.length, 2)
  for (const proposal of PROPOSALS) {
    const ids = northFixtures(proposal).map((fixture) => fixture.id)
    assert.equal(new Set(ids).size, ids.length)
    for (const fixture of northFixtures(proposal)) {
      assert.ok(fixture.x >= 0 && fixture.x + fixture.width <= ROOM.width)
      assert.ok(
        fixture.bottom >= 0 && fixture.bottom + fixture.height <= ROOM.height,
      )
      assert.ok(fixture.depth > 0 && fixture.depth <= ROOM.depth)
    }
  }
})

test('four 32-inch screens preserve 16:9 active area and fit the desk', () => {
  close(Math.hypot(SCREEN.width, SCREEN.height), 32 * 2.54)
  close(SCREEN.width / SCREEN.height, 16 / 9)
  assert.deepEqual(
    MONITORS.map((m) => m.orientation),
    ['landscape', 'portrait', 'portrait', 'landscape'],
  )
  for (const monitor of MONITORS) {
    assert.ok(monitor.x >= DESK.x)
    assert.ok(monitor.x + monitor.width <= DESK.x + DESK.width)
    assert.ok(monitor.bottom >= DESK.height)
  }
  for (let i = 1; i < MONITORS.length; i++) {
    assert.ok(MONITORS[i].x > MONITORS[i - 1].x + MONITORS[i - 1].width)
  }
  assert.deepEqual(COMPUTERS.map(sizeOf), [
    [21, 46, 42],
    [21, 46, 42],
  ])
  assert.equal(BICYCLE.wheelbase + 2 * BICYCLE.wheelRadius, BICYCLE.width)
  assert.equal(BICYCLE.x + BICYCLE.width, 185)
})

test('electrical points contain 14 office sockets and one right-side network panel', () => {
  const office = ELECTRICAL_POINTS.filter(
    (p) => p.circuit === 'above-desk' || p.circuit === 'below-desk',
  )
  assert.equal(office.length, 14)
  assert.equal(office.filter((p) => p.position[1] === 90).length, 6)
  assert.equal(office.filter((p) => p.position[1] === 55).length, 8)
  assert.deepEqual(
    ELECTRICAL_POINTS.filter((p) => p.kind === 'network').map(
      (p) => p.position,
    ),
    [[170, 55, 0]],
  )
  assert.deepEqual(
    ELECTRICAL_POINTS.find((p) => p.id === 'B4')!.position,
    [246, 55, 0],
  )
  assert.deepEqual(
    ELECTRICAL_POINTS.find((p) => p.id === 'C1')!.position,
    [140, 280, 110],
  )
  assert.deepEqual(
    [
      NETWORK_TRAY.x,
      NETWORK_TRAY.south,
      NETWORK_TRAY.bottom,
      NETWORK_TRAY.width,
      NETWORK_TRAY.depth,
    ],
    [185, 18, 58, 30, 20],
  )
  assert.equal(
    new Set(ELECTRICAL_POINTS.map((p) => p.id)).size,
    ELECTRICAL_POINTS.length,
  )
})

test('orthographic projection retains equal scale at desktop, portrait and landscape sizes', () => {
  for (const [width, height] of [
    [1200, 720],
    [375, 440],
    [812, 375],
    [320, 600],
  ]) {
    for (const zoom of [0.6, 1, 2.8]) {
      const frustum = orthographicFrustum(width, height, 410, 370)
      const cmPerPixelX = (frustum.right - frustum.left) / (width * zoom)
      close(cmPerPixelX, centimetresPerPixel(frustum, height, zoom))
      assert.ok(frustum.right - frustum.left >= 410)
      assert.ok(frustum.top - frustum.bottom >= 370)
    }
  }
  assert.throws(() => orthographicFrustum(0, 440, 410, 370), RangeError)
})
