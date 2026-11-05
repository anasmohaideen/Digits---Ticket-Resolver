# 04 · Component mapping

Filled in against this repo (`fw-dew-starter`, React 18 + Vite + `@freshworks/dew-components`
1.0.1 + `@freshworks/dew-styles` 1.0.0). Every row uses a component that already exists, or
composes one from existing primitives. No new primitives, text styles, colors, spacing or radius
values are introduced.

## Finding that changes the plan

**The Details tab is empty today.** `src/routes/freshservice/tickets/TicketDetail.tsx` builds the
quick-action band, subject block, tab strip, widget sidebar and widget rail, and then renders
`null` for the `Details` tab (line 681: `{tab === 'Details' ? null : …}`). There is no existing
Summary card, Description container, initiating-changes card, conversation card, "+N
conversations" pill or reply bar to reuse.

So every "(today's)" row below becomes **compose from Dew primitives** — which `PROMPT.md`
allows. Two consequences:

- There is no existing behaviour to regress on the Details tab. INC-4133 still gets rendered as
  the humans-only proof, but it is a new page, not a preserved one.
- Message cards, the Description block and the reply bar are built here as first-class
  components so that whatever lands in the real product can replace them one-for-one.

## Repo conventions detected

| Concern | What the repo does |
|---|---|
| Framework | React 18, function components, TypeScript strict, no class components |
| Styling | Inline `style` objects reading Dew CSS custom properties (`var(--spacing-200)`, `var(--color-text-secondary)`); a handful of hover-only rules in `src/styles/index.css` keyed by `fs-*` class names |
| Type styles | No type-style tokens exist in `dew-styles`; the repo's own convention is explicit `fontSize`/`lineHeight` px with `var(--font-weight-medium|semi-bold)`. Reused verbatim (12/20, 13/18, 14/20, 16/20, 16/24) — no new values |
| Data | `*.data.ts` next to the route, `as const` tuples plus exported types |
| State | Local `useState`/`useRef`; no store, no data fetching, no query library |
| Routing | `react-router-dom` v7, routes declared in `src/App.tsx` |
| Feature flags | **None exists** |
| i18n | **None exists** — copy is inline English |
| Tests | **No runner configured.** Node 25 is available and strips types natively |
| Lint | **No ESLint/Prettier config.** Type check is `pnpm build` (`tsc && vite build`) |
| Storybook | **Not present.** `/` (Overview) is the repo's own component gallery pattern |

## Block mapping

