# Digits – Ticket Resolver: design-system audit and use-case gap review

Scope: the Details tab of the Freshservice ticket page (incidents, plus the SR-4128 service request). Audited against Dew (`@freshworks/dew-components`, `dew-styles`), the `dew-ux-design` rules in `SKILL.md`, and the handoff spec in `docs/tr-details-handoff/`.
Method: static review of `src/` (about 25k lines), token and component sweeps, the spec read end to end. I did not run the UI in a browser, so contrast, hit-target size and visual-regression findings are marked "verify".

## 0. What is live

The prototype ships two Details tabs.

- **Option 1** (`details/DetailsTab.tsx`, `TicketDetail.tsx`) is built to the handoff spec.
- **Option 2** (`details/option2/*`, `TicketDetailOption2.tsx`) is the post-21-Oct-review design. It is the only one routed (`TicketsRoute.tsx`).

Option 2 deliberately departs from the spec in several places (see section 3). The handoff docs are now stale relative to what is demoed.

## 1. Design-system audit

### What is working well

- Colour, spacing and font-weight in the Details code come from `var(--color-*)` and `var(--spacing-*)` tokens. There are no Tailwind numeric colour scales anywhere.
- Real Dew components carry most of the UI: `TextButton` (37), `IconButton` (21), `Tag` (16), `Select` (12), `Menu`, `Table`, `Avatar`, `InlineMessage`, `Shimmer`, `Spinner`, `Modal`, `SliderPanel`.
- The code does not hand-roll tags, avatars or selects. `details.tokens.ts` is a clean lookup layer ("no colours, sizes or radii defined here").
- Accessibility basics are present: about 380 `aria-*` attributes, `aria-expanded`/`aria-controls` on disclosures, `aria-label` on icon buttons, and 15 `prefers-reduced-motion` blocks.
- Pure logic is separated and tested (`streamView`, `conversationTimeline`, `responseTimeline`, `stages`). 57 tests pass.

### Findings

