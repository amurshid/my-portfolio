/** Shared types for the particle system. */

export type RGB = { r: number; g: number; b: number };

/**
 * One particle target: a position in the buffer's centred coordinate space,
 * plus the colour sampled at that point.
 */
export type Point = { x: number; y: number } & RGB;

/** Per-particle motion parameters. */
export type Particle = {
  /** Angle of this particle's outward scatter during a morph. */
  scatterAngle: number;
  /** Distance travelled outward at peak scatter. */
  scatterRadius: number;
  /** Phase offset, so drift and twinkle are desynchronised. */
  phase: number;
  /** Amplitude of the idle vertical drift. */
  floatAmp: number;
  /** Render radius in px. */
  size: number;
  /** Current cursor-repulsion displacement, eased toward the target each frame. */
  dispX: number;
  dispY: number;
};

/** Options for turning an image into a formation. Presets are in `sampling.ts`. */
export type StateImageOptions = {
  /** Radius of a circular mask, in buffer units. Omit for no mask. */
  clipRadius?: number;
  /** Keep only pixels at or above this luma (0–255). */
  minLuma?: number;
  /** `cover` fills the box and crops overflow; `contain` fits the whole image. */
  fit?: "cover" | "contain";
  /** Edge length of the box the image is scaled into, in buffer units. */
  size?: number;
  /** Sampling stride in px. Smaller yields more candidate points. */
  step?: number;
  /** If set, sample edges (gradient above this value) instead of brightness. */
  edgeThreshold?: number;
  /** Recolour particles to this instead of the image's own colours. */
  tint?: RGB;
  /** Minimum tint brightness, 0-1. */
  tintFloor?: number;
};

/** Elements the engine updates every frame. */
export interface EngineElements {
  canvas: HTMLCanvasElement;
  /** One per formation, indexed by state. */
  panelEls: (HTMLElement | null)[];
  /** One per formation, indexed by state. */
  dotEls: (HTMLElement | null)[];
  scrollHintEl: HTMLElement | null;
}
