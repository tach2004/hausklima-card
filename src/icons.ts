import { css, svg } from 'lit';
import type { MetricType, RoomConfig } from './types';

/** Small local line icons: no icon service, font or additional card is required. */
export function metricIcon(type: MetricType) {
  const shapes = {
    temperature: svg`<path d="M9 14.5V5a3 3 0 0 1 6 0v9.5a5 5 0 1 1-6 0Z"/><path d="M12 8v9"/><circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none"/>`,
    relative_humidity: svg`<path d="M12 3C10 7 5 11 5 15a7 7 0 0 0 14 0c0-4-5-8-7-12Z"/><path d="M8 15a4 4 0 0 0 4 4"/>`,
    absolute_humidity: svg`<path d="M10 3C8 7 4 11 4 15a6 6 0 0 0 12 0c0-4-4-8-6-12Z"/><path d="M18 7v9m-3-3 3 3 3-3M7 16h5"/>`,
    co2: svg`<path d="M6 17a4 4 0 0 1-1-7.9A6 6 0 0 1 16 7a5 5 0 0 1 2 9.6"/><text x="3" y="21" stroke="none" fill="currentColor" font-size="8" font-weight="700">CO₂</text>`,
    voc: svg`<path d="M3 8h12a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h5a3 3 0 1 1-3 3"/>`,
    pressure_relative: svg`<path d="M5 18a9 9 0 1 1 14 0M12 13l5-6M5 13h2m3-8 1 2m7 6h1"/><text x="6" y="22" stroke="none" fill="currentColor" font-size="7">rel</text>`,
    pressure_absolute: svg`<path d="M5 18a9 9 0 1 1 14 0M12 13l5-6M5 13h2m3-8 1 2m7 6h1"/><text x="5" y="22" stroke="none" fill="currentColor" font-size="7">abs</text>`,
  };
  return svg`<svg class="climate-icon metric-icon ${type}" data-icon=${type} viewBox="0 0 24 24" aria-hidden="true">${shapes[type]}</svg>`;
}

export function roomIcon(room: Pick<RoomConfig, 'id' | 'location'>) {
  const shapes = {
    bedroom: svg`<path d="M3 19V8m18 11V8M3 15h18M5 11V5h14v6M5 10h14v5H5Z"/><path d="M7 8h3m4 0h3"/>`,
    storage: svg`<path d="m3 7 9-4 9 4v13H3ZM3 7l9 4 9-4M12 11v9M8 5l9 4"/>`,
    living_room: svg`<path d="M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5M3 11a2 2 0 0 1 4 0v4h10v-4a2 2 0 0 1 4 0v8H3Zm2 8v2m14-2v2"/>`,
    ground_hall: svg`<path d="M7 21V3h11v18M4 21h17M14 12h1"/>`,
    basement_hall: svg`<path d="M3 21h6v-6h6V9h6M4 14l13-11m-5 0h5v5"/>`,
    kitchen: svg`<path d="M4 3v6a3 3 0 0 0 6 0V3M7 3v18M19 21V3c-5 2-5 10 0 10"/>`,
    workshop: svg`<path d="m14 6 4 4M5 3l4 4-2 2-4-4m4 4 13 13M14 3a6 6 0 0 0-7 8L3 17a3 3 0 0 0 4 4l6-5a6 6 0 0 0 8-7l-4 3-4-4Z"/>`,
    laundry: svg`<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="14" r="5"/><path d="M4 7h16M7 5h1m3 0h1M8 14q4 4 8 0"/>`,
    garage: svg`<path d="m2 9 10-7 10 7M4 8v14h16V8M7 22V11h10v11M7 15h10M7 19h10"/>`,
    garage_cabinet: svg`<rect x="5" y="2" width="14" height="20" rx="1"/><path d="M12 5 9 11h6l-3 6M16 17v2"/>`,
    battery: svg`<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 5V2h8v3M7 11h4m-2-2v4m6-2h3"/>`,
    outdoor: svg`<circle cx="9" cy="8" r="4"/><path d="M9 1V0M3 3 2 2m14 1 1-1M1 8H0m18 0h2M5 14a4 4 0 1 0 0 8h12a5 5 0 0 0 0-10 6 6 0 0 0-11 2Z"/>`,
    generic: svg`<path d="m2 11 10-9 10 9M5 9v13h14V9M10 22v-8h4v8"/>`,
  };
  const key = room.location === 'outdoor' ? 'outdoor'
    : room.id.startsWith('garage_battery_') ? 'battery'
    : room.id in shapes ? room.id as keyof typeof shapes : 'generic';
  return svg`<svg class="climate-icon room-icon" data-room-icon=${key} viewBox="0 0 24 24" aria-hidden="true">${shapes[key]}</svg>`;
}

export const iconStyles = css`
  .climate-icon { display: inline-block; width: 16px; height: 16px; flex-shrink: 0; vertical-align: middle;
    fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
  .metric-icon.temperature { color: #ffc095; }
  .metric-icon.relative_humidity { color: #8dd6ee; }
  .metric-icon.absolute_humidity { color: #9bdad0; }
  .metric-icon.co2 { color: #b5d998; }
  .metric-icon.voc { color: #d7c0f0; }
  .metric-icon.pressure_relative, .metric-icon.pressure_absolute { color: #c4d7ef; }
  .room-icon { width: 15px; height: 15px; color: inherit; }
`;
