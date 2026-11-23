# AEGIS Web (React)

Frontend web de AEGIS basado en React y Vite. La aplicación usa las rutas existentes y consume la API Laravel mediante el cliente centralizado en `src/services/api.js`.

## Requisitos

- Node.js compatible con la versión de Vite declarada en `package.json`.
- Una instancia local o remota de la API. Configura `VITE_API_URL` en el entorno local sin guardar credenciales en el repositorio.

## Desarrollo y verificación

```powershell
npm ci
npm run dev
npm test
npm run lint
npm run format:check
npm run build
```

`npm test` ejecuta las pruebas de componentes con Vitest y las pruebas del cliente API con Node. `npm run format` aplica Prettier a los archivos frontend incluidos en la configuración del proyecto.

## Interfaz compartida

- Los tokens semánticos y reglas globales están en `src/design-system/`.
- Los componentes reutilizables accesibles están en `src/components/shared/ui/`.
- El tema admite preferencias `system`, `light` y `dark`; por ahora se guarda localmente en el navegador y no se sincroniza con la cuenta.
- El armazón responsive se integra alrededor de las rutas existentes desde `src/components/layouts/WorkspaceChrome.jsx`.

La adopción visual de tokens en pantallas heredadas es progresiva. Consulta `../../aegis-backend-laravel/back-end/docs/aegis-6/` para auditoría, decisiones y reporte de verificación.
