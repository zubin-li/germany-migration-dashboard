const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function startStaticServer() {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const file = path.resolve(ROOT, relative);
    if (!file.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(response);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function runViewport(browser, baseURL, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#chart-overview canvas');

  assert.equal(await page.getAttribute('html', 'lang'), 'zh-CN');
  assert.equal(await page.getAttribute('html', 'data-theme'), 'light');
  assert.ok(await page.locator('canvas').count() >= 8, 'expected dashboard charts to initialise');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);

  const before = (await page.locator('#kpi-net-val').textContent()).trim();
  await page.locator('#filter-nationality').selectOption('IN');
  await page.locator('#btn-apply-filters').click();
  const after = (await page.locator('#kpi-net-val').textContent()).trim();
  assert.notEqual(after, before, 'nationality filter must change the net KPI');
  assert.match(await page.locator('#filter-status-indicator').textContent(), /印度|India/);

  await page.locator('#lang-opt-en').click();
  assert.equal(await page.getAttribute('html', 'lang'), 'en');
  assert.equal(await page.evaluate(() => localStorage.getItem('germany_mig_lang')), 'en');
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.getAttribute('html', 'lang'), 'en');

  await page.locator('#theme-toggle-btn').click();
  assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(consoleErrors, []);
  await context.close();
}

(async () => {
  const server = await startStaticServer();
  const address = server.address();
  const baseURL = `http://127.0.0.1:${address.port}/`;
  const browser = await chromium.launch({ headless: true });
  try {
    await runViewport(browser, baseURL, { width: 1440, height: 900 });
    await runViewport(browser, baseURL, { width: 390, height: 844 });
    console.log('Browser regression passed: desktop/mobile, state, filters, charts, and console.');
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
