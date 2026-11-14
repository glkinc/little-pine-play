// HTML templates. Pure functions: content (from src/content/*.json) in, HTML out.
// They run at build time (and on each dev request) inside
// vite-plugins/render-content.js, so the finished HTML is in the page source
// for search engines and AI crawlers. No copy lives in this file.

const esc = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const fill = (template = '', values = {}) =>
  String(template).replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');

const slug = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const ICONS = {
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8"/><path d="M12 8S10.5 3 8 3a2.5 2.5 0 0 0 0 5h4zm0 0s1.5-5 4-5a2.5 2.5 0 0 1 0 5h-4z"/>',
  boxes:
    '<path d="M12 3 4 7v10l8 4 8-4V7l-8-4z"/><path d="m4 7 8 4 8-4M12 11v10"/>',
  blocks:
    '<rect x="3" y="12" width="8" height="8" rx="1.5"/><rect x="13" y="12" width="8" height="8" rx="1.5"/><rect x="8" y="3" width="8" height="8" rx="1.5"/>',
  brush:
    '<path d="M18.4 2.6a2 2 0 0 1 3 3L11 16l-3.5.500L8 13 18.4 2.6z"/><path d="M7.5 16.5C5 16.5 4 18 4 19.5c0 1-1 1.5-2 1.5 1 1 2.5 1.5 4 1.5 2.5 0 4-1.5 4-3.5"/>',
  jar: '<path d="M8 3h8v3H8z"/><path d="M7 6h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M9 12h.01M13 14h.01M11 17h.01M15 11h.01"/>',
  heart:
    '<path d="M12 20.5s-7.5-4.5-9.3-9.2C1.5 8 3.5 4.5 7 4.5c2 0 3.7 1.1 5 3 1.3-1.9 3-3 5-3 3.5 0 5.5 3.5 4.3 6.8C19.5 16 12 20.5 12 20.5z"/>',
  hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-.500v-6a1.5 1.5 0 0 1 3 0V11m0-4.5a1.5 1.5 0 0 1 3 0V12m0-2.5a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-7 7h-1.2a6 6 0 0 1-4.6-2.2L3.3 15a1.6 1.6 0 0 1 2.4-2.1L8 15"/>',
  leaf: '<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M4 21c2-5 5-8.5 10-11"/>',
  pin: '<path d="M12 21.5s7-6.2 7-11.5a7 7 0 1 0-14 0c0 5.3 7 11.5 7 11.5z"/><circle cx="12" cy="10" r="2.5"/>',
  sparkles:
    '<path d="M10 3l1.8 4.7L16.5 9.5l-4.7 1.8L10 16l-1.8-4.7L3.5 9.5l4.7-1.8L10 3z"/><path d="M18 14l.900 2.1L21 17l-2.1.900L18 20l-.900-2.1L15 17l2.1-.900L18 14z"/>',
  tree: '<path d="M12 2 7.5 8H10l-4 5h3l-4 5h14l-4-5h3l-4-5h2.5L12 2z"/><path d="M12 18v4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
};

const icon = (name, size = 24, cls = '') =>
  `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.sparkles}</svg>`;

const TINTS = ['bg-tint-plum', 'bg-tint-peach', 'bg-tint-mustard', 'bg-tint-pine'];

const sectionHead = ({ eyebrow, title, intro }, id, center = true) => `
  <div class="${center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}" data-reveal>
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <h2 id="${id}" class="mt-2 text-3xl sm:text-4xl">${esc(title)}</h2>
    ${intro ? `<p class="mt-4 text-lg text-ink-muted">${esc(intro)}</p>` : ''}
  </div>`;

/* ----------------------------------------------------------------------------
   Sections
---------------------------------------------------------------------------- */

