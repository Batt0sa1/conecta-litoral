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

Single-page Astro static site (`output: 'static'`). All content renders at build time — no SSR, no API routes.

**Page composition** (`src/pages/index.astro`): imports and stacks all section components in order. Each section is its own self-contained `.astro` file under `src/components/`. No shared state between components.

**Layout** (`src/layouts/Layout.astro`): wraps the page with `<html>`, SEO meta tags, Google Fonts, and a JSON-LD Organization schema. The `--color-primary` CSS variable is defined here (currently `72 61 139` — a medium purple, distinct from the `#5B2D8E` brand value in the parent CLAUDE.md spec).

## Tailwind Tokens

| Token | Value | Usage |
|---|---|---|
| `text-primary` / `bg-primary` | CSS var `--color-primary` | Headings, navbar, dark backgrounds |
| `text-secondary` / `bg-secondary` | `#00B4C6` (teal) | Checkmarks, links, accents |
| `text-cta` / `bg-cta` | `#F5C400` (gold) | CTA buttons and price highlights only |
| `font-heading` | Poppins 600/700 | Headings, labels, button text |
| `font-body` | Inter 400/500 | Body copy, descriptions |

## Form Submission Pattern

Both forms (membership and contact) use the same no-backend pattern: on `submit`, serialize `FormData` into a WhatsApp message string and open `https://wa.me/56927698014?text=...` in a new tab. There is no email handler or server. The Ley 19.628 consent checkbox is `required` on both forms.

When adding a third-party payment provider (Flow/Webpay), add it as a new payment step *after* the WhatsApp confirmation — do not replace the WhatsApp flow until the foundation confirms the switch.

## Assets

Images live in `public/images/`. The filenames are:
- `logo.png` — primary logo (also used as favicon and OG image)
- `imagen-que-muestra-beneficios.webp`, `flayer-de-membresia-fundador.webp` — membership graphics
- `persona-hablando-en-charla.webp`, `foto-de-fundadores.webp`, `foto-grupal-de-todos-los-fundadores.webp` — gallery photos

## Deployment

**Primary:** Netlify auto-deploys from `main`. The site URL is `https://glittery-tanuki-095b9c.netlify.app` (temporary; update in `astro.config.mjs` and `Layout.astro` canonical/OG tags when the custom domain is set).

**Self-hosted fallback:** `nginx.conf` at repo root serves `dist/` from `/var/www/conecta-litoral/dist` with 1-year cache headers for static assets.
