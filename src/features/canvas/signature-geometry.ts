export interface Point {
  x: number;
  y: number;
}

export type Stroke = Point[];

export interface GuideLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const GUIDE_ANGLE_DEG = 12;
export const MIN_POINT_DISTANCE = 1.6;
export const SIGNATURE_STROKE_WIDTH = 2.6;
export const EXPORT_INK = '#D4AF37';

export function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function toSvgPath(stroke: Stroke): string {
  const first = stroke[0];
  if (first === undefined) {
    return '';
  }
  if (stroke.length === 1) {
    return `M ${first.x} ${first.y} L ${first.x + 0.01} ${first.y}`;
  }
  return stroke
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

export function computeGuide(
  width: number,
  height: number,
): GuideLine | null {
  if (width < 8 || height < 8) {
    return null;
  }
  const pad = Math.max(18, width * 0.06);
  const x1 = pad;
  const x2 = width - pad;
  const rise = Math.tan((GUIDE_ANGLE_DEG * Math.PI) / 180) * (x2 - x1);
  const y1 = Math.min(height * 0.62, height - pad);
  const y2 = Math.max(pad, y1 - rise);
  return { x1, y1, x2, y2 };
}

function orientation(origin: Point, terminus: Point, probe: Point): number {
  return (terminus.x - origin.x) * (probe.y - origin.y) - (terminus.y - origin.y) * (probe.x - origin.x);
}

/** True when the stroke segment crosses the 12° guide segment. */
export function strokeCrossesGuide(prev: Point, next: Point, guide: GuideLine): boolean {
  const start = { x: guide.x1, y: guide.y1 };
  const end = { x: guide.x2, y: guide.y2 };
  const o1 = Math.sign(orientation(prev, next, start));
  const o2 = Math.sign(orientation(prev, next, end));
  const o3 = Math.sign(orientation(start, end, prev));
  const o4 = Math.sign(orientation(start, end, next));
  if (o1 === 0 && o2 === 0 && o3 === 0 && o4 === 0) {
    return false;
  }
  return o1 !== o2 && o3 !== o4;
}
