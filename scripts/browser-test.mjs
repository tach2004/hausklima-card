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
const frontArtworkHash = '5b0f981d8c1daff922769eb3cc34f094a377acbfe487a4d898e4900696093f7b';
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
  // Intentionally overlapping image badges cannot all receive touch events.
  // The normal room tiles are the accessible, stable alternate entry point.
  const overviewTile = card.locator(`.house-room-list [data-select-room="${id}"]`);
  if (touch && await overviewTile.isVisible()) {
    await overviewTile.click();
    await card.locator(`.room-detail[data-room-id="${id}"]`).waitFor();
    return;
  }
  const tile = card.locator(`[data-select-room="${id}"]:visible`).first();
  if (!await tile.count()) {
    // On desktop the permanent outdoor tiles are intentionally gone.
    // Additional outdoor locations remain available via the selector in the photo.
    const outdoorSelect = card.locator('#photo-outdoor-select:visible');
    if (await outdoorSelect.count() && await outdoorSelect.locator(`option[value="${id}"]`).count()) {
      await outdoorSelect.selectOption(id);
      await page.evaluate(() => window.hausklimaPreview.card.updateComplete);
    } else {
      await card.locator('.overview-toggle').click();
    }
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
    // Overlapping boxes are allowed at exact user-selected coordinates.
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
        const mobileBadges = card.locator('.photo-badge.mobile-climate:visible');
        assert.ok(await mobileBadges.count() > 0, `${name}: named black climate badges visible on the picture`);
        const roomBadge = card.locator('.photo-room[data-room-id="laundry"]');
        assert.equal(await roomBadge.locator('.photo-mobile-name:visible').innerText(), 'Waschküche');
        assert.equal(await roomBadge.locator('.photo-mobile-name:visible .room-icon').count(), 1,
          `${name}: mobile has the same room icon as desktop`);
        assert.deepEqual(await roomBadge.locator('.photo-mobile-reading:visible').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-metric'))),
          ['temperature', 'relative_humidity'], `${name}: only temperature and humidity with separate icons on mobile`);
        assert.equal(await roomBadge.locator('.photo-mobile-reading:visible svg').count(), 2, `${name}: proper colored SVG climate symbols`);
        const leaderPaths = card.locator('.photo-leaders path[data-leader-room]');
        assert.equal(await leaderPaths.count(), 3, `${name}: cabinet and two batteries have one responsive leader line each`);
        assert.deepEqual((await leaderPaths.evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute('data-leader-room')).sort())),
          ['garage_battery_litime', 'garage_battery_pylontech', 'garage_cabinet'],
          `${name}: each leader line belongs to the correct device`);
        assert.equal(await card.locator('.photo-leaders').evaluate((svg) => getComputedStyle(svg).display), 'block',
          `${name}: phone lines must be visibly drawn`);
        const badLines = await leaderPaths.evaluateAll((nodes) => {
          const stage = nodes[0]?.closest('.photo-stage');
          const image = stage?.querySelector('.photo-image');
          const width = image?.clientWidth ?? 0;
          const height = image?.clientHeight ?? 0;
          const outer = stage?.getBoundingClientRect();
          return nodes.flatMap((path) => {
            const id = path.getAttribute('data-leader-room');
            const badge = stage?.querySelector(`.photo-placement[data-overlay-id="${id}"]`);
            const d = path.getAttribute('d') ?? '';
            const numbers = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
            if (!badge || !outer || numbers.length !== 4) return [{ id, reason: 'missing geometry' }];
            const [startX, startY, endX, endY] = numbers;
            const bounds = badge.getBoundingClientRect();
            const left = bounds.left - outer.left, right = bounds.right - outer.left;
            const top = bounds.top - outer.top, bottom = bounds.bottom - outer.top;
            const expectedX = width * Number(badge.getAttribute('data-anchor-x')) / 100;
            const expectedY = height * Number(badge.getAttribute('data-anchor-y')) / 100;
            const endsAtBox = endX >= left - 2 && endX <= right + 2 && endY >= top - 2 && endY <= bottom + 2;
            return Math.abs(startX - expectedX) < 1.5 && Math.abs(startY - expectedY) < 1.5 && endsAtBox
              ? [] : [{ id, reason: 'line does not connect object anchor to badge', d }];
          });
        });
        assert.deepEqual(badLines, [], `${name}: leader lines dynamically connect the actual object to the actual badge`);
        assert.equal(await card.locator('.photo-lower .location-column, .outdoor-block, .garage-block').count(), 0,
          `${name}: no permanent outdoor or garage summary below the illustration on mobile`);
        const outdoorSelector = card.locator('#photo-outdoor-select');
        assert.equal(await outdoorSelector.isVisible(), true, `${name}: mobile outdoor selection stays accessible`);
        const mobileValue = card.locator('.photo-placement[data-overlay-id="laundry"] .photo-mobile-reading:visible');
        assert.ok(await mobileValue.count() > 0, `${name}: laundry reading visibly overlaid on the picture`);
        assert.ok((await mobileValue.allInnerTexts()).every((reading) => reading.trim().length > 0), `${name}: both mobile readings contain actual sensor values`);
        for (const room of demoConfig.building.rooms.filter((entry) => entry.location !== 'outdoor' && entry.id !== 'demo_study')) {
          const isGarage = room.level_id === 'garage';
          const mobileTile = card.locator(isGarage
            ? `.photo-placement[data-overlay-id="${room.id}"] .photo-badge`
            : `.house-room-list [data-select-room="${room.id}"]`).first();
          assert.ok(await mobileTile.isVisible(), `${name}: ${room.id} remains visible and accessible on mobile`);
          if (!isGarage) {
            assert.equal(await mobileTile.locator('.reading').count(), Object.values(room.measurements ?? {})
              .filter((metric) => metric.visible !== false && metric.show_in_overview !== false).length);
          }
        }
      } else {
        assert.equal(await card.locator('.photo-lower .location-column, .outdoor-block, .garage-block').count(), 0,
          `${name}: no redundant outdoor or garage cards on desktop`);
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
        const rowFont = await detail.locator('.sensor-row').first().evaluate((node) => parseFloat(getComputedStyle(node).fontSize)).catch(() => 0);
        if (expected) assert.ok(rowFont >= (cardWidth <= 780 ? 13 : 14), `${name}: readable detail source typography`);
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
  assert.equal(await initial.card.locator('.photo-device, .photo-air').count(), 4, 'all four garage measurement locations remain in the illustration');
  assert.equal(await initial.card.locator('.location-column').count(), 0, 'no redundant garage/outdoor cards');
  assert.deepEqual(
    (await initial.card.locator('.photo-leaders path[data-leader-room]').evaluateAll((paths) =>
      paths.map((path) => path.getAttribute('data-leader-room')).sort())),
    ['garage_battery_litime', 'garage_battery_pylontech', 'garage_cabinet'],
    'even unconfigured garage devices retain their three label connectors without empty black panels',
  );
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
    assert.ok(Math.abs(targetBounds.y + targetBounds.height / 2 - imageBounds.y - imageBounds.height * anchor.y / 100) < 2, 'object target stays on the image');
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
    const outdoor = card.locator('.photo-outdoor[data-room-id="demo_outdoor"]').first();
    const groups = outdoor.locator('[data-overview-group]');
    assert.deepEqual(await groups.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-overview-group'))), ['Homematic', 'Ecowitt', 'Vitodens']);
    const metricSelector = '.photo-metric';
    const homematic = outdoor.locator('[data-overview-group="Homematic"]');
    const ecowitt = outdoor.locator('[data-overview-group="Ecowitt"]');
    assert.equal(await homematic.locator(metricSelector).count(), 2, 'temperature and humidity share their named source');
    assert.match(await homematic.textContent(), /3,4/);
    assert.match(await homematic.textContent(), /86,0/);
    assert.equal(await ecowitt.locator(metricSelector).count(), 4, 'relative and absolute air pressure join Ecowitt only');
    assert.equal(await ecowitt.locator('[data-metric="pressure_relative"] strong').textContent(), '1013');
    assert.equal(await ecowitt.locator('[data-metric="pressure_absolute"] strong').textContent(), '999');
    assert.match(await ecowitt.textContent(), /hPa/);
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
  const desktopSize = editor.locator('#badge-font-desktop');
  const mobileSize = editor.locator('#badge-font-mobile');
  assert.equal(await desktopSize.inputValue(), '12');
  assert.equal(await mobileSize.inputValue(), '9');
  await desktopSize.evaluate((el) => { el.value = '14'; el.dispatchEvent(new Event('change', { bubbles: true })); });
  assert.equal(await mobileSize.getAttribute('min'), '5', 'phone fonts may be smaller than 8px');
  assert.equal(await mobileSize.getAttribute('step'), '0.5', 'phone fonts support 0.5px precision');
  await mobileSize.evaluate((el) => { el.value = '5.5'; el.dispatchEvent(new Event('change', { bubbles: true })); });
  assert.equal((await page.evaluate(() => window.hausklimaPreview.getConfig())).badge_font_desktop, 14);
  assert.equal((await page.evaluate(() => window.hausklimaPreview.getConfig())).badge_font_mobile, 5.5);
  await page.evaluate(async () => { await window.hausklimaPreview.card.updateComplete; await new Promise(requestAnimationFrame); });
  const actualPhoneFont = await card.locator('.photo-mobile-reading:visible').first()
    .evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
  assert.ok(Math.abs(actualPhoneFont - 5.5) <= 0.05, 'font slider really renders badge values smaller than 8px');

  const phoneToggle = editor.locator('#mobile-metric-visible');
  await editor.locator('#room-select').selectOption('laundry');
  await editor.locator('#metric-select').selectOption('temperature');
  await phoneToggle.uncheck();
  assert.equal((await page.evaluate(() => window.hausklimaPreview.getConfig()))
    .building.rooms.find((room) => room.id === 'laundry').mobile_overview.temperature, false);
  const bedroom = card.locator('.photo-room[data-room-id="bedroom"]');
  assert.ok(await bedroom.locator('.photo-metric').count() > 0, 'desktop values unaffected by phone switches');
  await phoneToggle.check();
  // Extra phone metrics are opt-in per room, while desktop and room details
  // continue to show every enabled HA source independently.
  await editor.locator('#room-select').selectOption('bedroom');
  for (const type of ['absolute_humidity', 'co2', 'voc']) {
    await editor.locator('#metric-select').selectOption(type);
    assert.equal(await editor.locator('#mobile-metric-visible').isChecked(), false,
      `phone's additional ${type} is initially hidden`);
    await editor.locator('#mobile-metric-visible').check();
    assert.equal((await page.evaluate(() => window.hausklimaPreview.getConfig()))
      .building.rooms.find((room) => room.id === 'bedroom').mobile_overview[type], true);
  }
  const phoneBedroom = card.locator('.photo-placement[data-overlay-id="bedroom"]');
  await page.waitForFunction(() => window.hausklimaPreview.card.updateComplete);
  assert.deepEqual(await phoneBedroom.locator('.photo-mobile-reading:visible').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-metric'))),
    ['temperature', 'relative_humidity', 'absolute_humidity', 'co2', 'voc'],
    'phone can independently display all five bedroom measurement types');
  assert.equal(await phoneBedroom.locator('.photo-mobile-reading:visible svg').count(), 5,
    'each enabled optional phone value retains its icon');
  assert.equal(await phoneBedroom.locator('.photo-metric').count(), 5,
    'desktop badge values remain unchanged when phone toggles are selected');
  await editor.locator('#room-select').selectOption('demo_outdoor');
  for (const type of ['pressure_relative', 'pressure_absolute']) {
    await editor.locator('#metric-select').selectOption(type);
    assert.equal(await editor.locator('#mobile-metric-visible').isChecked(), false,
      `pressure ${type} defaults to hidden on phone`);
    await editor.locator('#mobile-metric-visible').check();
  }
  const outdoorBadge = card.locator('.photo-placement[data-overlay-id="demo_outdoor"]');
  assert.deepEqual(await outdoorBadge.locator('.photo-mobile-reading:visible').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-metric'))),
    ['temperature', 'relative_humidity', 'pressure_relative', 'pressure_absolute'],
    'both pressure types can be enabled on the phone independently');
  assert.deepEqual(await outdoorBadge.locator('.photo-mobile-qualifier:visible').allTextContents(),
    ['rel.', 'abs.'], 'phone distinguishes relative and absolute pressure just like desktop');
  assert.equal(await outdoorBadge.locator('.photo-mobile-reading[data-metric="relative_humidity"] .photo-mobile-qualifier').count(), 0,
    'humidity is never mislabeled as pressure');
  await editor.locator('#metric-select').selectOption('pressure_absolute');
  await editor.locator('#mobile-metric-visible').uncheck();
  assert.equal(await outdoorBadge.locator('.photo-mobile-reading[data-metric="pressure_absolute"]:visible').count(), 0,
    'individual optional measurement can be hidden without disturbing the other metrics');
  assert.equal(await outdoorBadge.locator('.photo-mobile-reading[data-metric="pressure_relative"]:visible').count(), 1,
    'one pressure option does not affect the other');
  assert.equal(await outdoorBadge.locator('.photo-metric').count() > 0, true,
    'all configured desktop groups remain in the DOM');
  await assertLayout(page, card, 'mobile-metric-all-types-enabled/small-font');
  // Exercise both the deliberately tiny 5.5px option and the normal default
  // when a room contains multiple optional sensors.
  await page.evaluate(() => {
    const next = window.hausklimaPreview.getConfig();
    next.badge_font_mobile = 9;
    window.hausklimaPreview.setConfig(next);
  });
  await assertLayout(page, card, 'mobile-metric-all-types-enabled/default-font');
  if (process.env.UPDATE_SCREENSHOTS === '1') {
    await page.locator('#editor-panel > summary').click();
    await page.screenshot({ path: `${screenshotDirectory}/iphone-optional-metrics.png`, fullPage: true });
    await page.locator('#editor-panel > summary').click();
  }
  await page.evaluate(() => {
    const next = window.hausklimaPreview.getConfig();
    next.badge_font_mobile = 5.5;
    window.hausklimaPreview.setConfig(next);
  });
  const theme = editor.locator('#theme-mode');
  assert.equal(await theme.inputValue(), 'auto', 'theme follows Home Assistant by default');
  await theme.selectOption('dark');
  assert.equal(await card.locator('ha-card').getAttribute('data-theme-resolved'), 'dark');
  await theme.selectOption('light');
  assert.equal(await card.locator('ha-card').getAttribute('data-theme-resolved'), 'light');
  await theme.selectOption('auto');
  assert.equal((await page.evaluate(() => window.hausklimaPreview.getConfig())).theme_mode, 'auto');
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
  assert.equal(config.theme_mode, 'auto');
  assert.equal(config.badge_font_desktop, 14);
  assert.equal(config.badge_font_mobile, 5.5);
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

async function checkOutdoorMobileBadgeWidth(browser) {
  for (const width of [360, 390, 402, 430]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: true });
    const { card, errors, external } = await ready(page);
    await page.evaluate(() => {
      const config = window.hausklimaPreview.getConfig();
      const outdoor = config.building.rooms.find((room) => room.id === 'demo_outdoor');
      for (const sensor of outdoor.measurements.temperature.sensors) sensor.show_on_mobile = true;
      for (const sensor of outdoor.measurements.relative_humidity.sensors) sensor.show_on_mobile = true;
      outdoor.mobile_overview = { ...outdoor.mobile_overview, pressure_relative: true };
      for (const sensor of outdoor.measurements.pressure_relative.sensors) sensor.show_on_mobile = true;
      window.hausklimaPreview.setConfig(config);
    });
    await assertLayout(page, card, `outdoor-multiple-sources/${width}`);
    const geometry = await card.locator('.photo-outdoor-group').evaluate((placement) => {
      const badge = placement.querySelector('.photo-badge');
      const box = badge.getBoundingClientRect();
      const stage = placement.closest('.photo-stage').getBoundingClientRect();
      const selector = placement.querySelector('select')?.getBoundingClientRect();
      const rows = [...badge.querySelectorAll('.photo-mobile-reading')].map((row) => {
        const value = row.querySelector('strong');
        const unit = row.querySelector('small');
        return {
          valueLeft: value.getBoundingClientRect().left,
          valueRight: value.getBoundingClientRect().right,
          valueTextWidth: value.scrollWidth,
          valueClientWidth: value.clientWidth,
          unitRight: unit?.getBoundingClientRect().right,
          unitTextWidth: unit?.scrollWidth,
          unitClientWidth: unit?.clientWidth,
        };
      });
      return {
        badgeWidth: box.width, boxLeft: box.left, boxRight: box.right,
        stageLeft: stage.left, stageRight: stage.right,
        placementCenterPercent: (placement.getBoundingClientRect().left + placement.getBoundingClientRect().width / 2 - stage.left) / stage.width * 100,
        autoDocked: placement.classList.contains('is-docked'),
        selectorLeft: selector?.left, selectorRight: selector?.right,
        groups: [...badge.querySelectorAll('.photo-mobile-source-group')].map((group) => {
          const heading = group.querySelector('.photo-mobile-source-heading');
          const firstReading = group.querySelector('.photo-mobile-reading');
          return {
            name: heading?.textContent.trim(),
            metrics: [...group.querySelectorAll('.photo-mobile-reading')].map((row) => row.getAttribute('data-metric')),
            headingBottom: heading?.getBoundingClientRect().bottom,
            firstReadingTop: firstReading?.getBoundingClientRect().top,
            headingOverflow: heading.scrollWidth > heading.clientWidth + 1,
          };
        }),
        rows,
      };
    });
    assert.ok(geometry.badgeWidth >= 40, `${width}: outdoor panel remains readable (actual ${geometry.badgeWidth}px)`);
    assert.ok(geometry.badgeWidth <= Math.min(360, geometry.stageRight - geometry.stageLeft - 8) + 1,
      `${width}: outdoor panel respects picture width without an arbitrary 168px limit`);
    // The user's fixed 86% center is authoritative, even for a wide label.
    // A box may extend across an image edge until manually repositioned.
    assert.ok(Math.abs(geometry.placementCenterPercent - 86) < .15,
      `${width}: outdoor panel stays centered at configured 86%, not automatically clamped`);
    assert.equal(geometry.autoDocked, false, `${width}: no automatic outdoor docking`);
    assert.ok(geometry.selectorLeft >= geometry.boxLeft - 1 && geometry.selectorRight <= geometry.boxRight + 1,
      `${width}: outdoor location selector fits the same panel width`);
    assert.equal(geometry.rows.length, 6, `${width}: three temperatures, two humidity sources and one pressure stay visible`);
    assert.deepEqual(geometry.groups.map((group) => [group.name, ...group.metrics]), [
      ['Homematic', 'temperature', 'relative_humidity'],
      ['Ecowitt', 'temperature', 'relative_humidity', 'pressure_relative'],
      ['Vitodens', 'temperature'],
    ], `${width}: group by source with temperature and humidity on separate lines`);
    for (const group of geometry.groups) {
      assert.ok(group.headingBottom <= group.firstReadingTop + 1, `${width}: heading above readings`);
      assert.equal(group.headingOverflow, false, `${width}: source heading wraps without clipping`);
    }
    for (const row of geometry.rows) {
      assert.ok(row.valueLeft >= geometry.boxLeft - 1 && row.valueRight <= geometry.boxRight - 1,
        `${width}: full outdoor value fits inside the badge`);
      assert.ok(row.valueTextWidth <= row.valueClientWidth + 1, `${width}: value text is not clipped`);
      if (row.unitRight !== undefined) {
        assert.ok(row.unitRight <= geometry.boxRight - 1, `${width}: outdoor unit fits inside the badge`);
        assert.ok(row.unitTextWidth <= row.unitClientWidth + 1, `${width}: unit text is not clipped`);
      }
    }
    assert.deepEqual(errors, [], `${width}: no JavaScript errors`);
    assert.deepEqual(external, [], `${width}: no external requests`);
    await page.close();
  }
  console.log('PASS outdoor mobile badge width: several sources, unclipped values/units, selector and responsive positions');
}

