import { createProxyServer } from "http-proxy";

const target = "https://69.166.232.41:8080;

// Cria proxy
const proxy = createProxyServer({
  target,
  changeOrigin: true,
  ws: true, // habilita WebSocket
});

// Edge Functions requerem bodyParser desativado
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req, res) {
  // Proxy HTTP normal
  proxy.web(req, res, {}, (err) => {
    console.error("Erro HTTP Proxy:", err);
    res.statusCode = 502;
    res.end("Falha no proxy HTTP");
  });
}

// Captura upgrades (WebSocket handshake)
export function unstable_onProxyReq(req, socket, head) {
  proxy.ws(req, socket, head, {}, (err) => {
    console.error("Erro WebSocket Proxy:", err);
    socket.end();
  });
}
