import { css } from 'lit';

export const cardStyles = css`
  :host {
    display: block;
    --hk-ink: var(--primary-text-color, #293d42);
    --hk-muted: var(--secondary-text-color, #687d82);
    --hk-line: var(--divider-color, #dae4e4);
    --hk-paper: var(--ha-card-background, var(--card-background-color, #fff));
    --hk-accent: var(--primary-color, #26766b);
    color: var(--hk-ink);
    font-family: var(--paper-font-body1_-_font-family, system-ui, sans-serif);
  }
  * { box-sizing: border-box; }
  ha-card {
    display: block;
    overflow: hidden;
    background: var(--hk-paper);
    border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--hk-line));
    border-radius: var(--ha-card-border-radius, 20px);
    box-shadow: var(--ha-card-box-shadow, 0 4px 24px #1d444407);
  }
  header { padding: 28px 30px 18px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .eyebrow { color: var(--hk-muted); font-size: 10px; font-weight: 650; letter-spacing: .14em; }
  .brand-mark { font-size: 19px; color: var(--hk-accent); margin-right: 4px; }
  h1 { font-size: 27px; font-weight: 600; line-height: 1.3; letter-spacing: -.035em; margin: 10px 0 4px; }
  .subtitle { margin: 0; font-size: 13px; color: var(--hk-muted); }
  .view-badge { display: flex; align-items: center; gap: 7px; font-size: 11px; padding: 9px 12px; border: 1px solid var(--hk-line); border-radius: 20px; white-space: nowrap; }
  .view-badge span { width: 6px; height: 6px; background: var(--hk-accent); border-radius: 50%; }
  .building-meta { padding: 5px 30px 0; color: var(--hk-muted); font-size: 11px; display: flex; gap: 9px; }
  .dot { opacity: .65; }
  .drawing-scroll { overflow-x: auto; padding: 12px 14px 0; background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--hk-accent) 2%, transparent)); }
  .building { width: 100%; min-width: 670px; display: block; }
  .building text { fill: var(--hk-ink); font-family: inherit; pointer-events: none; }
  .building-caption { fill: var(--hk-muted) !important; font-size: 11px; letter-spacing: 2px; font-weight: 600; }
  .floor-outline { stroke: color-mix(in srgb, var(--hk-ink) 55%, var(--hk-paper)); stroke-width: 3; fill: var(--hk-paper); }
  .room { cursor: pointer; outline: none; }
  .room-fill { fill: color-mix(in srgb, #86b5b2 15%, var(--hk-paper)); stroke: color-mix(in srgb, var(--hk-ink) 40%, var(--hk-paper)); stroke-width: 1.8; }
  .ground_floor .room-fill { fill: color-mix(in srgb, #adb99b 15%, var(--hk-paper)); }
  .attic .room-fill { fill: color-mix(in srgb, #d7c5a6 19%, var(--hk-paper)); }
  .garage .room-fill { fill: color-mix(in srgb, #a5b2c1 13%, var(--hk-paper)); }
  .room:hover .room-fill, .room:focus-visible .room-fill, .room.selected .room-fill { fill: color-mix(in srgb, var(--hk-accent) 19%, var(--hk-paper)); stroke: var(--hk-accent); stroke-width: 3; }
  .room-name { font-size: 13px; font-weight: 550; }
  .room-width { fill: var(--hk-muted) !important; font-size: 11px; }
  .level-label { fill: var(--hk-muted) !important; font-size: 11px; font-weight: 600; }
  .roof-plane { fill: color-mix(in srgb, var(--hk-ink) 16%, var(--hk-paper)); stroke: var(--hk-muted); stroke-width: 1.5; }
  .ridge { stroke: var(--hk-ink); stroke-width: 3; fill: none; }
  .cutaway-line { stroke: var(--hk-muted); stroke-width: 1; stroke-dasharray: 5 5; opacity: .55; pointer-events: none; }
  .cutaway-caption { fill: var(--hk-muted) !important; font-size: 8px; letter-spacing: 1.2px; }
  .dimension-line, .gap-line { stroke: var(--hk-muted); stroke-width: 1; fill: none; opacity: .6; }
  .gap-line { stroke-dasharray: 4 4; }
  .dimension-label { fill: var(--hk-muted) !important; font-size: 10px; }
  .ground-line { fill: none; stroke: var(--hk-muted); stroke-width: 1; opacity: .4; pointer-events: none; }
  .hatch-line { stroke: var(--hk-muted); stroke-width: 1; opacity: .3; }
  .sensor-available { fill: var(--hk-accent); }
  .sensor-unavailable { fill: var(--warning-color, #bd7e28); }
  .drawing-note { display: flex; align-items: center; gap: 8px; padding: 4px 30px 22px; color: var(--hk-muted); font-size: 10px; line-height: 1.5; background: color-mix(in srgb, var(--hk-accent) 2%, transparent); }
  .hatch-key { width: 13px; height: 13px; flex-shrink: 0; border: 1px solid var(--hk-line); background: repeating-linear-gradient(125deg, transparent, transparent 3px, var(--hk-line) 3px, var(--hk-line) 4px); }
  footer { border-top: 1px solid var(--hk-line); padding: 16px 30px; font-size: 11px; line-height: 1.6; color: var(--hk-muted); display: flex; align-items: center; gap: 9px; }
  .status-dot { width: 6px; height: 6px; background: var(--hk-muted); border-radius: 50%; flex-shrink: 0; opacity: .5; }
  button { color: inherit; font: inherit; cursor: pointer; }
  button:focus-visible, .drawing-scroll:focus-visible { outline: 2px solid var(--hk-accent); outline-offset: -3px; }
  .room-detail, .other-rooms { padding: 22px 30px; border-top: 1px solid var(--hk-line); }
  .room-detail p { margin: 12px 0 0; font-size: 13px; color: var(--hk-muted); }
  h2 { font-size: 17px; font-weight: 600; margin: 5px 0; }
  .detail-header { display: flex; align-items: center; justify-content: space-between; }
  .close-detail { border: 0; background: transparent; padding: 4px 10px; font-size: 26px; color: var(--hk-muted); }
  .room-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .room-list button { border: 1px solid var(--hk-line); border-radius: 10px; background: var(--hk-paper); padding: 9px 13px; }
  .climate-summary { padding: 16px 24px; border-top: 1px solid var(--hk-line); display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 9px; }
  .summary-room { display: flex; flex-direction: column; align-items: flex-start; gap: 9px; padding: 12px; border: 1px solid var(--hk-line); border-radius: 12px; background: transparent; text-align: left; font-size: 12px; }
  .room-values { display: flex; gap: 7px; flex-wrap: wrap; }
  .reading { font-size: 14px; font-weight: 600; }
  .unavailable { color: var(--warning-color, #a36e1f); }
  .metric-list { display: grid; gap: 16px; margin-top: 20px; }
  .metric-group h3 { color: var(--hk-muted); font-size: 11px; font-weight: 500; margin: 0 0 7px; }
  .sensor-row { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; text-align: left; background: transparent; border: none; border-top: 1px solid var(--hk-line); padding: 10px 0; font-size: 13px; }
  .sensor-row small { display: block; color: var(--hk-muted); font-size: 10px; margin-top: 3px; }
  @media (max-width: 600px) {
    header { padding: 22px 20px 16px; align-items: flex-start; }
    h1 { font-size: 23px; }
    .view-badge { font-size: 0; padding: 10px; gap: 0; margin-top: 8px; }
    .building-meta { padding-left: 20px; font-size: 10px; }
    .drawing-scroll { padding-left: 0; padding-right: 0; }
    .drawing-note { padding-left: 20px; padding-right: 20px; }
    footer, .room-detail, .other-rooms { padding-left: 20px; padding-right: 20px; }
  }
`;
