const API_URL = (
  import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
).replace(/\/$/, '')

const ERROR_MESSAGES = {
  0: 'No se pudo conectar con AEGIS. Comprueba tu conexión e inténtalo de nuevo.',
  400: 'No se pudo procesar la solicitud. Revisa los datos e inténtalo de nuevo.',
  401: 'Tu sesión no es válida. Inicia sesión de nuevo para continuar.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No encontramos lo que buscas.',
  409: 'La información cambió o entra en conflicto. Actualiza e inténtalo de nuevo.',
  422: 'Revisa los datos ingresados.',
  429: 'Se alcanzó el límite temporal de solicitudes. Inténtalo de nuevo más tarde.',
  500: 'El servicio tuvo un problema. Inténtalo de nuevo más tarde.',
}

export class ApiError extends Error {
  constructor(
    message,
    status,
    errors = {},
    retryAfter = null,
    cause,
    code = null,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.retryAfter = retryAfter
    this.code = code
    if (cause) this.cause = cause
  }
}

function errorMessage(status, data) {
  const serverMessage = typeof data?.message === 'string' ? data.message : ''
  const errors =
    data?.errors && typeof data.errors === 'object' ? data.errors : {}
  const validationMessage = Object.values(errors)
    .flat()
    .find((message) => typeof message === 'string')

  if (status === 422) {
    return validationMessage || serverMessage || ERROR_MESSAGES[422]
  }

  if (status === 400 || status === 403 || status === 409) {
    return serverMessage || ERROR_MESSAGES[status]
  }

  if (status === 401) return serverMessage || ERROR_MESSAGES[401]

  return ERROR_MESSAGES[status] || 'No se pudo completar la solicitud.'
}

export async function request(
  path,
  { method = 'GET', body, token, fetchImpl = globalThis.fetch } = {},
) {
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  if (body !== undefined && body !== null && !isFormData)
    headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetchImpl(`${API_URL}${path}`, {
      method,
      headers,
      body: isFormData
        ? body
        : body === undefined || body === null
          ? undefined
          : JSON.stringify(body),
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new ApiError(ERROR_MESSAGES[0], 0, {}, null, error)
  }

  const responseBody = await response.text()
  let data
  let isJson = false
  if (responseBody) {
    try {
      data = JSON.parse(responseBody)
      isJson = true
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    const errors =
      data?.errors && typeof data.errors === 'object' ? data.errors : {}
    throw new ApiError(
      errorMessage(response.status, data),
      response.status,
      errors,
      response.headers.get('Retry-After'),
      undefined,
      data?.code || null,
    )
  }

  if (response.status === 204) return null
  if (!isJson) {
    throw new ApiError(
      'El servidor devolvió una respuesta no válida.',
      response.status,
    )
  }

  return data
}

function queryString(params) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '')
      query.set(key, value)
  })
  const serialized = query.toString()
  return serialized ? `?${serialized}` : ''
}

export const notificationApi = {
  inbox: (filters = {}, token) =>
    request(`/notificaciones${queryString(filters)}`, { token }),
  unread: (token) => request('/notificaciones/no-leidas', { token }),
  read: (id, token) =>
    request(`/notificaciones/${encodeURIComponent(id)}/leer`, {
      method: 'PATCH',
      token,
    }),
  readAll: (categoria, token) =>
    request('/notificaciones/leidas-todas', {
      method: 'PATCH',
      body: categoria ? { categoria } : {},
      token,
    }),
  archive: (id, token) =>
    request(`/notificaciones/${encodeURIComponent(id)}/archivar`, {
      method: 'PATCH',
      token,
    }),
  remove: (id, token) =>
    request(`/notificaciones/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      token,
    }),
  preferences: (token) => request('/notificaciones/preferencias', { token }),
  updatePreference: (details, token) =>
    request('/notificaciones/preferencias', {
      method: 'PATCH',
      body: details,
      token,
    }),
}

export const searchApi = {
  search: (filters = {}) =>
    request(`/busqueda${queryString(filters)}`),
  suggestions: (q) =>
    request(`/busqueda/sugerencias${queryString({ q })}`),
  trends: (dias = 7) =>
    request(`/busqueda/tendencias${queryString({ dias })}`),
  saved: (token) => request('/busqueda/guardadas', { token }),
  save: (details, token) =>
    request('/busqueda/guardadas', { method: 'POST', body: details, token }),
  removeSaved: (id, token) =>
    request(`/busqueda/guardadas/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      token,
    }),
  recent: (token) => request('/busqueda/recentes', { token }),
  preference: (details, token) =>
    request('/busqueda/preferencia', { method: 'POST', body: details, token }),
  recommendations: (token) =>
    request('/busqueda/recomendaciones', { token }),
}

