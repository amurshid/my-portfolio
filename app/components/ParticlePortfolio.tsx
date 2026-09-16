"use client";

import { useEffect, useRef } from "react";
import { preload } from "react-dom";
import { PORTFOLIO_STATES, STATE_IMAGES } from "@/app/content/projects";
import { useSmoothScrollTo } from "@/app/hooks/useSmoothScrollTo";
import { N_STATES } from "@/app/lib/particles/config";
import { ParticleEngine } from "@/app/lib/particles/engine";
import { COLORS, FONT_BODY, Z } from "@/app/lib/theme";
import BrandHeader from "./BrandHeader";
import NavDots from "./NavDots";
import ProjectPanels from "./ProjectPanels";
import ScrollHint from "./ScrollHint";
import SocialLinks from "./SocialLinks";

/**
 * Sets up the particle engine and lays out the page. The engine updates the
 * canvas, panels and dots itself, so this only renders once.
 *
 * The page is one viewport tall per state plus a bit extra. The canvas is
 * fixed, so scrolling just drives the morph.
 */
const PORTRAIT_SRC = STATE_IMAGES.find((s) => s.index === 0)!.src;

export default function ParticlePortfolio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const scrollToState = useSmoothScrollTo();

  // Start fetching the portrait with the page instead of after hydration,
  // since nothing is drawn until it arrives.
  preload(PORTRAIT_SRC, { as: "image" });

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new ParticleEngine({
      canvas: canvasRef.current,
      panelEls: panelRefs.current,
      dotEls: dotRefs.current,
      scrollHintEl: scrollHintRef.current,
    });
    engine.start();

    // The particles appear once the portrait is ready, so the placeholder face
    // never flashes. If the portrait fails, the placeholder is shown instead.
    // Other states use their procedural shape until their image loads.
    const images: HTMLImageElement[] = [];
    for (const { index, src, options } of STATE_IMAGES) {
      const img = new Image();
      img.onload = () => {
        engine.setStateImage(index, img, options);
        if (index === 0) engine.reveal();
      };
      if (index === 0) img.onerror = () => engine.reveal();
      img.src = src;
      images.push(img);
    }

    return () => {
      for (const img of images) {
        img.onload = null;
        img.onerror = null;
      }
      engine.destroy();
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: `${N_STATES * 100 + 20}vh`,
        background: COLORS.background,
        fontFamily: FONT_BODY,
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: Z.canvas,
          display: "block",
        }}
      />

      <BrandHeader />
      <SocialLinks />
      <ScrollHint elementRef={scrollHintRef} />
      <NavDots
        states={PORTFOLIO_STATES}
        dotRefs={dotRefs}
        onNavigate={scrollToState}
      />
      <ProjectPanels states={PORTFOLIO_STATES} panelRefs={panelRefs} />
    </div>
  );
}
