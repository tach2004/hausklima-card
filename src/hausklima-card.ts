import { LitElement, html, nothing, svg } from 'lit';
import { getDefaultConfig, normalizeConfig, resolveBuilding } from './config';
import { createLayout, DRAWING_SCALE } from './layout';
import type { RoomShape } from './layout';
import { resolveMeasurements } from './metrics';
import type { HausKlimaCardConfig, HomeAssistant, ResolvedSensor, RoomConfig } from './types';
import { cardStyles } from './styles';

const format = (value: number) => value.toLocaleString('de-DE', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
let cardSequence = 0;

export class HausKlimaCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _selected: { state: true },
  };
  declare hass?: HomeAssistant;
  private _config?: HausKlimaCardConfig;
  private _selected?: string;
  private readonly patternId = `hausklima-open-${++cardSequence}`;

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

  getCardSize(): number {
    if (!this._config) return 8;
    const layout = createLayout(resolveBuilding(this._config));
    const drawingWidth = Math.max(670, this.clientWidth - 28);
    return Math.ceil((layout.height / layout.width * drawingWidth + 240) / 50);
  }
  getGridOptions() { return { columns: 12, rows: 'auto', min_columns: 6 }; }

  private selectRoom(room: RoomConfig): void {
    this._selected = this._selected === room.id ? undefined : room.id;
  }

  private sensorText(sensor: ResolvedSensor): string {
    if (sensor.status === 'missing') return 'Entität fehlt';
    if (sensor.status === 'unknown') return 'Unbekannt';
    if (sensor.status === 'unavailable') return 'Nicht verfügbar';
    return `${sensor.value}${sensor.unit ? ` ${sensor.unit}` : ''}`;
  }

  private renderRoom(shape: RoomShape) {
    const { room, x, y, width, height, level } = shape;
    const narrow = width < 70;
    const measurements = resolveMeasurements(room, this.hass);
    const selected = this._selected === room.id;
    const cx = x + width / 2;
    const cy = y + height / 2;
    return svg`
      <g class="room ${level} ${selected ? 'selected' : ''}" data-room-id=${room.id}
        role="button" tabindex="0" aria-label=${room.name} aria-pressed=${String(selected)}
        @click=${() => this.selectRoom(room)}
        @keydown=${(event: KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.selectRoom(room); }
        }}>
        <title>${room.name}${room.width_m !== null ? ` · ${format(room.width_m)} m` : ''}</title>
        <rect class="room-fill" x=${x} y=${y} width=${width} height=${height} />
        ${this._config?.show_room_names ? svg`
          <text class="room-name" text-anchor="middle" x=${cx} y=${cy - (narrow ? 0 : 4)}
            transform=${narrow ? `rotate(-90 ${cx} ${cy})` : ''}>${room.name}</text>
        ` : nothing}
        ${this._config?.show_dimensions && !narrow ? svg`
          <text class="room-width" text-anchor="middle" x=${cx} y=${cy + 18}>${format(room.width_m!)} m</text>
        ` : nothing}
        ${measurements.length ? svg`
          <g class="sensor-marker" transform="translate(${x + width - 13}, ${y + 12})">
            <circle r="4" class=${measurements.some((value) => value.primary.status !== 'available') ? 'sensor-unavailable' : 'sensor-available'} />
            <title>${measurements.map((value) => `${value.label}: ${this.sensorText(value.primary)}`).join(', ')}</title>
          </g>
        ` : nothing}
      </g>
    `;
  }

  private renderMeasurementSummary(room: RoomConfig) {
    const measurements = resolveMeasurements(room, this.hass);
    if (!measurements.length) return nothing;
    return html`<span class="room-values">${measurements.map((measurement) => html`
      <span class=${measurement.primary.status === 'available' ? 'reading' : 'reading unavailable'}
        title=${measurement.label}>${this.sensorText(measurement.primary)}</span>
    `)}</span>`;
  }

  protected render() {
    if (!this._config) return nothing;
    const config = this._config;
    const building = resolveBuilding(config);
    const layout = createLayout(building);
    const selected = building.rooms.find((room) => room.id === this._selected);
    const metrics = selected ? resolveMeasurements(selected, this.hass) : [];
    const configuredRooms = building.rooms.filter((room) => resolveMeasurements(room, this.hass).length);
    const gapText = `${building.garage.gap_is_approximate ? 'ca. ' : ''}${format(building.garage.gap_m)} m Abstand`;
    return html`
      <ha-card>
        <header>
          <div><div class="eyebrow"><span class="brand-mark" aria-hidden="true">⌂</span> HAUSKLIMA</div>
            ${config.title ? html`<h1>${config.title}</h1>` : nothing}
            <p class="subtitle">Das Zuhause auf einen Blick</p>
          </div>
          <span class="view-badge"><span aria-hidden="true"></span> Gebäudeübersicht</span>
        </header>
        <div class="building-meta">
          <span>${building.rooms.length} Räume</span><span class="dot" aria-hidden="true">·</span>
          <span>Traufansicht mit Dachausschnitt</span>
        </div>
        <div class="drawing-scroll" tabindex="0" role="region" aria-label="Gebäudeansicht; auf schmalen Bildschirmen horizontal scrollbar">
          <svg class="building" viewBox="0 ${layout.minY} ${layout.width} ${layout.height}" xmlns="http://www.w3.org/2000/svg"
            aria-label="Schematische Traufansicht: Keller, Erdgeschoss, geöffnetes Dachgeschoss und freistehende Garage">
            <defs>
              <pattern id=${this.patternId} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                <line x1="0" y1="0" x2="0" y2="7" class="hatch-line" />
              </pattern>
            </defs>
            <text class="building-caption" x=${layout.x} y="27">WOHNHAUS</text>
            <text class="building-caption" x=${layout.garageX} y=${layout.groundY - layout.garageHeight - 30}>GARAGE</text>
            <!-- Symbolic receding far roof: the ridge and eave remain parallel. -->
            <path class="roof-plane" d="M ${layout.x} ${layout.roofTop} h ${layout.houseWidth} l 28 26 h -${layout.houseWidth} Z" />
            ${layout.bands.map((band) => svg`
              <rect class="floor-outline" x=${band.x} y=${band.y} width=${band.width} height=${band.height} />
              ${band.remaining > 0.001 ? svg`<rect class="unresolved-band" data-unresolved-level=${band.id}
                x=${band.x + band.filled} y=${band.y} width=${band.remaining} height=${band.height}
                fill="url(#${this.patternId})"><title>Nicht zugeordnete Breite: ${format(band.remaining / DRAWING_SCALE)} m. Wandzuordnung offen.</title></rect>` : nothing}
              ${band.name ? svg`<text class="level-label" x=${layout.x - 21} y=${band.y + band.height / 2 + 4} text-anchor="end">${band.name}</text>` : nothing}
            `)}
            ${layout.shapes.map((shape) => this.renderRoom(shape))}
            <path class="ridge" d="M ${layout.x} ${layout.roofTop} h ${layout.houseWidth}" />
            <path class="cutaway-line" d="M ${layout.x} ${layout.groundTop - building.roof.knee_wall_height_m * DRAWING_SCALE} h ${layout.houseWidth}" />
            <text class="cutaway-caption" x=${layout.x + 12} y=${layout.roofTop + 23}>DACHFLÄCHE GEÖFFNET</text>
            ${config.show_dimensions ? svg`
              <text class="dimension-label" text-anchor="end" x=${layout.x + layout.houseWidth} y=${layout.roofTop - 14}>First innen ${format(building.roof.interior_ridge_height_m)} m</text>
              <text class="dimension-label" x=${layout.x + 12} y=${layout.groundTop - building.roof.knee_wall_height_m * DRAWING_SCALE - 8}>Kniestock ${format(building.roof.knee_wall_height_m)} m</text>
              <path class="dimension-line" d="M ${layout.x} ${layout.basementBottom + 26} v 10 m 0 -5 h ${layout.houseWidth} m 0 -5 v 10" />
              <text class="dimension-label" text-anchor="middle" x=${layout.x + layout.houseWidth / 2} y=${layout.basementBottom + 57}>${format(building.house.width_m)} m Traufseite</text>
              <path class="gap-line" d="M ${layout.x + layout.houseWidth + 14} ${layout.groundY + 30} h ${building.garage.gap_m * DRAWING_SCALE - 28}" />
              <text class="dimension-label" text-anchor="middle" x=${(layout.x + layout.houseWidth + layout.garageX) / 2} y=${layout.groundY + 53}>${gapText}</text>
              <text class="dimension-label" text-anchor="middle" x=${layout.garageX + layout.garageWidth / 2} y=${layout.groundY + 30}>${format(building.garage.width_m)} × ${format(building.garage.depth_m)} m · H ${format(building.garage.height_m)} m</text>
            ` : nothing}
            <path class="ground-line" d="M ${layout.x - 18} ${layout.groundY} h ${layout.width - layout.x - 20}" />
          </svg>
        </div>
        <div class="drawing-note"><span class="hatch-key" aria-hidden="true"></span>
          <span>Schraffur: Breite noch nicht zugeordnet · Wand- und Dachdetails offen</span>
        </div>
        ${configuredRooms.length ? html`<div class="climate-summary" aria-label="Konfigurierte Messorte">
          ${configuredRooms.map((room) => html`<button class="summary-room" @click=${() => this.selectRoom(room)}>
            <span>${room.name}</span>${this.renderMeasurementSummary(room)}
          </button>`)}
        </div>` : nothing}
        ${layout.otherRooms.length ? html`<section class="other-rooms" aria-label="Weitere Räume">
          <h2>Weitere Räume</h2><div class="room-list">
          ${layout.otherRooms.map((room) => html`<button @click=${() => this.selectRoom(room)} aria-pressed=${String(room.id === this._selected)}>${room.name}</button>`)}
          </div>
        </section>` : nothing}
        ${selected ? html`<section class="room-detail" aria-label="Raumdetails" aria-live="polite">
          <div class="detail-header"><div><span class="eyebrow">${building.levels.find((level) => level.id === selected.level_id)?.name}</span>
          <h2>${selected.name}</h2></div><button class="close-detail" @click=${() => { this._selected = undefined; }} aria-label="Raumdetails schließen">×</button></div>
          ${metrics.length ? html`<div class="metric-list">${metrics.map((metric) => html`
            <div class="metric-group"><h3>${metric.label}</h3>${metric.sensors.map((sensor) => html`
              <button class="sensor-row" @click=${() => this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: sensor.entity }, bubbles: true, composed: true }))}>
                <span>${sensor.name}${sensor.is_primary ? html`<small>Hauptsensor</small>` : nothing}</span>
                <strong class=${sensor.status !== 'available' ? 'unavailable' : ''}>${this.sensorText(sensor)}</strong>
              </button>`)}
            </div>`)}
          </div>` : html`<p>Für diesen Raum sind noch keine sichtbaren Sensoren zugeordnet.</p>`}
        </section>` : html`<footer><span class="status-dot" aria-hidden="true"></span>
          ${configuredRooms.length ? 'Raum auswählen, um alle zugeordneten Sensoren zu sehen.' : 'Noch keine Sensoren zugeordnet. Raum auswählen, um Details zu öffnen.'}
        </footer>`}
      </ha-card>
    `;
  }

  static styles = cardStyles;
}

if (!customElements.get('hausklima-card')) customElements.define('hausklima-card', HausKlimaCard);
