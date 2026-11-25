const fs = require('fs')
const path = require('path')
const assert = require('node:assert/strict')
const { chromium } = require('playwright')
const AxeBuilder = require('@axe-core/playwright').default

const base = process.env.AEGIS_WEB_URL || 'http://127.0.0.1:5173'
const output = path.resolve(__dirname, '../../../docs/ui-audit/after/ui-04')
const sizes = [[360, 800], [768, 1024], [1280, 800], [1440, 900]]
const user = {
  id: 987,
  nombre: 'Usuario de prueba',
  apellido: 'AEGIS',
  username: 'fixture',
  email: 'usuario@example.test',
  rol: 'admin',
  estado: 'activo',
  email_verified_at: '2026-01-01T10:00:00Z',
}
const seller = {
  id: 199,
  nombre: 'Vendedor de prueba',
  apellido: 'AEGIS',
  reputacion: 4.7,
  foto_perfil: '/aegis-logo.png',
}
const products = [
  {
    id: 501,
    titulo: 'GPU RTX de prueba',
    descripcion: 'Tarjeta gráfica usada en fixture visual.',
    precio: 1250000,
    categoria_id: 1,
    categoria: { id: 1, nombre: 'Computación' },
    estado_producto: 'usado',
    estado_publicacion: 'activo',
    usuario_id: seller.id,
    vendedor: seller,
    ciudad: 'Bogotá',
    ciudad_aprox: 'Bogotá',
    imagen_principal: '/aegis-logo.png',
    imagenes: [{ id: 31, imagen: '/aegis-logo.png' }],
    stock: true,
  },
  {
    id: 502,
    titulo: 'Teclado mecánico de prueba',
    descripcion: 'Teclado para fixture visual.',
    precio: 240000,
    categoria_id: 1,
    categoria: { id: 1, nombre: 'Computación' },
    estado_producto: 'nuevo',
    estado_publicacion: 'activo',
    usuario_id: seller.id,
    vendedor: seller,
    ciudad: 'Bogotá',
    ciudad_aprox: 'Bogotá',
    imagen_principal: '/aegis-logo.png',
    imagenes: [{ id: 32, imagen: '/aegis-logo.png' }],
    stock: true,
  },
]
const point = {
  id: 15,
  nombre: 'Punto de encuentro de prueba',
  direccion: 'Dirección de fixture',
  ciudad: 'Bogotá',
  horario: 'Lunes a viernes, 9:00 a. m. a 5:00 p. m.',
  servicios: ['Atención presencial'],
}
const store = {
  id: 21,
  nombre: 'Tienda de prueba',
  tipo: 'tienda',
  descripcion: 'Tienda para pruebas visuales.',
  estado_verificacion: 'pendiente',
}
const preferences = {
  apariencia: { tema: 'system', acento: 'indigo', densidad: 'normal', contenido_ancho: 'normal', tamano_texto: 'normal', contraste: 'estandar', movimiento: 'system' },
  feed: { inicio: 'para-ti', categorias_favoritas: [], sugerencias: true },
  marketplace: { ciudad_aprox: null, formato_regional: 'es-CO', moneda: 'COP' },
  mensajeria: { mensajes_desconocidos: 'solicitud', confirmaciones_lectura: false, notificar_mensajes: true },
  privacidad: { perfil_publico: true, mostrar_seguidores: true, mostrar_presencia: false, audiencia_publicacion: 'publica' },
  accesibilidad: { reducir_movimiento: 'system', subrayar_enlaces: false, lector_pantalla: false },
  idioma: 'es',
}
const conversation = {
  id: 123,
  tipo: 'directa',
  usuarios: [user, seller],
  producto: products[0],
}
const initialMessage = {
  id: 801,
  autor_id: seller.id,
  contenido: 'Mensaje de prueba UI-04',
  creado_en: '2026-01-15T12:00:00Z',
}
const captureResults = []
const accessibilityResults = []
const writes = []
const unexpectedRequests = []
const searches = []
const apiRequests = []

function headers() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  }
}

