# Reference files: read before using

These HTML files come from the design canvas. They are **visual and structural references
only**:

- Use them for hierarchy, order, grouping, copy and states.
- **Don't** copy their CSS, colors, pixel values, fonts or markup. Build with this repo's
  components and tokens (see `PROMPT.md`).
- They use canvas-only tags (`<x-dc>`, `<sc-if>`, `<sc-for>`) and won't render on their own.
  Read the markup, or look at `screens/` if PNGs have been added.
- Everything outside the Details tab content (rail nav, top bar, ticket header, tabs, right pane)
  is mock chrome. **Ignore it.** Those parts are already built in the repo.

When a reference file and `spec/` disagree, **`spec/` wins.**

| File | Shows | Superseded parts |
|---|---|---|
| `01-landing-after-handover.html` | Landing state: Summary, Description, collapsed Digit run, handover event, latest messages, reply bar | The single **Summary** card with three columns (What's happening / Root cause / Next step) → replace with **two cards** (spec B1 + B2, file 05) |
| `02-engaged-sticky-strip.html` | After the agent engages: private note, Slack reply, requester reply, sticky strip | Strip content → use file 07, version S1 (one-line text + Root cause and Fix chips) |
| `03-history-expanded.html` | Run expanded into phases; "Before the ticket" and "Root cause" expanded; "Why" reasoning open | Same Summary card change as 01 |
| `04-email-ticket-regression.html` | Email ticket, humans only: "+3 conversations" pill, reply, requester reply, private note, forward | Same Summary card change as 01; root cause shows as card B2 in state `not-analyzed` |
| `05-ai-cards.html` | Summary card and Root cause card, expanded and collapsed (A1, A2) | The separate **Suggested fix** card → its content moves into the Root cause card as the "Suggested fix" section (spec B2). Collapsed view has **two** rows, not three |
| `06-ai-card-states.html` | All states of the AI cards | The "Suggested fix" column → these become `SuggestedFix.status` states shown inside the Root cause card |
| `07-sticky-strip.html` | Strip versions S1, S2, S3 | **Use S1.** S2 and S3 are not chosen |
| `08-event-and-state-additions.html` | Proposed event and state additions (ticket created, waiting, approval decided, decided approval card, searchable results, confidence slot, handover with reason, other Digit events, failed workflow step, sentiment, drafted-with marker) | Treat as the catalogue for B5–B7. The "Updates in external apps" row is tools-registry only, not MVP |

The interactive tabbed card (Option B) is not included because it wasn't chosen.
