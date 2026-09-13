import { useRef, useState } from 'react'
import type { Proposal } from '../data/proposals.ts'
import { VIEW_PRESETS } from '../scene/projection.ts'
import type { ViewPreset } from '../scene/projection.ts'
import Icon from './Icon.tsx'
import RoomCanvas from './RoomCanvas.tsx'
import type { CameraActions } from './RoomCanvas.tsx'

export default function SceneViewer({ proposal }: { proposal: Proposal }) {
  const actions = useRef<CameraActions | null>(null)
  const scaleElement = useRef<HTMLSpanElement | null>(null)
  const compassElement = useRef<HTMLSpanElement | null>(null)
  const [view, setView] = useState<ViewPreset | null>('overview')
  const [autoRotate, setAutoRotate] = useState(false)
  const [cutaway, setCutaway] = useState(true)
  const selectView = (value: ViewPreset) => {
    setView(value)
    setAutoRotate(false)
    actions.current?.preset(value)
  }
  const stopMotion = () => {
    setAutoRotate(false)
    setView(null)
  }

  return (
    <section
      className="scene-viewer glass-panel"
      aria-label={`${proposal.name} 3D 查看器`}
    >
      <div className="drawing-heading">
        <h2>
          <Icon name="cube" />
          3D 空间预览
        </h2>
        <span className="view-label">正交投影 · 单位 cm</span>
      </div>
      <div className="viewer-viewport" data-testid="viewer-viewport">
        <RoomCanvas
          proposal={proposal}
          interactive
          autoRotate={autoRotate}
          cutaway={cutaway}
          actions={actions}
          scaleElement={scaleElement}
          compassElement={compassElement}
          onInteraction={stopMotion}
        />
        <div className="view-presets" role="group" aria-label="相机视角">
          {(Object.keys(VIEW_PRESETS) as ViewPreset[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={view === key}
              onClick={() => selectView(key)}
            >
              {VIEW_PRESETS[key].label}
            </button>
          ))}
        </div>
        <div className="view-compass" aria-label="北向指示">
          <span ref={compassElement}>
            N<i />
          </span>
        </div>
        <div className="view-scale" title="正交相机视平面中的 50 cm 标尺">
          <span ref={scaleElement} />
          <span className="mono">50 cm</span>
        </div>
        <span className="scene-status">
          {cutaway ? '剖切展示' : '完整墙体'}
        </span>
        <div className="zoom-controls" role="group" aria-label="缩放与复位">
          <button
            type="button"
            className="icon-button"
            aria-label="放大"
            title="放大"
            onClick={() => actions.current?.zoom(1.2)}
          >
            <Icon name="plus" />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="缩小"
            title="缩小"
            onClick={() => actions.current?.zoom(1 / 1.2)}
          >
            <Icon name="minus" />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="复位视角"
            title="复位视角"
            onClick={() => selectView('overview')}
          >
            <Icon name="reset" />
          </button>
        </div>
      </div>
      <div className="viewer-toolbar">
        <div className="viewer-options">
          <button
            type="button"
            className="tool-button"
            aria-pressed={autoRotate}
            onClick={() => {
              setAutoRotate(!autoRotate)
              setView(null)
            }}
          >
            <Icon name={autoRotate ? 'pause' : 'rotate'} />
            {autoRotate ? '暂停环绕' : '自动环绕'}
          </button>
          <button
            type="button"
            className="tool-button"
            aria-pressed={cutaway}
            onClick={() => setCutaway(!cutaway)}
          >
            <Icon name="layers" />
            墙体剖切
          </button>
        </div>
        <div className="orbit-controls" role="group" aria-label="旋转视角">
          <button
            type="button"
            className="icon-button"
            aria-label="向左旋转 15 度"
            title="向左旋转 15°"
            onClick={() => {
              stopMotion()
              actions.current?.orbit(-Math.PI / 12)
            }}
          >
            <Icon name="arrow-left" />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="向右旋转 15 度"
            title="向右旋转 15°"
            onClick={() => {
              stopMotion()
              actions.current?.orbit(Math.PI / 12)
            }}
          >
            <Icon name="arrow-right" />
          </button>
        </div>
      </div>
      <p className="interaction-hint">
        <Icon name="mouse" />
        <span>
          拖动旋转 · 滚轮缩放 · 右键平移
          <span className="keyboard-hint"> · 方向键亦可旋转</span>
        </span>
      </p>
    </section>
  )
}
