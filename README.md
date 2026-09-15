# 空间方案 · 3D 设计预览

双人办公空间的交互式方案展示，使用 Vite、React 19、TypeScript、Material UI、Emotion、Three.js 与 React Three Fiber 实现。

首页以同机位、同尺度的三张真实 3D 缩略图展示 **双侧展示柜、薄层板展示、浅框装饰** 三套方案。点击卡片进入 360° 查看页，查看北墙、共用南墙、尺寸及电位布局。页面视觉沿用 `public/room-layout.html` 的浅色渐变、玻璃面板与蓝色重点。

## 运行

使用 Bun 管理依赖和执行项目脚本，CLI 工具通过 `bunx` 调用；需安装 Node.js 22.22.1 或更新版本。

```bash
bun install
bun run dev
```

打开终端显示的 Vite 地址，默认是 `http://localhost:5173`。浏览器使用 WebGL 2 渲染。

```bash
bun run build    # TypeScript 检查与生产构建，输出 dist/
bun run preview  # 预览生产构建，默认 http://localhost:4173
```

`dist/` 可部署到静态站点服务。应用采用 Hash 导航，以下链接可以直接打开和刷新：

- `/#/proposal/twin`：双侧展示柜方案
- `/#/proposal/shelf`：薄层板展示方案
- `/#/proposal/frame`：浅框装饰方案

## 查看与操作

| 操作           | 使用方式                                                                   |
| -------------- | -------------------------------------------------------------------------- |
| 360° 查看      | 鼠标拖动，或触屏单指拖动                                                   |
| 缩放           | 滚轮、双指捏合、加减按钮                                                   |
| 平移           | 鼠标右键拖动，或双指平移                                                   |
| 键盘控制       | 聚焦三维画布后，方向键旋转，`+` / `-` 缩放，`Home` 复位                    |
| 相机预设       | 整体、北墙、南墙、俯视                                                     |
| 自动环绕       | 点击开始，再次点击暂停；视图内手动操作、焦点转入查看器控件或页面隐藏时暂停 |
| 全屏           | 点击右上角全屏按钮，通过退出按钮或 `Esc` 返回                              |
| 墙体剖切       | 随视角隐藏近侧墙体与相应家具，显露对面布局；关闭后查看完整围合             |
| 尺寸标注       | 显示房间宽、深、高与桌面尺寸；与视线平行的尺寸轴随视角隐藏                 |
| 电位定位       | 显示半透明桌面、办公插位、右侧网络面板、交换机及其他定位点                 |
| 尺寸与实施说明 | 展开查看北墙构件表、南墙与设备说明、完整电位表及现场核对清单               |

系统启用“减少动态效果”时，页面保留手动相机控制。返回首页会恢复到对应方案卡片的键盘焦点。

## 尺度与设计依据

### 厘米坐标

**1 个场景单位 = 1 cm**。原点是室内西北角地面：

| 方案坐标 | Three.js 坐标 | 方向             |
| -------- | ------------- | ---------------- |
| x        | X             | 向东             |
| H        | Y             | 向上，距完成地面 |
| y        | Z             | 向南             |

- 房间净尺寸为 **280 × 220 cm**，层高 **280 cm**，面积 **6.16 m²**。
- 双人长桌为 **240 × 80 × 75 cm**，北墙居中，两侧各留 **20 cm**。
- 四台 32 英寸显示器按 16:9 有效显示区域建模，竖屏位于中部；两台主机位于各自工位右手侧。
- 公路车参考长 **175 cm**、高 **100 cm**，轮胎离地 **15 cm**，最大墙面突出量暂按 **45 cm**。
- 办公区含 **14 个五孔插位**，右侧网络面板 W1 位于 **x170 / H55 cm**。含灯位、开关及通用插座在内的 **19 个电位**均有定位表。

所有模型保持统一世界尺度。正交相机根据画布实际尺寸更新视锥，横、纵方向的厘米/像素比例一致；旋转、缩放、全屏与设备像素密度变化只改变观察方式。50 cm 标尺对应相机视平面；实体尺寸通过三维标线与尺寸表读取。

### 设计文件

设计说明与效果图保存在私有资源目录 `assets/delivery/`，仅供本地查阅，不随 Vite 构建发布。

- [方案总览](assets/delivery/方案总览.md)
- [双侧展示柜方案](assets/delivery/双侧展示柜方案.md)
- [薄层板展示方案](assets/delivery/薄层板展示方案.md)
- [浅框装饰方案](assets/delivery/浅框装饰方案.md)
- [房间户型](public/room-layout.html)

