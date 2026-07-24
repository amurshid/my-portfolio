# my-portfolio

My portfolio site. 3,200 particles on a canvas morph from a portrait into a shape for each project as you scroll.

Built with Next.js and a plain 2D canvas.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm test
npm run lint
```

The images and resume in `public/` aren't checked in, so they need to be added before running.

## Structure

```
app/
  lib/particles/        particle engine (no React)
    config.ts           tuning constants
    engine.ts           render loop
    sampling.ts         image pixels -> particle positions
    shapes.ts           shapes drawn in code, shown until images load
    math.ts             lerp, easing, seeded random
    types.ts
  content/projects.ts   project text, links and images
  components/           page UI
  hooks/                nav dot scroll animation
```

## How it works

Each formation is drawn into a 400x400 offscreen canvas, either from an image or from code in `shapes.ts`. Bright pixels become target points (for the rover render it uses edges instead, since brightness just gives a solid blob). Every formation is resampled to exactly 3,200 points so particle i moves from point i in one formation to point i in the next.

The engine runs its own `requestAnimationFrame` loop and sets styles on the text panels and nav dots directly, so React doesn't re-render while scrolling.

One viewport of scrolling equals one formation. Each formation holds still for a bit around its scroll position (`SEGMENT_HOLD` in `config.ts`) before it breaks apart.

## Adding a project

1. Add an entry to `PORTFOLIO_STATES` in `app/content/projects.ts`.
2. Add a shape to `FORMATION_SHAPES` in `app/lib/particles/shapes.ts` and bump `N_STATES` in `config.ts`.
3. Put the image in `public/` and add it to `STATE_IMAGES`, adjusting `minLuma` until the background drops out.