export const preferenceApi = {
  defaults: () => request('/preferencias/defaults'),
  get: (token) => request('/preferencias', { token }),
  update: (version, preferencias, token) =>
    request('/preferencias', {
      method: 'PUT',
      body: { version, preferencias },
      token,
    }),
  reset: (token) =>
    request('/preferencias/restablecer', { method: 'POST', token }),
}

export const videoApi = {
  capabilities: () => request('/video/capabilities'),
  createLive: (token) =>
    request('/live/sessions', { method: 'POST', token }),
}

export const advancedContentApi = {
  stories: (token) => request('/historias', { token }),
  story: (id, token) =>
    request(`/historias/${encodeURIComponent(id)}`, { token }),
  createStory: (details, token) =>
    request('/historias', { method: 'POST', body: details, token }),
  deleteStory: (id, token) =>
    request(`/historias/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      token,
    }),
  events: (communityId) =>
    request(
      `/comunidades/${encodeURIComponent(communityId)}/eventos`,
    ),
  createEvent: (communityId, details, token) =>
    request(`/comunidades/${encodeURIComponent(communityId)}/eventos`, {
      method: 'POST',
      body: details,
      token,
    }),
  participate: (eventId, details, token) =>
    request(`/eventos/${encodeURIComponent(eventId)}/participacion`, {
      method: 'POST',
      body: details,
      token,
    }),
  cancelEvent: (eventId, token) =>
    request(`/eventos/${encodeURIComponent(eventId)}/cancelar`, {
      method: 'PATCH',
      token,
    }),
}

export const authApi = {
  login: (credentials) =>
    request('/auth/web/login', { method: 'POST', body: credentials }),
  register: (details) =>
    request('/auth/web/register', { method: 'POST', body: details }),
  me: (token) => request('/auth/web/me', { token }),
  logout: (token) => request('/auth/web/logout', { method: 'POST', token }),
  resendVerification: (email) =>
    request('/auth/web/email/resend', { method: 'POST', body: { email } }),
  resendAuthenticatedVerification: (token) =>
    request('/auth/web/email/verification-notification', {
      method: 'POST',
      token,
    }),
  forgotPassword: (email) =>
    request('/auth/web/password/forgot', { method: 'POST', body: { email } }),
  resetPassword: (details) =>
    request('/auth/web/password/reset', { method: 'POST', body: details }),
  changePassword: (details, token) =>
    request('/auth/web/password', { method: 'PATCH', body: details, token }),
  sessions: (token) => request('/auth/web/sessions', { token }),
  revokeSession: (id, token) =>
    request(`/auth/web/sessions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      token,
    }),
  revokeAllSessions: (token) =>
    request('/auth/web/sessions', { method: 'DELETE', token }),
  securityNotices: (token) => request('/auth/web/security-notices', { token }),
}

