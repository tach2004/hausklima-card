import { css, nothing, svg } from 'lit';
import type { TemplateResult } from 'lit';
import { createLayout, DRAWING_SCALE } from './layout';
import type { RoomShape } from './layout';
import type { BuildingConfig, RoomConfig } from './types';

export interface HouseSceneOptions {
  selected?: string;
  showNames: boolean;
  showDimensions: boolean;
  onSelect: (room: RoomConfig) => void;
  renderMetrics: (shape: RoomShape) => TemplateResult | typeof nothing;
  idPrefix: string;
}

const metres = (value: number) => `${value.toLocaleString('de-DE', { maximumFractionDigits: 2 })} m`;

/** Decorative furniture is illustrative, never a claim about the real building. */
function furniture(shape: RoomShape): TemplateResult {
  const { x, y, width, height, room } = shape;
  const bottom = y + height - 13;
  const unit = Math.min(width / 130, 1);
  const left = x + 10;
  const right = x + width - 10;
  switch (room.id) {
    case 'bedroom':
      return svg`<g class="scene-furniture bedroom-furniture">
        <ellipse cx=${left + 83} cy=${bottom + 1} rx="83" ry="9" fill="#6e5534" opacity=".13"/>
        <rect x=${left + 7} y=${bottom - 32} width="149" height="30" rx="5" fill="#b38f67"/>
        <path d="M ${left + 12} ${bottom - 32} h 138 l -13 -10 h -120 Z" fill="#e8d9bc"/>
        <rect x=${left + 13} y=${bottom - 40} width="131" height="26" rx="5" fill="#f4e8d2"/>
        <rect x=${left + 16} y=${bottom - 38} width="40" height="15" rx="6" fill="#fff6e7"/>
        <path d="M ${left + 58} ${bottom - 37} h 81 v 22 h -81Z" fill="#c4af8e"/>
        <path d="M ${left + 67} ${bottom - 37} v 22 m 12 -22 v 22" stroke="#d8c8ad" stroke-width="1"/>
        <rect x=${left + 161} y=${bottom - 28} width="25" height="25" rx="2" fill="#b69c77"/>
        <path d="M ${left + 173} ${bottom - 47} v 18" stroke="#8f7a5c" stroke-width="2"/>
        <path d="M ${left + 164} ${bottom - 46} h 18 l -3 -12 h -12Z" fill="#ffedb9"/>
      </g>`;
    case 'storage':
      return svg`<g class="scene-furniture">
        <rect x=${right - 42} y=${bottom - 79} width="37" height="78" rx="1" fill="#b59672"/>
        <rect x=${right - 39} y=${bottom - 76} width="31" height="72" fill="#d0b48a"/>
        ${[0, 1, 2].map((index) => svg`<g>
          <rect x=${right - 36} y=${bottom - 69 + index * 24} width="12" height="17" rx="1" fill=${index === 1 ? '#a9b5a1' : '#ece0c7'}/>
          <rect x=${right - 22} y=${bottom - 64 + index * 24} width="12" height="12" rx="1" fill=${index === 1 ? '#ddc59e' : '#b9bca5'}/>
          <path d="M ${right - 39} ${bottom - 50 + index * 24} h 31" stroke="#947b5c" stroke-width="3"/>
        </g>`)}
        <rect x=${left + 5} y=${bottom - 17} width="30" height="16" rx="2" fill="#c4b18d"/>
        <path d="M ${left + 18} ${bottom - 16} v 14" stroke="#e8d5b4" stroke-width="2"/>
      </g>`;
    case 'living_room':
      return svg`<g class="scene-furniture">
        <ellipse cx=${left + 99} cy=${bottom + 1} rx="93" ry="11" fill="#aa9270" opacity=".2"/>
        <rect x=${left + 14} y=${bottom - 31} width="114" height="29" rx="6" fill="#b29c7c"/>
        <rect x=${left + 17} y=${bottom - 38} width="107" height="21" rx="6" fill="#c9b79a"/>
        <path d="M ${left + 51} ${bottom - 35} v 16 m 35 -16 v 16" stroke="#e5d7bf" stroke-width="2"/>
        <rect x=${left + 8} y=${bottom - 26} width="14" height="21" rx="5" fill="#baa486"/>
        <rect x=${left + 120} y=${bottom - 26} width="14" height="21" rx="5" fill="#baa486"/>
        <path d="M ${left + 22} ${bottom - 1} v 5 m 99 -5 v 5" stroke="#7e6a52" stroke-width="3"/>
        <ellipse cx=${right - 39} cy=${bottom - 12} rx="25" ry="6" fill="#cfb58e"/>
        <path d="M ${right - 55} ${bottom - 9} v 10 m 31 -10 v 10" stroke="#a68c68" stroke-width="3"/>
        <path d="M ${right - 17} ${bottom - 2} l -4 -15 h 14 l -3 15Z" fill="#bcac8c"/>
        <path d="M ${right - 14} ${bottom - 17} v -27" stroke="#81976b" stroke-width="2"/>
        <ellipse cx=${right - 20} cy=${bottom - 36} rx="5" ry="10" transform="rotate(-32 ${right - 20} ${bottom - 36})" fill="#8b9f76"/>
        <ellipse cx=${right - 9} cy=${bottom - 44} rx="5" ry="10" transform="rotate(30 ${right - 9} ${bottom - 44})" fill="#9dac88"/>
      </g>`;
    case 'kitchen':
      return svg`<g class="scene-furniture">
        <rect x=${left + 3} y=${bottom - 33} width=${Math.max(10, width - 27)} height="32" rx="2" fill="#c5b28f"/>
        <path d="M ${left + 1} ${bottom - 33} h ${Math.max(10, width - 23)} l -6 -6 h -${Math.max(5, width - 29)}Z" fill="#f4ecdb"/>
        <path d="M ${left + 25} ${bottom - 30} v 28 m 35 -28 v 28 m 35 -28 v 28" stroke="#e4d5b9" stroke-width="1.5"/>
        <ellipse cx=${left + 32} cy=${bottom - 37} rx="13" ry="3" fill="#a9b5af"/>
        <path d="M ${left + 32} ${bottom - 38} v -9 q 0 -6 6 -4" fill="none" stroke="#9aa79e" stroke-width="2"/>
        <path d="M ${right - 29} ${bottom - 42} h 17" stroke="#55625a" stroke-width="3"/>
        <path d="M ${right - 25} ${bottom - 46} h 8" stroke="#56615b" stroke-width="3"/>
      </g>`;
    case 'workshop':
      return svg`<g class="scene-furniture" transform="translate(${left + 3} ${bottom}) scale(${unit})">
        <rect x="0" y="-40" width="87" height="37" rx="2" fill="#638c92"/>
        <path d="M -3 -40 h 95 l -4 -6 h -85Z" fill="#c7ba9e"/>
        <path d="M 6 -29 h 74 m -74 11 h 74" stroke="#adcbca" stroke-width="1.4"/>
        <path d="M 38 -39 v 34" stroke="#8aafad" stroke-width="1.5"/>
        <path d="M 11 -24 h 16 m 19 0 h 17 m -52 11 h 16 m 19 0 h 17" stroke="#d1dbce" stroke-width="1.5"/>
        <rect x="3" y="-69" width="77" height="22" rx="1" fill="#a0b4aa"/>
        ${[0, 1, 2, 3, 4].map((index) => svg`<path d="M ${12 + index * 13} -64 v 11" stroke="#647e77" stroke-width=${index % 2 ? 3 : 2}/>`)}
      </g>`;
    case 'laundry':
      return svg`<g class="scene-furniture">
        <rect x=${right - 40} y=${bottom - 46} width="36" height="44" rx="3" fill="#e4e9de" stroke="#849e98" stroke-width="1.4"/>
        <path d="M ${right - 37} ${bottom - 38} h 30" stroke="#b0c0b5"/>
        <circle cx=${right - 22} cy=${bottom - 22} r="12" fill="#9bb6b6"/>
        <circle cx=${right - 22} cy=${bottom - 22} r="8" fill="#607e85"/>
        <circle cx=${right - 10} cy=${bottom - 42} r="1.4" fill="#8da49b"/>
        <rect x=${left + 5} y=${bottom - 12} width="29" height="11" rx="3" fill="#a8af96"/>
        <path d="M ${left + 8} ${bottom - 13} h 23 m -21 -3 h 19" stroke="#e7ddc7" stroke-width="3"/>
      </g>`;
    case 'basement_hall':
      return svg`<g class="scene-furniture">
        <path d="M ${right - 65} ${bottom} v -7 h 10 v -7 h 10 v -7 h 10 v -7 h 10 v -7 h 10 v -7 h 10 v 42Z" fill="#9daea0"/>
        <path d="M ${right - 67} ${bottom - 8} l 64 -43" stroke="#c8d2bb" stroke-width="2" fill="none"/>
        <rect x=${left + 4} y=${bottom - 45} width="20" height="44" fill="#a8b5a1"/>
        <path d="M ${left + 6} ${bottom - 43} h 16 v 42" fill="none" stroke="#c5ceb7" stroke-width="2"/>
      </g>`;
    default:
      return svg`<g class="scene-furniture">
        ${width < 70 ? svg`<path d="M ${x + width / 2 - 9} ${bottom} v -45 q 9 -10 18 0 v 45" fill="#bcaa8a" stroke="#d4c6aa" stroke-width="2"/>` : svg`<path d="M ${left + 5} ${bottom} v -42 h 25 v 42" fill="#c9b99b" opacity=".7"/>`}
      </g>`;
  }
}

