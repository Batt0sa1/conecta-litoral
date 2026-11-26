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

**Page composition** (`src/pages/index.astro`): imports and stacks all section components in order. Each section is its own self-contained `.astro` file under `src/components/`. No shared state between components.

**Guía del Litoral**: categories live in `src/data/categorias.ts` (shared by the site, `/admin` and the API). `Guia.astro` renders "Próximamente" example cards at build time, then fetches `/api/avisos` in the browser and replaces them with the real listings if there are any.

**Guía API** (`functions/api/`, shared code in `server/guia.ts`):
- Storage is Cloudflare KV (binding `GUIA`): key `avisos` holds the full JSON list; `foto:<uuid>` holds each photo's bytes (metadata `tipo`). R2 and D1 are not enabled on the account.
- Public: `GET /api/avisos` (published only), `GET /api/fotos/:id`.
- Admin (`/api/admin/*`, guarded by `_middleware.ts`): login/logout/sesion, CRUD on avisos, `POST /api/admin/fotos` (raw image body). Session = HMAC-signed cookie keyed by the `ADMIN_PASSWORD` secret (changing the password logs everyone out). Writes require the `X-Requested-With: panel` header.
- The panel resizes photos to 1600px JPEG in the browser before upload (max 8 per listing, 3 MB each).
- Local test: `npx astro build --base / && npx wrangler pages dev dist --kv GUIA --binding ADMIN_PASSWORD=test`.

**Layout** (`src/layouts/Layout.astro`): wraps the page with `<html>`, SEO meta tags and Google Fonts. Pass `noindex` to keep a page out of search engines.

## Tailwind Tokens

| Token | Value | Usage |
|---|---|---|
| `text-primary` / `bg-primary` | `#7B4FC4` (lila) | Headings, primary buttons |
| `text-azul` / `bg-azul` | `#1F5FBF` (blue) | Subheadings, body links, button hover |
| `text-secondary` / `bg-secondary` | `#00A8C6` (celeste) | Icons, checkmarks, accents |
| `text-cta` / `bg-cta` | `#F5C400` (gold) | Unused: the foundation asked for white backgrounds with celeste, blue and lila only |
| `font-heading` | Poppins 600/700 | Headings, labels, button text |
| `font-body` | Inter 400/500 | Body copy, descriptions |

## Form Submission Pattern

The "Publica tu aviso" form in the Guía uses the same no-backend pattern: on `submit`, serialize `FormData` into a WhatsApp message string and open `https://wa.me/56927698014?text=...` in a new tab. The foundation handles requests over WhatsApp and then publishes them from `/admin`. The contact form posts to Formspree (`PUBLIC_FORMSPREE_CONTACTO`). The Ley 19.628 consent checkbox is `required` on both forms.

## Assets

Images live in `public/images/`. The filenames are:
- `logo.png` — primary logo (also used as favicon and OG image)
- `imagen-que-muestra-beneficios.webp`, `flayer-de-membresia-fundador.webp` — old membership graphics (unused since the Membresías section was removed)
- `persona-hablando-en-charla.webp`, `foto-de-fundadores.webp`, `foto-grupal-de-todos-los-fundadores.webp` — gallery photos

## Deployment

**Primary:** Cloudflare Pages project `conecta-litoral`, connected to GitHub: every push to `main` deploys to `https://conecta-litoral.pages.dev`, other branches get preview URLs. Build command `npx astro build --base /`, output `dist`. Bindings: KV `GUIA` (`conecta-litoral-guia` in production, `conecta-litoral-guia-preview` in previews) and secret `ADMIN_PASSWORD`. Custom domain `conectalitoral.cl` is not connected yet. The old direct-upload project `conectalitoral` is unused.

**GitHub Pages** (`.github/workflows/deploy.yml`) still builds with `base: '/conecta-litoral/'` from `astro.config.mjs`; it serves the static site only (no API, so the Guía shows example cards and `/admin` does not work).

**Self-hosted fallback:** `nginx.conf` at repo root serves `dist/` from `/var/www/conecta-litoral/dist` with 1-year cache headers for static assets.
