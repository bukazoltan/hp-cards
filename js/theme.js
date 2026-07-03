export const Theme = {
  init() {
    const osPref = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    const saved = localStorage.getItem('theme') || osPref;
    this.set(saved, false);
    document.getElementById('theme-toggle').addEventListener('click', () => {
      this.set(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
    });
  },
  set(t, save = true) {
    document.documentElement.dataset.theme = t;
    const btn = document.getElementById('theme-toggle');
    btn.querySelector('.toggle-icon').textContent = t === 'light' ? '☽' : '☀';
    btn.querySelector('.toggle-label').textContent = t === 'light' ? 'Dark' : 'Light';
    btn.setAttribute('aria-label', t === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    if (save) localStorage.setItem('theme', t);
  },
  isLight() { return document.documentElement.dataset.theme === 'light'; },
};
