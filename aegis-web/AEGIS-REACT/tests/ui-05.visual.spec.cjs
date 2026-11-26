const fs = require('node:fs')
const path = require('node:path')
const { test, expect } = require('playwright/test')
const AxeBuilder = require('@axe-core/playwright').default

const output = path.resolve(
  __dirname,
  process.env.UI_AUDIT_OUTPUT || '../../../docs/ui-audit/after/ui-05',
)
const sizes = [
  [360, 800],
  [768, 1024],
  [1280, 800],
  [1440, 900],
]
const themes = ['light', 'dark']
const user = {
  id: 987,
  nombre: 'Usuario de prueba',
  apellido: 'AEGIS',
  username: 'fixture',
  email: 'usuario@example.test',
  rol: 'usuario',
  estado: 'activo',
  foto_perfil_url: '/aegis-logo.png',
}
const admin = { ...user, id: 988, username: 'admin-fixture', rol: 'admin' }
const seller = {
  id: 199,
  nombre: 'Vendedor de prueba',
  apellido: 'AEGIS',
  username: 'vendedor-fixture',
  reputacion: 4.7,
  foto_perfil: '/aegis-logo.png',
}
const sellerAccount = {
  ...seller,
  email: 'vendedor@example.test',
  rol: 'usuario',
  estado: 'activo',
  foto_perfil_url: seller.foto_perfil,
}
const product = {
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
}
const secondProduct = {
  ...product,
  id: 502,
  titulo: 'Teclado mecánico de prueba',
  precio: 240000,
  estado_producto: 'nuevo',
}
const post = {
  id: 701,
  usuario: seller,
  fecha_publicacion: '2026-01-15T12:00:00Z',
  titulo: 'Publicación de prueba UI-05',
  contenido: 'Contenido aislado para auditoría visual.',
  imagenes: [],
  comentarios: [],
  referencias: [],
}
const story = {
  id: 301,
  tipo_media: 'image',
  media_url: '/aegis-logo.png',
  texto: 'Historia de prueba UI-05',
  usuario: seller,
}
const community = {
  id: 21,
  nombre: 'Comunidad de prueba',
  descripcion: 'Comunidad aislada de auditoría.',
  visibilidad: 'publica',
  miembros_count: 7,
  membership: { estado: 'activo', rol: 'moderador' },
}
const conversation = {
  id: 123,
  tipo: 'directa',
  usuarios: [user, seller],
  producto: product,
}
const initialMessage = {
  id: 801,
  autor_id: user.id,
  contenido: 'Mensaje de prueba UI-05',
  creado_en: '2026-01-15T12:00:00Z',
}
const store = {
  id: 22,
  nombre: 'Tienda de prueba',
  tipo: 'tienda',
  descripcion: 'Tienda aislada para auditoría.',
  estado_verificacion: 'pendiente',
}
const point = {
  id: 15,
  nombre: 'Punto de encuentro de prueba',
  direccion: 'Dirección de fixture',
  ciudad: 'Bogotá',
  horario: 'Lunes a viernes, 9:00 a. m. a 5:00 p. m.',
  servicios: ['Atención presencial'],
}
const preferences = {
  apariencia: {
    tema: 'system',
    acento: 'indigo',
    densidad: 'normal',
    contenido_ancho: 'normal',
    tamano_texto: 'normal',
    contraste: 'estandar',
    movimiento: 'system',
  },
  feed: { inicio: 'para-ti', categorias_favoritas: [], sugerencias: true },
  marketplace: {
    ciudad_aprox: null,
    formato_regional: 'es-CO',
    moneda: 'COP',
  },
  mensajeria: {
    mensajes_desconocidos: 'solicitud',
    confirmaciones_lectura: false,
    notificar_mensajes: true,
  },
  privacidad: {
    perfil_publico: true,
    mostrar_seguidores: true,
    mostrar_presencia: false,
    audiencia_publicacion: 'publica',
  },
  accesibilidad: {
    reducir_movimiento: 'system',
    subrayar_enlaces: false,
    lector_pantalla: false,
  },
  idioma: 'es',
}

const captures = []
const accessibility = []
const apiRequests = []
const pageErrors = []
const consoleErrors = []

const emptyPage = {
  data: [],
  meta: { current_page: 1, last_page: 1, total: 0 },
}

