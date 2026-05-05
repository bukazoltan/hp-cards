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

## Project structure

```
hp-cards/
├── index.html      # Single-file SPA (routing, CSS, JS)
├── cards.json      # Scraped card data (206 cards)
├── _redirects      # Netlify SPA routing rule
└── images/
    ├── hp1/        # Philosopher's Stone card images
    ├── hp2/        # Chamber of Secrets card images
    └── hp3/        # Prisoner of Azkaban card images (by category subfolder)
```

## Deployment

The site is a plain static SPA hosted on Netlify. The `_redirects` file routes all paths to `index.html` so client-side routing works correctly.
