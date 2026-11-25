const fs = require('fs')
const path = require('path')
const assert = require('assert/strict')
const { chromium } = require('playwright')
const AxeBuilder = require('@axe-core/playwright').default

const phase = process.env.UI03_PHASE || 'after'
if (!['before', 'after'].includes(phase)) throw new Error('UI03_PHASE debe ser before o after')
const base = process.env.AEGIS_WEB_URL || 'http://127.0.0.1:5173'
const output = path.resolve(__dirname, `../../../docs/ui-audit/${phase}/ui-03`)
const sizes = [[360, 800], [768, 1024], [1280, 800], [1440, 900]]
const user = { id: 987, nombre: 'Usuario de prueba', username: 'fixture', rol: 'usuario', estado: 'activo' }
const comment = { id: 12, comentario: 'Comentario de prueba', usuario: { id: 998, nombre: 'Contacto de prueba' } }
const post = {
  id: 123, usuario_id: 987, usuario: user, titulo: 'Publicación de prueba UI-03',
  contenido: 'Contenido social de prueba para revisar el diseño.', fecha_publicacion: '2026-01-15T12:00:00Z',
  imagenes: [{ imagen: '/aegis-logo.png' }], comentarios: [comment],
  referencias: [{ id: 1, tipo: 'producto', producto: { id: 15, titulo: 'Producto de prueba', precio: 120000, estado_publicacion: 'activo' } }],
}
const community = {
  id: 45, nombre: 'Comunidad de prueba', descripcion: 'Espacio de prueba para compartir experiencias.',
  normas: 'Respeto y convivencia.', miembros_count: 7, visibilidad: 'publica',
  membership: { estado: 'activo', rol: 'owner' },
}
const event = { id: 8, titulo: 'Evento de prueba', descripcion: 'Encuentro de prueba', lugar: 'En línea', fecha_inicio: '2026-12-01T12:00:00Z' }

