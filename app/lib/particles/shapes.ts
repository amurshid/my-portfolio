/**
 * Formations drawn in code. Each one draws white shapes into the buffer with
 * the origin at its centre. A state shows its shape until its image loads.
 */

import { mulberry32 } from "./math";

export type ShapeDrawer = (ctx: CanvasRenderingContext2D) => void;

export type FormationShape = {
  draw: ShapeDrawer;
  /** Sampling step in px. Thin shapes need a smaller step. */
  step: number;
};

type Vec2 = { x: number; y: number };

/** Simple face shown until the portrait loads. */
export const drawFacePlaceholder: ShapeDrawer = (c) => {
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.arc(0, -10, 118, 0, Math.PI * 2);
  c.fill();
  // Cut out the eyes and mouth.
  c.globalCompositeOperation = "destination-out";
  c.beginPath();
  c.arc(-42, -20, 15, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(42, -20, 15, 0, Math.PI * 2);
  c.fill();
  c.lineWidth = 14;
  c.lineCap = "round";
  c.beginPath();
  c.arc(0, 30, 55, 0.18 * Math.PI, 0.82 * Math.PI);
  c.stroke();
  c.globalCompositeOperation = "source-over";
};

/** Rover shown until the render loads. */
export const drawRover: ShapeDrawer = (c) => {
  c.fillStyle = "#fff";
  // chassis
  c.beginPath();
  c.moveTo(-95, -10);
  c.lineTo(-70, -55);
  c.lineTo(70, -55);
  c.lineTo(95, -10);
  c.lineTo(95, 40);
  c.lineTo(-95, 40);
  c.closePath();
  c.fill();
  // wheels
  (
    [
      [-95, 70],
      [0, 85],
      [95, 70],
      [-95, 10],
      [95, 10],
    ] as const
  ).forEach(([x, y]) => {
    c.beginPath();
    c.arc(x, y, 26, 0, Math.PI * 2);
    c.fill();
  });
  // mast
  c.fillRect(-6, -120, 12, 65);
  c.beginPath();
  c.arc(0, -130, 20, 0, Math.PI * 2);
  c.fill();
  // solar panels
  c.fillRect(-165, -20, 60, 55);
  c.fillRect(105, -20, 60, 55);
};

/** Stacked transformer blocks with attention connectors. */
export const drawTransformer: ShapeDrawer = (c) => {
  c.fillStyle = "#fff";
  const blockW = 190;
  const blockH = 46;
  [-95, -20, 55].forEach((y) => {
    c.beginPath();
    const r = 12;
    const x = -blockW / 2;
    c.moveTo(x + r, y);
    c.arcTo(x + blockW, y, x + blockW, y + blockH, r);
    c.arcTo(x + blockW, y + blockH, x, y + blockH, r);
    c.arcTo(x, y + blockH, x, y, r);
    c.arcTo(x, y, x + blockW, y, r);
    c.closePath();
    c.fill();
  });
  c.lineWidth = 5;
  c.strokeStyle = "#fff";
  for (let i = 0; i < 6; i++) {
    const x1 = -85 + i * 34;
    const x2 = -85 + ((i * 2) % 7) * 27;
    c.beginPath();
    c.moveTo(x1, -49);
    c.lineTo(x2, 26);
    c.stroke();
    c.beginPath();
    c.moveTo(x1, 26);
    c.lineTo(x2, 101);
    c.stroke();
  }
};

/**
 * Outline of one lung as a polygon, so it can also be used for point-in-polygon
 * tests. Pass `sx = -1` to mirror it.
 */
export function lungOutline(sx: number): Vec2[] {
  const P = (x: number, y: number): Vec2 => ({ x: sx * x, y });
  const segments: [Vec2, Vec2, Vec2, Vec2][] = [
    // outer border: apex, bulging out and down to the base
    [P(22, -134), P(78, -130), P(124, -62), P(127, 8)],
    [P(127, 8), P(130, 76), P(110, 122), P(76, 125)],
    // base, curving back toward the midline
    [P(76, 125), P(60, 126), P(53, 112), P(51, 95)],
    // medial border, converging on the apex
    [P(51, 95), P(45, 38), P(30, -34), P(22, -134)],
  ];
  const poly: Vec2[] = [];
  const STEPS = 44;
  for (const [p0, p1, p2, p3] of segments) {
    for (let i = 0; i < STEPS; i++) {
      const t = i / STEPS;
      const u = 1 - t;
      poly.push({
        x:
          u * u * u * p0.x +
          3 * u * u * t * p1.x +
          3 * u * t * t * p2.x +
          t * t * t * p3.x,
        y:
          u * u * u * p0.y +
          3 * u * u * t * p1.y +
          3 * u * t * t * p2.y +
          t * t * t * p3.y,
      });
    }
  }
  return poly;
}

/** Even-odd ray cast: is (x, y) inside the polygon? */
function pointInPolygon(poly: Vec2[], x: number, y: number): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (
      a.y > y !== b.y > y &&
      x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x
    ) {
      hit = !hit;
    }
  }
  return hit;
}

/**
 * Lungs as a point cloud: dense along the outline and around the hilum, thinner
 * toward the edges, with short lines between nearby points.
 */
