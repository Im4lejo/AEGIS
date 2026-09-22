import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { formatCurrency, imageUrl, route } from '../../shared/presentation'

function productState(state) {
    if (state === 'nuevo') return { label: 'Nuevo', className: '' }
    if (state === 'reacondicionado') return { label: 'Reacondicionado', className: 'green' }
    return { label: 'Usado', className: 'blue' }
}

export default function Home({ productos = [], auth, message, onNavigate }) {
    return (
        <>
            <Header title="AEGIS | Inicio" auth={auth} onNavigate={onNavigate} />
            <section className="subnav"><a href="#">Categorías</a><a href="#">Ofertas</a><a href="#">Electrónica</a><a href="#">Gaming</a><a href="#">Accesorios</a></section>
            <main className="home-container">
                {message && <div className="auth-alert auth-alert--success">{message}</div>}
                <section className="hero-section">
                    <div className="hero-main"><div className="hero-badge">Oferta destacada</div><h1>Potencia tu juego <span>al máximo</span></h1><h2>NVIDIA GeForce RTX™ 4070 Ti SUPER</h2><p>Gráficos increíbles, rendimiento superior y la experiencia gaming definitiva.</p><div className="hero-price"><h3>$4.299.000</h3><span>$5.100.000</span></div><div className="hero-buttons"><a className="primary-btn" href={route('/productos')}>Comprar ahora</a><a className="secondary-btn" href={route('/productos')}>Ver detalles</a></div></div>
                    <div className="hero-side"><div className="promo-card orange"><span>Oferta Hot</span><h3>Portátil HP Victus Gaming</h3><p>Hasta 50% OFF</p><a href={route('/productos')}>Ver oferta</a></div><div className="promo-card blue"><span>Black Friday</span><h3>Descuentos increíbles</h3><p>Hasta 70% DTO</p><a href={route('/productos')}>Ver ofertas</a></div></div>
                </section>
                <section className="features"><div className="feature-card"><i className="fa-solid fa-shield-halved" /><div><h4>Transacciones Seguras</h4><p>Compra con confianza</p></div></div><div className="feature-card"><i className="fa-solid fa-user-check" /><div><h4>Usuarios Verificados</h4><p>Perfiles con reputación</p></div></div><div className="feature-card"><i className="fa-solid fa-location-dot" /><div><h4>Puntos Físicos</h4><p>Encuentros seguros</p></div></div><div className="feature-card"><i className="fa-solid fa-comments" /><div><h4>Comunidad Activa</h4><p>Foros y ayuda</p></div></div></section>
                <section className="products-section"><div className="section-header"><h2>Productos Destacados</h2><a href={route('/productos')}>Ver todos</a></div><div className="products-grid">{productos.map((product) => { const state = productState(product.estado_producto); return <a key={product.id} href={route(`/productos/detalle?id=${product.id}`)} className="product-card-link"><article className="product-card"><div className={`product-tag ${state.className}`}>{state.label}</div><img src={imageUrl(product.imagen_principal)} alt={product.titulo} loading="lazy" /><h3>{product.titulo}</h3><div className="product-vendor"><p>{product.vendedor_nombre || 'Vendedor desconocido'}</p><small><i className="fa-solid fa-star" /> {Number(product.vendedor_reputacion || 5).toFixed(1)}</small></div><div className="product-location">{product.ciudad || 'No especificada'}</div><div className="product-price">${formatCurrency(product.precio)} COP</div></article></a> })}</div></section>
            </main>
            <Footer />
        </>
    )
}