function header({ site, img }) {
  const links = (cls) =>
    site.nav.map((item) => `<li><a class="${cls}" href="${esc(item.href)}">${esc(item.label)}</a></li>`).join('');
  return `
  <a class="skip-link" href="#main">${esc(site.ui.skipLink)}</a>
  <header class="site-header sticky top-0 z-40">
    <div class="wrap flex items-center justify-between gap-4 py-2.5">
      <a href="#top" class="flex items-center gap-3" aria-label="${esc(site.ui.homeLabel)}">
        <span class="block size-12 shrink-0 overflow-hidden rounded-full border border-line bg-white">
          ${img(site.logo, { alt: '', sizes: '64px', eager: true, imgCls: 'size-full scale-[1.3] object-cover' })}
        </span>
        <span class="font-display text-xl font-semibold lowercase tracking-tight text-brand">${esc(site.name)}</span>
      </a>
      <nav aria-label="${esc(site.ui.mainNavLabel)}" class="hidden md:block">
        <ul class="flex items-center gap-7">${links('nav-link')}</ul>
      </nav>
      <div class="flex items-center gap-2">
        <button type="button" class="btn btn-primary hidden sm:inline-flex" data-contact>${esc(site.contact.buttonLabel)}</button>
        <button type="button" class="grid size-11 place-items-center rounded-full text-brand md:hidden" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu">
          <span class="sr-only">${esc(site.ui.menuLabel)}</span>
          ${icon('menu', 26)}
        </button>
      </div>
    </div>
    <nav id="mobile-menu" aria-label="${esc(site.ui.mainNavLabel)}" class="overflow-hidden border-t border-line md:hidden" hidden>
      <ul class="wrap flex flex-col py-3">
        ${links('nav-link w-full text-lg')}
        <li class="pt-3 pb-2 sm:hidden"><button type="button" class="btn btn-primary w-full" data-contact>${esc(site.contact.buttonLabel)}</button></li>
      </ul>
    </nav>
  </header>`;
}

function hero({ home, img }) {
  const h = home.hero;
  return `
  <section class="relative overflow-hidden" aria-labelledby="hero-title">
    <div class="wrap grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
      <div data-hero-text>
        <p class="eyebrow">${esc(h.eyebrow)}</p>
        <h1 id="hero-title" class="mt-3 text-[clamp(2.4rem,6vw,4.25rem)] text-brand-strong">${esc(h.headline)}</h1>
        <p class="mt-5 max-w-xl text-lg text-ink-muted sm:text-xl">${esc(h.subhead)}</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a class="btn btn-primary" href="${esc(h.primaryCta.href)}">${esc(h.primaryCta.label)} ${icon('arrow', 18)}</a>
          <button type="button" class="btn btn-secondary" data-contact>${esc(h.contactCta)}</button>
        </div>
      </div>
      <div class="relative mx-auto w-full max-w-md lg:max-w-none" data-hero-media>
        <span class="absolute -left-6 -top-6 size-28 rounded-full bg-decor-mustard sm:size-36" aria-hidden="true" data-float="slow"></span>
        <span class="absolute -bottom-8 -right-4 size-36 rounded-full bg-decor-plum sm:size-44" aria-hidden="true" data-float="slower"></span>
        <span class="absolute -right-3 top-10 size-14 rounded-full bg-decor-peach" aria-hidden="true" data-float="slow"></span>
        <div class="relative aspect-[4/5] overflow-hidden rounded-feature border-4 border-surface shadow-overlay">
          ${img(h.image, { alt: h.imageAlt, sizes: '(min-width: 1024px) 560px, (min-width: 640px) 448px, 92vw', eager: true, imgCls: 'size-full object-cover' })}
        </div>
      </div>
    </div>
  </section>`;
}

function values({ home }) {
  return `
  <section aria-label="${esc(home.values.map((v) => v.title).join(', '))}" class="border-y border-line bg-surface">
    <ul class="wrap grid grid-cols-2 gap-x-6 gap-y-8 py-10 lg:grid-cols-4" data-reveal-group>
      ${home.values
        .map(
          (v) => `
      <li class="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
        <span class="grid size-12 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">${icon(v.icon)}</span>
        <span>
          <strong class="block font-display text-lg font-medium">${esc(v.title)}</strong>
          <span class="block text-[0.9375rem] leading-snug text-ink-muted">${esc(v.text)}</span>
        </span>
      </li>`,
        )
        .join('')}
    </ul>
  </section>`;
}

