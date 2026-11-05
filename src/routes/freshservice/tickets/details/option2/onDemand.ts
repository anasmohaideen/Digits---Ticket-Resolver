import type { Actor, EventNode, RootCauseCard, SummaryCard } from '../types';
import { assignmentEvent, expandHandover } from './responseTimeline';
import type { ResolutionNote } from './scenarios';
import { INC_4150_ROOT_CAUSE } from '../fixtures/inc-4150';

/**
 * What a person gets by asking for it, for tickets whose own story does not
 * already carry it, and the rows a failed job leaves behind.
 */

/* Whatever a person asks the AI for here is Ticket Resolver's work: there is no separate Copilot. */
export const RESOLVER: Actor = { kind: 'digit', digit: 'ticket-resolver', name: 'Ticket Resolver' };

export const ROOT_CAUSE_ON_DEMAND: Record<string, RootCauseCard> = {
  'INC-4150': INC_4150_ROOT_CAUSE
};

const RESOLUTIONS: Record<string, Omit<ResolutionNote, 'at' | 'by'>> = {
  'INC-4140': {
    brief: 'Allow-list rule added through an emergency change; Elena can open the expense app',
    resolution: ['Elena can open the expense app from the office network after the Network Team added the office range to its allow-list.'],
    cause: ['The expense app moved to a new address range in CHG-2203, and the office’s outbound range wasn’t on the new allow-list.'],
    steps: [
      ['Jordan Reyes raised an emergency change for the allow-list rule, because the quarter-end freeze blocked the workflow.'],
      ['The change was approved and the rule added on the firewall.'],
      ['Elena retried and the app loaded from the office network.']
    ],
    prevention: ['Add the office outbound range to the allow-list whenever an internal app changes address.']
  },
  'INC-4150': {
    brief: 'Added to Finance-Users; Rohan can open the Finance shared drive',
    resolution: ['Rohan can open the Finance shared drive after Access Management added him to the Finance-Users group.'],
    cause: ['His group membership wasn’t updated when he moved from Sales Ops to Finance, so he still belonged to the Sales Ops groups.'],
    steps: [
      ['Checked his account and found the Sales Ops groups and no Finance-Users.'],
      ['Access Management added him to Finance-Users and removed the Sales Ops groups.'],
      ['Rohan signed out and back in, and the drive opened.']
    ],
    prevention: ['Update group membership as part of the HR team-move process.']
  }
};

export const hasResolutionOnDemand = (ticketCode: string) => ticketCode in RESOLUTIONS;

export function resolutionOnDemand(ticketCode: string, at: string | undefined): ResolutionNote | undefined {
  const note = RESOLUTIONS[ticketCode];
  return note ? { ...note, at: at ?? new Date().toISOString(), by: RESOLVER } : undefined;
}

export function summaryOnDemand(onDemand: SummaryCard | undefined, authored: SummaryCard | undefined, at: string | undefined): SummaryCard | undefined {
  const base = onDemand ?? (authored && authored.state !== 'not-generated' ? authored : undefined);
  return base ? { ...base, state: 'ready', updatedAt: at, updatedBy: RESOLVER, reason: 'on-demand' } : undefined;
}

/* ───────────── Where a failed job leaves the ticket ───────────── */

export type FailedJob = 'triage-failed' | 'rca-failed';

const FAILURE: Record<FailedJob, { why: string; label: string }> = {
  'triage-failed': {
    why: 'I couldn’t classify this from the conversation, so it went to the default queue for a person to triage.',
    label: 'Triage'
  },
  'rca-failed': {
    why: 'I compared similar tickets and recent changes but found no likely cause, so it needs a person to look.',
    label: 'Root cause'
  }
};

/** The rows the Resolver leaves when a job fails: it hands the ticket to a group, and the group gives it to a person. */
export function handoverAfterFailure(job: FailedJob, viewer: Actor, afterAt: string): EventNode[] {
  const at = new Date(Date.parse(afterAt) + 20_000).toISOString();
  const event: EventNode = {
    kind: 'event',
    id: `${job}-handover`,
    at,
    actor: RESOLVER,
    type: 'handed-over',
    data: {
      target: viewer,
      reason: 'inconclusive',
      method: 'round-robin',
      routing: 'Intelligent routing → Service Desk',
      details: [
        { label: FAILURE[job].label, value: ['Didn’t finish'] },
        { label: 'Why', value: [FAILURE[job].why] },
        { label: 'Routed by', value: ['Intelligent routing → Service Desk'] }
      ]
    }
  };
  return expandHandover(event).map(assignmentEvent);
}
