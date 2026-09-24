/* Small, dependency-free controls for the project page. */
(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.mast-nav');
  if (menu && nav) {
    document.documentElement.classList.add('js-nav');
    const close = () => {
      nav.classList.remove('is-open');
      menu.setAttribute('aria-expanded', 'false');
    };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      nav.classList.toggle('is-open', open);
      menu.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        close();
        menu.focus();
      }
    });
    matchMedia('(min-width: 821px)').addEventListener('change', close);
  }

  const scope = document.getElementById('scope');
  const range = document.getElementById('wipe');
  const value = document.getElementById('pct');
  if (!scope || !range || !value) return;
  const set = number => {
    const percentage = Math.round(Math.max(0, Math.min(100, number)));
    scope.style.setProperty('--wipe', `${percentage}%`);
    range.value = percentage;
    value.value = `${percentage}%`;
    range.setAttribute('aria-valuetext', `${percentage}% prepared AR overlay revealed`);
  };
  let dragging = false;
  const move = event => {
    const bounds = scope.getBoundingClientRect();
    if (bounds.width) set((event.clientX - bounds.left) / bounds.width * 100);
  };
  scope.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    dragging = true;
    scope.setPointerCapture(event.pointerId);
    move(event);
  });
  scope.addEventListener('pointermove', event => { if (dragging) move(event); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name => {
    scope.addEventListener(name, () => { dragging = false; });
  });
  range.addEventListener('input', () => set(Number(range.value)));
  set(Number(range.value));
})();
