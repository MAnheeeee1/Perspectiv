"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Design: multiple masked ring layers, each carrying a high-contrast conic
// gradient that is mostly dim with a few vivid hot spots. As each ring rotates
// at its own speed the hot spots travel around the perimeter independently —
// where two rings' hot spots align a bright corner/edge emerges; where they
// diverge the frame settles to a quieter glow. This is the structure behind
// Apple Intelligence-style border recreations.
//
// mask-composite: exclude punches out the content-box so the center of the
// viewport stays transparent. Only the padding "ring" shows gradient.
// ─────────────────────────────────────────────────────────────────────────────

// ── Conic gradients ───────────────────────────────────────────────────────────
// Three distinct gradients rotate at different speeds. Each has bright peaks
// (~0.65–0.95 alpha whites/colours) and dim troughs (~0.07–0.12) so the frame
// is always visible but never uniformly lit.

// Primary — 3 hot spots near 0°, 120°, 242°
const G1 = `conic-gradient(from var(--glow-angle),
  rgba(96,165,250,.70) 0deg,
  rgba(255,255,255,.96) 10deg,
  rgba(103,232,249,.65) 22deg,
  rgba(103,232,249,.22) 38deg,
  rgba(96,165,250,.09)  68deg,
  rgba(96,165,250,.07) 108deg,
  rgba(167,139,250,.68) 118deg,
  rgba(255,255,255,.92) 129deg,
  rgba(244,114,182,.62) 141deg,
  rgba(244,114,182,.20) 157deg,
  rgba(167,139,250,.09) 184deg,
  rgba(167,139,250,.07) 228deg,
  rgba(34,211,238,.68) 238deg,
  rgba(255,255,255,.90) 249deg,
  rgba(96,165,250,.63) 261deg,
  rgba(96,165,250,.18) 276deg,
  rgba(103,232,249,.09) 305deg,
  rgba(96,165,250,.07) 352deg,
  rgba(96,165,250,.70) 360deg)`;

// Secondary — hot spots near 48°, 175°, 298° (≈ 48° offset from G1)
const G2 = `conic-gradient(from var(--glow-angle),
  rgba(167,139,250,.07)   0deg,
  rgba(167,139,250,.07)  36deg,
  rgba(139,92,246,.65)   46deg,
  rgba(255,255,255,.88)  57deg,
  rgba(244,114,182,.60)  69deg,
  rgba(244,114,182,.18)  85deg,
  rgba(167,139,250,.09) 112deg,
  rgba(167,139,250,.07) 160deg,
  rgba(34,211,238,.64)  168deg,
  rgba(255,255,255,.84) 179deg,
  rgba(96,165,250,.60)  191deg,
  rgba(96,165,250,.17)  207deg,
  rgba(103,232,249,.09) 234deg,
  rgba(96,165,250,.07)  282deg,
  rgba(244,114,182,.62) 290deg,
  rgba(255,255,255,.86) 301deg,
  rgba(167,139,250,.58) 314deg,
  rgba(167,139,250,.16) 330deg,
  rgba(167,139,250,.09) 352deg,
  rgba(167,139,250,.07) 360deg)`;

// Tertiary — smooth slow atmospheric base, no hard hot spots
const G3 = `conic-gradient(from var(--glow-angle),
  rgba(96,165,250,.42)    0deg,
  rgba(103,232,249,.28)  60deg,
  rgba(167,139,250,.42) 120deg,
  rgba(244,114,182,.34) 180deg,
  rgba(251,113,133,.24) 240deg,
  rgba(103,232,249,.32) 300deg,
  rgba(96,165,250,.42)  360deg)`;

// ── Ring layer config ──────────────────────────────────────────────────────────
// pad:  ring width in px (= visible stroke + bloom source)
// blur: filter blur in px (spreads the ring inward/outward)
// op:   peak opacity when fully active
// dur:  rotation period in seconds
// del:  animation-delay in seconds — negative = start partway through cycle
// grad: which conic gradient to use
//
// Three speed groups (8 s / 13.5 s / 22 s) rotate independently. Hot spots
// from different groups meet and diverge continuously → organic bright areas.

interface Ring { pad:number; blur:number; op:number; dur:number; del:number; grad:string }

