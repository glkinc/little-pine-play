# Little Pine Play website

A static showcase site built with Vite, Tailwind CSS and Motion, hosted on GitHub Pages at littlepineplay.com.

## Run it

```bash
npm install
npm run dev      # local preview at http://localhost:5173
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Editing the site (no code needed)

Everything you see on the site comes from three files in `src/content/`:

| File | What it controls |
| --- | --- |
| `products.json` | The product grid |
| `home.json` | Hero, values, services, Cubby section, FAQ, call-to-action band |
| `site.json` | Business name, **contact email**, location, menu, contact pop-up text, button labels, SEO title/description, footer |

Save a file while `npm run dev` is running and the page refreshes.

### Products

`products.json` is a list. **The order of the list is the order on the page.**

```json
{
  "id": "dinosaur-play-box",
  "title": "Dinosaur Valley Play Box",
  "category": "Play Boxes",
  "price": "$28",
  "badge": "New",
  "summary": "One short sentence shown on the card.",
  "description": "The longer description shown in the pop-up.",
  "details": ["Ages 3+", "2 peg dolls"],
  "image": "dinosaur-play-box.jpg",
  "imageAlt": "Describe the photo for people who can't see it"
}
```

- **Add**: put the photo in `src/images/products/`, then copy a block like the one above into the list.
- **Re-order**: move the block up or down in the list.
- **Delete**: remove the block (or add `"hidden": true` to hide it temporarily).
- `id` must be unique, lowercase, with hyphens. `badge` and `details` are optional.
- `category` creates the filter buttons automatically. A new category name makes a new button.
- Keep a comma between blocks, and none after the last one.

### Images

See [src/images/README.md](src/images/README.md) for sizes. Short version: **4:5 portrait, 2000 × 2500 px, JPG, subject centred**. Thumbnails are generated automatically.

### Contact email

Change `"email"` in `site.json`. It updates the contact pop-up, footer and search-engine data.

## Design system

`src/styles/tokens.css` holds the colour tokens in three layers:

1. **Primitive** (`--p-*`): the raw palette (pine, plum, peach, mustard, cream, stone).
2. **Semantic** (`--s-*`): what a colour is for (canvas, ink, brand, accent, focus). Re-theme here.
3. **Component** (`--c-*`): button, card, chip, badge, modal, header, footer.

Semantic tokens are exposed to Tailwind (`bg-canvas`, `text-ink-muted`, `bg-brand`…). Spacing uses Tailwind's scale.
Fonts: Fredoka (headings) and Nunito (body), self-hosted.

## How it works

- `src/js/templates.js`: the HTML for every section.
- `vite-plugins/render-content.js`: renders the JSON into `index.html` at build time, generates images, and writes `sitemap.xml`, `robots.txt`, `llms.txt`, `404.html`, the favicon and share image.
- `src/js/`: modals, product filter, mobile menu and animations.
- `public/CNAME`: the custom domain for GitHub Pages.

## Deploying (GitHub Pages)

Pushing to `main` builds and publishes the site via `.github/workflows/deploy.yml`.
For now it lives at https://glkinc.github.io/little-pine-play/ (repo Settings → Pages → Source: **GitHub Actions**).

### Switching to littlepineplay.com later
1. In `.github/workflows/deploy.yml`, delete the `BASE_PATH` and `SITE_URL` lines (and their comment).
2. Create `public/CNAME` containing `littlepineplay.com`.
3. Update `"url"` in `src/content/site.json` if the domain changes.
4. At your registrar, add four `A` records for `@` (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153) and a `CNAME` for `www` pointing to `glkinc.github.io`.
5. Repo Settings → Pages → set the custom domain and tick **Enforce HTTPS**.
