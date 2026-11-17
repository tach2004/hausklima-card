import { MOBILE_ROOM_ART_POSITIONS } from './scene-photo';
interface Rectangle { x: number; y: number; width: number; height: number; }
const overlaps = (a: Rectangle, b: Rectangle, gap = 7) =>
  a.x < b.x + b.width + gap && a.x + a.width + gap > b.x &&
  a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;

/** Draw device-anchor to badge-edge connectors after every responsive reflow.
 *  No static coordinates: manually moved badges are measured in their new location.
 */
function drawLeaders(
  svg: SVGSVGElement | null,
  lines: { element: HTMLElement; rect: Rectangle }[],
  width: number, imageHeight: number, stageHeight: number,
): void {
  if (!svg) return;
  svg.setAttribute('viewBox', `0 0 ${width} ${stageHeight}`);
  const namespace = 'http://www.w3.org/2000/svg';
  svg.replaceChildren(...lines.flatMap(({ element, rect }) => {
    const x = width * Number(element.dataset.anchorX) / 100;
    const y = imageHeight * Number(element.dataset.anchorY) / 100;
    // Connect to the nearest badge edge (not its centre). This also works
    // when a user drags a garage badge from the dock back onto the photo.
    let endX = Math.max(rect.x, Math.min(rect.x + rect.width, x));
    let endY = Math.max(rect.y, Math.min(rect.y + rect.height, y));
    if (endX === x && endY === y) {
      const sides = [
        { distance: x - rect.x, x: rect.x, y },
        { distance: rect.x + rect.width - x, x: rect.x + rect.width, y },
        { distance: y - rect.y, x, y: rect.y },
        { distance: rect.y + rect.height - y, x, y: rect.y + rect.height },
      ];
      const nearest = sides.sort((a, b) => a.distance - b.distance)[0]!;
      endX = nearest.x;
      endY = nearest.y;
    }
    const path = document.createElementNS(namespace, 'path');
    path.setAttribute('data-leader-room', element.dataset.overlayId ?? '');
    path.setAttribute('d', `M ${x} ${y} L ${endX} ${endY}`);
    const circle = document.createElementNS(namespace, 'circle');
    circle.setAttribute('cx', String(x));
    circle.setAttribute('cy', String(y));
    circle.setAttribute('r', '3');
    return [path, circle];
  }));
}

