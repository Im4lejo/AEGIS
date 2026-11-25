# AEGIS Web - notas de versión

## Incluido

- React y API Laravel web.
- Autenticación web, perfiles, feed, comunidades, marketplace, tiendas, mensajería, ofertas, encuentros/QR, reseñas y notificaciones.
- Personalización, búsqueda unificada, historias/eventos y centro administrativo.
- Moderación, sanciones y apelaciones.
- Analítica comercial propia y solicitudes de datos.
- Lazy loading por rutas, caché pública breve e índices.

## Limitaciones conocidas

- Checkout/pagos no están implementados.
- Live no está disponible sin proveedor configurado y prueba extremo a extremo.
- Cloudinary debe configurarse para VOD remoto.
- Contenido demo residual puede existir en rutas secundarias heredadas.
- FAQ, términos, privacidad y ayuda requieren redacción legal y páginas reales.
- La auditoría de accesibilidad automatizada aún no está instalada.

## Despliegue

1. Configurar MySQL local/servidor sin exponer credenciales.
2. Ejecutar `php artisan migrate --force`.
3. Ejecutar `php artisan test`.
4. Configurar `CLOUDINARY_*` si se habilita VOD.
5. Configurar `LIVE_ENABLED=false` hasta contar con proveedor Live probado.
6. Instalar dependencias React y ejecutar `npm run build`.
7. Servir `dist` desde el proxy exacto definido en CORS/API.
8. Monitorear rutas `/up`, errores 401/403/500 y cola.