function responseFor(pathname, method, persona, scenario) {
  if (scenario.fail?.includes(pathname) && method === 'GET') {
    return {
      status: 500,
      body: { message: 'Error simulado UI-05' },
    }
  }
  if (method === 'GET') {
    if (pathname === '/auth/web/me') {
      return { body: { usuario: persona.user || persona.loginUser || null } }
    }
    if (pathname === '/inicio') {
      return { body: { data: scenario.emptyHome ? [] : [product, secondProduct] } }
    }
    if (pathname === '/historias') return { body: { data: [story] } }
    if (pathname === `/historias/${story.id}`) return { body: { data: story } }
    if (pathname === '/video/capabilities') {
      return { body: { vod: { available: false }, live: { available: false } } }
    }
    if (pathname === '/foro') return { body: { data: scenario.emptyForum ? [] : [post], meta: { next_cursor: null } } }
    if (pathname === '/comunidades') return { body: { data: scenario.emptyCommunities ? [] : [community], meta: emptyPage.meta } }
    if (pathname === `/comunidades/${community.id}`) {
      return {
        body: {
          data: {
            ...community,
            membership: persona.membership || null,
          },
        },
      }
    }
    if (pathname === `/comunidades/${community.id}/eventos`) return { body: emptyPage }
    if (pathname === '/categorias') return { body: { data: [{ id: 1, nombre: 'Computación' }] } }
    if (pathname === '/productos') return { body: { data: [product, secondProduct], meta: { current_page: 1, last_page: 1 } } }
    if (pathname === `/productos/${product.id}`) return { body: { data: product } }
    if (pathname === `/productos/${product.id}/preguntas`) return { body: emptyPage }
    if (pathname === '/productos/comparar') return { body: { data: { productos: [product, secondProduct], campos: ['categoria'], advertencia: '' } } }
    if (pathname === '/productos/mis') return { body: { data: [product], meta: { current_page: 1, last_page: 1 } } }
    if (pathname === '/datos-vendedor') return { body: { data: { total: 1, activos: 1, vistas_validas: 0, contactos: 0, ofertas: 0, reservas: 0, vendidos: 0 } } }
    if (pathname === '/mensajes') return { body: { data: [conversation], meta: { current_page: 1 } } }
    if (pathname === `/mensajes/${conversation.id}/mensajes`) {
      return { body: { data: [initialMessage], meta: { next_before_id: null, has_more: false } } }
    }
    if (pathname === '/perfil/me') return { body: { data: persona.user } }
    if (persona.user && pathname === `/perfil/${persona.user.id}`) {
      return {
        body: {
          data: {
            perfil: persona.user,
            publicaciones: [post],
            productos: [product],
          },
        },
      }
    }
    if (persona.user && pathname.startsWith(`/perfil/${persona.user.id}/tabs/`)) {
      return { body: { ...emptyPage, meta: { current_page: 1, last_page: 1 } } }
    }
    if (pathname === '/tiendas') return { body: { data: [store] } }
    if (pathname === `/tiendas/${store.id}`) return { body: { data: store } }
    if (pathname === '/puntos-fisicos/directorio') return { body: { data: [point], meta: emptyPage.meta } }
    if (pathname === '/preferencias') return { body: { version: 1, data: preferences } }
    if (pathname === '/notificaciones' || pathname === '/notificaciones/no-leidas') {
      return { body: { data: [], meta: { no_leidas: 0 } } }
    }
    if (pathname === '/auth/web/sessions' || pathname === '/auth/web/security-notices') {
      return { body: emptyPage }
    }
    if (pathname === '/admin/dashboard') {
      return {
        body: {
          data: {
            cuentas_total: 12,
            cuentas_nuevas: 2,
            posts_total: 8,
            posts_nuevos: 1,
            productos_total: 5,
            productos_nuevos: 1,
            comunidades_total: 2,
            reportes_pendientes: 0,
            puntos_total: 1,
            operaciones_total: 3,
          },
          desde: '2026-01-01T00:00:00Z',
          hasta: '2026-01-31T23:59:59Z',
        },
      }
    }
    if (pathname === '/admin/users') return { body: { data: [admin] } }
    if (pathname === '/admin/auditoria' || pathname === '/admin/configuracion') return { body: emptyPage }
    if (pathname.startsWith('/moderacion/')) return { body: emptyPage }
    if (pathname === '/productos/501/similares') return { body: emptyPage }
    return { body: emptyPage }
  }

  if (method === 'POST' && pathname === '/auth/web/login') {
    if (scenario.loginError) {
      return {
        status: 422,
        body: { message: 'Revisa los datos ingresados.', errors: { email: ['Credenciales no válidas.'] } },
      }
    }
    return {
      body: {
        token: 'ui-05-fixture-token',
        usuario: persona.loginUser || persona.user || user,
      },
    }
  }
  if (method === 'POST' && pathname === '/foro') {
    return {
      status: 201,
      body: {
        data: {
          ...post,
          id: 702,
          titulo: requestBodyForPost.titulo || post.titulo,
          contenido: requestBodyForPost.contenido || post.contenido,
          usuario: persona.user,
        },
      },
    }
  }
  if (method === 'POST' && pathname === '/productos') {
    return { status: 201, body: { data: { ...product, id: 503 } } }
  }
  if (method === 'POST' && pathname === '/guardados') return { status: 201, body: { data: { id: 901 } } }
  if (method === 'POST' && pathname === `/mensajes/${conversation.id}/mensajes`) {
    const body = requestBodyTextForMessage
    return { status: 201, body: { data: { id: 802, autor_id: persona.user.id, contenido: body || 'Mensaje enviado UI-04' } } }
  }
  if (method === 'POST' && pathname === `/comunidades/${community.id}/membresia`) {
    return { status: 201, body: { message: 'Solicitud enviada.' } }
  }
  return { status: 200, body: { data: {} } }
}

