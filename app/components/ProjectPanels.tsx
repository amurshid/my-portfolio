"use client";

import type { PortfolioState } from "@/app/content/projects";
import { COLORS, FONT_BODY, FONT_DISPLAY, Z } from "@/app/lib/theme";
import { GitHubIcon, YouTubeIcon } from "./icons";

type Props = {
  states: PortfolioState[];
  /** Filled with each panel for the engine to fade. */
  panelRefs: React.RefObject<(HTMLDivElement | null)[]>;
};

type LinkChipProps = {
  href: string;
  ariaLabel: string;
  color: string;
  border: string;
  wash: string;
  children: React.ReactNode;
};

/** Outlined link chip shown after the tags. */
function LinkChip({ href, ariaLabel, color, border, wash, children }: LinkChipProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color,
        border: `1px solid ${border}`,
        padding: "5px 12px",
        borderRadius: 20,
        textDecoration: "none",
        transition: "background 0.22s, border-color 0.22s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = wash;
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = border;
      }}
    >
      {children}
    </a>
  );
}

/** "View repository" and "YouTube" chips, when the project has them. */
function ProjectLinks({ state }: { state: PortfolioState }) {
  return (
    <>
      {state.repo && (
        <LinkChip
          href={state.repo}
          ariaLabel={`${state.title} — view source on GitHub`}
          color={COLORS.cyan}
          border={COLORS.cyanBorder}
          wash={COLORS.cyanWash}
        >
          <GitHubIcon size={13} />
          View repository
        </LinkChip>
      )}
      {state.video && (
        <LinkChip
          href={state.video}
          ariaLabel={`${state.title} — watch the showcase video on YouTube`}
          color={COLORS.red}
          border={COLORS.redBorder}
          wash={COLORS.redWash}
        >
          <YouTubeIcon size={13} />
          YouTube
        </LinkChip>
      )}
    </>
  );
}

/** Panel heading. Project titles link to their repo. */
function PanelTitle({ state, isHero }: { state: PortfolioState; isHero: boolean }) {
  if (isHero) {
    return (
      <h1
        style={{
          fontSize: "clamp(22px,2.6vw,32px)",
          color: COLORS.text,
          fontWeight: 600,
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {state.title}
      </h1>
    );
  }
  return (
    <h2
      style={{
        fontSize: "clamp(24px,3.4vw,36px)",
        color: COLORS.text,
        fontWeight: 600,
        margin: 0,
      }}
    >
      {state.repo ? (
        <a
          href={state.repo}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "inherit",
            textDecoration: "none",
            pointerEvents: "auto",
            transition: "color 0.22s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = COLORS.cyan;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "inherit";
          }}
        >
          {state.title}
        </a>
      ) : (
        state.title
      )}
    </h2>
  );
}

/** One text panel per state, stacked in place. The engine fades between them. */
export default function ProjectPanels({ states, panelRefs }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: "9%",
        transform: "translateX(-50%)",
        zIndex: Z.chrome,
        width: "min(640px,86vw)",
        textAlign: "center",
        // Links and chips turn pointer events back on.
        pointerEvents: "none",
      }}
    >
      {states.map((state, i) => {
        const isHero = i === 0;
        return (
          <div
            key={state.ariaLabel}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            style={{
              position: "absolute",
              left: "50%",
              bottom: 0,
              transform: "translate(-50%,0)",
              width: "100%",
              opacity: isHero ? 1 : 0,
              // Keeps the intro heading clear of the scroll hint below it.
              paddingBottom: isHero ? 32 : 0,
              fontFamily: FONT_DISPLAY,
            }}
          >
            <div
              style={{
                fontSize: isHero ? 15 : 13,
                color: state.eyebrowColor,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              {state.eyebrow}
            </div>

            <PanelTitle state={state} isHero={isHero} />

            {state.description && (
              <p
                style={{
                  fontSize: 15,
                  color: COLORS.muted,
                  margin: "14px 0 0",
                  fontFamily: FONT_BODY,
                  lineHeight: 1.6,
                }}
              >
                {state.description}
              </p>
            )}

            {state.tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginTop: 16,
                  pointerEvents: "auto",
                }}
              >
                {state.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 12,
                      color: COLORS.chipText,
                      border: `1px solid ${COLORS.chipBorder}`,
                      padding: "5px 12px",
                      borderRadius: 20,
                    }}
                  >
                    {tag}
                  </span>
                ))}
                <ProjectLinks state={state} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
