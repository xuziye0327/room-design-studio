export type Vector3Cm = [east: number, height: number, south: number]

/** All authoring dimensions are centimetres, measured from the northwest floor corner. */
export interface BoxCm {
  id: string
  label: string
  x: number
  south: number
  bottom: number
  width: number
  depth: number
  height: number
}

export const centerOf = (box: BoxCm): Vector3Cm => [
  box.x + box.width / 2,
  box.bottom + box.height / 2,
  box.south + box.depth / 2,
]

export const sizeOf = (box: BoxCm): Vector3Cm => [
  box.width,
  box.height,
  box.depth,
]

export const ROOM = {
  width: 280,
  depth: 220,
  height: 280,
  area: (280 * 220) / 10_000,
  wallThickness: 8,
  floorThickness: 6,
  door: { fromNorth: 140, width: 70, southReturn: 10, height: 210 },
  window: { fromNorth: 50, width: 120, sill: 90, height: 120 },
} as const

export const DESK: BoxCm = {
  id: 'desk',
  label: '双人长桌',
  x: 20,
  south: 0,
  bottom: 0,
  width: 240,
  depth: 80,
  height: 75,
}

export const DESK_TOP: BoxCm = {
  ...DESK,
  id: 'desk-top',
  label: '白橡木桌面',
  bottom: 71,
  height: 4,
}

export const COMPUTERS: BoxCm[] = [
  {
    id: 'pc-left',
    label: '左工位主机',
    x: 120,
    south: 14,
    bottom: 0,
    width: 21,
    depth: 42,
    height: 46,
  },
  {
    id: 'pc-right',
    label: '右工位主机',
    x: 236,
    south: 14,
    bottom: 0,
    width: 21,
    depth: 42,
    height: 46,
  },
]

export const CHAIRS = [
  { id: 'chair-left', x: 72, south: 72 },
  { id: 'chair-right', x: 195, south: 72 },
] as const

const diagonalCm = 32 * 2.54
const aspectDiagonal = Math.hypot(16, 9)
export const SCREEN = {
  diagonalInches: 32,
  diagonalCm,
  width: (diagonalCm * 16) / aspectDiagonal,
  height: (diagonalCm * 9) / aspectDiagonal,
  bezel: 0.6,
  depth: 2.2,
} as const

export interface MonitorSpec extends BoxCm {
  orientation: 'landscape' | 'portrait'
}

export const MONITORS: MonitorSpec[] = [
  {
    id: 'monitor-left-wide',
    center: 60.5,
    bottom: 92,
    orientation: 'landscape' as const,
  },
  {
    id: 'monitor-left-tall',
    center: 118,
    bottom: 80,
    orientation: 'portrait' as const,
  },
  {
    id: 'monitor-right-tall',
    center: 162,
    bottom: 80,
    orientation: 'portrait' as const,
  },
  {
    id: 'monitor-right-wide',
    center: 219.5,
    bottom: 92,
    orientation: 'landscape' as const,
  },
].map(({ id, center, bottom, orientation }) => {
  const width =
    (orientation === 'landscape' ? SCREEN.width : SCREEN.height) +
    SCREEN.bezel * 2
  const height =
    (orientation === 'landscape' ? SCREEN.height : SCREEN.width) +
    SCREEN.bezel * 2
  return {
    id,
    label: `32 英寸${orientation === 'landscape' ? '横屏' : '竖屏'}`,
    x: center - width / 2,
    south: 18,
    bottom,
    width,
    depth: SCREEN.depth,
    height,
    orientation,
  }
})

export const BICYCLE = {
  x: 10,
  width: 175,
  bottom: 15,
  height: 100,
  handlebarWidth: 44,
  projection: 45,
  wheelRadius: 33.5,
  wheelbase: 108,
  wheelPlane: 197,
} as const

export const SOUTH_BOOKS: BoxCm = {
  id: 'south-book-ledge',
  label: '浅书托',
  x: 20,
  south: 205,
  bottom: 145,
  width: 90,
  depth: 15,
  height: 3,
}

