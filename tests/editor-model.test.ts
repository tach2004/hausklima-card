import { describe, expect, it } from 'vitest';
import { getDefaultConfig, normalizeConfig, resolveBuilding } from '../src/config';
import { getDefaultBuilding } from '../src/defaults';
import {
  addRoom,
  addSensor,
  deleteRoom,
  editRoom,
  editSensor,
  removeSensor,
  setPrimarySensor,
  updateMeasurement,
} from '../src/editor-model';
import type { HausKlimaCardConfig, RoomConfig } from '../src/types';

// DEMO-WERTE: All entity IDs in this file are isolated synthetic test fixtures.
const firstEntity = 'sensor.test_temperature_one';
const secondEntity = 'sensor.test_temperature_two';
const replacementEntity = 'sensor.test_temperature_replacement';

function room(config: HausKlimaCardConfig, id = 'workshop'): RoomConfig {
  const result = resolveBuilding(config).rooms.find((candidate) => candidate.id === id);
  if (!result) throw new Error(`Missing test room ${id}`);
  return result;
}

function withTwoSensors(): HausKlimaCardConfig {
  return addSensor(addSensor(getDefaultConfig(), 'workshop', 'temperature', firstEntity), 'workshop', 'temperature', secondEntity);
}

describe('immutable graphical editor changes', () => {
  it('edits a room name without changing its ID, known geometry or the input object', () => {
    const original = getDefaultConfig();
    const before = structuredClone(original);
    const result = editRoom(original, 'workshop', { name: 'Meine Werkstatt' });
    expect(original).toEqual(before);
    expect(room(result)).toMatchObject({ id: 'workshop', name: 'Meine Werkstatt', width_m: 4, level_id: 'basement' });
    expect(getDefaultBuilding().rooms[0]!.name).toBe('Werkstatt');
  });

  it('preserves unknown Lovelace and nested building, room, metric and sensor fields', () => {
    const building = getDefaultBuilding();
    Object.assign(building, { future_building: { material: 'reserved' } });
    Object.assign(building.rooms[0]!, { future_room: { label_style: 'reserved' } });
    building.rooms[0]!.measurements = {
      temperature: Object.assign({
        sensors: [Object.assign({ entity: firstEntity }, { future_sensor: { source: 'reserved' } })],
      }, { future_metric: { precision: 'reserved' } }),
    };
    const original = normalizeConfig({
      ...getDefaultConfig(), building,
      view_layout: { grid_area: 'house' },
      grid_options: { columns: 'full', rows: 'auto' },
      future_lovelace: { nested: ['reserved'] },
    });
    const before = structuredClone(original);
    let result = editRoom(original, 'workshop', { name: 'Werkraum' });
    result = editSensor(result, 'workshop', 'temperature', firstEntity, { name: 'Quelle' });
    result = updateMeasurement(result, 'workshop', 'temperature', { show_in_overview: false });
    expect(original).toEqual(before);
    expect(result).toMatchObject({
      view_layout: before.view_layout,
      grid_options: before.grid_options,
      future_lovelace: before.future_lovelace,
      building: {
        future_building: { material: 'reserved' },
        rooms: [expect.objectContaining({
          future_room: { label_style: 'reserved' },
          measurements: { temperature: expect.objectContaining({
            future_metric: { precision: 'reserved' },
            sensors: [expect.objectContaining({ future_sensor: { source: 'reserved' }, name: 'Quelle' })],
          }) },
        }), ...before.building!.rooms.slice(1)],
      },
    });
  });

  it('round-trips aliases, the selected primary, independent visibility flags and extra rooms through dashboard JSON', () => {
    let config = addRoom(getDefaultConfig(), { name: 'Garten', location: 'outdoor' });
    const outdoorId = config.building!.rooms.at(-1)!.id;
    config = addSensor(config, outdoorId, 'temperature', firstEntity);
    config = addSensor(config, outdoorId, 'temperature', secondEntity);
    config = editSensor(config, outdoorId, 'temperature', secondEntity, { name: 'Zweite Quelle' });
    config = setPrimarySensor(config, outdoorId, 'temperature', secondEntity);
    config = updateMeasurement(config, outdoorId, 'temperature', { visible: false, show_in_overview: true });
    const saved = normalizeConfig(JSON.parse(JSON.stringify(config)));
    expect(saved).toEqual(config);
    expect(room(saved, outdoorId)).toMatchObject({
      name: 'Garten', location: 'outdoor', visible: false, width_m: null,
      measurements: { temperature: {
        primary: secondEntity, visible: false, show_in_overview: true,
        sensors: [{ entity: firstEntity }, { entity: secondEntity, name: 'Zweite Quelle' }],
      } },
    });
  });

  it('rejects blank room names and edits to missing rooms without changing a valid configuration', () => {
    const original = withTwoSensors();
    const before = structuredClone(original);
    expect(() => editRoom(original, 'workshop', { name: '   ' })).toThrow();
    expect(() => editRoom(original, 'not_a_room', { name: 'Raum' })).toThrow();
    expect(() => deleteRoom(original, 'not_a_room')).toThrow();
    expect(original).toEqual(before);
  });
});

