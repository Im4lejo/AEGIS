import { useEffect, useState } from 'react'
import PageFrame from '../../shared/PageFrame'
import { adminApi } from '../../../services/api'

export default function Configuracion({ auth }) {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [draft, setDraft] = useState({ clave: '', valor: '', tipo: 'string', version: 1 })

  const load = () => {
    adminApi.configuration(auth?.token)
      .then(({ data }) => setItems(Array.isArray(data) ? data : []))
      .catch((requestError) => setError(requestError.message))
  }

  useEffect(load, [auth?.token])

  const save = async (event) => {
    event.preventDefault()
    if (!window.confirm('¿Confirmar el cambio global de configuración?')) return
    try {
      await adminApi.updateConfiguration(draft, auth.token)
      setMessage('Configuración versionada y registrada.')
      setDraft({ clave: '', valor: '', tipo: 'string', version: 1 })
      load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <PageFrame title="AEGIS | Configuración" auth={auth}>
      <main className="table-page">
        <h1>Configuración central</h1>
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <form onSubmit={save}>
          <input required placeholder="clave.config" value={draft.clave} onChange={(event) => setDraft({ ...draft, clave: event.target.value })} />
          <input required placeholder="Valor" value={draft.valor} onChange={(event) => setDraft({ ...draft, valor: event.target.value })} />
          <select value={draft.tipo} onChange={(event) => setDraft({ ...draft, tipo: event.target.value })}><option value="string">Texto</option><option value="integer">Entero</option><option value="boolean">Booleano</option><option value="json">JSON</option></select>
          <input type="number" min="1" value={draft.version} onChange={(event) => setDraft({ ...draft, version: Number(event.target.value) })} />
          <button type="submit">Guardar con confirmación</button>
        </form>
        {items.length === 0
          ? <p>No hay parámetros configurados.</p>
          : <table><thead><tr><th>Clave</th><th>Tipo</th><th>Versión</th><th>Valor</th></tr></thead><tbody>{items.map((item) => <tr key={item.clave}><td>{item.clave}</td><td>{item.tipo}</td><td>{item.version}</td><td>{item.valor}</td></tr>)}</tbody></table>}
      </main>
    </PageFrame>
  )
}
