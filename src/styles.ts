import { css } from 'lit';

export const cardStyles = css`
  :host {
    display: block;
    --hk-ink: var(--primary-text-color, #303d34);
    --hk-muted: var(--secondary-text-color, #727d71);
    --hk-line: var(--divider-color, #e2e6db);
    --hk-paper: var(--ha-card-background, var(--card-background-color, #fffdf8));
    --hk-accent: var(--primary-color, #527652);
    --hk-chip: rgba(22, 26, 30, .82);
    color: var(--hk-ink);
    font-family: var(--paper-font-body1_-_font-family, system-ui, sans-serif);
  }
  * { box-sizing: border-box; }
  ha-card {
    display: block;
    container: hausklima / inline-size;
    overflow: clip;
    min-width: 0;
    background: var(--hk-paper);
    border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--hk-line));
    border-radius: var(--ha-card-border-radius, 22px);
    box-shadow: var(--ha-card-box-shadow, 0 5px 30px #283b2208);
  }
  button { color: inherit; font: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
  button:focus-visible, summary:focus-visible { outline: 3px solid var(--hk-accent); outline-offset: 3px; }
  button, select, summary { touch-action: manipulation; }
  .card-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 24px 4px; }
  .card-title { display: flex; gap: 9px; align-items: center; min-width: 0; }
  h1 { margin: 0; font-size: 20px; line-height: 1.3; font-weight: 650; letter-spacing: -.04em; overflow-wrap: anywhere; }
  .home-icon { color: var(--hk-accent); font-size: 25px; }
  .overview-toggle { display: flex; gap: 9px; align-items: center; min-height: 44px; padding: 8px 12px; border: 1px solid var(--hk-line); border-radius: 12px; background: transparent; font-size: 12px; }
  .overview-toggle span { color: var(--hk-muted); font-size: 11px; }
  .main-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(230px, 27%); gap: 18px; padding: 8px 22px 22px; align-items: start; }
  .house-column { min-width: 0; }
  .house-drawing { min-width: 0; padding-top: 4px; background: radial-gradient(ellipse at 50% 50%, color-mix(in srgb, #dcbf87 10%, transparent), transparent 72%); }
  .building { display: block; width: 100%; height: auto; overflow: visible; }
  .compact-room-number { display: none; }
  .metric-panel-bg { fill: var(--hk-chip); stroke: #ffffff25; stroke-width: .7; }
  .metric-panel { pointer-events: none; }
  .metric-panel text { fill: #fff; font-family: inherit; }
  .chip-symbol { font-size: 8px; font-weight: 700; }
  .chip-symbol.temperature { fill: #ffc095; }
  .chip-symbol.relative_humidity { fill: #8dd6ee; }
  .chip-symbol.absolute_humidity { fill: #9bdad0; }
  .chip-symbol.co2 { fill: #b5d998; }
  .chip-symbol.voc { fill: #d7c0f0; }
  .chip-value { font-size: 15px; font-weight: 700; letter-spacing: -.25px; }
  .chip-unit { font-size: 9px; font-weight: 500; letter-spacing: 0; }
  .chip-status { font-size: 10px; letter-spacing: 0; }
  .chip-more { font-size: 8px; fill: #dce5e2 !important; }
  .compact-sensor-marker circle { fill: #2c4f3e; stroke: #f4efdf; stroke-width: 2; }
  .location-column { display: grid; gap: 16px; min-width: 0; padding-top: 22px; }
  .location-block { border: 1px solid var(--hk-line); border-radius: 18px; padding: 15px; min-width: 0; background: color-mix(in srgb, var(--hk-paper) 95%, #b9c5ac); }
  .location-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; min-height: 44px; border: 0; padding: 0 0 8px; background: transparent; text-align: left; font-size: 15px; font-weight: 650; }
  .location-heading > span:first-child { display: flex; align-items: center; gap: 9px; overflow-wrap: anywhere; }
  .location-heading > span:last-child { color: var(--hk-muted); font-size: 16px; }
  .location-icon { font-size: 21px; font-weight: 500; color: var(--hk-accent); }
  .outdoor-icon { color: #b28942; }
  .garage-picture { position: relative; display: block; width: 100%; border: none; background: transparent; padding: 0; min-height: 160px; }
  .garage-graphic { display: block; width: 100%; height: auto; }
  .garage-readings { position: absolute; left: 24%; right: 18%; bottom: 18%; border-radius: 10px; padding: 9px 11px; background: var(--hk-chip); color: #fff; pointer-events: none; }
  .garage-readings .empty-reading { color: #e4e9e6; font-size: 11px; }
  .location-caption { font-size: 10px; color: var(--hk-muted); text-align: center; margin: 5px 0 0; line-height: 1.5; }
  .room-readings { display: flex; gap: 6px 15px; flex-wrap: wrap; }
  .room-readings.compact { display: grid; gap: 5px; }
  .reading { display: flex; align-items: baseline; gap: 4px; min-width: 0; max-width: 100%; flex-wrap: wrap; }
  .reading strong { max-width: 100%; overflow-wrap: anywhere; font-size: 22px; line-height: 1.25; font-weight: 650; letter-spacing: -.04em; }
  .reading-icon { display: inline-flex; width: 16px; justify-content: center; flex-shrink: 0; align-self: center; color: #ffc095; font-size: 9px; font-weight: 700; }
  .reading-icon.relative_humidity { color: #8dd6ee; }
  .reading-icon.absolute_humidity { color: #9bdad0; }
  .reading-icon.co2 { color: #b5d998; }
  .reading-icon.voc { color: #d7c0f0; }
  .reading-unit { max-width: 100%; overflow-wrap: anywhere; font-size: 11px; color: #e0e5e3; }
  .reading .reading-status { font-size: 12px; letter-spacing: 0; overflow-wrap: anywhere; }
  .compact .reading strong { font-size: 17px; }
  .compact .reading-unit { font-size: 10px; }
  .empty-reading { font-size: 12px; font-weight: 400; color: #d5ddda; line-height: 1.5; }
  .section-title { display: flex; align-items: baseline; gap: 12px; justify-content: space-between; margin-bottom: 12px; }
  h2 { font-size: 17px; letter-spacing: -.03em; font-weight: 650; margin: 0; }
  .section-title > span { font-size: 10px; color: var(--hk-muted); line-height: 1.5; text-align: right; }
  .rooms-section { display: none; padding: 14px 3px 0; }
  .rooms-section.expanded { display: block; }
  .room-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(165px, 100%), 1fr)); gap: 10px; }
  .room-tile { display: flex; flex-direction: column; gap: 11px; min-width: 0; min-height: 112px; text-align: left; border: 1px solid #ffffff1a; border-radius: 13px; background: var(--hk-chip); color: #fff; padding: 13px; }
  .room-tile[aria-pressed='true'] { outline: 2px solid var(--hk-accent); outline-offset: 2px; }
  .tile-heading { display: flex; gap: 7px; align-items: baseline; width: 100%; font-size: 12px; font-weight: 600; }
  .tile-heading > span:nth-last-child(2) { overflow-wrap: anywhere; }
  .room-number { font-size: 9px; color: #c7d6c9; letter-spacing: .04em; }
  .arrow-icon { width: 13px; height: 13px; display: inline-block; vertical-align: middle; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
  .tile-arrow { color: #b7c4ba; margin-left: auto; }
  .tile-level { display: block; color: #b8c4bb; font-size: 9px; line-height: 1.5; margin-top: auto; }
  .other-rooms { margin: 0 24px 24px; border-top: 1px solid var(--hk-line); padding-top: 18px; }
  .outdoor-sources { display: grid; gap: 13px; }
  .outdoor-metric h3 { font-size: 10px; font-weight: 500; color: var(--hk-muted); margin: 0 0 5px; }
  .outdoor-source { display: flex; align-items: center; justify-content: space-between; gap: 9px; padding: 10px; width: 100%; min-height: 54px; border: none; border-radius: 10px; text-align: left; background: color-mix(in srgb, var(--hk-accent) 7%, transparent); font-size: 11px; margin-top: 5px; }
  .outdoor-source > span { min-width: 0; overflow-wrap: anywhere; }
  .outdoor-source small { display: block; color: var(--hk-muted); font-size: 9px; margin-top: 4px; }
  .outdoor-source strong { font-size: 13px; min-width: 0; max-width: 50%; overflow-wrap: anywhere; text-align: right; }
  .outdoor-empty { display: block; width: 100%; background: transparent; border: 0; padding: 14px 2px; text-align: left; color: var(--hk-muted); font-size: 12px; min-height: 44px; }
  .room-detail { margin: 10px 3px 18px; border: 1px solid var(--hk-line); background: color-mix(in srgb, var(--hk-paper) 95%, #bdcbb8); border-radius: 16px; padding: 18px; outline: none; }
  .detail-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
  .section-kicker { display: block; color: var(--hk-muted); font-size: 10px; margin-bottom: 5px; }
  .close-detail { border: none; background: transparent; color: var(--hk-muted); width: 44px; height: 44px; font-size: 25px; border-radius: 12px; }
  .metric-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr)); gap: 12px; }
  .metric-group { min-width: 0; border-radius: 12px; padding: 12px; background: var(--hk-chip); color: #fff; }
  .metric-heading { display: flex; align-items: center; justify-content: space-between; gap: 6px; flex-wrap: wrap; }
  .metric-heading h3 { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 500; color: #edf2ef; margin: 0; }
  .hidden-label { font-size: 9px; color: #d2ded5; }
  .sensor-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; padding: 12px 0 6px; border: none; background: transparent; color: #fff; text-align: left; font-size: 11px; min-height: 64px; }
  .sensor-row + .sensor-row { margin-top: 6px; border-top: 1px solid #ffffff26; }
  .source-name { min-width: 0; font-weight: 550; overflow-wrap: anywhere; }
  .source-name small { display: block; font-size: 9px; font-weight: 400; color: #c6d1cb; margin-top: 3px; overflow-wrap: anywhere; }
  .sensor-meta { display: block; color: #c6d1cb; font-size: 9px; font-weight: 400; margin-top: 6px; line-height: 1.5; }
  .source-value { display: flex; flex-wrap: wrap; gap: 4px; justify-content: flex-end; align-items: baseline; text-align: right; max-width: 50%; flex-shrink: 0; }
  .source-value strong { font-size: 19px; font-weight: 650; letter-spacing: -.035em; overflow-wrap: anywhere; }
  .source-value > span { max-width: 100%; overflow-wrap: anywhere; font-size: 10px; color: #d8e1dc; }
  .source-value .entity-arrow { color: #b6cbbf; }
  .unavailable { color: var(--warning-color, #e9bb75); }
  .unavailable strong { font-size: 12px; letter-spacing: 0; }
  .detail-empty, .room-dimension { color: var(--hk-muted); font-size: 12px; line-height: 1.6; }
  .room-dimension { font-size: 10px; margin-bottom: 0; }
  .building-details { border-top: 1px solid var(--hk-line); padding: 0 24px; color: var(--hk-muted); font-size: 11px; line-height: 1.7; }
  .building-details summary { cursor: pointer; padding: 14px 0; min-height: 44px; }
  .building-details p { margin: 0 0 10px; }
  .building-details ul { padding-left: 17px; margin: 0 0 20px; }
  @supports ((backdrop-filter: blur(3px)) or (-webkit-backdrop-filter: blur(3px))) {
    .room-tile, .garage-readings, .metric-group { backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); }
  }
  @container hausklima (max-width: 780px) {
    .main-grid { grid-template-columns: minmax(0, 1fr); gap: 16px; padding: 6px 16px 18px; }
    .location-column { grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr)); padding-top: 0; }
    .rooms-section { display: block; }
    .room-list { grid-template-columns: repeat(auto-fit, minmax(min(145px, 100%), 1fr)); }
    .house-room-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .house-room-list .reading strong { font-size: 22px; }
    .other-rooms { margin: 0 16px 18px; }
    .garage-picture { max-width: 330px; margin: auto; }
    .metric-panel, .compact-sensor-marker { display: none; }
    .house-scene .compact-room-number { display: block; }
    .room-name { display: none; }
    .card-header { padding: 12px 16px 0; }
    h1 { font-size: 19px; }
    .room-detail { margin-top: 8px; margin-bottom: 18px; padding: 14px; }
    .house-drawing { max-width: 610px; margin: auto; }
    .building-details { padding: 0 16px; }
  }
  @container hausklima (max-width: 360px) {
    .room-tile { padding: 11px; }
    .house-room-list .reading strong { font-size: 20px; }
    .room-readings { gap: 5px 9px; }
    .section-title { gap: 8px; }
    .section-title > span { font-size: 9px; }
    .tile-heading { font-size: 11px; }
  }
`;
