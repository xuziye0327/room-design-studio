import ArrowForward from '@mui/icons-material/ArrowForward'
import LayersOutlined from '@mui/icons-material/LayersOutlined'
import MouseOutlined from '@mui/icons-material/MouseOutlined'
import SquareFoot from '@mui/icons-material/SquareFoot'
import ViewInAr from '@mui/icons-material/ViewInAr'
import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Paper,
  Typography,
} from '@mui/material'
import { DESK, PROPOSALS, ROOM, SCREEN } from '../data/proposals.ts'
import RoomCanvas from './RoomCanvas.tsx'

export default function ProposalGallery() {
  return (
    <>
      <header className="gallery-heading">
        <div className="gallery-intro">
          <Typography component="p" className="eyebrow">
            <span />
            双人办公空间
          </Typography>
          <Typography component="h1" variant="h1">
            一间房，三种可能。
          </Typography>
          <Typography component="p" className="gallery-lead">
            把高效的工作，和热爱的生活，安放在同一个空间。
            <br className="desktop-break" />
            从一份方案出发，360° 看见每一面的细节。
          </Typography>
        </div>
        <div className="area-block">
          <Typography component="p">共同空间基准</Typography>
          <Typography component="p" className="area-value">
            <strong className="mono">{ROOM.area}</strong>
            <span>㎡</span>
          </Typography>
          <Typography component="p">
            <span className="mono">
              {ROOM.width} × {ROOM.depth} cm
            </span>
            <span className="area-divider" />
            层高 <span className="mono">{ROOM.height} cm</span>
          </Typography>
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
          <Typography component="h2" id="proposals-heading">
            选择你的空间方案
            <span className="count-badge mono">
              {String(PROPOSALS.length).padStart(2, '0')}
            </span>
          </Typography>
          <Typography component="p">
            <MouseOutlined className="icon" />
            <span>点击缩略方案，进入 3D 查看</span>
          </Typography>
        </div>
        <div className="proposal-grid">
          {PROPOSALS.map((proposal) => (
            <Card
              component="article"
              className="proposal-card"
              key={proposal.id}
            >
              <CardActionArea
                component="a"
                className="proposal-card-link"
                href={`#/proposal/${proposal.id}`}
                data-proposal={proposal.id}
                aria-label={`${proposal.name}，进入 3D 查看`}
              >
                <div className="proposal-thumbnail" aria-hidden="true">
                  <RoomCanvas proposal={proposal} />
                  <span className="card-number mono">{proposal.number}</span>
                  <span className="thumbnail-badge">
                    <ViewInAr className="icon" />
                    3D
                  </span>
                  <span className="thumbnail-caption">北墙 · 等比例预览</span>
                </div>
                <CardContent className="proposal-card-body">
                  <Typography component="h3">{proposal.name}</Typography>
                  <Typography component="p" className="proposal-description">
                    {proposal.description}
                  </Typography>
                  <div className="proposal-tags">
                    {proposal.tags.map((tag) => (
                      <Chip key={tag} size="small" label={tag} />
                    ))}
                  </div>
                  <div className="proposal-card-footer">
                    <span>{proposal.theme}</span>
                    <strong>
                      3D 查看
                      <ArrowForward className="icon" />
                    </strong>
                  </div>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </div>
      </section>

      <Paper
        component="section"
        className="shared-conditions"
        aria-labelledby="shared-heading"
      >
        <div className="shared-heading">
          <Typography component="p" className="eyebrow">
            共同设计条件
          </Typography>
          <Typography component="h2" id="shared-heading">
            三种表达，同一基准
          </Typography>
        </div>
        <div className="shared-condition">
          <span className="condition-icon">
            <SquareFoot className="icon" />
          </span>
          <div>
            <Typography component="h3">白橡木双人长桌</Typography>
            <Typography component="p" className="mono">
              {DESK.width} × {DESK.depth} × {DESK.height} cm
            </Typography>
          </div>
        </div>
        <div className="shared-condition">
          <span className="condition-icon">
            <ViewInAr className="icon" />
          </span>
          <div>
            <Typography component="h3">双人四屏工位</Typography>
            <Typography component="p">
              每人一横一竖 · {SCREEN.diagonalInches} 英寸
            </Typography>
          </div>
        </div>
        <div className="shared-condition">
          <span className="condition-icon">
            <LayersOutlined className="icon" />
          </span>
          <div>
            <Typography component="h3">共用南墙设计</Typography>
            <Typography component="p">浅书托 · 装饰画</Typography>
          </div>
        </div>
      </Paper>
    </>
  )
}
