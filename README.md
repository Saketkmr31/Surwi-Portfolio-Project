# Surwi — Interactive 3D Cube Portrait Portfolios

Two responsive portfolio experiences share a custom Three.js instanced-cube portrait engine:

- `/corporate/` — Rupa Kumari's professional Guest Relations / Facility Operations portfolio.
- `/creator/` — SurwiOfficial's fashion, lifestyle and creator portfolio.
- `/` — portfolio selector.

## Tech

Next.js 14, React 18, TypeScript, Three.js and React Three Fiber. The portrait samples a local image into a grid of coloured cubes. Cubes lift on hover/tap, the portrait responds to pointer movement, and mobile devices use a lower-density grid and lower device pixel ratio. The site includes reduced-motion CSS and touch-friendly responsive layouts.

## Run locally

Requires Node.js 18.17+ (Node 20 LTS recommended).

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Production static build:

```bash
npm run build
```

The exported static site is written to `out/`.

## Contact form setup (required before public launch)

The forms are intentionally not wired to a personal inbox by default. This prevents messages being silently lost and avoids embedding private credentials in the code.

1. Create a free account at https://formspree.io/ and create a form.
2. Copy its form endpoint.
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/YOUR_FORM_ID`.
4. Rebuild and deploy. Test the form on the deployed URL and verify the confirmation email in the form provider.

Without this setting, the form displays a clear configuration message and does not pretend the message was sent.

## Free hosting

### Vercel (recommended)

1. Create a GitHub repository and upload this project.
2. Import the repository at https://vercel.com/.
3. Add `NEXT_PUBLIC_FORMSPREE_ENDPOINT` under Project Settings → Environment Variables.
4. Deploy. Vercel will build the Next.js project. If using the static export setting in `next.config.mjs`, the `out/` folder is the deployable static output; Vercel can serve it as a static site. Alternatively, remove `output: 'export'` if you prefer Vercel's standard Next.js deployment mode.
5. Test `/corporate/`, `/creator/`, mobile layout, and contact form.

### Netlify static deploy

1. Build using `npm run build`.
2. Set publish directory to `out`.
3. Set the `NEXT_PUBLIC_FORMSPREE_ENDPOINT` environment variable before building.

## Personalization before publishing

- The Instagram profile metrics shown are copied from the screenshot supplied and are marked as time-sensitive.
- Individual Reel URLs were not supplied, so the creator site links to the Instagram profile and uses content-pillar cards rather than inventing specific Reel URLs.
- Replace the portrait crops in `public/images/` if you want a higher-resolution face crop. Keep the same filenames or update the page props.
- Contact details from the resume are not displayed publicly; both sites use a contact form.
- Review all profile text and obtain consent from the person represented before making the pages public.

## Performance notes

The cube grid is deliberately capped (48×60 desktop, 32×40 mobile) and uses instancing rather than one React component per cube. Validate on target Android/iOS devices before launch. 3D performance varies by device; the project aims for smooth interaction but does not guarantee 60 FPS on every device.
