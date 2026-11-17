import { css, html, nothing } from 'lit';
import { houseArtwork, frontHouseArtwork, ROOM_ART_POSITIONS, GARAGE_ART_POSITIONS,
  FRONT_ROOM_ART_POSITIONS, FRONT_GARAGE_ART_POSITIONS } from './scene-photo';
import type { HouseSide } from './front-view';
import { formatSensorValue, resolveMobileReadings, resolveMobileOutdoorGroups, resolveOverviewGroups } from './metrics';
import { metricIcon, roomIcon } from './icons';
import { renderReadingGroups } from './reading-view';
import type { BadgePositionSet, BuildingConfig, HomeAssistant, RoomConfig } from './types';
export interface PhotoViewOptions {
  outdoorId?: string;
  onOutdoorChange?: (id: string) => void;
  badgePositions?: Record<string, BadgePositionSet>;
  side?: HouseSide;
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
  const front = options.side === 'front';
  const roomPositions = front ? FRONT_ROOM_ART_POSITIONS : ROOM_ART_POSITIONS;
  const garagePositions = front ? FRONT_GARAGE_ART_POSITIONS : GARAGE_ART_POSITIONS;
  const rooms = building.rooms.filter((room) => roomPositions[room.id] && room.visible && room.location !== 'outdoor');
  const devices = building.rooms.filter((room) => garagePositions[room.id] && room.location !== 'outdoor');
  const outdoors = building.rooms.filter((room) => room.location === 'outdoor' &&
    (resolveOverviewGroups(room, hass).length || resolveMobileReadings(room, hass).length));
  const outdoor = outdoors.find((room) => room.id === options.outdoorId) ?? outdoors[0];

