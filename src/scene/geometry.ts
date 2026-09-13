import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  EdgesGeometry,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  Vector3,
} from 'three'
import type { Material, Texture } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { centerOf, sizeOf } from '../data/proposals.ts'
import type { BoxCm, Vector3Cm } from '../data/proposals.ts'

export function createMaterials() {
  const surface = (color: string, roughness = 0.75, metalness = 0) =>
    new MeshStandardMaterial({ color, roughness, metalness })
  return {
    wall: surface('#f0f0eb'),
    sideWall: surface('#d7e1df'),
    floor: surface('#ebe7df'),
    trim: surface('#fdfcf6'),
    oak: surface('#d3b389'),
    cabinet: surface('#f6f4eb'),
    cabinetBack: surface('#e7e9df'),
    pegboard: surface('#e3e5dc'),
    holes: surface('#929d95'),
    metal: surface('#435451', 0.48, 0.18),
    dark: surface('#262f36', 0.5),
    chair: surface('#7f928a', 0.93),
    chairMesh: surface('#a6b4a8'),
    screen: surface('#617e8a', 0.35),
    paper: surface('#e5e8df'),
    blue: surface('#8ca9ba'),
    green: surface('#8d9e80'),
    terracotta: surface('#c09678'),
    cream: surface('#e1caa7'),
    gold: surface('#b99a62', 0.36, 0.35),
    glass: new MeshStandardMaterial({
      color: '#cae4df',
      roughness: 0.15,
      transparent: true,
      opacity: 0.13,
      depthWrite: false,
    }),
    window: new MeshStandardMaterial({
      color: '#b6dce2',
      roughness: 0.28,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    }),
    light: new MeshStandardMaterial({
      color: '#fff4d4',
      emissive: '#ffe4aa',
      emissiveIntensity: 1.2,
    }),
  }
}

export type RoomMaterials = ReturnType<typeof createMaterials>

export function group(parent: Object3D, name: string) {
  const object = new Group()
  object.name = name
  parent.add(object)
  return object
}

export function box(
  parent: Object3D,
  name: string,
  size: Vector3Cm,
  position: Vector3Cm,
  material: Material,
  radius = 0,
) {
  const geometry =
    radius > 0
      ? new RoundedBoxGeometry(...size, 2, radius)
      : new BoxGeometry(...size)
  const mesh = new Mesh(geometry, material)
  mesh.name = name
  mesh.position.set(...position)
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

export function fromSpec(
  parent: Object3D,
  spec: BoxCm,
  material: Material,
  radius = 0,
) {
  const mesh = box(
    parent,
    spec.id,
    sizeOf(spec),
    centerOf(spec),
    material,
    radius,
  )
  mesh.userData.dimensionsCm = { ...spec }
  return mesh
}

export function outline(mesh: Mesh, color = '#7e8b88', opacity = 0.2) {
  const edges = new LineSegments(
    new EdgesGeometry(mesh.geometry, 30),
    new LineBasicMaterial({ color, transparent: true, opacity }),
  )
  mesh.add(edges)
  return edges
}

export function tube(
  parent: Object3D,
  from: Vector3Cm,
  to: Vector3Cm,
  radius: number,
  material: Material,
) {
  const start = new Vector3(...from)
  const end = new Vector3(...to)
  const vector = end.clone().sub(start)
  const mesh = new Mesh(
    new CylinderGeometry(radius, radius, vector.length(), 10),
    material,
  )
  mesh.position.copy(start.add(end).multiplyScalar(0.5))
  mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), vector.normalize())
  mesh.castShadow = true
  parent.add(mesh)
  return mesh
}

export function ellipsoid(
  parent: Object3D,
  position: Vector3Cm,
  radii: Vector3Cm,
  material: Material,
) {
  const geometry = new SphereGeometry(1, 16, 12).scale(...radii)
  const mesh = new Mesh(geometry, material)
  mesh.position.set(...position)
  mesh.castShadow = true
  parent.add(mesh)
  return mesh
}

export function lines(
  parent: Object3D,
  points: Vector3Cm[],
  color: string,
  opacity = 1,
) {
  const geometry = new BufferGeometry().setFromPoints(
    points.map((point) => new Vector3(...point)),
  )
  const mesh = new LineSegments(
    geometry,
    new LineBasicMaterial({ color, transparent: opacity < 1, opacity }),
  )
  parent.add(mesh)
  return mesh
}

export function instanceBoxes(
  parent: Object3D,
  name: string,
  size: Vector3Cm,
  positions: Vector3Cm[],
  material: Material,
) {
  const mesh = new InstancedMesh(
    new BoxGeometry(...size),
    material,
    positions.length,
  )
  mesh.name = name
  const matrix = new Matrix4()
  positions.forEach((position, index) =>
    mesh.setMatrixAt(index, matrix.makeTranslation(...position)),
  )
  mesh.instanceMatrix.needsUpdate = true
  mesh.castShadow = true
  parent.add(mesh)
  return mesh
}

/** The model owns every geometry, material and texture it creates. */
export function disposeModel(root: Object3D) {
  const geometries = new Set<BufferGeometry>()
  const materials = new Set<Material>()
  const textures = new Set<Texture>()
  root.traverse((object) => {
    const renderable = object as Mesh
    if (renderable.geometry) geometries.add(renderable.geometry)
    if (renderable.material) {
      const items = Array.isArray(renderable.material)
        ? renderable.material
        : [renderable.material]
      for (const material of items) {
        materials.add(material)
        for (const value of Object.values(material)) {
          if (
            value &&
            typeof value === 'object' &&
            'isTexture' in value &&
            value.isTexture
          )
            textures.add(value as Texture)
        }
      }
    }
    if (object instanceof InstancedMesh) object.dispose()
  })
  geometries.forEach((geometry) => geometry.dispose())
  materials.forEach((material) => material.dispose())
  textures.forEach((texture) => texture.dispose())
  root.clear()
}

export function tint(material: MeshStandardMaterial, color: string) {
  const result = material.clone()
  result.color = new Color(color)
  return result
}
