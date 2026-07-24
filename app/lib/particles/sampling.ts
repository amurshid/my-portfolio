/**
 * Turns pixels in the offscreen buffer into particle targets.
 *
 * Two sampling modes:
 * - brightness: keep pixels above a luma threshold (portrait, particle art)
 * - edges: keep pixels with a strong luma gradient (the rover render, which
 *   comes out as a solid blob with brightness sampling)
 */

import {
  BUFFER_CENTER,
  BUFFER_SIZE,
  FACE_CLIP_RADIUS,
  FACE_MIN_LUMA,
} from "./config";
import { luma } from "./math";
import type { Point, RGB, StateImageOptions } from "./types";

/** Alpha below which a pixel counts as background. */
const ALPHA_FLOOR = 40;

/** Clear the buffer and move the origin to its centre. */
export function resetBuffer(
  ctx: CanvasRenderingContext2D
): CanvasRenderingContext2D {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, BUFFER_SIZE, BUFFER_SIZE);
  ctx.translate(BUFFER_CENTER, BUFFER_CENTER);
  return ctx;
}

/**
 * Sample the buffer every `step` px into points relative to its centre.
 * `minLuma` of 0 keeps every opaque pixel. An `edgeThreshold` above 0 switches
 * to edge sampling and ignores `minLuma`.
 */
export function sampleBuffer(
  ctx: CanvasRenderingContext2D,
  step: number,
  minLuma = 0,
  edgeThreshold = 0
): Point[] {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const data = ctx.getImageData(0, 0, BUFFER_SIZE, BUFFER_SIZE).data;
  const pts: Point[] = [];

  const lumaAt = (x: number, y: number) => {
    const i = (y * BUFFER_SIZE + x) * 4;
    if (data[i + 3] <= ALPHA_FLOOR) return 0;
    return luma(data[i], data[i + 1], data[i + 2]);
  };

  if (edgeThreshold > 0) {
    // Gradient from central differences.
    for (let y = step; y < BUFFER_SIZE - step; y += step) {
      for (let x = step; x < BUFFER_SIZE - step; x += step) {
        const gx = lumaAt(x + step, y) - lumaAt(x - step, y);
        const gy = lumaAt(x, y + step) - lumaAt(x, y - step);
        if (Math.hypot(gx, gy) < edgeThreshold) continue;
        const i = (y * BUFFER_SIZE + x) * 4;
        pts.push({
          x: x - BUFFER_CENTER,
          y: y - BUFFER_CENTER,
          r: data[i],
          g: data[i + 1],
          b: data[i + 2],
        });
      }
    }
    return pts;
  }

  for (let y = 0; y < BUFFER_SIZE; y += step) {
    for (let x = 0; x < BUFFER_SIZE; x += step) {
      const i = (y * BUFFER_SIZE + x) * 4;
      if (data[i + 3] <= ALPHA_FLOOR) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (minLuma > 0 && luma(r, g, b) < minLuma) continue;
      pts.push({ x: x - BUFFER_CENTER, y: y - BUFFER_CENTER, r, g, b });
    }
  }
  return pts;
}

/**
 * Shuffle the points and return exactly `count` of them, since particle i
 * morphs to point i of the next formation. If there aren't enough, jittered
 * copies fill the gap (a smaller step avoids this). Shuffles `rawPoints` in
 * place.
 */
export function normalizeToCount(rawPoints: Point[], count: number): Point[] {
  if (rawPoints.length === 0) {
    rawPoints = [{ x: 0, y: 0, r: 255, g: 255, b: 255 }];
  }
  for (let i = rawPoints.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rawPoints[i], rawPoints[j]] = [rawPoints[j], rawPoints[i]];
  }

  const out: Point[] = [];
  if (rawPoints.length >= count) {
    for (let i = 0; i < count; i++) out.push(rawPoints[i]);
    return out;
  }
  let i = 0;
  while (out.length < count) {
    const p = rawPoints[i % rawPoints.length];
    out.push({
      x: p.x + (Math.random() - 0.5) * 4,
      y: p.y + (Math.random() - 0.5) * 4,
      r: p.r,
      g: p.g,
      b: p.b,
    });
    i++;
  }
  return out;
}

/** Draw an image into the buffer, scaled and optionally clipped to a circle. */
export function rasterizeImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  opts: StateImageOptions
): void {
  const { clipRadius, fit = "cover", size = 300 } = opts;
  ctx.save();
  if (clipRadius) {
    ctx.beginPath();
    ctx.arc(0, 0, clipRadius, 0, Math.PI * 2);
    ctx.clip();
  }
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const s =
    fit === "cover"
      ? Math.max(size / iw, size / ih)
      : Math.min(size / iw, size / ih);
  ctx.drawImage(img, (-iw * s) / 2, (-ih * s) / 2, iw * s, ih * s);
  ctx.restore();
}

/**
 * Recolour points to `tint`, scaled by each point's brightness between `floor`
 * (0-1) and full.
 */
export function applyTint(points: Point[], tint: RGB, floor: number): Point[] {
  return points.map((p) => {
    const k = floor + (1 - floor) * (luma(p.r, p.g, p.b) / 255);
    return { x: p.x, y: p.y, r: tint.r * k, g: tint.g * k, b: tint.b * k };
  });
}

// Sampling presets

/** Inverted black and white portrait, circular crop, bright pixels only. */
export const PORTRAIT_IMAGE_OPTIONS: StateImageOptions = {
  clipRadius: FACE_CLIP_RADIUS,
  minLuma: FACE_MIN_LUMA,
  fit: "cover",
  size: 260,
  step: 2,
};

/**
 * Particle-art illustrations. Step 1 because only a small part of each image is
 * bright. Override `minLuma` per image.
 */
export const PARTICLE_ART_IMAGE_OPTIONS: StateImageOptions = {
  minLuma: 100,
  fit: "contain",
  size: 340,
  step: 1,
  tint: { r: 255, g: 255, b: 255 },
  tintFloor: 0.75,
};

/** Shaded 3D render on black, sampled by edges. */
export const MODEL_IMAGE_OPTIONS: StateImageOptions = {
  fit: "contain",
  size: 340,
  step: 2,
  edgeThreshold: 30,
  tint: { r: 255, g: 255, b: 255 },
  tintFloor: 0.72,
};
