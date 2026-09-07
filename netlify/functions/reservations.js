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

// Store in Supabase `reservations` table (matches the restaurant-bot schema)
async function storeReservation(r) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('Supabase not configured — skipping storage.');
    return null;
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
      platform: 'website',
      status: 'pending',
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('Supabase insert failed:', res.status, text.slice(0, 200));
  }
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
    await notifyOwner(r);
    return json({ ok: true, message: 'Reservation request received.' });
  } catch (err) {
    console.error('reservation error:', err.message);
    return json({ error: 'Could not process reservation. Please call 031 777 2840.' }, 500);
  }
};
