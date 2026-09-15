import { expect, test } from '@playwright/test'

const proposals = ['双侧展示柜方案', '薄层板展示方案', '浅框装饰方案']

test('header links to the GitHub repository on gallery and proposal pages', async ({
  page,
}) => {
  for (const route of ['/', '/#/proposal/twin']) {
    await page.goto(route)
    const navigation = page.getByRole('navigation', { name: '主导航' })
    const github = navigation.getByRole('link', { name: /GitHub 项目仓库/ })
    await expect(github).toBeVisible()
    await expect(github).toBeInViewport()
    await expect(github).toHaveAttribute(
      'href',
      'https://github.com/xuziye0327/room-design-studio',
    )
    await expect(github).toHaveAttribute('target', '_blank')
    await expect(github).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(navigation.getByRole('link').last()).toHaveText('GitHub')
  }
})

test('home shows three live thumbnails at the same camera scale', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page).toHaveTitle('空间方案 · 双人办公空间')
  await expect(page.locator('.brand-subtitle')).toHaveText('双人办公空间')
  await expect(page.locator('.gallery-intro .eyebrow')).toHaveText(
    '双人办公空间',
  )
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    '6.16㎡ 双人办公空间：双侧展示柜、薄层板展示、浅框装饰三套设计方案，厘米级等比例建模，支持 360° 交互查看。',
  )
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '一间房，三种可能。',
  )
  await expect(
    page.locator('.proposal-thumbnail canvas[data-ready="true"]'),
  ).toHaveCount(3)
  const scales = await page
    .locator('.proposal-thumbnail canvas')
    .evaluateAll((canvases) =>
      canvases.map((canvas) => ({
        scale: Number((canvas as HTMLElement).dataset.cmPerPixelX),
        angle: (canvas as HTMLElement).dataset.azimuth,
      })),
    )
  for (const scale of scales) {
    expect(scale.scale).toBeCloseTo(scales[0].scale, 4)
    expect(scale.angle).toBe(scales[0].angle)
  }
  for (const name of proposals)
    await expect(
      page.getByRole('link', { name: `${name}，进入 3D 查看` }),
    ).toBeVisible()
})

test('thumbnail navigation, proposal switching, history and focus restoration work', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('link', { name: '薄层板展示方案，进入 3D 查看' }).click()
  await expect(page).toHaveURL(/#\/proposal\/shelf$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '薄层板展示方案',
  )
  await expect(page.locator('canvas[data-ready="true"]')).toHaveCount(1)
  await page
    .getByRole('navigation', { name: '切换设计方案' })
    .getByRole('link', { name: /浅框装饰$/ })
    .click()
  await expect(page).toHaveTitle('浅框装饰方案 · 空间方案')
  await page.goBack()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '薄层板展示方案',
  )
  await page.goForward()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '浅框装饰方案',
  )
  await page.getByRole('link', { name: '返回方案总览' }).click()
  await expect(page).toHaveTitle('空间方案 · 双人办公空间')
  await expect(
    page.getByRole('link', { name: '浅框装饰方案，进入 3D 查看' }),
  ).toBeFocused()
  await expect(
    page.locator('.proposal-thumbnail canvas[data-ready="true"]'),
  ).toHaveCount(3)
})

test('direct proposal URLs survive a refresh', async ({ page }) => {
  await page.goto('/#/proposal/frame')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '浅框装饰方案',
  )
  await page.reload()
  await expect(page.locator('canvas[data-ready="true"]')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '浅框装饰方案',
  )
  await expect(
    page.getByRole('link', { name: /阅读完整方案/ }),
  ).toHaveAttribute('href', '/delivery/浅框装饰方案.md')
})

test('fullscreen and reduced-motion controls are usable', async ({ page }) => {
  await page.goto('/#/proposal/twin')
  await expect(page.locator('canvas[data-ready="true"]')).toBeVisible()
  await page.getByRole('button', { name: '全屏查看' }).click()
  await expect(page.getByRole('button', { name: '退出全屏' })).toBeVisible()
  await page.getByRole('button', { name: '退出全屏' }).click()
  await expect(page.getByRole('button', { name: '全屏查看' })).toBeVisible()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.getByRole('button', { name: '自动环绕' })).toBeDisabled()
  await page.getByRole('button', { name: '向右旋转 15 度' }).click()
  await expect(page.locator('canvas')).toHaveAttribute('data-ready', 'true')
})

test('small-screen gallery and viewer have no horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await expect(
    page.locator('.proposal-thumbnail canvas[data-ready="true"]'),
  ).toHaveCount(3)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.getByRole('link', { name: '浅框装饰方案，进入 3D 查看' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '浅框装饰方案',
  )
  await expect(
    page.getByTestId('viewer-viewport').locator('canvas[data-ready="true"]'),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await expect(
    page.getByRole('button', { name: '南墙', exact: true }),
  ).toBeVisible()
})
