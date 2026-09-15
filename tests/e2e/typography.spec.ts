import { expect, test } from '@playwright/test'

test('local Maple Mono is loaded across pages and numeric labels', async ({
  page,
}) => {
  for (const route of [
    '/',
    '/#/proposal/twin',
    '/#/proposal/shelf',
    '/#/proposal/frame',
    '/room-layout.html',
  ]) {
    await page.goto(route)
    if (route === '/' || route === '/room-layout.html') {
      await expect(page.locator('.area-value > span')).toHaveText('m²')
    }
    const font = await page.evaluate(async () => {
      const faces = await document.fonts.load(
        '400 18px "Maple Mono NF CN"',
        '空间方案 280 × 220 cm 6.16 m² 书籍/手办',
      )
      await document.fonts.ready
      return {
        loaded:
          faces.length > 0 && faces.every((face) => face.status === 'loaded'),
        bodyFamily: getComputedStyle(document.body).fontFamily,
        bodySize: getComputedStyle(document.body).fontSize,
        numberFamily: getComputedStyle(document.querySelector('.mono')!)
          .fontFamily,
        resources: performance
          .getEntriesByType('resource')
          .map((entry) => entry.name),
      }
    })
    expect(font.loaded).toBe(true)
    expect(font.bodyFamily).toContain('Maple Mono NF CN')
    expect(font.numberFamily).toContain('Maple Mono NF CN')
    expect(font.bodySize).toBe('18px')
    expect(
      font.resources.some((url) =>
        url.endsWith('/fonts/MapleMono-NF-CN-Regular.woff2'),
      ),
    ).toBe(true)
    expect(font.resources.some((url) => url.endsWith('.ttf'))).toBe(false)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
})
