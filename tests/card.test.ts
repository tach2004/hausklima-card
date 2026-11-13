import { afterEach, describe, expect, it } from 'vitest';
import '../src/index';
import { HausKlimaCard } from '../src/hausklima-card';
import { getDefaultConfig } from '../src/config';
import { getDefaultBuilding } from '../src/defaults';
import type { HausKlimaCardEditor } from '../src/hausklima-card-editor';
import type { HausKlimaCardConfig, HomeAssistant } from '../src/types';

afterEach(() => document.body.replaceChildren());

async function createCard(config: HausKlimaCardConfig = getDefaultConfig(), hass?: HomeAssistant) {
  const card = document.createElement('hausklima-card') as HausKlimaCard;
  card.setConfig(config);
  if (hass) card.hass = hass;
  document.body.append(card);
  await card.updateComplete;
  return card;
}

function find<T extends Element>(card: HausKlimaCard, selector: string): T {
  const element = card.shadowRoot?.querySelector<T>(selector);
  if (!element) throw new Error(`Missing card element ${selector}`);
  return element;
}

describe('Lovelace card integration', () => {
  it('registers the custom card for Home Assistant discovery', () => {
    expect(customElements.get('hausklima-card')).toBe(HausKlimaCard);
    const registry = window as Window & { customCards?: { type: string; name: string; preview?: boolean }[] };
    expect(registry.customCards?.filter((entry) => entry.type === 'hausklima-card')).toEqual([
      expect.objectContaining({ name: 'HausKlima Card', preview: true }),
    ]);
  });

  it('accepts the stub configuration after Home Assistant supplies the card type', async () => {
    const stub = HausKlimaCard.getStubConfig();
    expect(stub).not.toHaveProperty('type');
    const card = await createCard({ ...stub, type: 'custom:hausklima-card' });
    expect(card.shadowRoot?.querySelector('ha-card')).not.toBeNull();
    expect(card.getCardSize()).toBeGreaterThan(0);
  });

  it('returns a functional visual editor through the Home Assistant API', async () => {
    const editor = await HausKlimaCard.getConfigElement() as HausKlimaCardEditor;
    expect(editor.tagName.toLowerCase()).toBe('hausklima-card-editor');
    editor.setConfig(getDefaultConfig());
    document.body.append(editor);
    await editor.updateComplete;
    expect(editor.shadowRoot?.querySelector('input[type="text"]')).not.toBeNull();
  });

  it('rejects invalid incoming configurations', () => {
    const card = document.createElement('hausklima-card') as HausKlimaCard;
    expect(() => card.setConfig(null)).toThrow();
    expect(() => card.setConfig({ type: 'custom:another-card' })).toThrow();
    expect(() => card.setConfig({ type: 'custom:hausklima-card', show_room_names: 'yes' })).toThrow();
  });

  it('shows nine selectable spaces without empty measurement placeholders', async () => {
    const card = await createCard();
    expect(card.shadowRoot?.querySelectorAll('svg [role="button"]')).toHaveLength(9);
    expect(card.shadowRoot?.querySelectorAll('.sensor-marker, .climate-summary, .reading, .room-values')).toHaveLength(0);
    expect(card.shadowRoot?.textContent).toContain('Noch keine Sensoren zugeordnet');

    const ridge = find<SVGPathElement>(card, '.ridge');
    expect(ridge.getAttribute('d')?.trim()).toMatch(/^M [\d.]+ [\d.]+ h [\d.]+$/);
  });

  it('opens room details by pointer and supports Enter and Space selection', async () => {
    const card = await createCard();
    const workshop = find<SVGGElement>(card, '[data-room-id="workshop"]');
    workshop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await card.updateComplete;
    expect(find(card, '.room-detail h2').textContent).toBe('Werkstatt');
    expect(workshop.getAttribute('aria-pressed')).toBe('true');

    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    workshop.dispatchEvent(enter);
    await card.updateComplete;
    expect(enter.defaultPrevented).toBe(true);
    expect(card.shadowRoot?.querySelector('.room-detail')).toBeNull();

    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    workshop.dispatchEvent(space);
    await card.updateComplete;
    expect(space.defaultPrevented).toBe(true);
    expect(find(card, '.room-detail h2').textContent).toBe('Werkstatt');
  });

  it('keeps hidden additional rooms reachable through the separate overview', async () => {
    const building = getDefaultBuilding();
    building.rooms.push({
      id: 'additional_room', name: 'Weiterer Raum', level_id: 'ground_floor',
      visible: false, width_m: null,
    });
    const card = await createCard({ ...getDefaultConfig(), building });
    expect(card.shadowRoot?.querySelector('[data-room-id="additional_room"]')).toBeNull();
    const button = find<HTMLButtonElement>(card, 'section[aria-label="Weitere Räume"] button');
    expect(button.textContent).toBe('Weiterer Raum');
    button.click();
    await card.updateComplete;
    expect(find(card, '.room-detail h2').textContent).toBe('Weiterer Raum');
  });

  it('keeps missing configured sensors visible and refreshes them when hass changes', async () => {
    const building = getDefaultBuilding();
    building.rooms[0]!.measurements = {
      temperature: { sensors: [{ entity: 'sensor.test_temperature', name: 'Testsensor' }] },
    };
    const card = await createCard({ ...getDefaultConfig(), building }, { states: {} });
    expect(find(card, '.climate-summary').textContent).toContain('Entität fehlt');
    expect(card.shadowRoot?.querySelector('.sensor-unavailable')).not.toBeNull();
    find<SVGGElement>(card, '[data-room-id="workshop"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await card.updateComplete;
    expect(find(card, '.room-detail').textContent).toContain('Entität fehlt');

    card.hass = {
      states: {
        'sensor.test_temperature': { state: '21.4', attributes: { unit_of_measurement: '°C' } },
      },
    };
    await card.updateComplete;
    expect(find(card, '.climate-summary').textContent).toContain('21.4 °C');
    expect(find(card, '.room-detail').textContent).toContain('21.4 °C');
    expect(card.shadowRoot?.querySelector('.sensor-available')).not.toBeNull();
    expect(card.shadowRoot?.querySelector('.sensor-unavailable')).toBeNull();

    let detail: unknown;
    card.addEventListener('hass-more-info', (event) => { detail = (event as CustomEvent).detail; });
    find<HTMLButtonElement>(card, '.sensor-row').click();
    expect(detail).toEqual({ entityId: 'sensor.test_temperature' });
  });

  it('updates the title and optional labels through setConfig', async () => {
    const card = await createCard();
    card.setConfig({ ...getDefaultConfig(), title: 'Mein Haus', show_room_names: false, show_dimensions: false });
    await card.updateComplete;
    expect(find(card, 'h1').textContent).toBe('Mein Haus');
    expect(card.shadowRoot?.querySelectorAll('.room-name, .room-width, .dimension-label')).toHaveLength(0);
    expect(card.shadowRoot?.querySelectorAll('svg [role="button"]')).toHaveLength(9);
  });
});
