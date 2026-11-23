import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError, authApi } from '../services/api'
import { AuthContext } from './AuthContext'

const TOKEN_KEY = 'aegisToken'
const USER_KEY = 'aegisUser'

function readUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(readUser)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))
  const [error, setError] = useState('')

  const saveSession = useCallback((session) => {
    localStorage.setItem(TOKEN_KEY, session.token)
    localStorage.setItem(USER_KEY, JSON.stringify(session.usuario))
    setToken(session.token)
    setUser(session.usuario)
    setError('')
  }, [])

  useEffect(() => {
    if (!token) return undefined

    let active = true
    authApi.me(token)
      .then(({ usuario }) => {
        if (!active) return
        localStorage.setItem(USER_KEY, JSON.stringify(usuario))
        setUser(usuario)
      })
      .catch((requestError) => {
        if (!active) return
        if (requestError instanceof ApiError && requestError.status === 401) {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setToken(null)
          setUser(null)
        } else {
          setError(requestError.message)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [token])

  const login = useCallback(async (credentials) => {
    const session = await authApi.login(credentials)
    saveSession(session)
    return session.usuario
  }, [saveSession])

  const register = useCallback(async (details) => {
    const session = await authApi.register(details)
    saveSession(session)
    return session.usuario
  }, [saveSession])

  const logout = useCallback(async () => {
    const currentToken = token
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    setError('')
    if (currentToken) {
      try {
        await authApi.logout(currentToken)
      } catch (requestError) {
        setError(`La sesión se cerró en este dispositivo, pero el servidor no confirmó el cierre: ${requestError.message}`)
        throw requestError
      }
    }
  }, [token])

  const value = useMemo(() => ({
    token,
    user,
    loading,
    error,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
  }), [token, user, loading, error, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
