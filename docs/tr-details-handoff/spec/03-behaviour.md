# 03 · Behaviour

Implement these as pure functions where possible (for example `getLandingTarget`,
`buildStreamView`) and unit-test them.

## Landing position

| Situation | Land at |
|---|---|
| Viewer was just assigned (no `viewer.lastSeenAt`, or it's before the handover) | **Top** of the Details tab. Zone 1, the reference zone and the collapsed run fit in about one screen |
| Viewer returns and there are items after `viewer.lastSeenAt` | The **first unread** stream item. Mark it with the repo's existing "new" divider if there is one |
| Viewer has seen everything | Top |

## Nothing jumps

- New items (the viewer's reply or note, or a requester's reply) are appended **above the reply
  bar**.
- Zone 1 never moves, re-orders or re-renders into the stream.
- When the Summary updates, it updates **in place**, and a `summary-updated` event row is added to
  the stream as a pointer.

## Collapsing rules

1. **Digit run (level 1).** Contiguous Digit-owned activity before the first human assignment
   becomes one run group. Collapsed by default when the viewer is a human agent. Phase chips
   are derived from the children's phases and outcomes.
2. **Phases (level 2).** Inside an expanded run, phases are collapsed by default except the one
   holding the event the viewer arrived from (deep link), if any.
3. **Always visible, never inside a collapsed group:** `handed-over`, and every item after the
   handover. `ticket-created` and `approval-decided` are visible between phases when the run is
   expanded.
4. **Human threads.** If the product already has a rule for the "+N conversations" pill, keep
   it. Otherwise: when a run of human messages has more than 5 items, show the latest 4 and fold
   the rest into the pill. INC-4133 has 7, so it shows "+3 conversations" and then 4 cards.
5. **Reasoning** is never shown open by default. It's opened per event with "Why".
6. **Card collapse state** for both AI cards is remembered per viewer in the browser,
   following the repo's existing preference/storage pattern.

## Filter: All activity / Messages only

- **All activity** (default) renders everything, per the rules above.
- **Messages only** flattens the stream to message nodes only, in time order, and hides events,
  approval cards and group headers. Human-thread collapsing still applies.

## Sticky strip

Show it when the bottom edge of Zone 1 is above the bottom edge of the tab bar. Hide it when
Zone 1 is visible again. Use the repo's sticky or intersection utility if one exists.

## Channel awareness

- `ticket.source` decides the reply bar labels and the "replied in {channel}" meta.
- Digit and Concierge messages always say "via Workplace Concierge", because Digits never
  message the requester directly.
- Private notes, events, groups and the approval card are internal and never sent to the
  requester. No change to today's visibility rules.

## States to render for the review (INC-4127)

| # | State | How |
|---|---|---|
| 1 | **Landing**: Jordan just assigned | Use `stream` from the fixture; run collapsed; scroll at top |
| 2 | **Engaged**: Jordan replied and added a note | Use `stream` + `engagedStream`; scrolled near the bottom so the sticky strip is visible |
| 3 | **Fully expanded** | `stream`, with the run expanded and the phases "Before the ticket" and "Root cause" expanded |

Also render **INC-4133** (email, humans only). It must look like today's page, apart from the two
AI cards (Summary `ready`, Root cause `not-analyzed`).
