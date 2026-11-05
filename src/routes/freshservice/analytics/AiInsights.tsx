import { Icon } from '@freshworks/dew-components';
import InsightsTabs from './InsightsTabs';
import freddyAvatar from './assets/freddy-avatar.svg';
import {
  CONVERSATIONAL_BLURB,
  CONVERSATIONAL_TITLE,
  EXECUTIVE_BLURB,
  EXECUTIVE_TITLE,
  INSIGHTS,
  PROACTIVE_TITLE,
  PROMPT_CAPTION,
  PROMPT_CAPTION_LINK,
  PROMPT_PLACEHOLDER,
  PROMPT_SUGGESTIONS,
  SAMPLE_NOTICE,
  SAMPLE_NOTICE_LINK,
  WELCOME_NAME,
} from './analytics.data';

/**
 * Reports and Insights > AI Insights, read off /analytics/freddy-insights.
 *
 * A 382px insight rail beside a centred prompt, which is a different page from
 * its Analytics sibling rather than a variant of it. Measured inside the same
 * cross-origin reports iframe: rail cards are 350 wide at x=16 on a 12px
 * radius, and the main column starts at 398.
 */
export default function AiInsights() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
      <InsightsTabs />

      <div style={{ display: 'flex', flex: 1, minHeight: 0, minWidth: 0, borderBlockStart: '1px solid var(--color-boundary-border-mildest)' }}>
        <aside
          aria-label="Insights"
          style={{
            width: '382px',
            flexShrink: 0,
            boxSizing: 'border-box',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-200)',
            borderInlineEnd: '1px solid var(--color-boundary-border-mildest)',
            overflowY: 'auto',
          }}
        >
          {/* The selected card, on the same info-mildest the rest of the app
              uses for a current row. 350x78 on a 12px radius, 16px padding. */}
          <button type="button" style={{ ...CARD, background: 'var(--color-fill-semantic-info-mildest)', border: 'none' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', fontSize: '14px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-brand)' }}>
              <Icon name="Feedback" size="sm" color="var(--color-icon-selected)" />
              {CONVERSATIONAL_TITLE}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{CONVERSATIONAL_BLURB}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{PROACTIVE_TITLE}</h2>
            <Icon name="Filter" size="sm" color="var(--color-icon-secondary)" />
          </div>

          <button type="button" style={CARD}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', fontSize: '14px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
              <Icon name="LeftNavBar/Analytics2" size="sm" color="var(--color-icon-secondary)" />
              {EXECUTIVE_TITLE}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{EXECUTIVE_BLURB}</span>
          </button>

          {/* --color-fill-semantic-warning-mildest, as measured: these are
              seeded samples rather than the tenant's own data. */}
          <div style={{ display: 'flex', gap: 'var(--spacing-100)', padding: 'var(--spacing-200)', borderRadius: '12px', background: 'var(--color-fill-semantic-warning-mildest)' }}>
            <Icon name="Warning" size="sm" color="var(--color-icon-semantic-warning)" />
            <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>
              {SAMPLE_NOTICE}{' '}
              <a href="#" style={{ color: 'var(--color-text-brand)' }}>{SAMPLE_NOTICE_LINK}</a>
            </span>
          </div>

          {INSIGHTS.map((insight) => (
            <article key={insight.id} style={{ ...CARD, gap: 'var(--spacing-150)', cursor: 'default', position: 'relative' }}>
              {/* A 4x16 severity accent pinned to the card's left edge, in
                  --color-fill-semantic-warning-mild. Live renders it as an
                  <hr>, which is why it does not read as a border. */}
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  insetInlineStart: 0,
                  top: '16px',
                  width: '4px',
                  height: '16px',
                  borderRadius: '0 2px 2px 0',
                  background: 'var(--color-fill-semantic-warning-mild)',
                }}
              />
              <span style={{ display: 'flex', gap: 'var(--spacing-100)', fontSize: '13px', lineHeight: '18px', color: 'var(--color-text-primary)' }}>
                <Icon name="LeftNavBar/Analytics" size="sm" color="var(--color-icon-secondary)" />
                {insight.text}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Icon name="LeftNavBar/Contacts" size="2xs" color="var(--color-icon-secondary)" />
                  {insight.team}
                </span>
                {insight.when}
              </span>
            </article>
          ))}
        </aside>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-300)', padding: 'var(--spacing-400)', overflowY: 'auto' }}>
          {/* The product's own 48x48 asset, not a Dew icon. Its purple-to-violet
              gradient is not expressible as a token, and Dew's general icon
              scale tops out at 32px anyway, so substituting one was wrong on
              both colour and size. */}
          <img src={freddyAvatar} alt="" width={48} height={48} />
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Welcome, {WELCOME_NAME}
          </h1>

          {/* 736x98 on a 12px radius. */}
          <div style={{ width: '736px', maxWidth: '100%', position: 'relative' }}>
            <textarea
              aria-label="Ask Freddy AI"
              placeholder={PROMPT_PLACEHOLDER}
              rows={3}
              style={{
                width: '100%',
                height: '98px',
                boxSizing: 'border-box',
                padding: 'var(--spacing-200) 48px var(--spacing-200) var(--spacing-200)',
                borderRadius: '12px',
                border: '1.5px solid var(--color-boundary-border-milder)',
                resize: 'none',
                fontSize: '14px',
                fontFamily: 'inherit',
                color: 'var(--color-text-primary)',
              }}
            />
            <span style={{ position: 'absolute', insetInlineEnd: '12px', bottom: '16px' }}>
              <Icon name="SendFilled" size="md" color="var(--color-icon-secondary)" />
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
            {PROMPT_CAPTION}{' '}
            <a href="#" style={{ color: 'var(--color-text-secondary)', textDecoration: 'underline' }}>{PROMPT_CAPTION_LINK}</a>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-150)' }}>
            {PROMPT_SUGGESTIONS.map((s) => (
              <button key={s} type="button" style={SUGGESTION}>
                <Icon name="Feedback" size="sm" color="var(--color-icon-secondary)" />
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Measured at 36 tall on 7px/12px padding, and 14px REGULAR rather than the
 * semibold Dew's secondary button renders. Dew offers no 400-weight button and
 * its default is 32 tall, so this is a plain button carrying the measured
 * values rather than a component bent out of shape.
 */
const SUGGESTION = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--spacing-100)',
  height: '36px',
  padding: '7px 12px',
  borderRadius: '8px',
  border: '1px solid var(--color-boundary-border-milder)',
  background: 'var(--color-fill-surface)',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 400,
  color: 'var(--color-text-primary)',
} as const;

/** 350 wide, 12px radius, 16px padding, on a --color-boundary-border-milder hairline. */
const CARD = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  textAlign: 'left',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid var(--color-boundary-border-milder)',
  background: 'var(--color-fill-surface)',
  cursor: 'pointer',
} as const;