function renderRoom(shape: RoomShape, index: number, options: HouseSceneOptions): TemplateResult {
  const { x, y, width, height, room, level } = shape;
  const clip = `${options.idPrefix}-room-${index}`;
  const selected = options.selected === room.id;
  const narrow = width < 70;
  return svg`
    <g class="room ${level}${selected ? ' selected' : ''}" data-room-id=${room.id}
      role="button" tabindex="0" aria-label=${room.name} aria-pressed=${String(selected)}
      @click=${() => options.onSelect(room)}
      @keydown=${(event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          options.onSelect(room);
        }
      }}>
      <title>${room.name} · Raumdetails öffnen</title>
      <defs><clipPath id=${clip}><rect x=${x + 1} y=${y + 1} width=${Math.max(0, width - 2)} height=${Math.max(0, height - 2)}/></clipPath></defs>
      <rect class="room-fill" x=${x} y=${y} width=${width} height=${height}
        fill="url(#${options.idPrefix}-wall-${level})"/>
      <g class="room-decoration" clip-path="url(#${clip})" aria-hidden="true">
        <path d="M ${x + 1} ${y + height - 18} h ${width - 2} v 17 h -${width - 2}Z" fill="url(#${options.idPrefix}-floor-${level})"/>
        <path d="M ${x + 1} ${y + height - 18} h ${width - 2} l -12 -7 h -${Math.max(0, width - 14)}Z" fill="#a78b63" opacity=".17"/>
        <rect x=${x + 1} y=${y + 1} width=${Math.max(0, width - 2)} height="5" fill="#fff6dd" opacity=".55"/>
        <path d="M ${x + width - 7} ${y + 5} v ${height - 6} h 6 v -${height - 6}Z" fill="#8c795a" opacity=".1"/>
        <rect x=${x + 1} y=${y + 5} width=${Math.max(0, width - 2)} height=${Math.max(0, height - 23)} fill="url(#${options.idPrefix}-sunlight)"/>
        ${!narrow && room.id !== 'storage' ? svg`<g class="window-light">
          <rect x=${x + 13} y=${y + 29} width="23" height="28" rx="1" fill="#ffefd0" opacity=".6"/>
          <path d="M ${x + 13} ${y + 43} h 23 m -12 -14 v 28" stroke="#f6e0b3" stroke-width="2"/>
          <path d="M ${x + 13} ${y + 57} h 23 l 34 27 h -24Z" fill="#fff0c9" opacity=".12"/>
        </g>` : nothing}
        ${furniture(shape)}
      </g>
      ${options.showNames ? svg`<text class="room-name${narrow ? ' narrow-room-name' : ''}"
        text-anchor="middle" x=${x + width / 2} y=${narrow ? y + height / 2 : y + 21}
        transform=${narrow ? `rotate(-90 ${x + width / 2} ${y + height / 2})` : ''}>${room.name}</text>` : nothing}
      <text class="compact-room-number" text-anchor="middle" x=${x + width / 2} y=${y + height / 2 + 7}>${String(index + 1).padStart(2, '0')}</text>
      ${options.renderMetrics(shape)}
      <rect class="room-focus" x=${x + 1.5} y=${y + 1.5} width=${Math.max(0, width - 3)} height=${Math.max(0, height - 3)} rx="1"/>
    </g>`;
}

