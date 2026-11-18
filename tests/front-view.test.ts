import { describe, expect, it } from '../scripts/unit-test-compat';
import { getDefaultConfig, normalizeConfig, resolveBuilding } from '../src/config';
import { getDefaultBuilding } from '../src/defaults';
import { applyFrontEdit, frontEditorConfig, getDefaultFrontRooms, resolveSideBadgePositions, resolveSideBuilding } from '../src/front-view';
import { addSensor, resetBadgePosition, saveBadgePosition } from '../src/editor-model';

describe('front and rear house separation', () => {
  it('starts on nine independent front rooms, two floors and shared garage/outside only', () => {
    const config = getDefaultConfig();
    const rear = resolveBuilding(config);
    const front = resolveSideBuilding(config, rear, 'front');
    expect(front.rooms.filter((room) => room.id.startsWith('front_'))).toHaveLength(9);
    expect(front.rooms.some((room) => room.level_id === 'basement')).toBe(false);
    expect(front.rooms.map((room) => room.id)).toEqual([
      ...getDefaultFrontRooms().map((room) => room.id),
      ...rear.rooms.filter((room) => room.level_id === 'garage' || room.location === 'outdoor').map((room) => room.id),
    ]);
    expect(getDefaultFrontRooms().filter((room) => room.level_id === 'ground_floor').map((room) => room.name))
      .toEqual(['Gästezimmer', 'Badezimmer', 'Treppenhaus / Haustür', 'Wohnzimmer']);
    expect(getDefaultFrontRooms().filter((room) => room.level_id === 'attic').map((room) => room.name))
      .toEqual(['Büro', 'Bad', 'Heizungsraum', 'Treppenhaus', 'Balkon']);
    expect(rear.rooms.some((room) => room.id.startsWith('front_'))).toBe(false);
  });

  it('persists front office sensors without altering rear rooms or their sensor assignments', () => {
    const original = normalizeConfig({ ...getDefaultConfig(), building: getDefaultBuilding() });
    const rear = resolveBuilding(original);
    const working = frontEditorConfig(original, rear);
    const edited = addSensor(working, 'front_office', 'temperature', 'sensor.test_front_office_temperature');
    const saved = normalizeConfig(applyFrontEdit(original, rear, edited));
    const front = resolveSideBuilding(saved, resolveBuilding(saved), 'front');
    expect(front.rooms.find((room) => room.id === 'front_office')?.measurements?.temperature?.sensors[0]?.entity)
      .toBe('sensor.test_front_office_temperature');
    expect(resolveBuilding(saved).rooms).toEqual(rear.rooms);
    expect(saved.front_rooms?.length).toBe(9);
    expect(saved.badge_positions).toBeUndefined();
  });

  it('updates the shared garage once even when edited from the front', () => {
    const original = normalizeConfig({ ...getDefaultConfig(), building: getDefaultBuilding() });
    const rear = resolveBuilding(original);
    const working = frontEditorConfig(original, rear);
    const edited = addSensor(working, 'garage', 'temperature', 'sensor.test_shared_garage');
    const saved = normalizeConfig(applyFrontEdit(original, rear, edited));
    const rearGarage = resolveBuilding(saved).rooms.find((room) => room.id === 'garage');
    const frontGarage = resolveSideBuilding(saved, resolveBuilding(saved), 'front').rooms.find((room) => room.id === 'garage');
    expect(rearGarage?.measurements?.temperature?.sensors[0]?.entity).toBe('sensor.test_shared_garage');
    expect(frontGarage).toEqual(rearGarage);
  });

  it('shares garage, cabinet, batteries and outdoor positions while isolating front rooms', () => {
    const building = getDefaultBuilding();
    building.rooms.push({ id: 'outdoor_test', name: 'Außen', level_id: 'ground_floor',
      location: 'outdoor', visible: false, width_m: null });
    const shared = ['garage', 'garage_cabinet', 'garage_battery_pylontech',
      'garage_battery_litime', 'outdoor_test'];
    const original = normalizeConfig({ ...getDefaultConfig(), building,
      badge_positions: Object.fromEntries(shared.map((id, index) =>
        [id, { desktop: { x: 70 + index, y: 25 }, mobile: { x: 80 + index, y: 65 } }])),
      front_badge_positions: {
        garage: { desktop: { x: 12, y: 12 } },
        front_office: { desktop: { x: 35, y: 45 } },
      },
    });
    const rear = resolveBuilding(original);
    const front = resolveSideBadgePositions(original, rear, 'front')!;
    for (const id of shared) expect(front[id]).toEqual(original.badge_positions![id]);
    expect(front.front_office?.desktop).toEqual({ x: 35, y: 45 });

    const edited = saveBadgePosition(frontEditorConfig(original, rear), 'garage_cabinet',
      'mobile', { x: 92.5, y: 82.1 });
    const saved = normalizeConfig(applyFrontEdit(original, rear, edited));
    expect(saved.badge_positions?.garage_cabinet?.mobile).toEqual({ x: 92.5, y: 82.1 });
    expect(saved.front_badge_positions?.garage_cabinet).toBeUndefined();
    expect(saved.front_badge_positions?.garage).toBeUndefined();
    expect(saved.front_badge_positions?.front_office?.desktop).toEqual({ x: 35, y: 45 });
    expect(resolveSideBadgePositions(saved, resolveBuilding(saved), 'front')?.garage_cabinet)
      .toEqual(saved.badge_positions?.garage_cabinet);
    const reset = resetBadgePosition(frontEditorConfig(saved, resolveBuilding(saved)),
      'garage_cabinet', 'mobile');
    const afterReset = applyFrontEdit(saved, resolveBuilding(saved), reset);
    expect(afterReset.badge_positions?.garage_cabinet?.mobile).toBeUndefined();
    expect(afterReset.badge_positions?.garage_cabinet?.desktop).toEqual({ x: 71, y: 25 });
    expect(getDefaultConfig().front_rooms).toBeUndefined();
    expect(getDefaultConfig().front_badge_positions).toBeUndefined();
  });

  it('keeps all five right-side shared objects at identical coordinates on both sides', () => {
    const config = normalizeConfig({ ...getDefaultConfig(), building: getDefaultBuilding(),
      badge_positions: {
        garage: { desktop: { x: 85, y: 56 }, mobile: { x: 86, y: 54 } },
        garage_cabinet: { desktop: { x: 75.5, y: 89 } },
        garage_battery_pylontech: { desktop: { x: 85, y: 89 } },
        garage_battery_litime: { mobile: { x: 94.5, y: 89 } },
      },
      front_badge_positions: {
        garage_cabinet: { desktop: { x: 16, y: 70 } },
        garage: { mobile: { x: 18, y: 68 } },
      },
    });
    const rear = resolveBuilding(config);
    const front = resolveSideBuilding(config, rear, 'front');
    const shared = rear.rooms.filter((room) => room.level_id === 'garage' || room.location === 'outdoor');
    expect(front.rooms.filter((room) => room.level_id === 'garage' || room.location === 'outdoor')).toEqual(shared);
    const rearPositions = resolveSideBadgePositions(config, rear, 'rear');
    const frontPositions = resolveSideBadgePositions(config, rear, 'front');
    for (const room of shared) expect(frontPositions?.[room.id]).toEqual(rearPositions?.[room.id]);
    expect(frontPositions?.garage_cabinet?.desktop).toEqual({ x: 75.5, y: 89 });
    expect(frontPositions?.garage?.mobile).toEqual({ x: 86, y: 54 });
    expect(frontPositions?.front_office).toBeUndefined();
  });

  it('rejects cross-side collisions in stored front identifiers and invalid levels', () => {
    expect(() => normalizeConfig({ ...getDefaultConfig(), front_rooms: [
      { id: 'bedroom', name: 'Unzulässig', level_id: 'attic', visible: true, width_m: 2 },
    ] })).toThrow(/front_/);
    expect(() => normalizeConfig({ ...getDefaultConfig(), front_rooms: [
      { id: 'front_wrong', name: 'Unzulässig', level_id: 'basement', visible: true, width_m: 2 },
    ] })).toThrow(/level_id/);
  });
});