export const SOUTH_ART: BoxCm = {
  id: 'south-art',
  label: '南墙装饰画',
  x: 194,
  south: 217.6,
  bottom: 143,
  width: 65,
  depth: 2.4,
  height: 85,
}

export const NETWORK_TRAY: BoxCm = {
  id: 'network-tray',
  label: '交换机通风托盘',
  x: 185,
  south: 18,
  bottom: 58,
  width: 30,
  depth: 20,
  height: 2,
}

export interface ElectricalPoint {
  id: string
  label: string
  position: Vector3Cm
  wall: 'north' | 'east' | 'west' | 'ceiling'
  kind: 'socket' | 'network' | 'light' | 'switch'
  circuit?: 'above-desk' | 'below-desk' | 'utility'
}

const sockets = (
  prefix: string,
  positions: number[],
  height: number,
  circuit: 'above-desk' | 'below-desk',
): ElectricalPoint[] =>
  positions.map((x, i) => ({
    id: `${prefix}${i + 1}`,
    label: `${height === 90 ? '桌上' : '桌下'}五孔`,
    position: [x, height, 0],
    wall: 'north',
    kind: 'socket',
    circuit,
  }))

export const ELECTRICAL_POINTS: ElectricalPoint[] = [
  ...sockets('U', [45, 60, 75], 90, 'above-desk'),
  ...sockets('V', [210, 225, 240], 90, 'above-desk'),
  ...sockets('A', [90, 100, 110, 120], 55, 'below-desk'),
  ...sockets('B', [210, 222, 234, 246], 55, 'below-desk'),
  {
    id: 'W1',
    label: '右侧单口网络',
    position: [170, 55, 0],
    wall: 'north',
    kind: 'network',
  },
  {
    id: 'L1',
    label: '柜灯供电',
    position: [50, 220, 0],
    wall: 'north',
    kind: 'light',
  },
  {
    id: 'C1',
    label: '顶面主灯',
    position: [140, 280, 110],
    wall: 'ceiling',
    kind: 'light',
  },
  {
    id: 'K1',
    label: '入门双键开关',
    position: [280, 120, 120],
    wall: 'east',
    kind: 'switch',
  },
  {
    id: 'S1',
    label: '通用五孔',
    position: [0, 30, 195],
    wall: 'west',
    kind: 'socket',
    circuit: 'utility',
  },
]

export interface CabinetSpec extends BoxCm {
  contents: 'large-figure' | 'figures' | 'books-figures'
  shelfHeights: number[]
}

export interface Proposal {
  id: string
  number: string
  name: string
  shortName: string
  theme: string
  description: string
  focus: string
  tags: string[]
  cabinets: CabinetSpec[]
  pegboards: BoxCm[]
  shelves: BoxCm[]
  artwork?: BoxCm
}

const lowerPegboard: BoxCm = {
  id: 'pegboard-lower',
  label: '整体定制洞洞板',
  x: 20,
  south: 0,
  bottom: 85,
  width: 240,
  depth: 1.6,
  height: 80,
}

const staggeredCabinets: CabinetSpec[] = [
  {
    id: 'cabinet-left',
    label: '左侧大手办柜',
    x: 20,
    south: 0,
    bottom: 183,
    width: 60,
    depth: 30,
    height: 70,
    contents: 'large-figure',
    shelfHeights: [],
  },
  {
    id: 'cabinet-center',
    label: '中上部小手办柜',
    x: 102,
    south: 0,
    bottom: 216,
    width: 56,
    depth: 26,
    height: 41,
    contents: 'figures',
    shelfHeights: [],
  },
  {
    id: 'cabinet-right',
    label: '右侧书籍／手办柜',
    x: 185,
    south: 0,
    bottom: 183,
    width: 75,
    depth: 30,
    height: 46,
    contents: 'books-figures',
    shelfHeights: [],
  },
]

const upperShelf: BoxCm = {
  id: 'shelf-upper',
  label: '右上开放层板',
  x: 183,
  south: 0,
  bottom: 244,
  width: 74,
  depth: 22,
  height: 3,
}

