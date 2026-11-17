import { afterEach, describe, expect, it } from '../scripts/unit-test-compat';
import '../src/index';
import { HausKlimaCard } from '../src/hausklima-card';
import { getDefaultConfig, normalizeConfig } from '../src/config';
import { getDefaultBuilding } from '../src/defaults';
import type { HausKlimaCardEditor } from '../src/hausklima-card-editor';
import { METRIC_TYPES } from '../src/types';
import type { HausKlimaCardConfig, HomeAssistant } from '../src/types';

// DEMO-WERTE: synthetic entity IDs/states in these tests never enter production defaults.
afterEach(() => document.body.replaceChildren());

async function createCard(config: HausKlimaCardConfig = getDefaultConfig(), hass?: HomeAssistant) {
  const card = document.createElement('hausklima-card') as HausKlimaCard;
  card.setConfig(config);
  if (hass) card.hass = hass;
  document.body.append(card);
  await card.updateComplete;
  return card;
}

function find<T extends Element>(card: HausKlimaCard, selector: string): T {
  const element = card.shadowRoot?.querySelector<T>(selector);
  if (!element) throw new Error(`Missing card element ${selector}`);
  return element;
}

async function openRoom(card: HausKlimaCard, id: string) {
  const tile = card.shadowRoot?.querySelector<HTMLButtonElement>(`[data-select-room="${id}"]`);
  if (tile) tile.click();
  else find<HTMLButtonElement>(card, `.photo-room[data-room-id="${id}"]`).click();
  await card.updateComplete;
  return find<HTMLElement>(card, '.room-detail');
}

