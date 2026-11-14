// Micro-transitions (motion.dev). Everything here is decorative: content is
// fully usable without it, and it is skipped when the visitor prefers reduced
// motion.
import { animate, inView, stagger, hover, press } from 'motion';

export const EASE_OUT = [0.22, 1, 0.36, 1];
const query = window.matchMedia('(prefers-reduced-motion: reduce)');
export const reducedMotion = () => query.matches;

export function revealItems(items, { delay = 0 } = {}) {
  if (!items.length) return;
  if (reducedMotion()) {
    items.forEach((el) => (el.style.opacity = 1));
    return;
  }
  animate(items, { opacity: [0, 1], y: [26, 0] }, { duration: 0.6, delay: stagger(0.08, { startDelay: delay }), ease: EASE_OUT });
}

export function initMotion() {
  if (reducedMotion()) return;

  // Hero entrance.
  const heroText = document.querySelector('[data-hero-text]');
  const heroMedia = document.querySelector('[data-hero-media]');
  if (heroText) animate([...heroText.children], { opacity: [0, 1], y: [22, 0] }, { duration: 0.7, delay: stagger(0.09), ease: EASE_OUT });
  if (heroMedia) animate(heroMedia, { opacity: [0.4, 1], scale: [0.95, 1], rotate: [-2, 0] }, { duration: 0.9, ease: EASE_OUT });

  // Gently floating decorative shapes.
  document.querySelectorAll('[data-float]').forEach((el, i) => {
    const slow = el.dataset.float === 'slower';
    animate(el, { y: [0, slow ? -16 : -10, 0], x: [0, i % 2 ? 6 : -6, 0] }, { duration: slow ? 9 : 6.5, repeat: Infinity, ease: 'easeInOut' });
  });

  // Reveal on scroll.
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    inView(el, () => revealItems([el]), { amount: 0.25 });
  });
  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    inView(group, () => revealItems([...group.children].filter((child) => !child.hidden)), { amount: 0.1 });
  });

  // Hover + press feedback.
  hover('.product-card', (card) => {
    animate(card, { y: -6 }, { duration: 0.3, ease: EASE_OUT });
    return () => animate(card, { y: 0 }, { duration: 0.3, ease: EASE_OUT });
  });
  press('.btn, .chip, .modal-close', (el) => {
    animate(el, { scale: 0.96 }, { duration: 0.12 });
    return () => animate(el, { scale: 1 }, { type: 'spring', stiffness: 500, damping: 18 });
  });

  // FAQ answers ease in when opened.
  document.querySelectorAll('.faq-item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) animate(item.querySelector('[data-faq-body]'), { opacity: [0, 1], y: [-8, 0] }, { duration: 0.35, ease: EASE_OUT });
    });
  });
}
