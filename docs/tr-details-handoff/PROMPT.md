# Prompt: build the Ticket Resolver (TR) Details tab for incidents

Paste everything below the line into the Claude Code session, with this
`tr-details-handoff/` folder placed somewhere in the repo (for example
`docs/tr-details-handoff/`). Update the path in the first paragraph if you put it elsewhere.

---

You are working in the Freshservice front-end repository. I want you to build the
**content of the Details tab** on the ticket details page for **incidents**, so it can show
the work of the Ticket Resolver digital worker ("Digit") alongside today's ticket
conversations.

All design inputs are in `docs/tr-details-handoff/`. Read them in this order before writing
any code:

1. `README.md`: what is in the package.
2. `spec/01-scope-and-layout.md`: what to build and the page order.
3. `spec/02-blocks.md`: every block, its anatomy, states and copy.
4. `spec/03-behaviour.md`: landing position, collapsing, grouping, sticky strip, filters.
5. `data/types.ts`: the data contract. Build the UI against these types.
6. `data/inc-4127.slack-handover.json`, `data/inc-4133.email-humans.json` and
   `data/catalog.json`: fixtures to render.
7. `reference/`: HTML from the design canvas, plus screenshots if present. **Visual reference
   only.** Read `reference/README.md` first; some parts of those files are superseded.

## Hard rules

- **Use this repository's components and tokens only.** The design system, components,
  tokens and text styles already exist in this project. Do not create new primitive
  components (buttons, chips/badges, avatars, cards, icons, inputs, tabs, toggles,
  accordions, tooltips) and do not create new text styles, colors, spacing or radius values.
- **Never copy CSS, hex colors, pixel values or font settings from `reference/`.** Those files
  were made outside this codebase. Use them for structure, hierarchy, copy and behaviour, then
  express everything with the project's existing components and tokens.
- **If no existing component fits a block**, compose it from existing primitives. If even that
  isn't possible, stop and tell me what's missing, with a proposal, before building anything new.
- **Stay inside the Details tab.** The rail nav, top nav, ticket subject/header area, tab bar
  and right pane are already built. Don't modify them, except to read the data they already
  have.
- **Don't regress existing behaviour.** Today's Details tab (Summary card, Description with
  attachments, "View changes that could be initiating this ticket", Conversations, the
  "+N conversations" collapse, reply/forward/note cards and the Reply · Forward · Add note bar)
  must keep working for tickets with no Digit activity.
- **Reply and note editors are out of scope.** Keep using the existing editors exactly as they
  are. Only the collapsed bar's labels change by channel (see spec).
- Follow the repo's existing patterns for framework, state management, data fetching, feature
  flags, i18n, testing and file structure. Detect them; don't introduce new libraries.

## How to work

### Step 1: Explore and map (no UI code yet)

- Find the existing ticket details page, its Details tab, and the components it uses today
  for the Summary card, Description, initiating-changes card, conversation cards, the
  "+N conversations" pill and the reply bar.
- Find the design-system components and tokens: cards, buttons, icon buttons, badges/chips,
  avatars, accordion/disclosure, tabs/segmented control, tooltips, skeletons, spinners and
  icons.
- Fill in `spec/04-component-mapping.md`. For each block, record the existing component you'll
  use, the props/variants, and any gap.
- Show me the completed mapping and the list of files you plan to add or change. **Wait for my
  go-ahead.**

### Step 2: Data layer

- Add the types from `data/types.ts`, adapted to the repo's conventions (TS or JSDoc, naming).
- Load the fixtures through the repo's mock or dev-data pattern so the tab can render without
  a backend. Put this behind the existing feature-flag mechanism, or a dev-only route, so
  production is unaffected.

### Step 3: Build blocks, in this order

1. Summary card, all states.
2. Root cause & suggested fix card, all states.
3. Description block, reusing today's component.
4. Conversation message cards: requester reply, agent reply, forward, public note, private note,
   Digit message and Concierge message. Reuse today's cards and extend them with props.
5. Stream event rows: every `EventType` in `types.ts`, with their expandable details.
6. Approval card: pending, approved and rejected.
7. Groups: the Digit run (level 1), phases (level 2), and the human-thread collapse.
8. Conversations header with the "All activity / Messages only" switch.
9. Reply bar labels by channel.
10. Sticky summary strip.

### Step 4: Assemble and verify

- Assemble the Details tab and render three states for INC-4127, as listed in
  `spec/03-behaviour.md`: landing, engaged and fully expanded. Also render INC-4133, the email
  ticket, to prove there's no regression.
- Build a dev gallery (Storybook if the repo has it, otherwise a dev route) that renders every
  entry in `data/catalog.json`.
- Check keyboard access for every toggle (expand, collapse, "Why", filter, strip "Show"),
  `aria-expanded` on disclosures, and visible focus.
- Run the repo's lint, type check and tests. Add tests for the grouping and landing logic in
  `spec/03-behaviour.md` (pure functions, no snapshots of styling).
- Take screenshots of each state and compare them against `reference/`. List any deliberate
  differences where the project's components look different from the reference. That's
  expected, so just tell me.

When something in the spec is ambiguous, pick the option that reuses existing components and
note it in a short "Decisions" list at the end of your summary.
