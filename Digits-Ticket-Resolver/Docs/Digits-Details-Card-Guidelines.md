# Ticket Details: card guidelines and AI-content architecture

Status: proposal for the Wednesday card-style deliverable. For review by Vinoth, Gopi, Ashokkumar and the PM.
Rule of precedence: **Dew Design System 1.1.3 is the primary system.** **Dew-AI is used only for AI elements** (AI summary, root cause, resolution suggestion, AI notes). Nothing else gets a gradient, glow or AI colour.

Token values below were read from the installed `@freshworks/dew-styles`. Dew-AI style names were read from the Dew-AI Figma library. Items I could not open (stops of the AI gradient and border, Copilot anatomy) are marked **Confirm**.

---

## 1. Principles

1. **Position and chip say what a card is. Fill only says how much emphasis it has.** Never use hue as the primary signal.
2. **White or gray only for cards.** No blue, orange or tinted fills, no gradients on any non-AI card.
3. **Same recipe for every card:** 1px border, same radius, same padding, no shadow. Only the fill, the chip and the icon vary.
4. **Pasted rich content never sits on a tinted background.** It always sits on a neutral content well (section 5).
5. **Tokens only.** No hex fallbacks, so light and dark mode work (audit finding D1).
6. **Say each thing once** (section 7).

## 2. Fill hierarchy: when to use surface, container or base

Values (light / dark):

| Token | Light | Dark | Role |
|---|---|---|---|
| `--color-fill-surface` | `#ffffff` | `#1a1a1a` | The content itself. Primary reading surface. |
| `--color-fill-container` | `#f6f7f8` | `#0b0b0b` | Secondary content: outgoing, quoted or system-side material. Also the page canvas behind cards when the tab needs lift. |
| `--color-fill-base` | `#e6e6e6` / `#eceff1` | `#272727` | **Never a card fill.** Hover, pressed and selected states, skeleton blocks, and small inset wells inside a card (code, quoted history). |

Rules:

- **Decision test:** is this the thing the agent came to read? Use surface. Is it something sent, forwarded, quoted or generated about the thing? Use container. Is it a state or an inset inside a card? Use base.
- **Nesting steps down one level only.** Surface card, container inset, base for code and quote blocks. Never more than two levels deep.
- **Borders:** all cards use `--color-boundary-border-mildest`. Use `border-mild` for an inset well inside a container card. Focus uses the Dew focus token.
- **Dark mode:** in the dark tokens container is *darker* than surface, so the pair still separates, just inverted. Test both modes. Do not hard-code any value.
- **No shadow** on cards. `shadow-xs` is for floating elements only (sticky bar, menus).

## 3. Card matrix

All cards: radius `border-radius-large`, padding `spacing-200`/`spacing-250`, 1px `border-mildest`, header row = avatar, name, chip (left), time and actions (right).

| Card | Fill | Chip (Dew `Tag`) | Icon | Visible to | Notes |
|---|---|---|---|---|---|
| Requester response | surface | none | Channel logo (Slack/Teams/email) in meta | Everyone | The baseline. Requester is identified by avatar and name. |
| Agent reply | container | `blue` "Reply" | Reply | Requester | Meta: "replied in Slack" or "replied to {email}". |
| Digit / Concierge message | container | `blue` "Reply" | Digit avatar | Requester | Meta: "via Workplace Concierge". Forward is its only action. |
| Public note | surface | `blue` "Public note" | Note | Requester | Replaces today's blue fill. |
| Private note | surface | `yellow` "Private note" | Lock | Agents only | Replaces today's orange fill. No tint, no gradient. |
| Forwarded message | container | `gray` "Forwarded" | Forward | Third party | "To: {recipients}" in meta. |
| Description | surface | none (section heading instead) | none | Everyone | Holds the original message, or for Slack/Teams tickets the pre-ticket conversation. |
| Approval needed | surface | `yellow` "Approval needed" | Approval | Agents only | Approve and Reject in the footer. Appears once, inline. |
| Event (assigned, status, properties, searched…) | none (one-line row) | none | Event icon | Agents only | Not a card. Optional expand for detail. |
| AI summary / root cause / resolution | surface | Dew-AI AI chip | AI sparkle | Agents only | Section 4. |

**Chip colour encodes audience, nothing else:**

- `blue` = the requester can see it.
- `yellow` = internal only.
- `gray` = sent outside the conversation.
- Status badges (Blocked, Applied, High confidence) use `red`/`yellow`/`green` by outcome. Place them on the **right** of the header, so they are never read as a card type.

