import { CanvasTexture, Mesh, SRGBColorSpace } from 'three'
import type { RoomModel } from './room.ts'

function texture(
  width: number,
  height: number,
  draw: (context: CanvasRenderingContext2D) => void,
) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  draw(canvas.getContext('2d')!)
  const result = new CanvasTexture(canvas)
  result.colorSpace = SRGBColorSpace
  result.anisotropy = 4
  return result
}

export function applyRoomTextures(model: RoomModel) {
  const oak = texture(512, 256, (c) => {
    c.fillStyle = '#dec59f'
    c.fillRect(0, 0, 512, 256)
    for (let row = 0; row < 256; row++) {
      const wave = Math.sin(row * 17.13) * 0.5 + 0.5
      c.strokeStyle = `rgba(120, 83, 41, ${0.025 + wave * 0.055})`
      c.lineWidth = 0.6 + wave
      c.beginPath()
      c.moveTo(0, row)
      c.bezierCurveTo(180, row + wave * 3, 320, row - wave * 4, 512, row + 1)
      c.stroke()
    }
  })
  for (const material of [model.materials.oak, model.deskMaterials.top]) {
    material.map = oak
    material.color.set('#ffffff')
    material.needsUpdate = true
  }

  const screen = texture(640, 400, (c) => {
    const background = c.createLinearGradient(0, 0, 640, 400)
    background.addColorStop(0, '#214957')
    background.addColorStop(1, '#779ca6')
    c.fillStyle = background
    c.fillRect(0, 0, 640, 400)
    for (let i = 0; i < 4; i++) {
      c.fillStyle = ['#7f9d9a', '#a2b9ad', '#becbbb', '#d7dbca'][i]
      c.beginPath()
      c.moveTo(0, 310 + i * 22)
      c.bezierCurveTo(240, 40 + i * 48, 470, 340 - i * 15, 640, 150 + i * 60)
      c.lineTo(640, 400)
      c.lineTo(0, 400)
      c.fill()
    }
    c.fillStyle = 'rgba(255,255,255,.55)'
    c.beginPath()
    c.roundRect(235, 376, 170, 10, 5)
    c.fill()
  })
  model.materials.screen.map = screen
  model.materials.screen.color.set('#ffffff')
  model.materials.screen.emissive.set('#94b4b0')
  model.materials.screen.emissiveMap = screen
  model.materials.screen.emissiveIntensity = 0.15
  model.materials.screen.needsUpdate = true

  const art = texture(512, 512, (c) => {
    c.fillStyle = '#e7e7d9'
    c.fillRect(0, 0, 512, 512)
    c.fillStyle = '#d2b891'
    c.beginPath()
    c.arc(344, 128, 46, 0, Math.PI * 2)
    c.fill()
    for (let i = 0; i < 3; i++) {
      c.fillStyle = ['#a9baa3', '#809a86', '#4f7366'][i]
      c.beginPath()
      c.moveTo(0, 270 + i * 55)
      c.bezierCurveTo(120, 130 + i * 88, 240, 370 - i * 22, 512, 160 + i * 94)
      c.lineTo(512, 512)
      c.lineTo(0, 512)
      c.fill()
    }
  })
  model.root.traverse((object) => {
    if (object instanceof Mesh && object.userData.artTexture) {
      const material = model.materials.paper.clone()
      material.color.set('#ffffff')
      material.map = art
      object.material = material
    }
  })
}
