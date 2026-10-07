import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

const MODE_KEY = 'ar-dan:mode';

const sitemapPaths = [...readFileSync('dist/sitemap-0.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  ([, loc]) => new URL(loc).pathname,
);

/** Collects console errors, uncaught exceptions and failed requests; media requests aborted mid-stream are normal. */
function watchForErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(`console: ${msg.text()}`));
  page.on('pageerror', (err) => errors.push(`exception: ${err.message}`));
  page.on('requestfailed', (req) => {
    const failure = req.failure()?.errorText ?? '';
    if (!failure.includes('ERR_ABORTED')) errors.push(`request failed: ${req.url()} (${failure})`);
  });
  page.on('response', (res) => res.status() >= 400 && errors.push(`HTTP ${res.status()}: ${res.url()}`));
  return errors;
}

const setStoredMode = (page: Page, mode: 'archi' | 'tech') =>
  page.addInitScript(([key, value]) => localStorage.setItem(key, value), [MODE_KEY, mode]);

test.describe('every page in the sitemap', () => {
  test('sitemap is not empty', () => expect(sitemapPaths.length).toBeGreaterThan(5));

  for (const path of sitemapPaths) {
    test(`loads cleanly: ${path}`, async ({ page }) => {
      const errors = watchForErrors(page);
      const res = await page.goto(path, { waitUntil: 'networkidle' });
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(errors).toEqual([]);
    });
  }
});

test.describe('mode', () => {
  test('header toggle switches mode and remembers it after a reload', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');

    for (const mode of ['tech', 'archi'] as const) {
      const button = page.locator(`.mode-toggle button[data-to="${mode}"]`);
      await button.click();
      await expect(html).toHaveAttribute('data-mode', mode);
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      await page.reload();
      await expect(html).toHaveAttribute('data-mode', mode);
    }
  });

  test('home page divider changes mode from the keyboard', async ({ page }) => {
    await page.goto('/');
    await page.locator('.mode-toggle button[data-to="tech"]').click();
    const divider = page.locator('.divider[role="slider"]');
    const html = page.locator('html');
    const value = async () => Number(await divider.getAttribute('aria-valuenow'));

    await divider.focus();
    for (let i = 0; i < 20 && (await value()) <= 50; i++) await divider.press('ArrowRight');
    expect(await value()).toBeGreaterThan(50);
    await expect(html).toHaveAttribute('data-mode', 'archi');

    for (let i = 0; i < 20 && (await value()) >= 50; i++) await divider.press('ArrowLeft');
    expect(await value()).toBeLessThan(50);
    await expect(html).toHaveAttribute('data-mode', 'tech');
  });

  for (const [mode, discipline] of [
    ['archi', 'architecture'],
    ['tech', 'software'],
  ] as const) {
    test(`/work lists ${discipline} first in ${mode} mode`, async ({ page }) => {
      await setStoredMode(page, mode);
      await page.goto('/work');
      await expect(page.locator('.sheet').first()).toHaveAttribute('data-d', discipline);
    });
  }
});

test.describe('/work filters', () => {
  test('show one discipline at a time and all again', async ({ page }) => {
    await page.goto('/work');
    const total = await page.locator('.sheet').count();
    expect(total).toBeGreaterThan(0);
    // Filtering runs inside a view transition, so the DOM updates a moment after the click.
    const visibleDisciplines = () =>
      page
        .locator('.sheet:visible')
        .evaluateAll((els) => [...new Set(els.map((el) => (el as HTMLElement).dataset.d))]);

    for (const discipline of ['software', 'architecture']) {
      await page.locator(`.filters button[data-f="${discipline}"]`).click();
      await expect(page).toHaveURL(new RegExp(`[?&]d=${discipline}`));
      await expect.poll(visibleDisciplines).toEqual([discipline]);
    }

    await page.locator('.filters button[data-f="all"]').click();
    await expect(page.locator('.sheet:visible')).toHaveCount(total);
  });
});

test.describe('old Wix URLs', () => {
  for (const [from, to] of [
    ['/about', '/cv'],
    ['/software', '/work'],
    ['/projects', '/work'],
    ['/software/etatune', '/work/etatune'],
  ]) {
    test(`${from} redirects to ${to}`, async ({ page }) => {
      await page.goto(from);
      await expect(page).toHaveURL(new RegExp(`${to}/?$`));
      await expect(page.locator('h1')).toHaveCount(1);
    });
  }
});

test('unknown URLs show the 404 page', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('404');
  await expect(page.getByRole('link', { name: /Browse all work/ })).toBeVisible();
});

test.describe('project media', () => {
  test('every gallery image loads', async ({ page }) => {
    await page.goto('/work/apartment-for-3');
    const images = await page.locator('.gallery img').all();
    expect(images.length).toBeGreaterThan(0);
    for (const img of images) {
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), { timeout: 10_000 })
        .toBe(true);
    }
  });

  test('gallery video has a playable source', async ({ page, request }) => {
    await page.goto('/work/etagen');
    const video = page.locator('.gallery video').first();
    await expect(video).toHaveCount(1);
    const src = await video.getAttribute('src');
    expect(src).toBeTruthy();
    const res = await request.get(src!.split('#')[0]);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('video/');
  });
});
