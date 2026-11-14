import { normalizeConfig, resolveBuilding } from './config';
import type { BuildingConfig, HausKlimaCardConfig, MeasurementConfig, MetricType, RoomConfig, SensorConfig } from './types';

export type RoomEdit = Partial<Pick<RoomConfig, 'name' | 'level_id' | 'visible' | 'location'>>;
export interface NewRoom {
  name: string;
  location: 'indoor' | 'outdoor';
  level_id?: string;
}

/** All editor writes pass the same validation boundary as loading a dashboard. */
function changeBuilding(config: HausKlimaCardConfig, change: (building: BuildingConfig) => void): HausKlimaCardConfig {
  const next = normalizeConfig(config);
  const building = resolveBuilding(next);
  change(building);
  return normalizeConfig({ ...next, building });
}

function requireRoom(building: BuildingConfig, id: string): RoomConfig {
  const room = building.rooms.find((entry) => entry.id === id);
  if (!room) throw new Error('Der ausgewählte Raum existiert nicht mehr.');
  return room;
}

function requireMeasurement(room: RoomConfig, type: MetricType): MeasurementConfig {
  room.measurements ??= {};
  room.measurements[type] ??= { sensors: [] };
  return room.measurements[type]!;
}

function name(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('Bitte einen Namen eingeben.');
  return trimmed;
}

export function editRoom(config: HausKlimaCardConfig, id: string, patch: RoomEdit): HausKlimaCardConfig {
  return changeBuilding(config, (building) => {
    const room = requireRoom(building, id);
    Object.assign(room, structuredClone(patch));
    if (patch.name !== undefined) room.name = name(patch.name);
    // Outdoor locations and unplaced added rooms do not acquire inferred geometry.
    if (room.location === 'outdoor') room.visible = false;
  });
}

export function addRoom(config: HausKlimaCardConfig, input: NewRoom): HausKlimaCardConfig {
  return changeBuilding(config, (building) => {
    const roomName = name(input.name);
    if (building.rooms.some((room) => room.name.trim().toLocaleLowerCase() === roomName.toLocaleLowerCase())) {
      throw new Error('Ein Raum oder Messort mit diesem Namen existiert bereits.');
    }
    const level = input.level_id
      ? building.levels.find((entry) => entry.id === input.level_id)
      : building.levels.find((entry) => entry.id === 'ground_floor' && entry.building_id === 'house')
        ?? building.levels.find((entry) => entry.building_id === 'house');
    if (!level || level.building_id !== 'house') {
      throw new Error('Für weitere Räume eine vorhandene Hausebene auswählen. Die Garage ist bereits ein eigener Messort.');
    }
    const prefix = input.location === 'outdoor' ? 'outdoor' : 'room';
    let sequence = 1;
    while (building.rooms.some((room) => room.id === `${prefix}_${sequence}`)) sequence++;
    building.rooms.push({
      id: `${prefix}_${sequence}`, name: roomName, level_id: level.id,
      location: input.location, visible: false, width_m: null,
    });
  });
}

export function deleteRoom(config: HausKlimaCardConfig, id: string): HausKlimaCardConfig {
  return changeBuilding(config, (building) => {
    requireRoom(building, id);
    building.rooms = building.rooms.filter((room) => room.id !== id);
  });
}

export function updateMeasurement(config: HausKlimaCardConfig, roomId: string, type: MetricType, patch: Partial<MeasurementConfig>): HausKlimaCardConfig {
  return changeBuilding(config, (building) => {
    const measurement = requireMeasurement(requireRoom(building, roomId), type);
    Object.assign(measurement, structuredClone(patch));
    if (patch.sensors && patch.primary === undefined && measurement.primary && !measurement.sensors.some((sensor) => sensor.entity === measurement.primary)) {
      if (measurement.sensors.length) measurement.primary = measurement.sensors[0]!.entity;
      else delete measurement.primary;
    }
  });
}

export function addSensor(config: HausKlimaCardConfig, roomId: string, type: MetricType, entity: string): HausKlimaCardConfig {
  return changeBuilding(config, (building) => {
    const measurement = requireMeasurement(requireRoom(building, roomId), type);
    measurement.sensors.push({ entity });
    measurement.primary ??= entity;
  });
}

export function editSensor(config: HausKlimaCardConfig, roomId: string, type: MetricType, entity: string, patch: Partial<SensorConfig>): HausKlimaCardConfig {
  return changeBuilding(config, (building) => {
    const measurement = requireMeasurement(requireRoom(building, roomId), type);
    const sensor = measurement.sensors.find((entry) => entry.entity === entity);
    if (!sensor) throw new Error('Der ausgewählte Sensor existiert nicht mehr.');
    Object.assign(sensor, structuredClone(patch));
    if (patch.name !== undefined) {
      const alias = patch.name.trim();
      if (alias) sensor.name = alias;
      else delete sensor.name;
    }
    if (measurement.primary === entity && patch.entity !== undefined) measurement.primary = patch.entity;
  });
}

export function removeSensor(config: HausKlimaCardConfig, roomId: string, type: MetricType, entity: string): HausKlimaCardConfig {
  return changeBuilding(config, (building) => {
    const measurement = requireMeasurement(requireRoom(building, roomId), type);
    if (!measurement.sensors.some((sensor) => sensor.entity === entity)) throw new Error('Der ausgewählte Sensor existiert nicht mehr.');
    const previousPrimary = measurement.primary ?? measurement.sensors[0]?.entity;
    measurement.sensors = measurement.sensors.filter((sensor) => sensor.entity !== entity);
    if (previousPrimary === entity) {
      if (measurement.sensors.length) measurement.primary = measurement.sensors[0]!.entity;
      else delete measurement.primary;
    }
  });
}

export function setPrimarySensor(config: HausKlimaCardConfig, roomId: string, type: MetricType, entity: string): HausKlimaCardConfig {
  return updateMeasurement(config, roomId, type, { primary: entity });
}
