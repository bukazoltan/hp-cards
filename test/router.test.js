import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute } from '../js/router.js';

test('root path is home', () => {
  assert.equal(parseRoute('/').kind, 'home');
});

test('unknown path segment falls back to home', () => {
  assert.equal(parseRoute('/nonsense').kind, 'home');
});

test('unknown game slug falls back to home', () => {
  assert.equal(parseRoute('/hp9/3').kind, 'home');
});

test('/random is the triple-draw route', () => {
  assert.equal(parseRoute('/random').kind, 'triple');
});

test('/shared/random is the shared route', () => {
  assert.equal(parseRoute('/shared/random').kind, 'shared');
});

test('/:game/:id resolves to a card route with parsed fields', () => {
  const r = parseRoute('/hp2/47');
  assert.equal(r.kind, 'card');
  assert.equal(r.game, 'HP2');
  assert.equal(r.gameSlug, 'hp2');
  assert.equal(r.rawId, '47');
});

test('/:game/random resolves to a card route with rawId "random"', () => {
  const r = parseRoute('/hp2/random');
  assert.equal(r.kind, 'card');
  assert.equal(r.rawId, 'random');
});

test('/:game with no id has a null rawId', () => {
  const r = parseRoute('/hp1');
  assert.equal(r.kind, 'card');
  assert.equal(r.rawId, null);
});

test('malformed id is passed through as rawId for the caller to reject', () => {
  const r = parseRoute('/hp2/not-a-number');
  assert.equal(r.kind, 'card');
  assert.equal(r.rawId, 'not-a-number');
});

test('/:game/browse resolves to the browse route', () => {
  const r = parseRoute('/hp2/browse');
  assert.equal(r.kind, 'browse');
  assert.equal(r.game, 'HP2');
  assert.equal(r.gameSlug, 'hp2');
});

test('/:game/browse for an unknown game still falls back to home', () => {
  assert.equal(parseRoute('/hp9/browse').kind, 'home');
});

test('/collection is the cross-game collection route', () => {
  assert.equal(parseRoute('/collection').kind, 'collection');
});
