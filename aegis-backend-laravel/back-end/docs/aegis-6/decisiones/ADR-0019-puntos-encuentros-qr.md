# ADR-0019: Puntos físicos, encuentros y QR

## Estado

Aprobada para el Incremento 17.

## Decisión

- Puntos físicos usan owner AEGIS y revisión admin.
- Encuentros tienen estados explícitos y línea de auditoría.
- QR usa token opaco recibido una vez y hash SHA-256 persistido.
- Solo owner del punto o admin puede validar.
- Validación es única por estado y transacción.

## Consecuencias

- QR usado/expirado no se reutiliza.
- El QR no contiene datos personales ni garantiza conducta.
