import { esc } from '../util.js';
import { GAME_META } from '../data.js';
import { imageWrap, rarityBadge, locationDetail } from '../card-view.js';
import { initTilt } from '../tilt.js';
import { Collection } from '../collection.js';

export function renderCard(card, pool) {
  const m = GAME_META[card.game];
  const sorted = [...pool].sort((a, b) => a.game_id - b.game_id);
  const idx = sorted.findIndex(c => c.game_id === card.game_id);
  const prev = sorted[idx - 1];
  const next = sorted[idx + 1];

  document.documentElement.style.setProperty('--active-c', m.c);
  document.documentElement.style.setProperty('--active-g', m.g);
  document.title = `${card.name} – ${m.short}`;

  const descHtml = card.description
    ? `<p class="card-desc">${esc(card.description)}</p>`
    : '';

  const navPrev = prev ? `
      <a href="/${m.slug}/${prev.game_id}" class="nav-btn prev" data-link="/${m.slug}/${prev.game_id}">
        <span class="nav-dir">← Previous</span>
        <span class="nav-name">${esc(prev.name)}</span>
      </a>` : '<span></span>';

  const navNext = next ? `
      <a href="/${m.slug}/${next.game_id}" class="nav-btn next" data-link="/${m.slug}/${next.game_id}">
        <span class="nav-dir">Next →</span>
        <span class="nav-name">${esc(next.name)}</span>
      </a>` : '<span></span>';

  document.getElementById('app').innerHTML = `
      <div class="page">
        <div class="card-topbar">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/" data-link="/">Collection</a>
            <span class="breadcrumb-sep" aria-hidden="true">›</span>
            <a href="/${m.slug}/random" data-link="/${m.slug}/random">${esc(m.short)}</a>
            <span class="breadcrumb-sep" aria-hidden="true">›</span>
            <span aria-current="page">${esc(card.name)}</span>
          </nav>
          <a href="/${m.slug}/random" class="btn-rnd" data-link="/${m.slug}/random">✦ Draw Random</a>
        </div>

        <div class="card-browse-link">
          <a href="/${m.slug}/browse" data-link="/${m.slug}/browse">Browse all ${esc(m.short)} cards →</a>
        </div>

        <div class="card-layout">
          <div class="card-img-zone">
            <div class="card-glow"></div>
            ${imageWrap(card, { imgClass: 'card-img', loading: 'eager' })}
            ${rarityBadge(card, 'rarity-badge')}
          </div>

          <div class="card-details">
            <p class="card-meta-line">${esc(m.roman)} &nbsp;·&nbsp; No.&nbsp;${card.game_id} &nbsp;·&nbsp; ${idx + 1}&thinsp;/&thinsp;${sorted.length}</p>
            <h1 class="card-name" tabindex="-1">${esc(card.name)}</h1>
            ${card.dates ? `<p class="card-dates">${esc(card.dates)}</p>` : ''}
            <div class="rule"></div>
            ${descHtml}
            ${locationDetail(card)}
            <div class="card-actions">
              <a href="/${m.slug}/random" class="btn-primary" data-link="/${m.slug}/random">Draw Another</a>
              <a href="/" class="btn-ghost" data-link="/">All Games</a>
              <button type="button" id="collect-toggle" class="btn-ghost btn-collect${Collection.has(card) ? ' active' : ''}"
                      aria-pressed="${Collection.has(card)}">
                ${Collection.has(card) ? '★ In My Collection' : '☆ Add to Collection'}
              </button>
            </div>
            <div class="card-nav">
              ${navPrev}
              ${navNext}
            </div>
            <p class="key-hint">← → navigate &nbsp;·&nbsp; R random</p>
          </div>
        </div>
      </div>`;

  initTilt(document.querySelector('.card-img-wrap'));
  const img = document.querySelector('.card-img');
  if (img) img.addEventListener('error', () => img.classList.add('error'), { once: true });

  const collectBtn = document.getElementById('collect-toggle');
  collectBtn.addEventListener('click', () => {
    const isNowCollected = Collection.toggle(card);
    collectBtn.classList.toggle('active', isNowCollected);
    collectBtn.setAttribute('aria-pressed', String(isNowCollected));
    collectBtn.textContent = isNowCollected ? '★ In My Collection' : '☆ Add to Collection';
  });

  return {
    keyNav: {
      prev: prev ? `/${m.slug}/${prev.game_id}` : null,
      next: next ? `/${m.slug}/${next.game_id}` : null,
      random: `/${m.slug}/random`,
    },
    announce: `${card.name}, ${m.roman}, card ${idx + 1} of ${sorted.length}`,
  };
}
