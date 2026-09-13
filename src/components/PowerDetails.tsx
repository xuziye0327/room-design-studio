import { ELECTRICAL_POINTS } from '../data/proposals.ts'
import Icon from './Icon.tsx'

export default function PowerDetails() {
  const officeCount = ELECTRICAL_POINTS.filter(
    (point) => point.circuit === 'above-desk' || point.circuit === 'below-desk',
  ).length
  return (
    <aside
      className="proposal-details glass-panel"
      aria-labelledby="power-heading"
    >
      <div className="details-heading">
        <span className="detail-number power-number">
          <Icon name="power" />
        </span>
        <h2 id="power-heading">电位与网络</h2>
      </div>
      <h3 className="detail-theme">三套方案，共用电位</h3>
      <p className="detail-description">
        桌面半透明显示，便于核对墙插与桌下设备。以西北角地面为原点，x 向东、y
        向南，H 为离地中心高度。
      </p>
      <div className="feature-metrics">
        <div>
          <strong className="mono">
            {officeCount}
            <span>个</span>
          </strong>
          <span>办公五孔插位</span>
        </div>
        <div>
          <strong className="mono">
            1<span>口</span>
          </strong>
          <span>右侧网络面板</span>
        </div>
      </div>
      <section className="detail-section" aria-labelledby="socket-heading">
        <h3 id="socket-heading">桌上与桌下</h3>
        <dl className="detail-dimensions">
          <div>
            <dt>桌上 · 左右各 3 个</dt>
            <dd className="mono">H = 90 cm</dd>
          </div>
          <div>
            <dt>桌下 · 左右各 4 个</dt>
            <dd className="mono">H = 55 cm</dd>
          </div>
          <div>
            <dt>网络面板 W1</dt>
            <dd className="mono">x170 / H55 cm</dd>
          </div>
          <div>
            <dt>交换机托盘</dt>
            <dd className="mono">30 × 20 cm</dd>
          </div>
        </dl>
      </section>
      <section className="detail-section" aria-labelledby="network-heading">
        <h3 id="network-heading">右侧单口上联，两端分线</h3>
        <div className="network-flow">
          <span>家中路由器 / 弱电箱</span>
          <span>W1 · 右侧网络面板</span>
          <span>SW1 · 桌下交换机</span>
          <div>
            <span>左侧主机</span>
            <span>右侧主机</span>
          </div>
        </div>
        <p className="detail-footnote">
          B4 为交换机常供电；托盘底部 H58 cm，保留通风及检修空间。
        </p>
      </section>
      <div className="measurement-note">
        <Icon name="info" />
        <div>
          <strong>电气深化</strong>
          <p>
            强弱电分管、分底盒。连线仅表示连接关系；负荷、回路、接地与保护配置由电工确认。
          </p>
        </div>
      </div>
      <a
        className="document-link"
        href="/delivery/html/电位与右侧网络.html"
        target="_blank"
        rel="noreferrer"
      >
        <span>查看电位设计原图</span>
        <Icon name="arrow-right" />
      </a>
    </aside>
  )
}
