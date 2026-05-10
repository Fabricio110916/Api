export default async function handler(req, res) {
    const targetPath = req.query.path || "/";

    const baseUrl = "https://my.koom.pp.ua";
    const url = baseUrl + targetPath;

    try {
        const response = await fetch(url, {
            method: req.method,
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "*/ws/*",
                "Host": "my.koom.pp.ua"
            }
        });

        const data = await response.text();

        res.status(response.status).send(data);

    } catch (err) {
        res.status(500).send("Proxy error: " + err.message);
    }
}
