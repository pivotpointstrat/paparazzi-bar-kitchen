// Mobile navigation for the Paparazzi site.
//
// Below 900px the six header items (five links plus the gold "Book a Table"
// button) collapse behind a hamburger. That collapse is scoped to `html.js` in
// the CSS — the class is set inline in each page's <head> — so if this file
// fails to load the links stay in the layout and the site is still navigable,
// just cramped, rather than losing its menu entirely.
(function () {
  var header = document.querySelector('header');
  var nav = document.getElementById('main-nav');
  var toggle = document.querySelector('.nav-toggle');
  if (!header || !nav || !toggle) return;

  function isOpen() {
    return nav.classList.contains('is-open');
  }

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    // also hides the floating chat/voice buttons while the menu covers the screen
    document.body.classList.toggle('nav-open', open);
  }

  toggle.addEventListener('click', function () {
    setOpen(!isOpen());
  });

  // Tapping a link navigates away — close first so the panel isn't left open
  // behind the incoming page.
  nav.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('a')) setOpen(false);
  });

  // Escape closes and returns focus to the button.
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.key === 'Esc') && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Tapping outside the header closes it.
  document.addEventListener('click', function (e) {
    if (isOpen() && !header.contains(e.target)) setOpen(false);
  });

  // Widening past the breakpoint must not leave the body scroll-locked.
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900 && isOpen()) setOpen(false);
  });
})();
