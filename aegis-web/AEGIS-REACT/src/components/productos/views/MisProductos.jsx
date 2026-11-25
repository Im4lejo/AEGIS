import { useEffect, useState } from 'react'
import PageFrame from '../../shared/PageFrame'
import { formatCurrency, route } from '../../shared/presentation'
import { personalDataApi, productApi } from '../../../services/api'
import '../css/misProductos.css'

const ESTADOS = ['todos', 'borrador', 'activo', 'pausado', 'reservado', 'vendido', 'archivado']

export default function MisProductos({ auth, onNavigate }) {
  const [estado, setEstado] = useState('todos')
  const [productos, setProductos] = useState([])
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [periodo, setPeriodo] = useState('30d')

  const cargar = async () => {
    try {
      const [{ data, meta }, estadisticas] = await Promise.all([
        productApi.mine(estado, 1, 24, auth?.token),
        personalDataApi.sellerStats(periodo, auth?.token),
      ])
      setProductos(data)
      setStats(estadisticas.data)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  useEffect(() => {
    if (auth?.token) cargar()
  }, [estado, periodo, auth?.token])

  const cambiarEstado = async (producto, nuevoEstado) => {
    try {
      await productApi.transition(producto.id, nuevoEstado, auth.token)
      await cargar()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <PageFrame title="AEGIS | Mis productos" auth={auth}>
      <main className="table-page">
        <div className="page-heading">
          <h1>Mis productos</h1>
          <a href={route('/productos/crear')}>Nuevo</a>
        </div>
        {stats && (
          <>
            <label>
              Periodo
              <select value={periodo} onChange={(event) => setPeriodo(event.target.value)}>
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
              </select>
            </label>
            <div className="mis-productos-stats">
              <span>Total {stats.total}</span>
              <span>Activos {stats.activos}</span>
              <span>Vistas válidas {stats.vistas_validas ?? 0}</span>
              <span>Contactos {stats.contactos ?? 0}</span>
              <span>Ofertas {stats.ofertas ?? 0}</span>
              <span>Reservas {stats.reservas ?? 0}</span>
              <span>Vendidos {stats.vendidos_periodo ?? stats.vendidos ?? 0}</span>
            </div>
          </>
        )}
        <nav className="mis-productos-tabs" aria-label="Estado de anuncios">
          {ESTADOS.map((value) => (
            <button type="button" key={value} className={estado === value ? 'active' : ''} onClick={() => setEstado(value)}>
              {value}
            </button>
          ))}
        </nav>
        {error && <p role="alert">{error}</p>}
        <p className="table-scroll-hint" id="mis-productos-table-hint">
          Desliza horizontalmente para ver todas las columnas.
        </p>
        <div
          className="table-scroll-region"
          role="region"
          aria-label="Productos propios"
          aria-describedby="mis-productos-table-hint"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return
            const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
            if (direction) {
              event.preventDefault()
              event.currentTarget.scrollBy({ left: direction * Math.max(80, event.currentTarget.clientWidth * 0.8) })
            }
          }}
        >
          <table>
            <thead><tr><th>Título</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {productos.map((product) => (
                <tr key={product.id}>
                  <td>{product.titulo}</td>
                  <td>COP {formatCurrency(product.precio)}</td>
                  <td>{product.estado_publicacion}</td>
                  <td>
                    <div className="mis-productos-actions">
                      <button type="button" onClick={() => onNavigate?.(`/productos/detalle?id=${product.id}`)}>Ver</button>
                      {product.estado_publicacion === 'borrador' && (
                        <button type="button" onClick={() => cambiarEstado(product, 'activo')}>Publicar</button>
                      )}
                      {product.estado_publicacion === 'activo' && (
                        <button type="button" onClick={() => cambiarEstado(product, 'pausado')}>Pausar</button>
                      )}
                      {product.estado_publicacion === 'pausado' && (
                        <button type="button" onClick={() => cambiarEstado(product, 'activo')}>Reactivar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </PageFrame>
  )
}