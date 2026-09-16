import { SITE } from "@/app/lib/site";
import { COLORS, FONT_DISPLAY, Z } from "@/app/lib/theme";

/** Name and title, fixed top-left. */
export default function BrandHeader() {
  return (
    <div
      style={{
        position: "fixed",
        top: 36,
        left: 40,
        zIndex: Z.chrome,
        pointerEvents: "none",
        fontFamily: FONT_DISPLAY,
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: COLORS.text,
          letterSpacing: "0.01em",
        }}
      >
        {SITE.name}
      </div>
      <div
        style={{
          fontSize: 12,
          color: COLORS.cyan,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginTop: 2,
        }}
      >
        {SITE.role}
      </div>
    </div>
  );
}
