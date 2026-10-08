import type { CSSProperties } from "react";

/**
 * Stable color washes for portfolio cards and their cover art.
 *
 * The same name always lands on the same hue, corner, and cover layout, so a
 * card does not change color between visits. Neighbors differ because the
 * name — not the grid position — picks the wash.
 */

export const CARD_PALETTE = [
  { a: "#0ea5e9", b: "#5eead4" },
  { a: "#0284c7", b: "#22d3ee" },
  { a: "#0d9488", b: "#22d3ee" },
  { a: "#1d4ed8", b: "#22d3ee" },
  { a: "#7c3aed", b: "#22d3ee" },
  { a: "#0891b2", b: "#5eead4" },
  { a: "#075985", b: "#34d399" },
  { a: "#2563eb", b: "#5eead4" },
] as const;

const BODY_ANCHORS = [
  { x: "88%", y: "84%" },
  { x: "14%", y: "88%" },
  { x: "52%", y: "92%" },
  { x: "76%", y: "72%" },
  { x: "24%", y: "76%" },
] as const;

export type OrbBox = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

/** Where the two cover orbs sit. Same palette, different corners. */
const ORB_LAYOUTS: { a: OrbBox; b: OrbBox }[] = [
  { a: { top: -160, left: -120 }, b: { bottom: -200, right: -140 } },
  { a: { top: -180, right: -60 }, b: { bottom: -160, left: -120 } },
  { a: { top: -40, left: 220 }, b: { bottom: -220, right: 40 } },
  { a: { top: -200, left: 80 }, b: { bottom: -40, right: -200 } },
];

export function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h << 5) - h + name.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function cardWash(name: string) {
  const h = hashName(name || "card");
  const pair = CARD_PALETTE[h % CARD_PALETTE.length];
  const anchor = BODY_ANCHORS[(h >> 3) % BODY_ANCHORS.length];
  const orb = ORB_LAYOUTS[(h >> 5) % ORB_LAYOUTS.length];
  return {
    a: pair.a,
    b: pair.b,
    x: anchor.x,
    y: anchor.y,
    /** Cover gradient angle. The middle of the image stays dark for the title. */
    angle: 110 + (h % 7) * 16,
    orb,
  };
}

/** CSS variables consumed by `.card-wash` in globals.css. */
export function cardWashVars(name: string): CSSProperties {
  const wash = cardWash(name);
  // React's CSSProperties type does not include custom properties.
  return {
    "--wash": wash.a,
    "--wash-x": wash.x,
    "--wash-y": wash.y,
  } as CSSProperties;
}
