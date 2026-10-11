# KuhyaKuya Product Hub

Static product showcase and documentation site for the planned `product.kuhyakuya.com`.

## Features
- Hybrid product landing page, product details, and searchable documentation
- EZ Guys Complete overview (RCP Library, Align, Distribute, Sequence Fit)
- Per-product media controls, responsive dark KuhyaKuya design
- No backend or build tools required

## Configure a product

Edit `products.json`. Each product has independent media settings:

```json
"media": {
  "mode": "video",
  "youtubeId": "YOUR_11_CHARACTER_VIDEO_ID",
  "screenshots": ["assets/screenshot-1.webp"]
}
```

- `mode: "none"` displays the placeholder
- `mode: "screenshots"` shows images only
- `mode: "video"` or `"both"` shows the YouTube demo (if a valid video ID is supplied) and any screenshots

The YouTube player loads only after a user clicks Play. Add screenshot image files to the paths you specify. Product data is separated from layout for eventual migration to a dynamic API.

## Local preview

From the repository folder, run `python -m http.server 8000`, then visit http://localhost:8000. A local HTTP server is recommended because browsers restrict JSON loading from `file://`.

## Deployment

Enable GitHub Pages in repository Settings → Pages, deploy from the `main` branch root, and configure the custom domain `product.kuhyakuya.com`. Set the Cloudflare CNAME according to GitHub Pages instructions. The code is committed, but publication and DNS/HTTPS setup must be confirmed separately.

## Release status

This is a development preview, not a public release. Feature summaries were based on the EZ Guys source under Google Drive / `Test-g9sobc`, which was not modified. The manifest indicates Premiere Pro 25.6.0 as minimum host version. Randomize Clips, public pricing, standalone editions, and purchase links are not yet documented as released features.
