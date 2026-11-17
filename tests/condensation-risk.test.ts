import { describe, expect, it } from '../scripts/unit-test-compat';
import { normalizeConfig, getDefaultConfig } from '../src/config';
import { getDefaultBuilding } from '../src/defaults';
import { formatSensorValue, resolveMeasurements, resolveMobileReadings } from '../src/metrics';
import type { ResolvedSensor } from '../src/types';
import '../src/hausklima-card';
import type { HausKlimaCard } from '../src/hausklima-card';

describe('selectable condensation risk', () => {
  it('supports a separately selected HA risk value without calculating it from air readings', () => {
    const building = getDefaultBuilding();
    const laundry = building.rooms.find((r) => r.id === 'laundry')!;
    laundry.measurements = { condensation_risk: { sensors: [{ entity: 'sensor.test_condensation_risk' }] } };
    const config = normalizeConfig({ ...getDefaultConfig(), building });
    const hass = { states: { 'sensor.test_condensation_risk': {
      state: 'moderate', attributes: { friendly_name: 'Kondensationsrisiko' },
    } } };
    const metrics = resolveMeasurements(laundry, hass, 'overview');
    expect(metrics.map((m) => m.type)).toEqual(['condensation_risk']);
    expect(formatSensorValue(metrics[0]!.primary, hass)).toBe('moderate');
    expect(resolveMobileReadings(laundry, hass)).toHaveLength(0);
    laundry.mobile_overview = { condensation_risk: true };
    expect(resolveMobileReadings(laundry, hass).map((m) => m.type)).toEqual(['condensation_risk']);
    expect(config.building?.rooms.find((r) => r.id === 'laundry')?.measurements?.condensation_risk).toBeDefined();
  });
  it('formats explicitly configured binary risk states and preserves unknown status', () => {
    const sensor = { metric_type: 'condensation_risk', entity: 'binary_sensor.test_condensation_risk',
      status: 'available', value: 'on', unit: '', name: 'Kondensationsrisiko',
      is_primary: true, show_in_overview: true } as ResolvedSensor;
    expect(formatSensorValue(sensor)).toBe('Risiko');
    expect(formatSensorValue({ ...sensor, value: 'off' })).toBe('Kein Risiko');
    expect(formatSensorValue({ ...sensor, status: 'unavailable', value: null })).toBe('Nicht verfügbar');
    expect(formatSensorValue({ ...sensor, entity: 'sensor.test_risk', value: 'on' })).toBe('on');
  });
  it('shows the risk icon and value in desktop and optional phone room badges', async () => {
    const building = getDefaultBuilding();
    const room = building.rooms.find((r) => r.id === 'laundry')!;
    room.measurements = { condensation_risk: { sensors: [{ entity: 'binary_sensor.test_condensation_risk' }] } };
    room.mobile_overview = { condensation_risk: true };
    const card = document.createElement('hausklima-card') as HausKlimaCard;
    card.setConfig({ ...getDefaultConfig(), building });
    card.hass = { states: { 'binary_sensor.test_condensation_risk': { state: 'on', attributes: {} } } };
    document.body.append(card);
    await card.updateComplete;
    const badge = card.shadowRoot?.querySelector('.photo-room[data-room-id="laundry"]');
    expect(badge?.querySelector('.photo-metric[data-metric="condensation_risk"]')).not.toBeNull();
    expect(badge?.querySelector('.photo-mobile-reading[data-metric="condensation_risk"]')).not.toBeNull();
    expect(badge?.textContent).toContain('Risiko');
    card.remove();
  });
});
