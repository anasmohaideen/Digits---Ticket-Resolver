# Digits · Ticket Details — Design Guidelines (consolidated)

Status: as built in the prototype, through Round 33 (November 2026).
Scope: the Freshservice "Digits – Ticket Resolver" ticket details page (Details tab, side panes, reply dock, AI surfaces).
Sources of truth, in order: **Dew DS (fw-dew)** → **Dew AI / AI Design System** (AI elements only) → **Dew Illustration library**.
Earlier detail lives in `Digits-Details-Card-Guidelines.md`, `Digits-Details-Design-Language-Inventory.md` and the per-round log `Digits-Prototype-Changes.md`; this document supersedes them where they differ.

---

## 1. Principles

1. **Dew first.** Every non-AI element is a Dew component with Dew tokens. Custom UI is allowed only where Dew has no equivalent, and is listed in §14.
2. **AI elements follow the AI Design System** (ActionBanner, AiShimmer, AiGeneratingText, AIThinking, SliderContainer, CopilotPanel, ActionButton, PrimaryButton). Do not swap them for Dew components unless the AI DS itself says so. Where Dew has a direct equivalent for a small control (thumbs, text toggles), Dew wins.
3. **Tokens only.** Colour, type, spacing, radius, shadow and icon colour come from Dew tokens. No hex/rgb, no px font sizes, no raw spacing in product UI. If no token matches, list the nearest candidates and ask — never invent a value.
4. **Light and dark are one design.** Anything that cannot read a token (baked-colour images) is re-tinted via a mask + token, never left light-only.
5. **One canonical home per fact.** The pinned card holds Summary / Root cause / Resolution; the thread holds one-line pointer rows to them.
6. **One container per generation.** Generating or regenerating never opens a second container (§6).
7. **Quiet cards.** No gradients, glow or tint on conversation cards. The only gradient is the pinned AI card's Dew-AI border.
8. **Say who, say what, say when.** Every entry carries an actor avatar, a name (semi-bold), and a time.

## 2. Tokens

| Concern | Rule |
|---|---|
| Colour | `--color-fill-*`, `--color-text-*`, `--color-icon-*`, `--color-boundary-*`. Semantic variants (`-semantic-success/warning/info/error/highlight`) for status; never hex. |
| Type | Only the Dew font tokens: `--font-body` (14/20), `-medium`, `-semibold`; `--font-callout` (16/24) and `-regular`; `--font-caption` (12/20), `-medium`, `-regular`; `--font-headline` (18/24). Use `font: var(--font-…)` — weight and line-height come with it. Off-scale sizes snap to the nearest token. |
| Spacing | `--spacing-025` 2 · `050` 4 · `075` 6 · `100` 8 · `150` 12 · `200` 16 · `250` 20 · `300` 24 · `400` 32. |
| Radius | `--border-radius-2xsmall/xsmall/small/medium/large/circular`. Cards use `large`; pills/chips `circular`. |
| Shadow | `--shadow-xs/sm/md/lg/…`. Popovers use `--shadow-md`. |
| Names | Actor names are `--font-weight-semi-bold` everywhere they appear. |
| Defined-token check | Before using a token, confirm it exists in `@freshworks/dew-styles`; unknown tokens silently fall back (this bit us three times). |

Known exception (awaiting decision): app-chrome fill `#eff6ff` (top bar + left rail) has no Dew token; nearest are `--color-fill-semantic-info-mildest` (stronger blue) and `--color-fill-semantic-highlight-mildest` (violet). Dark mode uses `--color-fill-container`.

## 3. Page frame and layout

- **Alignment line:** `--tr-content-inset` (= 42px: spacing-400 + 025 + 100) aligns the description, conversation and footer buttons to the first letter of the first tab ("D" in Details).
- **Content is responsive:** fills the column, keeps the inset offset, no max-width.
- **Footer** (reply dock) is sticky, full-width, `--color-fill-container`, 1px top border, and **always at the bottom** regardless of thread length; its buttons align to the content inset.
- **Right-hand panes:** the property pane sits with the ticket; **Agent Concierge is the right-most pane**. At ≥ 1720px both can be open together; below that, opening the Concierge pane hides the property pane. The footer **Ask AI** button and the top-bar AI button open/close **only** the right pane (never the composer).
- Tabs use Dew `HorizontalTabs` (built-in More overflow).

## 4. Cards in the thread

Fill = direction/audience; chip = type.

