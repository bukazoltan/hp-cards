import { esc } from './util.js';
import { Theme } from './theme.js';
import { initStarfield } from './starfield.js';
import { loadCards, preloadImages } from './data.js';
import { createRouter } from './router.js';
import { renderHome } from './views/home.js';
import { renderCard } from './views/card.js';
import { renderTriple } from './views/triple.js';
import { renderShared } from './views/shared.js';
import { renderBrowse } from './views/browse.js';
import { renderCollection } from './views/collection.js';

Theme.init();
initStarfield();

async function init() {
  const cards = await loadCards();
  preloadImages(cards);

  const router = createRouter({
    cards,
    views: {
      home: renderHome,
      card: renderCard,
      triple: renderTriple,
      shared: renderShared,
      browse: renderBrowse,
      collection: renderCollection,
    },
  });
  router.init();
}

init().catch(err => {
  document.getElementById('app').innerHTML =
    `<div class="loading">Failed to load card data.<br><small>${esc((err && (err.stack || err.message)) || err)}</small></div>`;
  console.error(err);
});
