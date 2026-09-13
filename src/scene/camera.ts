import { Vector3 } from 'three'
import type { OrthographicCamera } from 'three'
import { ROOM } from '../data/proposals.ts'
import { orthographicFrustum } from './projection.ts'

export function fitRoomCamera(
  camera: OrthographicCamera,
  width: number,
  height: number,
) {
  camera.updateMatrixWorld(true)
  const points = []
  for (const x of [-18, ROOM.width + 18]) {
    for (const y of [-10, ROOM.height + 10]) {
      for (const z of [-18, ROOM.depth + 18]) {
        points.push(
          new Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse),
        )
      }
    }
  }
  const minX = Math.min(...points.map((p) => p.x))
  const maxX = Math.max(...points.map((p) => p.x))
  const minY = Math.min(...points.map((p) => p.y))
  const maxY = Math.max(...points.map((p) => p.y))
  const frustum = orthographicFrustum(
    width,
    height,
    maxX - minX,
    maxY - minY,
    1.08,
  )
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  camera.left = frustum.left + cx
  camera.right = frustum.right + cx
  camera.top = frustum.top + cy
  camera.bottom = frustum.bottom + cy
  camera.updateProjectionMatrix()
}
