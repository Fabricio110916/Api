export default async function handler(req, res) {
    const targetPath = req.query.path || "/ws/";

    const baseUrl = "https://cdn.edgeclaro.pp.ua";
    const url = baseUrl + targetPath;

    try {
        const response = await fetch(url, {
            method: req.method,
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "*/*",
                "Host": "cdn.edgeclaro.pp.ua"
            }
        });

        const data = await response.text();

        res.status(response.status).send(data);

    } catch (err) {
        res.status(500).send("Proxy error: " + err.message);
    }
}
