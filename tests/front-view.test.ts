import { describe, expect, it } from '../scripts/unit-test-compat';
import { getDefaultConfig, normalizeConfig, resolveBuilding } from '../src/config';
import { getDefaultBuilding } from '../src/defaults';
import { applyFrontEdit, frontEditorConfig, getDefaultFrontRooms, resolveSideBuilding } from '../src/front-view';
import { addSensor, saveBadgePosition } from '../src/editor-model';

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

  it('keeps front/rear badge positions independent even for shared garage', () => {
    const original = normalizeConfig({ ...getDefaultConfig(),
      badge_positions: { garage: { mobile: { x: 87, y: 60 } } } });
    const rear = resolveBuilding(original);
    const edit = saveBadgePosition(frontEditorConfig(original, rear), 'garage', 'mobile', { x: 12.5, y: 67.4 });
    const saved = normalizeConfig(applyFrontEdit(original, rear, edit));
    expect(saved.front_badge_positions?.garage?.mobile).toEqual({ x: 12.5, y: 67.4 });
    expect(saved.badge_positions?.garage?.mobile).toEqual({ x: 87, y: 60 });
    expect(getDefaultConfig().front_rooms).toBeUndefined();
    expect(getDefaultConfig().front_badge_positions).toBeUndefined();
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
