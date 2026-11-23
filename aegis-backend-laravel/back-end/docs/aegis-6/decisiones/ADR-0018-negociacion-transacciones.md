# ADR-0018: Negociación P2P y operación comercial

## Estado

Aprobada para el Incremento 16.

## Decisión

- No se implementa checkout ni pasarela de pago.
- Ofertas unen comprador, vendedor, anuncio y conversación opcional.
- Estados activos son pendiente/contraoferta; aceptación crea operación y reserva.
- Reservar bloquea transaccionalmente anuncio/inventario.
- Solo vendedor completa; ambos pueden acordar/cancelar/disputar.
- La expiración es idempotente y puede ejecutarse por job.

## Consecuencias

- Aceptar no significa vender ni cobrar.
- Solo completar vende el anuncio.
- Los terceros no pueden decidir ofertas u operaciones.
