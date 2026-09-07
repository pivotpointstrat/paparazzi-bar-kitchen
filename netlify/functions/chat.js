// Paparazzi Bar & Kitchen — AI chat backend (DeepSeek).
// Exposed by Netlify at /.netlify/functions/chat

const API_KEY = process.env.LLM_API_KEY || process.env.DEEPSEEK_API_KEY || '';
const MODEL = process.env.LLM_MODEL || 'deepseek-chat';
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

const CHAT_SYSTEM = `You are the friendly assistant on the Paparazzi Bar & Kitchen website in Phnom Penh, Cambodia. Answer visitors' questions warmly and concisely (2-4 sentences).

Rules:
- Answer ONLY from the knowledge below. Never invent prices, dishes, or facts that aren't listed.
- Be warm and concise. This is a website chat.
- For reservations, point them to the "Book a Table" page or give the phone number 031 777 2840.
- If you don't know something, suggest they call 031 777 2840.

PAPARAZZI KNOWLEDGE:
- Hours: Mon–Sat 11:00 AM – 11:00 PM. Closed Sunday.
- Address: 179 E0 Preah Sisowath Quay, Phnom Penh, Cambodia.
- Phone: 031 777 2840. Facebook: facebook.com/PaparazziPP. Opened 2024.
- Atmosphere: cozy, dim, relaxed. English-speaking staff. Cigar lounge upstairs (Dominican & Caribbean cigars).
- Reservations: online booking form or by phone; large groups / private upper level available.
- Breakfast: light options upstairs (coffee, freshly baked muffins).
- Weekly specials: rotating (Slow Cooked Lamb Shank, Weekend Steak special).
- Promos: 6 Miyagi Oysters + 2 glasses Prosecco $10; Pasta Monday $4.99 with a beverage.

MENU (10 categories, sample prices):
- Small Plates: Birria Tacos $2.50, Red Braised Pork Belly $5.95, Swedish Meatballs $5.95, Beef Carpaccio $10.95.
- Salads: Chicken Caesar $8.50, Fresh Tuna $8.95, Burrata & Parma Ham $9.95.
- Pub Menu: Steak & Guinness Pie $9.50, Fish & Chips $9.95, Bangers & Mash in a Yorkie $9.50.
- Cold Cut Platters: Medium $9.95, Large $21.95.
- Pastas: Spaghetti Bolognese $6.95, Beef Lasagna $8.50, Lobster Pasta $11.95.
- From the Grill: Slow Cooked Ribs $16, Tenderloin 200g $19–25, Rib Eye 330g $29, Tomahawk 1.25kg $88 (serves 3-4), Surf & Turf $22.
- Burgers: Double Trouble $8.95, Big Bacon & Cheese $9.95, Gourmet Burger $10.95.
- From the Sea: Saffron Mussel Soup $12.95, Grilled Salmon $13.95, Moules-Frites $8.95.
- Cocktails: 24 cocktails at $5 each (Mojito, Espresso Martini, Negroni, Aperol Spritz, etc.). Irish Coffee $6.
- Beer: Cambodia Draught $2, Chang $2.50, Heineken $3.50, Tiger Crystal $3.50, Corona $4, Guinness $5, craft beers from Botanico & Fuzzy Logic $4.`;

async function deepseek(messages, maxTokens = 400) {
  const body = { model: MODEL, max_tokens: maxTokens, temperature: 0.4, messages };
  const res = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`DeepSeek ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

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

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json({ ok: true });
  if (!API_KEY) {
    return json({ reply: "I'm not fully configured yet. Please call 031 777 2840 and our team will assist you." });
  }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch {}

  try {
    const messages = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
    if (!messages.length) return json({ error: 'messages required' }, 400);
    const out = await deepseek([{ role: 'system', content: CHAT_SYSTEM }, ...messages], 400);
    return json({ reply: out || 'Sorry, I had trouble answering. Please call 031 777 2840.' });
  } catch (err) {
    console.error('chat function error:', err.message);
    return json({ reply: 'Sorry, I had trouble answering. Please call 031 777 2840.' });
  }
};
