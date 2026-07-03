const STORAGE_KEY = 'collected';

export function keyFor(card) {
  return `${card.game}-${card.game_id}`;
}

export function createCollection(storage = globalThis.localStorage) {
  function readSet() {
    try {
      return new Set(JSON.parse(storage.getItem(STORAGE_KEY) || '[]'));
    } catch {
      return new Set();
    }
  }

  function writeSet(set) {
    storage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  }

  return {
    has(card) {
      return readSet().has(keyFor(card));
    },
    toggle(card) {
      const set = readSet();
      const k = keyFor(card);
      if (set.has(k)) set.delete(k); else set.add(k);
      writeSet(set);
      return set.has(k);
    },
    keys() {
      return readSet();
    },
  };
}

export const Collection = createCollection();
