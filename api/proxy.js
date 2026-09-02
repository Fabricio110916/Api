export const config = {
  runtime: 'edge'
};

// Domínio que receberá as requisições encaminhadas
const TARGET_HOST = 'my.koom.pp.ua';

export default async function handler(req) {
  try {
    const incomingUrl = new URL(req.url);

    // Monta a URL do domínio de destino,
    // preservando Path e query string.
    const targetUrl = new URL(
      incomingUrl.pathname + incomingUrl.search,
      'https://' + TARGET_HOST
    );

    const headers = new Headers(req.headers);

    // Host do servidor de destino
    headers.set('Host', TARGET_HOST);

    // Remove headers internos da Vercel
    headers.delete('x-vercel-id');
    headers.delete('x-vercel-deployment-url');
    headers.delete('x-vercel-forwarded-for');

    const options = {
      method: req.method,
      headers: headers,
      redirect: 'manual'
    };

    // Encaminha o body de POST/PUT/PATCH etc.
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = req.body;
    }

    const response = await fetch(targetUrl, options);

    // Copia os headers da resposta
    const responseHeaders = new Headers(response.headers);

    // Evita conflito de compressão
    responseHeaders.delete('content-encoding');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('Proxy error:', error);

    return new Response(
      JSON.stringify({
        error: 'Proxy error',
        message: error.message
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
