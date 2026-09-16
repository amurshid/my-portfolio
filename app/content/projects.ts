/** Portfolio copy, links and images. */

import {
  MODEL_IMAGE_OPTIONS,
  PARTICLE_ART_IMAGE_OPTIONS,
  PORTRAIT_IMAGE_OPTIONS,
} from "@/app/lib/particles/sampling";
import type { StateImageOptions } from "@/app/lib/particles/types";
import { SITE } from "@/app/lib/site";
import { COLORS } from "@/app/lib/theme";

export type PortfolioState = {
  /** Small uppercase label above the title. */
  eyebrow: string;
  eyebrowColor: string;
  title: string;
  description?: string;
  tags: string[];
  /** Accessible name for this state's navigation dot. */
  ariaLabel: string;
  /** GitHub repo URL, optional. */
  repo?: string;
};

/** State 0 is the hero; states 1–4 are the projects, in scroll order. */
export const PORTFOLIO_STATES: PortfolioState[] = [
  {
    eyebrow: "Hey, I'm Ahnaf",
    eyebrowColor: COLORS.cyan,
    title: SITE.tagline,
    tags: [],
    ariaLabel: "Intro",
  },
  {
    eyebrow: "Project 01",
    eyebrowColor: COLORS.cyan,
    title: "Autonomous Rover Terrain Navigation",
    description:
      "A perception and path-planning stack that lets a rover cross unstructured terrain without human input.",
    tags: ["ROS", "SLAM", "Computer Vision"],
    ariaLabel: "Project 1",
    repo: "https://github.com/amurshid/autonomous-rover",
  },
  {
    eyebrow: "Project 02",
    eyebrowColor: COLORS.violet,
    title: "Robustifying ET-BERT for Encrypted Traffic",
    description:
      "Research into adversarial robustness of transformer-based traffic classifiers under distribution shift.",
    tags: ["Transformers", "PyTorch", "Adversarial ML"],
    ariaLabel: "Project 2",
    repo: "https://github.com/amurshid/selective-masking-etbert",
  },
  {
    eyebrow: "Project 03",
    eyebrowColor: COLORS.cyan,
    title: "2D CNN for Lung Cancer CT Classification",
    description:
      "A convolutional network that flags malignant nodules in chest CT slices to support radiologist triage.",
    tags: ["CNN", "Medical Imaging", "Keras"],
    ariaLabel: "Project 3",
    repo: "https://github.com/amurshid/2D-CNN-Model-LC-Preclinical",
  },
  {
    eyebrow: "Project 04",
    eyebrowColor: COLORS.violet,
    title: "Classical ML Music Recommender",
    description:
      "Random forests and clustering over audio features to recommend songs, no deep learning required.",
    tags: ["Random Forest", "Clustering", "scikit-learn"],
    ariaLabel: "Project 4",
    repo: "https://github.com/amurshid/Spotify-Streaming-Dashboard",
  },
];

export type StateImage = {
  /** Index into `PORTFOLIO_STATES`. */
  index: number;
  src: string;
  options: StateImageOptions;
};

/**
 * Images used for each formation. States not listed here keep their shape from
 * `shapes.ts`. `minLuma` depends on how dark each image's background is.
 */
export const STATE_IMAGES: StateImage[] = [
  { index: 0, src: "/portrait.png", options: PORTRAIT_IMAGE_OPTIONS },
  { index: 1, src: "/rover.png", options: MODEL_IMAGE_OPTIONS },
  {
    index: 2,
    src: "/internet.png",
    options: { ...PARTICLE_ART_IMAGE_OPTIONS, minLuma: 120 },
  },
  {
    index: 3,
    src: "/lung.png",
    options: { ...PARTICLE_ART_IMAGE_OPTIONS, minLuma: 45 },
  },
  {
    index: 4,
    src: "/spotify.png",
    options: { ...PARTICLE_ART_IMAGE_OPTIONS, minLuma: 70 },
  },
];
