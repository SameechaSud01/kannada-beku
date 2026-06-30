/**
 * GET /api/waitlist
 *
 * Runs server-side on Cloudflare Pages. Reads the waitlist from Supabase
 * using the SERVICE key, which never leaves the server. The browser only
 * ever sees the JSON this returns — no database key is shipped to the client.
 *
 * Required Pages environment variables (set as encrypted Secrets, not plain vars):
 *   SUPABASE_URL          e.g. https://fhhzrzmmulqgmfwmeodq.supabase.co   [verify this ref]
 *   SUPABASE_SERVICE_KEY  the service_role / secret key (bypasses RLS)
 */
export async function onRequestGet(context) {
  const { env } = context;
  const baseUrl = env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_KEY;

  if (!baseUrl || !serviceKey) {
    return json({ error: "Server not configured: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing." }, 500);
  }

  const endpoint =
    `${baseUrl}/rest/v1/waitlist` +
    `?select=*` +
    `&order=created_at.desc` +
    `&limit=2000`;

  try {
    const r = await fetch(endpoint, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
      },
    });

    if (!r.ok) {
      const body = await r.text();
      return json({ error: `Supabase responded ${r.status}: ${body.slice(0, 300)}` }, 502);
    }

    const rows = await r.json();
    return json(rows, 200);
  } catch (e) {
    return json({ error: String((e && e.message) || e) }, 502);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
