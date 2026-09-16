import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { mulberry32 } from "@/app/lib/particles/math";
import { SITE } from "@/app/lib/site";
import { COLORS } from "@/app/lib/theme";

export const alt = `${SITE.name}, ${SITE.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ImageResponse can't use next/font, so it reads TTFs from app/fonts.
const font = (file: string) => readFile(join(process.cwd(), "app/fonts", file));

/** A seeded cloud of dots, like the hero formation mid-morph. */
function particleCloud() {
  const rand = mulberry32(0x5eed);
  const cx = 910;
  const cy = 315;
  return Array.from({ length: 900 }, (_, i) => {
    const a = rand() * Math.PI * 2;
    // Mostly a filled disc, with some strays drifting outside it.
    const r = rand() < 0.9 ? Math.sqrt(rand()) * 190 : 190 + rand() * 90;
    const pick = rand();
    const color = pick < 0.14 ? COLORS.violet : pick < 0.34 ? COLORS.cyan : COLORS.text;
    const d = rand() < 0.1 ? 4 + rand() * 2 : 1.6 + rand() * 1.8;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: cx + Math.cos(a) * r,
          top: cy + Math.sin(a) * r,
          width: d,
          height: d,
          borderRadius: "50%",
          background: color,
          opacity: 0.35 + rand() * 0.6,
        }}
      />
    );
  });
}

export default async function OpengraphImage() {
  const [display, body] = await Promise.all([
    font("SpaceGrotesk-Bold.ttf"),
    font("Inter-Regular.ttf"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: COLORS.background,
        }}
      >
        {particleCloud()}
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 0,
            bottom: 0,
            width: 600,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Space Grotesk",
              fontSize: 22,
              color: COLORS.cyan,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {SITE.role}
          </div>
          <div
            style={{
              fontFamily: "Space Grotesk",
              fontSize: 76,
              fontWeight: 700,
              color: COLORS.text,
              marginTop: 14,
              lineHeight: 1.05,
            }}
          >
            {SITE.name}
          </div>
          <div
            style={{
              fontFamily: "Inter",
              fontSize: 28,
              color: COLORS.muted,
              marginTop: 26,
              lineHeight: 1.45,
            }}
          >
            {SITE.tagline}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Space Grotesk", data: display, weight: 700, style: "normal" },
        { name: "Inter", data: body, weight: 400, style: "normal" },
      ],
    }
  );
}
