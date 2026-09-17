// Paparazzi Bar & Kitchen — reservation handler.
// Exposed by Netlify at /.netlify/functions/reservations
// Stores the reservation in Supabase and notifies the owner via Telegram.
//
// Required env vars:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (same Supabase as the restaurant bot)
//   TELEGRAM_BOT_TOKEN                       (Paparazzi bot token)
//   TELEGRAM_OWNER_CHAT_ID                   (owner's Telegram chat id)

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TG_OWNER = process.env.TELEGRAM_OWNER_CHAT_ID || '';
// Website reservations must be attributed to a client, or a per-client
// dashboard silently drops them. Set CLIENT_SLUG per site in Netlify env.
const CLIENT_SLUG = process.env.CLIENT_SLUG || 'paparazzi-kitchen';
let cachedClientId;

function json(obj, status = 200) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(obj),
  };
}

async function resolveClientId() {
  if (cachedClientId !== undefined) return cachedClientId;
  if (!SUPABASE_URL || !SUPABASE_KEY) return (cachedClientId = null);
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/clients?slug=eq.${encodeURIComponent(CLIENT_SLUG)}&select=id`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    const rows = await res.json();
    cachedClientId = rows && rows.length ? rows[0].id : null;
  } catch (e) {
    console.error('client lookup failed:', e.message);
    cachedClientId = null;
  }
  return cachedClientId;
}

// Store in Supabase `reservations` table (matches the restaurant-bot schema)
async function storeReservation(r) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    // Never pretend this worked. An unconfigured form that says "received" is
    // worse than a broken one: the customer believes they have a table.
    throw new Error('storage not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing)');
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      customer_name: r.name,
      customer_contact: r.phone,
      party_size: r.party,
      requested_date: r.date,
      requested_time: r.time,
      notes: [r.occasion ? `Occasion: ${r.occasion}. ` : '', r.notes || ''].join('').trim() || null,
      client_id: await resolveClientId(),
      platform: 'website',
      status: 'pending',
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('Supabase insert failed:', res.status, text.slice(0, 200));
    throw new Error(`storage failed ${res.status}`);
  }
  return true;
}

// Notify owner via Telegram
async function notifyOwner(r) {
  if (!TG_TOKEN || !TG_OWNER) {
    console.warn('Telegram not configured — skipping notification.');
    return;
  }
  const lines = [
    '\u{1F37D}\uFE0F *New Website Reservation*',
    `Name: ${r.name}`,
    `Phone: ${r.phone}`,
    `Date: ${r.date}`,
    `Time: ${r.time}`,
    `Party: ${r.party}`,
  ];
  if (r.occasion) lines.push(`Occasion: ${r.occasion}`);
  if (r.notes) lines.push(`Notes: ${r.notes}`);
  const text = lines.join('\n');

  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_OWNER, text, parse_mode: 'Markdown' }),
    });
  } catch (e) {
    console.error('Telegram notify failed:', e.message);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json({ ok: true });

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch {}

  const r = {
    name: (body.name || '').trim(),
    phone: (body.phone || '').trim(),
    date: (body.date || '').trim(),
    time: (body.time || '').trim(),
    party: (body.party || '').trim(),
    occasion: (body.occasion || '').trim(),
    notes: (body.notes || '').trim(),
  };

  // Basic validation
  if (!r.name || !r.phone || !r.date || !r.time || !r.party) {
    return json({ error: 'Please fill in all required fields (name, phone, date, time, party size).' }, 400);
  }

  try {
    await storeReservation(r);
  } catch (err) {
    // Storage comes first: if the booking is not saved, the customer must be
    // told to call instead of being told it went through.
    console.error('reservation NOT stored:', err.message);
    return json({ error: 'Sorry — we could not save your booking. Please call 031 777 2840 and we will take it directly.' }, 500);
  }
  await notifyOwner(r);
  return json({ ok: true, message: 'Reservation request received.' });
};