/** Content-driven sizing is independent of the number of sources and viewport. */
async function checkOutdoorNaturalWidth(browser) {
  for (const viewportWidth of [360, 402, 1280]) {
    const page = await browser.newPage({ viewport: { width: viewportWidth, height: 950 }, hasTouch: viewportWidth < 768 });
    const { card, errors, external } = await ready(page);
    const settle = async () => page.evaluate(async () => {
      await window.hausklimaPreview.card.updateComplete;
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
    });
    const applyNames = async (labels) => {
      await page.evaluate((mapping) => {
        const config = window.hausklimaPreview.getConfig();
        const room = config.building.rooms.find((item) => item.id === 'demo_outdoor');
        for (const metric of Object.values(room.measurements)) {
          for (const sensor of metric.sensors) {
            if (sensor.overview_group && mapping[sensor.overview_group]) sensor.overview_group = mapping[sensor.overview_group];
          }
        }
        for (const sensor of room.measurements.temperature.sensors) sensor.show_on_mobile = true;
        for (const sensor of room.measurements.relative_humidity.sensors) sensor.show_on_mobile = true;
        window.hausklimaPreview.setConfig(config);
      }, labels);
      await settle();
    };
    // First compare a compact version with the same sources and values.
    await applyNames({ Homematic: 'HM', Ecowitt: 'Eco', Vitodens: 'VD' });
    const short = await card.locator('.photo-outdoor-group').evaluate((node) => ({
      width: node.getBoundingClientRect().width,
      docked: node.classList.contains('is-docked'),
    }));
    await applyNames({ HM: 'Homematic Außentemperaturfühler',
      Eco: 'Ecowitt WS90 Wetterstation', VD: 'Vitodens Außensensor' });
    const long = await card.locator('.photo-outdoor-group').evaluate((node) => {
      const box = node.getBoundingClientRect();
      const image = node.closest('.photo-stage').getBoundingClientRect();
      return {
        width: box.width, left: box.left, right: box.right,
        imageLeft: image.left, imageRight: image.right,
        docked: node.classList.contains('is-docked'),
        headings: [...node.querySelectorAll('.photo-mobile-source-heading')].map((element) => ({
          text: element.textContent.trim(),
          clipped: element.scrollWidth > element.clientWidth + 1,
        })),
      };
    });
    assert.ok(long.width > short.width + 14,
      `${viewportWidth}: longer source labels enlarge the badge naturally (short ${short.width}, long ${long.width})`);
    // The outdoor anchor is fixed at 86% whether or not its text crosses
    // a picture edge; only the user may move it.
    const location = await card.locator('.photo-outdoor-group').evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const image = node.closest('.photo-stage').querySelector('.photo-image').getBoundingClientRect();
      return (rect.left + rect.width / 2 - image.left) / image.width * 100;
    });
    assert.ok(Math.abs(location - 86) < .15,
      `${viewportWidth}: outdoor center is unchanged by longer labels`);
    assert.equal(long.docked, false, `${viewportWidth}: no automatic outdoor dock`);
    assert.ok(long.width <= Math.min(360, long.imageRight - long.imageLeft - 8) + 1,
      `${viewportWidth}: named outdoor badge respects available horizontal width`);
    if (viewportWidth <= 1000) {
      assert.deepEqual(long.headings.map((h) => h.text),
        ['Homematic Außentemperaturfühler', 'Ecowitt WS90 Wetterstation', 'Vitodens Außensensor'],
        `${viewportWidth}: all mobile source names remain present`);
      assert.ok(long.headings.every((h) => !h.clipped), `${viewportWidth}: no source title is cut off`);
    }
    if (viewportWidth > 1000) {
      const groups = await card.locator('.photo-outdoor .named-group .group-readings').evaluateAll((nodes) =>
        nodes.map((group) => [...group.querySelectorAll('.photo-metric')].map((row) => ({
          x: row.getBoundingClientRect().x,
          y: row.getBoundingClientRect().y,
        }))));
      assert.ok(groups.every((rows) => rows.every((row, i) =>
        i === 0 || row.y > rows[i - 1].y && Math.abs(row.x - rows[i - 1].x) < 2)),
      `${viewportWidth}: outdoor desktop readings remain stacked, one measurement per line`);
    }
    await assertLayout(page, card, `outdoor-dynamic-width/${viewportWidth}`);
    assert.deepEqual(errors, [], `${viewportWidth}: no browser errors`);
    assert.deepEqual(external, [], `${viewportWidth}: no external runtime requests`);
    await page.close();
  }
  console.log('PASS content-sized outdoor badges: short vs long names, picture bounds, mobile/desktop');
}