const RINGS: Ring[] = [
  // ── Group 1 — 8 s (primary gradient)
  { pad: 1.5, blur:  0, op: 0.88, dur:  8.0, del:  0,   grad: G1 },
  { pad: 5,   blur:  4, op: 0.62, dur:  8.0, del:  0,   grad: G1 },
  { pad: 12,  blur: 10, op: 0.36, dur:  8.0, del:  0,   grad: G1 },

  // ── Group 2 — 13.5 s (secondary gradient, phase offset)
  { pad: 4,   blur:  4, op: 0.50, dur: 13.5, del: -2.2, grad: G2 },
  { pad: 14,  blur: 13, op: 0.26, dur: 13.5, del: -2.2, grad: G2 },

  // ── Group 3 — 22 s (atmospheric base, very wide, very slow)
  { pad: 22,  blur: 20, op: 0.17, dur: 22.0, del: -7.5, grad: G3 },
];

// ── Mask that makes only the padding ring visible ─────────────────────────────
const MASK: React.CSSProperties = {
  WebkitMask:          "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
  WebkitMaskComposite: "xor",
  mask:                "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
  maskComposite:       "exclude",
};

// ── prefers-reduced-motion ────────────────────────────────────────────────────
function subMQ(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const snapMQ    = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const snapMQSSR = () => false;

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoadingGlow({ visible }: { visible: boolean }) {
  const [active, setActive] = useState(false);
  const reduced = useSyncExternalStore(subMQ, snapMQ, snapMQSSR);
  const r1 = useRef<number>(0);
  const r2 = useRef<number>(0);

  useEffect(() => {
    cancelAnimationFrame(r1.current);
    cancelAnimationFrame(r2.current);
    if (visible) {
      r1.current = requestAnimationFrame(() => {
        r2.current = requestAnimationFrame(() => setActive(true));
      });
    } else {
      r1.current = requestAnimationFrame(() => setActive(false));
    }
    return () => {
      cancelAnimationFrame(r1.current);
      cancelAnimationFrame(r2.current);
    };
  }, [visible]);

  // Transition string reused across all layers
  const T = "opacity 0.7s ease";

  // ── Reduced-motion fallback ───────────────────────────────────────────────
  if (reduced) {
    return (
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9990,
          boxShadow: [
            "inset 0 0 80px -8px rgba(96,165,250,.20)",
            "inset 0 0 48px -8px rgba(167,139,250,.14)",
            "inset 0 0 48px -8px rgba(103,232,249,.11)",
          ].join(", "),
          opacity: active ? 1 : 0,
          transition: T,
          animation: active ? "glow-breathe 3s ease-in-out infinite" : "none",
        }}
      />
    );
  }

  // ── Full effect ───────────────────────────────────────────────────────────

  // Minimal atmospheric edge-wash — static, ultra-low opacity.
  // Just enough so the frame has a colour 'memory' between hot-spot peaks.
  const atmoBg = [
    "radial-gradient(ellipse 75% 38% at 50%   0%, rgba(96,165,250,.05)  0%, transparent 100%)",
    "radial-gradient(ellipse 75% 38% at 50% 100%, rgba(103,232,249,.04) 0%, transparent 100%)",
    "radial-gradient(ellipse 38% 75% at   0% 50%, rgba(167,139,250,.04) 0%, transparent 100%)",
    "radial-gradient(ellipse 38% 75% at 100% 50%, rgba(244,114,182,.04) 0%, transparent 100%)",
  ].join(", ");

  return (
    <>
      {/* Atmospheric edge blush — barely visible, gives frame a colour memory */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, background: atmoBg,
          pointerEvents: "none", zIndex: 9988,
          opacity: active ? 1 : 0, transition: "opacity 1.1s ease",
        }}
      />

      {/* Ring layers — each carries a rotating conic gradient through a
          mask-composite:exclude ring, keeping the viewport center clean */}
      {RINGS.map((r, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: "fixed", inset: 0,
            padding: r.pad,
            background: r.grad,
            ...MASK,
            filter: r.blur > 0 ? `blur(${r.blur}px)` : undefined,
            animation: `glow-spin ${r.dur}s linear ${r.del}s infinite`,
            pointerEvents: "none",
            zIndex: 9989,
            opacity: active ? r.op : 0,
            transition: T,
          }}
        />
      ))}

      {/* Subtle content dimmer — helps the frame read over any page colour */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.025)",
          pointerEvents: "none", zIndex: 9987,
          opacity: active ? 1 : 0, transition: T,
        }}
      />
    </>
  );
}
