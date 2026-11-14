import { LitElement, html, nothing } from 'lit';
import { live } from 'lit/directives/live.js';
import { keyed } from 'lit/directives/keyed.js';
import { getDefaultConfig, normalizeConfig, resolveBuilding } from './config';
import {
  addRoom, addSensor, deleteRoom, editRoom, editSensor, removeSensor,
  setPrimarySensor, updateMeasurement,
} from './editor-model';
import { METRIC_LABELS } from './metrics';
import { METRIC_TYPES } from './types';
import type { HausKlimaCardConfig, HomeAssistant, MetricType, RoomConfig, SensorConfig } from './types';
import { editorStyles } from './editor-styles';

interface NativeCardConstructor {
  getConfigElement?: () => HTMLElement | Promise<HTMLElement>;
}
interface CardHelpers {
  createCardElement: (config: Record<string, unknown>) => HTMLElement;
}
type SelectorEvent = CustomEvent<{ value?: unknown }>;

/** Native selector contract verified against Home Assistant frontend on 2026-11-13:
 * components/ha-selector/{ha-selector,ha-selector-entity}.ts.
 * The built-in button editor imports ha-form, which imports ha-selector. */
export class HausKlimaCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _roomId: { state: true },
    _metric: { state: true },
    _error: { state: true },
    _confirmDelete: { state: true },
    _newRoomName: { state: true },
    _newRoomKind: { state: true },
    _newRoomLevel: { state: true },
    _selectorAvailable: { state: true },
    _selectorLoading: { state: true },
    _selectorRevision: { state: true },
  };

  declare hass?: HomeAssistant;
  private _config: HausKlimaCardConfig = getDefaultConfig();
  private _roomId = 'workshop';
  private _metric: MetricType = 'temperature';
  private _error = '';
  private _confirmDelete = false;
  private _newRoomName = '';
  private _newRoomKind: 'indoor' | 'outdoor' = 'indoor';
  private _newRoomLevel = 'ground_floor';
  private _selectorAvailable = !!customElements.get('ha-selector');
  private _selectorLoading = false;
  private _selectorRevision = 0;

  setConfig(config: unknown): void {
    this._config = normalizeConfig(config);
    const rooms = resolveBuilding(this._config).rooms;
    if (!rooms.some((room) => room.id === this._roomId)) this._roomId = rooms[0]?.id ?? '';
    this._confirmDelete = false;
    this._error = '';
  }

  connectedCallback(): void {
    super.connectedCallback();
    void this.ensureNativeSelector();
  }

  private async ensureNativeSelector(): Promise<void> {
    if (customElements.get('ha-selector')) {
      this._selectorAvailable = true;
      return;
    }
    if (this._selectorLoading) return;
    this._selectorLoading = true;
    try {
      const frontend = window as Window & { loadCardHelpers?: () => Promise<CardHelpers> };
      const helpers = await frontend.loadCardHelpers?.();
      const nativeCard = helpers?.createCardElement({ type: 'button' });
      const constructor = nativeCard?.constructor as NativeCardConstructor | undefined;
      await constructor?.getConfigElement?.();
      this._selectorAvailable = !!customElements.get('ha-selector');
    } catch {
      this._selectorAvailable = false;
    } finally {
      this._selectorLoading = false;
    }
  }

  protected updated(): void {
    // Native select.value must follow option insertion when adding/removing rooms.
    const roomSelect = this.shadowRoot?.querySelector<HTMLSelectElement>('#room-select');
    if (roomSelect && roomSelect.value !== this._roomId) roomSelect.value = this._roomId;
    const metricSelect = this.shadowRoot?.querySelector<HTMLSelectElement>('#metric-select');
    if (metricSelect && metricSelect.value !== this._metric) metricSelect.value = this._metric;
    const levelSelect = this.shadowRoot?.querySelector<HTMLSelectElement>('#new-room-level');
    if (levelSelect && [...levelSelect.options].some((option) => option.value === this._newRoomLevel)) levelSelect.value = this._newRoomLevel;
  }

  private commit(next: HausKlimaCardConfig): void {
    this._config = normalizeConfig(next);
    this._error = '';
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: structuredClone(this._config) }, bubbles: true, composed: true,
    }));
  }

  private apply(change: () => HausKlimaCardConfig): void {
    try { this.commit(change()); }
    catch (error) { this._error = error instanceof Error ? error.message : 'Die Änderung konnte nicht übernommen werden.'; }
  }

  private updateBase(key: 'title' | 'show_dimensions' | 'show_room_names', value: string | boolean): void {
    this.apply(() => ({ ...this._config, [key]: value }));
  }

  private changeRoom(event: Event): void {
    this._roomId = (event.target as HTMLSelectElement).value;
    this._confirmDelete = false;
    this._error = '';
  }

  private changeMetric(event: Event): void {
    this._metric = (event.target as HTMLSelectElement).value as MetricType;
    this._error = '';
  }

  private addLocation(): void {
    const building = resolveBuilding(this._config);
    const before = new Set(building.rooms.map((room) => room.id));
    const level = building.levels.find((candidate) => candidate.id === this._newRoomLevel && candidate.building_id === 'house')
      ?? building.levels.find((candidate) => candidate.building_id === 'house');
    this.apply(() => addRoom(this._config, {
      name: this._newRoomName,
      location: this._newRoomKind,
      ...(this._newRoomKind === 'indoor' ? { level_id: level?.id } : {}),
    }));
    if (this._error) return;
    this._roomId = resolveBuilding(this._config).rooms.find((room) => !before.has(room.id))?.id ?? this._roomId;
    this._newRoomName = '';
    this._confirmDelete = false;
  }

  private deleteLocation(room: RoomConfig): void {
    this.apply(() => deleteRoom(this._config, room.id));
    if (this._error) return;
    this._roomId = resolveBuilding(this._config).rooms[0]?.id ?? '';
    this._confirmDelete = false;
  }

  private sensorChanged(event: SelectorEvent, room: RoomConfig, sensor?: SensorConfig): void {
    event.stopPropagation();
    const value = event.detail?.value;
    if (typeof value !== 'string' || !value.trim()) {
      if (sensor) this.apply(() => removeSensor(this._config, room.id, this._metric, sensor.entity));
      return;
    }
    if (sensor?.entity === value) return;
    this.apply(() => sensor
      ? editSensor(this._config, room.id, this._metric, sensor.entity, { entity: value })
      : addSensor(this._config, room.id, this._metric, value));
    // Native pickers update their own selection before emitting value-changed.
    // Recreate a rejected picker so its display agrees with the saved mapping.
    // The add-picker also resets after successful selections for another source.
    if (!sensor || this._error) this._selectorRevision += 1;
  }

  private renderSensor(room: RoomConfig, sensor: SensorConfig, index: number, primary: string | undefined) {
    const state = this.hass?.states[sensor.entity];
    const status = !state ? 'Entität fehlt' : state.state === 'unavailable' ? 'Nicht verfügbar' : state.state === 'unknown' ? 'Unbekannt' : 'Verfügbar';
    return html`
      <div class="sensor-entry" data-sensor-row=${sensor.entity}>
        <div class="sensor-topline"><span>Sensor ${index + 1}</span><span class="sensor-status">${status}</span></div>
        ${keyed(`${room.id}:${this._metric}:${sensor.entity}:${this._selectorRevision}`, html`<ha-selector
          data-sensor-entity=${sensor.entity}
          .hass=${this.hass}
          .selector=${{ entity: { filter: { domain: 'sensor' } } }}
          .value=${sensor.entity}
          .label=${`Sensor ${index + 1} auswählen`}
          .required=${false}
          .disabled=${!this._selectorAvailable}
          @value-changed=${(event: SelectorEvent) => this.sensorChanged(event, room, sensor)}
        ></ha-selector>`)}
        <label class="field"><span>Anzeigename <small>(optional)</small></span>
          <input type="text" data-action="sensor-name" data-entity=${sensor.entity}
            aria-label=${`Anzeigename für Sensor ${index + 1}`} .value=${live(sensor.name ?? '')}
            placeholder="Name der HA-Entität verwenden"
            @change=${(event: Event) => this.apply(() => editSensor(this._config, room.id, this._metric, sensor.entity, { name: (event.target as HTMLInputElement).value }))} />
        </label>
        <div class="sensor-actions">
          <label class="radio-label"><input type="radio" name="primary-sensor"
            data-action="sensor-primary" data-entity=${sensor.entity}
            .checked=${(primary ?? room.measurements?.[this._metric]?.sensors[0]?.entity) === sensor.entity}
            @change=${() => this.apply(() => setPrimarySensor(this._config, room.id, this._metric, sensor.entity))} /> Hauptsensor</label>
          <button type="button" class="text-button danger" data-action="remove-sensor" data-entity=${sensor.entity}
            aria-label=${`Sensor ${index + 1} entfernen`}
            @click=${() => this.apply(() => removeSensor(this._config, room.id, this._metric, sensor.entity))}>Entfernen</button>
        </div>
      </div>
    `;
  }

  protected render() {
    const building = resolveBuilding(this._config);
    const room = building.rooms.find((candidate) => candidate.id === this._roomId);
    const measurement = room?.measurements?.[this._metric];
    const houseLevels = building.levels.filter((level) => level.building_id === 'house');
    const overview = measurement?.show_in_overview ?? (this._metric === 'temperature' || this._metric === 'relative_humidity');
    return html`
      <div class="editor">
        <section class="base-settings" aria-label="Darstellung">
          <label class="field" for="title"><span>Kartentitel</span>
            <input id="title" type="text" .value=${live(this._config.title ?? '')}
              @change=${(event: Event) => this.updateBase('title', (event.target as HTMLInputElement).value)} />
          </label>
          <div class="base-options">
            <label class="check-label"><input id="show-room-names" type="checkbox" .checked=${this._config.show_room_names ?? true}
              @change=${(event: Event) => this.updateBase('show_room_names', (event.target as HTMLInputElement).checked)} /> Raumnamen anzeigen</label>
            <label class="check-label"><input id="show-dimensions" type="checkbox" .checked=${this._config.show_dimensions ?? false}
              @change=${(event: Event) => this.updateBase('show_dimensions', (event.target as HTMLInputElement).checked)} /> Technische Maße anzeigen</label>
          </div>
        </section>

        <section class="room-settings" aria-label="Räume und Sensoren">
          <div class="section-heading"><span class="step">1</span><h2>Raum oder Messort</h2></div>
          <label class="field" for="room-select"><span>Raum auswählen</span>
            <select id="room-select" .value=${live(this._roomId)} @change=${this.changeRoom}>
              ${building.rooms.map((candidate) => html`<option value=${candidate.id} .selected=${candidate.id === this._roomId}>${candidate.name}${candidate.location === 'outdoor' ? ' · Außen' : ''}</option>`)}
            </select>
          </label>
          ${room ? html`
            <div class="room-name-row">
              <label class="field" for="room-name"><span>Anzeigename des Raums</span>
                <input id="room-name" type="text" .value=${live(room.name)}
                  @change=${(event: Event) => this.apply(() => editRoom(this._config, room.id, { name: (event.target as HTMLInputElement).value }))} />
              </label>
              <button id="delete-room" type="button" class="text-button danger" @click=${() => { this._confirmDelete = true; }}>Raum entfernen</button>
            </div>
            <p class="hint">${room.location === 'outdoor' ? 'Außenmessort · eigener Bereich außerhalb des Hauses.' : `${building.levels.find((level) => level.id === room.level_id)?.name ?? 'Weiterer Raum'} · ${room.visible ? 'im Gebäudeschnitt vorgesehen' : 'in der separaten Raumübersicht'}.`}</p>
            ${this._confirmDelete ? html`
              <div class="confirmation" role="alert">
                <strong>„${room.name}“ mit allen Sensorzuordnungen entfernen?</strong>
                <p>Die anderen Räume und ihre Sensoren bleiben erhalten.</p>
                <div class="button-row"><button id="cancel-delete-room" type="button" @click=${() => { this._confirmDelete = false; }}>Abbrechen</button>
                  <button id="confirm-delete-room" type="button" class="danger" @click=${() => this.deleteLocation(room)}>Entfernen bestätigen</button></div>
              </div>
            ` : nothing}

            <div class="section-heading metric-heading"><span class="step">2</span><h2>Messwerte zuordnen</h2></div>
            <label class="field" for="metric-select"><span>Messart</span>
              <select id="metric-select" .value=${live(this._metric)} @change=${this.changeMetric}>
                ${METRIC_TYPES.map((type) => html`<option value=${type} .selected=${type === this._metric}>${METRIC_LABELS[type]}</option>`)}
              </select>
            </label>
            <div class="measurement-options">
              <label class="check-label"><input id="metric-visible" type="checkbox" .checked=${measurement?.visible !== false}
                @change=${(event: Event) => this.apply(() => updateMeasurement(this._config, room.id, this._metric, { visible: (event.target as HTMLInputElement).checked }))} /> Messart in Übersichten aktiv</label>
              <label class="check-label"><input id="metric-overview" type="checkbox" .checked=${overview}
                @change=${(event: Event) => this.apply(() => updateMeasurement(this._config, room.id, this._metric, { show_in_overview: (event.target as HTMLInputElement).checked }))} /> Hauptwert im Raum anzeigen</label>
            </div>
            <p class="hint">Alle zugeordneten Sensoren bleiben in den Raumdetails erreichbar, auch bei ausgeblendeter Hauptanzeige.</p>
            <div class="sensor-list">${measurement?.sensors.map((sensor, index) => this.renderSensor(room, sensor, index, measurement.primary))}</div>
            ${!measurement?.sensors.length ? html`<p class="empty-hint">Noch kein Sensor für diese Messart zugeordnet.</p>` : nothing}
            ${this._selectorAvailable ? html`
              <div class="add-sensor" data-picker-revision=${this._selectorRevision}>
                ${keyed(this._selectorRevision, html`<ha-selector id="new-sensor" .hass=${this.hass}
                  .selector=${{ entity: { filter: { domain: 'sensor' } } }}
                  .value=${undefined} .label=${measurement?.sensors.length ? 'Weiteren Sensor auswählen' : 'Sensor auswählen'}
                  .required=${false}
                  @value-changed=${(event: SelectorEvent) => this.sensorChanged(event, room)}
                ></ha-selector>`)}
              </div>
            ` : html`
              <div class="selector-note" role="status">${this._selectorLoading ? 'Home-Assistant-Entitätsauswahl wird geladen …' : 'Die native Entitätsauswahl steht im Home-Assistant-Karteneditor zur Verfügung.'}
                ${!this._selectorLoading ? html`<button type="button" class="text-button" @click=${() => this.ensureNativeSelector()}>Erneut versuchen</button>` : nothing}
              </div>
            `}
          ` : html`<p class="empty-hint">Füge einen Raum oder Außenmessort hinzu.</p>`}
        </section>

        ${this._error ? html`<div class="error" role="alert">${this._error}</div>` : nothing}

        <details class="new-room-settings">
          <summary>Raum oder Außenmessort hinzufügen</summary>
          <p class="hint">Zusätzliche Räume erscheinen in der separaten Übersicht. Hausmaße und vorhandene Garage werden nicht dupliziert oder verändert.</p>
          <label class="field" for="new-room-kind"><span>Art des Messorts</span>
            <select id="new-room-kind" .value=${live(this._newRoomKind)}
              @change=${(event: Event) => { this._newRoomKind = (event.target as HTMLSelectElement).value as 'indoor' | 'outdoor'; }}>
              <option value="indoor" .selected=${this._newRoomKind === 'indoor'}>Weiterer Raum</option><option value="outdoor" .selected=${this._newRoomKind === 'outdoor'}>Außenmessort</option>
            </select>
          </label>
          <label class="field" for="new-room-name"><span>Name</span>
            <input id="new-room-name" type="text" .value=${live(this._newRoomName)}
              @input=${(event: Event) => { this._newRoomName = (event.target as HTMLInputElement).value; }} />
          </label>
          ${this._newRoomKind === 'indoor' ? html`
            <label class="field" for="new-room-level"><span>Gebäudeebene</span>
              <select id="new-room-level" .value=${live(houseLevels.some((level) => level.id === this._newRoomLevel) ? this._newRoomLevel : houseLevels[0]?.id ?? '')}
                @change=${(event: Event) => { this._newRoomLevel = (event.target as HTMLSelectElement).value; }}>
                ${houseLevels.map((level) => html`<option value=${level.id} .selected=${level.id === (houseLevels.some((candidate) => candidate.id === this._newRoomLevel) ? this._newRoomLevel : houseLevels[0]?.id)}>${level.name}</option>`)}
              </select>
            </label>
          ` : nothing}
          <button id="add-room" type="button" class="primary-button" @click=${this.addLocation}>Messort hinzufügen</button>
        </details>
      </div>
    `;
  }

  static styles = editorStyles;
}

if (!customElements.get('hausklima-card-editor')) customElements.define('hausklima-card-editor', HausKlimaCardEditor);
