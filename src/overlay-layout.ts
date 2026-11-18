import { MOBILE_ROOM_ART_POSITIONS, FRONT_MOBILE_ROOM_ART_POSITIONS } from './scene-photo';
interface Rectangle { x: number; y: number; width: number; height: number; }
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

/** Strict image percentages on all screen sizes.
 *  No collision avoidance, auto-docking, edge clamping or auto-repositioning.
 *  The editing preview and rendered image share the same coordinate origin.
 */
export function layoutPhotoOverlays(
  stage: HTMLElement, previewScale = 1,
  activeDrag?: { roomId: string; position: { x: number; y: number } },
): void {
  const image = stage.querySelector<HTMLImageElement>('.photo-image');
  if (!image) return;
  // Use fractional rendered dimensions, not rounded clientWidth/clientHeight:
  // the editor and live image then share identical percent coordinates.
  const bounds = image.getBoundingClientRect();
  // The live editor visually scales a logical 1280/390px card. Calculate in
  // unscaled CSS pixels; the card itself always calls this with scale = 1.
  const width = bounds.width / previewScale, imageHeight = bounds.height / previewScale;
  if (!width || !imageHeight) return;
  const mobile = (stage.closest('ha-card')?.clientWidth ?? stage.clientWidth) <= 1000;
  stage.style.height = '';
  const lines: { element: HTMLElement; rect: Rectangle }[] = [];
  for (const target of stage.querySelectorAll<HTMLElement>('.photo-object-target')) {
    target.style.left = `${width * Number(target.dataset.anchorX) / 100}px`;
    target.style.top = `${imageHeight * Number(target.dataset.anchorY) / 100}px`;
  }
  for (const element of stage.querySelectorAll<HTMLElement>('.photo-placement')) {
    element.classList.remove('is-docked');
    const id = element.dataset.overlayId ?? '';
    const garageEquipment = id === 'garage_cabinet' || id === 'garage_battery_pylontech' || id === 'garage_battery_litime';
    const badge = element.querySelector<HTMLElement>('.photo-badge.mobile-climate')
      ?? (mobile && garageEquipment ? element.querySelector<HTMLElement>('.photo-badge') : null);
    if (mobile && !badge) {
      element.style.width = '0px';
      element.style.maxWidth = '0px';
    } else {
      element.style.width = 'max-content';
      const hasNamedMobileGroups = !!element.querySelector('.photo-mobile-climate.has-mobile-groups');
      const isWideRoom = id === 'bedroom' || id === 'storage';
      const limit = mobile
        ? hasNamedMobileGroups ? Math.min(width - 8, 360)
          : Math.min(isWideRoom ? 105 : 95, width * (isWideRoom ? .27 : .205))
        : Math.min(width - 8, element.querySelector('.has-named-groups') ? 360 : 220);
      element.style.maxWidth = `${Math.max(0, limit)}px`;
    }
    const fallback = mobile
      ? (stage.dataset.sceneSide === 'front' ? FRONT_MOBILE_ROOM_ART_POSITIONS[id] : MOBILE_ROOM_ART_POSITIONS[id])
      : undefined;
    const manualX = element.dataset[mobile ? 'manualMobileX' : 'manualDesktopX'];
    const manualY = element.dataset[mobile ? 'manualMobileY' : 'manualDesktopY'];
    // During editor drag the transient coordinates take priority over the
    // persisted config on *every* reflow. Otherwise a ResizeObserver / Lit
    // update pulls the badge back to its old position between pointer moves.
    const live = activeDrag?.roomId === id ? activeDrag.position : undefined;
    const x = live?.x ?? (manualX === undefined || manualY === undefined
      ? (fallback?.x ?? Number(element.dataset.preferredX)) : Number(manualX));
    const y = live?.y ?? (manualX === undefined || manualY === undefined
      ? (fallback?.y ?? Number(element.dataset.preferredY)) : Number(manualY));
    element.style.left = `${width * x / 100}px`;
    element.style.top = `${imageHeight * y / 100}px`;
    if (garageEquipment) {
      lines.push({ element, rect: { x: width * x / 100 - element.offsetWidth / 2,
        y: imageHeight * y / 100 - element.offsetHeight / 2,
        width: element.offsetWidth, height: element.offsetHeight } });
    }
  }
  const note = stage.querySelector<HTMLElement>('.photo-dock-note');
  if (note) note.hidden = true;
  drawLeaders(stage.querySelector<SVGSVGElement>('.photo-leaders'), lines, width, imageHeight, imageHeight);
}
