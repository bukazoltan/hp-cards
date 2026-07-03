import { Theme } from './theme.js';

export function initStarfield() {
  const cvs = document.getElementById('starfield');
  const ctx = cvs.getContext('2d');
  let W, H, stars;

  function resize() {
    W = cvs.width = window.innerWidth;
    H = cvs.height = window.innerHeight;
  }

  function mkStars(n) {
    return Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.15 + .15,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * .0015 + .0005,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const light = Theme.isLight();
    // Dark: pale gold stars. Light: soft warm dust motes at low opacity.
    const [r, g, b] = light ? [140, 95, 30] : [210, 188, 138];
    const maxA = light ? .32 : .77;
    const minA = light ? .08 : .12;
    for (const s of stars) {
      const a = ((Math.sin(t * s.speed + s.phase) + 1) / 2) * (maxA - minA) + minA;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${a.toFixed(2)})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize();
  stars = mkStars(220);
  window.addEventListener('resize', () => { resize(); stars = mkStars(220); });
  requestAnimationFrame(draw);
}
