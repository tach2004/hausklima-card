import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { startPreview } from './dev.mjs';

const server = await startPreview(0);
const url = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : existsSync('/usr/bin/chromium') ? { executablePath: '/usr/bin/chromium' } : {}),
    headless: true,
  });
  await mkdir('work/screenshots', { recursive: true });
  for (const [name, width, height] of [['desktop', 1280, 1000], ['tablet', 820, 1000], ['phone', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    const external = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (!request.url().startsWith(url)) external.push(request.url()); });
    await page.goto(url);
    const card = page.locator('hausklima-card');
    await card.locator('.room').first().waitFor();
    assert.equal(await card.locator('.room').count(), 9);
    assert.equal(await card.locator('.climate-summary').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${name}: page must not overflow`);
    const scroll = card.locator('.drawing-scroll');
    assert.equal(await scroll.evaluate((node) => node.scrollWidth > node.clientWidth), width < 820, `${name}: only drawing scrolls on phone`);
    await card.locator('[data-room-id="living_room"]').focus();
    await page.keyboard.press('Enter');
    await card.locator('.room-detail').waitFor();
    assert.match(await card.locator('.room-detail').innerText(), /Wohnzimmer/);
    await card.getByRole('button', { name: 'Raumdetails schließen' }).click();
    await page.screenshot({ path: `work/screenshots/${name}-light.png`, fullPage: true });
    await page.getByRole('button', { name: 'Dunkles Theme' }).click();
    await page.screenshot({ path: `work/screenshots/${name}-dark.png`, fullPage: true });
    await page.locator('summary').click();
    const title = page.locator('hausklima-card-editor #title');
    await title.fill('Unser Haus');
    await title.press('Tab');
    await page.waitForFunction(() => document.querySelector('hausklima-card').shadowRoot.querySelector('h1')?.textContent === 'Unser Haus');
    await page.locator('hausklima-card-editor #show-dimensions').uncheck();
    assert.equal(await card.locator('.dimension-label').count(), 0);
    // Synthetic entity IDs exist only in automated tests, never in shipped defaults.
    await page.evaluate(() => {
      const instance = document.querySelector('hausklima-card');
      instance.setConfig({
        type: 'custom:hausklima-card',
        building: {
          house: { width_m: 12, depth_m: 10 },
          garage: { width_m: 6, depth_m: 6, height_m: 3, gap_m: 5, gap_is_approximate: true },
          walls: { stated_thickness_m: 0.24, exterior_thickness_m: null, interior_thickness_m: null },
          roof: { knee_wall_height_m: 1, interior_ridge_height_m: 4, pitch_degrees: null },
          levels: [{ id: 'ground_floor', name: 'Erdgeschoss', building_id: 'house', clear_height_m: 2.64 }],
          layers: [], notes: [],
          rooms: [{ id: 'test_room', name: 'Testmessort', level_id: 'ground_floor', visible: true, width_m: 6.5,
            measurements: { temperature: { sensors: [{ entity: 'sensor.test_temperature' }, { entity: 'sensor.test_secondary' }] } } }],
        },
      });
      window.testEntityEvent = null;
      instance.addEventListener('hass-more-info', (event) => { window.testEntityEvent = event.detail.entityId; });
    });
    await page.waitForFunction(() => document.querySelector('hausklima-card').shadowRoot.textContent.includes('Entität fehlt'));
    await page.evaluate(() => {
      document.querySelector('hausklima-card').hass = { states: {
        'sensor.test_temperature': { state: '21.5', attributes: { unit_of_measurement: '°C' } },
      } };
    });
    await page.waitForFunction(() => document.querySelector('hausklima-card').shadowRoot.textContent.includes('21.5 °C'));
    await card.locator('[data-room-id="test_room"]').click();
    await card.locator('.sensor-row').first().waitFor();
    assert.equal(await card.locator('.sensor-row').count(), 2);
    assert.match(await card.locator('.room-detail').innerText(), /Entität fehlt/);
    await card.locator('.sensor-row').first().click();
    assert.equal(await page.evaluate(() => window.testEntityEvent), 'sensor.test_temperature');
    assert.deepEqual(errors, [], `${name}: browser errors`);
    assert.deepEqual(external, [], `${name}: no cloud or CDN runtime requests`);
    console.log(`PASS ${name}: ${width}px, light/dark, SVG, keyboard room selection, editor, local-only runtime`);
    await page.close();
  }
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
