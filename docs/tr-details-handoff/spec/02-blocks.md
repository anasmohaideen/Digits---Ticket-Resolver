# 02 · Blocks

Each block below lists its purpose, its anatomy (in order), its states and its rules. Data
shapes are in `data/types.ts`, and examples of every state are in `data/catalog.json`.
"Existing" means: find and reuse the component the repo already uses for this.

---

## B1 · Summary card

**Purpose:** what has happened so far, in plain language. It exists on **every** ticket, as
today.

**Anatomy**
1. Header: sparkle icon (existing Freddy AI icon) · "Summary" · meta "Updated {time} by
   {actor}" (+ "at handover" when `reason === 'handover'`). The actor is a Digit (with its
   avatar) or "Freddy AI Copilot".
2. Header actions (existing, unchanged): regenerate, copy, add to note, edit, overflow. A
   collapse toggle on the right.
3. Sections, each with a short bold label and body text:
   - **Issue**: one or two sentences.
   - **What was tried**: a bullet list.
   - **Where it stands**: one sentence.
4. Footer: "Ask AI" (existing button), meta "Based on {n} messages and {m} actions",
   helpful/not helpful (existing feedback buttons), "View more / View less" if the body is
   truncated (existing behaviour).

**States** (`SummaryCard.state`)
| State | Shows |
|---|---|
| `not-generated` | Today's "Summarize ticket" button (unchanged) |
| `generating` | Header and a skeleton for the body, with the live label "Thinking {s}s" |
| `ready` | Full card |
| `out-of-date` | Full card plus an inline notice at the top: "{n} new messages since {time}" with an "Update summary" action (calls regenerate). **Proposed.** Gate it behind a prop |
| `edited` | Full card plus a meta chip "Edited by {agent} · {time}" and a "Restore Ticket Resolver's version" link. **Proposed** |

**Collapsed form:** a single row showing the tag "Summary", a one-line preview
(`summary.strip`), the time and an expand toggle.

---

## B2 · Root cause & suggested fix card

**Purpose:** why it's happening and what to do about it. Ticket Resolver's RCA output.
Replaces today's initiating-changes card.

**Anatomy**
1. Header: tag "Root cause" · title (`rootCause.title`) · time · confidence badge
   ("High · 0.84") · Digit avatar + name · collapse toggle.
2. **Root cause** section: body text with inline links (change and asset IDs).
3. **Evidence** section: a bullet list. Each item can carry a link (similar tickets → Related
   tickets tab, change → change record, asset → asset record).
4. **Confidence** section: a progress/meter component with a threshold marker, plus the text
   "{score} · above/below your {threshold} threshold". If the repo has no meter with a marker,
   use its progress bar and show the threshold in text only, and note this as a gap.
5. **Suggested fix** section, separated by a divider:
   - Title (`fix.title`) and "Workflow: {name}" when `fix.via` is set.
   - Status badge (`fix.status`, see below).
   - Steps list when present: done ✓, failed ✕ with detail, skipped –, running spinner.
   - "What to do now" body when `fix.nextStep` is set.
   - A link "View in conversation" that scrolls to the related stream event (`fix.eventId`).
6. Footer: "Ask AI", a "Why" disclosure (shows `rootCause.reasoning`), helpful/not helpful,
   and a secondary "View similar tickets" button.

**Card states** (`RootCauseCard.state`)
| State | Shows |
|---|---|
| `not-analyzed` | Tag, badge "Not analyzed", the text "No root cause yet." and today's "Find initiating changes" action. Use this for tickets with no TR (the email regression case) |
| `analyzing` | Tag and the live label "Searching for similar tickets {s}s" with a skeleton |
| `found` | Full card |
| `inconclusive` | Title "Couldn't determine a root cause", a low-confidence badge, a "What was checked" section and a Confidence section. Suggested fix shows `status: 'none'` with the text "No fix suggested without a root cause." |
| `disputed` | Full card plus the chip "You marked this not helpful" and an optional reason input with Skip / Send. **Proposed** |

**Suggested fix statuses** (`SuggestedFix.status`)
| Status | Badge | Notes |
|---|---|---|
| `proposed` | Suggested | No execution yet |
| `awaiting-approval` | Waiting for approval | Shows the approver; links to the approval card in the stream |
| `running` | Running | Steps with a spinner on the current step |
| `applied` | Applied | Steps all done; "Verified: …" text if present |
| `blocked` | Blocked | Failed step plus "What to do now" |
| `none` | No fix suggested | Inconclusive only |

**Collapsed form:** a row with the tag "Root cause", the confidence badge, the title, the fix
status badge, the time and an expand toggle.

---

## B3 · Description

Reuse today's Description container and its attachment cards **unchanged**. One addition: when
`description.origin` is set, show a meta line next to the heading, for example "From Megan's
first Slack message".

---

## B4 · Conversation message cards

Reuse today's cards. Extend them with props only.

| Variant | Today's card | Additions |
|---|---|---|
| `requester-reply` | Requester reply (tinted) | Channel in the meta ("replied in Slack"); optional sentiment badge (**proposed**, behind a prop) |
| `reply` | Agent reply | Channel-aware meta: "replied in Slack" or "replied to {email}"; optional "Drafted with Freddy · edited" badge (**proposed**) |
| `forward` | Forward card | None |
| `public-note` | Public note card | None |
| `private-note` | Private note card (with lock) | None |
| `digit-message` | **Agent reply card**, with the Digit's avatar and name | Meta "replied in Slack via Workplace Concierge"; no edit or delete actions |
| `concierge-message` | Same as `digit-message` | Workplace Concierge avatar |

