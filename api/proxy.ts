import net from "net";
import https from "https";

const agent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true,
});

export default async function handler(req, res) {
  // 🔥 SSH OVER HTTP (CONNECT tunneling)
  if (req.method === "CONNECT") {
    const [host, port] = req.url.split(":");

    const socket = net.connect(port, host, () => {
      res.write("HTTP/1.1 200 Connection Established\r\n\r\n");

      // túnel bidirecional (SSH puro)
      socket.pipe(res.socket);
      res.socket.pipe(socket);
    });

    socket.on("error", () => {
      res.writeHead(502);
      res.end("Tunnel error");
    });

    return;
  }

  // 🌐 Proxy HTTP normal (seu código original simplificado)
  const target = `https://137.131.176.224:443${req.url}`;

  const options = {
    method: req.method,
    headers: req.headers,
    agent,
  };

  const proxyReq = https.request(target, options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  req.pipe(proxyReq);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
