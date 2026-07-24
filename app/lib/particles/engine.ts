/**
 * Scroll-driven particle morph engine.
 *
 * Runs its own `requestAnimationFrame` loop and sets styles on the elements it
 * is given, so React doesn't re-render while scrolling.
 *
 * Usage: `new ParticleEngine(elements)`, then `start()`, then `destroy()`.
 */

import {
  BUFFER_SIZE,
  FORMATION_CENTER_Y,
  MOUSE_REPEL_RADIUS,
  MOUSE_REPEL_STRENGTH,
  N_STATES,
  PARTICLE_COUNT,
  SEGMENT_HOLD,
} from "./config";
import { clamp, lerp, segmentMorphProgress, smoothstep } from "./math";
import {
  applyTint,
  normalizeToCount,
  rasterizeImage,
  resetBuffer,
  sampleBuffer,
} from "./sampling";
import { FORMATION_SHAPES } from "./shapes";
import { COLORS } from "../theme";
import type {
  EngineElements,
  Particle,
  Point,
  StateImageOptions,
} from "./types";

export class ParticleEngine {
  private canvasEl: HTMLCanvasElement;
  private panelEls: (HTMLElement | null)[];
  private dotEls: (HTMLElement | null)[];
  private scrollHintEl: HTMLElement | null;

  private ctx!: CanvasRenderingContext2D;
  private buffer!: HTMLCanvasElement;

  private mouse = { x: -9999, y: -9999 };
  /** Particle targets per formation, all of length `PARTICLE_COUNT`. */
  private targets: Point[][] = [];
  private particles: Particle[] = [];
  /** Image-backed formations, replayed whenever shapes are rebuilt. */
  private stateImages = new Map<
    number,
    { img: HTMLImageElement; opts: StateImageOptions }
  >();

  private raf = 0;
  private startTime = 0;

  private vw = 0;
  private vh = 0;
  private centerX = 0;
  private centerY = 0;
  private scale = 1;

  private onResize = () => {
    this.resize();
    this.buildAllShapes();
  };
  private onMouseMove = (e: MouseEvent) => {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  };

  constructor(els: EngineElements) {
    this.canvasEl = els.canvas;
    this.panelEls = els.panelEls;
    this.dotEls = els.dotEls;
    this.scrollHintEl = els.scrollHintEl;
  }

  /** Build formations, attach listeners, and begin the render loop. */
  start(): void {
    this.buffer = document.createElement("canvas");
    this.buffer.width = BUFFER_SIZE;
    this.buffer.height = BUFFER_SIZE;
    // Shape building calls getImageData on this a lot.
    this.buffer.getContext("2d", { willReadFrequently: true });

    this.ctx = this.canvasEl.getContext("2d")!;
    this.resize();
    this.buildAllShapes();
    this.initParticles();

    window.addEventListener("resize", this.onResize);
    window.addEventListener("mousemove", this.onMouseMove);

    this.startTime = performance.now();
    this.tick = this.tick.bind(this);
    this.raf = requestAnimationFrame(this.tick);
  }

  /** Stop the loop and remove listeners. */
  destroy(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("mousemove", this.onMouseMove);
  }

  /**
   * Build a state's formation from a loaded image instead of its procedural
   * shape. The image is kept so the formation can be rebuilt on resize.
   */
  setStateImage(
    index: number,
    imgEl: HTMLImageElement,
    opts: StateImageOptions = {}
  ): void {
    if (index < 0 || index >= N_STATES) return;
    this.stateImages.set(index, { img: imgEl, opts });
    this.rebuildStateFromImage(index, imgEl, opts);
  }

  private get bufferCtx(): CanvasRenderingContext2D {
    return this.buffer.getContext("2d")!;
  }

