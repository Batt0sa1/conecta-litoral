# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server on http://localhost:4321
npm run build     # Build to dist/
npm run preview   # Preview production build locally
npm run deploy    # Push dist/ to gh-pages branch (rarely used; Netlify is primary)
```

No test suite is configured. `playwright` is installed but has no test files or scripts yet.

## Architecture

Astro static site (`output: 'static'`) plus Cloudflare Pages Functions (`functions/`) for the Guía del Litoral API. Pages: `/` (landing) and `/admin` (Guía admin panel, `noindex`).

**Page composition** (`src/pages/index.astro`): Carrusel → Categorias → Guia → Fundacion → Asesorias → Galeria → Contacto. Each section is its own `.astro` file under `src/components/`. `Fundacion.astro` shows `QuienesSomos`, `QueHacemos`, `Pilares` and `Valores` as tabs (those four render panel content only, no `<section>`); `#quienes-somos`, `#que-hacemos`, `#pilares`, `#valores` open their tab. `Categorias.astro` (big icon buttons under the carousel) filters the Guía by clicking the matching `.guia-filtro` chip. Carousel: default slides live in `src/data/carrusel.ts` (photos in `public/images/carrusel/`, ≤1400px WebP) and are rendered at build time; on load the page calls `GET /api/carrusel` and, if the panel saved a custom carousel (KV key `carrusel`), swaps them in. Photos are shown whole (`object-contain`) over a blurred copy of themselves, so vertical photos and posters with text are never cropped; a slide without `titulo` shows only the image. Only the visible slide and the next one get a `src`.

**Guía del Litoral**: categories live in `src/data/categorias.ts` (shared by the site, `/admin` and the API). `Guia.astro` renders "Próximamente" example cards at build time, then fetches `/api/avisos` in the browser (only once the section is within ~800px of the viewport) and puts the real listings first; the example card is kept only for categories that still have no published listing. To save Functions quota (100k requests/day on the free plan, shared across the account), only each listing's cover photo gets a `src` up front; the rest load when the visitor moves through the gallery.

**Guía API** (`functions/api/`, shared code in `server/guia.ts`):
- Storage is Cloudflare KV (binding `GUIA`): key `avisos` holds the full JSON list; `foto:<uuid>` holds each photo's bytes (metadata `tipo`). R2 and D1 are not enabled on the account.
- Public: `GET /api/avisos` (published only), `GET /api/fotos/:id`.
- Each listing can have `whatsapp` (digits), `web` (http(s) URL, normalized by `normalizarWeb`) and `instagram` (bare username, normalized by `normalizarInstagram`); the Guía shows them as buttons with `rel="noopener noreferrer nofollow ugc"`.
- Carousel admin: `GET/PUT/DELETE /api/admin/carrusel` (`limpiarDiapositivas` validates: image must be `/images/carrusel/…` or `/api/fotos/<uuid>`, button link must be a `#anchor` or http(s) URL, 1–8 slides). PUT and DELETE remove uploaded photos no longer in use. The panel has an "Avisos / Carrusel de portada" switch; carousel photos are optimized to 1600px / ≤450 KB.
- Admin (`/api/admin/*`, guarded by `_middleware.ts`): login/logout/sesion, CRUD on avisos, `POST /api/admin/fotos` (raw image body). Session = HMAC-signed cookie keyed by the `ADMIN_PASSWORD` secret (changing the password logs everyone out). Writes require the `X-Requested-With: panel` header.
- Each category has its own characteristic fields (`src/data/caracteristicas.ts`: types `opciones`, `multi`, `numero`, `texto`, `si_no`; `requerido`, `destacado`). The panel builds the form from them, the API cleans them with `limpiarCaracteristicas` (unknown keys and out-of-range values are dropped, missing required fields are rejected), and the Guía shows `destacado` ones as tags and the rest under "Más detalles". Add a field by editing that file only.
- The panel optimizes photos in the browser before upload: max 1280px, WebP (JPEG fallback), quality stepped down until ≤350 KB, EXIF/GPS stripped by the canvas redraw. Max 8 per listing; the API rejects files over 3 MB.
- Local test: `npx astro build --base / && npx wrangler pages dev dist --kv GUIA --binding ADMIN_PASSWORD=test`.

**Layout** (`src/layouts/Layout.astro`): wraps the page with `<html>`, SEO meta tags and Google Fonts. Pass `noindex` to keep a page out of search engines.

## Tailwind Tokens

| Token | Value | Usage |
|---|---|---|
| `text-primary` / `bg-primary` | `#14285A` (azul marino) | Predominant color: headings, primary buttons, active tabs/filters |
| `text-lila` / `bg-lila` | `#7B4FC4` (lila) | Accents (carousel decoration, Visión card) |
| `text-azul` / `bg-azul` | `#1F5FBF` (blue) | Subheadings, body links, button hover |
| `text-secondary` / `bg-secondary` | `#00A8C6` (celeste) | Icons, checkmarks, accents |
| `text-cta` / `bg-cta` | `#F5C400` (gold) | Unused: the foundation asked for white backgrounds with celeste, blue and lila only |
| `font-heading` | Poppins 600/700 | Headings, labels, button text |
| `font-body` | Inter 400/500 | Body copy, descriptions |

## Form Submission Pattern

The "Publica tu aviso" form in the Guía uses the same no-backend pattern: on `submit`, serialize `FormData` into a WhatsApp message string and open `https://wa.me/56927698014?text=...` in a new tab. The foundation handles requests over WhatsApp and then publishes them from `/admin`. Its Ley 19.628 consent checkbox is `required`. The Contacto section has no form: it links straight to WhatsApp with a prefilled greeting.

## Assets

Images live in `public/images/`. The filenames are:
- `logo.png` — primary logo (also used as favicon and OG image)
- `imagen-que-muestra-beneficios.webp`, `flayer-de-membresia-fundador.webp` — old membership graphics (unused since the Membresías section was removed)
- `persona-hablando-en-charla.webp`, `foto-de-fundadores.webp`, `foto-grupal-de-todos-los-fundadores.webp` — gallery photos

## Deployment

**Primary:** Cloudflare Pages project `conecta-litoral`, connected to GitHub: every push to `main` deploys to `https://conecta-litoral.pages.dev`, other branches get preview URLs. Build command `npx astro build --base /`, output `dist`. Bindings: KV `GUIA` (`conecta-litoral-guia` in production, `conecta-litoral-guia-preview` in previews) and secret `ADMIN_PASSWORD`. Custom domain `conectalitoral.cl` is not connected yet. The old direct-upload project `conectalitoral` was deleted (2026-11-26).

**GitHub Pages** (`.github/workflows/deploy.yml`) still builds with `base: '/conecta-litoral/'` from `astro.config.mjs`; it serves the static site only (no API, so the Guía shows example cards and `/admin` does not work).

**Self-hosted fallback:** `nginx.conf` at repo root serves `dist/` from `/var/www/conecta-litoral/dist` with 1-year cache headers for static assets.