async function checkInteractions(page) {
  const writes = []
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const apiPath = new URL(request.url()).pathname
    if (request.method() === 'GET' || request.method() === 'OPTIONS') return route.fallback()
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS' }
    writes.push({ method: request.method(), path: apiPath, body: request.postData(), contentType: request.headers()['content-type'] })
    if (request.method() === 'POST' && apiPath === '/api/foro') {
      return route.fulfill({ status: 201, headers, json: { data: { ...post, id: 124, titulo: 'Título nuevo', contenido: 'Título nuevo\nDetalles', imagenes: [], comentarios: [] } } })
    }
    if (request.method() === 'POST' && apiPath === '/api/foro/123/comentarios') {
      const body = request.postDataJSON()
      if (body.comentario === 'error de prueba')
        return route.fulfill({ status: 422, headers, json: { message: 'Comentario rechazado en prueba' } })
      return route.fulfill({ status: 201, headers, json: { data: { id: 13, comentario: body.comentario, usuario: user } } })
    }
    if (request.method() === 'DELETE' && apiPath === '/api/comunidades/45/membresia')
      return route.fulfill({ status: 200, headers, json: { message: 'Salida simulada' } })
    if (request.method() === 'POST' && apiPath === '/api/eventos/8/participacion')
      return route.fulfill({ status: 200, headers, json: { message: 'Participación simulada' } })
    throw new Error(`Escritura inesperada bloqueada: ${request.method()} ${apiPath}`)
  })

  await page.goto(`${base}/#/home`)
  const story = page.getByRole('button', { name: 'Abrir historia de fixture' })
  await story.waitFor()
  await story.focus()
  await page.keyboard.press('Enter')
  const storyDialog = page.getByRole('dialog', { name: 'Historia' })
  await storyDialog.waitFor()
  await page.screenshot({ path: path.join(output, 'historia-abierta-light-360.png') })
  await page.keyboard.press('Tab')
  assert.equal(await storyDialog.evaluate((el) => el.contains(document.activeElement)), true)
  await page.keyboard.press('Escape')
  await storyDialog.waitFor({ state: 'hidden' })
  assert.equal(await story.evaluate((el) => document.activeElement === el), true)

  await page.goto(`${base}/#/foro`)
  await page.locator('.foro-post').waitFor()
  const image = page.getByRole('button', { name: 'Ampliar imagen de Publicación de prueba UI-03' })
  await image.focus()
  await page.keyboard.press('Enter')
  const imageDialog = page.getByRole('dialog', { name: 'Imagen ampliada' })
  await imageDialog.waitFor()
  await page.screenshot({ path: path.join(output, 'foro-imagen-abierta-light-360.png') })
  await page.keyboard.press('Escape')
  await imageDialog.waitFor({ state: 'hidden' })
  assert.equal(await image.evaluate((el) => document.activeElement === el), true)

  const input = page.locator('input[type=file]')
  await input.setInputFiles({ name: 'prueba.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lX8AAAAASUVORK5CYII=', 'base64') })
  await page.getByAltText('Vista previa').waitFor()
  await page.screenshot({ path: path.join(output, 'foro-compositor-abierto-light-360.png') })
  await page.getByRole('textbox', { name: 'Título de la publicación' }).fill('Título nuevo')
  await page.getByRole('textbox', { name: 'Detalles de la publicación' }).fill('Detalles')
  await page.getByRole('button', { name: 'Publicar', exact: true }).click()
  await page.getByRole('button', { name: 'Título nuevo' }).waitFor()
  const upload = writes.find((item) => item.path === '/api/foro')
  assert.match(upload.contentType, /^multipart\/form-data; boundary=/)
  assert.match(upload.body, /filename="prueba.png"/)
  assert.match(upload.body, /Detalles/)

  const original = page.locator('.foro-post').filter({ hasText: 'Publicación de prueba UI-03' })
  await original.getByRole('button', { name: '1 Comentarios' }).click()
  await original.getByRole('textbox', { name: 'Escribe un comentario' }).fill('Comentario nuevo')
  await original.getByRole('button', { name: 'Responder', exact: true }).click()
  await original.getByText('Comentario nuevo').waitFor()
  await original.getByRole('textbox', { name: 'Escribe un comentario' }).fill('error de prueba')
  await original.getByRole('button', { name: 'Responder', exact: true }).click()
  await page.getByRole('status').filter({ hasText: 'Comentario rechazado en prueba' }).waitFor()
  await page.screenshot({ path: path.join(output, 'foro-error-light-360.png') })
  page.once('dialog', (dialog) => dialog.dismiss())
  await original.getByRole('button', { name: 'Editar', exact: true }).click()
  assert.match(page.url(), /#\/foro$/)

  await page.goto(`${base}/#/comunidades`)
  await page.getByRole('button', { name: 'Ver comunidad' }).click()
  await page.getByRole('heading', { name: 'Evento de prueba' }).waitFor()
  await page.getByRole('button', { name: 'Asistiré' }).click()
  await page.getByRole('status').filter({ hasText: 'Tu participación fue registrada' }).waitFor()
  await page.getByRole('button', { name: 'Salir', exact: true }).click()
  await page.getByRole('status').filter({ hasText: 'Salida simulada' }).waitFor()
  assert.ok(writes.some((item) => item.path === '/api/eventos/8/participacion'))
  assert.ok(writes.some((item) => item.path === '/api/comunidades/45/membresia'))

  await page.goto(`${base}/#/perfil`)
  const profileImage = page.locator('.perfil-post-image')
  await profileImage.waitFor()
  await profileImage.focus()
  await page.keyboard.press('Enter')
  const profileDialog = page.getByRole('dialog', { name: 'Vista de imagen' })
  await profileDialog.waitFor()
  await page.keyboard.press('Escape')
  await profileDialog.waitFor({ state: 'hidden' })
  assert.equal(await profileImage.evaluate((el) => document.activeElement === el), true)
  await page.getByRole('button', { name: '1 Comentarios' }).click()
  await page.getByRole('textbox', { name: 'Escribe un comentario' }).fill('Comentario desde perfil')
  await page.getByRole('button', { name: 'Comentar', exact: true }).click()
  await page.getByText('Comentario desde perfil').waitFor()

  await page.route('**/api/foro?**', (route) => route.fulfill({
    status: 200,
    headers: { 'access-control-allow-origin': '*' },
    json: { data: [], meta: { next_cursor: null } },
  }))
  await page.goto(`${base}/#/foro`)
  await page.getByText('Todavía no hay publicaciones en el foro.').waitFor()
  await page.screenshot({ path: path.join(output, 'foro-vacio-light-360.png'), fullPage: true })

  await page.route('**/api/comunidades?**', (route) => route.fulfill({
    status: 500,
    headers: { 'access-control-allow-origin': '*' },
    json: { message: 'Error simulado' },
  }))
  await page.goto(`${base}/#/comunidades`)
  await page.getByRole('alert').waitFor()
  assert.equal(await page.getByText('Sin comunidades').count(), 0)
  await page.screenshot({ path: path.join(output, 'comunidades-error-light-360.png'), fullPage: true })
  console.log('Interacciones UI-03: teclado, visores, archivo, publicación, comentarios, error, membresía y evento OK')
}