function fixtureFor(pathname, method, request, failures) {
  if (method === 'GET' && failures.has(pathname)) {
    return { status: 500, body: { message: 'Error simulado UI-04' } }
  }
  if (method === 'GET') {
    if (pathname === '/auth/web/me') return { body: { usuario: user } }
    if (pathname === '/notificaciones/no-leidas') return { body: { data: [], meta: { no_leidas: 0 } } }
    if (pathname === '/notificaciones') return { body: { data: [], meta: { no_leidas: 0 } } }
    if (pathname === '/categorias') return { body: { data: [{ id: 1, nombre: 'Computación' }] } }
    if (pathname === '/productos') {
      searches.push(request.url())
      return { body: { data: products, meta: { current_page: 1, last_page: 1 } } }
    }
    if (pathname === '/productos/comparar') {
      return { body: { data: { productos: products, campos: ['categoria'], advertencia: '' } } }
    }
    if (pathname === `/productos/${products[0].id}`) return { body: { data: products[0] } }
    if (pathname === `/productos/${products[0].id}/preguntas`) return { body: { data: [], meta: { current_page: 1, last_page: 1 } } }
    if (pathname === '/mensajes') return { body: { data: [conversation], meta: { current_page: 1 } } }
    if (pathname === `/mensajes/${conversation.id}/mensajes`) {
      return { body: { data: [initialMessage], meta: { next_before_id: null, has_more: false } } }
    }
    if (pathname === '/tiendas') return { body: { data: [store] } }
    if (pathname === `/tiendas/${store.id}`) return { body: { data: store } }
    if (pathname === '/puntos-fisicos/directorio') return { body: { data: [point] } }
    if (pathname === '/preferencias') return { body: { version: 1, data: preferences } }
    if (pathname === '/auth/web/sessions') {
      return { body: { data: [{ id: 12, name: 'aegis-web', current: true, created_at: '2026-01-01T10:00:00Z', last_used_at: '2026-01-15T10:00:00Z' }] } }
    }
    if (pathname === '/auth/web/security-notices') return { body: { data: [] } }
    if (pathname === '/admin/dashboard') {
      return { body: { data: { cuentas_total: 12, cuentas_nuevas: 2, posts_total: 8, posts_nuevos: 1, productos_total: 5, productos_nuevos: 1, comunidades_total: 2, reportes_pendientes: 0, puntos_total: 1, operaciones_total: 3 }, desde: '2026-01-01T00:00:00Z', hasta: '2026-01-31T23:59:59Z' } }
    }
    if (pathname === '/admin/users') return { body: { data: [user] } }
    if (pathname === '/admin/auditoria') return { body: { data: [] } }
    if (pathname === '/admin/configuracion') return { body: { data: [] } }
    if (pathname === '/moderacion/reportes' || pathname === '/moderacion/apelaciones' || pathname === '/moderacion/antifraude') {
      return { body: { data: [] } }
    }
    if (pathname === '/productos/mis') return { body: { data: [products[0]], meta: { current_page: 1, last_page: 1 } } }
    if (pathname === '/datos-vendedor') {
      return { body: { data: { total: 1, activos: 1, vistas_validas: 0, contactos: 0, ofertas: 0, reservas: 0, vendidos: 0 } } }
    }
    return null
  }

  if (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE') {
    writes.push({
      method,
      pathname,
      body: request.postData(),
      contentType: request.headers()['content-type'] || '',
    })
    if (method === 'PATCH' && pathname === `/mensajes/${conversation.id}/lectura`) return { status: 200, body: {} }
    if (method === 'POST' && pathname === '/productos') return { status: 201, body: { data: { ...products[0], id: 503 } } }
    if (method === 'POST' && pathname === '/guardados') return { status: 201, body: { data: { id: 901 } } }
    if (method === 'POST' && pathname === `/mensajes/${conversation.id}/mensajes`) {
      const body = request.postData() || ''
      const content = /name="contenido"\r\n\r\n([^\r]+)/.exec(body)?.[1] || ''
      return { status: 201, body: { data: { id: 802, autor_id: user.id, contenido: content } } }
    }
    if (method === 'POST' && pathname === '/tiendas') return { status: 201, body: { data: { ...store, id: 22, nombre: 'Nueva tienda UI-04' } } }
    if (method === 'POST' && pathname === '/encuentros') return { status: 201, body: { data: { id: 601, estado: 'pendiente' } } }
    if (method === 'PUT' && pathname === '/preferencias') return { status: 200, body: { version: 2, data: preferences } }
    return null
  }
  return null
}

