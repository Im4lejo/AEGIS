import { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import WorkspaceChrome from '../../layouts/WorkspaceChrome'
import Footer from '../../layouts/Footer'
import PageFrame from '../../shared/PageFrame'
import { preferenceApi } from '../../../services/api'
import '../css/ajustes.css'

const CATEGORIES = [
  'Apariencia',
  'Feed',
  'Marketplace',
  'Mensajería',
  'Privacidad',
  'Notificaciones',
  'Seguridad',
  'Accesibilidad',
  'Datos',
]

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
      <PageFrame title="AEGIS | Ajustes" auth={auth} onNavigate={onNavigate}>
        <main className="ajustes-page">
          {error ? <p role="alert">{error}</p> : auth?.token
            ? <p role="status">Cargando ajustes...</p>
            : <p>Inicia sesión para consultar tus ajustes.</p>}
        </main>
      </PageFrame>
    )
  }

  return (
    <div className="page-layout">
      <Header title="AEGIS | Ajustes" auth={auth} onNavigate={onNavigate} />
      <WorkspaceChrome auth={auth} onNavigate={onNavigate}>
      <main className="ajustes-page">
        <h1>Ajustes</h1>
        {error && <p role="alert">{error}</p>}
        {status && <p role="status">{status}</p>}
        <div className="ajustes-layout">
          <nav className="ajustes-menu" aria-label="Categorías de ajustes">
            {CATEGORIES.map((category) => (
              <button type="button" key={category} className={active === category ? 'active' : ''} onClick={() => setActive(category)}>
                {category}
              </button>
            ))}
          </nav>
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
      </main>
      </WorkspaceChrome>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
