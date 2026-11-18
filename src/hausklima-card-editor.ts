import { LitElement, html, nothing } from 'lit';
import { live } from 'lit/directives/live.js';
import { keyed } from 'lit/directives/keyed.js';
import { getDefaultConfig, normalizeConfig, resolveBuilding } from './config';
import { applyFrontEdit, frontEditorConfig, isFrontRoom, isSharedLocation,
  resolveSideBuilding, resolveSideBadgePositions } from './front-view';
import type { HouseSide } from './front-view';
import {
  addRoom, addSensor, deleteRoom, editRoom, editSensor, removeSensor,
  setPrimarySensor, setMobileOverview, setMobileSensorOverview, saveBadgePosition, resetBadgePosition, updateMeasurement,
} from './editor-model';
import { METRIC_LABELS } from './metrics';
import { METRIC_TYPES } from './types';
import type { HausKlimaCardConfig, HomeAssistant, MetricType, RoomConfig, SensorConfig } from './types';
import { editorStyles } from './editor-styles';
import { renderPhotoView, photoStyles } from './photo-view';
import { layoutPhotoOverlays } from './overlay-layout';
import { iconStyles } from './icons';
import { readingStyles } from './reading-view';
import { ROOM_ART_POSITIONS, GARAGE_ART_POSITIONS, MOBILE_ROOM_ART_POSITIONS,
  FRONT_ROOM_ART_POSITIONS, FRONT_MOBILE_ROOM_ART_POSITIONS } from './scene-photo';
