# Enhanced DESIGN.md Template

This template is designed for AI-driven UI generation, not just human-readable documentation.
It keeps the standard DESIGN.md structure, but adds stronger machine-readable constraints so downstream models produce more consistent UI.

Use this when:

- generating a new `DESIGN.md` from an existing webpage or product
- refining a rough design system into a more enforceable prompt substrate
- preparing a design contract for repeated AI UI generation

## Design Goals

- Keep the token layer authoritative
- Make semantic roles explicit
- Reduce prompt ambiguity
- Preserve enough prose for taste and rationale
- Add negative constraints and conflict resolution rules

## Recommended Structure

```md
---
version: alpha
name: [System Name]
description: [One-sentence summary of the visual identity]

colors:
  primary: "#000000"
  secondary: "#666666"
  tertiary: "#0055ff"
  neutral: "#f5f5f5"
  background: "#ffffff"
  surface: "#fafafa"
  on-background: "#111111"
  on-surface: "#222222"
  border-subtle: "#e5e5e5"
  accent-success: "#0f9d58"
  accent-warning: "#f9ab00"
  accent-error: "#d93025"

typography:
  display-lg:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.03em
  headline-md:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.25
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0.04em

rounded:
  sm: 6px
  md: 10px
  lg: 16px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  section-gap: 64px
  container-padding: 24px
  max-content-width: 1200px

semanticRoles:
  page-background: "{colors.background}"
  page-text: "{colors.on-background}"
  card-background: "{colors.surface}"
  card-text: "{colors.on-surface}"
  primary-action-background: "{colors.primary}"
  primary-action-text: "{colors.on-background}"
  secondary-action-background: "{colors.surface}"
  secondary-action-text: "{colors.on-surface}"
  divider: "{colors.border-subtle}"
  muted-text: "{colors.secondary}"

effects:
  shadow-soft: "0 8px 24px rgba(0,0,0,0.08)"
  shadow-none: "none"
  border-default: "1px solid {colors.border-subtle}"
  blur-overlay: "blur(20px)"
  gradient-hero: "linear-gradient(135deg, #111111 0%, #333333 100%)"

constraints:
  maxAccentColorsPerScreen: 1
  maxFontWeightsPerScreen: 2
  maxCornerRadiusFamiliesPerScreen: 1
  preferTokenReferencesOverLiteralValues: true
  requireAAContrastForBodyText: true
  disallowMixedVisualLanguages: true
  disallowUnspecifiedShadows: true

responsiveRules:
  mobile-first: true
  stack-cards-below: 768px
  max-columns-desktop: 12
  preferred-density: comfortable
  nav-pattern-mobile: drawer
  nav-pattern-desktop: topbar

components:
  button-primary:
    backgroundColor: "{semanticRoles.primary-action-background}"
    textColor: "{semanticRoles.primary-action-text}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: 44px
    border: "{effects.border-default}"
    shadow: "{effects.shadow-none}"
  button-primary-hover:
    backgroundColor: "{colors.tertiary}"
  card-default:
    backgroundColor: "{semanticRoles.card-background}"
    textColor: "{semanticRoles.card-text}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    border: "{effects.border-default}"
    shadow: "{effects.shadow-soft}"
  input-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
    height: 48px
    border: "{effects.border-default}"
---

## Overview
[Describe the brand personality, emotional tone, density, and visual intent in 4-6 sentences.]

## Colors
- **Primary:** [What it does in UI]
- **Secondary:** [What it does in UI]
- **Tertiary:** [When it is allowed]
- **Neutral/Surface:** [How backgrounds and containers behave]

## Typography
- **Display:** [When large type is used]
- **Headlines:** [Hierarchy rule]
- **Body:** [Default reading style]
- **Labels:** [Metadata, controls, small UI text]

## Layout
- [Grid system, spacing rhythm, grouping principles]
- [Content width, alignment style, white-space strategy]

## Elevation & Depth
- [How hierarchy is created: shadows, borders, blur, tonal contrast]
- [When depth is allowed vs not allowed]

## Shapes
- [Corner radius philosophy]
- [Whether shapes feel sharp, soft, geometric, organic]

## Components
### Buttons
[Behavior, emphasis rules, and variant usage]

### Cards
[Surface treatment, grouping, and hierarchy]

### Inputs
[Borders, fill, focus behavior, helper and error styling]

### Navigation
[Nav style, density, active state treatment]

## Do's and Don'ts
### Do
- [Rule 1]
- [Rule 2]
- [Rule 3]

### Don't
- [Anti-pattern 1]
- [Anti-pattern 2]
- [Anti-pattern 3]

## Prompt Contract
When an AI system consumes this DESIGN.md, it must apply these rules in order:

1. YAML token values are normative.
2. Component tokens override general prose for matching UI parts.
3. Constraints and responsive rules are hard limits unless the user explicitly overrides them.
4. Prose fills gaps but must not contradict tokens.
5. If user instructions conflict with this file, preserve brand identity first and only relax rules when explicitly told to do so.
```

## Why This Template Is Stronger

- `semanticRoles` avoids forcing the model to guess what `primary` means in context.
- `effects` captures blur, borders, shadow, and gradients that are usually buried in prose.
- `constraints` gives negative rules as explicit machine-readable limits.
- `responsiveRules` reduces drift across mobile and desktop generations.
- `Prompt Contract` makes precedence explicit.
