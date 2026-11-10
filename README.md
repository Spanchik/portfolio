# Portfolio — Ilya Sokolovskyi

Personal site of a developer who builds websites, internal systems and AI agents for business.
One page, two languages, and a 3D scene that shows how a request travels through an automated system.

**Live:** https://portfolio-five-ashen-76.vercel.app — [Українською](https://portfolio-five-ashen-76.vercel.app/uk) · [English](https://portfolio-five-ashen-76.vercel.app/en)

## What is on the page

| Section | What it does |
|---|---|
| Hero + scroll story | A pinned three.js scene. Office "routine" objects are pulled into an AI agent, a machine of seven blocks grows out of its blueprint, and one real request is followed through it. A chat on the left shows the conversation; each message lights up its block on the right. |
| About + services | Short bio and three service cards. |
| Case studies | Four cases with headline metrics, a write-up (challenge → solution → result → stack) and an animated mock-up each. On phones the write-up folds under the mock-up. |
| FAQ | Native `<details>`, works without JavaScript. |
| Contact | A brief form and direct contacts. The form has no backend: it opens the visitor's Telegram or mail client with the message prefilled. |

## Stack

- **Next.js 16** (App Router, static generation), **React 19**, **TypeScript**
- **Tailwind CSS v4** — design tokens live in `src/app/globals.css`
- **three.js** — the scroll story, loaded as a separate chunk once the page is idle
- **Motion** — reveal animations and the case mock-ups; React `<ViewTransition>` for the language switch
- **lucide-react** for icons; no UI library and no template
- Deployed on **Vercel**

## Things worth a look

- **Scroll-driven 3D** (`src/components/sections/story/scene.ts`): everything per frame is imperative, React only provides DOM nodes. The camera keeps every block in frame and pulls back on narrower windows.
- **Fallbacks:** without WebGL an SVG isometric diagram is shown; with `prefers-reduced-motion` the scene renders its final state and the page drops its animations.
- **Phones:** no MSAA, cheaper shadows, about 30 fps, fewer objects.
- **Two locales with separate URLs** (`/uk`, `/en`), statically generated; the Ukrainian dictionary is the source of truth for keys and types.
- **SEO:** sitemap, robots, canonical and hreflang, JSON-LD `Person`, and an Open Graph image generated per locale.
- **Accessibility:** focus styles, 4.5:1 text contrast, 40px tap targets, `aria-hidden`/`inert` on story steps that are off screen.

## Run locally

```bash
npm install
```

```bash
npm run dev
```

The site opens at http://localhost:3000 and redirects to `/uk`.

```bash
npm run build
```

```bash
npm run lint
```

## Configuration

`NEXT_PUBLIC_SITE_URL` — the public origin, for example `https://example.com`. See `.env.example`.

- **Not set:** canonical, hreflang, `og:url`, `og:image` and sitemap entries are omitted.
- **Set in production:** must be `https` and not a local host, otherwise the build fails.

## Editing content

| What | Where |
|---|---|
| Name, e-mail, Telegram, GitHub, portrait | `src/lib/site.ts` |
| All page copy | `src/lib/i18n/dictionaries/uk.ts` and `en.ts` |
| Case studies and mock-up data | `src/lib/i18n/dictionaries/cases.uk.ts` and `cases.en.ts` |
| Colours and fonts | `src/app/globals.css`, `src/app/[lang]/layout.tsx` |

Each case has a `draft` flag. While it is `true`, a note under the metrics says the figures are indicative, and a note under the mock-up says the interface is an illustration.

## Structure

```
src/app/[lang]/            layout, page, og.png route (link preview per locale)
src/app/                   globals.css, icon.svg, robots.ts, sitemap.ts
src/components/layout/     TopBar, LangSwitch, Footer
src/components/sections/
  story/                   scroll story: Story.tsx (copy + chat) and scene.ts (three.js)
  hero/                    SVG fallback for the scene, shared hooks
  about/                   bio, portrait, service cards
  cases/                   case layout and four animated mock-ups
  faq/                     questions
  contact/                 brief form and direct contacts
src/lib/i18n/              locales and dictionaries
src/lib/                   site data, site URL validation
```

## Notes

- Data inside the case mock-ups (names, amounts, items) is fictional.
- The code is here to be read and learned from. The texts, the portrait and the case materials are personal — please do not reuse them.
