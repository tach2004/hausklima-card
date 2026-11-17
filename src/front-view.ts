import type { BuildingConfig, HausKlimaCardConfig, RoomConfig } from './types';

/** Front facade, independent rooms, approximate reported clear widths in metres.
 * No cellar: the original rear facade owns the cellar and its sensor mappings.
 * Ground floor sum 10.82m + 2 outer walls 0.30m + 3 interior walls 0.24m
 * is approximately 12.14m. Attic sum 10.8m + wall allowances is approximate.
 * These are documentation values, not artificially altered measured dimensions.
 */
const FRONT_ROOMS: RoomConfig[] = [
  { id: 'front_guest_room', name: 'Gästezimmer', level_id: 'ground_floor', visible: true, width_m: 3.51 },
  { id: 'front_bath_ground', name: 'Badezimmer', level_id: 'ground_floor', visible: true, width_m: 2.16 },
  { id: 'front_stairs_ground', name: 'Treppenhaus / Haustür', level_id: 'ground_floor', visible: true, width_m: 2.39 },
  { id: 'front_living_room', name: 'Wohnzimmer', level_id: 'ground_floor', visible: true, width_m: 2.76 },
  { id: 'front_office', name: 'Büro', level_id: 'attic', visible: true, width_m: 3.6 },
  { id: 'front_bath_attic', name: 'Bad', level_id: 'attic', visible: true, width_m: 2.5 },
  { id: 'front_heating', name: 'Heizungsraum', level_id: 'attic', visible: true, width_m: 1 },
  { id: 'front_stairs_attic', name: 'Treppenhaus', level_id: 'attic', visible: true, width_m: 1 },
  { id: 'front_balcony', name: 'Balkon', level_id: 'attic', visible: true, width_m: 2.7 },
];

export type HouseSide = 'rear' | 'front';
export function getDefaultFrontRooms(): RoomConfig[] { return structuredClone(FRONT_ROOMS); }
export const isSharedLocation = (room: RoomConfig): boolean =>
  room.location === 'outdoor' || room.level_id === 'garage';
export const isFrontRoom = (room: RoomConfig): boolean => room.id.startsWith('front_');

/** Configured front rooms and original garage/outdoor objects are reused,
 * not copied into two separately editable sensor configurations.
 */
export function resolveFrontBuilding(config: HausKlimaCardConfig, rear: BuildingConfig): BuildingConfig {
  return { ...rear, rooms: [
    ...structuredClone(config.front_rooms ?? getDefaultFrontRooms()),
    ...rear.rooms.filter(isSharedLocation).map((room) => structuredClone(room)),
  ] };
}

export function resolveSideBuilding(config: HausKlimaCardConfig, rear: BuildingConfig, side: HouseSide): BuildingConfig {
  return side === 'front' ? resolveFrontBuilding(config, rear) : rear;
}

/** Existing editor-model functions operate on building.rooms; front edits are
 * round-tripped so only front rooms change while the shared garage/outdoor
 * mappings are written back once to the original building.
 */
export function frontEditorConfig(config: HausKlimaCardConfig, rear: BuildingConfig): HausKlimaCardConfig {
  return { ...config, building: resolveFrontBuilding(config, rear), badge_positions: config.front_badge_positions };
}
export function applyFrontEdit(original: HausKlimaCardConfig, rear: BuildingConfig, edited: HausKlimaCardConfig): HausKlimaCardConfig {
  const updated = edited.building?.rooms ?? [];
  const shared = new Map(updated.filter(isSharedLocation).map((room) => [room.id, room]));
  const mergedRear: BuildingConfig = { ...rear, rooms: rear.rooms.map((room) => isSharedLocation(room)
    ? structuredClone(shared.get(room.id) ?? room) : room) };
  return {
    ...original,
    building: mergedRear,
    front_rooms: updated.filter(isFrontRoom).map((room) => structuredClone(room)),
    front_badge_positions: edited.badge_positions,
  };
}
