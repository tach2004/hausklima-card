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
  'pressure_relative',
  'pressure_absolute',
  'condensation_risk',
] as const;

export type MetricType = (typeof METRIC_TYPES)[number];

export interface SensorConfig {
  entity: string;
  name?: string;
  /** Include this source in the overview; omitted retains the legacy primary. */
  show_in_overview?: boolean;
  /** Mobile-only visibility for this exact source; omitted keeps legacy primary-only phone badges. */
  show_on_mobile?: boolean;
  /** Same names join readings into one source group within this location. */
  overview_group?: string;
}

/** Percent-of-artwork coordinates. Each device has independent desktop/mobile slots. */
export interface BadgeCoordinates { x: number; y: number; }
export interface BadgePositionSet { desktop?: BadgeCoordinates; mobile?: BadgeCoordinates; }

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
  /** Per-metric phone badge visibility, independent from desktop and details. */
  mobile_overview?: Partial<Record<MetricType, boolean>>;
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
  /** Migration marker: garage climate sub-locations were added to this config. */
  garage_components_initialized?: boolean;
}

export interface HausKlimaCardConfig {
  type: 'custom:hausklima-card';
  title?: string;
  show_dimensions?: boolean;
  show_room_names?: boolean;
  /** Opacity of the dark sensor tiles, from 0.35 to 1 (inclusive). */
  chip_opacity?: number;
  /** Maximum width of the full building scene, from 900 to 3200 CSS pixels. */
  scene_max_width?: number;
  /** Photo badge font sizes in CSS pixels, separate from detail panels. */
  badge_font_desktop?: number;
  badge_font_mobile?: number;
  /** Individually persisted per-location positions, keyed by stable room ID. */
  badge_positions?: Record<string, BadgePositionSet>;
  /** Independent front-facing rooms; garage/outdoor entities always come from building.rooms. */
  front_rooms?: RoomConfig[];
  /** Front-facing room positions. Garage/outdoor use badge_positions on both sides. */
  front_badge_positions?: Record<string, BadgePositionSet>;
  /** Visual theme of this card; auto follows Home Assistant's active theme. */
  theme_mode?: 'auto' | 'light' | 'dark';
  building?: BuildingConfig;
  /** Lovelace may attach layout/visibility properties; preserve these in editor. */
  [key: string]: unknown;
}

export type SensorStatus = 'available' | 'unavailable' | 'unknown' | 'missing';

export interface ResolvedSensor {
  metric_type: MetricType;
  entity: string;
  name: string;
  value: string | null;
  unit: string;
  status: SensorStatus;
  is_primary: boolean;
  show_in_overview: boolean;
  show_on_mobile?: boolean;
  overview_group?: string;
}

export interface OverviewReading {
  type: MetricType;
  label: string;
  sensor: ResolvedSensor;
}

export interface OverviewGroup {
  name: string;
  readings: OverviewReading[];
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