| Entry | Fill | Chip (Dew `Tag`) |
|---|---|---|
| Reply (agent → requester) | **Grey** `--color-fill-container` | blue "Reply" |
| Public note | **Grey** | blue "Public note" |
| Forward | **Grey** | gray "Forwarded" |
| Digit reply (Digit → requester/agent) | **Grey** | per channel |
| Private note | **White** `--color-fill-surface` | yellow "Private note" + lock |
| Message received (requester) | **White** | — |
| Digit automations / AI entries | unchanged (white surface, flat) | — |

All cards: 1px `--color-boundary-border-mildest`, radius `large`, **no gradient/glow**. Rich content renders in a neutral well (`RichHtmlView`): code scrolls sideways, images/tables stay inside, broken images degrade to "Image unavailable", unsafe or empty content shows a **"Content removed"** placeholder, code blocks copy in one click.

## 5. Timeline rows (events) and the icon lead

- Events are light **rows**, not cards: 24px lead box, headline, time, and a details toggle.
- **Details toggle:** Dew `TextButton` (link, mini) with a chevron and a short summary ("5 changes ›"). The expanded body is a left rule dropped from **the centre of the last avatar in the lead**; body text aligns with the headline.
- **Lead rules (analyse the response, don't always show two icons):**
  - a person acting → their avatar only;
  - a Digit / Agent Concierge acting → its avatar + one mark for the kind of action;
  - larger sets stack (overlap, 24px chips) up to **3, then "+n"**; hover/focus opens a popover listing **Digits involved** and **Actions performed**. The popover uses surface/border/shadow tokens, and flips above / to the end when it would leave the window.
- **Property changes:** consecutive updates from one actor merge into one row (first "from", last "to"). Ordinal fields (Priority, Urgency, Impact, Severity) are colour-coded Low → green, Medium → yellow, High/Urgent → red with Dew `Tag`; **all other fields stay plain text**.
- Long detail lists show 5, then "+N more".
- **Day separators** are a centred grey pill (no full-width rules). The **"New"** divider before unread incoming messages is a centred info pill.
- **Live Digit work:** after an approval, a `DigitRunRow` (AI DS `AIThinking`) shows spinner → tick steps with Stop, then settles into "Ran N steps" + outcome.
- Approvals decided / handed over are rows.

## 6. The pinned AI card (Summary · Root cause · Resolution)

- One card with a Dew `SegmentedTabs` strip when more than one artifact exists; a single artifact shows a title.
- **Generation and regeneration are in-card:**
  1. the new tab appears in the strip first (fixed order Summary, Root cause, Resolution);
  2. the card switches to it; its body shows a status line + `AiShimmer`;
  3. **other tabs stay visible and selectable**;
  4. header actions, byline and feedback are hidden until content lands.
  No banner, busy row or secondary container is created while other tabs exist. Only when nothing exists yet does the AI DS "Summarize ticket" banner (and its thinking state) show.
- **Triggers:** "Summarize ticket" (first/restore), "Find the likely cause and resolution steps", "Generate a resolution note", Regenerate.
- **Attribution:** manual generation → **Agent Concierge**; auto-generated → the Digit's name (e.g. Ticket Resolver). Never "Freddy AI" / "Freddy AI Copilot".
- **Actions:** Regenerate, Copy (Dew success toast), Edit, Forward (email-like tickets), Delete. **Root cause has no Edit.** Deleting a tab offers a restore row through the same generation flow.
- **Edit** opens an in-card rich-text editor (same toolbar as the reply editor); saves sanitised HTML. Edited items are credited to the person.
- **Error state:** Dew `InlineMessage` (error) + "Try again" (preview with `gen-error` in the URL).
- **Feedback:** AI feedback footer uses Dew **Upvote / Downvote** icon buttons (filled when chosen); "Generated by Freshworks AI" on the left.
- The sticky strip appears when the card scrolls behind the tabs.
- The Description brief is plain (no italics) with an **AI byline** ("Summarised by AI").

## 7. Description and attachments

- Description box with brief, requester context, folded body with expand.
- **Attachments use Dew `Attachment`** (read-only: rows only, remove hidden, **never `disabled`** — that greys the rows). Rows sit horizontally and wrap. **Images show as thumbnails** (96×72 tile; real `url` when provided, otherwise a Dew doc-type icon), other files as Dew rows.
- Service Requests show the Requested items table (Illustrator tile uses warning tokens).

## 8. Reply dock (composer)

- Buttons: **Reply** (Dew `SplitButton`; channel-aware label e.g. "Slack Reply", menu holds "Reply using AI" options), Forward, Note, **Ask AI** (AI DS ActionButton with Dew `Ai` icon in `--color-icon-primary`; same hover as other AI buttons; opens the right pane only).
- Composer: rich-text editor with `FormatToolbar` (paragraph, colour, highlight, align, lists, code, link, image). **Colour/highlight swatches are Dew tokens resolved at apply time.**
- Recipients (To/Cc/Bcc/Notify): Dew multi `Select` with search and create-new (email-validated).
- Quoted earlier message toggle: Dew `IconButton` (More).
- **Read-only state:** when a ticket can't be replied to, the composer is replaced by a Dew `InlineMessage` (info) with "Reopen ticket" (preview with `readonly` in the URL).
- New incoming messages: pinned to the end if already reading there; otherwise the **New messages** pill scrolls to the first unread with a brief ring.

## 9. Agent Concierge and the AI panes

- Name **Agent Concierge**, title text semi-bold; avatar is the **Workplace Concierge Digit avatar** (Digits Avatar set from the FW-Digits-Viz Figma), not an icon — in the timeline, messages pill, icon stack and both pane headers.
- Ask AI pane = AI DS `SliderContainer` (new conversation, minimize, close, enter glow, welcome block, prompt chips, `AiInputBox`, thread). Edit-with-Copilot = AI DS `CopilotPanel` (quote chip, rewrite thread, "Add to composer").
- Minimised pane collapses to a 52px header card; conversation reclaims the width.

## 10. Digit identity

Five avatars (Ticket Resolver, Workplace Concierge, Knowledge Curator, Hardware Handler, Software Handler) from Figma, stored in `Assets/Digits Avatar/`. Timeline box is 24px with a 20px inset glyph (32px/24px inside cards). Channel badges (Slack/Teams) are circular with a 1px ring. A Digit without artwork falls back to a Dew bot icon.

## 11. Icons

- Dew icon names only (typed set). Freddy mark, sparkle, Ask AI and composer title use Dew `Ai`; Approved tick uses `Actions/Approve` with `--color-icon-semantic-success`; split view uses `ExpandSidebar`; feedback uses `Actions/Upvote|Downvote(+Filled)`.
- Secondary/decorative icons use `--color-icon-secondary` (the AI sparkle is **not** purple in dark mode).
- Any remaining baked-colour artwork is rendered as a CSS mask tinted by a token (`tr-mask-icon`), or registered in `monoIcons.ts`.
- Brand artwork (Slack, Teams, Digit avatars) keeps its own colours.

## 12. Theming

Light, dark and system via `src/theme.ts` (classes `dew-light-theme` / `dew-dark-theme` / `dew-system-theme`, `data-surface`, stored in `tr-theme-mode`). The in-page theme switcher lives in the prototype controls. Code tokens use semantic text colours so one set serves both themes.

## 13. States every element must define

Loading/generating (shimmer + status line) · error (Dew InlineMessage + retry) · empty (AI DS banner or single title) · deleted (restore row) · read-only · unread/new · content removed · hover/focus-visible (Dew focus ring) · reduced motion (no smooth scroll or morph).

## 14. Where custom UI is allowed (no Dew equivalent)

- Messages pill (avatar cluster + count), the full-width sticky artifact strip button, the empty Summary / Root-cause card buttons.
- Rich-text editor surface (`contentEditable`) and its toolbar layout.
- Timeline lead stack and popover (`TimelineLead`).
- AI-DS-sourced pieces in `src/dewai/` (ported, not edited except title/avatar props).
- Prototype controls bar (not product UI).

## 15. Decisions still open

1. App-chrome fill token (see §2).
2. Split-view icon: `ExpandSidebar` (Dew has no list-with-pane glyph; Dew `Split` is a branching arrow).
3. Whether the "Summarize ticket" first-run banner should become a card with a single title.
4. Phone and portal channel styling, the ask-for-it ambient row and the "Drafted with Freddy" tag — **deliberately unchanged**.

## 16. Prototype hooks

`#/freshservice/tickets/INC-4127` (default AI rows) · `INC-4133` (notes, forwards) · `INC-4140`/`4142` (property changes) · `INC-4150`, `INC-4160` (on-demand summary) · `SR-4128` (service request, attachments) · URL contains `gen-error` → generation failure · `readonly` → read-only dock · `?stage=` journey stages · prototype bar → send follow-ups, theme.

## 17. Engineering notes

- Stack: Vite + React 18 + TypeScript, `@freshworks/dew-components` / `dew-styles`, `src/dewai` (AI DS port). Tests: `npm test` (58). Build: `tsc && vite build`; standalone single-file build via `vite.single.config.ts`.
- Do not hand-write colours; run a token-defined check before merging.
- `TicketDetailOption2` is the live details view; the earlier Option 1 view and its orphaned components were removed in the Round 34 cleanup.
