import { getStore } from '@netlify/blobs';

export default async (req) => {
  const requiredPassword = process.env.APP_PASSWORD;
  const provided = req.headers.get('x-app-password') || '';

  if (requiredPassword && provided !== requiredPassword) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const store = getStore({ name: 'fleet-data', consistency: 'strong' });

  if (req.method === 'GET') {
    const data = await store.get('main', { type: 'json' });
    return new Response(JSON.stringify(data || null), {
      headers: { 'content-type': 'application/json' },
    });
  }

  if (req.method === 'POST') {
    const body = await req.json();
    await store.setJSON('main', body);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
};

export const config = { path: '/api/data' };
