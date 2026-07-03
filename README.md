# Famous Witches & Wizards – HP PC Cards

A static single-page app displaying the collectible wizard cards from the Harry Potter PC games (Games 1–3). Browse all 206 cards, draw random ones, or find characters shared across all three games.

**Live site:** https://hp-cards.netlify.app

## Features

- Browse cards from all three HP PC games:
  - Game I – *Philosopher's Stone* (25 cards)
  - Game II – *Chamber of Secrets* (101 cards, Bronze/Silver/Gold rarity)
  - Game III – *Prisoner of Azkaban* (80 cards)
- Draw a random card per game via `/:game/random`
- Triple draw – one random card from each game simultaneously (`/random`)
- Shared draw – the same character across all three games (`/shared/random`)
- Light and dark theme, preference saved in the browser
- Animated starfield background
- Per-card link previews (Open Graph/Twitter cards) when sharing a `/:game/:id` URL

## Project structure

```
hp-cards/
├── index.html                       # App shell: head meta/OG tags + body skeleton
├── css/                              # base.css (theme/reset) + components.css (page styles)
├── js/                                # ES modules: router, views, card rendering, theme, etc.
├── test/                               # node --test unit tests for the pure logic (router, data, util, og-meta)
├── netlify/edge-functions/og-meta.js     # Rewrites OG/Twitter meta tags per card for link-preview bots
├── netlify.toml                          # Registers og-meta as an edge function for /hp1|hp2|hp3/*
├── cards.json      # Scraped card data (206 cards)
├── _redirects      # Netlify SPA routing rule
└── images/
    ├── hp1/        # Philosopher's Stone card images
    ├── hp2/        # Chamber of Secrets card images
    └── hp3/        # Prisoner of Azkaban card images (by category subfolder)
```

No build step or bundler — `index.html` loads `js/app.js` as a native ES module (`<script type="module">`), and CSS/JS are served as plain static files. The one exception is `netlify/edge-functions/og-meta.js`, a small Netlify Edge Function (runs at the CDN edge, no separate build/deploy pipeline) that rewrites the static OG/Twitter meta tags with the specific card's name, description, and image when a `/:game/:id` URL is requested — needed because link-unfurling bots (Twitter/Discord/Slack/etc.) don't run the client-side JS that would otherwise render that content.

## Tests

```
node --test
```

Runs the unit tests in `test/` (Node's built-in test runner, no dependencies).

## Deployment

The site is a plain static SPA hosted on Netlify. The `_redirects` file routes all paths to `index.html` so client-side routing works correctly.