/** Reflow complete HTML panels, never abbreviate their data or modify the artwork. */
export function layoutPhotoOverlays(stage: HTMLElement): void {
  const image = stage.querySelector<HTMLImageElement>('.photo-image');
  if (!image || image.clientWidth === 0) return;
  const width = image.clientWidth;
  const imageHeight = image.clientHeight;
  if (!imageHeight) return;
  for (const target of stage.querySelectorAll<HTMLElement>('.photo-object-target')) {
    target.style.left = `${width * Number(target.dataset.anchorX) / 100}px`;
    target.style.top = `${imageHeight * Number(target.dataset.anchorY) / 100}px`;
  }
  const entries = [...stage.querySelectorAll<HTMLElement>('.photo-placement')];
  const containerWidth = stage.closest('ha-card')?.clientWidth ?? stage.clientWidth;
  if (containerWidth <= 1000) {
    // Same original illustration and spatial room arrangement as desktop.
    // Only three densely packed garage-device badges use a compact dark strip
    // below the image. Deliberately no diagonal or cross-image leader lines.
    const mobileCenters = MOBILE_ROOM_ART_POSITIONS;
    const occupied: Rectangle[] = [];
    const dock: HTMLElement[] = [];
    const lines: { element: HTMLElement; rect: Rectangle }[] = [];
    const svg = stage.querySelector<SVGSVGElement>('.photo-leaders');
    svg?.replaceChildren();
    const note = stage.querySelector<HTMLElement>('.photo-dock-note');
    if (note) note.hidden = true;

    const mobileEntries = [...entries].sort((a, b) =>
      Number(b.dataset.manualMobileX !== undefined) - Number(a.dataset.manualMobileX !== undefined));
    for (const element of mobileEntries) {
      element.classList.remove('is-docked');
      const id = element.dataset.overlayId ?? '';
      const isGarageEquipment = id === 'garage_cabinet' || id === 'garage_battery_pylontech' || id === 'garage_battery_litime';
      // Match desktop: an unconfigured garage device keeps its lightweight
      // name label and corresponding connector (never an empty dark badge).
      const badge = element.querySelector<HTMLElement>('.photo-badge.mobile-climate')
        ?? (isGarageEquipment ? element.querySelector<HTMLElement>('.photo-badge') : null);
      if (!badge) {
        element.style.width = '0px';
        element.style.maxWidth = '0px';
        continue;
      }
      const manuallyPlaced = element.dataset.manualMobileX !== undefined && element.dataset.manualMobileY !== undefined;
      if (!manuallyPlaced && isGarageEquipment) {
        dock.push(element);
        continue;
      }
      const isOutdoor = element.classList.contains('photo-outdoor-group');
      const isWideRoom = id === 'bedroom' || id === 'storage';
      // Same content-sized width as desktop for outdoor sources, constrained only
      // by the picture edge and desktop's 360px named-group safety limit.
      // The separate compact room/device limits deliberately stay unchanged.
      const widthLimit = isOutdoor
        ? Math.min(width - 8, 360)
        : Math.min(isWideRoom ? 105 : 95, width * (isWideRoom ? .27 : .205));
      element.style.width = 'max-content';
      element.style.maxWidth = `${widthLimit}px`;
      const w = element.offsetWidth, h = element.offsetHeight;
      const fallback = mobileCenters[id];
      const fallbackX = fallback?.x ?? Number(element.dataset.preferredX);
      const fallbackY = fallback?.y ?? Number(element.dataset.preferredY);
      const xPct = manuallyPlaced ? Number(element.dataset.manualMobileX) : fallbackX;
      const yPct = manuallyPlaced ? Number(element.dataset.manualMobileY) : fallbackY;
      const preferredX = width * xPct / 100 - w / 2;
      const preferredY = imageHeight * yPct / 100 - h / 2;
      let placed: Rectangle | undefined;
      const attempts = manuallyPlaced ? [[0, 0]] : [[0, 0], [-4, 0], [4, 0], [0, -4], [0, 4], [0, -8], [0, 8]];
      for (const [dx, dy] of attempts) {
        const rect = {
          x: Math.max(2, Math.min(width - w - 2, preferredX + dx!)),
          y: Math.max(2, Math.min(imageHeight - h - 2, preferredY + dy!)),
          width: w, height: h,
        };
        if (manuallyPlaced || !occupied.some((previous) => overlaps(rect, previous, 1))) { placed = rect; break; }
      }
      if (!placed) {
        dock.push(element);
        continue;
      }
      element.style.left = `${placed.x + w / 2}px`;
      element.style.top = `${placed.y + h / 2}px`;
      occupied.push(placed);
      if (isGarageEquipment) {
        lines.push({ element, rect: placed });
      }
    }
    let maxBottom = imageHeight;
    const regularDocks = dock.filter((element) => !element.classList.contains('photo-outdoor-group'));
    for (const [index, element] of regularDocks.entries()) {
      element.classList.add('is-docked');
      element.style.width = 'max-content';
      element.style.maxWidth = `${Math.min(120, width / 3 - 8)}px`;
      const h = element.offsetHeight;
      const column = index % 3, row = Math.floor(index / 3);
      const x = (column + .5) * width / 3;
      const y = imageHeight + 10 + h / 2 + row * 64;
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      maxBottom = Math.max(maxBottom, y + h / 2 + 8);
      const id = element.dataset.overlayId;
      if (id === 'garage_cabinet' || id === 'garage_battery_pylontech' || id === 'garage_battery_litime') {
        lines.push({ element, rect: { x: x - element.offsetWidth / 2, y: y - h / 2, width: element.offsetWidth, height: h } });
      }
    }
    // Keep the same content-sized width when a tall outdoor group needs its
    // own dock row; never stretch it to a fixed proportion of the image width.
    for (const element of dock.filter((item) => item.classList.contains('photo-outdoor-group'))) {
      element.classList.add('is-docked');
      element.style.width = 'max-content';
      element.style.maxWidth = `${Math.min(width - 8, 360)}px`;
      const w = element.offsetWidth, h = element.offsetHeight;
      const x = width - w / 2 - 4;
      const y = maxBottom + 8 + h / 2;
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      maxBottom = y + h / 2 + 8;
    }
    stage.style.height = `${maxBottom}px`;
    drawLeaders(svg, lines, width, imageHeight, maxBottom);
    return;
  }
  const occupied: Rectangle[] = [];
  const dock: HTMLElement[] = [];
  const lines: { element: HTMLElement; rect: Rectangle }[] = [];
  stage.style.height = '';
  const desktopEntries = [...entries].sort((a, b) =>
    Number(b.dataset.manualDesktopX !== undefined) - Number(a.dataset.manualDesktopX !== undefined));
  for (const element of desktopEntries) {
    element.classList.remove('is-docked');
    // Natural content width keeps one-value badges compact at every scene size.
    // Named source rows may grow wider, but long units always wrap within bounds.
    element.style.width = 'max-content';
    element.style.maxWidth = `${Math.min(width - 8, element.querySelector('.has-named-groups') ? 360 : 220)}px`;
    const w = element.offsetWidth;
    const h = element.offsetHeight;
    const manual = element.dataset.manualDesktopX !== undefined && element.dataset.manualDesktopY !== undefined;
    const centerX = manual ? Number(element.dataset.manualDesktopX) : Number(element.dataset.preferredX);
    const centerY = manual ? Number(element.dataset.manualDesktopY) : Number(element.dataset.preferredY);
    const preferredX = width * centerX / 100 - w / 2;
    const preferredY = imageHeight * centerY / 100 - h / 2;
    let placement: Rectangle | undefined;
    const attempts = manual ? [[0, 0]] : [[0, 0], [0, -9], [0, 9], [-12, 0], [12, 0], [0, -22], [0, 22], [-12, -18], [12, 18]];
    for (const [dx, dy] of attempts) {
      const rect = { x: Math.max(4, Math.min(width - w - 4, preferredX + dx!)), y: preferredY + dy!, width: w, height: h };
      if (manual) rect.y = Math.max(4, Math.min(imageHeight - h - 4, rect.y));
      if (rect.y >= 4 && rect.y + h <= imageHeight - 4 && (manual || !occupied.some((previous) => overlaps(rect, previous)))) {
        placement = rect; break;
      }
    }
    if (!placement) { dock.push(element); continue; }
    element.style.left = `${placement.x + w / 2}px`;
    element.style.top = `${placement.y + h / 2}px`;
    occupied.push(placement);
    if (element.dataset.anchorX !== element.dataset.preferredX || element.dataset.anchorY !== element.dataset.preferredY) lines.push({ element, rect: placement });
  }
  const docked: Rectangle[] = [];
  for (const element of dock) {
    element.classList.add('is-docked');
    const w = element.offsetWidth, h = element.offsetHeight;
    const preferred = Math.max(4, Math.min(width - w - 4, width * Number(element.dataset.anchorX) / 100 - w / 2));
    const candidatesX = [preferred, 4, width - w - 4, ...docked.flatMap((rect) => [rect.x - w - 12, rect.x + rect.width + 12])]
      .filter((x) => x >= 4 && x + w <= width - 4)
      .sort((a, b) => Math.abs(a - preferred) - Math.abs(b - preferred));
    const candidatesY = [imageHeight + 40, ...docked.map((rect) => rect.y + rect.height + 12)].sort((a, b) => a - b);
    let placement: Rectangle | undefined;
    for (const y of candidatesY) {
      for (const x of candidatesX) {
        const candidate = { x, y, width: w, height: h };
        if (!docked.some((previous) => overlaps(candidate, previous))) { placement = candidate; break; }
      }
      if (placement) break;
    }
    // The lowest candidate row is always free, even for exceptionally long units.
    const rect = placement!;
    element.style.left = `${rect.x + w / 2}px`;
    element.style.top = `${rect.y + h / 2}px`;
    docked.push(rect);
    lines.push({ element, rect });
  }
  const note = stage.querySelector<HTMLElement>('.photo-dock-note');
  if (note) { note.hidden = dock.length === 0; note.style.top = `${imageHeight + 10}px`; note.style.left = '4px'; }
  const totalHeight = docked.length ? Math.max(...docked.map((rect) => rect.y + rect.height)) + 8 : imageHeight;
  stage.style.height = `${totalHeight}px`;
  drawLeaders(stage.querySelector<SVGSVGElement>('.photo-leaders'), lines, width, imageHeight, totalHeight);
}
