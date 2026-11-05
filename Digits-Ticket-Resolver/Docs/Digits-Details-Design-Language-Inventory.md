# Ticket details — element inventory and design-language proposal

Scope: everything that can appear on the ticket details page (Option 2, the live route). "Built" is what the prototype does today; "Proposal" is what I would lock as the design language. Source of truth for ownership: Dew (structure, tokens, controls) → Dew AI (anything an AI authored or an AI can do) → Dew Illustration (Digit marks, empty/illustration art).

## 0. Principles to ratify first

1. **One audience rule, one colour rule.** Chip colour says who can see it: blue = requester sees it, yellow = internal only, gray = sent outside the desk. Card fill says role: surface = content, container = outgoing/secondary. Nothing else carries meaning (no gradients on conversation cards).
2. **AI is marked by its source, not by decoration.** An entry written by a Digit or Copilot shows its avatar and the "AI" byline. The Dew-AI treatments (gradient border, shimmer, sparkle morph) are reserved for *live generation* and the single pinned top card.
3. **Three weights of row.** Card (a thing someone said/decided), Row (a thing that happened), Ambient row (a thing you can ask for). Every element below is one of the three.
4. **One timeline grid.** 32px avatar for cards; 24px box with a 20px glyph for rows; text starts at the first tab's label ("D" of Details); 24px between blocks, 8px inside peeking stacks.
5. **Tokens only.** Colour, spacing, radius, weight from Dew variables; type sizes are the Dew scale (14/20 body, 13/20 secondary, 12/16 meta, 16/24 card title). Dark mode is a token swap, never a second design.

## 1. Page frame

| Element | Built | Proposal |
|---|---|---|
| Breadcrumb + ticket header bar (star, Share, Edit, Reply, Associate, Close, more, prev/next, Ask AI primary, pane toggle) | Dew buttons; Ask AI is the Dew-AI primary button; pane toggle is an IconButton | Keep. Make Close the only emphasised action once a ticket is Resolved. Show the Ask AI primary only where a Digit/Copilot is available. |
| Subject block (requester avatar + channel badge, subject, reporter line, sentiment pill) | Subject collapses into the header on scroll; channel logo badged on the avatar | Keep. Channel badge should be the only logo-in-colour on the page. |
| Tab strip | Dew HorizontalTabs with built-in More overflow | Keep. Unbuilt tabs (Tasks, Assets, Associations, Impacted services) should show one standard "not available in this prototype" empty state, not a bare sentence. |
| Content column | Left-aligned to the first tab label, fills width | Keep; cap line length of prose (≈ 80ch) inside cards, not the cards. |
| Reply footer | Sticky bar, fill-container, buttons on the content's left edge | Keep. Needs a defined "open editor" height cap and a mobile/narrow collapse. |
| Right-hand area | Property pane (+ widget rail) then Freddy AI at far right; both open ≥1720px | Keep. Below the breakpoint define who wins (last opened) and say so with a one-line toast the first time. |
| Prototype controls | Floating panel | Not product UI; exclude from the spec. |

## 2. Top card (the pinned AI artifact)

| Element | Built | Proposal |
|---|---|---|
| Summary | Segmented tab + byline "Updated … by …"; sections Issue / Actions taken / Current status; actions Regenerate, Copy, Edit (rich text), More (Add as note, Forward on email, Delete); feedback footer | Keep. Make the byline name a person when edited ("Edited by you" tag) and keep AI byline otherwise. |
| Root cause | Same card; confidence, evidence, checked, suggested fix with steps, status chip; **no Edit** by decision | Keep. Disputed/inconclusive need their own header treatment (warning chip + "what we checked") — currently styled like found. |
| Resolution note | Third tab once resolved; Edit allowed | Keep. Lock "Resolution" as the only artifact a person is expected to author. |
| States: empty / generating / ready / out-of-date / edited / deleted | Empty = "Summarize ticket" banner; generating = Dew-AI thinking; out-of-date = info message; deleted = row under the card to bring it back | Add an explicit **error** state (generation failed → retry). Out-of-date should offer one "Regenerate" inline, not only the header icon. |
| Sticky brief bar | One line under the tabs once the card scrolls away | Keep; same line is the card's collapsed state on narrow widths. |
| Ambient rows under the card | "Find the likely cause and resolution steps", "Generate a resolution note", "Summarize ticket" (after delete) | Keep as the single pattern for "ask for it". Limit to two visible; the rest go in a menu. |

## 3. Description and attachments

| Element | Built | Proposal |
|---|---|---|
| Description card | Title, origin line, italic brief, original message, attachments tiles; read-only pre-ticket chat inside it | Keep. The italic brief is AI-authored: add the AI byline or drop italics (italic currently reads as a quote). |
| Attachments | Tiles with name/size, snippet for logs | Add image thumbnails and a download/preview affordance; one component for description, messages and requested items. |
| Requested items (service requests) | Table with stage menu and actions | Keep Dew Table; stage is a status chip + menu, not link-styled text. |

## 4. Conversation entries

### 4a. Cards (someone said something)

