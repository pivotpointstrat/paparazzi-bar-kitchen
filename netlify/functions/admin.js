// Admin portal API for Paparazzi Bar & Kitchen.
//
//   POST /.netlify/functions/admin   { action: 'login', password }
//                                    { action: 'data' }
//                                    { action: 'status', id, status }
//
// Auth: one password in the Netlify env var ADMIN_PASSWORD (min 10 chars), and a
// signed, HttpOnly, SameSite=Strict session cookie. The signature is an HMAC
// over the expiry, keyed with the password itself, so there is no second secret
// to manage. No password is ever sent back to the browser, and the Supabase
// service key never leaves this function.

const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const CLIENT_SLUG = process.env.CLIENT_SLUG || 'paparazzi-kitchen';
const SESSION_HOURS = 12;
const COOKIE = 'pap_admin';

const STATUSES = ['pending', 'confirmed', 'seated', 'no-show', 'cancelled'];

function json(obj, status = 200, extraHeaders = {}) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
    body: JSON.stringify(obj),
  };
}

function sb(path, options = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      ...(options.headers || {}),
    },
  });
}

// ---------------------------------------------------------------- session
function sign(exp) {
  return crypto.createHmac('sha256', ADMIN_PASSWORD).update(String(exp)).digest('hex');
}

function issueCookie() {
  const exp = Date.now() + SESSION_HOURS * 3600 * 1000;
  const value = `${exp}.${sign(exp)}`;
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}`;
}

function cookieValue(event) {
  const raw = (event.headers && (event.headers.cookie || event.headers.Cookie)) || '';
  const hit = raw.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`));
  return hit ? hit.slice(COOKIE.length + 1) : '';
}

