import { esc } from '../util.js';
import { GAME_META, filterByGame, searchCards, filterByRarity, sortCards } from '../data.js';
import { imageWrap, rarityBadge } from '../card-view.js';
import { initTilt } from '../tilt.js';
import { Collection } from '../collection.js';

export function renderBrowse(cards, game) {
  const m = GAME_META[game];
  document.documentElement.style.setProperty('--active-c', m.c);
  document.documentElement.style.setProperty('--active-g', m.g);
  document.title = `Browse ${m.short} – HP PC Cards`;

  const pool = filterByGame(cards, game);
  const params = new URLSearchParams(window.location.search);
  const state = {
    q: params.get('q') || '',
    rarity: m.hasRarity ? (params.get('rarity') || '') : '',
    sort: params.get('sort') || 'id',
    collected: params.get('collected') === 'true',
  };

  document.getElementById('app').innerHTML = `
      <div class="page">
        <div class="card-topbar">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/" data-link="/">Collection</a>
            <span class="breadcrumb-sep" aria-hidden="true">›</span>
            <span aria-current="page">${esc(m.short)} · Browse</span>
          </nav>
          <a href="/${m.slug}/random" class="btn-rnd" data-link="/${m.slug}/random">✦ Draw Random</a>
        </div>

        <header class="browse-header">
          <div class="ornament" aria-hidden="true">✦</div>
          <h1 class="browse-title" tabindex="-1">${esc(m.short)}</h1>
          <p class="browse-sub">${pool.length} Wizard Cards</p>
        </header>

        <div class="browse-controls">
          <input type="search" id="browse-q" class="browse-search" placeholder="Search by name or description…" value="${esc(state.q)}" aria-label="Search cards">
          ${m.hasRarity ? `
            <div class="browse-rarity-chips" role="group" aria-label="Filter by rarity">
              ${['', 'Bronze', 'Silver', 'Gold'].map(r => `
                <button type="button" class="rarity-chip${state.rarity === r ? ' active' : ''}" data-rarity="${esc(r)}">${r || 'All'}</button>
              `).join('')}
            </div>` : ''}
          <select id="browse-sort" class="browse-sort" aria-label="Sort cards">
            <option value="id" ${state.sort === 'id' ? 'selected' : ''}>Card number</option>
            <option value="name" ${state.sort === 'name' ? 'selected' : ''}>Name</option>
            ${m.hasRarity ? `<option value="rarity" ${state.sort === 'rarity' ? 'selected' : ''}>Rarity</option>` : ''}
          </select>
          <label class="browse-collected-toggle">
            <input type="checkbox" id="browse-collected" ${state.collected ? 'checked' : ''}>
            My collection only
          </label>
        </div>

        <div class="browse-grid" id="browse-grid"></div>
      </div>`;

  function currentList() {
    let list = pool;
    list = searchCards(list, state.q);
    if (m.hasRarity && state.rarity) list = filterByRarity(list, state.rarity);
    if (state.collected) list = list.filter(c => Collection.has(c));
    return sortCards(list, state.sort);
  }

  function renderGrid() {
    const list = currentList();
    const grid = document.getElementById('browse-grid');

    if (list.length === 0) {
      grid.innerHTML = `<p class="browse-empty">No cards match your filters.</p>`;
      return;
    }

    grid.innerHTML = list.map((card, i) => `
      <div class="browse-thumb">
        <a href="/${m.slug}/${card.game_id}" data-link="/${m.slug}/${card.game_id}">
          ${imageWrap(card, { imgClass: 'browse-thumb-img', loading: 'lazy' })}
          <p class="browse-thumb-name">${esc(card.name)}</p>
        </a>
        ${rarityBadge(card, 'browse-thumb-rarity')}
        <button type="button" class="browse-fav-btn${Collection.has(card) ? ' active' : ''}"
                data-fav-idx="${i}"
                aria-label="${Collection.has(card) ? 'Remove from' : 'Add to'} my collection"
                aria-pressed="${Collection.has(card)}">★</button>
      </div>
    `).join('');

    grid.querySelectorAll('.card-img-wrap').forEach(initTilt);
    grid.querySelectorAll('[data-fav-idx]').forEach(btn => {
      const card = list[Number(btn.dataset.favIdx)];
      btn.addEventListener('click', () => {
        const isNowCollected = Collection.toggle(card);
        // Only remove this one card when the "collected only" filter needs
        // it to disappear — never re-render the whole grid, so the other
        // thumbnails' image-reveal/glow animations don't replay and make
        // everything appear to reload.
        if (state.collected && !isNowCollected) {
          btn.closest('.browse-thumb').remove();
          if (!grid.querySelector('.browse-thumb')) {
            grid.innerHTML = `<p class="browse-empty">No cards match your filters.</p>`;
          }
          return;
        }
        btn.classList.toggle('active', isNowCollected);
        btn.setAttribute('aria-pressed', String(isNowCollected));
        btn.setAttribute('aria-label', `${isNowCollected ? 'Remove from' : 'Add to'} my collection`);
      });
    });
  }

  function syncUrl() {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.rarity) p.set('rarity', state.rarity);
    if (state.sort !== 'id') p.set('sort', state.sort);
    if (state.collected) p.set('collected', 'true');
    const qs = p.toString();
    history.replaceState({}, '', `/${m.slug}/browse${qs ? '?' + qs : ''}`);
  }

  let debounceTimer;
  document.getElementById('browse-q').addEventListener('input', e => {
    clearTimeout(debounceTimer);
    const value = e.target.value;
    debounceTimer = setTimeout(() => {
      state.q = value;
      syncUrl();
      renderGrid();
    }, 200);
  });

  document.querySelectorAll('.rarity-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.rarity = btn.dataset.rarity;
      document.querySelectorAll('.rarity-chip').forEach(b => b.classList.toggle('active', b === btn));
      syncUrl();
      renderGrid();
    });
  });

  document.getElementById('browse-sort').addEventListener('change', e => {
    state.sort = e.target.value;
    syncUrl();
    renderGrid();
  });

  document.getElementById('browse-collected').addEventListener('change', e => {
    state.collected = e.target.checked;
    syncUrl();
    renderGrid();
  });

  renderGrid();

  return { keyNav: null, announce: `Browsing ${m.short}, ${pool.length} cards` };
}