async function checkPhoneSourceToggles(browser) {
  const page = await browser.newPage({ viewport: { width: 402, height: 880 }, hasTouch: true });
  const { card, editor, errors } = await ready(page);
  await page.locator('#editor-panel > summary').click();
  await editor.locator('#room-select').selectOption('demo_outdoor');
  await editor.locator('#metric-select').selectOption('temperature');
  const badge = card.locator('.photo-outdoor[data-room-id="demo_outdoor"]');
  const names = () => badge.locator('.photo-mobile-reading[data-metric="temperature"]:visible');
  const selectedEntities = () => names().evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-reading-entity')));
  const before = await badge.locator('.photo-metric').allTextContents();
  assert.deepEqual(await selectedEntities(), ['sensor.demo_outdoor_ecowitt_temperature'],
    'existing phone config still shows primary source only');
  const homematic = editor.locator('[data-action="sensor-mobile"][data-entity="sensor.demo_outdoor_homematic_temperature"]');
  const vitodens = editor.locator('[data-action="sensor-mobile"][data-entity="sensor.demo_outdoor_vitodens_temperature"]');
  const ecowitt = editor.locator('[data-action="sensor-mobile"][data-entity="sensor.demo_outdoor_ecowitt_temperature"]');
  assert.equal(await homematic.isChecked(), false, 'extra sources start hidden');
  assert.equal(await ecowitt.isChecked(), true, 'primary starts visible');
  await homematic.check();
  await vitodens.check();
  assert.deepEqual(await selectedEntities(), [
    'sensor.demo_outdoor_homematic_temperature',
    'sensor.demo_outdoor_ecowitt_temperature',
    'sensor.demo_outdoor_vitodens_temperature',
  ]);
  assert.deepEqual(await badge.locator('.photo-mobile-source-heading').allTextContents(), ['Homematic', 'Ecowitt', 'Vitodens'],
    'multiple sources show their own group name on the phone');
  assert.deepEqual(await badge.locator('.photo-metric').allTextContents(), before, 'desktop sources are independent');
  await ecowitt.uncheck();
  assert.deepEqual(await selectedEntities(), [
    'sensor.demo_outdoor_homematic_temperature', 'sensor.demo_outdoor_vitodens_temperature',
  ], 'primary can also be individually removed from the phone');
  assert.equal((await page.evaluate(() => window.hausklimaPreview.getConfig()))
    .building.rooms.find((r) => r.id === 'demo_outdoor').measurements.temperature.sensors[1].show_on_mobile, false);
  await editor.locator('#metric-select').selectOption('relative_humidity');
  const rh = editor.locator('[data-action="sensor-mobile"][data-entity="sensor.demo_outdoor_homematic_humidity"]');
  await rh.check();
  assert.deepEqual(await badge.locator('.photo-mobile-reading[data-metric="relative_humidity"]:visible').evaluateAll(
    (nodes) => nodes.map((n) => n.getAttribute('data-reading-entity'))),
    ['sensor.demo_outdoor_homematic_humidity', 'sensor.demo_outdoor_ecowitt_humidity'],
    'humidity sources can also be enabled independently');
  await editor.locator('#metric-select').selectOption('pressure_relative');
  await editor.locator('[data-action="sensor-mobile"][data-entity="sensor.demo_outdoor_relative_pressure"]').check();
  assert.equal(await badge.locator('.photo-mobile-reading[data-metric="pressure_relative"]:visible').count(), 1,
    'source-only selection also enables a previously disabled mobile metric');
  await editor.locator('#metric-select').selectOption('temperature');
  await editor.locator('#mobile-metric-visible').uncheck();
  assert.equal(await names().count(), 0, 'metric-level master switch still hides its selected sources');
  await editor.locator('#mobile-metric-visible').check();
  assert.equal(await names().count(), 2, 're-enabling the phone metric restores source-level selections');
  await assertLayout(page, card, 'phone selected sources and layout');
  if (process.env.UPDATE_SCREENSHOTS === '1') {
    await page.locator('#editor-panel > summary').click();
    await page.screenshot({ path: `${screenshotDirectory}/iphone-multiple-sources.png`, fullPage: true });
    await page.locator('#editor-panel > summary').click();
  }
  // Source checkbox states must survive editing and page reload.
  await page.reload();
  await page.waitForFunction(() => window.previewReady === true);
  const saved = await page.evaluate(() => window.hausklimaPreview.getConfig());
  const sensors = saved.building.rooms.find((r) => r.id === 'demo_outdoor').measurements.temperature.sensors;
  assert.deepEqual(sensors.map((x) => x.show_on_mobile), [true, false, true]);
  await selectRoom(page, card, 'demo_outdoor', true);
  assert.equal(await card.locator('.room-detail .sensor-row').count(), 7, 'phone source choices never remove details');
  assert.deepEqual(errors, []);
  await page.close();
  console.log('PASS phone source selection: Homematic, Ecowitt, Vitodens, RH, pressure, desktop isolation, persistence');
}


