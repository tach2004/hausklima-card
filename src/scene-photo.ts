import type { RoomConfig } from './types';

export type PhotoHouseSide = 'front' | 'rear';
export interface PhotoRoomCoordinates { x: number; y: number; anchorX?: number; anchorY?: number; }

/** A fixed illustration must NEVER require a fixed list of room IDs.
 * Original locations retain their proven defaults; every other configured
 * room gets a deterministic, movable INITIAL coordinate based on its floor
 * and order among new rooms, never its name, numeric ID or sensor mapping.
 * Stored user coordinates always override this initial coordinate.
 */
export function photoRoomPosition(
  room: RoomConfig, allRooms: RoomConfig[], side: PhotoHouseSide,
  device: 'desktop' | 'mobile' = 'desktop',
): PhotoRoomCoordinates {
  const defaults = side === 'front' ? FRONT_ROOM_ART_POSITIONS : ROOM_ART_POSITIONS;
  const mobileDefaults = side === 'front' ? FRONT_MOBILE_ROOM_ART_POSITIONS : MOBILE_ROOM_ART_POSITIONS;
  // Preserve the approved independent phone starting positions for existing
  // rooms. Newly added rooms are not subject to any ID whitelist.
  const fixed = device === 'mobile' && mobileDefaults[room.id]
    ? mobileDefaults[room.id]
    : room.level_id === 'garage' ? GARAGE_ART_POSITIONS[room.id] : defaults[room.id];
  if (fixed) return fixed;
  const added = allRooms.filter((candidate) => candidate.level_id === room.level_id &&
    candidate.location !== 'outdoor' && !(candidate.level_id === 'garage'
      ? GARAGE_ART_POSITIONS[candidate.id] : defaults[candidate.id]));
  const slot = Math.max(0, added.findIndex((candidate) => candidate.id === room.id));
  const column = slot % 5, row = Math.floor(slot / 5) % 4;
  const levelBase: Record<string, { x: number; y: number }> = side === 'front'
    ? { attic: { x: 22, y: 37 }, ground_floor: { x: 22, y: 64 }, garage: { x: 75, y: 51 } }
    : { attic: { x: 22, y: 33 }, ground_floor: { x: 22, y: 53 },
        basement: { x: 22, y: 74 }, garage: { x: 75, y: 51 } };
  const origin = levelBase[room.level_id] ?? { x: 50, y: 57 };
  return { x: Math.min(96, origin.x + column * (room.level_id === 'garage' ? 4.5 : 8)),
    y: Math.min(96, origin.y + row * 3) };
}

import artwork from './assets/hausklima-cutaway.webp';
import frontArtwork from './assets/hausklima-front.webp';

/** Generic architectural illustration, not an exact image of the user's property. */
export const houseArtwork = artwork;
export const frontHouseArtwork = frontArtwork;

export const FRONT_ROOM_ART_POSITIONS: Readonly<Record<string, {x:number; y:number}>> = {
  front_office: { x:15.2, y:43 }, front_bath_attic: { x:26.6, y:43 },
  front_heating: { x:35.7, y:43 }, front_stairs_attic: { x:43, y:43 },
  front_balcony: { x:56.6, y:43 },
  front_guest_room: { x:15.7, y:70 }, front_bath_ground: { x:27.5, y:70 },
  front_stairs_ground: { x:43, y:70 }, front_living_room: { x:55.7, y:70 },
};
export const FRONT_MOBILE_ROOM_ART_POSITIONS = FRONT_ROOM_ART_POSITIONS;
/** Screen-space positions in the illustration; labels and data remain separate HTML. */
export const ROOM_ART_POSITIONS: Readonly<Record<string, { x: number; y: number }>> = {
  bedroom: { x: 29, y: 38 },
  storage: { x: 55, y: 38 },
  living_room: { x: 26, y: 56 },
  ground_hall: { x: 42, y: 56 },
  kitchen: { x: 56, y: 56 },
  workshop: { x: 26, y: 75 },
  basement_hall: { x: 42, y: 75 },
  laundry: { x: 56, y: 75 },
};

/** Observed object anchors in the unchanged image (1300 × 732), not building dimensions.
 * Cabinet at left of garage, Pylontech left battery, LiTime right battery.
 * Preferred panels sit on the forecourt; leader lines connect each device.
 */
export const GARAGE_ART_POSITIONS: Readonly<Record<string, { x: number; y: number; anchorX: number; anchorY: number }>> = {
  garage: { x: 85, y: 56, anchorX: 85, anchorY: 60 },
  garage_cabinet: { x: 75.5, y: 89, anchorX: 78.2, anchorY: 68.5 },
  garage_battery_pylontech: { x: 85, y: 89, anchorX: 84.2, anchorY: 71 },
  garage_battery_litime: { x: 94.5, y: 89, anchorX: 90.1, anchorY: 71 },
};

/** Identical right-side garage artwork anchors on both views. */
export const FRONT_GARAGE_ART_POSITIONS = GARAGE_ART_POSITIONS;

/** Default phone badge centers: only the responsive UI changes, never the photo. */
export const MOBILE_ROOM_ART_POSITIONS: Readonly<Record<string, { x: number; y: number }>> = {
  bedroom: { x: 27, y: 33 }, storage: { x: 56, y: 33 },
  living_room: { x: 15, y: 55 }, ground_hall: { x: 37, y: 55 }, kitchen: { x: 59, y: 55 },
  workshop: { x: 15, y: 78 }, basement_hall: { x: 37, y: 78 }, laundry: { x: 59, y: 78 },
  garage: { x: 85, y: 55 },
};
