export const GAME_META = {
  HP1: { title: "The Philosopher's Stone", short: "Philosopher's Stone", year: '2001', roman: 'Game I', slug: 'hp1', c: 'var(--c-hp1)', g: 'var(--g-hp1)' },
  HP2: { title: "The Chamber of Secrets", short: "Chamber of Secrets", year: '2002', roman: 'Game II', slug: 'hp2', c: 'var(--c-hp2)', g: 'var(--g-hp2)', hasRarity: true },
  HP3: { title: "The Prisoner of Azkaban", short: "Prisoner of Azkaban", year: '2004', roman: 'Game III', slug: 'hp3', c: 'var(--c-hp3)', g: 'var(--g-hp3)' },
};

export async function loadCards() {
  return fetch('/cards.json').then(r => r.json());
}

export function preloadImages(cards) {
  const idle = window.requestIdleCallback || (cb => setTimeout(cb, 200));
  idle(() => {
    for (const card of cards) {
      if (card.image_local) {
        const img = new Image();
        img.src = '/' + card.image_local;
      }
    }
  }, { timeout: 3000 });
}

export function findSharedGroups(cards) {
  const byName = {};
  for (const c of cards) {
    const key = c.name.trim().toLowerCase();
    if (!byName[key]) byName[key] = {};
    byName[key][c.game] = c;
  }
  return Object.values(byName).filter(g => g.HP1 && g.HP2 && g.HP3);
}

export function filterByGame(cards, game) {
  return cards.filter(c => c.game === game);
}

export function searchCards(cards, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return cards;
  return cards.filter(c =>
    c.name.toLowerCase().includes(q) ||
    (c.description && c.description.toLowerCase().includes(q))
  );
}

export function filterByRarity(cards, rarity) {
  if (!rarity) return cards;
  return cards.filter(c => (c.rarity || '').toLowerCase() === rarity.toLowerCase());
}

const RARITY_RANK = { Gold: 3, Silver: 2, Bronze: 1 };

const SORTERS = {
  id: (a, b) => a.game_id - b.game_id,
  name: (a, b) => a.name.localeCompare(b.name),
  rarity: (a, b) => (RARITY_RANK[b.rarity] || 0) - (RARITY_RANK[a.rarity] || 0) || a.name.localeCompare(b.name),
};

export function sortCards(cards, sortKey) {
  const sorter = SORTERS[sortKey] || SORTERS.id;
  return [...cards].sort(sorter);
}