async function checkPinnedPositionsAndAllRooms(browser) {
  for (const width of [390, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width < 768 });
    const { card, errors } = await ready(page);
    await page.evaluate(() => {
      const config = window.hausklimaPreview.getConfig();
      config.badge_positions = { ...config.badge_positions,
        laundry: { desktop: { x: 54.2, y: 72.6 }, mobile: { x: 50, y: 60 } },
        workshop: { desktop: { x: 54.2, y: 72.6 }, mobile: { x: 50, y: 60 } },
        garage_battery_litime: { desktop: { x: 94.5, y: 89 }, mobile: { x: 94.5, y: 89 } } };
      window.hausklimaPreview.setConfig(config);
    });
    await page.evaluate(async () => {
      await window.hausklimaPreview.card.updateComplete;
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
    });
    const geometry = await card.locator('.photo-stage').evaluate((stage) => {
      const image = stage.querySelector('.photo-image').getBoundingClientRect();
      const get = (id) => {
        const node = stage.querySelector(`.photo-placement[data-overlay-id="${id}"]`);
        const rect = node.getBoundingClientRect();
        return { x: (rect.left + rect.width / 2 - image.left) / image.width * 100,
          y: (rect.top + rect.height / 2 - image.top) / image.height * 100,
          docked: node.classList.contains('is-docked') };
      };
      return { imageHeight: image.height, stageHeight: stage.getBoundingClientRect().height,
        laundry: get('laundry'), workshop: get('workshop'), battery: get('garage_battery_litime') };
    });
    const expected = width < 768 ? { x: 50, y: 60 } : { x: 54.2, y: 72.6 };
    for (const id of ['laundry', 'workshop']) {
      assert.ok(Math.abs(geometry[id].x - expected.x) < .1 &&
        Math.abs(geometry[id].y - expected.y) < .1,
        `${width}: ${id} keeps its exact manually set center despite overlap`);
      assert.equal(geometry[id].docked, false, 'nothing is moved to a dock');
    }
    assert.ok(Math.abs(geometry.battery.x - 94.5) < .1 && Math.abs(geometry.battery.y - 89) < .1,
      `${width}: garage battery never shifts from its configured center; measured ${JSON.stringify(geometry.battery)}`);
    assert.ok(Math.abs(geometry.stageHeight - geometry.imageHeight) < 2,
      `${width}: no dark extension below the image`);
    if (width < 768) {
      const tiles = card.locator('.house-room-list .room-tile');
      assert.equal(await tiles.count(), demoConfig.building.rooms.length,
        'all rooms, garage and outdoor locations use the same overview tiles');
      for (const id of ['garage', 'garage_cabinet', 'garage_battery_pylontech',
        'garage_battery_litime', 'demo_outdoor', 'demo_outdoor_north']) {
        const tile = card.locator(`.house-room-list .room-tile[data-select-room="${id}"]`);
        assert.equal(await tile.count(), 1, `${id} has a normal room card below the image`);
        await tile.click();
        await card.locator(`.room-detail[data-room-id="${id}"]`).waitFor();
        await card.getByRole('button', { name: 'Raumdetails schließen' }).click();
      }
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('PASS exact user coordinates, intentional overlaps, garage/outdoor room tiles, no dark dock');
}


async function checkTwoHouseSides(browser) {
  for (const width of [402, 1280, 1700]) {
    const page = await browser.newPage({ viewport: { width, height: 920 }, hasTouch: width <= 500 });
    const { card, editor, errors, external } = await ready(page);
    const rearImage = await card.locator('.photo-image').getAttribute('src');
    assert.equal(await card.locator('.photo-stage').getAttribute('data-scene-side'), 'rear', 'default is the existing rear');
    assert.equal(await card.locator('.photo-placement[data-overlay-id="front_office"]').count(), 0,
      'front rooms are not leaked into the rear');
    const rearRooms = await card.locator('.photo-room[data-room-id]').evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-room-id')));
    assert.ok(rearRooms.includes('bedroom') && rearRooms.includes('laundry'));
    const original = await page.evaluate(() => window.hausklimaPreview.getConfig());
    await card.locator('[data-house-side-switch]').click();
    await page.waitForFunction(() => window.hausklimaPreview.card.shadowRoot.querySelector('.photo-stage')?.dataset.sceneSide === 'front');
    await page.waitForTimeout(270);
    const frontImage = await card.locator('.photo-image').getAttribute('src');
    assert.equal(frontImage, rearImage, 'the right-side garage remains the same image on both sides');
    assert.equal(await card.locator('.photo-front-house-layer').count(), 1, 'front facade overlays the shared right-side garage');
    const frontFacade = await card.locator('.photo-front-house-layer').getAttribute('src');
    assert.notEqual(frontFacade, rearImage, 'the front house remains visually distinct from the rear house');
    assert.equal(await card.locator('[data-house-side-switch]').textContent().then((s) => s.includes('Rückansicht')), true);
    assert.equal(await card.locator('.photo-room[data-room-id^="front_"]').count(), 9,
      'nine front rooms, no cellar or rear-room duplicates');
    assert.equal(await card.locator('.photo-placement[data-overlay-id="laundry"]').count(), 0);
    const frontBuildings = await card.locator('.photo-placement[data-overlay-id="garage"], .photo-outdoor-group').evaluateAll((nodes) =>
      nodes.map((node) => {
        const bounds = node.closest('.photo-stage').getBoundingClientRect();
        const box = node.getBoundingClientRect();
        return { id: node.getAttribute('data-overlay-id'), x: (box.left + box.width / 2 - bounds.left) / bounds.width * 100 };
      }));
    assert.ok(frontBuildings.some((item) => item.id === 'garage' && item.x > 70),
      'garage stays in the right-side area on the front');
    assert.ok(frontBuildings.some((item) => item.id === 'demo_outdoor' && item.x > 70),
      'outdoor group stays in the right-side area on the front');
    assert.equal(await card.locator('.photo-placement[data-overlay-id="garage_battery_pylontech"]').count(), 1);
    assert.equal(await card.locator('.photo-placement[data-overlay-id="garage_cabinet"]').count(), 1);
    const sharedDeviceCoordinates = await card.locator('.photo-placement, .photo-outdoor-group').evaluateAll((nodes) =>
      nodes.filter((node) => ['garage', 'garage_cabinet', 'garage_battery_pylontech',
        'garage_battery_litime', 'demo_outdoor'].includes(node.dataset.overlayId))
        .map((node) => ({ id: node.dataset.overlayId,
          desktopX: node.dataset.manualDesktopX, mobileX: node.dataset.manualMobileX,
          preferredX: node.dataset.preferredX, preferredY: node.dataset.preferredY }))
        .sort((a, b) => a.id.localeCompare(b.id)));
    assert.equal(sharedDeviceCoordinates.length, 5, 'all five shared garage/outside devices are displayed');
    assert.ok(sharedDeviceCoordinates.every((device) => Number(device.preferredX) > 70),
      'shared garage and outside remain on the RIGHT in front view');
    const facadeAlignment = await card.locator('.photo-stage').evaluate((stage) => {
      const front = stage.querySelector('.photo-front-house-layer');
      return {
        left: getComputedStyle(front).left,
        top: getComputedStyle(front).top,
        width: front.getBoundingClientRect().width,
        clip: getComputedStyle(front).clipPath,
      };
    });
    assert.match(facadeAlignment.clip, /polygon\(33\.3% 15\.1%, 89% 15\.1%/,
      'roof crop follows its actual ridge instead of retaining a rectangular sky wedge');
    assert.ok(parseFloat(facadeAlignment.top) < 0, 'front roof covers the rear roof ridge');
    assert.ok(facadeAlignment.width > 0, 'front facade layer has a rendered width');
    const switchGeometry = await card.locator('.house-side-wrapper').evaluate((frame) => {
      const img = frame.querySelector('.photo-image').getBoundingClientRect();
      const control = frame.querySelector('[data-house-side-switch]');
      const button = control.getBoundingClientRect();
      return { anchoredInImage: control.parentElement.classList.contains('photo-stage'),
        inside: button.left >= img.left + 5 && button.top >= img.top + 5 &&
          button.right <= img.right - 5 && button.bottom <= img.bottom - 5,
        width: img.width };
    });
    assert.equal(switchGeometry.anchoredInImage, true, `${width}: side switch belongs to the real picture container`);
    assert.equal(switchGeometry.inside, true, `${width}: side switch stays inside the actual image`);
    const outdoorFonts = await card.locator('.photo-outdoor').evaluate((badge) => {
      const desktop = badge.querySelector('.source-group-name');
      const desktopName = badge.querySelector('.photo-room-name');
      const mobile = badge.querySelector('.photo-mobile-source-heading');
      const mobileName = badge.querySelector('.photo-mobile-name');
      return { desktop: parseFloat(getComputedStyle(desktop).fontSize),
        desktopName: parseFloat(getComputedStyle(desktopName).fontSize),
        mobile: parseFloat(getComputedStyle(mobile).fontSize),
        mobileName: parseFloat(getComputedStyle(mobileName).fontSize) };
    });
    assert.ok(Math.abs(outdoorFonts.desktop - outdoorFonts.desktopName * .9) < .2,
      `${width}: desktop source headings are 90% of the room title`);
    if (width <= 1000) assert.ok(Math.abs(outdoorFonts.mobile - outdoorFonts.mobileName * .9) < .2,
      `${width}: phone source headings are 90% of the room title`);
    await assertLayout(page, card, `front-side/${width}`);

    // The same native editor includes every original room setting for each side.
    await page.locator('#editor-panel > summary').click();
    await editor.locator('#editor-house-side').selectOption('front');
    const options = await editor.locator('#room-select option').evaluateAll((nodes) => nodes.map((n) => n.value));
    assert.ok(options.includes('front_office') && !options.includes('bedroom'),
      'front editor uses distinct room IDs');
    assert.ok(options.includes('garage') && options.includes('demo_outdoor'),
      'garage and outdoor sensor configurations appear once in both editors');
    await editor.locator('#room-select').selectOption('garage');
    await editor.locator('.position-settings > summary').click();
    await editor.locator('#position-x').fill('82.4');
    await editor.locator('#position-x').press('Tab');
    let sharedPositions = await page.evaluate(() => window.hausklimaPreview.getConfig());
    assert.equal(sharedPositions.badge_positions.garage.desktop.x, 82.4,
      'editing shared garage on front updates canonical rear coordinates');
    assert.equal(sharedPositions.front_badge_positions?.garage, undefined,
      'shared garage never acquires front-only position');
    await editor.locator('#editor-house-side').selectOption('rear');
    await editor.locator('#room-select').selectOption('garage');
    assert.equal(await editor.locator('#position-x').inputValue(), '82.4',
      'back-side editor immediately shows the same shared garage position');
    await editor.locator('#editor-house-side').selectOption('front');
    await editor.locator('#room-select').selectOption('front_office');
    await editor.locator('#metric-select').selectOption('temperature');
    await editor.locator('#new-sensor').evaluate((node) =>
      node.dispatchEvent(new CustomEvent('value-changed', {
        detail: { value: 'sensor.demo_front_office_temperature' }, bubbles: true, composed: true,
      })));
    let config = await page.evaluate(() => window.hausklimaPreview.getConfig());
    assert.equal(config.front_rooms.find((room) => room.id === 'front_office').measurements.temperature.sensors[0].entity,
      'sensor.demo_front_office_temperature', 'front editor persists its own source');
    assert.deepEqual(config.building.rooms.find((room) => room.id === 'bedroom'),
      original.building.rooms.find((room) => room.id === 'bedroom'), 'rear room settings are unchanged');
    await editor.locator('#position-x').fill('34.2');
    await editor.locator('#position-x').press('Tab');
    config = await page.evaluate(() => window.hausklimaPreview.getConfig());
    assert.equal(config.front_badge_positions.front_office.desktop.x, 34.2);
    assert.equal(config.badge_positions.garage.desktop.x, 82.4,
      'front room position update never alters shared garage coordinates');
    await editor.locator('#editor-house-side').selectOption('rear');
    const rearOptions = await editor.locator('#room-select option').evaluateAll((nodes) => nodes.map((n) => n.value));
    assert.ok(rearOptions.includes('bedroom') && !rearOptions.includes('front_office'),
      'rear editor settings remain isolated');
    await card.locator('[data-house-side-switch]').click();
    await page.waitForFunction(() => window.hausklimaPreview.card.shadowRoot.querySelector('.photo-stage')?.dataset.sceneSide === 'rear');
    await page.waitForTimeout(270);
    assert.equal(await card.locator('.photo-image').getAttribute('src'), rearImage, 'original rear graphic restored');
    assert.equal(await card.locator('.photo-front-house-layer').count(), 0, 'no front artwork is leaked into rear');
    assert.deepEqual(errors, [], `${width}: no runtime errors`);
    assert.deepEqual(external, [], `${width}: no external data requests`);
    await page.close();
  }
  console.log('PASS house flip: garage stays right, shared positions, image-contained button, outdoor typography and independent room sensors');
}


/** Regression: a reflow or reactive Home Assistant update must not send a
 * pointer-captured badge back to its persisted coordinates while dragging.
 * This exercises both logical layouts and real Chromium touch input.
 */
async function checkContinuousBadgeDragging(browser) {
  const variants = [
    { device: 'desktop', input: 'mouse', width: 1440 },
    { device: 'mobile', input: 'mouse', width: 390 },
    { device: 'mobile', input: 'touch', width: 430 },
  ];
  for (const variant of variants) {
    const page = await browser.newPage({ viewport: { width: variant.width, height: 1100 }, hasTouch: true });
    const { editor, errors, external } = await ready(page);
    await page.locator('#editor-panel > summary').click();
    await editor.locator('#room-select').selectOption('laundry');
    await editor.locator('.position-settings > summary').click();
    if (variant.device === 'mobile') await editor.locator('#position-device').selectOption('mobile');
    await page.waitForFunction((device) =>
      window.hausklimaPreview.editor.shadowRoot.querySelector('.position-live-canvas')?.offsetWidth
        === (device === 'mobile' ? 390 : 1280), variant.device);
    const placement = editor.locator('.position-live-canvas .photo-placement[data-overlay-id="laundry"]');
    const badge = placement.locator('.photo-badge');
    await badge.scrollIntoViewIfNeeded();
    const badgeBox = await badge.boundingBox();
    const imageBox = await editor.locator('#position-photo').boundingBox();
    assert.ok(badgeBox?.width && imageBox?.width, 'badge and photo have measurable dimensions');
    const start = { x: badgeBox.x + badgeBox.width / 2, y: badgeBox.y + badgeBox.height / 2 };
    const measure = () => placement.evaluate((element) => {
      const p = element.getBoundingClientRect();
      const image = element.closest('.photo-stage').querySelector('.photo-image').getBoundingClientRect();
      return { x: (p.left + p.width / 2 - image.left) / image.width * 100,
        y: (p.top + p.height / 2 - image.top) / image.height * 100 };
    });
    const original = await measure();
    const configBefore = await page.evaluate(() => window.hausklimaPreview.getConfig());
    const originalSaved = configBefore.badge_positions?.laundry?.[variant.device];
    const cdp = variant.input === 'touch' ? await page.context().newCDPSession(page) : undefined;
    const finger = (x, y) => [{ x, y, id: 1 }];
    if (cdp) await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart', touchPoints: finger(start.x, start.y),
    });
    else { await page.mouse.move(start.x, start.y); await page.mouse.down(); }
    for (let step = 1; step <= 4; step++) {
      const x = start.x + imageBox.width * step * .03;
      const y = start.y - imageBox.height * step * .025;
      if (cdp) await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove', touchPoints: finger(x, y),
      });
      else await page.mouse.move(x, y, { steps: 2 });
      // Let Lit and the normal layout routine run between individual moves,
      // like HA sensor refresh / ResizeObserver while a pointer is captured.
      await editor.evaluate(async (element) => {
        element.requestUpdate();
        await element.updateComplete;
        element.layoutPreview();
        await new Promise(requestAnimationFrame);
      });
      const after = await measure();
      const expectedX = original.x + step * 3;
      const expectedY = original.y - step * 2.5;
      assert.ok(Math.abs(after.x - expectedX) < .65,
        `${variant.device}/${variant.input} step ${step}: X must never jump back (${after.x} vs ${expectedX})`);
      assert.ok(Math.abs(after.y - expectedY) < .65,
        `${variant.device}/${variant.input} step ${step}: Y must never jump back (${after.y} vs ${expectedY})`);
      const during = await page.evaluate(() => window.hausklimaPreview.getConfig());
      assert.deepEqual(during.badge_positions?.laundry?.[variant.device], originalSaved,
        'drag changes are not persisted before pointer release');
    }
    if (cdp) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach(); }
    else await page.mouse.up();
    const after = await page.evaluate(() => window.hausklimaPreview.getConfig());
    const saved = after.badge_positions?.laundry?.[variant.device];
    assert.ok(saved, 'release saves the active device position');
    assert.ok(Math.abs(saved.x - (original.x + 12)) < .65 &&
      Math.abs(saved.y - (original.y - 10)) < .65,
    `${variant.device}/${variant.input}: saved position matches the last pointer move`);
    const opposite = variant.device === 'mobile' ? 'desktop' : 'mobile';
    assert.deepEqual(after.badge_positions?.laundry?.[opposite],
      configBefore.badge_positions?.laundry?.[opposite],
      'the other device position remains unchanged');
    assert.deepEqual(errors, [], 'no Lit/DOM runtime errors during continuous drag');
    assert.deepEqual(external, [], 'no external requests during continuous drag');
    await page.close();
  }
  console.log('PASS continuous dragging: desktop mouse, mobile mouse and real touch, reflow without snapping');
}

