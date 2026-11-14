import { METRIC_TYPES } from './types';
import type { HomeAssistant, MetricType, ResolvedMeasurement, ResolvedSensor, RoomConfig, SensorConfig, SensorStatus } from './types';

export const METRIC_LABELS: Record<MetricType, string> = {
  temperature: 'Temperatur',
  relative_humidity: 'Relative Luftfeuchtigkeit',
  absolute_humidity: 'Absolute Luftfeuchtigkeit',
  co2: 'CO₂',
  voc: 'VOC',
};

export type MeasurementScope = 'visible' | 'overview' | 'details';

export function sensorStatusLabel(status: SensorStatus): string {
  switch (status) {
    case 'missing': return 'Entität fehlt';
    case 'unknown': return 'Unbekannt';
    case 'unavailable': return 'Nicht verfügbar';
    case 'available': return 'Verfügbar';
  }
}

/** Format numeric states for HA's locale without converting units or rounding data. */
export function formatSensorValue(sensor: ResolvedSensor, hass?: HomeAssistant): string {
  if (sensor.status !== 'available' || sensor.value === null) return sensorStatusLabel(sensor.status);
  const raw = sensor.value;
  if (raw.trim() === '' || !Number.isFinite(Number(raw))) return raw;
  const numberFormat = hass?.locale?.number_format;
  if (numberFormat === 'none') return raw;
  const language = numberFormat === 'comma_decimal' ? 'en-US'
    : numberFormat === 'decimal_comma' ? 'de-DE'
    : numberFormat === 'space_comma' ? 'fr-FR'
    : numberFormat === 'system' ? undefined
    : hass?.locale?.language ?? hass?.language ?? 'de-DE';
  try {
    const significantDigits = raw.replace(/[eE].*$/, '').replace(/[^0-9]/g, '').replace(/^0+/, '').length;
    const numeric = Number(raw);
    // Preserve precision and scientific notation instead of rounding the source state.
    if (significantDigits > 15 || /[eE]/.test(raw) || (numeric !== 0 && Math.abs(numeric) < 1e-20)) {
      const decimal = new Intl.NumberFormat(language).formatToParts(1.1).find((part) => part.type === 'decimal')?.value ?? '.';
      return raw.replace('.', decimal);
    }
    return new Intl.NumberFormat(language, { maximumFractionDigits: 20, useGrouping: false }).format(numeric);
  } catch {
    return raw;
  }
}

function resolveSensor(sensor: SensorConfig, primary: string, hass?: HomeAssistant): ResolvedSensor {
  const state = hass?.states[sensor.entity];
  const status = !state ? 'missing' : state.state === 'unavailable' ? 'unavailable' : state.state === 'unknown' ? 'unknown' : 'available';
  const friendlyName = state?.attributes.friendly_name;
  const unit = state?.attributes.unit_of_measurement;
  return {
    entity: sensor.entity,
    name: sensor.name ?? (typeof friendlyName === 'string' ? friendlyName : sensor.entity),
    value: status === 'available' ? state!.state : null,
    // An absent unit is unknown. In particular VOC units must never be inferred.
    unit: typeof unit === 'string' ? unit : '',
    status,
    is_primary: sensor.entity === primary,
  };
}

/**
 * The default retains Phase-1 callers. Overview prioritizes temperature/RH;
 * details always retain every configured source, including hidden metrics.
 */
export function resolveMeasurements(room: RoomConfig, hass?: HomeAssistant, scope: MeasurementScope = 'visible'): ResolvedMeasurement[] {
  return METRIC_TYPES.flatMap((type) => {
    const measurement = room.measurements?.[type];
    if (!measurement || measurement.sensors.length === 0) return [];
    const visible = measurement.visible !== false;
    const showInOverview = measurement.show_in_overview ?? (type === 'temperature' || type === 'relative_humidity');
    if (scope !== 'details' && (!visible || (scope === 'overview' && !showInOverview))) return [];
    const primaryId = measurement.primary ?? measurement.sensors[0]!.entity;
    const sensors = measurement.sensors.map((sensor) => resolveSensor(sensor, primaryId, hass));
    const primary = sensors.find((sensor) => sensor.is_primary) ?? sensors[0]!;
    return [{
      type, label: METRIC_LABELS[type], primary, sensors,
      visible, show_in_overview: showInOverview,
      ...(measurement.position ? { position: measurement.position } : {}),
    }];
  });
}
