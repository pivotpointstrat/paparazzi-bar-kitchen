// First-party page-view collector. No cookies, no third-party scripts, no
// cross-site tracking — a random session id kept in sessionStorage, cleared when
// the tab closes. Deliberately not Google Analytics: nothing to consent to and
// the data lands in the same database as the reservations.
//
//   POST /.netlify/functions/track
//   { path, referrer, sessionId, viewport }

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const CLIENT_SLUG = process.env.CLIENT_SLUG || 'paparazzi-kitchen';
let cachedClientId;

function json(obj, status = 200) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}

async function resolveClientId() {
  if (cachedClientId !== undefined) return cachedClientId;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/clients?slug=eq.${encodeURIComponent(CLIENT_SLUG)}&select=id`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    const rows = await r.json();
    cachedClientId = rows && rows.length ? rows[0].id : null;
  } catch (e) { cachedClientId = null; }
  return cachedClientId;
}

// Where the visitor came from, in words a restaurant owner recognises.
function classify(referrer) {
  if (!referrer) return 'direct';
  let host = '';
  try { host = new URL(referrer).hostname.toLowerCase(); } catch { return 'other'; }
  if (/google\./.test(host)) return 'google';
  if (/facebook|fb\./.test(host)) return 'facebook';
  if (/instagram/.test(host)) return 'instagram';
  if (/t\.me|telegram/.test(host)) return 'telegram';
  if (/bing\./.test(host)) return 'bing';
  if (/tripadvisor/.test(host)) return 'tripadvisor';
  if (host.includes('paparazzipp.com')) return 'internal';
  return host.replace(/^www\./, '');
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json({ ok: true }, 200);
  if (event.httpMethod !== 'POST') return json({ ok: false }, 405);
  if (!SUPABASE_URL || !SUPABASE_KEY) return json({ ok: false, error: 'not configured' }, 500);

  let b = {};
  try { b = JSON.parse(event.body || '{}'); } catch { return json({ ok: false }, 400); }

  const path = String(b.path || '/').slice(0, 300);
  const referrer = String(b.referrer || '').slice(0, 500);
  const source = classify(referrer);
  if (source === 'internal') return json({ ok: true, skipped: 'internal navigation' });

  const cid = await resolveClientId();
  if (!cid) return json({ ok: false }, 200);

  const device = Number(b.viewport) && Number(b.viewport) <= 820 ? 'mobile'
    : Number(b.viewport) ? 'desktop' : 'unknown';

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/site_visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({
        client_id: cid, path, referrer: referrer || null, source, device,
        session_id: String(b.sessionId || '').slice(0, 60) || null,
      }),
    });
  } catch (e) {
    console.error('track failed:', e.message);
  }
  return json({ ok: true });
};