describe('Lovelace card integration', () => {
  it('registers the custom card for Home Assistant discovery', () => {
    expect(customElements.get('hausklima-card')).toBe(HausKlimaCard);
    const registry = window as Window & { customCards?: { type: string; name: string; preview?: boolean }[] };
    expect(registry.customCards?.filter((entry) => entry.type === 'hausklima-card')).toEqual([
      expect.objectContaining({ name: 'HausKlima Card', preview: true }),
    ]);
  });

  it('accepts the stub configuration after Home Assistant supplies the card type', async () => {
    const stub = HausKlimaCard.getStubConfig();
    expect(stub).not.toHaveProperty('type');
    const card = await createCard({ ...stub, type: 'custom:hausklima-card' });
    expect(card.shadowRoot?.querySelector('ha-card')).not.toBeNull();
    expect(card.getCardSize()).toBeGreaterThan(0);
    expect(card.getGridOptions()).toEqual({ columns: 12, rows: 'auto', min_columns: 6 });
  });

  it('returns a functional visual editor through the Home Assistant API', async () => {
    const editor = await HausKlimaCard.getConfigElement() as HausKlimaCardEditor;
    expect(editor.tagName.toLowerCase()).toBe('hausklima-card-editor');
    editor.setConfig(getDefaultConfig());
    document.body.append(editor);
    await editor.updateComplete;
    expect(editor.shadowRoot?.querySelector('#room-select')).not.toBeNull();
    expect(editor.shadowRoot?.querySelector('#metric-select')).not.toBeNull();
  });

  it('follows Home Assistant theme in auto mode and allows explicit light/dark overrides', async () => {
    const card = await createCard({ ...getDefaultConfig(), theme_mode: 'auto' }, { states: {}, themes: { darkMode: true } });
    expect(find(card, 'ha-card').getAttribute('data-theme-resolved')).toBe('dark');
    card.hass = { states: {}, themes: { darkMode: false } };
    await card.updateComplete;
    expect(find(card, 'ha-card').getAttribute('data-theme-resolved')).toBe('light');
    card.setConfig({ ...getDefaultConfig(), theme_mode: 'dark' });
    await card.updateComplete;
    expect(find(card, 'ha-card').getAttribute('data-theme-resolved')).toBe('dark');
    card.setConfig({ ...getDefaultConfig(), theme_mode: 'light' });
    await card.updateComplete;
    expect(find(card, 'ha-card').getAttribute('data-theme-resolved')).toBe('light');
    expect(() => normalizeConfig({ ...getDefaultConfig(), theme_mode: 'blue' })).toThrow(/theme_mode/);
  });

  it('keeps phone metric choices separate from desktop and validates font size limits', async () => {
    const building = getDefaultBuilding();
    const laundry = building.rooms.find((room) => room.id === 'laundry')!;
    laundry.measurements = {
      temperature: { sensors: [{ entity: 'sensor.test_laundry_temp' }] },
      relative_humidity: { sensors: [{ entity: 'sensor.test_laundry_rh' }] },
    };
    laundry.mobile_overview = { temperature: false, relative_humidity: true };
    const config = normalizeConfig({ ...getDefaultConfig(), building, badge_font_mobile: 9, badge_font_desktop: 15 });
    const card = await createCard(config, { states: {
      'sensor.test_laundry_temp': { state: '19.2', attributes: { unit_of_measurement: '°C' } },
      'sensor.test_laundry_rh': { state: '56.1', attributes: { unit_of_measurement: '%' } },
    } });
    const overlay = find(card, '.photo-room[data-room-id="laundry"]');
    expect(overlay.querySelectorAll('.photo-metric')).toHaveLength(2);
    expect(overlay.querySelector('.photo-mobile-reading[data-metric="temperature"]')).toBeNull();
    expect(overlay.querySelector('.photo-mobile-reading[data-metric="relative_humidity"]')).not.toBeNull();
    expect(overlay.querySelector('.photo-mobile-name .room-icon')).not.toBeNull();
    expect(find<HTMLElement>(card, 'ha-card').style.getPropertyValue('--hk-badge-font-desktop')).toContain('15px');
    expect(find<HTMLElement>(card, 'ha-card').style.getPropertyValue('--hk-badge-font-mobile')).toContain('9px');
    for (const [key, value] of [['badge_font_desktop', 8], ['badge_font_desktop', 21],
      ['badge_font_mobile', 4.5], ['badge_font_mobile', 17], ['badge_font_mobile', NaN]] as const) {
      expect(() => normalizeConfig({ ...config, [key]: value })).toThrow(/badge_font/);
    }
    expect(normalizeConfig({ ...config, badge_font_mobile: 5.5 }).badge_font_mobile).toBe(5.5);
    const bad = structuredClone(building);
    bad.rooms.find((room) => room.id === 'laundry')!.mobile_overview = { temperature: 'no' as unknown as boolean };
    expect(() => normalizeConfig({ ...config, building: bad })).toThrow(/mobile_overview/);
  });

  it('lets every supported sensor type be independently shown on the phone without altering desktop or details', async () => {
    const building = getDefaultBuilding();
    const laundry = building.rooms.find((room) => room.id === 'laundry')!;
    laundry.measurements = {};
    const states: HomeAssistant['states'] = {};
    for (const [index, type] of METRIC_TYPES.entries()) {
      const entity = `sensor.mobile_all_${type}`;
      laundry.measurements[type] = { sensors: [{ entity }] };
      states[entity] = { state: String(20 + index), attributes: { unit_of_measurement: type === 'co2' ? 'ppm' : 'test' } };
    }
    const config = normalizeConfig({ ...getDefaultConfig(), building });
    const card = await createCard(config, { states });
    const readings = () => [...find(card, '.photo-room[data-room-id="laundry"]').querySelectorAll('[class~="photo-mobile-reading"]')]
      .map((el) => el.getAttribute('data-metric'));
    const desktopCount = () => find(card, '.photo-room[data-room-id="laundry"]').querySelectorAll('.photo-metric').length;
    expect(readings()).toEqual(['temperature', 'relative_humidity']); // Old dashboard default
    expect(desktopCount()).toBe(8);
    const optIn = structuredClone(building);
    const room = optIn.rooms.find((r) => r.id === 'laundry')!;
    room.mobile_overview = {
      temperature: false,
      relative_humidity: true,
      absolute_humidity: true,
      co2: true,
      voc: true,
      pressure_relative: true,
      pressure_absolute: true,
      condensation_risk: true,
    };
    card.setConfig(normalizeConfig({ ...config, building: optIn }));
    await card.updateComplete;
    expect(readings()).toEqual([
      'relative_humidity', 'absolute_humidity', 'co2', 'voc', 'pressure_relative', 'pressure_absolute', 'condensation_risk',
    ]);
    expect(desktopCount()).toBe(8); // desktop sees all regardless of mobile toggle
    for (const type of METRIC_TYPES.filter((type) => type !== 'temperature')) {
      const row = find(card, `.photo-room[data-room-id="laundry"] .photo-mobile-reading[data-metric="${type}"]`);
      expect(row.querySelector('svg')).not.toBeNull();
    }
    const detail = await openRoom(card, 'laundry');
    expect(detail.querySelectorAll('.sensor-row')).toHaveLength(8); // hidden phone temp remains in details
    const valid = normalizeConfig({ ...config, building: optIn });
    expect(valid.building!.rooms.find((r) => r.id === 'laundry')!.mobile_overview?.voc).toBe(true);
    const invalidType = structuredClone(optIn);
    (invalidType.rooms.find((r) => r.id === 'laundry')!.mobile_overview as Record<string, boolean>).fake_metric = true;
    expect(() => normalizeConfig({ ...config, building: invalidType })).toThrow(/mobile_overview/);
    const invalidValue = structuredClone(optIn);
    invalidValue.rooms.find((r) => r.id === 'laundry')!.mobile_overview!.co2 = 'yes' as unknown as boolean;
    expect(() => normalizeConfig({ ...config, building: invalidValue })).toThrow(/mobile_overview/);
  });

  it('shows selected mobile sources independently per metric, including sources hidden on desktop', async () => {
    const building = getDefaultBuilding();
    const outdoor = building.rooms.find((r) => r.id === 'garage')!;
    outdoor.measurements = {
      temperature: { sensors: [
        { entity: 'sensor.test_homematic', name: 'HM Außentemperatur', overview_group: 'Homematic' },
        { entity: 'sensor.test_ecowitt', name: 'Ecowitt Außentemperatur', overview_group: 'Ecowitt', show_in_overview: true },
        { entity: 'sensor.test_vitodens', name: 'Kessel Außentemperatur', overview_group: 'Vitodens', show_in_overview: false },
      ], primary: 'sensor.test_ecowitt' },
      relative_humidity: { sensors: [{ entity: 'sensor.test_rh' }] },
    };
    const hass = { states: {
      'sensor.test_homematic': { state: '3.4', attributes: { unit_of_measurement: '°C' } },
      'sensor.test_ecowitt': { state: '3.6', attributes: { unit_of_measurement: '°C' } },
      'sensor.test_vitodens': { state: '3.8', attributes: { unit_of_measurement: '°C' } },
      'sensor.test_rh': { state: '83', attributes: { unit_of_measurement: '%' } },
    } };
    const card = await createCard({ ...getDefaultConfig(), building }, hass);
    const badge = () => find(card, '.photo-air[data-room-id="garage"]');
    const phoneEntities = () => [...badge().querySelectorAll('.photo-mobile-reading')].map((node) => node.getAttribute('data-reading-entity'));
    const desktopBefore = [...badge().querySelectorAll('.photo-metric')].map((node) => node.textContent?.trim());
    expect(phoneEntities()).toEqual(['sensor.test_ecowitt', 'sensor.test_rh']); // back-compat
    const mixed = structuredClone(building);
    const room = mixed.rooms.find((r) => r.id === 'garage')!;
    room.measurements!.temperature!.sensors[0]!.show_on_mobile = true;
    room.measurements!.temperature!.sensors[1]!.show_on_mobile = false;
    room.measurements!.temperature!.sensors[2]!.show_on_mobile = true;
    room.measurements!.relative_humidity!.sensors[0]!.show_on_mobile = false;
    card.setConfig({ ...getDefaultConfig(), building: mixed });
    await card.updateComplete;
    expect(phoneEntities()).toEqual(['sensor.test_homematic', 'sensor.test_vitodens']);
    expect([...badge().querySelectorAll('.photo-mobile-source')].map((node) => node.textContent)).toEqual(['Homematic', 'Vitodens']);
    expect([...badge().querySelectorAll('.photo-metric')].map((node) => node.textContent?.trim())).toEqual(desktopBefore);
    expect((await openRoom(card, 'garage')).querySelectorAll('.sensor-row')).toHaveLength(4);
    const invalid = structuredClone(mixed);
    invalid.rooms.find((r) => r.id === 'garage')!.measurements!.temperature!.sensors[0]!.show_on_mobile = 'yes' as unknown as boolean;
    expect(() => normalizeConfig({ ...getDefaultConfig(), building: invalid })).toThrow(/show_on_mobile/);
  });

  it('binds desktop and phone overlay position overrides without affecting sensors', async () => {
    const config = { ...getDefaultConfig(), badge_positions: {
      laundry: { desktop: { x: 20, y: 80 }, mobile: { x: 60, y: 65 } },
      garage_battery_pylontech: { mobile: { x: 85, y: 77 } },
    } };
    const card = await createCard(config);
    const laundry = find(card, '.photo-placement[data-overlay-id="laundry"]');
    expect(laundry.getAttribute('data-manual-desktop-x')).toBe('20');
    expect(laundry.getAttribute('data-manual-mobile-x')).toBe('60');
    expect(laundry.getAttribute('data-manual-mobile-y')).toBe('65');
    expect(find(card, '.photo-placement[data-overlay-id="garage_battery_pylontech"]').getAttribute('data-manual-mobile-x')).toBe('85');
    const reset = { ...getDefaultConfig(), badge_positions: {} };
    card.setConfig(reset);
    await card.updateComplete;
    expect(find(card, '.photo-placement[data-overlay-id="laundry"]').hasAttribute('data-manual-mobile-x')).toBe(false);
  });

  it('rejects invalid incoming configurations', () => {
    const card = document.createElement('hausklima-card') as HausKlimaCard;
    expect(() => card.setConfig(null)).toThrow();
    expect(() => card.setConfig({ type: 'custom:another-card' })).toThrow();
    expect(() => card.setConfig({ type: 'custom:hausklima-card', show_room_names: 'yes' })).toThrow();
  });

  it('keeps all room and garage component locations selectable without inventing readings', async () => {
    const building = getDefaultBuilding();
    const card = await createCard();
    expect(card.shadowRoot?.querySelectorAll('.photo-room')).toHaveLength(8);
    expect(card.shadowRoot?.querySelectorAll('.garage-block, .outdoor-block, .location-column')).toHaveLength(0);
    expect(card.shadowRoot?.querySelectorAll('.photo-metric, .reading, .sensor-row')).toHaveLength(0);
    expect(building.rooms.every((room) => !room.measurements || Object.values(room.measurements).every((metric) => !metric.sensors.length))).toBe(true);
    expect(find(card, '.room-tile[data-select-room="workshop"]').classList.contains('no-readings')).toBe(true);
    expect(find(card, '.house-room-list').textContent).not.toContain('Keine Sensoren zugeordnet');
    for (const room of building.rooms) {
      const detail = await openRoom(card, room.id);
      expect(detail.querySelector('h2')?.textContent).toBe(room.name);
      expect(detail.textContent).toContain('Noch keine Sensoren zugeordnet');
      expect(detail.querySelectorAll('.metric-group')).toHaveLength(0);
    }
    const image = find<HTMLImageElement>(card, '.photo-image');
    expect(image.getAttribute('src')?.length).toBeGreaterThan(10);
    expect(card.shadowRoot?.querySelectorAll('.photo-device, .photo-air')).toHaveLength(4);
  });

  it('opens room details through the accessible photo buttons and closes explicitly', async () => {
    const card = await createCard();
    const workshop = find<HTMLButtonElement>(card, '.photo-room[data-room-id="workshop"]');
    workshop.click();
    await card.updateComplete;
    expect(find(card, '.room-detail h2').textContent).toBe('Werkstatt');
    expect(workshop.getAttribute('aria-pressed')).toBe('true');
    expect(workshop.tagName).toBe('BUTTON');

    find<HTMLButtonElement>(card, '.close-detail').click();
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector('.room-detail')).toBeNull();
    expect(workshop.getAttribute('aria-pressed')).toBe('false');
    workshop.click();
    await card.updateComplete;
    expect(find(card, '.room-detail h2').textContent).toBe('Werkstatt');
  });

  it('keeps each battery and cabinet separately configurable and selectable', async () => {
    const card = await createCard();
    for (const id of ['garage', 'garage_battery_pylontech', 'garage_battery_litime', 'garage_cabinet']) {
      const button = find<HTMLButtonElement>(card, `.photo-badge[data-select-room="${id}"]`);
      button.click();
      await card.updateComplete;
      expect(find(card, '.room-detail h2').textContent).not.toBe('');
    }
  });

  it('keeps hidden additional rooms reachable through the shared room overview', async () => {
    const building = getDefaultBuilding();
    building.rooms.push({ id: 'additional_room', name: 'Weiterer Raum', level_id: 'ground_floor', visible: false, width_m: null });
    const card = await createCard({ ...getDefaultConfig(), building });
    expect(card.shadowRoot?.querySelector('.photo-stage [data-room-id="additional_room"]')).toBeNull();
    const button = find<HTMLButtonElement>(card, '.house-room-list [data-select-room="additional_room"]');
    expect(button.textContent).toContain('Weiterer Raum');
    button.click();
    await card.updateComplete;
    expect(find(card, '.room-detail h2').textContent).toBe('Weiterer Raum');
  });

  it('keeps missing sensors visible, localizes live values and emits standard entity details', async () => {
    const building = getDefaultBuilding();
    building.rooms[0]!.measurements = { temperature: { sensors: [{ entity: 'sensor.test_temperature', name: 'Testsensor' }] } };
    const card = await createCard({ ...getDefaultConfig(), building }, { states: {} });
    const tile = find(card, '.room-tile[data-select-room="workshop"]');
    expect(tile.textContent).toContain('Entität fehlt');
    expect(find(card, '.photo-room[data-room-id="workshop"] .photo-metric').textContent).toContain('Entität fehlt');
    await openRoom(card, 'workshop');
    expect(find(card, '.room-detail').textContent).toContain('Entität fehlt');

    card.hass = {
      states: { 'sensor.test_temperature': { state: '21.4', attributes: { unit_of_measurement: '°C' } } },
      locale: { language: 'de' },
    };
    await card.updateComplete;
    expect(tile.textContent).toContain('21,4');
    expect(find(card, '.room-detail').textContent).toContain('21,4');
    expect(find(card, '.room-detail .source-value').textContent).toContain('°C');
    expect(find(card, '.photo-room[data-room-id="workshop"] .photo-metric').textContent).toContain('21,4');
    expect(card.shadowRoot?.querySelector('.room-detail .unavailable')).toBeNull();

    let detail: unknown;
    card.addEventListener('hass-more-info', (event) => { detail = (event as CustomEvent).detail; });
    find<HTMLButtonElement>(card, '.sensor-row').click();
    expect(detail).toEqual({ entityId: 'sensor.test_temperature' });
  });

  it('retains every hidden metric and secondary source in room details', async () => {
    const building = getDefaultBuilding();
    building.rooms[0]!.measurements = {
      temperature: {
        visible: false, primary: 'sensor.test_secondary',
        sensors: [{ entity: 'sensor.test_temperature' }, { entity: 'sensor.test_secondary', name: 'Zweite Quelle' }],
      },
      absolute_humidity: { show_in_overview: false, sensors: [{ entity: 'sensor.test_absolute' }] },
      voc: { show_in_overview: false, sensors: [{ entity: 'sensor.test_voc' }] },
    };
    const card = await createCard({ ...getDefaultConfig(), building }, { states: {
      'sensor.test_temperature': { state: '20.4', attributes: { unit_of_measurement: '°C' } },
      'sensor.test_secondary': { state: '20.8', attributes: { unit_of_measurement: '°C' } },
      'sensor.test_absolute': { state: '8.2', attributes: { unit_of_measurement: 'g/m³' } },
      'sensor.test_voc': { state: '210', attributes: { unit_of_measurement: 'ppb' } },
    } });
    expect(card.shadowRoot?.querySelector('.photo-room[data-room-id="workshop"] .photo-metric')).toBeNull();
    expect(find(card, '.room-tile[data-select-room="workshop"]').classList.contains('no-readings')).toBe(true);
    const detail = await openRoom(card, 'workshop');
    expect(detail.querySelectorAll('.metric-group')).toHaveLength(3);
    expect(detail.querySelectorAll('.sensor-row')).toHaveLength(4);
    expect(detail.querySelectorAll('.hidden-label')).toHaveLength(3);
    expect(detail.querySelector('[data-entity="sensor.test_secondary"]')?.textContent).toContain('Standardquelle');
    expect(detail.querySelector('[data-metric="voc"] .source-value')?.textContent).toContain('ppb');
    expect(detail.querySelector('[data-metric="relative_humidity"]')).toBeNull();
    expect(detail.querySelector('[data-metric="co2"]')).toBeNull();
  });

  it('shows CO2 and VOC by default when sensors are configured, with optional hiding', async () => {
    const building = getDefaultBuilding();
    building.rooms[0]!.measurements = {
      co2: { sensors: [{ entity: 'sensor.test_co2' }] },
      voc: { show_in_overview: true, sensors: [{ entity: 'sensor.test_voc' }] },
    };
    const card = await createCard({ ...getDefaultConfig(), building }, { states: {
      'sensor.test_co2': { state: '745', attributes: { unit_of_measurement: 'ppm' } },
      'sensor.test_voc': { state: '210', attributes: { unit_of_measurement: 'ppb' } },
    } });
    const tile = find(card, '.room-tile[data-select-room="workshop"]');
    expect(tile.querySelector('[data-metric="co2"]')?.textContent).toContain('745');
    expect(tile.querySelector('[data-metric="voc"]')?.textContent).toContain('210');
    const detail = await openRoom(card, 'workshop');
    expect(detail.querySelectorAll('.metric-group')).toHaveLength(2);
  });

  it('shows no dark climate tiles without assigned entities, including all garage devices', async () => {
    const card = await createCard();
    expect(card.shadowRoot?.querySelectorAll('.photo-room.with-metrics, .photo-garage, .photo-metric')).toHaveLength(0);
    expect(card.shadowRoot?.querySelectorAll('.photo-room.name-only')).toHaveLength(8);
    expect(card.shadowRoot?.querySelectorAll('.photo-device.with-metrics, .photo-garage.with-metrics')).toHaveLength(0);
    expect(card.shadowRoot?.querySelectorAll('.location-column')).toHaveLength(0);
  });

  it('shows five optional metric types for garage air and equipment without inventing other values', async () => {
    const building = getDefaultBuilding();
    const garage = building.rooms.find((room) => room.id === 'garage')!;
    garage.measurements = {
      temperature: { sensors: [{ entity: 'sensor.test_garage_temp' }] },
      relative_humidity: { sensors: [{ entity: 'sensor.test_garage_rh' }] },
      absolute_humidity: { sensors: [{ entity: 'sensor.test_garage_ah' }] },
      co2: { sensors: [{ entity: 'sensor.test_garage_co2' }] },
      voc: { sensors: [{ entity: 'sensor.test_garage_voc' }] },
    };
    const pylontech = building.rooms.find((room) => room.id === 'garage_battery_pylontech')!;
    pylontech.measurements = { temperature: { sensors: [{ entity: 'sensor.test_battery_temp' }] } };
    const states = {
      'sensor.test_garage_temp': { state: '17.4', attributes: { unit_of_measurement: '°C' } },
      'sensor.test_garage_rh': { state: '51', attributes: { unit_of_measurement: '%' } },
      'sensor.test_garage_ah': { state: '7.6', attributes: { unit_of_measurement: 'g/m³' } },
      'sensor.test_garage_co2': { state: '640', attributes: { unit_of_measurement: 'ppm' } },
      'sensor.test_garage_voc': { state: '123', attributes: { unit_of_measurement: 'ppb' } },
      'sensor.test_battery_temp': { state: '19.2', attributes: { unit_of_measurement: '°C' } },
    };
    const card = await createCard({ ...getDefaultConfig(), chip_opacity: 0.5, building }, { states });
    const garageOverlay = find(card, '.photo-garage');
    expect(garageOverlay.querySelectorAll('.photo-metric')).toHaveLength(5);
    expect(garageOverlay.textContent).toContain('7,6');
    expect(garageOverlay.textContent).toContain('640');
    expect(garageOverlay.textContent).toContain('123');
    expect(find(card, '.photo-device[data-select-room="garage_battery_pylontech"]').textContent).toContain('19,2');
    expect(find(card, '.photo-device[data-select-room="garage_battery_litime"]').classList.contains('name-only')).toBe(true);
    expect(find<HTMLElement>(card, 'ha-card').style.getPropertyValue('--hk-chip')).toContain('0.5');
  });

  it('validates opacity input and preserves it across config normalization', () => {
    expect(() => getDefaultConfig().chip_opacity).not.toThrow();
    for (const value of [-1, 0, 0.349, 1.01, NaN, '80%']) {
      expect(() => normalizeConfig({ ...getDefaultConfig(), chip_opacity: value })).toThrow(/chip_opacity/);
    }
    expect(normalizeConfig({ ...getDefaultConfig(), chip_opacity: 0.55 }).chip_opacity).toBe(0.55);
  });

  it('distinguishes unavailable, unknown and missing outdoor sources without switching the primary', async () => {
    const building = getDefaultBuilding();
    building.rooms.push({
      id: 'test_outdoor', name: 'Außenmessort', level_id: 'ground_floor', location: 'outdoor', visible: false, width_m: null,
      measurements: { temperature: {
        primary: 'sensor.test_primary',
        sensors: [{ entity: 'sensor.test_primary', name: 'Bevorzugte Quelle' }, { entity: 'sensor.test_unknown' }, { entity: 'sensor.test_missing' }],
      } },
    });
    const card = await createCard({ ...getDefaultConfig(), building }, { states: {
      'sensor.test_primary': { state: 'unavailable', attributes: { unit_of_measurement: '°C' } },
      'sensor.test_unknown': { state: 'unknown', attributes: { unit_of_measurement: '°C' } },
    } });
    expect(find(card, '.photo-stage .photo-outdoor[data-room-id="test_outdoor"]').textContent).toContain('Nicht verfügbar');
    expect(card.shadowRoot?.querySelector('.outdoor-block, .garage-block, .location-column')).toBeNull();
    const detail = await openRoom(card, 'test_outdoor');
    expect(detail.querySelectorAll('.sensor-row')).toHaveLength(3);
    expect(detail.textContent).toContain('Nicht verfügbar');
    expect(detail.textContent).toContain('Unbekannt');
    expect(detail.textContent).toContain('Entität fehlt');
    expect(detail.querySelectorAll('.primary-sensor')).toHaveLength(1);
    expect(detail.querySelector('.primary-sensor')?.getAttribute('data-entity')).toBe('sensor.test_primary');
    card.hass = { states: {
      'sensor.test_primary': { state: '3.6', attributes: { unit_of_measurement: '°C' } },
      'sensor.test_unknown': { state: '4.2', attributes: { unit_of_measurement: '°C' } },
    } };
    await card.updateComplete;
    expect(find(card, '.room-detail .primary-sensor').textContent).toContain('3,6');
    expect(find(card, '.room-detail .primary-sensor').getAttribute('data-entity')).toBe('sensor.test_primary');
    expect(find(card, '.room-detail').querySelectorAll('.sensor-row')).toHaveLength(3);
  });

  it('toggles the explicit room overview without changing the configured room set', async () => {
    const card = await createCard();
    const toggle = find<HTMLButtonElement>(card, '.overview-toggle');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    toggle.click();
    await card.updateComplete;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(find(card, '.rooms-section').classList.contains('expanded')).toBe(true);
    expect(card.shadowRoot?.querySelectorAll('.house-room-list [data-select-room]')).toHaveLength(getDefaultBuilding().rooms.length);
    expect(card.shadowRoot?.querySelector('.photo-air[data-select-room="garage"]')).not.toBeNull();
  });

  it('clears details when the selected room is removed by a saved editor update', async () => {
    const building = getDefaultBuilding();
    const card = await createCard({ ...getDefaultConfig(), building });
    await openRoom(card, 'workshop');
    const next = structuredClone(building);
    next.rooms = next.rooms.filter((room) => room.id !== 'workshop');
    card.setConfig({ ...getDefaultConfig(), building: next });
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector('.room-detail')).toBeNull();
    expect(card.shadowRoot?.querySelector('[data-select-room="workshop"]')).toBeNull();
  });

  it('updates title and optional labels while keeping technical details out of the main drawing', async () => {
    const card = await createCard();
    expect(card.shadowRoot?.querySelector('.photo-stage .dimension-label')).toBeNull();
    expect(card.shadowRoot?.querySelector('.building-details')).not.toBeNull();
    card.setConfig({ ...getDefaultConfig(), title: 'Mein Haus', show_room_names: false, show_dimensions: false });
    await card.updateComplete;
    expect(find(card, 'h1').textContent).toBe('Mein Haus');
    expect(card.shadowRoot?.querySelectorAll('.photo-room-name, .dimension-label, .building-details')).toHaveLength(0);
    expect(card.shadowRoot?.querySelectorAll('.photo-room')).toHaveLength(8);
    expect(card.shadowRoot?.querySelector('.photo-air[data-select-room="garage"]')).not.toBeNull();
  });
});
