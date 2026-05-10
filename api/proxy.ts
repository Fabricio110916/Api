export default async function handler(req, res) {
    const path = req.query.path || "/";

    // Só ativa proxy quando começa com /ws
    if (!path.startsWith("/ws")) {
        return res.status(200).send("Proxy ativo. Use /ws/");
    }

    const baseUrl = "https://my.koom.pp.ua";
    const url = baseUrl + path;

    try {
        const response = await fetch(url, {
            method: req.method,
            headers: {
                "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
                "Accept": "*/*",
                "Accept-Language": req.headers["accept-language"] || "*"
            }
        });

        const data = await response.text();

        res.status(response.status).send(data);

    } catch (err) {
        res.status(500).send("Proxy error: " + err.message);
    }
}
