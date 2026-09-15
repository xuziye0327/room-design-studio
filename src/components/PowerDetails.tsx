import ArrowForward from '@mui/icons-material/ArrowForward'
import Bolt from '@mui/icons-material/Bolt'
import { Alert, Link, Paper, Typography } from '@mui/material'
import { ELECTRICAL_POINTS, NETWORK_TRAY } from '../data/proposals.ts'

export default function PowerDetails() {
  const officeCount = ELECTRICAL_POINTS.filter(
    (point) => point.circuit === 'above-desk' || point.circuit === 'below-desk',
  ).length
  return (
    <Paper
      component="aside"
      className="proposal-details"
      aria-labelledby="power-heading"
    >
      <div className="details-heading">
        <span className="detail-number power-number">
          <Bolt className="icon" />
        </span>
        <Typography component="h2" id="power-heading">
          电位与网络
        </Typography>
      </div>
      <Typography component="h3" className="detail-theme">
        三套方案，共用电位
      </Typography>
      <Typography component="p" className="detail-description">
        桌面半透明显示，便于核对墙插与桌下设备。以西北角地面为原点，x 向东、y
        向南，H 为离地中心高度。
      </Typography>
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
        <Typography component="h3" id="socket-heading">
          桌上与桌下
        </Typography>
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
            <dd className="mono">
              {NETWORK_TRAY.width} × {NETWORK_TRAY.depth} cm
            </dd>
          </div>
        </dl>
      </section>
      <section className="detail-section" aria-labelledby="network-heading">
        <Typography component="h3" id="network-heading">
          右侧单口上联，两端分线
        </Typography>
        <div className="network-flow">
          <span>家中路由器 / 弱电箱</span>
          <span>W1 · 右侧网络面板</span>
          <span>SW1 · 桌下交换机</span>
          <div>
            <span>左侧主机</span>
            <span>右侧主机</span>
          </div>
        </div>
        <Typography component="p" className="detail-footnote">
          B4 为交换机常供电；托盘底部 H{NETWORK_TRAY.bottom}{' '}
          cm，保留通风及检修空间。
        </Typography>
      </section>
      <Alert className="measurement-note" severity="warning" role="note">
        <div>
          <strong>电气深化</strong>
          <Typography component="p">
            强弱电分管、分底盒。连线仅表示连接关系；负荷、回路、接地与保护配置由电工确认。
          </Typography>
        </div>
      </Alert>
      <Link
        className="document-link"
        href="/delivery/html/电位与右侧网络.html"
        target="_blank"
        rel="noreferrer"
      >
        <span>查看电位设计原图</span>
        <ArrowForward className="icon" />
      </Link>
    </Paper>
  )
}
