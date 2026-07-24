"use client";

import { useState } from "react";
import { COLORS, Z } from "@/app/lib/theme";
import { GitHubIcon, LinkedInIcon, MailIcon, DocIcon } from "./icons";

const LINKEDIN_URL = "https://www.linkedin.com/in/ahnaf-murshid/";
const GITHUB_URL = "https://github.com/amurshid";
const EMAIL = "murshid.ahnaf@gmail.com";
const RESUME_URL = "/resume.pdf";

type Link = {
  label: string;
  href: string;
  icon: React.ReactNode;
  external: boolean;
};

const LINKS: Link[] = [
  { label: "GitHub", href: GITHUB_URL, external: true, icon: <GitHubIcon /> },
  { label: "LinkedIn", href: LINKEDIN_URL, external: true, icon: <LinkedInIcon /> },
  { label: "Email", href: `mailto:${EMAIL}`, external: false, icon: <MailIcon /> },
  { label: "Resume", href: RESUME_URL, external: true, icon: <DocIcon /> },
];

/** Social links in the bottom-left corner. Labels slide out on hover. */
export default function SocialLinks() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <nav
      aria-label="Social links"
      style={{
        position: "fixed",
        left: 40,
        bottom: 30,
        zIndex: Z.chrome,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      {LINKS.map((link, i) => {
        const active = hovered === i;
        return (
          <a
            key={link.label}
            href={link.href}
            aria-label={link.label}
            {...(link.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: active ? COLORS.cyan : COLORS.dim,
              transition: "color 0.25s",
              lineHeight: 0,
            }}
          >
            {link.icon}
            <span
              style={{
                maxWidth: active ? 130 : 0,
                opacity: active ? 1 : 0,
                overflow: "hidden",
                whiteSpace: "nowrap",
                paddingLeft: 9,
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                lineHeight: 1.2,
                transition:
                  "max-width 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.24s",
              }}
            >
              {link.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
