// Vercel Proxy Handler

export const config = {
  runtime: 'edge',
};

// ========================================
// DOMÍNIO DE DESTINO
// Troque somente esta linha.
// ========================================
const TARGET_HOST = 'new.koom.pp.ua';

export default async function handler(req) {
  try {
    // URL de destino
    const TARGET_URL = 'https://' + TARGET_HOST;

    // URL recebida pelo proxy
    const url = new URL(req.url);

    // Mantém o Path e os parâmetros da requisição
    const targetPath = url.pathname + url.search;

    // Monta a URL final
    const targetUrl = TARGET_URL + targetPath;

    // Copia os headers recebidos
    const headers = new Headers(req.headers);

    // Define o Host do servidor de destino
    headers.set('Host', TARGET_HOST);

    // Remove headers específicos da Vercel
    headers.delete('x-vercel-id');
    headers.delete('x-vercel-deployment-url');
    headers.delete('x-vercel-forwarded-for');

    // Configuração da requisição
    const fetchOptions = {
      method: req.method,
      headers: headers,
      redirect: 'manual'
    };

    // Encaminha o corpo quando necessário
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = req.body;
    }

    // Faz a requisição para o domínio configurado
    const response = await fetch(targetUrl, fetchOptions);

    // Copia os headers da resposta
    const responseHeaders = new Headers(response.headers);

    // Evita problemas de compressão
    responseHeaders.delete('content-encoding');

    // Retorna a resposta para o cliente
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