/**
 * A responsive architectural illustration, not a construction section. Room
 * extents retain their known measures; shadows, furnishings and visual depth
 * below are presentation units and never establish missing building measures.
 */
export function renderHouseScene(building: BuildingConfig, options: HouseSceneOptions): TemplateResult {
  const layout = createLayout(building);
  const shapes = layout.shapes.filter((shape) => shape.level !== 'garage');
  const bands = layout.bands.filter((band) => band.building === 'house' && band.height > 0);
  const { x, houseWidth: width, roofTop: top, basementBottom: bottom } = layout;
  const right = x + width;
  const prefix = options.idPrefix;
  const graphicWidth = width + 104;
  const graphicHeight = bottom - top + (options.showDimensions ? 128 : 100);
  return svg`
    <svg class="building house-scene" viewBox="${x - 44} ${top - 63} ${graphicWidth} ${graphicHeight}"
      xmlns="http://www.w3.org/2000/svg" aria-label="Schematische Traufansicht mit geöffnetem Dachgeschoss, Erdgeschoss und Keller">
      <defs>
        <linearGradient id="${prefix}-wall-attic" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f5e4c8"/><stop offset="1" stop-color="#ddbf93"/></linearGradient>
        <linearGradient id="${prefix}-wall-ground_floor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#eee0c8"/><stop offset="1" stop-color="#d6bb91"/></linearGradient>
        <linearGradient id="${prefix}-wall-basement" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d3dfd5"/><stop offset="1" stop-color="#afc3b9"/></linearGradient>
        <linearGradient id="${prefix}-floor-attic" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#b6966d"/><stop offset="1" stop-color="#d1b88e"/></linearGradient>
        <linearGradient id="${prefix}-floor-ground_floor" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#b99d75"/><stop offset="1" stop-color="#dcc8a1"/></linearGradient>
        <linearGradient id="${prefix}-floor-basement" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#8ca99e"/><stop offset="1" stop-color="#b8c7b5"/></linearGradient>
        <linearGradient id="${prefix}-side" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#c8b89b"/><stop offset="1" stop-color="#e2d6c1"/></linearGradient>
        <linearGradient id="${prefix}-roof" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#626b70"/><stop offset=".45" stop-color="#424d55"/><stop offset="1" stop-color="#2e3940"/></linearGradient>
        <radialGradient id="${prefix}-sunlight" cx=".12" cy=".1" r="1"><stop stop-color="#fff6d6" stop-opacity=".35"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></radialGradient>
        <pattern id="${prefix}-roof-tiles" width="24" height="11" patternUnits="userSpaceOnUse"><path d="M 0 10.5 h 24 M 12 0 v 10.5 M 0 0 v 10.5" fill="none" stroke="#b9c1c3" stroke-width=".6" opacity=".22"/></pattern>
        <filter id="${prefix}-shadow" x="-15%" y="-15%" width="140%" height="145%"><feDropShadow dx="3" dy="8" stdDeviation="7" flood-color="#67553a" flood-opacity=".14"/></filter>
      </defs>
      <g class="scene-ground" aria-hidden="true">
        <ellipse cx=${x + width / 2 + 17} cy=${bottom + 14} rx=${width / 2 + 39} ry="13" fill="#7b7967" opacity=".1"/>
        <path d="M ${x - 12} ${bottom + 4} h ${width + 31} l 30 -12 h -${width + 31}Z" fill="#c2c8ac"/>
        <path d="M ${x - 12} ${bottom + 4} h ${width + 31} v 5 h -${width + 31}Z" fill="#a3b28c"/>
        <path d="M ${right + 19} ${bottom + 4} l 30 -12 v 5 l -30 12Z" fill="#889b7c"/>
      </g>
      <g class="house-shell" filter="url(#${prefix}-shadow)" aria-hidden="true">
        <path d="M ${right + 4} ${top - 1} l 28 -18 v ${bottom - top + 7} l -28 18Z" fill="url(#${prefix}-side)"/>
        <rect x=${x - 5} y=${top - 5} width=${width + 10} height=${bottom - top + 10} rx="1" fill="#ad9878"/>
        ${bands.map((band) => svg`<rect class="unresolved-fill" x=${band.x} y=${band.y} width=${band.width} height=${band.height} fill="#d6ceba"/>`)}
      </g>
      ${shapes.map((shape, index) => renderRoom(shape, index, options))}
      <g class="scene-structure" aria-hidden="true">
        ${bands.map((band) => svg`
          <path d="M ${x - 4} ${band.y + band.height} h ${width + 10} v 5 h -${width + 10}Z" fill="#ae9774"/>
          <path d="M ${right + 6} ${band.y + band.height} l 27 -17 v 5 l -27 17Z" fill="#b5a183"/>
          <path d="M ${x - 2} ${band.y + band.height - .5} h ${width + 7}" stroke="#f5e9cd" stroke-width="1" opacity=".7"/>
          <text class="level-label" text-anchor="end" x=${x - 17} y=${band.y + band.height / 2 + 4}>${band.name}</text>
        `)}
        <path class="roof-plane" d="M ${x - 17} ${top - 4} L ${x + 9} ${top - 43} H ${right + 20} L ${right + 42} ${top - 4} Z" fill="url(#${prefix}-roof)"/>
        <path d="M ${x - 17} ${top - 4} L ${x + 9} ${top - 43} H ${right + 20} L ${right + 42} ${top - 4} Z" fill="url(#${prefix}-roof-tiles)"/>
        <path class="ridge" d="M ${x + 9} ${top - 43} h ${width + 11}" fill="none" stroke="#879091" stroke-width="3"/>
        <path d="M ${x - 18} ${top - 4} h ${width + 61} v 5 h -${width + 61}Z" fill="#303a40"/>
        <path d="M ${x - 10} ${top + 1} h ${width + 42}" stroke="#e4d5b6" stroke-width="3"/>
        <path d="M ${x - 5} ${top + 2} v ${bottom - top + 2} m ${width + 10} -${bottom - top + 2} v ${bottom - top + 2}" stroke="#b19c7c" stroke-width="5"/>
      </g>
      ${options.showDimensions ? svg`<g class="scene-dimensions">
        <path class="dimension-line" d="M ${x} ${bottom + 26} v 8 m 0 -4 h ${width} m 0 -4 v 8"/>
        <text class="dimension-label" text-anchor="middle" x=${x + width / 2} y=${bottom + 48}>${metres(building.house.width_m)} Traufseite · schematisch</text>
        <text class="dimension-label" text-anchor="middle" x=${x + width / 2} y=${top - 52}>First innen ${metres(building.roof.interior_ridge_height_m)} · Kniestock ${metres(building.roof.knee_wall_height_m)}</text>
        ${bands.filter((band) => band.id !== 'attic').map((band) => svg`<text class="dimension-label level-height" text-anchor="end" x=${x - 17} y=${band.y + band.height / 2 + 18}>${metres(band.height / DRAWING_SCALE)}</text>`)}
      </g>` : nothing}
    </svg>`;
}

