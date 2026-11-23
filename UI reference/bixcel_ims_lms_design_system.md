---
name: "Bixcel Enterprise Academic"
description: "Clean, high-trust institutional SaaS design system for Bixcel IMS + LMS, pairing a deep navy navigation rail with crisp white workspaces, Institutional Blue actions, and semantic status clarity."
---

## Overview

Bixcel Enterprise Academic is a modern, high-clarity SaaS design system built for Super Admins, Tutors, and Students managing daily academic and institutional operations. The visual language balances institutional authority with effortless scannability: a deep navy navigation sidebar anchors the application shell, while crisp white cards over a cool, very light grey canvas keep dense tables, schedules, and analytics legible without visual fatigue.

The design style is **Corporate / Modern** minimalism. Every surface relies on subtle hairline borders, restrained tonal steps, and soft ambient elevation—never decorative gradients, neon accents, or visual clutter.

## Colors

The palette is anchored by **Institutional Blue** (`#0037B0` / `#1D4ED8`) for primary actions and active states, paired with a **Deep Navy** (`#0F172A`) persistent sidebar and neutral cool-grey surfaces. Semantic status colors are reserved strictly for operational states: **Emerald** for verified/completed/present, **Amber** for pending/in-review/late, and **Rose** for overdue/absent/conflict alerts.

- **Primary:** Institutional Blue for primary buttons, active tabs, and key interactive controls.
- **Sidebar:** Deep Navy (`#0F172A`) with crisp white text and subtle slate-blue hover/active states.
- **Surfaces:** Pure white (`#FFFFFF`) cards resting on a cool light-grey canvas (`#FAF8FF` / `#F3F2FE`).
- **Status:** Emerald green (`#059669`), Amber (`#B45309`), and Rose red (`#BE123C`) used exclusively for badges, indicators, and validation states.

```yaml
colors:
  sidebar: "#0F172A"
  on-sidebar: "#FFFFFF"
  sidebar-muted: "#94A3B8"
  sidebar-surface: "#1E293B"
  sidebar-active: "#1D4ED8"
  success: "#059669"
  on-success: "#1C1C1C"
  success-container: "#D1FAE5"
  on-success-container: "#065F46"
  pending: "#B45309"
  on-pending: "#FFFFFF"
  pending-container: "#FEF3C7"
  on-pending-container: "#92400E"
  overdue: "#BE123C"
  on-overdue: "#FFFFFF"
  overdue-container: "#FFE4E6"
  on-overdue-container: "#9F1239"
  light:
    primary: "#0037B0"
    on-primary: "#FFFFFF"
    primary-container: "#1D4ED8"
    on-primary-container: "#FFFFFF"
    primary-tint: "#EFEFFF"
    on-primary-tint: "#002682"
    secondary: "#4D5B94"
    on-secondary: "#FFFFFF"
    secondary-container: "#DCE1FF"
    on-secondary-container: "#1D2C63"
    tertiary: "#7F2500"
    on-tertiary: "#FFFFFF"
    tertiary-container: "#FFDBCF"
    on-tertiary-container: "#5C1900"
    error: "#BA1A1A"
    on-error: "#FFFFFF"
    error-container: "#FFDAD6"
    on-error-container: "#93000A"
    background: "#F8FAFC"
    on-background: "#1A1B23"
    surface: "#F8FAFC"
    surface-dim: "#E2E8F0"
    surface-bright: "#FFFFFF"
    surface-container-lowest: "#FFFFFF"
    surface-container-low: "#F1F5F9"
    surface-container: "#E2E8F0"
    surface-container-high: "#CBD5E1"
    surface-container-highest: "#94A3B8"
    on-surface: "#0F172A"
    surface-variant: "#E2E8F0"
    on-surface-variant: "#475569"
    outline: "#64748B"
    outline-variant: "#E2E8F0"
    inverse-surface: "#1E293B"
    inverse-on-surface: "#F8FAFC"
    inverse-primary: "#B7C4FF"
    shadow: "#0F172A"
    scrim: "#0F172A"
  dark:
    primary: "#B7C4FF"
    on-primary: "#002682"
    primary-container: "#1D4ED8"
    on-primary-container: "#FFFFFF"
    primary-tint: "#1D2C63"
    on-primary-tint: "#DCE1FF"
    secondary: "#B7C4FF"
    on-secondary: "#1D2C63"
    secondary-container: "#35437B"
    on-secondary-container: "#DCE1FF"
    tertiary: "#FFB59C"
    on-tertiary: "#5C1900"
    tertiary-container: "#832700"
    on-tertiary-container: "#FFDBCF"
    error: "#FFB4AB"
    on-error: "#690005"
    error-container: "#93000A"
    on-error-container: "#FFDAD6"
    background: "#0B0F19"
    on-background: "#F1F5F9"
    surface: "#0B0F19"
    surface-dim: "#0B0F19"
    surface-bright: "#1E293B"
    surface-container-lowest: "#0F172A"
    surface-container-low: "#1E293B"
    surface-container: "#334155"
    surface-container-high: "#475569"
    surface-container-highest: "#64748B"
    on-surface: "#F8FAFC"
    surface-variant: "#334155"
    on-surface-variant: "#CBD5E1"
    outline: "#94A3B8"
    outline-variant: "#334155"
    inverse-surface: "#F1F5F9"
    inverse-on-surface: "#0F172A"
    inverse-primary: "#1D4ED8"
    shadow: "#000000"
    scrim: "#000000"
```

