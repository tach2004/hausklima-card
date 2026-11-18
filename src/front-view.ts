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

/** The garage remains on the RIGHT in the original landscape on both sides.
 * Garage, batteries, cabinet and outdoor locations use the same canonical rear
 * sensor configuration, desktop/mobile overlay coordinates and device anchors.
 * Legacy front-side values for these IDs cannot override the originals.
 */
export function resolveSideBadgePositions(
  config: HausKlimaCardConfig, rear: BuildingConfig, side: HouseSide,
): HausKlimaCardConfig['badge_positions'] {
  if (side === 'rear') return config.badge_positions;
  const positions = { ...config.front_badge_positions };
  for (const room of rear.rooms.filter(isSharedLocation)) {
    if (config.badge_positions?.[room.id]) positions[room.id] = config.badge_positions[room.id]!;
    else delete positions[room.id];
  }
  return positions;
}

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
  return { ...config, building: resolveFrontBuilding(config, rear), badge_positions: resolveSideBadgePositions(config, rear, 'front') };
}
export function applyFrontEdit(original: HausKlimaCardConfig, rear: BuildingConfig, edited: HausKlimaCardConfig): HausKlimaCardConfig {
  const updated = edited.building?.rooms ?? [];
  const shared = new Map(updated.filter(isSharedLocation).map((room) => [room.id, room]));
  const mergedRear: BuildingConfig = { ...rear, rooms: rear.rooms.map((room) => isSharedLocation(room)
    ? structuredClone(shared.get(room.id) ?? room) : room) };
  const rearPositions = structuredClone(original.badge_positions ?? {});
  const frontPositions = structuredClone(edited.badge_positions ?? {});
  for (const room of rear.rooms.filter(isSharedLocation)) {
    const position = edited.badge_positions?.[room.id];
    if (position) rearPositions[room.id] = structuredClone(position);
    else delete rearPositions[room.id];
    delete frontPositions[room.id];
  }
  return {
    ...original,
    building: mergedRear,
    front_rooms: updated.filter(isFrontRoom).map((room) => structuredClone(room)),
    badge_positions: Object.keys(rearPositions).length ? rearPositions : undefined,
    front_badge_positions: Object.keys(frontPositions).length ? frontPositions : undefined,
  };
}