export const sceneStyles = css`
  .house-scene { display: block; width: 100%; height: auto; overflow: visible; }
  .house-scene text { font-family: inherit; pointer-events: none; }
  .house-scene .room { cursor: pointer; outline: none; -webkit-tap-highlight-color: transparent; }
  .house-scene .room-decoration, .house-scene .scene-structure, .house-scene .scene-ground,
  .house-scene .house-shell { pointer-events: none; }
  .house-scene .room-fill { stroke: #b4a181; stroke-width: 1.3; }
  .house-scene .room-focus { fill: transparent; stroke: transparent; stroke-width: 3; pointer-events: none; }
  .house-scene .room.selected .room-focus, .house-scene .room:focus-visible .room-focus { stroke: var(--hk-accent, #357969); }
  .house-scene .room:hover .room-focus { stroke: color-mix(in srgb, var(--hk-accent, #357969) 60%, transparent); }
  .house-scene .room-name { fill: #443e32; font-size: 12px; font-weight: 650; letter-spacing: -.12px; }
  .house-scene .narrow-room-name { font-size: 11px; }
  .house-scene .compact-room-number { display: none; fill: #4d4639; font-size: 23px; font-weight: 700; }
  .house-scene .level-label { fill: var(--hk-muted, #7a817c); font-size: 10px; font-weight: 600; }
  .house-scene .dimension-label { fill: var(--hk-muted, #7a817c); font-size: 8px; }
  .house-scene .dimension-line { fill: none; stroke: var(--hk-muted, #7a817c); stroke-width: .8; opacity: .6; }
`;
