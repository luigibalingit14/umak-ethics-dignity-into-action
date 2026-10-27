# UMak Design Spec — Web Applications & Forms

Official implementation guide for building UMak web applications, dashboards, student portals, administrative systems, and digital forms. Maintained by the **Center for Integrated Communications (CIC)**.

**Authors**  
JR Grate — Branding Management, Center for Integrated Communications  
Arjun Andrade — Creatives Lead, Center for Integrated Communications  
Contact: [cic@umak.edu.ph](mailto:cic@umak.edu.ph)

---

## Table of Contents

1. [Core Principles](#1-core-principles)
2. [Getting Started](#2-getting-started)
3. [Color Tokens](#3-color-tokens)
4. [Typography](#4-typography)
5. [Spacing & Radius](#5-spacing--radius)
6. [Components](#6-components)
7. [Do's and Don'ts](#7-dos-and-donts)
8. [Legal](#8-legal)

---

## 1. Core Principles

1. **Never hardcode colors or sizes** — always use the CSS token values defined in this spec.
2. **Metropolis** is the universal UI font — all body text, labels, buttons, and headings in web applications.
3. **Marcellus** is used only for formal print/PDF documents (letterheads, certificates). Never use on-screen.
4. **Primary navy `#111c4e`** anchors every page — navbar, sidebar, table headers, and primary buttons.
5. **Secondary yellow `#f5ec3a`** is a restricted color — use only for the active nav state or the single highest-priority CTA per screen. Never as a body text background.
6. One primary CTA (`btn-primary`) per card or view maximum.
7. All public-facing and print pages must include the UMak copyright notice.

---

## 2. Getting Started

### Font Loading

Self-host fonts by downloading `fonts/` from this repository:

```html
<!-- Metropolis — required for all on-screen UI -->
<link rel="stylesheet" href="/fonts/metropolis.css">

<!-- Marcellus — print/PDF only -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Marcellus&display=swap" rel="stylesheet">
```

> Verify Metropolis loads at render time via DevTools → Network → Fonts. If the browser falls back to a system font (Arial, -apple-system), the brand is broken.

### Logo Assets

Always use logos from `assets/logos/PNGs/` in this repository. Never recreate or modify the seal or wordmark.

| File | Use |
|------|-----|
| `UMak Logo - Black R.png` | Default on light backgrounds |
| `UMak Logo - White R.png` | On dark/primary-colored backgrounds |
| `UMak Logo Outline - Black R.png` | Outlined variant on light backgrounds |
| `UMak Logo Outline - White R.png` | Outlined variant on dark backgrounds |
| `UMak Type - Black R.png` | Wordmark only on light backgrounds |
| `UMak Type - White R.png` | Wordmark only on dark backgrounds |

---

## 3. Color Tokens

Define these as CSS custom properties in your `:root`.

### Primary Palette

| Token | Value | Application Use |
|-------|-------|-----------------|
| `--color-primary` | `#111c4e` | Navbar, table headers, primary buttons, page headings |
| `--color-primary-80` | `#28336b` | Sidebar background, footer background |
| `--color-primary-60` | `#47528a` | Sidebar hover/active states, button hover |
| `--color-primary-20` | `#060e33` | Deep overlay tints (rare) |
| `--color-primary-10` | `#01061c` | Modal backdrop at max depth |

### Secondary Palette ⚠️ Restricted

| Token | Value | Application Use |
|-------|-------|-----------------|
| `--color-secondary` | `#f5ec3a` | Active nav indicator, single highest-priority CTA |
| `--color-secondary-mid` | `#fef760` | Secondary hover state |
| `--color-secondary-light` | `#fff989` | Secondary active/pressed state |

> Use `secondary` for **one** highlight per screen only. Never as a background for text-heavy sections.

### Tertiary Palette

| Token | Value | Application Use |
|-------|-------|-----------------|
| `--color-tertiary` | `#105389` | Links, focus rings, informational accents |
| `--color-tertiary-70` | `#275996` | Link hover |
| `--color-tertiary-50` | `#406fa5` | Visited link, subdued state |
| `--color-tertiary-30` | `#8bb0dc` | Disabled link, informational tint |
| `--color-tertiary-10` | `#c0d5f0` | Info badge background, selected table row |

### Surface & Neutral

| Token | Value | Application Use |
|-------|-------|-----------------|
| `--color-neutral` | `#ffffff` | Card, input, and modal backgrounds |
| `--color-surface` | `#f5f6fa` | Page background, disabled input fill, alt table row |
| `--color-surface-variant` | `#eaecf4` | Chips, table row hover, secondary button hover |

### Text

| Token | Value | Application Use |
|-------|-------|-----------------|
| `--color-text-primary` | `#222222` | Body copy, data cell values |
| `--color-text-secondary` | `#47528a` | Labels, captions, metadata |
| `--color-text-muted` | `#7c85a8` | Helper text, timestamps, breadcrumbs |
| `--color-text-disabled` | `#b0b8d4` | Disabled field text |
| `--color-text-on-primary` | `#ffffff` | Text on primary-colored backgrounds |
| `--color-text-on-secondary` | `#111c4e` | Text on secondary yellow backgrounds |

### Semantic

| Token | Value | Application Use |
|-------|-------|-----------------|
| `--color-error` | `#c0392b` | Error borders, error text, required asterisk |
| `--color-error-light` | `#fdecea` | Error alert/badge background |
| `--color-success` | `#1a7a4a` | Success borders and text |
| `--color-success-light` | `#e6f5ed` | Success alert/badge background |
| `--color-warning` | `#b8860b` | Warning borders and text |
| `--color-warning-light` | `#fffbea` | Warning alert/badge background |

### Borders & Dividers

| Token | Value | Application Use |
|-------|-------|-----------------|
| `--color-border` | `#d0d5e8` | Default input and card borders |
| `--color-border-focus` | `#105389` | Focused input border |
| `--color-divider` | `#e4e8f4` | Table row dividers, section separators |

### WCAG Compliance

| Combination | Contrast | Status |
|-------------|----------|--------|
| `text-primary` on `neutral` | ~13:1 | ✅ AA |
| `text-on-primary` on `primary` | ~12:1 | ✅ AA |
| `text-on-secondary` on `secondary` | ~9:1 | ✅ AA |
| `text-primary` body copy on `secondary` | Insufficient | ❌ Avoid |

### Dark Mode Token Overrides

Applied when `<html data-theme="dark">`. Brand tokens (`primary`, `primary-80`, `secondary`, all spacing) are unchanged.

| Token | Light | Dark |
|-------|-------|------|
| `--color-neutral` | `#ffffff` | `#1a1f35` |
| `--color-surface` | `#f5f6fa` | `#0d1020` |
| `--color-surface-variant` | `#eaecf4` | `#252b45` |
| `--color-text-primary` | `#222222` | `#e8eaf2` |
| `--color-text-secondary` | `#47528a` | `#9aa2c8` |
| `--color-text-muted` | `#7c85a8` | `#6b7499` |
| `--color-text-disabled` | `#b0b8d4` | `#3d4463` |
| `--color-border` | `#d0d5e8` | `#2e3556` |
| `--color-border-focus` | `#105389` | `#3a7fd4` |
| `--color-divider` | `#e4e8f4` | `#252b45` |

---

## 4. Typography

**Metropolis** for all on-screen UI. **Marcellus** for print/PDF only — never mixed in the same viewport.

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|-------|------|--------|-------------|----------------|-----|
| `headline-display` | 48px | 700 | 1.1 | -0.01em | Hero banners, landing page titles |
| `headline-lg` | 36px | 700 | 1.2 | — | Page titles, stat card values |
| `headline-md` | 28px | 700 | 1.3 | — | Dashboard/form page titles |
| `headline-sm` | 22px | 700 | 1.4 | — | Card headings, modal titles |
| `body-lg` | 18px | 400 | 1.6 | — | Lead paragraphs, article intros |
| `body-md` | 16px | 400 | 1.6 | — | Body text, input values, table cells |
| `body-sm` | 14px | 400 | 1.5 | — | Helper text, captions, error messages |
| `label-lg` | 14px | 600 | 1.2 | 0.05em | Buttons, nav items, sidebar items |
| `label-md` | 12px | 600 | 1.2 | 0.08em | Form field labels (ALL CAPS), table headers |
| `label-sm` | 11px | 500 | 1.0 | 0.12em | Badges, breadcrumbs, micro labels (ALL CAPS) |

### CSS Variables

```css
:root {
  --font-ui:     'Metropolis', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-formal: 'Marcellus', Georgia, serif; /* print only */

  --text-display:      700 48px/1.1 var(--font-ui);
  --text-headline-lg:  700 36px/1.2 var(--font-ui);
  --text-headline-md:  700 28px/1.3 var(--font-ui);
  --text-headline-sm:  700 22px/1.4 var(--font-ui);

  --text-body-lg:      400 18px/1.6 var(--font-ui);
  --text-body-md:      400 16px/1.6 var(--font-ui);
  --text-body-sm:      400 14px/1.5 var(--font-ui);

  --text-label-lg:     600 14px/1.2 var(--font-ui);
  --text-label-md:     600 12px/1.2 var(--font-ui);
  --text-label-sm:     500 11px/1.0 var(--font-ui);
}

h1   { font: var(--text-headline-lg); letter-spacing: -0.01em; }
p    { font: var(--text-body-md); }
.btn { font: var(--text-label-lg); letter-spacing: 0.05em; }
```

### Print / PDF — Marcellus

```css
@media print {
  h1, h2, h3, h4,
  .letterhead-title,
  .document-heading {
    font-family: 'Marcellus', Georgia, serif;
    font-weight: 400;
  }
}
```

---

## 5. Spacing & Radius

```css
:root {
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  --radius-sm:   2px;
  --radius-md:   4px;
  --radius-lg:   8px;
  --radius-xl:   12px;
  --radius-full: 9999px;
}
```

---

## 6. Components

### Buttons

```html
<!-- Primary — one per card/view max -->
<button class="btn-primary">Submit</button>

<!-- Secondary -->
<button class="btn-secondary">Cancel</button>

<!-- Accent — highest-priority CTA only -->
<button class="btn-accent">Enroll Now</button>
```

```css
.btn-primary,
.btn-secondary,
.btn-accent {
  font-family: Metropolis, sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.05em;
  border-radius: 4px;
  padding: 10px 24px;
  cursor: pointer;
  border: none;
}

.btn-primary         { background-color: #111c4e; color: #ffffff; }
.btn-primary:hover   { background-color: #47528a; }
.btn-primary:active  { background-color: #28336b; }

.btn-secondary       { background-color: transparent; color: #111c4e; border: 1.5px solid #111c4e; }
.btn-secondary:hover { background-color: #eaecf4; }

.btn-accent          { background-color: #f5ec3a; color: #111c4e; }
.btn-accent:hover    { background-color: #fef760; }
.btn-accent:active   { background-color: #fff989; }
```

---

### Form Fields

```html
<div class="field-group">
  <label class="field-label" for="student-no">
    Student Number <span class="required">*</span>
  </label>
  <input class="field-input" type="text" id="student-no" placeholder="e.g. 2024-00001">
  <p class="field-helper">Enter your 9-digit student number.</p>
</div>

<!-- Error state -->
<div class="field-group">
  <label class="field-label" for="email">
    Email Address <span class="required">*</span>
  </label>
  <input class="field-input field-input--error" type="email" id="email">
  <p class="field-error">Please enter a valid email address.</p>
</div>
```

```css
.field-label {
  display: block;
  font-family: Metropolis, sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #111c4e;
  margin-bottom: 4px;
}
.required { color: #c0392b; }

.field-input {
  display: block;
  width: 100%;
  height: 42px;
  padding: 10px 16px;
  font-family: Metropolis, sans-serif;
  font-size: 16px;
  color: #111c4e;
  background: #ffffff;
  border: 1px solid #d0d5e8;
  border-radius: 4px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field-input:hover         { border-color: #7c85a8; }
.field-input:focus         { border: 2px solid #105389; box-shadow: 0 0 0 3px rgba(16, 83, 137, 0.15); }
.field-input--error        { border: 2px solid #c0392b; }
.field-input:disabled      { background: #f5f6fa; color: #b0b8d4; cursor: not-allowed; }
textarea.field-input       { height: auto; resize: vertical; }

.field-helper { font-family: Metropolis, sans-serif; font-size: 14px; color: #47528a; margin-top: 4px; }
.field-error  { font-family: Metropolis, sans-serif; font-size: 14px; color: #c0392b; margin-top: 4px; }
```

**Form rules:**
- Labels are always visible above the input — never use placeholder as a label substitute
- Mark required fields with `*` in `error (#c0392b)` immediately after the label text
- Validate on field blur, not on every keystroke; flag all invalid fields on submit
- Use `<select>` for 6+ mutually exclusive options; radio buttons for 2–5 options

---

### Dashboard Layout

Structure for all authenticated application views — portals, admin panels, enrollment systems:

```html
<div class="app-shell">
  <!-- Top Bar: height 56px, bg #111c4e -->
  <header class="top-bar">
    <button class="menu-toggle" aria-label="Toggle menu">&#9776;</button>
    <img src="assets/logos/PNGs/UMak Logo - White R.png" alt="University of Makati" class="top-bar-logo">
    <span class="system-name">Enrollment System</span>
    <div class="top-bar-actions">
      <button class="icon-btn" aria-label="Notifications">&#128276;</button>
      <div class="user-menu">Juan D. &#9660;</div>
    </div>
  </header>

  <div class="layout">
    <!-- Sidebar: width 256px, bg #28336b -->
    <nav class="sidebar" aria-label="Main navigation">
      <p class="sidebar-section-label">Academic</p>
      <a href="#" class="sidebar-item">Enrollment</a>
      <a href="#" class="sidebar-item sidebar-item--active">My Subjects</a>
      <a href="#" class="sidebar-item">Clearance Request</a>
    </nav>

    <main class="main-content">
      <div class="page-header">
        <div>
          <h1 class="page-title">Enrollment Management</h1>
          <nav class="breadcrumb" aria-label="Breadcrumb">Dashboard &rsaquo; Academic &rsaquo; Enrollment</nav>
        </div>
        <div class="page-actions">
          <button class="btn-secondary">Export</button>
          <button class="btn-primary">+ Add New</button>
        </div>
      </div>
      <!-- page body -->
    </main>
  </div>
</div>
```

```css
.top-bar {
  height: 56px;
  background: #111c4e;
  color: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}
.system-name { font-family: Metropolis, sans-serif; font-size: 14px; font-weight: 600; }

.sidebar {
  width: 256px;
  min-height: 100vh;
  background: #28336b;
  padding: 16px 0;
  flex-shrink: 0;
}
.sidebar-section-label {
  font-family: Metropolis, sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  padding: 8px 16px;
  margin: 0;
}
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 16px;
  font-family: Metropolis, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  text-decoration: none;
}
.sidebar-item:hover     { background: #47528a; }
.sidebar-item--active   { background: #47528a; color: #f5ec3a; border-left: 3px solid #f5ec3a; }

.layout       { display: flex; }
.main-content { flex: 1; background: #f5f6fa; min-height: 100vh; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e4e8f4;
}
.page-title {
  font-family: Metropolis, sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #111c4e;
  margin: 0;
}
.breadcrumb {
  font-family: Metropolis, sans-serif;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  color: #7c85a8;
  margin-top: 4px;
}
.page-actions { display: flex; gap: 8px; }
```

---

## 7. Do's and Don'ts

### ✅ Do

**Brand**
- Use logo assets from this repository — never recreate, retype, or modify the seal or wordmark
- Use `primary (#111c4e)` as the navbar background on every page
- Use `primary-80 (#28336b)` for the sidebar — intentionally distinct from the top bar
- Keep navigation consistently positioned: sticky top bar + left sidebar for authenticated layouts

**Color**
- Use `secondary (#f5ec3a)` only for the active nav/sidebar indicator or a single highest-priority CTA
- Use `tertiary (#105389)` for all links and focus rings
- Test all color combinations for WCAG AA compliance (minimum 4.5:1 contrast ratio)

**Typography**
- Use Metropolis Bold (700) for all page-level headings
- Use Metropolis for all UI — labels, body, buttons, captions, nav items
- Reserve Marcellus for print/PDF only; verify Metropolis loads in DevTools before shipping

**Components**
- Use skeleton/shimmer loaders for data-heavy tables and cards, not blocking full-screen spinners
- Show a confirmation dialog before any destructive action (delete, revoke, reset)
- Show field labels above inputs at all times
- Include the copyright notice on all public-facing pages

### ❌ Don't

**Brand**
- Don't use a white navbar — it is the most critical brand deviation
- Don't use any font other than Metropolis for on-screen content
- Don't create a custom or modified UMak mark for a specific application

**Color**
- Don't use `secondary (#f5ec3a)` as a background for body text — contrast is insufficient
- Don't use `primary-80` and `primary` interchangeably — they serve different depth roles
- Don't enable a dark mode toggle without a defined dark token set

**Components**
- Don't show more than one `btn-primary` per card or view
- Don't use placeholder text as a label substitute
- Don't use tooltips for required or critical information — use always-visible helper text
- Don't mix filled/solid icons with outlined icons in the same view
- Don't exceed 6 tabs in a tab bar — use sidebar sections or a dropdown for larger sets
- Don't omit `resize: vertical` on textareas

**Print**
- Don't include navigation (sidebar, top bar) in print layouts
- Don't omit the copyright notice from printed or PDF pages

---

## 8. Legal

&copy; 2026 University of Makati&reg;. All rights reserved.

The University of Makati name, seal, and wordmark are registered trademarks. All logo assets in this repository are official property of the University of Makati. Unauthorized modification or use outside of official UMak digital properties is prohibited.
