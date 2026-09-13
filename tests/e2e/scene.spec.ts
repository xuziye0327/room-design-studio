import { expect, test } from '@playwright/test'

for (const name of ['双侧展示柜方案', '薄层板展示方案', '浅框装饰方案']) {
  test(`${name} renders real WebGL 2 geometry`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/')
    await page.getByRole('button', { name: new RegExp(name) }).click()
    const canvas = page.locator('canvas[data-ready="true"]')
    await expect(canvas).toBeVisible()
    const result = await canvas.evaluate((element: HTMLCanvasElement) => {
      const gl = element.getContext('webgl2')!
      return {
        isWebGL2: gl instanceof WebGL2RenderingContext,
        error: gl.getError(),
        triangles: Number(element.dataset.triangles),
        scaleX: Number(element.dataset.cmPerPixelX),
        scaleY: Number(element.dataset.cmPerPixelY),
      }
    })
    expect(result.isWebGL2).toBe(true)
    expect(result.error).toBe(0)
    expect(result.triangles).toBeGreaterThan(10_000)
    expect(result.scaleX).toBeCloseTo(result.scaleY, 6)
    expect(errors).toEqual([])
  })
}

test('camera supports a full revolution, presets, zoom, drag and keyboard controls', async ({
  page,
}) => {
  await page.goto('/')
  const canvas = page.locator('canvas[data-ready="true"]')
  await expect(canvas).toBeVisible()
  const start = Number(await canvas.getAttribute('data-azimuth'))
  for (let i = 0; i < 24; i++)
    await page.getByRole('button', { name: '向右旋转 15 度' }).click()
  expect(Number(await canvas.getAttribute('data-azimuth'))).toBeCloseTo(
    start,
    3,
  )
  await page.getByRole('button', { name: '南墙', exact: true }).click()
  await expect(
    page.getByRole('button', { name: '南墙', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(canvas).toHaveAttribute('data-view', 'south')
  await page.getByRole('button', { name: '放大', exact: true }).click()
  await expect(canvas).toHaveAttribute('data-zoom', '1.20000')
  await page.getByRole('button', { name: '复位视角' }).click()
  await expect(canvas).toHaveAttribute('data-zoom', '1.00000')
  await canvas.focus()
  await canvas.press('ArrowLeft')
  expect(Number(await canvas.getAttribute('data-azimuth'))).toBeCloseTo(
    start - Math.PI / 12,
    3,
  )
  const rect = (await canvas.boundingBox())!
  await page.mouse.move(rect.x + rect.width * 0.6, rect.y + rect.height * 0.5)
  await page.mouse.down()
  await page.mouse.move(rect.x + rect.width * 0.4, rect.y + rect.height * 0.6, {
    steps: 12,
  })
  await page.mouse.up()
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-azimuth')))
    .not.toBeCloseTo(start - Math.PI / 12, 2)
})

test('orthographic scale remains equal in portrait and landscape viewports', async ({
  page,
}) => {
  await page.goto('/')
  const canvas = page.locator('canvas[data-ready="true"]')
  await expect(canvas).toBeVisible()
  for (const viewport of [
    { width: 375, height: 812 },
    { width: 812, height: 375 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport)
    await expect
      .poll(async () =>
        canvas.evaluate((element) => {
          const x = Number(element.dataset.cmPerPixelX)
          const y = Number(element.dataset.cmPerPixelY)
          return Math.abs(x - y)
        }),
      )
      .toBeLessThan(0.000001)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
})