function services({ home }) {
  const s = home.services;
  return `
  <section id="services" class="py-16 sm:py-24" aria-labelledby="services-title">
    <div class="wrap">
      ${sectionHead(s, 'services-title')}
      <ul class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-reveal-group>
        ${s.items
          .map(
            (item, i) => `
        <li class="card p-6 sm:p-7">
          <span class="grid size-14 place-items-center rounded-2xl ${TINTS[i % TINTS.length]} text-brand-strong">${icon(item.icon, 28)}</span>
          <h3 class="mt-5 text-xl">${esc(item.title)}</h3>
          <p class="mt-2 text-ink-muted">${esc(item.text)}</p>
        </li>`,
          )
          .join('')}
      </ul>
      <div class="mt-10 text-center" data-reveal>
        <button type="button" class="btn btn-primary" data-contact>${esc(s.cta)}</button>
      </div>
    </div>
  </section>`;
}

function productCard(product, { site, img }) {
  const titleId = `product-${esc(product.id)}-title`;
  return `
  <li data-product-item data-category="${esc(slug(product.category))}">
    <article class="card product-card">
      <div class="relative aspect-[4/5] overflow-hidden bg-canvas-alt">
        ${img(`products/${product.image}`, { variant: 'thumb', alt: product.imageAlt, sizes: '(min-width: 1024px) 360px, (min-width: 640px) 46vw, 92vw', imgCls: 'size-full object-cover' })}
        ${product.badge ? `<span class="badge absolute left-3 top-3">${esc(product.badge)}</span>` : ''}
      </div>
      <div class="flex flex-1 flex-col p-5">
        <p class="text-[0.8125rem] font-bold uppercase tracking-wider text-accent">${esc(product.category)}</p>
        <h3 class="mt-1 text-xl">
          <button type="button" class="card-trigger" data-product-open aria-haspopup="dialog">${esc(product.title)}<span class="sr-only">, ${esc(site.ui.viewDetails)}</span></button>
        </h3>
        <p class="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-muted">${esc(product.summary || product.description)}</p>
        <p class="mt-4 font-display text-xl font-semibold text-brand">${esc(product.price)}</p>
      </div>
    </article>
    <template data-product-template>
      <div class="grid md:grid-cols-2">
        <div class="bg-canvas-alt md:min-h-full">
          ${img(`products/${product.image}`, { alt: product.imageAlt, sizes: '(min-width: 768px) 440px, 92vw', eager: true, imgCls: 'max-h-[42vh] w-full object-cover md:h-full md:max-h-none' })}
        </div>
        <div class="p-6 sm:p-8">
          <p class="eyebrow pr-12">${esc(product.category)}</p>
          <h2 id="product-dialog-title" class="mt-2 pr-10 text-2xl sm:text-3xl" tabindex="-1">${esc(product.title)}</h2>
          <p class="mt-3 font-display text-2xl font-semibold text-brand">${esc(product.price)}</p>
          <p class="mt-4 text-ink-muted">${esc(product.description)}</p>
          ${
            product.details?.length
              ? `<h3 class="mt-6 font-body text-sm font-bold uppercase tracking-wider text-ink">${esc(site.ui.detailsHeading)}</h3>
          <ul class="mt-2 space-y-1.5 text-[0.9375rem] text-ink-muted">
            ${product.details.map((d) => `<li class="flex gap-2.5"><span class="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true"></span>${esc(d)}</li>`).join('')}
          </ul>`
              : ''
          }
          <button type="button" class="btn btn-primary mt-7 w-full sm:w-auto" data-contact data-product-title="${esc(product.title)}">${icon('mail', 20)} ${esc(site.ui.productInquiry)}</button>
        </div>
      </div>
    </template>
  </li>`;
}

function productsSection({ site, home, products, img }) {
  const p = home.products;
  const categories = [...new Set(products.map((item) => item.category).filter(Boolean))];
  const total = products.length;
  return `
  <section id="products" class="bg-canvas-alt py-16 sm:py-24" aria-labelledby="products-title">
    <div class="wrap">
      ${sectionHead(p, 'products-title')}
      ${
        categories.length > 1
          ? `<div class="chip-row mt-8" role="group" aria-label="${esc(site.ui.filterLabel)}" data-reveal>
        <button type="button" class="chip" data-filter="all" aria-pressed="true">${esc(site.ui.filterAll)}</button>
        ${categories.map((c) => `<button type="button" class="chip" data-filter="${esc(slug(c))}" aria-pressed="false">${esc(c)}</button>`).join('')}
      </div>`
          : ''
      }
      <p class="sr-only" role="status" data-result-count data-template="${esc(site.ui.resultCount)}" data-total="${total}"></p>
      <ul class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-product-grid data-reveal-group>
        ${products.map((product) => productCard(product, { site, img })).join('')}
      </ul>
      ${p.note ? `<p class="mx-auto mt-10 max-w-xl text-center text-[0.9375rem] text-ink-muted" data-reveal>${esc(p.note)}</p>` : ''}
    </div>
  </section>`;
}

