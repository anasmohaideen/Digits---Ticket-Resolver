import { Icon, SliderPanel, TextButton } from '@freshworks/dew-components';
import noAnnouncementArt from './assets/no-announcement.svg';
import {
  ANNOUNCEMENTS_EMPTY,
  ANNOUNCEMENTS_FILTER,
  ANNOUNCEMENTS_SHEET_TITLE,
} from './dashboard.data';

/**
 * The Announcements panel, behind the second button above the widget grid.
 *
 * The same right-docked SliderPanel as Recent Activity, and for the same
 * reason — see the note there on why Modal's placement prop does not make a
 * Modal into a sheet.
 *
 * Its header carries a "New announcement" action beside the title, which is
 * what `customHeader` is for: Heading takes EITHER a title or a custom header,
 * never both, so the title moves inside the custom node rather than sitting
 * alongside it.
 *
 * The empty state is the product's own: a 175x175 illustration centred in the
 * sheet, the message at 16px/400 --color-text-secondary, and a 14px link. The
 * artwork is lifted verbatim from the live page rather than substituted with an
 * icon, the same way the AI Agent Studio's empty state was.
 */
export default function AnnouncementsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <SliderPanel open={open} onOpenChange={onOpenChange}>
      <SliderPanel.Content placement="right" size="lg" onClose={() => onOpenChange(false)}>
        <SliderPanel.Content.Heading
          customHeader={
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 'var(--spacing-200)' }}>
              {/* Heading's own title styling comes with `title`; a custom header
                  has to restate it. 24px/32px/700 is the component's value. */}
              <span
                style={{
                  fontSize: '24px',
                  lineHeight: '32px',
                  fontWeight: 'var(--font-weight-semi-bold)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {ANNOUNCEMENTS_SHEET_TITLE}
              </span>
              <TextButton variant="secondary" size="default" prefixIcon="CirclePlus">
                New announcement
              </TextButton>
            </span>
          }
        />
        <SliderPanel.Content.Body>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* A filter, not a caption: live pairs it with a chevron and it
                switches the sheet between active and scheduled announcements. */}
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-100)',
                alignSelf: 'flex-start',
                padding: 0,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'var(--color-text-primary)',
              }}
            >
              {ANNOUNCEMENTS_FILTER}
              <Icon name="ChevronDown" size="sm" color="var(--color-icon-secondary)" />
            </button>

            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-200)',
                paddingBlock: 'var(--spacing-500)',
              }}
            >
              <img src={noAnnouncementArt} alt="" width={175} height={175} />
              <p style={{ margin: 0, fontSize: '16px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                {ANNOUNCEMENTS_EMPTY}
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                View <a href="#" style={{ color: 'var(--color-text-brand)' }}>All announcements</a>
              </p>
            </div>
          </div>
        </SliderPanel.Content.Body>
      </SliderPanel.Content>
    </SliderPanel>
  );
}
