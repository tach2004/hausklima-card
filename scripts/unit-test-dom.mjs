import { Window } from 'happy-dom';

// Playwright runs these pure TypeScript unit tests in Node; give Lit a fresh
// local DOM, without launching an externally accessible dev/test server.
const window = new Window({ url: 'http://localhost/' });
const keys = [
  'window', 'document', 'navigator', 'customElements', 'HTMLElement',
  'Element', 'Node', 'Event', 'CustomEvent', 'MouseEvent', 'PointerEvent',
  'KeyboardEvent', 'FocusEvent', 'ShadowRoot', 'Document', 'DocumentFragment',
  'HTMLInputElement', 'HTMLSelectElement', 'HTMLButtonElement', 'HTMLImageElement',
  'MutationObserver', 'ResizeObserver', 'CSSStyleSheet', 'DOMParser',
  'XMLSerializer', 'getComputedStyle', 'File', 'Image', 'SVGElement',
  'SVGSVGElement', 'DOMRect', 'DOMException', 'location', 'performance',
];
for (const key of keys) {
  const value = key === 'window' ? window : window[key];
  if (value !== undefined) {
    Object.defineProperty(globalThis, key, {
      configurable: true, writable: true,
      value: typeof value === 'function' && key === 'getComputedStyle' ? value.bind(window) : value,
    });
  }
}
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
