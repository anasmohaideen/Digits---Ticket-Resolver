# Product

## Register

product

## Users

Freshworks designers and product engineers building or prototyping screens on the **Dew** design system, plus external developers who need to evaluate or adopt Dew from outside the Freshworks network (where the GitHub Packages registry isn't reachable). Users arrive in a working context: they have a screen, flow, or component in mind and want to compose it from real Dew parts quickly, then hand it off or ship it. They are fluent in product tooling and expect components to behave exactly as they do in production Freshworks apps.

## Product Purpose

A starter kit that installs the Dew packages (`@freshworks/dew-components`, `@freshworks/dew-styles`, `@freshworks/dew-theme-generator`, `@freshworks/dew-mcp-server`) from the public npm registry at `latest`, so the system can be used from outside the Freshworks network without registry authentication. It ships a small Vite + React demo that proves the setup works end to end: a component-overview gallery and a Freshservice prototype — the app shell, the Dashboard, the Tickets list and detail, Admin home, and the AI Agent Studio. Success is when a designer or engineer can clone, `pnpm install`, and immediately build a credible, on-system Dew screen — no auth detour, no hand-rolled components, no off-system color.

## Brand Personality

The voice is Freshworks/Dew, not a separate identity: calm, competent, and quietly friendly. Three words: **on-system, efficient, trustworthy**. The interface should feel like the real Freshservice product — familiar enough that an existing user trusts it on sight — and the demo should read as a faithful prototype, not a marketing showcase. Emotional goal: confidence that what you build here is what ships.

## Anti-references

- Generic AI-generated SaaS dashboards: identical icon-in-a-card grids, gradient hero metrics, glassmorphism, decorative gradients.
- Hand-rolled buttons, inputs, modals, or nav that imitate Dew instead of using the real components.
- Raw hex colors or numeric Tailwind scales (`bg-blue-600`) standing in for Dew's semantic `fw-`/`--color-*` tokens.
- Left-border accent callout cards, tiny uppercase tracked eyebrows on every section, `01 / 02 / 03` section numbering as scaffolding.
- Fake dashboards full of arbitrary numbers or vague labels ("Insights", "Growth") with no real content.
- Anything that reads as "a website" rather than the Freshservice product surface.

## Design Principles

1. **Compose from real Dew, never reinvent it.** Reach for an existing `@freshworks/dew-components` component and its documented props before building anything custom. A missing piece is a composition or a flagged gap, not a cue to hand-roll.
2. **Semantic tokens carry meaning.** Use Dew's `fw-`/`--color-*` semantic tokens (surface, text, border, severity, radius) so screens stay themeable and dark-mode-ready. Raw values are a smell.
3. **Earned familiarity over novelty.** The tool should disappear into the task. Match production Freshservice patterns; save surprise for genuine moments, not pages.
4. **Fidelity is the deliverable.** This is a prototyping and handoff surface — props, states, and layout should match what actually ships, so a build here transfers cleanly to product.
5. **Inherit accessibility, don't undo it.** Dew ships real focus-visible states, keyboard support, and contrast. Honor required a11y props (e.g. `aria-label` on `IconButton`) and never strip what the system gives you.

## Accessibility & Inclusion

Target **WCAG 2.1 AA**. Body text ≥4.5:1 contrast, large text ≥3:1; lean on Dew's text tokens rather than light-gray-for-elegance. Preserve visible focus indicators (the app already uses `focus-visible` rings), full keyboard operability, semantic HTML, and ≥44px hit targets. Respect `prefers-reduced-motion` for any non-trivial animation, including the Agent Studio charts. Don't rely on color alone to convey state — pair severity color with icon or text.
