import { esc } from '../util.js';
import { GAME_META } from '../data.js';
import { imageWrap, locationCompact } from '../card-view.js';
import { initTilt } from '../tilt.js';

export function renderTriple(cards) {
  document.documentElement.style.removeProperty('--active-c');
  document.documentElement.style.removeProperty('--active-g');
  document.title = 'Draw Three – HP PC Cards';

  const pick = game => {
    const pool = cards.filter(c => c.game === game);
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const drawn = { HP1: pick('HP1'), HP2: pick('HP2'), HP3: pick('HP3') };

  const cardHtml = (card, m) => `
      <div class="triple-card ${m.slug}">
        <p class="triple-game-label">${m.roman} · ${esc(m.short)}</p>
        ${imageWrap(card, { imgClass: 'triple-img', wrapStyle: 'width:fit-content;margin:0 auto 1.25rem', imgStyle: 'margin:0' })}
        <p class="triple-card-name">${esc(card.name)}</p>
        ${card.dates ? `<p class="triple-card-dates">${esc(card.dates)}</p>` : ''}
        ${locationCompact(card, 'triple-card-loc')}
        <a href="/${m.slug}/${card.game_id}" class="triple-view-link" data-link="/${m.slug}/${card.game_id}">View full card →</a>
      </div>`;

  document.getElementById('app').innerHTML = `
      <div class="page">
        <div class="card-topbar">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/" data-link="/">Collection</a>
            <span class="breadcrumb-sep" aria-hidden="true">›</span>
            <span aria-current="page">Draw Three</span>
          </nav>
          <a href="/random" class="btn-rnd" data-link="/random">✦ Redraw All</a>
        </div>

        <header class="triple-header">
          <div class="ornament" aria-hidden="true">✦</div>
          <h1 class="triple-title" style="margin: 1.2rem 0 .5rem" tabindex="-1">Draw Three</h1>
          <p class="triple-sub">One card from each game</p>
          <div class="ornament" aria-hidden="true" style="margin-top:1.2rem">✦</div>
        </header>

        <div class="triple-grid">
          ${cardHtml(drawn.HP1, GAME_META.HP1)}
          ${cardHtml(drawn.HP2, GAME_META.HP2)}
          ${cardHtml(drawn.HP3, GAME_META.HP3)}
        </div>

        <a href="/random" class="btn-redraw" data-link="/random">✦ Draw Again</a>
      </div>`;

  document.querySelectorAll('.triple-card .card-img-wrap').forEach(initTilt);

  return { keyNav: null, announce: 'Drew three new cards, one from each game' };
}