function cubby({ home, img }) {
  const c = home.cubby;
  return `
  <section id="cubby" class="py-16 sm:py-24" aria-labelledby="cubby-title">
    <div class="wrap grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div class="relative mx-auto w-full max-w-sm lg:max-w-md" data-reveal>
        <span class="absolute -bottom-5 -left-5 size-28 rounded-full bg-decor-pine" aria-hidden="true"></span>
        <div class="relative overflow-hidden rounded-feature border-4 border-surface shadow-raised">
          ${img(c.image, { alt: c.imageAlt, sizes: '(min-width: 1024px) 448px, 384px', imgCls: 'w-full' })}
        </div>
      </div>
      <div data-reveal>
        <p class="eyebrow">${esc(c.eyebrow)}</p>
        <h2 id="cubby-title" class="mt-2 text-3xl sm:text-4xl">${esc(c.title)}</h2>
        ${c.body.map((para) => `<p class="mt-4 text-lg text-ink-muted">${esc(para)}</p>`).join('')}
        <ul class="mt-6 space-y-3">
          ${c.details
            .map(
              (d) => `<li class="flex items-center gap-3 font-semibold"><span class="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">${icon(d.icon, 20)}</span>${esc(d.text)}</li>`,
            )
            .join('')}
        </ul>
        <button type="button" class="btn btn-primary mt-8" data-contact>${esc(c.cta)}</button>
      </div>
    </div>
  </section>`;
}

function faq({ home }) {
  const f = home.faq;
  return `
  <section id="faq" class="bg-canvas-alt py-16 sm:py-24" aria-labelledby="faq-title">
    <div class="wrap">
      ${sectionHead(f, 'faq-title')}
      <div class="mx-auto mt-10 max-w-3xl space-y-3" data-reveal-group>
        ${f.items
          .map(
            (item) => `
        <details class="card faq-item">
          <summary><span>${esc(item.question)}</span><span class="faq-icon grid size-8 place-items-center rounded-full bg-brand-soft text-brand">${icon('plus', 18)}</span></summary>
          <div class="px-5 pb-5 text-ink-muted" data-faq-body><p>${esc(item.answer)}</p></div>
        </details>`,
          )
          .join('')}
      </div>
    </div>
  </section>`;
}

function ctaBand({ home }) {
  const c = home.cta;
  return `
  <section class="py-16 sm:py-20" aria-labelledby="cta-title">
    <div class="wrap">
      <div class="band relative overflow-hidden rounded-feature px-6 py-12 text-center sm:px-12 sm:py-16" data-reveal>
        <span class="absolute -left-10 -top-10 size-40 rounded-full bg-white/10" aria-hidden="true"></span>
        <span class="absolute -bottom-14 -right-8 size-52 rounded-full bg-white/10" aria-hidden="true"></span>
        <div class="relative mx-auto max-w-2xl">
          <h2 id="cta-title" class="text-3xl sm:text-4xl">${esc(c.title)}</h2>
          <p class="mt-4 text-lg opacity-95">${esc(c.body)}</p>
          <button type="button" class="btn btn-inverse mt-8" data-contact>${icon('mail', 20)} ${esc(c.button)}</button>
        </div>
      </div>
    </div>
  </section>`;
}

