# portfolio-arkan

Personal portfolio site for **Arkan Mustofa** — Information Systems student in Bandung, Indonesia.
Built as a static Next.js site, deployed on Cloudflare Pages at **https://portfolio-arkan.site**

## What this is

A multi-page site (home, services, work, about, history, contact) with case-study detail
pages. Everything on it comes from real sources: the CV (`public/arkan-mustofa-cv.pdf`)
and public GitHub repos. No invented metrics, no placeholder screenshots.

## Stack

- **Next.js 16** (App Router) with `output: "export"` → fully static HTML
- **React 19**, **TypeScript**
- **Tailwind v4** plus a hand-written stylesheet for the layout system
- No runtime dependencies, no server, no database

## Why static

The site has no API routes, no forms that post to a server, and no per-request data.
Static export gives the fastest load, zero server cost, and nothing to maintain.

Because of that, all navigation uses plain `<a>` tags. Next.js client-side navigation
needs RSC payload files that static export writes under different names, which produced
404s on every internal link — plain anchors are the correct choice here.

## Motion

Animation is written from scratch (no animation libraries) and follows one hard rule:

> Parallax may only move things that are **guaranteed to be clipped by their own box**:
> `background-position`, or the contents of a frame that already has `overflow: hidden`.

Moving layout elements freely is what caused content to visibly tear and clip on scroll
in earlier iterations. The current engine (`components/ui/motion.tsx`) handles:

| Mechanism | Trigger | What moves |
| --- | --- | --- |
| Reveal | `[data-fx]` | opacity + 22px translate |
| Background parallax | `[data-bg="0.16"]` | `background-position-y` |
| In-frame parallax | `[data-inner="0.055"]` | image inside its own clipped frame |
| Horizontal drag | `[data-x="0.35"]` | a row inside an `overflow: hidden` track |

Everything is disabled under `prefers-reduced-motion`, and positions are re-measured after
fonts and images finish loading (stale measurements were a source of bugs).

## Verification

Design claims are checked by measurement, not by eye. The scripts in `scripts/` drive a real
browser and assert on computed styles, geometry, and contrast:

```bash
npm run build
npx serve out            # or any static server
PF_BASE=http://localhost:3000 npm run verify:quote
```

| Script | What it proves |
| --- | --- |
| `verify:quote` | headline wraps into 2 balanced lines at 10 viewport widths |
| `verify:band` | CTA band text/button contrast ≥4.5:1 in **both** themes |
| `verify:cards` | service cards keep identical padding and content across pages |
| `verify:responsive` | 88 page × viewport combinations: no overflow, no orphans, 44px touch targets |
| `verify:parallax` | parallax values actually change on scroll, and framerate stays ~16.6ms |
| `verify:overflow` | zero horizontal scroll across 5 viewports |
| `verify:rebuild` | clipping, spacing, photo coverage, language, theme toggle |
| `verify:rapi` | spacing scale, radius, grid alignment, nesting |
| `verify:final` | navigation, pages, forms, reduced-motion behaviour |

The scripts found real defects that were invisible by inspection — a heading collapsing to a
271px column, headline words rendering with no spaces, images covered by a 50%-opacity glare
layer, and `contain: paint` clipping parallax layers.

## Running locally

```bash
npm install
npm run dev      # http://localhost:4321
```

## Deploying

Cloudflare Pages builds from this repo:

- Build command: `npm run build`
- Output directory: `out`
- Node version: 20 or newer
