const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')
const AxeBuilder = require('@axe-core/playwright').default

const baseUrl = process.env.AEGIS_WEB_URL || 'http://127.0.0.1:5173'
const output = path.resolve(__dirname, '../../../docs/ui-audit/after/ui-01')
const routes = [
  ['styleguide', '/#/styleguide'],
  ['home', '/#/home'],
  ['marketplace', '/#/productos'],
  ['login', '/#/login'],
]
const viewports = [
  [360, 800],
  [768, 1024],
  [1280, 800],
  [1440, 900],
]

async function main() {
  fs.mkdirSync(output, { recursive: true })
  const results = []
  const browser = await chromium.launch({ headless: true })
  try {
    for (const theme of ['light', 'dark']) {
      for (const [width, height] of viewports) {
        const context = await browser.newContext({
          viewport: { width, height },
          colorScheme: theme,
          reducedMotion: 'reduce',
        })
        try {
          const page = await context.newPage()
          for (const [name, route] of routes) {
            await page.goto(`${baseUrl}${route}`, {
              waitUntil: 'domcontentloaded',
            })
            if (name === 'styleguide')
              await page.locator('.styleguide h1').waitFor()
            else await page.locator('main').first().waitFor()
            await page.waitForTimeout(1000)
            await page.screenshot({
              path: path.join(output, `${name}-${theme}-${width}.png`),
              fullPage: true,
            })
            const layout = await page.evaluate(() => ({
              clientWidth: document.documentElement.clientWidth,
              scrollWidth: document.documentElement.scrollWidth,
            }))
            const axe = await new AxeBuilder({ page }).analyze()
            results.push({
              route: name,
              theme,
              width,
              layout,
              violations: axe.violations.map(({ id, impact, nodes }) => ({
                id,
                impact,
                count: nodes.length,
                targets: nodes.map(({ target }) => target),
              })),
            })
          }
        } finally {
          await context.close()
        }
      }
    }
  } finally {
    await browser.close()
  }
  fs.writeFileSync(
    path.join(output, 'results.json'),
    JSON.stringify(results, null, 2),
  )
  console.log(`Captured ${results.length} views in ${output}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
