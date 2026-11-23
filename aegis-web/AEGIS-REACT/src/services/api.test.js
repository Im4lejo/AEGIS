import assert from 'node:assert/strict'
import test from 'node:test'
import { ApiError, authApi, request } from './api.js'

function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

test('preserves successful API envelopes', async () => {
  const envelope = { data: [{ id: 7 }], meta: { total: 1 } }
  const result = await request('/productos', {
    fetchImpl: async () => jsonResponse(envelope),
  })
  assert.deepEqual(result, envelope)
})

test('maps validation responses and retains field errors', async () => {
  await assert.rejects(
    request('/productos', {
      method: 'POST',
      body: {},
      fetchImpl: async () =>
        jsonResponse(
          { message: 'Invalid', errors: { titulo: ['Required'] } },
          422,
        ),
    }),
    (error) =>
      error instanceof ApiError &&
      error.status === 422 &&
      error.message === 'Required' &&
      error.errors.titulo[0] === 'Required',
  )
})

test('maps expected client and authorization statuses', async () => {
  const expectedMessages = new Map([
    [
      400,
      'No se pudo procesar la solicitud. Revisa los datos e inténtalo de nuevo.',
    ],
    [401, 'Tu sesión no es válida. Inicia sesión de nuevo para continuar.'],
    [403, 'No tienes permiso para realizar esta acción.'],
    [404, 'No encontramos lo que buscas.'],
    [
      409,
      'La información cambió o entra en conflicto. Actualiza e inténtalo de nuevo.',
    ],
  ])

  for (const [status, message] of expectedMessages) {
    await assert.rejects(
      request('/productos', {
        fetchImpl: async () => jsonResponse({}, status),
      }),
      (error) => error.status === status && error.message === message,
    )
  }

  await assert.rejects(
    request('/auth/web/login', {
      method: 'POST',
      body: {},
      fetchImpl: async () =>
        jsonResponse(
          {
            message: 'Verifica tu correo.',
            code: 'EMAIL_VERIFICATION_REQUIRED',
          },
          403,
        ),
    }),
    (error) =>
      error instanceof ApiError &&
      error.status === 403 &&
      error.code === 'EMAIL_VERIFICATION_REQUIRED',
  )
})

test('does not expose server details for internal errors', async () => {
  await assert.rejects(
    request('/productos', {
      fetchImpl: async () =>
        jsonResponse({ message: 'database password leaked' }, 500),
    }),
    (error) =>
      error.status === 500 &&
      error.message ===
        'El servicio tuvo un problema. Inténtalo de nuevo más tarde.' &&
      !error.message.includes('password'),
  )
})

test('retains the retry-after header for rate-limit responses', async () => {
  await assert.rejects(
    request('/productos', {
      fetchImpl: async () => jsonResponse({}, 429, { 'Retry-After': '30' }),
    }),
    (error) => error.status === 429 && error.retryAfter === '30',
  )
})

test('normalizes network failures without swallowing aborts', async () => {
  await assert.rejects(
    request('/productos', {
      fetchImpl: async () => {
        throw new TypeError('offline')
      },
    }),
    (error) => error.status === 0 && error.cause.message === 'offline',
  )

  const abort = new DOMException('Aborted', 'AbortError')
  await assert.rejects(
    request('/productos', {
      fetchImpl: async () => {
        throw abort
      },
    }),
    (error) => error === abort,
  )
})

test('does not set multipart content type and handles no-content responses', async () => {
  const body = new FormData()
  let observedOptions
  const result = await request('/upload', {
    method: 'POST',
    body,
    fetchImpl: async (_url, options) => {
      observedOptions = options
      return new Response(null, { status: 204 })
    },
  })

  assert.equal(result, null)
  assert.equal(observedOptions.body, body)
  assert.equal(observedOptions.headers['Content-Type'], undefined)
})

test('web authentication uses separate account lifecycle endpoints', async () => {
  const originalFetch = globalThis.fetch
  const requests = []
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options })
    return jsonResponse({ data: [] })
  }

  try {
    await authApi.login({ email: 'web@example.com', password: 'secret' })
    await authApi.forgotPassword('web@example.com')
    await authApi.sessions('opaque-token')
    await authApi.revokeAllSessions('opaque-token')
  } finally {
    globalThis.fetch = originalFetch
  }

  assert.deepEqual(
    requests.map(({ url, options }) => [url, options.method]),
    [
      ['http://127.0.0.1:8000/api/auth/web/login', 'POST'],
      ['http://127.0.0.1:8000/api/auth/web/password/forgot', 'POST'],
      ['http://127.0.0.1:8000/api/auth/web/sessions', 'GET'],
      ['http://127.0.0.1:8000/api/auth/web/sessions', 'DELETE'],
    ],
  )
  assert.equal(requests[2].options.headers.Authorization, 'Bearer opaque-token')
})
