import { LitElement, html, nothing, svg } from 'lit';
import { getDefaultConfig, normalizeConfig, resolveBuilding } from './config';
import { renderHouseScene, sceneStyles } from './house-scene';
import { createLayout } from './layout';
import type { RoomShape } from './layout';
import { formatSensorValue, resolveMeasurements, sensorStatusLabel } from './metrics';
import type { BuildingConfig, HausKlimaCardConfig, HomeAssistant, MetricType, ResolvedMeasurement, ResolvedSensor, RoomConfig } from './types';
import { cardStyles } from './styles';

const metricSymbols: Record<MetricType, string> = {
  temperature: 'T', relative_humidity: '%', absolute_humidity: 'AH', co2: 'CO₂', voc: 'VOC',
};
const formatDimension = (value: number) => value.toLocaleString('de-DE', { maximumFractionDigits: 2 });
const arrowIcon = () => html`<svg class="arrow-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M 4 12 12 4 M 4 4 h 8 v 8" /></svg>`;
let cardSequence = 0;

export class HausKlimaCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _selected: { state: true },
    _showRooms: { state: true },
  };
  declare hass?: HomeAssistant;
  private _config?: HausKlimaCardConfig;
  private _selected?: string;
  private _showRooms = false;
  private readonly drawingId = `hausklima-${++cardSequence}`;

  setConfig(config: unknown): void {
    this._config = normalizeConfig(config);
    if (!resolveBuilding(this._config).rooms.some((room) => room.id === this._selected)) this._selected = undefined;
  }

  static async getConfigElement(): Promise<HTMLElement> {
    await import('./hausklima-card-editor');
    return document.createElement('hausklima-card-editor');
  }

  static getStubConfig(): Omit<HausKlimaCardConfig, 'type'> {
    const { type: _type, ...config } = getDefaultConfig();
    return config;
  }

  getCardSize(): number { return Math.ceil((this.clientHeight || 680) / 50); }
  getGridOptions() { return { columns: 12, rows: 'auto', min_columns: 6 }; }

  private selectRoom(room: RoomConfig): void {
    this._selected = room.id;
    void this.updateComplete.then(() => {
      const detail = this.renderRoot.querySelector<HTMLElement>('.room-detail');
      detail?.focus({ preventScroll: true });
      if (detail) {
        const bounds = detail.getBoundingClientRect();
        if (bounds.top < 0 || bounds.top > window.innerHeight - 80) {
          detail.scrollIntoView({ block: 'start', behavior: 'auto' });
        }
      }
    });
  }

  private sensorText(sensor: ResolvedSensor): string {
    const value = formatSensorValue(sensor, this.hass);
    return `${value}${sensor.status === 'available' && sensor.unit ? ` ${sensor.unit}` : ''}`;
  }

  private showEntity(entity: string): void {
    this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: entity }, bubbles: true, composed: true }));
  }

  private renderSvgMetrics(shape: RoomShape) {
    const measurements = resolveMeasurements(shape.room, this.hass, 'overview');
    if (!measurements.length) return nothing;
    if (shape.width < 130 || shape.height < 75) {
      return svg`<g class="compact-sensor-marker" aria-hidden="true">
        <circle cx=${shape.x + shape.width / 2} cy=${shape.y + shape.height - 17} r="5" />
        <title>${measurements.map((metric) => `${metric.label}: ${this.sensorText(metric.primary)}`).join(', ')}</title>
      </g>`;
    }
    const width = Math.min(shape.width - 20, 150);
    const rows = Math.max(1, Math.min(3, Math.floor((shape.height - 51) / 20)));
    const shown = measurements.slice(0, rows);
    const remainder = measurements.length - shown.length;
    const height = 16 + shown.length * 21 + (remainder ? 16 : 0);
    const x = shape.x + (shape.width - width) / 2;
    const y = shape.y + 33;
    return svg`<g class="metric-panel" data-overview-chip data-room-id=${shape.room.id} aria-hidden="true">
      <rect class="metric-panel-bg" x=${x} y=${y} width=${width} height=${height} rx="9" />
      ${shown.map((metric, index) => {
        const value = formatSensorValue(metric.primary, this.hass);
        const unit = metric.primary.status === 'available' ? metric.primary.unit : '';
        const estimatedWidth = value.length * (metric.primary.status === 'available' ? 8.5 : 5) + unit.length * 5;
        const fits = estimatedWidth <= width - 42;
        return svg`
          <text class="chip-symbol ${metric.type}" x=${x + 11} y=${y + 23 + index * 21}>${metricSymbols[metric.type]}</text>
          <text class="chip-value ${!fits || metric.primary.status !== 'available' ? 'chip-status' : ''}" x=${x + 32} y=${y + 23 + index * 21}>
            ${fits ? value : metric.primary.status === 'unavailable' ? 'Ausfall' : 'Details'}<tspan class="chip-unit">${fits && unit ? ` ${unit}` : ''}</tspan>
          </text>
        `;
      })}
      ${remainder ? svg`<text class="chip-more" x=${x + 12} y=${y + height - 9}>+${remainder} Details</text>` : nothing}
      <title>${measurements.map((metric) => `${metric.label}: ${this.sensorText(metric.primary)}`).join(', ')}</title>
    </g>`;
  }

  private renderReadings(room: RoomConfig, compact = false) {
    const measurements = resolveMeasurements(room, this.hass, 'overview');
    if (!measurements.length) return html`<span class="empty-reading">${resolveMeasurements(room, this.hass, 'details').length ? 'Messwerte in den Details' : 'Keine Sensoren zugeordnet'}</span>`;
    return html`<span class=${compact ? 'room-readings compact' : 'room-readings'}>
      ${measurements.map((metric) => html`<span class="reading" data-metric=${metric.type} title=${metric.label}>
        <span class="reading-icon ${metric.type}" aria-label=${metric.label}>${metricSymbols[metric.type]}</span>
        <strong class=${metric.primary.status === 'available' ? '' : 'reading-status'}>${formatSensorValue(metric.primary, this.hass)}</strong>
        ${metric.primary.status === 'available' && metric.primary.unit ? html`<span class="reading-unit">${metric.primary.unit}</span>` : nothing}
      </span>`)}
    </span>`;
  }

  private renderRoomTile(room: RoomConfig, building: BuildingConfig, number?: number) {
    const level = building.levels.find((entry) => entry.id === room.level_id);
    return html`<button class="room-tile" data-select-room=${room.id} aria-pressed=${String(this._selected === room.id)} @click=${() => this.selectRoom(room)}>
      <span class="tile-heading">${number !== undefined ? html`<span class="room-number">${String(number).padStart(2, '0')}</span>` : nothing}
        <span>${room.name}</span><span class="tile-arrow" aria-hidden="true">${arrowIcon()}</span></span>
      ${this.renderReadings(room)}
      <span class="tile-level">${room.location === 'outdoor' ? 'Außenmessort' : level?.name}</span>
    </button>`;
  }

  private renderDetails(room: RoomConfig, building: BuildingConfig) {
    const measurements = resolveMeasurements(room, this.hass, 'details');
    const level = building.levels.find((entry) => entry.id === room.level_id);
    return html`<section class="room-detail" data-room-id=${room.id} tabindex="-1" aria-label="Raumdetails">
      <div class="detail-header"><div><span class="section-kicker">${room.location === 'outdoor' ? 'Außenmessort' : level?.name}</span>
        <h2>${room.name}</h2></div><button class="close-detail" aria-label="Raumdetails schließen" @click=${() => { this._selected = undefined; }}>×</button></div>
      ${measurements.length ? html`<div class="metric-list">${measurements.map((metric) => this.renderDetailMetric(metric))}</div>`
        : html`<p class="detail-empty">Noch keine Sensoren zugeordnet. Im grafischen Karteneditor kannst du für diesen Messort Sensoren auswählen.</p>`}
      ${this._config?.show_dimensions && room.width_m !== null ? html`<p class="room-dimension">Angegebene Raumbreite: ${formatDimension(room.width_m)} m</p>` : nothing}
    </section>`;
  }

  private renderDetailMetric(metric: ResolvedMeasurement) {
    return html`<section class="metric-group" data-metric=${metric.type} aria-label=${metric.label}>
      <div class="metric-heading"><h3><span class="reading-icon ${metric.type}" aria-hidden="true">${metricSymbols[metric.type]}</span>${metric.label}</h3>
        ${!metric.visible || !metric.show_in_overview ? html`<span class="hidden-label">Nur in Details</span>` : nothing}</div>
      ${metric.sensors.map((sensor) => html`<button class="sensor-row ${sensor.is_primary ? 'primary-sensor' : ''}" data-entity=${sensor.entity} @click=${() => this.showEntity(sensor.entity)}>
        <span class="source-name">${sensor.name}<small>${sensor.entity}</small><span class="sensor-meta">${sensor.is_primary ? 'Hauptsensor' : 'Weitere Quelle'} · ${sensorStatusLabel(sensor.status)}</span></span>
        <span class="source-value ${sensor.status !== 'available' ? 'unavailable' : ''}"><strong>${formatSensorValue(sensor, this.hass)}</strong>
          ${sensor.status === 'available' && sensor.unit ? html`<span>${sensor.unit}</span>` : nothing}<span class="entity-arrow" aria-hidden="true">${arrowIcon()}</span></span>
      </button>`)}
    </section>`;
  }

  private renderGarage(room: RoomConfig) {
    return html`<section class="garage-block location-block" aria-label=${room.name}>
      <button class="location-heading" data-select-room=${room.id} @click=${() => this.selectRoom(room)}><span><span class="location-icon" aria-hidden="true">▤</span>${room.name}</span><span aria-hidden="true">${arrowIcon()}</span></button>
      <button class="garage-picture" aria-label=${`${room.name} – Raumdetails öffnen`} @click=${() => this.selectRoom(room)}>
        <svg class="garage-graphic" viewBox="0 0 320 196" role="img" aria-label="Freistehende Garage, schematische Darstellung">
          <defs><linearGradient id="${this.drawingId}-garage-wall" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e0d3bd"/><stop offset="1" stop-color="#bbaa91"/></linearGradient>
          <linearGradient id="${this.drawingId}-garage-door" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#69716d"/><stop offset="1" stop-color="#3c4942"/></linearGradient></defs>
          <ellipse cx="163" cy="173" rx="134" ry="13" fill="#1e302219"/>
          <path d="M 43 55 L 66 37 H 284 V 151 L 263 173 Z" fill="#b1a48e"/>
          <rect x="42" y="56" width="222" height="116" fill="url(#${this.drawingId}-garage-wall)" stroke="#8a826f" stroke-width="1"/>
          <path d="M 35 55 L 60 36 H 291 L 270 55 Z" fill="#59605a" stroke="#424c46" stroke-width="3"/>
          <rect x="64" y="77" width="177" height="93" rx="3" fill="url(#${this.drawingId}-garage-door)" stroke="#424a44" stroke-width="4"/>
          <path d="M 67 99 H 238 M 67 121 H 238 M 67 144 H 238" stroke="#a8b1a366" stroke-width="2"/>
          <path d="M 22 175 H 294" stroke="#83a170" stroke-width="4"/>
        </svg>
        <span class="garage-readings">${this.renderReadings(room, true)}</span>
      </button>
      <p class="location-caption">Freistehend rechts vom Wohnhaus</p>
    </section>`;
  }

  private renderOutdoor(room: RoomConfig) {
    const measurements = resolveMeasurements(room, this.hass, 'overview');
    return html`<section class="outdoor-block location-block" aria-label=${room.name}>
      <button class="location-heading" data-select-room=${room.id} @click=${() => this.selectRoom(room)}><span><span class="location-icon outdoor-icon" aria-hidden="true">☀</span>${room.name}</span><span aria-hidden="true">${arrowIcon()}</span></button>
      ${measurements.length ? html`<div class="outdoor-sources">${measurements.map((metric) => html`<div class="outdoor-metric"><h3>${metric.label}</h3>
        ${metric.sensors.map((sensor) => html`<button class="outdoor-source" @click=${() => this.selectRoom(room)}><span>${sensor.name}<small>${sensor.is_primary ? 'Hauptsensor' : 'Weitere Quelle'}</small></span>
          <strong class=${sensor.status !== 'available' ? 'unavailable' : ''}>${this.sensorText(sensor)}</strong></button>`)}</div>`)}</div>`
        : html`<button class="outdoor-empty" @click=${() => this.selectRoom(room)}>${resolveMeasurements(room, this.hass, 'details').length ? 'Alle Messwerte in den Details öffnen' : 'Noch keine Sensoren zugeordnet'}</button>`}
    </section>`;
  }

  private renderBuildingDetails(building: BuildingConfig) {
    return html`<details class="building-details"><summary>Gebäudedetails</summary>
      <p>Traufansicht · Haus ${formatDimension(building.house.width_m)} × ${formatDimension(building.house.depth_m)} m. First parallel zur sichtbaren Seite.</p>
      <p>Garage ${formatDimension(building.garage.width_m)} × ${formatDimension(building.garage.depth_m)} m, Höhe ${formatDimension(building.garage.height_m)} m. Abstand ${building.garage.gap_is_approximate ? 'ca. ' : ''}${formatDimension(building.garage.gap_m)} m.</p>
      <p>Wandzuordnung, Restbreiten und endgültige Dachgeometrie sind offen. Die Tiefenwirkung und die Einrichtung sind illustrative Gestaltung, keine bestätigten Gebäudedetails.</p>
      <ul>${building.notes.map((note) => html`<li>${note}</li>`)}</ul>
    </details>`;
  }

  protected render() {
    if (!this._config) return nothing;
    const config = this._config;
    const building = resolveBuilding(config);
    const layout = createLayout(building);
    const shapes = layout.shapes.filter((shape) => shape.level !== 'garage' && shape.room.location !== 'outdoor');
    const drawnIds = new Set(shapes.map((shape) => shape.room.id));
    const outdoor = building.rooms.filter((room) => room.location === 'outdoor');
    const garages = building.rooms.filter((room) => room.location !== 'outdoor' && building.levels.find((level) => level.id === room.level_id)?.building_id === 'garage');
    const garageIds = new Set(garages.map((room) => room.id));
    const others = building.rooms.filter((room) => !drawnIds.has(room.id) && !garageIds.has(room.id) && room.location !== 'outdoor');
    const selected = building.rooms.find((room) => room.id === this._selected);
    return html`<ha-card>
      <header class="card-header"><div class="card-title"><span class="home-icon" aria-hidden="true">⌂</span>${config.title ? html`<h1>${config.title}</h1>` : nothing}</div>
        <button class="overview-toggle" aria-expanded=${String(this._showRooms)} @click=${() => { this._showRooms = !this._showRooms; }}>Räume <span>${building.rooms.length}</span></button></header>
      <div class="main-grid">
        <div class="house-column">
          <div class="house-drawing" aria-label="Hausansicht">${renderHouseScene(building, {
            idPrefix: this.drawingId, selected: this._selected, showNames: config.show_room_names ?? true,
            showDimensions: false, onSelect: (room) => this.selectRoom(room), renderMetrics: (shape) => this.renderSvgMetrics(shape),
          })}</div>
          ${selected ? this.renderDetails(selected, building) : nothing}
          <section class="rooms-section ${this._showRooms ? 'expanded' : ''}" aria-label="Raumübersicht">
            <div class="section-title"><h2>Räume</h2><span>Antippen für alle Quellen</span></div>
            <div class="room-list house-room-list">${shapes.map((shape, index) => this.renderRoomTile(shape.room, building, index + 1))}</div>
          </section>
        </div>
        ${outdoor.length || garages.length ? html`<aside class="location-column" aria-label="Außen und Garage">${outdoor.map((room) => this.renderOutdoor(room))}${garages.map((room) => this.renderGarage(room))}</aside>` : nothing}
      </div>
      ${others.length ? html`<section class="other-rooms" aria-label="Weitere Räume"><div class="section-title"><h2>Weitere Räume</h2><span>Alle Messorte, auch außerhalb der Hausansicht</span></div>
        <div class="room-list">${others.map((room) => this.renderRoomTile(room, building))}</div></section>` : nothing}
      ${config.show_dimensions ? this.renderBuildingDetails(building) : nothing}
    </ha-card>`;
  }

  static styles = [sceneStyles, cardStyles];
}

if (!customElements.get('hausklima-card')) customElements.define('hausklima-card', HausKlimaCard);
