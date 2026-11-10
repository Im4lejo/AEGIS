# AEGIS Móvil

## Conectar Expo Go con la API local

La IPv4 Wi-Fi actual del PC es `10.10.34.167`. El teléfono debe usar esta dirección en lugar del nombre local `aegis`.

1. `.env` configura la API como `http://10.10.34.167/api`. Si la IP local del PC cambia, actualiza `EXPO_PUBLIC_API_URL`.
2. El virtual host `aegis` de Apache debe incluir `ServerAlias 10.10.34.167`. Reinicia Apache desde XAMPP Control Panel después de cambiarlo.
3. Conecta el teléfono a la misma red local que el PC. Para acceso desde el teléfono, Windows Firewall debe permitir Apache por el puerto 80 en el perfil activo. Usa el perfil privado solo en una red de confianza; no desactives el firewall.
4. Comprueba en el navegador del teléfono que `http://10.10.34.167/api/categorias` devuelve JSON.
5. Reinicia Metro desde esta carpeta con `npx expo start --lan -c` y vuelve a abrir la app en Expo Go.

Si el endpoint no responde en el teléfono, revisa Apache, el firewall y que ambos dispositivos estén en la misma red (no en una red de invitados).
