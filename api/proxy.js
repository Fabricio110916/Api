export const config = {
  runtime: "edge", // garante que é Edge Function
};

export default async function handler(req) {
  const target = "http://my.koom.pp.ua";

  // Reconstrói URL de destino
  const url = new URL(req.url);
  const targetUrl = target + url.pathname + url.search;

  // --- Detecta WebSocket Upgrade ---
  if (req.headers.get("upgrade")?.toLowerCase() === "websocket") {
    const backendResp = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers,
    });

    if (!backendResp.webSocket) {
      return new Response("Falha ao conectar WebSocket", { status: 502 });
    }

    // Proxy WS bidirecional
    const clientSocket = req.webSocket;
    const serverSocket = backendResp.webSocket;

    clientSocket.accept();

    serverSocket.addEventListener("message", (event) =>
      clientSocket.send(event.data)
    );
    serverSocket.addEventListener("close", () => clientSocket.close());
    serverSocket.addEventListener("error", () => clientSocket.close());

    clientSocket.addEventListener("message", (event) =>
      serverSocket.send(event.data)
    );
    clientSocket.addEventListener("close", () => serverSocket.close());
    clientSocket.addEventListener("error", () => serverSocket.close());

    return new Response(null, { status: 101, webSocket: clientSocket });
  }

  // --- Proxy HTTP normal ---
  const resp = await fetch(targetUrl, {
    method: req.method,
    headers: req.headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
  });

  return new Response(resp.body, {
    status: resp.status,
    headers: resp.headers,
  });
}
