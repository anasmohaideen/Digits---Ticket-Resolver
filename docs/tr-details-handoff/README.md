# TR Details tab handoff (incidents)

Design handoff for building the Ticket Resolver (TR) Digit experience inside the **Details tab**
of the Freshservice ticket details page. Scope for this round: **incidents**.

| Path | What it is |
|---|---|
| `PROMPT.md` | The prompt to paste into the Claude Code session |
| `spec/01-scope-and-layout.md` | What's in scope, page order, zones |
| `spec/02-blocks.md` | Every block: purpose, anatomy, states, copy |
| `spec/03-behaviour.md` | Landing, collapsing, grouping, sticky strip, filter, channels |
| `spec/04-component-mapping.md` | Table Claude Code fills in with this repo's components |
| `data/types.ts` | Data contract the UI renders from |
| `data/inc-4127.slack-handover.json` | Main scenario: Slack incident TR handed over (Blocked) |
| `data/inc-4133.email-humans.json` | Regression scenario: email incident, humans only |
| `data/catalog.json` | One example of every block and state, for a gallery |
| `reference/` | Design canvas HTML (visual reference only). See `reference/README.md` |

## Decisions this package encodes

- **Two AI cards at the top**: a Summary card, and a Root cause & suggested fix card. The
  suggested fix lives inside the root cause card because the PRD makes it part of the RCA
  output. Fix execution (approval, workflow run) lives in the stream.
- **One stream for every channel.** Digit messages reuse today's conversation cards; Slack
  messages use the same cards as email.
- **Digit work collapses** into one run group on landing, then phases, then items.
- **Reasoning is on demand** through a "Why" toggle on the event it explains.
- **The Summary never moves.** New items appear above the reply bar, and a slim strip keeps
  the two cards in reach once they scroll out of view.

## Before you start

Optional but helpful: export PNG screenshots of the canvas artboards and drop them in
`reference/screens/`. Claude Code can read images, and screenshots are easier to compare
against than the HTML.
