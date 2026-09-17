const RENDER_ORIGIN = 'https://jovial-s-portfolio-bcd.onrender.com';

const BLOCKED_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'content-encoding',
  'transfer-encoding',
  'accept-encoding',
  'upgrade',
  'expect',
  'x-vercel-id',
  'x-vercel-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-proto',
  'x-forwarded-port'
]);

module.exports = async function proxy(req, res) {
  try {
    const params = new URL(req.url, 'http://localhost').searchParams;

    let target = params.get('target');
    if (!target) {
      res.status(400).json({ message: 'Missing target' });
      return;
    }
    params.delete('target');

    let url = RENDER_ORIGIN + (target.startsWith('/') ? target : '/' + target);
    const qs = params.toString();
    if (qs) url += '?' + qs;

    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value && !BLOCKED_HEADERS.has(key)) {
        headers[key] = Array.isArray(value) ? value.join(',') : value;
      }
    }

    const opts = { method: req.method, headers, redirect: 'manual' };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      await new Promise((resolve, reject) => {
        req.on('data', (c) => chunks.push(c));
        req.on('end', resolve);
        req.on('error', reject);
      });
      opts.body = Buffer.concat(chunks);
    }

    const response = await fetch(url, opts);
    const body = Buffer.from(await response.arrayBuffer());

    const respHeaders = {};
    response.headers.forEach((value, key) => {
      if (!BLOCKED_HEADERS.has(key)) respHeaders[key] = value;
    });

    res.writeHead(response.status, respHeaders);
    res.end(body);
  } catch (err) {
    res.status(502).json({ message: 'Proxy error', detail: String((err && err.message) || err) });
  }
};