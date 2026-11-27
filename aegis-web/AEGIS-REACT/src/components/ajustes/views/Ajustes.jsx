import { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { preferenceApi } from '../../../services/api'
import '../css/ajustes.css'

const CATEGORIES = [
  { label: 'Apariencia', icon: 'appearance' },
  { label: 'Feed', icon: 'feed' },
  { label: 'Marketplace', icon: 'marketplace' },
  { label: 'Mensajería', icon: 'messages' },
  { label: 'Privacidad', icon: 'privacy' },
  { label: 'Notificaciones', icon: 'notifications' },
  { label: 'Seguridad', icon: 'security' },
  { label: 'Accesibilidad', icon: 'accessibility' },
  { label: 'Datos', icon: 'data' },
]

const CATEGORY_ICONS = {
  appearance: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
  feed: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>,
  marketplace: <><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></>,
  messages: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  privacy: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
  notifications: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  security: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
  accessibility: <><circle cx="12" cy="5" r="2" /><path d="M5 9h14M12 9v12m-5-7 5-2 5 2m-8 7 3-5 3 5" /></>,
  data: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 3.1-.2-.1a1.7 1.7 0 0 0-1.8-.1 1.7 1.7 0 0 0-1 1.5v.2h-3.6v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.1l-.2.1-1.8-3.1.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5v-3.6h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-3.1.2.1a1.7 1.7 0 0 0 1.8.1 1.7 1.7 0 0 0 1-1.5v-.2h3.6v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.1l.2-.1 1.8 3.1-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v3.6h-.2a1.7 1.7 0 0 0-1.5 1Z" /></>,
}

function CategoryIcon({ name }) {
  return (
    <svg
      aria-hidden="true"
      className="ajustes-menu__icon"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {CATEGORY_ICONS[name]}
    </svg>
  )
}

export default function Ajustes({ auth, onNavigate }) {
  const [active, setActive] = useState('Apariencia')
  const [preferences, setPreferences] = useState(null)
  const [version, setVersion] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!auth?.token) return
    preferenceApi.get(auth.token)
      .then(({ data, version: serverVersion }) => {
        setPreferences(data)
        setVersion(serverVersion)
      })
      .catch((requestError) => setError(requestError.message))
  }, [auth?.token])

  const setField = (section, field, value) => {
    setPreferences((actual) => ({
      ...actual,
      [section]: {
        ...actual[section],
        [field]: value,
      },
    }))
  }

  const save = async () => {
    if (!preferences) return
    setSaving(true)
    try {
      await preferenceApi.update(version, preferences, auth.token)
      document.documentElement.dataset.density = preferences.apariencia.densidad
      document.documentElement.dataset.contrast = preferences.apariencia.contraste
      document.documentElement.dataset.motion = preferences.apariencia.movimiento
      setStatus('Preferencias guardadas')
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const reset = async () => {
    try {
      const response = await preferenceApi.reset(auth.token)
      setPreferences(response.data)
      setStatus('Preferencias restablecidas')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  if (!preferences) {
    return (
      <div className="page-layout ajustes-page-layout">
        <Header title="AEGIS | Ajustes" auth={auth} onNavigate={onNavigate} />
        <main className="ajustes-page ajustes-page--loading">
          {error ? <p role="alert">{error}</p> : auth?.token
            ? <p role="status">Cargando ajustes...</p>
            : <p>Inicia sesión para consultar tus ajustes.</p>}
        </main>
        <Footer onNavigate={onNavigate} />
      </div>
    )
  }

  return (
    <div className="page-layout ajustes-page-layout">
      <Header title="AEGIS | Ajustes" auth={auth} onNavigate={onNavigate} />
      <main className="ajustes-page">
        <div className="ajustes-layout">
          <nav className="ajustes-menu" aria-label="Categorías de ajustes">
            <h2 className="ajustes-menu__heading">
              <CategoryIcon name="settings" />
              Ajustes de la cuenta
            </h2>
            {CATEGORIES.map(({ label, icon }) => (
              <button
                type="button"
                key={label}
                aria-pressed={active === label}
                className={active === label ? 'active' : ''}
                onClick={() => setActive(label)}
              >
                <CategoryIcon name={icon} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <div className="ajustes-content">
            <h1>Ajustes</h1>
            {error && <p role="alert">{error}</p>}
            {status && <p role="status">{status}</p>}
            <section className="ajustes-panel" aria-live="polite">
            {active === 'Apariencia' && (
              <>
                <h2>Apariencia</h2>
                <label>Tema
                  <select value={preferences.apariencia.tema} onChange={(event) => setField('apariencia', 'tema', event.target.value)}>
                    <option value="system">Sistema</option>
                    <option value="light">Claro</option>
                    <option value="dark">Oscuro</option>
                  </select>
                </label>
                <label>Acento
                  <select value={preferences.apariencia.acento} onChange={(event) => setField('apariencia', 'acento', event.target.value)}>
                    <option value="indigo">Índigo</option>
                    <option value="violet">Violeta</option>
                    <option value="blue">Azul</option>
                    <option value="green">Verde</option>
                  </select>
                </label>
                <label>Densidad
                  <select value={preferences.apariencia.densidad} onChange={(event) => setField('apariencia', 'densidad', event.target.value)}>
                    <option value="compacta">Compacta</option>
                    <option value="normal">Normal</option>
                    <option value="espaciada">Espaciada</option>
                  </select>
                </label>
                <label>Contraste
                  <select value={preferences.apariencia.contraste} onChange={(event) => setField('apariencia', 'contraste', event.target.value)}>
                    <option value="estandar">Estándar</option>
                    <option value="alto">Alto</option>
                  </select>
                </label>
              </>
            )}
            {active === 'Feed' && (
              <>
                <h2>Feed</h2>
                <label>Inicio
                  <select value={preferences.feed.inicio} onChange={(event) => setField('feed', 'inicio', event.target.value)}>
                    <option value="para-ti">Para ti</option>
                    <option value="siguiendo">Siguiendo</option>
                    <option value="recientes">Recientes</option>
                  </select>
                </label>
              </>
            )}
            {active === 'Marketplace' && (
              <>
                <h2>Marketplace</h2>
                <label>Ciudad aproximada
                  <input type="text" value={preferences.marketplace.ciudad_aprox || ''} onChange={(event) => setField('marketplace', 'ciudad_aprox', event.target.value)} />
                </label>
                <p>La moneda permanece COP: los precios canónicos no se convierten.</p>
              </>
            )}
            {active === 'Mensajería' && (
              <>
                <h2>Mensajería</h2>
                <label>Mensajes desconocidos
                  <select value={preferences.mensajeria.mensajes_desconocidos} onChange={(event) => setField('mensajeria', 'mensajes_desconocidos', event.target.value)}>
                    <option value="todos">Todos</option>
                    <option value="solicitud">Solicitud</option>
                    <option value="nadie">Nadie</option>
                  </select>
                </label>
                <label><input type="checkbox" checked={preferences.mensajeria.confirmaciones_lectura} onChange={(event) => setField('mensajeria', 'confirmaciones_lectura', event.target.checked)} />Confirmaciones de lectura</label>
              </>
            )}
            {active === 'Privacidad' && (
              <>
                <h2>Privacidad</h2>
                <label><input type="checkbox" checked={preferences.privacidad.perfil_publico} onChange={(event) => setField('privacidad', 'perfil_publico', event.target.checked)} />Perfil público</label>
                <label><input type="checkbox" checked={preferences.privacidad.mostrar_seguidores} onChange={(event) => setField('privacidad', 'mostrar_seguidores', event.target.checked)} />Mostrar seguidores</label>
                <label><input type="checkbox" checked={preferences.privacidad.mostrar_presencia} onChange={(event) => setField('privacidad', 'mostrar_presencia', event.target.checked)} />Mostrar presencia</label>
              </>
            )}
            {active === 'Accesibilidad' && (
              <>
                <h2>Accesibilidad</h2>
                <label>Movimiento reducido
                  <select value={preferences.accesibilidad.reducir_movimiento} onChange={(event) => setField('accesibilidad', 'reducir_movimiento', event.target.value)}>
                    <option value="system">Seguir sistema</option>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </label>
                <label><input type="checkbox" checked={preferences.accesibilidad.subrayar_enlaces} onChange={(event) => setField('accesibilidad', 'subrayar_enlaces', event.target.checked)} />Subrayar enlaces</label>
              </>
            )}
            {['Notificaciones','Seguridad','Datos'].includes(active) && (
              <>
                <h2>{active}</h2>
                <p>Gestiona esta categoría desde el centro disponible y configura seguridad desde tu cuenta.</p>
              </>
            )}
            <div className="ajustes-actions">
              <button type="button" onClick={reset}>Restablecer preferencias</button>
              <button type="button" onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
            </div>
            </section>
          </div>
        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
