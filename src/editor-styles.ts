import { css } from 'lit';

export const editorStyles = css`
  :host { display: block; color: var(--primary-text-color, #293d42); font-family: var(--paper-font-body1_-_font-family, inherit); }
  * { box-sizing: border-box; }
  .editor { display: grid; gap: 22px; padding: 4px 0 20px; }
  section { min-width: 0; }
  .base-settings { display: grid; gap: 12px; padding-bottom: 18px; border-bottom: 1px solid var(--divider-color, #dce4e5); }
  .field { display: grid; gap: 8px; font-size: 13px; font-weight: 500; min-width: 0; }
  .field small { font-size: 11px; color: var(--secondary-text-color, #687b81); font-weight: 400; }
  input[type='text'], select { width: 100%; min-width: 0; min-height: 46px; border: 1px solid var(--divider-color, #dce4e5); border-radius: 9px; padding: 10px 12px; background: var(--input-fill-color, var(--card-background-color, #fff)); color: inherit; font: inherit; }
  button, input, select { font: inherit; }
  .chip-opacity { gap: 10px; }
  .chip-opacity input[type='range'] { display: block; width: 100%; min-height: 44px; margin: 0; cursor: pointer; accent-color: var(--primary-color, #2b8279); touch-action: pan-y; }

  button { min-height: 44px; border: 1px solid var(--divider-color, #dce4e5); border-radius: 9px; padding: 9px 13px; background: var(--card-background-color, #fff); color: inherit; cursor: pointer; }
  input:focus-visible, button:focus-visible, select:focus-visible, summary:focus-visible { outline: 2px solid var(--primary-color, #2b8279); outline-offset: 3px; }
  .base-options, .measurement-options { display: flex; flex-wrap: wrap; gap: 4px 20px; }
  .measurement-options { margin-top: 8px; }
  .check-label, .radio-label { display: flex; gap: 9px; align-items: center; min-height: 44px; font-size: 13px; font-weight: 400; cursor: pointer; }
  input[type='checkbox'], input[type='radio'] { width: 21px; height: 21px; flex-shrink: 0; margin: 0; accent-color: var(--primary-color, #2b8279); }
  .section-heading { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; }
  .step { display: grid; place-items: center; width: 27px; height: 27px; border-radius: 50%; background: var(--secondary-background-color, #eef3f1); color: var(--primary-color, #2b8279); font-size: 12px; font-weight: 650; flex-shrink: 0; }
  h2 { margin: 0; font-size: 16px; font-weight: 600; }
  .room-name-row { display: flex; gap: 12px; align-items: end; margin-top: 16px; }
  .room-name-row .field { flex: 1; }
  .hint, .empty-hint, .selector-note { color: var(--secondary-text-color, #687b81); font-size: 12px; line-height: 1.6; margin: 10px 0 0; overflow-wrap: anywhere; }
  .empty-hint { border-radius: 10px; padding: 16px; background: var(--secondary-background-color, #f1f5f4); margin-top: 14px; }
  .metric-heading { margin-top: 26px; }
  .text-button { background: transparent; border-color: transparent; padding-left: 8px; padding-right: 8px; font-size: 12px; }
  .danger { color: var(--error-color, #b04336); }
  .sensor-list { display: grid; gap: 12px; margin-top: 16px; }
  .sensor-entry { display: grid; gap: 12px; border: 1px solid var(--divider-color, #dce4e5); border-radius: 12px; padding: 14px; min-width: 0; }
  .sensor-topline { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; font-weight: 600; }
  .sensor-status { font-weight: 400; color: var(--secondary-text-color, #687b81); }
  .sensor-actions { display: flex; justify-content: space-between; gap: 12px; }
  ha-selector { display: block; min-width: 0; width: 100%; }
  .add-sensor { margin-top: 16px; }
  .confirmation, .error { border: 1px solid color-mix(in srgb, var(--error-color, #b04336) 35%, transparent); border-radius: 10px; background: color-mix(in srgb, var(--error-color, #b04336) 6%, var(--card-background-color, #fff)); padding: 14px; font-size: 13px; line-height: 1.6; margin-top: 12px; }
  .confirmation p { margin: 7px 0 12px; color: var(--secondary-text-color, #687b81); font-size: 12px; }
  .button-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .error { margin: 0; color: var(--error-color, #b04336); }
  .new-room-settings { border-top: 1px solid var(--divider-color, #dce4e5); padding-top: 18px; }
  summary { min-height: 44px; display: list-item; cursor: pointer; font-size: 14px; font-weight: 600; line-height: 44px; }
  .new-room-settings .field { margin-top: 14px; }
  .primary-button { background: var(--primary-color, #2b8279); color: var(--text-primary-color, #fff); border-color: transparent; margin-top: 18px; }
  @media (max-width: 420px) {
    .room-name-row { align-items: stretch; flex-direction: column; gap: 4px; }
    .room-name-row .text-button { align-self: flex-start; }
    .sensor-entry { padding: 12px; }
  }
`;
