import type { Actor, MessageNode } from '../types';

/**
 * The follow-ups the "Simulate new message" control sends, in order. They read
 * as one employee getting more anxious as the wait goes on, so each click
 * lands as something plausible after the last. Five at most.
 */
export const MAX_INCOMING = 5;

const GENERIC = [
  'Hi, any update on this? I’m still stuck.',
  'It’s getting urgent on my side. I need this working later today.',
  'I tried restarting again and nothing changed.',
  'Is there anything I can do in the meantime? I’m happy to try something.',
  'Thanks for looking into it. Please let me know as soon as it’s sorted.'
];

const BY_TICKET: Record<string, string[]> = {
  'INC-4127': [
    'Hi, any update on this? I’m still on Guest Wi-Fi.',
    'Quick heads-up: I have a client demo coming up and I need Corp-Secure for it.',
    'I forgot the network and restarted again. Same error, so it isn’t something I’m doing.',
    'If this isn’t fixed in time, can I use my phone’s hotspot for the demo? Is that allowed?',
    'Thanks for looking into it. Please ping me here the moment it’s sorted.'
  ],
  'INC-4140': [
    'Any news? The expense app still times out for me.',
    'Finance closes submissions today, so I’m worried about missing the deadline.',
    'Priya just told me hers is still failing too, so it isn’t only me.',
    'Is there a way to submit from my phone’s hotspot in the meantime?',
    'Please let me know the moment it’s sorted. Thank you.'
  ],
  'INC-4142': [
    'It restarted again just now, in the middle of a customer call.',
    'That’s the third time this week. Can someone look at it today?',
    'I can take a remote session between calls if that helps.',
    'Do you need anything from the laptop? Tell me where to find it and I’ll send it.',
    'Thanks. I’ll keep it plugged in and open for you.'
  ]
};

/** The nth (0-based) follow-up for a ticket, as a message from its requester. */
export function incomingMessage(index: number, ticketCode: string, requester: Actor, channel: MessageNode['channel']): MessageNode {
  const lines = BY_TICKET[ticketCode] ?? GENERIC;
  return {
    kind: 'message',
    id: `o2-incoming-${index + 1}`,
    at: new Date().toISOString(),
    actor: requester,
    variant: 'requester-reply',
    channel,
    body: [lines[index % lines.length]]
  };
}
