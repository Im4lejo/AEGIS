import { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { EmptyState, ErrorState, LoadingState } from '../../shared/ApiState'
import { advancedContentApi, communityApi } from '../../../services/api'
import '../css/comunidades.css'

export default function Comunidades({ auth, onNavigate }) {
  const [communities, setCommunities] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState('')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    normas: '',
    categoria: '',
    visibilidad: 'publica',
  })
  const [events, setEvents] = useState([])
  const [eventForm, setEventForm] = useState({
    titulo: '',
    descripcion: '',
    lugar: '',
    fecha_inicio: '',
    fecha_fin: '',
    cupo: '',
  })

  const load = () => {
    setLoading(true)
    communityApi.list({ per_page: 50 })
      .then(({ data }) => {
        setCommunities(data)
        setError(null)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCommunity = async (id) => {
    try {
      const { data } = await communityApi.show(id)
      setSelected(data)
      const eventsResult = await advancedContentApi.events(id)
      setEvents(Array.isArray(eventsResult.data) ? eventsResult.data : [])
      setError(null)
    } catch (requestError) {
      setError(requestError)
    }
  }

  const submitCommunity = async (event) => {
    event.preventDefault()
    if (!auth?.isAuthenticated) {
      onNavigate?.('/login')
      return
    }
    try {
      const { data } = await communityApi.create(form, auth.token)
      setCreating(false)
      setSelected(data)
      setCommunities((items) => [data, ...items])
      setToast('Comunidad creada')
    } catch (requestError) {
      setToast(requestError.message)
    }
  }

  const submitEvent = async (event) => {
    event.preventDefault()
    if (!selected?.membership?.estado || selected.membership.estado !== 'activo') {
      setToast('Debes pertenecer a la comunidad.')
      return
    }
    try {
      const details = {
        ...eventForm,
        cupo: eventForm.cupo ? Number(eventForm.cupo) : null,
        fecha_fin: eventForm.fecha_fin || null,
      }
      await advancedContentApi.createEvent(selected.id, details, auth?.token)
      const eventsResult = await advancedContentApi.events(selected.id)
      setEvents(Array.isArray(eventsResult.data) ? eventsResult.data : [])
      setEventForm({ titulo: '', descripcion: '', lugar: '', fecha_inicio: '', fecha_fin: '', cupo: '' })
      setToast('Evento publicado')
    } catch (requestError) {
      setToast(requestError.message)
    }
  }

  const participate = async (eventId, estado) => {
    if (!auth?.isAuthenticated) {
      onNavigate?.('/login')
      return
    }
    try {
      await advancedContentApi.participate(eventId, { estado, recordatorio: true }, auth.token)
      setToast('Tu participación fue registrada')
    } catch (requestError) {
      setToast(requestError.message)
    }
  }

  const toggleMembership = async () => {
    if (!auth?.isAuthenticated) {
      onNavigate?.('/login')
      return
    }
    try {
      const isMember = selected?.membership?.estado === 'activo'
      const result = isMember
        ? await communityApi.leave(selected.id, auth.token)
        : await communityApi.membership(selected.id, auth.token)
      setToast(result.message)
      await openCommunity(selected.id)
    } catch (requestError) {
      setToast(requestError.message)
    }
  }

  return (
    <div className="page-layout comunidades-layout">
      <Header title="AEGIS | Comunidades" auth={auth} onNavigate={onNavigate} />
      <main className="comunidades-page">
        <div className="comunidades-heading">
          <div>
            <p>Grupos especializados</p>
            <h1>Comunidades</h1>
          </div>
          {auth?.isAuthenticated && (
            <button type="button" onClick={() => setCreating((value) => !value)}>
              {creating ? 'Cancelar' : 'Crear comunidad'}
            </button>
          )}
        </div>

        {creating && (
          <form className="comunidad-form" onSubmit={submitCommunity}>
            <label>
              Nombre
              <input required maxLength={150} value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
            </label>
            <label>
              Descripción
              <textarea maxLength={5000} value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} />
            </label>
            <label>
              Normas
              <textarea maxLength={10000} value={form.normas} onChange={(event) => setForm({ ...form, normas: event.target.value })} />
            </label>
            <label>
              Categoría
              <input maxLength={100} value={form.categoria} onChange={(event) => setForm({ ...form, categoria: event.target.value })} />
            </label>
            <label>
              Visibilidad
              <select value={form.visibilidad} onChange={(event) => setForm({ ...form, visibilidad: event.target.value })}>
                <option value="publica">Pública</option>
                <option value="privada">Privada</option>
                <option value="invitacion">Por invitación</option>
              </select>
            </label>
            <button type="submit">Crear</button>
          </form>
        )}

        {error && <ErrorState error={error} compact />}
        {loading ? (
          <LoadingState message="Cargando comunidades..." />
        ) : communities.length === 0 ? (
          <EmptyState title="Sin comunidades" message="Sé el primero en crear una comunidad." />
        ) : (
          <div className="comunidades-grid">
            {communities.map((community) => (
              <article className="comunidad-card" key={community.id}>
                <div className="comunidad-card__cover">
                  {community.portada_url
                    ? <img src={community.portada_url} alt="" />
                    : <span>{community.nombre[0]}</span>}
                </div>
                <h2>{community.nombre}</h2>
                <p>{community.descripcion || 'Sin descripción.'}</p>
                <div className="comunidad-card__meta">
                  <span>{community.miembros_count || 0} miembros</span>
                  <span>{community.visibilidad}</span>
                </div>
                <button type="button" onClick={() => openCommunity(community.id)}>Ver comunidad</button>
              </article>
            ))}
          </div>
        )}

        {selected && (
          <section className="comunidad-detail" aria-label={`Comunidad ${selected.nombre}`}>
            <button type="button" className="comunidad-detail__close" onClick={() => setSelected(null)}>Cerrar</button>
            <h2>{selected.nombre}</h2>
            <p>{selected.descripcion || 'Sin descripción.'}</p>
            {selected.normas && (
              <div>
                <h3>Normas</h3>
                <p>{selected.normas}</p>
              </div>
            )}
            <button type="button" onClick={toggleMembership}>
              {selected.membership?.estado === 'activo'
                ? 'Salir'
                : selected.membership?.estado === 'solicitado'
                  ? 'Solicitud enviada'
                  : selected.visibilidad === 'privada'
                    ? 'Solicitar acceso'
                    : 'Unirme'}
            </button>
            <section className="comunidad-events" aria-label="Eventos de la comunidad">
              <h3>Eventos</h3>
              {selected.membership?.estado === 'activo'
                && ['owner', 'moderador'].includes(selected.membership?.rol)
                && (
                  <form className="comunidad-event-form" onSubmit={submitEvent}>
                    <label>Título<input required maxLength={200} value={eventForm.titulo} onChange={(event) => setEventForm({ ...eventForm, titulo: event.target.value })} /></label>
                    <label>Descripción<textarea maxLength={5000} value={eventForm.descripcion} onChange={(event) => setEventForm({ ...eventForm, descripcion: event.target.value })} /></label>
                    <label>Lugar<input maxLength={255} value={eventForm.lugar} onChange={(event) => setEventForm({ ...eventForm, lugar: event.target.value })} /></label>
                    <label>Inicio<input required type="datetime-local" value={eventForm.fecha_inicio} onChange={(event) => setEventForm({ ...eventForm, fecha_inicio: event.target.value })} /></label>
                    <label>Fin<input type="datetime-local" value={eventForm.fecha_fin} onChange={(event) => setEventForm({ ...eventForm, fecha_fin: event.target.value })} /></label>
                    <label>Cupo<input type="number" min="1" max="100000" value={eventForm.cupo} onChange={(event) => setEventForm({ ...eventForm, cupo: event.target.value })} /></label>
                    <button type="submit">Crear evento</button>
                  </form>
                )}
              {events.length === 0
                ? <p>No hay eventos próximos.</p>
                : events.map((eventItem) => (
                    <article className="comunidad-event" key={eventItem.id}>
                      <h4>{eventItem.titulo}</h4>
                      <p>{eventItem.descripcion || 'Sin descripción.'}</p>
                      <p>{eventItem.lugar || 'Lugar por confirmar'} · {new Date(eventItem.fecha_inicio).toLocaleString('es-CO')}</p>
                      {auth?.isAuthenticated && (
                        <div>
                          <button type="button" onClick={() => participate(eventItem.id, 'asistira')}>Asistiré</button>
                          <button type="button" onClick={() => participate(eventItem.id, 'interesado')}>Me interesa</button>
                        </div>
                      )}
                    </article>
                  ))}
            </section>
          </section>
        )}

        {toast && <div className="comunidades-toast" role="status">{toast}</div>}
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
