// DEMO-WERTE: Sensorzustände und Entity-IDs in dieser Testdatei sind synthetische Testdaten.
import { describe, expect, it } from 'vitest';
import { getDefaultConfig, normalizeConfig, resolveBuilding } from '../src/config';
import { getDefaultBuilding } from '../src/defaults';
import { formatSensorValue, resolveMeasurements, sensorStatusLabel } from '../src/metrics';
import type { HomeAssistant, RoomConfig } from '../src/types';

function configuredRoom(): RoomConfig {
  return {
    ...getDefaultBuilding().rooms[0]!,
    measurements: {
      temperature: {
        sensors: [{ entity: 'sensor.test_primary' }, { entity: 'sensor.test_secondary' }],
        primary: 'sensor.test_secondary',
      },
    },
  };
}

describe('building model', () => {
  it('preserves every supplied dimension without closing facade width discrepancies', () => {
    const building = resolveBuilding(normalizeConfig(getDefaultConfig()));
    expect(building.house).toEqual({ width_m: 12, depth_m: 10 });
    expect(building.rooms.filter((room) => room.level_id === 'basement').map((room) => room.width_m)).toEqual([4, 3.4, 3.5]);
    expect(building.rooms.filter((room) => room.level_id === 'ground_floor').map((room) => room.width_m)).toEqual([6.5, 0.9, 3.51]);
    expect(building.rooms.filter((room) => room.level_id === 'attic').map((room) => room.width_m)).toEqual([7.6, 3.6]);
    expect(building.walls.exterior_thickness_m).toBeNull();
    expect(building.walls.interior_thickness_m).toBeNull();
    expect(building.roof.pitch_degrees).toBeNull();
    expect(building.levels.find((level) => level.id === 'attic')?.clear_height_m).toBeNull();
    expect(building.garage.gap_is_approximate).toBe(true);
    expect(building.rooms.every((room) => room.measurements === undefined)).toBe(true);
  });

  it('keeps default and resolved buildings independent across card instances', () => {
    const first = getDefaultBuilding();
    first.rooms[0]!.name = 'Changed';
    expect(getDefaultBuilding().rooms[0]!.name).toBe('Werkstatt');
    const config = normalizeConfig({ ...getDefaultConfig(), building: getDefaultBuilding() });
    resolveBuilding(config).rooms[0]!.width_m = 99;
    expect(config.building!.rooms[0]!.width_m).toBe(4);
  });

  it('accepts unseen rooms and alternative room layers without geometry inventions', () => {
    const building = getDefaultBuilding();
    building.layers.push({ id: 'rear', name: 'Hintere Räume' });
    building.rooms.push({ id: 'extra', name: 'Weiterer Raum', level_id: 'ground_floor', layer_id: 'rear', visible: false, width_m: null });
    const config = normalizeConfig({ ...getDefaultConfig(), building });
    expect(config.building?.rooms.at(-1)).toMatchObject({ id: 'extra', visible: false, width_m: null });
  });
});

describe('configuration boundary', () => {
  it('defaults only omitted basic settings and preserves Lovelace metadata', () => {
    expect(normalizeConfig({ type: 'custom:hausklima-card', show_dimensions: false, view_layout: { grid_area: 'house' } })).toEqual({
      ...getDefaultConfig(), show_dimensions: false, view_layout: { grid_area: 'house' },
    });
  });

  it('does not mutate or retain references to input configuration', () => {
    const input = { ...getDefaultConfig(), building: getDefaultBuilding() };
    const result = normalizeConfig(input);
    result.building!.rooms[0]!.name = 'Changed';
    expect(input.building.rooms[0]!.name).toBe('Werkstatt');
  });

  it.each([null, [], {}, { type: 'custom:other' }, { type: 'custom:hausklima-card', title: 5 }, { type: 'custom:hausklima-card', show_dimensions: 'yes' }])('rejects malformed config %j', (input) => {
    expect(() => normalizeConfig(input)).toThrow();
  });

  it('rejects duplicate room IDs and missing level/layer references', () => {
    const building = getDefaultBuilding();
    building.rooms.push({ ...building.rooms[0]! });
    expect(() => normalizeConfig({ ...getDefaultConfig(), building })).toThrow(/doppelte ID/);
    building.rooms.pop();
    building.rooms[0]!.level_id = 'missing';
    expect(() => normalizeConfig({ ...getDefaultConfig(), building })).toThrow(/Ebene/);
    building.rooms[0]!.level_id = 'basement';
    building.rooms[0]!.layer_id = 'missing';
    expect(() => normalizeConfig({ ...getDefaultConfig(), building })).toThrow(/Raumebene/);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid dimensions %s', (width) => {
    const building = getDefaultBuilding();
    building.rooms[0]!.width_m = width;
    expect(() => normalizeConfig({ ...getDefaultConfig(), building })).toThrow(/positive/);
  });

  it('requires a primary sensor to belong to the configured set', () => {
    const building = getDefaultBuilding();
    building.rooms[0] = configuredRoom();
    building.rooms[0]!.measurements!.temperature!.primary = 'sensor.not_configured';
    expect(() => normalizeConfig({ ...getDefaultConfig(), building })).toThrow(/konfigurierten Sensor/);
  });

  it('validates normalized positions and duplicate sensor IDs', () => {
    const building = getDefaultBuilding();
    building.rooms[0] = configuredRoom();
    const measurement = building.rooms[0]!.measurements!.temperature!;
    measurement.position = { x: 1.01, y: 0.5 };
    expect(() => normalizeConfig({ ...getDefaultConfig(), building })).toThrow(/zwischen 0 und 1/);
    measurement.position = { x: 1, y: 0 };
    expect(() => normalizeConfig({ ...getDefaultConfig(), building })).not.toThrow();
    measurement.sensors.push({ ...measurement.sensors[0]! });
    expect(() => normalizeConfig({ ...getDefaultConfig(), building })).toThrow(/doppelte Entity-ID/);
  });
});

