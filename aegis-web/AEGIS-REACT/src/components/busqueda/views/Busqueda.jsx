import { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import WorkspaceChrome from '../../layouts/WorkspaceChrome'
import Footer from '../../layouts/Footer'
import { searchApi } from '../../../services/api'
import '../css/busqueda.css'

export default function Busqueda({ auth, onNavigate, filtros = {} }) {
  const [q, setQ] = useState(filtros.busqueda || '')
  const [entidad, setEntidad] = useState('todos')
  const [results, setResults] = useState({})
  const [suggestions, setSuggestions] = useState([])
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!q.trim()) {
      setSuggestions([])
      return undefined
    }
    const timer = window.setTimeout(() => {
      searchApi.suggestions(q.trim())
        .then(({ data }) => setSuggestions(data))
        .catch(() => setSuggestions([]))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [q])

  useEffect(() => {
    searchApi.trends(7)
      .then(({ data }) => setTrends(data))
      .catch(() => setTrends([]))
  }, [])

  const submit = async (event) => {
    event?.preventDefault()
    if (q.trim().length < 2) return
    setLoading(true)
    try {
      const response = await searchApi.search({
        q: q.trim(),
        entidad,
        per_page: 20,
      })
      setResults(response.data)
      setError('')
      const params = new URLSearchParams({ buscar: q.trim(), entidad })
      window.history.replaceState(null, '', `#/busqueda?${params.toString()}`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const sections = [
    ['todos', 'Todos'],
    ['productos', 'Productos'],
    ['publicaciones', 'Publicaciones'],
    ['personas', 'Personas'],
    ['comunidades', 'Comunidades'],
  ]

  const list = entidad === 'todos'
    ? Object.values(results).flat()
    : results[entidad] || []

  return (
    <div className="page-layout">
      <Header title="AEGIS | Búsqueda" auth={auth} onNavigate={onNavigate} />
      <WorkspaceChrome auth={auth} onNavigate={onNavigate}>
      <main className="busqueda-page">
        <form className="busqueda-form" onSubmit={submit}>
          <label htmlFor="busqueda-global">Buscar en AEGIS</label>
          <input
            id="busqueda-global"
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            aria-describedby="busqueda-sugerencias"
          />
          <button type="submit" disabled={loading}>{loading ? 'Buscando...' : 'Buscar'}</button>
        </form>
        {suggestions.length > 0 && (
          <div id="busqueda-sugerencias" className="busqueda-sugerencias" role="listbox" aria-label="Sugerencias">
            {suggestions.map((suggestion, index) => (
              <button type="button" key={`${suggestion.tipo}-${suggestion.titulo}-${index}`} onClick={() => setQ(suggestion.titulo.replace(/^@/, ''))}>
                <span>{suggestion.tipo}</span>
                {suggestion.titulo}
              </button>
            ))}
          </div>
        )}
        <nav className="busqueda-tabs" aria-label="Entidad de búsqueda">
          {sections.map(([value, label]) => (
            <button type="button" key={value} className={entidad === value ? 'active' : ''} onClick={() => setEntidad(value)}>
              {label}
            </button>
          ))}
        </nav>
        {error && <p role="alert">{error}</p>}
        {!loading && list.length === 0 && <p>No hay resultados todavía.</p>}
        <div className="busqueda-results">
          {list.map((item) => (
            <article key={`${item.tipo}-${item.id}`}>
              <span>{item.tipo}</span>
              <h2>{item.titulo}</h2>
              {item.descripcion && <p>{item.descripcion}</p>}
              {item.destino && (
                <button type="button" onClick={() => onNavigate?.(item.destino)}>Abrir</button>
              )}
            </article>
          ))}
        </div>
        {trends.length > 0 && (
          <aside className="busqueda-trends" aria-label="Tendencias">
            <h2>Tendencias</h2>
            {trends.map((trend) => (
              <button type="button" key={trend.termino} onClick={() => setQ(trend.termino)}>
                {trend.termino} · {trend.apariciones}
              </button>
            ))}
          </aside>
        )}
      </main>
      </WorkspaceChrome>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
