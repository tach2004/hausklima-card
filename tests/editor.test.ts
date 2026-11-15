import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDefaultConfig } from '../src/config';
import { getDefaultBuilding } from '../src/defaults';
import '../src/hausklima-card-editor';
import type { HausKlimaCardEditor } from '../src/hausklima-card-editor';
import { METRIC_TYPES } from '../src/types';
import type { HausKlimaCardConfig } from '../src/types';

afterEach(() => {
  document.body.replaceChildren();
});

async function createEditor(config: HausKlimaCardConfig = getDefaultConfig()) {
  const editor = document.createElement('hausklima-card-editor') as HausKlimaCardEditor;
  editor.setConfig(config);
  document.body.append(editor);
  await editor.updateComplete;
  return editor;
}

function input(editor: HausKlimaCardEditor, id: string): HTMLInputElement {
  const element = editor.shadowRoot?.querySelector<HTMLInputElement>(`#${id}`);
  if (!element) throw new Error(`Missing editor input ${id}`);
  return element;
}

describe('Lovelace editor', () => {
  it('renders supplied base configuration without firing a change event', async () => {
    const editor = document.createElement('hausklima-card-editor') as HausKlimaCardEditor;
    const events: Event[] = [];
    editor.addEventListener('config-changed', (event) => events.push(event));
    editor.setConfig({
      type: 'custom:hausklima-card',
      title: 'Mein Haus',
      show_dimensions: false,
      show_room_names: true,
    });
    document.body.append(editor);
    await editor.updateComplete;

    expect(input(editor, 'title').value).toBe('Mein Haus');
    expect(input(editor, 'show-dimensions').checked).toBe(false);
    expect(input(editor, 'show-room-names').checked).toBe(true);
    expect(events).toHaveLength(0);
  });

  it('emits bubbling, composed config-changed events and preserves building data', async () => {
    const building = getDefaultBuilding();
    const config: HausKlimaCardConfig = {
      ...getDefaultConfig(),
      building,
      grid_options: { columns: 12, rows: 5 },
    };
    const original = structuredClone(config);
    const editor = await createEditor(config);
    const changes: CustomEvent<{ config: HausKlimaCardConfig }>[] = [];
    const onChange = (event: Event) => changes.push(event as CustomEvent<{ config: HausKlimaCardConfig }>);
    document.body.addEventListener('config-changed', onChange);

    try {
      const title = input(editor, 'title');
      title.value = 'Wohnen';
      title.dispatchEvent(new Event('change', { bubbles: true }));
      await editor.updateComplete;

      const dimensions = input(editor, 'show-dimensions');
      dimensions.checked = false;
      dimensions.dispatchEvent(new Event('change', { bubbles: true }));
      await editor.updateComplete;

      const roomNames = input(editor, 'show-room-names');
      roomNames.checked = false;
      roomNames.dispatchEvent(new Event('change', { bubbles: true }));
      await editor.updateComplete;

      expect(changes).toHaveLength(3);
      expect(changes[0]?.bubbles).toBe(true);
      expect(changes[0]?.composed).toBe(true);
      expect(changes[2]?.detail.config).toEqual({
        ...original,
        title: 'Wohnen',
        show_dimensions: false,
        show_room_names: false,
      });
      expect(config).toEqual(original);
    } finally {
      document.body.removeEventListener('config-changed', onChange);
    }
  });

  it('persists independent phone metric switches and photo font sizes', async () => {
    const building = getDefaultBuilding();
    const editor = await createEditor({ ...getDefaultConfig(), building });
    const changes: HausKlimaCardConfig[] = [];
    editor.addEventListener('config-changed', (event) => changes.push((event as CustomEvent<{config:HausKlimaCardConfig}>).detail.config));
    const roomSelect = editor.shadowRoot!.querySelector<HTMLSelectElement>('#room-select')!;
    roomSelect.value = 'laundry'; roomSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;
    const phone = input(editor, 'mobile-metric-visible');
    phone.checked = false; phone.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;
    const latestConfig = () => changes[changes.length - 1]!;
    expect(latestConfig().building!.rooms.find((room) => room.id === 'laundry')!.mobile_overview?.temperature).toBe(false);
    const metricSelect = editor.shadowRoot!.querySelector<HTMLSelectElement>('#metric-select')!;
    metricSelect.value = 'relative_humidity'; metricSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;
    expect(input(editor, 'mobile-metric-visible').checked).toBe(true);
    const fontMobile = input(editor, 'badge-font-mobile');
    expect(fontMobile.min).toBe('5');
    expect(fontMobile.step).toBe('0.5');
    fontMobile.value = '5.5'; fontMobile.dispatchEvent(new Event('change', { bubbles: true }));
    const fontDesktop = input(editor, 'badge-font-desktop');
    fontDesktop.value = '14'; fontDesktop.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;
    expect(latestConfig().badge_font_mobile).toBe(5.5);
    expect(latestConfig().badge_font_desktop).toBe(14);
    const restored = await createEditor(latestConfig());
    expect(input(restored, 'badge-font-mobile').value).toBe('5.5');
    expect(latestConfig().building!.rooms.find((room) => room.id === 'laundry')!.mobile_overview?.temperature).toBe(false);
  });

  it('shows a phone checkbox for all seven types, persists opt-ins and updates position previews', async () => {
    const building = getDefaultBuilding();
    const laundry = building.rooms.find((room) => room.id === 'laundry')!;
    laundry.measurements = {};
    for (const type of METRIC_TYPES) laundry.measurements[type] = { sensors: [{ entity: `sensor.test_${type}` }] };
    const original = { ...getDefaultConfig(), building };
    const editor = await createEditor(original);
    const events: HausKlimaCardConfig[] = [];
    editor.addEventListener('config-changed', (event) => events.push((event as CustomEvent<{ config: HausKlimaCardConfig }>).detail.config));
    const roomSelect = editor.shadowRoot!.querySelector<HTMLSelectElement>('#room-select')!;
    roomSelect.value = 'laundry'; roomSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;
    const metricSelect = editor.shadowRoot!.querySelector<HTMLSelectElement>('#metric-select')!;
    for (const type of METRIC_TYPES) {
      metricSelect.value = type; metricSelect.dispatchEvent(new Event('change', { bubbles: true }));
      await editor.updateComplete;
      const checkbox = input(editor, 'mobile-metric-visible');
      expect(checkbox.dataset.mobileMetric).toBe(type);
      expect(checkbox.checked).toBe(type === 'temperature' || type === 'relative_humidity');
      if (type !== 'temperature' && type !== 'relative_humidity') {
        checkbox.checked = true; checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        await editor.updateComplete;
        expect(events[events.length - 1]!.building!.rooms.find((room) => room.id === 'laundry')!
          .mobile_overview?.[type]).toBe(true);
      }
    }
    // Mobile preview uses exactly the same enabled metrics as the photo badge.
    const device = editor.shadowRoot!.querySelector<HTMLSelectElement>('#position-device')!;
    device.value = 'mobile'; device.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;
    expect(editor.shadowRoot!.querySelectorAll('.position-marker .marker-reading')).toHaveLength(7);
    metricSelect.value = 'voc'; metricSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;
    const vocCheckbox = input(editor, 'mobile-metric-visible');
    expect(vocCheckbox.checked).toBe(true);
    vocCheckbox.checked = false; vocCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;
    expect(editor.shadowRoot!.querySelectorAll('.position-marker .marker-reading')).toHaveLength(6);
    const saved = events[events.length - 1]!;
    expect(saved.building!.rooms.find((room) => room.id === 'laundry')!.mobile_overview?.co2).toBe(true);
    expect(saved.building!.rooms.find((room) => room.id === 'laundry')!.mobile_overview?.voc).toBe(false);
    expect(original.building.rooms.find((room) => room.id === 'laundry')!.mobile_overview).toBeUndefined();
    const restored = await createEditor(saved);
    const restoredRoom = restored.shadowRoot!.querySelector<HTMLSelectElement>('#room-select')!;
    restoredRoom.value = 'laundry'; restoredRoom.dispatchEvent(new Event('change', { bubbles: true }));
    const restoredType = restored.shadowRoot!.querySelector<HTMLSelectElement>('#metric-select')!;
    restoredType.value = 'co2'; restoredType.dispatchEvent(new Event('change', { bubbles: true }));
    await restored.updateComplete;
    expect(input(restored, 'mobile-metric-visible').checked).toBe(true);
  });

  it('edits the selected overlay position using keyboard arrows and preserves other device', async () => {
    const editor = await createEditor();
    const events: HausKlimaCardConfig[] = [];
    editor.addEventListener('config-changed', (event) => events.push((event as CustomEvent<{ config: HausKlimaCardConfig }>).detail.config));
    const select = editor.shadowRoot!.querySelector<HTMLSelectElement>('#room-select')!;
    select.value = 'laundry'; select.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;
    expect(editor.shadowRoot!.querySelector('#position-marker')).not.toBeNull();
    const mode = editor.shadowRoot!.querySelector<HTMLSelectElement>('#position-device')!;
    mode.value = 'mobile'; mode.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;
    const marker = editor.shadowRoot!.querySelector<HTMLButtonElement>('#position-marker')!;
    marker.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await editor.updateComplete;
    const saved = events[events.length - 1]!;
    expect(saved.badge_positions?.laundry?.mobile).toEqual({ x: 60, y: 78 });
    expect(saved.badge_positions?.laundry?.desktop).toBeUndefined();
    mode.value = 'desktop'; mode.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;
    editor.shadowRoot!.querySelector<HTMLButtonElement>('#position-marker')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, shiftKey: true }));
    await editor.updateComplete;
    expect(events[events.length - 1]!.badge_positions?.laundry?.desktop?.y).toBe(80);
    expect(events[events.length - 1]!.badge_positions?.laundry?.mobile).toEqual({ x: 60, y: 78 });
    editor.shadowRoot!.querySelector<HTMLButtonElement>('#position-reset')!.click();
    await editor.updateComplete;
    expect(events[events.length - 1]!.badge_positions?.laundry?.desktop).toBeUndefined();
    expect(events[events.length - 1]!.badge_positions?.laundry?.mobile).toEqual({ x: 60, y: 78 });
  });

  it('edits and persists auto/light/dark with config-changed', async () => {
    const editor = await createEditor();
    const configs = capture(editor);
    const picker = element<HTMLSelectElement>(editor, '#theme-mode');
    expect(picker.value).toBe('auto');
    for (const mode of ['dark', 'light', 'auto']) {
      picker.value = mode;
      picker.dispatchEvent(new Event('change', { bubbles: true }));
      await editor.updateComplete;
      expect(latest(configs).theme_mode).toBe(mode);
      expect(element<HTMLSelectElement>(editor, '#theme-mode').value).toBe(mode);
    }
    const reloaded = await createEditor(latest(configs));
    expect(element<HTMLSelectElement>(reloaded, '#theme-mode').value).toBe('auto');
  });

  it('validates incoming configurations', async () => {
    const editor = await createEditor();
    expect(() => editor.setConfig({ type: 'custom:another-card' })).toThrow();
    expect(() => editor.setConfig({ type: 'custom:hausklima-card', show_dimensions: 'yes' })).toThrow();
  });
});

