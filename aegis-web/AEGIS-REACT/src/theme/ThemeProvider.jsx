import { useEffect, useState, useSyncExternalStore } from 'react'
import { Select } from '../components/shared/ui'
import { ThemeContext, useTheme } from './ThemeContext'

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
