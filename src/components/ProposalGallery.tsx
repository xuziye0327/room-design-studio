import { DESK, PROPOSALS, ROOM, SCREEN } from '../data/proposals.ts'
import Icon from './Icon.tsx'
import RoomCanvas from './RoomCanvas.tsx'

export default function ProposalGallery() {
  return (
    <>
      <header className="gallery-heading">
        <div className="gallery-intro">
          <p className="eyebrow">
            <span />
            双人办公空间
          </p>
          <h1>一间房，三种可能。</h1>
          <p className="gallery-lead">
            把高效的工作，和热爱的生活，安放在同一个空间。
            <br className="desktop-break" />
            从一份方案出发，360° 看见每一面的细节。
          </p>
        </div>
        <div className="area-block">
          <p>共同空间基准</p>
          <p className="area-value">
            <strong className="mono">{ROOM.area}</strong>
            <span>㎡</span>
          </p>
          <p>
            <span className="mono">
              {ROOM.width} × {ROOM.depth} cm
            </span>
            <span className="area-divider" />
            层高 <span className="mono">{ROOM.height} cm</span>
          </p>
          <svg
            className="area-outline"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
          >
            <path d="m15 38 35-20 35 20v41L50 99 15 79V38Zm0 0 35 20 35-20M50 58v41M50 18v40" />
          </svg>
        </div>
      </header>

      <section aria-labelledby="proposals-heading">
        <div className="section-heading">
          <h2 id="proposals-heading">
            选择你的空间方案
            <span className="count-badge mono">
              {String(PROPOSALS.length).padStart(2, '0')}
            </span>
          </h2>
          <p>
            <Icon name="mouse" />
            <span>点击缩略方案，进入 3D 查看</span>
          </p>
        </div>
        <div className="proposal-grid">
          {PROPOSALS.map((proposal) => (
            <article className="proposal-card glass-panel" key={proposal.id}>
              <a
                className="proposal-card-link"
                href={`#/proposal/${proposal.id}`}
                data-proposal={proposal.id}
                aria-label={`${proposal.name}，进入 3D 查看`}
              >
                <div className="proposal-thumbnail" aria-hidden="true">
                  <RoomCanvas proposal={proposal} />
                  <span className="card-number mono">{proposal.number}</span>
                  <span className="thumbnail-badge">
                    <Icon name="cube" />
                    3D
                  </span>
                  <span className="thumbnail-caption">北墙 · 等比例预览</span>
                </div>
                <div className="proposal-card-body">
                  <h3>{proposal.name}</h3>
                  <p className="proposal-description">{proposal.description}</p>
                  <div className="proposal-tags">
                    {proposal.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="proposal-card-footer">
                    <span>{proposal.theme}</span>
                    <strong>
                      3D 查看
                      <Icon name="arrow-right" />
                    </strong>
                  </div>
                </div>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section
        className="shared-conditions glass-panel"
        aria-labelledby="shared-heading"
      >
        <div className="shared-heading">
          <p className="eyebrow">共同设计条件</p>
          <h2 id="shared-heading">三种表达，同一基准</h2>
        </div>
        <div className="shared-condition">
          <span className="condition-icon">
            <Icon name="ruler" />
          </span>
          <div>
            <h3>白橡木双人长桌</h3>
            <p className="mono">
              {DESK.width} × {DESK.depth} × {DESK.height} cm
            </p>
          </div>
        </div>
        <div className="shared-condition">
          <span className="condition-icon">
            <Icon name="cube" />
          </span>
          <div>
            <h3>双人四屏工位</h3>
            <p>每人一横一竖 · {SCREEN.diagonalInches} 英寸</p>
          </div>
        </div>
        <div className="shared-condition">
          <span className="condition-icon">
            <Icon name="layers" />
          </span>
          <div>
            <h3>共用南墙设计</h3>
            <p>浅书托 · 装饰画</p>
          </div>
        </div>
      </section>
    </>
  )
}
