import { useEffect, useState } from 'react'
import PageFrame from '../../shared/PageFrame'
import { adminApi } from '../../../services/api'

export default function Auditoria({ auth }) {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    adminApi.audit({}, auth?.token)
      .then(({ data }) => setRows(Array.isArray(data) ? data : []))
      .catch((requestError) => setError(requestError.message))
  }, [auth?.token])

  const exportAudit = async () => {
    try {
      await adminApi.exportAudit(auth.token)
      setMessage('La exportación fue registrada y autorizada por el servidor.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <PageFrame title="AEGIS | Auditoría" auth={auth}>
      <main className="table-page">
        <h1>Auditoría administrativa</h1>
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <button type="button" onClick={exportAudit}>Exportar CSV controlada</button>
        {rows.length === 0
          ? <p>No hay registros visibles.</p>
          : <table><thead><tr><th>Fecha</th><th>Actor</th><th>Acción</th><th>Recurso</th><th>Hash</th></tr></thead>
              <tbody>{rows.map((row) => <tr key={row.id}><td>{row.fecha}</td><td>{row.actor}</td><td>{row.accion}</td><td>{row.recurso_tipo} #{row.recurso_id}</td><td><code>{row.hash?.slice(0, 12)}</code></td></tr>)}</tbody></table>}
      </main>
    </PageFrame>
  )
}
