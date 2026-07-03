import { GAME_META } from './data.js';

export function parseRoute(pathname, knownGames = Object.keys(GAME_META)) {
  const [, gameSlug, rawId] = pathname.split('/');
  const game = (gameSlug || '').toUpperCase();

  if (gameSlug === 'random') return { kind: 'triple' };
  if (gameSlug === 'shared') return { kind: 'shared' };
  if (gameSlug === 'collection') return { kind: 'collection' };
  if (!gameSlug || !knownGames.includes(game)) return { kind: 'home' };
  if (rawId === 'browse') return { kind: 'browse', gameSlug, game };
  return { kind: 'card', gameSlug, game, rawId: rawId || null };
}

export function createRouter({ cards, views }) {
  const router = {
    keyNav: null,

    go(path) {
      history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      router.route();
    },

    route() {
      const parsed = parseRoute(window.location.pathname);
      let result;

      if (parsed.kind === 'triple') {
        result = views.triple(cards);
      } else if (parsed.kind === 'shared') {
        result = views.shared(cards);
      } else if (parsed.kind === 'home') {
        result = views.home(cards);
      } else if (parsed.kind === 'browse') {
        result = views.browse(cards, parsed.game);
      } else if (parsed.kind === 'collection') {
        result = views.collection(cards);
      } else {
        const pool = cards.filter(c => c.game === parsed.game);
        if (!parsed.rawId || parsed.rawId === 'random') {
          const card = pool[Math.floor(Math.random() * pool.length)];
          history.replaceState({}, '', `/${parsed.gameSlug}/${card.game_id}`);
          result = views.card(card, pool);
        } else {
          const id = parseInt(parsed.rawId, 10);
          const card = pool.find(c => c.game_id === id);
          result = card ? views.card(card, pool) : views.home(cards);
        }
      }

      router.dispatch(result);
    },

    dispatch(result) {
      router.keyNav = (result && result.keyNav) || null;
      announce(result && result.announce);
      focusHeading();
    },

    init() {
      document.addEventListener('click', e => {
        const el = e.target.closest('[data-link]');
        if (!el) return;
        e.preventDefault();
        router.go(el.dataset.link);
      });

      window.addEventListener('popstate', () => router.route());
      document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.metaKey || e.ctrlKey) return;
        const kn = router.keyNav;
        if (!kn) return;
        if (e.key === 'ArrowLeft'  && kn.prev)   { e.preventDefault(); router.go(kn.prev); }
        if (e.key === 'ArrowRight' && kn.next)   { e.preventDefault(); router.go(kn.next); }
        if ((e.key === 'r' || e.key === 'R') && kn.random) router.go(kn.random);
      });

      router.route();
    },
  };

  return router;
}

function announce(text) {
  const el = document.getElementById('route-announcer');
  if (el) el.textContent = text || '';
}

function focusHeading() {
  const h1 = document.querySelector('#app h1');
  if (h1) h1.focus({ preventScroll: true });
}
