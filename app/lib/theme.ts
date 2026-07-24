/** Fonts, colours and z-index layers shared across the page. */

export const FONT_DISPLAY =
  "var(--font-space-grotesk), 'Space Grotesk', sans-serif";
export const FONT_BODY = "var(--font-inter), 'Inter', sans-serif";

export const COLORS = {
  /** Page background. */
  background: "#0a0a0f",
  /** Headings and brand text. */
  text: "#f4f6fb",
  /** Body copy. */
  muted: "#9aa2b6",
  /** Secondary chrome: scroll hint, social icons at rest. */
  dim: "#8b93a7",
  /** Primary accent. */
  cyan: "#7dd3fc",
  cyanBorder: "rgba(125,211,252,0.35)",
  cyanWash: "rgba(125,211,252,0.1)",
  /** Alternate accent, used on even-numbered projects. */
  violet: "#a78bfa",
  /** Tag chip text and border. */
  chipText: "#c9d1e6",
  chipBorder: "#2a3245",
} as const;

/** Stacking order for the fixed-position layers. */
export const Z = {
  canvas: 1,
  chrome: 4,
} as const;