async function main() {
  fs.mkdirSync(output, { recursive: true })
  const results = []
  const accessibility = []
  const browser = await chromium.launch({ headless: true })
  try {
    for (const theme of ['light', 'dark']) {
      for (const [width, height] of sizes) {
        const context = await browser.newContext({ viewport: { width, height }, colorScheme: theme, reducedMotion: 'reduce' })
        await context.addInitScript(() => {
          sessionStorage.setItem('aegis.web.token.v1', 'ui-03-fixture')
          localStorage.setItem('camposPerfilAegis', JSON.stringify([
            { id: 'nombre', valor: 'Usuario de prueba' },
            { id: 'contacto', valor: 'Sin contacto' },
            { id: 'documento', valor: 'Sin documento' },
            { id: 'nacimiento', valor: 'Sin fecha' },
            { id: 'residencia', valor: 'Sin ubicación' },
          ]))
        })
        await context.route('**/api/**', async (route) => {
          const request = route.request()
          const apiPath = new URL(request.url()).pathname
          const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET, OPTIONS' }
          if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
          const responses = {
            '/api/auth/web/me': { usuario: user },
            '/api/notificaciones': { data: [], meta: { no_leidas: 0 } },
            '/api/inicio': { data: [{ id: 15, titulo: 'Producto de prueba', precio: 120000, categoria: { nombre: 'Tecnología' } }] },
            '/api/historias': { data: [{ id: 4, usuario: user, tipo_media: 'imagen', media_url: '/aegis-logo.png', texto: 'Historia de prueba' }] },
            '/api/historias/4': { data: { id: 4, tipo_media: 'imagen', media_url: '/aegis-logo.png', texto: 'Historia de prueba' } },
            '/api/foro': { data: [post], meta: { next_cursor: null } },
            '/api/foro/123': { data: post },
            '/api/video/capabilities': { vod: { available: false }, live: { available: false } },
            '/api/comunidades': { data: [community] },
            '/api/comunidades/45': { data: community },
            '/api/comunidades/45/eventos': { data: [event] },
            '/api/perfil/987': { data: { perfil: user, publicaciones: [post], productos: [{ id: 15, titulo: 'Producto de prueba', precio: 120000, estado_producto: 'usado', imagen_principal: '/aegis-logo.png' }] } },
            '/api/perfil/987/tabs/publicaciones': { data: [post], meta: { current_page: 1, last_page: 1 } },
            '/api/perfil/me': { data: { perfil: user } },
          }
          if (request.method() !== 'GET' || !(apiPath in responses)) {
            results.push({ unexpected: `${request.method()} ${apiPath}` })
            return route.abort('blockedbyclient')
          }
          return route.fulfill({ status: 200, headers, contentType: 'application/json', body: JSON.stringify(responses[apiPath]) })
        })
        const page = await context.newPage()
        try {
          const pages = [
            ['inicio', '/home', '.ui-product-card'],
            ['foro', '/foro', '.foro-post'],
            ['publicacion', '/publicacion?id=123', '.pub-post'],
            ['comunidades', '/comunidades', '.comunidad-card'],
            ['perfil', '/perfil', '.perfil-card'],
            ['editar-perfil', '/perfil/editar', '.editar-page'],
            ['vendedor-no-disponible', '/vendedor?id=987', '[role="alert"]'],
          ]
          for (const [name, url, selector] of pages) {
            await page.goto(`${base}/#${url}`, { waitUntil: 'domcontentloaded' })
            await page.locator(selector).first().waitFor()
            await page.waitForTimeout(300)
            const capture = async (label) => {
              const layout = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }))
              results.push({ name: label, theme, width, ...layout })
              await page.screenshot({ path: path.join(output, `${label}-${theme}-${width}.png`), fullPage: true })
            }
            await capture(name)
            if (phase === 'after' && [360, 1440].includes(width) && ['inicio', 'foro', 'publicacion', 'comunidades', 'perfil', 'editar-perfil'].includes(name)) {
              const scan = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
              accessibility.push({
                name, theme, width,
                violations: scan.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map((node) => node.target) })),
                incomplete: scan.incomplete.map(({ id, nodes }) => ({ id, count: nodes.length })),
              })
            }
            if (name === 'comunidades') {
              await page.getByRole('button', { name: 'Ver comunidad' }).click()
              await page.getByRole('heading', { name: 'Evento de prueba' }).waitFor()
              await capture('comunidad-detalle')
            }
          }
          if (phase === 'after' && theme === 'light' && width === 360) await checkInteractions(page)
        } finally {
          await context.close()
        }
      }
    }
  } finally {
    await browser.close()
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2))
    if (phase === 'after') fs.writeFileSync(path.join(output, 'accessibility.json'), JSON.stringify(accessibility, null, 2))
  }
  const unexpected = results.filter((result) => result.unexpected)
  if (unexpected.length) throw new Error(`Peticiones no simuladas: ${JSON.stringify(unexpected)}`)
  console.log(`${results.length} capturas ${phase}: ${output}`)
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