function footer({ site, img }) {
  const year = new Date().getFullYear();
  return `
  <footer class="site-footer">
    <div class="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
      <div>
        <div class="flex items-center gap-4">
          <span class="block h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-[50%] bg-white">
            ${img(site.footerLogo, { alt: site.footerLogoAlt, sizes: '96px', imgCls: 'size-full scale-[1.12] object-cover' })}
          </span>
          <p class="font-display text-2xl font-semibold lowercase">${esc(site.name)}</p>
        </div>
        <p class="mt-4 max-w-sm opacity-90">${esc(site.footer.blurb)}</p>
      </div>
      <nav aria-label="${esc(site.ui.footerNavLabel)}">
        <ul>
          ${site.nav.map((item) => `<li><a class="footer-link" href="${esc(item.href)}">${esc(item.label)}</a></li>`).join('')}
        </ul>
      </nav>
      <div>
        <p class="flex items-start gap-2.5 py-2">${icon('pin', 20, 'mt-1 shrink-0')}<span>${esc(site.location.display)}</span></p>
        <p><a class="footer-link gap-2.5" href="mailto:${esc(site.email)}">${icon('mail', 20, 'shrink-0')}<span>${esc(site.email)}</span></a></p>
        ${(site.social || []).map((s) => `<p><a class="footer-link" href="${esc(s.url)}" rel="noopener">${esc(s.label)}</a></p>`).join('')}
        <button type="button" class="btn btn-inverse mt-4" data-contact>${esc(site.contact.buttonLabel)}</button>
      </div>
    </div>
    <div class="border-t border-white/15">
      <p class="wrap py-5 text-sm opacity-90">${esc(fill(site.footer.copyright, { year }))}</p>
    </div>
  </footer>`;
}

function dialogs({ site }) {
  const c = site.contact;
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(c.subject)}`;
  const closeBtn = `<button type="button" class="modal-close" data-dialog-close><span class="sr-only">${esc(site.ui.closeLabel)}</span>${icon('close', 22)}</button>`;
  return `
  <dialog id="contact-dialog" class="modal" aria-labelledby="contact-dialog-title"
    data-email="${esc(site.email)}" data-subject="${esc(c.subject)}" data-product-subject="${esc(c.productSubject)}" data-product-note="${esc(c.productNote)}">
    <div class="modal-panel p-6 text-center sm:p-9" data-panel>
      ${closeBtn}
      <span class="mx-auto grid size-16 place-items-center rounded-full bg-tint-plum text-accent">${icon('mail', 30)}</span>
      <h2 id="contact-dialog-title" class="mt-4 text-3xl" tabindex="-1">${esc(c.title)}</h2>
      <p class="mt-3 text-ink-muted">${esc(c.body)}</p>
      <p class="mt-3 font-semibold text-brand" data-contact-product hidden></p>
      <a class="btn btn-primary mt-6 w-full" href="${esc(mailto)}" data-contact-mailto>${icon('mail', 20)} ${esc(c.emailButtonLabel)}</a>
      <div class="mt-3 flex items-center justify-between gap-2 rounded-full border border-line bg-canvas py-1 pl-5 pr-1">
        <span class="min-w-0 truncate font-semibold" data-contact-email>${esc(site.email)}</span>
        <button type="button" class="grid size-11 shrink-0 place-items-center rounded-full text-brand hover:bg-brand-soft" data-copy-email>
          <span class="sr-only">${esc(c.copyLabel)}</span>${icon('copy', 20)}
        </button>
      </div>
      <p class="mt-2 min-h-6 text-sm font-semibold text-brand" role="status" data-copy-status data-copied="${esc(c.copiedLabel)}"></p>
      <p class="mt-2 flex items-start justify-center gap-2 border-t border-line pt-5 text-[0.9375rem] text-ink-muted">${icon('pin', 18, 'mt-1 shrink-0 text-brand')}<span>${esc(c.visitNote)}</span></p>
    </div>
  </dialog>
  <dialog id="product-dialog" class="modal" style="--modal-width: 56rem" aria-labelledby="product-dialog-title">
    <div class="modal-panel" data-panel>
      ${closeBtn}
      <div data-product-body></div>
    </div>
  </dialog>`;
}

/* ----------------------------------------------------------------------------
   Page + head
---------------------------------------------------------------------------- */

export function renderBody(ctx) {
  return `
  <div id="top">
    ${header(ctx)}
    <main id="main" tabindex="-1">
      ${hero(ctx)}
      ${values(ctx)}
      ${services(ctx)}
      ${productsSection(ctx)}
      ${cubby(ctx)}
      ${faq(ctx)}
      ${ctaBand(ctx)}
    </main>
    ${footer(ctx)}
  </div>
  ${dialogs(ctx)}`;
}

const priceNumber = (price) => {
  const match = String(price ?? '').replace(/,/g, '').match(/\d+(\.\d+)?/);
  return match ? match[0] : null;
};

export function structuredData({ site, home, products, img }) {
  const abs = (path) => `${site.url}${path}`;
  const business = {
    '@type': 'Store',
    '@id': `${site.url}/#business`,
    name: site.name,
    slogan: site.tagline,
    description: site.description,
    url: `${site.url}/`,
    email: site.email,
    logo: abs('/apple-touch-icon.png'),
    image: abs('/og-image.jpg'),
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.location.locality,
      addressRegion: site.location.regionCode,
      addressCountry: site.location.countryCode,
    },
    areaServed: site.location.area,
    knowsAbout: home.services.items.map((s) => s.title),
    ...(site.social?.length ? { sameAs: site.social.map((s) => s.url) } : {}),
  };
  const graph = [
    business,
    { '@type': 'WebSite', '@id': `${site.url}/#website`, url: `${site.url}/`, name: site.name, description: site.description, inLanguage: 'en-CA', publisher: { '@id': business['@id'] } },
    {
      '@type': 'ItemList',
      name: home.products.title,
      itemListElement: products.map((p, i) => {
        const price = priceNumber(p.price);
        return {
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Product',
            name: p.title,
            description: p.description,
            category: p.category,
            image: abs(img.url(`products/${p.image}`)),
            brand: { '@type': 'Brand', name: site.name },
            ...(price
              ? { offers: { '@type': 'Offer', price, priceCurrency: 'CAD', availability: 'https://schema.org/InStock', url: `${site.url}/#products`, seller: { '@id': business['@id'] } } }
              : {}),
          },
        };
      }),
    },
    {
      '@type': 'FAQPage',
      mainEntity: home.faq.items.map((q) => ({ '@type': 'Question', name: q.question, acceptedAnswer: { '@type': 'Answer', text: q.answer } })),
    },
  ];
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

