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

/** Format display values only: exactly one decimal, no unit/state mutation. */
export function formatSensorValue(sensor: ResolvedSensor, hass?: HomeAssistant): string {
  if (sensor.status !== 'available' || sensor.value === null) return sensorStatusLabel(sensor.status);
  const raw = sensor.value;
  const numeric = raw.trim().match(/^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d+))?$/);
  if (!numeric || !Number.isFinite(Number(raw))) return raw;

  // Round the decimal source string, rather than first losing integer precision
  // through Number(). BigInt retains large, finite HA sensor values in full.
  const integer = numeric[2] ?? '0';
  const fraction = numeric[3] ?? numeric[4] ?? '';
  const digits = integer + fraction;
  const retained = integer.length + Number(numeric[5] ?? 0) + 1;
  const isZero = !/[1-9]/.test(digits);
  let tenths = isZero || retained <= 0 ? 0n : BigInt(digits.slice(0, retained).padEnd(retained, '0'));
  if (!isZero && retained >= 0 && Number(digits[retained] ?? '0') >= 5) tenths += 1n;
  const rounded = tenths.toString().padStart(2, '0');
  const whole = rounded.slice(0, -1);
  const decimal = rounded.slice(-1);
  const negative = numeric[1] === '-';
  const numberFormat = hass?.locale?.number_format;
  const language = numberFormat === 'none' || numberFormat === 'comma_decimal' ? 'en-US'
    : numberFormat === 'decimal_comma' ? 'de-DE'
    : numberFormat === 'space_comma' ? 'fr-FR'
    : numberFormat === 'system' ? undefined
    : hass?.locale?.language ?? hass?.language ?? 'de-DE';
  const options = { minimumFractionDigits: 1, maximumFractionDigits: 1, useGrouping: false };
  let formatter: Intl.NumberFormat;
  try { formatter = new Intl.NumberFormat(language, options); }
  catch { formatter = new Intl.NumberFormat('de-DE', options); }
  const signedWhole = negative && whole === '0' ? -0 : BigInt(`${negative ? '-' : ''}${whole}`);
  const localizedDecimal = formatter.formatToParts(Number(decimal)).find((part) => part.type === 'integer')!.value;
  return formatter.formatToParts(signedWhole)
    .map((part) => part.type === 'fraction' ? localizedDecimal : part.value).join('');
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
 * The default retains Phase-1 callers. Every configured metric is shown by default;
 * details always retain every configured source, including hidden metrics.
 */
export function resolveMeasurements(room: RoomConfig, hass?: HomeAssistant, scope: MeasurementScope = 'visible'): ResolvedMeasurement[] {
  return METRIC_TYPES.flatMap((type) => {
    const measurement = room.measurements?.[type];
    if (!measurement || measurement.sensors.length === 0) return [];
    const visible = measurement.visible !== false;
    const showInOverview = measurement.show_in_overview ?? true;
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
