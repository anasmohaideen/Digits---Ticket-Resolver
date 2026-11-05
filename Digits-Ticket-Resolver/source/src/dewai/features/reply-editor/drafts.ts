/** Signature block appended to every reply. */
export const REPLY_SIGNATURE = 'Best,\nAcme'

/** Body when opening via Reply — empty message with signature only. */
export function buildEmptyReplyBody() {
  return joinReplyBody('', REPLY_SIGNATURE)
}

/** AI-generated draft when opening via Reply using AI (screen 3). */
export const REPLY_AI_DRAFT = `Hi Aspen,
Hope you're having a great day,

Best,
Acme`

/** Default inline suggestion shown when opening via Reply using AI. */
export const REPLY_AI_SUGGESTION = `Thank you for sending that photo. It confirms exactly what is happening.
The good news is that your machine is not broken! This is just a failed 'Group Head Gasket'. It is a standard wear-and-tear rubber seal, similar to replacing windshield wipers on a car. Replacing will fix the leak instant.

I have placed a warranty order for a replacement Kit to be shipped to you immediately (Order #WARR-992).
It's very easy to swap out. Here is a 2-minute video guide on how to install the seal.`

export const REPLY_FROM = 'IT support <helpdesk@support.freshservice.com>'
export const REPLY_TO = 'aspen.roser@freshworks.com'

const SIGNATURE_MARKER = '\n\nBest,'

/** Split full reply body into message content and trailing signature. */
export function splitReplyBody(body: string) {
  const idx = body.lastIndexOf(SIGNATURE_MARKER)
  if (idx !== -1) {
    return {
      greeting: body.slice(0, idx),
      signature: body.slice(idx + 2),
    }
  }

  // Bare signature without a preceding message (legacy / malformed body)
  if (body.trimStart().startsWith('Best,')) {
    return { greeting: '', signature: body.trimStart() }
  }

  return { greeting: body, signature: '' }
}

/** Join message content and signature into a single reply body. */
export function joinReplyBody(greeting: string, signature: string) {
  if (!signature.trim()) return greeting
  if (!greeting.trim()) return signature.trimStart()
  return `${greeting.replace(/\s+$/, '')}\n\n${signature.replace(/^\s+/, '')}`
}

export const COPILOT_DEFAULT_PROMPTS = {
  refine: 'Expand text',
  replyUsingAi: 'Generate reply',
  editWithCopilot: 'Improve this text',
} as const

export type AiMenuIcon =
  | 'sparkle'
  | 'expand'
  | 'edit'
  | 'briefcase'
  | 'annotate'
  | 'conversation'

export type AiMenuItem =
  | { type: 'item'; label: string; prompt: string; icon?: AiMenuIcon; variant?: 'default' | 'ai' }
  | { type: 'divider' }
  | { type: 'header'; label: string }

/** Refine dropdown options (RTE AI action bar). */
export const REFINE_MENU_OPTIONS: AiMenuItem[] = [
  { type: 'item', label: 'Expand text', prompt: 'Expand text', icon: 'expand' },
  { type: 'item', label: 'Rephrase', prompt: 'Rephrase', icon: 'edit' },
  { type: 'divider' },
  { type: 'header', label: 'Enhance tone' },
  { type: 'item', label: 'Professional', prompt: 'Make tone professional', icon: 'briefcase' },
  { type: 'item', label: 'Casual', prompt: 'Make tone casual', icon: 'annotate' },
  { type: 'item', label: 'Friendly', prompt: 'Make tone friendly', icon: 'conversation' },
]

/** Reply using AI dropdown options (RTE + conversation footer). */
export const REPLY_USING_AI_MENU_OPTIONS: AiMenuItem[] = [
  { type: 'item', label: 'Generate reply', prompt: 'Generate reply', icon: 'sparkle', variant: 'ai' },
  { type: 'item', label: 'Suggest resolution steps', prompt: 'Suggest resolution steps' },
  { type: 'item', label: 'Acknowledge', prompt: 'Acknowledge' },
  { type: 'item', label: 'Request more information', prompt: 'Request more information' },
  { type: 'item', label: 'Follow up', prompt: 'Follow up' },
  { type: 'item', label: 'Request confirmation to close', prompt: 'Request confirmation to close' },
]

const RESOLUTION_STEPS_SUGGESTION = `Here are the steps to resolve your VPN connection issue:

1. Verify your internet connection is stable.
2. Open the VPN client and sign out, then sign back in.
3. Clear the VPN profile cache and reconnect.
4. If the issue persists, restart your laptop and try again.

Let me know how it goes — I'm here if you need further help.`

const ACKNOWLEDGE_SUGGESTION = `Thank you for reaching out and for your patience while we look into this.

I understand how disruptive VPN issues can be, especially when you're trying to get work done. I've reviewed your ticket and am working on the next steps for you.`

const REQUEST_INFO_SUGGESTION = `To help us troubleshoot this faster, could you please share:

• The exact error message you see when the VPN fails
• Whether this happens on Wi‑Fi, ethernet, or both
• If any colleagues on the same network are affected

Once I have these details, I can narrow down the cause quickly.`

const FOLLOW_UP_SUGGESTION = `I wanted to follow up on your VPN connection issue and check whether the steps we shared helped.

If you're still unable to connect, please reply with the latest error message and I'll escalate this to our network team right away.`

