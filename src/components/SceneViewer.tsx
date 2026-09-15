import Add from '@mui/icons-material/Add'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Bolt from '@mui/icons-material/Bolt'
import Fullscreen from '@mui/icons-material/Fullscreen'
import FullscreenExit from '@mui/icons-material/FullscreenExit'
import LayersOutlined from '@mui/icons-material/LayersOutlined'
import MouseOutlined from '@mui/icons-material/MouseOutlined'
import Pause from '@mui/icons-material/Pause'
import Remove from '@mui/icons-material/Remove'
import RestartAlt from '@mui/icons-material/RestartAlt'
import SquareFoot from '@mui/icons-material/SquareFoot'
import Sync from '@mui/icons-material/Sync'
import ViewInAr from '@mui/icons-material/ViewInAr'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect, useRef, useState } from 'react'
import type { Proposal } from '../data/proposals.ts'
import { SCENE_ANNOTATIONS } from '../scene/annotations.ts'
import { VIEW_PRESETS } from '../scene/projection.ts'
import type { ViewPreset } from '../scene/projection.ts'
import type { ScenePresentation } from '../scene/room.ts'
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
    <Paper
      component="section"
      ref={container}
      className="scene-viewer"
      aria-label={`${proposal.name} 3D 查看器`}
      onFocusCapture={() => setAutoRotate(false)}
    >
      <div className="drawing-heading">
        <Typography component="h2">
          <ViewInAr className="icon" />
          3D 空间预览
        </Typography>
        <ToggleButtonGroup
          className="presentation-tabs"
          exclusive
          value={presentation}
          aria-label="展示内容"
        >
          <ToggleButton
            value="furniture"
            onClick={() => selectPresentation('furniture')}
          >
            家具布局
          </ToggleButton>
          <ToggleButton
            value="electrical"
            onClick={() => selectPresentation('electrical')}
          >
            <Bolt className="icon" />
            电位定位
          </ToggleButton>
        </ToggleButtonGroup>
        <div className="drawing-actions">
          <span className="view-label">正交投影 · 单位 cm</span>
          <IconButton
            aria-label={fullscreen ? '退出全屏' : '全屏查看'}
            title={fullscreen ? '退出全屏' : '全屏查看'}
            onClick={toggleFullscreen}
          >
            {fullscreen ? (
              <FullscreenExit className="icon" />
            ) : (
              <Fullscreen className="icon" />
            )}
          </IconButton>
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
        <ToggleButtonGroup
          className="view-presets"
          exclusive
          value={view}
          aria-label="相机视角"
        >
          {(Object.keys(VIEW_PRESETS) as ViewPreset[]).map((key) => (
            <ToggleButton key={key} value={key} onClick={() => selectView(key)}>
              {VIEW_PRESETS[key].label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
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
              { Icon: Add, label: '放大', factor: 1.2 },
              { Icon: Remove, label: '缩小', factor: 1 / 1.2 },
            ] as const
          ).map(({ Icon, label, factor }) => (
            <IconButton
              key={label}
              aria-label={label}
              title={label}
              onClick={() => {
                setAutoRotate(false)
                actions.current?.zoom(factor)
              }}
            >
              <Icon className="icon" />
            </IconButton>
          ))}
          <IconButton
            aria-label="复位视角"
            title="复位视角"
            onClick={() => selectView('overview')}
          >
            <RestartAlt className="icon" />
          </IconButton>
        </div>
      </div>
      <div className="viewer-toolbar">
        <div className="viewer-options">
          <ToggleButton
            value="auto-rotate"
            selected={autoRotate}
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
            {autoRotate ? (
              <Pause className="icon" />
            ) : (
              <Sync className="icon" />
            )}
            {autoRotate ? '暂停环绕' : '自动环绕'}
          </ToggleButton>
          <ToggleButton
            value="dimensions"
            selected={showDimensions}
            onClick={() => setShowDimensions(!showDimensions)}
          >
            <SquareFoot className="icon" />
            尺寸标注
          </ToggleButton>
          <ToggleButton
            value="cutaway"
            selected={cutaway}
            title="随视角隐藏近侧墙体及相应家具，显露对面布局"
            onClick={() => setCutaway(!cutaway)}
          >
            <LayersOutlined className="icon" />
            墙体剖切
          </ToggleButton>
        </div>
        <div className="orbit-controls" role="group" aria-label="旋转视角">
          {(
            [
              { Icon: ArrowBack, label: '向左旋转', angle: -Math.PI / 12 },
              { Icon: ArrowForward, label: '向右旋转', angle: Math.PI / 12 },
            ] as const
          ).map(({ Icon, label, angle }) => (
            <IconButton
              key={label}
              aria-label={`${label} 15 度`}
              title={`${label} 15°`}
              onClick={() => {
                stopMotion()
                actions.current?.orbit(angle)
              }}
            >
              <Icon className="icon" />
            </IconButton>
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
      <Typography component="p" className="interaction-hint">
        <MouseOutlined className="icon" />
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
      </Typography>
      {fullscreenMessage && (
        <Typography component="p" className="interaction-hint" role="status">
          {fullscreenMessage}
        </Typography>
      )}
    </Paper>
  )
}
