/** Tuning constants for the particle system. */

/**
 * Number of formations (hero + four projects). Must match `PORTFOLIO_STATES`
 * and `FORMATION_SHAPES`.
 */
export const N_STATES = 5;

/** Particles drawn per frame. Each one is a separate `arc()` + `fill()`. */
export const PARTICLE_COUNT = 3200;

/** Edge length of the square offscreen buffer that shapes are drawn into. */
export const BUFFER_SIZE = 400;

/** Origin of the buffer's centred coordinate space. */
export const BUFFER_CENTER = BUFFER_SIZE / 2;

/**
 * Portrait pixels darker than this luma (0-255) are dropped. Tuned for an
 * inverted black and white photo.
 */
export const FACE_MIN_LUMA = 95;

/**
 * Radius of the portrait's circular mask, in buffer units. 200 covers the whole
 * buffer so the hair and jaw don't get cropped.
 */
export const FACE_CLIP_RADIUS = 200;

/**
 * Fraction of each scroll segment, at each end, where the formation stays fully
 * assembled. Each state is crisp from `state - HOLD` to `state + HOLD`.
 */
export const SEGMENT_HOLD = 0.12;

/**
 * Vertical centre of the formations, as a fraction of viewport height. Sits
 * high so it clears the text panel.
 */
export const FORMATION_CENTER_Y = 0.37;

/** Radius, in px, within which the cursor pushes particles aside. */
export const MOUSE_REPEL_RADIUS = 130;

/** Peak displacement, in px, applied at the centre of the repel radius. */
export const MOUSE_REPEL_STRENGTH = 46;
