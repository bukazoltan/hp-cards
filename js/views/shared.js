import { esc } from '../util.js';
import { GAME_META } from '../data.js';
import { findSharedGroups } from '../data.js';
import { imageWrap, rarityBadge, locationCompact } from '../card-view.js';
import { initTilt } from '../tilt.js';

export function renderShared(cards) {
  document.documentElement.style.removeProperty('--active-c');
  document.documentElement.style.removeProperty('--active-g');
  document.title = 'Same Card, Three Games – HP PC Cards';

  const shared = findSharedGroups(cards);
  const group = shared[Math.floor(Math.random() * shared.length)];
  const name = group.HP1.name;

  const cardHtml = (card, m) => `
      <div class="shared-card ${m.slug}">
        <p class="shared-game-label">${m.roman} · ${esc(m.short)}</p>
        ${imageWrap(card, { imgClass: 'shared-img', wrapStyle: 'width:fit-content;margin:0 auto 1rem', imgStyle: 'margin:0' })}
        ${rarityBadge(card, 'shared-rarity')}
        ${locationCompact(card, 'shared-loc')}
        <a href="/${m.slug}/${card.game_id}" class="shared-view-link" data-link="/${m.slug}/${card.game_id}">View full card →</a>
      </div>`;

  document.getElementById('app').innerHTML = `
      <div class="page">
        <div class="card-topbar">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/" data-link="/">Collection</a>
            <span class="breadcrumb-sep" aria-hidden="true">›</span>
            <span aria-current="page">Same Card, Three Games</span>
          </nav>
          <a href="/shared/random" class="btn-rnd" data-link="/shared/random">✦ Draw Another</a>
        </div>

        <header class="shared-hero">
          <div class="ornament" aria-hidden="true">✦</div>
          <h1 class="shared-name" tabindex="-1">${esc(name)}</h1>
          <p class="shared-sub">Same wizard · Three games</p>
          <div class="ornament" aria-hidden="true" style="margin-top:1.2rem">✦</div>
        </header>

        <div class="shared-grid">
          ${cardHtml(group.HP1, GAME_META.HP1)}
          ${cardHtml(group.HP2, GAME_META.HP2)}
          ${cardHtml(group.HP3, GAME_META.HP3)}
        </div>

        <a href="/shared/random" class="btn-redraw" data-link="/shared/random">✦ Draw Another</a>
      </div>`;

  document.querySelectorAll('.shared-card .card-img-wrap').forEach(initTilt);

  return { keyNav: null, announce: `${name}, same card across all three games` };
}
