const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const validationMessage = data.errors && Object.values(data.errors).flat()[0]
    throw new ApiError(validationMessage || data.message || 'No se pudo completar la solicitud.', response.status, data.errors)
  }

  return data
}

function queryString(params) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  })
  const serialized = query.toString()
  return serialized ? `?${serialized}` : ''
}

export const authApi = {
  login: (credentials) => request('/login', { method: 'POST', body: credentials }),
  register: (details) => request('/register', { method: 'POST', body: details }),
  me: (token) => request('/me', { token }),
  logout: (token) => request('/logout', { method: 'POST', token }),
}

export const productApi = {
  categories: () => request('/categorias'),
  list: (filters = {}) => request(`/productos${queryString(filters)}`),
  home: () => request('/inicio'),
  show: (id) => request(`/productos/${encodeURIComponent(id)}`),
  create: (product, token) => {
    const body = new FormData()
    Object.entries(product).forEach(([key, value]) => {
      if (key === 'imagenes') value.forEach((image) => body.append('imagenes[]', image))
      else if (value !== undefined && value !== null) body.append(key, value)
    })
    return request('/productos', { method: 'POST', body, token })
  },
}

export const forumApi = {
  list: (page = 1) => request(`/foro${queryString({ page, per_page: 50 })}`),
  create: (post, token) => {
    const body = new FormData()
    body.append('titulo', post.titulo)
    body.append('contenido', post.contenido)
    if (post.imagen) body.append('imagenes[]', post.imagen)
    return request('/foro', { method: 'POST', body, token })
  },
  comment: (postId, comentario, token) => request(`/foro/${postId}/comentarios`, {
    method: 'POST',
    body: { comentario },
    token,
  }),
}

export const profileApi = {
  show: (userId) => request(`/perfil/${encodeURIComponent(userId)}`),
}