| # | Sev | Finding | Evidence | Fix |
|---|---|---|---|---|
| D1 | High | **20 CSS variables are used but defined nowhere in Dew or the repo.** Each falls back silently to a literal hex or `currentColor`, so some of the "tokenised" UI is actually off-system. | Examples: `--color-border-focus` (fallback `#2962ff`), `--color-boundary-border-focus` (fallback `currentColor`, so the focus ring can vanish), `--color-text-danger/-success/-warning/-error/-tertiary`, `--color-fill-danger-subtle`, `--color-fill-info-subtle`, `--color-fill-primary/-secondary`, `--radius-100`, `--font-weight-bold/-regular`, `--color-icon-brand`. Mostly in `styles/index.css` (sentiment pill, focus rings, composer). | Map each to the real Dew token and delete the fallbacks. Add a lint check that fails on any `var(--x)` not defined in `dew-styles`. |
| D2 | High | **A parallel stylesheet of custom components.** `index.css` is 2,826 lines with 193 `.tr-*` classes, so many Dew primitives are re-implemented. | Custom: card chrome/collapse (`AiCardChrome`), strip (`ArtifactStrip`), messages pill (`MessagesPill`), sentiment popover (`SentimentPill`), reply menu (`role="menuitem"` buttons in `ReplyComposer`), disclosure (`Disclosure`), ambient rows. | Rebuild on Dew `Accordion`, `Popover`, `Menu`, `HyperlinkButton`/`TextButton variant="link"`, `SegmentedTabs`. Keep a custom component only where Dew has a real gap (see section 4). |
| D3 | High | **32 raw `<button>` elements in `details/`** (86 across the app). Each loses Dew focus, hover, pressed and disabled states, and the size and hit-target rules. | `ReplyComposer` (9), `ReviewControls` (6), `SentimentPill` (3), `ResponseCard` (2), `MessageCard`, `RootCauseCard`, `SummaryCard`, `ArtifactCard`, `PreTicketLog`, `LiveWorkerCard`... | Replace with `TextButton`/`IconButton`/`HyperlinkButton`. For whole-row click targets, make one real Dew control the target instead of a wrapper. |
| D4 | Med | **Off-system colour literals.** | `RequestedItems.tsx` `#ff9a00` and a `#330000` box (an "illustrator" demo block). `Freshservice.tsx` has 17 hex values, including `#ffffff` and `#C9D3DB` borders. `--fs-app-chrome: #eff6ff` in `index.css` is documented as measured from live, but it is not a token. `TicketsBoard` has a hex fallback. | Replace with semantic tokens. If live truly differs from Dew, raise the discrepancy with the DS team and do not hard-code it. Brand logo SVG fills are acceptable. |
| D5 | Med | **Hard-coded typography.** `font-size: 14px; line-height: 22px` in CSS, about 49 `fontSize` literals in TSX, and Tailwind arbitrary values `fw-leading-[16px] fw-tracking-[0.06px]` repeated in components. This duplicates an existing text style by value, which the handoff forbids ("no new text styles"). Px literals: 14px × 158, 20px × 104, 12px × 101, 13px × 34, 18px × 32. | `ApprovalAttention`, `ResponseCard`, `index.css`. 13px and 18px are not on a Dew scale. | Use the Dew text-style class or token only. Remove 13px and 18px. |
| D6 | Med | **Inline-style sprawl.** `style={{}}` appears 48× in `TicketDetailOption2`, 46× in `TicketDetail`, and 22× in `ResponseCard`. Layout, spacing and colour are not reviewable or themeable in one place. | grep of `style={{` | Move to a small set of layout classes or tokens. Keep inline styles only for truly dynamic values. |
| D7 | Med | **Prototype scaffolding is welded into product components.** Replay, scenario control, review-state switch, the dark "proto" toolbar (`--proto-*` rgba/hex), `TrGallery` and `ReviewControls` all share files with product code. Option 1 (`TicketDetail.tsx`, 782 lines) is dead code beside Option 2 (960 lines). | `DetailsTab.tsx` replay loop, `index.css` lines 1388–1430. | Split into `product/` and `prototype/`. Delete or archive Option 1. A developer handed this repo cannot tell what ships. |
| D8 | Med | **No theming or responsive behaviour.** The only `@media` queries are reduced-motion. There is no dark theme, no narrow-width layout, and a fixed 366px sidebar. Hex fallbacks would break dark mode. | `index.css` | At minimum define breakpoints for the right pane and tab content. Fix D1/D4 first, since theming depends on them. |
| D9 | Low | **No i18n layer.** All copy is inline English. Fine for a prototype, but the spec says to route through the repo mechanism, and Digit names, "Why", "Thinking {s}s" and plurals will need it. | everywhere | Centralise copy keys now. Fixture copy is already structured. |
| D10 | Low | **`size="mini"` icon buttons (about 40 uses)** may fall below the 44px hit-target rule in `SKILL.md`. Verify the rendered size in the browser. | `ApprovalAttention`, cards | Keep the visual size but check hit area. Use the Dew size that meets target. |

### Accessibility specifics

| # | Sev | Finding | Fix |
|---|---|---|---|
| A1 | High | Focus ring depends on undefined tokens (D1). Four rules use `outline: none` (composer textarea, copilot textarea, editor). Check each has a visible `:focus-within` replacement. | Use one Dew focus token. Never remove outline without a replacement. |
| A2 | Med | Live status is not announced. Only 10 `aria-live`/`role=status` uses exist across tickets. "Thinking 12s", "Searching…", "Executing workflow…" and new stream items arriving above the reply bar need a polite live region, throttled (not every second tick). | Add a polite region for state changes and an unread count. Do not announce the timer ticks. |
| A3 | Med | Mouse-only wrappers: `ApprovalAttention` header and section `onClick`, and the `ReplyComposer` body `onClick`. A keyboard fallback exists (the chevron), but the semantics are muddy. | Make the header a single button with `aria-expanded`. |
| A4 | Med | Custom reply-AI menu (`role="menuitem"` buttons) needs arrow-key navigation, Escape, and focus return. Dew `Menu` provides these. | Use Dew `Menu` (ties to D2). |
| A5 | Low | `ArtifactStrip` wraps a button in `aria-hidden` and toggles `tabIndex`. This works, but prefer `inert` or unmounting. The `aria-label` duplicates the visible text plus "Go to …". | Simplify. |
| A6 | Verify | Contrast for tag variants on tinted card backgrounds, secondary text on `fill-container`, and the sentiment pill fallbacks (`#c62828` on `#ffebeb`). | Run an axe/contrast pass. |

