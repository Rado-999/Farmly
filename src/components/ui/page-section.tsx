type PageSectionProps = {
  id?: string;
  children: React.ReactNode;
  className?: string;
  tone?:
    | "parchment"
    | "meadow"
    | "hearth"
    | "earth"
    | "mist"
    | "dawn"
    | "depth"
    | "transparent"
    | "cream"
    | "white"
    | "linen";
  spacing?: "default" | "compact" | "hero" | "none";
  fullBleed?: boolean;
  /** Subtle linen noise on light bands */
  texture?: boolean;
};

const toneClassNames = {
  parchment: "bg-loam-100 texture-linen",
  meadow: "bg-gradient-meadow",
  hearth: "bg-gradient-hearth",
  earth: "bg-loam-200",
  mist: "bg-loam-50",
  dawn: "bg-gradient-dawn",
  depth: "bg-gradient-depth text-loam-50",
  transparent: "bg-transparent",
  cream: "bg-loam-200",
  white: "bg-loam-50",
  linen: "bg-gradient-hearth",
};

const spacingClassNames = {
  compact: "section-space-compact",
  default: "section-space",
  hero: "section-space-hero",
  none: "",
};

/** Visual background group — used to tighten spacing between adjacent same-tone bands. */
const toneSurface = {
  parchment: "parchment",
  meadow: "meadow",
  hearth: "hearth",
  earth: "cream",
  cream: "cream",
  mist: "mist",
  white: "mist",
  dawn: "dawn",
  linen: "hearth",
  depth: "depth",
  transparent: "transparent",
} as const;

export function PageSection({
  id,
  children,
  className = "",
  tone = "parchment",
  spacing = "default",
  fullBleed = false,
  texture = false,
}: PageSectionProps) {
  const surface = toneSurface[tone];
  const textureClass =
    texture && !toneClassNames[tone].includes("texture-linen")
      ? "texture-linen"
      : "";

  return (
    <section
      id={id}
      data-surface={surface}
      className={`relative ${toneClassNames[tone]} ${textureClass} ${spacingClassNames[spacing]} ${id ? "scroll-mt-[var(--site-header-height)]" : ""} ${fullBleed ? "" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