async function installApiFixtures(context, { role = 'admin', failures = new Set() } = {}) {
  const fixtureUser = { ...user, rol: role }
  await context.addInitScript(() => sessionStorage.setItem('aegis.web.token.v1', 'ui-04-fixture'))
  await context.route('**/api/**', async (route) => {
    const request = route.request()
    const method = request.method()
    const url = new URL(request.url())
    const pathname = url.pathname.replace(/^\/api/, '')
    apiRequests.push(`${method} ${pathname}`)
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: headers() })
    if (method === 'GET' && pathname === '/auth/web/me') {
      return route.fulfill({ status: 200, headers: headers(), json: { usuario: fixtureUser } })
    }
    const fixture = fixtureFor(pathname, method, request, failures)
    if (!fixture) {
      unexpectedRequests.push(`${method} ${pathname}`)
      return route.fulfill({ status: 404, headers: headers(), json: { message: 'Fixture no disponible UI-04' } })
    }
    return route.fulfill({
      status: fixture.status || 200,
      headers: headers(),
      json: fixture.body,
    })
  })
}

async function open(page, route, ready) {
  await page.goto(`${base}/#${route}`, { waitUntil: 'domcontentloaded' })
  try {
    await page.locator(ready).first().waitFor({ timeout: 15000 })
  } catch (error) {
    console.error(`No se cargó ${route}. URL: ${page.url()}. Contenido: ${(await page.locator('body').innerText()).slice(0, 1000)}`)
    throw error
  }
  await page.waitForTimeout(250)
}

async function capture(page, name, theme, width) {
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  const result = { name, theme, width, ...layout, horizontalOverflow: layout.scrollWidth > layout.clientWidth }
  captureResults.push(result)
  await page.screenshot({
    path: path.join(output, `${name}-${theme}-${width}.png`),
    fullPage: true,
    animations: 'disabled',
  })
  return result
}

