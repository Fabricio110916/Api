export const config = {
  runtime: "edge", // executa na borda
};

const BACKEND = "wss://mc-ldz94w5r6z.bunny.run";

export default async function handler(req) {
  const upgradeHeader = req.headers.get("upgrade");

  // Detecta WebSocket
  if (upgradeHeader?.toLowerCase() === "websocket") {
    const clientSocket = req.webSocket;
    if (!clientSocket) {
      return new Response("WebSocket não suportado", { status: 400 });
    }

    // Conecta no backend via WebSocket
    const backendSocket = new WebSocket(BACKEND);

    clientSocket.accept();

    // Repasse de mensagens: Backend → Cliente
    backendSocket.addEventListener("message", (event) => {
      clientSocket.send(event.data);
    });
    backendSocket.addEventListener("close", () => clientSocket.close());
    backendSocket.addEventListener("error", () => clientSocket.close());

    // Repasse de mensagens: Cliente → Backend
    clientSocket.addEventListener("message", (event) => {
      backendSocket.send(event.data);
    });
    clientSocket.addEventListener("close", () => backendSocket.close());
    clientSocket.addEventListener("error", () => backendSocket.close());

    return new Response(null, { status: 101, webSocket: clientSocket });
  }

  // Proxy HTTP normal
  const targetUrl = new URL(req.url);
  targetUrl.hostname = BACKEND.replace(/^wss?:\/\//, "");
  targetUrl.protocol = "https:";

  const resp = await fetch(targetUrl.toString(), {
    method: req.method,
    headers: req.headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
  });

  return new Response(resp.body, {
    status: resp.status,
    headers: resp.headers,
  });
}
