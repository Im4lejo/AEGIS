# Matriz de cierre web - Incremento 29

Estados:

- Implementado: existe una ruta/API real.
- Probado: existe una prueba automatizada ejecutada.
- Gated: existe pero requiere configuración externa o permiso.
- Pendiente: no existe o queda una demo/plantilla sin acción real.

| Área | Estado | Evidencia |
|---|---|---|
| US-01 registro/login | Probado | WebAuthTest y auth-views.test |
| US-02 recuperación/cambio contraseña | Probado | WebAuthTest |
| US-03 perfil/seguidores/bloqueos | Probado | ProfileSocialTest |
| US-04 privacidad perfil | Probado | ProfileSocialTest |
| US-05 feed | Probado | SocialFeedTest |
| US-06 publicaciones/medios | Probado | SocialFeedTest/MediaManagementTest |
| US-07 comentarios/reacciones | Probado | SocialInteractionsTest |
| US-08 grupos/comunidades | Probado | CommunityLifecycleTest |
| US-09 marketplace | Probado | MarketplaceLifecycleTest |
| US-10 tiendas/inventario | Probado | StoreInventoryTest |
| US-11 mensajería | Probado | MessagingTest |
| US-12 ofertas/operaciones | Probado | OfferTransactionTest |
| US-13 encuentros/QR | Probado | MeetingQrTest |
| US-14 reseñas | Probado | ReviewEligibilityTest |
| US-15 notificaciones | Probado | NotificationTest |
| US-16 ajustes/personalización | Probado | UserPreferencesTest |
| RS-01..18 seguridad/roles | Probado | AuthorizationPrivacyTest/WebAuthTest |
| MK-01..28 marketplace | Probado | MarketplaceDiscovery/Lifecycle/Detail/Trust |
| FO-01..20 foro | Probado | Social/AdvancedThread tests |
| MS-01..15 mensajería | Probado | MessagingTest |
| BU-01..10 búsqueda | Probado | UnifiedSearchTest |
| Historias/eventos | Probado | AdvancedContentTest |
| Video VOD | Gated | Cloudinary debe estar configurado |
| Live | Gated | No hay proveedor/credenciales probadas |
| Checkout/pago | Pendiente | No existe pasarela ni acción real |
| Carrito | Gated/Pendiente | Es una vista local sin checkout |
| Perfil `/vendedor` demo | Pendiente | Degradado: ahora exige perfil real |
| Plantillas legales/ayuda | Pendiente | Se muestran como próximamente |
| Capturas 360/768/1280/1440 | Pendiente | No hay browser compartido |
| E2E Playwright/Cypress | Pendiente | No hay dependencia instalada ni configuración |
| Core Web Vitals navegador | Pendiente | No hay Lighthouse medido |
