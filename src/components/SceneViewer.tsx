import { useEffect, useRef, useState } from 'react'
import type { Proposal } from '../data/proposals.ts'
import { useMediaQuery } from '../hooks/useMediaQuery.ts'
import { SCENE_ANNOTATIONS } from '../scene/annotations.ts'
import { VIEW_PRESETS } from '../scene/projection.ts'
import type { ViewPreset } from '../scene/projection.ts'
import type { ScenePresentation } from '../scene/room.ts'
import Icon from './Icon.tsx'
import RoomCanvas from './RoomCanvas.tsx'
import type { CameraActions } from './RoomCanvas.tsx'

export default function SceneViewer({
  proposal,
  presentation,
  onPresentationChange,
}: {
  proposal: Proposal
  presentation: ScenePresentation
  onPresentationChange: (value: ScenePresentation) => void
}) {
  const actions = useRef<CameraActions | null>(null)
  const scaleElement = useRef<HTMLSpanElement | null>(null)
  const compassElement = useRef<HTMLSpanElement | null>(null)
  const annotationLayer = useRef<HTMLDivElement | null>(null)
  const [showDimensions, setShowDimensions] = useState(false)
  const [view, setView] = useState<ViewPreset | null>('overview')
  const [autoRotate, setAutoRotate] = useState(false)
  const [cutaway, setCutaway] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [fullscreenMessage, setFullscreenMessage] = useState('')
  const container = useRef<HTMLElement | null>(null)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const touchInput = useMediaQuery('(pointer: coarse)')

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pauseWhenHidden = () => {
      if (document.hidden) setAutoRotate(false)
    }
    const pauseForPreference = () => {
      if (preference.matches) setAutoRotate(false)
    }
    const updateFullscreen = () =>
      setFullscreen(document.fullscreenElement === container.current)
    document.addEventListener('visibilitychange', pauseWhenHidden)
    document.addEventListener('fullscreenchange', updateFullscreen)
    preference.addEventListener('change', pauseForPreference)
    return () => {
      document.removeEventListener('visibilitychange', pauseWhenHidden)
      document.removeEventListener('fullscreenchange', updateFullscreen)
      preference.removeEventListener('change', pauseForPreference)
    }
  }, [])

  const toggleFullscreen = async () => {
    setFullscreenMessage('')
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await container.current!.requestFullscreen()
    } catch {
      setFullscreenMessage('请再次点击全屏按钮以打开完整视图。')
    }
  }

  const selectView = (value: ViewPreset) => {
    setView(value)
    setAutoRotate(false)
    actions.current?.preset(value)
  }
  const stopMotion = () => {
    setAutoRotate(false)
    setView(null)
  }
  const selectPresentation = (value: ScenePresentation) => {
    onPresentationChange(value)
    setShowDimensions(false)
    setCutaway(true)
    selectView(value === 'electrical' ? 'north' : 'overview')
  }

  return (
    <section
      ref={container}
      className="scene-viewer glass-panel"
      aria-label={`${proposal.name} 3D 查看器`}
      onFocusCapture={() => setAutoRotate(false)}
    >
      <div className="drawing-heading">
        <h2>
          <Icon name="cube" />
          3D 空间预览
        </h2>
        <div className="presentation-tabs" role="group" aria-label="展示内容">
          <button
            type="button"
            aria-pressed={presentation === 'furniture'}
            onClick={() => selectPresentation('furniture')}
          >
            家具布局
          </button>
          <button
            type="button"
            aria-pressed={presentation === 'electrical'}
            onClick={() => selectPresentation('electrical')}
          >
            <Icon name="power" />
            电位定位
          </button>
        </div>
        <div className="drawing-actions">
          <span className="view-label">正交投影 · 单位 cm</span>
          <button
            type="button"
            className="icon-button"
            aria-label={fullscreen ? '退出全屏' : '全屏查看'}
            title={fullscreen ? '退出全屏' : '全屏查看'}
            onClick={toggleFullscreen}
          >
            <Icon name={fullscreen ? 'close' : 'expand'} />
          </button>
        </div>
      </div>
      <div className="viewer-viewport" data-testid="viewer-viewport">
        <RoomCanvas
          proposal={proposal}
          interactive
          autoRotate={autoRotate && !reducedMotion}
          cutaway={cutaway}
          presentation={presentation}
          showDimensions={showDimensions}
          annotationLayer={annotationLayer}
          actions={actions}
          scaleElement={scaleElement}
          compassElement={compassElement}
          onInteraction={stopMotion}
        />
        <div
          ref={annotationLayer}
          className="world-labels"
          role="list"
          aria-label="场景尺寸与定位标注"
          aria-hidden={!showDimensions && presentation !== 'electrical'}
        >
          {SCENE_ANNOTATIONS.map((annotation) => (
            <div
              key={annotation.id}
              role="listitem"
              data-annotation-id={annotation.id}
              className={`world-label world-label--${annotation.kind}`}
              style={{ display: 'none' }}
            >
              <span className="annotation-title mono">{annotation.title}</span>
              {annotation.detail && (
                <span className="annotation-detail">{annotation.detail}</span>
              )}
            </div>
          ))}
        </div>
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
          {presentation === 'electrical'
            ? '电位定位 · cm'
            : cutaway
              ? '剖切展示'
              : '完整墙体'}
        </span>
        <div className="zoom-controls" role="group" aria-label="缩放与复位">
          {(
            [
              { icon: 'plus', label: '放大', factor: 1.2 },
              { icon: 'minus', label: '缩小', factor: 1 / 1.2 },
            ] as const
          ).map(({ icon, label, factor }) => (
            <button
              key={icon}
              type="button"
              className="icon-button"
              aria-label={label}
              title={label}
              onClick={() => {
                setAutoRotate(false)
                actions.current?.zoom(factor)
              }}
            >
              <Icon name={icon} />
            </button>
          ))}
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
            disabled={reducedMotion}
            title={
              reducedMotion
                ? '已遵循系统的减少动态效果设置'
                : '自动 360° 环绕；再次点击暂停'
            }
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
            aria-pressed={showDimensions}
            onClick={() => setShowDimensions(!showDimensions)}
          >
            <Icon name="ruler" />
            尺寸标注
          </button>
          <button
            type="button"
            className="tool-button"
            aria-pressed={cutaway}
            title="随视角隐藏近侧墙体及相应家具，显露对面布局"
            onClick={() => setCutaway(!cutaway)}
          >
            <Icon name="layers" />
            墙体剖切
          </button>
        </div>
        <div className="orbit-controls" role="group" aria-label="旋转视角">
          {(
            [
              { icon: 'arrow-left', label: '向左旋转', angle: -Math.PI / 12 },
              { icon: 'arrow-right', label: '向右旋转', angle: Math.PI / 12 },
            ] as const
          ).map(({ icon, label, angle }) => (
            <button
              key={icon}
              type="button"
              className="icon-button"
              aria-label={`${label} 15 度`}
              title={`${label} 15°`}
              onClick={() => {
                stopMotion()
                actions.current?.orbit(angle)
              }}
            >
              <Icon name={icon} />
            </button>
          ))}
        </div>
      </div>
      {presentation === 'electrical' && (
        <div className="electrical-legend">
          <span>
            <i className="legend-power" />
            五孔 / 开关 / 灯位
          </span>
          <span>
            <i className="legend-network" />
            网络
          </span>
          <span>连线为连接示意</span>
        </div>
      )}
      <p className="interaction-hint">
        <Icon name="mouse" />
        <span>
          {touchInput ? (
            '单指旋转 · 双指缩放与平移'
          ) : (
            <>
              拖动旋转 · 滚轮缩放 · 右键平移
              <span className="keyboard-hint"> · 方向键亦可旋转</span>
            </>
          )}
        </span>
      </p>
      {fullscreenMessage && (
        <p className="interaction-hint" role="status">
          {fullscreenMessage}
        </p>
      )}
    </section>
  )
}
