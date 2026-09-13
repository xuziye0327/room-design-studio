import { expect, test } from '@playwright/test'

test('dimension labels follow the model, hide edge-on axes and keep the scale bar accurate', async ({
  page,
}) => {
  await page.goto('/#/proposal/twin')
  const canvas = page.getByTestId('viewer-viewport').locator('canvas')
  await expect(canvas).toHaveAttribute('data-ready', 'true')
  await page.getByRole('button', { name: '尺寸标注', exact: true }).click()
  await expect(
    page.getByRole('button', { name: '尺寸标注', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  const width = page.locator('[data-annotation-id="room-width"]')
  await expect(width).toBeVisible()
  await expect(width).toHaveText('宽 280 cm')
  await expect(page.locator('[data-annotation-id="desk-size"]')).toContainText(
    '240 × 80 cm',
  )
  const position = await width.getAttribute('style')
  await page.getByRole('button', { name: '向右旋转 15 度' }).click()
  await expect.poll(() => width.getAttribute('style')).not.toBe(position)
  await page.getByRole('button', { name: '俯视', exact: true }).click()
  await expect(page.locator('[data-annotation-id="room-height"]')).toBeHidden()
  await expect(page.locator('[data-annotation-id="room-depth"]')).toBeVisible()
  const scale = await canvas.evaluate((element) =>
    Number(element.dataset.cmPerPixelX),
  )
  const barWidth = (await page
    .locator('.view-scale > span')
    .first()
    .boundingBox())!.width
  expect(barWidth * scale).toBeCloseTo(50, 1)
  await page.getByRole('button', { name: '放大', exact: true }).click()
  const zoomedScale = await canvas.evaluate((element) =>
    Number(element.dataset.cmPerPixelX),
  )
  const zoomedBar = (await page
    .locator('.view-scale > span')
    .first()
    .boundingBox())!.width
  expect(zoomedBar * zoomedScale).toBeCloseTo(50, 1)
})

test('electrical mode presents right-side networking and returns to the furniture view', async ({
  page,
}) => {
  await page.goto('/#/proposal/shelf')
  const canvas = page.getByTestId('viewer-viewport').locator('canvas')
  await expect(canvas).toHaveAttribute('data-ready', 'true')
  const scale = await canvas.getAttribute('data-cm-per-pixel-x')
  await page.getByRole('button', { name: '电位定位', exact: true }).click()
  await expect(canvas).toHaveAttribute('data-presentation', 'electrical')
  await expect(
    page.getByRole('heading', { name: '电位与网络', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: '北墙', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-annotation-id="W1"]')).toBeVisible()
  await expect(page.locator('[data-annotation-id="SW1"]')).toBeVisible()
  await expect(page.locator('[data-annotation-id="C1"]')).toBeVisible()
  await expect(page.locator('.feature-metrics')).toContainText('14')
  await expect(page.getByText('连线为连接示意', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '家具布局', exact: true }).click()
  await expect(canvas).toHaveAttribute('data-presentation', 'furniture')
  await expect(canvas).toHaveAttribute('data-cm-per-pixel-x', scale!)
  await expect(page.locator('[data-annotation-id="W1"]')).toBeHidden()
  await expect(
    page.getByRole('heading', { name: '北墙设计', exact: true }),
  ).toBeVisible()
})

test('source dimensions and all 19 electrical locations are available in the specification tables', async ({
  page,
}) => {
  await page.goto('/#/proposal/frame')
  await page.locator('.specifications > summary').click()
  const tables = page.locator('.table-scroll table')
  await expect(tables).toHaveCount(2)
  await expect(tables.first()).toContainText('60 × 1.6 × 30')
  await expect(tables.first()).toContainText('240 × 待定 × 80')
  await expect(tables.nth(1).locator('tbody tr')).toHaveCount(19)
  const row = tables
    .nth(1)
    .getByRole('row')
    .filter({ has: page.getByRole('rowheader', { name: 'W1', exact: true }) })
  expect(await row.locator('th,td').allTextContents()).toEqual([
    'W1',
    '右侧单口网络',
    '170',
    '0',
    '55',
  ])
  await expect(page.locator('.implementation-notes')).toContainText(
    '门洞 70 cm',
  )
  await expect(page.locator('.implementation-notes')).toContainText('承重')
  await page.setViewportSize({ width: 375, height: 812 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})

test('mobile electrical callouts remain readable and camera controls stay clear of the dimensions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/#/proposal/twin')
  await expect(page.locator('canvas[data-ready="true"]')).toBeVisible()
  await page.getByRole('button', { name: '电位定位', exact: true }).click()
  await expect(
    page.getByRole('button', { name: '北墙', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-annotation-id="SW1"]')).toBeVisible()
  const boxes = await page
    .locator('.world-label:visible')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect()
        return {
          id: (element as HTMLElement).dataset.annotationId,
          left: box.left,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
        }
      }),
    )
  for (let a = 0; a < boxes.length; a++)
    for (let b = a + 1; b < boxes.length; b++) {
      const overlapX =
        Math.min(boxes[a].right, boxes[b].right) -
        Math.max(boxes[a].left, boxes[b].left)
      const overlapY =
        Math.min(boxes[a].bottom, boxes[b].bottom) -
        Math.max(boxes[a].top, boxes[b].top)
      expect(
        overlapX > 1 && overlapY > 1,
        `${boxes[a].id} overlaps ${boxes[b].id}`,
      ).toBe(false)
    }
  await page.getByRole('button', { name: '家具布局', exact: true }).click()
  await page.getByRole('button', { name: '尺寸标注', exact: true }).click()
  const depth = page.locator('[data-annotation-id="room-depth"]')
  await expect(depth).toBeVisible()
  const label = (await depth.boundingBox())!
  const controls = (await page.locator('.zoom-controls').boundingBox())!
  expect(label.y + label.height).toBeLessThan(controls.y)
})
