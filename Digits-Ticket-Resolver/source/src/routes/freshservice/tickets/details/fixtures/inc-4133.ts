import type { TicketDetailsTab } from '../types';

/**
 * Regression scenario: an email incident handled entirely by people. No Digit
 * activity, a summary generated on demand by Copilot, and seven human messages
 * so the "+3 conversations" fold is exercised. Verbatim from
 * `docs/tr-details-handoff/data/inc-4133.email-humans.json`.
 */
export const INC_4133: TicketDetailsTab = {
  "ticket": {
    "id": "INC-4133",
    "type": "incident",
    "subject": "Outlook keeps asking for my password",
    "source": "email",
    "requester": {
      "kind": "requester",
      "id": "u-daniel",
      "name": "Daniel Ortiz",
      "title": "Account Executive · Austin"
    },
    "assignee": {
      "kind": "agent",
      "id": "a-jordan",
      "name": "Jordan Reyes"
    }
  },
  "viewer": {
    "agent": {
      "kind": "agent",
      "id": "a-jordan",
      "name": "Jordan Reyes"
    },
    "lastSeenAt": "2026-10-19T08:51:00-07:00"
  },
  "summary": {
    "state": "ready",
    "title": "Outlook keeps prompting Daniel for his password",
    "updatedAt": "2026-10-19T08:52:00-07:00",
    "updatedBy": {
      "kind": "copilot",
      "name": "Agent Concierge"
    },
    "reason": "on-demand",
    "issue": [
      "Daniel’s Outlook on Windows asks for his password every few minutes since Friday."
    ],
    "tried": [
      [
        "Signing out and back in didn’t help."
      ],
      [
        "Jordan asked for a screenshot; Daniel sent one."
      ]
    ],
    "standing": [
      "Forwarded to the Identity team to check sign-in logs."
    ],
    "strip": "Outlook prompts for a password every few minutes. Identity team is checking sign-in logs.",
    "basedOn": {
      "messages": 7,
      "actions": 0
    }
  },
  "rootCause": {
    "state": "not-analyzed"
  },
  "description": {
    "body": [
      "Hi IT, since Friday Outlook keeps popping up a password box every few minutes. I type it in and it goes away, then comes back. Can someone take a look? Thanks, Daniel"
    ],
    "attachments": []
  },
  "stream": [
    {
      "kind": "message",
      "id": "x1",
      "at": "2026-10-18T16:32:00-07:00",
      "variant": "reply",
      "channel": "email",
      "actor": {
        "kind": "agent",
        "id": "a-jordan",
        "name": "Jordan Reyes"
      },
      "to": [
        "daniel.ortiz@acmecorp.com"
      ],
      "body": [
        "Hi Daniel, thanks for reporting this. Could you try signing out of Outlook and back in, and let me know if it keeps happening?"
      ]
    },
    {
      "kind": "message",
      "id": "x2",
      "at": "2026-10-19T08:05:00-07:00",
      "variant": "requester-reply",
      "channel": "email",
      "actor": {
        "kind": "requester",
        "id": "u-daniel",
        "name": "Daniel Ortiz"
      },
      "body": [
        "Tried that this morning. Still happening every few minutes."
      ]
    },
    {
      "kind": "message",
      "id": "x3",
      "at": "2026-10-19T08:20:00-07:00",
      "variant": "public-note",
      "channel": "email",
      "actor": {
        "kind": "agent",
        "id": "a-jordan",
        "name": "Jordan Reyes"
      },
      "body": [
        "Checked the service status page: no Microsoft 365 incidents reported for our tenant."
      ]
    },
    {
      "kind": "message",
      "id": "x4",
      "at": "2026-10-19T08:31:00-07:00",
      "variant": "reply",
      "channel": "email",
      "actor": {
        "kind": "agent",
        "id": "a-jordan",
        "name": "Jordan Reyes"
      },
      "to": [
        "daniel.ortiz@acmecorp.com"
      ],
      "body": [
        "Hi Daniel, thanks for the details. Could you send a screenshot of the prompt, including the account name it shows?"
      ]
    },
    {
      "kind": "message",
      "id": "x5",
      "at": "2026-10-19T08:46:00-07:00",
      "variant": "requester-reply",
      "channel": "email",
      "actor": {
        "kind": "requester",
        "id": "u-daniel",
        "name": "Daniel Ortiz"
      },
      "body": [
        "Here you go. It says “Need password” for daniel.ortiz@acmecorp.com."
      ],
      "attachments": [
        {
          "name": "outlook-prompt.png",
          "sizeLabel": "212 KB"
        }
      ]
    },
    {
      "kind": "message",
      "id": "x6",
      "at": "2026-10-19T08:49:00-07:00",
      "variant": "private-note",
      "channel": "email",
      "actor": {
        "kind": "agent",
        "id": "a-jordan",
        "name": "Jordan Reyes"
      },
      "body": [
        "Looks like a token refresh loop. Forwarding to Identity to check his sign-in logs."
      ]
    },
    {
      "kind": "message",
      "id": "x7",
      "at": "2026-10-19T08:50:00-07:00",
      "variant": "forward",
      "channel": "email",
      "actor": {
        "kind": "agent",
        "id": "a-jordan",
        "name": "Jordan Reyes"
      },
      "to": [
        "identity-team@acmecorp.com"
      ],
      "body": [
        "Can you check sign-in logs for daniel.ortiz@acmecorp.com since Friday? Outlook is prompting for a password every few minutes."
      ]
    }
  ]
};
