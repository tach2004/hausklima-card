import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { chromium, devices, webkit } from '@playwright/test';
import { startPreview } from './dev.mjs';
import { demoConfig, demoStates } from '../dev/fixtures.js';

// DEMO-WERTE: only the development harness receives these synthetic HA states.
const server = await startPreview(0);
const url = `http://127.0.0.1:${server.address().port}`;
const screenshotDirectory = process.env.UPDATE_SCREENSHOTS === '1' ? 'docs/screenshots/adaptive-groups' : 'work/screenshots/adaptive-groups';
const launched = [];
const webkitDisabled = process.env.SKIP_WEBKIT === '1';
const artworkHash = 'fc840fd3cdd7ec1ecbae75a475c14674eafa28e99d7c43888ce6ffef7cbbef98';
const overlaySelector = '.photo-badge.with-metrics';

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
  if (!await tile.count()) {
    await card.locator('.overview-toggle').click();
  }
  const button = card.locator(`[data-select-room="${id}"]:visible`).first();
  await button.waitFor();
  if (touch) await button.tap(); else await button.click();
  await card.locator(`.room-detail[data-room-id="${id}"]`).waitFor();
}
async function assertLayout(page, card, name) {
  await page.evaluate(async () => {
    await window.hausklimaPreview.card.updateComplete;
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${name}: page overflow`);
  assert.equal(await card.evaluate((element) => element.scrollWidth <= element.clientWidth + 1), true, `${name}: card overflow`);
  const viewport = page.viewportSize();
  const imageBounds = await card.locator('.photo-image').boundingBox();
  assert.ok(imageBounds, `${name}: artwork available`);
  assert.ok(imageBounds.x >= -1 && imageBounds.x + imageBounds.width <= viewport.width + 1, `${name}: whole image fits horizontally`);
  assert.ok(Math.abs(imageBounds.width / imageBounds.height - 1300 / 732) < 0.01, `${name}: image retains its aspect ratio`);
  const overflow = await card.locator('.room-tile:visible, .garage-zone:visible, .photo-room.with-metrics:visible, .photo-device.with-metrics:visible, .photo-outdoor.with-metrics:visible').evaluateAll((nodes) =>
    nodes.filter((node) => node.scrollWidth > node.clientWidth + 1).map((node) => node.getAttribute('data-room-id') ?? node.textContent.trim()));
  assert.deepEqual(overflow, [], `${name}: values, names and complete units stay inside their cards`);
  const panels = await card.locator('.photo-placement:has(.with-metrics):visible').evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { id: node.getAttribute('data-overlay-id'), x: rect.x, y: rect.y, width: rect.width, height: rect.height, opacity: getComputedStyle(node).opacity, metrics: node.querySelectorAll('.photo-metric').length };
  }));
  for (let i = 0; i < panels.length; i++) {
    assert.equal(panels[i].opacity, '1', `${name}: text/icons stay opaque`);
    assert.ok(panels[i].metrics > 0, `${name}: no empty black panel`);
    for (let j = i + 1; j < panels.length; j++) {
      const a = panels[i], b = panels[j];
      const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      assert.ok(overlapX <= 1 || overlapY <= 1, `${name}: metric panels ${a.id}/${b.id} overlap`);
    }
  }
  const invalid = await card.locator('.photo-metric strong, .reading strong, .source-value strong').evaluateAll((nodes) =>
    nodes.flatMap((node) => {
      const value = node.textContent.trim();
      const type = node.closest('[data-metric]')?.getAttribute('data-metric');
      const decimal = ['temperature', 'relative_humidity', 'absolute_humidity'].includes(type);
      return value === 'Details' || /^[-+]?\d+(?:[,.]\d+)?$/.test(value) && !(decimal ? /^[-+]?\d+[,.]\d$/ : /^[-+]?\d+$/).test(value) ? [{ type, value }] : [];
    }));
  assert.deepEqual(invalid, [], `${name}: temperature/humidity have one decimal, other readings whole numbers, never a Details placeholder`);
}
async function checkResponsive(browser, engine) {
  const matrix = [
    ...[360, 390, 430, 1280, 1440, 1920].map((width) => ({ name: `width-${width}`, viewport: { width, height: width < 768 ? 900 : 1100 }, hasTouch: width < 768 })),
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
      const source = await card.locator('.photo-image').getAttribute('src');
      assert.equal(createHash('sha256').update(Buffer.from(source.slice(source.indexOf(',') + 1), 'base64')).digest('hex'), artworkHash, 'bundled WebP is bit-identical');
      const cardWidth = await card.evaluate((node) => node.clientWidth);
      if (cardWidth <= 1000) {
        const mobileBadges = card.locator('.photo-badge.with-metrics:visible');
        assert.ok(await mobileBadges.count() > 0, `${name}: compact black reading badges visible on the picture`);
        const mobileValue = card.locator('.photo-placement[data-overlay-id="laundry"] .photo-mobile-reading:visible');
        assert.ok(await mobileValue.count() > 0, `${name}: laundry reading visibly overlaid on the picture`);
        assert.ok((await mobileValue.innerText()).trim().length > 0, `${name}: mobile badge contains an actual sensor value`);
        for (const room of demoConfig.building.rooms.filter((entry) => entry.location !== 'outdoor' && entry.id !== 'demo_study')) {
          const mobileTile = card.locator(`.house-room-list [data-select-room="${room.id}"], .garage-zone[data-select-room="${room.id}"]`).first();
          assert.ok(await mobileTile.isVisible(), `${name}: mobile primary readings accessible without an extra tap for ${room.id}`);
          assert.equal(await mobileTile.locator('.reading').count(), Object.values(room.measurements ?? {}).filter((metric) => metric.visible !== false && metric.show_in_overview !== false).length);
        }
      } else {
        assert.equal(await card.locator('.photo-room.with-metrics[data-room-id="bedroom"] .photo-metric').count(), 5, `${name}: five room metrics in overlay`);
        for (const id of ['garage', 'garage_cabinet', 'garage_battery_pylontech', 'garage_battery_litime']) {
          assert.equal(await card.locator(`.photo-device[data-room-id="${id}"], .photo-garage[data-room-id="${id}"]`).count(), 1, `${name}: own device overlay ${id}`);
        }
      }
      for (const room of demoConfig.building.rooms) {
        await selectRoom(page, card, room.id, !!dimensions.hasTouch);
        const detail = card.locator(`.room-detail[data-room-id="${room.id}"]`);
        assert.equal((await detail.locator('h2').innerText()).trim(), room.name);
        const expected = Object.values(room.measurements ?? {}).reduce((count, metric) => count + metric.sensors.length, 0);
        assert.equal(await detail.locator('.sensor-row').count(), expected, `${engine}/${name}: all sources ${room.id}`);
        assert.equal(await detail.locator('.source-name small').count(), 0, `${name}: no redundant entity IDs in visible details`);
        await card.getByRole('button', { name: 'Raumdetails schließen' }).click();
      }
      if (engine === 'chromium' && name === 'width-1440') await page.screenshot({ path: `${screenshotDirectory}/panel-${theme}.png`, fullPage: true });
      if (engine === 'chromium' && name === 'iphone-17-portrait') await page.screenshot({ path: `${screenshotDirectory}/iphone-portrait-${theme}.png`, fullPage: true });
      if (engine === 'chromium' && name === 'iphone-17-landscape') await page.screenshot({ path: `${screenshotDirectory}/iphone-landscape-${theme}.png`, fullPage: true });
      assert.deepEqual(result.errors, [], `${engine}/${name}/${theme}: browser errors`);
      assert.deepEqual(result.external, [], `${engine}/${name}/${theme}: external runtime requests`);
      console.log(`PASS ${engine} ${name} ${dimensions.viewport.width}×${dimensions.viewport.height} ${theme}: complete values, all rooms/devices/sources, no collisions, unchanged artwork`);
      await page.close();
    }
  }
}
async function checkStates(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const { card, errors } = await ready(page);
  await selectRoom(page, card, 'demo_outdoor');
  const outdoor = card.locator('.room-detail');
  assert.equal(await outdoor.locator('.sensor-row').count(), 7);
  const primary = outdoor.locator('.sensor-row[data-entity="sensor.demo_outdoor_ecowitt_temperature"]');
  assert.match(await primary.innerText(), /Standardquelle.*Hauptanzeige/);
  assert.match(await primary.innerText(), /3[,.]6/);
  const states = structuredClone(demoStates);
  states['sensor.demo_outdoor_ecowitt_temperature'].state = 'unavailable';
  states['sensor.demo_outdoor_homematic_temperature'].state = 'unknown';
  delete states['sensor.demo_outdoor_homematic_humidity'];
  await page.evaluate((next) => window.hausklimaPreview.setStates(next), states);
  await page.waitForFunction(() => document.querySelector('hausklima-card').shadowRoot.querySelector('.room-detail')?.textContent.includes('Nicht verfügbar'));
  assert.match(await outdoor.innerText(), /Unbekannt/);
  assert.match(await outdoor.innerText(), /Entität fehlt/);
  assert.match(await card.locator('.photo-outdoor[data-room-id="demo_outdoor"]').innerText(), /Nicht verfügbar/, 'unavailable primary remains explicit on the image');
  assert.equal(await outdoor.locator('.sensor-row').count(), 7);
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
  assert.equal(await initial.card.locator(overlaySelector).count(), 0, 'unconfigured sensors create no dark photo panel');
  assert.equal(await initial.card.locator('.garage-zone.no-readings').count(), 4, 'unconfigured garage devices use light navigation tiles');
  const emptyBackground = await initial.card.locator('.photo-room.name-only').first().evaluate((element) => getComputedStyle(element).backgroundColor);
  assert.equal(emptyBackground, 'rgba(0, 0, 0, 0)', 'unconfigured room has no dark overlay');

  assert.equal(await initial.card.locator('.sensor-row').count(), 0);
  assert.doesNotMatch(await initial.card.evaluate((element) => element.shadowRoot.textContent), /19[,.]8|21[,.]3|745/);
  await assertLayout(empty, initial.card, 'empty-state/mobile');
  await empty.close();
  console.log('PASS live state updates: source/primary, missing/unknown/unavailable, standard entity event, empty state');
}
async function checkLongValues(browser) {
  const raw = '16.8000011444092';
  const longUnit = 'DEMO-LANGE-EINHEIT-UNVERAENDERT';
  for (const width of [390, 1280, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, hasTouch: width < 768 });
    const { card, errors } = await ready(page);
    const states = structuredClone(demoStates);
    states['sensor.demo_bedroom_temperature'].state = raw;
    states['sensor.demo_bedroom_co2'].state = '1234567890123456789012345.67';
    states['sensor.demo_bedroom_voc'].attributes.unit_of_measurement = longUnit;
    await page.evaluate((next) => {
      const config = window.hausklimaPreview.getConfig();
      config.building.rooms.find((room) => room.id === 'bedroom').measurements.voc.show_in_overview = true;
      window.hausklimaPreview.setConfig(config);
      window.hausklimaPreview.setStates(next);
    }, states);
    await assertLayout(page, card, `long-value/${width}`);
    if (width >= 1280) {
      const panel = card.locator('.photo-room.with-metrics[data-room-id="bedroom"]');
      assert.equal(await panel.locator('.photo-metric').count(), 5);
      assert.match(await panel.innerText(), /16,8/);
      assert.match(await panel.innerText(), new RegExp(longUnit));
      assert.equal(await panel.locator('[data-metric="co2"] strong').innerText(), '1234567890123456789012346', 'large CO₂ readings are rounded to whole numbers without truncation');
      assert.doesNotMatch(await panel.innerText(), /Details/);
    }
    assert.equal(await page.evaluate(() => window.hausklimaPreview.card.hass.states['sensor.demo_bedroom_temperature'].state), raw, 'rounding never mutates HA state');
    const escaping = await card.locator('.photo-room.with-metrics:visible').evaluateAll((nodes) =>
      nodes.filter((node) => node.scrollWidth > node.clientWidth + 1).map((node) => node.textContent.trim()));
    assert.deepEqual(escaping, [], `long-value/${width}: overview values remain inside their panels`);
    await selectRoom(page, card, 'bedroom', width < 768);
    const detail = card.locator('.room-detail');
    assert.match(await detail.locator('[data-entity="sensor.demo_bedroom_temperature"]').innerText(), /16,8/);
    assert.match(await detail.locator('[data-entity="sensor.demo_bedroom_voc"]').innerText(), new RegExp(longUnit));
    assert.equal(await detail.evaluate((node) => node.scrollWidth <= node.clientWidth + 1), true, `long-value/${width}: details do not overflow`);
    await assertLayout(page, card, `long-value-details/${width}`);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('PASS long values/units: metric-dependent rounding, unchanged source state and complete units, no placeholder or overflow');
}

async function checkOverlayBehavior(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const { card, errors } = await ready(page);
  const bedroom = card.locator('.photo-room.with-metrics[data-room-id="bedroom"]');
  assert.equal(await bedroom.locator('.photo-metric').count(), 5, 'all five configured metric types appear on image');
  assert.match(await bedroom.innerText(), /21,3/);
  assert.match(await bedroom.innerText(), /48,0/);
  assert.equal(await bedroom.locator('[data-metric="co2"] strong').innerText(), '745');
  assert.equal(await bedroom.locator('[data-metric="voc"] strong').innerText(), '218');
  assert.match(await bedroom.innerText(), /VOC-Index/);
  assert.equal(await card.locator('.photo-room[data-room-id="laundry"] .photo-metric strong').first().innerText(), '16,8');
  for (const id of ['garage', 'garage_cabinet', 'garage_battery_pylontech', 'garage_battery_litime']) {
    const panel = card.locator(`.photo-device.with-metrics[data-room-id="${id}"], .photo-garage.with-metrics[data-room-id="${id}"]`);
    assert.equal(await panel.count(), 1, `dedicated visible values for ${id}`);
    const target = card.locator(`.photo-object-target[data-select-room="${id}"]`);
    assert.equal(await target.count(), 1, `dedicated object touch target for ${id}`);
    const anchor = await target.evaluate((node) => ({ x: Number(node.dataset.anchorX), y: Number(node.dataset.anchorY) }));
    const imageBounds = await card.locator('.photo-image').boundingBox();
    const targetBounds = await target.boundingBox();
    assert.ok(Math.abs(targetBounds.x + targetBounds.width / 2 - imageBounds.x - imageBounds.width * anchor.x / 100) < 2, 'object target keeps its image anchor');
    assert.ok(Math.abs(targetBounds.y + targetBounds.height / 2 - imageBounds.y - imageBounds.height * anchor.y / 100) < 2, 'object target stays on image when stage extends for docks');
    await panel.click();
    await card.locator(`.room-detail[data-room-id="${id}"]`).waitFor();
    assert.equal(await card.locator('.room-detail .sensor-row').count(), 2);
    await card.getByRole('button', { name: 'Raumdetails schließen' }).click();
  }
  // All outdoor locations are selectable without combining their sensor sources.
  const outdoorSelector = card.locator('#photo-outdoor-select');
  assert.equal(await outdoorSelector.count(), 1, 'multiple outdoor locations have an explicit selector');
  for (const id of ['demo_outdoor', 'demo_outdoor_north']) {
    await outdoorSelector.selectOption(id);
    const panel = card.locator(`.photo-outdoor[data-room-id="${id}"]`);
    await panel.waitFor();
    const expected = id === 'demo_outdoor' ? '3,6' : '2,8';
    assert.match(await panel.innerText(), new RegExp(expected));
    const image = await card.locator('.photo-image').boundingBox();
    const outdoorBounds = await panel.boundingBox();
    assert.ok(outdoorBounds.y < image.y + image.height * 0.44, 'outdoor panel is in sky above the garage');
    await panel.click();
    await card.locator(`.room-detail[data-room-id="${id}"]`).waitFor();
    const entities = await card.locator('.room-detail .sensor-row').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-entity')));
    assert.equal(entities.length, id === 'demo_outdoor' ? 7 : 2);
    assert.ok(entities.every((entity) => id === 'demo_outdoor' ? !entity.includes('outdoor_north') : entity.includes('outdoor_north')), 'outdoor sources never mixed');
    await card.getByRole('button', { name: 'Raumdetails schließen' }).click();
  }
  await page.evaluate(() => {
    const config = window.hausklimaPreview.getConfig();
    for (const metric of Object.values(config.building.rooms.find((room) => room.id === 'demo_outdoor_north').measurements)) metric.visible = false;
    window.hausklimaPreview.setConfig(config);
  });
  assert.equal(await card.locator('.photo-outdoor[data-room-id="demo_outdoor"]').count(), 1, 'hiding the active outdoor location falls back to another configured location');
  assert.equal(await card.locator('.photo-outdoor[data-room-id="demo_outdoor_north"]').count(), 0, 'hidden outdoor values do not create an empty dark panel');
  await page.evaluate(() => {
    const config = window.hausklimaPreview.getConfig();
    const room = config.building.rooms.find((entry) => entry.id === 'bedroom');
    room.measurements.temperature.show_in_overview = false;
    room.measurements.relative_humidity.visible = false;
    window.hausklimaPreview.setConfig(config);
  });
  assert.equal(await bedroom.locator('.photo-metric').count(), 3, 'both visibility controls remove their corresponding overview values');
  await bedroom.click();
  assert.equal(await card.locator('.room-detail .sensor-row').count(), 5, 'hidden readings remain in details');
  await card.getByRole('button', { name: 'Raumdetails schließen' }).click();
  await page.evaluate(() => {
    const config = window.hausklimaPreview.getConfig();
    for (const metric of Object.values(config.building.rooms.find((room) => room.id === 'bedroom').measurements)) metric.visible = false;
    window.hausklimaPreview.setConfig(config);
  });
  assert.equal(await card.locator('.photo-room.with-metrics[data-room-id="bedroom"]').count(), 0, 'no active readings means no black panel');
  assert.equal(await card.locator('.photo-room.name-only[data-room-id="bedroom"]').count(), 1, 'room navigation remains');
  assert.deepEqual(errors, []);
  await page.close();
  console.log('PASS individual image overlays: five room metrics, four garage areas, outdoor selector isolation, complete details and conditional panels');
}

async function checkSceneSizing(browser) {
  const page = await browser.newPage({ viewport: { width: 3440, height: 1600 } });
  const { card, editor, errors } = await ready(page);
  const initial = await card.locator('.photo-overview').boundingBox();
  assert.ok(initial.width >= 1300 && initial.width <= 1450, 'default scene maximum is moderately enlarged');
  await page.locator('#editor-panel > summary').click();
  const slider = editor.locator('#scene-max-width');
  for (const width of [900, 1600, 2560, 3200, 1400]) {
    await slider.evaluate((node, value) => { node.value = String(value); node.dispatchEvent(new Event('input', { bubbles: true })); }, width);
    await page.waitForFunction((value) => window.hausklimaPreview.getConfig().scene_max_width === value, width);
    const bounds = await card.locator('.photo-overview').boundingBox();
    assert.ok(Math.abs(bounds.width - width) < 2, `Panel uses chosen maximum ${width}`);
    await assertLayout(page, card, `width-slider/${width}`);
    if (width === 2560) {
      await page.locator('#editor-panel > summary').click();
      await page.screenshot({ path: `${screenshotDirectory}/panel-ultrawide.png`, fullPage: true });
      await page.locator('#editor-panel > summary').click();
    }
  }
  await page.reload(); await page.waitForFunction(() => window.previewReady === true);
  assert.equal((await page.evaluate(() => window.hausklimaPreview.getConfig())).scene_max_width, 1400);
  assert.ok(Math.abs((await card.locator('.photo-overview').boundingBox()).width - 1400) < 2, 'max width survives dashboard reload');
  assert.deepEqual(errors, []);
  await page.close();
  const section = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const result = await ready(section, '/?demo=1&layout=sections&section_width=480');
  await section.evaluate(() => { const config=window.hausklimaPreview.getConfig(); config.scene_max_width=3200; window.hausklimaPreview.setConfig(config); });
  assert.ok((await result.card.locator('.photo-overview').boundingBox()).width <= 480, 'scene never overrides Sections grid/container width');
  await assertLayout(section, result.card, 'sections-width-boundary');
  await section.close();
  console.log('PASS visual scene-size slider: live 900/1600/2560/3200/1400px Panel, reload persistence and Sections width boundary');
}

async function checkSourceGroups(browser) {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1100 }, hasTouch: width < 768 });
    const { card, editor, errors, external } = await ready(page);
    const outdoor = card.locator(width < 768 ? '.outdoor-block[data-room-id="demo_outdoor"]' : '.photo-outdoor[data-room-id="demo_outdoor"]').first();
    const groups = outdoor.locator('[data-overview-group]');
    assert.deepEqual(await groups.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-overview-group'))), ['Homematic', 'Ecowitt', 'Vitodens']);
    const metricSelector = width < 768 ? '.reading' : '.photo-metric';
    const homematic = outdoor.locator('[data-overview-group="Homematic"]');
    const ecowitt = outdoor.locator('[data-overview-group="Ecowitt"]');
    assert.equal(await homematic.locator(metricSelector).count(), 2, 'temperature and humidity share their named source');
    assert.match(await homematic.innerText(), /3,4/);
    assert.match(await homematic.innerText(), /86,0/);
    assert.equal(await ecowitt.locator(metricSelector).count(), 4, 'relative and absolute air pressure join Ecowitt only');
    assert.equal(await ecowitt.locator('[data-metric="pressure_relative"] strong').innerText(), '1013');
    assert.equal(await ecowitt.locator('[data-metric="pressure_absolute"] strong').innerText(), '999');
    assert.match(await ecowitt.innerText(), /hPa/);
    assert.equal(await outdoor.locator(`${metricSelector} svg`).count(), 7, 'each visible reading uses a genuine SVG icon');

    await page.locator('#editor-panel > summary').click();
    await editor.locator('#room-select').selectOption('demo_outdoor');
    await editor.locator('#metric-select').selectOption('temperature');
    const entity = 'sensor.demo_outdoor_homematic_temperature';
    const main = editor.locator(`[data-action="sensor-overview"][data-entity="${entity}"]`);
    assert.equal(await main.isChecked(), true);
    await main.uncheck();
    await page.waitForFunction(() => window.hausklimaPreview.getConfig().building.rooms.find((room) => room.id === 'demo_outdoor').measurements.temperature.sensors[0].show_in_overview === false);
    assert.equal(await homematic.locator('[data-metric="temperature"]').count(), 0, 'unchecked source disappears from overview');
    await selectRoom(page, card, 'demo_outdoor', width < 768);
    assert.equal(await card.locator('.room-detail .sensor-row').count(), 7, 'unchecked sources remain in full details');
    await card.getByRole('button', { name: 'Raumdetails schließen' }).click();
    await main.check();
    const group = editor.locator(`[data-action="sensor-group"][data-entity="${entity}"]`);
    await group.fill('Garten West'); await group.press('Tab');
    assert.equal(await outdoor.locator('[data-overview-group="Garten West"] [data-metric="temperature"]').count(), 1, 'custom group labels are displayed');
    await editor.locator('#metric-select').selectOption('relative_humidity');
    const humidityGroup = editor.locator('[data-action="sensor-group"][data-entity="sensor.demo_outdoor_homematic_humidity"]');
    await humidityGroup.fill('Garten West'); await humidityGroup.press('Tab');
    assert.equal(await outdoor.locator(`[data-overview-group="Garten West"] ${metricSelector}`).count(), 2, 'matching free labels join metrics');
    await page.reload(); await page.waitForFunction(() => window.previewReady === true);
    assert.equal(await outdoor.locator(`[data-overview-group="Garten West"] ${metricSelector}`).count(), 2, 'selection and group names persist after reload');
    await assertLayout(page, card, `source-groups/${width}`);
    assert.deepEqual(errors, []); assert.deepEqual(external, []);
    await page.close();
  }
  // A single-source room keeps its metrics in a compact vertical column, whose
  // content width is independent of the overall scene width.
  const page = await browser.newPage({ viewport: { width: 2560, height: 1400 } });
  const { card } = await ready(page);
  await page.evaluate(() => {
    const config = window.hausklimaPreview.getConfig();
    config.scene_max_width = 2400;
    const room = config.building.rooms.find((entry) => entry.id === 'living_room');
    delete room.measurements.relative_humidity;
    window.hausklimaPreview.setConfig(config);
  });
  await assertLayout(page, card, 'adaptive-content-width');
  const compact = card.locator('.photo-room.with-metrics[data-room-id="living_room"]');
  const five = card.locator('.photo-room.with-metrics[data-room-id="bedroom"]');
  assert.ok((await compact.boundingBox()).width < 180, 'a short single reading stays narrow on a 2400px scene');
  assert.ok((await five.boundingBox()).height > (await compact.boundingBox()).height, 'additional single-source metrics grow downwards');
  const rows = await five.locator('.photo-metric').evaluateAll((nodes) => nodes.map((node) => ({ x: node.getBoundingClientRect().x, y: node.getBoundingClientRect().y })));
  assert.ok(rows.every((row) => Math.abs(row.x - rows[0].x) < 2), 'single-source room readings remain vertically aligned');
  assert.ok(rows.every((row, index) => !index || row.y > rows[index - 1].y), 'single-source readings are stacked, not in wide horizontal rows');
  await page.close();
  console.log('PASS adaptive source groups: all checked sources, editable names, isolated pressure types, icons, reload, compact vertical single-source rooms');
}

async function checkEditor(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 }, hasTouch: true });
  const { card, editor, errors, external } = await ready(page);
  await page.locator('#editor-panel > summary').click();
  const opacity = editor.locator('#chip-opacity');
  assert.equal(await opacity.inputValue(), '72', 'default translucent background is 72 percent opaque');
  await opacity.evaluate((element) => {
    element.value = '55';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  assert.equal((await page.evaluate(() => window.hausklimaPreview.getConfig())).chip_opacity, 0.55);
  assert.ok((await card.locator('ha-card').getAttribute('style')).includes('0.55'), 'opacity propagated to all dark panels');
  const sceneWidth = editor.locator('#scene-max-width');
  await sceneWidth.evaluate((element) => { element.value = '1600'; element.dispatchEvent(new Event('input', { bubbles: true })); });
  assert.equal((await page.evaluate(() => window.hausklimaPreview.getConfig())).scene_max_width, 1600, 'scene width persists via config-changed');
  // The editor panel is already open.

  await editor.locator('#room-select').selectOption('workshop');
  await editor.locator('#metric-select').selectOption('temperature');
  await editor.locator('#new-sensor select').selectOption('sensor.demo_additional_temperature');
  const alias = editor.locator('[data-action="sensor-name"][data-entity="sensor.demo_additional_temperature"]');
  await alias.fill('');
  await page.evaluate(() => window.hausklimaPreview.setStates(structuredClone(window.hausklimaPreview.card.hass.states)));
  assert.equal(await alias.inputValue(), '', 'empty alias draft must not be restored on HA updates');
  await alias.fill('Zweiter Testsensor'); await alias.press('Tab');
  const groupDraft = editor.locator('[data-action="sensor-group"][data-entity="sensor.demo_additional_temperature"]');
  await groupDraft.fill('');
  await page.evaluate(() => window.hausklimaPreview.setStates(structuredClone(window.hausklimaPreview.card.hass.states)));
  assert.equal(await groupDraft.inputValue(), '', 'group draft must remain empty during HA state updates');
  await groupDraft.fill('Lüfter'); await groupDraft.press('Tab');

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
  const roomName = editor.locator('#room-name');
  await roomName.fill('');
  await page.evaluate(() => window.hausklimaPreview.setStates(structuredClone(window.hausklimaPreview.card.hass.states)));
  assert.equal(await roomName.inputValue(), '', 'empty room-name draft must stay editable while typing');
  await roomName.fill('Werkstatt und Hobby'); await roomName.press('Tab');
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
  assert.equal(config.scene_max_width, 1600);
  assert.equal(config.chip_opacity, 0.55);
  assert.equal(config.building.garage_components_initialized, true);
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
  await editor.locator('#room-select').selectOption('demo_outdoor');
  await editor.locator('#metric-select').selectOption('temperature');
  await page.locator('#editor-panel').screenshot({ path: `${screenshotDirectory}/editor-mobile.png` });
  assert.deepEqual(errors, []); assert.deepEqual(external, []);
  await page.close();
  console.log('PASS editor: native selector contract, unlimited list operations, primary, visibility, names, indoor/outdoor, safe delete, JSON reload persistence');
}
try {
  await mkdir(screenshotDirectory, { recursive: true });
  assert.equal(createHash('sha256').update(await readFile('src/assets/hausklima-cutaway.webp')).digest('hex'), artworkHash, 'approved image file unchanged');
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : !process.env.CI && existsSync('/usr/bin/chromium') ? { executablePath: '/usr/bin/chromium' } : {}),
    headless: true,
  });
  launched.push(browser);
  await checkSourceGroups(browser);
  await checkStates(browser);
  await checkLongValues(browser);
  await checkEditor(browser);
  await checkOverlayBehavior(browser);
  await checkSceneSizing(browser);
  await checkResponsive(browser, 'chromium');
  for (const [width, sectionWidth] of [[360, 480], [1440, 480], [1440, 1100]]) {
    for (const theme of ['light', 'dark']) {
      const page = await browser.newPage({ viewport: { width, height: 1100 } });
      const { card, errors, external } = await ready(page, `/?demo=1&layout=sections&section_width=${sectionWidth}&theme=${theme}`);
      await assertLayout(page, card, `sections/${width}/${sectionWidth}/${theme}`);
      assert.deepEqual(errors, []); assert.deepEqual(external, []);
      if (width === 1440 && sectionWidth === 1100) await page.screenshot({ path: `${screenshotDirectory}/sections-${theme}.png`, fullPage: true });
      await page.close();
      console.log(`PASS Sections ${sectionWidth}px at ${width}px viewport ${theme}`);
    }
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
