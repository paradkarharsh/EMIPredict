# EMIPredict AI — Design System & Engineering Specifications

## 1. Aesthetic Rationale & Foundations
The **EMIPredict AI** frontend is an original, production-grade Apple-inspired FinTech system built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion, and Recharts. The design avoids generic AI tropes (neon gradients, purple glows, emoji clutter) in favor of restrained optical precision, generous whitespace, tabular numeral typography, and tactile spring motion.

---

## 2. Token System

### Foundations
- **Light Base Foundation**: `#FBFBFD` — Warm off-white reducing ocular glare.
- **Dark Base Foundation**: `#0A0A0C` — Deep obsidian with layered card elevations.
- **Glass Panels**: `backdrop-filter: blur(20px) saturate(180%)`, 1px hairline border at `rgba(0, 0, 0, 0.08)` (Light) / `rgba(255, 255, 255, 0.08)` (Dark).

### Typography
- **Stack**: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Helvetica Neue", sans-serif`.
- **Hero Title**: `64px – 80px`, line height `1.05`, tracking `-0.028em`, weight `700`.
- **Section Headers**: `36px – 44px`, line height `1.20`, tracking `-0.020em`, weight `600`.
- **Body**: `16px – 18px`, line height `1.60`, weight `400`.
- **Tabular Numerals**: `font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1, "ss01" 1;` for all monetary amounts, scores, percentages, and metrics.

### FinTech Palette
- **Domain Accent**: `#0A5C6B` (Trust & Precision Muted Teal-Blue) in Light mode, lifted to `#2DD4BF` in Dark mode.
- **Secondary Accent**: `#2C3E6B` (Deep Slate Indigo) for multi-series comparisons.
- **Status Success (`Eligible`)**: `#28A745` (Desaturated Emerald) with `rgba(40, 167, 69, 0.08)` background.
- **Status Caution (`High_Risk`)**: `#D97706` (Muted Amber) with `rgba(217, 119, 6, 0.08)` background.
- **Status Risk (`Not_Eligible`)**: `#DC2626` (Muted Coral) with `rgba(220, 38, 38, 0.08)` background.

---

## 3. Motion & Micro-Interactions

### Deceleration Curve
```css
cubic-bezier(0.16, 1, 0.3, 1) /* easeOutExpo */
```

### Signature Moments
1. **Hero Stagger**: Staggered fade-up (Headline → Subhead → CTA → Stat Strip) over `500–700ms`.
2. **Prediction Reveal**:
   - Status badge scales in with spring physics (`damping: 25, stiffness: 200`).
   - Max EMI numbers count up using Framer Motion's `useSpring` and `useMotionValue`.
   - Confidence probability bars expand smoothly.
3. **Button Hover**: Scales to `1.02` with shadow lift and spring release (`150ms`).
4. **Accessibility**: Full respect for `@media (prefers-reduced-motion: reduce)`.

---

## 4. Anti-Pattern Compliance
- [x] No purple-to-blue AI gradients.
- [x] No emoji as icons (Lucide vector icons exclusively).
- [x] No untouched default styling (all cards, inputs, and charts customized).
- [x] No mock data (wired to real FastAPI endpoints and real MLflow benchmarks).
- [x] No instant un-animated state jumps on hero and prediction reveal.
