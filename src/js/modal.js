// Accessible modals built on the native <dialog> element (focus trap, Esc and
// focus return come from the browser). Motion handles the open/close animation.
import { animate } from 'motion';
import { reducedMotion, EASE_OUT } from './motion.js';

const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');

export function openDialog(dialog, trigger = document.activeElement) {
  if (dialog.open) return;
  dialog.returnTo = trigger;
  dialog.showModal();
  const heading = dialog.querySelector('h2[tabindex]');
  heading?.focus({ preventScroll: true });
  dialog.querySelector('[data-panel]').scrollTop = 0;
  if (!reducedMotion()) {
    animate(dialog.querySelector('[data-panel]'), { opacity: [0, 1], y: [28, 0], scale: [0.96, 1] }, { duration: 0.4, ease: EASE_OUT });
  }
}

export async function closeDialog(dialog) {
  if (!dialog.open || dialog.dataset.closing) return;
  if (!reducedMotion()) {
    dialog.dataset.closing = 'true';
    const animation = animate(dialog.querySelector('[data-panel]'), { opacity: 0, y: 16, scale: 0.97 }, { duration: 0.18, ease: 'easeIn' });
    // The timeout guarantees the dialog still closes if the browser pauses animations.
    await new Promise((resolve) => {
      animation.then(resolve);
      setTimeout(resolve, 400);
    });
    delete dialog.dataset.closing;
  }
  dialog.close();
  // Send focus back to whatever opened the dialog.
  if (dialog.returnTo?.isConnected) dialog.returnTo.focus({ preventScroll: true });
  dialog.returnTo = null;
}

export function initModals() {
  const contact = document.getElementById('contact-dialog');
  const product = document.getElementById('product-dialog');

  for (const dialog of [contact, product]) {
    // Esc: play the closing animation instead of snapping shut.
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeDialog(dialog);
    });
    // Click on the backdrop (the dialog element itself) closes.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog || event.target.closest('[data-dialog-close]')) closeDialog(dialog);
    });
  }

  const mailto = contact.querySelector('[data-contact-mailto]');
  const productNote = contact.querySelector('[data-contact-product]');
  const copyStatus = contact.querySelector('[data-copy-status]');

  function openContact(productTitle, trigger) {
    const { email, subject, productSubject, productNote: noteTemplate } = contact.dataset;
    const finalSubject = productTitle ? fill(productSubject, { product: productTitle }) : subject;
    mailto.href = `mailto:${email}?subject=${encodeURIComponent(finalSubject)}`;
    productNote.hidden = !productTitle;
    productNote.textContent = productTitle ? fill(noteTemplate, { product: productTitle }) : '';
    copyStatus.textContent = '';
    openDialog(contact, trigger);
  }

  function openProduct(trigger) {
    const template = trigger.closest('[data-product-item]')?.querySelector('[data-product-template]');
    if (!template) return;
    product.querySelector('[data-product-body]').replaceChildren(template.content.cloneNode(true));
    openDialog(product, trigger);
  }

  document.addEventListener('click', (event) => {
    const contactTrigger = event.target.closest('[data-contact]');
    if (contactTrigger) {
      openContact(contactTrigger.dataset.productTitle, contactTrigger);
      return;
    }
    const productTrigger = event.target.closest('[data-product-open]');
    if (productTrigger) openProduct(productTrigger);
  });

  contact.querySelector('[data-copy-email]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(contact.dataset.email);
      copyStatus.textContent = copyStatus.dataset.copied;
    } catch {
      // Clipboard unavailable: select the address so it can be copied by hand.
      const range = document.createRange();
      range.selectNodeContents(contact.querySelector('[data-contact-email]'));
      const selection = getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
}
