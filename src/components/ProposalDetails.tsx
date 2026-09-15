import { Alert, Paper, Typography } from '@mui/material'
import { DESK, ROOM } from '../data/proposals.ts'
import type { Proposal } from '../data/proposals.ts'

export default function ProposalDetails({ proposal }: { proposal: Proposal }) {
  return (
    <Paper
      component="aside"
      className="proposal-details"
      aria-labelledby="details-heading"
    >
      <div className="details-heading">
        <span className="detail-number mono">{proposal.number}</span>
        <Typography component="h2" id="details-heading">
          北墙设计
        </Typography>
      </div>
      <Typography component="h3" className="detail-theme">
        {proposal.theme}
      </Typography>
      <Typography component="p" className="detail-description">
        {proposal.focus}
      </Typography>
      <div className="feature-metrics">
        <div>
          <strong className="mono">
            {proposal.cabinets.length}
            <span>组</span>
          </strong>
          <span>高位展示柜</span>
        </div>
        <div>
          <strong className="mono">
            {Math.max(...proposal.cabinets.map((cabinet) => cabinet.depth))}
            <span>cm</span>
          </strong>
          <span>柜体最大进深</span>
        </div>
      </div>
      <section className="detail-section" aria-labelledby="layout-heading">
        <Typography component="h3" id="layout-heading">
          共用空间尺度
        </Typography>
        <dl className="detail-dimensions">
          <div>
            <dt>房间净尺寸</dt>
            <dd className="mono">
              {ROOM.width} × {ROOM.depth}
              <span> cm</span>
            </dd>
          </div>
          <div>
            <dt>室内层高</dt>
            <dd className="mono">
              {ROOM.height}
              <span> cm</span>
            </dd>
          </div>
          <div>
            <dt>双人长桌</dt>
            <dd className="mono">
              {DESK.width} × {DESK.depth} × {DESK.height}
              <span> cm</span>
            </dd>
          </div>
          <div>
            <dt>桌子两侧留空</dt>
            <dd>
              各 <span className="mono">{DESK.x} cm</span>
            </dd>
          </div>
        </dl>
      </section>
      <section className="detail-section" aria-labelledby="materials-heading">
        <Typography component="h3" id="materials-heading">
          材质与色彩
        </Typography>
        <div className="material-palette">
          <span>
            <i className="material-oak" />
            白橡木
          </span>
          <span>
            <i className="material-white" />
            暖白
          </span>
          <span>
            <i className="material-green" />
            柔和绿
          </span>
        </div>
      </section>
      <Alert className="measurement-note" severity="warning" role="note">
        <div>
          <strong>尺寸与实施</strong>
          <Typography component="p">
            柜体、门窗与电位为方案示意，须现场复尺与深化。椅子按收拢状态展示。
          </Typography>
        </div>
      </Alert>
    </Paper>
  )
}
