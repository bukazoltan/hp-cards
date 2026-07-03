import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  GAME_META,
  findSharedGroups,
  filterByGame,
  searchCards,
  filterByRarity,
  sortCards,
} from '../js/data.js';

const cardsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'cards.json');
const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));

test('GAME_META has exactly HP1, HP2, HP3', () => {
  assert.deepEqual(Object.keys(GAME_META).sort(), ['HP1', 'HP2', 'HP3']);
});

test('only HP2 is flagged as having rarity', () => {
  assert.equal(GAME_META.HP2.hasRarity, true);
  assert.ok(!GAME_META.HP1.hasRarity);
  assert.ok(!GAME_META.HP3.hasRarity);
});

test('per-game card counts match the known collection sizes', () => {
  const counts = {};
  for (const g of Object.keys(GAME_META)) counts[g] = cards.filter(c => c.game === g).length;
  assert.equal(counts.HP1, 25);
  assert.equal(counts.HP2, 101);
  assert.equal(counts.HP3, 80);
});

test('findSharedGroups returns a non-empty, stable-shaped result', () => {
  const shared = findSharedGroups(cards);
  assert.ok(shared.length > 0);
  for (const group of shared) {
    assert.ok(group.HP1 && group.HP2 && group.HP3);
    assert.equal(group.HP1.name.trim().toLowerCase(), group.HP2.name.trim().toLowerCase());
    assert.equal(group.HP1.name.trim().toLowerCase(), group.HP3.name.trim().toLowerCase());
  }
});

test('filterByGame only returns cards from the requested game', () => {
  const pool = filterByGame(cards, 'HP3');
  assert.equal(pool.length, 80);
  assert.ok(pool.every(c => c.game === 'HP3'));
});

test('searchCards matches by name case-insensitively', () => {
  const pool = filterByGame(cards, 'HP2');
  const target = pool[0];
  const results = searchCards(pool, target.name.slice(0, 4).toUpperCase());
  assert.ok(results.some(c => c.name === target.name));
});

test('searchCards with an empty query returns the input unchanged', () => {
  const pool = filterByGame(cards, 'HP1');
  assert.deepEqual(searchCards(pool, ''), pool);
  assert.deepEqual(searchCards(pool, '   '), pool);
});

test('filterByRarity only keeps the requested tier', () => {
  const pool = filterByGame(cards, 'HP2');
  const gold = filterByRarity(pool, 'Gold');
  assert.ok(gold.length > 0);
  assert.ok(gold.every(c => c.rarity === 'Gold'));
});

test('filterByRarity with no rarity argument returns the input unchanged', () => {
  const pool = filterByGame(cards, 'HP2');
  assert.deepEqual(filterByRarity(pool, ''), pool);
});

test('sortCards by name sorts alphabetically', () => {
  const pool = filterByGame(cards, 'HP1');
  const sorted = sortCards(pool, 'name');
  const names = sorted.map(c => c.name);
  const expected = [...names].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(names, expected);
});

test('sortCards by id sorts by game_id ascending', () => {
  const pool = filterByGame(cards, 'HP3');
  const sorted = sortCards(pool, 'id');
  for (let i = 1; i < sorted.length; i++) {
    assert.ok(sorted[i].game_id >= sorted[i - 1].game_id);
  }
});

test('sortCards by rarity ranks Gold above Silver above Bronze above none', () => {
  const pool = filterByGame(cards, 'HP2');
  const sorted = sortCards(pool, 'rarity');
  const rank = { Gold: 3, Silver: 2, Bronze: 1 };
  for (let i = 1; i < sorted.length; i++) {
    const prevRank = rank[sorted[i - 1].rarity] || 0;
    const curRank = rank[sorted[i].rarity] || 0;
    assert.ok(prevRank >= curRank);
  }
});

test('sortCards falls back to id ordering for an unknown sort key', () => {
  const pool = filterByGame(cards, 'HP1');
  assert.deepEqual(sortCards(pool, 'bogus'), sortCards(pool, 'id'));
});
