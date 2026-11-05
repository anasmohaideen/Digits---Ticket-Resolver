import { Avatar, SliderPanel } from '@freshworks/dew-components';
import { ACTIVITY_FEED, ACTIVITY_GROUP, ACTIVITY_SHEET_TITLE } from './dashboard.data';

/**
 * The Recent Activity panel, behind the first button above the widget grid.
 *
 * Built on Dew's SliderPanel rather than Modal. Modal was the wrong component:
 * it has a `placement` prop, so a right-docked sheet LOOKS supported, but
 * ModalContent applies fw-animate-[modal-entry_0.5s_ease_1] to every panel
 * whatever its placement, and fw-modal-entry is translateY(-10px) -> 0. The
 * sheet therefore dropped in from the top instead of sliding in from the edge
 * it was docked to.
 *
 * SliderPanel is the component for this, and it also supplies by measurement
 * everything the Modal version hand-rolled:
 *
 *   width      size="lg" is 600px; live measures 598
 *   height     fw-h-[calc(100vh-16px)] with an 8px gutter; live carries 9px
 *   heading    24px/32px/700 inset 32px, which is exactly what live reads
 *
 * So the sheet no longer carries a single measurement of its own. The one
 * divergence is that gutter: Dew's 8px against live's 9px, and the system's
 * own value wins over a one-pixel match.
 *
 * Entries are composed from the ticket fixture, so the feed can never cite a
 * ticket the Tickets list does not have. Live phrases each one the same way:
 * actor, verb, ticket link, object, then a relative timestamp underneath, all
 * strung on a vertical rule with the avatars sitting on it.
 */
export default function ActivitySheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <SliderPanel open={open} onOpenChange={onOpenChange}>
      <SliderPanel.Content placement="right" size="lg" onClose={() => onOpenChange(false)}>
        <SliderPanel.Content.Heading title={ACTIVITY_SHEET_TITLE} />
        <SliderPanel.Content.Body>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-150)' }}>
              {/* The group marker is a filled amber dot, not a bullet. */}
              <span
                aria-hidden
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--color-fill-semantic-warning)',
                  marginInlineStart: '8px',
                }}
              />
              <span style={{ fontSize: '14px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
                {ACTIVITY_GROUP}
              </span>
            </div>

            {/* The vertical rule runs behind the avatars, which is why it is a
                border on the list rather than a line per row. */}
            <ol
              style={{
                listStyle: 'none',
                margin: 0,
                padding: '0 0 0 32px',
                borderInlineStart: '1px solid var(--color-boundary-divider)',
                marginInlineStart: '11px',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-300)',
              }}
            >
              {ACTIVITY_FEED.map((entry) => (
                <li key={entry.id} style={{ display: 'flex', gap: 'var(--spacing-200)', position: 'relative' }}>
                  <span style={{ position: 'absolute', insetInlineStart: '-44px', top: 0 }}>
                    <Avatar name={entry.actor} size="sm" colorVariant="error" />
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '20px', color: 'var(--color-text-primary)' }}>
                      <span style={{ fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-brand)' }}>
                        {entry.actor}
                      </span>{' '}
                      {entry.before}{' '}
                      <span style={{ color: 'var(--color-text-brand)' }}>
                        {entry.ticket} (#{entry.code})
                      </span>{' '}
                      {entry.after}
                    </p>
                    <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{entry.when}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </SliderPanel.Content.Body>
      </SliderPanel.Content>
    </SliderPanel>
  );
}