## 2. Spec conformance (handoff vs Option 2 vs Option 1)

| Spec item | Status | Note |
|---|---|---|
| B8 "All activity / Messages only" switch | **Missing in UI** | `streamView` supports it and is tested, but `DetailsTab` hard-codes `'all-activity'`, and `ConversationsHeader.action` is never passed. The switch appears nowhere. |
| Heading "Conversations" | Changed to **"Timeline"** | Intentional? Spec, copy and `+N conversations` pill still say Conversations. |
| B1/B2 two AI cards | Option 2: **one `ArtifactCard`** that leads with resolution › root cause › summary | Intentional (21 Oct review). Spec 02/04 needs a rewrite. |
| B10 sticky strip with chips | Option 2: **single brief line**, no chips | Same. |
| Landing at top for just-assigned viewer | **Contradicted in Option 1**: `scrollTop = scrollHeight` for incidents. `getLandingTarget` exists and is tested, but only `firstUnreadId` is used. | Rule 1 of 03-behaviour is not met. Confirm what Option 2 does. |
| B3 Description | Hidden for incidents in Option 1 ("duplicates the summary") | Departs from the spec. Option 2 has `DescriptionBox`. |
| Human-thread fold: more than 5 items, show latest 4 | Option 2: past 4, fold all but latest 2 | Documented in code, not in spec. |
| "Proposed" states (out-of-date, edited, disputed, sentiment, drafted-with, decided approval) | All six flags **default to ON** (`DEFAULT_PROPOSED`) | They were meant to be gated. A reviewer sees them as shipped design. |
| Card collapse state remembered per viewer | Done (`useCardCollapse`, localStorage) | Only 3 `try` blocks. Confirm all reads are guarded. |

## 3. Use-case coverage (architect view)

**Covered today:** Slack handover Blocked (INC-4127); email, humans only (4133); blocked by change freeze (4140); inconclusive RCA (4142); email ticket, no Digit, on-demand summary (4150); auto-resolved, no human (4155); service request with approval and three items (SR-4128); 16 journey stages from deflection failed to blocked-partial; approvals, Ask AI, public reply and resolution scenarios.

### Gaps

