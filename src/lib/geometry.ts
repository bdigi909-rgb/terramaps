/**
 * Geometry utilities for SRM (Topographie & Cartographie)
 */

export interface Point2D { x: number; y: number }
export interface Point3D { x: number; y: number; z: number }

/** Euclidean distance between two 2D points */
export function dist2D(a: Point2D, b: Point2D) {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

/** Bearing (radians) from a to b, from North, clockwise */
export function bearing(a: Point2D, b: Point2D) {
  return Math.atan2(b.x - a.x, b.y - a.y);
}

/** Interpolate a point along a polyline at given distance */
export function interpolatePolyline(pts: Point2D[], dist: number): Point2D | null {
  let accumulated = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const d = dist2D(pts[i], pts[i + 1]);
    if (accumulated + d >= dist) {
      const t = (dist - accumulated) / d;
      return {
        x: pts[i].x + t * (pts[i + 1].x - pts[i].x),
        y: pts[i].y + t * (pts[i + 1].y - pts[i].y),
      };
    }
    accumulated += d;
  }
  return pts[pts.length - 1] ?? null;
}

/** Total polyline length */
export function polylineLength(pts: Point2D[]) {
  let len = 0;
  for (let i = 0; i < pts.length - 1; i++) len += dist2D(pts[i], pts[i + 1]);
  return len;
}

/** Generate arc points from center, radius, start/end angle */
export function arcPoints(
  cx: number, cy: number, r: number,
  startAngle: number, endAngle: number,
  steps = 32
): Point2D[] {
  const pts: Point2D[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = startAngle + (endAngle - startAngle) * (i / steps);
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

/** Simple Delaunay-ish triangulation placeholder (convex hull fan) */
export function triangulate(points: Point3D[]) {
  if (points.length < 3) return [];
  const triangles: [Point3D, Point3D, Point3D][] = [];
  for (let i = 1; i < points.length - 1; i++) {
    triangles.push([points[0], points[i], points[i + 1]]);
  }
  return triangles;
}

/** Compute elevation at a given (x, y) using barycentric interpolation in a triangle */
export function elevationInTriangle(
  p: Point2D,
  t: [Point3D, Point3D, Point3D]
): number | null {
  const [a, b, c] = t;
  const denom = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
  if (Math.abs(denom) < 1e-10) return null;
  const w1 = ((b.y - c.y) * (p.x - c.x) + (c.x - b.x) * (p.y - c.y)) / denom;
  const w2 = ((c.y - a.y) * (p.x - c.x) + (a.x - c.x) * (p.y - c.y)) / denom;
  const w3 = 1 - w1 - w2;
  if (w1 < 0 || w2 < 0 || w3 < 0) return null;
  return w1 * a.z + w2 * b.z + w3 * c.z;
}

/** Trapezoidal volume between two cross sections */
export function trapezoidalVolume(
  cutA: number, fillA: number,
  cutB: number, fillB: number,
  distance: number
) {
  const cut = ((cutA + cutB) / 2) * distance;
  const fill = ((fillA + fillB) / 2) * distance;
  return { cut, fill, net: cut - fill };
}

/** Generate sample terrain points for demonstration */
export function generateSampleTerrain(
  centerX = 500, centerY = 500, count = 60, spread = 400
): Point3D[] {
  const pts: Point3D[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const r = Math.random() * spread;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    // Synthetic elevation: bowl shape + noise
    const z = 100 - 0.0003 * ((x - centerX) ** 2 + (y - centerY) ** 2) + (Math.random() - 0.5) * 10;
    pts.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100, z: Math.round(z * 100) / 100 });
  }
  return pts;
}

/** Generate cross-section profile */
export function generateCrossSection(
  station: number,
  groundElevation: number,
  roadElevation: number,
  halfWidth = 10
) {
  const dz = groundElevation - roadElevation;
  const leftProfile = [
    { offset: -halfWidth - 4, z: groundElevation + Math.random() * 2 },
    { offset: -halfWidth, z: groundElevation },
    { offset: 0, z: roadElevation },
    { offset: halfWidth, z: groundElevation },
    { offset: halfWidth + 4, z: groundElevation + Math.random() * 2 },
  ];
  const cutArea = dz > 0 ? (dz * halfWidth) : 0;
  const fillArea = dz < 0 ? (Math.abs(dz) * halfWidth) : 0;
  return { station, profileData: leftProfile, cutArea, fillArea, groundElevation, roadElevation };
}

