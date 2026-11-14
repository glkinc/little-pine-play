import { animate } from 'motion';
import { initMotion, reducedMotion, EASE_OUT } from './motion.js';
import { initModals } from './modal.js';
import { initFilter } from './filter.js';

function initMobileMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      menu.hidden = false;
      if (!reducedMotion()) animate(menu, { opacity: [0, 1], height: [0, menu.scrollHeight] }, { duration: 0.3, ease: EASE_OUT }).then(() => (menu.style.height = ''));
    } else if (!menu.hidden) {
      if (reducedMotion()) {
        menu.hidden = true;
      } else {
        animate(menu, { opacity: 0, height: 0 }, { duration: 0.2 }).then(() => {
          menu.hidden = true;
          menu.style.height = '';
          menu.style.opacity = '';
        });
      }
    }
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a, [data-contact]')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => event.matches && setOpen(false));
}

initModals();
initFilter();
initMobileMenu();
initMotion();
