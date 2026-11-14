import { css, html, nothing } from 'lit';
import { houseArtwork, ROOM_ART_POSITIONS } from './scene-photo';
import { formatSensorValue, resolveMeasurements } from './metrics';
import type { BuildingConfig, HomeAssistant, MetricType, RoomConfig } from './types';

const symbols: Record<MetricType, string> = {
  temperature: '●',
  relative_humidity: '●',
  absolute_humidity: '●',
  co2: '●',
  voc: '●',
};

/**
 * Interactive HTML overlays on a bundled, generic house illustration.
 * Positions are explicit design coordinates, not calculated structural measurements.
 * Never draw unknown room locations at invented positions.
 */
export function renderPhotoView(
  building: BuildingConfig,
  hass: HomeAssistant | undefined,
  showNames: boolean,
  onSelect: (room: RoomConfig) => void,
  selectedRoomId?: string,
) {
  const conciseValue = (raw: string, status: string) => {
    if (status === 'unavailable') return 'Ausfall';
    if (status === 'unknown') return 'Unbekannt';
    if (status === 'missing') return 'Fehlt';
    return raw.length <= 9 ? raw : 'Details';
  };
  const rooms = building.rooms.filter((room) => ROOM_ART_POSITIONS[room.id] && room.visible);
  return html`
    <div class="photo-overview">
      <div class="photo-stage">
        <img class="photo-image" src=${houseArtwork}
          alt="Gestaltete Hausansicht mit Dachgeschoss, Erdgeschoss und Keller sowie einer freistehenden Garage mit Batterie- und Schaltschranktechnik. Die Einrichtung ist illustrativ." />
        ${rooms.map((room) => {
          const position = ROOM_ART_POSITIONS[room.id]!;
          const metrics = resolveMeasurements(room, hass, 'overview').slice(0, 3);
          return html`
            <button class="photo-room ${metrics.length ? 'with-metrics' : 'name-only'}"
              data-room-id=${room.id} data-select-room=${room.id}
              style=${`left: ${position.x}%; top: ${position.y}%;`}
              type="button" aria-pressed=${String(selectedRoomId === room.id)} aria-label=${`${room.name}: Details öffnen`}
              @click=${() => onSelect(room)}>
              ${showNames ? html`<span class="photo-room-name">${room.name}</span>` : nothing}
              ${metrics.map((metric) => html`
                <span class="photo-metric" data-metric=${metric.type}>
                  <span class="photo-metric-icon ${metric.type}" aria-hidden="true">${symbols[metric.type]}</span>
                  <strong>${conciseValue(formatSensorValue(metric.primary, hass), metric.primary.status)}</strong>
                  ${metric.primary.status === 'available' && metric.primary.unit && metric.primary.unit.length <= 5 && formatSensorValue(metric.primary, hass).length <= 9
                    ? html`<small>${metric.primary.unit}</small>` : nothing}
                </span>
              `)}
            </button>
          `;
        })}
      </div>
    </div>
  `;
}

export const photoStyles = css`
  .photo-overview {
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;
    padding: 0;
    min-width: 0;
  }
  .photo-stage {
    position: relative;
    width: 100%;
    isolation: isolate;
    overflow: hidden;
    border-radius: 17px;
    background: #e6e6e0;
    box-shadow: 0 8px 30px #1b39401c;
    line-height: 1.2;
  }
  .photo-image {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 1300 / 732;
    object-fit: contain;
    pointer-events: none;
    user-select: none;
  }
  .photo-room {
    position: absolute;
    transform: translate(-50%, -50%);
    max-width: 14%;
    min-width: 86px;
    border-radius: 10px;
    border: 1px solid #ffffff45;
    background: rgba(22, 26, 30, 0.82);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    box-shadow: 0 3px 12px #0d172554;
    padding: 6px 9px;
    text-align: left;
    color: #fff;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    transition: background-color .15s ease, transform .15s ease;
  }
  .photo-room:hover, .photo-room:focus-visible {
    background: rgba(12, 19, 25, .94);
    transform: translate(-50%, calc(-50% - 3px));
    outline: 2px solid #fff;
    outline-offset: 1px;
  }
  .photo-room-name {
    display: block;
    color: #fff;
    font-size: clamp(9px, 1vw, 12px);
    font-weight: 700;
    line-height: 1.25;
    overflow-wrap: anywhere;
    width: 100%;
  }
  .photo-metric {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    align-items: baseline;
    min-width: 0;
    color: #fff;
    font-size: clamp(10px, 1.06vw, 14px);
    font-weight: 700;
  }
  .photo-metric strong {
    font-weight: 750;
    font-size: inherit;
    color: #fff;
    overflow-wrap: anywhere;
  }
  .photo-metric small {
    color: #eef4f7;
    font-size: .76em;
    font-weight: 500;
  }
  .photo-metric-icon { color: #ffc095; font-size: .7em; }
  .photo-metric-icon.relative_humidity { color: #8dd6ee; }
  .photo-metric-icon.absolute_humidity { color: #9bdad0; }
  .photo-metric-icon.co2 { color: #b5d998; }
  .photo-metric-icon.voc { color: #d7c0f0; }
  .photo-room.name-only {
    min-width: unset;
    max-width: 13%;
    padding: 5px 7px;
    background: rgba(22, 26, 30, .70);
  }
  @container hausklima (max-width: 900px) {
    .photo-room { max-width: 16%; }
    .photo-room-name { font-size: 10px; }
  }
  @container hausklima (max-width: 780px) {
    .photo-stage { border-radius: 12px; }
    .photo-room { display: none; }
    .photo-overview { max-width: 680px; }
  }
`;
