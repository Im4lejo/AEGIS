const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

const base = process.env.AEGIS_WEB_URL || 'http://127.0.0.1:5173'
const output = path.resolve(__dirname, '../../../docs/ui-audit/after/ui-02')
const sizes = [[360, 800], [768, 1024], [1280, 800], [1440, 900]]
const preferences = {
  apariencia: { tema: 'system', acento: 'indigo', densidad: 'normal', contenido_ancho: 'normal', tamano_texto: 'normal', contraste: 'estandar', movimiento: 'system' },
  feed: { inicio: 'para-ti', categorias_favoritas: [], sugerencias: true },
  marketplace: { ciudad_aprox: null, formato_regional: 'es-CO', moneda: 'COP' },
  mensajeria: { mensajes_desconocidos: 'solicitud', confirmaciones_lectura: false, notificar_mensajes: true },
  privacidad: { perfil_publico: true, mostrar_seguidores: true, mostrar_presencia: false, audiencia_publicacion: 'publica' },
  accesibilidad: { reducir_movimiento: 'system', subrayar_enlaces: false, lector_pantalla: false },
  idioma: 'es',
}
const results = []

async function open(page, route, ready) {
  await page.goto(`${base}/#${route}`, { waitUntil: 'domcontentloaded' })
  await page.locator(ready).first().waitFor()
  await page.waitForTimeout(800)
}

async function capture(page, name, fullPage = true) {
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  results.push({ name, ...layout })
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage })
  if (layout.scrollWidth > layout.clientWidth) {
    throw new Error(`Desbordamiento en ${name}: ${JSON.stringify(layout)}`)
  }
}

async function fixtureContext(browser, width, height, { role = 'usuario', populated = false, inbox = false } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' })
  await context.addInitScript(() => sessionStorage.setItem('aegis.web.token.v1', 'ui-02-fixture'))
  await context.route('**/api/**', async (route) => {
    const request = route.request()
    const apiPath = new URL(request.url()).pathname
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET, PATCH, OPTIONS' }
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (inbox && request.method() === 'PATCH' && apiPath === '/api/mensajes/123/lectura') {
      return route.fulfill({ status: 200, headers, contentType: 'application/json', body: '{}' })
    }
    if (request.method() !== 'GET') throw new Error(`Peticion fixture no permitida: ${request.method()} ${apiPath}`)
    const responses = {
      '/api/auth/web/me': { usuario: { id: 987, nombre: 'Usuario de prueba', rol: role, estado: 'activo' } },
      '/api/inicio': { data: populated ? [{ id: 987, titulo: 'Producto de prueba UI-02', precio: 120000, categoria: { nombre: 'Tecnología' } }] : [] },
      '/api/historias': { data: [] },
      '/api/mensajes': { data: inbox ? [{ id: 123, tipo: 'directa', usuarios: [{ id: 123, nombre: 'Contacto de prueba' }] }] : [] },
      '/api/mensajes/123/mensajes': { data: [{ id: 1, autor_id: 123, contenido: 'Mensaje de prueba UI-02' }], meta: { next_before_id: null, has_more: false } },
      '/api/notificaciones': { data: [], meta: { no_leidas: 0 } },
      '/api/preferencias': { version: 1, data: preferences },
      '/api/mi-actividad': { data: [] },
      '/api/datos/privacidad': { data: [] },
      '/api/perfil/987': { data: { perfil: { id: 987, nombre: 'Usuario de prueba', username: 'fixture' }, publicaciones: [], productos: [] } },
      '/api/perfil/987/tabs/publicaciones': { data: [], meta: { current_page: 1, last_page: 1 } },
      '/api/admin/dashboard': { data: {}, desde: '2026-01-01T00:00:00Z', hasta: '2026-01-31T23:59:59Z' },
    }
    if (!(apiPath in responses)) {
      results.push({ unexpectedFixtureRequest: apiPath })
      return route.abort('blockedbyclient')
    }
    return route.fulfill({ status: 200, headers, contentType: 'application/json', body: JSON.stringify(responses[apiPath]) })
  })
  return context
}

