# AEGIS Móvil

## Conectar Expo Go con la API local

La IPv4 local actual del PC es `192.168.40.2`. El teléfono debe usar esta dirección en lugar del nombre local `aegis`.

1. `.env` configura la API como `http://192.168.40.2/api`. Si la IP local del PC cambia, actualiza `EXPO_PUBLIC_API_URL`.
2. El virtual host `aegis` de Apache ya tiene `ServerAlias 192.168.40.2`. Si Apache estaba iniciado mientras se editaba, reinícialo desde XAMPP Control Panel.
3. Conecta el teléfono a la misma red local que el PC y permite Apache por el puerto 80 en la red privada de Windows.
4. Comprueba en el navegador del teléfono que `http://192.168.40.2/api/categorias` devuelve JSON.
5. Reinicia Metro desde esta carpeta con `npx expo start --lan -c` y vuelve a abrir la app en Expo Go.

Si el endpoint no responde en el teléfono, revisa Apache, el firewall y que ambos dispositivos estén en la misma red (no en una red de invitados).
