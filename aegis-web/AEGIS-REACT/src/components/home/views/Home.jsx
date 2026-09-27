import { useState, useEffect } from 'react'
import { formatCurrency, imageUrl } from '../../shared/presentation'
import { PRODUCTOS_DESTACADOS } from '../../productos/productosDemo'
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

export default function Home({ productos = [], auth, message, onNavigate }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [categoryOpen, setCategoryOpen] = useState(false)

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

  const openPlantilla = (event, origen) => {
    if (event) event.preventDefault()
    if (onNavigate) onNavigate(`/plantilla?origen=${encodeURIComponent(origen)}`)
  }

  const openProductoId = (id) => {
    if (onNavigate) onNavigate(`/productos/detalle?id=${id}`)
  }

  const openProducto = (prod) => {
    openProductoId(prod.id)
  }

  return (
    <div className="page-layout">
      <Header title="AEGIS | Home" auth={auth} onNavigate={onNavigate} />

      {/* Subnavegación */}
      <section className="subnav">
        <div className="dropdown-container">
          <button
            className="dropdown-btn"
            onClick={() => setCategoryOpen(!categoryOpen)}
            type="button"
          >
            Categorías <span className="arrow-down">▼</span>
          </button>

          {categoryOpen && (
            <div className="dropdown-menu">
              <a href="#">Celulares</a>
              <a href="#">Componentes PC</a>
              <a href="#">Laptops</a>
              <a href="#">Consolas & Juegos</a>
              <a href="#">Periféricos</a>
            </div>
          )}
        </div>
        <a href="#">Ofertas</a>
        <a href="#">Gaming</a>
        <a href="#">Reacondicionado</a>
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

          {/* Tarjetas Laterales con Banners Integrados */}
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
                href="#"
                title="Ver plantilla: Banner Black Friday"
                onClick={(e) => openPlantilla(e, 'banner-black-friday')}
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
              href="#"
              title="Ver plantilla: Banner Celulares"
              onClick={(e) => openPlantilla(e, 'banner-celulares')}
            >
              <img
                src="/celulares-banner.png"
                alt="EQUIPA TU VIDA CON LO MEJOR EN CELULARES"
                className="promo-grid-img"
              />
            </a>

            {(productos.length > 0 ? productos : PRODUCTOS_DESTACADOS).map((prod) => {
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
                  key={prod.id}
                  role="button"
                  tabIndex={0}
                  title="Ver detalle del producto"
                  onClick={() => openProducto(prod)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openProducto(prod)
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
            })}
          </div>
        </section>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}