describe('measurement resolution', () => {
  it('occupies no space for absent, empty, or hidden metrics', () => {
    const room = configuredRoom();
    expect(resolveMeasurements(getDefaultBuilding().rooms[0]!)).toEqual([]);
    room.measurements!.temperature!.visible = false;
    room.measurements!.co2 = { sensors: [] };
    expect(resolveMeasurements(room)).toEqual([]);
  });

  it('selects the explicit primary while preserving additional source sensors and units', () => {
    const hass: HomeAssistant = {
      states: {
        'sensor.test_primary': { state: '20.5', attributes: { unit_of_measurement: '°C', friendly_name: 'Primary' } },
        'sensor.test_secondary': { state: '69', attributes: { unit_of_measurement: '°F' } },
      },
    };
    const measurement = resolveMeasurements(configuredRoom(), hass)[0]!;
    expect(measurement.primary).toMatchObject({ entity: 'sensor.test_secondary', value: '69', unit: '°F', is_primary: true, status: 'available' });
    expect(measurement.sensors).toHaveLength(2);
    expect(measurement.sensors[0]!.name).toBe('Primary');
  });

  it('uses the first sensor when no primary is chosen', () => {
    const room = configuredRoom();
    delete room.measurements!.temperature!.primary;
    expect(resolveMeasurements(room)[0]!.primary.entity).toBe('sensor.test_primary');
  });

  it('keeps missing, unavailable and unknown configured sensors recognizable without fallback substitution', () => {
    const room = configuredRoom();
    const hass: HomeAssistant = { states: { 'sensor.test_primary': { state: '20', attributes: {} }, 'sensor.test_secondary': { state: 'unavailable', attributes: {} } } };
    expect(resolveMeasurements(room, hass)[0]!.primary).toMatchObject({ status: 'unavailable', value: null });
    hass.states['sensor.test_secondary']!.state = 'unknown';
    expect(resolveMeasurements(room, hass)[0]!.primary.status).toBe('unknown');
    delete hass.states['sensor.test_secondary'];
    expect(resolveMeasurements(room, hass)[0]!.primary.status).toBe('missing');
    expect(resolveMeasurements(room)[0]!.sensors).toHaveLength(2);
  });

  it('supports independent optional metrics and uses the VOC source unit without calculating humidity', () => {
    const room = configuredRoom();
    room.measurements = {
      relative_humidity: { sensors: [{ entity: 'sensor.test_humidity' }] },
      absolute_humidity: { sensors: [{ entity: 'sensor.test_absolute' }] },
      co2: { sensors: [{ entity: 'sensor.test_co2' }] },
      voc: { sensors: [{ entity: 'sensor.test_voc' }] },
    };
    const values = resolveMeasurements(room, { states: { 'sensor.test_voc': { state: '15', attributes: { unit_of_measurement: 'µg/m³' } } } });
    expect(values.map((value) => value.type)).toEqual(['relative_humidity', 'absolute_humidity', 'co2', 'voc']);
    expect(values[1]!.primary.value).toBeNull();
    expect(values[1]!.primary.unit).toBe('');
    expect(values[3]!.primary.unit).toBe('µg/m³');
  });
});


