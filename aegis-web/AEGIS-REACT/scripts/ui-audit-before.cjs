const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')
const AxeBuilder = require('@axe-core/playwright').default

const BASE_URL = process.env.AEGIS_WEB_URL || 'http://127.0.0.1:5173'
const API_URL = process.env.AEGIS_API_URL || 'http://127.0.0.1:8000/api'
const OUTPUT = path.resolve(__dirname, '../../../docs/ui-audit/before')

const VIEWPORTS = [
  { name: '360', width: 360, height: 800 },
  { name: '768', width: 768, height: 1024 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1440', width: 1440, height: 900 },
]

const PUBLIC_ROUTES = [
  ['home', '/#/home'],
  ['login', '/#/login'],
  ['marketplace', '/#/productos'],
  ['foro', '/#/foro'],
  ['comunidades', '/#/comunidades'],
  ['tiendas', '/#/tiendas'],
  ['busqueda', '/#/busqueda'],
]

const AUTH_ROUTES = [
  ['ajustes', '/#/ajustes'],
  ['datos-personales', '/#/datos-personales'],
  ['mensajes', '/#/mensajes'],
  ['mis-productos', '/#/productos/mis-productos'],
  ['notificaciones', '/#/notificaciones'],
  ['perfil', '/#/perfil'],
]

async function login(page, email = 'carlos.demo@aegis.test') {
  const response = await page.request.post(`${API_URL}/auth/web/login`, {
    data: { email, password: 'password' },
  })
  if (!response.ok()) {
    throw new Error(`Login failed: ${response.status()} ${await response.text()}`)
  }
  const data = await response.json()
  await page.addInitScript((token) => {
    sessionStorage.setItem('aegis.web.token.v1', token)
  }, data.token)
  return data
}

async function auditPage(page, routeName) {
  const axe = await new AxeBuilder({ page })
    .exclude('iframe')
    .analyze()
  return {
    route: routeName,
    violations: axe.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map((node) => ({
        target: node.target,
        html: node.html,
        failureSummary: node.failureSummary,
      })),
    })),
  }
}

async function captureTheme(browser, theme, authenticated) {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      colorScheme: theme,
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()

    let loginData = null
    if (authenticated) {
      loginData = await login(page)
    }

    const routes = authenticated ? AUTH_ROUTES : PUBLIC_ROUTES
    for (const [name, route] of routes) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(300)
      await page.screenshot({
        path: path.join(
          OUTPUT,
          `${authenticated ? 'auth' : 'public'}-${theme}-${viewport.name}-${name}.png`,
        ),
        fullPage: true,
      })
      const metrics = await page.evaluate(() => ({
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        document: {
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          clientHeight: document.documentElement.clientHeight,
          scrollHeight: document.documentElement.scrollHeight,
        },
        horizontalOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
        title: document.title,
      }))
      fs.appendFileSync(
        path.join(OUTPUT, 'layout-metrics.jsonl'),
        JSON.stringify({
          theme,
          authenticated,
          viewport: viewport.name,
          route: name,
          metrics,
        }) + '\n',
      )
      const axeReport = await auditPage(page, name)
      fs.appendFileSync(
        path.join(OUTPUT, 'axe-results.jsonl'),
        JSON.stringify({
          theme,
          authenticated,
          viewport: viewport.name,
          ...axeReport,
        }) + '\n',
      )
    }
    await context.close()
  }
}

async function main() {
  fs.mkdirSync(OUTPUT, { recursive: true })
  for (const file of ['layout-metrics.jsonl', 'axe-results.jsonl']) {
    const target = path.join(OUTPUT, file)
    if (fs.existsSync(target)) fs.unlinkSync(target)
  }
  const browser = await chromium.launch({ headless: true })
  await captureTheme(browser, 'light', false)
  await captureTheme(browser, 'dark', false)
  await captureTheme(browser, 'light', true)
  await captureTheme(browser, 'dark', true)
  await browser.close()
  console.log(`Screenshots and reports saved to ${OUTPUT}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
