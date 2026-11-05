import type { StageId } from './stages';
import type { ArtifactKind } from './responseTimeline';
import type { LiveWorkStage } from '../LiveWorkerCard';

export interface DigitDemoStep {
  id: string;
  label: string;
  stage: StageId;
  duration: number;
  focus: ArtifactKind | 'conversation';
  live?: LiveWorkStage;
  work?: 'triage' | 'summary' | 'root-cause' | 'resolution';
  visibleSteps?: number;
  generating?: ArtifactKind;
}

const STEPS: DigitDemoStep[] = [
  { id: 'arrive', label: 'Agent arrives · Digit is thinking', stage: 'created', duration: 4500, focus: 'conversation', live: 'thinking', work: 'triage' },
  { id: 'triage', label: 'Classifying the ticket', stage: 'created', duration: 5500, focus: 'conversation', live: 'working', work: 'triage', visibleSteps: 2 },
  { id: 'summary-loading', label: 'Generating the summary', stage: 'summarising', duration: 5000, focus: 'conversation', live: 'working', work: 'summary', generating: 'summary' },
  { id: 'summary-ready', label: 'Summary added to the ticket', stage: 'summary', duration: 4500, focus: 'summary' },
  { id: 'rca-thinking', label: 'Investigating the likely cause', stage: 'summary', duration: 4500, focus: 'conversation', live: 'thinking', work: 'root-cause' },
  { id: 'rca-working', label: 'Comparing tickets and recent changes', stage: 'rca-running', duration: 6500, focus: 'conversation', live: 'working', work: 'root-cause', visibleSteps: 3 },
  { id: 'rca-loading', label: 'Preparing the root cause', stage: 'rca-running', duration: 4500, focus: 'conversation', live: 'working', work: 'root-cause', generating: 'root-cause' },
  { id: 'rca-ready', label: 'Root cause and suggested fix added', stage: 'rca-done', duration: 4500, focus: 'root-cause' },
  { id: 'approval', label: 'Waiting for agent approval', stage: 'approval', duration: 6000, focus: 'conversation', live: 'waiting', work: 'resolution', visibleSteps: 1 },
  { id: 'fix', label: 'Running the fix and handing off to Jordan', stage: 'rca-done', duration: 5500, focus: 'conversation', live: 'working', work: 'resolution', visibleSteps: 3 },
  { id: 'resolution-loading', label: 'Writing the resolution note', stage: 'rca-done', duration: 5000, focus: 'conversation', live: 'working', work: 'resolution', generating: 'resolution' },
  { id: 'resolved', label: 'Ticket resolved · resolution note added', stage: 'resolved', duration: 6500, focus: 'resolution' }
];

const endpoint = (stage: StageId, label: string): DigitDemoStep => ({ id: `end-${stage}`, label, stage, duration: 5500, focus: 'conversation' });

/** Replay only the work leading to the selected outcome, including failure branches. */
export function digitDemoJourney(selected: StageId | undefined): DigitDemoStep[] {
  switch (selected) {
    case 'created': return [STEPS[0], endpoint('created', 'Ticket created · ready for triage')];
    case 'triage': return [...STEPS.slice(0, 2), endpoint('triage', 'Triage completed')];
    case 'triage-failed': return [...STEPS.slice(0, 2), endpoint(selected, 'Triage failed · handed to the Service Desk')];
    case 'summarising': return STEPS.slice(0, 3);
    case 'summary': return STEPS.slice(0, 4);
    case 'rca-running': return STEPS.slice(0, 7);
    case 'rca-failed': return [...STEPS.slice(0, 6), endpoint(selected, 'No likely cause found · handed to the Service Desk')];
    case 'rca-done': return STEPS.slice(0, 8);
    case 'approval': return STEPS.slice(0, 9);
    case 'resolved': return [...STEPS];
    case 'blocked-freeze': return [...STEPS.slice(0, 9), endpoint(selected, 'Fix blocked by a change freeze · approval required')];
    case 'blocked-no-tool': return [...STEPS.slice(0, 8), endpoint(selected, 'No workflow can run the fix · handed over')];
    case 'blocked-permission': return [...STEPS.slice(0, 10), endpoint(selected, 'Fix blocked by permissions · handed over')];
    case 'blocked-partial': return [...STEPS.slice(0, 10), endpoint(selected, 'Fix partly applied · handed over')];
    case 'group': return [...STEPS.slice(0, 10), endpoint('group', 'Handed over to the Network Team')];
    case 'person':
    case undefined:
      return [...STEPS.slice(0, 10), endpoint('group', 'Handed over to the Network Team'), endpoint('person', 'Assigned to Jordan Reyes')];
  }
}
