import type { BuildingConfig, RoomConfig } from './types';

export interface RoomShape {
  room: RoomConfig;
  x: number;
  y: number;
  width: number;
  height: number;
  level: string;
}

/** Drawing units only: stroke widths and perspective are not construction data. */
export const DRAWING_SCALE = 40;
export function createLayout(building: BuildingConfig) {
  const scale = DRAWING_SCALE;
  const x = 94;
  const roofTop = 86;
  const atticHeight = building.roof.interior_ridge_height_m * scale;
  const groundHeight = (building.levels.find((level) => level.id === 'ground_floor')?.clear_height_m ?? 0) * scale;
  const basementHeight = (building.levels.find((level) => level.id === 'basement')?.clear_height_m ?? 0) * scale;
  const groundTop = roofTop + atticHeight;
  const groundY = groundTop + groundHeight;
  const basementBottom = groundY + basementHeight;
  const houseWidth = building.house.width_m * scale;
  const garageX = x + houseWidth + building.garage.gap_m * scale;
  const garageWidth = building.garage.width_m * scale;
  const garageHeight = building.garage.height_m * scale;
  const layer = building.layers[0]?.id;
  const shapes: RoomShape[] = [];
  const floors = [
    { id: 'attic', name: 'DG', y: roofTop, height: atticHeight, building: 'house', width: houseWidth, x },
    { id: 'ground_floor', name: 'EG', y: groundTop, height: groundHeight, building: 'house', width: houseWidth, x },
    { id: 'basement', name: 'KG', y: groundY, height: basementHeight, building: 'house', width: houseWidth, x },
    { id: 'garage', name: '', y: groundY - garageHeight, height: garageHeight, building: 'garage', width: garageWidth, x: garageX },
  ];
  const bands = floors.map((floor) => {
    let cursor = 0;
    for (const room of building.rooms.filter((candidate) => candidate.level_id === floor.id && candidate.location !== 'outdoor' && candidate.visible && (!candidate.layer_id || candidate.layer_id === layer))) {
      const level = building.levels.find((entry) => entry.id === floor.id);
      if (level?.building_id !== floor.building) break;
      const width = (room.width_m ?? 0) * scale;
      // Unknown or non-fitting rooms remain reachable in the separate overview.
      // We never stretch, truncate or rescale the stated room widths.
      if (width <= 0 || cursor + width > floor.width + 0.001 || floor.height === 0) break;
      shapes.push({ room, x: floor.x + cursor, y: floor.y, width, height: floor.height, level: floor.id });
      cursor += width;
    }
    return { ...floor, remaining: floor.width - cursor, filled: cursor };
  });
  const minY = Math.min(0, groundY - garageHeight - 64);
  const drawn = new Set(shapes.map((shape) => shape.room.id));
  return {
    x, roofTop, atticHeight, groundTop, groundY, basementBottom, houseWidth,
    garageX, garageWidth, garageHeight, shapes, bands,
    otherRooms: building.rooms.filter((room) => !drawn.has(room.id)),
    minY, width: garageX + garageWidth + 64,
    height: Math.max(basementBottom, groundY) + 80 - minY,
  };
}
