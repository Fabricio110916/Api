const http = require('http');
const https = require('https');
const { URL } = require('url');

const server = http.createServer((req, res) => {
    const target = req.url.slice(1);

    if (!target.startsWith('http')) {
        res.writeHead(400);
        return res.end('Use /https://my.koom.pp.ua');
    }

    const url = new URL(target);
    const lib = url.protocol === 'https:' ? https : http;

    const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: req.method,
        headers: req.headers,
    };

    const proxy = lib.request(options, (r) => {
        res.writeHead(r.statusCode, r.headers);
        r.pipe(res);
    });

    req.pipe(proxy);
});

server.listen(8080, () => {
    console.log('Proxy rodando na porta 8080');
});
