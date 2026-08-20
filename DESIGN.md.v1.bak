# NeoCare — Design System
**v1.0** · 17 August 2026
Colours sampled directly from `Medium_50pcs_01.png` and `Diaper 34 Mockup-02.jpg`. Not invented.

---

## 1. Colour

### Brand core

| Token | Hex | Source | Contrast on white |
|---|---|---|---|
| `--nc-green-900` | `#003A07` | Darkened from wordmark | 13.6:1 ✓ |
| `--nc-green-800` | `#004E0A` | **Packaging wordmark** | 10.0:1 ✓ |
| `--nc-green-700` | `#0A6B18` | Interpolated | 6.8:1 ✓ |
| `--nc-green-600` | `#009030` | **Leaf accent on pack** | 3.9:1 ⚠ |
| `--nc-sage-500` | `#629A7E` | **Pack wave band** | 3.3:1 ⚠ |
| `--nc-sage-300` | `#8CB69A` | Pack wave band | 2.3:1 ⚠ |
| `--nc-mint-200` | `#B6E0C4` | **Diaper dot print** | 1.5:1 ⚠ |
| `--nc-mint-100` | `#D2EEE0` | Diaper dot print | 1.2:1 ⚠ |
| `--nc-mint-50` | `#EFF8F3` | Derived surface | — |

### Accent — use sparingly

| Token | Hex | Source | Contrast on white |
|---|---|---|---|
| `--nc-orange-600` | `#E6461E` | Darkened for contrast | 4.5:1 ✓ |
| `--nc-orange-500` | `#F0461E` | **Logotype on diaper** | 3.8:1 ⚠ |
| `--nc-gold-400` | `#FABE0A` | Logotype highlight | 1.8:1 ⚠ |

### Neutrals

| Token | Hex |
|---|---|
| `--nc-ink-900` | `#141A16` |
| `--nc-ink-700` | `#3A443E` |
| `--nc-ink-500` | `#6B776F` |
| `--nc-ink-300` | `#A8B2AC` |
| `--nc-ink-100` | `#E3E8E5` |
| `--nc-paper` | `#FFFFFF` |
| `--nc-cream` | `#FBF9F5` |

### Semantic

```css
--color-text            : var(--nc-ink-900);
--color-text-muted      : var(--nc-ink-500);
--color-text-inverse    : #FFFFFF;
--color-bg              : var(--nc-paper);
--color-bg-alt          : var(--nc-cream);
--color-bg-brand-soft   : var(--nc-mint-50);
--color-primary         : var(--nc-green-800);
--color-primary-hover   : var(--nc-green-900);
--color-accent          : var(--nc-orange-600);
--color-border          : var(--nc-ink-100);
--color-focus           : var(--nc-green-600);
--color-success         : var(--nc-green-700);
--color-error           : #B3261E;
```

### Contrast rules — enforce these

- **Body text:** `--nc-ink-900` or `--nc-green-800` only. Nothing else clears 4.5:1.
- **`--nc-orange-500`, `--nc-sage-500`, `--nc-green-600`:** large text (≥24px, or ≥19px bold), icons, borders, and UI components only. **Never body copy.**
- **`--nc-mint-*`:** backgrounds and decoration only. Never text.
- **Never** orange text on green, or sage on mint. Both fail.
- Focus ring: 2px `--color-focus` + 2px offset. Visible on every interactive element.

---

## 2. Typography

**Latin:** Poppins — already in use on the current site, so brand continuity is free.
**Bangla:** Hind Siliguri — pairs with Poppins, and is the lighter of the viable Bengali faces.

> **Ship one weight per script for the demo.** Poppins 400 + 600, Hind Siliguri 400 + 600 is already four files. Per plan §5, a single-weight Bengali WOFF2 realistically lands at 80–120 KB — measure before adding weights. Bengali cannot be safely unicode-range subset; dropping glyphs breaks conjunct ligatures.

```css
--font-latin  : 'Poppins', system-ui, sans-serif;
--font-bangla : 'Hind Siliguri', 'Noto Sans Bengali', sans-serif;
```

### Scale — fluid, clamp-based

| Token | clamp() | Use |
|---|---|---|
| `--text-display` | `clamp(2.5rem, 6vw, 4.5rem)` | S1 hero headline |
| `--text-h1` | `clamp(2rem, 4.5vw, 3.25rem)` | Section headings |
| `--text-h2` | `clamp(1.5rem, 3vw, 2.25rem)` | Feature titles |
| `--text-h3` | `clamp(1.25rem, 2vw, 1.5rem)` | Card titles, FAQ questions |
| `--text-body-lg` | `clamp(1.0625rem, 1.4vw, 1.1875rem)` | Lead paragraphs |
| `--text-body` | `1rem` | Default |
| `--text-small` | `0.875rem` | Captions, labels |

