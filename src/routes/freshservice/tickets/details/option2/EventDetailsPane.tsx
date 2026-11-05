import { Fragment } from 'react';
import type { EventNode } from '../types';
import RichTextView, { InlineLink } from '../RichTextView';
import FixSteps from '../FixSteps';
import type { StandardDetails } from './eventDetails';

/**
 * Option 2 · the Details pane of a timeline row, in the one standard shape:
 * a grey label column and a value column, with changes, then facts, then a
 * single Why under a hairline. See `eventDetails.ts` for the rules.
 */
export default function EventDetailsPane({
  event,
  details,
  ticketCode
}: {
  event: EventNode;
  details: StandardDetails;
  ticketCode?: string;
}) {
  const { changes, facts, why } = details;
  const { results, steps } = event.data;
  const hasRows = changes.length > 0 || facts.length > 0 || Boolean(results?.length) || Boolean(steps?.length);

  return (
    <div className="tr-o2-evd">
      {changes.map((change) => (
        <Fragment key={`c-${change.field}`}>
          <span className="tr-o2-evd-label">{change.field}</span>
          <span className="tr-o2-evd-value">
            <span className="tr-o2-evd-old">{change.from}</span>
            <span className="tr-o2-evd-arrow" aria-label="to">→</span>
            <span className="tr-o2-evd-new">{change.to}</span>
          </span>
        </Fragment>
      ))}

      {facts.map((fact) => (
        <Fragment key={`f-${fact.label}`}>
          <span className="tr-o2-evd-label">{fact.label}</span>
          <span className="tr-o2-evd-value"><RichTextView value={fact.value} ticketCode={ticketCode} /></span>
        </Fragment>
      ))}

      {results && results.length > 0 && (
        <>
          <span className="tr-o2-evd-label">Found</span>
          <span className="tr-o2-evd-value tr-o2-evd-list">
            {results.map((result) => (
              <span key={result.link.label}>
                <InlineLink link={result.link} ticketCode={ticketCode} />
                {result.meta && <span className="tr-o2-evd-old"> · {result.meta}</span>}
              </span>
            ))}
          </span>
        </>
      )}

      {steps && steps.length > 0 && (
        <>
          <span className="tr-o2-evd-label">Steps</span>
          <span className="tr-o2-evd-value"><FixSteps steps={steps} /></span>
        </>
      )}

      {why.length > 0 && (
        <div className={`tr-o2-evd-why${hasRows ? '' : ' is-alone'}`}>
          <span className="tr-o2-evd-label">Why</span>
          <span className="tr-o2-evd-value">
            {why.map((part, i) => (
              <Fragment key={i}>
                {i > 0 && ' '}
                <RichTextView value={part} ticketCode={ticketCode} />
              </Fragment>
            ))}
          </span>
        </div>
      )}
    </div>
  );
}
