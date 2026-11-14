import { afterEach, describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import '../src/index';
import type { HausKlimaCard } from '../src/hausklima-card';
import { getDefaultConfig } from '../src/config';
import { getDefaultBuilding } from '../src/defaults';
import type { BuildingConfig, HausKlimaCardConfig, HomeAssistant, RoomConfig } from '../src/types';

// DEMO-WERTE: synthetic fixtures are confined to tests; no production sensor IDs.
afterEach(() => document.body.replaceChildren());

async function createCard(building = getDefaultBuilding(), hass: HomeAssistant = { states: {} }, config: Partial<HausKlimaCardConfig> = {}) {
  const card = document.createElement('hausklima-card') as HausKlimaCard;
  card.hass = hass;
  card.setConfig({ ...getDefaultConfig(), building, ...config });
  document.body.append(card);
  await card.updateComplete;
  return card;
}

function query<T extends Element>(card: HausKlimaCard, selector: string): T {
  const node = card.shadowRoot?.querySelector<T>(selector);
  if (!node) throw new Error(`Missing card element ${selector}`);
  return node;
}

const textValues = (element: Element) => [...element.querySelectorAll('.photo-metric strong')].map((node) => node.textContent?.trim());

function outdoor(id: string, name: string, entity: string, extraEntity?: string): RoomConfig {
  return {
    id, name, level_id: 'ground_floor', visible: false, width_m: null, location: 'outdoor',
    measurements: { temperature: {
      sensors: [{ entity, name: `${name} Hauptquelle` }, ...(extraEntity ? [{ entity: extraEntity, name: `${name} Nebenquelle` }] : [])],
      primary: entity,
    } },
  };
}

describe('approved-image climate overlays', () => {
  it('keeps the approved WebP byte-identical', () => {
    const bytes = readFileSync('src/assets/hausklima-cutaway.webp');
    expect(createHash('sha256').update(bytes).digest('hex')).toBe('fc840fd3cdd7ec1ecbae75a475c14674eafa28e99d7c43888ce6ffef7cbbef98');
  });

  it('renders all five rounded primary values and complete units in the room panel, never a Details replacement', async () => {
    const building = getDefaultBuilding();
    const room = building.rooms.find((entry) => entry.id === 'laundry')!;
    room.measurements = {
      temperature: { sensors: [{ entity: 'sensor.test_laundry_temperature' }, { entity: 'sensor.test_laundry_secondary' }], primary: 'sensor.test_laundry_temperature' },
      relative_humidity: { sensors: [{ entity: 'sensor.test_laundry_relative' }] },
      absolute_humidity: { sensors: [{ entity: 'sensor.test_laundry_absolute' }] },
      co2: { sensors: [{ entity: 'sensor.test_laundry_co2' }] },
      voc: { sensors: [{ entity: 'sensor.test_laundry_voc' }] },
    };
    const longUnit = 'VOC-Index-lange-tatsaechliche-Sensoreinheit';
    const hass: HomeAssistant = { locale: { language: 'de' }, states: {
      'sensor.test_laundry_temperature': { state: '16.8000011444092', attributes: { unit_of_measurement: '°C' } },
      'sensor.test_laundry_secondary': { state: '18.2999999999999', attributes: { unit_of_measurement: '°C' } },
      'sensor.test_laundry_relative': { state: '68.5', attributes: { unit_of_measurement: '%' } },
      'sensor.test_laundry_absolute': { state: '5', attributes: { unit_of_measurement: 'g/m³' } },
      'sensor.test_laundry_co2': { state: '745', attributes: { unit_of_measurement: 'ppm' } },
      'sensor.test_laundry_voc': { state: '12345678901234567890', attributes: { unit_of_measurement: longUnit } },
    } };
    const card = await createCard(building, hass);
    const panel = query<HTMLButtonElement>(card, '.photo-room.with-metrics[data-room-id="laundry"]');
    expect(textValues(panel)).toEqual(['16,8', '68,5', '5,0', '745,0', '12345678901234567890,0']);
    expect([...panel.querySelectorAll('.photo-metric small')].map((node) => node.textContent)).toEqual(['°C', '%', 'g/m³', 'ppm', longUnit]);
    expect(panel.textContent).not.toContain('Details');
    panel.click();
    await card.updateComplete;
    const details = query(card, '.room-detail[data-room-id="laundry"]');
    expect(details.querySelectorAll('.sensor-row')).toHaveLength(6);
    expect(details.querySelector('[data-entity="sensor.test_laundry_secondary"] .source-value strong')?.textContent).toBe('18,3');
    expect(details.querySelector('[data-entity="sensor.test_laundry_voc"]')?.textContent).toContain(longUnit);
    expect(hass.states['sensor.test_laundry_temperature']!.state).toBe('16.8000011444092');
    expect(hass.states['sensor.test_laundry_voc']!.state).toBe('12345678901234567890');
  });

  it('retains all assigned source details when overview flags remove every dark room panel', async () => {
    const building = getDefaultBuilding();
    const room = building.rooms.find((entry) => entry.id === 'living_room')!;
    room.measurements = {
      temperature: { visible: false, sensors: [{ entity: 'sensor.test_hidden_temperature' }] },
      voc: { show_in_overview: false, sensors: [{ entity: 'sensor.test_hidden_voc' }] },
    };
    const card = await createCard(building);
    const panel = query<HTMLButtonElement>(card, '.photo-room[data-room-id="living_room"]');
    expect(panel.classList.contains('name-only')).toBe(true);
    expect(panel.classList.contains('with-metrics')).toBe(false);
    expect(panel.querySelectorAll('.photo-metric')).toHaveLength(0);
    panel.click();
    await card.updateComplete;
    expect(query(card, '.room-detail').querySelectorAll('.sensor-row')).toHaveLength(2);
    expect(query(card, '.room-detail').querySelectorAll('.hidden-label')).toHaveLength(2);
    expect(card.shadowRoot?.querySelectorAll('.photo-badge.with-metrics')).toHaveLength(0);
  });

  it('binds four independent garage panels and explicit object touch targets to their own detail sources', async () => {
    const building = getDefaultBuilding();
    const ids = ['garage', 'garage_cabinet', 'garage_battery_pylontech', 'garage_battery_litime'];
    const states: HomeAssistant['states'] = {};
    ids.forEach((id, index) => {
      const room = building.rooms.find((entry) => entry.id === id)!;
      room.name = `Eigener Name ${index + 1}`;
      room.measurements = { temperature: { sensors: [{ entity: `sensor.test_${id}_temperature` }] } };
      states[`sensor.test_${id}_temperature`] = { state: String(index + 5), attributes: { unit_of_measurement: '°C' } };
    });
    const card = await createCard(building, { states });
    expect(card.shadowRoot?.querySelectorAll('.photo-device.with-metrics')).toHaveLength(3);
    expect(card.shadowRoot?.querySelectorAll('.photo-garage.with-metrics')).toHaveLength(1);
    expect(card.shadowRoot?.querySelectorAll('.photo-object-target')).toHaveLength(4);
    for (const [index, id] of ids.entries()) {
      const panel = query<HTMLButtonElement>(card, `.photo-badge.with-metrics[data-room-id="${id}"]`);
      expect(textValues(panel)).toEqual([`${index + 5},0`]);
      expect(panel.querySelector('.photo-room-name')?.textContent).toBe(`Eigener Name ${index + 1}`);
      panel.click();
      await card.updateComplete;
      expect(query(card, '.room-detail').getAttribute('data-room-id')).toBe(id);
      expect(query(card, '.room-detail .sensor-row').getAttribute('data-entity')).toBe(`sensor.test_${id}_temperature`);
      query<HTMLButtonElement>(card, '.close-detail').click();
      await card.updateComplete;
      query<HTMLButtonElement>(card, `.photo-object-target[data-select-room="${id}"]`).click();
      await card.updateComplete;
      expect(query(card, '.room-detail').getAttribute('data-room-id')).toBe(id);
    }
  });

  it('adds no dark device panels for unconfigured or explicitly hidden garage measurements', async () => {
    const building = getDefaultBuilding();
    building.rooms.find((room) => room.id === 'garage_battery_pylontech')!.measurements = {
      temperature: { sensors: [{ entity: 'sensor.test_pylontech_temperature' }] },
    };
    building.rooms.find((room) => room.id === 'garage_battery_litime')!.measurements = {
      temperature: { visible: false, sensors: [{ entity: 'sensor.test_litime_temperature' }] },
    };
    const card = await createCard(building);
    expect(card.shadowRoot?.querySelectorAll('.photo-badge.with-metrics')).toHaveLength(1);
    expect(query(card, '.photo-badge.with-metrics').getAttribute('data-room-id')).toBe('garage_battery_pylontech');
    expect(query(card, '.photo-device[data-room-id="garage_cabinet"]').classList.contains('name-only')).toBe(true);
    expect(query(card, '.photo-device[data-room-id="garage_battery_litime"]').classList.contains('name-only')).toBe(true);
    expect(card.shadowRoot?.querySelector('.photo-garage')).toBeNull();
  });

  it('navigates active outdoor locations in saved order without mixing primary or secondary sources', async () => {
    const building = getDefaultBuilding();
    const first = outdoor('outdoor_z', 'Terrasse', 'sensor.test_terrace', 'sensor.test_terrace_secondary');
    const second = outdoor('outdoor_a', 'Garten', 'sensor.test_garden');
    const empty = outdoor('outdoor_empty', 'Ohne aktive Werte', 'sensor.test_hidden_outdoor');
    empty.measurements!.temperature!.show_in_overview = false;
    building.rooms.push(first, second, empty);
    const hass: HomeAssistant = { states: {
      'sensor.test_terrace': { state: '4', attributes: { unit_of_measurement: '°C' } },
      'sensor.test_terrace_secondary': { state: '5.1', attributes: { unit_of_measurement: '°C' } },
      'sensor.test_garden': { state: '-2.2', attributes: { unit_of_measurement: '°C' } },
    } };
    const card = await createCard(building, hass);
    let select = query<HTMLSelectElement>(card, '[data-outdoor-selector]');
    expect([...select.options].map((option) => option.value)).toEqual(['outdoor_z', 'outdoor_a']);
    expect(select.value).toBe('outdoor_z');
    expect(textValues(query(card, '.photo-outdoor'))).toEqual(['4,0']);
    expect(card.shadowRoot?.querySelectorAll('.photo-outdoor')).toHaveLength(1);
    select.value = 'outdoor_a';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await card.updateComplete;
    const panel = query<HTMLButtonElement>(card, '.photo-outdoor');
    expect(panel.getAttribute('data-room-id')).toBe('outdoor_a');
    expect(textValues(panel)).toEqual(['-2,2']);
    panel.click();
    await card.updateComplete;
    expect(query(card, '.room-detail').querySelectorAll('.sensor-row')).toHaveLength(1);
    expect(query(card, '.room-detail .sensor-row').getAttribute('data-entity')).toBe('sensor.test_garden');
    select = query<HTMLSelectElement>(card, '[data-outdoor-selector]');
    select.value = 'outdoor_z';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await card.updateComplete;
    query<HTMLButtonElement>(card, '.photo-outdoor').click();
    await card.updateComplete;
    expect(query(card, '.room-detail').querySelectorAll('.sensor-row')).toHaveLength(2);
    expect(query(card, '.room-detail').textContent).toContain('Terrasse Nebenquelle');
    const saved = structuredClone(building);
    saved.rooms = saved.rooms.filter((room) => room.id !== 'outdoor_z');
    card.setConfig({ ...getDefaultConfig(), building: saved });
    await card.updateComplete;
    expect(query(card, '.photo-outdoor').getAttribute('data-room-id')).toBe('outdoor_a');
    expect(card.shadowRoot?.querySelector('[data-outdoor-selector]')).toBeNull();
    expect(card.shadowRoot?.querySelector('.room-detail')).toBeNull();
    const reloaded = await createCard(building, hass);
    expect(query(reloaded, '.photo-outdoor').getAttribute('data-room-id')).toBe('outdoor_z');
  });

  it('exposes the configured maximum width without changing legacy opacity, coordinates or measurements', async () => {
    const building: BuildingConfig = getDefaultBuilding();
    building.rooms.find((room) => room.id === 'laundry')!.measurements = {
      temperature: { sensors: [{ entity: 'sensor.test_saved_temperature' }], primary: 'sensor.test_saved_temperature' },
    };
    const before = JSON.stringify(building);
    const card = await createCard(building, { states: {} }, { scene_max_width: 1600, chip_opacity: 0.55 });
    expect(query<HTMLElement>(card, 'ha-card').style.getPropertyValue('--hk-scene-max-width')).toBe('1600px');
    expect(query<HTMLElement>(card, 'ha-card').style.getPropertyValue('--hk-chip')).toContain('0.55');
    expect(JSON.stringify(building)).toBe(before);
    const image = query<HTMLImageElement>(card, '.photo-image').getAttribute('src');
    card.setConfig({ ...getDefaultConfig(), scene_max_width: 900, building });
    await card.updateComplete;
    expect(query<HTMLElement>(card, 'ha-card').style.getPropertyValue('--hk-scene-max-width')).toBe('900px');
    expect(query<HTMLImageElement>(card, '.photo-image').getAttribute('src')).toBe(image);
    expect(query(card, '.photo-room[data-room-id="laundry"]').textContent).toContain('Entität fehlt');
  });

  it('keeps equipment values and touch navigation after the user removes garage air once', async () => {
    const building = getDefaultBuilding();
    building.rooms = building.rooms.filter((room) => room.id !== 'garage');
    building.garage_components_initialized = true;
    const ids = ['garage_cabinet', 'garage_battery_pylontech', 'garage_battery_litime'];
    const states: HomeAssistant['states'] = {};
    ids.forEach((id, index) => {
      building.rooms.find((room) => room.id === id)!.measurements = {
        temperature: { sensors: [{ entity: `sensor.test_${id}` }] },
      };
      states[`sensor.test_${id}`] = { state: String(index + 18), attributes: { unit_of_measurement: '°C' } };
    });
    const saved = JSON.parse(JSON.stringify({ ...getDefaultConfig(), building })) as HausKlimaCardConfig;
    const card = await createCard(saved.building, { states }, saved);
    expect(card.shadowRoot?.querySelector('[data-select-room="garage"]')).toBeNull();
    expect(card.shadowRoot?.querySelectorAll('.garage-zone')).toHaveLength(3);
    expect(card.shadowRoot?.querySelectorAll('.photo-device.with-metrics')).toHaveLength(3);
    for (const [index, id] of ids.entries()) {
      const tile = query<HTMLButtonElement>(card, `.garage-zone[data-select-room="${id}"]`);
      expect(tile.querySelector('.reading strong')?.textContent).toBe(`${index + 18},0`);
      tile.click();
      await card.updateComplete;
      expect(query(card, '.room-detail').getAttribute('data-room-id')).toBe(id);
    }
    expect(building.rooms.some((room) => room.id === 'garage')).toBe(false);
  });

});
