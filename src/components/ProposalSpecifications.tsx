import ExpandMore from '@mui/icons-material/ExpandMore'
import SquareFoot from '@mui/icons-material/SquareFoot'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import {
  BICYCLE,
  COMPUTERS,
  DESK,
  ELECTRICAL_POINTS,
  MEASUREMENT_NOTES,
  NETWORK_TRAY,
  northFixtures,
  SCREEN,
  SOUTH_ART,
  SOUTH_BOOKS,
} from '../data/proposals.ts'
import type { Proposal } from '../data/proposals.ts'

export default function ProposalSpecifications({
  proposal,
}: {
  proposal: Proposal
}) {
  return (
    <Accordion
      className="specifications"
      slotProps={{ heading: { component: 'h2' } }}
    >
      <AccordionSummary
        id="specifications-heading"
        aria-controls="specifications-content"
        expandIcon={<ExpandMore />}
      >
        <span className="specification-title">
          <SquareFoot className="icon" />
          <span>
            <strong>尺寸与实施说明</strong>
            <small>柜体尺寸 · 南墙布局 · 电位定位 · 现场核对</small>
          </span>
        </span>
      </AccordionSummary>
      <AccordionDetails className="specification-content">
        <Typography component="p" className="specification-intro">
          所有几何以 cm
          建模。房间及桌子为设计基准；以下柜体、设备与电位为方案定位值，须结合现场及实物深化。剖切展示会随视角隐藏近侧墙体及相应家具，以显露对面布局；关闭剖切可查看完整围合。
        </Typography>
        <TableContainer
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="北墙尺寸表，可横向滚动"
        >
          <Table sx={{ minWidth: 570 }}>
            <caption>北墙构件 · 单位 cm</caption>
            <TableHead>
              <TableRow>
                <TableCell scope="col">构件</TableCell>
                <TableCell scope="col">宽 × 深 × 高</TableCell>
                <TableCell scope="col">底部离地</TableCell>
                <TableCell scope="col">距西墙范围</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {northFixtures(proposal).map((fixture) => (
                <TableRow key={fixture.id}>
                  <TableCell component="th" scope="row">
                    {fixture.label}
                  </TableCell>
                  <TableCell className="mono">
                    {fixture.width} ×{' '}
                    {fixture.id.startsWith('pegboard') ? '待定' : fixture.depth}{' '}
                    × {fixture.height}
                  </TableCell>
                  <TableCell className="mono">{fixture.bottom}</TableCell>
                  <TableCell className="mono">
                    {fixture.x}–{fixture.x + fixture.width}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography component="p" className="table-note">
          洞洞板厚度在模型中按 1.6 cm
          表达。柜体板厚、层板、五金与固定节点以承重及加工深化为准。
        </Typography>
        <div className="specification-columns">
          <section>
            <Typography component="h3" variant="h6">
              共用南墙
            </Typography>
            <dl className="specification-list">
              <div>
                <dt>公路车低位横挂</dt>
                <dd>
                  参考长 {BICYCLE.width} × 高 {BICYCLE.height} cm；横向 x
                  {BICYCLE.x}–{BICYCLE.x + BICYCLE.width} cm，轮胎离地约{' '}
                  {BICYCLE.bottom} cm。
                </dd>
              </div>
              <div>
                <dt>墙面突出量</dt>
                <dd>
                  暂按 {BICYCLE.projection} cm；把横宽 {BICYCLE.handlebarWidth}{' '}
                  cm，须按实车和挂架复核。
                </dd>
              </div>
              <div>
                <dt>浅书托</dt>
                <dd>
                  宽 {SOUTH_BOOKS.width} × 深 {SOUTH_BOOKS.depth} cm，底部 H
                  {SOUTH_BOOKS.bottom} cm；横向 x{SOUTH_BOOKS.x}–
                  {SOUTH_BOOKS.x + SOUTH_BOOKS.width} cm。
                </dd>
              </div>
              <div>
                <dt>装饰画</dt>
                <dd>
                  宽 {SOUTH_ART.width} × 高 {SOUTH_ART.height} cm，底部 H
                  {SOUTH_ART.bottom} cm，位于南墙右上方。
                </dd>
              </div>
            </dl>
          </section>
          <section>
            <Typography component="h3" variant="h6">
              办公与设备
            </Typography>
            <dl className="specification-list">
              <div>
                <dt>双人长桌</dt>
                <dd>
                  {DESK.width} × {DESK.depth} × {DESK.height}{' '}
                  cm，北墙居中，左右各留 {DESK.x} cm；白橡木色哑光桌面。
                </dd>
              </div>
              <div>
                <dt>四台 {SCREEN.diagonalInches} 英寸显示器</dt>
                <dd>
                  每人一横一竖、竖屏位于中部。按 16:9 有效画面{' '}
                  {SCREEN.width.toFixed(2)} × {SCREEN.height.toFixed(2)} cm
                  建模。
                </dd>
              </div>
              <div>
                <dt>两台落地主机</dt>
                <dd>
                  参考 {COMPUTERS[0].width} × {COMPUTERS[0].depth} ×{' '}
                  {COMPUTERS[0].height}{' '}
                  cm，各在对应工位右手侧。支架、机箱与办公椅细节为示意。
                </dd>
              </div>
              <div>
                <dt>座椅与取放</dt>
                <dd>
                  模型展示椅子收拢状态。取放车前推回椅子，并核对扶手、脚轮、桌架与机箱的避让。
                </dd>
              </div>
            </dl>
          </section>
        </div>
        <TableContainer
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="电位定位表，可横向滚动"
        >
          <Table sx={{ minWidth: 570 }}>
            <caption>共用电位 · 西北角地面为原点 · 单位 cm</caption>
            <TableHead>
              <TableRow>
                <TableCell scope="col">编号</TableCell>
                <TableCell scope="col">用途</TableCell>
                <TableCell scope="col">x 向东</TableCell>
                <TableCell scope="col">y 向南</TableCell>
                <TableCell scope="col">H 离地</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ELECTRICAL_POINTS.map((point) => (
                <TableRow key={point.id}>
                  <TableCell component="th" scope="row" className="mono">
                    {point.id}
                  </TableCell>
                  <TableCell>
                    {point.label}
                    {point.id === 'B4' ? ' · 交换机常供电' : ''}
                  </TableCell>
                  <TableCell className="mono">{point.position[0]}</TableCell>
                  <TableCell className="mono">{point.position[2]}</TableCell>
                  <TableCell className="mono">{point.position[1]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography component="p" className="table-note">
          K1 分别控制主灯和柜灯。L1
          低压灯线按柜型分支，驱动留可检修位置；墙面底盒独立固定，洞洞板配合预留开口。SW1
          托盘为 x{NETWORK_TRAY.x}–{NETWORK_TRAY.x + NETWORK_TRAY.width}、y
          {NETWORK_TRAY.south}–{NETWORK_TRAY.south + NETWORK_TRAY.depth}{' '}
          cm，底部 H{NETWORK_TRAY.bottom} cm。
        </Typography>
        <Alert
          severity="warning"
          component="section"
          role="region"
          className="implementation-notes"
          aria-labelledby="verification-heading"
        >
          <Typography component="h3" variant="h6" id="verification-heading">
            加工与施工前核对
          </Typography>
          <ul>
            {MEASUREMENT_NOTES.map((note) => (
              <li key={note}>{note}</li>
            ))}
            <li>
              核对桌架跨度与抗下挠、柜体和书籍荷载、手办底座深度与重量、主机散热和屏幕支架净空。高位收藏以展示、低频取用为主。
            </li>
            <li>
              核对墙体材质、柜体固定孔与墙内管线，验证实车挂架承重及接触方式；由专业人员完成结构、电气与施工放样深化。
            </li>
          </ul>
        </Alert>
      </AccordionDetails>
    </Accordion>
  )
}
