/* oxlint-disable react/immutability -- Three.js owns mutable scene objects and imperative camera handles. */
import { addAfterEffect, Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import {
  ACESFilmicToneMapping,
  MathUtils,
  PCFShadowMap,
  Spherical,
  Vector3,
} from 'three'
import type { OrthographicCamera } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { Proposal } from '../data/proposals.ts'
import { projectAnnotations } from '../scene/annotations.ts'
import { fitRoomCamera } from '../scene/camera.ts'
import { disposeModel } from '../scene/geometry.ts'
import { centimetresPerPixel, VIEW_PRESETS } from '../scene/projection.ts'
import type { ViewPreset } from '../scene/projection.ts'
import { createRoomModel, updateRoomVisibility } from '../scene/room.ts'
import type { RoomModel, ScenePresentation } from '../scene/room.ts'
import { applyRoomTextures } from '../scene/textures.ts'

export interface CameraActions {
  preset: (view: ViewPreset) => void
  zoom: (factor: number) => void
  orbit: (azimuth: number, polar?: number) => void
}

interface RoomCanvasProps {
  proposal: Proposal
  interactive?: boolean
  autoRotate?: boolean
  cutaway?: boolean
  presentation?: ScenePresentation
  showDimensions?: boolean
  annotationLayer?: RefObject<HTMLDivElement | null>
  actions?: RefObject<CameraActions | null>
  scaleElement?: RefObject<HTMLSpanElement | null>
  compassElement?: RefObject<HTMLSpanElement | null>
  onInteraction?: () => void
}

function RoomScene({
  proposal,
  interactive = false,
  autoRotate = false,
  cutaway = true,
  presentation = 'furniture',
  showDimensions = false,
  annotationLayer,
  actions,
  scaleElement,
  compassElement,
  onInteraction,
}: RoomCanvasProps) {
  const { scene, camera: defaultCamera, gl, size, invalidate } = useThree()
  const camera = defaultCamera as OrthographicCamera
  const model = useRef<RoomModel | null>(null)
  const controls = useRef<OrbitControls | null>(null)
  const dimensions = useRef(size)
  const framing = useRef(false)
  const annotationElements = useRef(new Map<string, HTMLElement>())
  const interaction = useRef(onInteraction)
  useLayoutEffect(() => {
    dimensions.current = size
    interaction.current = onInteraction
    framing.current = showDimensions || presentation === 'electrical'
  }, [size, onInteraction, showDimensions, presentation])

  useLayoutEffect(() => {
    const elements =
      annotationLayer?.current?.querySelectorAll<HTMLElement>(
        '[data-annotation-id]',
      ) ?? []
    annotationElements.current = new Map(
      Array.from(elements).map((element) => [
        element.dataset.annotationId!,
        element,
      ]),
    )
    invalidate()
  }, [annotationLayer, invalidate])

  useLayoutEffect(() => {
    const room = createRoomModel(proposal)
    applyRoomTextures(room)
    scene.add(room.root)
    model.current = room
    gl.domElement.dataset.ready = 'false'
    invalidate()
    return () => {
      model.current = null
      scene.remove(room.root)
      disposeModel(room.root)
    }
  }, [proposal, scene, gl, invalidate])

  useLayoutEffect(
    () =>
      addAfterEffect(() => {
        if (model.current && gl.info.render.triangles > 0) {
          gl.domElement.dataset.ready = 'true'
          gl.domElement.dataset.triangles = String(gl.info.render.triangles)
        }
      }),
    [gl],
  )

  useLayoutEffect(() => {
    const canvas = gl.domElement
    const orbit = new OrbitControls(camera, canvas)
    controls.current = orbit
    orbit.enabled = interactive
    orbit.enableDamping = true
    orbit.dampingFactor = 0.1
    orbit.minPolarAngle = 0.005
    orbit.maxPolarAngle = Math.PI / 2 - 0.01
    orbit.minZoom = 0.55
    orbit.maxZoom = 3
    orbit.autoRotateSpeed = 0.7
    orbit.zoomToCursor = true
    orbit.panSpeed = 0.8
    orbit.rotateSpeed = 0.65
    const snapshot = () => {
      const { width, height } = dimensions.current
      canvas.dataset.azimuth = orbit.getAzimuthalAngle().toFixed(5)
      canvas.dataset.polar = orbit.getPolarAngle().toFixed(5)
      canvas.dataset.zoom = camera.zoom.toFixed(5)
      canvas.dataset.cmPerPixelX = (
        (camera.right - camera.left) /
        (width * camera.zoom)
      ).toFixed(8)
      canvas.dataset.cmPerPixelY = centimetresPerPixel(
        camera,
        height,
        camera.zoom,
      ).toFixed(8)
      if (scaleElement?.current)
        scaleElement.current.style.width = `${50 / centimetresPerPixel(camera, height, camera.zoom)}px`
      if (compassElement?.current)
        compassElement.current.style.transform = `rotate(${-orbit.getAzimuthalAngle()}rad)`
      invalidate()
    }
    const api: CameraActions = {
      preset(view) {
        const preset = VIEW_PRESETS[view]
        // Reset the control accumulator as well as the camera when changing views.
        const wasDamped = orbit.enableDamping
        orbit.enableDamping = false
        orbit.update()
        camera.position.set(...preset.position)
        orbit.target.set(...preset.target)
        camera.zoom = 1
        camera.lookAt(orbit.target)
        orbit.update()
        fitRoomCamera(
          camera,
          dimensions.current.width,
          dimensions.current.height,
          framing.current,
        )
        orbit.enableDamping = wasDamped
        canvas.dataset.view = view
        snapshot()
      },
      zoom(factor) {
        camera.zoom = MathUtils.clamp(
          camera.zoom * factor,
          orbit.minZoom,
          orbit.maxZoom,
        )
        camera.updateProjectionMatrix()
        snapshot()
      },
      orbit(azimuth, polar = 0) {
        const spherical = new Spherical().setFromVector3(
          camera.position.clone().sub(orbit.target),
        )
        spherical.theta += azimuth
        spherical.phi = MathUtils.clamp(
          spherical.phi + polar,
          orbit.minPolarAngle,
          orbit.maxPolarAngle,
        )
        camera.position.copy(
          new Vector3().setFromSpherical(spherical).add(orbit.target),
        )
        camera.lookAt(orbit.target)
        orbit.update()
        snapshot()
      },
    }
    const started = () => interaction.current?.()
    const focus = () => {
      if (interactive) canvas.focus({ preventScroll: true })
    }
    const keyboard = (event: KeyboardEvent) => {
      const commands: Record<string, () => void> = {
        ArrowLeft: () => api.orbit(-Math.PI / 12),
        ArrowRight: () => api.orbit(Math.PI / 12),
        ArrowUp: () => api.orbit(0, -Math.PI / 18),
        ArrowDown: () => api.orbit(0, Math.PI / 18),
        '+': () => api.zoom(1.2),
        '=': () => api.zoom(1.2),
        '-': () => api.zoom(1 / 1.2),
        Home: () => api.preset('overview'),
      }
      if (commands[event.key]) {
        event.preventDefault()
        started()
        commands[event.key]()
      }
    }
    orbit.addEventListener('change', snapshot)
    orbit.addEventListener('start', started)
    if (interactive) {
      canvas.tabIndex = 0
      canvas.setAttribute(
        'aria-label',
        `${proposal.name}三维场景；方向键旋转，加减键缩放，Home 键复位`,
      )
      canvas.addEventListener('keydown', keyboard)
      canvas.addEventListener('pointerdown', focus)
    } else {
      canvas.setAttribute('aria-hidden', 'true')
    }
    if (actions) actions.current = api
    api.preset('overview')
    return () => {
      if (actions) actions.current = null
      canvas.removeEventListener('keydown', keyboard)
      canvas.removeEventListener('pointerdown', focus)
      orbit.removeEventListener('change', snapshot)
      orbit.removeEventListener('start', started)
      orbit.dispose()
      controls.current = null
    }
  }, [
    camera,
    gl,
    interactive,
    invalidate,
    actions,
    scaleElement,
    compassElement,
    proposal.name,
  ])

  useLayoutEffect(() => {
    fitRoomCamera(camera, size.width, size.height, framing.current)
    gl.domElement.dataset.presentation = presentation
    gl.domElement.dataset.dimensions = String(showDimensions)
    controls.current?.dispatchEvent({ type: 'change' })
    invalidate()
  }, [
    camera,
    gl,
    size.width,
    size.height,
    showDimensions,
    presentation,
    invalidate,
  ])

  useEffect(() => {
    if (controls.current)
      controls.current.autoRotate = interactive && autoRotate
    invalidate()
  }, [interactive, autoRotate, invalidate])

  useEffect(() => {
    invalidate()
  }, [cutaway, invalidate])

  useFrame((_, delta) => {
    const orbit = controls.current
    if (orbit) {
      orbit.update(Math.min(delta, 0.1))
      if (orbit.autoRotate) invalidate()
    }
    if (model.current) {
      updateRoomVisibility(
        model.current,
        camera.position,
        cutaway,
        presentation,
        showDimensions,
      )
      if (annotationElements.current.size)
        projectAnnotations(
          annotationElements.current,
          camera,
          size,
          model.current.dimensions,
          showDimensions,
          presentation === 'electrical',
          model.current.office.visible,
        )
    }
  })

  return (
    <>
      <ambientLight intensity={0.8} />
      <hemisphereLight args={['#fffdf8', '#c7d2d7', 1.65]} />
      <directionalLight
        position={[-140, 540, 330]}
        intensity={2.7}
        castShadow
        shadow-mapSize={interactive ? [2048, 2048] : [1024, 1024]}
        shadow-camera-left={-450}
        shadow-camera-right={450}
        shadow-camera-top={450}
        shadow-camera-bottom={-450}
        shadow-camera-near={1}
        shadow-camera-far={1500}
        shadow-bias={-0.00015}
        shadow-normalBias={0.25}
      />
    </>
  )
}

export default function RoomCanvas(props: RoomCanvasProps) {
  return (
    <Canvas
      className="room-canvas"
      orthographic
      camera={{
        position: VIEW_PRESETS.overview.position,
        near: 0.1,
        far: 2500,
        zoom: 1,
        manual: true,
      }}
      frameloop="demand"
      dpr={props.interactive ? [1, 2] : [1, 1.5]}
      shadows={{ type: PCFShadowMap }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: ACESFilmicToneMapping,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor('#f8faff', 0)
        gl.toneMappingExposure = 1.05
        gl.domElement.dataset.renderer = 'webgl2'
        gl.domElement.dataset.unit = 'cm'
      }}
    >
      <RoomScene {...props} />
    </Canvas>
  )
}
