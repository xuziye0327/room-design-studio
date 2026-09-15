import { Box3, Vector3 } from 'three'
import type { OrthographicCamera } from 'three'
import { ROOM } from '../data/proposals.ts'
import { orthographicFrustum } from './projection.ts'

export function fitRoomCamera(
  camera: OrthographicCamera,
  width: number,
  height: number,
  withAnnotations = false,
) {
  camera.updateMatrixWorld(true)
  const bounds = new Box3(
    withAnnotations ? new Vector3(-60, -25, -35) : new Vector3(-18, -10, -18),
    withAnnotations
      ? new Vector3(ROOM.width + 80, ROOM.height + 35, ROOM.depth + 75)
      : new Vector3(ROOM.width + 18, ROOM.height + 10, ROOM.depth + 18),
  ).applyMatrix4(camera.matrixWorldInverse)
  const size = bounds.getSize(new Vector3())
  const center = bounds.getCenter(new Vector3())
  const frustum = orthographicFrustum(width, height, size.x, size.y, 1.08)
  camera.left = frustum.left + center.x
  camera.right = frustum.right + center.x
  camera.top = frustum.top + center.y
  camera.bottom = frustum.bottom + center.y
  camera.updateProjectionMatrix()
}