async function checkBadgePositionEditor(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 950 }, hasTouch: true });
  const { card, editor, errors } = await ready(page);
  const settlePhoto = async () => page.evaluate(async () => {
    await window.hausklimaPreview.card.updateComplete;
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
  await page.locator('#editor-panel > summary').click();
  await editor.locator('#room-select').selectOption('laundry');
  await editor.locator('.position-settings > summary').click();
  await editor.locator('#position-device').selectOption('mobile');
  const marker = editor.locator('.position-live-canvas .photo-placement[data-overlay-id="laundry"] .photo-badge');
  const image = editor.locator('#position-photo');
  assert.ok(await editor.locator('.position-live-canvas .photo-placement').count() >= 8,
    'live editor shows all actual badges rather than only one marker');
  assert.equal(await editor.locator('.position-live-canvas').getAttribute('data-preview-device'), 'mobile');
  assert.equal(await editor.locator('.position-live-canvas').evaluate((node) => node.offsetWidth), 390,
    'live mobile preview renders at actual phone breakpoint');
  const before = await image.boundingBox();
  const from = await marker.boundingBox();
  assert.ok(before && from, 'the editor shows an interactive picture and a badge');
  const editorImage = await image.getAttribute('src');
  const realImage = await card.locator('.photo-image').getAttribute('src');
  assert.equal(editorImage, realImage, 'position editor and card use the same artwork bytes');
  const previewRatio = await image.evaluate((node) => node.getBoundingClientRect().width / node.getBoundingClientRect().height);
  const realRatio = await card.locator('.photo-image').evaluate((node) => node.getBoundingClientRect().width / node.getBoundingClientRect().height);
  assert.ok(Math.abs(previewRatio - realRatio) < .001, 'editor and card use the same image aspect ratio');
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(before.x + before.width * .44, before.y + before.height * .66, { steps: 8 });
  await page.mouse.up();
  let config = await page.evaluate(() => window.hausklimaPreview.getConfig());
  assert.ok(Math.abs(config.badge_positions.laundry.mobile.x - 44) < 6, 'touch/mouse drag stores normalized X');
  assert.ok(Math.abs(config.badge_positions.laundry.mobile.y - 66) < 6, 'touch/mouse drag stores normalized Y');
  assert.equal(config.badge_positions.laundry.desktop, undefined, 'dragging mobile does not affect desktop');
  await settlePhoto();
  assert.ok(await card.locator('.photo-placement[data-overlay-id="laundry"][data-manual-mobile-x]').count(),
    'saved phone position reaches the actual image badge');
  const exact = await card.locator('.photo-placement[data-overlay-id="laundry"]').evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const bounds = node.closest('.photo-stage').querySelector('.photo-image').getBoundingClientRect();
    return { x: (rect.left + rect.width / 2 - bounds.left) / bounds.width * 100,
      y: (rect.top + rect.height / 2 - bounds.top) / bounds.height * 100 };
  });
  assert.ok(Math.abs(exact.x - config.badge_positions.laundry.mobile.x) < .15 &&
    Math.abs(exact.y - config.badge_positions.laundry.mobile.y) < .15,
  'actual overlay center agrees with editor percentage coordinates');
  if (process.env.UPDATE_SCREENSHOTS === '1') {
    await editor.locator('.position-settings').screenshot({ path: `${screenshotDirectory}/badge-position-editor-mobile.png` });
  }
  // A manually positioned garage badge keeps its exact point; the connector follows.
  const deviceId = 'garage_battery_pylontech';
  const leader = card.locator(`.photo-leaders path[data-leader-room="${deviceId}"]`);
  const originalLeader = await leader.getAttribute('d');
  assert.ok(originalLeader, 'Pylontech leader exists before movement');
  await page.evaluate((id) => {
    const next = window.hausklimaPreview.getConfig();
    next.badge_positions = { ...next.badge_positions, [id]: { mobile: { x: 88, y: 79 } } };
    window.hausklimaPreview.setConfig(next);
  }, deviceId);
  await settlePhoto();
  await page.waitForFunction(({ id, previous }) => {
    const stage = window.hausklimaPreview.card.shadowRoot.querySelector('.photo-stage');
    const line = stage?.querySelector(`.photo-leaders path[data-leader-room="${id}"]`);
    return line?.getAttribute('d') && line.getAttribute('d') !== previous;
  }, { id: deviceId, previous: originalLeader });
  const movedLeader = await leader.getAttribute('d');
  assert.notEqual(movedLeader, originalLeader, 'Pylontech line follows user-saved phone badge position');
  assert.equal(await card.locator(`.photo-placement[data-overlay-id="${deviceId}"]`).getAttribute('data-manual-mobile-x'), '88');
  // Moving only the desktop badge must NOT alter the phone connector.
  await page.evaluate((id) => {
    const next = window.hausklimaPreview.getConfig();
    next.badge_positions[id].desktop = { x: 81, y: 90 };
    window.hausklimaPreview.setConfig(next);
  }, deviceId);
  await settlePhoto();
  assert.equal(await leader.getAttribute('d'), movedLeader, 'desktop position does not change phone connector');
  // Resetting returns exactly to the original image point, never a dock.
  // Await the actual Lit render and both animation frames; testing the mere
  // existence of updateComplete previously raced with the reflow.
  await page.evaluate((id) => {
    const next = window.hausklimaPreview.getConfig();
    delete next.badge_positions[id].mobile;
    window.hausklimaPreview.setConfig(next);
  }, deviceId);
  await settlePhoto();
  await page.waitForFunction(({ id, previous }) => {
    const stage = window.hausklimaPreview.card.shadowRoot.querySelector('.photo-stage');
    const placement = stage?.querySelector(`.photo-placement[data-overlay-id="${id}"]`);
    const line = stage?.querySelector(`.photo-leaders path[data-leader-room="${id}"]`);
    return !placement?.hasAttribute('data-manual-mobile-x') && line?.getAttribute('d') &&
      line.getAttribute('d') !== previous;
  }, { id: deviceId, previous: movedLeader });
  const resetConnection = await leader.evaluate((line, id) => {
    const stage = line.closest('.photo-stage');
    const placement = stage?.querySelector(`.photo-placement[data-overlay-id="${id}"]`);
    const svgPath = line.getAttribute('d') ?? '';
    const values = [...svgPath.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
    if (!stage || !placement || values.length !== 4) return { auto: false, docked: false, connected: false };
    const bounds = placement.getBoundingClientRect();
    const stageBounds = stage.getBoundingClientRect();
    const endX = values[2], endY = values[3];
    return {
      auto: !placement.hasAttribute('data-manual-mobile-x'),
      docked: placement.classList.contains('is-docked'),
      connected: endX >= bounds.left - stageBounds.left - 2 &&
        endX <= bounds.right - stageBounds.left + 2 &&
        endY >= bounds.top - stageBounds.top - 2 &&
        endY <= bounds.bottom - stageBounds.top + 2,
    };
  }, deviceId);
  assert.deepEqual(resetConnection, { auto: true, docked: false, connected: true },
    'reset restores original image position without docking');
  // Typed percentages are saved precisely and separately for phone and desktop.
  const xInput = editor.locator('#position-x');
  const yInput = editor.locator('#position-y');
  await xInput.fill('41.3'); await xInput.press('Tab');
  await yInput.fill('62.7'); await yInput.press('Tab');
  config = await page.evaluate(() => window.hausklimaPreview.getConfig());
  assert.deepEqual(config.badge_positions.laundry.mobile, { x: 41.3, y: 62.7 },
    'typed mobile percentages persist exactly');
  const selectedMobile = structuredClone(config.badge_positions.laundry.mobile);
  await editor.locator('#position-device').selectOption('desktop');
  await page.waitForFunction(() => window.hausklimaPreview.editor?.shadowRoot
    ?.querySelector('.position-live-canvas')?.offsetWidth === 1280, null, { timeout: 5000 });
  const desktop = editor.locator('.position-live-canvas .photo-placement[data-overlay-id="laundry"] .photo-badge');
  assert.equal(await editor.locator('.position-live-canvas').getAttribute('data-preview-device'), 'desktop');
  assert.equal(await editor.locator('.position-live-canvas').evaluate((node) => node.offsetWidth), 1280,
    'desktop preview uses desktop layout even in narrow HA editor');
  await desktop.press('ArrowRight');
  config = await page.evaluate(() => window.hausklimaPreview.getConfig());
  assert.equal(config.badge_positions.laundry.desktop.x, 57, 'keyboard nudges desktop separately');
  assert.deepEqual(config.badge_positions.laundry.mobile, selectedMobile);
  const desktopX = editor.locator('#position-x');
  await desktopX.fill('32.5'); await desktopX.press('Tab');
  config = await page.evaluate(() => window.hausklimaPreview.getConfig());
  assert.equal(config.badge_positions.laundry.desktop.x, 32.5, 'desktop X can be typed independently');
  await page.reload();
  await page.waitForFunction(() => window.previewReady === true);
  config = await page.evaluate(() => window.hausklimaPreview.getConfig());
  assert.deepEqual(config.badge_positions.laundry.mobile, selectedMobile, 'phone position survives page reload');
  assert.equal(config.badge_positions.laundry.desktop.x, 32.5, 'desktop position survives page reload');
  await page.locator('#editor-panel > summary').click();
  await editor.locator('#room-select').selectOption('laundry');
  await editor.locator('.position-settings > summary').click();
  await editor.locator('#position-device').selectOption('desktop');
  await editor.locator('#position-reset').click();
  config = await page.evaluate(() => window.hausklimaPreview.getConfig());
  assert.equal(config.badge_positions.laundry.desktop, undefined, 'reset applies only to selected desktop');
  assert.deepEqual(config.badge_positions.laundry.mobile, selectedMobile);
  assert.deepEqual(errors, []);
  await page.close();
  console.log('PASS badge positions: mouse drag, keyboard, independent device storage, reload and selective reset');
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
  await checkPhoneSourceToggles(browser);
  await checkOutdoorMobileBadgeWidth(browser);
  await checkOutdoorNaturalWidth(browser);
  await checkBadgePositionEditor(browser);
  await checkContinuousBadgeDragging(browser);
  await checkPinnedPositionsAndAllRooms(browser);
  await checkTwoHouseSides(browser);
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
