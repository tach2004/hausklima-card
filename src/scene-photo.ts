import artwork from './assets/hausklima-cutaway.webp';

/** Generic architectural illustration, not an exact image of the user's property. */
export const houseArtwork = artwork;

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
export const GARAGE_ART_POSITIONS: Readonly<Record<string, { x: number; y: number; anchorX: number; anchorY: number; width: number }>> = {
  garage: { x: 85, y: 56, anchorX: 85, anchorY: 60, width: 17 },
  garage_cabinet: { x: 75.5, y: 89, anchorX: 78.2, anchorY: 68.5, width: 8.5 },
  garage_battery_pylontech: { x: 85, y: 89, anchorX: 84.2, anchorY: 71, width: 8.5 },
  garage_battery_litime: { x: 94.5, y: 89, anchorX: 90.1, anchorY: 71, width: 8.5 },
};