  private resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvasEl.width = w * dpr;
    this.canvasEl.height = h * dpr;
    this.canvasEl.style.width = w + "px";
    this.canvasEl.style.height = h + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.vw = w;
    this.vh = h;
    this.centerX = w / 2;
    this.centerY = h * FORMATION_CENTER_Y;
    this.scale = clamp((Math.min(w, h) / BUFFER_SIZE) * 0.62, 0.55, 1.35);
  }

  /** Rasterise every procedural shape, then replay any image-backed states. */
  private buildAllShapes(): void {
    this.targets = FORMATION_SHAPES.map((shape) => {
      const c = resetBuffer(this.bufferCtx);
      shape.draw(c);
      return normalizeToCount(
        sampleBuffer(this.bufferCtx, shape.step),
        PARTICLE_COUNT
      );
    });
    this.stateImages.forEach(({ img, opts }, index) =>
      this.rebuildStateFromImage(index, img, opts)
    );
  }

  private rebuildStateFromImage(
    index: number,
    imgEl: HTMLImageElement,
    opts: StateImageOptions
  ): void {
    if (!this.targets.length) return;
    const {
      minLuma = 0,
      step = 2,
      edgeThreshold = 0,
      tint,
      tintFloor = 0.7,
    } = opts;

    const c = resetBuffer(this.bufferCtx);
    rasterizeImage(c, imgEl, opts);

    let pts = sampleBuffer(this.bufferCtx, step, minLuma, edgeThreshold);
    if (tint) pts = applyTint(pts, tint, tintFloor);
    this.targets[index] = normalizeToCount(pts, PARTICLE_COUNT);
  }

  private initParticles(): void {
    this.particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      this.particles.push({
        scatterAngle: Math.random() * Math.PI * 2,
        scatterRadius: 260 + Math.random() * 520,
        phase: Math.random() * Math.PI * 2,
        floatAmp: 4 + Math.random() * 10,
        // Mostly small so facial detail shows, with ~10% larger ones.
        size:
          Math.random() < 0.1
            ? 1.15 + Math.random() * 0.85
            : 0.5 + Math.random() * 0.6,
        dispX: 0,
        dispY: 0,
      });
    }
  }

  /** Per-frame: derive scroll state, update chrome, then draw the particles. */
  private tick(now: number): void {
    const t = (now - this.startTime) / 1000;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const progress = clamp(scrollY / window.innerHeight, 0, N_STATES - 1);
    const idxA = clamp(Math.floor(progress), 0, N_STATES - 2);
    const idxB = idxA + 1;
    const frac = clamp(progress - idxA, 0, 1);
    const segT = segmentMorphProgress(frac, SEGMENT_HOLD);
    const scatter = Math.sin(segT * Math.PI); // 0 → 1 → 0
    const morphT = smoothstep(segT);

    this.updatePanels(idxA, idxB, morphT);
    this.updateDots(progress);
    if (this.scrollHintEl) {
      this.scrollHintEl.style.opacity = progress < 0.15 ? "1" : "0";
    }

    this.drawParticles(t, idxA, idxB, morphT, scatter);
    this.raf = requestAnimationFrame(this.tick);
  }

  private updatePanels(idxA: number, idxB: number, morphT: number): void {
    for (let s = 0; s < N_STATES; s++) {
      const el = this.panelEls[s];
      if (!el) continue;
      // Same morph value as the particles. The old panel is gone by the
      // midpoint and the new one only starts fading in after it.
      let op = 0;
      if (s === idxA) op = clamp(1 - morphT * 2, 0, 1);
      else if (s === idxB) op = clamp(morphT * 2 - 1, 0, 1);
      el.style.opacity = op.toFixed(3);
      el.style.transform = "translate(-50%," + (1 - op) * 16 + "px)";
      // Panels are stacked, so hidden ones would otherwise block clicks on the
      // visible one. pointer-events isn't enough since the links re-enable it.
      el.style.visibility = op < 0.02 ? "hidden" : "visible";
    }
  }

  private updateDots(progress: number): void {
    for (let s = 0; s < N_STATES; s++) {
      const dot = this.dotEls[s];
      if (!dot) continue;
      const active = Math.round(progress) === s;
      const accent = s % 2 === 0 ? COLORS.cyan : COLORS.violet;
      dot.style.background = active ? accent : "transparent";
      dot.style.borderColor = accent;
      dot.style.transform = active ? "scale(1.4)" : "scale(1)";
    }
  }

  /** Hot path, so everything is inlined in one loop. */
  private drawParticles(
    t: number,
    idxA: number,
    idxB: number,
    morphT: number,
    scatter: number
  ): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.vw, this.vh);
    const A = this.targets[idxA];
    const B = this.targets[idxB];
    if (!A || !B) return;

    const scaleF = this.scale;
    const cx = this.centerX;
    const cy = this.centerY;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = this.particles[i];
      const a = A[i];
      const b = B[i];

      // Lerp between formations and scatter outward mid-morph.
      const bx = lerp(a.x, b.x, morphT) * scaleF;
      const by = lerp(a.y, b.y, morphT) * scaleF;
      const drift =
        Math.sin(t * 0.6 + p.phase) * p.floatAmp * (0.3 + scatter * 0.7);
      const sx = Math.cos(p.scatterAngle) * p.scatterRadius * scatter;
      const sy = Math.sin(p.scatterAngle) * p.scatterRadius * scatter + drift;

      let px = cx + bx + sx;
      let py = cy + by + sy;

      // Push away from the cursor, eased.
      const mdx = px - this.mouse.x;
      const mdy = py - this.mouse.y;
      const dist = Math.sqrt(mdx * mdx + mdy * mdy);
      let dsx = 0;
      let dsy = 0;
      if (dist < MOUSE_REPEL_RADIUS && dist > 0.01) {
        const f = (1 - dist / MOUSE_REPEL_RADIUS) * MOUSE_REPEL_STRENGTH;
        dsx = (mdx / dist) * f;
        dsy = (mdy / dist) * f;
      }
      p.dispX += (dsx - p.dispX) * 0.18;
      p.dispY += (dsy - p.dispY) * 0.18;
      px += p.dispX;
      py += p.dispY;

      const rr = lerp(a.r, b.r, morphT);
      const gg = lerp(a.g, b.g, morphT);
      const bb = lerp(a.b, b.b, morphT);
      const alpha =
        0.55 +
        0.35 * (1 - scatter * 0.5) * (0.7 + 0.3 * Math.sin(t * 2 + p.phase));

      ctx.fillStyle = `rgba(${rr | 0},${gg | 0},${bb | 0},${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