### Line height — **differs by script**

```css
[lang="en"] { --leading-tight: 1.12; --leading-normal: 1.55; }
[lang="bn"] { --leading-tight: 1.38; --leading-normal: 1.85; }
```

Bangla carries ascenders, descenders and conjuncts that clip at Latin leading. This is not optional polish — reused Latin leading makes Bengali unreadable.

**Also:** never set Bangla in all-caps or with `letter-spacing`. Both break the script.

---

## 3. Spacing

4px base.

```css
--space-1:.25rem; --space-2:.5rem;  --space-3:.75rem; --space-4:1rem;
--space-6:1.5rem; --space-8:2rem;   --space-12:3rem;  --space-16:4rem;
--space-24:6rem;  --space-32:8rem;  --space-40:10rem;
```

Section vertical rhythm: `clamp(4rem, 10vh, 8rem)`.
Content max-width: `--container: 1200px`. Prose max-width: `68ch` Latin, `60ch` Bangla.

---

## 4. Radii, elevation, borders

```css
--radius-sm:.375rem; --radius-md:.75rem; --radius-lg:1.25rem;
--radius-xl:2rem;    --radius-full:9999px;

--shadow-sm: 0 1px 2px rgb(20 26 22 / .06);
--shadow-md: 0 4px 16px rgb(20 26 22 / .08);
--shadow-lg: 0 12px 40px rgb(20 26 22 / .10);

--border-hairline: 1px solid var(--color-border);
```

Soft, generous radii. This is a baby-care brand — no sharp corners.

---

## 5. Motion

```css
--ease-out   : cubic-bezier(0.16, 1, 0.3, 1);
--ease-inout : cubic-bezier(0.65, 0, 0.35, 1);

--dur-fast  : 150ms;
--dur-base  : 300ms;
--dur-slow  : 600ms;
```

**Scroll-scrub is separate from these.** Scrubbed animation is driven by scroll position, not duration — use GSAP `scrub: 1` (1s catch-up smoothing), never a fixed duration.

**Every motion token is void under:**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

…and GSAP timelines must check `matchMedia('(prefers-reduced-motion: reduce)')` and render their **end state** immediately rather than animating.

---

## 6. Components

### Button

| Variant | Fill | Text | Border |
|---|---|---|---|
| Primary | `--nc-green-800` | white | none |
| Secondary | transparent | `--nc-green-800` | 1.5px `--nc-green-800` |
| Accent | `--nc-orange-600` | white | none |

- Min touch target **44 × 44px**. Non-negotiable on mobile.
- Padding `--space-3` / `--space-6`, radius `--radius-full`.
- Hover: darken one step. Active: `scale(.98)`.
- Focus: 2px `--color-focus` ring, 2px offset.

### Card

`--nc-paper` on `--nc-cream`, `--radius-lg`, `--shadow-sm` → `--shadow-md` on hover. Padding `--space-6`.

### Feature callout (S4–S8)

- Desktop: SVG arrow, 1.5px stroke, `--nc-green-700`, animated via `stroke-dashoffset`.
- Mobile: **no arrow.** Card with image, title, body.
- Arrow endpoints are `{x%, y%}` against the **locked hero frame only** — see build spec §5.2.

### FAQ accordion (S11)

Native `<details>`/`<summary>`. Chevron rotates 180° over `--dur-base`. Summary is the full-width click target, min-height 44px.

---

## 7. Layout

```css
--bp-sm: 480px;  --bp-md: 768px;  --bp-lg: 1024px;  --bp-xl: 1280px;
```

**Mobile-first.** Per plan §0.2, the <768px layout is the primary design, not a fallback. Design it first; treat ≥768px as enhancement.

**Grid:** 4 columns <768px, 8 columns 768–1024px, 12 columns ≥1024px. Gutter `--space-4` mobile, `--space-6` desktop.

---

## 8. Bilingual

- `<html lang="bn">` or `lang="en"` — drives the line-height fork in §2.
- Both scripts are LTR. No RTL work needed.
- Language toggle is always visible in the header. Never auto-switch on IP.
- Numerals: **decide and record here before build** — `৳ 920` or `৳ ৯২০`. Currently unresolved.
- Bangla strings run ~15–30% longer than English. Never fix button or nav widths to English content.