Open: "Reply" and "Public note" share blue on purpose. Fill (container vs surface) and the chip text separate them. If agents confuse them, change the Reply chip to `normal` or drop it and keep the "replied in…" meta.

## 4. AI elements (Dew-AI only)

What counts as an AI element: the pinned AI card, AI entries (summary, root cause, resolution), AI notes, the Copilot pane, and "Thinking" labels. Nothing else.

Approved Dew-AI styles found in the library:

| Dew-AI style | Intended use (from its description) | Use here |
|---|---|---|
| `AI/Border/Border-Two Tone` | AI border | The AI card border, at rest. |
| `AI/Glow FX - Default` | "Quieter glow for rest and hover" | Optional on hover of an AI card. |
| `AI/Glow FX - Two Tone` | "Focused or generating surfaces" | Only while generating. |
| `AI/Shimmer/Loading Shimmer` | AI skeleton | Generating state of the AI card. |
| `AI/Motion/Text Shine` | "Thinking" labels | "Thinking {s}s" label only. |
| `AI/Fill/AI Gradient` | Approved gradient fill | **Confirm** where it is allowed; do not use on cards until confirmed. |
| `AI Tokens` colours (Violet, Indigo, Blue, Hot Pink, Soft Pink, Green, each with Mild/Medium) | "Restricted to AI-powered features only" | AI chip, AI icon and AI status accents. Never on non-AI UI. |

Recipe for an AI card:

- Fill: **surface**. Content on white keeps the reading surface the same as every other card.
- Border: the Dew-AI two-tone border, 1px. No radial glow at rest.
- Header: AI sparkle, AI chip ("Summary", "Root cause", "Resolution"), "Updated {time} by {Digit}".
- Body: plain or light rich text. Inside the body, status uses normal Dew DS chips (`green` Applied, `yellow` Blocked).
- Generating: shimmer skeleton plus Glow Two Tone plus the Text Shine label.

**Confirm with the Dew-AI owners:** (a) the stops of Border-Two Tone and AI Gradient, (b) whether the glow is allowed at rest, (c) whether a card in the **thread** may use the AI border at all. The meeting said AI event cards are a private-note variant, with no animation and no generative indicators. That argues for: pinned card = full AI treatment, thread entries = surface card with only the AI chip and sparkle, no border treatment, no shimmer or shine. I recommend this split.

Things the prototype does today that this removes:

- The gradient edge and corner glow on **private notes** (`.tr-o2-edge-note`). A private note is not an AI element.
- Hand-built gradients using non-AI colours (`#FF8936→#A855FF`, highlight→info).
- The blue fill on public notes.

## 5. Rich content well

Pasted HTML (tables, code, styled text, images) can carry its own backgrounds and fonts, which is what clashed with the blue and orange fills.

- Render all user HTML inside a **content well**: `fill-surface`, no tint, `overflow` contained.
- Inside container cards (reply, forward), the well is surface with `border-mildest`. Inside surface cards no extra box is needed.
- Strip or scope inherited `background`, `color` and `font-family` on pasted content. Tables and images scroll horizontally inside the well.
- Code blocks and quoted history use `fill-container` inside surface cards and `fill-base` inside container cards.
- Test with the "maximum rich formatting" case. The meeting estimated about 10% of customers use it.

## 6. Pinned card and thread together: the repetition problem

### What repeats today

For the Summary and Root cause, the same content appears in up to four places:

1. The pinned top card (`ArtifactCard`).
2. A full chronological entry in the thread (`ResponseCard`, "internal-ai").
3. The one-line brief bar when the pinned card scrolls away (this one never shows at the same time as the card, so it is acceptable).
4. Event rows ("Ticket Resolver updated the Summary") plus the handover event that says "Summary updated".

Vinoth's concern (repeat) and Gopi's rationale (the thread tells the story: created, properties updated, summary, root cause, customer reply) are both valid. The conflict is that the thread repeats the **content** when it only needs to repeat the **moment**.

### Principle: one canonical home per fact

> A full body appears in exactly one place. Everywhere else shows a one-line pointer.
> **Copy budget:** full body 1×, one-line digest at most 2×, brief bar only when the card is off screen.

### Options considered

| | A. Pinned = current, thread = pointers | B. Thread only, no pin | C. Keep both, collapse the thread copy |
|---|---|---|---|
| Agent lands and sees the answer | Yes | No, must scroll | Yes |
| Timeline story preserved | Yes (one-line rows) | Yes | Yes |
| Repetition | Gone | Gone | Reduced, not gone |
| History of earlier versions | In the card, on demand | In the thread | In the thread |
| Engineering cost | Low-medium | Low | Lowest |
| Matches the meeting decisions | Yes (pinned card kept) | No | Partly |