// DEMO-WERTE: synthetic entity IDs and states used only in these editor tests.
class NativeSelectorStub extends HTMLElement {
  hass?: unknown;
  selector?: unknown;
  value?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}
if (!customElements.get('ha-selector')) customElements.define('ha-selector', NativeSelectorStub);

function element<T extends Element>(editor: HausKlimaCardEditor, selector: string): T {
  const result = editor.shadowRoot?.querySelector<T>(selector);
  if (!result) throw new Error(`Missing editor element ${selector}`);
  return result;
}
function capture(editor: HausKlimaCardEditor) {
  const configs: HausKlimaCardConfig[] = [];
  editor.addEventListener('config-changed', (event) => configs.push((event as CustomEvent<{ config: HausKlimaCardConfig }>).detail.config));
  return configs;
}
async function change(editor: HausKlimaCardEditor, selector: string, value: string) {
  const control = element<HTMLInputElement | HTMLSelectElement>(editor, selector);
  control.value = value;
  control.dispatchEvent(new Event('change', { bubbles: true }));
  await editor.updateComplete;
}
async function pick(editor: HausKlimaCardEditor, entity: string, selector = '#new-sensor') {
  const picker = element<NativeSelectorStub>(editor, selector);
  // Native HA pickers update their selection before dispatching this event.
  picker.value = entity;
  picker.dispatchEvent(new CustomEvent('value-changed', {
    detail: { value: entity }, bubbles: true, composed: true,
  }));
  await editor.updateComplete;
}
async function click(editor: HausKlimaCardEditor, selector: string) {
  element<HTMLButtonElement>(editor, selector).click();
  await editor.updateComplete;
}
async function check(editor: HausKlimaCardEditor, selector: string, checked: boolean) {
  const control = element<HTMLInputElement>(editor, selector);
  control.checked = checked;
  control.dispatchEvent(new Event('change', { bubbles: true }));
  await editor.updateComplete;
}