async function main() {
  fs.mkdirSync(output, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  try {
    for (const [width, height] of sizes) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', colorScheme: 'light' })
      const page = await context.newPage()
      try {
        for (const [name, route] of [['home', '/home'], ['marketplace', '/productos'], ['foro', '/foro'], ['comunidades', '/comunidades']]) {
          await open(page, route, 'main')
          if (name !== 'marketplace') {
            const loading = page.locator(name === 'home' ? '.home-product-skeleton' : name === 'foro' ? 'text=Cargando publicaciones...' : 'text=Cargando comunidades...').first()
            try {
              await loading.waitFor({ state: 'hidden', timeout: 15000 })
            } catch {
              results.push({ loadingTimeout: name, width })
            }
          }
          await capture(page, `real-${name}-${width}`)
        }
        await open(page, '/mensajes', 'main')
        if (!page.url().includes('/login')) throw new Error('La ruta privada no redirigió al invitado')
        await capture(page, `real-privada-redireccion-${width}`)
      } finally {
        await context.close()
      }

      for (const populated of [false, true]) {
        const fixture = await fixtureContext(browser, width, height, { populated })
        const page = await fixture.newPage()
        try {
          await open(page, '/home', populated ? '.ui-product-card' : '.api-state--empty')
          await capture(page, `fixture-home-${populated ? 'datos' : 'vacio'}-${width}`)
          if (!populated) {
            for (const [name, route, ready] of [
              ['mensajes', '/mensajes', '.msg-pagina'],
              ['ajustes', '/ajustes', '.ajustes-panel'],
              ['datos-personales', '/datos-personales', 'main'],
              ['perfil', '/perfil', '.layout-perfil main'],
            ]) {
              await open(page, route, ready)
              await capture(page, `fixture-${name}-${width}`)
            }
            if (await page.getByRole('link', { name: 'Administración' }).count()) throw new Error('Administración visible para usuario')
            await open(page, '/admin', '[role="alert"]')
            if (!await page.getByText('Esta sección requiere permisos de administración.').count()) throw new Error('Falta restricción para usuario no administrador')
            if (!await page.locator('.workspace-shell').count()) throw new Error('Falta navegación en acceso restringido')
            await capture(page, `fixture-admin-restringido-${width}`)
          }
        } finally {
          await fixture.close()
        }
      }

      const adminContext = await fixtureContext(browser, width, height, { role: 'admin' })
      try {
        const page = await adminContext.newPage()
        await open(page, '/admin', 'h1')
        if (!await page.locator('.workspace-nav a[aria-current="page"]').count()) throw new Error('Falta navegación de administrador')
        await capture(page, `fixture-admin-${width}`)
        if (width === 360) {
          await page.getByRole('button', { name: 'Abrir menú' }).click()
          if (!await page.getByRole('dialog').getByRole('link', { name: 'Administración' }).count()) throw new Error('Falta administración en menú móvil')
          await capture(page, 'fixture-admin-menu-360', false)
        }
      } finally {
        await adminContext.close()
      }
      const inboxContext = await fixtureContext(browser, width, height, { inbox: true })
      try {
        const page = await inboxContext.newPage()
        await open(page, '/mensajes', '.msg-fila')
        if (!await page.getByText('Mensaje de prueba UI-02').isVisible()) throw new Error('Mensaje de prueba no visible')
        const chat = await page.locator('.msg-chat').boundingBox()
        const message = await page.locator('.msg-fila').boundingBox()
        const composer = await page.locator('.msg-composer').boundingBox()
        if (!chat || !message || !composer || message.y < chat.y || message.y + message.height > chat.y + chat.height || composer.y + composer.height > chat.y + chat.height + 1) {
          throw new Error(`Conversación recortada a ${width}px`)
        }
        for (const control of await page.locator('.msg-composer button, .msg-composer input[type="text"]').all()) {
          if ((await control.boundingBox()).height < 44) throw new Error(`Control de mensajes demasiado pequeño a ${width}px`)
        }
        await capture(page, `fixture-mensajes-datos-${width}`)
      } finally {
        await inboxContext.close()
      }
    }

    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width: 360, height: 800 }, reducedMotion: 'reduce', colorScheme: theme })
      const page = await context.newPage()
      try {
        await open(page, '/home', 'main')
        const trigger = page.getByRole('button', { name: 'Abrir menú' })
        await trigger.focus()
        await page.keyboard.press('Enter')
        const dialog = page.getByRole('dialog', { name: 'Menú principal' })
        await dialog.waitFor()
        if (await page.evaluate(() => document.body.style.overflow) !== 'hidden') throw new Error('Falta bloqueo de scroll')
        await capture(page, `real-menu-abierto-${theme}-360`, false)
        await page.keyboard.press('Shift+Tab')
        if (!await dialog.locator('.header-mobile-logout').evaluate((element) => element === document.activeElement)) throw new Error('Shift+Tab no volvió al último elemento')
        await page.keyboard.press('Tab')
        if (!await dialog.locator('.header-mobile-close').evaluate((element) => element === document.activeElement)) throw new Error('Tab no volvió al primer elemento')
        await page.keyboard.press('Escape')
        await dialog.waitFor({ state: 'hidden' })
        await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Abrir menú')
        if (await dialog.count() || !await trigger.evaluate((element) => document.activeElement === element)) throw new Error('Escape no restauró el foco')
        if (await page.evaluate(() => document.body.style.overflow)) throw new Error('Scroll no restaurado')
        await capture(page, `real-menu-cerrado-${theme}-360`)
        await open(page, '/foro', '.foro-feed')
        const forumTrigger = page.getByRole('button', { name: 'Abrir menú del foro' })
        await forumTrigger.click()
        await page.getByRole('dialog', { name: 'Filtros del foro' }).waitFor()
        await capture(page, `real-filtros-foro-${theme}-360`, false)
        await page.keyboard.press('Escape')
        await page.getByRole('dialog', { name: 'Filtros del foro' }).waitFor({ state: 'hidden' })
        await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Abrir menú del foro')
        if (!await forumTrigger.evaluate((element) => document.activeElement === element)) throw new Error('Foco del foro no restaurado')
      } finally {
        await context.close()
      }
    }

  } finally {
    await browser.close()
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2))
  }
  const failures = results.filter((result) => result.unexpectedFixtureRequest || result.loadingTimeout)
  if (failures.length) throw new Error(`Incidencias en capturas: ${JSON.stringify(failures)}`)
  console.log(`Capturas y mediciones: ${results.length}; ${output}`)
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
