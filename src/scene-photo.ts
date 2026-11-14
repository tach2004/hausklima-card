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