  // Desktop retains every configured reading and all selected sources. On a
  // narrow picture the same dark panel displays only temperature and RH.
  const renderBadge = (room: RoomConfig, category: string) => {
    const groups = resolveOverviewGroups(room, hass);
    const climate = resolveMobileReadings(room, hass);
    const outdoorGroups = room.location === 'outdoor' ? resolveMobileOutdoorGroups(room, hass) : [];
    const mobileReading = ({ type, sensor, sourceLabel }: (typeof climate)[number], showSource = true) => html`
      <span class="photo-mobile-reading" data-metric=${type} data-reading-entity=${sensor.entity}>
        <span class="mobile-reading-icon ${type}" aria-hidden="true">${metricIcon(type)}</span>
        ${showSource && sourceLabel ? html`<span class="photo-mobile-source" title=${sourceLabel}>${sourceLabel}</span>` : nothing}
        <strong>${formatSensorValue(sensor, hass)}</strong>
        ${sensor.status === 'available' && sensor.unit ? html`<small>${sensor.unit}</small>` : nothing}
      </span>`;
    return html`<button class="photo-badge ${category} ${groups.length ? 'with-metrics' : 'name-only'} ${climate.length ? 'mobile-climate' : 'mobile-no-climate'}"
      data-room-id=${room.id} data-select-room=${room.id} type="button"
      aria-pressed=${String(selectedRoomId === room.id)} aria-label=${`${room.name}: Details öffnen`}
      @click=${() => onSelect(room)}>
      ${showNames ? html`<span class="photo-room-name">${roomIcon(room)}<span>${room.name}</span></span>` : nothing}
      ${renderReadingGroups(room, hass, true)}
      ${climate.length ? html`<span class="photo-mobile-climate">
        ${showNames ? html`<span class="photo-mobile-name">${roomIcon(room)}<span>${room.name}</span></span>` : nothing}
        ${room.location === 'outdoor' ? outdoorGroups.map((group) => html`
          <span class="photo-mobile-source-group" data-mobile-source-group=${group.name}>
            <span class="photo-mobile-source-heading" title=${group.name}>${group.name}</span>
            ${group.readings.map((reading) => mobileReading(reading, false))}
          </span>`) : climate.map((reading) => mobileReading(reading))}
      </span>` : nothing}
    </button>`;
  };
  const positionAttrs = (room: RoomConfig) => options.badgePositions?.[room.id];
  const placement = (room: RoomConfig, position: { x: number; y: number; anchorX?: number; anchorY?: number }, category: string) => html`
    <div class="photo-placement" data-overlay-id=${room.id}
      data-anchor-x=${position.anchorX ?? position.x} data-anchor-y=${position.anchorY ?? position.y}
      data-preferred-x=${position.x} data-preferred-y=${position.y}
      data-manual-desktop-x=${positionAttrs(room)?.desktop?.x ?? nothing}
      data-manual-desktop-y=${positionAttrs(room)?.desktop?.y ?? nothing}
      data-manual-mobile-x=${positionAttrs(room)?.mobile?.x ?? nothing}
      data-manual-mobile-y=${positionAttrs(room)?.mobile?.y ?? nothing}
      style=${`left:${position.x}%;top:${position.y}%;`}>
      ${renderBadge(room, category)}
    </div>`;
  return html`<div class="photo-overview"><div class="photo-stage" data-scene-side=${front ? 'front' : 'rear'}>
    <img class="photo-image" src=${front ? frontHouseArtwork : houseArtwork}
      alt=${front
        ? 'Illustrative Vorderansicht mit Erd- und Dachgeschoss, Bad, Büro, Heizungsraum, Eingang, Balkon und Garage links.'
        : 'Gestaltete Hausansicht mit Dachgeschoss, Erdgeschoss und Keller sowie freistehender Garage mit Schaltschrank links und zwei Batterien rechts. Die Einrichtung ist illustrativ.'} />
    <svg class="photo-leaders" aria-hidden="true"></svg>
    ${rooms.map((room) => placement(room, roomPositions[room.id]!, 'photo-room'))}
    ${devices.map((room) => placement(room, garagePositions[room.id]!, room.id === 'garage'
      ? `photo-air ${resolveOverviewGroups(room, hass).length ? 'photo-garage' : ''}` : 'photo-device'))}
    ${devices.map((room) => {
      const point = garagePositions[room.id]!;
      return html`<button class="photo-object-target" type="button" data-select-room=${room.id} data-anchor-x=${point.anchorX} data-anchor-y=${point.anchorY}
        style=${`left:${point.anchorX}%;top:${point.anchorY}%;`}
        aria-label=${`${room.name}: Messwerte und Sensorquellen öffnen`} @click=${() => onSelect(room)}><span></span></button>`;
    })}
    ${outdoor ? html`<div class="photo-placement photo-outdoor-group" data-overlay-id=${outdoor.id}
      data-anchor-x=${front ? 12 : 86} data-anchor-y="20" data-preferred-x=${front ? 12 : 86} data-preferred-y="20"
      data-manual-desktop-x=${positionAttrs(outdoor)?.desktop?.x ?? nothing}
      data-manual-desktop-y=${positionAttrs(outdoor)?.desktop?.y ?? nothing}
      data-manual-mobile-x=${positionAttrs(outdoor)?.mobile?.x ?? nothing}
      data-manual-mobile-y=${positionAttrs(outdoor)?.mobile?.y ?? nothing}
      style=${`left:${front ? 12 : 86}%;top:20%;`}>
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
  .photo-room-name { display: flex; align-items: center; gap: 5px; color: #fff; font-size: var(--hk-badge-font-desktop, 12px); font-weight: 700; line-height: 1.3; max-width: 100%; }
  .photo-room-name > span { min-width: 0; overflow-wrap: anywhere; }
  .photo-metric { display: flex; gap: 3px 5px; flex-wrap: wrap; align-items: baseline; min-width: 0; max-width: 100%; color: #fff; font-size: calc(var(--hk-badge-font-desktop, 12px) * 1.0833); line-height: 1.35; }
  .photo-metric strong { font-weight: 750; font-size: inherit; color: #fff; min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
  .photo-metric small { color: #eef4f7; font-size: calc(var(--hk-badge-font-desktop, 12px) * .9167); font-weight: 500; max-width: 100%; overflow-wrap: anywhere; }
  .photo-metric-icon { display: inline-flex; align-self: center; flex-shrink: 0; color: #ffc095; width: 16px; }
  .photo-metric-icon.relative_humidity { color: #8dd6ee; }
  .photo-metric-icon.absolute_humidity { color: #9bdad0; }
  .photo-metric-icon.co2 { color: #b5d998; }
  .photo-metric-icon.voc { color: #d7c0f0; }
  .photo-metric-icon.condensation_risk { color: #f2b0a3; }
  .photo-mobile-climate { display: none; }
  .photo-badge.name-only { padding: 4px; background: transparent; border: 0; box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none; }
  .photo-badge.name-only .photo-room-name { color: #263238; text-shadow: 0 1px 3px #fff, 0 0 8px #fff; }
  .photo-badge.name-only:hover, .photo-badge.name-only:focus-visible { background: #ffffffa6; }
  .photo-device .photo-metric { font-size: var(--hk-badge-font-desktop, 12px); }
  .photo-device .photo-metric small { font-size: calc(var(--hk-badge-font-desktop, 12px) * .833); }
  .photo-device .photo-room-name { font-size: calc(var(--hk-badge-font-desktop, 12px) * .917); }
  .photo-outdoor { width: 100%; }
  /* Outdoor readings are one per line on desktop too. This avoids an overly
     wide max-content flex row and matches the vertically grouped phone badge. */
  .photo-outdoor .group-rows .named-group .group-readings {
    flex-direction: column; flex-wrap: nowrap; gap: 4px;
  }
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
    /* No dark extra dock under the photo: all overlays use their own coordinates. */
    .photo-stage { background: var(--hk-paper, #e6e6e0); }
    .photo-image { border-radius: 12px; }
    .photo-placement { display: block; z-index: 3; }
    .photo-badge.mobile-climate {
      padding: 2px 4px; min-height: 29px; gap: 1px; border: 1px solid #ffffff59;
      border-radius: 8px; box-shadow: 0 2px 10px #0005;
      background: var(--hk-chip, rgba(22, 26, 30, .72));
    }
    .photo-badge .sensor-groups, .photo-badge .photo-room-name, .photo-badge.mobile-no-climate { display: none; }
    /* Three devices remain identifiable even before a temperature/RH sensor
       is assigned: show a lightweight label, never an empty dark box. */
    .photo-device .photo-badge.mobile-no-climate {
      display: flex; min-height: 19px; padding: 2px; border: 0;
      background: transparent; box-shadow: none; backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    .photo-device .photo-badge.mobile-no-climate .photo-room-name {
      display: flex; align-items: center; gap: 2px;
      font-size: var(--hk-badge-font-mobile, 9px); color: #243137;
      text-shadow: 0 1px 2px #fff, 0 0 4px #fff;
    }
    /* Also on mobile, multiple outdoor measurement locations stay reachable
       from the same dropdown attached to the in-picture outdoor badge. */
    .photo-outdoor-choice { display: block; padding: 3px 4px; font-size: 10px; }
    .photo-outdoor-choice > span { display: none; }
    .photo-outdoor-choice select {
      width: 100%; min-height: 28px; font-size: 10px;
      background: #263039; color: #fff; border-color: #ffffff60;
    }
    /* Outdoor phone badges: one source heading, then temperature, humidity and
       optional measurements on their own lines. Other badges stay unchanged. */
    .photo-outdoor-group .photo-mobile-climate { gap: 4px; }
    .photo-mobile-source-group { display: flex; flex-direction: column; gap: 2px; min-width: 0; max-width: 100%; }
    .photo-mobile-source-group + .photo-mobile-source-group { border-top: 1px solid #ffffff55; padding-top: 5px; }
    .photo-mobile-source-heading {
      display: block; max-width: 100%; overflow-wrap: anywhere;
      color: #fff; font-size: calc(var(--hk-badge-font-mobile, 9px) * .95);
      font-weight: 750; line-height: 1.2;
    }
    .photo-outdoor-group .photo-mobile-reading { width: 100%; flex-wrap: nowrap; }
    .photo-outdoor-group .photo-mobile-reading :is(strong, small) { flex: 0 0 auto; white-space: nowrap; }
    .photo-mobile-climate { display: flex; flex-direction: column; gap: 0; min-width: 0; max-width: 100%; }
    .photo-mobile-name {
      display: flex; gap: 2px; align-items: center; color: #fff; font-size: calc(var(--hk-badge-font-mobile, 9px) * .9); font-weight: 750;
      line-height: 1.2; overflow-wrap: anywhere;
    }
    .photo-mobile-name > .room-icon { width: 1em; height: 1em; flex-shrink: 0; }
    .photo-mobile-name > span { min-width: 0; overflow-wrap: anywhere; }
    .photo-mobile-reading {
      display: flex; align-items: center; justify-content: flex-start;
      gap: 2px 4px; min-width: 0; max-width: 100%; color: #fff;
      font-size: var(--hk-badge-font-mobile, 9px); line-height: 1.08; font-variant-numeric: tabular-nums;
      overflow-wrap: anywhere;
    }
    .photo-mobile-source { font-size: .9em; font-weight: 600; color: #e4eef4; max-width: 13ch;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 0 1 auto; }
    .photo-mobile-reading strong { font-size: inherit; font-weight: 750; color: #fff; }
    .photo-mobile-reading small { font-size: .85em; font-weight: 500; color: #eef4f7; }
    .mobile-reading-icon { display: inline-flex; align-items: center; flex-shrink: 0; width: 1em; height: 1em; color: #ffc095; }
    .mobile-reading-icon.relative_humidity { color: #8dd6ee; }
    .mobile-reading-icon.absolute_humidity { color: #9bdad0; }
    .mobile-reading-icon.co2 { color: #b5d998; }
    .mobile-reading-icon.voc { color: #d7c0f0; }
    .mobile-reading-icon.condensation_risk { color: #f2b0a3; }
    .mobile-reading-icon.pressure_relative, .mobile-reading-icon.pressure_absolute { color: #b6c9f0; }
    .mobile-reading-icon :is(svg, .hk-icon) { width: 1em; height: 1em; }
    /* Same three garage-object connectors as desktop. The layout engine moves
       their ends with the corresponding badge (including manually saved positions). */
    .photo-leaders { display: block; z-index: 2; }
    .photo-leaders path { stroke: #f5f8f8; stroke-width: 1.25; filter: drop-shadow(0 1px 1px #09181b); }
    .photo-leaders circle { fill: #fff; stroke: #263e35; stroke-width: 1.25; }
    .photo-object-target { display: block; }
    .photo-object-target span, .photo-dock-note { display: none; }
    .photo-lower .rooms-section { display: block; padding: 12px 0 16px; }
  }
  @container hausklima (max-width: 440px) {
    .photo-badge.mobile-climate { padding: 2px 3px; min-height: 27px; border-radius: 6px; }
    .photo-mobile-name { letter-spacing: -.025em; }
    .photo-mobile-reading { gap: 1px 3px; }
    .photo-mobile-reading small { font-size: .85em; }
    .mobile-reading-icon { width: 1em; height: 1em; }
    .mobile-reading-icon :is(svg, .hk-icon) { width: 1em; height: 1em; }
  }
`;