let requestBodyTextForMessage = ''
let requestBodyForPost = { titulo: '', contenido: '' }

async function installFixtures(context, persona, scenario = {}) {
  if (persona.user) {
    await context.addInitScript((token) => {
      sessionStorage.setItem('aegis.web.token.v1', token)
    }, 'ui-05-fixture-token')
  }
  await context.route('**/api/**', async (route) => {
    const request = route.request()
    const method = request.method()
    const url = new URL(request.url())
    const pathname = url.pathname.replace(/^\/api/, '')
    apiRequests.push({ method, pathname, role: persona.name })
    if (method === 'OPTIONS') {
      return route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': '*',
          'access-control-allow-methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        },
      })
    }
    if (method === 'POST' && pathname === `/mensajes/${conversation.id}/mensajes`) {
      const body = request.postData() || ''
      requestBodyTextForMessage = /name="contenido"\r\n\r\n([^\r]+)/.exec(body)?.[1] || ''
    }
    if (method === 'POST' && pathname === '/foro') {
      const body = request.postData() || ''
      const getField = (name) => {
        const value = new RegExp(`name="${name}"\\r\\n\\r\\n([\\s\\S]*?)\\r\\n------`).exec(body)?.[1]
        return value?.replace(/\r\n/g, '\n') || ''
      }
      requestBodyForPost = {
        titulo: getField('titulo'),
        contenido: getField('contenido'),
      }
    }
    if (scenario.loadingHome && method === 'GET' && pathname === '/inicio') {
      await new Promise((resolve) => {
        scenario.releaseHome = resolve
      })
    }
    const fixture = responseFor(pathname, method, persona, scenario)
    return route.fulfill({
      status: fixture.status || 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(fixture.body),
    })
  })
}

async function capture(page, name, persona, theme, width) {
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  const result = {
    name,
    persona: persona.name,
    theme,
    width,
    ...layout,
    horizontalOverflow: layout.scrollWidth > layout.clientWidth,
    url: page.url(),
  }
  captures.push(result)
  await page.screenshot({
    path: path.join(output, `${name}-${persona.name}-${theme}-${width}.png`),
    fullPage: true,
    animations: 'disabled',
  })
  return result
}

async function scanAxe(page, name, theme, width) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  accessibility.push({
    name,
    theme,
    width,
    violations: result.violations.map(({ id, impact, nodes }) => ({
      id,
      impact,
      targets: nodes.map((node) => node.target),
    })),
    incomplete: result.incomplete.map(({ id, nodes }) => ({
      id,
      count: nodes.length,
      targets: nodes.map((node) => node.target),
    })),
  })
  return result
}

