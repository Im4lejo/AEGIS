import { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { EmptyState, ErrorState, LoadingState } from '../../shared/ApiState'
import { formatCurrency, imageUrl } from '../../shared/presentation'
import { productApi } from '../../../services/api'
import '../css/index.css'

const ESTADOS = [
  { id: 'todo', label: 'Todo' },
  { id: 'nuevo', label: 'Nuevo' },
  { id: 'usado', label: 'Usado' },
  { id: 'reacondicionado', label: 'Reacondicionado' },
]

const ORDENES = [
  { valor: 'reciente', label: 'Más recientes' },
  { valor: 'precio-asc', label: 'Precio menor a mayor' },
  { valor: 'precio-desc', label: 'Precio mayor a menor' },
]

function etiquetaEstado(estado) {
  if (estado === 'nuevo') return 'Nuevo'
  if (estado === 'reacondicionado') return 'Reacondicionado'
  return 'Usado'
}

function badgeEstado(estado) {
  if (estado === 'nuevo') return 'badge-new'
  if (estado === 'reacondicionado') return 'badge-refurbished'
  return 'badge-used'
}

export default function Index(props) {
  const filtros = props.filtros || {}
  const key = [
    filtros.busqueda || '',
    filtros.categoria || '',
    filtros.filtro || '',
    filtros.navegacion || 0,
  ].join('|')
  return <Catalogo key={key} {...props} />
}

function Catalogo({ filtros = {}, auth, onNavigate, vista }) {
  const modoNovedades = vista === '/novedades'
  const [busqueda, setBusqueda] = useState(filtros.busqueda || '')
  const [categoria, setCategoria] = useState(filtros.categoria || '')
  const [estado, setEstado] = useState(
    filtros.filtro === 'reacondicionado' ? 'reacondicionado' : 'todo',
  )
  const [precioMax, setPrecioMax] = useState('')
  const [orden, setOrden] = useState('reciente')
  const [termino, setTermino] = useState(filtros.busqueda || '')
  const [categorias, setCategorias] = useState([])
  const [respuesta, setRespuesta] = useState({
    key: '',
    productos: [],
    error: '',
  })
  const [errorCategorias, setErrorCategorias] = useState('')

  useEffect(() => {
    let active = true
    productApi
      .categories()
      .then(({ data }) => {
        if (active) setCategorias(data)
      })
      .catch((requestError) => {
        if (active) setErrorCategorias(requestError.message)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setTermino(busqueda.trim()), 250)
    return () => clearTimeout(timer)
  }, [busqueda])

  useEffect(() => {
    let active = true
    const requestKey = JSON.stringify([
      termino,
      categoria,
      estado,
      precioMax,
      orden,
    ])
    productApi
      .list({
        busqueda: termino,
        cat: categoria,
        estado,
        precio_max: precioMax || undefined,
        sort: orden,
        per_page: 50,
      })
      .then(({ data }) => {
        if (!active) return
        setRespuesta({
          key: requestKey,
          error: '',
          productos: data.map((producto) => ({
            ...producto,
            nombre: producto.titulo,
            categoriaNombre: producto.categoria?.nombre || '',
            estado: producto.estado_producto,
            imagen:
              producto.imagen_principal || producto.imagenes?.[0]?.imagen || '',
          })),
        })
      })
      .catch((requestError) => {
        if (active)
          setRespuesta({ key: requestKey, productos: [], error: requestError })
      })
    return () => {
      active = false
    }
  }, [termino, categoria, estado, precioMax, orden])

  const requestKey = JSON.stringify([
    termino,
    categoria,
    estado,
    precioMax,
    orden,
  ])
  const cargando = respuesta.key !== requestKey
  const productos = cargando ? [] : respuesta.productos
  const error = cargando ? '' : respuesta.error
  const lista = productos
  const titulo = termino
    ? `Resultados para "${termino}"`
    : categoria || (modoNovedades ? 'Novedades' : 'Productos')

  const limpiarFiltros = () => {
    setBusqueda('')
    setCategoria('')
    setEstado('todo')
    setPrecioMax('')
    setOrden('reciente')
    if (onNavigate) onNavigate('/productos')
  }

  const abrirProducto = (producto) => {
    if (onNavigate) onNavigate(`/productos/detalle?id=${producto.id}`)
  }

  return (
    <div className="page-layout">
      <Header
        title={modoNovedades ? 'AEGIS | Novedades' : 'AEGIS | Productos'}
        auth={auth}
        onNavigate={onNavigate}
      />
      <main className="products-page">
        <div className="products-topbar">
          <div className="products-title-row">
            <h1>{titulo}</h1>
            <span className="products-count">
              {lista.length} {lista.length === 1 ? 'producto' : 'productos'}
            </span>
          </div>
          <div className="products-sort">
            <span>Ordenar por</span>
            <select
              value={orden}
              onChange={(event) => setOrden(event.target.value)}
            >
              {ORDENES.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="products-body">
          <aside className="products-filters">
            <div className="filters-head">
              <strong>Buscar y filtrar</strong>
              <button type="button" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>
            <div className="filter-group">
              <label className="filter-group-title" htmlFor="filtro-busqueda">
                Producto
              </label>
              <input
                id="filtro-busqueda"
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar productos..."
              />
            </div>
            <div className="filter-group">
              <span className="filter-group-title">Categoría</span>
              <div className="filter-tags">
                {categorias.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={
                      categoria === item.nombre
                        ? 'filter-tag active'
                        : 'filter-tag'
                    }
                    onClick={() =>
                      setCategoria(categoria === item.nombre ? '' : item.nombre)
                    }
                  >
                    {item.nombre}
                  </button>
                ))}
              </div>
              {errorCategorias && (
                <span className="filters-empty">{errorCategorias}</span>
              )}
              {categorias.length === 0 && !errorCategorias && (
                <span className="filters-empty">Cargando categorías...</span>
              )}
            </div>
            <div className="filter-group">
              <span className="filter-group-title">Estado</span>
              {ESTADOS.map((opcion) => (
                <label className="filter-radio" key={opcion.id}>
                  <input
                    type="radio"
                    name="estado-producto"
                    checked={estado === opcion.id}
                    onChange={() => setEstado(opcion.id)}
                  />
                  {opcion.label}
                </label>
              ))}
            </div>
            <div className="filter-group">
              <label className="filter-group-title" htmlFor="precio-maximo">
                Precio máximo (COP)
              </label>
              <input
                id="precio-maximo"
                type="number"
                min="0"
                value={precioMax}
                onChange={(event) => setPrecioMax(event.target.value)}
                placeholder="Sin límite"
              />
            </div>
          </aside>

          <section className="products-results" aria-live="polite">
            {error && <ErrorState error={error} compact />}
            {cargando && (
              <LoadingState message="Cargando productos..." compact />
            )}
            {!cargando && !error && lista.length === 0 && (
              <EmptyState
                title="Sin productos"
                message={
                  modoNovedades
                    ? 'Todavía no hay productos recientes.'
                    : 'No se encontraron productos con los filtros seleccionados.'
                }
                compact
              />
            )}
            {!cargando && !error && lista.length > 0 && (
              <div className="products-grid-container">
                {lista.map((producto) => (
                  <article
                    className="product-card"
                    key={producto.id}
                    role="button"
                    tabIndex={0}
                    title="Ver detalle del producto"
                    onClick={() => abrirProducto(producto)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        abrirProducto(producto)
                      }
                    }}
                  >
                    <div className="product-image-container">
                      <img
                        src={imageUrl(producto.imagen)}
                        alt={producto.nombre}
                      />
                      <span
                        className={`product-state-tag ${badgeEstado(producto.estado)}`}
                      >
                        {etiquetaEstado(producto.estado)}
                      </span>
                    </div>
                    <div className="product-info">
                      <span className="product-brand">
                        {producto.categoriaNombre}
                      </span>
                      <h3 className="product-name">{producto.nombre}</h3>
                      <div className="product-price-row">
                        <span className="product-current-price">
                          COP {formatCurrency(producto.precio)}
                        </span>
                      </div>
                      <p className="product-seller">
                        Vendido por:{' '}
                        <span>
                          {producto.vendedor?.nombre || 'Vendedor AEGIS'}
                        </span>
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
