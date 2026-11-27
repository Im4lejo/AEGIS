import { useEffect, useState, useSyncExternalStore } from 'react'
import { Select } from '../components/shared/ui'
import { ThemeContext, useTheme } from './ThemeContext'
import { preferenceApi } from '../services/api'

const STORAGE_KEY = 'aegis.theme.preference.v1'
const THEMES = ['system', 'light', 'dark']
function readPreference() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return { theme: THEMES.includes(stored) ? stored : 'system', error: '' }
  } catch (error) {
    if (error?.name !== 'SecurityError') throw error
    return {
      theme: 'system',
      error:
        'El navegador no permite guardar la apariencia en este dispositivo.',
    }
  }
}

function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
    ? 'dark'
    : 'light'
}

function subscribeToSystemTheme(onChange) {
  const media = window.matchMedia?.('(prefers-color-scheme: dark)')
  if (!media) return () => {}
  if (media.addEventListener) {
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }
  media.addListener?.(onChange)
  return () => media.removeListener?.(onChange)
}

export function ThemeProvider({ children }) {
  const [initialPreference] = useState(readPreference)
  const [theme, setTheme] = useState(initialPreference.theme)
  const systemPreference = useSyncExternalStore(
    subscribeToSystemTheme,
    systemTheme,
    () => 'light',
  )
  const resolvedTheme = theme === 'system' ? systemPreference : theme
  const [storageError, setStorageError] = useState(initialPreference.error)

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    return () => {
      delete document.documentElement.dataset.theme
    }
  }, [resolvedTheme])

  const chooseTheme = (nextTheme) => {
    if (!THEMES.includes(nextTheme)) return
    setTheme(nextTheme)
    setStorageError('')
    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme)
    } catch (error) {
      if (!['SecurityError', 'QuotaExceededError'].includes(error?.name))
        throw error
      setStorageError('No se pudo guardar la preferencia de apariencia.')
    }
  }

  const value = {
    theme,
    resolvedTheme,
    setTheme: chooseTheme,
    storageError,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function ThemeSelector({ className = '' }) {
  const { theme, setTheme, storageError } = useTheme()
  return (
    <div className={`theme-select ${className}`.trim()}>
      <Select
        aria-label="Preferencia de apariencia"
        label="Apariencia"
        onChange={(event) => setTheme(event.target.value)}
        value={theme}
      >
        <option value="system">Sistema</option>
        <option value="light">Claro</option>
        <option value="dark">Oscuro</option>
      </Select>
      {storageError && (
        <span className="theme-select__error" role="status">
          {storageError}
        </span>
      )}
    </div>
  )
}

export function ThemeToggle({ className = '' }) {
  const { resolvedTheme, setTheme, storageError } = useTheme()
  const oscuro = resolvedTheme === 'dark'

  return (
    <div className={`theme-control ${className}`.trim()}>
      <button
        type="button"
        className={`theme-toggle theme-toggle--${oscuro ? 'dark' : 'light'}`}
        aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        aria-pressed={oscuro}
        title={oscuro ? 'Modo oscuro' : 'Modo claro'}
        onClick={() => setTheme(oscuro ? 'light' : 'dark')}
      >
        {oscuro ? (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="22" />
            <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" />
            <line x1="18.4" y1="18.4" x2="19.8" y2="19.8" />
            <line x1="2" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="22" y2="12" />
            <line x1="4.2" y1="19.8" x2="5.6" y2="18.4" />
            <line x1="18.4" y1="5.6" x2="19.8" y2="4.2" />
          </svg>
        )}
      </button>
      {storageError && (
        <span className="theme-select__error" role="status">
          {storageError}
        </span>
      )}
    </div>
  )
}
