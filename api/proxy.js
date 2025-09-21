export const config = {
  runtime: "edge", // executa na borda da Vercel
};

const BACKEND_HTTP = "https://my.koom.pp.ua/ws";
const BACKEND_WS   = "wss://my.koom.pp.ua/ws";

export default async function handler(req) {
  const upgradeHeader = req.headers.get("upgrade");

  // 🔹 Caso seja WebSocket
  if (upgradeHeader?.toLowerCase() === "websocket") {
    const clientSocket = req.webSocket;
    if (!clientSocket) {
      return new Response("WebSocket não suportado", { status: 400 });
    }

    // Conexão com backend Xray via WSS
    const backendSocket = new WebSocket(BACKEND_WS, {
      headers: Object.fromEntries(req.headers), // preserva headers
    });

    clientSocket.accept();

    // Backend → Cliente
    backendSocket.addEventListener("message", (event) => {
      clientSocket.send(event.data);
    });
    backendSocket.addEventListener("close", () => clientSocket.close());
    backendSocket.addEventListener("error", () => clientSocket.close());

    // Cliente → Backend
    clientSocket.addEventListener("message", (event) => {
      backendSocket.send(event.data);
    });
    clientSocket.addEventListener("close", () => backendSocket.close());
    clientSocket.addEventListener("error", () => backendSocket.close());

    return new Response(null, { status: 101, webSocket: clientSocket });
  }

  // 🔹 Caso seja HTTP/HTTPS normal (XHTTP do Xray)
  const targetUrl = new URL(req.url);
  targetUrl.hostname = "my.koom.pp.ua";
  targetUrl.pathname = "/ws" + targetUrl.pathname;

  const resp = await fetch(BACKEND_HTTP + targetUrl.search, {
    method: req.method,
    headers: req.headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
  });

  return new Response(resp.body, {
    status: resp.status,
    headers: resp.headers,
  });
}
