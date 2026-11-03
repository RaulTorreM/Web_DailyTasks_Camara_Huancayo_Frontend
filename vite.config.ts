import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';

// El frontend llama a VITE_API_URL y VITE_HUB_URL. En desarrollo usamos rutas
// relativas y Vite reenvía /api y /hubs al backend local: así el celular habla
// solo con Vite (mismo origen), sin CORS y con WebSocket para SignalR.
// npm run dev        -> http://TU-IP:5175
// npm run dev:https  -> https://TU-IP:5175 (certificado de prueba)
export default defineConfig(async ({ mode }) => {
  const https = mode === 'https';
  const plugins: PluginOption[] = [react()];
  if (https) {
    const { default: basicSsl } = await import('@vitejs/plugin-basic-ssl');
    plugins.push(basicSsl());
  }
  return {
    plugins,
    server: {
      host: true,
      port: 5175,
      strictPort: true,
      // Safari de iPhone rechaza el websocket con certificado de prueba y la página se recargaría sola.
      hmr: https ? false : undefined,
      proxy: {
        '/api': { target: 'http://localhost:5095', changeOrigin: true },
        '/hubs': { target: 'http://localhost:5095', changeOrigin: true, ws: true },
      },
    },
    preview: {
      port: 5175,
      strictPort: true,
    },
  };
});
