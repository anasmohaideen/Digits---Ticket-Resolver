import { Link } from 'react-router-dom';
import { TextButton } from '@freshworks/dew-components';
import emptyServicesArt from './assets/empty-services.svg';
import {
  SERVICES_EMPTY_ACTION,
  SERVICES_EMPTY_BODY,
  SERVICES_EMPTY_TITLE,
  SERVICES_NEW,
  SERVICES_POTENTIAL,
} from './services.data';

/**
 * The service catalogue, rebuilt from /a/services/view/all.
 *
 * Services is the first child of IT Operations, so it answers at the group's
 * own route rather than under it.
 *
 * Unlike the other quiet views, this empty state SELLS the feature rather than
 * reporting an absence: a heading, a sentence of rationale, then a way to
 * start. So it gets its own layout rather than the shared one-line EmptyState,
 * which has no room for either.
 */
export default function Services() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0, overflow: 'auto', padding: '16px 20px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--spacing-150)' }}>
        {/* A page of its own, not a filter on this one. */}
        <Link to="/freshservice/it-operations/potential-services" style={{ textDecoration: 'none' }}>
          <TextButton variant="link" size="default">
            {SERVICES_POTENTIAL}
          </TextButton>
        </Link>
        <TextButton variant="primary" size="default">
          {SERVICES_NEW}
        </TextButton>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-200)', padding: 'var(--spacing-500)' }}>
        <img src={emptyServicesArt} alt="" width={175} height={175} />
        <h1 style={{ margin: 0, fontSize: '20px', lineHeight: '28px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
          {SERVICES_EMPTY_TITLE}
        </h1>
        <p style={{ margin: 0, maxWidth: '520px', fontSize: '14px', lineHeight: '20px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
          {SERVICES_EMPTY_BODY}
        </p>
        <TextButton variant="primary" size="default">
          {SERVICES_EMPTY_ACTION}
        </TextButton>
      </div>
    </div>
  );
}
