import { Vector3 } from 'three'
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
  const points = []
  const xRange = withAnnotations
    ? [-60, ROOM.width + 80]
    : [-18, ROOM.width + 18]
  const yRange = withAnnotations
    ? [-25, ROOM.height + 35]
    : [-10, ROOM.height + 10]
  const zRange = withAnnotations
    ? [-35, ROOM.depth + 75]
    : [-18, ROOM.depth + 18]
  for (const x of xRange) {
    for (const y of yRange) {
      for (const z of zRange) {
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
