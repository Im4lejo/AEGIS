import { useState, useEffect, useRef } from 'react'
import { formatCurrency, imageUrl, route } from '../../shared/presentation'
import { PRODUCTOS_DESTACADOS, PRODUCTOS_PROMOCION, PRODUCTOS_NOVEDADES } from '../../productos/productosDemo'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import '../css/home.css'

const BANNER_SLIDES = [
  {
    id: 1,
    tag: "¡POTENCIA TU GAMING AL MÁXIMO!",
    title: "NVIDIA GEFORCE RTX™ 4070 Ti SUPER",
    subtitle: "12GB GDDR6X | ARQUITECTURA ADA LOVELACE | DLSS 3 & RAY TRACING",
    badge: "¡LA MEJOR OFERTA!",
    price: "€829.00",
    oldPrice: "€829.99",
    btnText: "¡CÓMPRALA YA!",
    image: "/rtx-4070.jpg",
    productoId: 9
  },
  {
    id: 2,
    tag: "RENDIMIENTO IMPARABLE PARA GAMERS",
    title: "PORTÁTIL HP VICTUS GAMING",
    subtitle: "PROCESADOR INTEL CORE i5 | 16GB RAM | 512GB SSD | GRÁFICOS NVIDIA RTX",
    badge: "PRECIO ESPECIAL 50% DESCUENTO",
    price: "$1.899.900",
    oldPrice: "$3.799.800",
    btnText: "COMPRAR AHORA!",
    image: "/hp-victus.jpg",
    productoId: 10
  }
]

function productState(state) {
  if (state === 'nuevo') return { label: 'Nuevo', className: 'badge-new' }
  if (state === 'reacondicionado') return { label: 'Reacondicionado', className: 'badge-refurbished' }
  return { label: 'Usado', className: 'badge-used' }
}

function TiraBanner() {
  const palabras = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  return (
    <div className="tv-banner-strip">
      {palabras.map((i) => (
        <span key={i} className={`tv-banner-palabra ${i % 3 === 0 ? 'rojo' : i % 3 === 1 ? 'negro' : 'blanco'}`}>
          HAZLO GRANDE
        </span>
      ))}
    </div>
  )
}

function TarjetaProducto({ prod, alAbrir }) {
  const stateInfo = productState(prod.estado)
  const srcImagen = prod.imagen && prod.imagen.startsWith('http')
    ? prod.imagen
    : imageUrl(prod.imagen)

  let vendedor = prod.vendedor
  if (vendedor && vendedor.nombre) vendedor = vendedor.nombre
  if (!vendedor) vendedor = 'Charlie Kirk'

  return (
    <div
      className="product-card"
      role="button"
      tabIndex={0}
      title="Ver detalle del producto"
      onClick={() => alAbrir(prod)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          alAbrir(prod)
        }
      }}
    >
      <div className="product-image-container">
        <img src={srcImagen} alt={prod.nombre} />
        <span className={`product-state-tag ${stateInfo.className}`}>
          {stateInfo.label}
        </span>
      </div>

      <div className="product-info">
        <h3 className="product-name">{prod.nombre}</h3>
        <p className="product-description">{prod.descripcion}</p>

        <p className="product-seller">
          Vendido por: <span>{vendedor}</span>
        </p>

        <div className="product-price-row">
          <span className="product-price">{formatCurrency(prod.precio)}</span>
          {prod.descuento && (
            <span className="product-discount">{prod.descuento}% OFF</span>
          )}
        </div>
      </div>
    </div>
  )
}

const IDS_MAS_PRODUCTOS = [13, 20, 18, 19]
const MAS_PRODUCTOS = IDS_MAS_PRODUCTOS.map((id) => PRODUCTOS_PROMOCION.find((prod) => prod.id === id))