Actions on each card stay as they are today (reply, forward, edit, overflow) for the human
variants. Digit and Concierge messages only get "Forward".

**Compact density:** inside an expanded group (B7), messages render in the repo's compact or
dense variant of the same card if one exists; otherwise use the normal card.

---

## B5 · Stream events

A one-line row: leading icon · actor avatar (Digit or person) · **actor name** · verb phrase ·
**object** (bold, or a link) · optional badge · optional count · optional disclosure chevron.
Expanded content sits indented below the row in a subtle container.

| `EventType` | Line | Expandable content |
|---|---|---|
| `ticket-created` | "{Digit} created this ticket on behalf of {requester}" | "Tried first: {article} ({n} steps) · Source: {channel}" |
| `delegated` | "{actor} assigned it to {target}" | — |
| `status-changed` | "{actor} updated status to **{status}**" | — |
| `properties-updated` | "{actor} updated **Ticket properties** [count]" | A list of "{field}: {from} to {to}" |
| `searched` | "{Digit} searched for **{n} {entity}**" (or "searched the work graph for **{object}**") | Results list (links + one-line meta) when `results` is present |
| `root-cause-added` | "{Digit} added a root cause to the **Summary**" | "Why" disclosure → reasoning |
| `summary-updated` | "{Digit} updated the **Summary**" | — |
| `workflow-executed` | "{Digit} executed **{workflow}**" + "1 step failed" badge if any failed | Steps list (done/failed/skipped) |
| `approval-requested` | "{Digit} requested approval from {approver}" | — |
| `approval-decided` | "{approver} approved/rejected **{action}**" | Rejection reason if any |
| `handed-over` | "{Digit} handed over to {agent}" + reason badge (Blocked / Inconclusive) + "· {routing} · Summary updated" link | Blocker, diagnosis, tried, routed by |
| `resolution-notes` | "{actor} generated **resolution notes**" (link to the Resolution tab) | — |
| `thought` | "{Digit} thought for {s}s" | Reasoning text or a steps list. Use only inside expanded phases; prefer `why` on the outcome event |
| `external-update` | "{Digit} made updates in **{app}** [count]" | A list. **Tools-registry path only, not MVP**; keep it in the gallery |
| `digit-event` | Generic: "{Digit} {verb} **{object}**" (e.g. Knowledge Curator proposed updates to an article) | — |

**Why toggle:** any event with a `why` field gets a small "Why" button after the line. It toggles
the reasoning panel below and has `aria-expanded`.

**Live states (catalog only):** "Thinking {s}s", "Searching for {entity} {s}s" and "Executing
workflow: {name} {s}s" are shown at the end of the stream while a Digit is working. Use the
repo's spinner. When finished, they turn into the matching event row.

---

## B6 · Approval card

Inline in the stream where the approval was requested.

- Header: tag "Approval needed" · title (the action) · time.
- **What this action**: body text. **Why this action**: body text.
- Footer: "Ask AI" · "{n} comments" (opens the existing comments affordance if any, otherwise
  a no-op in the prototype) · on the right, the existing secondary "Reject" and primary
  "Approve" buttons.
- Decided state: the Reject and Approve buttons are replaced by a success or danger badge,
  "Approved by {name} · {time}" or "Rejected by {name} · {time}". **Proposed.**

---

## B7 · Groups

**Level 1: Digit run** (`group.level === 'run'`)
- Collapsed: Digit avatar · "**{Digit} worked on this before you**" · meta "{start}–{end} · {n}
  messages with {requester} in {channel} · {m} actions" · a row of phase chips, each with its
  outcome ("Deflection · didn't resolve", "Root cause · High", …) · an "Expand" button on the
  right.
- Expanded: the same header with a "Collapse" button, then its children (phases and milestone
  events) in order.

**Level 2: Phase** (`group.level === 'phase'`)
- A row inside the run: disclosure chevron · **{phase title}** · meta (counts and time range) ·
  outcome badge.
- Expanded: children indented: messages (compact density), events, the approval card.

**Human thread collapse**
- Reuse today's "+N conversations" pill exactly. Apply it to human-only runs, using the
  threshold in `spec/03-behaviour.md`.

---

## B8 · Conversations header

"Conversations" (existing heading) and, on the right, a segmented control or toggle group with
"All activity" (default) and "Messages only". Use the repo's existing segmented or tab
component.

---

## B9 · Reply bar (collapsed composer)

Reuse today's bar: avatar · Reply · Forward · Add note.

| Ticket source | Reply button | Add note |
|---|---|---|
| `slack`, `teams` | "Reply" with a small "in Slack" or "in Teams" badge | Private note only (no public note option) |
| `email`, `portal`, `phone`, other | "Reply" (as today) | Private and public, as today |

Clicking opens today's editors unchanged.

---

## B10 · Sticky summary strip

Appears under the tab bar when **both** AI cards are scrolled out of view.

Anatomy, in one row: sparkle icon · one-line "what has happened" text (`summary.strip`,
truncated with an ellipsis) · chip "Root cause · {band}" · chip "Fix · {status}" · "Show"
button.

- Clicking "Show" scrolls back to Zone 1.
- Clicking a chip scrolls to that card and expands it if collapsed.
- On tickets with no root cause, show only the text and "Show".