const routeGroups = [
  {
    persona: { name: 'guest', user: null },
    routes: [
      ['home', '/', '.home-container'],
      ['login', '/login', '.login-page'],
      ['forum', '/foro', '.foro-feed'],
      ['communities', '/comunidades', '.comunidades-page'],
      ['marketplace', '/productos', '.product-card'],
      ['product-detail', '/productos/detalle?id=501', '.detail-title'],
      ['stores', '/tiendas', '.tienda-card'],
      ['physical-points', '/puntos-fisicos', '.pv-lugar'],
      ['saved-unavailable', '/guardados', '.not-found-page'],
    ],
  },
  {
    persona: { name: 'seller', user: sellerAccount },
    routes: [
      ['ad-create', '/productos/crear', '.publish-page'],
      ['messages', '/mensajes', '.msg-pagina--conversation .msg-chat'],
      ['profile', '/perfil', '.perfil-page'],
      ['seller-products', '/productos/mis-productos', '.table-page'],
      ['settings', '/ajustes', '.ajustes-panel'],
      ['security', '/seguridad', '.account-security-page'],
      ['admin-denied', '/admin', '[role="alert"]'],
    ],
  },
  {
    persona: { name: 'buyer', user: { ...user, username: 'buyer-fixture' } },
    routes: [['buyer-negotiations', '/negociacion', '.negociacion-page']],
  },
  {
    persona: {
      name: 'point-owner',
      user: {
        ...user,
        id: 989,
        username: 'owner-fixture',
        rol: 'owner',
      },
    },
    routes: [['owner-points', '/puntos-fisicos', '.pv-lugar']],
  },
  {
    persona: {
      name: 'community-moderator',
      user,
      membership: { estado: 'activo', rol: 'moderador' },
    },
    routes: [['moderated-community', '/comunidades', '.comunidades-page']],
  },
  {
    persona: { name: 'admin', user: admin },
    routes: [
      ['admin-dashboard', '/admin', '.admin-page'],
      ['admin-users', '/admin/usuarios', '.table-page'],
      ['admin-reports', '/admin/reportes', '.table-page'],
      ['admin-audit', '/admin/auditoria', '.table-page'],
      ['admin-settings', '/admin/configuracion', '.table-page'],
    ],
  },
]

const axeRoutes = new Set([
  'home',
  'login',
  'forum',
  'communities',
  'marketplace',
  'product-detail',
  'messages',
  'profile',
  'seller-products',
  'settings',
  'security',
  'admin-dashboard',
  'admin-users',
])

test.afterAll(() => {
  fs.mkdirSync(output, { recursive: true })
  fs.writeFileSync(path.join(output, 'route-results.json'), JSON.stringify(captures, null, 2))
  fs.writeFileSync(path.join(output, 'accessibility.json'), JSON.stringify(accessibility, null, 2))
  fs.writeFileSync(path.join(output, 'api-console-results.json'), JSON.stringify({
    apiRequests,
    pageErrors,
    consoleErrors,
  }, null, 2))
})

test('captura la matriz de rutas por persona, tema y viewport', async ({ browser, baseURL }) => {
  fs.mkdirSync(output, { recursive: true })
  for (const [width, height] of sizes) {
    for (const theme of themes) {
      for (const group of routeGroups) {
        const context = await browser.newContext({
          viewport: { width, height },
          colorScheme: theme,
          reducedMotion: 'reduce',
        })
        await installFixtures(context, group.persona)
        const page = await context.newPage()
        page.on('pageerror', (error) => pageErrors.push({ url: page.url(), message: error.message }))
        page.on('console', (message) => {
          if (message.type() === 'error') {
            consoleErrors.push({ url: page.url(), message: message.text() })
          }
        })
        try {
          for (const [name, route, ready] of group.routes) {
            await page.goto(`${baseURL}/#${route}`, { waitUntil: 'domcontentloaded' })
            await page.locator(ready).first().waitFor({ state: 'visible', timeout: 15_000 })
            const result = await capture(page, name, group.persona, theme, width)
            expect(result.horizontalOverflow, `${name} ${theme} ${width}px overflowed`).toBe(false)
            const tableRegionName = {
              'seller-products': 'Productos propios',
              'admin-users': 'Cuentas de usuario',
            }[name]
            if (tableRegionName && width === 360) {
              const region = page.getByRole('region', { name: tableRegionName })
              await expect(region).toBeVisible()
              await expect(page.getByText('Desliza horizontalmente')).toBeVisible()
              const before = await region.evaluate((element) => element.scrollLeft)
              await region.focus()
              await page.keyboard.press('ArrowRight')
              const after = await region.evaluate((element) => element.scrollLeft)
              expect(after, `${name} table scrolls with the keyboard`).toBeGreaterThan(before)
            }
            if (axeRoutes.has(name) && [360, 1280].includes(width)) {
              const scan = await scanAxe(page, name, theme, width)
              const severe = scan.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact))
              expect(severe, `${name} ${theme} ${width}px has serious Axe findings`).toEqual([])
            }
          }
        } finally {
          await context.close()
        }
      }
    }
  }
  expect(pageErrors).toEqual([])
})