| Block | Spec ref | Existing component(s) to use | Props / variant | Tokens / text styles | Gap (and proposal) |
|---|---|---|---|---|---|
| Summary card | B1 | `Card` + `Icon` + `IconButton` + `TextButton` + `Tag` + `Shimmer` + `Spinner` + `InlineMessage` | `Card variant="flat" padding="md"`; header icon `Icon custom src="Assets/Icons/Freddy AI.svg"`; actions `IconButton size="mini"` (`Refresh`, `Copy`, `AddToTicket`, `Edit`, `MoreHorizontal`, `ChevronUp`); feedback `IconButton` `CSATHappy`/`CSATSad`; `not-generated` → `TextButton variant="secondary" prefixIcon` | `--color-fill-surface`, `--color-boundary-border-mildest`, `--border-radius-large`, `--spacing-150/200`, 14/20 body, 12/20 meta | None. `out-of-date` notice uses `InlineMessage variant="info"`; `edited` chip uses `Tag variant="gray"` |
| Summary card: collapsed row | B1 | `Card` + `Tag` + `IconButton` | One-line flex row: `Tag variant="gray"` "Summary" · truncated `summary.strip` · time · `IconButton iconName="ChevronDown"` with `aria-expanded` | `text-overflow: ellipsis` on the preview span | None |
| Root cause & fix card | B2 | Same set as B1, plus `HyperlinkButton` for evidence links | Confidence badge `Tag variant="green|yellow|red"` by band; Digit attribution `Avatar size="xs"` + name; "Why" = `TextButton variant="link" size="mini"` with `aria-expanded` + `suffixIcon="ChevronDown"` | Divider before Suggested fix = `1px solid var(--color-boundary-divider-mildest)` | None |
| Confidence meter with threshold | B2 | `ProgressLoader` | `value={score*100} max={100} aria-label` | — | **Gap:** `ProgressLoader` takes `value`/`max` only — no threshold marker. Per spec, the threshold is shown in text ("0.84 · above your 0.75 threshold"). No new component |
| Fix steps list (done/failed/skipped/running) | B2, B5 | `Icon` + `Spinner` | `Check` / `CircleCross` / `Minus` at `size="sm"`, coloured `--color-icon-semantic-success|error`, `--color-icon-secondary`; `running` → `Spinner size="sm"` | 13/18 label, 12/20 detail | None. One `FixSteps` component serves both the card and the `workflow-executed` event |
| Description + attachments | B3 | `Card` + `Icon` + `TextButton` | Static attachment rows (name + size + `Icon name="Attachment"`); `origin` as a 12/20 secondary meta span beside the heading | — | **Gap:** Dew's `Attachment` is an upload widget (`IAttachmentFile`, drag-drop, validation), not a read-only chip. Read-only rows are composed from `Icon` + text, matching the reference |
| Requester reply card | B4 | `MessageCard` composed from `Card` + `Avatar` + `Tag` + `IconButton` | `variant="requester-reply"`; tinted surface `--color-fill-container`; channel meta "replied in Slack"; sentiment `Tag variant="yellow"` behind `showSentiment` | 14/20 body, 12/20 meta | None (nothing exists to reuse — see finding above) |
| Agent reply card | B4 | same | `variant="reply"`; meta "replied in Slack" / "replied to {email}"; `Tag variant="gray"` "Drafted with Freddy · edited" behind `showDraftedWith` | — | None |
| Forward card | B4 | same | `variant="forward"`; meta "forwarded to {to}" | — | None |
| Public note card | B4 | same | `variant="public-note"`; meta "added a note" | — | None |
| Private note card | B4 | same | `variant="private-note"`; `Icon name="Lock" size="2xs"` in the meta; surface `--color-fill-semantic-warning-mildest` | — | None |
| Digit / Concierge message | B4 | same | `variant="digit-message"` / `"concierge-message"`; Digit avatar; meta "replied in Slack via Workplace Concierge"; actions limited to `Forward` | — | None |
| Digit avatars (TR, Concierge, Curator) | B4, B5 | `Avatar` | `imageUrl` from `Assets/Digits Avatar/*.svg` (all three exist), `shape="square"`, fixed `colorVariant` so Dew does not randomise per mount — the pattern `RequesterAvatar` already uses | — | **Gap:** no asset for `software-handler` / `hardware-handler`. Falls back to `Avatar iconName="Bots"`, flagged in code |
| Event row + disclosure | B5 | `Icon` + `Avatar` + `TextButton` + `Tag` + `HyperlinkButton` | One-line flex row; expandable rows use a `TextButton variant="link" size="mini"` with `aria-expanded` + `aria-controls` and a chevron that flips; panel below in a `--color-fill-container` block | 13/18 line, 12/20 detail; per-type leading icon from the whitelist (`TicketPrimary`, `PickupTicket`, `Refresh`, `EditProperties`, `Search`, `BulbIdea`, `Ai`, `Admin/WorkflowAutomator`, `Actions/Approve`, `CircleCheck`/`CircleCross`, `Handshake`, `Note`, `Admin/ConnectorApp`, `Bots`) | None. `Accordion` is not used here: its header has fixed `fw-py-100 fw-px-150` padding, which breaks the one-line row rhythm. A plain button with `aria-expanded` is the same affordance from an existing primitive |
| "Why" toggle + reasoning panel | B5 | `TextButton` | `variant="link" size="mini"`, `aria-expanded`, `aria-controls`, label "Why" (root cause card footer uses the reference's "How this was found") | Panel: `--color-fill-container`, `--border-radius-small`, 13/18 | None |
| Live state (spinner + elapsed) | B5 | `Spinner` + `Tag` | `Spinner size="sm" aria-label`; elapsed in a `Tag variant="gray"`; `waiting` uses `Icon name="Pause"` instead of a spinner | — | None |
| Approval card (pending / decided) | B6 | `Card` + `Tag` + `TextButton` + `Icon` | `Card variant="outlined" padding="md"` with `--color-boundary-semantic-info-mild`; `Reject` = `TextButton variant="secondary"`, `Approve` = `variant="primary"`; decided → `Tag variant="green|red"` with `Icon` | — | None |
| Digit run group | B7 | `Card` + `Avatar` + `Tag` + `TextButton` | Controlled `Accordion type="multiple"` is **not** used for the run header (the header holds an avatar, two meta lines and a chip row); instead a `Card` with a header row and a trailing `TextButton suffixIcon="ChevronDown"` carrying `aria-expanded`/`aria-controls`, label flipping Expand/Collapse | Chips: `Tag` with `variant` from `outcome.tone` (`neutral→gray`, `success→green`, `warning→yellow`, `danger→red`) | None |
| Phase row | B7 | `Accordion` + `AccordionItem` + `AccordionHeader` + `AccordionContent` | Controlled `Accordion type="multiple" variant="default"` inside the run; `AccordionHeader` supplies the chevron, `aria-expanded`, `aria-controls` and Enter/Space handling; header children = title + meta + outcome `Tag` | — | None |
| "+N conversations" pill | B7 | `TextButton` | `variant="secondary" size="mini" prefixIcon="DoubleChevronDown"`, label "+{n} conversations", `aria-expanded` | Centred on a `--color-boundary-divider-mildest` hairline, the product's pattern | None (nothing exists to reuse) |
| Conversations header + filter | B8 | `SegmentedTabs` + `SegmentedTabsList` + `SegmentedTabsTrigger` | `size="mini"`, values `all-activity` / `messages-only`, controlled; `aria-label="Conversation filter"`. Heading is an `h2` at 16/24 semi-bold, matching `Overview`'s `Section` | — | None |
| Reply bar with channel badge | B9 | `Card` + `Avatar` + `TextButton` + `Tag` + `Menu` | Reply `TextButton variant="secondary" prefixIcon="Reply"` + `Tag variant="gray"` "in Slack" when `source` is slack/teams; Forward `prefixIcon="Forward"`; note — on slack/teams a plain `TextButton prefixIcon="Lock"` "Add private note", otherwise a `Menu` (Public note / Private note), which is how the quick-action band already does multi-choice | — | None. Editors stay out of scope: buttons are no-ops, as in the rest of this prototype |
| Sticky summary strip | B10 | `Card` + `Icon` + `TextButton` | `position: sticky; top: 0` inside the scroll container, shown when an `IntersectionObserver` sentinel below Zone 1 leaves view; chips are `TextButton variant="secondary" size="mini"`, so they are real buttons that scroll + expand their card | `--shadow-xs`, `--color-fill-surface` | None. `IntersectionObserver` is already the repo's measuring idiom (`ResizeObserver` in `TicketTabs`) |
| Badges: confidence, status, outcome, sentiment | many | `Tag` | `variant` mapped from band/status/tone in one `TAG_VARIANT` table in `details.tokens.ts` | — | None. Dew's `Badge` is a numeric count/dot badge, not a label badge — `Tag` is the label component |

## Files added

```
docs/tr-details-handoff/**                                  copied from the handoff (this file filled in)
src/routes/freshservice/tickets/details/
  types.ts                   data contract, adapted from data/types.ts
  details.tokens.ts          tone → Tag variant, event → icon, Digit avatars, channel labels, routing
  details.styles.ts          the six text styles this tab reuses (px + --font-weight-*, as elsewhere)
  format.ts                  time / range / elapsed formatting
  streamView.ts              PURE: getLandingTarget, buildStreamView, collapseHumanThreads, runChips,
                             initialOpenPhases, buildReviewView
  streamView.test.ts         24 tests, node --test, pure functions only
  useCardCollapse.ts         per-viewer collapse memory for the two AI cards
  fixtures/inc-4127.ts       typed fixture (from data/inc-4127.slack-handover.json)
  fixtures/inc-4133.ts       typed fixture (from data/inc-4133.email-humans.json)
  fixtures/index.ts          code → fixture lookup, plus the two list records (see below)
  fixtures/catalog.ts        typed expansion of data/catalog.json for the gallery
  ActorAvatar.tsx            B4/B5 avatar resolution (Digit svg, Freddy, photo, initials)
  RichTextView.tsx           RichText renderer (strings + inline links)
  AiCardChrome.tsx           sparkle, Ask AI, helpful/not helpful, header actions, collapse toggle
  Disclosure.tsx             useDisclosure + trigger/panel, for "Why" and expandable rows
  AttachmentList.tsx         read-only attachment rows (Docutype icons)
  SummaryCard.tsx            B1
  RootCauseCard.tsx          B2
  FixSteps.tsx               B2/B5 step list
  DescriptionBlock.tsx       B3
  MessageCard.tsx            B4
  EventRow.tsx               B5
  LiveRow.tsx                B5 live states
  ApprovalCard.tsx           B6
  StreamGroup.tsx            B7 run + phase, the node dispatcher, the pill, the unread divider
  ConversationsHeader.tsx    B8
  ReplyBar.tsx               B9
  SummaryStrip.tsx           B10
  DetailsTab.tsx             assembles the three zones, sticky strip, filter, landing scroll
  TrGallery.tsx              dev gallery over catalog.ts
```

## Files changed

| File | Change |
|---|---|
| `src/routes/freshservice/tickets/TicketDetail.tsx` | Three edits, all inside the Details branch: render `<DetailsTab>` where `Details` rendered `null`, read `?state=`, and fall back to the details module when a code isn't in `TICKETS`. The band, subject block, tab strip, sidebar and rail are untouched |
| `src/App.tsx` | One route for the dev gallery (`/tr-gallery`) |
| `package.json` | `"test": "node --test \"src/**/*.test.ts\""` — Node's built-in runner, no dependency added |

**`tickets.data.ts` was not touched.** The two scenario tickets are declared in
`details/fixtures/index.ts` instead, so the Tickets list, its filters and the `SOURCES` / `AGENTS`
dropdowns are exactly as they were. The cost is two fields on those records that can't say what
the scenario means without widening the shared tuples: `source` is `'Chat'` for the Slack ticket
(the nearest existing value) and `assignee` is `'None'`, because `'Jordan Reyes'` is not in
`AGENTS`. The Details tab reads the fixture, not that record, so it shows Slack and Jordan
correctly; only the right-hand Properties panel shows the fallbacks.

## Decisions taken where the spec left a choice

1. **No feature-flag mechanism exists**, so Digit content is driven by the data: a ticket renders
   Digit blocks only when its fixture carries them. Production is unaffected because this repo is
   a prototype with no backend. The three review states are selected with a `?state=` query param
   (`landing` | `engaged` | `expanded`), which also keeps them linkable for the review.
2. **No test runner exists.** Adding Vitest would add a library the prompt rules out, so the pure
   functions are tested with `node --test`, which ships with the Node 25 already in use and strips
   TypeScript natively (verified). No snapshots, no DOM tests.
3. **No Storybook**, so the gallery is a route (`/tr-gallery`), matching how `/` (Overview)
   already serves as this repo's component gallery.
4. **No i18n**, so copy is inline, taken verbatim from the fixtures.
5. **Collapse state persistence** (B1/B2, behaviour rule 6) has no existing preference pattern to
   follow, so it uses `localStorage` under one namespaced key (`fs.tr.cardCollapse.<ticket>`),
   wrapped in try/catch.

## Dew issues found while building

| Component | What happens | How it was handled |
|---|---|---|
| `AccordionHeader` | Renders a **default `CircleCheck` leading icon** when `icon` is not supplied, which reads as "this phase succeeded" on every phase row | `hideIcon`, keeping only the chevron it adds after the children |
| `AccordionHeader` | Wraps **all** children in one `fw-flex-1` span, so the header's own `gap-100` never applies between them | The phase row sets its own flex row and gap inside the header |
| `Tag` | Truncates its label to an ellipsis when squeezed, so "in Slack" in the reply bar collapsed to a sliver at narrow column widths | `NO_SHRINK` in `details.styles.ts`, applied to every Tag that sits in a row that can compress |
| `ProgressLoader` | `value` / `max` only — no threshold marker | Threshold carried in text, per spec |
| `Attachment` | An upload widget, not a read-only chip | `AttachmentList` composes `Icon` + text, using the `Docutype/*` family by extension |
| `SegmentedTabs.Trigger` | Carries `aria-controls` pointing at its panel; using the list without panels leaves that reference dangling | The stream is passed into `SegmentedTabs.Content` as children, so both panels exist |
| Icon whitelist | No thumbs-up / thumbs-down | `CSATHappy` / `CSATSad`, Dew's own satisfaction pair |
| Icon whitelist | No artwork for the Software or Hardware Handler Digits | `Avatar iconName="Bots"`, flagged in `ActorAvatar` |

## Open gaps needing a decision

1. **The subject block hard-codes the Slack channel badge.** `TicketDetail.tsx` always paints
   `slack-logo.svg` onto the requester avatar, so the email ticket INC-4133 shows a Slack badge.
   Left alone, as instructed. A one-line fix (pick the badge from `ticket.source`; the Teams logo
   is already in `Assets/`) is available on request.
2. **The sticky strip pins to the top of the scroll column, not under the tab bar.** In this
   prototype the tab strip is *inside* the scroll container, so it scrolls away with the content;
   `position: sticky; top: 0` on the column is the closest equivalent. If the product's tab bar is
   outside the scroller, the strip should be hoisted to sit directly under it.
3. **Comments affordance on the approval card** — nothing exists; "{n} comments" is a no-op
   button, as the spec permits for the prototype.
4. **"Ask AI"** opens nothing in this repo (no Copilot panel is built), so it is a no-op button
   where specified.
5. **Timestamps are formatted in the fixture's own offset**, not the viewer's timezone — see
   `format.ts`. Converting to the reader's zone printed "10:05 PM" beside copy that says "at
   9:35 AM". If the product converts, these fixtures need their copy rewritten too.
