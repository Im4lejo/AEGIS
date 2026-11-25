import { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import WorkspaceChrome from '../../layouts/WorkspaceChrome'
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
  { valor: 'relevancia', label: 'Relevancia' },
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
  const [precioMin, setPrecioMin] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [marca, setMarca] = useState('')
  const [dias, setDias] = useState('')
  const [compararIds, setCompararIds] = useState([])
  const [comparacion, setComparacion] = useState(null)
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
      precioMin,
      ciudad,
      marca,
      dias,
      orden,
    ])
    productApi
      .list({
        busqueda: termino,
        cat: categoria,
        estado,
        precio_max: precioMax || undefined,
      precio_min: precioMin || undefined,
      ciudad,
      marca,
      dias: dias || undefined,
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
  }, [termino, categoria, estado, precioMax, precioMin, ciudad, marca, dias, orden])

  const requestKey = JSON.stringify([
    termino,
    categoria,
    estado,
    precioMax,
    precioMin,
    ciudad,
    marca,
    dias,
    orden,
  ])
  const cargando = respuesta.key !== requestKey
  const productos = cargando ? [] : respuesta.productos
  const error = cargando ? '' : respuesta.error
  const lista = productos
  useEffect(() => {
    const params = new URLSearchParams()
    if (termino) params.set('buscar', termino)
    if (categoria) params.set('categoria', categoria)
    if (estado !== 'todo') params.set('estado', estado)
    if (precioMin) params.set('precio_min', precioMin)
    if (precioMax) params.set('precio_max', precioMax)
    if (ciudad) params.set('ciudad', ciudad)
    if (marca) params.set('marca', marca)
    if (dias) params.set('dias', dias)
    if (orden !== 'reciente') params.set('sort', orden)
    const base = window.location.hash.split('?')[0] || '#/productos'
    window.history.replaceState(null, '', `${base}?${params.toString()}`)
    localStorage.setItem('aegis-marketplace-filters', JSON.stringify({
      termino, categoria, estado, precioMin, precioMax, ciudad, marca, dias, orden,
    }))
  }, [termino, categoria, estado, precioMin, precioMax, ciudad, marca, dias, orden])
  const titulo = termino
    ? `Resultados para "${termino}"`
    : categoria || (modoNovedades ? 'Novedades' : 'Productos')

  const limpiarFiltros = () => {
    setBusqueda('')
    setCategoria('')
    setEstado('todo')
    setPrecioMax('')
    setPrecioMin('')
    setCiudad('')
    setMarca('')
    setDias('')
    setOrden('reciente')
    if (onNavigate) onNavigate('/productos')
  }

  const abrirProducto = (producto) => {
    if (onNavigate) onNavigate(`/productos/detalle?id=${producto.id}`)
  }

  const alternarComparar = (id) => {
    setCompararIds((actuales) => {
      if (actuales.includes(id)) return actuales.filter((item) => item !== id)
      if (actuales.length >= 4) return actuales
      return [...actuales, id]
    })
  }

  const ejecutarComparacion = async () => {
    if (compararIds.length < 2) return
    try {
      const response = await productApi.compare(compararIds)
      setComparacion(response.data)
    } catch (requestError) {
      setRespuesta((actual) => ({ ...actual, error: requestError }))
    }
  }

  return (
    <div className="page-layout">
      <Header
        title={modoNovedades ? 'AEGIS | Novedades' : 'AEGIS | Productos'}
        auth={auth}
        onNavigate={onNavigate}
      />
      <WorkspaceChrome auth={auth} onNavigate={onNavigate}>
      <main className="products-page">
        <div className="products-topbar">
          <div className="products-title-row">
            <h1>{titulo}</h1>
            <span className="products-count">
              {lista.length} {lista.length === 1 ? 'producto' : 'productos'}
            </span>
          </div>
          <div className="products-sort">
            <label htmlFor="productos-orden">Ordenar por</label>
            <select
              id="productos-orden"
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
          <label className="products-mobile-bar" htmlFor="productos-orden-movil">
            Ordenar por
            <select
              id="productos-orden-movil"
              value={orden}
              onChange={(event) => setOrden(event.target.value)}
            >
              {ORDENES.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {(categoria || estado !== 'todo' || precioMin || precioMax || ciudad || marca || dias) && (
          <div className="products-active-filters" aria-label="Filtros activos">
            {categoria && <button type="button" onClick={() => setCategoria('')}>Categoría: {categoria} ×</button>}
            {estado !== 'todo' && <button type="button" onClick={() => setEstado('todo')}>Estado: {estado} ×</button>}
            {precioMin && <button type="button" onClick={() => setPrecioMin('')}>Desde COP {precioMin} ×</button>}
            {precioMax && <button type="button" onClick={() => setPrecioMax('')}>Hasta COP {precioMax} ×</button>}
            {ciudad && <button type="button" onClick={() => setCiudad('')}>Ciudad: {ciudad} ×</button>}
            {marca && <button type="button" onClick={() => setMarca('')}>Marca: {marca} ×</button>}
            {dias && <button type="button" onClick={() => setDias('')}>Últimos {dias} días ×</button>}
          </div>
        )}

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
              <label className="filter-group-title" htmlFor="precio-minimo">Precio mínimo (COP)</label>
              <input id="precio-minimo" type="number" min="0" value={precioMin} onChange={(event) => setPrecioMin(event.target.value)} />
            </div>
            <div className="filter-group">
              <label className="filter-group-title" htmlFor="filtro-ciudad">Ubicación aproximada</label>
              <input id="filtro-ciudad" type="text" value={ciudad} onChange={(event) => setCiudad(event.target.value)} placeholder="Ciudad" />
            </div>
            <div className="filter-group">
              <label className="filter-group-title" htmlFor="filtro-marca">Marca</label>
              <input id="filtro-marca" type="text" value={marca} onChange={(event) => setMarca(event.target.value)} placeholder="Marca" />
            </div>
            <div className="filter-group">
              <label className="filter-group-title" htmlFor="filtro-dias">Publicado hace</label>
              <select id="filtro-dias" value={dias} onChange={(event) => setDias(event.target.value)}>
                <option value="">Cualquier fecha</option>
                <option value="1">Últimas 24 horas</option>
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
              </select>
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
                <div className="products-compare-bar">
                  <span>{compararIds.length} seleccionado(s) · máximo 4</span>
                  <button type="button" disabled={compararIds.length < 2} onClick={ejecutarComparacion}>Comparar</button>
                </div>
                {lista.map((producto) => (
                  <article className="product-card" key={producto.id}>
                    <button
                      type="button"
                      className="product-compare-check"
                      onClick={() => alternarComparar(producto.id)}
                      aria-pressed={compararIds.includes(producto.id)}
                    >
                      {compararIds.includes(producto.id) ? 'Quitar de comparar' : 'Comparar'}
                    </button>
                    <button
                      type="button"
                      className="product-card-open"
                      onClick={() => abrirProducto(producto)}
                    >
                      <div className="product-image-container">
                        <img
                          src={imageUrl(producto.imagen)}
                          alt=""
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
                    </button>
                  </article>
                ))}
              </div>
            )}
            {comparacion && (
              <section className="products-comparison" aria-label="Comparación de productos">
                <div className="products-comparison__head">
                  <h2>Comparación</h2>
                  <button type="button" onClick={() => setComparacion(null)}>Cerrar</button>
                </div>
                {comparacion.advertencia && <p role="status">{comparacion.advertencia}</p>}
                <div className="products-comparison__table">
                  {comparacion.productos.map((producto) => (
                    <article key={producto.id}>
                      {producto.imagen && <img src={imageUrl(producto.imagen)} alt={producto.titulo} />}
                      <h3>{producto.titulo}</h3>
                      <dl>
                        <dt>Precio</dt><dd>COP {formatCurrency(producto.precio)}</dd>
                        <dt>Condición</dt><dd>{producto.estado_producto}</dd>
                        <dt>Ubicación</dt><dd>{producto.ciudad_aprox || 'No indicada'}</dd>
                        {comparacion.campos.map((campo) => (
                          <div key={campo}>
                            <dt>{campo}</dt>
                            <dd>{producto.atributos?.[campo] ?? 'N/D'}</dd>
                          </div>
                        ))}
                      </dl>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </section>
        </div>
      </main>
      </WorkspaceChrome>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