export function renderHead(ctx) {
  const { site, base } = ctx;
  const url = `${site.url}/`;
  return `
    <title>${esc(site.seo.title)}</title>
    <meta name="description" content="${esc(site.seo.description)}" />
    <link rel="canonical" href="${esc(url)}" />
    <meta name="theme-color" content="${esc(site.seo.themeColor)}" />
    <link rel="icon" type="image/png" href="${base}favicon.png" />
    <link rel="apple-touch-icon" href="${base}apple-touch-icon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(site.name)}" />
    <meta property="og:title" content="${esc(site.seo.title)}" />
    <meta property="og:description" content="${esc(site.seo.description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:locale" content="en_CA" />
    <meta property="og:image" content="${esc(site.url)}/og-image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="geo.region" content="${esc(site.location.countryCode)}-${esc(site.location.regionCode)}" />
    <meta name="geo.placename" content="${esc(site.location.locality)}, ${esc(site.location.area)}" />
    <script type="application/ld+json">${structuredData(ctx)}</script>`;
}

export function renderLlmsTxt({ site, home, products }) {
  return `# ${site.name}

> ${site.tagline} ${site.description}

- Website: ${site.url}/
- Location: ${site.location.display}
- Contact: ${site.email}
- How to buy: ${home.products.note}

## What we make
${home.services.items.map((s) => `- ${s.title}: ${s.text}`).join('\n')}

## Products
${products.map((p) => `- ${p.title} (${p.category}, ${p.price} CAD): ${p.description}`).join('\n')}

## ${home.cubby.title}
${home.cubby.body.join(' ')}

## Frequently asked questions
${home.faq.items.map((q) => `### ${q.question}\n${q.answer}`).join('\n\n')}
`;
}

export function render404({ site, base = '/', cssHref }) {
  const n = site.notFound;
  return `<!doctype html>
<html lang="en-CA">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>${esc(n.title)} | ${esc(site.name)}</title>
    <link rel="icon" type="image/png" href="${base}favicon.png" />
    ${cssHref ? `<link rel="stylesheet" href="${esc(cssHref)}" />` : ''}
  </head>
  <body>
    <main class="wrap grid min-h-dvh place-items-center py-16 text-center">
      <div class="max-w-md">
        <p class="font-display text-7xl font-semibold text-brand">404</p>
        <h1 class="mt-4 text-3xl">${esc(n.title)}</h1>
        <p class="mt-3 text-ink-muted">${esc(n.body)}</p>
        <a class="btn btn-primary mt-8" href="${base}">${esc(n.linkLabel)}</a>
      </div>
    </main>
  </body>
</html>`;
}
