# UMak Public Assets

Official public assets for the **University of Makati**, maintained by the **Center for Integrated Communications (CIC)**.  
Contact: [cic@umak.edu.ph](mailto:cic@umak.edu.ph)

**Authors**  
JR Grate — Branding Management, Center for Integrated Communications  
Arjun Andrade — Creatives Lead, Center for Integrated Communications

---

## Repository Contents

```
assets/
  theme.css              # CSS design tokens and component styles
  theme.js               # Theme utilities and JS helpers
  logos/
    PNGs/
      UMak Logo - Black R.png
      UMak Logo - White R.png
      UMak Logo Outline - Black R.png
      UMak Logo Outline - White R.png
      UMak Type - Black R.png
      UMak Type - White R.png

fonts/
  Marcellus/
    Marcellus-Regular.ttf
    OFL.txt
  Metropolis (Body text)/
    METROPOLIS-THIN.TTF
    METROPOLIS-THINITALIC.TTF
    METROPOLIS-EXTRALIGHT.TTF
    METROPOLIS-EXTRALIGHTITALIC.TTF
    METROPOLIS-LIGHT.TTF
    METROPOLIS-LIGHTITALIC.TTF
    METROPOLIS-REGULAR.TTF
    METROPOLIS-REGULARITALIC.TTF
    METROPOLIS-MEDIUM.TTF
    METROPOLIS-MEDIUMITALIC.TTF
    METROPOLIS-SEMIBOLD.TTF
    METROPOLIS-SEMIBOLDITALIC.TTF
    METROPOLIS-BOLD.TTF
    METROPOLIS-BOLDITALIC.TTF
    METROPOLIS-EXTRABOLD.TTF
    METROPOLIS-EXTRABOLDITALIC.TTF
    METROPOLIS-BLACK.TTF
    METROPOLIS-BLACKITALIC.TTF
```

---

## Fonts

### Metropolis — UI Font

Used for **all on-screen content**: headings, body text, labels, buttons, captions, and navigation. All weights are provided.

**Self-hosted loading:**

```html
<link rel="stylesheet" href="/fonts/metropolis.css">
```

> Verify Metropolis loads at render time via DevTools → Network → Fonts. If the browser falls back to a system font, the brand is broken.

### Marcellus — Formal/Print Font

Used **only** for formal printed or PDF documents: official letterheads, certificates, and office name headers. Never use Marcellus on-screen.

**Google Fonts loading (for print/PDF):**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Marcellus&display=swap" rel="stylesheet">
```

Or via CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=Marcellus&display=swap');
```

---

## Logos

Always use the official logo assets from this repository. Never recreate, retype, or modify the UMak seal or wordmark.

| File | Use |
|------|-----|
| `UMak Logo - Black R.png` | Default logo on light backgrounds |
| `UMak Logo - White R.png` | Logo on dark/primary-colored backgrounds |
| `UMak Logo Outline - Black R.png` | Outlined variant on light backgrounds |
| `UMak Logo Outline - White R.png` | Outlined variant on dark backgrounds |
| `UMak Type - Black R.png` | Wordmark only on light backgrounds |
| `UMak Type - White R.png` | Wordmark only on dark backgrounds |

---

## Color Tokens

| Role | Token | Value |
|------|-------|-------|
| Primary | `primary` | `#111c4e` |
| Primary 80% | `primary-80` | `#28336b` |
| Primary 60% | `primary-60` | `#47528a` |
| Secondary (Yellow) | `secondary` | `#f5ec3a` |
| Tertiary (Blue) | `tertiary` | `#105389` |
| Surface | `surface` | `#f5f6fa` |
| Surface Variant | `surface-variant` | `#eaecf4` |
| White | `neutral` | `#ffffff` |
| Text Primary | `text-primary` | `#222222` |
| Text Secondary | `text-secondary` | `#47528a` |
| Text Muted | `text-muted` | `#7c85a8` |
| Text on Primary | `text-on-primary` | `#ffffff` |
| Text on Secondary | `text-on-secondary` | `#111c4e` |
| Border | `border` | `#d0d5e8` |
| Border Focus | `border-focus` | `#105389` |
| Error | `error` | `#c0392b` |
| Success | `success` | `#1a7a4a` |
| Warning | `warning` | `#b8860b` |

> `secondary (#f5ec3a)` is a restricted color — use for one highlight per screen only (active nav state or single highest-priority CTA). Never use as a text background for body copy.

---

## Typography Scale

All sizes use **Metropolis**. See fonts section above for loading instructions.

| Token | Size | Weight | Line Height | Use |
|-------|------|--------|-------------|-----|
| `headline-display` | 48px | 700 | 1.1 | Hero banners, landing page titles |
| `headline-lg` | 36px | 700 | 1.2 | Page titles, stat card values |
| `headline-md` | 28px | 700 | 1.3 | Dashboard/form page titles |
| `headline-sm` | 22px | 700 | 1.4 | Card headings, modal titles |
| `body-lg` | 18px | 400 | 1.6 | Lead paragraphs, article intros |
| `body-md` | 16px | 400 | 1.6 | Standard body text, table cells |
| `body-sm` | 14px | 400 | 1.5 | Helper text, captions, error messages |
| `label-lg` | 14px | 600 | 1.2 | Buttons, nav items |
| `label-md` | 12px | 600 | 1.2 | Form labels (ALL CAPS), table headers |
| `label-sm` | 11px | 500 | 1.0 | Badges, breadcrumbs, micro labels |

**CSS variables pattern:**

```css
:root {
  --font-ui: 'Metropolis', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-formal: 'Marcellus', Georgia, serif; /* print only */

  --text-display: 700 48px/1.1 var(--font-ui);
  --text-headline-lg: 700 36px/1.2 var(--font-ui);
  --text-headline-md: 700 28px/1.3 var(--font-ui);
  --text-headline-sm: 700 22px/1.4 var(--font-ui);

  --text-body-lg: 400 18px/1.6 var(--font-ui);
  --text-body-md: 400 16px/1.6 var(--font-ui);
  --text-body-sm: 400 14px/1.5 var(--font-ui);

  --text-label-lg: 600 14px/1.2 var(--font-ui);
  --text-label-md: 600 12px/1.2 var(--font-ui);
  --text-label-sm: 500 11px/1.0 var(--font-ui);
}
```

---

## Usage Guidelines

### Do
- Use logo assets from this repository only — never recreate or modify the seal or wordmark
- Use `primary (#111c4e)` as the navbar background on every page
- Use `primary-80 (#28336b)` for the sidebar background
- Use `secondary (#f5ec3a)` only for the active nav indicator or single highest-priority CTA
- Use `tertiary (#105389)` for links, focus rings, and informational accents
- Test all color combinations for WCAG AA compliance (minimum 4.5:1 contrast ratio)
- Use Metropolis for all on-screen content; Marcellus only in print/PDF

### Don't
- Use a white navbar — it is the most visible brand deviation from the UMak spec
- Use `secondary (#f5ec3a)` as a background for text-heavy sections
- Mix Marcellus with Metropolis in the same viewport
- Display more than one primary CTA per view or card
- Modify or recreate any UMak logo or seal

---

## Legal

© 2026 University of Makati®. All rights reserved.

The University of Makati name, seal, and wordmark are registered trademarks. All logo assets in this repository are official property of the University of Makati. Unauthorized modification or use outside of official UMak digital properties is prohibited.