async function runInteractions(browser) {
  const context = await browser.newContext({
    viewport: { width: 360, height: 800 },
    colorScheme: 'light',
    reducedMotion: 'reduce',
  })
  await installApiFixtures(context, { role: 'usuario' })
  const page = await context.newPage()
  try {
    await open(page, '/productos', '.product-card')
    const search = page.locator('#filtro-busqueda')
    await search.fill('RTX')
    await page.waitForFunction(() => window.location.hash.includes('buscar=RTX'))
    await page.locator('.product-card').first().waitFor()
    assert.ok(searches.some((url) => url.includes('busqueda=RTX')))

    const firstCompare = page.locator('.product-card').nth(0).locator('.product-compare-check')
    await firstCompare.focus()
    await page.keyboard.press('Space')
    assert.equal(await firstCompare.getAttribute('aria-pressed'), 'true')
    await page.keyboard.press('Space')
    assert.equal(await firstCompare.getAttribute('aria-pressed'), 'false')
    await page.locator('.product-card').nth(0).locator('.product-compare-check').click()
    await page.locator('.product-card').nth(1).locator('.product-compare-check').click()
    await page.locator('.products-compare-bar button').click()
    await page.locator('.products-comparison').waitFor()

    await page.locator('.product-card-open').first().click()
    await page.waitForURL(/#\/productos\/detalle/)
    await page.locator('.detail-title').waitFor()
    await page.getByRole('button', { name: 'Guardar', exact: true }).click()
    await page.getByRole('status').filter({ hasText: 'Producto guardado' }).waitFor()
    assert.ok(writes.some((write) => write.pathname === '/guardados'))

    await open(page, '/productos/crear', '.publish-page')
    const upload = page.locator('.media-dropzone input[type="file"]')
    await upload.setInputFiles({
      name: 'fixture.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lX8AAAAASUVORK5CYII=', 'base64'),
    })
    await page.getByLabel('Título del anuncio').fill('Producto publicado UI-04')
    await page.getByLabel('Categoría').selectOption('1')
    await page.getByLabel('Estado').selectOption('nuevo')
    await page.getByLabel('Precio Referencial').fill('850000')
    await page.getByLabel('Descripción').fill('Anuncio de prueba con imagen fixture.')
    await page.locator('.publish-actions button[type="submit"]').click()
    await page.waitForURL(/#\/productos(?:\?|$)/)
    const productWrite = writes.find((write) => write.method === 'POST' && write.pathname === '/productos')
    assert.ok(productWrite)
    assert.match(productWrite.contentType, /^multipart\/form-data; boundary=/)
    assert.match(productWrite.body, /Producto publicado UI-04/)

    await open(page, '/mensajes', '.msg-pagina--conversation .msg-chat')
    await page.getByRole('button', { name: 'Volver a conversaciones' }).click()
    await page.locator('.msg-pagina--list .msg-lista').waitFor()
    await page.locator('.msg-item').first().click()
    await page.locator('.msg-pagina--conversation .msg-chat').waitFor()
    await page.getByRole('textbox', { name: 'Escribe un mensaje' }).fill('Mensaje enviado UI-04')
    await page.getByRole('button', { name: 'Enviar', exact: true }).click()
    await page.getByText('Mensaje enviado UI-04').waitFor()
    assert.ok(writes.some((write) => write.method === 'POST' && write.pathname === `/mensajes/${conversation.id}/mensajes`))
    await page.screenshot({ path: path.join(output, 'mensajes-conversacion-light-360.png'), fullPage: true, animations: 'disabled' })

    await open(page, '/tiendas', '.tienda-card')
    await page.getByRole('button', { name: 'Crear tienda' }).click()
    await page.locator('.tienda-form input').first().fill('Nueva tienda UI-04')
    await page.locator('.tienda-form button[type="submit"]').click()
    assert.ok(writes.some((write) => write.method === 'POST' && write.pathname === '/tiendas'))

    await open(page, '/puntos-fisicos', '.pv-lugar')
    await page.locator('.pv-ciudad-filtro input').fill('Bogotá')
    await page.getByText('Punto de encuentro de prueba').first().waitFor()
    assert.equal(await page.getByText('Mapa no disponible').count(), 1)

    await open(page, '/configurar-encuentro?id=501', '.enc-pagina')
    await page.getByRole('heading', { name: 'GPU RTX de prueba' }).waitFor()
    await page.getByLabel('Hora').selectOption('18:00')
    await page.getByRole('button', { name: 'Confirmar Encuentro' }).click()
    await page.getByRole('heading', { name: '¡Encuentro confirmado!' }).waitFor()
    const meetingWrite = writes.find((write) => write.method === 'POST' && write.pathname === '/encuentros')
    assert.ok(meetingWrite)
    assert.equal(JSON.parse(meetingWrite.body).hora_encuentro, '18:00')
    await page.getByText('06:00 PM').waitFor()

    await open(page, '/ajustes', '.ajustes-panel')
    await page.getByLabel('Tema').selectOption('dark')
    await page.getByRole('button', { name: 'Guardar cambios' }).click()
    assert.ok(writes.some((write) => write.method === 'PUT' && write.pathname === '/preferencias'))

    console.log('Interacciones UI-04: búsqueda, comparación, detalle, favoritos, publicación, chat, tiendas, puntos, encuentro y preferencias OK')
  } finally {
    await context.close()
  }
}

async function main() {
  fs.mkdirSync(output, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  try {
    if (process.env.UI04_INTERACTIONS_ONLY === '1') {
      await runInteractions(browser)
      return
    }

    const pages = [
      ['marketplace', '/productos', '.product-card'],
      ['detalle-producto', '/productos/detalle?id=501', '.detail-title'],
      ['publicar-producto', '/productos/crear', '.publish-page'],
      ['mis-productos', '/productos/mis-productos', '.table-page'],
      ['mensajes', '/mensajes', '.msg-pagina--conversation .msg-chat'],
      ['tiendas', '/tiendas', '.tienda-card'],
      ['puntos-fisicos', '/puntos-fisicos', '.pv-lugar'],
      ['configurar-encuentro', '/configurar-encuentro?id=501', '.enc-pagina'],
      ['ajustes', '/ajustes', '.ajustes-panel'],
      ['seguridad', '/seguridad', '.account-security-page'],
      ['administracion', '/admin', '.admin-page'],
      ['admin-usuarios', '/admin/usuarios', '.table-page'],
      ['admin-reportes', '/admin/reportes', '.table-page'],
      ['admin-auditoria', '/admin/auditoria', '.table-page'],
      ['admin-configuracion', '/admin/configuracion', '.table-page'],
      ['vendedor-no-disponible', '/vendedor?id=199', '[role="alert"]'],
    ]

    for (const theme of ['light', 'dark']) {
      for (const [width, height] of sizes) {
        const context = await browser.newContext({
          viewport: { width, height },
          colorScheme: theme,
          reducedMotion: 'reduce',
        })
        await installApiFixtures(context)
        const page = await context.newPage()
        page.on('pageerror', (error) => unexpectedRequests.push(`PAGE ${error.message}`))
        try {
          for (const [name, route, ready] of pages) {
            await open(page, route, ready)
            const result = await capture(page, name, theme, width)
            if (result.horizontalOverflow) {
              unexpectedRequests.push(`OVERFLOW ${name} ${theme} ${width}: ${result.scrollWidth}/${result.clientWidth}`)
            }
            if (['marketplace', 'detalle-producto', 'mensajes', 'tiendas', 'puntos-fisicos', 'ajustes', 'seguridad'].includes(name) && [360, 1280].includes(width)) {
              const scan = await new AxeBuilder({ page })
                .include('main')
                .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
                .analyze()
              accessibilityResults.push({
                name,
                theme,
                width,
                violations: scan.violations.map(({ id, impact, nodes }) => ({
                  id,
                  impact,
                  targets: nodes.map((node) => node.target),
                })),
                incomplete: scan.incomplete.map(({ id, nodes }) => ({ id, count: nodes.length })),
              })
            }
          }
        } finally {
          await context.close()
        }
      }
    }

    const errorContext = await browser.newContext({
      viewport: { width: 360, height: 800 },
      colorScheme: 'light',
      reducedMotion: 'reduce',
    })
    await installApiFixtures(errorContext, { role: 'usuario', failures: new Set(['/productos']) })
    try {
      const page = await errorContext.newPage()
      await open(page, '/productos', '[role="alert"]')
      await page.screenshot({ path: path.join(output, 'marketplace-error-light-360.png'), fullPage: true, animations: 'disabled' })
      assert.equal(await page.getByRole('alert').count(), 1)
    } finally {
      await errorContext.close()
    }

    const restrictedContext = await browser.newContext({
      viewport: { width: 360, height: 800 },
      colorScheme: 'light',
      reducedMotion: 'reduce',
    })
    await installApiFixtures(restrictedContext, { role: 'usuario' })
    try {
      const page = await restrictedContext.newPage()
      await open(page, '/admin', '[role="alert"]')
      assert.equal(await page.getByText('Esta sección requiere permisos de administración.').count(), 1)
    } finally {
      await restrictedContext.close()
    }

    await runInteractions(browser)
  } finally {
    await browser.close()
    if (process.env.UI04_INTERACTIONS_ONLY !== '1') {
      fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(captureResults, null, 2))
      fs.writeFileSync(path.join(output, 'accessibility.json'), JSON.stringify(accessibilityResults, null, 2))
    }
    fs.writeFileSync(path.join(output, 'api-fixture-results.json'), JSON.stringify({
      writes,
      searches,
      apiRequests,
      unexpectedRequests,
    }, null, 2))
  }

  if (unexpectedRequests.length) {
    throw new Error(`Peticiones inesperadas o desbordamientos: ${JSON.stringify(unexpectedRequests)}`)
  }
  assert.ok(writes.some((write) => write.pathname === '/productos'))
  assert.ok(writes.some((write) => write.pathname === '/guardados'))
  assert.ok(writes.some((write) => write.pathname === `/mensajes/${conversation.id}/mensajes`))
  console.log(`Capturas UI-04: ${captureResults.length}; reportes axe: ${accessibilityResults.length}; ${output}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
