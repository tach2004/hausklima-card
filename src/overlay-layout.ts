interface Rectangle { x: number; y: number; width: number; height: number; }
const overlaps = (a: Rectangle, b: Rectangle, gap = 7) =>
  a.x < b.x + b.width + gap && a.x + a.width + gap > b.x &&
  a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;

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
    const mobileCenters: Record<string, [number, number]> = {
      bedroom: [27, 33], storage: [56, 33],
      living_room: [15, 55], ground_hall: [37, 55], kitchen: [59, 55],
      workshop: [15, 78], basement_hall: [37, 78], laundry: [59, 78],
      garage: [85, 55],
    };
    const occupied: Rectangle[] = [];
    const dock: HTMLElement[] = [];
    const svg = stage.querySelector<SVGSVGElement>('.photo-leaders');
    svg?.replaceChildren();
    const note = stage.querySelector<HTMLElement>('.photo-dock-note');
    if (note) note.hidden = true;

    for (const element of entries) {
      element.classList.remove('is-docked');
      const id = element.dataset.overlayId ?? '';
      const badge = element.querySelector<HTMLElement>('.photo-badge.mobile-climate');
      if (!badge) {
        element.style.width = '0px';
        element.style.maxWidth = '0px';
        continue;
      }
      if (id.startsWith('garage_battery_') || id === 'garage_cabinet') {
        dock.push(element);
        continue;
      }
      element.style.width = 'max-content';
      element.style.maxWidth = `${Math.min(id === 'bedroom' || id === 'storage' ? 105 : 95, width * (id === 'bedroom' || id === 'storage' ? .27 : .205))}px`;
      const w = element.offsetWidth, h = element.offsetHeight;
      const [xPct, yPct] = mobileCenters[id] ?? [Number(element.dataset.preferredX), Number(element.dataset.preferredY)];
      const preferredX = width * xPct / 100 - w / 2;
      const preferredY = imageHeight * yPct / 100 - h / 2;
      let placed: Rectangle | undefined;
      for (const [dx, dy] of [[0, 0], [-4, 0], [4, 0], [0, -4], [0, 4], [0, -8], [0, 8]]) {
        const rect = {
          x: Math.max(2, Math.min(width - w - 2, preferredX + dx!)),
          y: Math.max(2, Math.min(imageHeight - h - 2, preferredY + dy!)),
          width: w, height: h,
        };
        if (!occupied.some((previous) => overlaps(rect, previous, 1))) { placed = rect; break; }
      }
      if (!placed) {
        dock.push(element);
        continue;
      }
      element.style.left = `${placed.x + w / 2}px`;
      element.style.top = `${placed.y + h / 2}px`;
      occupied.push(placed);
    }
    let maxBottom = imageHeight;
    for (const [index, element] of dock.entries()) {
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
    }
    stage.style.height = `${maxBottom}px`;
    return;
  }
  const occupied: Rectangle[] = [];
  const dock: HTMLElement[] = [];
  const lines: { element: HTMLElement; rect: Rectangle }[] = [];
  stage.style.height = '';
  for (const element of entries) {
    element.classList.remove('is-docked');
    // Natural content width keeps one-value badges compact at every scene size.
    // Named source rows may grow wider, but long units always wrap within bounds.
    element.style.width = 'max-content';
    element.style.maxWidth = `${Math.min(width - 8, element.querySelector('.has-named-groups') ? 360 : 220)}px`;
    const w = element.offsetWidth;
    const h = element.offsetHeight;
    const preferredX = width * Number(element.dataset.preferredX) / 100 - w / 2;
    const preferredY = imageHeight * Number(element.dataset.preferredY) / 100 - h / 2;
    let placement: Rectangle | undefined;
    for (const [dx, dy] of [[0, 0], [0, -9], [0, 9], [-12, 0], [12, 0], [0, -22], [0, 22], [-12, -18], [12, 18]]) {
      const rect = { x: Math.max(4, Math.min(width - w - 4, preferredX + dx!)), y: preferredY + dy!, width: w, height: h };
      if (rect.y >= 4 && rect.y + h <= imageHeight - 4 && !occupied.some((previous) => overlaps(rect, previous))) {
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
  const svg = stage.querySelector<SVGSVGElement>('.photo-leaders');
  if (!svg) return;
  svg.setAttribute('viewBox', `0 0 ${width} ${totalHeight}`);
  const namespace = 'http://www.w3.org/2000/svg';
  svg.replaceChildren(...lines.flatMap(({ element, rect }) => {
    const x = width * Number(element.dataset.anchorX) / 100;
    const y = imageHeight * Number(element.dataset.anchorY) / 100;
    const endX = Math.max(rect.x, Math.min(rect.x + rect.width, x));
    const endY = Math.max(rect.y, Math.min(rect.y + rect.height, y));
    const path = document.createElementNS(namespace, 'path');
    path.setAttribute('d', `M ${x} ${y} L ${endX} ${endY}`);
    const circle = document.createElementNS(namespace, 'circle');
    circle.setAttribute('cx', String(x)); circle.setAttribute('cy', String(y)); circle.setAttribute('r', '3');
    return [path, circle];
  }));
}
