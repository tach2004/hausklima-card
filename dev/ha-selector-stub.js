/** DEMO-WERTE test harness only. Production uses Home Assistant's own ha-selector. */
export class DemoEntitySelector extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  set hass(value) { this._hass = value; this.render(); }
  get hass() { return this._hass; }
  set selector(value) { this._selector = value; this.render(); }
  get selector() { return this._selector; }
  set value(value) { this._value = value; this.render(); }
  get value() { return this._value; }
  set label(value) { this._label = value; this.render(); }
  get label() { return this._label; }
  set disabled(value) { this._disabled = value; this.render(); }
  connectedCallback() { this.render(); }
  render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = '<style>:host{display:block;min-width:0}select{width:100%;min-height:46px;border:1px solid var(--divider-color,#ccd5d3);border-radius:9px;padding:10px;background:var(--card-background-color,#fff);color:var(--primary-text-color,#293d42);font:inherit}</style>';
    const select = document.createElement('select');
    select.setAttribute('aria-label', this._label ?? this.getAttribute('aria-label') ?? 'Home-Assistant-Entität');
    select.disabled = !!this._disabled;
    const empty = document.createElement('option'); empty.value = ''; empty.textContent = 'Entität auswählen'; select.append(empty);
    const entities = new Set(Object.keys(this._hass?.states ?? {}));
    if (this._value) entities.add(this._value);
    for (const entity of entities) {
      const option = document.createElement('option'); option.value = entity;
      option.textContent = `${this._hass?.states[entity]?.attributes?.friendly_name ?? entity} (${entity})`;
      select.append(option);
    }
    select.value = this._value ?? '';
    select.addEventListener('change', () => {
      this._value = select.value || undefined;
      this.dispatchEvent(new CustomEvent('value-changed', { detail: { value: this._value }, bubbles: true, composed: true }));
    });
    this.shadowRoot.append(select);
  }
}
if (!customElements.get('ha-selector')) customElements.define('ha-selector', DemoEntitySelector);
