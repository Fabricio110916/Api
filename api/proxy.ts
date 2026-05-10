export default async function handler(req, res) {
    const path = req.query.path ? "/" + req.query.path.join("/") : "/";

    const baseUrl = "https://my.koom.pp.ua";
    const url = baseUrl + "/ws" + path;

    try {
        const response = await fetch(url, {
            method: req.method,
            headers: {
                "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
                "Accept": "*/*",
                "X-Padding": "X".repeat(2000)
            }
        });

        const data = await response.text();
        res.status(response.status).send(data);

    } catch (err) {
        res.status(500).send("Proxy error: " + err.message);
    }
}