## Typography

All interface copy uses **Inter** for clean legibility at dense table scales and crisp display headings. **JetBrains Mono** is used for course codes, student IDs, batch codes, and transaction references. All numeric KPIs, dates, and currency amounts apply `tabular-nums` so columns align cleanly.

```yaml
typography:
  display-lg:
    fontFamily: "Inter"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 44px
    letterSpacing: -0.5px
  display-lg-mobile:
    fontFamily: "Inter"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 36px
    letterSpacing: -0.25px
  headline-lg:
    fontFamily: "Inter"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: -0.25px
  headline-md:
    fontFamily: "Inter"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: -0.15px
  title-lg:
    fontFamily: "Inter"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 26px
    letterSpacing: 0px
  title-md:
    fontFamily: "Inter"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 22px
    letterSpacing: 0px
  body-lg:
    fontFamily: "Inter"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 22px
    letterSpacing: 0px
  body-md:
    fontFamily: "Inter"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
  body-sm:
    fontFamily: "Inter"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 18px
    letterSpacing: 0px
  label-lg:
    fontFamily: "Inter"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: 0px
  label-md:
    fontFamily: "Inter"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0.1px
  label-sm:
    fontFamily: "Inter"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0.3px
  mono-sm:
    fontFamily: "JetBrains Mono"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0px
```

## Layout & Spacing

Desktop-first responsive application shell built on a **12-column Fluid Grid** inside the main workspace, paired with a fixed **260px** left sidebar on desktop (`lg:` and above) that collapses into a slide-over drawer on tablet and mobile viewports. Top header height is fixed at **64px**. A strict **4px / 8px** spacing scale governs all internal padding, card gutters, and section gaps.

```yaml
spacing:
  gutter-xs: 4px
  gutter-sm: 8px
  gutter-md: 16px
  gutter-lg: 24px
  gutter-xl: 32px
  section: 32px
  page-margin: 24px
```

## Elevation & Depth

Hierarchy is established through **clean hairline borders** (`outline-variant`) and **soft ambient shadows** on primary cards (`0 1px 3px rgba(15, 23, 42, 0.06)`). Elevated popovers, dropdowns, and modals step up with a slightly deeper diffused shadow (`0 10px 25px -5px rgba(15, 23, 42, 0.10)`). Nested containers inside cards use subtle tonal fills (`surface-container-low`) rather than extra shadows.

## Shapes

Consistent, approachable enterprise geometry: `8px` (`DEFAULT`) for buttons, inputs, and table rows; `12px` (`md`) for dashboard cards and panels; `16px` (`lg`) for modals and login containers; and `9999px` (`full`) for status pills, avatars, and notification badges.

```yaml
rounded:
  sm: 6px
  DEFAULT: 8px
  md: 12px
  lg: 16px
  full: 9999px
```

## Motion & Micro-interaction

Transitions are crisp and functional. Interactive controls respond within `120ms` on hover and focus; drawers, dropdowns, and tab panels enter smoothly over `200ms` with ease-out deceleration. No decorative looping animations are used.

```yaml
motion:
  state-change:
    duration: 120ms
    delay: 0ms
    timingFunction: ease-out
  surface-enter:
    duration: 200ms
    delay: 0ms
    timingFunction: cubic-bezier(0.2, 0, 0, 1)
  surface-exit:
    duration: 150ms
    delay: 0ms
    timingFunction: cubic-bezier(0.3, 0, 1, 1)
```

## Voice & Content Strategy

- **Tone of voice:** Clear, authoritative, and operational. Avoid marketing fluff or overly casual phrasing.
- **Capitalisation:** Sentence case for descriptions, table cells, and alerts; Title Case for navigation items, page titles, and primary action buttons (`Add New Course`, `Export Report`).
- **Terminology:** Use consistent Bixcel domain terms: *Course*, *Module*, *Lesson*, *Batch*, *Tutor*, *Student*, *Milestone*, *Examination*, *Fee Ledger*.
- **Numbers & Dates:** Format dates as `Nov 20, 2026`, times as `09:30 AM`, and currency as `$1,250.00` using `tabular-nums`.

## Components

Component implementations live as individual HTML sticker sheet files in
`components/`. Each file contains the canonical, styled HTML components with
`<!-- COMPONENT: name -->` comment markers. Read each file before use.

- **Badge** → `@components/badge.html`: `badge-numeric`, `badge-dot`
- **Button** → `@components/button.html`: `button-primary`, `button-icon`, `button-with-icon`
- **Card** → `@components/card.html`: `card-elevated`, `card-action`, `card-interactive`, `card-interactive-2`
- **Input Field** → `@components/input-field.html`: `input-field-text`, `input-field-icon`
- **Table** → `@components/table.html`: `table-standard`, `table-interactive`, `table-selectable`
