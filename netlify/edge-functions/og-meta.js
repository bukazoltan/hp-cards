const GAME_META = {
  HP1: { short: "Philosopher's Stone" },
  HP2: { short: "Chamber of Secrets" },
  HP3: { short: "Prisoner of Azkaban" },
};

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function replaceContent(html, selectorRegex, value) {
  const escaped = esc(value);
  return html.replace(selectorRegex, (_match, before, after) => `${before}${escaped}${after}`);
}

export default async (request, context) => {
  const url = new URL(request.url);
  const [, gameSlug, rawId] = url.pathname.split('/');
  const game = (gameSlug || '').toUpperCase();
  const id = parseInt(rawId, 10);

  const response = await context.next();

  // Only rewrite for concrete /:game/:id card URLs — leave /:game/random,
  // /random, /shared/random, and the home page on the generic static tags.
  if (!GAME_META[game] || !Number.isInteger(id) || String(id) !== rawId) {
    return response;
  }

  let cards;
  try {
    const cardsRes = await fetch(new URL('/cards.json', url));
    cards = await cardsRes.json();
  } catch {
    return response;
  }

  const card = cards.find(c => c.game === game && c.game_id === id);
  if (!card) return response;

  const title = `${card.name} – ${GAME_META[game].short}`;
  const description = card.description
    ? card.description.slice(0, 200)
    : `A Famous Witches & Wizards card from Harry Potter & ${GAME_META[game].short}.`;
  const image = card.image_local ? `${url.origin}/${card.image_local}` : '';
  const pageUrl = `${url.origin}${url.pathname}`;

  const escTitle = esc(title);
  let html = await response.text();
  html = html.replace(/(<title>).*?(<\/title>)/, (_m, before, after) => `${before}${escTitle}${after}`);
  html = replaceContent(html, /(<meta property="og:title" content=")[^"]*(")/, title);
  html = replaceContent(html, /(<meta property="og:description" content=")[^"]*(")/, description);
  html = replaceContent(html, /(<meta property="og:url" content=")[^"]*(")/, pageUrl);
  html = replaceContent(html, /(<meta name="twitter:title" content=")[^"]*(")/, title);
  html = replaceContent(html, /(<meta name="twitter:description" content=")[^"]*(")/, description);
  if (image) html = replaceContent(html, /(<meta property="og:image" content=")[^"]*(")/, image);

  const headers = new Headers(response.headers);
  headers.delete('content-length');

  return new Response(html, { status: response.status, headers });
};

export const config = { path: ['/hp1/*', '/hp2/*', '/hp3/*'] };
