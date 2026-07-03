export function initTilt(wrap) {
  if (!wrap) return;
  const TILT = 28;

  wrap.addEventListener('animationend', () => {
    wrap.style.animation = 'none';
  }, { once: true });

  wrap.addEventListener('mousemove', e => {
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top)  / r.height;
    const rx = (y - .5) * -TILT * 2;
    const ry = (x - .5) *  TILT * 2;
    const angle = Math.atan2(y - .5, x - .5) * (180 / Math.PI) + 90;
    wrap.style.transform =
      `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
    wrap.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    wrap.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    wrap.style.setProperty('--holo-angle', `${angle.toFixed(1)}deg`);
  });

  wrap.addEventListener('mouseleave', () => {
    wrap.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
  });
}
