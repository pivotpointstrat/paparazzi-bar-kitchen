// Paparazzi Bar & Kitchen — reservations + AI chat widget.
// (Voice concierge lives in voice.js, loaded separately.)

// ===========================================================================
// Reservation form — posts to the Netlify Function, which stores + notifies
// ===========================================================================
(function () {
  const form = document.getElementById('reservation-form');
  if (!form) return;
  const responseBox = document.getElementById('r-response');
  const submitBtn = document.getElementById('r-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('r-name').value.trim(),
      phone: document.getElementById('r-phone').value.trim(),
      date: document.getElementById('r-date').value,
      time: document.getElementById('r-time').value,
      party: document.getElementById('r-party').value,
      occasion: document.getElementById('r-occasion').value.trim(),
      notes: document.getElementById('r-notes').value.trim(),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    responseBox.className = 'form-response';
    responseBox.style.display = 'none';

    try {
      const res = await fetch('/.netlify/functions/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit reservation.');
      responseBox.className = 'form-response ok';
      responseBox.textContent = '✓ Thank you — your reservation request was received. We\u2019ll confirm by phone shortly.';
      form.reset();
    } catch (err) {
      responseBox.className = 'form-response err';
      responseBox.textContent = 'Something went wrong. Please call 031 777 2840 to book.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Request Reservation';
    }
  });

  // Set min date to today
  const dateInput = document.getElementById('r-date');
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }
})();

// ===========================================================================
// AI chat widget — answers hours/menu/FAQ from the Paparazzi knowledge base
// ===========================================================================
(function () {
  const toggle = document.getElementById('chat-toggle');
  const windowEl = document.getElementById('chat-window');
  const close = document.getElementById('chat-close');
  const messagesEl = document.getElementById('chat-messages');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  if (!toggle || !windowEl) return;

  let history = [];

  function addMessage(role, text) {
    const el = document.createElement('div');
    el.className = 'msg ' + (role === 'user' ? 'user' : 'bot');
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function greeting() {
    addMessage('bot', 'Welcome to Paparazzi Bar & Kitchen! I can tell you about our hours, menu, location, and reservations. What can I help you with?');
  }

  toggle.addEventListener('click', () => {
    const opening = windowEl.style.display === 'none' || windowEl.style.display === '';
    windowEl.style.display = opening ? 'flex' : 'none';
    if (opening && messagesEl.children.length === 0) greeting();
  });

  close.addEventListener('click', () => { windowEl.style.display = 'none'; });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMessage('user', text);
    history.push({ role: 'user', content: text });

    const typing = addMessage('bot', '…');

    try {
      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      const reply = (data.reply || 'Sorry, I had trouble answering. Please call 031 777 2840.').replace(/\*\*/g, '');
      typing.textContent = reply;
      history.push({ role: 'assistant', content: reply });
    } catch (err) {
      typing.textContent = 'Sorry, I\u2019m having trouble connecting. Please call 031 777 2840.';
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
})();
