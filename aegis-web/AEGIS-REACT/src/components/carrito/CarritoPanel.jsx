import { useEffect, useState } from 'react'
import {
  CARRITO,
  agregarProducto,
  quitarProducto,
  cambiarCantidad,
  vaciarCarrito,
} from './carritoDemo'
import { buscarProducto } from '../productos/productosDemo'
import './css/carrito.css'

export default function CarritoPanel({ onCerrar, onNavigate }) {
  const [items, setItems] = useState(CARRITO.slice())

  useEffect(() => {
    const actualizar = () => setItems(CARRITO.slice())
    window.addEventListener('carrito-cambio', actualizar)
    return () => window.removeEventListener('carrito-cambio', actualizar)
  }, [])

  const visibles = items.filter((item) => buscarProducto(item.id) !== null)

  let unidades = 0
  let total = 0
  let ahorro = 0

  visibles.forEach((item) => {
    const p = buscarProducto(item.id) || {}
    const precio = p.precio || 0
    const anterior = p.precioAnterior || 0
    const base = anterior > precio ? anterior : precio
    unidades = unidades + item.cantidad
    total = total + base * item.cantidad
    if (anterior > precio) {
      ahorro = ahorro + (anterior - precio) * item.cantidad
    }
  })

  const subtotal = total - ahorro
  const dinero = (valor) => '$' + valor.toLocaleString('es-CO')

  const verProducto = (id) => {
    if (onCerrar) onCerrar()
    if (onNavigate) onNavigate('/productos/detalle?id=' + id)
  }

  return (
    <>
      <div className="car-fondo" onClick={onCerrar} />
      <aside className="car-panel">
        <div className="car-cabecera">
          <h2>Tienes {unidades} unidades</h2>
          <button type="button" className="car-cerrar" aria-label="Cerrar" onClick={onCerrar}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="car-cuerpo">
          <div className="car-aviso">
            <h4>¡Ten en cuenta!</h4>
            <p>
              Los descuentos y promociones no son acumulables. Solo aplica uno por cliente.
              Todos los descuentos se verán reflejados al ingresar tus medios de pago al
              finalizar la compra.
            </p>
          </div>

          {visibles.length === 0 && (
            <p className="car-vacio">Tu carrito está vacío. Agrega productos desde su detalle.</p>
          )}

          {visibles.map((item) => {
            const p = buscarProducto(item.id) || {}
            const nombre = p.nombre || p.titulo || 'Producto'
            const precio = p.precio || 0
            const anterior = p.precioAnterior || 0
            return (
              <div
                className="car-item"
                key={item.id}
                onClick={() => verProducto(item.id)}
              >
                <img className="car-item-img" src={p.imagen} alt={nombre} />
                <div className="car-item-info">
                  <div className="car-item-fila">
                    <h4 className="car-item-nombre">{nombre}</h4>
                    <div className="car-item-precios">
                      <strong className="car-item-precio">{dinero(precio)}</strong>
                      {anterior > precio && (
                        <span className="car-item-precio-viejo">{dinero(anterior)}</span>
                      )}
                    </div>
                  </div>
                  <p className="car-item-marca">{p.marca}</p>

                  <div className="car-item-controles" onClick={(e) => e.stopPropagation()}>
                    <input
                      className="car-item-cant"
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => cambiarCantidad(item.id, Number(e.target.value))}
                    />
                    <span className="car-item-un">un</span>
                    <button
                      type="button"
                      className="car-item-trash"
                      aria-label="Quitar"
                      onClick={() => quitarProducto(item.id)}
                    >
                      <i className="fa-solid fa-trash-can" />
                    </button>
                    <button
                      type="button"
                      className="car-item-mas"
                      aria-label="Aumentar"
                      onClick={() => agregarProducto(item.id)}
                    >
                      <i className="fa-solid fa-plus" />
                    </button>
                    <button
                      type="button"
                      className="car-item-eliminar"
                      onClick={() => quitarProducto(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>

                  <p className="car-item-garantia">
                    <i className="fa-solid fa-award" />
                    <span>Sin Garantía extendida</span>
                  </p>
                </div>
              </div>
            )
          })}

          {visibles.length > 0 && (
            <div className="car-vaciador">
              <button type="button" className="car-vaciar" onClick={vaciarCarrito}>
                <i className="fa-solid fa-trash-can" />
                Vaciar carrito
              </button>
            </div>
          )}
        </div>

        <div className="car-pie">
          <div className="car-totales">
            <div className="car-total-fila">
              <span>Total productos</span>
              <strong>{dinero(total)}</strong>
            </div>
            <div className="car-total-fila car-total-ahorro">
              <span>Tu ahorro</span>
              <strong>-{dinero(ahorro)}</strong>
            </div>
            <div className="car-total-fila car-total-sub">
              <span>Subtotal</span>
              <strong>{dinero(subtotal)}</strong>
            </div>
          </div>

          <div className="car-acciones">
            <button type="button" className="car-btn-volver" onClick={onCerrar}>
              volver
            </button>
            <button
              type="button"
              className="car-btn-finalizar"
              disabled={visibles.length === 0}
              onClick={onCerrar}
            >
              Finalizar Compra
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
