import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ogMeta from '../netlify/edge-functions/og-meta.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const cardsJson = fs.readFileSync(path.join(root, 'cards.json'), 'utf8');
const cards = JSON.parse(cardsJson);

const realFetch = globalThis.fetch;
function withMockedCardsFetch(fn) {
  globalThis.fetch = async (url) => {
    const u = new URL(url);
    if (u.pathname === '/cards.json') {
      return new Response(JSON.stringify(cards), { headers: { 'content-type': 'application/json' } });
    }
    return realFetch(url);
  };
  return fn().finally(() => { globalThis.fetch = realFetch; });
}

function mockContext() {
  return { next: async () => new Response(indexHtml, { status: 200, headers: { 'content-type': 'text/html' } }) };
}

async function run(pathname) {
  const req = new Request(`https://hp-cards.netlify.app${pathname}`);
  const res = await ogMeta(req, mockContext());
  return res.text();
}

test('rewrites OG tags for a concrete card URL', async () => {
  await withMockedCardsFetch(async () => {
    const card = cards.find(c => c.game === 'HP2');
    const html = await run(`/hp2/${card.game_id}`);
    assert.ok(html.includes(`<title>${card.name} – Chamber of Secrets</title>`));
    assert.match(html, new RegExp(`og:title" content="[^"]*${card.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    assert.ok(html.includes(`og:image" content="https://hp-cards.netlify.app/${card.image_local}"`));
  });
});

test('leaves generic tags untouched for /:game/random', async () => {
  await withMockedCardsFetch(async () => {
    const html = await run('/hp2/random');
    assert.ok(html.includes('<title>Famous Witches & Wizards – HP PC Cards</title>'));
  });
});

test('leaves generic tags untouched for an unknown card id', async () => {
  await withMockedCardsFetch(async () => {
    const html = await run('/hp2/999999');
    assert.ok(html.includes('<title>Famous Witches & Wizards – HP PC Cards</title>'));
  });
});

test('leaves generic tags untouched for an unknown game slug', async () => {
  await withMockedCardsFetch(async () => {
    const html = await run('/hp9/3');
    assert.ok(html.includes('<title>Famous Witches & Wizards – HP PC Cards</title>'));
  });
});

test('does not choke on a description containing $-sequences', async () => {
  await withMockedCardsFetch(async () => {
    const card = cards.find(c => c.game === 'HP1');
    const original = card.description;
    card.description = 'Costs $5 and a $& trick, see $1 for details';
    try {
      const html = await run(`/hp1/${card.game_id}`);
      assert.ok(html.includes('Costs $5 and a $&amp; trick, see $1 for details'));
    } finally {
      card.description = original;
    }
  });
});