import { isMobileOverviewEnabled } from './metrics';

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
    _positionDevice: { state: true },
    _editorSide: { state: true },
    _previewOutdoorId: { state: true },
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
  private _positionDevice: 'desktop' | 'mobile' = 'desktop';
  private _editorSide: HouseSide = 'rear';
  private _previewOutdoorId?: string;
  private _drag?: { pointerId: number; roomId: string; device: 'desktop' | 'mobile';
    startX: number; startY: number; offsetX: number; offsetY: number; moved: boolean;
    position: { x: number; y: number } };
  private _previewViewport?: HTMLElement;
  private _previewResize?: ResizeObserver;
  private _previewFrame?: number;

  setConfig(config: unknown): void {
    this._config = normalizeConfig(config);
    const rooms = this.activeBuilding().rooms;
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
    const viewport = this.shadowRoot?.querySelector<HTMLElement>('.position-live-viewport');
    if (viewport !== this._previewViewport) {
      this._previewResize?.disconnect();
      this._previewViewport = viewport ?? undefined;
      if (viewport && typeof ResizeObserver !== 'undefined') {
        this._previewResize = new ResizeObserver(() => this.queuePreviewLayout());
        this._previewResize.observe(viewport);
      }
    }
    this.queuePreviewLayout();
    // Native select.value must follow option insertion when adding/removing rooms.
    const roomSelect = this.shadowRoot?.querySelector<HTMLSelectElement>('#room-select');
    if (roomSelect && roomSelect.value !== this._roomId) roomSelect.value = this._roomId;
    const metricSelect = this.shadowRoot?.querySelector<HTMLSelectElement>('#metric-select');
    if (metricSelect && metricSelect.value !== this._metric) metricSelect.value = this._metric;
    const levelSelect = this.shadowRoot?.querySelector<HTMLSelectElement>('#new-room-level');
    if (levelSelect && [...levelSelect.options].some((option) => option.value === this._newRoomLevel)) levelSelect.value = this._newRoomLevel;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._previewResize?.disconnect();
    this._previewViewport = undefined;
    if (this._previewFrame !== undefined) cancelAnimationFrame(this._previewFrame);
  }

  private queuePreviewLayout(): void {
    if (this._previewFrame !== undefined) cancelAnimationFrame(this._previewFrame);
    this._previewFrame = requestAnimationFrame(() => {
      this._previewFrame = undefined;
      this.layoutPreview();
    });
  }

  /** Apply the logical viewport width immediately after Lit has updated its DOM.
   * A mode change must not rely on a ResizeObserver: the outer width is unchanged.
   */
  private layoutPreview(): void {
    const viewport = this.shadowRoot?.querySelector<HTMLElement>('.position-live-viewport');
    const canvas = viewport?.querySelector<HTMLElement>('.position-live-canvas');
    const stage = canvas?.querySelector<HTMLElement>('.photo-stage');
    const image = stage?.querySelector<HTMLImageElement>('.photo-image');
    if (!viewport || !canvas || !stage || !image || !viewport.clientWidth) return;
    const designWidth = this._positionDevice === 'mobile' ? 390 : 1280;
    const scale = Math.min(1, viewport.clientWidth / designWidth);
    canvas.style.width = `${designWidth}px`;
    canvas.style.transform = `scale(${scale})`;
    canvas.style.left = `${Math.max(0, (viewport.clientWidth - designWidth * scale) / 2)}px`;
    const height = `${image.offsetHeight * scale}px`;
    if (viewport.style.height !== height) viewport.style.height = height;
    layoutPhotoOverlays(stage, scale);
  }

  private activeBuilding() {
    return resolveSideBuilding(this._config, resolveBuilding(this._config), this._editorSide);
  }

  private changeEditorSide(event: Event): void {
    this._editorSide = (event.target as HTMLSelectElement).value as HouseSide;
    const rooms = this.activeBuilding().rooms;
    this._roomId = rooms[0]?.id ?? '';
    this._confirmDelete = false;
    this._error = '';
    this._previewOutdoorId = undefined;
    this._drag = undefined;
  }

  private commit(next: HausKlimaCardConfig): void {
    this._config = normalizeConfig(next);
    this._error = '';
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: structuredClone(this._config) }, bubbles: true, composed: true,
    }));
  }

  private apply(change: () => HausKlimaCardConfig): void {
    if (this._editorSide === 'rear') {
      try { this.commit(change()); }
      catch (error) { this._error = error instanceof Error ? error.message : 'Die Änderung konnte nicht übernommen werden.'; }
      return;
    }
    const original = this._config;
    const rear = resolveBuilding(original);
    try {
      this._config = frontEditorConfig(original, rear);
      const updated = change();
      this._config = original;
      this.commit(applyFrontEdit(original, rear, updated));
    } catch (error) {
      this._config = original;
      this._error = error instanceof Error ? error.message : 'Die Änderung konnte nicht übernommen werden.';
    }
  }

  private updateBase(key: 'title' | 'show_dimensions' | 'show_room_names' | 'chip_opacity' | 'scene_max_width' | 'theme_mode' | 'badge_font_desktop' | 'badge_font_mobile', value: string | boolean | number): void {
    try { this.commit({ ...this._config, [key]: value }); }
    catch (error) { this._error = error instanceof Error ? error.message : 'Einstellung ungültig.'; }
  }

  private changeRoom(event: Event): void {
    this._roomId = (event.target as HTMLSelectElement).value;
    this._confirmDelete = false;
    this._error = '';
    const room = this.activeBuilding().rooms.find((candidate) => candidate.id === this._roomId);
    if (room?.location === 'outdoor') this._previewOutdoorId = room.id;
  }

  private changeMetric(event: Event): void {
    this._metric = (event.target as HTMLSelectElement).value as MetricType;
    this._error = '';
  }

  /** Relative coordinates remain stable in Panel, Sections and resized editors. */
  private scenePosition(room: RoomConfig): { x: number; y: number } | undefined {
    if (isSharedLocation(room)) {
      return (this._positionDevice === 'mobile' ? MOBILE_ROOM_ART_POSITIONS[room.id] : undefined)
        ?? GARAGE_ART_POSITIONS[room.id]
        ?? (room.location === 'outdoor' ? { x: 86, y: 20 } : undefined);
    }
    if (this._editorSide === 'front') {
      return (this._positionDevice === 'mobile' ? FRONT_MOBILE_ROOM_ART_POSITIONS[room.id] : undefined)
        ?? FRONT_ROOM_ART_POSITIONS[room.id];
    }
    return (this._positionDevice === 'mobile' ? MOBILE_ROOM_ART_POSITIONS[room.id] : undefined)
      ?? ROOM_ART_POSITIONS[room.id] ?? GARAGE_ART_POSITIONS[room.id]
      ?? (room.location === 'outdoor' ? { x: 86, y: 20 } : undefined);
  }

  private savedPosition(room: RoomConfig): { x: number; y: number } | undefined {
    const positions = this._editorSide === 'front' && !isSharedLocation(room)
      ? this._config.front_badge_positions : this._config.badge_positions;
    return positions?.[room.id]?.[this._positionDevice] ?? this.scenePosition(room);
  }

  private liveBadgeEvent(room: RoomConfig, kind: 'down' | 'move' | 'up' | 'cancel' | 'key',
    event: PointerEvent | KeyboardEvent): void {
    if (kind === 'key') {
      this.positionKeyDown(event as KeyboardEvent, room);
      return;
    }
    const pointer = event as PointerEvent;
    const placement = pointer.currentTarget as HTMLElement;
    if (kind === 'down') {
      if ((pointer.pointerType === 'mouse' && pointer.button !== 0)
        || (pointer.target as HTMLElement).closest('select, .photo-outdoor-choice')) return;
      const image = this.shadowRoot?.querySelector<HTMLImageElement>('#position-photo');
      const position = this.savedPosition(room);
      if (!image || !position) return;
      const box = image.getBoundingClientRect();
      if (!box.width || !box.height) return;
      pointer.preventDefault();
      this._drag = {
        pointerId: pointer.pointerId, roomId: room.id, device: this._positionDevice,
        startX: pointer.clientX, startY: pointer.clientY,
        offsetX: pointer.clientX - (box.left + position.x / 100 * box.width),
        offsetY: pointer.clientY - (box.top + position.y / 100 * box.height),
        moved: false, position: { ...position },
      };
      placement.setPointerCapture(pointer.pointerId);
      return;
    }
    const drag = this._drag;
    if (!drag || drag.pointerId !== pointer.pointerId || drag.roomId !== room.id) return;
    if (kind === 'cancel') {
      this._drag = undefined;
      this.queuePreviewLayout();
      return;
    }
    if (kind === 'move' || kind === 'up') {
      const image = this.shadowRoot?.querySelector<HTMLImageElement>('#position-photo');
      const box = image?.getBoundingClientRect();
      if (box?.width && box.height && (drag.moved ||
        Math.hypot(pointer.clientX - drag.startX, pointer.clientY - drag.startY) >= 3)) {
        drag.moved = true;
        pointer.preventDefault();
        const x = Math.max(0, Math.min(100, (pointer.clientX - drag.offsetX - box.left) / box.width * 100));
        const y = Math.max(0, Math.min(100, (pointer.clientY - drag.offsetY - box.top) / box.height * 100));
        drag.position = { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
        placement.style.left = `${x}%`;
        placement.style.top = `${y}%`;
        // Lit owns these text nodes. Never replace an element's textContent:
        // replacing children invalidates Lit's text parts on the next rerender.
        const updateText = (element: HTMLElement | null | undefined, value: string) => {
          const node = [...(element?.childNodes ?? [])].find((item) => item.nodeType === Node.TEXT_NODE);
          if (node) (node as Text).data = value;
        };
        updateText(placement.querySelector<HTMLElement>('[data-position-readout]'),
          `X: ${x.toFixed(1)} % · Y: ${y.toFixed(1)} %`);
        updateText(this.shadowRoot?.querySelector<HTMLElement>('#position-live-readout'),
          `${room.name}: X ${x.toFixed(1)} % / Y ${y.toFixed(1)} %`);
      }
    }
    if (kind === 'up') {
      this._drag = undefined;
      if (placement.hasPointerCapture(pointer.pointerId)) placement.releasePointerCapture(pointer.pointerId);
      this._roomId = room.id;
      if (room.location === 'outdoor') this._previewOutdoorId = room.id;
      if (drag.moved) {
        // One validated config-changed event per completed drag, not per pixel.
        this.apply(() => saveBadgePosition(this._config, room.id, drag.device, drag.position));
      }
    }
  }

  private selectPreviewRoom(room: RoomConfig): void {
    if (this._drag) return;
    this._roomId = room.id;
    if (room.location === 'outdoor') this._previewOutdoorId = room.id;
    this._error = '';
  }

  private positionKeyDown(event: KeyboardEvent, room: RoomConfig): void {
    if (!(event.target as HTMLElement).closest('.photo-badge')) return;
    const vectors: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
    };
    const vector = vectors[event.key];
    if (!vector) return;
    event.preventDefault();
    const current = this.savedPosition(room);
    if (!current) return;
    const step = event.shiftKey ? 5 : 1;
    const x = Math.max(0, Math.min(100, current.x + vector[0] * step));
    const y = Math.max(0, Math.min(100, current.y + vector[1] * step));
    this.apply(() => saveBadgePosition(this._config, room.id, this._positionDevice, { x, y }));
  }

  private updatePositionCoordinate(event: Event, room: RoomConfig, axis: 'x' | 'y'): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    if (!input.value.trim() || !Number.isFinite(value) || value < 0 || value > 100) {
      this._error = 'Kästchenposition: Bitte einen Wert zwischen 0 und 100 % eingeben.';
      input.value = this.savedPosition(room)?.[axis].toFixed(1) ?? '';
      return;
    }
    const current = this.savedPosition(room);
    if (!current) return;
    this.apply(() => saveBadgePosition(this._config, room.id, this._positionDevice,
      { ...current, [axis]: Math.round(value * 100) / 100 }));
  }

  private renderPositionEditor(room: RoomConfig | undefined) {
    if (!room) return nothing;
    const building = this.activeBuilding();
    const position = this.savedPosition(room);
    const positions = this._editorSide === 'front' && !isSharedLocation(room)
      ? this._config.front_badge_positions : this._config.badge_positions;
    const stored = positions?.[room.id]?.[this._positionDevice];
    return html`<details class="position-settings" @toggle=${() => this.queuePreviewLayout()}>
      <summary>Messwertkästchen im Bild verschieben</summary>
      <p class="hint">Alle sichtbaren Kästchen im echten Hausbild können mit Maus oder Finger verschoben werden.
        Ein Klick wählt den jeweiligen Messort aus; dessen X-/Y-Werte stehen darunter.
        Desktop und Handy werden getrennt gespeichert; Garage und Außenmessorte behalten
        auf Vorder- und Rückansicht die gleichen Positionen.
        Mit Pfeiltasten verschiebst du um 1 % (Umschalt: 5 %).
        Im normalen Dashboard ist Verschieben deaktiviert.</p>
      <label class="field" for="position-device"><span>Vorschau für</span>
        <select id="position-device" .value=${this._positionDevice}
          @change=${(event: Event) => {
            this._drag = undefined;
            this._positionDevice = (event.target as HTMLSelectElement).value as 'desktop' | 'mobile';
            // The actual geometry changes, even though the editor column does not.
            void this.updateComplete.then(() => this.layoutPreview());
          }}>
          <option value="desktop">Desktop (1280 px)</option><option value="mobile">Handy (390 px)</option>
        </select>
      </label>
      <div class="position-live-viewport" aria-label="Live-Vorschau mit allen verschiebbaren Kästchen">
        <div class="position-live-canvas" data-preview-device=${this._positionDevice}
          style=${`--hk-chip: rgba(22, 26, 30, ${this._config.chip_opacity ?? .72}); --hk-badge-font-desktop: ${this._config.badge_font_desktop ?? 12}px; --hk-badge-font-mobile: ${this._config.badge_font_mobile ?? 9}px;`}>
          ${renderPhotoView(building, this.hass, this._config.show_room_names ?? true,
            (candidate) => this.selectPreviewRoom(candidate), room.id,
            { side: this._editorSide, editorDevice: this._positionDevice,
              outdoorId: room.location === 'outdoor' ? room.id : this._previewOutdoorId,
              onOutdoorChange: (id) => { this._previewOutdoorId = id; this._roomId = id; },
              badgePositions: resolveSideBadgePositions(this._config, resolveBuilding(this._config), this._editorSide),
              onBadgeEvent: (candidate, kind, event) => this.liveBadgeEvent(candidate, kind, event) })}
        </div>
      </div>
      ${position ? html`
        <p id="position-live-readout" class="hint" role="status">${`${room.name}: X ${position.x.toFixed(1)} % / Y ${position.y.toFixed(1)} %`}</p>
        <div class="position-coordinates" role="group" aria-label="Kästchenposition in Prozent">
          <label class="field" for="position-x">Horizontal (X) in %
            <input id="position-x" type="number" min="0" max="100" step="0.1"
              .value=${position.x.toFixed(1)}
              @change=${(event: Event) => this.updatePositionCoordinate(event, room, 'x')} />
          </label>
          <label class="field" for="position-y">Vertikal (Y) in %
            <input id="position-y" type="number" min="0" max="100" step="0.1"
              .value=${position.y.toFixed(1)}
              @change=${(event: Event) => this.updatePositionCoordinate(event, room, 'y')} />
          </label>
        </div>
        <div class="button-row position-actions">
          <span class="hint">Aktuelle Position: ${position.x.toFixed(1)} % / ${position.y.toFixed(1)} %</span>
          <button type="button" id="position-reset" ?disabled=${!stored}
            @click=${() => this.apply(() => resetBadgePosition(this._config, room.id, this._positionDevice))}>
            Standardposition wiederherstellen
          </button>
        </div>` : html`<p class="hint">Dieser zusätzliche Raum hat noch keinen bestätigten Platz im Hausbild.
          Er bleibt über die Raumübersicht erreichbar.</p>`}
    </details>`;
  }

  private addLocation(): void {
    if (this._editorSide === 'front' && this._newRoomKind === 'indoor') {
      const front = this.activeBuilding();
      const label = this._newRoomName.trim();
      if (!label) { this._error = 'Raumname darf nicht leer sein.'; return; }
      if (front.rooms.some((room) => room.name.trim().toLocaleLowerCase() === label.toLocaleLowerCase())) {
        this._error = 'Ein Raum mit diesem Namen existiert bereits.'; return;
      }
      let index = 1;
      while (front.rooms.some((room) => room.id === `front_room_${index}`)) index++;
      const room: RoomConfig = { id: `front_room_${index}`, name: label,
        level_id: this._newRoomLevel === 'attic' ? 'attic' : 'ground_floor',
        visible: false, width_m: null, location: 'indoor' };
      try {
        this.commit({ ...this._config, front_rooms: [...front.rooms.filter(isFrontRoom), room] });
        this._roomId = room.id; this._newRoomName = '';
      } catch (error) { this._error = error instanceof Error ? error.message : 'Raum konnte nicht hinzugefügt werden.'; }
      return;
    }
    const building = resolveBuilding(this._config);
    const before = new Set(building.rooms.map((room) => room.id));
    const level = building.levels.find((candidate) => candidate.id === this._newRoomLevel && candidate.building_id === 'house')
      ?? building.levels.find((candidate) => candidate.building_id === 'house');
    if (this._editorSide === 'front' && this._newRoomKind === 'outdoor') {
      try {
        this.commit(addRoom(this._config, { name: this._newRoomName, location: 'outdoor' }));
        this._roomId = resolveBuilding(this._config).rooms.find((room) => !before.has(room.id))?.id ?? this._roomId;
        this._newRoomName = '';
      } catch (error) { this._error = error instanceof Error ? error.message : 'Messort konnte nicht hinzugefügt werden.'; }
      return;
    }
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
    if (this._editorSide === 'front' && isSharedLocation(room)) {
      this._error = 'Gemeinsame Garage und Außenmessorte nur in der Rückansicht entfernen.'; return;
    }
    this.apply(() => deleteRoom(this._config, room.id));
    if (this._error) return;
    this._roomId = this.activeBuilding().rooms[0]?.id ?? '';
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
          .selector=${{ entity: { filter: { domain: this._metric === 'condensation_risk' ? ['sensor', 'binary_sensor'] : 'sensor' } } }}
          .value=${sensor.entity}
          .label=${`Sensor ${index + 1} auswählen`}
          .required=${false}
          .disabled=${!this._selectorAvailable}
          @value-changed=${(event: SelectorEvent) => this.sensorChanged(event, room, sensor)}
        ></ha-selector>`)}
        <label class="field"><span>Anzeigename <small>(optional)</small></span>
          <input type="text" data-action="sensor-name" data-entity=${sensor.entity}
            aria-label=${`Anzeigename für Sensor ${index + 1}`} .value=${sensor.name ?? ''}
            placeholder="Name der HA-Entität verwenden"
            @change=${(event: Event) => this.apply(() => editSensor(this._config, room.id, this._metric, sensor.entity, { name: (event.target as HTMLInputElement).value }))} />
        </label>
        <label class="field"><span>Gruppe in der Übersicht <small>(optional)</small></span>
          <input type="text" data-action="sensor-group" data-entity=${sensor.entity}
            aria-label=${`Sensorgruppe für Sensor ${index + 1}`} .value=${sensor.overview_group ?? ''}
            placeholder="z. B. Homematic, Ecowitt, Vitodens"
            @change=${(event: Event) => this.apply(() => editSensor(this._config, room.id, this._metric, sensor.entity, { overview_group: (event.target as HTMLInputElement).value }))} />
        </label>
        <div class="sensor-actions">
          <label class="radio-label"><input type="radio" name="primary-sensor"
            data-action="sensor-primary" data-entity=${sensor.entity}
            .checked=${(primary ?? room.measurements?.[this._metric]?.sensors[0]?.entity) === sensor.entity}
            @change=${() => this.apply(() => setPrimarySensor(this._config, room.id, this._metric, sensor.entity))} /> Standardquelle</label>
          <label class="check-label"><input type="checkbox"
            data-action="sensor-overview" data-entity=${sensor.entity}
            .checked=${sensor.show_in_overview ?? (primary ?? room.measurements?.[this._metric]?.sensors[0]?.entity) === sensor.entity}
            @change=${(event: Event) => this.apply(() => editSensor(this._config, room.id, this._metric, sensor.entity, { show_in_overview: (event.target as HTMLInputElement).checked }))} /> Haupt – in Übersicht</label>
          <label class="check-label"><input type="checkbox"
            data-action="sensor-mobile" data-entity=${sensor.entity}
            .checked=${sensor.show_on_mobile ?? (
              isMobileOverviewEnabled(room, this._metric) &&
              room.measurements?.[this._metric]?.show_in_overview !== false &&
              (primary ?? room.measurements?.[this._metric]?.sensors[0]?.entity) === sensor.entity)}
            @change=${(event: Event) => this.apply(() => setMobileSensorOverview(this._config, room.id,
              this._metric, sensor.entity, (event.target as HTMLInputElement).checked))} />
            Handy – diesen Sensor anzeigen</label>
          <button type="button" class="text-button danger" data-action="remove-sensor" data-entity=${sensor.entity}
            aria-label=${`Sensor ${index + 1} entfernen`}
            @click=${() => this.apply(() => removeSensor(this._config, room.id, this._metric, sensor.entity))}>Entfernen</button>
        </div>
      </div>
    `;
  }

  protected render() {
    const building = this.activeBuilding();
    const room = building.rooms.find((candidate) => candidate.id === this._roomId);
    const measurement = room?.measurements?.[this._metric];
    const houseLevels = building.levels.filter((level) => level.building_id === 'house'
      && (this._editorSide === 'rear' || level.id !== 'basement'));
    const overview = measurement?.show_in_overview ?? true;
    return html`
      <div class="editor">
        <section class="base-settings" aria-label="Darstellung">
          <label class="field" for="title"><span>Kartentitel</span>
            <input id="title" type="text" .value=${this._config.title ?? ''}
              @change=${(event: Event) => this.updateBase('title', (event.target as HTMLInputElement).value)} />
          </label>
          <label class="field" for="theme-mode"><span>Darstellung der HausKlima Card</span>
            <select id="theme-mode" .value=${this._config.theme_mode ?? 'auto'}
              @change=${(event: Event) => this.updateBase('theme_mode', (event.target as HTMLSelectElement).value)}>
              <option value="auto">Automatisch (Home Assistant)</option>
              <option value="light">Hell</option>
              <option value="dark">Dunkel</option>
            </select>
            <small>Automatisch übernimmt den aktiven Hell-/Dunkelmodus von Home Assistant.</small>
          </label>
          <label class="field chip-opacity" for="chip-opacity"><span>Transparenz der dunklen Messwert-Kästchen: ${Math.round((this._config.chip_opacity ?? 0.72) * 100)} % Deckkraft</span>
            <input id="chip-opacity" type="range" min="35" max="100" step="1"
              .value=${String(Math.round((this._config.chip_opacity ?? 0.72) * 100))}
              @input=${(event: Event) => this.updateBase('chip_opacity', Number((event.target as HTMLInputElement).value) / 100)} />
          </label>
          <label class="field scene-width" for="scene-max-width"><span>Maximale Breite der Gebäudeansicht: ${this._config.scene_max_width ?? 1400} px</span>
            <input id="scene-max-width" type="range" min="900" max="3200" step="10"
              .value=${String(this._config.scene_max_width ?? 1400)}
              @input=${(event: Event) => this.updateBase('scene_max_width', Number((event.target as HTMLInputElement).value))} />
            <small>Die Ansicht nutzt höchstens den verfügbaren Platz. Eine schmale HA-Sektion wird dadurch nicht verbreitert.</small>
          </label>
          <label class="field badge-font" for="badge-font-desktop"><span>Schriftgröße der Kästchen – Desktop: ${this._config.badge_font_desktop ?? 12} px</span>
            <input id="badge-font-desktop" type="range" min="9" max="20" step="1"
              .value=${String(this._config.badge_font_desktop ?? 12)}
              @change=${(event: Event) => this.updateBase('badge_font_desktop', Number((event.target as HTMLInputElement).value))} />
          </label>
          <label class="field badge-font" for="badge-font-mobile"><span>Schriftgröße der Kästchen – Handy: ${this._config.badge_font_mobile ?? 9} px</span>
            <input id="badge-font-mobile" type="range" min="5" max="16" step="0.5"
              .value=${String(this._config.badge_font_mobile ?? 9)}
              @change=${(event: Event) => this.updateBase('badge_font_mobile', Number((event.target as HTMLInputElement).value))} />
            <small>Gilt nur für das Hausbild. Die Detailansicht bleibt gleich; Kästchen passen sich weiterhin dynamisch an.</small>
          </label>
          <div class="base-options">
            <label class="check-label"><input id="show-room-names" type="checkbox" .checked=${this._config.show_room_names ?? true}
              @change=${(event: Event) => this.updateBase('show_room_names', (event.target as HTMLInputElement).checked)} /> Raumnamen anzeigen</label>
            <label class="check-label"><input id="show-dimensions" type="checkbox" .checked=${this._config.show_dimensions ?? false}
              @change=${(event: Event) => this.updateBase('show_dimensions', (event.target as HTMLInputElement).checked)} /> Technische Maße anzeigen</label>
          </div>
        </section>

        <section class="room-settings" aria-label="Räume und Sensoren">
          <label class="field" for="editor-house-side"><span>Hausseite konfigurieren</span>
            <select id="editor-house-side" .value=${this._editorSide} @change=${this.changeEditorSide}>
              <option value="rear">Rückansicht (bestehende Räume)</option>
              <option value="front">Vorderansicht (eigene Räume, gemeinsame Garage/Außen)</option>
            </select>
          </label>
          <p class="hint">Räume und Sensoren werden pro Hausseite getrennt gespeichert.
            Garage, Batterien, Schaltschrank und Außenmessorte verwenden dieselben Sensorquellen;
            auch ihre Desktop- und Handy-Kästchenpositionen sind auf beiden Hausseiten identisch.</p>
          <div class="section-heading"><span class="step">1</span><h2>Raum oder Messort</h2></div>
          <label class="field" for="room-select"><span>Raum auswählen</span>
            <select id="room-select" .value=${live(this._roomId)} @change=${this.changeRoom}>
              ${building.rooms.map((candidate) => html`<option value=${candidate.id} .selected=${candidate.id === this._roomId}>${candidate.name}${candidate.location === 'outdoor' ? ' · Außen' : ''}</option>`)}
            </select>
          </label>
          ${room ? html`
            <div class="room-name-row">
              <label class="field" for="room-name"><span>Anzeigename des Raums</span>
                <input id="room-name" type="text" .value=${room.name}
                  @change=${(event: Event) => this.apply(() => editRoom(this._config, room.id, { name: (event.target as HTMLInputElement).value }))} />
              </label>
              ${this._editorSide === 'front' && isSharedLocation(room) ? nothing
                : html`<button id="delete-room" type="button" class="text-button danger"
                  @click=${() => { this._confirmDelete = true; }}>Raum entfernen</button>`}
            </div>
            <p class="hint">${this._editorSide === 'front' && isSharedLocation(room)
              ? 'Gemeinsame Messstelle: Sensoren und Kästchenpositionen gelten auf beiden Hausseiten.'
              : room.location === 'outdoor' ? 'Außenmessort · eigener Bereich außerhalb des Hauses.' : `${room.level_id === 'garage' ? 'Garage · eigenständiger Klimamessort' : `${building.levels.find((level) => level.id === room.level_id)?.name ?? 'Weiterer Raum'} · ${room.visible ? 'im Gebäudeschnitt vorgesehen' : 'in der separaten Raumübersicht'}`}.`}</p>
            ${this._confirmDelete ? html`
              <div class="confirmation" role="alert">
                <strong>„${room.name}“ mit allen Sensorzuordnungen entfernen?</strong>
                <p>Die anderen Räume und ihre Sensoren bleiben erhalten.</p>
                <div class="button-row"><button id="cancel-delete-room" type="button" @click=${() => { this._confirmDelete = false; }}>Abbrechen</button>
                  <button id="confirm-delete-room" type="button" class="danger" @click=${() => this.deleteLocation(room)}>Entfernen bestätigen</button></div>
              </div>
            ` : nothing}

            ${this.renderPositionEditor(room)}
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
            <div class="measurement-options mobile-overview-setting">
              <label class="check-label"><input type="checkbox" id="mobile-metric-visible" data-mobile-metric=${this._metric}
                .checked=${isMobileOverviewEnabled(room, this._metric)}
                @change=${(event: Event) => this.apply(() => setMobileOverview(this._config, room.id,
                  this._metric, (event.target as HTMLInputElement).checked))} />
                Diesen Messwert im Handy-Kästchen anzeigen</label>
            </div>
            <p class="hint">Handy: Diese Messart insgesamt ein-/ausblenden. Zusätzlich kannst du bei jedem Sensor darunter einen eigenen Handy-Haken setzen. Beim Aktivieren einer Quelle wird die Messart fürs Handy automatisch aktiviert. Desktop und Details bleiben unabhängig.</p>
            <p class="hint">Mit „Haupt – in Übersicht“ können mehrere Quellen sichtbar sein. Gleiche Gruppennamen bündeln Werte unter einem gemeinsamen Namen, z. B. Temperatur und Feuchte von „Homematic“. Ohne Gruppe bleiben einzelne Hauptwerte schmal untereinander; mehrere Quellen derselben Messart erhalten ihren Anzeigenamen. „Standardquelle“ bestimmt die Hauptanzeige nur, solange der jeweilige Haupt-Haken nicht ausdrücklich gesetzt oder entfernt wurde. Alle Quellen bleiben in den Details erreichbar.</p>
            <div class="sensor-list">${measurement?.sensors.map((sensor, index) => this.renderSensor(room, sensor, index, measurement.primary))}</div>
            ${!measurement?.sensors.length ? html`<p class="empty-hint">Noch kein Sensor für diese Messart zugeordnet.</p>` : nothing}
            ${this._selectorAvailable ? html`
              <div class="add-sensor" data-picker-revision=${this._selectorRevision}>
                ${keyed(this._selectorRevision, html`<ha-selector id="new-sensor" .hass=${this.hass}
                  .selector=${{ entity: { filter: { domain: this._metric === 'condensation_risk' ? ['sensor', 'binary_sensor'] : 'sensor' } } }}
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
          <p class="hint">Neue Räume der Vorderansicht bekommen eigene Sensorzuordnungen. Garage und Außenmessorte
            werden nicht dupliziert. Der Keller gehört zur Rückansicht.</p>
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

  static styles = [iconStyles, readingStyles, photoStyles, editorStyles];
}

if (!customElements.get('hausklima-card-editor')) customElements.define('hausklima-card-editor', HausKlimaCardEditor);
