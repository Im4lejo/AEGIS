import { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import WorkspaceChrome from '../../layouts/WorkspaceChrome'
import Footer from '../../layouts/Footer'
import { notificationApi } from '../../../services/api'
import '../css/notificaciones.css'

export default function Notificaciones({ auth, onNavigate }) {
  const [categoria, setCategoria] = useState('todas')
  const [estado, setEstado] = useState('todas')
  const [items, setItems] = useState([])
  const [preferences, setPreferences] = useState([])
  const [error, setError] = useState('')

  const cargar = async () => {
    try {
      const filters = { per_page: 50, estado }
      if (categoria !== 'todas') filters.categoria = categoria
      const [{ data }, prefs] = await Promise.all([
        notificationApi.inbox(filters, auth.token),
        notificationApi.preferences(auth.token),
      ])
      setItems(data)
      setPreferences(prefs.data)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  useEffect(() => {
    if (auth?.token) cargar()
  }, [auth?.token, categoria, estado])

  const updatePreference = async (category, field, value) => {
    try {
      await notificationApi.updatePreference({
        categoria: category,
        [field]: value,
      }, auth.token)
      await cargar()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <div className="page-layout">
      <Header title="AEGIS | Notificaciones" auth={auth} onNavigate={onNavigate} />
      <WorkspaceChrome auth={auth} onNavigate={onNavigate}>
      <main className="notificaciones-page">
        <h1>Notificaciones</h1>
        {error && <p role="alert">{error}</p>}
        <nav className="notificaciones-filtros" aria-label="Filtros de notificaciones">
          {['todas','social','marketplace','comunidad','seguridad','sistema'].map((value) => (
            <button type="button" key={value} className={categoria === value ? 'active' : ''} onClick={() => setCategoria(value)}>
              {value}
            </button>
          ))}
          <select value={estado} onChange={(event) => setEstado(event.target.value)}>
            <option value="todas">Todas</option>
            <option value="no_leidas">No leídas</option>
            <option value="leidas">Leídas</option>
            <option value="archivadas">Archivadas</option>
          </select>
          <button type="button" onClick={() => notificationApi.readAll(categoria === 'todas' ? null : categoria, auth.token).then(cargar)}>
            Marcar todas
          </button>
        </nav>
        <section className="notificaciones-lista" aria-live="polite">
          {items.length === 0 ? <p>No hay notificaciones en este filtro.</p> : items.map((item) => (
            <article className={item.leida ? 'notificacion-item' : 'notificacion-item unread'} key={item.id}>
              <strong>{item.titulo}</strong>
              <p>{item.mensaje}</p>
              <small>{item.categoria}</small>
              <div>
                {!item.leida && <button type="button" onClick={() => notificationApi.read(item.id, auth.token).then(cargar)}>Marcar leída</button>}
                <button type="button" onClick={() => notificationApi.archive(item.id, auth.token).then(cargar)}>Archivar</button>
              </div>
            </article>
          ))}
        </section>
        <section className="notificaciones-preferencias">
          <h2>Preferencias</h2>
          {preferences.map((preference) => (
            <div className="notificacion-preferencia" key={preference.categoria}>
              <strong>{preference.categoria}</strong>
              <label>
                <input type="checkbox" checked={preference.in_app} disabled={preference.categoria === 'seguridad'} onChange={(event) => updatePreference(preference.categoria, 'in_app', event.target.checked)} />
                En app
              </label>
              <label>
                <input type="checkbox" checked={preference.email} onChange={(event) => updatePreference(preference.categoria, 'email', event.target.checked)} />
                Email
              </label>
              <label>
                <input type="checkbox" checked={preference.push_web} onChange={(event) => updatePreference(preference.categoria, 'push_web', event.target.checked)} />
                Push web
              </label>
            </div>
          ))}
        </section>
      </main>
      </WorkspaceChrome>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