export const drawLungs: ShapeDrawer = (c) => {
  c.strokeStyle = "#fff";
  c.fillStyle = "#fff";
  c.lineCap = "round";
  c.lineJoin = "round";

  const rand = mulberry32(0x10c6);

  for (const sx of [1, -1]) {
    const poly = lungOutline(sx);
    const pts: { x: number; y: number; big: boolean }[] = [];

    // Outline, jittered
    for (const p of poly) {
      for (let k = 0; k < 2; k++) {
        pts.push({
          x: p.x + (rand() - 0.5) * 7,
          y: p.y + (rand() - 0.5) * 7,
          big: rand() < 0.16,
        });
      }
    }

    // Interior, rejection-sampled and weighted toward the hilum
    const coreX = sx * 62;
    const coreY = 6;
    let placed = 0;
    for (let guard = 0; guard < 24000 && placed < 780; guard++) {
      const x = sx * (14 + rand() * 122);
      const y = -140 + rand() * 272;
      if (!pointInPolygon(poly, x, y)) continue;
      const d = Math.hypot(x - coreX, y - coreY);
      const density = Math.exp(-(d * d) / (2 * 74 * 74));
      if (rand() > 0.22 + 0.78 * density) continue;
      pts.push({ x, y, big: rand() < 0.13 });
      placed++;
    }

    // Link each point to up to two close neighbours
    c.lineWidth = 0.8;
    for (let i = 0; i < pts.length; i++) {
      let links = 0;
      for (let j = i + 1; j < pts.length && links < 2; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        if (dx * dx + dy * dy > 121) continue;
        c.beginPath();
        c.moveTo(pts[i].x, pts[i].y);
        c.lineTo(pts[j].x, pts[j].y);
        c.stroke();
        links++;
      }
    }

    for (const p of pts) {
      c.beginPath();
      c.arc(p.x, p.y, p.big ? 2.4 : 1.15, 0, Math.PI * 2);
      c.fill();
    }

    // A few stray points outside the lung
    for (let i = 0; i < 26; i++) {
      const a = rand() * Math.PI * 2;
      const r = 140 + rand() * 46;
      c.beginPath();
      c.arc(
        coreX + Math.cos(a) * r * 0.85,
        coreY + Math.sin(a) * r,
        rand() < 0.3 ? 2 : 1.1,
        0,
        Math.PI * 2
      );
      c.fill();
    }
  }

  // Trachea and bronchi
  const stem: Vec2[] = [];
  for (let i = 0; i <= 26; i++) stem.push({ x: 0, y: -150 + i * 1.5 });
  for (const sx of [1, -1]) {
    for (let i = 0; i <= 34; i++) {
      const t = i / 34;
      const u = 1 - t;
      stem.push({
        x: 2 * u * t * (sx * 22) + t * t * (sx * 40),
        y: u * u * -112 + 2 * u * t * -96 + t * t * -18,
      });
    }
  }
  c.lineWidth = 0.8;
  for (let i = 1; i < stem.length; i++) {
    const a = stem[i - 1];
    const b = stem[i];
    if (Math.hypot(a.x - b.x, a.y - b.y) > 14) continue;
    c.beginPath();
    c.moveTo(a.x, a.y);
    c.lineTo(b.x, b.y);
    c.stroke();
  }
  for (const p of stem) {
    c.beginPath();
    c.arc(
      p.x + (rand() - 0.5) * 3,
      p.y + (rand() - 0.5) * 3,
      1.5,
      0,
      Math.PI * 2
    );
    c.fill();
  }
};

/** Decision tree over a cluster of samples, with a note glyph. */
export const drawTree: ShapeDrawer = (c) => {
  const rand = mulberry32(0x7a3f);
  c.strokeStyle = "#fff";
  c.lineWidth = 6;
  c.lineCap = "round";
  const nodes = [
    [0, -110],
    [-70, -40],
    [70, -40],
    [-110, 30],
    [-30, 30],
    [40, 30],
    [105, 30],
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 6],
  ];
  edges.forEach(([a, b]) => {
    c.beginPath();
    c.moveTo(nodes[a][0], nodes[a][1]);
    c.lineTo(nodes[b][0], nodes[b][1]);
    c.stroke();
  });
  c.fillStyle = "#fff";
  nodes.forEach(([x, y]) => {
    c.beginPath();
    c.arc(x, y, 15, 0, Math.PI * 2);
    c.fill();
  });
  // sample cluster
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2;
    const r = 20 + rand() * 55;
    c.beginPath();
    c.arc(-30 + Math.cos(a) * r, 110 + Math.sin(a) * r * 0.6, 6, 0, Math.PI * 2);
    c.fill();
  }
  // note glyph
  c.beginPath();
  c.ellipse(90, 118, 13, 10, -0.3, 0, Math.PI * 2);
  c.fill();
  c.fillRect(100, 55, 7, 65);
};

/** Shape for each state, in order. */
export const FORMATION_SHAPES: FormationShape[] = [
  { draw: drawFacePlaceholder, step: 2 },
  { draw: drawRover, step: 2 },
  { draw: drawTransformer, step: 2 },
  // Thin lines and dots, so sample every pixel.
  { draw: drawLungs, step: 1 },
  { draw: drawTree, step: 2 },
];
