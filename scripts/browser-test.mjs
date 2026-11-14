import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { chromium, devices, webkit } from '@playwright/test';
import { startPreview } from './dev.mjs';
import { demoConfig, demoStates } from '../dev/fixtures.js';

// DEMO-WERTE: only the development harness receives these synthetic HA states.
const server = await startPreview(0);
const url = `http://127.0.0.1:${server.address().port}`;
const screenshotDirectory = process.env.UPDATE_SCREENSHOTS === '1' ? 'docs/screenshots/phase-3' : 'work/screenshots/phase-3';
const launched = [];
const webkitDisabled = process.env.SKIP_WEBKIT === '1';

async function ready(page, path = '/?demo=1') {
  const errors = [], external = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => { if (!request.url().startsWith(url)) external.push(request.url()); });
  await page.goto(`${url}${path}`);
  await page.waitForFunction(() => window.previewReady === true);
  return { errors, external, card: page.locator('hausklima-card'), editor: page.locator('hausklima-card-editor') };
}
async function selectRoom(page, card, id, touch = false) {
  const tile = card.locator(`[data-select-room="${id}"]:visible`).first();
  const button = await tile.count() ? tile : card.locator(`.building [data-room-id="${id}"][role="button"]:visible`).first();
  await button.waitFor();
  if (touch) await button.tap(); else await button.click();
  await card.locator(`.room-detail[data-room-id="${id}"]`).waitFor();
}
async function assertLayout(page, card, name) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${name}: page overflow`);
  assert.equal(await card.evaluate((element) => element.scrollWidth <= element.clientWidth + 1), true, `${name}: card overflow`);
  const bounds = await card.locator('.garage-block').boundingBox();
  assert.ok(bounds, `${name}: garage exists`);
  const viewport = page.viewportSize();
  assert.ok(bounds.x >= -1 && bounds.x + bounds.width <= viewport.width + 1, `${name}: garage fully in horizontal viewport`);
  const overflows = await card.locator('.room-tile:visible').evaluateAll((nodes) => nodes.filter((node) => node.scrollWidth > node.clientWidth + 1).map((node) => node.textContent));
  assert.deepEqual(overflows, [], `${name}: room tiles overflow`);
  const cardWidth = await card.evaluate((element) => element.clientWidth);
  const sceneImage = card.locator('.photo-image');
  const imageBounds = await sceneImage.boundingBox();
  assert.ok(imageBounds, `${name}: house artwork available`);
  assert.ok(imageBounds.x >= -1 && imageBounds.x + imageBounds.width <= viewport.width + 1,
    `${name}: complete architecture image fits horizontally`);
  if (cardWidth <= 780) {
    const roomTiles = card.locator('.house-room-list [data-select-room]');
    assert.equal(await roomTiles.count(), 8, `${name}: mobile has eight selectable rooms`);
    assert.equal(await card.locator('.photo-room:visible').count(), 0, `${name}: tiny photo overlay labels hidden on phone`);
  }
  const panels = await card.locator('.photo-room.with-metrics:visible').evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { id: node.getAttribute('data-room-id'), x: rect.x, y: rect.y, width: rect.width, height: rect.height, opacity: getComputedStyle(node).opacity };
  }));
  for (let i = 0; i < panels.length; i++) {
    assert.equal(panels[i].opacity, '1', `${name}: whole metric panel must stay opaque`);
    for (let j = i + 1; j < panels.length; j++) {
      const a = panels[i], b = panels[j];
      const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      assert.ok(overlapX <= 1 || overlapY <= 1, `${name}: metric chips ${a.id}/${b.id} overlap`);
    }
  }
}
async function checkResponsive(browser, engine) {
  const matrix = [
    ...[360, 390, 430, 768, 1280, 1440].map((width) => ({ name: `width-${width}`, viewport: { width, height: width < 768 ? 900 : 1050 }, hasTouch: width < 768 })),
    { name: 'iphone-17-portrait', ...devices['iPhone 17'], deviceScaleFactor: 1 },
    { name: 'iphone-17-landscape', ...devices['iPhone 17 landscape'], deviceScaleFactor: 1 },
  ];
  for (const dimensions of matrix) {
    for (const theme of ['light', 'dark']) {
      const { name, defaultBrowserType: _browserType, ...device } = dimensions;
      const page = await browser.newPage(device);
      const result = await ready(page, `/?demo=1&theme=${theme}`);
      const { card } = result;
      assert.match(await page.locator('#mode-label').innerText(), /DEMO-WERTE/);
      await assertLayout(page, card, `${engine}/${name}/${theme}`);
      for (const room of demoConfig.building.rooms) {
        await selectRoom(page, card, room.id, !!dimensions.hasTouch);
        const detail = card.locator(`.room-detail[data-room-id="${room.id}"]`);
        assert.equal((await detail.locator('h2').innerText()).trim(), room.name);
        const expected = Object.values(room.measurements ?? {}).reduce((count, metric) => count + metric.sensors.length, 0);
        assert.equal(await detail.locator('.sensor-row').count(), expected, `${engine}/${name}: all sensors ${room.id}`);
        await card.getByRole('button', { name: 'Raumdetails schließen' }).click();
      }
      if (engine === 'chromium' && name === 'width-1440') await page.screenshot({ path: `${screenshotDirectory}/desktop-${theme}.png`, fullPage: true });
      if (engine === 'chromium' && name === 'width-390') {
        await page.screenshot({ path: `${screenshotDirectory}/mobile-overview-${theme}.png`, fullPage: true });
        await selectRoom(page, card, 'bedroom', true);
        await page.screenshot({ path: `${screenshotDirectory}/mobile-${theme}.png`, fullPage: true });
      }
      if (engine === 'chromium' && name === 'iphone-17-landscape' && theme === 'light') await page.screenshot({ path: `${screenshotDirectory}/iphone-landscape.png`, fullPage: true });
      assert.deepEqual(result.errors, [], `${engine}/${name}/${theme}: browser errors`);
      assert.deepEqual(result.external, [], `${engine}/${name}/${theme}: external runtime requests`);
      console.log(`PASS ${engine} ${name} ${dimensions.viewport.width}×${dimensions.viewport.height} ${theme}: layout, all rooms/sensors, touch, local runtime`);
      await page.close();
    }
  }
}
async function checkStates(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const { card, errors } = await ready(page);
  await selectRoom(page, card, 'demo_outdoor');
  const outdoor = card.locator('.room-detail');
  assert.equal(await outdoor.locator('.sensor-row').count(), 4);
  const primary = outdoor.locator('.sensor-row[data-entity="sensor.demo_outdoor_ecowitt_temperature"]');
  assert.match(await primary.innerText(), /Hauptsensor/);
  assert.match(await primary.innerText(), /3[,.]6/);
  const states = structuredClone(demoStates);
  states['sensor.demo_outdoor_ecowitt_temperature'].state = 'unavailable';
  states['sensor.demo_outdoor_homematic_temperature'].state = 'unknown';
  delete states['sensor.demo_outdoor_homematic_humidity'];
  await page.evaluate((next) => window.hausklimaPreview.setStates(next), states);
  await page.waitForFunction(() => document.querySelector('hausklima-card').shadowRoot.querySelector('.room-detail')?.textContent.includes('Nicht verfügbar'));
  assert.match(await outdoor.innerText(), /Unbekannt/);
  assert.match(await outdoor.innerText(), /Entität fehlt/);
  assert.equal(await outdoor.locator('.sensor-row').count(), 4);
  states['sensor.demo_outdoor_ecowitt_temperature'].state = '5.7';
  await page.evaluate((next) => window.hausklimaPreview.setStates(next), states);
  await page.waitForFunction(() => /5[,.]7/.test(document.querySelector('hausklima-card').shadowRoot.querySelector('.room-detail')?.textContent ?? ''));
  await page.evaluate(() => {
    window.testEntityEvent = null;
    window.hausklimaPreview.card.addEventListener('hass-more-info', (event) => { window.testEntityEvent = event.detail.entityId; });
  });
  await primary.click();
  assert.equal(await page.evaluate(() => window.testEntityEvent), 'sensor.demo_outdoor_ecowitt_temperature');
  assert.deepEqual(errors, []);
  await page.close();
  // Default production-style config stays an honest empty state without demo values.
  const empty = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const initial = await ready(empty, '/');
  assert.equal(await initial.card.locator('.photo-metric').count(), 0);
  assert.equal(await initial.card.locator('.sensor-row').count(), 0);
  assert.doesNotMatch(await initial.card.evaluate((element) => element.shadowRoot.textContent), /19[,.]8|21[,.]3|745/);
  await assertLayout(empty, initial.card, 'empty-state/mobile');
  await empty.close();
  console.log('PASS live state updates: source/primary, missing/unknown/unavailable, standard entity event, empty state');
}
async function checkLongValues(browser) {
  const raw = '21.333333333333333333';
  const longUnit = 'DEMO-LANGE-EINHEIT-UNVERAENDERT';
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, hasTouch: width < 768 });
    const { card, errors } = await ready(page);
    const states = structuredClone(demoStates);
    states['sensor.demo_bedroom_temperature'].state = raw;
    states['sensor.demo_bedroom_voc'].attributes.unit_of_measurement = longUnit;
    await page.evaluate((next) => {
      const config = window.hausklimaPreview.getConfig();
      config.building.rooms.find((room) => room.id === 'bedroom').measurements.voc.show_in_overview = true;
      window.hausklimaPreview.setConfig(config);
      window.hausklimaPreview.setStates(next);
    }, states);
    await assertLayout(page, card, `long-value/${width}`);
    const escaping = await card.locator('.photo-room.with-metrics:visible').evaluateAll((nodes) =>
      nodes.filter((node) => node.scrollWidth > node.clientWidth + 1).map((node) => node.textContent.trim()));
    assert.deepEqual(escaping, [], `long-value/${width}: overview values remain inside their panels`);
    await selectRoom(page, card, 'bedroom', width < 768);
    const detail = card.locator('.room-detail');
    assert.match(await detail.locator('[data-entity="sensor.demo_bedroom_temperature"]').innerText(), /21,333333333333333333/);
    assert.match(await detail.locator('[data-entity="sensor.demo_bedroom_voc"]').innerText(), new RegExp(longUnit));
    assert.equal(await detail.evaluate((node) => node.scrollWidth <= node.clientWidth + 1), true, `long-value/${width}: details do not overflow`);
    await assertLayout(page, card, `long-value-details/${width}`);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('PASS long values/units: precise source states retained in details, compact overview fallback, no overflow');
}

async function checkEditor(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 }, hasTouch: true });
  const { card, editor, errors, external } = await ready(page);
  await page.locator('#editor-panel > summary').click();
  await editor.locator('#room-select').selectOption('workshop');
  await editor.locator('#metric-select').selectOption('temperature');
  await editor.locator('#new-sensor select').selectOption('sensor.demo_additional_temperature');
  const alias = editor.locator('[data-action="sensor-name"][data-entity="sensor.demo_additional_temperature"]');
  await alias.fill('Zweiter Testsensor'); await alias.press('Tab');
  await editor.locator('[data-action="sensor-primary"][data-entity="sensor.demo_additional_temperature"]').check();
  await editor.locator('#metric-overview').uncheck();
  let config = await page.evaluate(() => window.hausklimaPreview.getConfig());
  let measurement = config.building.rooms.find((room) => room.id === 'workshop').measurements.temperature;
  assert.equal(measurement.sensors.length, 2);
  assert.equal(measurement.primary, 'sensor.demo_additional_temperature');
  assert.equal(measurement.sensors[1].name, 'Zweiter Testsensor');
  assert.equal(measurement.show_in_overview, false);
  await selectRoom(page, card, 'workshop', true);
  assert.equal(await card.locator('.room-detail [data-metric="temperature"] .sensor-row').count(), 2, 'overview hiding preserves all details');
  await editor.locator('#metric-visible').uncheck();
  await selectRoom(page, card, 'bedroom', true);
  await selectRoom(page, card, 'workshop', true);
  assert.equal(await card.locator('.room-detail [data-metric="temperature"] .sensor-row').count(), 2, 'disabled metric remains findable in details');
  await editor.locator('#room-name').fill('Werkstatt und Hobby'); await editor.locator('#room-name').press('Tab');
  await editor.locator('.new-room-settings summary').click();
  await editor.locator('#new-room-name').fill('Garage');
  await editor.locator('#new-room-kind').selectOption('indoor');
  await editor.locator('#add-room').click();
  assert.match(await editor.locator('.error[role="alert"]').innerText(), /bereits/);
  assert.equal((await page.evaluate(() => window.hausklimaPreview.getConfig())).building.rooms.filter((room) => room.name.trim().toLowerCase() === 'garage').length, 1, 'duplicate garage blocked');
  await editor.locator('#new-room-name').fill('Technikraum mit langem Anzeigenamen');
  await editor.locator('#new-room-kind').selectOption('indoor');
  await editor.locator('#add-room').click();
  config = await page.evaluate(() => window.hausklimaPreview.getConfig());
  const added = config.building.rooms.find((room) => room.name === 'Technikraum mit langem Anzeigenamen');
  assert.ok(added, 'add room through GUI');
  assert.equal(added.visible, false);
  await editor.locator('#new-room-name').fill('Außen Nord');
  await editor.locator('#new-room-kind').selectOption('outdoor');
  await editor.locator('#add-room').click();
  config = await page.evaluate(() => window.hausklimaPreview.getConfig());
  const outside = config.building.rooms.find((room) => room.name === 'Außen Nord');
  assert.equal(outside?.location, 'outdoor');
  assert.equal(config.building.rooms.filter((room) => room.id === 'garage').length, 1, 'garage not duplicated');
  await page.reload(); await page.waitForFunction(() => window.previewReady === true);
  config = await page.evaluate(() => window.hausklimaPreview.getConfig());
  measurement = config.building.rooms.find((room) => room.id === 'workshop').measurements.temperature;
  assert.equal(measurement.primary, 'sensor.demo_additional_temperature');
  assert.equal(measurement.sensors[1].name, 'Zweiter Testsensor');
  assert.equal(config.building.rooms.find((room) => room.id === 'workshop').name, 'Werkstatt und Hobby');
  assert.deepEqual(config.test_extension, { preserved: true });
  assert.deepEqual(config.grid_options, { columns: 'full', rows: 'auto' });
  await page.locator('#editor-panel > summary').click();
  await editor.locator('#room-select').selectOption(added.id);
  await editor.locator('#delete-room').click();
  await editor.locator('#cancel-delete-room').click();
  assert.ok((await page.evaluate(() => window.hausklimaPreview.getConfig())).building.rooms.some((room) => room.id === added.id));
  await editor.locator('#delete-room').click(); await editor.locator('#confirm-delete-room').click();
  assert.equal((await page.evaluate(() => window.hausklimaPreview.getConfig())).building.rooms.some((room) => room.id === added.id), false);
  await editor.locator('#room-select').selectOption('workshop');
  await editor.locator('#metric-select').selectOption('temperature');
  await editor.locator('[data-action="remove-sensor"][data-entity="sensor.demo_additional_temperature"]').click();
  config = await page.evaluate(() => window.hausklimaPreview.getConfig());
  measurement = config.building.rooms.find((room) => room.id === 'workshop').measurements.temperature;
  assert.equal(measurement.sensors.length, 1);
  assert.ok(!measurement.primary || measurement.primary === measurement.sensors[0].entity, 'removed primary has valid fallback');
  await page.screenshot({ path: `${screenshotDirectory}/editor-mobile.png`, fullPage: true });
  assert.deepEqual(errors, []); assert.deepEqual(external, []);
  await page.close();
  console.log('PASS editor: native selector contract, unlimited list operations, primary, visibility, names, indoor/outdoor, safe delete, JSON reload persistence');
}
try {
  await mkdir(screenshotDirectory, { recursive: true });
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : existsSync('/usr/bin/chromium') ? { executablePath: '/usr/bin/chromium' } : {}),
    headless: true,
  });
  launched.push(browser);
  await checkResponsive(browser, 'chromium');
  await checkStates(browser);
  await checkLongValues(browser);
  await checkEditor(browser);
  for (const width of [360, 480, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const { card, errors } = await ready(page, '/?demo=1&layout=sections');
    await assertLayout(page, card, `sections/${width}`);
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`PASS narrow Sections container at ${width}px viewport`);
  }
  if (!webkitDisabled) {
    let safari;
    try {
      const local = 'work/playwright/webkit-2388/pw_run.sh';
      safari = await webkit.launch({ ...(existsSync(local) ? { executablePath: local } : {}), headless: true });
      launched.push(safari);
    } catch (error) {
      if (process.env.REQUIRE_WEBKIT === '1') throw error;
      console.log(`SKIP WebKit: ${error.message.split('\n')[0]}`);
    }
    if (safari) { await checkResponsive(safari, 'webkit'); await checkStates(safari); }
  }
  console.log(`Screenshots: ${screenshotDirectory}`);
} finally {
  for (const browser of launched.reverse()) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
