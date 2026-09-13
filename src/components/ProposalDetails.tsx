import type { Proposal } from '../data/proposals.ts'
import Icon from './Icon.tsx'

export default function ProposalDetails({ proposal }: { proposal: Proposal }) {
  return (
    <aside
      className="proposal-details glass-panel"
      aria-labelledby="details-heading"
    >
      <div className="details-heading">
        <span className="detail-number mono">{proposal.number}</span>
        <h2 id="details-heading">北墙设计</h2>
      </div>
      <h3 className="detail-theme">{proposal.theme}</h3>
      <p className="detail-description">{proposal.focus}</p>
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
            30<span>cm</span>
          </strong>
          <span>柜体最大进深</span>
        </div>
      </div>
      <section className="detail-section" aria-labelledby="layout-heading">
        <h3 id="layout-heading">共用空间尺度</h3>
        <dl className="detail-dimensions">
          <div>
            <dt>房间净尺寸</dt>
            <dd className="mono">
              280 × 220<span> cm</span>
            </dd>
          </div>
          <div>
            <dt>室内层高</dt>
            <dd className="mono">
              280<span> cm</span>
            </dd>
          </div>
          <div>
            <dt>双人长桌</dt>
            <dd className="mono">
              240 × 80 × 75<span> cm</span>
            </dd>
          </div>
          <div>
            <dt>桌子两侧留空</dt>
            <dd>
              各 <span className="mono">20 cm</span>
            </dd>
          </div>
        </dl>
      </section>
      <section className="detail-section" aria-labelledby="materials-heading">
        <h3 id="materials-heading">材质与色彩</h3>
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
      <div className="measurement-note">
        <Icon name="info" />
        <div>
          <strong>尺寸与实施</strong>
          <p>
            柜体、门窗与电位为方案示意，须现场复尺与深化。椅子按收拢状态展示。
          </p>
        </div>
      </div>
      <a
        className="document-link"
        href={`/delivery/${proposal.name}.md`}
        target="_blank"
        rel="noreferrer"
      >
        <span>
          阅读完整方案<span className="file-type">MD</span>
        </span>
        <Icon name="arrow-right" />
      </a>
    </aside>
  )
}
