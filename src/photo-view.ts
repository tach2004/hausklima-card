import { css, html, nothing } from 'lit';
import { houseArtwork, ROOM_ART_POSITIONS, GARAGE_ART_POSITIONS } from './scene-photo';
import { formatSensorValue, resolveMeasurements, resolveOverviewGroups } from './metrics';
import { metricIcon, roomIcon } from './icons';
import { renderReadingGroups } from './reading-view';
import type { BuildingConfig, HomeAssistant, RoomConfig } from './types';
export interface PhotoViewOptions {
  outdoorId?: string;
  onOutdoorChange?: (id: string) => void;
}

/** Coordinates refer only to the approved, unchanged illustration. */
export function renderPhotoView(
  building: BuildingConfig,
  hass: HomeAssistant | undefined,
  showNames: boolean,
  onSelect: (room: RoomConfig) => void,
  selectedRoomId?: string,
  options: PhotoViewOptions = {},
) {
  const rooms = building.rooms.filter((room) => ROOM_ART_POSITIONS[room.id] && room.visible && room.location !== 'outdoor');
  const devices = building.rooms.filter((room) => GARAGE_ART_POSITIONS[room.id] && room.location !== 'outdoor');
  const outdoors = building.rooms.filter((room) => room.location === 'outdoor' && resolveOverviewGroups(room, hass).length);
  const outdoor = outdoors.find((room) => room.id === options.outdoorId) ?? outdoors[0];
  const mobileClimateReadings = (room: RoomConfig) => resolveMeasurements(room, hass, 'overview')
    .filter((metric) => metric.type === 'temperature' || metric.type === 'relative_humidity')
    .map((metric) => ({ type: metric.type, sensor: metric.primary }));

  // Desktop retains every configured reading and all selected sources. On a
  // narrow picture the same dark panel displays only temperature and RH.
  const renderBadge = (room: RoomConfig, category: string) => {
    const groups = resolveOverviewGroups(room, hass);
    const climate = mobileClimateReadings(room);
    return html`<button class="photo-badge ${category} ${groups.length ? 'with-metrics' : 'name-only'} ${climate.length ? 'mobile-climate' : 'mobile-no-climate'}"
      data-room-id=${room.id} data-select-room=${room.id} type="button"
      aria-pressed=${String(selectedRoomId === room.id)} aria-label=${`${room.name}: Details öffnen`}
      @click=${() => onSelect(room)}>
      ${showNames ? html`<span class="photo-room-name">${roomIcon(room)}<span>${room.name}</span></span>` : nothing}
      ${renderReadingGroups(room, hass, true)}
      ${climate.length ? html`<span class="photo-mobile-climate">
        ${showNames ? html`<span class="photo-mobile-name">${room.name}</span>` : nothing}
        ${climate.map(({ type, sensor }) => html`
          <span class="photo-mobile-reading" data-metric=${type} data-reading-entity=${sensor.entity}>
            <span class="mobile-reading-icon ${type}" aria-hidden="true">${metricIcon(type)}</span>
            <strong>${formatSensorValue(sensor, hass)}</strong>
            ${sensor.status === 'available' && sensor.unit ? html`<small>${sensor.unit}</small>` : nothing}
          </span>`)}
      </span>` : nothing}
    </button>`;
  };
  const placement = (room: RoomConfig, position: { x: number; y: number; anchorX?: number; anchorY?: number }, category: string) => html`
    <div class="photo-placement" data-overlay-id=${room.id}
      data-anchor-x=${position.anchorX ?? position.x} data-anchor-y=${position.anchorY ?? position.y}
      data-preferred-x=${position.x} data-preferred-y=${position.y}
      style=${`left:${position.x}%;top:${position.y}%;`}>
      ${renderBadge(room, category)}
    </div>`;
  return html`<div class="photo-overview"><div class="photo-stage">
    <img class="photo-image" src=${houseArtwork}
      alt="Gestaltete Hausansicht mit Dachgeschoss, Erdgeschoss und Keller sowie freistehender Garage mit Schaltschrank links und zwei Batterien rechts. Die Einrichtung ist illustrativ." />
    <svg class="photo-leaders" aria-hidden="true"></svg>
    ${rooms.map((room) => placement(room, ROOM_ART_POSITIONS[room.id]!, 'photo-room'))}
    ${devices.map((room) => placement(room, GARAGE_ART_POSITIONS[room.id]!, room.id === 'garage'
      ? `photo-air ${resolveOverviewGroups(room, hass).length ? 'photo-garage' : ''}` : 'photo-device'))}
    ${devices.map((room) => {
      const point = GARAGE_ART_POSITIONS[room.id]!;
      return html`<button class="photo-object-target" type="button" data-select-room=${room.id} data-anchor-x=${point.anchorX} data-anchor-y=${point.anchorY}
        style=${`left:${point.anchorX}%;top:${point.anchorY}%;`}
        aria-label=${`${room.name}: Messwerte und Sensorquellen öffnen`} @click=${() => onSelect(room)}><span></span></button>`;
    })}
    ${outdoor ? html`<div class="photo-placement photo-outdoor-group" data-overlay-id=${outdoor.id}
      data-anchor-x="86" data-anchor-y="20" data-preferred-x="86" data-preferred-y="20"
      style="left:86%;top:20%;">
      ${outdoors.length > 1 ? html`<label class="photo-outdoor-choice"><span>Außenmessort im Bild</span>
        <select id="photo-outdoor-select" data-outdoor-selector .value=${outdoor.id} aria-label="Außenmessort im Bild"
          @change=${(event: Event) => options.onOutdoorChange?.((event.target as HTMLSelectElement).value)}>
          ${outdoors.map((room) => html`<option value=${room.id} .selected=${room.id === outdoor.id}>${room.name}</option>`)}
        </select></label>` : nothing}
      ${renderBadge(outdoor, 'photo-outdoor')}
    </div>` : nothing}
    <p class="photo-dock-note" hidden>Verbundene Messwertfelder: Die Linien zeigen den zugehörigen Raum oder das Gerät.</p>
  </div></div>`;
}

