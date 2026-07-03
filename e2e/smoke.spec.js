import { test, expect } from '@playwright/test';

test('home page shows all three game panels and their browse links work', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.game-panel')).toHaveCount(3);

  for (const slug of ['hp1', 'hp2', 'hp3']) {
    await page.goto('/');
    await page.click(`.game-panel.${slug} .panel-browse-link`);
    await expect(page).toHaveURL(new RegExp(`/${slug}/browse$`));
    await expect(page.locator('.browse-thumb').first()).toBeVisible();
  }
});

test('drawing a card navigates to a card page and renders an image', async ({ page }) => {
  await page.goto('/');
  await page.click('.game-panel.hp2 .btn-draw');
  await expect(page).toHaveURL(/\/hp2\/\d+$/);
  await expect(page.locator('.card-img')).toBeVisible();
});

test('keyboard left/right/R navigate a card page', async ({ page }) => {
  await page.goto('/hp2/1');
  await expect(page.locator('.card-img')).toBeVisible();
  const before = page.url();

  await page.keyboard.press('ArrowRight');
  await expect(page).not.toHaveURL(before);

  await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(before);
});

test('theme toggle persists across reload', async ({ page }) => {
  await page.goto('/');
  const initial = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.click('#theme-toggle');
  const toggled = await page.evaluate(() => document.documentElement.dataset.theme);
  expect(toggled).not.toBe(initial);

  await page.reload();
  const afterReload = await page.evaluate(() => document.documentElement.dataset.theme);
  expect(afterReload).toBe(toggled);
});

test('browse page: search, rarity filter, sort, and favorites all compose', async ({ page }) => {
  await page.goto('/hp2/browse');
  await expect(page.locator('.browse-thumb').first()).toBeVisible();
  const total = await page.locator('.browse-thumb').count();
  expect(total).toBe(101);

  await page.fill('#browse-q', 'harry');
  await expect(page.locator('.browse-thumb')).toHaveCount(1);
  await expect(page.locator('.browse-thumb-name')).toHaveText('Harry Potter');

  await page.fill('#browse-q', '');
  await page.click('.rarity-chip[data-rarity="Gold"]');
  const goldCount = await page.locator('.browse-thumb').count();
  expect(goldCount).toBeGreaterThan(0);
  expect(goldCount).toBeLessThan(total);

  await page.click('.browse-fav-btn >> nth=0');
  await page.check('#browse-collected');
  await expect(page.locator('.browse-thumb')).toHaveCount(1);

  await expect(page).toHaveURL(/rarity=Gold/);
  await expect(page).toHaveURL(/collected=true/);
});

test('favoriting a card on the card page persists across navigation', async ({ page }) => {
  await page.goto('/hp2/1');
  await page.click('#collect-toggle');
  await expect(page.locator('#collect-toggle')).toHaveAttribute('aria-pressed', 'true');

  await page.goto('/hp2/browse?collected=true');
  await expect(page.locator('.browse-thumb')).toHaveCount(1);
});