const CLOSE_CONFIRM_SUGGESTION = `Based on our recent updates, it looks like your VPN connection may be working again.

Could you please confirm that you're able to connect successfully? Once you confirm, I'll go ahead and close this ticket.`

/** Inline suggestion copy keyed by menu prompt (Refine + Reply using AI). */
export function mockInlineSuggestion(
  prompt: string,
  sourceText: string,
): string {
  const lower = prompt.toLowerCase()
  const base = sourceText.trim() || REPLY_AI_DRAFT

  if (lower.includes('resolution')) return RESOLUTION_STEPS_SUGGESTION
  if (lower.includes('acknowledge')) return ACKNOWLEDGE_SUGGESTION
  if (lower.includes('request more')) return REQUEST_INFO_SUGGESTION
  if (lower.includes('follow up')) return FOLLOW_UP_SUGGESTION
  if (lower.includes('confirmation') || lower.includes('close')) return CLOSE_CONFIRM_SUGGESTION
  if (lower.includes('generate')) return REPLY_AI_SUGGESTION

  return mockCopilotRewrite(base, prompt)
}

/** Mock rewrite results keyed by prompt keywords (Copilot slider). */
export function mockCopilotRewrite(selectedText: string, prompt: string): string {
  const lower = prompt.toLowerCase()
  const source = selectedText.trim()

  if (!source) {
    return 'Please select text in your reply before asking Copilot to rewrite it.'
  }

  const isWarrantyContext =
    /warranty|warr-992|replacement kit|group head gasket|install the seal/i.test(source)

  if (
    isWarrantyContext &&
    (lower.includes('casual') || lower.includes('empathy') || lower.includes('empathetic'))
  ) {
    return `I've ordered a replacement kit for you under warranty (Order #WARR-992), and it's on its way. Swapping it out is super simple—check out this quick 2-minute video to see how to install the seal.`
  }

  if (isWarrantyContext && (lower.includes('concise') || lower.includes('short'))) {
    return `Your warranty replacement kit (Order #WARR-992) is on the way. Here's a quick 2-minute video for installing the seal.`
  }

  if (isWarrantyContext && (lower.includes('elaborat') || lower.includes('expand') || lower.includes('detail'))) {
    return `I've placed a warranty order for your replacement kit (Order #WARR-992), and it should ship right away. The leak you're seeing is from a worn group head gasket—a common wear item, not a machine failure. Installing the new seal is straightforward; this 2-minute video walks through each step.`
  }

  if (lower.includes('short') || lower.includes('shorter') || lower.includes('concise')) {
    return source
      .split(/(?<=[.!?])\s+/)
      .slice(0, 2)
      .join(' ')
      .trim()
  }

  if (lower.includes('professional') || lower.includes('formal')) {
    return source
      .replace(/\bI've\b/g, 'I have')
      .replace(/\bit's\b/gi, 'it is')
      .replace(/\bsuper simple\b/gi, 'straightforward')
      .replace(/\bHey\b/g, 'Dear')
      .replace(/\bHi\b/g, 'Dear')
  }

  if (lower.includes('casual') || lower.includes('friendly')) {
    return source
      .replace(/\bI have placed\b/gi, "I've placed")
      .replace(/\bIt is very easy\b/gi, "It's super easy")
      .replace(/\bHere is a\b/gi, "Here's a")
      .replace(/\bDear\b/g, 'Hey')
      .replace(/\bI hope this message finds you well\./g, "Hope you're doing well!")
  }

  if (lower.includes('empathetic') || lower.includes('empathy')) {
    const empatheticLead = 'I completely understand how frustrating this can be, and I appreciate your patience.'
    if (/^I completely understand/.test(source)) return source
    return `${empatheticLead}\n\n${source}`
  }

  if (lower.includes('expand')) {
    return `${source}\n\nI've also included a bit more context so the next steps are clear.`
  }

  if (lower.includes('rephrase')) {
    return source
      .replace(
        /I have placed a warranty order for a replacement Kit to be shipped to you immediately \(Order #WARR-992\)\./i,
        'Your warranty replacement kit (Order #WARR-992) is already on its way to you.',
      )
      .replace(
        /It's very easy to swap out\. Here is a 2-minute video guide on how to install the seal\./i,
        'Installation is quick—this 2-minute video shows exactly how to fit the new seal.',
      )
  }

  if (lower.includes('grammar') || lower.includes('fix')) {
    return source.replace(/\s+/g, ' ').replace(/\s+([,.!?])/g, '$1').trim()
  }

  if (lower.includes('rewrite') || lower.includes('improve') || lower.includes('better')) {
    return rephraseSelection(source)
  }

  return rephraseSelection(source, prompt.trim())
}

function rephraseSelection(source: string, instruction?: string) {
  const sentences = source.split(/(?<=[.!?])\s+/).filter(Boolean)
  if (sentences.length <= 1) {
    return instruction
      ? `${source.replace(/\.$/, '')} — revised to ${instruction.charAt(0).toLowerCase()}${instruction.slice(1)}.`
      : source
  }

  return sentences
    .map((sentence, index) => {
      if (index === 0) {
        return sentence
          .replace(/^I have placed/i, "I've gone ahead and placed")
          .replace(/^Thank you for/i, 'Thanks for')
      }
      if (index === sentences.length - 1) {
        return sentence.replace(/^Here is/i, "Here's")
      }
      return sentence
    })
    .join(' ')
}
