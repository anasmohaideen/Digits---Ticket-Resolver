import type { Channel } from '../types';

/**
 * Option 2 · what the editor shows, by ticket source and mode.
 *
 * One pure function, so the composer never scatters channel checks through its
 * markup and the rules can be tested without a DOM.
 *
 *   chat       Slack and Teams: a short, conversational reply. No mail rows, no
 *              signature, the basic formatting set.
 *   email-like Email and the support portal: replies carry From and Reply To
 *              (with Cc / Bcc), the full toolbar, a signature, the quoted
 *              thread and a Send menu.

 *   forward    Email tickets only: the reply's mail rows with an empty To, the
 *              original email beneath, no canned responses or Send menu.
 *   note       A private note: formatting, attachments and articles, but it
 *              goes to no one, so no mail rows and no canned responses.
 *   ask        Ask AI: a plain question for the Digit.
 */

export type ComposeMode = 'reply' | 'forward' | 'note' | 'ask';
export type ToolbarSet = 'basic' | 'full';

export interface ComposerLayout {
  fromRow: boolean;
  replyToRow: boolean;
  /** `null`: no toolbar, and its space is not given back. */
  toolbar: ToolbarSet | null;
  signature: boolean;
  quoted: boolean;
  attach: boolean;
  solutions: boolean;
  canned: boolean;
  sendMenu: boolean;
  /** Ask AI offers a few starting questions in the AI strip's place. */
  promptChips: boolean;
}

export const isChat = (channel: Channel): boolean => channel === 'slack' || channel === 'teams';
export const isEmailLike = (channel: Channel): boolean => channel === 'email' || channel === 'portal';

export function composerLayout(source: Channel, mode: ComposeMode): ComposerLayout {
  if (mode === 'ask') {
    return {
      fromRow: false,
      replyToRow: false,
      toolbar: null,
      signature: false,
      quoted: false,
      attach: true,
      solutions: false,
      canned: false,
      sendMenu: false,
      promptChips: true
    };
  }

  const mail = (mode === 'reply' || mode === 'forward') && isEmailLike(source);
  return {
    fromRow: mail,
    replyToRow: mail,
    toolbar: 'full',
    signature: mail,
    quoted: mail,
    attach: true,
    solutions: mode !== 'forward',
    canned: mode === 'reply',
    sendMenu: mode === 'reply',
    promptChips: false
  };
}
