# Addendum: Dew-AI comparison, gradient rule, and kickoff-meeting alignment

Builds on `Digits-Ticket-Resolver-Audit.md`. Sources: the Dew-AI Figma file ("Foundations — AI theme", plus a library search that also hit Dew Design System 1.1.3 and the Illustration Library), the installed Dew packages, the prototype code, and the kickoff meeting notes you pasted.

> **Correction (later in the session):** a second Dew-AI search found approved styles that change two verdicts below. `AI/Border/Border-Two Tone`, `AI/Glow FX` (Default and Two Tone), `AI/Shimmer/Loading Shimmer` and `AI/Motion/Text Shine` are all approved Dew-AI styles. So a gradient border or a thinking-label shine is not a violation **on an AI element** if it uses the library style. The violations are: hand-built look-alikes with off-palette colours, and any of it on non-AI cards such as private notes. See `Digits-Details-Card-Guidelines.md` section 4 for the corrected rule.

## 0. What I compared, and what I did not

The first audit compared the prototype with the installed `@freshworks/dew-components` and the `SKILL.md` rules only. It did not compare with Dew-AI. I have now read what I could from Dew-AI:

- Read: the AI theme token table (light and dark values), the style and variable search, and the existence of the Dew-AI `Copilot` component set.
- Not read: the Dew-AI **AI Gradient** style definition (its stops and where it is approved to be used), the **Copilot** component anatomy, Dew-AI's "Foundations — AI color/styles" pages, and the Dew 1.1.3 component pages. The tool returned the style's name only.
- Not compared: any other design system (for example the Ember-era Freshservice/Freshdesk UI). Tell me which ones you mean and I will compare.

## 1. Dew-AI findings

| # | Sev | Finding | Detail |
|---|---|---|---|
| AI1 | High | **AI surfaces use non-AI tokens.** | Dew defines an *AI Tokens* collection (Hot Pink `#fb64b6`, Soft Pink `#ffc2cb`, Violet `#a987fc`, Indigo `#276cf0`, Blue `#6aa8ff`, Green `#10b08f`, each with Mild/Medium variants and separate dark values), described as "restricted to AI-powered features only". The prototype paints its AI cards with `--color-*-semantic-highlight-*` and `*-info-*` instead. Those are general-UI tokens. |
| AI2 | High | **Gradient colours outside the AI palette.** | `index.css` ~L1996: `rgba(255,137,54,.3) → rgba(168,85,255,.3)` (`#FF8936 → #A855FF`) on the floating card. Neither colour is in the AI token set. `AiAgents.tsx` has `#e5f2fd → #e0f5f1`. Hard-coded values also break dark mode. |
| AI3 | High | **Only one gradient is approved: `AI/Fill/AI Gradient` (Dew-AI).** | The prototype has about six hand-built gradient treatments (section 2). I could not read the approved stops, so I cannot say whether any of them match. |
| AI4 | Med | **Copilot is a Dew-AI component set.** | The prototype re-builds the Copilot prompt and compose box with `tr-o2-copilot-*` CSS (`index.css`), including a custom focus-within border. Compare with the Dew-AI `Copilot` set before shipping. |
| AI5 | Med | **AI tokens have dark values** (for example Soft Pink `#ffc2cb` becomes `#a62426` at 70%). The code's `color-mix(...)` glows and hex fallbacks do not follow them. | Use the AI tokens so dark mode comes for free. |

## 2. Gradient audit (rule: no gradient fills except the approved Dew-AI one)

| Where | What it is | Verdict |
|---|---|---|
| `.tr-o2-edge` / `.tr-o2-card` (`index.css` ~L2116–2150) | 1px gradient border **plus a radial glow fill** from the top-left corner. Used on the top artifact card, AI entries, **and private notes**. | **Remove.** The glow is a gradient fill, and private notes should not carry it (see section 3). |
| `.tr-ai-card` (L20–30, Option 1) | 2px gradient border, `highlight → info`. | Remove, or replace with a plain `border-mildest`. |
| Brief bar (L1195) | `linear-gradient(105deg, highlight-mildest, info-mildest)` **fill**. | **Remove.** Use `fill-container` or `fill-surface`. |
| Floating card (L1996–2012) | Hard-coded `#FF8936 → #A855FF` @ 30% border. | Remove or swap for the approved AI Gradient once its usage rule is confirmed. |
| `.tr-live-shine` (L203) | Animated text gradient ("Thinking…"). | Remove (also conflicts with the no-animation constraint, section 3). |
| Scrim and masks (L96, 1718, 1897, 1926–1962) | Surface-to-transparent fades for truncation and scroll edges. | Functional, not decorative. Keep, but list them with the design system team as an exception. |
| `AiAgents.tsx` L215 | `#e5f2fd → #e0f5f1` card fill. | Outside the Details tab, but a gradient fill with hard-coded hex. Remove. |
| Gradient border only, from the approved style | Possibly allowed. | Confirm with the Dew-AI owners where the AI Gradient is approved (border, logo, CTA?) before using it anywhere. |

## 3. Alignment with the kickoff meeting

