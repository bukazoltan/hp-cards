import { esc } from '../util.js';
import { GAME_META, searchCards, sortCards } from '../data.js';
import { imageWrap, rarityBadge } from '../card-view.js';
import { initTilt } from '../tilt.js';
import { Collection } from '../collection.js';

export function renderCollection(cards) {
  document.documentElement.style.removeProperty('--active-c');
  document.documentElement.style.removeProperty('--active-g');
  document.title = 'My Collection – HP PC Cards';

  const params = new URLSearchParams(window.location.search);
  const state = {
    q: params.get('q') || '',
    game: params.get('game') || '',
    sort: params.get('sort') || 'name',
  };

  document.getElementById('app').innerHTML = `
      <div class="page">
        <div class="card-topbar">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/" data-link="/">Collection</a>
            <span class="breadcrumb-sep" aria-hidden="true">›</span>
            <span aria-current="page">My Collection</span>
          </nav>
        </div>

        <header class="browse-header">
          <div class="ornament" aria-hidden="true">✦</div>
          <h1 class="browse-title" tabindex="-1">My Collection</h1>
          <p class="browse-sub" id="collection-count"></p>
        </header>

        <div class="browse-controls">
          <input type="search" id="browse-q" class="browse-search" placeholder="Search your collection…" value="${esc(state.q)}" aria-label="Search my collection">
          <div class="browse-rarity-chips" role="group" aria-label="Filter by game">
            ${[['', 'All'], ['HP1', 'Game I'], ['HP2', 'Game II'], ['HP3', 'Game III']].map(([g, label]) => `
              <button type="button" class="rarity-chip${state.game === g ? ' active' : ''}" data-game="${esc(g)}">${label}</button>
            `).join('')}
          </div>
          <select id="browse-sort" class="browse-sort" aria-label="Sort cards">
            <option value="name" ${state.sort === 'name' ? 'selected' : ''}>Name</option>
            <option value="game" ${state.sort === 'game' ? 'selected' : ''}>Game</option>
          </select>
        </div>

        <div class="browse-grid" id="browse-grid"></div>
      </div>`;

  function collectedCards() {
    return cards.filter(c => Collection.has(c));
  }

  function currentList() {
    let list = collectedCards();
    if (state.game) list = list.filter(c => c.game === state.game);
    list = searchCards(list, state.q);
    if (state.sort === 'game') {
      list = [...list].sort((a, b) => a.game.localeCompare(b.game) || a.name.localeCompare(b.name));
    } else {
      list = sortCards(list, 'name');
    }
    return list;
  }

  function updateCount() {
    const total = collectedCards().length;
    document.getElementById('collection-count').textContent =
      total === 0 ? 'No cards collected yet' : `${total} Collected Card${total === 1 ? '' : 's'}`;
  }

  function syncUrl() {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.game) p.set('game', state.game);
    if (state.sort !== 'name') p.set('sort', state.sort);
    const qs = p.toString();
    history.replaceState({}, '', `/collection${qs ? '?' + qs : ''}`);
  }

  function renderGrid() {
    const list = currentList();
    const grid = document.getElementById('browse-grid');
    updateCount();

    if (list.length === 0) {
      grid.innerHTML = `<p class="browse-empty">${
        collectedCards().length === 0
          ? "You haven't collected any cards yet. Star a card from any game to add it here."
          : 'No collected cards match your filters.'
      }</p>`;
      return;
    }

    grid.innerHTML = list.map((card, i) => {
      const m = GAME_META[card.game];
      return `
      <div class="browse-thumb">
        <a href="/${m.slug}/${card.game_id}" data-link="/${m.slug}/${card.game_id}">
          ${imageWrap(card, { imgClass: 'browse-thumb-img', loading: 'lazy' })}
          <p class="browse-thumb-name">${esc(card.name)}</p>
          <p class="browse-thumb-game">${esc(m.roman)}</p>
        </a>
        ${rarityBadge(card, 'browse-thumb-rarity')}
        <button type="button" class="browse-fav-btn active" data-fav-idx="${i}"
                aria-label="Remove from my collection" aria-pressed="true">★</button>
      </div>`;
    }).join('');

    grid.querySelectorAll('.card-img-wrap').forEach(initTilt);
    grid.querySelectorAll('[data-fav-idx]').forEach(btn => {
      const card = list[Number(btn.dataset.favIdx)];
      btn.addEventListener('click', () => {
        Collection.toggle(card);
        btn.closest('.browse-thumb').remove();
        updateCount();
        if (!grid.querySelector('.browse-thumb')) {
          grid.innerHTML = `<p class="browse-empty">You haven't collected any cards yet. Star a card from any game to add it here.</p>`;
        }
      });
    });
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

  document.querySelectorAll('.browse-rarity-chips .rarity-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.game = btn.dataset.game;
      document.querySelectorAll('.browse-rarity-chips .rarity-chip').forEach(b => b.classList.toggle('active', b === btn));
      syncUrl();
      renderGrid();
    });
  });

  document.getElementById('browse-sort').addEventListener('change', e => {
    state.sort = e.target.value;
    syncUrl();
    renderGrid();
  });

  renderGrid();

  return { keyNav: null, announce: `My Collection, ${collectedCards().length} cards` };
}
