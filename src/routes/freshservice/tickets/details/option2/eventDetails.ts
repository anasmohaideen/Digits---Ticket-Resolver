import type { EventNode, RichText } from '../types';

/**
 * Option 2 · one shape for every timeline row's Details pane.
 *
 *   changes   Field  Old → New. An empty old value always reads "None".
 *   facts     Label: value, from one fixed vocabulary, in one fixed order.
 *   why       One paragraph, always last, never more than one per row.
 *
 * Only the presentation is normalised: every piece of information the data
 * carries is still shown. Routing leaves the pane for the row's meta line,
 * and nothing that only repeats the headline is shown twice.
 */

export interface StandardDetails {
  changes: Array<{ field: string; from: string; to: string }>;
  facts: Array<{ label: string; value: RichText }>;
  why: RichText[];
  /** "Intelligent routing", shown beside the time instead of in the pane. */
  routing?: string;
}

/** The fixed vocabulary, in display order. */
export const FACT_ORDER = ['Source', 'Found', 'Tried', 'Done', 'Blocked by', 'Waiting on', 'Next step'] as const;

/** The labels the data uses today, mapped onto the vocabulary. */
const LABEL_ALIAS: Record<string, string> = {
  Blocker: 'Blocked by',
  Diagnosis: 'Found',
  'Tried first': 'Tried'
};

const EMPTY = new Set(['', '--', '—', '-']);

const textOf = (value: RichText) => value.map((part) => (typeof part === 'string' ? part : part.label)).join('');

/** "Round robin: next agent…" under "was auto-assigned (round robin)": the headline already says the method. */
function withoutMethodPrefix(value: RichText, event: EventNode): RichText {
  const method = event.data.method;
  if (method !== 'round-robin' && method !== 'load-balanced') return value;
  const [first, ...rest] = value;
  if (typeof first !== 'string') return value;
  const stripped = first.replace(/^(Round robin|Load balanced):\s*/i, '');
  if (stripped === first) return value;
  return [stripped.charAt(0).toUpperCase() + stripped.slice(1), ...rest];
}

/** "Intelligent routing → Network Team" next to "assigned it to Network Team" → "via Intelligent routing". */
function routingMeta(value: RichText, group?: string): string {
  const text = textOf(value).trim();
  const [how, to] = text.split('→').map((part) => part.trim());
  return to && group && to === group ? `via ${how}` : `via ${text}`;
}

export function standardDetails(event: EventNode): StandardDetails {
  const { data } = event;
  const changes = (data.fields ?? []).map((change) => ({
    ...change,
    from: EMPTY.has(change.from.trim()) ? 'None' : change.from
  }));

  const facts: StandardDetails['facts'] = [];
  const why: RichText[] = [];
  let routing: string | undefined;

  for (const detail of data.details ?? []) {
    if (detail.label === 'Why') {
      why.push(detail.value);
    } else if (detail.label === 'How') {
      why.push(withoutMethodPrefix(detail.value, event));
    } else if (detail.label === 'Routed by') {
      routing = routingMeta(detail.value, data.group);
    } else if (/^didn.t finish$/i.test(textOf(detail.value).trim())) {
      /* "Triage: Didn't finish" is what blocked the hand-over. */
      facts.push({ label: 'Blocked by', value: [`${detail.label} didn’t finish`] });
    } else {
      facts.push({ label: LABEL_ALIAS[detail.label] ?? detail.label, value: detail.value });
    }
  }
  if (event.why) why.push([event.why]);

  const rank = (label: string) => {
    const index = (FACT_ORDER as readonly string[]).indexOf(label);
    return index === -1 ? FACT_ORDER.length : index;
  };
  facts.sort((a, b) => rank(a.label) - rank(b.label));

  return { changes, facts, why, routing };
}

export function hasStandardDetails(details: StandardDetails, event: EventNode): boolean {
  return Boolean(
    details.changes.length || details.facts.length || details.why.length ||
    event.data.results?.length || event.data.steps?.length
  );
}
