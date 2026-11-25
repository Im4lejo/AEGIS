import { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import WorkspaceChrome from '../../layouts/WorkspaceChrome'
import Footer from '../../layouts/Footer'
import { moderationApi } from '../../../services/api'

export default function MisReportes({ auth, onNavigate }) {
  const [reports, setReports] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    moderationApi.mine(auth?.token)
      .then(({ data }) => {
        if (active) setReports(Array.isArray(data) ? data : [])
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
    return () => { active = false }
  }, [auth?.token])

  return (
    <div className="page-layout">
      <Header auth={auth} onNavigate={onNavigate} title="AEGIS | Mis reportes" />
      <WorkspaceChrome auth={auth} onNavigate={onNavigate}>
      <main style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
        <h1>Seguimiento de mis reportes</h1>
        {error && <p role="alert">{error}</p>}
        {reports.length === 0
          ? <p>No has enviado reportes.</p>
          : reports.map((report) => (
              <article key={report.id}>
                <strong>{report.motivo}</strong>
                <span> · {report.estado}</span>
                {report.razon_resolucion && <p>{report.razon_resolucion}</p>}
              </article>
            ))}
      </main>
      </WorkspaceChrome>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
