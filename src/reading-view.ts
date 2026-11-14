import { css, html, nothing } from 'lit';
import { formatSensorValue, resolveOverviewGroups } from './metrics';
import { metricIcon } from './icons';
import type { HomeAssistant, RoomConfig } from './types';

/** One shared overview for scene panels, rooms, equipment and outdoor locations. */
export function renderReadingGroups(room: RoomConfig, hass?: HomeAssistant, photo = false) {
  const groups = resolveOverviewGroups(room, hass);
  if (!groups.length) return nothing;
  const selectedTemperatures = groups.flatMap((group) => group.readings).filter((reading) => reading.type === 'temperature').length;
  const groupRows = room.location === 'outdoor' || selectedTemperatures > 1;
  return html`<span class="sensor-groups ${groups.some((group) => group.name) ? 'has-named-groups' : 'single-source'} ${groupRows ? 'group-rows' : 'group-columns'}">
    ${groups.map((group) => html`<span class="sensor-group ${group.name ? 'named-group' : 'simple-group'}" data-source-group=${group.name} data-overview-group=${group.name}>
      ${group.name ? html`<span class="source-group-name">${group.name}</span>` : nothing}
      <span class="group-readings">${group.readings.map(({ type, label, sensor }) => html`
        <span class=${photo ? 'photo-metric' : 'reading'} data-metric=${type} data-reading-entity=${sensor.entity} title=${label}>
          <span class=${photo ? `photo-metric-icon ${type}` : `reading-icon ${type}`} aria-label=${label}>${metricIcon(type)}</span>
          ${type === 'pressure_relative' || type === 'pressure_absolute' ? html`<span class="metric-qualifier">${type === 'pressure_relative' ? 'rel.' : 'abs.'}</span>` : nothing}
          <strong class=${sensor.status === 'available' ? '' : 'reading-status'}>${formatSensorValue(sensor, hass)}</strong>
          ${sensor.status === 'available' && sensor.unit ? photo ? html`<small>${sensor.unit}</small>` : html`<span class="reading-unit">${sensor.unit}</span>` : nothing}
        </span>`)}</span>
    </span>`)}
  </span>`;
}

export const readingStyles = css`
  .sensor-groups, .sensor-group { display: flex; flex-direction: column; min-width: 0; max-width: 100%; }
  .sensor-groups { gap: 7px; }
  .sensor-group { gap: 3px; }
  .source-group-name { font-size: 10px; font-weight: 650; line-height: 1.3; overflow-wrap: anywhere; }
  .metric-qualifier { font-size: 10px; font-weight: 500; }
  .group-readings { display: flex; flex-direction: column; gap: 4px; min-width: 0; max-width: 100%; }
  .group-rows .named-group .group-readings { flex-direction: row; flex-wrap: wrap; gap: 5px 12px; }
  .named-group + .named-group { border-top: 1px solid #ffffff30; padding-top: 6px; }
`;
