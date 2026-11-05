# 01 · Scope and layout

## In scope

The content area of the **Details** tab for **incident** tickets:

- Tickets created by Ticket Resolver from a Workplace Concierge conversation (Slack, Teams or
  portal). These carry Digit activity.
- Tickets with no Digit activity, such as email-created ones. These must look and behave as they
  do today (regression check).

## Out of scope (already built, or later)

- Rail nav, top nav, ticket subject/header, tab bar, right pane. **Don't change these.**
- Reply, forward and note **editors**. Keep today's editors; only the collapsed bar's labels
  change by channel.
- Service requests (requested items, attachments table). That's the next round.
- Copilot side panel and "Ask AI" behaviour. The button can appear where specified and open
  whatever it opens today.

## Page order inside the Details tab

```
┌───────────────────────────────────────────────┐
│ ZONE 1 · AI cards (fixed position, top)       │
│   [Summary card]                              │
│   [Root cause & suggested fix card]           │
├───────────────────────────────────────────────┤
│ ZONE 2 · Reference                            │
│   [Description + attachment cards]            │
├───────────────────────────────────────────────┤
│ ZONE 3 · Conversations                        │
│   Heading ············· [All activity|Messages]│
│   [Digit run group]  (collapsed on landing)   │
│   [Handover event]                            │
│   [Latest messages / notes / events …]        │
│   [Reply · Forward · Add note bar]            │
└───────────────────────────────────────────────┘
(sticky) [Summary strip] appears under the tab bar once Zone 1 scrolls out of view
```

## What replaces what (vs today's Details tab)

| Today | Now |
|---|---|
| "Summarize ticket" button / Summary card | **Summary card**. Same position and actions; new section layout; shows who updated it |
| "View changes that could be initiating this ticket" card | **Root cause & suggested fix card**. When nothing has been analyzed, it shows today's "Find initiating changes" action |
| Similar tickets | Evidence link inside the Root cause card; the full list stays in Related tickets |
| Description container with attachments | Unchanged |
| Conversations heading, "+N conversations" pill | Same, plus the All activity / Messages only switch. The same collapse pattern is reused for Digit groups |
| Reply / forward / public note / private note / requester reply cards | Unchanged visual components. Slack and Teams messages reuse them |
| Reply · Forward · Add note bar | Unchanged component; labels depend on the ticket's source channel |
| — | New: Digit message, stream events, approval card, Digit run and phase groups, sticky strip |

## Copy conventions

- Sentence case everywhere.
- Digit names are proper nouns: Ticket Resolver, Workplace Concierge, Knowledge Curator.
- Times are shown in the viewer's format, using the repo's existing date/time helpers.
- All copy in the fixtures is final for the prototype. Route it through the repo's i18n
  mechanism if one exists.