export const productApi = {
  categories: () => request('/categorias'),
  list: (filters = {}) => request(`/productos${queryString(filters)}`),
  home: () => request('/inicio'),
  show: (id) => request(`/productos/${encodeURIComponent(id)}`),
  create: (product, token) => {
    const body = new FormData()
    Object.entries(product).forEach(([key, value]) => {
      if (key === 'imagenes')
        value.forEach((image) => body.append('imagenes[]', image))
      else if (value !== undefined && value !== null) body.append(key, value)
    })
    return request('/productos', { method: 'POST', body, token })
  },
  addMedia: (productId, files, token, altText = '') => {
    const body = new FormData()
    files.forEach((file) => body.append('imagenes[]', file))
    if (altText) body.append('alt_text', altText)
    return request(`/productos/${encodeURIComponent(productId)}/imagenes`, {
      method: 'POST',
      body,
      token,
    })
  },
  deleteMedia: (productId, imageId, token) =>
    request(`/productos/${encodeURIComponent(productId)}/imagenes/${encodeURIComponent(imageId)}`, {
      method: 'DELETE',
      token,
    }),
  reorderMedia: (productId, ids, token) =>
    request(`/productos/${encodeURIComponent(productId)}/imagenes/orden`, {
      method: 'PATCH',
      body: { orden: ids },
      token,
    }),
  mine: (estado = 'todos', page = 1, perPage = 24, token) =>
    request(`/productos/mis${queryString({ estado, page, per_page: perPage })}`, { token }),
  stats: (token) => request('/productos/mis/estadisticas', { token }),
  transition: (productId, estado, token, motivo = '') =>
    request(`/productos/${encodeURIComponent(productId)}/estado`, {
      method: 'PATCH',
      body: { estado, motivo },
      token,
    }),
  renew: (productId, token) =>
    request(`/productos/${encodeURIComponent(productId)}/renovar`, {
      method: 'POST',
      token,
    }),
  compare: (ids) =>
    request(`/productos/comparar${queryString({ ids: ids.join(',') })}`),
  similar: (productId) =>
    request(`/productos/${encodeURIComponent(productId)}/similares`),
  questions: (productId, page = 1, perPage = 20) =>
    request(`/productos/${encodeURIComponent(productId)}/preguntas${queryString({ page, per_page: perPage })}`),
  ask: (productId, pregunta, token) =>
    request(`/productos/${encodeURIComponent(productId)}/preguntas`, {
      method: 'POST',
      body: { pregunta },
      token,
    }),
}

export const forumApi = {
  list: (tab = 'recientes', cursor = null, perPage = 20) =>
    request(`/foro${queryString({ tab, cursor, per_page: perPage })}`),
  show: (postId) => request(`/foro/${encodeURIComponent(postId)}`),
  create: (post, token) => {
    const body = new FormData()
    body.append('titulo', post.titulo)
    body.append('contenido', post.contenido)
    if (post.imagen) body.append('imagenes[]', post.imagen)
    if (post.tipo) body.append('tipo', post.tipo)
    if (post.visibilidad) body.append('visibilidad', post.visibilidad)
    if (post.estado) body.append('estado', post.estado)
    if (post.programada_para) body.append('programada_para', post.programada_para)
    if (post.enlace_preview_url) body.append('enlace_preview_url', post.enlace_preview_url)
    if (post.producto_id) body.append('producto_id', post.producto_id)
    ;(post.etiquetas || []).forEach((tag, index) => body.append(`etiquetas[${index}]`, tag))
    ;(post.menciones || []).forEach((id, index) => body.append(`menciones[${index}]`, id))
    return request('/foro', { method: 'POST', body, token })
  },
  update: (postId, details, token) =>
    request(`/foro/${encodeURIComponent(postId)}`, {
      method: 'PATCH',
      body: details,
      token,
    }),
  archive: (postId, token) =>
    request(`/foro/${encodeURIComponent(postId)}/archivar`, {
      method: 'PATCH',
      token,
    }),
  react: (postId, tipo, token) =>
    request(`/foro/${encodeURIComponent(postId)}/reacciones`, {
      method: 'POST',
      body: { tipo },
      token,
    }),
  unreact: (postId, tipo, token) =>
    request(`/foro/${encodeURIComponent(postId)}/reacciones${queryString({ tipo })}`, {
      method: 'DELETE',
      token,
    }),
  comments: (postId, page = 1, perPage = 20) =>
    request(`/foro/${encodeURIComponent(postId)}/comentarios${queryString({ page, per_page: perPage })}`),
  updateComment: (postId, commentId, comentario, token) =>
    request(`/foro/${encodeURIComponent(postId)}/comentarios/${encodeURIComponent(commentId)}`, {
      method: 'PATCH',
      body: { comentario },
      token,
    }),
  deleteComment: (postId, commentId, token) =>
    request(`/foro/${encodeURIComponent(postId)}/comentarios/${encodeURIComponent(commentId)}`, {
      method: 'DELETE',
      token,
    }),
  repost: (postId, comentario, token) =>
    request(`/foro/${encodeURIComponent(postId)}/reposts`, {
      method: 'POST',
      body: comentario ? { comentario } : {},
      token,
    }),
  unrepost: (postId, token) =>
    request(`/foro/${encodeURIComponent(postId)}/reposts`, {
      method: 'DELETE',
      token,
    }),
  setSolution: (postId, commentId, aceptada, token) =>
    request(`/foro/${encodeURIComponent(postId)}/solucion`, {
      method: 'PATCH',
      body: { comentario_id: commentId, aceptada },
      token,
    }),
  toggleThread: (postId, estado, token) =>
    request(`/foro/${encodeURIComponent(postId)}/hilo`, {
      method: 'PATCH',
      body: { estado },
      token,
    }),
  subscribe: (postId, token) =>
    request(`/foro/${encodeURIComponent(postId)}/suscripcion`, {
      method: 'POST',
      token,
    }),
  unsubscribe: (postId, token) =>
    request(`/foro/${encodeURIComponent(postId)}/suscripcion`, {
      method: 'DELETE',
      token,
    }),
  createPoll: (postId, details, token) =>
    request(`/foro/${encodeURIComponent(postId)}/encuesta`, {
      method: 'PUT',
      body: details,
      token,
    }),
  votePoll: (postId, opcionId, token) =>
    request(`/foro/${encodeURIComponent(postId)}/encuesta/voto`, {
      method: 'POST',
      body: { opcion_id: opcionId },
      token,
    }),
  comment: (postId, comentario, token) =>
    request(`/foro/${postId}/comentarios`, {
      method: 'POST',
      body: { comentario },
      token,
    }),
  addMedia: (postId, { images = [], videos = [] }, token, altText = '') => {
    const body = new FormData()
    images.forEach((file) => body.append('imagenes[]', file))
    videos.forEach((file) => body.append('videos[]', file))
    if (altText) body.append('alt_text', altText)
    return request(`/foro/${encodeURIComponent(postId)}/imagenes`, {
      method: 'POST',
      body,
      token,
    })
  },
  deleteMedia: (postId, imageId, token) =>
    request(`/foro/${encodeURIComponent(postId)}/imagenes/${encodeURIComponent(imageId)}`, {
      method: 'DELETE',
      token,
    }),
  reorderMedia: (postId, ids, token) =>
    request(`/foro/${encodeURIComponent(postId)}/imagenes/orden`, {
      method: 'PATCH',
      body: { orden: ids },
      token,
    }),
}