function authed(event) {
  if (!ADMIN_PASSWORD) return false;
  const v = cookieValue(event);
  const [exp, sig] = v.split('.');
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  const expected = sign(exp);
  // constant-time compare so the signature can't be guessed by timing
  if (sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

// ---------------------------------------------------------------- data
async function clientId() {
  const res = await sb(`clients?slug=eq.${encodeURIComponent(CLIENT_SLUG)}&select=id,business_name`);
  const rows = await res.json();
  return rows && rows.length ? rows[0] : null;
}

function isoDay(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function reservations(cid) {
  const res = await sb(`reservations?client_id=eq.${cid}&select=*&order=created_at.desc&limit=500`);
  const rows = await res.json();
  if (!Array.isArray(rows)) return [];
  const today = isoDay(new Date());
  return rows.map((r) => {
    const day = (r.requested_date || '').slice(0, 10);
    return {
      ...r,
      isUpcoming: /^\d{4}-\d{2}-\d{2}$/.test(day) ? day >= today : false,
      isToday: day === today,
    };
  });
}

async function questions(cid) {
  // Conversation insight. `unanswered` is recorded by the bot at reply time —
  // it is NOT inferred from keywords afterwards, because a heuristic flagged the
  // opening-hours answer as a failure just for containing "call us".
  // `unanswered` is added by a migration; if it has not been run yet, fall back
  // to selecting without it so the rest of the report still works.
  let rows;
  let hasFlagColumn = true;
  const base = `conversation_log?client_id=eq.${cid}&select=message,direction,platform,created_at&order=created_at.desc&limit=2000`;
  let res = await sb(`${base.replace('&select=', ',unanswered&select=')}`);
  rows = await res.json();
  if (!Array.isArray(rows)) {
    hasFlagColumn = false;
    res = await sb(base);
    rows = await res.json();
  }
  if (!Array.isArray(rows)) return { top: [], unanswered: [], unansweredCount: 0, note: 'conversation_log unavailable' };

  // Single-word booking-flow replies ("book", "cancel", a bare party size) are
  // answers to our prompts, not questions people asked. They would otherwise
  // dominate the report.
  const FLOW_TOKENS = new Set(['book', 'booking', 'cancel', 'stop', 'start over', 'restart',
    'hi', 'hello', 'hey', 'yes', 'no', 'ok', 'okay', 'thanks', 'thank you']);

  const normalise = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();

  const inbound = rows.filter((r) => r.direction === 'in');
  const counts = new Map();
  for (const r of inbound) {
    const k = normalise(r.message);
    if (!k || k.length < 3) continue;
    if (FLOW_TOKENS.has(k)) continue;
    if (/^\d{1,2}$/.test(k)) continue;                       // a bare party size
    if (/^\+?[\d\s()-]{6,}$/.test(k)) continue;              // a phone number
    const cur = counts.get(k) || { message: r.message, count: 0, platforms: new Set() };
    cur.count += 1;
    cur.platforms.add(r.platform);
    counts.set(k, cur);
  }
  const top = [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)
    .map((c) => ({ message: c.message, count: c.count, platforms: [...c.platforms] }));

  const unansweredRows = rows
    .filter((r) => r.direction === 'out' && r.unanswered === true)
    .slice(0, 25)
    .map((r) => ({ message: r.message, platform: r.platform, at: r.created_at }));

  const answered = rows.filter((r) => r.direction === 'out');
  return {
    top,
    unanswered: unansweredRows,
    totalInbound: inbound.length,
    totalOutbound: answered.length,
    unansweredCount: unansweredRows.length,
    flagColumnReady: hasFlagColumn,
  };
}

function summarise(list) {
  const today = isoDay(new Date());
  const byPlatform = {};
  const byStatus = {};
  let upcoming = 0; let todayCount = 0; let guests = 0; let upcomingGuests = 0;
  for (const r of list) {
    byPlatform[r.platform || 'unknown'] = (byPlatform[r.platform || 'unknown'] || 0) + 1;
    byStatus[r.status || 'pending'] = (byStatus[r.status || 'pending'] || 0) + 1;
    const n = Number(r.party_size) || 0;
    guests += n;
    const day = (r.requested_date || '').slice(0, 10);
    if (day === today) { todayCount += 1; }
    if (/^\d{4}-\d{2}-\d{2}$/.test(day) && day >= today) { upcoming += 1; upcomingGuests += n; }
  }
  return { total: list.length, upcoming, todayCount, guests, upcomingGuests, byPlatform, byStatus };
}

// ---------------------------------------------------------------- handler
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json({ ok: true });

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch {}
  const action = body.action || 'data';

  if (!SUPABASE_URL || !SUPABASE_KEY) return json({ error: 'not configured' }, 500);
  if (!ADMIN_PASSWORD) {
    return json({ error: 'ADMIN_PASSWORD is not set for this site. Add it in Netlify → Site configuration → Environment variables, then redeploy.' }, 500);
  }

  if (action === 'login') {
    const given = String(body.password || '');
    const a = Buffer.from(given);
    const b = Buffer.from(ADMIN_PASSWORD);
    const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!ok) {
      await new Promise((r) => setTimeout(r, 600));   // blunt the guessing rate
      return json({ error: 'Wrong password.' }, 401);
    }
    return json({ ok: true }, 200, { 'Set-Cookie': issueCookie() });
  }

  if (action === 'logout') {
    return json({ ok: true }, 200, { 'Set-Cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0` });
  }

  if (!authed(event)) return json({ error: 'Not signed in.' }, 401);

  const c = await clientId();
  if (!c) return json({ error: `No client row for slug ${CLIENT_SLUG}` }, 500);

  if (action === 'data') {
    const list = await reservations(c.id);
    const q = await questions(c.id);
    return json({ business: c.business_name, reservations: list, summary: summarise(list), questions: q, statuses: STATUSES });
  }

  if (action === 'status') {
    const id = String(body.id || '');
    const status = String(body.status || '');
    if (!id || !STATUSES.includes(status)) return json({ error: 'bad id or status' }, 400);
    const res = await sb(`reservations?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return json({ error: `update failed ${res.status}` }, 500);
    return json({ ok: true });
  }

  return json({ error: 'unknown action' }, 400);
};
