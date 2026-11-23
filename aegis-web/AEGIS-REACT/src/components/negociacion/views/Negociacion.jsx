import { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { negotiationApi } from '../../../services/api'
import '../css/negociacion.css'

export default function Negociacion({ auth, onNavigate }) {
  const [offers, setOffers] = useState([])
  const [operations, setOperations] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!auth?.token) return
    negotiationApi.mine(auth.token)
      .then((response) => {
        setOffers(response.ofertas?.data || [])
        setOperations(response.operaciones?.data || [])
      })
      .catch((requestError) => setError(requestError.message))
  }, [auth?.token])

  const decide = async (offer, decision) => {
    try {
      await negotiationApi.decide(offer.id, decision, auth.token)
      const response = await negotiationApi.mine(auth.token)
      setOffers(response.ofertas?.data || [])
      setOperations(response.operaciones?.data || [])
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <div className="page-layout">
      <Header title="AEGIS | Negociaciones" auth={auth} onNavigate={onNavigate} />
      <main className="negociacion-page">
        <h1>Mis negociaciones</h1>
        {error && <p role="alert">{error}</p>}
        <section>
          <h2>Ofertas</h2>
          {offers.length === 0 ? <p>No tienes ofertas activas.</p> : offers.map((offer) => (
            <article className="negociacion-card" key={offer.id}>
              <strong>{offer.producto?.titulo || 'Anuncio'}</strong>
              <p>COP {Number(offer.monto).toLocaleString('es-CO')} · {offer.estado}</p>
              {auth?.user?.id === offer.vendedor_id && offer.estado === 'pendiente' && (
                <div>
                  <button type="button" onClick={() => decide(offer, 'aceptada')}>Aceptar</button>
                  <button type="button" onClick={() => decide(offer, 'rechazada')}>Rechazar</button>
                </div>
              )}
              {auth?.user?.id === offer.comprador_id && offer.estado === 'pendiente' && (
                <button type="button" onClick={() => decide(offer, 'retirada')}>Retirar</button>
              )}
            </article>
          ))}
        </section>
        <section>
          <h2>Operaciones</h2>
          {operations.length === 0 ? <p>No tienes operaciones comerciales.</p> : operations.map((operation) => (
            <article className="negociacion-card" key={operation.id}>
              <strong>{operation.producto?.titulo || 'Operación'}</strong>
              <p>COP {Number(operation.monto_acordado).toLocaleString('es-CO')} · {operation.estado}</p>
            </article>
          ))}
        </section>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
