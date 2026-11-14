// Product category filter. Buttons use aria-pressed, and the result count is
// announced to screen readers through a live region.
import { revealItems } from './motion.js';

export function initFilter() {
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const items = [...document.querySelectorAll('[data-product-item]')];
  const status = document.querySelector('[data-result-count]');
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));

      const visible = [];
      items.forEach((item) => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.hidden = !show;
        if (show) visible.push(item);
      });
      revealItems(visible);

      if (status) {
        status.textContent = status.dataset.template.replace('{count}', visible.length).replace('{total}', status.dataset.total);
      }
    });
  });
}