test('compara visualmente Marketplace, detalle y mensajes con el baseline UI-04', async ({ browser, baseURL }) => {
  const samples = [
    { name: 'marketplace-light-360', route: '/productos', ready: '.product-card', role: admin },
    { name: 'detalle-producto-light-360', route: '/productos/detalle?id=501', ready: '.detail-title', role: admin },
    { name: 'mensajes-conversacion-light-360', route: '/mensajes', ready: '.msg-pagina--conversation .msg-chat', role: admin, sendMessage: true },
  ]
  for (const sample of samples) {
    const context = await browser.newContext({
      viewport: { width: 360, height: 800 },
      colorScheme: 'light',
      reducedMotion: 'reduce',
    })
    await installFixtures(context, { name: sample.role.rol, user: sample.role })
    const page = await context.newPage()
    try {
      await page.goto(`${baseURL}/#${sample.route}`, { waitUntil: 'domcontentloaded' })
      await page.locator(sample.ready).first().waitFor({ state: 'visible', timeout: 15_000 })
      if (sample.sendMessage) {
        await page.getByRole('textbox', { name: 'Escribe un mensaje' }).fill('Mensaje enviado UI-04')
        await page.getByRole('button', { name: 'Enviar', exact: true }).click()
        await page.getByText('Mensaje enviado UI-04').waitFor()
      }
      await expect(page).toHaveScreenshot(`${sample.name}.png`, {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.003,
      })
      await capture(page, `baseline-${sample.name}`, { name: sample.role.rol }, 'light', 360)
    } finally {
      await context.close()
    }
  }
})

test('captura estados loading, vacío, error y un diálogo abierto', async ({ browser, baseURL }) => {
  const scenarioNames = ['loadingHome', 'emptyHome', 'errorHome', 'storyDialog']
  for (const scenarioName of scenarioNames) {
    const context = await browser.newContext({
      viewport: { width: 360, height: 800 },
      colorScheme: 'light',
      reducedMotion: 'reduce',
    })
    const scenario = {
      loadingHome: scenarioName === 'loadingHome',
      emptyHome: scenarioName === 'emptyHome',
      fail: scenarioName === 'errorHome' ? ['/inicio'] : [],
    }
    await installFixtures(context, { name: 'guest', user: null }, scenario)
    const page = await context.newPage()
    try {
      await page.goto(`${baseURL}/#/`, { waitUntil: 'domcontentloaded' })
      if (scenarioName === 'loadingHome') {
        await page.locator('[aria-label="Cargando productos"]').waitFor({ state: 'visible' })
        await capture(page, 'home-loading', { name: 'guest' }, 'light', 360)
        scenario.releaseHome?.()
      } else if (scenarioName === 'emptyHome') {
        await page.getByText('Todavía no hay productos publicados').waitFor()
        await capture(page, 'home-empty', { name: 'guest' }, 'light', 360)
      } else if (scenarioName === 'errorHome') {
        await page.getByRole('alert').filter({ hasText: 'El servicio tuvo un problema' }).waitFor()
        await capture(page, 'home-error', { name: 'guest' }, 'light', 360)
      } else {
        await page.getByRole('button', { name: 'Abrir historia de vendedor-fixture' }).click()
        await page.getByRole('dialog', { name: 'Historia' }).waitFor()
        await capture(page, 'home-story-dialog', { name: 'guest' }, 'light', 360)
        await page.keyboard.press('Escape')
        await expect(page.getByRole('dialog', { name: 'Historia' })).toHaveCount(0)
      }
    } finally {
      scenario.releaseHome?.()
      await context.close()
    }
  }
})

