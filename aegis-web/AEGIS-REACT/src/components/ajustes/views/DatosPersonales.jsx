import { useEffect, useState } from 'react'
import PageFrame from '../../shared/PageFrame'
import { personalDataApi } from '../../../services/api'

export default function DatosPersonales({ auth }) {
  const [activity, setActivity] = useState([])
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = () => {
    Promise.all([
      personalDataApi.activity({}, auth?.token),
      personalDataApi.privacyRequests(auth?.token),
    ])
      .then(([activityResult, requestResult]) => {
        setActivity(activityResult.data || [])
        setRequests(requestResult.data || [])
        setError('')
      })
      .catch((requestError) => setError(requestError.message))
  }

  useEffect(load, [auth?.token])

  const exportData = async () => {
    if (!window.confirm('¿Descargar una copia JSON de tus datos personales?')) return
    try {
      await personalDataApi.exportData(auth.token)
      setMessage('Solicitud de exportación procesada.')
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const privacyRequest = async (tipo) => {
    const warning = tipo === 'eliminacion'
      ? 'La eliminación puede conservar registros comerciales, investigaciones y auditorías legalmente retenibles.'
      : 'Esta acción afectará el acceso a tu cuenta.'
    if (!window.confirm(`${warning}\n\n¿Confirmar solicitud?`)) return
    try {
      await personalDataApi.privacyRequest(tipo, 'Solicitud desde el panel web.', auth.token)
      setMessage('Solicitud registrada y verificada.')
      setError('')
      load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <PageFrame title="AEGIS | Datos personales" auth={auth}>
      <main className="table-page">
        <h1>Mi actividad y datos</h1>
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}

        <section aria-label="Historial">
          <h2>Historial reciente</h2>
          {activity.length === 0
            ? <p>No hay actividad registrada todavía.</p>
            : <table><thead><tr><th>Tipo</th><th>Referencia</th><th>Fecha</th></tr></thead><tbody>{activity.map((item) => <tr key={`${item.tipo}-${item.id}`}><td>{item.tipo}</td><td>{item.titulo || item.id}</td><td>{item.fecha}</td></tr>)}</tbody></table>}
        </section>

        <section aria-label="Exportación y privacidad">
          <h2>Datos de la cuenta</h2>
          <button type="button" onClick={exportData}>Descargar mis datos JSON</button>
          <button type="button" onClick={() => privacyRequest('desactivacion')}>Solicitar desactivación</button>
          <button type="button" onClick={() => privacyRequest('eliminacion')}>Solicitar eliminación</button>
          <p>
            Los datos públicos visibles por otros pueden conservarse mientras exista una referencia comercial.
            Las operaciones, investigaciones y auditorías pueden retenerse según requisitos legales.
          </p>
        </section>

        <section aria-label="Solicitudes de privacidad">
          <h2>Solicitudes</h2>
          {requests.length === 0
            ? <p>No hay solicitudes registradas.</p>
            : requests.map((item) => <article key={item.id}><strong>{item.tipo}</strong> · {item.estado}</article>)}
        </section>
      </main>
    </PageFrame>
  )
}
