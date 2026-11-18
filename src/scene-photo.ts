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
