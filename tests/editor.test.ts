import { afterEach, describe, expect, it } from 'vitest';
import { getDefaultConfig } from '../src/config';
import { getDefaultBuilding } from '../src/defaults';
import '../src/hausklima-card-editor';
import type { HausKlimaCardEditor } from '../src/hausklima-card-editor';
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

  it('validates incoming configurations', async () => {
    const editor = await createEditor();
    expect(() => editor.setConfig({ type: 'custom:another-card' })).toThrow();
    expect(() => editor.setConfig({ type: 'custom:hausklima-card', show_dimensions: 'yes' })).toThrow();
  });
});
