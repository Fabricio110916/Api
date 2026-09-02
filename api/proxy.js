// V2Ray xhttp Vercel Proxy Handler
// This Edge Function forwards all requests to the real V2Ray server

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    // Target V2Ray server
    const TARGET_HOST = '5wmkb0.azion.app';
    const TARGET_URL = `https://${TARGET_HOST}`;

    // Parse the incoming URL to preserve path and query params
    const url = new URL(req.url);

    // Construct target URL - preserve the full path
    const targetPath = url.pathname + url.search;
    const targetUrl = TARGET_URL + targetPath;

    // Prepare headers
    const headers = new Headers(req.headers);
    headers.set('Host', TARGET_HOST);

    // Remove Vercel-specific headers
    headers.delete('x-vercel-id');
    headers.delete('x-vercel-deployment-url');
    headers.delete('x-vercel-forwarded-for');

    // Prepare fetch options
    const fetchOptions = {
      method: req.method,
      headers: headers,
      redirect: 'manual',
    };

    // Add body for non-GET/HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = req.body;
    }

    // Forward request
    const response = await fetch(targetUrl, fetchOptions);

    // Copy response headers
    const responseHeaders = new Headers(response.headers);

    responseHeaders.delete('content-encoding');

    // Return proxied response
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Proxy error:', error);

    return new Response(
      JSON.stringify({
        error: 'Proxy error',
        message: error.message,
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
