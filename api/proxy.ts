import net from "net";
import crypto from "crypto";

const TARGET_HOST = "137.131.176.224";
const TARGET_PORT = 443;

function parseBody(body) {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  let body = "";

  req.on("data", chunk => body += chunk);

  req.on("end", () => {
    const frame = parseBody(body);

    // ❌ INVALID FRAME → 400
    if (!frame || frame.type !== "handshake") {
      return res.status(400).json({
        status: "error",
        message: "Invalid XHTTP handshake"
      });
    }

    // 🔥 cria sessão
    const sessionId = crypto.randomUUID();

    // 🔌 conecta no servidor final
    const socket = net.connect(TARGET_PORT, TARGET_HOST);

    socket.on("connect", () => {

      // ✅ handshake OK
      res.writeHead(200, {
        "Content-Type": "application/json",
        "X-XHTTP": "1",
        "X-Session": sessionId,
        "Connection": "keep-alive"
      });

      res.end(JSON.stringify({
        status: "ok",
        session: sessionId,
        transport: "tcp",
        target: `${TARGET_HOST}:${TARGET_PORT}`
      }));

      // 🔁 CLIENT → SERVER (stream contínuo)
      req.on("data", chunk => {
        socket.write(chunk);
      });

      // 🔁 SERVER → CLIENT
      socket.on("data", data => {
        res.write(data);
      });
    });

    socket.on("error", () => {
      res.status(502).json({
        status: "error",
        message: "Backend unreachable"
      });
    });

    socket.on("close", () => {
      res.end();
    });

    req.on("close", () => socket.destroy());
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