| Meeting decision or constraint | Prototype today | Status |
|---|---|---|
| White or gray only, no gradients, no blue/orange card fills | Public note has a **blue fill and blue border** (`ResponseCard.surface`). Private note and AI entries have the gradient edge and glow. Agent replies and Digit messages use gray `fill-container`. | **Not met** |
| Pinned card holds summary and root cause | Option 2 `ArtifactCard` does this. | Met |
| Resolution note stays a **separate** component for FEBSCO | Option 2's top card leads with "resolution › root cause › summary", so the resolution note is folded into the pinned card. | **Conflicts** |
| Description card kept, showing the pre-ticket Slack/Teams conversation | Option 2 has `DescriptionBox` and `PreTicketLog`. **Option 1 hides the description for incidents.** | Option 2 met, Option 1 not |
| Slack/Teams tickets: **only** Slack Reply / Teams Reply, no forward or public or private note | Spec B9 and the demo allow a private note on chat tickets. `INC-4127` shows Jordan adding one. | **Conflicts.** Confirm with the PM whether private notes survive. |
| AI-ticket properties **auto-apply** at high confidence, no approval | "Update ticket properties" is an **approval** the agent must approve (`PROPERTY_UPDATE_APPROVAL`). | **Conflicts** for the AI path. The editable fields do fit the traditional-ticket partial-accept path. |
| Approve/reject stays **in the Copilot pane** for FEBSCO, but approvals appear **inline, not as an overlay** | Approvals are inline in the thread (`ApprovalInline`) and as a sticky card (`ApprovalAttention`). | **Meeting is internally unclear.** Confirm whether the in-thread card is only a pointer to the Copilot pane. |
| AI event cards are a private-note variant: **no animation, no generative indicators** | `LiveWorkerCard`, "Thinking Ns" counters, shine animation, and `Reveal` transitions exist in the thread. | **Conflicts** unless the live view is confined to the Copilot pane. |
| Copilot pane open by default, user choice remembered | Not verified in the prototype. Ask AI is also a panel opened from private notes and AI entries. | Verify |
| Content repetition (pinned plus chronological cards) | Present: the top card **and** Summary, Root cause and Resolution entries in the thread. | This is the open concern you raised. Unresolved. |
| Dark mode | Hex fallbacks, hard-coded gradients and `--fs-app-chrome` do not adapt. | **Not met** (see audit D1/D4/D8) |
| Ember vs React | The prototype is React with Dew components. | **Open.** If Ticket Details stays in Ember, this prototype is a visual reference only, and the Dew-component recommendations in the audit (D2/D3) apply to the design spec, not to this code. |

## 4. Proposal for Wednesday: card patterns (white/gray only, no gradients)

For you to review, since you own this deliverable. All values are semantic Dew tokens with no hex fallbacks, so each pattern works in light and dark mode.

| Card | Surface | Differentiator | Notes |
|---|---|---|---|
| Employee response | `fill-surface` (white), 1px `border-mildest` | Avatar and name only | The baseline. |
| Agent reply | `fill-container` (gray), 1px `border-mildest` | Avatar, "Replied in Slack/email" meta | Keeps the two sides of the conversation apart without colour. |
| Public note | `fill-surface`, 1px `border-mildest` | Gray `Tag` "Public note" and an icon | Replaces the blue fill. |
| Private note | `fill-surface`, 1px `border-mildest` | Lock icon plus a warning-tone `Tag` "Private note", or a thin left rule in the warning boundary token if the design system approves it | Matches the "~95% white, subtle orange element" direction. No fill, no gradient. |
| Forward | `fill-container` | "Forwarded" label and forward icon | Distinct card type; confirm. |
| Description | `fill-surface`, 1px border | Heading and origin meta | Rich content sits in a neutral white content well. |
| AI note / event | `fill-surface` for notes. Events are one-line rows with **no card**. | AI sparkle icon and an "AI" label, with the Dew-AI AI token on the icon only | Plain text or light rich text. No animation. |

Two cautions on this direction:
- `SKILL.md` lists left-border accent callouts as an anti-pattern for Dew work. The meeting suggested a left border as one example, so I put the label, icon and `Tag` first and the left rule second. Please confirm which the design system team accepts.
- The pasted-rich-text clash is best solved structurally: render user HTML inside a neutral content well and strip or scope inherited background and font styles. Card colour alone will not fix it.

## 5. Revised priority list (replaces the audit's priority order where it overlaps)

1. Remove the gradient fills and glows (section 2) and the blue public-note fill. This is what the meeting asked for and is small work.
2. Move the private note and AI note onto the section 4 patterns, and pull AI colours from the AI token set.
3. Resolve the four conflicts with the meeting (resolution note, chat-ticket reply options, property auto-apply, animation) with the PM, then update the fixtures and spec.
4. Fix the 20 undefined tokens (audit D1) so dark mode works.
5. Settle Ember vs React before spending time on the Dew-component refactor (audit D2/D3).
6. Ask the Dew-AI owners for the AI Gradient usage rule, and for the Copilot component anatomy.

## 6. Questions for you

1. Which "other design systems" should I compare against (for example the Ember-era Freshservice UI, or Freshdesk)?
2. Where is the Dew-AI AI Gradient approved: border, logo, button, or something else?
3. Should I start removing gradients and re-skin the cards to section 4 in this prototype?
