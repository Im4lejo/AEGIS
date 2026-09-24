import React, { useState, useEffect } from 'react'
import { formatCurrency, imageUrl } from '../../shared/presentation'
import '../css/home.css'

// --- COMPONENTE HEADER ---
function Header({ auth, onNavigate }) {
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="main-header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo" onClick={() => onNavigate && onNavigate('/')}>
          <img src="/assets/aegis-logo.png" alt="AEGIS" className="logo-img" />
          <span className="logo-text">AEGIS</span>
        </div>

       
        <nav className="header-nav">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('/'); }}>Inicio</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('/productos'); }}>Productos</a>
          <a href="#">Publicar Producto</a>
          <a href="#">Foro</a>
        </nav>

        {/* Buscador */}
        <div className="header-search">
          <input type="text" placeholder="Busca tu producto aquí..." />
          <button className="search-btn" type="button"></button>
        </div>

        
        <div className="header-user-actions">
          <div className="profile-dropdown-container">
            <button 
              className="profile-btn"
              onClick={() => setProfileOpen(!profileOpen)}
              type="button"
            >
              <img src={auth?.user?.avatar || "/assets/default-avatar.png"} alt="Perfil" className="profile-img" />
            </button>

            {profileOpen && (
              <div className="profile-menu">
                <a href="#">Mi Perfil</a>
                <a href="#">Mis Compras</a>
                <a href="#">Configuración</a>
                <hr />
                <a href="#" className="logout-link">Cerrar Sesión</a>
              </div>
            )}
          </div>

          <button className="cart-btn" aria-label="Carrito de compras" type="button">
            🛒
            <span className="cart-badge">0</span>
          </button>
        </div>
      </div>
    </header>
  )
}


function Footer({ onNavigate }) {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/assets/aegis-logo.png" alt="AEGIS" className="logo-img" />
            <span className="logo-text">AEGIS</span>
          </div>
          <p className="footer-description">
            Tu plataforma de confianza para comprar, vender y gestionar productos de tecnología y componentes.
          </p>
        </div>

        <div className="footer-links-group">
          <div className="footer-column">
            <h4>Navegación</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('/'); }}>Inicio</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('/productos'); }}>Productos</a></li>
              <li><a href="#">Puntos Verificados</a></li>
              <li><a href="#">Foro</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Soporte</h4>
            <ul>
              <li><a href="#">Centro de Ayuda</a></li>
              <li><a href="#">Preguntas Frecuentes</a></li>
              <li><a href="#">Términos y Condiciones</a></li>
              <li><a href="#">Políticas de Privacidad</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Contacto</h4>
            <p>Email: soporte@aegis.com</p>
            <p>Tel: +57 (602) 800-0000</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AEGIS. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

// --- DATOS DE SLIDES DEL CARRUSEL ---
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
    image: "/rtx-4070.jpg"
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
    image: "/hp-victus.png"
  }
]

            const productosEjemplo = [
  {
    id: 1,
    nombre: 'Televisor LG OLED 55" 4K Smart TV AI ThinQ',
    descripcion: 'Procesador α9 Gen6 - 120Hz Refresh Rate - Dolby Vision / Atmos',
    estado: 'nuevo',
    precio: 3899999,
    descuento: 15,
    vendedor: 'LG Store Oficial',
    imagen: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800'
  },
  {
    id: 2,
    nombre: 'Laptop Lenovo IdeaPad Slim 5 16" AMD Ryzen 7',
    descripcion: 'Almacenamiento: 512GB SSD - RAM: 16GB DDR5 - Pantalla FHD+',
    estado: 'nuevo',
    precio: 2899999,
    descuento: 20,
    vendedor: 'Lenovo Colombia',
    imagen: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800'
  },
  {
    id: 3,
    nombre: 'iPhone 15 Pro Max 256GB Titanio Natural',
    descripcion: 'Pantalla Super Retina XDR 6.7" - Chip A17 Pro - Cámara 48MP',
    estado: 'reacondicionado',
    precio: 4999999,
    descuento: 10,
    vendedor: 'Charlie Kit',
    imagen: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800'
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

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext()
    }, 6000)
    return () => clearInterval(interval)
  }, [currentIndex])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? BANNER_SLIDES.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === BANNER_SLIDES.length - 1 ? 0 : prev + 1))
  }

  const slide = BANNER_SLIDES[currentIndex]

  return (
    <div className="page-layout">
      <Header auth={auth} onNavigate={onNavigate} />
      
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
          
          <div className="hero-main">
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

            <button className="carousel-arrow left" onClick={handlePrev} type="button">
              &#10094;
            </button>

            <button className="carousel-arrow right" onClick={handleNext} type="button">
              &#10095;
            </button>

            <div className="carousel-dots">
              {BANNER_SLIDES.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(index)}
                  type="button"
                />
              ))}
            </div>
          </div>

          {/* Tarjetas Laterales con Banners Integrados */}
          <div className="hero-side">
            <div className="side-banner-card">
              <img src="/public/hp-victus.jpg" alt="OFERTA HOT: PORTÁTIL HP VICTUS GAMING" className="side-banner-img" />
            </div>

               <div className="side-banner-card">
            <a 
                className="side-banner-link"
                onClick={(e) => {
                e.preventDefault();
                
                }}
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
      {/* Separador Azul */}
      <section className="explore-banner">
        <h2>Explora Mas Productos</h2>
      </section>

      {/* Grid de Productos */}
      <section className="products-section">
        <div className="products-grid">
          {/* Banner Promocional a la izquierda */}
          <div className="promo-product-card">
            <img 
              src="/public/celulares-banner.png" 
              alt="EQUIPA TU VIDA CON LO MEJOR EN CELULARES" 
              className="promo-grid-img" 
            />
          </div>

          {/* Tarjetas de Productos desplegándose consecutivamente a la derecha */}
          {(productos.length > 0 ? productos : productosEjemplo).map((prod) => {
            const stateInfo = productState(prod.estado)
            const srcImagen = prod.imagen?.startsWith('http') 
              ? prod.imagen 
              : imageUrl(prod.imagen)

            return (
              <div className="product-card" key={prod.id}>
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
                    Vendido por: <span>{prod.vendedor?.nombre || prod.vendedor || 'Charlie Kirk'}</span>
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