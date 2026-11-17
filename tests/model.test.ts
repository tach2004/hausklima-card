// DEMO-WERTE: Sensorzustände und Entity-IDs in dieser Testdatei sind synthetische Testdaten.
import { describe, expect, it } from '../scripts/unit-test-compat';
import { getDefaultConfig, normalizeConfig, resolveBuilding } from '../src/config';
import { getDefaultBuilding } from '../src/defaults';
import { formatSensorValue, resolveMeasurements, resolveOverviewGroups, sensorStatusLabel } from '../src/metrics';
import type { HomeAssistant, MetricType, RoomConfig } from '../src/types';

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

describe('garage equipment migration', () => {
  it('includes garage air, both batteries, and cabinet without dummy sensor readings', () => {
    const building = resolveBuilding(getDefaultConfig());
    const ids = ['garage', 'garage_battery_pylontech', 'garage_battery_litime', 'garage_cabinet'];
    for (const id of ids) {
      const room = building.rooms.find((item) => item.id === id);
      expect(room).toBeDefined();
      expect(room?.measurements).toBeUndefined();
      expect(room?.level_id).toBe('garage');
    }
    expect(building.garage_components_initialized).toBe(true);
  });

  it('migrates saved phase 2 configs without losing room/sensor mappings and only once', () => {
    const legacy = getDefaultBuilding();
    legacy.rooms = legacy.rooms.filter((room) =>
      !['garage_battery_pylontech', 'garage_battery_litime', 'garage_cabinet'].includes(room.id));
    delete legacy.garage_components_initialized;
    legacy.rooms.find((room) => room.id === 'garage')!.measurements = {
      temperature: { sensors: [{ entity: 'sensor.test_garage_temperature' }] },
    };
    const first = resolveBuilding({ ...getDefaultConfig(), building: legacy });
    expect(first.rooms.filter((room) => room.level_id === 'garage')).toHaveLength(4);
    expect(first.rooms.find((room) => room.id === 'garage')?.measurements?.temperature?.sensors[0]?.entity)
      .toBe('sensor.test_garage_temperature');
    const second = resolveBuilding({ ...getDefaultConfig(), building: first });
    expect(second.rooms.filter((room) => room.level_id === 'garage')).toHaveLength(4);

    // After migration, an intentionally removed component stays removed.
    second.rooms = second.rooms.filter((room) => room.id !== 'garage_battery_litime');
    expect(resolveBuilding({ ...getDefaultConfig(), building: second }).rooms.some((room) =>
      room.id === 'garage_battery_litime')).toBe(false);
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
  it('includes all five configured metrics in the overview unless individually hidden', () => {
    const room = configuredRoom();
    room.measurements!.relative_humidity = { sensors: [{ entity: 'sensor.test_relative' }] };
    room.measurements!.absolute_humidity = { sensors: [{ entity: 'sensor.test_absolute' }] };
    room.measurements!.co2 = { sensors: [{ entity: 'sensor.test_co2' }] };
    room.measurements!.voc = { sensors: [{ entity: 'sensor.test_voc' }] };
    expect(resolveMeasurements(room, undefined, 'overview').map((metric) => metric.type)).toEqual(['temperature', 'relative_humidity', 'absolute_humidity', 'co2', 'voc']);
    expect(resolveMeasurements(room, undefined, 'details')).toHaveLength(5);
    room.measurements!.co2.show_in_overview = false;
    expect(resolveMeasurements(room, undefined, 'overview').map((metric) => metric.type)).toEqual(['temperature', 'relative_humidity', 'absolute_humidity', 'voc']);
    expect(resolveMeasurements(room, undefined, 'details')).toHaveLength(5);
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
    expect(formatSensorValue(sensor, { states: {}, locale: { language: 'de' } })).toBe('21,1');
    expect(formatSensorValue(sensor, { states: {}, locale: { number_format: 'comma_decimal' } })).toBe('21.1');
    expect(formatSensorValue(sensor, { states: {}, locale: { number_format: 'none' } })).toBe('21.1');
    expect(sensor.value).toBe('21.125');
    expect(sensor.unit).toBe('°C');
    expect(formatSensorValue({ ...sensor, value: null, status: 'unavailable' })).toBe('Nicht verfügbar');
    expect(sensorStatusLabel('unknown')).toBe('Unbekannt');
    expect(sensorStatusLabel('missing')).toBe('Entität fehlt');
  });

  it.each([
    ['16.8000011444092', '16,8'], ['5', '5,0'], ['68.5', '68,5'], ['745', '745,0'],
    ['-3.4512345678912', '-3,5'], ['0', '0,0'], ['-0.01', '-0,0'], ['0.05', '0,1'],
    ['21.333333333333333333', '21,3'], ['99999999999999999999', '99999999999999999999,0'],
    ['1e3', '1000,0'], ['0e999999999999999999999', '0,0'], ['1e-30', '0,0'], ['0.00000000000000000000001', '0,0'],
  ])('rounds only the display of %s to exactly one decimal (%s)', (raw, expected) => {
    const hass: HomeAssistant = { states: {
      'sensor.test_secondary': { state: raw, attributes: { unit_of_measurement: 'a deliberately long sensor unit' } },
    } };
    const original = structuredClone(hass);
    const sensor = resolveMeasurements(configuredRoom(), hass)[0]!.primary;
    expect(formatSensorValue(sensor, { ...hass, locale: { language: 'de' } })).toBe(expected);
    expect(sensor.value).toBe(raw);
    expect(sensor.unit).toBe('a deliberately long sensor unit');
    expect(hass).toEqual(original);
  });

  it.each([
    ['comma_decimal', '16.8'], ['decimal_comma', '16,8'], ['space_comma', '16,8'],
    ['none', '16.8'], ['language', '16,8'],
  ])('honors HA number format %s with one decimal', (number_format, expected) => {
    const sensor = resolveMeasurements(configuredRoom(), { states: {
      'sensor.test_secondary': { state: '16.8000011444092', attributes: {} },
    } })[0]!.primary;
    expect(formatSensorValue(sensor, { states: {}, locale: { language: 'de', number_format } })).toBe(expected);
    expect(sensor.unit).toBe('');
  });

  it('uses system/language locale, a safe invalid-locale fallback, and honest nonnumeric/status values', () => {
    const sensor = resolveMeasurements(configuredRoom(), { states: {
      'sensor.test_secondary': { state: '5', attributes: {} },
    } })[0]!.primary;
    expect(formatSensorValue(sensor, { states: {}, locale: { language: 'en' } })).toBe('5.0');
    expect(formatSensorValue(sensor, { states: {}, locale: { language: 'invalid_locale' } })).toBe('5,0');
    expect(formatSensorValue(sensor, { states: {}, locale: { number_format: 'system' } }))
      .toBe(new Intl.NumberFormat(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1, useGrouping: false }).format(5));
    for (const raw of ['on', '', ' ', 'NaN', 'Infinity', '0x10']) {
      expect(formatSensorValue({ ...sensor, value: raw })).toBe(raw);
    }
    expect(formatSensorValue({ ...sensor, status: 'unknown', value: null })).toBe('Unbekannt');
    expect(formatSensorValue({ ...sensor, status: 'missing', value: null })).toBe('Entität fehlt');
    expect(formatSensorValue({ ...sensor, status: 'unavailable', value: null })).toBe('Nicht verfügbar');
  });

});


describe('building scene width', () => {
  it('defaults legacy cards to 1400 px and preserves saved width through reload', () => {
    const config = normalizeConfig({ type: 'custom:hausklima-card', scene_max_width: 1530, chip_opacity: 0.57, custom: { retained: true } });
    expect(normalizeConfig({ type: 'custom:hausklima-card' }).scene_max_width).toBe(1400);
    expect(normalizeConfig(JSON.parse(JSON.stringify(config)))).toEqual(config);
  });

  it.each([900, 1250, 1400, 1600, 2400, 3200])('accepts a scene width of %s px', (scene_max_width) => {
    expect(normalizeConfig({ ...getDefaultConfig(), scene_max_width }).scene_max_width).toBe(scene_max_width);
  });

  it.each([899, 3201, 0, -1, NaN, Infinity, '1400', null])('rejects invalid scene width %s', (scene_max_width) => {
    expect(() => normalizeConfig({ ...getDefaultConfig(), scene_max_width })).toThrow(/scene_max_width/);
  });
});

describe('metric precision and optional pressure', () => {
  it.each<[MetricType, string, string]>([
    ['temperature', '21.66666666666', '21,7'],
    ['relative_humidity', '48.125', '48,1'],
    ['absolute_humidity', '8.75', '8,8'],
    ['co2', '612.8', '613'], ['voc', '120.49', '120'],
    ['pressure_relative', '1013.625', '1014'], ['pressure_absolute', '985.1', '985'],
    ['co2', '99999999999999999999.6', '100000000000000000000'],
    ['voc', '-2.5', '-3'], ['pressure_absolute', '0', '0'],
  ])('formats %s according to metric without changing source %s', (type, raw, expected) => {
    const room = configuredRoom();
    room.measurements = { [type]: { sensors: [{ entity: 'sensor.test_precision' }] } };
    const hass: HomeAssistant = { states: {
      'sensor.test_precision': { state: raw, attributes: { unit_of_measurement: 'arbitrary source unit' } },
    } };
    const snapshot = structuredClone(hass);
    const sensor = resolveMeasurements(room, hass)[0]!.primary;
    expect(formatSensorValue(sensor, { ...hass, locale: { language: 'de' } })).toBe(expected);
    expect(sensor.unit).toBe('arbitrary source unit');
    expect(hass).toEqual(snapshot);
  });

  it('keeps relative/absolute pressure distinct and never computes either', () => {
    const room = configuredRoom();
    room.measurements = {
      pressure_relative: { sensors: [{ entity: 'sensor.test_relative_pressure' }] },
      pressure_absolute: { sensors: [{ entity: 'sensor.test_absolute_pressure' }] },
    };
    const values = resolveMeasurements(room, { states: {
      'sensor.test_relative_pressure': { state: '1013.2', attributes: { unit_of_measurement: 'hPa' } },
      'sensor.test_absolute_pressure': { state: '29.78', attributes: { unit_of_measurement: 'inHg' } },
    } });
    expect(values.map((value) => [value.type, value.primary.value, value.primary.unit])).toEqual([
      ['pressure_relative', '1013.2', 'hPa'], ['pressure_absolute', '29.78', 'inHg'],
    ]);
    expect(values.map((value) => value.label)).toEqual(['Luftdruck relativ', 'Luftdruck absolut']);
  });
});

describe('selected overview sources and groups', () => {
  it('retains the saved single primary in one compact unnamed group', () => {
    const groups = resolveOverviewGroups(configuredRoom());
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ name: '', readings: [{ type: 'temperature', sensor: { entity: 'sensor.test_secondary', is_primary: true } }] });
  });

  it('groups independently selected sources across metrics and keeps other sources in details', () => {
    const room = configuredRoom();
    room.measurements = {
      temperature: { primary: 'sensor.test_homematic_t', sensors: [
        { entity: 'sensor.test_homematic_t', overview_group: 'Homematic' },
        { entity: 'sensor.test_ecowitt_t', show_in_overview: true, overview_group: 'Ecowitt' },
        { entity: 'sensor.test_vitodens_t', show_in_overview: true, overview_group: 'Vitodens' },
        { entity: 'sensor.test_hidden_t', show_in_overview: false },
      ] },
      relative_humidity: { sensors: [
        { entity: 'sensor.test_homematic_h', overview_group: 'Homematic' },
        { entity: 'sensor.test_ecowitt_h', show_in_overview: true, overview_group: 'Ecowitt' },
      ] },
      pressure_relative: { sensors: [{ entity: 'sensor.test_pressure', overview_group: 'Ecowitt' }] },
    };
    const reloaded = JSON.parse(JSON.stringify(room)) as RoomConfig;
    const groups = resolveOverviewGroups(reloaded);
    expect(groups.map((group) => group.name)).toEqual(['Homematic', 'Ecowitt', 'Vitodens']);
    expect(groups.map((group) => group.readings.map((reading) => reading.type))).toEqual([
      ['temperature', 'relative_humidity'], ['temperature', 'relative_humidity', 'pressure_relative'], ['temperature'],
    ]);
    expect(groups.flatMap((group) => group.readings).map((reading) => reading.sensor.entity)).not.toContain('sensor.test_hidden_t');
    expect(resolveMeasurements(reloaded, undefined, 'details')[0]!.sensors).toHaveLength(4);
    expect(resolveMeasurements(reloaded, undefined, 'details')[0]!.primary.entity).toBe('sensor.test_homematic_t');
    expect(groups[1]!.readings[0]!.sensor.status).toBe('missing');
  });

  it('can deselect the legacy primary and hide the last overview source without a fallback', () => {
    const room = configuredRoom();
    room.measurements!.temperature!.sensors[1]!.show_in_overview = false;
    expect(resolveOverviewGroups(room)).toEqual([]);
    expect(resolveMeasurements(room, undefined, 'details')[0]!.sensors).toHaveLength(2);
    room.measurements!.temperature!.sensors[0]!.show_in_overview = true;
    expect(resolveOverviewGroups(room)[0]!.readings[0]!.sensor.entity).toBe('sensor.test_primary');
    room.measurements!.temperature!.show_in_overview = false;
    expect(resolveOverviewGroups(room)).toEqual([]);
    room.measurements!.temperature!.show_in_overview = true;
    room.measurements!.temperature!.visible = false;
    expect(resolveOverviewGroups(room)).toEqual([]);
  });

  it('labels multiple ungrouped sources honestly and never merges different locations', () => {
    const room = configuredRoom();
    room.measurements!.temperature!.sensors[0]!.show_in_overview = true;
    room.measurements!.temperature!.sensors[0]!.name = 'Quelle eins';
    room.measurements!.temperature!.sensors[1]!.name = 'Quelle zwei';
    const otherRoom = structuredClone(room);
    otherRoom.id = 'other';
    otherRoom.measurements!.temperature!.sensors[0]!.name = 'Anderer Ort';
    expect(resolveOverviewGroups(room).map((group) => group.name)).toEqual(['Quelle eins', 'Quelle zwei']);
    expect(resolveOverviewGroups(otherRoom).map((group) => group.name)).toEqual(['Anderer Ort', 'Quelle zwei']);
  });

  it('validates per-source flags/group names and preserves unknown sensor fields', () => {
    const building = getDefaultBuilding();
    building.rooms[0] = configuredRoom();
    const sensor = building.rooms[0]!.measurements!.temperature!.sensors[0]!;
    Object.assign(sensor, { show_in_overview: 'yes' });
    expect(() => normalizeConfig({ ...getDefaultConfig(), building })).toThrow(/show_in_overview/);
    sensor.show_in_overview = true;
    Object.assign(sensor, { overview_group: '   ' });
    expect(() => normalizeConfig({ ...getDefaultConfig(), building })).toThrow(/overview_group/);
    sensor.overview_group = 'Homematic';
    Object.assign(sensor, { future: { retained: true } });
    expect(normalizeConfig({ ...getDefaultConfig(), building }).building!.rooms[0]!.measurements!.temperature!.sensors[0])
      .toMatchObject({ overview_group: 'Homematic', show_in_overview: true, future: { retained: true } });
  });
});
