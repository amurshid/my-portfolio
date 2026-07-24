"use client";

import type { PortfolioState } from "@/app/content/projects";
import { COLORS, Z } from "@/app/lib/theme";

type Props = {
  states: PortfolioState[];
  /** Filled with each dot for the engine to update. */
  dotRefs: React.RefObject<(HTMLButtonElement | null)[]>;
  onNavigate: (stateIndex: number) => void;
};

/** Vertical dot navigation, centred on the right edge. */
export default function NavDots({ states, dotRefs, onNavigate }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        right: 32,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: Z.chrome,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {states.map((state, i) => (
        <button
          key={state.ariaLabel}
          ref={(el) => {
            dotRefs.current[i] = el;
          }}
          onClick={() => onNavigate(i)}
          aria-label={state.ariaLabel}
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            border: `1px solid ${COLORS.cyan}`,
            background: i === 0 ? COLORS.cyan : "transparent",
            cursor: "pointer",
            padding: 0,
            transition: "transform 0.25s, opacity 0.25s",
          }}
        />
      ))}
    </div>
  );
}
