import type { Ref } from "react";
import { COLORS, Z } from "@/app/lib/theme";

type Props = {
  /** The engine fades this element out once scrolling begins. */
  elementRef: Ref<HTMLDivElement>;
};

/** "Scroll" prompt with a fading rule, centred at the bottom of the hero. */
export default function ScrollHint({ elementRef }: Props) {
  return (
    <div
      ref={elementRef}
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: Z.chrome,
        pointerEvents: "none",
        color: COLORS.dim,
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        transition: "opacity 0.4s",
      }}
    >
      <span>Scroll</span>
      <div
        style={{
          width: 1,
          height: 26,
          background: `linear-gradient(${COLORS.cyan},transparent)`,
        }}
      />
    </div>
  );
}
