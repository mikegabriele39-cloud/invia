// INVIA pre-launch mode.
// Keeps the existing cart + checkout implementation intact while the site collects waitlist signups.
(() => {
  const WAITLIST_URL = 'index.html#waitlist';

  function applyPrelaunchMode() {
    document.documentElement.classList.add('invia-prelaunch');

    // Keep the cart code in the repo, but remove cart/checkout entry points from the live pre-launch UI.
    document.querySelectorAll('[data-open-cart], .cart-drawer, .drawer-overlay, a[href="checkout.html"]').forEach(el => {
      el.style.display = 'none';
    });

    // Product pages become preview + waitlist pages instead of purchase pages.
    document.querySelectorAll('[data-product]').forEach(product => {
      product.querySelectorAll('.option-heading, .size-picker, .quantity-selector').forEach(el => {
        el.style.display = 'none';
      });

      const purchasePanel = product.querySelector('.purchase-panel');
      if (purchasePanel) {
        let note = purchasePanel.querySelector('.prelaunch-note');
        if (!note) {
          note = document.createElement('p');
          note.className = 'prelaunch-note';
          note.textContent = 'Not available for purchase yet. Join the waitlist for first access when INVIA goes live.';
          purchasePanel.prepend(note);
        }
      }

      const row = product.querySelector('.purchase-row');
      if (row) {
        row.style.display = 'block';
      }

      const button = product.querySelector('[data-add-product]');
      if (button) {
        button.type = 'button';
        button.style.width = '100%';
        button.innerHTML = '<span>Join the Waitlist</span>';
        button.setAttribute('aria-label', 'Join the INVIA waitlist');
      }
    });

    // Add a waitlist link to pages that do not already have one.
    const nav = document.getElementById('navLinks');
    if (nav && !nav.querySelector('a[href*="#waitlist"]')) {
      const link = document.createElement('a');
      link.href = WAITLIST_URL;
      link.textContent = 'Waitlist';
      nav.insertBefore(link, nav.children[2] || null);
    }
  }

  // Capture clicks before the existing cart handler can run.
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-add-product], [data-sticky-add]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.href = WAITLIST_URL;
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyPrelaunchMode);
  } else {
    applyPrelaunchMode();
  }
})();
