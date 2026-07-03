import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { GAME_META, findSharedGroups } from '../js/data.js';

const cardsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'cards.json');
const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));

test('GAME_META has exactly HP1, HP2, HP3', () => {
  assert.deepEqual(Object.keys(GAME_META).sort(), ['HP1', 'HP2', 'HP3']);
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
