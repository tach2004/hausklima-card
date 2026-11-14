import { getDefaultBuilding } from './defaults';
import { METRIC_TYPES } from './types';
import type { BuildingConfig, HausKlimaCardConfig } from './types';

type ObjectValue = Record<string, unknown>;

function object(value: unknown, path: string): ObjectValue {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${path} muss ein Objekt sein.`);
  }
  return value as ObjectValue;
}

function text(value: unknown, path: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${path} muss eine nicht leere Zeichenfolge sein.`);
}

function positive(value: unknown, path: string, nullable = false): void {
  if (nullable && value === null) return;
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${path} muss eine positive, endliche Zahl${nullable ? ' oder null' : ''} sein.`);
  }
}

function boolean(value: unknown, path: string): void {
  if (typeof value !== 'boolean') throw new Error(`${path} muss ein boolescher Wert sein.`);
}

function list(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${path} muss eine Liste sein.`);
  return value;
}

function entriesWithUniqueIds(value: unknown, path: string): ObjectValue[] {
  const entries = list(value, path).map((entry, index) => object(entry, `${path}[${index}]`));
  const ids = new Set<string>();
  entries.forEach((entry, index) => {
    text(entry.id, `${path}[${index}].id`);
    text(entry.name, `${path}[${index}].name`);
    if (ids.has(entry.id)) throw new Error(`${path}: doppelte ID ${entry.id}.`);
    ids.add(entry.id);
  });
  return entries;
}

function validateMeasurements(value: unknown, path: string): void {
  const measurements = object(value, path);
  for (const [type, value] of Object.entries(measurements)) {
    if (!(METRIC_TYPES as readonly string[]).includes(type)) throw new Error(`${path}: unbekannter Messwerttyp ${type}.`);
    const measurementPath = `${path}.${type}`;
    const measurement = object(value, measurementPath);
    const sensors = list(measurement.sensors, `${measurementPath}.sensors`);
    const entities = new Set<string>();
    sensors.forEach((value, index) => {
      const sensor = object(value, `${measurementPath}.sensors[${index}]`);
      text(sensor.entity, `${measurementPath}.sensors[${index}].entity`);
      if (!/^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(sensor.entity)) throw new Error(`${measurementPath}: ungültige Entity-ID ${sensor.entity}.`);
      if (entities.has(sensor.entity)) throw new Error(`${measurementPath}: doppelte Entity-ID ${sensor.entity}.`);
      entities.add(sensor.entity);
      if (sensor.name !== undefined) text(sensor.name, `${measurementPath}.sensors[${index}].name`);
    });
    if (measurement.primary !== undefined) {
      text(measurement.primary, `${measurementPath}.primary`);
      if (!entities.has(measurement.primary)) throw new Error(`${measurementPath}.primary muss einen konfigurierten Sensor referenzieren.`);
    }
    if (measurement.visible !== undefined) boolean(measurement.visible, `${measurementPath}.visible`);
    if (measurement.show_in_overview !== undefined) boolean(measurement.show_in_overview, `${measurementPath}.show_in_overview`);
    if (measurement.position !== undefined) {
      const position = object(measurement.position, `${measurementPath}.position`);
      for (const axis of ['x', 'y']) {
        const coordinate = position[axis];
        if (typeof coordinate !== 'number' || !Number.isFinite(coordinate) || coordinate < 0 || coordinate > 1) {
          throw new Error(`${measurementPath}.position.${axis} muss zwischen 0 und 1 liegen.`);
        }
      }
    }
  }
}

