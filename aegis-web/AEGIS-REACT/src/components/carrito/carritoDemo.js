export const CARRITO = []

const avisar = () => {
  window.dispatchEvent(new Event('carrito-cambio'))
}

export const agregarProducto = (id) => {
  const existente = CARRITO.find((item) => String(item.id) === String(id))
  if (existente) {
    existente.cantidad = existente.cantidad + 1
  } else {
    CARRITO.push({ id: id, cantidad: 1 })
  }
  avisar()
}

export const quitarProducto = (id) => {
  const existente = CARRITO.find((item) => String(item.id) === String(id))
  if (existente) {
    const posicion = CARRITO.indexOf(existente)
    CARRITO.splice(posicion, 1)
  }
  avisar()
}

export const cambiarCantidad = (id, cantidad) => {
  const existente = CARRITO.find((item) => String(item.id) === String(id))
  if (existente) {
    existente.cantidad = cantidad < 1 ? 1 : cantidad
  }
  avisar()
}

export const vaciarCarrito = () => {
  CARRITO.length = 0
  avisar()
}

export const totalUnidades = () => {
  let total = 0
  for (let i = 0; i < CARRITO.length; i++) {
    total = total + CARRITO[i].cantidad
  }
  return total
}
