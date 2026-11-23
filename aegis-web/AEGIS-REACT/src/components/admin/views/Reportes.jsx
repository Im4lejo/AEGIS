import { useEffect, useState } from 'react'
import PageFrame from '../../shared/PageFrame'
import { moderationApi } from '../../../services/api'

export default function Reportes({ auth }) {
  const [reports, setReports] = useState([])
  const [appeals, setAppeals] = useState([])
  const [fraud, setFraud] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = () => {
    Promise.all([
      moderationApi.queue({}, auth?.token),
      moderationApi.appealQueue({}, auth?.token),
      moderationApi.fraudQueue(auth?.token),
    ])
      .then(([queue, appealQueue, fraudQueue]) => {
        setReports(queue.data || [])
        setAppeals(appealQueue.data || [])
        setFraud(fraudQueue.data || [])
        setError('')
      })
      .catch((requestError) => setError(requestError.message))
  }

  useEffect(load, [auth?.token])

  const assign = async (id) => {
    try {
      await moderationApi.assign(id, auth.token)
      setMessage('Reporte asignado.')
      load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const resolve = async (id, accion) => {
    const razon = window.prompt('Escribe una razón clara y respetuosa:')
    if (!razon || razon.trim().length < 10) return
    try {
      await moderationApi.resolve(id, {
        resultado: accion,
        razon: razon.trim(),
        sancion: accion === 'resuelto' ? 'ninguna' : null,
      }, auth.token)
      setMessage('Resolución registrada.')
      load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const resolveAppeal = async (id, resultado) => {
    const resolucion = window.prompt('Indica la resolución de la apelación:')
    if (!resolucion || resolucion.trim().length < 10) return
    try {
      await moderationApi.resolveAppeal(id, { resultado, resolucion: resolucion.trim() }, auth.token)
      setMessage('Apelación revisada.')
      load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <PageFrame title="AEGIS | Reportes" auth={auth}>
      <main className="table-page">
        <h1>Moderación y denuncias</h1>
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}

        <h2>Bandeja</h2>
        {reports.length === 0
          ? <p>No hay reportes pendientes.</p>
          : (
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Prioridad</th><th>Motivo</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.id}</td>
                    <td>{report.prioridad}</td>
                    <td>{report.motivo}</td>
                    <td>{report.estado}</td>
                    <td>
                      <button type="button" onClick={() => assign(report.id)}>Asignar</button>
                      <button type="button" onClick={() => resolve(report.id, 'resuelto')}>Resolver</button>
                      <button type="button" onClick={() => resolve(report.id, 'descartado')}>Descartar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        <h2>Apelaciones</h2>
        {appeals.length === 0
          ? <p>No hay apelaciones.</p>
          : appeals.map((appeal) => (
              <article key={appeal.id}>
                <p>{appeal.argumento}</p>
                <span>{appeal.estado}</span>
                {appeal.estado === 'pendiente' && (
                  <>
                    <button type="button" onClick={() => resolveAppeal(appeal.id, 'aceptada')}>Aceptar</button>
                    <button type="button" onClick={() => resolveAppeal(appeal.id, 'rechazada')}>Rechazar</button>
                  </>
                )}
              </article>
            ))}

        <h2>Señales antifraude</h2>
        {fraud.length === 0
          ? <p>No hay señales interpretables pendientes.</p>
          : fraud.map((signal) => (
              <article key={signal.id}>
                <strong>{signal.regla}</strong> · puntaje {signal.puntaje}
                <p>Señal heurística para revisión; no constituye una decisión automática.</p>
              </article>
            ))}
      </main>
    </PageFrame>
  )
}