describe('additional rooms and outdoor locations', () => {
  it('adds locations with unique stable IDs, no inferred dimensions and all existing defaults unchanged', () => {
    const original = getDefaultConfig();
    const first = addRoom(original, { name: 'Arbeitszimmer', location: 'indoor', level_id: 'ground_floor' });
    const second = addRoom(first, { name: 'Garten', location: 'outdoor' });
    const additions = second.building!.rooms.slice(getDefaultBuilding().rooms.length);
    expect(second.building!.rooms.slice(0, getDefaultBuilding().rooms.length)).toEqual(getDefaultBuilding().rooms);
    expect(additions).toHaveLength(2);
    expect(new Set(second.building!.rooms.map((candidate) => candidate.id)).size).toBe(second.building!.rooms.length);
    expect(additions.every((candidate) => candidate.visible === false && candidate.width_m === null)).toBe(true);
    expect(additions[0]).toMatchObject({ name: 'Arbeitszimmer', location: 'indoor', level_id: 'ground_floor' });
    expect(additions[1]).toMatchObject({ name: 'Garten', location: 'outdoor' });
    const renamed = editRoom(second, additions[1]!.id, { name: 'Terrasse' });
    expect(room(renamed, additions[1]!.id).id).toBe(additions[1]!.id);
    expect(original.building).toBeUndefined();
  });

  it('does not accidentally duplicate the garage or assign an unknown level', () => {
    const original = getDefaultConfig();
    expect(() => addRoom(original, { name: 'Garage', location: 'indoor' })).toThrow();
    expect(() => addRoom(original, { name: 'Raum', location: 'indoor', level_id: 'missing_level' })).toThrow();
    expect(() => addRoom(original, { name: '   ', location: 'indoor' })).toThrow();
    expect(resolveBuilding(original).rooms.filter((candidate) => candidate.id === 'garage')).toHaveLength(1);
  });

  it('removes only the selected extra room and its mappings', () => {
    let config = addRoom(withTwoSensors(), { name: 'Arbeitszimmer', location: 'indoor' });
    const extraId = config.building!.rooms.at(-1)!.id;
    config = addSensor(config, extraId, 'voc', 'sensor.test_voc');
    const before = structuredClone(config);
    const result = deleteRoom(config, extraId);
    expect(config).toEqual(before);
    expect(result.building!.rooms.some((candidate) => candidate.id === extraId)).toBe(false);
    expect(room(result).measurements).toEqual(room(before).measurements);
    expect(result.building!.rooms).toHaveLength(getDefaultBuilding().rooms.length);
  });
});

