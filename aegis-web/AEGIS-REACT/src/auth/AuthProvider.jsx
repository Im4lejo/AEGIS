import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError, authApi } from '../services/api'
import { AuthContext } from './AuthContext'

const TOKEN_KEY = 'aegis.web.token.v1'
const LEGACY_KEYS = ['aegisToken', 'aegisUser']
const STORAGE_WARNING =
  'El navegador no pudo guardar la sesión de forma temporal. Mantén esta pestaña abierta.'

function isStorageError(error) {
  return ['SecurityError', 'QuotaExceededError'].includes(error?.name)
}

function readInitialState() {
  let token = null
  let storageWarning = ''

  try {
    token = window.sessionStorage.getItem(TOKEN_KEY)
  } catch (error) {
    if (!isStorageError(error)) throw error
    storageWarning = STORAGE_WARNING
  }

  try {
    LEGACY_KEYS.forEach((key) => window.localStorage.removeItem(key))
  } catch (error) {
    if (!isStorageError(error)) throw error
    storageWarning =
      'No se pudo borrar una sesión persistente anterior del navegador.'
  }

  return { token, storageWarning }
}

function removeStoredToken() {
  try {
    window.sessionStorage.removeItem(TOKEN_KEY)
    return ''
  } catch (error) {
    if (!isStorageError(error)) throw error
    return STORAGE_WARNING
  }
}

export function AuthProvider({ children }) {
  const [initialState] = useState(readInitialState)
  const [token, setToken] = useState(initialState.token)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(initialState.token))
  const [error, setError] = useState('')
  const [storageWarning, setStorageWarning] = useState(
    initialState.storageWarning,
  )
  const [refreshVersion, setRefreshVersion] = useState(0)

  const saveSession = useCallback((session) => {
    let warning = ''
    try {
      window.sessionStorage.setItem(TOKEN_KEY, session.token)
    } catch (storageError) {
      if (!isStorageError(storageError)) throw storageError
      warning = STORAGE_WARNING
    }

    setToken(session.token)
    setUser(session.usuario)
    setError('')
    setStorageWarning(warning)
  }, [])

  const clearSession = useCallback(() => {
    setStorageWarning(removeStoredToken())
    setToken(null)
    setUser(null)
    setLoading(false)
    setError('')
  }, [])

  useEffect(() => {
    if (!token) return undefined

    let active = true
    authApi
      .me(token)
      .then(({ usuario }) => {
        if (active) setUser(usuario)
      })
      .catch((requestError) => {
        if (!active) return
        if (requestError instanceof ApiError && requestError.status === 401) {
          setStorageWarning(removeStoredToken())
          setToken(null)
          setUser(null)
        } else {
          setUser(null)
          setError(requestError.message)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [token, refreshVersion])

  const login = useCallback(
    async (credentials) => {
      const session = await authApi.login(credentials)
      saveSession(session)
      return session.usuario
    },
    [saveSession],
  )

  const register = useCallback((details) => authApi.register(details), [])

  const logout = useCallback(async () => {
    const currentToken = token
    clearSession()
    if (currentToken) {
      try {
        await authApi.logout(currentToken)
      } catch (requestError) {
        setError(
          `La sesión se cerró en esta pestaña, pero el servidor no confirmó el cierre: ${requestError.message}`,
        )
        throw requestError
      }
    }
  }, [clearSession, token])

  const retrySession = useCallback(() => {
    if (!token) return
    setLoading(true)
    setRefreshVersion((version) => version + 1)
  }, [token])

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      error,
      storageWarning,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      clearSession,
      retrySession,
    }),
    [
      token,
      user,
      loading,
      error,
      storageWarning,
      login,
      register,
      logout,
      clearSession,
      retrySession,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