export const PROPOSALS: Proposal[] = [
  {
    id: 'twin',
    number: '01',
    name: '双侧展示柜方案',
    shortName: '双侧展示柜',
    theme: '对称陈列，有序收藏',
    description: '左右双柜构成平衡的展示界面，洞洞板串联两人的工作日常。',
    focus:
      '左右两组高位展示柜形成稳定构图，中部上延洞洞板承接轻型挂件。常用耳机保留桌边挂点。',
    tags: ['对称双柜', '洞洞板收纳'],
    cabinets: [
      {
        id: 'cabinet-left',
        label: '左侧展示柜',
        x: 20,
        south: 0,
        bottom: 175,
        width: 60,
        depth: 30,
        height: 90,
        contents: 'large-figure',
        shelfHeights: [53],
      },
      {
        id: 'cabinet-right',
        label: '右侧展示柜',
        x: 200,
        south: 0,
        bottom: 175,
        width: 60,
        depth: 30,
        height: 90,
        contents: 'books-figures',
        shelfHeights: [43],
      },
    ],
    pegboards: [
      { ...lowerPegboard, label: '下部洞洞板' },
      {
        id: 'pegboard-upper',
        label: '中部上延洞洞板',
        x: 85,
        south: 0,
        bottom: 165,
        width: 110,
        depth: 1.6,
        height: 90,
      },
    ],
    shelves: [],
  },
  {
    id: 'shelf',
    number: '02',
    name: '薄层板展示方案',
    shortName: '薄层板展示',
    theme: '错落层次，轻盈展示',
    description: '错落柜体搭配一片浅木层板，让喜爱的小手办成为视觉焦点。',
    focus:
      '中部 85 × 14 cm 薄层板与上方展示柜错开，承托两件约 20–24 cm 高的小手办，形成上下层次。',
    tags: ['错落柜体', '中部浅层板'],
    cabinets: staggeredCabinets,
    pegboards: [lowerPegboard],
    shelves: [
      upperShelf,
      {
        id: 'shelf-center',
        label: '中部薄层板',
        x: 90,
        south: 0,
        bottom: 178,
        width: 85,
        depth: 14,
        height: 3,
      },
    ],
  },
  {
    id: 'frame',
    number: '03',
    name: '浅框装饰方案',
    shortName: '浅框装饰',
    theme: '收藏之间，留一处风景',
    description: '用细木框与柔和的绿色画面点缀留白，让办公背景多一份从容。',
    focus:
      '中部 60 × 30 cm 浅框装饰画突出墙面约 1.6 cm。画芯可替换，呈现个人喜爱的风景与收藏。',
    tags: ['错落柜体', '浅框装饰画'],
    cabinets: staggeredCabinets,
    pegboards: [lowerPegboard],
    shelves: [upperShelf],
    artwork: {
      id: 'art-center',
      label: '中部浅框装饰',
      x: 100,
      south: 0,
      bottom: 175,
      width: 60,
      depth: 1.6,
      height: 30,
    },
  },
]

export const getProposal = (id: string | undefined) =>
  PROPOSALS.find((proposal) => proposal.id === id)

export const northFixtures = (proposal: Proposal): BoxCm[] => [
  ...proposal.cabinets,
  ...proposal.pegboards,
  ...proposal.shelves,
  ...(proposal.artwork ? [proposal.artwork] : []),
]

export const MEASUREMENT_NOTES = [
  '房间净尺寸 280 × 220 cm，层高 280 cm；桌子 240 × 80 × 75 cm，左右各留 20 cm。',
  '门洞 70 cm、南侧短墙 10 cm 为暂定值；窗位按原户型，窗台 90 cm、窗高 120 cm 为绘图假设。',
  '柜体、层板、设备与电位为方案定位值；墙厚 8 cm、门高 210 cm、桌面板厚 4 cm 用于模型表达，须现场复尺与深化。',
  '椅子按收拢状态展示。取放车前推回椅子，并用实车核对挂架承重、脱钩、转向及出门的完整动作。',
] as const