**Recommendation: A, with a version history.** C is the fallback if engineering cannot link rows to the card in the FEBSCO scope.

### Behaviour of A

- **Pinned card** always shows the **latest** version, with "Updated {time} by {Digit}".
- **Thread** gets a one-line event row at the moment each version appeared, for example "Ticket Resolver added a **root cause**: Wi-Fi certificate not renewed after CHG-2187" with a "View" link. The digest is the same sentence as the brief bar, so authors write it once.
- **"View"** scrolls to and briefly highlights the pinned card (or opens it if collapsed). It does not open a second copy.
- **Superseded versions:** if the Summary was regenerated, the older row is marked "Replaced by a newer summary" and offers "Show what it said then", which expands the old body **inline in that row, on demand**. The pinned card also offers "History (n)", which lists the same versions. Old content is never lost, and it is not shown by default.
- **Edited by an agent:** the card shows "Edited by {name}"; the history keeps Ticket Resolver's version, so "Restore" has something to restore.
- **Resolution note:** stays a **separate component** for FEBSCO, per the meeting. It does not join the pinned card or the thread digest rule yet. When the vision of one combined card arrives, it follows the same rule.
- **Tab pre-selection** (pending in the meeting): open on the artifact the stage needs, in order resolution, root cause, summary, and fall back to the next if absent. This is what Option 2's lead logic already does, and it resolves the open question. If no root cause exists (low-resolution tickets), the card shows the summary only, with no empty root-cause tab.
- **Fold behaviour:** pointer rows are events, so they fold into the "+N conversations" pill like any other event. No special case.
- **"Messages only"** filter hides pointer rows (they are events).

### Wireframe (text)

```
[ AI summary and root cause card, pinned ]           <- one full body
   Summary | Root cause | (Resolution)    Updated 10:04 by Ticket Resolver   History (2)
   ...full content...

Timeline
  o Ticket Resolver created this ticket for Megan          09:42
  o Ticket Resolver updated the Summary  "Guest Wi-Fi..."  View     <- pointer, not a copy
  o Ticket Resolver added a root cause "Cert not renewed.." View    <- pointer
  [ Requester response card ]
  [ Agent reply card (container, blue "Reply") ]
  [ Private note card (surface, yellow "Private note", lock) ]
```

### Other duplicates worth the same rule

- **Handover event** says "Summary updated", and a pointer row says it too: keep one.
- **Description vs Summary "Issue"**: for AI tickets the description holds the pre-ticket conversation, and Summary "Issue" restates it. Keep the Summary's Issue to one sentence and never paste the description.
- **Approval**: today it can appear as a sticky card, an inline card, a pill, and in Copilot. Pick one canonical card (inline in the thread, per the meeting) and let the others be a pointer or a count.
- **Digit's "Worked for" log** vs event rows: show the log once, as the expandable detail of the Digit message, and do not also list the same steps as events.

### Success checks

- Count of full-body copies per artifact on screen at once: 1.
- Agent can find the current root cause without scrolling: yes (pinned).
- Agent can see when it was added and what it said then: yes (pointer row, History).
- Screen-reader users get one heading per artifact, and pointer rows read as events, not duplicate regions.

### Questions for the PM

1. Is the timeline marker enough, or is the full chronological body a requirement?
2. Do agents need to compare versions (diff), or only see the old text?
3. For tickets with no root cause (low-resolution), is the pinned card summary-only?

## 7. Mapping to this prototype

| Change | Where |
|---|---|
| Remove the public-note blue fill and border | `option2/ResponseCard.tsx`, `surface()` |
| Remove the gradient and glow from private notes | `.tr-o2-edge-note` in `styles/index.css` |
| Replace hand-built AI edge with the Dew-AI border (after Confirm) | `.tr-o2-edge`, `.tr-o2-card`, `.tr-ai-card` |
| Replace the brief-bar gradient fill with `fill-container` | `index.css` ~L1195 |
| Add the card-type chips from section 3 | `ResponseCard.tsx` header |
| Replace thread AI entries with pointer rows | `DetailsTabOption2.tsx`, `responseTimeline.ts` (artifact entries) |
| Add the content well | `RichTextView.tsx` |
| Remove undefined tokens and hex fallbacks | audit finding D1 |

## 8. Open items

1. Dew-AI owners: Border-Two Tone and AI Gradient stops, and whether a thread card may use the AI border.
2. Engineering: can the pinned card keep versions (History) in the FEBSCO scope?
3. PM: the three questions in section 6.
4. Ember vs React: these rules are framework-neutral, and the tokens are the same in both.