export const communityApi = {
  list: (filters = {}) =>
    request(`/comunidades${queryString(filters)}`),
  suggestions: (categoria = '') =>
    request(`/comunidades/sugerencias${queryString({ categoria })}`),
  show: (id) => request(`/comunidades/${encodeURIComponent(id)}`),
  create: (details, token) =>
    request('/comunidades', { method: 'POST', body: details, token }),
  update: (id, details, token) =>
    request(`/comunidades/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: details,
      token,
    }),
  archive: (id, token) =>
    request(`/comunidades/${encodeURIComponent(id)}/archivar`, {
      method: 'PATCH',
      token,
    }),
  membership: (id, token) =>
    request(`/comunidades/${encodeURIComponent(id)}/membresia`, {
      method: 'POST',
      token,
    }),
  leave: (id, token) =>
    request(`/comunidades/${encodeURIComponent(id)}/membresia`, {
      method: 'DELETE',
      token,
    }),
  members: (id, page = 1, perPage = 20) =>
    request(`/comunidades/${encodeURIComponent(id)}/miembros${queryString({ page, per_page: perPage })}`),
  posts: (id, page = 1, perPage = 20) =>
    request(`/comunidades/${encodeURIComponent(id)}/posts${queryString({ page, per_page: perPage })}`),
  createPost: (id, details, token) =>
    request(`/comunidades/${encodeURIComponent(id)}/posts`, {
      method: 'POST',
      body: details,
      token,
    }),
  pending: (id, token, page = 1, perPage = 20) =>
    request(`/comunidades/${encodeURIComponent(id)}/solicitudes${queryString({ page, per_page: perPage })}`, { token }),
  decide: (id, userId, decision, token) =>
    request(`/comunidades/${encodeURIComponent(id)}/membresias/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      body: { decision },
      token,
    }),
  invite: (id, userId, token) =>
    request(`/comunidades/${encodeURIComponent(id)}/invitar`, {
      method: 'POST',
      body: { usuario_id: userId },
      token,
    }),
  audit: (id, token, page = 1, perPage = 20) =>
    request(`/comunidades/${encodeURIComponent(id)}/auditoria${queryString({ page, per_page: perPage })}`, { token }),
}

