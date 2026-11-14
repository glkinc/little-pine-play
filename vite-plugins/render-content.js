// Little Pine Play content plugin.
//
// 1. Reads src/content/*.json and renders the whole page to static HTML
//    (so search engines and AI crawlers see everything without running JS).
// 2. Generates responsive images + 4:5 product thumbnails from src/images/
//    with sharp (AVIF + WebP), plus the favicon and social share image.
// 3. Emits sitemap.xml, robots.txt, llms.txt and 404.html.
//
// Owners never need to touch this file: edit the JSON and drop images in.

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { renderBody, renderHead, renderLlmsTxt, render404 } from '../src/js/templates.js';

const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i;
const FULL_WIDTHS = [200, 400, 800, 1200, 1600];
const THUMB_WIDTHS = [400, 800];
const THUMB_RATIO = 5 / 4; // height / width
const FORMATS = { avif: { quality: 55 }, webp: { quality: 78 } };
const MIME = { '.avif': 'image/avif', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };

export default function renderContent() {
  let root;
  let base = '/';
  let contentDir;
  let imagesDir;
  let cacheDir;
  let manifest = {};
  let generated = []; // paths relative to cacheDir
  let pending = null;

  const readJson = (name) => JSON.parse(fs.readFileSync(path.join(contentDir, name), 'utf8'));

  const loadContent = () => {
    const site = readJson('site.json');
    site.url = (process.env.SITE_URL || site.url).replace(/\/$/, '');
    const home = readJson('home.json');
    const products = readJson('products.json').filter((p) => !p.hidden);
    return { site, home, products };
  };

  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return IMAGE_EXT.test(entry.name) ? [full] : [];
    });

  const isFresh = (out, srcMtime) => fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcMtime;

  async function write(rel, srcMtime, make) {
    const out = path.join(cacheDir, rel);
    generated.push(rel);
    if (isFresh(out, srcMtime)) return;
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await make().toFile(out);
  }

  async function buildImages() {
    const { site } = loadContent();
    manifest = {};
    generated = [];
    const jobs = [];

    for (const file of walk(imagesDir)) {
      const key = path.relative(imagesDir, file).split(path.sep).join('/');
      const stem = key.replace(/\.[^.]+$/, '');
      const srcMtime = fs.statSync(file).mtimeMs;
      const meta = await sharp(file).metadata();
      const rotated = (meta.orientation || 1) >= 5;
      const width = rotated ? meta.height : meta.width;
      const height = rotated ? meta.width : meta.height;

      let full = FULL_WIDTHS.filter((w) => w <= width);
      if (!full.length) full = [width];
      const isProduct = key.startsWith('products/');
      const thumb = isProduct ? THUMB_WIDTHS.filter((w) => w <= width) : [];
      if (isProduct && !thumb.length) thumb.push(width);
      manifest[key] = { width, height, full, thumb };

      for (const [format, options] of Object.entries(FORMATS)) {
        for (const w of full) {
          jobs.push(write(`img/${stem}-${w}.${format}`, srcMtime, () => sharp(file).rotate().resize({ width: w }).toFormat(format, options)));
        }
        for (const w of thumb) {
          jobs.push(
            write(`img/${stem}-thumb-${w}.${format}`, srcMtime, () =>
              sharp(file)
                .rotate()
                .resize({ width: w, height: Math.round(w * THUMB_RATIO), fit: 'cover', position: 'centre' })
                .toFormat(format, options),
            ),
          );
        }
      }
    }

    // Favicon + touch icon from the logo (trimmed to the logo's circle).
    const logo = path.join(imagesDir, site.logo);
    if (fs.existsSync(logo)) {
      const m = manifest[site.logo];
      const side = Math.round(Math.min(m.width, m.height) * 0.78);
      const region = { left: Math.round((m.width - side) / 2), top: Math.round((m.height - side) / 2), width: side, height: side };
      const mtime = fs.statSync(logo).mtimeMs;
      jobs.push(write('favicon.png', mtime, () => sharp(logo).extract(region).resize(64, 64).png()));
      jobs.push(write('apple-touch-icon.png', mtime, () => sharp(logo).extract(region).resize(180, 180).flatten({ background: '#ffffff' }).png()));
    }

    // Social share image.
    const og = path.join(imagesDir, site.seo.ogImage);
    if (fs.existsSync(og)) {
      jobs.push(
        write('og-image.jpg', fs.statSync(og).mtimeMs, () => sharp(og).rotate().resize({ width: 1200, height: 630, fit: 'cover', position: 'centre' }).jpeg({ quality: 82 })),
      );
    }

    await Promise.all(jobs);
  }

  const ensureImages = () => (pending ??= buildImages());

  // Builds a <picture> for an image key such as "products/space-play-box.jpg".
  function img(key, { variant = 'full', sizes = '100vw', alt = '', eager = false, imgCls = '' } = {}) {
    const entry = manifest[key];
    if (!entry) {
      console.warn(`\n[little-pine] Image not found: src/images/${key} (check the filename in your JSON)`);
      return '';
    }
    const useThumb = variant === 'thumb' && entry.thumb.length;
    const widths = useThumb ? entry.thumb : entry.full;
    const stem = key.replace(/\.[^.]+$/, '');
    const url = (w, format) => encodeURI(`${base}img/${stem}${useThumb ? '-thumb' : ''}-${w}.${format}`);
    const srcset = (format) => widths.map((w) => `${url(w, format)} ${w}w`).join(', ');
    const largest = widths.at(-1);
    const height = useThumb ? Math.round(largest * THUMB_RATIO) : Math.round((largest * entry.height) / entry.width);
    const fallback = widths.find((w) => w >= 800) ?? largest;
    const escAttr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    return `<picture><source type="image/avif" srcset="${srcset('avif')}" sizes="${sizes}" /><source type="image/webp" srcset="${srcset('webp')}" sizes="${sizes}" /><img src="${url(fallback, 'webp')}" alt="${escAttr(alt)}" width="${largest}" height="${height}" class="${imgCls}" ${
      eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'
    } /></picture>`;
  }
  img.url = (key) => {
    const entry = manifest[key];
    if (!entry) return '';
    const w = entry.full.find((x) => x >= 1200) ?? entry.full.at(-1);
    return encodeURI(`/img/${key.replace(/\.[^.]+$/, '')}-${w}.webp`);
  };

  return {
    name: 'little-pine-content',

    configResolved(config) {
      root = config.root;
      base = config.base.endsWith('/') ? config.base : `${config.base}/`;
      contentDir = path.join(root, 'src/content');
      imagesDir = path.join(root, 'src/images');
      cacheDir = path.join(root, 'node_modules/.cache/little-pine');
    },

    configureServer(server) {
      server.watcher.add([contentDir, imagesDir]);
      const onChange = (file) => {
        if (!file.startsWith(contentDir) && !file.startsWith(imagesDir)) return;
        pending = null;
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', onChange).on('change', onChange).on('unlink', onChange);

      server.middlewares.use(async (req, res, next) => {
        const url = decodeURIComponent((req.url || '').split('?')[0]);
        const isGenerated = url.startsWith('/img/') || ['/favicon.png', '/apple-touch-icon.png', '/og-image.jpg'].includes(url);
        if (!isGenerated) return next();
        try {
          await ensureImages();
          const file = path.normalize(path.join(cacheDir, url));
          if (!file.startsWith(cacheDir) || !fs.existsSync(file)) return next();
          res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream');
          res.setHeader('Cache-Control', 'no-cache');
          fs.createReadStream(file).pipe(res);
        } catch (error) {
          next(error);
        }
      });
    },

    transformIndexHtml: {
      order: 'post',
      async handler(html) {
        await ensureImages();
        const ctx = { ...loadContent(), img, base };
        return html.replace('<!--lp:head-->', renderHead(ctx)).replace('<!--lp:body-->', renderBody(ctx));
      },
    },

    async generateBundle(_options, bundle) {
      await ensureImages();
      const content = loadContent();
      const { site } = content;

      for (const rel of generated) {
        this.emitFile({ type: 'asset', fileName: rel, source: fs.readFileSync(path.join(cacheDir, rel)) });
      }

      const today = new Date().toISOString().slice(0, 10);
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${site.url}/</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n</urlset>\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`,
      });
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: renderLlmsTxt(content) });

      const css = Object.values(bundle).find((file) => file.fileName.endsWith('.css'));
      this.emitFile({ type: 'asset', fileName: '404.html', source: render404({ site, base, cssHref: css ? `${base}${css.fileName}` : '' }) });
    },
  };
}
