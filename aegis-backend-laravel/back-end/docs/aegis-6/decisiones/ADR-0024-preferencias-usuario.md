# ADR-0024: Preferencias persistentes por cuenta

## Estado

Aprobada para el Incremento 22.

## Decisión

- `preferencias_usuario` almacena un JSON versionado por cuenta.
- Los valores se validan contra defaults conocidos.
- React aplica preview local y persiste al servidor.
- Tema, densidad, contraste y movimiento siguen prefijos OS/server definidos.
- No se convierten precios ni monedas canónicas.

## Consecuencias

- Logout/login conserva la configuración.
- Defaults seguros son públicos y sin datos sensibles.
