// Page-view beacon. No cookies: a random id in sessionStorage, gone when the tab
// closes. Skips the staff dashboard so the owner's own visits don't inflate it.
(function () {
  try {
    if (location.pathname.indexOf('/admin') === 0) return;
    var sid = sessionStorage.getItem('pv_sid');
    if (!sid) {
      sid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      sessionStorage.setItem('pv_sid', sid);
    }
    fetch('/.netlify/functions/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: location.pathname,
        referrer: document.referrer || '',
        sessionId: sid,
        viewport: window.innerWidth,
      }),
      keepalive: true,
    }).catch(function () {});
  } catch (e) { /* never let analytics break the page */ }
})();
