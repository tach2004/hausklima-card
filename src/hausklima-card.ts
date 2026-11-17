import { LitElement, html, nothing } from 'lit';
import { getDefaultConfig, normalizeConfig, resolveBuilding } from './config';
import { renderPhotoView, photoStyles } from './photo-view';
import { createLayout } from './layout';
import { layoutPhotoOverlays } from './overlay-layout';
import { formatSensorValue, resolveMeasurements, resolveOverviewGroups, sensorStatusLabel } from './metrics';
import { iconStyles, metricIcon, roomIcon } from './icons';
import { readingStyles, renderReadingGroups } from './reading-view';
import type { BuildingConfig, HausKlimaCardConfig, HomeAssistant, ResolvedMeasurement, RoomConfig } from './types';
import { cardStyles } from './styles';
import { isFrontRoom, resolveSideBuilding } from './front-view';
import type { HouseSide } from './front-view';

const formatDimension = (value: number) => value.toLocaleString('de-DE', { maximumFractionDigits: 2 });
const arrowIcon = () => html`<svg class="arrow-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M 4 12 12 4 M 4 4 h 8 v 8" /></svg>`;

export class HausKlimaCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _selected: { state: true },
    _showRooms: { state: true },
    _outdoorId: { state: true },
    _side: { state: true },
    _turningPhase: { state: true },
  };
  declare hass?: HomeAssistant;
  private _config?: HausKlimaCardConfig;
  private _selected?: string;
  private _showRooms = false;
  private _outdoorId?: string;
  /** Default is the original, unchanged rear view. */
  private _side: HouseSide = 'rear';
  private _turningPhase?: 'out' | 'in';
  private turnTimer?: ReturnType<typeof setTimeout>;
  private photoResize?: ResizeObserver;
  private photoImage?: HTMLImageElement;
  private photoFrame?: number;

  protected updated(): void {
    const image = this.renderRoot.querySelector<HTMLImageElement>('.photo-image');
    if (image && image !== this.photoImage && typeof ResizeObserver !== 'undefined') {
      this.photoResize?.disconnect();
      this.photoImage = image;
      this.photoResize = new ResizeObserver(() => this.queuePhotoLayout());
      this.photoResize.observe(image);
    }
    this.queuePhotoLayout();
  }

  private queuePhotoLayout(): void {
    if (this.photoFrame !== undefined) cancelAnimationFrame(this.photoFrame);
    this.photoFrame = requestAnimationFrame(() => {
      this.photoFrame = undefined;
      const stage = this.renderRoot.querySelector<HTMLElement>('.photo-stage');
      if (stage) layoutPhotoOverlays(stage);
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.turnTimer !== undefined) clearTimeout(this.turnTimer);
    this.photoResize?.disconnect();
    this.photoImage = undefined;
    if (this.photoFrame !== undefined) cancelAnimationFrame(this.photoFrame);
  }

  setConfig(config: unknown): void {
    this._config = normalizeConfig(config);
    if (!resolveSideBuilding(this._config, resolveBuilding(this._config), this._side).rooms
      .some((room) => room.id === this._selected)) this._selected = undefined;
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

  private toggleHouseSide(): void {
    if (this._turningPhase) return;
    this._turningPhase = 'out';
    this.turnTimer = setTimeout(() => {
      this._side = this._side === 'rear' ? 'front' : 'rear';
      this._selected = undefined;
      this._turningPhase = 'in';
      this.turnTimer = setTimeout(() => { this._turningPhase = undefined; this.turnTimer = undefined; }, 230);
    }, 210);
  }

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

  private showEntity(entity: string): void {
    this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: entity }, bubbles: true, composed: true }));
  }

  private renderReadings(room: RoomConfig, compact = false) {
    if (!resolveOverviewGroups(room, this.hass).length) return nothing;
    return html`<span class=${compact ? 'room-readings compact' : 'room-readings'}>
      ${renderReadingGroups(room, this.hass)}
    </span>`;
  }

  private renderRoomTile(room: RoomConfig, building: BuildingConfig, number?: number) {
    const level = building.levels.find((entry) => entry.id === room.level_id);
    return html`<button class="room-tile ${resolveOverviewGroups(room, this.hass).length ? '' : 'no-readings'}" data-select-room=${room.id} aria-pressed=${String(this._selected === room.id)} @click=${() => this.selectRoom(room)}>
      <span class="tile-heading">${number !== undefined ? html`<span class="room-number">${String(number).padStart(2, '0')}</span>` : nothing}
        <span class="room-label">${roomIcon(room)}<span>${room.name}</span></span><span class="tile-arrow" aria-hidden="true">${arrowIcon()}</span></span>
      ${this.renderReadings(room)}
      <span class="tile-level">${room.location === 'outdoor' ? 'Außenmessort' : level?.name}</span>
    </button>`;
  }

  private renderDetails(room: RoomConfig, building: BuildingConfig) {
    const measurements = resolveMeasurements(room, this.hass, 'details');
    const level = building.levels.find((entry) => entry.id === room.level_id);
    return html`<section class="room-detail" data-room-id=${room.id} tabindex="-1" aria-label="Raumdetails">
      <div class="detail-header"><div><span class="section-kicker">${room.location === 'outdoor' ? 'Außenmessort' : level?.name}</span>
        <h2 class="room-label">${roomIcon(room)}<span>${room.name}</span></h2></div><button class="close-detail" aria-label="Raumdetails schließen" @click=${() => { this._selected = undefined; }}>×</button></div>
      ${measurements.length ? html`<div class="metric-list">${measurements.map((metric) => this.renderDetailMetric(metric))}</div>`
        : html`<p class="detail-empty">Noch keine Sensoren zugeordnet. Im grafischen Karteneditor kannst du für diesen Messort Sensoren auswählen.</p>`}
      ${this._config?.show_dimensions && room.width_m !== null ? html`<p class="room-dimension">Angegebene Raumbreite: ${formatDimension(room.width_m)} m</p>` : nothing}
    </section>`;
  }

  private renderDetailMetric(metric: ResolvedMeasurement) {
    return html`<section class="metric-group" data-metric=${metric.type} aria-label=${metric.label}>
      <div class="metric-heading"><h3><span class="reading-icon ${metric.type}" aria-hidden="true">${metricIcon(metric.type)}</span>${metric.label}</h3>
        ${!metric.visible || !metric.show_in_overview ? html`<span class="hidden-label">Nur in Details</span>` : nothing}</div>
      ${metric.sensors.map((sensor) => html`<button class="sensor-row ${sensor.is_primary ? 'primary-sensor' : ''} ${sensor.show_in_overview ? 'overview-sensor' : ''}" data-entity=${sensor.entity} @click=${() => this.showEntity(sensor.entity)}>
        <span class="source-name">${sensor.name}<span class="sensor-meta">${sensor.overview_group ? `${sensor.overview_group} · ` : ''}${sensor.is_primary ? 'Standardquelle · ' : ''}${sensor.show_in_overview ? metric.visible && metric.show_in_overview ? 'Hauptanzeige' : 'Übersicht ausgeblendet' : 'Nur in Details'} · ${sensorStatusLabel(sensor.status)}</span></span>
        <span class="source-value ${sensor.status !== 'available' ? 'unavailable' : ''}"><strong>${formatSensorValue(sensor, this.hass)}</strong>
          ${sensor.status === 'available' && sensor.unit ? html`<span>${sensor.unit}</span>` : nothing}<span class="entity-arrow" aria-hidden="true">${arrowIcon()}</span></span>
      </button>`)}
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
    const building = resolveSideBuilding(config, resolveBuilding(config), this._side);
    const rear = this._side === 'rear';
    const shapes = rear
      ? createLayout(building).shapes.filter((shape) => shape.level !== 'garage' && shape.room.location !== 'outdoor')
      : [];
    const drawnIds = new Set(shapes.map((shape) => shape.room.id));
    const orderedFront = rear ? [] : building.rooms.filter(isFrontRoom);
    // Garage, individual devices and outside locations get normal room tiles too.
    const themeMode = config.theme_mode ?? 'auto';
    const darkMode = themeMode === 'auto' ? this.hass?.themes?.darkMode : themeMode === 'dark';
    const resolvedTheme = typeof darkMode === 'boolean' ? (darkMode ? 'dark' : 'light') : 'inherit';
    const orderedRooms = rear ? shapes.map((shape) => shape.room) : orderedFront;
    const overviewRooms = [...orderedRooms,
      ...building.rooms.filter((room) => !drawnIds.has(room.id) && !orderedRooms.some((entry) => entry.id === room.id))];
    const selected = building.rooms.find((room) => room.id === this._selected);
    return html`<ha-card data-theme-mode=${themeMode} data-theme-resolved=${resolvedTheme}
      style=${`--hk-chip: rgba(22, 26, 30, ${config.chip_opacity ?? 0.72}); --hk-scene-max-width: ${config.scene_max_width ?? 1400}px; --hk-badge-font-desktop: ${config.badge_font_desktop ?? 12}px; --hk-badge-font-mobile: ${config.badge_font_mobile ?? 9}px;`}>
      <header class="card-header"><div class="card-title"><span class="home-icon" aria-hidden="true">⌂</span>${config.title ? html`<h1>${config.title}</h1>` : nothing}</div>
        <button class="overview-toggle" aria-expanded=${String(this._showRooms)} @click=${() => { this._showRooms = !this._showRooms; }}>Räume <span>${building.rooms.length}</span></button></header>
      <div class="photo-main">
        <div class="house-side-wrapper ${this._turningPhase ? `flip-${this._turningPhase}` : ''}">
          ${renderPhotoView(building, this.hass, config.show_room_names ?? true,
            (room) => this.selectRoom(room), this._selected,
            { side: this._side, outdoorId: this._outdoorId,
              onOutdoorChange: (id) => { this._outdoorId = id; },
              badgePositions: rear ? config.badge_positions : config.front_badge_positions })}
        </div>
        <button class="house-side-button" data-house-side-switch type="button"
          aria-label=${this._side === 'rear' ? 'Zur Vorderansicht drehen' : 'Zur Rückansicht drehen'}
          @click=${() => this.toggleHouseSide()} ?disabled=${Boolean(this._turningPhase)}>
          <span aria-hidden="true">⟳</span> ${this._side === 'rear' ? 'Vorderansicht' : 'Rückansicht'}
        </button>
        ${selected ? this.renderDetails(selected, building) : nothing}
      </div>
      <div class="photo-lower">
        <section class="rooms-section ${this._showRooms ? 'expanded' : ''}" aria-label="Raumübersicht">
          <div class="section-title"><h2>Räume</h2><span>Antippen für alle Sensorquellen</span></div>
          <div class="room-list house-room-list">${overviewRooms.map((room, index) => this.renderRoomTile(room, building, index + 1))}</div>
        </section>
      </div>
      ${config.show_dimensions ? this.renderBuildingDetails(building) : nothing}
    </ha-card>`;
  }

  static styles = [iconStyles, readingStyles, photoStyles, cardStyles];
}

if (!customElements.get('hausklima-card')) customElements.define('hausklima-card', HausKlimaCard);
