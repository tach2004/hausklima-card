import { METRIC_TYPES } from './types';
import type { HomeAssistant, MetricType, ResolvedMeasurement, ResolvedSensor, RoomConfig, SensorConfig } from './types';

export const METRIC_LABELS: Record<MetricType, string> = {
  temperature: 'Temperatur',
  relative_humidity: 'Relative Luftfeuchtigkeit',
  absolute_humidity: 'Absolute Luftfeuchtigkeit',
  co2: 'CO₂',
  voc: 'VOC',
};

const DEFAULT_UNITS: Record<MetricType, string> = {
  temperature: '°C',
  relative_humidity: '%',
  absolute_humidity: 'g/m³',
  co2: 'ppm',
  voc: '',
};

function resolveSensor(sensor: SensorConfig, type: MetricType, primary: string, hass?: HomeAssistant): ResolvedSensor {
  const state = hass?.states[sensor.entity];
  const status = !state ? 'missing' : state.state === 'unavailable' ? 'unavailable' : state.state === 'unknown' ? 'unknown' : 'available';
  const friendlyName = state?.attributes.friendly_name;
  const unit = state?.attributes.unit_of_measurement;
  return {
    entity: sensor.entity,
    name: sensor.name ?? (typeof friendlyName === 'string' ? friendlyName : sensor.entity),
    value: status === 'available' ? state!.state : null,
    // Preserve source units: Phase 1 does not silently convert measurements.
    unit: typeof unit === 'string' ? unit : DEFAULT_UNITS[type],
    status,
    is_primary: sensor.entity === primary,
  };
}

/** No placeholders for absent metrics; configured unavailable sensors stay present. */
export function resolveMeasurements(room: RoomConfig, hass?: HomeAssistant): ResolvedMeasurement[] {
  return METRIC_TYPES.flatMap((type) => {
    const measurement = room.measurements?.[type];
    if (!measurement || measurement.visible === false || measurement.sensors.length === 0) return [];
    const primaryId = measurement.primary ?? measurement.sensors[0]!.entity;
    const sensors = measurement.sensors.map((sensor) => resolveSensor(sensor, type, primaryId, hass));
    const primary = sensors.find((sensor) => sensor.is_primary) ?? sensors[0]!;
    return [{ type, label: METRIC_LABELS[type], primary, sensors, ...(measurement.position ? { position: measurement.position } : {}) }];
  });
}
