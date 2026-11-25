import { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import WorkspaceChrome from '../../layouts/WorkspaceChrome'
import Footer from '../../layouts/Footer'
import { EmptyState, ErrorState, LoadingState } from '../../shared/ApiState'
import { storeApi } from '../../../services/api'
import '../css/tiendas.css'

export default function Tiendas({ auth, onNavigate }) {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    tipo: 'tienda',
    descripcion: '',
    politicas: '',
    categorias: [],
    ciudad_aprox: '',
  })
  const [toast, setToast] = useState('')

  useEffect(() => {
    let active = true
    storeApi.list({ per_page: 50 })
      .then(({ data }) => {
        if (active) setStores(data)
      })
      .catch((requestError) => {
        if (active) setError(requestError)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const openStore = async (id) => {
    try {
      const result = await storeApi.show(id)
      setSelected(result)
    } catch (requestError) {
      setError(requestError)
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!auth?.isAuthenticated) {
      onNavigate?.('/login')
      return
    }
    try {
      const { data } = await storeApi.create(form, auth.token)
      setStores((actual) => [data, ...actual])
      setCreating(false)
      setToast('Tienda creada')
    } catch (requestError) {
      setToast(requestError.message)
    }
  }

  return (
    <div className="page-layout tiendas-layout">
      <Header title="AEGIS | Tiendas" auth={auth} onNavigate={onNavigate} />
      <WorkspaceChrome auth={auth} onNavigate={onNavigate}>
      <main className="tiendas-page">
        <div className="tiendas-heading">
          <div>
            <p>Vendedores y establecimientos</p>
            <h1>Tiendas</h1>
          </div>
          {auth?.isAuthenticated && (
            <button type="button" onClick={() => setCreating((value) => !value)}>
              {creating ? 'Cancelar' : 'Crear tienda'}
            </button>
          )}
        </div>

        {creating && (
          <form className="tienda-form" onSubmit={submit}>
            <label>
              Nombre
              <input required maxLength={150} value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
            </label>
            <label>
              Tipo
              <select value={form.tipo} onChange={(event) => setForm({ ...form, tipo: event.target.value })}>
                <option value="particular">Particular</option>
                <option value="tienda">Tienda</option>
                <option value="establecimiento">Establecimiento físico</option>
              </select>
            </label>
            <label>
              Descripción
              <textarea maxLength={5000} value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} />
            </label>
            <label>
              Políticas
              <textarea maxLength={10000} value={form.politicas} onChange={(event) => setForm({ ...form, politicas: event.target.value })} />
            </label>
            <label>
              Ciudad aproximada
              <input maxLength={100} value={form.ciudad_aprox} onChange={(event) => setForm({ ...form, ciudad_aprox: event.target.value })} />
            </label>
            <button type="submit">Crear tienda</button>
          </form>
        )}

        {error && <ErrorState error={error} compact />}
        {loading ? (
          <LoadingState message="Cargando tiendas..." />
        ) : stores.length === 0 ? (
          <EmptyState title="Sin tiendas" message="Aún no hay tiendas públicas." />
        ) : (
          <div className="tiendas-grid">
            {stores.map((store) => (
              <article className="tienda-card" key={store.id}>
                <div className="tienda-card__logo">
                  {store.logo_url
                    ? <img src={store.logo_url} alt={`Logo de ${store.nombre}`} />
                    : <span>{store.nombre[0]}</span>}
                </div>
                <h2>{store.nombre}</h2>
                <p>{store.descripcion || 'Sin descripción.'}</p>
                <div className="tienda-card__meta">
                  <span>{store.tipo}</span>
                  {store.estado_verificacion === 'aprobada' && <strong>Verificada</strong>}
                </div>
                <button type="button" onClick={() => openStore(store.id)}>Ver tienda</button>
              </article>
            ))}
          </div>
        )}

        {selected && (
          <section className="tienda-detail" aria-label={`Tiendan ${selected.data.nombre}`}>
            <button type="button" onClick={() => setSelected(null)}>Cerrar</button>
            <h2>{selected.data.nombre}</h2>
            {selected.data.estado_verificacion === 'aprobada' && <strong>Verificada</strong>}
            <p>{selected.data.descripcion || 'Sin descripción.'}</p>
            <p>{selected.data.ciudad_aprox || 'Ubicación no indicada'}</p>
          </section>
        )}

        {toast && <div className="tiendas-toast" role="status">{toast}</div>}
      </main>
      </WorkspaceChrome>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
