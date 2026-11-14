import type { BuildingConfig } from './types';

const DEFAULT_BUILDING: BuildingConfig = {
  house: { width_m: 12, depth_m: 10 },
  garage: {
    width_m: 6,
    depth_m: 6,
    height_m: 3,
    gap_m: 5,
    gap_is_approximate: true,
  },
  walls: {
    stated_thickness_m: 0.24,
    exterior_thickness_m: null,
    interior_thickness_m: null,
  },
  roof: {
    knee_wall_height_m: 1,
    interior_ridge_height_m: 4,
    pitch_degrees: null,
  },
  levels: [
    { id: 'basement', name: 'Keller', building_id: 'house', clear_height_m: 2.5 },
    { id: 'ground_floor', name: 'Erdgeschoss', building_id: 'house', clear_height_m: 2.64 },
    { id: 'attic', name: 'Dachgeschoss', building_id: 'house', clear_height_m: null },
    { id: 'garage', name: 'Garage', building_id: 'garage', clear_height_m: null },
  ],
  layers: [{ id: 'main', name: 'Sichtbare Raumebene' }],
  garage_components_initialized: true,
  rooms: [
    { id: 'workshop', name: 'Werkstatt', level_id: 'basement', layer_id: 'main', visible: true, width_m: 4 },
    { id: 'basement_hall', name: 'Flur', level_id: 'basement', layer_id: 'main', visible: true, width_m: 3.4 },
    { id: 'laundry', name: 'Waschküche', level_id: 'basement', layer_id: 'main', visible: true, width_m: 3.5 },
    { id: 'living_room', name: 'Wohnzimmer', level_id: 'ground_floor', layer_id: 'main', visible: true, width_m: 6.5 },
    { id: 'ground_hall', name: 'Flur', level_id: 'ground_floor', layer_id: 'main', visible: true, width_m: 0.9 },
    { id: 'kitchen', name: 'Küche', level_id: 'ground_floor', layer_id: 'main', visible: true, width_m: 3.51 },
    { id: 'bedroom', name: 'Schlafzimmer', level_id: 'attic', layer_id: 'main', visible: true, width_m: 7.6 },
    { id: 'storage', name: 'Abstellraum', level_id: 'attic', layer_id: 'main', visible: true, width_m: 3.6 },
    { id: 'garage', name: 'Garage', level_id: 'garage', layer_id: 'main', visible: true, width_m: 6 },
    { id: 'garage_battery_pylontech', name: 'Pylontech', level_id: 'garage', layer_id: 'main', visible: false, width_m: null },
    { id: 'garage_battery_litime', name: 'LiTime', level_id: 'garage', layer_id: 'main', visible: false, width_m: null },
    { id: 'garage_cabinet', name: 'Schaltschrank', level_id: 'garage', layer_id: 'main', visible: false, width_m: null },
  ],
  notes: [
    'Die Raummaße schließen die 12 m Außenbreite nicht vollständig. Es erfolgt keine automatische Anpassung.',
    '0,24 m ist eine angegebene Wandstärke. Ihre Zuordnung zu Außen- und Innenwänden ist offen.',
    'Die 12-m-Traufseite ist sichtbar; der Dachfirst verläuft parallel zur Fassade.',
    'Dachneigung, Dachüberstände, Deckendicken und endgültige Cutaway-Tiefe sind ungeklärt.',
    'Die freistehende Garage liegt rechts vom Haus; der Abstand beträgt ungefähr 5 m.',
  ],
};

/** Return independent data for each card/editor instance. */
export function getDefaultBuilding(): BuildingConfig {
  return structuredClone(DEFAULT_BUILDING);
}
