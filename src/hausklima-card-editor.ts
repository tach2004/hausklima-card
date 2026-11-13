import { LitElement, css, html } from 'lit';
import { getDefaultConfig, normalizeConfig } from './config';
import type { HausKlimaCardConfig, HomeAssistant } from './types';

/** Base Lovelace editor; room and sensor management follow in a later phase. */
export class HausKlimaCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  private _config: HausKlimaCardConfig = getDefaultConfig();

  setConfig(config: unknown): void {
    this._config = normalizeConfig(config);
  }

  private updateConfig(
    key: 'title' | 'show_dimensions' | 'show_room_names',
    value: string | boolean,
  ): void {
    const config = normalizeConfig({ ...this._config, [key]: value });
    this._config = config;
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected render() {
    return html`
      <div class="editor">
        <div class="intro">
          <span class="eyebrow">HausKlima Card</span>
          <h2>Darstellung</h2>
          <p>Die Hausansicht an dein Dashboard anpassen.</p>
        </div>

        <label class="title-field" for="title">
          <span>Titel</span>
          <input
            id="title"
            type="text"
            .value=${this._config.title ?? ''}
            @change=${(event: Event) =>
              this.updateConfig('title', (event.target as HTMLInputElement).value)}
          />
        </label>

        <fieldset>
          <legend>Hausansicht</legend>
          <label class="option" for="show-room-names">
            <span>
              <span class="option-title">Raumnamen anzeigen</span>
              <span class="description">Räume direkt in der Gebäudeansicht beschriften.</span>
            </span>
            <input
              id="show-room-names"
              type="checkbox"
              .checked=${this._config.show_room_names ?? true}
              @change=${(event: Event) =>
                this.updateConfig('show_room_names', (event.target as HTMLInputElement).checked)}
            />
          </label>
          <label class="option" for="show-dimensions">
            <span>
              <span class="option-title">Maße anzeigen</span>
              <span class="description">Bekannte Maße und den ungefähren Garagenabstand einblenden.</span>
            </span>
            <input
              id="show-dimensions"
              type="checkbox"
              .checked=${this._config.show_dimensions ?? true}
              @change=${(event: Event) =>
                this.updateConfig('show_dimensions', (event.target as HTMLInputElement).checked)}
            />
          </label>
        </fieldset>

        <aside aria-label="Entwicklungsstand">
          <strong>Phase 1 · Projektgrundlage</strong>
          <p>
            Gebäude und Räume bleiben bei diesen Änderungen erhalten. Die grafische
            Raum- und Sensorverwaltung folgt in einer späteren Phase.
          </p>
        </aside>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      color: var(--primary-text-color, #24353a);
      font-family: var(--paper-font-body1_-_font-family, inherit);
    }

    * {
      box-sizing: border-box;
    }

    .editor {
      display: grid;
      gap: 24px;
      padding: 8px 0 16px;
    }

    .eyebrow {
      color: var(--secondary-text-color, #687b81);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h2 {
      margin: 6px 0;
      font-size: 22px;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: var(--secondary-text-color, #687b81);
      font-size: 14px;
      line-height: 1.55;
    }

    .title-field {
      display: grid;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
    }

    input[type='text'] {
      width: 100%;
      min-height: 48px;
      border: 1px solid var(--divider-color, #dce4e5);
      border-radius: 10px;
      padding: 12px 14px;
      background: var(--input-fill-color, var(--card-background-color, #fff));
      color: var(--primary-text-color, #24353a);
      font: inherit;
    }

    input:focus-visible {
      outline: 2px solid var(--primary-color, #2b8279);
      outline-offset: 3px;
    }

    fieldset {
      min-width: 0;
      margin: 0;
      padding: 0;
      border: 0;
    }

    legend {
      margin-bottom: 6px;
      padding: 0;
      color: var(--secondary-text-color, #687b81);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .option {
      display: flex;
      gap: 20px;
      align-items: center;
      justify-content: space-between;
      min-height: 76px;
      padding: 14px 0;
      border-bottom: 1px solid var(--divider-color, #dce4e5);
      cursor: pointer;
    }

    .option-title,
    .description {
      display: block;
    }

    .option-title {
      font-size: 15px;
      font-weight: 500;
    }

    .description {
      margin-top: 5px;
      color: var(--secondary-text-color, #687b81);
      font-size: 13px;
      line-height: 1.4;
    }

    input[type='checkbox'] {
      flex: 0 0 auto;
      width: 22px;
      height: 22px;
      margin: 0 3px;
      accent-color: var(--primary-color, #2b8279);
      cursor: pointer;
    }

    aside {
      border-radius: 12px;
      padding: 16px;
      background: var(--secondary-background-color, #f1f5f4);
    }

    aside strong {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 600;
    }
  `;
}

if (!customElements.get('hausklima-card-editor')) {
  customElements.define('hausklima-card-editor', HausKlimaCardEditor);
}
