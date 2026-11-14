import { describe, expect, it } from 'vitest';
import { getDefaultBuilding } from '../src/defaults';
import { createLayout, DRAWING_SCALE } from '../src/layout';

describe('schematic building layout', () => {
  it('preserves supplied room widths and leaves all facade discrepancies unresolved', () => {
    const building = getDefaultBuilding();
    const layout = createLayout(building);
    const expectedRemainders: Record<string, number> = { basement: 1.1, ground_floor: 1.09, attic: 0.8 };

    for (const [level, remainder] of Object.entries(expectedRemainders)) {
      const band = layout.bands.find((candidate) => candidate.id === level)!;
      expect(band.remaining / DRAWING_SCALE).toBeCloseTo(remainder);
      expect(band.width / DRAWING_SCALE).toBe(12);
    }
    expect(layout.shapes).toHaveLength(9);
    for (const shape of layout.shapes) {
      expect(shape.width / DRAWING_SCALE).toBeCloseTo(shape.room.width_m!);
    }
    expect(building.house.width_m).toBe(12);
  });

  it('keeps the garage detached by the stated approximate five metre gap', () => {
    const building = getDefaultBuilding();
    const layout = createLayout(building);
    expect((layout.garageX - (layout.x + layout.houseWidth)) / DRAWING_SCALE).toBe(5);
    expect(layout.garageWidth / DRAWING_SCALE).toBe(6);
    expect(layout.garageHeight / DRAWING_SCALE).toBe(3);
    const garage = layout.shapes.find((shape) => shape.room.id === 'garage')!;
    expect(garage.x).toBe(layout.garageX);
    expect(garage.y + garage.height).toBeCloseTo(layout.groundY);
    expect(building.garage.gap_is_approximate).toBe(true);
  });

  it('uses the stated clear heights and maximum internal attic height for schematic bands', () => {
    const layout = createLayout(getDefaultBuilding());
    expect(layout.bands.find((band) => band.id === 'basement')!.height / DRAWING_SCALE).toBe(2.5);
    expect(layout.bands.find((band) => band.id === 'ground_floor')!.height / DRAWING_SCALE).toBe(2.64);
    expect(layout.bands.find((band) => band.id === 'attic')!.height / DRAWING_SCALE).toBe(4);
  });

  it('retains hidden, unknown-width and alternative-layer spaces outside the drawing', () => {
    const building = getDefaultBuilding();
    building.layers.push({ id: 'rear', name: 'Hintere Raumebene' });
    building.rooms.push(
      { id: 'hidden', name: 'Verborgener Raum', level_id: 'ground_floor', visible: false, width_m: null },
      { id: 'unknown', name: 'Unbekannte Breite', level_id: 'ground_floor', visible: true, width_m: null },
      { id: 'rear', name: 'Hinterer Raum', level_id: 'ground_floor', layer_id: 'rear', visible: true, width_m: 1 },
    );
    const layout = createLayout(building);
    expect(layout.shapes).toHaveLength(9);
    expect(layout.otherRooms.filter((room) => ['hidden', 'unknown', 'rear'].includes(room.id)).map((room) => room.id)).toEqual(['hidden', 'unknown', 'rear']);
  });

  it('keeps non-fitting rooms in the overview without shrinking their known widths', () => {
    const building = getDefaultBuilding();
    building.rooms.find((room) => room.id === 'living_room')!.width_m = 13;
    const layout = createLayout(building);
    expect(layout.shapes.some((shape) => shape.room.id === 'living_room')).toBe(false);
    expect(layout.otherRooms.find((room) => room.id === 'living_room')?.width_m).toBe(13);
    expect(layout.shapes.filter((shape) => shape.level === 'ground_floor')).toHaveLength(0);
    expect(layout.otherRooms.filter((room) => room.level_id === 'ground_floor').map((room) => room.id)).toEqual(['living_room', 'ground_hall', 'kitchen']);
    expect(building.house.width_m).toBe(12);
  });

  it('does not infer later room positions when an earlier room has an unknown width', () => {
    const building = getDefaultBuilding();
    building.rooms.find((room) => room.id === 'workshop')!.width_m = null;
    const layout = createLayout(building);
    expect(layout.shapes.filter((shape) => shape.level === 'basement')).toHaveLength(0);
    expect(layout.otherRooms.filter((room) => room.level_id === 'basement').map((room) => room.id)).toEqual(['workshop', 'basement_hall', 'laundry']);
    expect(layout.bands.find((band) => band.id === 'basement')!.remaining / DRAWING_SCALE).toBe(12);
  });

  it('keeps the full drawing in view when a custom garage extends above the house', () => {
    const building = getDefaultBuilding();
    building.garage.height_m = 20;
    const layout = createLayout(building);
    const garage = layout.shapes.find((shape) => shape.room.id === 'garage')!;
    expect(layout.minY).toBeLessThan(0);
    expect(layout.minY).toBeLessThan(garage.y);
    expect(layout.minY + layout.height).toBeGreaterThan(layout.basementBottom);
    expect(garage.height / DRAWING_SCALE).toBe(20);
  });

  it('keeps rooms in the overview when their level belongs to another building', () => {
    const building = getDefaultBuilding();
    building.levels.find((level) => level.id === 'ground_floor')!.building_id = 'garage';
    const layout = createLayout(building);
    expect(layout.shapes.filter((shape) => shape.level === 'ground_floor')).toHaveLength(0);
    expect(layout.otherRooms.filter((room) => room.level_id === 'ground_floor').map((room) => room.id)).toEqual(['living_room', 'ground_hall', 'kitchen']);
  });
});