export const storeApi = {
  list: (filters = {}) => request(`/tiendas${queryString(filters)}`),
  show: (storeId) => request(`/tiendas/${encodeURIComponent(storeId)}`),
  create: (details, token) =>
    request('/tiendas', { method: 'POST', body: details, token }),
  update: (storeId, details, token) =>
    request(`/tiendas/${encodeURIComponent(storeId)}`, {
      method: 'PATCH',
      body: details,
      token,
    }),
  requestVerification: (storeId, documentos, nota, token) =>
    request(`/tiendas/${encodeURIComponent(storeId)}/verificacion`, {
      method: 'POST',
      body: { documentos, nota },
      token,
    }),
  reviewVerification: (storeId, decision, nota, token) =>
    request(`/tiendas/${encodeURIComponent(storeId)}/verificacion`, {
      method: 'PATCH',
      body: { decision, nota },
      token,
    }),
  inventory: (storeId, token, page = 1, perPage = 20) =>
    request(`/tiendas/${encodeURIComponent(storeId)}/inventario${queryString({ page, per_page: perPage })}`, { token }),
  adjustInventory: (storeId, productId, details, token) =>
    request(`/tiendas/${encodeURIComponent(storeId)}/inventario/${encodeURIComponent(productId)}`, {
      method: 'PATCH',
      body: details,
      token,
    }),
  dashboard: (storeId, token) =>
    request(`/tiendas/${encodeURIComponent(storeId)}/dashboard`, { token }),
}

export const savedApi = {
  list: (filters = {}, token) =>
    request(`/guardados${queryString(filters)}`, { token }),
  collections: (token) => request('/guardados/colecciones', { token }),
  createCollection: (details, token) =>
    request('/guardados/colecciones', { method: 'POST', body: details, token }),
  save: (details, token) =>
    request('/guardados', { method: 'POST', body: details, token }),
  unsave: (details, token) =>
    request(`/guardados${queryString(details)}`, { method: 'DELETE', token }),
  report: (details, token) =>
    request('/reportes/contextual', { method: 'POST', body: details, token }),
}

export const moderationApi = {
  mine: (token) => request('/reportes/mis', { token }),
  appeal: (reportId, argument, token) =>
    request(`/reportes/${encodeURIComponent(reportId)}/apelacion`, {
      method: 'POST',
      body: { argumento: argument },
      token,
    }),
  queue: (filters = {}, token) =>
    request(`/moderacion/reportes${queryString(filters)}`, { token }),
  assign: (reportId, token) =>
    request(`/moderacion/reportes/${encodeURIComponent(reportId)}/asignar`, {
      method: 'PATCH',
      token,
    }),
  resolve: (reportId, details, token) =>
    request(`/moderacion/reportes/${encodeURIComponent(reportId)}/resolver`, {
      method: 'PATCH',
      body: details,
      token,
    }),
  appealQueue: (filters = {}, token) =>
    request(`/moderacion/apelaciones${queryString(filters)}`, { token }),
  resolveAppeal: (appealId, details, token) =>
    request(`/moderacion/apelaciones/${encodeURIComponent(appealId)}/resolver`, {
      method: 'PATCH',
      body: details,
      token,
    }),
  fraudQueue: (token) =>
    request('/moderacion/antifraude', { token }),
  scanProduct: (productId, token) =>
    request(`/moderacion/productos/${encodeURIComponent(productId)}/antifraude`, {
      method: 'POST',
      token,
    }),
}

export const personalDataApi = {
  sellerStats: (periodo, token) =>
    request(`/datos-vendedor${queryString({ periodo })}`, { token }),
  activity: (filters = {}, token) =>
    request(`/mi-actividad${queryString(filters)}`, { token }),
  exportData: (token) =>
    request('/datos/exportacion', {
      method: 'POST',
      body: { confirmacion: 'EXPORTAR' },
      token,
    }),
  privacyRequest: (tipo, motivo, token) =>
    request('/datos/privacidad', {
      method: 'POST',
      body: { tipo, motivo, confirmacion: 'CONFIRME' },
      token,
    }),
  privacyRequests: (token) => request('/datos/privacidad', { token }),
}