function latest(configs: HausKlimaCardConfig[]) {
  const config = configs.at(-1);
  if (!config) throw new Error('Expected emitted configuration');
  return config;
}

describe('Phase 2 native sensor and room editor', () => {
  it('selects multiple overview sources, names shared groups and persists both pressure mappings', async () => {
    const editor = await createEditor();
    const configs = capture(editor);
    await pick(editor, 'sensor.test_homematic_temperature');
    await pick(editor, 'sensor.test_ecowitt_temperature');
    expect(element<HTMLInputElement>(editor, '[data-action="sensor-overview"][data-entity="sensor.test_homematic_temperature"]').checked).toBe(true);
    expect(element<HTMLInputElement>(editor, '[data-action="sensor-overview"][data-entity="sensor.test_ecowitt_temperature"]').checked).toBe(false);
    await check(editor, '[data-action="sensor-overview"][data-entity="sensor.test_ecowitt_temperature"]', true);
    await change(editor, '[data-action="sensor-group"][data-entity="sensor.test_homematic_temperature"]', 'Homematic');
    await change(editor, '[data-action="sensor-group"][data-entity="sensor.test_ecowitt_temperature"]', 'Ecowitt');
    for (const type of ['pressure_relative', 'pressure_absolute']) {
      await change(editor, '#metric-select', type);
      await pick(editor, `sensor.test_${type}`);
      await change(editor, `[data-action="sensor-group"][data-entity="sensor.test_${type}"]`, 'Ecowitt');
    }
    const saved = JSON.parse(JSON.stringify(latest(configs))) as HausKlimaCardConfig;
    const reloaded = await createEditor(saved);
    const afterReload = capture(reloaded);
    expect(reloaded.shadowRoot?.textContent).toContain('Standardquelle');
    expect(reloaded.shadowRoot?.textContent).toContain('Gruppe in der Übersicht');
    expect(element<HTMLInputElement>(reloaded, '[data-action="sensor-overview"][data-entity="sensor.test_ecowitt_temperature"]').checked).toBe(true);
    expect(element<HTMLInputElement>(reloaded, '[data-action="sensor-group"][data-entity="sensor.test_ecowitt_temperature"]').value).toBe('Ecowitt');
    await check(reloaded, '[data-action="sensor-overview"][data-entity="sensor.test_homematic_temperature"]', false);
    expect(latest(afterReload).building!.rooms[0]!.measurements!.temperature!.sensors[0]).toMatchObject({ show_in_overview: false, overview_group: 'Homematic' });
    expect(latest(afterReload).building!.rooms[0]!.measurements!.temperature!.primary).toBe('sensor.test_homematic_temperature');
    expect(saved.building!.rooms[0]!.measurements!.temperature!.sensors[0]!.show_in_overview).toBeUndefined();
    for (const type of ['pressure_relative', 'pressure_absolute'] as const) {
      await change(reloaded, '#metric-select', type);
      expect(element<HTMLInputElement>(reloaded, `[data-action="sensor-group"][data-entity="sensor.test_${type}"]`).value).toBe('Ecowitt');
    }
  });

  it('uses the HA selector contract and can add unlimited sources, select primary and remove it safely', async () => {
    const editor = await createEditor();
    editor.hass = { states: {} };
    await editor.updateComplete;
    const configs = capture(editor);
    const selector = element<NativeSelectorStub>(editor, '#new-sensor');
    expect(selector.selector).toEqual({ entity: { filter: { domain: 'sensor' } } });
    expect(selector.hass).toBe(editor.hass);
    expect(selector.required).toBe(false);
    await pick(editor, 'sensor.test_first');
    await pick(editor, 'sensor.test_second');
    await pick(editor, 'sensor.test_third');
    expect(latest(configs).building?.rooms[0]?.measurements?.temperature?.sensors).toHaveLength(3);
    expect(element<NativeSelectorStub>(editor, '#new-sensor')).not.toBe(selector);
    expect(element<NativeSelectorStub>(editor, '[data-sensor-entity="sensor.test_first"]').value).toBe('sensor.test_first');

    await change(editor, '[data-action="sensor-name"][data-entity="sensor.test_second"]', 'Zweite Quelle');
    await check(editor, '[data-action="sensor-primary"][data-entity="sensor.test_second"]', true);
    let metric = latest(configs).building?.rooms[0]?.measurements?.temperature;
    expect(metric?.primary).toBe('sensor.test_second');
    expect(metric?.sensors[1]?.name).toBe('Zweite Quelle');
    await click(editor, '[data-action="remove-sensor"][data-entity="sensor.test_second"]');
    metric = latest(configs).building?.rooms[0]?.measurements?.temperature;
    expect(metric?.primary).toBe('sensor.test_first');
    expect(metric?.sensors.map((sensor) => sensor.entity)).toEqual(['sensor.test_first', 'sensor.test_third']);
  });

  it('rejects duplicate or malformed picker values without emitting invalid changes', async () => {
    const editor = await createEditor();
    const configs = capture(editor);
    await pick(editor, 'sensor.test_first');
    const previous = structuredClone(latest(configs));
    await pick(editor, 'sensor.test_first');
    expect(configs).toHaveLength(1);
    expect(element(editor, '[role="alert"]').textContent).toContain('doppelte Entity-ID');
    await pick(editor, 'broken identifier');
    expect(configs).toHaveLength(1);
    expect(latest(configs)).toEqual(previous);
    await pick(editor, 'sensor.test_second');
    expect(editor.shadowRoot?.querySelector('.error')).toBeNull();
    const rejectedPicker = element<NativeSelectorStub>(editor, '[data-sensor-entity="sensor.test_second"]');
    await pick(editor, 'sensor.test_first', '[data-sensor-entity="sensor.test_second"]');
    expect(configs).toHaveLength(2);
    const restoredPicker = element<NativeSelectorStub>(editor, '[data-sensor-entity="sensor.test_second"]');
    expect(restoredPicker.value).toBe('sensor.test_second');
    expect(restoredPicker).not.toBe(rejectedPicker);
    expect(latest(configs).building?.rooms[0]?.measurements?.temperature?.sensors.map((sensor) => sensor.entity)).toEqual(['sensor.test_first', 'sensor.test_second']);
  });

  it('keeps all five mappings and independent visibility settings through a save and reload', async () => {
    const editor = await createEditor();
    const configs = capture(editor);
    for (const metric of ['temperature', 'relative_humidity', 'absolute_humidity', 'co2', 'voc']) {
      await change(editor, '#metric-select', metric);
      await pick(editor, `sensor.test_${metric}`);
    }
    await check(editor, '#metric-visible', false);
    await check(editor, '#metric-overview', true);
    const saved = JSON.parse(JSON.stringify(latest(configs))) as HausKlimaCardConfig;
    const reloaded = await createEditor(saved);
    await change(reloaded, '#metric-select', 'voc');
    expect(element<HTMLInputElement>(reloaded, '#metric-visible').checked).toBe(false);
    expect(element<HTMLInputElement>(reloaded, '#metric-overview').checked).toBe(true);
    expect(element<NativeSelectorStub>(reloaded, '[data-sensor-entity="sensor.test_voc"]').value).toBe('sensor.test_voc');
    expect(Object.keys(saved.building?.rooms[0]?.measurements ?? {})).toHaveLength(5);
  });

  it('selects garage without duplication and safely adds and removes outside and extra rooms', async () => {
    const editor = await createEditor();
    const configs = capture(editor);
    await change(editor, '#room-select', 'garage');
    await pick(editor, 'sensor.test_garage');
    expect(latest(configs).building?.rooms.filter((room) => room.id === 'garage')).toHaveLength(1);
    await change(editor, '#new-room-kind', 'outdoor');
    const roomName = element<HTMLInputElement>(editor, '#new-room-name');
    roomName.value = 'Garten';
    roomName.dispatchEvent(new Event('input', { bubbles: true }));
    await editor.updateComplete;
    await click(editor, '#add-room');
    let added = latest(configs).building?.rooms.at(-1);
    expect(added).toMatchObject({ name: 'Garten', location: 'outdoor', visible: false, width_m: null });
    expect(element<HTMLSelectElement>(editor, '#room-select').value).toBe(added?.id);
    await pick(editor, 'sensor.test_outdoor');
    const beforeDelete = configs.length;
    await click(editor, '#delete-room');
    expect(configs).toHaveLength(beforeDelete);
    expect(element(editor, '.confirmation').textContent).toContain('Garten');
    await click(editor, '#cancel-delete-room');
    expect(configs).toHaveLength(beforeDelete);
    await click(editor, '#delete-room');
    await click(editor, '#confirm-delete-room');
    expect(latest(configs).building?.rooms.some((room) => room.id === added?.id)).toBe(false);
    expect(latest(configs).building?.rooms.find((room) => room.id === 'garage')?.measurements?.temperature?.sensors).toHaveLength(1);

    await change(editor, '#new-room-kind', 'indoor');
    await change(editor, '#new-room-level', 'attic');
    const indoorName = element<HTMLInputElement>(editor, '#new-room-name');
    indoorName.value = 'Arbeitszimmer';
    indoorName.dispatchEvent(new Event('input', { bubbles: true }));
    await editor.updateComplete;
    await click(editor, '#add-room');
    added = latest(configs).building?.rooms.at(-1);
    expect(added).toMatchObject({ name: 'Arbeitszimmer', level_id: 'attic', visible: false, width_m: null });
  });

  it('validates room names and preserves nested unknown settings and original geometry on edits', async () => {
    const building = getDefaultBuilding();
    const decorated = building.rooms[0] as typeof building.rooms[0] & { future_style?: unknown };
    decorated.future_style = { color: 'warm' };
    const original = { ...getDefaultConfig(), building, future_option: { enabled: true }, grid_options: { columns: 'full' } };
    const editor = await createEditor(original);
    const configs = capture(editor);
    await change(editor, '#room-name', '');
    expect(configs).toHaveLength(0);
    expect(element(editor, '.error').textContent).toContain('Namen');
    await change(editor, '#room-name', 'Atelier');
    const updated = latest(configs);
    expect(updated.future_option).toEqual({ enabled: true });
    expect(updated.grid_options).toEqual({ columns: 'full' });
    expect(updated.building?.rooms[0]).toMatchObject({ id: 'workshop', name: 'Atelier', width_m: 4, future_style: { color: 'warm' } });
    expect(updated.building?.house).toEqual(building.house);
    expect(original.building.rooms[0]?.name).toBe('Werkstatt');
  });

  it('retains missing configured entities and updates selector hass without emitting changes', async () => {
    const building = getDefaultBuilding();
    building.rooms[0]!.measurements = { temperature: { sensors: [{ entity: 'sensor.test_missing' }] } };
    const editor = await createEditor({ ...getDefaultConfig(), building });
    const configs = capture(editor);
    expect(element<NativeSelectorStub>(editor, '[data-sensor-entity="sensor.test_missing"]').value).toBe('sensor.test_missing');
    expect(element(editor, '.sensor-status').textContent).toBe('Entität fehlt');
    editor.hass = { states: { 'sensor.test_missing': { state: 'unknown', attributes: {} } } };
    await editor.updateComplete;
    expect(element(editor, '.sensor-status').textContent).toBe('Unbekannt');
    expect(configs).toHaveLength(0);
  });
});


