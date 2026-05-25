/**
 * Farmly design tokens — TypeScript mirror of CSS variables.
 * @see docs/design-system.md
 */

export const colors = {
  loam: {
    50: "#faf8f4",
    100: "#f3efe6",
    200: "#e6dfd1",
    300: "#d4cabb",
    400: "#b8aa94",
    500: "#938471",
    600: "#6f6354",
    700: "#524a3f",
    800: "#38322b",
    900: "#241f1a",
  },
  moss: {
    50: "#eef2eb",
    100: "#dde5d8",
    300: "#8fa384",
    500: "#5c6f52",
    700: "#3d5238",
    900: "#1e2e22",
  },
  hearth: {
    50: "#f6f0e8",
    100: "#ede4d6",
    300: "#d4bc8a",
    500: "#c9a06a",
    700: "#a67c52",
  },
  accent: {
    clay: "#a67c52",
    soil: "#7a5c3e",
    ember: "#c4784a",
    wheat: "#d4bc8a",
    sun: "#e4c078",
  },
} as const;

/** Legacy semantic names used in components */
export const semantic = {
  background: colors.loam[100],
  foreground: colors.loam[900],
  cream: colors.loam[200],
  mist: colors.loam[50],
  forest: colors.moss[700],
  forestDeep: colors.moss[900],
  sage: colors.moss[500],
} as const;

export const spacing = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const;

export const radius = {
  sm: "0.125rem",
  md: "0.5rem",
  lg: "0.875rem",
  xl: "1.25rem",
  full: "9999px",
} as const;

export const motion = {
  easeOrganic: "cubic-bezier(0.22, 1, 0.36, 1)",
  easeCinematic: "cubic-bezier(0.33, 0, 0.2, 1)",
  duration: {
    instant: 150,
    fast: 300,
    medium: 500,
    slow: 700,
    ambient: 28000,
  },
} as const;

export const sectionTones = [
  "parchment",
  "meadow",
  "hearth",
  "dawn",
  "depth",
  "cream",
  "mist",
  "earth",
  "white",
  "linen",
  "transparent",
] as const;

export type SectionTone = (typeof sectionTones)[number];

export const surfaceTypes = [
  "ghost",
  "editorial",
  "frame",
  "card",
  "inset",
] as const;

export type SurfaceType = (typeof surfaceTypes)[number];
