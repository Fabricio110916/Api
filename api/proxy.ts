export default async function handler(req, res) {
    const targetPath = req.query.path || "/";

    const baseUrl = "http://137.131.176.224:443";
    const url = baseUrl + targetPath;

    try {
        const response = await fetch(url, {
            method: req.method,
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "*/*"
            }
        });

        const data = await response.text();

        res.status(response.status).send(data);

    } catch (err) {
        res.status(500).send("Proxy error: " + err.message);
    }
}