describe('Native HA selector loading', () => {
  it('loads the built-in editor dependency when the selector is not yet registered', async () => {
    const existingGet = customElements.get.bind(customElements);
    let loaded = false;
    const lookup = vi.spyOn(customElements, 'get').mockImplementation((tag) => tag === 'ha-selector' && !loaded ? undefined : existingGet(tag));
    const getConfigElement = vi.fn(async () => { loaded = true; return document.createElement('div'); });
    const createCardElement = vi.fn(() => ({ constructor: { getConfigElement } }));
    const loadCardHelpers = vi.fn(async () => ({ createCardElement }));
    Object.defineProperty(window, 'loadCardHelpers', { configurable: true, value: loadCardHelpers });
    try {
      const editor = await createEditor();
      await new Promise((resolve) => setTimeout(resolve, 0));
      await editor.updateComplete;
      expect(loadCardHelpers).toHaveBeenCalledOnce();
      expect(createCardElement).toHaveBeenCalledWith({ type: 'button' });
      expect(getConfigElement).toHaveBeenCalledOnce();
      expect(editor.shadowRoot?.querySelector('#new-sensor')).not.toBeNull();
    } finally {
      lookup.mockRestore();
      Reflect.deleteProperty(window, 'loadCardHelpers');
    }
  });
});


