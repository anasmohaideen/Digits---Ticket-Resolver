import { Icon, InlineMessage } from '@freshworks/dew-components';
import emptyArt from './assets/no-announcement.svg';
import { RETIRED_WIDGET_MESSAGE } from './dashboard.data';

/**
 * What a widget shows when it has nothing to draw.
 *
 * Live has two distinct versions of "empty" on this page and they are not
 * interchangeable, so they are two components rather than one with a flag.
 */

/**
 * The ordinary one: artwork over a centred line of copy.
 *
 * The drawing is the same "nothing here yet" illustration the Announcements
 * sheet uses, which is already lifted from the live page. Live draws a distinct
 * trophy on the Leaderboard, and that one is NOT in this repo -- rather than
 * invent artwork to stand in for it, the widget that needs it passes an icon
 * and says so at the call site.
 */
export function WidgetEmptyState({ message, icon }: { message: string; icon?: 'award' }) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-200)',
        padding: '0 var(--spacing-500) var(--spacing-400)',
      }}
    >
      {icon === 'award' ? (
        /* Stand-in. Live's Leaderboard shows a gold medal on a ribbon, which is
           a product illustration rather than a Dew asset; the nearest thing the
           library ships is a filled star. Handled the way the Agent Studio's
           missing vendor logos were -- an on-system placeholder with a comment,
           not a hand-vendored SVG. */
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            background: 'var(--color-fill-semantic-warning-mildest)',
          }}
        >
          <Icon name="FavouriteStarFill" size="xl" color="var(--color-icon-semantic-warning)" />
        </span>
      ) : (
        <img src={emptyArt} alt="" width={114} height={112} />
      )}
      <p
        style={{
          margin: 0,
          maxWidth: '360px',
          fontSize: '14px',
          lineHeight: '20px',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
        }}
      >
        {message}
      </p>
    </div>
  );
}

/**
 * The other one: a widget whose feature has been withdrawn under it.
 *
 * Live renders this as red text on a pink field, repeating the widget's own
 * title inside the message -- which reads oddly next to the title directly
 * above it, and is preserved rather than tidied, the same way "Open tickets"
 * keeps its lowercase t.
 *
 * An InlineMessage rather than a tinted div: this is exactly what the component
 * is for, and its error variant already carries the alert role and the
 * assertive live region that a hand-rolled box would have had to remember.
 */
export function RetiredWidget({ title }: { title: string }) {
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'flex-end', padding: '0 24px 24px' }}>
      <InlineMessage variant="error">
        {title} {RETIRED_WIDGET_MESSAGE}
      </InlineMessage>
    </div>
  );
}