export default function Home({ productos = [], auth, message, onNavigate }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const categoryRef = useRef(null)

  useEffect(() => {
    if (!categoryOpen) return
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [categoryOpen])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? BANNER_SLIDES.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === BANNER_SLIDES.length - 1 ? 0 : prev + 1))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext()
    }, 6000)
    return () => clearInterval(interval)
  }, [currentIndex])

  const slide = BANNER_SLIDES[currentIndex]

  const openProductoId = (id) => {
    if (onNavigate) onNavigate(`/productos/detalle?id=${id}`)
  }

  const openProducto = (prod) => {
    openProductoId(prod.id)
  }

  const abrirCatalogo = (consulta) => {
    setCategoryOpen(false)
    if (onNavigate) onNavigate('/productos' + consulta)
  }

  return (
    <div className="page-layout home-layout">
      <Header title="AEGIS | Home" auth={auth} onNavigate={onNavigate} />

      <section className="subnav">
        <div className="dropdown-container" ref={categoryRef}>
          <button
            className="dropdown-btn"
            onClick={() => setCategoryOpen(!categoryOpen)}
            type="button"
          >
            Categorías <span className="arrow-down">▼</span>
          </button>

          {categoryOpen && (
            <div className="dropdown-menu">
              <a href={route('/productos?categoria=Celulares')} onClick={(e) => { e.preventDefault(); abrirCatalogo('?categoria=Celulares') }}>Celulares</a>
              <a href={route('/productos?categoria=Componentes PC')} onClick={(e) => { e.preventDefault(); abrirCatalogo('?categoria=Componentes PC') }}>Componentes PC</a>
              <a href={route('/productos?categoria=Laptops')} onClick={(e) => { e.preventDefault(); abrirCatalogo('?categoria=Laptops') }}>Laptops</a>
              <a href={route('/productos?categoria=Consolas')} onClick={(e) => { e.preventDefault(); abrirCatalogo('?categoria=Consolas') }}>Consolas</a>
              <a href={route('/productos?categoria=Periféricos')} onClick={(e) => { e.preventDefault(); abrirCatalogo('?categoria=Periféricos') }}>Periféricos</a>
              <a href={route('/productos?categoria=Wearables')} onClick={(e) => { e.preventDefault(); abrirCatalogo('?categoria=Wearables') }}>Wearables</a>
              <a href={route('/productos?categoria=Smart Home')} onClick={(e) => { e.preventDefault(); abrirCatalogo('?categoria=Smart Home') }}>Smart Home</a>
              <a href={route('/productos?categoria=Audio')} onClick={(e) => { e.preventDefault(); abrirCatalogo('?categoria=Audio') }}>Audio</a>
              <a href={route('/productos?categoria=Oficina y Conectividad')} onClick={(e) => { e.preventDefault(); abrirCatalogo('?categoria=Oficina y Conectividad') }}>Oficina y Conectividad</a>
              <a href={route('/productos?categoria=Foto y Video')} onClick={(e) => { e.preventDefault(); abrirCatalogo('?categoria=Foto y Video') }}>Foto y Video</a>
            </div>
          )}
        </div>
        <a href={route('/productos?filtro=ofertas')} onClick={(e) => { e.preventDefault(); abrirCatalogo('?filtro=ofertas') }}>Ofertas</a>
        <a href={route('/productos?filtro=gaming')} onClick={(e) => { e.preventDefault(); abrirCatalogo('?filtro=gaming') }}>Gaming</a>
        <a href={route('/productos?filtro=reacondicionado')} onClick={(e) => { e.preventDefault(); abrirCatalogo('?filtro=reacondicionado') }}>Reacondicionado</a>
        <a href={route('/novedades')} onClick={(e) => { e.preventDefault(); setCategoryOpen(false); if (onNavigate) onNavigate('/novedades') }}>Novedades</a>
      </section>

      <main className="home-container">
        {message && <div className="auth-alert auth-alert--success">{message}</div>}

        <div className="main-section-header">
          <h2>Productos Destacados</h2>
        </div>

        <section className="hero-section">

          <div className="hero-main" onClick={() => openProductoId(slide.productoId)}>
            <img
              src={slide.image}
              alt={slide.title}
              className="hero-bg-img"
            />

            <div className="hero-overlay"></div>

            <div className="hero-content">
              <div className="hero-tag">{slide.tag}</div>
              <h2 className="hero-title">{slide.title}</h2>
              <p className="hero-subtitle">{slide.subtitle}</p>

              <div className="hero-pricing">
                <div className="price-tag">
                  {slide.badge && <span className="price-badge">{slide.badge}</span>}
                  <span className="price-value">
                    {slide.price} {slide.oldPrice && <small>({slide.oldPrice})</small>}
                  </span>
                </div>
                <button className="buy-btn" type="button">{slide.btnText}</button>
              </div>
            </div>

            <button
              className="carousel-arrow left"
              onClick={(event) => { event.stopPropagation(); handlePrev() }}
              type="button"
            >
              &#10094;
            </button>

            <button
              className="carousel-arrow right"
              onClick={(event) => { event.stopPropagation(); handleNext() }}
              type="button"
            >
              &#10095;
            </button>

            <div className="carousel-dots">
              {BANNER_SLIDES.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={(event) => { event.stopPropagation(); setCurrentIndex(index) }}
                  type="button"
                />
              ))}
            </div>
          </div>

          <div className="hero-side">
            <div className="side-banner-card">
              <a
                className="side-banner-link"
                href="#/productos/detalle?id=10"
                title="Ver producto: Portátil HP Victus"
                onClick={(event) => { event.preventDefault(); openProductoId(10) }}
              >
                <img src="/hp-victus.jpg" alt="OFERTA HOT: PORTÁTIL HP VICTUS GAMING" className="side-banner-img" />
              </a>
            </div>

            <div className="side-banner-card">
              <a
                className="side-banner-link"
                href={route('/productos?filtro=blackfriday')}
                title="Ver productos en Black Friday"
                onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('/productos?filtro=blackfriday') }}
              >
                <img
                  src="/blackfriday.jpg"
                  alt="BLACK FRIDAY DESCUENTOS INCREÍBLES"
                  className="side-banner-img"
                />
              </a>
            </div>
          </div>
        </section>

        <section className="explore-banner">
          <h2>Explora Más Productos</h2>
        </section>

        <section className="products-section">
          <div className="products-grid">

            <a
              className="promo-product-card"
              href={route('/productos?categoria=Celulares')}
              title="Ver productos de la categoría Celulares"
              onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('/productos?categoria=Celulares') }}
            >
              <img
                src="/celulares-banner.png"
                alt="EQUIPA TU VIDA CON LO MEJOR EN CELULARES"
                className="promo-grid-img"
              />
            </a>

            {(productos.length > 0 ? productos : PRODUCTOS_DESTACADOS).map((prod) => (
              <TarjetaProducto key={prod.id} prod={prod} alAbrir={openProducto} />
            ))}
          </div>
        </section>

        <section className="tv-banner">
          <TiraBanner />
          <div className="tv-banner-body">
            <div className="tv-banner-imgs">
              <img
                src="https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800"
                alt="Televisor LG OLED 4K"
              />
              <img
                src="https://images.unsplash.com/photo-1461151304267-38535e780c79?q=80&w=800"
                alt="Smart TV Samsung Crystal 4K"
              />
            </div>
            <div className="tv-banner-text">
              <span className="tv-banner-tag">SOLO ESTA SEMANA</span>
              <h2>SMART TV <span className="tv-banner-destacado">4K</span></h2>
              <p>HASTA 45% DE DESCUENTO EN TELEVISORES</p>
              <a
                className="tv-banner-btn"
                href={route('/productos?categoria=Televisores')}
                onClick={(e) => { e.preventDefault(); abrirCatalogo('?categoria=Televisores') }}
              >
                VER OFERTAS
              </a>
            </div>
          </div>
          <TiraBanner />
        </section>

        <section className="novedades">
          <div className="main-section-header">
            <h2>Novedades en AEGIS</h2>
          </div>

          <div className="novedades-banners">
            <div
              className="novedad-banner novedad-casa"
              role="button"
              tabIndex={0}
              onClick={() => abrirCatalogo('?categoria=Smart Home')}
              onKeyDown={(e) => { if (e.key === 'Enter') abrirCatalogo('?categoria=Smart Home') }}
            >
              <div className="novedad-texto">
                <span className="novedad-tag">NUEVO</span>
                <h3>Tu hogar más inteligente</h3>
                <p>Altavoces con Alexa, cámaras Wi-Fi y focos RGB.</p>
                <span className="novedad-btn">Ver Smart Home</span>
              </div>
            </div>

            <div
              className="novedad-banner novedad-audio"
              role="button"
              tabIndex={0}
              onClick={() => abrirCatalogo('?categoria=Audio')}
              onKeyDown={(e) => { if (e.key === 'Enter') abrirCatalogo('?categoria=Audio') }}
            >
              <div className="novedad-texto">
                <span className="novedad-tag">OFERTA</span>
                <h3>Audio sin límites</h3>
                <p>Audífonos con cancelación de ruido y bocinas resistentes al agua.</p>
                <span className="novedad-btn">Ver Audio</span>
              </div>
            </div>

            <div
              className="novedad-banner novedad-video"
              role="button"
              tabIndex={0}
              onClick={() => abrirCatalogo('?categoria=Foto y Video')}
              onKeyDown={(e) => { if (e.key === 'Enter') abrirCatalogo('?categoria=Foto y Video') }}
            >
              <div className="novedad-texto">
                <span className="novedad-tag">NUEVO</span>
                <h3>Foto y video</h3>
                <p>Drones con cámara 4K para tus mejores tomas aéreas.</p>
                <span className="novedad-btn">Ver Foto y Video</span>
              </div>
            </div>

            <div
              className="novedad-banner novedad-wearables"
              role="button"
              tabIndex={0}
              onClick={() => abrirCatalogo('?categoria=Wearables')}
              onKeyDown={(e) => { if (e.key === 'Enter') abrirCatalogo('?categoria=Wearables') }}
            >
              <div className="novedad-texto">
                <span className="novedad-tag">NUEVO</span>
                <h3>Wearables</h3>
                <p>Smartwatch y pulseras de actividad para cada día.</p>
                <span className="novedad-btn">Ver Wearables</span>
              </div>
            </div>
          </div>

          <div className="products-grid">
            {PRODUCTOS_NOVEDADES.map((prod) => (
              <TarjetaProducto key={prod.id} prod={prod} alAbrir={openProducto} />
            ))}
          </div>
        </section>

        <section className="products-section">
          <div className="main-section-header">
            <h2>Teclados y Memorias RAM en Oferta</h2>
          </div>
          <div className="products-grid">
            {MAS_PRODUCTOS.map((prod) => (
              <TarjetaProducto key={prod.id} prod={prod} alAbrir={openProducto} />
            ))}
          </div>
        </section>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}