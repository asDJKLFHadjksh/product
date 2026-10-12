# KuhyaKuya Product Hub

Static product directory and product-scoped documentation for `product.kuhyakuya.com`.

## Site structure

- `/` — product directory
- `/ez-guys-pr/` — EZ Guys product detail
- `/ez-guys-pr/docs/` — EZ Guys documentation
- `/ez-guys-pr/changelog/` — release history, with an explicit empty state until verified entries exist

The checked-in route folders make direct URLs and refreshes work on GitHub Pages. `404.html` redirects unknown clean URLs through the root application so future product routes can still be resolved from `products.json`. Browser Back/Forward navigation is supported, including documentation topics stored in `?topic=`.

## Product data

Edit `products.json` to add or update products. Product content is independent from the view code. Do not add unverified prices, release dates, compatibility claims, or branding assets.

`product-schema.json` is the machine-readable contract intended for future dashboard validation.

Products use a general, dashboard-friendly schema. Product category, metadata, sections, documentation, media, changelog, and version are independent and optional where appropriate:

```json
{
  "id": "product-slug",
  "name": "Product name",
  "category": "Application",
  "subtitle": "Short positioning line",
  "description": "Product description",
  "status": "Available",
  "version": "1.2.0",
  "primaryAction": {
    "label": "Access product",
    "url": "https://example.com/product"
  },
  "metadata": [
    { "label": "Platform", "value": "Windows" },
    { "label": "License", "value": "Commercial" }
  ],
  "sections": [
    {
      "id": "highlights",
      "type": "item-list",
      "eyebrow": "Highlights",
      "title": "What is included",
      "description": "Optional section description.",
      "items": [
        { "title": "Feature name", "description": "Feature description." }
      ]
    }
  ],
  "documentation": {
    "description": "Guides and supporting information.",
    "topics": []
  },
  "changelog": []
}
```

- `version` is optional. Omit it or use an empty string when a product has no meaningful version; the website will not render a version row.
- `primaryAction` is optional. When present, it renders the main product-access button; updating its URL is enough to move from a placeholder to a marketplace or download page.
- Product-access links outside `kuhyakuya.com` and its subdomains open a confirmation dialog that identifies the destination and explains that the third-party website is outside KuhyaKuya’s control.
- `metadata` accepts any label/value pairs, so product types are not restricted to plugin-specific fields.
- `sections` are rendered by their `type`. The current schema supports `item-list` and `content` sections.
- `documentation`, `media`, and `changelog` may be omitted when a product does not use them.

One optional demo video is configured per product:

```json
"media": {
  "demoVideo": {
    "youtubeId": "YOUR_11_CHARACTER_VIDEO_ID",
    "title": "Product demo"
  }
}
```

Leave `youtubeId` empty to hide the demo section. The current value is a temporary video used by Google's YouTube IFrame API documentation and must be replaced before release. When present, the YouTube player and its thumbnail are displayed immediately without autoplay.

Optional screenshots are configured on any documentation topic:

```json
"screenshots": [
  {
    "src": "assets/screenshots/align-main.webp",
    "alt": "Align controls in the EZ Guys panel",
    "caption": "The six alignment controls and offset field."
  }
]
```

`src` is required for an image to appear; `alt` and `caption` are supported for context. A simple path string is also accepted. Leave `screenshots` empty or omit it to hide the screenshot section for that topic. Files ending in `-placeholder.svg` are temporary preview assets and must be replaced before release.

## Add another clean product route

Adding an item to `products.json` automatically adds it to the directory and makes its route renderable through the GitHub Pages fallback. For a first-class static direct route, copy the small route shell used by `ez-guys-pr/index.html` into `<product-id>/index.html`; all content still comes from `products.json`.

## Local preview

Run a static server from the repository root, for example:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`. An HTTP server is required because the browser loads `products.json` with `fetch`.

## Brand and release notes

- The UI uses the requested `#151519` background and `#8B5CF6` accent.
- Typography follows the main KuhyaKuya website with the `Arial, Helvetica, "Liberation Sans"` system-font stack and does not require a third-party font request.
- No generated, initial-based, or geometric pseudo-logo is included. KuhyaKuya and product names remain plain text until approved logo assets are supplied.
- EZ Guys remains marked `In development`.
- No changelog entries, pricing, purchase link, public installer, approved screenshots, or demo video are currently published.