| # | Sev | Gap | Why it matters / proposal |
|---|---|---|---|
| U1 | High | **Teams, portal and phone are not exercised.** Only Slack and email fixtures exist. Teams has a logo and label but no ticket. The portal path (Concierge via the portal) is unrepresented. | Channel awareness drives the reply bar, the "replied in {channel}" meta, and the "private note only" rule. Add a Teams fixture and a portal fixture. |
| U2 | High | **Reopen after auto-resolve.** INC-4155 ends resolved, but nothing shows what happens when the employee says "still broken". | Define: does Ticket Resolver resume, or is it assigned to a human? How does the run group look afterwards? Add a "reopened" event and state. |
| U3 | High | **Approval lifecycle is thin.** Only pending and approved are shown. Missing: rejected with reason (the spec has it), approver is not the viewer (read-only, "Waiting on {name}"), expired or escalated, approver changes the proposed values, several pending approvals (the count exists, but no ordering rules). | Approvals gate real changes, so this is the highest-risk surface. Add a state matrix, and show who can act. |
| U4 | High | **AI failure and latency states.** There is a handoff for "triage failed", but no inline error, retry, or timeout on Summary or RCA generation. `generating` has no ceiling. | Add `error` and `timed-out` states with a retry and "handed to a person" fallback. Never leave a spinner indefinitely. |
| U5 | High | **Stale AI output.** `out-of-date` and `edited` exist as "proposed" flags, but nothing defines when a summary or RCA is invalidated, for example by new messages after handover or a changed asset. | Define the freshness rule (message count or time). Define who may overwrite whom (Digit vs agent edit) and keep the restore path. |
| U6 | Med | **Permissions and roles.** Viewer is always an assigned agent. Missing: light agent or read-only, collaborator, a requester-facing view, and an agent without access to the assets and changes the RCA cites. | RCA exposes change and asset IDs, so show redacted or "no access" link states. |
| U7 | Med | **Scale.** Longest stream is about 20 items. There is no 100+ event, 50-message, or long-run case. Folding uses a fixed rule, and there is no in-stream search, jump-to-latest, or "n new" pill while scrolled up. | Test with a large fixture. Add virtualisation or windowing and a stable unread anchor. |
| U8 | Med | **Concurrency.** Two agents open, a requester reply arriving while an agent is drafting (the prototype has `incomingMessages`, but no collision rules), a Digit action landing mid-compose. | Define: draft is preserved, a banner shows "new reply", and Send is not blocked silently. |
| U9 | Med | **Handoffs beyond one hop.** Group to person is covered. Missing: person to person, a reassigned ticket (does the run group show to the new assignee?), reassigned back to a Digit. | Landing and unread logic depend on `lastSeenAt` versus handover time. |
| U10 | Med | **Attachments in chat messages** (Slack images and files) inside conversation cards. The attachment components exist only for Description and SR. | Common in Slack and Teams incidents. |
| U11 | Med | **Related work objects.** Merged or duplicate tickets, a parent major incident, linked Problem or Change records. Only a "Related tickets" tab and text links exist. | Show linkage and status inline when the RCA cites a change. |
| U12 | Med | **Service requests:** only one fixture. Missing: rejected approval, item-level failure, partial fulfilment, cancelled item, re-approval. | The SR path was "next round" per the handoff, but is already built. |
| U13 | Low | **Other Digits.** Knowledge Curator and the two Handlers only render through the generic `digit-event`. Handlers have no avatar and use a generic icon. | Decide if they appear on tickets. If yes, give them artwork and distinct events. |
| U14 | Low | **Trust and transparency.** The "AI-generated", "Drafted with Freddy", confidence and feedback patterns differ across cards. Where does "not helpful" go, and does it change the next suggestion? | One consistent AI-attribution pattern, and a defined feedback outcome. |
| U15 | Low | **First paint and empties.** No page-load skeleton for the whole tab, and no "no conversations yet" empty state. | Use `Shimmer`. |

## 4. Recommended improvements

### Architecture
1. **One source of truth.** Publish spec v2 that matches Option 2 (single artifact card, brief bar, fold rule, "Timeline"). Archive Option 1. Record each departure with its review date.
2. **Separate product from prototype.** `product/` (cards, stream, composer), `prototype/` (replay, scenarios, review controls, gallery, proto toolbar). Production code should not import from prototype.
3. **Define a TR component layer with a state matrix** (card, response, event row, approval, group header, strip). Each should have typed props, a Dew composition, and a gallery entry for every state. Today `catalog.ts` covers blocks, not the new Option 2 states.
4. **Drive UI from the state machine.** `stages.ts` already models 16 journey stages. Make it the contract for the states Design, Eng and QA share, and add rows for error, timeout, reopened and rejected.

### Design system (raise with the Dew team)
Likely real gaps, per the "composition or flag" rule: (a) a meter or progress bar with a threshold marker (the spec already notes it); (b) a timeline or stream row; (c) an animated collapsible card with a one-line collapsed form; (d) a sticky context bar; (e) an AI-attribution pattern; (f) a live-status label ("Thinking {s}s"); (g) a recipient or token input. Everything else in D2/D3 should be built on existing Dew components.

### Priority order
1. D1 (undefined tokens) + A1 (focus). Small effort, and it fixes colour, focus and dark-mode risk at once.
2. B8 switch wired up; decide the heading name; gate the "proposed" flags.
3. U3, U4, U5 (approval, AI failure, staleness), because they are the trust-critical states.
4. D3, D2, A3, A4 (raw buttons and custom menus to Dew).
5. U1, U2 fixtures (Teams, portal, reopen).
6. D7 (split prototype and product), then D5/D6 clean-up and spec v2.

## 5. Not verified

Visual rendering, rendered hit-target sizes, contrast ratios and keyboard flow were not tested in a browser. The Dew MCP and Figma were not available (authorisation required), so conformance to Figma specs and Dew documentation was checked against the installed package only.