describe('scene width visual setting', () => {
  it('updates width immediately on input and preserves v0.1.1 mappings, names, opacity and unknown fields on reload', async () => {
    const building = getDefaultBuilding();
    building.rooms.find((room) => room.id === 'garage_battery_pylontech')!.name = 'Eigene Batterie';
    building.rooms[0]!.measurements = { temperature: {
      sensors: [{ entity: 'sensor.test_first', name: 'Quelle' }, { entity: 'sensor.test_second' }],
      primary: 'sensor.test_second', visible: true, show_in_overview: false,
    } };
    const original: HausKlimaCardConfig = { ...getDefaultConfig(), chip_opacity: 0.57, building,
      future_setting: { untouched: true }, grid_options: { columns: 'full', rows: 'auto' } };
    const before = structuredClone(original);
    const editor = await createEditor(original);
    const configs = capture(editor);
    const slider = input(editor, 'scene-max-width');
    expect(slider.type).toBe('range');
    expect([slider.min, slider.max, slider.step, slider.value]).toEqual(['900', '3200', '10', '1400']);
    slider.value = '3190';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    await editor.updateComplete;
    expect(configs).toHaveLength(1);
    expect(latest(configs)).toEqual({ ...before, scene_max_width: 3190 });
    expect(original).toEqual(before);
    expect(editor.shadowRoot?.textContent).toContain('3190 px');
    const reloaded = await createEditor(JSON.parse(JSON.stringify(latest(configs))) as HausKlimaCardConfig);
    expect(input(reloaded, 'scene-max-width').value).toBe('3190');
    expect(reloaded.shadowRoot?.textContent).toContain('3190 px');
  });
});


