import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCollection, keyFor } from '../js/collection.js';

function mockStorage() {
  const data = new Map();
  return {
    getItem: k => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, v),
  };
}

test('keyFor builds a composite game+id key', () => {
  assert.equal(keyFor({ game: 'HP2', game_id: 47 }), 'HP2-47');
});

test('has() is false for a card never toggled', () => {
  const col = createCollection(mockStorage());
  assert.equal(col.has({ game: 'HP1', game_id: 3 }), false);
});

test('toggle() adds then removes a card, and reports the resulting state', () => {
  const col = createCollection(mockStorage());
  const card = { game: 'HP1', game_id: 3 };

  const added = col.toggle(card);
  assert.equal(added, true);
  assert.equal(col.has(card), true);

  const removed = col.toggle(card);
  assert.equal(removed, false);
  assert.equal(col.has(card), false);
});

test('cards with the same game_id but different game are tracked independently', () => {
  const col = createCollection(mockStorage());
  col.toggle({ game: 'HP1', game_id: 5 });
  assert.equal(col.has({ game: 'HP1', game_id: 5 }), true);
  assert.equal(col.has({ game: 'HP2', game_id: 5 }), false);
});

test('keys() reflects all currently-collected cards', () => {
  const col = createCollection(mockStorage());
  col.toggle({ game: 'HP1', game_id: 1 });
  col.toggle({ game: 'HP2', game_id: 2 });
  assert.deepEqual([...col.keys()].sort(), ['HP1-1', 'HP2-2']);
});

test('survives corrupted storage content by treating it as empty', () => {
  const storage = mockStorage();
  storage.setItem('collected', 'not valid json');
  const col = createCollection(storage);
  assert.equal(col.has({ game: 'HP1', game_id: 1 }), false);
  assert.equal(col.toggle({ game: 'HP1', game_id: 1 }), true);
});
