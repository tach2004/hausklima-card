// Exact aliases for the two battery IDs emitted by older versions. The old
// suffixes fit in base 36 as safe integers. Keep the stored room IDs as they
// are, and use these neutral keys only when looking up the depicted equipment.
const legacyBatteryKeys = new Map([
  [73_239_332_885_729, 'garage_battery_1'],
  [1_301_399_942, 'garage_battery_2'],
]);

export function garageLocationKey(id: string): string {
  const suffix = /^garage_battery_([a-z]{6,9})$/.exec(id)?.[1];
  return suffix ? legacyBatteryKeys.get(Number.parseInt(suffix, 36)) ?? id : id;
}

export function isGarageEquipment(id: string): boolean {
  const key = garageLocationKey(id);
  return key === 'garage_cabinet' || key === 'garage_battery_1' || key === 'garage_battery_2';
}
