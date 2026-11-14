# Images

Drop photos here and reference them by filename in the JSON files in `src/content/`.
Thumbnails and all responsive sizes are generated for you. Never resize or crop by hand.

| Folder | Used for | Referenced in |
| --- | --- | --- |
| `products/` | Product photos | `products.json` → `"image": "my-photo.jpg"` |
| `brand/` | Logos, Cubby artwork | `site.json`, `home.json` → `"brand/logo-circle.webp"` |

## Photo specs

| | Product photos | Hero photo | Logo |
| --- | --- | --- | --- |
| Format | JPG (PNG or WebP also fine) | JPG | PNG or WebP |
| Shape | **4:5 portrait** | 4:5 portrait | Square |
| Ideal size | **2000 × 2500 px** | 2000 × 2500 px | 1000 × 1000 px |
| Minimum size | 1200 × 1500 px | 1600 px wide | 400 × 400 px |
| File size | Under 3 MB | Under 3 MB | Under 500 KB |

- Product cards are cropped to 4:5 from the **centre**, so keep the subject in the middle. Photos straight off a phone (3:4) work well; a little is trimmed from the top and bottom.
- The pop-up view shows the whole, uncropped photo.
- Name files in lowercase with hyphens and no spaces: `dinosaur-play-box.jpg`.
- Always write an `imageAlt` in the JSON describing the photo for people who can't see it.

## What gets generated

For each photo: 200, 400, 800, 1200 and 1600 px wide versions (never larger than the original), in AVIF and WebP.
For each product photo: 400 and 800 px wide 4:5 thumbnails as well.
The favicon comes from the logo in `site.json`, and the social share image from `seo.ogImage`.