describe('sensor lists and primary selection', () => {
  it('keeps a flexible source list without imposing a fixed sensor count', () => {
    let config = getDefaultConfig();
    const entities = Array.from({ length: 24 }, (_, index) => `sensor.test_source_${index}`);
    for (const entity of entities) config = addSensor(config, 'workshop', 'temperature', entity);
    config = setPrimarySensor(config, 'workshop', 'temperature', entities.at(-1)!);
    const saved = normalizeConfig(JSON.parse(JSON.stringify(config)));
    expect(room(saved).measurements!.temperature!.sensors.map((sensor) => sensor.entity)).toEqual(entities);
    expect(room(saved).measurements!.temperature!.primary).toBe(entities.at(-1));
  });

  it('adds multiple sources and changes primary without removing or reordering secondary readings', () => {
    const original = withTwoSensors();
    const result = setPrimarySensor(original, 'workshop', 'temperature', secondEntity);
    expect(room(result).measurements!.temperature!.primary).toBe(secondEntity);
    expect(room(result).measurements!.temperature!.sensors.map((sensor) => sensor.entity)).toEqual([firstEntity, secondEntity]);
    expect(room(original).measurements!.temperature!.primary).not.toBe(secondEntity);
  });

  it('renames a sensor independently from its source and clears an empty alias', () => {
    const original = withTwoSensors();
    const renamed = editSensor(original, 'workshop', 'temperature', firstEntity, { name: 'Meine Quelle' });
    expect(room(renamed).measurements!.temperature!.sensors[0]).toMatchObject({ entity: firstEntity, name: 'Meine Quelle' });
    const reset = editSensor(renamed, 'workshop', 'temperature', firstEntity, { name: '' });
    expect(room(reset).measurements!.temperature!.sensors[0]).not.toHaveProperty('name');
    expect(room(original).measurements!.temperature!.sensors[0]).not.toHaveProperty('name');
  });

  it('keeps the primary association when its underlying entity is replaced', () => {
    const original = setPrimarySensor(withTwoSensors(), 'workshop', 'temperature', firstEntity);
    const result = editSensor(original, 'workshop', 'temperature', firstEntity, { entity: replacementEntity });
    expect(room(result).measurements!.temperature!.primary).toBe(replacementEntity);
    expect(room(result).measurements!.temperature!.sensors.map((sensor) => sensor.entity)).toEqual([replacementEntity, secondEntity]);
    expect(room(original).measurements!.temperature!.primary).toBe(firstEntity);
  });

  it('selects a remaining source when the explicit primary is removed and saves a valid empty list after the last removal', () => {
    const original = setPrimarySensor(withTwoSensors(), 'workshop', 'temperature', secondEntity);
    const removed = removeSensor(original, 'workshop', 'temperature', secondEntity);
    expect(room(removed).measurements!.temperature).toMatchObject({ primary: firstEntity, sensors: [{ entity: firstEntity }] });
    const empty = removeSensor(removed, 'workshop', 'temperature', firstEntity);
    expect(room(empty).measurements!.temperature!.sensors).toEqual([]);
    expect(room(empty).measurements!.temperature).not.toHaveProperty('primary');
    expect(() => normalizeConfig(JSON.parse(JSON.stringify(empty)))).not.toThrow();
    expect(room(original).measurements!.temperature!.sensors).toHaveLength(2);
  });

  it('rejects duplicate, invalid and missing sources without overwriting existing assignments', () => {
    const original = withTwoSensors();
    const before = structuredClone(original);
    expect(() => addSensor(original, 'workshop', 'temperature', firstEntity)).toThrow();
    expect(() => addSensor(original, 'workshop', 'temperature', 'not-an-entity')).toThrow();
    expect(() => editSensor(original, 'workshop', 'temperature', firstEntity, { entity: secondEntity })).toThrow();
    expect(() => setPrimarySensor(original, 'workshop', 'temperature', 'sensor.test_unmapped')).toThrow();
    expect(() => editSensor(original, 'workshop', 'temperature', 'sensor.test_unmapped', { name: 'Quelle' })).toThrow();
    expect(() => removeSensor(original, 'workshop', 'temperature', 'sensor.test_unmapped')).toThrow();
    expect(original).toEqual(before);
  });

  it('retains configured sources when the metric and primary overview display are independently toggled', () => {
    const original = withTwoSensors();
    const disabled = updateMeasurement(original, 'workshop', 'temperature', { visible: false });
    const hidden = updateMeasurement(disabled, 'workshop', 'temperature', { visible: true, show_in_overview: false });
    expect(room(disabled).measurements!.temperature).toMatchObject({ visible: false });
    expect(room(hidden).measurements!.temperature).toMatchObject({ visible: true, show_in_overview: false });
    expect(room(hidden).measurements!.temperature!.sensors).toEqual(room(original).measurements!.temperature!.sensors);
  });
});
