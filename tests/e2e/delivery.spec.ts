import { expect, test } from '@playwright/test'

declare global {
  interface Window {
    __roomLifecycle: {
      buffers: number
      textures: number
      activeContextLosses: number
    }
  }
}

test('automatic orbit runs, pauses and stops for manual interaction', async ({
  page,
}) => {
  await page.goto('/#/proposal/twin')
  const canvas = page.getByTestId('viewer-viewport').locator('canvas')
  await expect(canvas).toHaveAttribute('data-ready', 'true')
  const before = Number(await canvas.getAttribute('data-azimuth'))
  await page.getByRole('button', { name: '自动环绕', exact: true }).click()
  await expect(
    page.getByRole('button', { name: '暂停环绕', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect
    .poll(async () =>
      Math.abs(Number(await canvas.getAttribute('data-azimuth')) - before),
    )
    .toBeGreaterThan(0.01)
  await page.getByRole('button', { name: '暂停环绕', exact: true }).click()
  const samples = await canvas.evaluate(
    (element) =>
      new Promise<number[]>((resolve) => {
        const angles: number[] = []
        const sample = () => {
          angles.push(Number(element.dataset.azimuth))
          if (angles.length === 60) resolve(angles.slice(-10))
          else requestAnimationFrame(sample)
        }
        requestAnimationFrame(sample)
      }),
  )
  expect(Math.max(...samples) - Math.min(...samples)).toBeLessThan(0.0001)
  await page.getByRole('button', { name: '自动环绕', exact: true }).click()
  await page.getByRole('button', { name: '放大', exact: true }).focus()
  await expect(
    page.getByRole('button', { name: '自动环绕', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false')
})

test('repeated gallery navigation releases GPU resources and keeps the active canvas healthy', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const stats = { buffers: 0, textures: 0, activeContextLosses: 0 }
    window.__roomLifecycle = stats
    const prototype = WebGL2RenderingContext.prototype
    const deleteBuffer = prototype.deleteBuffer
    prototype.deleteBuffer = function (buffer) {
      stats.buffers++
      deleteBuffer.call(this, buffer)
    }
    const deleteTexture = prototype.deleteTexture
    prototype.deleteTexture = function (texture) {
      stats.textures++
      deleteTexture.call(this, texture)
    }
    document.addEventListener(
      'webglcontextlost',
      (event) => {
        if (
          event.target instanceof HTMLCanvasElement &&
          event.target.isConnected
        )
          stats.activeContextLosses++
      },
      true,
    )
  })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/')
  for (const name of [
    '双侧展示柜方案',
    '薄层板展示方案',
    '浅框装饰方案',
    '双侧展示柜方案',
    '薄层板展示方案',
    '浅框装饰方案',
  ]) {
    await expect(
      page.locator('.proposal-thumbnail canvas[data-ready="true"]'),
    ).toHaveCount(3)
    await page.getByRole('link', { name: `${name}，进入 3D 查看` }).click()
    await expect(
      page.getByTestId('viewer-viewport').locator('canvas[data-ready="true"]'),
    ).toBeVisible()
    await page.getByRole('link', { name: '返回方案总览' }).click()
  }
  await expect(
    page.locator('.proposal-thumbnail canvas[data-ready="true"]'),
  ).toHaveCount(3)
  await expect
    .poll(() => page.evaluate(() => window.__roomLifecycle.buffers))
    .toBeGreaterThan(100)
  const stats = await page.evaluate(() => window.__roomLifecycle)
  expect(stats.textures).toBeGreaterThan(5)
  expect(stats.activeContextLosses).toBe(0)
  expect(errors).toEqual([])
})

test('delivery assets are local and available, including the source drawings', async ({
  page,
  request,
  baseURL,
}) => {
  const external: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== new URL(baseURL!).origin)
      external.push(request.url())
  })
  await page.goto('/')
  await expect(
    page.locator('.proposal-thumbnail canvas[data-ready="true"]'),
  ).toHaveCount(3)
  expect(external).toEqual([])
  for (const path of [
    '/room-layout.html',
    '/delivery/方案总览.md',
    '/delivery/双侧展示柜方案.md',
    '/delivery/薄层板展示方案.md',
    '/delivery/浅框装饰方案.md',
    '/delivery/html/电位与右侧网络.html',
  ]) {
    const response = await request.get(path)
    expect(response.ok(), path).toBe(true)
  }
  await page.getByRole('link', { name: '双侧展示柜方案，进入 3D 查看' }).click()
  const canvas = page.getByTestId('viewer-viewport').locator('canvas')
  await expect(canvas).toHaveAttribute('data-ready', 'true')
  const pixelRatios = await canvas.evaluate((element: HTMLCanvasElement) => ({
    x: element.width / element.clientWidth,
    y: element.height / element.clientHeight,
    expected: Math.min(devicePixelRatio, 2),
  }))
  expect(pixelRatios.x).toBeCloseTo(pixelRatios.expected, 2)
  expect(pixelRatios.y).toBeCloseTo(pixelRatios.expected, 2)
})

test('touch users can open a proposal, rotate vertically and horizontally, and pinch to zoom', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Touch gestures run in the mobile browser project')
  await page.goto('/')
  await page.getByRole('link', { name: '薄层板展示方案，进入 3D 查看' }).tap()
  const canvas = page.getByTestId('viewer-viewport').locator('canvas')
  await expect(canvas).toHaveAttribute('data-ready', 'true')
  await canvas.scrollIntoViewIfNeeded()
  await expect(
    page.getByText('单指旋转 · 双指缩放与平移', { exact: true }),
  ).toBeVisible()
  const box = (await canvas.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  const initial = {
    azimuth: Number(await canvas.getAttribute('data-azimuth')),
    polar: Number(await canvas.getAttribute('data-polar')),
  }
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y, id: 1 }],
  })
  for (let step = 1; step <= 8; step++)
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x + step * 6, y: y + step * 5, id: 1 }],
    })
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  })
  await expect
    .poll(async () =>
      Math.abs(
        Number(await canvas.getAttribute('data-azimuth')) - initial.azimuth,
      ),
    )
    .toBeGreaterThan(0.1)
  await expect
    .poll(async () =>
      Math.abs(Number(await canvas.getAttribute('data-polar')) - initial.polar),
    )
    .toBeGreaterThan(0.1)
  await page.getByRole('button', { name: '复位视角', exact: true }).tap()
  await canvas.scrollIntoViewIfNeeded()
  const pinchBox = (await canvas.boundingBox())!
  const px = pinchBox.x + pinchBox.width / 2
  const py = pinchBox.y + pinchBox.height / 2
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: px - 24, y: py, id: 1 },
      { x: px + 24, y: py, id: 2 },
    ],
  })
  for (let step = 1; step <= 8; step++)
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x: px - 24 - step * 4, y: py, id: 1 },
        { x: px + 24 + step * 4, y: py, id: 2 },
      ],
    })
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  })
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-zoom')))
    .toBeGreaterThan(1.2)
  await cdp.detach()
})