export const photoStyles = css`
  .photo-overview { width: 100%; max-width: var(--hk-scene-max-width, 1400px); margin: 0 auto; min-width: 0; }
  .photo-stage { position: relative; width: 100%; isolation: isolate; border-radius: 17px; background: var(--hk-paper, #e6e6e0); box-shadow: 0 8px 30px #1b39401c; line-height: 1.2; }
  .photo-image { display: block; width: 100%; height: auto; aspect-ratio: 1300 / 732; object-fit: contain; border-radius: 17px; pointer-events: none; user-select: none; }
  .photo-placement { position: absolute; transform: translate(-50%, -50%); width: max-content; max-width: 220px; min-width: 0; z-index: 2; }
  .photo-placement:has(.has-named-groups) { max-width: 360px; }
  .photo-badge { width: max-content; max-width: 100%; min-width: 0; min-height: 36px; border-radius: 9px; border: 1px solid #ffffff45;
    background: var(--hk-chip, rgba(22, 26, 30, .72)); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
    box-shadow: 0 3px 12px #0d172554; padding: 7px 9px; text-align: left; color: #fff; cursor: pointer;
    display: flex; flex-direction: column; align-items: stretch; gap: 4px; }
  .photo-badge:hover, .photo-badge:focus-visible { outline: 2px solid #fff; outline-offset: 1px; }
  .photo-room-name { display: flex; align-items: center; gap: 5px; color: #fff; font-size: 12px; font-weight: 700; line-height: 1.3; max-width: 100%; }
  .photo-room-name > span { min-width: 0; overflow-wrap: anywhere; }
  .photo-metric { display: flex; gap: 3px 5px; flex-wrap: wrap; align-items: baseline; min-width: 0; max-width: 100%; color: #fff; font-size: 13px; line-height: 1.35; }
  .photo-metric strong { font-weight: 750; font-size: inherit; color: #fff; min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
  .photo-metric small { color: #eef4f7; font-size: 11px; font-weight: 500; max-width: 100%; overflow-wrap: anywhere; }
  .photo-metric-icon { display: inline-flex; align-self: center; flex-shrink: 0; color: #ffc095; width: 16px; }
  .photo-metric-icon.relative_humidity { color: #8dd6ee; }
  .photo-metric-icon.absolute_humidity { color: #9bdad0; }
  .photo-metric-icon.co2 { color: #b5d998; }
  .photo-metric-icon.voc { color: #d7c0f0; }
  .photo-mobile-climate { display: none; }
  .photo-badge.name-only { padding: 4px; background: transparent; border: 0; box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none; }
  .photo-badge.name-only .photo-room-name { color: #263238; text-shadow: 0 1px 3px #fff, 0 0 8px #fff; }
  .photo-badge.name-only:hover, .photo-badge.name-only:focus-visible { background: #ffffffa6; }
  .photo-device .photo-metric { font-size: 12px; }
  .photo-device .photo-metric small { font-size: 10px; }
  .photo-device .photo-room-name { font-size: 11px; }
  .photo-outdoor { width: 100%; }
  .photo-outdoor-choice { display: grid; gap: 4px; background: var(--hk-chip, rgba(22, 26, 30, .72)); color: #fff; border-radius: 9px 9px 0 0; padding: 7px 9px; font-size: 10px; }
  .photo-outdoor-choice select { min-height: 30px; width: 100%; min-width: 0; color: #fff; color-scheme: dark; background: #263039; border: 1px solid #ffffff60; border-radius: 5px; font: inherit; font-size: 12px; }
  .photo-outdoor-choice + .photo-outdoor { border-top-left-radius: 0; border-top-right-radius: 0; }
  .photo-leaders { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 1; }
  .photo-leaders path { fill: none; stroke: #fff; stroke-width: 1.5; filter: drop-shadow(0 1px 1px #10252f); }
  .photo-leaders circle { fill: #fff; stroke: #263e35; stroke-width: 1.5; }
  .photo-object-target { position: absolute; transform: translate(-50%, -50%); width: 44px; height: 44px; padding: 0; border: 0; background: transparent; border-radius: 50%; z-index: 1; cursor: pointer; }
  .photo-object-target span { display: block; margin: auto; width: 7px; height: 7px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 2px #25362a, 0 1px 8px #0008; }
  .photo-dock-note { position: absolute; margin: 0; font-size: 11px; line-height: 1.5; color: var(--hk-muted, #687b71); }
  .photo-dock-note[hidden] { display: none; }
  @container hausklima (max-width: 1000px) {
    /* Dark, connected dock under the unmodified illustration for overflow badges. */
    .photo-stage { background: #3f4d49; }
    .photo-image { border-radius: 12px; }
    .photo-placement { display: block; z-index: 3; }
    .photo-badge.with-metrics.mobile-climate {
      padding: 4px 6px; min-height: 36px; border: 1px solid #ffffff59;
      border-radius: 8px; box-shadow: 0 2px 10px #0005;
      background: var(--hk-chip, rgba(22, 26, 30, .72));
    }
    .photo-badge .sensor-groups, .photo-badge .photo-room-name, .photo-badge.mobile-no-climate { display: none; }
    /* Also on mobile, multiple outdoor measurement locations stay reachable
       from the same dropdown attached to the in-picture outdoor badge. */
    .photo-outdoor-choice { display: block; padding: 3px 4px; font-size: 10px; }
    .photo-outdoor-choice > span { display: none; }
    .photo-outdoor-choice select {
      width: 100%; min-height: 28px; font-size: 10px;
      background: #263039; color: #fff; border-color: #ffffff60;
    }
    .photo-mobile-climate { display: flex; flex-direction: column; gap: 2px; min-width: 0; max-width: 100%; }
    .photo-mobile-name {
      display: block; color: #fff; font-size: 11px; font-weight: 750;
      line-height: 1.2; overflow-wrap: anywhere;
    }
    .photo-mobile-reading {
      display: flex; align-items: center; justify-content: flex-start;
      gap: 2px 4px; min-width: 0; max-width: 100%; color: #fff;
      font-size: 12px; line-height: 1.2; font-variant-numeric: tabular-nums;
      overflow-wrap: anywhere;
    }
    .photo-mobile-reading strong { font-size: inherit; font-weight: 750; color: #fff; }
    .photo-mobile-reading small { font-size: 10px; font-weight: 500; color: #eef4f7; }
    .mobile-reading-icon { display: inline-flex; align-items: center; flex-shrink: 0; width: 13px; height: 13px; color: #ffc095; }
    .mobile-reading-icon.relative_humidity { color: #8dd6ee; }
    .mobile-reading-icon :is(svg, .hk-icon) { width: 13px; height: 13px; }
    .photo-leaders { display: block; z-index: 2; }
    .photo-leaders path { stroke: #f5f5f4; stroke-width: 1.6; }
    .photo-object-target, .photo-dock-note { display: none; }
    .photo-lower .rooms-section { display: block; padding: 12px 0 16px; }
  }
  @container hausklima (max-width: 440px) {
    .photo-badge.with-metrics.mobile-climate { padding: 3px 4px; min-height: 33px; border-radius: 6px; }
    .photo-mobile-name { font-size: 10px; letter-spacing: -.025em; }
    .photo-mobile-reading { font-size: 11px; gap: 1px 3px; }
    .photo-mobile-reading small { font-size: 9px; }
    .mobile-reading-icon { width: 11px; height: 11px; }
    .mobile-reading-icon :is(svg, .hk-icon) { width: 11px; height: 11px; }
  }
`;
