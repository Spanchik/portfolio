# Portfolio — Ілля Соколовський

Single-page portfolio: AI solutions and business process automation.
Ukrainian (`/uk`, default) and English (`/en`).

## Stack

- Next.js 16 (App Router, static generation), React 19, TypeScript
- Tailwind CSS v4 (tokens in `src/app/globals.css`)
- three.js — pinned 3D scroll story on the first screen (lazy-loaded chunk)
- motion — reveal animations and UI mock-ups; React `<ViewTransition>` for the language switch

## Commands

```bash
npm run dev      # http://localhost:3000 (redirects to /uk)
npm run build    # static build of /uk and /en
npm run lint
```

## Configuration

`NEXT_PUBLIC_SITE_URL` — public origin, e.g. `https://example.com`.

- Not set: canonical, hreflang, `og:url`, `og:image` and sitemap entries are omitted.
- Set in production: must be `https` and not a local host, otherwise the build fails.

Personal data (name, e-mail, Telegram, GitHub, portrait) lives in `src/lib/site.ts`.

## Structure

```
src/app/[lang]/          root layout, page, og.png route (link preview per locale)
src/app/                 globals.css, icon.svg, robots.ts, sitemap.ts
src/components/layout/   TopBar, LangSwitch, Footer
src/components/sections/
  story/                 3D scroll story (Story.tsx + lazy scene.ts)
  hero/                  SVG isometric fallback (no WebGL) and shared hooks
  about/  cases/  contact/
src/lib/i18n/            locales and dictionaries (uk is the source of truth for keys)
```

## Notes

- All data inside the case-study mock-ups (names, numbers) is fictional.
- `refs/` and `public/_concepts/` are local working material and are git-ignored.
