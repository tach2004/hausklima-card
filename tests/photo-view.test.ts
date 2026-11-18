import { afterEach, describe, expect, it } from '../scripts/unit-test-compat';
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
  it('shows arbitrarily many new rooms after the original rooms were deleted', async () => {
    const building = getDefaultBuilding();
    // Simulate the reported user setup: original sensorless house rooms have
    // been removed for good. No implicit default-room recreation is allowed.
    building.rooms = building.rooms.filter((room) => room.level_id === 'garage');
    const created: RoomConfig[] = Array.from({ length: 22 }, (_, i) => ({
      id: `custom_location_${i + 40}`, name: i === 0 ? 'Unterverteilung' : `Neuer Messort ${i + 1}`,
      level_id: i % 3 === 0 ? 'basement' : i % 3 === 1 ? 'attic' : 'ground_floor',
      location: 'indoor', visible: false, width_m: null,
      ...(i === 0 ? { measurements: {
        temperature: { sensors: [{ entity: 'sensor.test_new_distributor' }] },
      } } : {}),
    }));
    building.rooms.push(...created);
    const card = await createCard(building, { states: {
      'sensor.test_new_distributor': { state: '13.9', attributes: { unit_of_measurement: '°C' } },
    } });
    for (const room of created) {
      const node = query<HTMLDivElement>(card, `.photo-placement[data-overlay-id="${room.id}"]`);
      expect(node.querySelector('.photo-badge')?.textContent).toContain(room.name);
      expect(Number(node.dataset.preferredX)).toBeGreaterThan(0);
      expect(Number(node.dataset.preferredY)).toBeGreaterThan(0);
    }
    expect(query(card, '.photo-room[data-room-id="custom_location_40"]').textContent).toContain('13,9');
    expect(card.shadowRoot!.querySelector('[data-overlay-id="workshop"]')).toBeNull();
    expect(card.shadowRoot!.querySelector('[data-overlay-id="laundry"]')).toBeNull();
    expect(card.shadowRoot!.querySelectorAll('.photo-room')).toHaveLength(22);
  });

  it('shows newly added garage rooms and keeps arbitrary saved desktop/mobile positions', async () => {
    const building = getDefaultBuilding();
    building.rooms.push({
      id: 'arbitrary_garage_workbench', name: 'Werkbank', level_id: 'garage',
      visible: false, width_m: null, location: 'indoor',
      measurements: { temperature: { sensors: [{ entity: 'sensor.test_workbench' }] } },
    });
    const card = await createCard(building, { states: {
      'sensor.test_workbench': { state: '11.2', attributes: { unit_of_measurement: '°C' } },
    } }, { badge_positions: {
      arbitrary_garage_workbench: { desktop: { x: 76.4, y: 69.2 }, mobile: { x: 84.1, y: 74.7 } },
    } });
    const node = query<HTMLDivElement>(card, '.photo-placement[data-overlay-id="arbitrary_garage_workbench"]');
    expect(node.dataset.manualDesktopX).toBe('76.4');
    expect(node.dataset.manualMobileX).toBe('84.1');
    expect(node.querySelector('.photo-device')?.textContent).toContain('11,2');
    expect(card.shadowRoot!.querySelectorAll('.photo-object-target[data-select-room="arbitrary_garage_workbench"]')).toHaveLength(0);
  });

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
    expect(textValues(panel)).toEqual(['16,8', '68,5', '5,0', '745', '12345678901234567890']);
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
    expect(card.shadowRoot?.querySelectorAll('.garage-zone, .garage-block')).toHaveLength(0);
    expect(card.shadowRoot?.querySelectorAll('.photo-device.with-metrics')).toHaveLength(3);
    for (const [index, id] of ids.entries()) {
      const badge = query<HTMLButtonElement>(card, `.photo-device[data-select-room="${id}"]`);
      expect(badge.textContent).toContain(`${index + 18},0`);
      badge.click();
      await card.updateComplete;
      expect(query(card, '.room-detail').getAttribute('data-room-id')).toBe(id);
    }
    expect(building.rooms.some((room) => room.id === 'garage')).toBe(false);
  });

  it('shows selected source groups with icons and both pressure kinds, retaining secondary sources only in details', async () => {
    const building = getDefaultBuilding();
    const room = outdoor('test_grouped_outdoor', 'Außen', 'sensor.test_homematic', 'sensor.test_ecowitt');
    room.measurements = {
      temperature: { sensors: [
        { entity: 'sensor.test_homematic', overview_group: 'Homematic', show_in_overview: true },
        { entity: 'sensor.test_ecowitt', overview_group: 'Ecowitt', show_in_overview: true },
        { entity: 'sensor.test_secondary', overview_group: 'Nur Details', show_in_overview: false },
      ] },
      relative_humidity: { sensors: [{ entity: 'sensor.test_homematic_rh', overview_group: 'Homematic' }] },
      pressure_relative: { sensors: [{ entity: 'sensor.test_pressure_rel', overview_group: 'Ecowitt' }] },
      pressure_absolute: { sensors: [{ entity: 'sensor.test_pressure_abs', overview_group: 'Ecowitt' }] },
    };
    room.mobile_overview = { pressure_relative: true, pressure_absolute: true };
    building.rooms.push(room);
    const hass: HomeAssistant = { states: {
      'sensor.test_homematic': { state: '3.39999', attributes: { unit_of_measurement: '°C' } },
      'sensor.test_ecowitt': { state: '6.3', attributes: { unit_of_measurement: '°C' } },
      'sensor.test_secondary': { state: '9.9', attributes: { unit_of_measurement: '°C' } },
      'sensor.test_homematic_rh': { state: '86', attributes: { unit_of_measurement: '%' } },
      'sensor.test_pressure_rel': { state: '1013.26', attributes: { unit_of_measurement: 'hPa' } },
      'sensor.test_pressure_abs': { state: '996.7', attributes: { unit_of_measurement: 'hPa' } },
    } };
    const card = await createCard(building, hass);
    const panel = query<HTMLButtonElement>(card, '.photo-outdoor');
    expect([...panel.querySelectorAll('[data-overview-group]')].map((node) => node.getAttribute('data-overview-group'))).toEqual(['Homematic', 'Ecowitt']);
    expect(textValues(panel)).toEqual(['3,4', '86,0', '6,3', '1013', '997']);
    expect(panel.querySelectorAll('.photo-metric svg.metric-icon')).toHaveLength(5);
    expect(panel.querySelector('[data-room-icon="outdoor"]')).not.toBeNull();
    expect(panel.querySelectorAll('.metric-qualifier')).toHaveLength(2);
    expect(panel.querySelector('[data-metric="pressure_relative"]')?.textContent).toContain('rel.');
    expect(panel.querySelector('[data-metric="pressure_absolute"]')?.textContent).toContain('abs.');
    expect([...panel.querySelectorAll('.photo-mobile-qualifier')].map((node) => node.textContent)).toEqual(['rel.', 'abs.']);
    expect(panel.querySelector('.photo-mobile-reading[data-metric="relative_humidity"] .photo-mobile-qualifier')).toBeNull();
    expect(panel.textContent).not.toContain('9,9');
    expect(card.shadowRoot?.querySelector('.outdoor-block, .garage-block, .location-column')).toBeNull();
    // All outdoor source groups are in the photo; complete sensor values open on click.
    expect(panel.querySelectorAll('[data-overview-group]')).toHaveLength(2);
    panel.click();
    await card.updateComplete;
    const detail = query(card, '.room-detail');
    expect(detail.querySelectorAll('.sensor-row')).toHaveLength(6);
    expect(detail.querySelector('[data-entity="sensor.test_secondary"]')?.textContent).toContain('9,9');
    expect(detail.querySelector('[data-entity="sensor.test_ecowitt"]')?.textContent).toContain('Hauptanzeige');
    expect(detail.querySelectorAll('.overview-sensor')).toHaveLength(5);
  });


  it('uses the same named source groups in cabinet, battery and indoor badges on desktop and mobile', async () => {
    const building = getDefaultBuilding();
    const roomIds = ['garage_cabinet', 'garage_battery_pylontech', 'bedroom'];
    const states: HomeAssistant['states'] = {};
    for (const roomId of roomIds) {
      const room = building.rooms.find((candidate) => candidate.id === roomId)!;
      const sensor = (group: string, type: string) => {
        const entity = `sensor.test_${roomId}_${group}_${type}`;
        states[entity] = {
          state: type === 'temperature' ? '13.9' : type === 'relative_humidity' ? '64.4' : '7.7',
          attributes: { unit_of_measurement: type === 'temperature' ? '°C' :
            type === 'relative_humidity' ? '%' : 'g/m³' },
        };
        return { entity, overview_group: group, show_in_overview: true, show_on_mobile: true };
      };
      room.measurements = {
        temperature: { sensors: [sensor('1', 'temperature'), sensor('2', 'temperature')] },
        relative_humidity: { sensors: [sensor('1', 'relative_humidity'), sensor('2', 'relative_humidity')] },
        absolute_humidity: { sensors: [sensor('1', 'absolute_humidity')] },
      };
      room.mobile_overview = { absolute_humidity: true };
    }
    const card = await createCard(building, { states });
    for (const roomId of roomIds) {
      const badge = query<HTMLButtonElement>(card, `.photo-badge[data-room-id="${roomId}"]`);
      expect([...badge.querySelectorAll('.source-group-name')].map((n) => n.textContent)).toEqual(['1', '2']);
      expect([...badge.querySelectorAll('.photo-mobile-source-heading')].map((n) => n.textContent)).toEqual(['1', '2']);
      expect([...badge.querySelectorAll('.named-group .group-readings')].map((n) =>
        n.querySelectorAll('.photo-metric').length)).toEqual([3, 2]);
      expect([...badge.querySelectorAll('.photo-mobile-source-group')].map((n) =>
        n.querySelectorAll('.photo-mobile-reading').length)).toEqual([3, 2]);
      expect(badge.querySelector('.photo-mobile-climate.has-mobile-groups')).not.toBeNull();
    }
    // A non-grouped room must not suddenly gain fabricated source headings.
    const simpleRoom = query<HTMLButtonElement>(card, '.photo-badge[data-room-id="laundry"]');
    expect(simpleRoom.querySelectorAll('.photo-mobile-source-heading')).toHaveLength(0);
  });

  it('keeps a named single indoor temperature source vertical and introduces rows only for multiple selected sources', async () => {
    const building = getDefaultBuilding();
    const room = building.rooms.find((entry) => entry.id === 'bedroom')!;
    room.measurements = {
      temperature: { sensors: [{ entity: 'sensor.test_indoor_t', overview_group: 'Zimmerfühler' }] },
      relative_humidity: { sensors: [{ entity: 'sensor.test_indoor_rh', overview_group: 'Zimmerfühler' }] },
    };
    const card = await createCard(building);
    expect(query(card, '.photo-room[data-room-id="bedroom"] .sensor-groups').classList.contains('group-columns')).toBe(true);
    expect(query(card, '.room-tile[data-select-room="bedroom"] .sensor-groups').classList.contains('group-columns')).toBe(true);
    expect(query(card, '.photo-room[data-room-id="bedroom"] [data-room-icon="bedroom"]')).not.toBeNull();
    expect(query(card, '.photo-placement[data-overlay-id="bedroom"]').hasAttribute('data-width')).toBe(false);
    room.measurements.temperature!.sensors.push({ entity: 'sensor.test_second_t', overview_group: 'Zweiter Fühler', show_in_overview: true });
    card.setConfig({ ...getDefaultConfig(), building });
    await card.updateComplete;
    expect(query(card, '.photo-room[data-room-id="bedroom"] .sensor-groups').classList.contains('group-rows')).toBe(true);
    expect(query(card, '.photo-room[data-room-id="bedroom"]').querySelectorAll('[data-overview-group]')).toHaveLength(2);
  });

});
