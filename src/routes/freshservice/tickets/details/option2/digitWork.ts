import type { TicketDetailsTab } from '../types';
import type { ArtifactKind } from './responseTimeline';

/** Digit work stays in the conversation; manual generation keeps the card loader. */
export function digitWorkPresentation(tab: TicketDetailsTab, digitOwnsTicket: boolean, generating?: ArtifactKind) {
  const working = generating ?? (digitOwnsTicket
    ? tab.summary.state === 'generating' ? 'summary'
      : tab.rootCause.state === 'analyzing' ? 'root-cause' : undefined
    : undefined);
  if (!working) return { working, tab };
  return {
    working,
    tab: {
      ...tab,
      summary: tab.summary.state === 'generating' ? { ...tab.summary, state: 'not-generated' as const } : tab.summary,
      rootCause: tab.rootCause.state === 'analyzing' ? { ...tab.rootCause, state: 'not-analyzed' as const } : tab.rootCause
    }
  };
}