| Type | Built | Proposal |
|---|---|---|
| Requester message | Surface card, requester avatar + channel badge, name, relative time | Keep. |
| Agent reply | Container card, blue "Reply" chip, To/Cc/Bcc line | Keep. Collapse long recipient lists to "+N". |
| Forward | Container card, gray "Forwarded" chip, original quoted | Keep. |
| Public note | Surface card, blue "Public note" chip | Keep. |
| Private note | Surface card, yellow "Private note" chip | Keep. |
| Digit message / Concierge message | Surface card, Digit avatar (Figma set), "via" line for Concierge relays | Keep. Add the Digit's role as a second line only on first appearance in a thread. |
| Draft-with-Copilot flag | Flag in data, not rendered | Show a small "Drafted with Freddy" tag on sent replies (as-is / edited). |
| Rich content bodies | Sanitised HTML: headings, lists, tables, code (dev-style block with copy, language, numbered lines), images, quoted mail, RTL text, emoji | Lock the content well: prose max-width, table scroll, image click-to-zoom, "show quoted text" fold. Broken/unsafe content shows a neutral "content removed" placeholder (currently silent). |
| Channel treatment | Slack/Teams logo on avatar and on the reply button; email shows recipients | Phone and portal need their own badge + a call-summary card (phone is in the type, not built). |

### 4b. Rows (something happened)

Built as light rows: 24px icon box + 24px avatar + one sentence, optional Details chevron.

| Event | Built | Proposal |
|---|---|---|
| Ticket created, delegated/assigned, status changed, properties updated | One-line rows; field changes expand to from → to | Keep. Group consecutive property updates into one row with a count. |
| Searched (KB/tickets) | Row with result links and meta | Keep; cap at 3 results then "+N". |
| Root cause added, summary updated, resolution notes | Rows that point at the pinned card | Keep; link target scrolls the card and flashes the border once. |
| Workflow executed | Row with step list (done/failed/skipped/running) | Failed steps need the warning colour on the icon, not only the text. |
| Approval requested / decided | Row mirrors the approval card's lifecycle | Keep. Decided rows must name the approver and time. |
| Handed over | Row + Blocked/Inconclusive chip + routing | Keep; this is the key hand-off moment, so give it the only full-width row treatment (divider above). |
| Thought / external update / digit event | Generic rows | Keep generic; do not add new event types without an icon, a sentence template and a Details schema. |

### 4c. AI work

| Element | Built | Proposal |
|---|---|---|
| Work log ("Worked for 13s") | Collapsible phases: reasoning, action steps, outcomes, conclusion | Keep. Same grid as rows. Show elapsed time only (no per-step times). |
| Live worker card | Stage label with shimmer, timer, streaming steps | Keep; the only place the Dew-AI shimmer is used outside generation. |
| Approval card (inline) | Last card in the thread, Digit voice, Reject / Approve, stack with peeking cards and arrows for several | Keep. Add keyboard shortcuts and a "why" disclosure; decided state replaces the card with the decision row. |
| Approval attention | Reply-dock variant when approvals wait | Keep one location only (inline); remove the dock variant if it is still reachable. |
| Ask AI threads | Copilot panel (AI DS slider): welcome, prompt suggestions, user message, AI response, morph minimise | Keep AI DS as is. Define how an answer is promoted into the ticket ("Add as note" is the only path). |

### 4d. Structure around the stream

| Element | Built | Proposal |
|---|---|---|
| Folded messages pill ("6 messages") | Pill with stacked avatars, expands in place | Keep. |
| New-message pill | Appears when a follow-up arrives; scroll to it | Keep; also set an unread divider line in the thread. |
| Pre-ticket log | Read-only chat record inside Description | Keep. |
| Timeline header / date separators | Header only | Add day separators beyond 24h gaps. |

## 5. Composer and footer

| Element | Built | Proposal |
|---|---|---|
| Mode buttons | Reply (Dew SplitButton; menu = Reply using AI options; shows Slack/Teams/Email variant), Forward, Note (private/public on email), Ask AI (AI action button, Freddy mark) | Lock: AI options live inside the split menu, never as a separate button. Ask AI is the only AI button in the bar. |
| Editor | Dew toolbar set (full on every ticket), recipients field, quoted fold, signature, Cancel / Send (SplitButton with send options) | Keep. Define autosave copy ("Saved") placement and attachment chips inside the editor, not above it. |
| AI inside the editor | Reply using AI, Refine, Edit with Copilot (enabled on selection) | Keep as AI DS. |
| Drafts | Dot on a mode button while folded | Keep. |

## 6. Side surfaces

| Element | Built | Proposal |
|---|---|---|
| Status / priority / SLA card | Info-bordered card, editable resolution due | Keep. SLA breach needs the semantic error treatment in dark and light. |
| Requester information | Avatar, name link, title, "View more details" | Keep. Add VIP and location chips. |
| Properties | Collapsible form: priority, status, source, type, groups… | Keep Dew form controls. Required markers and validation states need one spec. |
| Time entries | Rail icon only | Build or hide. |
| Widget rail | Four IconButtons scroll to sections | Keep. |

## 7. Cross-cutting states every element must define

Loading (shimmer only for AI; skeleton for lists) · Empty (Dew illustration + one action) · Error (inline message + retry) · Disabled · Read-only (resolved/closed tickets) · Long content (truncate with expand) · Dark mode · Narrow width.

## 8. Decisions I would ask the team to make now

1. Keep "no gradient on conversation cards" — yes/no. (I recommend yes.)
2. Italic brief in Description: drop italics, add AI byline.
3. Row vs card for **approvals decided** and **handed over**: row (recommended) with a Details chevron.
4. Phone and portal channels: build the call-summary card or defer.
5. Standardise the three "ask for it" patterns into the ambient row and retire any one-off banners.
6. Add the three missing states: generation error, content-removed placeholder, unread divider.

## 9. What I changed in the build while preparing this

Nothing — this is an audit of Round 1–21 state of the prototype.
