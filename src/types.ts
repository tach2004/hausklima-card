/** The deliberately small subset of Home Assistant's frontend API used here. */
export interface HomeAssistant {
  states: Record<string, HassEntity>;
  locale?: { language?: string; number_format?: string };
  language?: string;
  themes?: { darkMode?: boolean; [key: string]: unknown };
}

export interface HassEntity {
  state: string;
  attributes: Record<string, unknown>;
}

export const METRIC_TYPES = [
  'temperature',
  'relative_humidity',
  'absolute_humidity',
  'co2',
  'voc',
] as const;

export type MetricType = (typeof METRIC_TYPES)[number];

export interface SensorConfig {
  entity: string;
  name?: string;
}

/** Coordinates are relative to the room, from 0 to 1. Layout UI follows later. */
export interface MeasurementPosition {
  x: number;
  y: number;
}

export interface MeasurementConfig {
  sensors: SensorConfig[];
  /** Entity ID of the main sensor; the first sensor is the fallback. */
  primary?: string;
  visible?: boolean;
  /** Include the primary reading in room tiles; details retain every source. */
  show_in_overview?: boolean;
  position?: MeasurementPosition;
}

export interface RoomConfig {
  id: string;
  name: string;
  level_id: string;
  layer_id?: string;
  /** Outdoor locations have no implied position in the building cross-section. */
  location?: 'indoor' | 'outdoor';
  visible: boolean;
  /** Stated clear width, never resized to fill the facade; null means unknown. */
  width_m: number | null;
  measurements?: Partial<Record<MetricType, MeasurementConfig>>;
}

export interface LevelConfig {
  id: string;
  name: string;
  building_id: 'house' | 'garage';
  /** Attic height varies: use roof dimensions instead of inventing one value. */
  clear_height_m: number | null;
}

/** Prepared for alternative room planes; Phase 1 has no plane-switching UI. */
export interface RoomLayer {
  id: string;
  name: string;
}

export interface BuildingConfig {
  house: { width_m: number; depth_m: number };
  garage: {
    width_m: number;
    depth_m: number;
    height_m: number;
    gap_m: number;
    gap_is_approximate: boolean;
  };
  walls: {
    stated_thickness_m: number;
    exterior_thickness_m: number | null;
    interior_thickness_m: number | null;
  };
  roof: {
    knee_wall_height_m: number;
    interior_ridge_height_m: number;
    pitch_degrees: number | null;
  };
  levels: LevelConfig[];
  layers: RoomLayer[];
  /** Array order preserves the given left-to-right order within each level. */
  rooms: RoomConfig[];
  notes: string[];
}

export interface HausKlimaCardConfig {
  type: 'custom:hausklima-card';
  title?: string;
  show_dimensions?: boolean;
  show_room_names?: boolean;
  building?: BuildingConfig;
  /** Lovelace may attach layout/visibility properties; preserve these in editor. */
  [key: string]: unknown;
}

export type SensorStatus = 'available' | 'unavailable' | 'unknown' | 'missing';

export interface ResolvedSensor {
  entity: string;
  name: string;
  value: string | null;
  unit: string;
  status: SensorStatus;
  is_primary: boolean;
}

export interface ResolvedMeasurement {
  type: MetricType;
  label: string;
  primary: ResolvedSensor;
  sensors: ResolvedSensor[];
  visible: boolean;
  show_in_overview: boolean;
  position?: MeasurementPosition;
}
