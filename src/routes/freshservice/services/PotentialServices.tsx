import { useState } from 'react';
import { Icon } from '@freshworks/dew-components';
import noPotentialArt from './assets/no-potential-services.svg';
import {
  POTENTIAL_BLURB,
  POTENTIAL_BLURB_LINK,
  POTENTIAL_EMPTY,
  POTENTIAL_NOTICE,
  POTENTIAL_TABS,
  POTENTIAL_TITLE,
} from './services.data';

/**
 * Potential services, read off /a/services/potential-services.
 *
 * A second page behind the catalogue's "Potential services" action, not a view
 * of the same one. Its tabs are UNDERLINE tabs at 42 tall, 14px/500, brand when
 * current and secondary when not, which is a different shape from the filled
 * pills the rest of the app uses.
 *
 * The illustration is 118x99 rather than the 175 square the other empty states
 * use, and the page explains itself at length underneath.
 */
export default function PotentialServices() {
  const [tab, setTab] = useState(POTENTIAL_TABS[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0, overflow: 'auto' }}>
      <div style={{ display: 'flex', gap: 'var(--spacing-300)', paddingInline: '20px', borderBlockEnd: '1px solid var(--color-boundary-border-mildest)' }}>
        {POTENTIAL_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            style={{
              height: '42px',
              padding: '0 8px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              color: tab === t ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
              // The current tab is marked by a rule under it, not a fill.
              boxShadow: tab === t ? 'inset 0 -2px 0 0 var(--color-fill-brand)' : undefined,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', fontSize: '14px', color: 'var(--color-text-primary)' }}>
          <Icon name="CircleInfo" size="sm" color="var(--color-icon-semantic-info)" />
          {POTENTIAL_NOTICE}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-200)', paddingBlock: 'var(--spacing-500)' }}>
          <img src={noPotentialArt} alt="" width={118} height={99} />
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
            {POTENTIAL_EMPTY}
          </p>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
            {POTENTIAL_TITLE}
          </h2>
          <p style={{ margin: 0, maxWidth: '720px', fontSize: '13px', lineHeight: '20px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
            {POTENTIAL_BLURB}{' '}
            <a href="#" style={{ color: 'var(--color-text-brand)', textDecoration: 'none' }}>
              {POTENTIAL_BLURB_LINK}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
