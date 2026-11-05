import { ASK_QUESTION, SUGGESTED_REPLY } from './scenarios';

/**
 * What each editor holds the first time it is opened, so a reply, a note or a
 * question to Ask AI can be sent from any stage of any ticket without typing.
 */
export interface ComposerDefaults {
  reply: string;
  forward: string;
  note: string;
  ask: string;
}

const BY_TICKET: Record<string, (first: string) => ComposerDefaults> = {
  'INC-4127': () => ({
    reply: SUGGESTED_REPLY,
    forward: 'Forwarding this for your review. The Corp-Secure certificate looks like the cause; can your team assign the updated profile?',
    note: 'Assigning the Corp-Secure profile manually in Intune. Also checking the 3 other open CHG-2187 tickets.',
    ask: ASK_QUESTION
  }),
  'INC-4140': (first) => ({
    forward: 'Forwarding this for your review. We need an emergency change approved to add the allow-list rule. Can you take a look?',
    reply: `Hi ${first}, thanks for waiting. I’ve raised an emergency change to add the office outbound range to the expense app’s allow-list. I’ll update you as soon as it’s approved, and then ask you to retry.`,
    note: 'Raising an emergency change for the allow-list rule under the quarter-end freeze. Will check the 3 similar tickets once it is through.',
    ask: 'Can I raise an emergency change during the quarter-end freeze, and who has to approve it?'
  }),
  'INC-4150': (first) => ({
    reply: `Hi ${first}, thanks for waiting. I’ve asked Access Management to add you to the Finance-Users group. It usually takes under an hour; I’ll confirm here as soon as it’s done, and then you can sign out and back in.`,
    forward: 'Forwarding this for you to action: please add Rohan Mehta to the Finance-Users group. His move to Finance is confirmed in the attached HR email.',
    note: 'Group membership still shows Sales Ops. Asked Access Management to add Finance-Users and remove the Sales Ops groups.',
    ask: 'What else usually needs changing when someone moves teams, besides shared-drive groups?'
  }),
  'INC-4142': (first) => ({
    forward: 'Forwarding this for your review. The restarts look hardware-related; can your team check the dock firmware?',
    reply: `Hi ${first}, I’d like to collect the crash logs after your next restart. Could you tell me when it happens? I can take a remote session between your calls.`,
    note: 'Waiting for the next restart to collect crash logs. Checking the macOS update and the dock firmware as the leading suspects.',
    ask: 'Which of the three suspects is most likely, and what would confirm it?'
  })
};

export function composerDefaults(ticketCode: string, requesterName: string): ComposerDefaults {
  const first = requesterName.split(' ')[0] ?? requesterName;
  return (BY_TICKET[ticketCode] ?? ((name) => ({
    forward: 'Forwarding this for your review. Could you take a look and let me know what you find?',
    reply: `Hi ${name}, thanks for your patience. I’m looking into this and will update you here shortly.`,
    note: 'Looking into this now. I’ll add what I find to the ticket.',
    ask: 'What is the most likely cause of this, and what should I try first?'
  })))(first);
}
