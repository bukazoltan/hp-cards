import { esc } from './util.js';

export function imageWrap(card, { imgClass, wrapStyle = '', imgStyle = '', loading = '' } = {}) {
  const holo = card.rarity ? ' holo' : '';
  const wrapAttr = wrapStyle ? ` style="${wrapStyle}"` : '';
  const imgAttrs = (imgStyle ? ` style="${imgStyle}"` : '') + (loading ? ` loading="${loading}"` : '');
  return `<div class="card-img-wrap${holo}"${wrapAttr}>
      <img class="${imgClass}" src="/${esc(card.image_local)}" alt="${esc(card.name)}"${imgAttrs}>
    </div>`;
}

export function rarityBadge(card, className) {
  return card.rarity ? `<div class="${className} ${card.rarity.toLowerCase()}">${esc(card.rarity)}</div>` : '';
}

export function locationDetail(card) {
  return card.location ? `
      <div class="card-loc">
        <span class="loc-label">Where to find</span>
        <p class="loc-text">${esc(card.location)}</p>
      </div>` : '';
}

export function locationCompact(card, className) {
  return card.location ? `
          <div class="${className}">
            <strong>Where to find</strong>
            ${esc(card.location)}
          </div>` : '';
}
