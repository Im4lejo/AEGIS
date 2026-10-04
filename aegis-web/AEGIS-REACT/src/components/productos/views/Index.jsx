import { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { formatCurrency, imageUrl, route } from '../../shared/presentation'
import { PRODUCTOS_DESTACADOS, PRODUCTOS_PERFIL, PRODUCTOS_PROMOCION, PRODUCTOS_NOVEDADES } from '../productosDemo'
import '../css/index.css'

const CATEGORIAS = ['Televisores', 'Laptops', 'Celulares', 'Componentes PC', 'Consolas', 'Wearables', 'Smart Home', 'Audio', 'Oficina y Conectividad', 'Foto y Video']

const CALIFICACIONES = [
  { valor: 4, label: '4★ o más' },
  { valor: 3, label: '3★ o más' },
]

const ESTADOS = [
  { id: 'todo', label: 'Todo' },
  { id: 'nuevo', label: 'Nuevo' },
  { id: 'reacondicionado', label: 'Reacondicionado' },
  { id: 'usado', label: 'Usado' },
]

const PRECIO_MAXIMO = 5000000

const FILTROS_CATEGORIA = {
  Celulares: [
    { campo: 'so', titulo: 'Sistema operativo' },
    { campo: 'almacenamiento', titulo: 'Almacenamiento' },
    { campo: 'ram', titulo: 'RAM' },
    {
      campo: 'pulgadas',
      titulo: 'Tamaño de pantalla',
      rangos: [
        { label: 'Menos de 6.7"', min: 0, max: 6.7 },
        { label: '6.7" a 6.75"', min: 6.7, max: 6.75 },
        { label: 'Más de 6.75"', min: 6.75, max: 10 },
      ],
    },
    { campo: 'camara', titulo: 'Cámara principal' },
  ],
  Televisores: [
    {
      campo: 'pulgadas',
      titulo: 'Tamaño de pantalla',
      rangos: [
        { label: '32" a 43"', min: 32, max: 44 },
        { label: '50" a 55"', min: 50, max: 56 },
        { label: '65" en adelante', min: 65, max: 100 },
      ],
    },
    { campo: 'resolucion', titulo: 'Resolución' },
    { campo: 'panel', titulo: 'Tecnología del panel' },
    { campo: 'sistema', titulo: 'Smart TV / Sistema' },
    { campo: 'refresco', titulo: 'Tasa de refresco' },
  ],
  Laptops: [
    { campo: 'cpu', titulo: 'Procesador (CPU)' },
    { campo: 'ram', titulo: 'RAM' },
    { campo: 'almacenamientoTipo', titulo: 'Tipo de almacenamiento' },
    { campo: 'almacenamiento', titulo: 'Capacidad de almacenamiento' },
    { campo: 'gpu', titulo: 'Tarjeta gráfica' },
    { campo: 'uso', titulo: 'Uso principal / Gama' },
    { campo: 'pulgadas', titulo: 'Pulgadas' },
  ],
  'Componentes PC': [
    { campo: 'vram', titulo: 'Memoria VRAM' },
    { campo: 'pulgadas', titulo: 'Pulgadas' },
  ],
  Periféricos: [
    { campo: 'tipo', titulo: 'Tipo de periférico' },
    { campo: 'conectividad', titulo: 'Conectividad' },
    { campo: 'iluminacion', titulo: 'Iluminación' },
    { campo: 'switch', titulo: 'Tipo de switch' },
  ],
}

function sinTildes(texto) {
  const conTilde = 'áéíóúüñ'
  const normal = 'aeiouun'
  let salida = ''
  for (let i = 0; i < texto.length; i++) {
    const letra = texto.charAt(i)
    const pos = conTilde.indexOf(letra)
    salida += pos === -1 ? letra : normal.charAt(pos)
  }
  return salida
}

function buscarGrupo(categoria, campo) {
  const grupos = FILTROS_CATEGORIA[categoria] || []
  for (let i = 0; i < grupos.length; i++) {
    if (grupos[i].campo === campo) return grupos[i]
  }
  return null
}

function opcionesDeGrupo(todos, categoria, grupo) {
  if (grupo.rangos) return grupo.rangos.map((rango) => rango.label)
  const valores = []
  todos.forEach((prod) => {
    if (prod.categoria === categoria && prod[grupo.campo] && valores.indexOf(prod[grupo.campo]) === -1) {
      valores.push(prod[grupo.campo])
    }
  })
  return valores
}

function nombreDe(prod) {
  return prod.nombre || prod.titulo || ''
}

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

export default function Index({ filtros = {}, auth, onNavigate }) {
  const [busqueda, setBusqueda] = useState(filtros.busqueda || '')
  const [categoria, setCategoria] = useState(filtros.categoria || '')
  const [estado, setEstado] = useState(filtros.filtro === 'reacondicionado' ? 'reacondicionado' : 'todo')
  const [soloOfertas, setSoloOfertas] = useState(filtros.filtro === 'ofertas')
  const [soloBlackFriday, setSoloBlackFriday] = useState(filtros.filtro === 'blackfriday')
  const [soloGaming, setSoloGaming] = useState(filtros.filtro === 'gaming')
  const [marcas, setMarcas] = useState([])
  const [specs, setSpecs] = useState({})
  const [califMin, setCalifMin] = useState(0)
  const [soloStock, setSoloStock] = useState(false)
  const [soloEnvio, setSoloEnvio] = useState(false)
  const [precioMax, setPrecioMax] = useState(PRECIO_MAXIMO)
  const [orden, setOrden] = useState('recomendados')

  useEffect(() => {
    setBusqueda(filtros.busqueda || '')
    setCategoria(filtros.categoria || '')
    setEstado(filtros.filtro === 'reacondicionado' ? 'reacondicionado' : 'todo')
    setSoloOfertas(filtros.filtro === 'ofertas')
    setSoloBlackFriday(filtros.filtro === 'blackfriday')
    setSoloGaming(filtros.filtro === 'gaming')
    setMarcas([])
    setSpecs({})
    setCalifMin(0)
    setSoloStock(false)
    setSoloEnvio(false)
    setPrecioMax(PRECIO_MAXIMO)
  }, [filtros])

  const todos = [...PRODUCTOS_DESTACADOS, ...PRODUCTOS_PROMOCION, ...PRODUCTOS_PERFIL, ...PRODUCTOS_NOVEDADES]

  let marcasDisponibles = []
  todos.forEach((prod) => {
    const coincide = !categoria || prod.categoria === categoria
    if (coincide && marcasDisponibles.indexOf(prod.marca) === -1) {
      marcasDisponibles.push(prod.marca)
    }
  })

  let lista = todos

  const termino = sinTildes(busqueda.trim().toLowerCase())
  if (termino) {
    const palabras = termino.split(' ')
    lista = lista.filter((prod) => {
      const texto = sinTildes(`${nombreDe(prod)} ${prod.descripcion || ''} ${prod.categoria || ''} ${prod.marca || ''}`.toLowerCase())
      return palabras.every((palabra) => {
        if (texto.indexOf(palabra) !== -1) return true
        if (palabra.length > 2 && palabra.charAt(palabra.length - 1) === 's') {
          return texto.indexOf(palabra.substring(0, palabra.length - 1)) !== -1
        }
        return false
      })
    })
  }
  if (categoria) lista = lista.filter((prod) => prod.categoria === categoria)
  if (marcas.length > 0) lista = lista.filter((prod) => marcas.indexOf(prod.marca) !== -1)
  if (estado !== 'todo') lista = lista.filter((prod) => prod.estado === estado)
  if (soloOfertas) lista = lista.filter((prod) => prod.descuento > 0 || prod.precioAnterior)
  if (soloBlackFriday) lista = lista.filter((prod) => prod.blackFriday)
  if (soloGaming) lista = lista.filter((prod) => prod.gaming)
  if (precioMax < PRECIO_MAXIMO) lista = lista.filter((prod) => prod.precio <= precioMax)
  if (califMin > 0) lista = lista.filter((prod) => prod.calificacion >= califMin)
  if (soloStock) lista = lista.filter((prod) => prod.stock !== false)
  if (soloEnvio) lista = lista.filter((prod) => prod.envioRapido === true)

  let categoriaVista = categoria
  if (!categoriaVista && termino && lista.length > 0) {
    let unica = lista[0].categoria
    let todosIguales = true
    lista.forEach((prod) => {
      if (prod.categoria !== unica) todosIguales = false
    })
    if (todosIguales) categoriaVista = unica
  }

  Object.keys(specs).forEach((campo) => {
    const seleccion = specs[campo]
    if (seleccion && seleccion.length > 0) {
      const grupo = buscarGrupo(categoriaVista, campo)
      if (grupo && grupo.rangos) {
        lista = lista.filter((prod) => {
          const numero = prod[campo]
          return seleccion.some((label) => {
            const rango = grupo.rangos.find((r) => r.label === label)
            return rango && numero >= rango.min && numero < rango.max
          })
        })
      } else {
        lista = lista.filter((prod) => seleccion.indexOf(prod[campo]) !== -1)
      }
    }
  })

  if (orden === 'precio-asc') lista = [...lista].sort((a, b) => a.precio - b.precio)
  if (orden === 'precio-desc') lista = [...lista].sort((a, b) => b.precio - a.precio)

  let titulo = 'Productos'
  if (termino) titulo = `Resultados para "${busqueda.trim()}"`
  else if (categoria) titulo = categoria
  else if (soloBlackFriday) titulo = 'Black Friday'
  else if (soloGaming) titulo = 'Gaming'
  else if (soloOfertas) titulo = 'Ofertas'
  else if (estado === 'reacondicionado') titulo = 'Reacondicionado'

  const chips = []
  if (termino) chips.push({ label: `Búsqueda: ${busqueda.trim()}`, quitar: () => { setBusqueda(''); setSpecs({}) } })
  if (categoria) chips.push({ label: categoria, quitar: () => { setCategoria(''); setSpecs({}); setMarcas([]) } })
  Object.keys(specs).forEach((campo) => {
    const seleccion = specs[campo] || []
    const grupo = buscarGrupo(categoriaVista, campo)
    const titulo = grupo ? grupo.titulo : campo
    seleccion.forEach((valor) => {
      chips.push({ label: `${titulo}: ${valor}`, quitar: () => quitarSpec(campo, valor) })
    })
  })
  marcas.forEach((m) => chips.push({ label: `Marca: ${m}`, quitar: () => setMarcas(marcas.filter((x) => x !== m)) }))
  if (califMin > 0) chips.push({ label: `${califMin}★ o más`, quitar: () => setCalifMin(0) })
  if (soloStock) chips.push({ label: 'En stock', quitar: () => setSoloStock(false) })
  if (soloEnvio) chips.push({ label: 'Envío rápido', quitar: () => setSoloEnvio(false) })
  if (estado !== 'todo') chips.push({ label: etiquetaEstado(estado), quitar: () => setEstado('todo') })
  if (soloOfertas) chips.push({ label: 'Solo ofertas', quitar: () => setSoloOfertas(false) })
  if (soloBlackFriday) chips.push({ label: 'Black Friday', quitar: () => setSoloBlackFriday(false) })
  if (soloGaming) chips.push({ label: 'Gaming', quitar: () => setSoloGaming(false) })
  if (precioMax < PRECIO_MAXIMO) chips.push({ label: `Hasta COP ${formatCurrency(precioMax)}`, quitar: () => setPrecioMax(PRECIO_MAXIMO) })

  const limpiarFiltros = () => {
    setBusqueda('')
    setCategoria('')
    setEstado('todo')
    setSoloOfertas(false)
    setSoloBlackFriday(false)
    setSoloGaming(false)
    setMarcas([])
    setSpecs({})
    setCalifMin(0)
    setSoloStock(false)
    setSoloEnvio(false)
    setPrecioMax(PRECIO_MAXIMO)
  }

  const alternarSpec = (campo, valor) => {
    const seleccion = specs[campo] || []
    if (seleccion.indexOf(valor) !== -1) {
      setSpecs({ ...specs, [campo]: seleccion.filter((v) => v !== valor) })
    } else {
      setSpecs({ ...specs, [campo]: seleccion.concat(valor) })
    }
  }

  const quitarSpec = (campo, valor) => {
    const seleccion = specs[campo] || []
    setSpecs({ ...specs, [campo]: seleccion.filter((v) => v !== valor) })
  }

  const alternarMarca = (m) => {
    if (marcas.indexOf(m) !== -1) {
      setMarcas(marcas.filter((x) => x !== m))
    } else {
      setMarcas(marcas.concat(m))
    }
  }

  const abrirProducto = (prod) => {
    if (onNavigate) onNavigate(`/productos/detalle?id=${prod.id}`)
  }

  return (
    <div className="page-layout">
      <Header title="AEGIS | Productos" auth={auth} onNavigate={onNavigate} />

      <main className="products-page">
        <div className="products-topbar">
          <div className="products-title-row">
            <h1>{titulo}</h1>
            <span className="products-count">{lista.length} {lista.length === 1 ? 'producto' : 'productos'}</span>
          </div>

          <div className="products-sort">
            <span>Ordenar por</span>
            <select value={orden} onChange={(event) => setOrden(event.target.value)}>
              <option value="recomendados">Recomendados</option>
              <option value="precio-asc">Menor precio</option>
              <option value="precio-desc">Mayor precio</option>
            </select>
          </div>
        </div>

        <div className="products-body">
          <aside className="products-filters">
            <div className="filters-head">
              <strong>Filtros seleccionados</strong>
              <button type="button" onClick={limpiarFiltros}>Limpiar filtros</button>
            </div>

            {chips.length === 0 ? (
              <p className="filters-empty">Ningún filtro activo</p>
            ) : (
              <div className="filters-chips">
                {chips.map((chip) => (
                  <span className="filter-chip" key={chip.label}>
                    {chip.label}
                    <button type="button" onClick={chip.quitar} aria-label={`Quitar filtro ${chip.label}`}>✕</button>
                  </span>
                ))}
              </div>
            )}

            <div className="filter-group">
              <span className="filter-group-title">Promociones</span>
              <label className="filter-check">
                <input type="checkbox" checked={soloBlackFriday} onChange={(event) => setSoloBlackFriday(event.target.checked)} />
                Black Friday
              </label>
              <label className="filter-check">
                <input type="checkbox" checked={soloOfertas} onChange={(event) => setSoloOfertas(event.target.checked)} />
                Solo ofertas
              </label>
              <label className="filter-check">
                <input type="checkbox" checked={soloGaming} onChange={(event) => setSoloGaming(event.target.checked)} />
                Gaming
              </label>
            </div>

            <div className="filter-group">
              <span className="filter-group-title">Precio máximo</span>
              <input
                type="range"
                min="0"
                max={PRECIO_MAXIMO}
                step="50000"
                value={precioMax}
                onChange={(event) => setPrecioMax(Number(event.target.value))}
              />
              <div className="filter-price-labels">
                <span>COP 0</span>
                <span>COP {formatCurrency(precioMax)}</span>
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-group-title">Estado</span>
              {ESTADOS.map((op) => (
                <label className="filter-radio" key={op.id}>
                  <input
                    type="radio"
                    name="estado-producto"
                    checked={estado === op.id}
                    onChange={() => setEstado(op.id)}
                  />
                  {op.label}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <span className="filter-group-title">Categoría</span>
              <div className="filter-tags">
                {CATEGORIAS.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    className={categoria === cat ? 'filter-tag active' : 'filter-tag'}
                    onClick={() => {
                      setCategoria(categoria === cat ? '' : cat)
                      setSpecs({})
                      setMarcas([])
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {(!categoriaVista || !FILTROS_CATEGORIA[categoriaVista]) && (
              <p className="filters-hint">
                Elige una categoría para ver filtros según el tipo de producto (almacenamiento, pulgadas, etc.).
              </p>
            )}

            {categoriaVista && FILTROS_CATEGORIA[categoriaVista] && FILTROS_CATEGORIA[categoriaVista].map((grupo) => {
              const opciones = opcionesDeGrupo(todos, categoriaVista, grupo)
              const seleccion = specs[grupo.campo] || []
              if (opciones.length === 0) return null
              return (
                <div className="filter-group" key={grupo.campo}>
                  <span className="filter-group-title">{grupo.titulo}</span>
                  <div className="filter-tags">
                    {opciones.map((valor) => (
                      <button
                        type="button"
                        key={valor}
                        className={seleccion.indexOf(valor) !== -1 ? 'filter-tag active' : 'filter-tag'}
                        onClick={() => alternarSpec(grupo.campo, valor)}
                      >
                        {valor}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}

            <div className="filter-group">
              <span className="filter-group-title">Marca</span>
              {marcasDisponibles.map((m) => (
                <label className="filter-check" key={m}>
                  <input type="checkbox" checked={marcas.indexOf(m) !== -1} onChange={() => alternarMarca(m)} />
                  {m}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <span className="filter-group-title">Calificación</span>
              <div className="filter-tags">
                {CALIFICACIONES.map((op) => (
                  <button
                    type="button"
                    key={op.valor}
                    className={califMin === op.valor ? 'filter-tag active' : 'filter-tag'}
                    onClick={() => setCalifMin(califMin === op.valor ? 0 : op.valor)}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-group-title">Disponibilidad</span>
              <label className="filter-check">
                <input type="checkbox" checked={soloStock} onChange={(event) => setSoloStock(event.target.checked)} />
                En stock
              </label>
              <label className="filter-check">
                <input type="checkbox" checked={soloEnvio} onChange={(event) => setSoloEnvio(event.target.checked)} />
                Envío rápido
              </label>
            </div>
          </aside>

          <section className="products-results">
            {lista.length === 0 ? (
              <div className="no-products-message">
                No se encontraron productos con los filtros seleccionados.
              </div>
            ) : (
              <div className="products-grid-container">
                {lista.map((prod) => {
                  let srcImagen = prod.imagen || ''
                  if (srcImagen.indexOf('http') !== 0 && srcImagen.indexOf('/') !== 0) {
                    srcImagen = imageUrl(srcImagen)
                  }

                  return (
                    <article
                      className={prod.blackFriday ? 'product-card con-blackfriday' : 'product-card'}
                      key={prod.id}
                      role="button"
                      tabIndex={0}
                      title="Ver detalle del producto"
                      onClick={() => abrirProducto(prod)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') abrirProducto(prod)
                      }}
                    >
                      <div className="product-image-container">
                        <img src={srcImagen} alt={nombreDe(prod)} />
                        <span className={`product-state-tag ${badgeEstado(prod.estado)}`}>
                          {etiquetaEstado(prod.estado)}
                        </span>
                        {prod.blackFriday && (
                          <span className="product-blackfriday-tag">Black Friday</span>
                        )}
                      </div>

                      <div className="product-info">
                        <span className="product-brand">{prod.marca}</span>
                        <h3 className="product-name">{nombreDe(prod)}</h3>

                        <div className="product-price-row">
                          <span className="product-current-price">COP {formatCurrency(prod.precio)}</span>
                          {prod.precioAnterior && (
                            <span className="product-old-price">COP {formatCurrency(prod.precioAnterior)}</span>
                          )}
                          {prod.descuento > 0 && (
                            <span className="product-discount">-{prod.descuento}%</span>
                          )}
                        </div>

                        <p className="product-seller">
                          Vendido por: <span>{prod.vendedor ? prod.vendedor.nombre : 'AEGIS'}</span>
                        </p>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}