describe('Phase 2 overview and details', () => {
  it('prioritizes temperature and relative humidity while keeping every configured metric in details', () => {
    const room = configuredRoom();
    room.measurements!.relative_humidity = { sensors: [{ entity: 'sensor.test_relative' }] };
    room.measurements!.absolute_humidity = { sensors: [{ entity: 'sensor.test_absolute' }] };
    room.measurements!.co2 = { sensors: [{ entity: 'sensor.test_co2' }] };
    room.measurements!.voc = { sensors: [{ entity: 'sensor.test_voc' }] };
    expect(resolveMeasurements(room, undefined, 'overview').map((metric) => metric.type)).toEqual(['temperature', 'relative_humidity']);
    expect(resolveMeasurements(room, undefined, 'details')).toHaveLength(5);
    room.measurements!.co2.show_in_overview = true;
    expect(resolveMeasurements(room, undefined, 'overview').map((metric) => metric.type)).toEqual(['temperature', 'relative_humidity', 'co2']);
  });

  it('preserves hidden metric and main-display sources in room details after dashboard reload', () => {
    const room = configuredRoom();
    room.measurements!.temperature!.visible = false;
    room.measurements!.relative_humidity = {
      sensors: [{ entity: 'sensor.test_humidity' }], show_in_overview: false,
    };
    const reloaded = JSON.parse(JSON.stringify(room)) as RoomConfig;
    expect(resolveMeasurements(reloaded, undefined, 'overview')).toEqual([]);
    expect(resolveMeasurements(reloaded, undefined, 'details')).toMatchObject([
      { type: 'temperature', visible: false, sensors: [{ entity: 'sensor.test_primary' }, { entity: 'sensor.test_secondary' }] },
      { type: 'relative_humidity', visible: true, show_in_overview: false },
    ]);
  });

  it('takes units only from HA metadata and preserves source-specific VOC conventions', () => {
    const room = configuredRoom();
    room.measurements!.voc = { sensors: [{ entity: 'sensor.test_voc' }] };
    const hass: HomeAssistant = { states: {
      'sensor.test_primary': { state: '20.125', attributes: {} },
      'sensor.test_secondary': { state: 'unknown', attributes: { unit_of_measurement: '°F' } },
      'sensor.test_voc': { state: '120', attributes: { unit_of_measurement: 'VOC index' } },
    } };
    const values = resolveMeasurements(room, hass, 'details');
    expect(values[0]!.sensors[0]!.unit).toBe('');
    expect(values[0]!.primary).toMatchObject({ unit: '°F', value: null, status: 'unknown' });
    expect(values[1]!.primary.unit).toBe('VOC index');
  });

  it('reflects live primary state changes without substituting a secondary reading', () => {
    const room = configuredRoom();
    const hass: HomeAssistant = { states: {
      'sensor.test_primary': { state: '20.1', attributes: { unit_of_measurement: '°C' } },
      'sensor.test_secondary': { state: '21.4', attributes: { unit_of_measurement: '°C' } },
    } };
    expect(resolveMeasurements(room, hass, 'overview')[0]!.primary.value).toBe('21.4');
    hass.states['sensor.test_secondary']!.state = 'unavailable';
    expect(resolveMeasurements(room, hass, 'overview')[0]!.primary.value).toBeNull();
    hass.states['sensor.test_secondary']!.state = '22.15';
    expect(resolveMeasurements(room, hass, 'overview')[0]!.primary.value).toBe('22.15');
  });

  it('validates display flags and outdoor location metadata', () => {
    const building = getDefaultBuilding();
    building.rooms[0] = configuredRoom();
    Object.assign(building.rooms[0]!.measurements!.temperature!, { show_in_overview: 'true' });
    expect(() => normalizeConfig({ ...getDefaultConfig(), building })).toThrow(/show_in_overview/);
    building.rooms[0]!.measurements!.temperature!.show_in_overview = false;
    Object.assign(building.rooms[0]!, { location: 'invented' });
    expect(() => normalizeConfig({ ...getDefaultConfig(), building })).toThrow(/location/);
    building.rooms[0]!.location = 'outdoor';
    expect(normalizeConfig({ ...getDefaultConfig(), building }).building!.rooms[0]!.location).toBe('outdoor');
  });

  it('formats numbers for HA preferences without mutating the raw sensor state or unit', () => {
    const sensor = resolveMeasurements(configuredRoom(), { states: {
      'sensor.test_secondary': { state: '21.125', attributes: { unit_of_measurement: '°C' } },
    } })[0]!.primary;
    expect(formatSensorValue(sensor, { states: {}, locale: { language: 'de' } })).toBe('21,125');
    expect(formatSensorValue(sensor, { states: {}, locale: { number_format: 'comma_decimal' } })).toBe('21.125');
    expect(formatSensorValue(sensor, { states: {}, locale: { number_format: 'none' } })).toBe('21.125');
    expect(sensor.value).toBe('21.125');
    expect(sensor.unit).toBe('°C');
    expect(formatSensorValue({ ...sensor, value: null, status: 'unavailable' })).toBe('Nicht verfügbar');
    expect(sensorStatusLabel('unknown')).toBe('Unbekannt');
    expect(sensorStatusLabel('missing')).toBe('Entität fehlt');
  });

  it.each(['21.333333333333333333', '99999999999999999999', '1e-30', '0.00000000000000000000001'])(
    'preserves source precision for %s when localizing a numeric sensor', (raw) => {
      const sensor = resolveMeasurements(configuredRoom(), { states: {
        'sensor.test_secondary': { state: raw, attributes: { unit_of_measurement: '°C' } },
      } })[0]!.primary;
      expect(formatSensorValue(sensor, { states: {}, locale: { language: 'de' } })).toBe(raw.replace('.', ','));
      expect(sensor.value).toBe(raw);
    },
  );

});
