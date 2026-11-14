import { afterEach, describe, expect, it } from 'vitest';
import { nothing, render } from 'lit';
import { getDefaultBuilding } from '../src/defaults';
import { renderHouseScene } from '../src/house-scene';
import { createLayout } from '../src/layout';

const renderScene = (onSelect = (_room: unknown) => {}) => {
  const host = document.createElement('div');
  document.body.append(host);
  render(renderHouseScene(getDefaultBuilding(), {
    idPrefix: 'scene-test', showNames: true, showDimensions: false,
    onSelect, renderMetrics: () => nothing,
  }), host);
  return host;
};

afterEach(() => document.body.replaceChildren());

describe('architectural cutaway scene', () => {
  it('keeps the original house room extents and leaves the detached garage to its own component', () => {
    const host = renderScene();
    const shapes = createLayout(getDefaultBuilding()).shapes.filter((shape) => shape.level !== 'garage');
    expect(host.querySelectorAll('.room')).toHaveLength(8);
    expect(host.querySelector('[data-room-id="garage"]')).toBeNull();
    for (const shape of shapes) {
      const fill = host.querySelector(`[data-room-id="${shape.room.id}"] .room-fill`)!;
      expect(Number(fill.getAttribute('x'))).toBe(shape.x);
      expect(Number(fill.getAttribute('y'))).toBe(shape.y);
      expect(Number(fill.getAttribute('width'))).toBe(shape.width);
      expect(Number(fill.getAttribute('height'))).toBe(shape.height);
    }
    expect(host.querySelectorAll('image')).toHaveLength(0);
    expect(host.querySelector('.ridge')?.getAttribute('d')?.trim()).toMatch(/^M [\d.]+ [\d.]+ h [\d.]+$/);
  });

  it('makes every house room keyboard selectable and exposes its name', () => {
    let selected: unknown;
    const host = renderScene((room) => { selected = room; });
    const room = host.querySelector('[data-room-id="living_room"]')!;
    expect(room.getAttribute('role')).toBe('button');
    expect(room.getAttribute('tabindex')).toBe('0');
    expect(room.getAttribute('aria-label')).toBe('Wohnzimmer');
    room.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(selected).toMatchObject({ id: 'living_room' });
    selected = undefined;
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    room.dispatchEvent(space);
    expect(space.defaultPrevented).toBe(true);
    expect(selected).toMatchObject({ id: 'living_room' });
  });

  it('uses instance-specific SVG definitions so several cards remain independent', () => {
    const host = renderScene();
    const second = document.createElement('div');
    document.body.append(second);
    render(renderHouseScene(getDefaultBuilding(), {
      idPrefix: 'second-scene', selected: 'bedroom', showNames: false,
      showDimensions: true, onSelect: () => {}, renderMetrics: () => nothing,
    }), second);
    expect(second.querySelector('.room.selected')?.getAttribute('data-room-id')).toBe('bedroom');
    expect(second.querySelector('.room-name')).toBeNull();
    expect(second.querySelector('.dimension-label')).not.toBeNull();
    const firstIds = new Set([...host.querySelectorAll('[id]')].map((node) => node.id));
    expect([...second.querySelectorAll('[id]')].some((node) => firstIds.has(node.id))).toBe(false);
  });
});
