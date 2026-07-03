import { esc } from '../util.js';
import { GAME_META } from '../data.js';

export function renderHome(cards) {
  document.documentElement.style.removeProperty('--active-c');
  document.documentElement.style.removeProperty('--active-g');
  document.title = 'Famous Witches & Wizards – HP PC Cards';

  const counts = {};
  for (const g of Object.keys(GAME_META))
    counts[g] = cards.filter(c => c.game === g).length;

  document.getElementById('app').innerHTML = `
      <div class="page">
        <header class="home-header">
          <div class="ornament" aria-hidden="true">✦</div>
          <h1 class="home-title" tabindex="-1">Famous Witches<br>&amp; Wizards</h1>
          <p class="home-sub">Harry Potter · PC Collection · 2001–2004</p>
          <div class="ornament" aria-hidden="true" style="margin-bottom:1.5rem">✦</div>
          <div style="display:flex;gap:1.25rem;justify-content:center;flex-wrap:wrap;margin-top:.5rem">
            <a href="/random" class="btn-draw btn-hero" data-link="/random">✦ &nbsp;Draw One from Each Game</a>
            <a href="/shared/random" class="btn-draw btn-hero" data-link="/shared/random">✦ &nbsp;Same Card, Three Games</a>
          </div>
        </header>

        <div class="games-grid">
          ${Object.entries(GAME_META).map(([g, m]) => `
            <article class="game-panel ${m.slug}">
              <p class="panel-roman">${m.roman}</p>
              <h2 class="panel-title">Harry Potter &amp; ${esc(m.title)}</h2>
              <p class="panel-year">${m.year} &nbsp;·&nbsp; PC</p>
              <div class="panel-count">${counts[g]}</div>
              <p class="panel-count-label">Wizard Cards</p>
              <a href="/${m.slug}/random" class="btn-draw" data-link="/${m.slug}/random">Draw a Card</a>
              <a href="/${m.slug}/browse" class="panel-browse-link" data-link="/${m.slug}/browse">Browse all →</a>
            </article>
          `).join('')}
        </div>
      </div>`;

  return { keyNav: null, announce: 'Collection home' };
}