test('verifica login, publicación social, permisos de comunidad y modal de oferta', async ({ browser, baseURL }) => {
  const loginContext = await browser.newContext({ viewport: { width: 360, height: 800 } })
  await installFixtures(loginContext, { name: 'guest', user: null }, { loginError: true })
  const loginPage = await loginContext.newPage()
  await loginPage.goto(`${baseURL}/#/login`)
  await loginPage.getByLabel('Correo electrónico').fill('usuario@example.test')
  await loginPage.getByLabel('Contraseña', { exact: true }).fill('incorrecta')
  await loginPage.getByRole('button', { name: 'Iniciar sesión' }).click()
  await loginPage.getByRole('alert').filter({ hasText: 'Credenciales no válidas.' }).waitFor()
  await capture(loginPage, 'login-error', { name: 'guest' }, 'light', 360)
  await loginContext.close()

  const successfulLoginContext = await browser.newContext({ viewport: { width: 360, height: 800 } })
  await installFixtures(successfulLoginContext, { name: 'guest', user: null, loginUser: user })
  const successfulLoginPage = await successfulLoginContext.newPage()
  await successfulLoginPage.goto(`${baseURL}/#/mensajes`)
  await successfulLoginPage.waitForURL(/#\/login/)
  await successfulLoginPage.getByLabel('Correo electrónico').fill('usuario@example.test')
  await successfulLoginPage.getByLabel('Contraseña', { exact: true }).fill('fixture-password')
  await successfulLoginPage.getByRole('button', { name: 'Iniciar sesión' }).click()
  await successfulLoginPage.waitForURL(/#\/mensajes/)
  await successfulLoginPage.locator('.msg-pagina--conversation .msg-chat').waitFor({ state: 'visible' })
  await capture(successfulLoginPage, 'login-return-to-messages', { name: 'usuario' }, 'light', 360)
  await successfulLoginContext.close()

  const publishContext = await browser.newContext({ viewport: { width: 360, height: 800 } })
  await installFixtures(publishContext, { name: 'usuario', user })
  const publishPage = await publishContext.newPage()
  await publishPage.goto(`${baseURL}/#/foro`)
  await publishPage.locator('.foro-feed').waitFor({ state: 'visible' })
  await publishPage.getByRole('textbox', { name: 'Crear publicación' }).click()
  await publishPage.getByLabel('Título de la publicación').fill('UI-05 publicación aislada')
  await publishPage.getByLabel('Detalles de la publicación').fill('Contenido de prueba, sin persistencia.')
  await capture(publishPage, 'forum-composer-open', { name: 'usuario' }, 'light', 360)
  await publishPage.getByRole('button', { name: 'Publicar', exact: true }).click()
  await expect(
    publishPage.getByRole('button', { name: 'UI-05 publicación aislada', exact: true }),
  ).toBeVisible()
  expect(requestBodyForPost).toEqual({
    titulo: 'UI-05 publicación aislada',
    contenido: 'UI-05 publicación aislada\nContenido de prueba, sin persistencia.',
  })
  expect(apiRequests).toContainEqual({
    method: 'POST',
    pathname: '/foro',
    role: 'usuario',
  })
  await publishContext.close()

  const moderatorContext = await browser.newContext({ viewport: { width: 360, height: 800 } })
  await installFixtures(moderatorContext, {
    name: 'community-moderator',
    user,
    membership: { estado: 'activo', rol: 'moderador' },
  })
  const moderatorPage = await moderatorContext.newPage()
  await moderatorPage.goto(`${baseURL}/#/comunidades`)
  await moderatorPage.getByRole('button', { name: 'Ver comunidad' }).click()
  await moderatorPage.locator('.comunidad-event-form').waitFor({ state: 'visible' })
  await capture(moderatorPage, 'community-moderator-event-tools', { name: 'community-moderator' }, 'light', 360)
  await moderatorContext.close()

  const offerContext = await browser.newContext({ viewport: { width: 360, height: 800 } })
  await installFixtures(offerContext, { name: 'usuario', user })
  const offerPage = await offerContext.newPage()
  await offerPage.goto(`${baseURL}/#/productos/detalle?id=501`)
  await offerPage.locator('.detail-title').waitFor({ state: 'visible' })
  await offerPage.getByRole('button', { name: 'Proponer precio' }).click()
  await offerPage.getByRole('dialog', { name: 'Proponer precio' }).waitFor()
  await capture(offerPage, 'product-offer-dialog', { name: 'usuario' }, 'light', 360)
  await offerContext.close()
})

test('cumple contrastes mínimos de tokens y captura navegación móvil abierta', async ({ browser, baseURL }) => {
  const contrastResults = []
  for (const theme of themes) {
    const context = await browser.newContext({
      viewport: { width: 360, height: 800 },
      colorScheme: theme,
      reducedMotion: 'reduce',
    })
    await installFixtures(context, { name: 'guest', user: null })
    const page = await context.newPage()
    await page.goto(`${baseURL}/#/`, { waitUntil: 'domcontentloaded' })
    await page.locator('.home-container').waitFor({ state: 'visible' })
    const tokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement)
      return Object.fromEntries([
        '--color-text',
        '--color-text-muted',
        '--color-surface',
        '--color-action',
        '--color-action-text',
        '--color-danger',
        '--color-danger-action-text',
        '--color-focus',
        '--color-canvas',
      ].map((name) => [name, style.getPropertyValue(name).trim()]))
    })
    const colorChannels = (value) => {
      const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
      if (hex) {
        const digits = hex[1].length === 3
          ? hex[1].split('').map((digit) => digit + digit).join('')
          : hex[1]
        return [0, 2, 4].map((index) => parseInt(digits.slice(index, index + 2), 16) / 255)
      }
      const rgb = value.match(/rgba?\(([^)]+)\)/i)
      if (!rgb) throw new Error(`Unsupported CSS color token: ${value}`)
      return rgb[1].split(',').slice(0, 3).map((channel) => Number(channel.trim()) / 255)
    }
    const luminance = (value) => {
      const [r, g, b] = colorChannels(value).map((channel) =>
        channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
      )
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const ratio = (foreground, background) => {
      const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
      return Number(((values[0] + 0.05) / (values[1] + 0.05)).toFixed(2))
    }
    const checks = [
      ['text/surface', tokens['--color-text'], tokens['--color-surface'], 4.5],
      ['muted/surface', tokens['--color-text-muted'], tokens['--color-surface'], 4.5],
      ['action/action-text', tokens['--color-action-text'], tokens['--color-action'], 4.5],
      ['danger/danger-action-text', tokens['--color-danger-action-text'], tokens['--color-danger'], 4.5],
      ['focus/surface', tokens['--color-focus'], tokens['--color-surface'], 3],
      ['focus/canvas', tokens['--color-focus'], tokens['--color-canvas'], 3],
    ].map(([pair, foreground, background, minimum]) => ({
      pair,
      foreground,
      background,
      minimum,
      ratio: ratio(foreground, background),
    }))
    contrastResults.push({ theme, checks })
    for (const check of checks) {
      expect(check.ratio, `${theme} ${check.pair} contrast`).toBeGreaterThanOrEqual(check.minimum)
    }
    const menuToggle = page.getByRole('button', { name: 'Abrir menú' })
    await menuToggle.focus()
    await page.keyboard.press('Enter')
    const menu = page.getByRole('dialog', { name: 'Menú principal' })
    await menu.waitFor()
    expect(await menu.evaluate((element) => element.contains(document.activeElement))).toBe(true)
    await capture(page, `mobile-navigation-open-${theme}`, { name: 'guest' }, theme, 360)
    await page.keyboard.press('Tab')
    expect(await menu.evaluate((element) => element.contains(document.activeElement))).toBe(true)
    await page.keyboard.press('Escape')
    await menu.waitFor({ state: 'detached' })
    await expect(menuToggle).toBeFocused()
    await context.close()
  }
  fs.writeFileSync(path.join(output, 'token-contrast.json'), JSON.stringify(contrastResults, null, 2))
})