房间与桌子是设计基准，柜体、设备、电位及门窗包含示意尺寸。门洞 70 cm、南侧短墙 10 cm 为暂定值；窗台 90 cm、窗高 120 cm 为绘图假设。模型中的墙厚 8 cm、门高 210 cm、桌面板厚 4 cm、洞洞板厚 1.6 cm 用于视觉表达。

**交付层级为布局与视觉设计、电位定位示意。** 加工和施工前，需完成现场复尺、结构与电气深化、实椅净空以及实车脱钩、平移、转向和出门验证。页面中的静态收拢姿态用于空间展示，承重及取放动作需实物验证。

## 验证

```bash
bun run test:unit    # 尺寸、真实几何包围盒、坐标、投影与图层状态
bun run test:e2e     # 桌面及移动端 Chromium 浏览器验证
bun run lint
bun run format:check
bun run build
```

浏览器测试使用 Playwright 管理的 Chromium（`browserName: 'chromium'`），包含移动端触屏模拟。首次运行或升级 Playwright 后，执行 `bunx playwright install chromium` 安装匹配的浏览器版本。测试会启动本地 Vite 服务，也可复用已经运行的开发服务。

验证范围包括：

- 三份方案缩略入口、切换、直接链接、前进后退与焦点恢复。
- WebGL 2 实际绘制、完整环绕、相机预设、鼠标与键盘控制。
- 原生触摸事件的横纵旋转、双指缩放，以及减少动态效果设置。
- 不同画幅与像素密度下的等比例投影、标尺和全屏操作。
- 尺寸与电位图层、19 个电位坐标、右侧单口网络及材料恢复。
- 多次进入与返回时的 GPU 资源释放、画布状态和运行错误。

验证生产构建时，先启动 `bun run preview`，再执行：

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173 bun run test:e2e
```

测试报告保存在 `.temp/playwright-report/`，失败诊断保存在 `.temp/test-results/`。规划、截图和构建缓存也集中在 `.temp/`。

## 代码结构

```text
src/
  main.tsx                   React 入口、ThemeProvider 与 CssBaseline
  theme.ts                   MUI 配色、字体与基础控件样式
  data/proposals.ts           房间、设备、三份方案与电位的厘米数据
  scene/
    room.ts                  房间与场景图层
    furnishings.ts           办公设备、柜体与陈列物
    bicycle.ts               公路车几何
    camera.ts                按画幅拟合的正交相机
    projection.ts            视角与投影比例计算
    annotations.ts           尺寸线与相机投影标注
    electrical.ts            电位、网络与连接示意
    geometry.ts              几何构建与资源释放
    textures.ts              本地程序化材质
  components/
    ProposalGallery.tsx      首页缩略方案
    ProposalView.tsx          方案查看页
    RoomCanvas.tsx            WebGL 2 画布及相机生命周期
    SceneViewer.tsx           交互控件与标注层
    ProposalSpecifications.tsx 尺寸与实施说明
assets/delivery/              私有原设计文件与效果图（不参与构建发布）
```

页面使用 MUI 卡片、按钮、分组切换、提示、折叠面板与表格；主题由 `src/theme.ts` 统一定义，布局与三维标注保留独立 CSS，并通过 MUI CSS 变量使用主题色。图标来自 Material Icons，媒体偏好由 MUI `useMediaQuery` 读取。

场景的几何、木纹、屏幕画面与装饰画由项目代码生成。缩略图按需绘制，交互场景在变化时重绘；场景退出时释放几何、材质、纹理与控制器。

代码由 Oxfmt 格式化，Oxlint 检查；Husky 的提交钩子通过 lint-staged 格式化本次暂存文件。

## 字体

应用与户型页使用 Maple Mono NF CN Regular。本地 WOFF2 子集按源码字符生成，并保留完整可打印 ASCII，支持动态数字与尺寸。原始 TTF 位于 `assets/fonts/`，网页字体及 SIL OFL 许可位于 `public/fonts/`。

新增文案后，用原始 TTF 重新生成子集（需安装 [uv](https://docs.astral.sh/uv/)；常规构建直接使用已提交的 WOFF2）：

```bash
uv run scripts/subset-font.py assets/fonts/MapleMono-NF-CN-Regular.ttf
```

脚本会检查生成子集的字符覆盖，并报告原字体缺少的字符；字体通过 `font-display: swap` 加载，子集未覆盖的运行时字符使用系统字体。
