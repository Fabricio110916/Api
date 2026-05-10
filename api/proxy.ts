import net from "net";

const TARGET_HOST = "137.131.176.224";
const TARGET_PORT = 443;

function parseFrame(body) {
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
    const frame = parseFrame(body);

    if (!frame) {
      return res.status(400).send("Invalid XHTTP frame");
    }

    // 🔥 DIRECIONAMENTO FIXO PARA SEU SERVIDOR
    const socket = net.connect(TARGET_PORT, TARGET_HOST, () => {

      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "X-XHTTP": "1",
        "X-Proxy": "active",
        "Connection": "keep-alive"
      });

      // payload inicial (encapsulado)
      if (frame.payload) {
        const buffer = Buffer.from(frame.payload, "base64");
        socket.write(buffer);
      }

      // 🔁 servidor → cliente
      socket.on("data", (data) => {
        res.write(data);
      });

      // 🔁 cliente → servidor (stream contínuo)
      req.on("data", (chunk) => {
        socket.write(chunk);
      });

      // cleanup
      socket.on("close", () => res.end());
      socket.on("error", () => res.end());
      req.on("close", () => socket.destroy());
    });

    socket.on("error", () => {
      res.status(502).end("Failed to reach backend server");
    });
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
