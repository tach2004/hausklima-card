import { describe, expect, it } from '../scripts/unit-test-compat';
import { resolveMobileOutdoorGroups } from '../src/metrics';
import type { RoomConfig } from '../src/types';

const createRoom = (): RoomConfig => ({
  id: 'test_outdoor', name: 'Außen', level_id: 'ground_floor', location: 'outdoor', visible: false, width_m: null,
  measurements: {
    temperature: { sensors: [
      { entity: 'sensor.test_a_t', name: 'Sensor A Temp', overview_group: 'Quelle A', show_on_mobile: true },
      { entity: 'sensor.test_b_t', name: 'Sensor B Temp', overview_group: 'Quelle B', show_on_mobile: true },
    ] },
    relative_humidity: { sensors: [
      { entity: 'sensor.test_a_rh', name: 'Sensor A Feuchte', overview_group: 'Quelle A', show_on_mobile: true },
      { entity: 'sensor.test_b_rh', name: 'Sensor B Feuchte', overview_group: 'Quelle B', show_on_mobile: true },
    ] },
  },
});

describe('outdoor phone grouping', () => {
  it('shows each named source first and its own temperature/humidity beneath it', () => {
    const groups = resolveMobileOutdoorGroups(createRoom());
    expect(groups.map((g) => g.name)).toEqual(['Quelle A', 'Quelle B']);
    expect(groups.map((g) => g.readings.map((r) => r.type))).toEqual([
      ['temperature', 'relative_humidity'], ['temperature', 'relative_humidity'],
    ]);
    expect(groups.map((g) => g.readings.map((r) => r.sensor.entity))).toEqual([
      ['sensor.test_a_t', 'sensor.test_a_rh'], ['sensor.test_b_t', 'sensor.test_b_rh'],
    ]);
  });
  it('honors phone source switches without attributing readings to a different source', () => {
    const room = createRoom();
    room.measurements!.temperature!.sensors[1]!.show_on_mobile = false;
    room.measurements!.relative_humidity!.sensors[1]!.overview_group = 'Unzugeordnete Quelle';
    const groups = resolveMobileOutdoorGroups(room);
    expect(groups.map((g) => [g.name, ...g.readings.map((r) => r.type)])).toEqual([
      ['Quelle A', 'temperature', 'relative_humidity'], ['Unzugeordnete Quelle', 'relative_humidity'],
    ]);
  });
  it('can group equal sensor names when no explicit overview group is configured', () => {
    const room = createRoom();
    room.measurements!.temperature!.sensors[0]!.overview_group = undefined;
    room.measurements!.relative_humidity!.sensors[0]!.overview_group = undefined;
    room.measurements!.temperature!.sensors[0]!.name = 'Gemeinsame Quelle';
    room.measurements!.relative_humidity!.sensors[0]!.name = 'Gemeinsame Quelle';
    expect(resolveMobileOutdoorGroups(room).find((g) => g.name === 'Gemeinsame Quelle')?.readings.map((r) => r.type))
      .toEqual(['temperature', 'relative_humidity']);
  });
});
