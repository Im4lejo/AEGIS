import { useEffect, useState } from 'react'
import { productApi } from '../../../services/api'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { route } from '../../shared/presentation'
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  ProductCard,
  Skeleton,
  Tabs,
} from '../../shared/ui'
import { LoadingState } from '../../shared/ApiState'
import '../css/home.css'
import '../css/home-foundation.css'

function ProductGrid({ products, loading, error }) {
  if (loading) {
    return (
      <section aria-label="Cargando productos" className="home-products-grid">
        <LoadingState message="Cargando productos disponibles..." />
        {Array.from({ length: 6 }, (_, index) => (
          <Card as="article" className="home-product-skeleton" key={index}>
            <Skeleton height="150px" width="100%" />
            <Skeleton height="1rem" width="72%" />
            <Skeleton height="1rem" width="42%" />
          </Card>
        ))}
      </section>
    )
  }

  if (error) return <ErrorState error={error} />
  if (!products.length) {
    return (
      <EmptyState
        message="Vuelve más tarde para ver los nuevos productos."
        title="Todavía no hay productos publicados"
      />
    )
  }

  return (
    <div className="home-products-grid" aria-label="Productos destacados">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default function Home({ auth, message, onNavigate }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    let active = true
    productApi
      .home()
      .then(({ data }) => {
        if (active) {
          setProducts(data)
          setError(null)
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!message) return undefined
    const show = window.setTimeout(() => setFeedback(message), 0)
    const hide = window.setTimeout(() => setFeedback(''), 5000)
    return () => {
      window.clearTimeout(show)
      window.clearTimeout(hide)
    }
  }, [message])

  const submitSearch = (event) => {
    event.preventDefault()
    const query = search.trim()
    onNavigate?.(
      query ? `/productos?buscar=${encodeURIComponent(query)}` : '/productos',
    )
  }

  const tabs = [
    {
      id: 'para-ti',
      label: 'Para ti',
      content: (
        <>
          <p className="home-feed-note">
            Selección pública de productos recientes. La personalización por
            cuenta aún no está disponible.
          </p>
          <ProductGrid error={error} loading={loading} products={products} />
        </>
      ),
    },
    {
      id: 'siguiendo',
      label: 'Siguiendo · próximamente',
      disabled: true,
      disabledReason: 'El feed de cuentas seguidas aún no está disponible.',
      content: null,
    },
    {
      id: 'recientes',
      label: 'Recientes',
      content: (
        <Card className="home-recent-card">
          <p>
            Consulta el catálogo completo y sus filtros para encontrar productos
            recientes.
          </p>
          <Button onClick={() => onNavigate?.('/novedades')}>
            Ver productos recientes
          </Button>
        </Card>
      ),
    },
  ]

  return (
    <div className="page-layout home-layout">
      <Header auth={auth} onNavigate={onNavigate} title="AEGIS | Inicio" />
      <main className="home-container">
        {feedback && (
          <div className="home-feedback" role="status">
            {feedback}
          </div>
        )}

        <Card className="home-composer">
          <div>
            <span className="home-eyebrow">
              AEGIS · Marketplace y comunidad
            </span>
            <h1>Encuentra tu próxima tecnología</h1>
            <p>
              Busca productos publicados y explora conversaciones de la
              comunidad.
            </p>
          </div>
          <form onSubmit={submitSearch} role="search">
            <Input
              aria-label="Producto que buscas"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ej. tarjeta gráfica, teclado..."
              value={search}
            />
            <Button type="submit">Buscar productos</Button>
          </form>
        </Card>

        <section
          aria-label="Contenido del inicio"
          className="home-feed-section"
        >
          <div className="home-section-heading">
            <div>
              <span className="home-eyebrow">Explora AEGIS</span>
              <h2>Productos para descubrir</h2>
            </div>
            <a
              href={route('/productos')}
              onClick={(event) => {
                event.preventDefault()
                onNavigate?.('/productos')
              }}
            >
              Ver marketplace
            </a>
          </div>
          <Tabs label="Feed de inicio" tabs={tabs} />
        </section>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