export const adminApi = {
  dashboard: (periodo, token) =>
    request(`/admin/dashboard${queryString({ periodo })}`, { token }),
  users: (filters = {}, token) =>
    request(`/admin/users${queryString(filters)}`, { token }),
  updateUser: (id, details, token) =>
    request(`/admin/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: details,
      token,
    }),
  categories: (token) => request('/admin/categorias', { token }),
  createCategory: (details, token) =>
    request('/admin/categorias', { method: 'POST', body: details, token }),
  updateCategory: (id, details, token) =>
    request(`/admin/categorias/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: details,
      token,
    }),
  notices: (token) => request('/admin/avisos', { token }),
  createNotice: (details, token) =>
    request('/admin/avisos', { method: 'POST', body: details, token }),
  configuration: (token) => request('/admin/configuracion', { token }),
  updateConfiguration: (details, token) =>
    request('/admin/configuracion', { method: 'PUT', body: details, token }),
  permissions: (token) => request('/admin/permisos', { token }),
  grantPermission: (details, token) =>
    request('/admin/permisos', { method: 'POST', body: details, token }),
  revokePermission: (id, token) =>
    request(`/admin/permisos/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      token,
    }),
  audit: (filters = {}, token) =>
    request(`/admin/auditoria${queryString(filters)}`, { token }),
  exportAudit: (token) =>
    request('/admin/auditoria/exportar', { token }),
}

export const meetingApi = {
  points: (filters = {}) => request(`/puntos-fisicos/directorio${queryString(filters)}`),
  meetings: (estado = null, token) =>
    request(`/encuentros${queryString({ estado })}`, { token }),
  create: (details, token) =>
    request('/encuentros', { method: 'POST', body: details, token }),
  update: (meetingId, details, token) =>
    request(`/encuentros/${encodeURIComponent(meetingId)}`, {
      method: 'PATCH',
      body: details,
      token,
    }),
  generateQr: (meetingId, token) =>
    request(`/encuentros/${encodeURIComponent(meetingId)}/qr`, {
      method: 'POST',
      token,
    }),
  validateQr: (tokenValue, evidencia, token) =>
    request('/encuentros/qr/validar', {
      method: 'POST',
      body: { token: tokenValue, evidencia },
      token,
    }),
}

export const reviewApi = {
  eligible: (token) => request('/resenas/elegibles', { token }),
  summary: (ambito, id) =>
    request(`/resenas/${encodeURIComponent(ambito)}/${encodeURIComponent(id)}/resumen`),
  list: (ambito, id, page = 1, perPage = 20) =>
    request(`/resenas/${encodeURIComponent(ambito)}/${encodeURIComponent(id)}${queryString({ page, per_page: perPage })}`),
  create: (details, token) =>
    request('/resenas', { method: 'POST', body: details, token }),
  respond: (reviewId, respuesta, token) =>
    request(`/resenas/${encodeURIComponent(reviewId)}/respuesta`, {
      method: 'PATCH',
      body: { respuesta },
      token,
    }),
  edit: (reviewId, details, token) =>
    request(`/resenas/${encodeURIComponent(reviewId)}/editar`, {
      method: 'PATCH',
      body: details,
      token,
    }),
  dispute: (reviewId, motivo, token) =>
    request(`/resenas/${encodeURIComponent(reviewId)}/disputa`, {
      method: 'POST',
      body: { motivo },
      token,
    }),
}

export const negotiationApi = {
  mine: (token) => request('/negociacion', { token }),
  create: (details, token) =>
    request('/ofertas', { method: 'POST', body: details, token }),
  counter: (offerId, details, token) =>
    request(`/ofertas/${encodeURIComponent(offerId)}/contraoferta`, {
      method: 'PATCH',
      body: details,
      token,
    }),
  decide: (offerId, decision, token) =>
    request(`/ofertas/${encodeURIComponent(offerId)}/decision`, {
      method: 'PATCH',
      body: { decision },
      token,
    }),
  transition: (operationId, estado, token) =>
    request(`/operaciones/${encodeURIComponent(operationId)}`, {
      method: 'PATCH',
      body: { estado },
      token,
    }),
}

export const messageApi = {
  inbox: (token, perPage = 30) =>
    request(`/mensajes${queryString({ per_page: perPage })}`, { token }),
  search: (busqueda, token, conversacionId = null) =>
    request(`/mensajes/buscar${queryString({ busqueda, conversacion_id: conversacionId })}`, { token }),
  openDirect: (usuarioId, productoId, token) =>
    request('/mensajes/directo', {
      method: 'POST',
      body: { usuario_id: usuarioId, producto_id: productoId || undefined },
      token,
    }),
  createGroup: (titulo, usuarioIds, token) =>
    request('/mensajes/grupo', {
      method: 'POST',
      body: { titulo, usuario_ids: usuarioIds },
      token,
    }),
  show: (conversationId, token) =>
    request(`/mensajes/${encodeURIComponent(conversationId)}`, { token }),
  messages: (conversationId, token, beforeId = null, perPage = 30) =>
    request(`/mensajes/${encodeURIComponent(conversationId)}/mensajes${queryString({ before_id: beforeId, per_page: perPage })}`, { token }),
  send: (conversationId, details, token) => {
    const body = new FormData()
    if (details.contenido) body.append('contenido', details.contenido)
    if (details.respondido_a_id) body.append('respondido_a_id', details.respondido_a_id)
    ;(details.adjuntos || []).forEach((file) => body.append('adjuntos[]', file))
    return request(`/mensajes/${encodeURIComponent(conversationId)}/mensajes`, {
      method: 'POST',
      body,
      token,
    })
  },
  deleteMessage: (conversationId, messageId, token) =>
    request(`/mensajes/${encodeURIComponent(conversationId)}/mensajes/${encodeURIComponent(messageId)}`, {
      method: 'DELETE',
      token,
    }),
  markRead: (conversationId, token) =>
    request(`/mensajes/${encodeURIComponent(conversationId)}/lectura`, {
      method: 'PATCH',
      token,
    }),
  preferences: (conversationId, details, token) =>
    request(`/mensajes/${encodeURIComponent(conversationId)}/preferencias`, {
      method: 'PATCH',
      body: details,
      token,
    }),
  leave: (conversationId, token) =>
    request(`/mensajes/${encodeURIComponent(conversationId)}/participacion`, {
      method: 'DELETE',
      token,
    }),
  report: (conversationId, details, token) =>
    request(`/mensajes/${encodeURIComponent(conversationId)}/reportar`, {
      method: 'POST',
      body: details,
      token,
    }),
}

export const profileApi = {
  show: (userId) => request(`/perfil/${encodeURIComponent(userId)}`),
  own: (token) => request('/perfil/me', { token }),
  updateOwn: (details, token) =>
    request('/perfil/me', { method: 'PATCH', body: details, token }),
  tab: (userId, tab, page = 1, perPage = 12) =>
    request(`/perfil/${encodeURIComponent(userId)}/tabs/${encodeURIComponent(tab)}${queryString({ page, per_page: perPage })}`),
  follow: (userId, token) =>
    request(`/perfil/${encodeURIComponent(userId)}/seguir`, { method: 'POST', token }),
  unfollow: (userId, token) =>
    request(`/perfil/${encodeURIComponent(userId)}/seguir`, { method: 'DELETE', token }),
  followers: (userId, page = 1, perPage = 20) =>
    request(`/perfil/${encodeURIComponent(userId)}/seguidores${queryString({ page, per_page: perPage })}`),
  following: (userId, page = 1, perPage = 20) =>
    request(`/perfil/${encodeURIComponent(userId)}/siguiendo${queryString({ page, per_page: perPage })}`),
  restrict: (userId, tipo, token) =>
    request(`/perfil/${encodeURIComponent(userId)}/restriccion`, {
      method: 'POST',
      body: { tipo },
      token,
    }),
  unrestrict: (userId, token) =>
    request(`/perfil/${encodeURIComponent(userId)}/restriccion`, {
      method: 'DELETE',
      token,
    }),
  deactivate: (token) =>
    request('/perfil/me/desactivar', { method: 'POST', token }),
  replaceAvatar: (file, token, altText = 'Foto de perfil') => {
    const body = new FormData()
    body.append('imagen', file)
    body.append('alt_text', altText)
    return request('/perfil/media/avatar', { method: 'POST', body, token })
  },
  replaceCover: (file, token, altText = 'Portada de perfil') => {
    const body = new FormData()
    body.append('imagen', file)
    body.append('alt_text', altText)
    return request('/perfil/media/portada', { method: 'POST', body, token })
  },
}
