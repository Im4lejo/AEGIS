import { useEffect, useMemo, useState } from 'react'
import { advancedContentApi, productApi } from '../../../services/api'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { formatCurrency, imageUrl, route } from '../../shared/presentation'
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Modal,
  ProductCard,
  Skeleton,
  Tabs,
} from '../../shared/ui'
import '../css/home.css'
import '../css/home-foundation.css'

function fotoProducto(product) {
  if (product.imagen_principal) return product.imagen_principal
  if (product.imagen) return product.imagen
  if (product.imagenes && product.imagenes.length) return product.imagenes[0].imagen
  return ''
}

function ProductRail({
  products,
  loading,
  error,
  onNavigate,
  ariaLabel = 'Productos destacados',
}) {
  if (loading) {
    return (
      <section aria-label="Cargando productos" className="home-products-rail">
        {Array.from({ length: 5 }, (_, index) => (
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
    <div
      aria-label={ariaLabel}
      aria-roledescription="carrusel"
      className="home-products-rail"
      role="region"
      tabIndex={0}
    >
      {products.map((product) => (
        <div className="home-rail-item" key={product.id}>
          <ProductCard
            product={product}
            onSelect={() => onNavigate && onNavigate(`/productos/detalle?id=${product.id}`)}
          />
        </div>
      ))}
    </div>
  )
}

function CategoryProductRails({ products, loading, error, onNavigate }) {
  const categories = useMemo(() => {
    const grouped = new Map()
    products.forEach((product) => {
      const name = product.categoria?.nombre?.trim()
      if (!name) return
      const items = grouped.get(name) || []
      items.push(product)
      grouped.set(name, items)
    })
    return [...grouped.entries()].filter(([, items]) => items.length > 1)
  }, [products])

  if (loading) return null
  if (error) {
    return (
      <section aria-label="Productos por categoría" className="home-category-rails">
        <ErrorState compact error={error} />
      </section>
    )
  }
  if (!categories.length) return null

  return (
    <section
      aria-label="Carruseles de productos por categoría"
      className="home-category-rails"
    >
      {categories.map(([name, items], index) => {
        const headingId = `home-category-heading-${index}`
        const categoryPath = `/productos?categoria=${encodeURIComponent(name)}`
        return (
          <section
            aria-labelledby={headingId}
            className="home-category-rail"
            key={name}
          >
            <div className="home-section-heading">
              <h2 id={headingId}>{name}</h2>
              <a
                href={route(categoryPath)}
                onClick={(event) => {
                  event.preventDefault()
                  onNavigate?.(categoryPath)
                }}
              >
                Ver categoría
              </a>
            </div>
            <ProductRail
              ariaLabel={`Productos de ${name}`}
              onNavigate={onNavigate}
              products={items}
            />
          </section>
        )
      })}
    </section>
  )
}

function HeroCarousel({ products, onNavigate }) {
  const [indice, setIndice] = useState(0)
  const destacados = products.slice(0, 5)

  useEffect(() => {
    if (destacados.length < 2) return undefined
    const timer = window.setInterval(() => {
      setIndice((actual) => (actual + 1) % destacados.length)
    }, 6000)
    return () => window.clearInterval(timer)
  }, [destacados.length])

  if (!destacados.length) return null

  const activo = destacados[indice] || destacados[0]
  const anterior = () => setIndice((actual) => (actual === 0 ? destacados.length - 1 : actual - 1))
  const siguiente = () => setIndice((actual) => (actual === destacados.length - 1 ? 0 : actual + 1))
  const abrir = () => {
    if (onNavigate) onNavigate(`/productos/detalle?id=${activo.id}`)
  }

  return (
    <section className="home-hero" aria-label="Productos destacados">
      <div className="home-hero__slide">
        <img className="home-hero__image" src={imageUrl(fotoProducto(activo))} alt={activo.titulo || 'Producto'} />
        <div className="home-hero__overlay" />
        <div className="home-hero__content">
          <span className="home-hero__tag">Destacado AEGIS</span>
          <h1>{activo.titulo || 'Producto'}</h1>
          <p>{activo.categoria?.nombre || 'Marketplace AEGIS'}</p>
          <strong className="home-hero__price">COP {formatCurrency(activo.precio)}</strong>
          <div className="home-hero__actions">
            <Button onClick={abrir}>Ver producto</Button>
            <a
              className="home-hero__link"
              href={route('/productos')}
              onClick={(event) => {
                event.preventDefault()
                if (onNavigate) onNavigate('/productos')
              }}
            >
              Ver marketplace
            </a>
          </div>
        </div>
      </div>
      <button type="button" className="home-hero__arrow left" aria-label="Producto anterior" onClick={anterior}>
        ‹
      </button>
      <button type="button" className="home-hero__arrow right" aria-label="Producto siguiente" onClick={siguiente}>
        ›
      </button>
      <div className="home-hero__dots" role="tablist" aria-label="Seleccionar producto destacado">
        {destacados.map((product, posicion) => (
          <button
            type="button"
            key={product.id}
            className={posicion === indice ? 'home-hero__dot active' : 'home-hero__dot'}
            aria-label={`Ver producto ${posicion + 1}`}
            aria-selected={posicion === indice}
            onClick={() => setIndice(posicion)}
          />
        ))}
      </div>
    </section>
  )
}

function ProductReels({ products, stories, storyError, auth, onNavigate }) {
  const [selectedKey, setSelectedKey] = useState(null)
  const [loadedStory, setLoadedStory] = useState(null)
  const [viewerError, setViewerError] = useState(null)
  const reelItems = useMemo(
    () => [
      ...products.slice(0, 7).map((product) => ({
        key: `product-${product.id}`,
        type: 'product',
        product,
      })),
      ...stories.slice(0, 3).map((story) => ({
        key: `story-${story.id}`,
        type: 'story',
        story,
      })),
    ],
    [products, stories],
  )
  const visibleReels = reelItems.slice(0, 7)
  const selectedIndex = reelItems.findIndex((item) => item.key === selectedKey)
  const activeReel = selectedIndex >= 0 ? reelItems[selectedIndex] : null
  const activeStory = activeReel?.type === 'story'
    ? loadedStory?.id === activeReel.story.id
      ? loadedStory
      : activeReel.story
    : null

  useEffect(() => {
    if (!activeReel || reelItems.length < 2) return undefined
    const timer = window.setTimeout(() => {
      setSelectedKey(reelItems[(selectedIndex + 1) % reelItems.length].key)
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [activeReel, reelItems, selectedIndex])

  useEffect(() => {
    if (activeReel?.type !== 'story') return undefined

    let active = true
    advancedContentApi
      .story(activeReel.story.id, auth?.token)
      .then(({ data }) => {
        if (active) {
          setLoadedStory(data)
          setViewerError(null)
        }
      })
      .catch((requestError) => {
        if (active) {
          setViewerError({
            id: activeReel.story.id,
            message: requestError.message,
          })
        }
      })
    return () => {
      active = false
    }
  }, [activeReel, auth?.token])

  const moveReel = (direction) => {
    if (!reelItems.length || selectedIndex < 0) return
    const nextIndex = (selectedIndex + direction + reelItems.length) % reelItems.length
    setSelectedKey(reelItems[nextIndex].key)
  }

  return (
    <section className="aegis-stories" aria-label="Reels y promociones">
      <div className="home-section-heading home-reels-heading">
        <h2>Ofertas destacadas de la semana</h2>
      </div>
      {storyError && <p role="alert">{storyError}</p>}
      {visibleReels.length ? (
        <div className="aegis-stories__rail">
          {visibleReels.map((item, index) => {
            const product = item.product
            const story = item.story
            const name = product?.titulo || story?.usuario?.username || story?.usuario?.nombre || 'Historia'
            const image = product
              ? imageUrl(fotoProducto(product))
              : story?.media_url
            const promoClass = product
              ? ` aegis-story--promo aegis-story--promo-${index % 4}`
              : ''
            return (
              <button
                type="button"
                className={`aegis-story${promoClass}`}
                key={item.key}
                onClick={() => {
                  setViewerError(null)
                  setSelectedKey(item.key)
                }}
                aria-label={`Ver reel de ${name}`}
              >
                {story?.tipo_media === 'video'
                  ? <video src={image} muted aria-hidden="true" />
                  : <img src={image} alt="" />}
                <span className="aegis-story__shade" />
                {product && <span className="aegis-story__badge">Oferta AEGIS</span>}
                <span className="aegis-story__content">
                  <span className="aegis-story__type">
                    {product ? 'Oferta destacada' : 'Reel de la comunidad'}
                  </span>
                  <strong>{name}</strong>
                  {product && (
                    <span className="aegis-story__price">
                      COP {formatCurrency(product.precio)}
                    </span>
                  )}
                  {product && <span className="aegis-story__cta">Ver producto</span>}
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="aegis-stories__empty">No hay promociones disponibles todavía.</p>
      )}

      <Modal
        open={Boolean(activeReel)}
        onClose={() => setSelectedKey(null)}
        title="Reel de AEGIS"
        className="ui-dialog--media home-reel-dialog"
        overlayClassName="home-reel-overlay"
      >
        {activeReel && (
          <div className="home-reel-viewer">
            <Button
              aria-label="Cerrar reel"
              className="home-reel-viewer__close"
              onClick={() => setSelectedKey(null)}
              variant="quiet"
            >
              ×
            </Button>
            <div className="home-reel-viewer__frame">
              <div className="home-reel-viewer__stage">
                <div
                  className="home-reel-viewer__progress"
                  role="group"
                  aria-label={`Progreso del reel ${selectedIndex + 1} de ${reelItems.length}; dura 4 segundos`}
                >
                  <div key={activeReel.key} className="home-reel-viewer__progress-track">
                    <span />
                  </div>
                  <span className="home-reel-viewer__progress-count">
                    {selectedIndex + 1} / {reelItems.length}
                  </span>
                </div>
                <div className="home-reel-viewer__brand">
                  <span>AEGIS</span>
                </div>
                {activeReel.type === 'story' ? (
                  <>
                    {viewerError?.id === activeReel.story.id && (
                      <p className="home-reel-viewer__error" role="alert">{viewerError.message}</p>
                    )}
                    {activeStory?.tipo_media === 'video'
                      ? <video src={activeStory.media_url} autoPlay muted />
                      : <img src={activeStory?.media_url} alt={activeStory?.texto || 'Historia'} />}
                    {activeStory?.texto && (
                      <p className="home-reel-viewer__caption">{activeStory.texto}</p>
                    )}
                  </>
                ) : (
                  <>
                    <img
                      src={imageUrl(fotoProducto(activeReel.product))}
                      alt={activeReel.product.titulo || 'Producto destacado'}
                    />
                    <div className="home-reel-viewer__caption">
                      <h3>{activeReel.product.titulo || 'Producto destacado'}</h3>
                      <p>{activeReel.product.categoria?.nombre || 'Tecnología seleccionada para ti'}</p>
                      <strong>COP {formatCurrency(activeReel.product.precio)}</strong>
                      <Button onClick={() => {
                        setSelectedKey(null)
                        onNavigate?.(`/productos/detalle?id=${activeReel.product.id}`)
                      }}>
                        Ver producto
                      </Button>
                    </div>
                  </>
                )}
                <button
                  type="button"
                  aria-label="Anterior reel"
                  className="home-reel-viewer__nav home-reel-viewer__nav--previous"
                  onClick={() => moveReel(-1)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Siguiente reel"
                  className="home-reel-viewer__nav home-reel-viewer__nav--next"
                  onClick={() => moveReel(1)}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}

function HomePromoBanner({ products, loading, onNavigate }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const offers = products
    .filter((product) => Number(product.descuento) > 0)
    .slice(0, 8)
  const offerIndex = offers.length ? selectedIndex % offers.length : 0
  const product = offers[offerIndex]
  const destination = offers.length ? '/productos?filtro=ofertas' : '/productos'
  const destinationLabel = offers.length
    ? 'Ver todos los productos en oferta'
    : 'Explorar marketplace'

  useEffect(() => {
    if (offers.length < 2) return undefined
    const timer = window.setInterval(() => {
      setSelectedIndex((current) => (current + 1) % offers.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [offers.length])

  const moveOffer = (direction) => {
    if (offers.length < 2) return
    setSelectedIndex((current) => (
      (current + direction + offers.length) % offers.length
    ))
  }

  return (
    <section className="home-promo" aria-labelledby="home-promo-title">
      <h2 id="home-promo-title">Encuentra tu próxima tecnología</h2>
      <div className={`home-promo__banner home-promo__banner--${selectedIndex % 3}`}>
        <a
          aria-label={destinationLabel}
          className="home-promo__link"
          href={route(destination)}
          onClick={(event) => {
            event.preventDefault()
            onNavigate?.(destination)
          }}
        >
          <div className="home-promo__content">
            <span className="home-promo__tag">
              {product
                ? `AEGIS · ${Number(product.descuento)}% de descuento`
                : 'AEGIS · Ofertas'}
            </span>
            <h3>
              {product?.titulo || 'Encuentra productos con descuento'}
            </h3>
            <p>
              {product
                ? `${product.categoria?.nombre || 'Tecnología'} con descuento disponible.`
                : loading
                  ? 'Buscando productos con descuento...'
                  : 'Las ofertas aparecerán aquí cuando haya productos con descuento.'}
            </p>
            {product && (
              <strong className="home-promo__price">
                COP {formatCurrency(product.precio)}
              </strong>
            )}
            <span className="home-promo__cta">
              {offers.length ? 'Ver productos en oferta' : 'Explorar marketplace'}
            </span>
          </div>
          {product && (
            <img
              className="home-promo__image"
              src={imageUrl(fotoProducto(product))}
              alt=""
            />
          )}
        </a>
        {offers.length > 1 && (
          <div aria-label="Cambiar oferta" className="home-promo__controls" role="group">
            <button
              aria-label="Oferta anterior"
              onClick={() => moveOffer(-1)}
              type="button"
            >
              ‹
            </button>
            <div className="home-promo__dots">
              {offers.map((offer, index) => (
                <button
                  aria-label={`Ver oferta ${index + 1}`}
                  aria-pressed={index === offerIndex}
                  key={offer.id}
                  onClick={() => setSelectedIndex(index)}
                  type="button"
                />
              ))}
            </div>
            <button
              aria-label="Oferta siguiente"
              onClick={() => moveOffer(1)}
              type="button"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default function Home({ auth, message, onNavigate }) {
  const [products, setProducts] = useState([])
  const [catalogProducts, setCatalogProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [error, setError] = useState(null)
  const [catalogError, setCatalogError] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [stories, setStories] = useState([])
  const [storyError, setStoryError] = useState('')

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
    let active = true
    productApi
      .list({ per_page: 50, sort: 'reciente' })
      .then(({ data }) => {
        if (!Array.isArray(data)) {
          throw new Error('La API no devolvió una lista de productos.')
        }
        if (active) {
          setCatalogProducts(data)
          setCatalogError(null)
        }
      })
      .catch((requestError) => {
        if (active) setCatalogError(requestError)
      })
      .finally(() => {
        if (active) setCatalogLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    advancedContentApi
      .stories(auth?.token)
      .then(({ data }) => {
        if (active) setStories(Array.isArray(data) ? data : [])
      })
      .catch((requestError) => {
        if (active) setStoryError(requestError.message)
      })
    return () => {
      active = false
    }
  }, [auth?.token])

  useEffect(() => {
    if (!message) return undefined
    const show = window.setTimeout(() => setFeedback(message), 0)
    const hide = window.setTimeout(() => setFeedback(''), 5000)
    return () => {
      window.clearTimeout(show)
      window.clearTimeout(hide)
    }
  }, [message])

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
          <ProductRail error={error} loading={loading} products={products} onNavigate={onNavigate} />
        </>
      ),
    },
    {
      id: 'siguiendo',
      label: 'Siguiendo',
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

        <div className="home-section-heading home-hero-heading">
          <h2>Productos destacados</h2>
        </div>
        <HeroCarousel products={products} onNavigate={onNavigate} />

        <ProductReels
          auth={auth}
          onNavigate={onNavigate}
          products={products}
          stories={stories}
          storyError={storyError}
        />

        <HomePromoBanner
          loading={loading && catalogLoading}
          onNavigate={onNavigate}
          products={catalogProducts.length ? catalogProducts : products}
        />

        <CategoryProductRails
          error={catalogError}
          loading={catalogLoading}
          onNavigate={onNavigate}
          products={catalogProducts}
        />

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