describe('text fields during live Home Assistant updates', () => {
  it('keeps room names, sensor aliases and grouping editable while hass changes', async () => {
    const building = getDefaultBuilding();
    const room = building.rooms.find((entry) => entry.id === 'workshop')!;
    room.measurements = { temperature: { sensors: [
      { entity: 'sensor.test_temperature', name: 'Alter Name', overview_group: 'Alte Gruppe' },
    ] } };
    const editor = await createEditor({ ...getDefaultConfig(), building });
    const updates = capture(editor);
    const roomField = input(editor, 'room-name');
    const aliasField = element<HTMLInputElement>(editor, '[data-action="sensor-name"][data-entity="sensor.test_temperature"]');
    const groupField = element<HTMLInputElement>(editor, '[data-action="sensor-group"][data-entity="sensor.test_temperature"]');

    // Home Assistant refreshes entity states during every keystroke. A draft
    // must not be overwritten with the previously saved value on each render.
    for (const field of [roomField, aliasField, groupField]) {
      field.value = '';
      editor.hass = { states: { 'sensor.test_temperature': { state: '21.3', attributes: {} } } };
      await editor.updateComplete;
      expect(field.value).toBe('');
    }

    roomField.value = 'Werkstatt Nord';
    roomField.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;
    aliasField.value = 'Neuer Sensorname';
    aliasField.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;
    groupField.value = 'Ecowitt';
    groupField.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;
    const savedRoom = latest(updates).building!.rooms.find((entry) => entry.id === 'workshop')!;
    expect(savedRoom.name).toBe('Werkstatt Nord');
    expect(savedRoom.measurements!.temperature!.sensors[0]).toMatchObject({
      name: 'Neuer Sensorname', overview_group: 'Ecowitt',
    });

    // Both optional fields are intentionally clearable (back to HA name / no group).
    aliasField.value = '';
    aliasField.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;
    groupField.value = '';
    groupField.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;
    const cleared = latest(updates).building!.rooms.find((entry) => entry.id === 'workshop')!
      .measurements!.temperature!.sensors[0]!;
    expect(cleared.name).toBeUndefined();
    expect(cleared.overview_group).toBeUndefined();
  });
});