function validateBuilding(value: unknown): asserts value is BuildingConfig {
  const building = object(value, 'building');
  const house = object(building.house, 'building.house');
  positive(house.width_m, 'building.house.width_m');
  positive(house.depth_m, 'building.house.depth_m');
  const garage = object(building.garage, 'building.garage');
  for (const key of ['width_m', 'depth_m', 'height_m', 'gap_m']) positive(garage[key], `building.garage.${key}`);
  boolean(garage.gap_is_approximate, 'building.garage.gap_is_approximate');
  const walls = object(building.walls, 'building.walls');
  positive(walls.stated_thickness_m, 'building.walls.stated_thickness_m');
  positive(walls.exterior_thickness_m, 'building.walls.exterior_thickness_m', true);
  positive(walls.interior_thickness_m, 'building.walls.interior_thickness_m', true);
  const roof = object(building.roof, 'building.roof');
  positive(roof.knee_wall_height_m, 'building.roof.knee_wall_height_m');
  positive(roof.interior_ridge_height_m, 'building.roof.interior_ridge_height_m');
  positive(roof.pitch_degrees, 'building.roof.pitch_degrees', true);
  if (typeof roof.pitch_degrees === 'number' && roof.pitch_degrees >= 90) throw new Error('building.roof.pitch_degrees muss kleiner als 90 sein.');
  if ((roof.interior_ridge_height_m as number) < (roof.knee_wall_height_m as number)) {
    throw new Error('Die Firsthöhe darf nicht unter der Kniestockhöhe liegen.');
  }
  const levels = entriesWithUniqueIds(building.levels, 'building.levels');
  const layers = entriesWithUniqueIds(building.layers, 'building.layers');
  const rooms = entriesWithUniqueIds(building.rooms, 'building.rooms');
  if (levels.length === 0) throw new Error('building.levels benötigt mindestens eine Ebene.');
  levels.forEach((level, index) => {
    if (level.building_id !== 'house' && level.building_id !== 'garage') throw new Error(`building.levels[${index}].building_id muss house oder garage sein.`);
    positive(level.clear_height_m, `building.levels[${index}].clear_height_m`, true);
  });
  const levelIds = new Set(levels.map((level) => level.id));
  const layerIds = new Set(layers.map((layer) => layer.id));
  rooms.forEach((room, index) => {
    const path = `building.rooms[${index}]`;
    text(room.level_id, `${path}.level_id`);
    if (!levelIds.has(room.level_id)) throw new Error(`${path}.level_id referenziert keine vorhandene Ebene.`);
    if (room.layer_id !== undefined && !layerIds.has(room.layer_id)) throw new Error(`${path}.layer_id referenziert keine vorhandene Raumebene.`);
    boolean(room.visible, `${path}.visible`);
    if (room.location !== undefined && room.location !== 'indoor' && room.location !== 'outdoor') {
      throw new Error(`${path}.location muss indoor oder outdoor sein.`);
    }
    positive(room.width_m, `${path}.width_m`, true);
    if (room.measurements !== undefined) validateMeasurements(room.measurements, `${path}.measurements`);
  });
  list(building.notes, 'building.notes').forEach((note, index) => text(note, `building.notes[${index}]`));
  // Intentionally no sum/fit check: known room widths and unresolved wall widths
  // cannot establish a final facade layout. Never stretch or rewrite dimensions.
}

export function getDefaultConfig(): HausKlimaCardConfig {
  return {
    type: 'custom:hausklima-card',
    title: 'HausKlima',
    show_dimensions: true,
    show_room_names: true,
    chip_opacity: 0.72,
  };
}

/** Validate at the card/editor boundary and detach data from HA's input object. */
export function normalizeConfig(input: unknown): HausKlimaCardConfig {
  const config = object(input, 'Konfiguration');
  if (config.type !== 'custom:hausklima-card') throw new Error('type muss custom:hausklima-card sein.');
  if (config.title !== undefined && typeof config.title !== 'string') throw new Error('title muss eine Zeichenfolge sein.');
  if (config.show_dimensions !== undefined) boolean(config.show_dimensions, 'show_dimensions');
  if (config.show_room_names !== undefined) boolean(config.show_room_names, 'show_room_names');
  if (config.chip_opacity !== undefined && (typeof config.chip_opacity !== 'number' || !Number.isFinite(config.chip_opacity) || config.chip_opacity < 0.35 || config.chip_opacity > 1)) {
    throw new Error('chip_opacity muss zwischen 0.35 und 1 liegen.');
  }
  if (config.building !== undefined) validateBuilding(config.building);
  return structuredClone({ ...getDefaultConfig(), ...config }) as HausKlimaCardConfig;
}

/**
 * Migrate previously saved dashboard configurations once, retaining every
 * existing user mapping and the ability to remove an added garage component.
 */
export function resolveBuilding(config: HausKlimaCardConfig): BuildingConfig {
  const building = config.building ? structuredClone(config.building) : getDefaultBuilding();
  if (!building.garage_components_initialized) {
    const extraRooms = getDefaultBuilding().rooms.filter((room) =>
      room.id === 'garage_battery_pylontech' ||
      room.id === 'garage_battery_litime' ||
      room.id === 'garage_cabinet');
    const installed = new Set(building.rooms.map((room) => room.id));
    for (const room of extraRooms) {
      if (!installed.has(room.id)) building.rooms.push(room);
    }
    building.garage_components_initialized = true;
  }
  return building;
}
