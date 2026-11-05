import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { SIDE_DOCK_ID } from './sideDock';
import freshserviceLogoPaths from './imports/Railnav-1/svg-ro96t70kgt';
import omniswitcherPaths from './imports/Railnav-2/svg-iz6iwg9g9p';
import topNavSvgPaths from './imports/TopNavigation-1-1/svg-aidbivqtu5';
import agentAvatar from '../../../Assets/Human Avatars/female-9-1.png';
import { setThemeMode, useThemeMode, type ThemeMode } from '../../theme';
import { NAV_SECTIONS, childHref, getSection, sectionHref, type NavSection } from './sections';
import { TICKET_VIEW_NAME, ticketCodeFor } from './tickets/tickets.data';
import DashboardTopBar from './dashboard/DashboardTopBar';
import { KB_TITLE, TOPICS_BETA, TOPICS_TITLE } from './knowledge-base/kb.data';
import { ASSETS_MODULE, ASSETS_VIEW } from './assets/assets.data';
import { CHANGES_MODULE, CHANGES_VIEW } from './changes/changes.data';
import { PROBLEMS_MODULE, PROBLEMS_VIEW } from './problems/problems.data';
import { POTENTIAL_TITLE, SERVICES_MODULE, SERVICES_VIEW } from './services/services.data';

/**
 * Sections whose top bar names a MODULE and a saved VIEW, "Tickets List - New &
 * My Open Tickets". Five of them share the shape, so it is a lookup rather than
 * five branches that would drift apart one edit at a time.
 */
const MODULE_VIEWS: Record<string, { module: string; view: string }> = {
  tickets: { module: 'Tickets List', view: TICKET_VIEW_NAME },
  // The rail calls this Assets; the page calls itself Inventory.
  assets: { module: ASSETS_MODULE, view: ASSETS_VIEW },
  changes: { module: CHANGES_MODULE, view: CHANGES_VIEW },
  problems: { module: PROBLEMS_MODULE, view: PROBLEMS_VIEW },
  // Services is IT Operations' first child, so it answers at the group's id.
  'it-operations': { module: SERVICES_MODULE, view: SERVICES_VIEW },
};
import {
  TopNavigation,
  TextButton,
  IconButton,
  Tag,
  Avatar,
  Badge,
  Breadcrumb,
  Icon,
  Menu,
  type IMenuOption,
} from '@freshworks/dew-components';

/**
 * The ticket detail route, and the code its breadcrumb shows. The product's
 * top bar changes shape here: no navigation toggle, and a breadcrumb reading
 * "Tickets > #INC-8" rather than the section title. Measured on the live
 * detail page, whose left side holds only a Tickets link and a chevron.
 */
function useTicketDetailCode(): string | undefined {
  const { pathname, search } = useLocation();
  /* The split view is the list with a ticket open beside it, so the top bar
     keeps the list's title rather than switching to a ticket breadcrumb. */
  if (new URLSearchParams(search).get('view') === 'split') return undefined;
  /* The optional `/option-2` tail is the review's old link shape, which now
     redirects to the plain path. It is the same ticket either way, so the top
     bar shows the same breadcrumb while the redirect happens. */
  const match = pathname.match(/^\/freshservice\/tickets\/([^/]+)(?:\/option-2)?$/);
  return match ? ticketCodeFor(match[1]) : undefined;
}

/**
 * The rail's "More" overflow. It sits below every primary section and holds
 * the sections that are not in the rail itself — Admin, in the product's case.
 * Collapsed the rail shows only the ••• ; this opens the same list as a menu.
 */
/** Freshservice's default workspace; the Admin top bar names it. */
const WORKSPACE = 'IT';

function useFreshserviceSection(): NavSection | undefined {
  const { pathname } = useLocation();
  const sectionId = pathname.split('/')[2];
  return getSection(sectionId);
}

/**
 * Solutions is a GROUP, not a destination. Hovering it opens a flyout naming
 * the group and listing its views, the way the rail's More overflow does.
 *
 * Measured on the live flyout: 258x153 seated at x=64, so flush against the
 * rail's 65px edge and top-aligned with the item that opened it. 8px radius,
 * 8px/12px padding, --shadow-xl. Rows are 232 wide on a 12px radius, the
 * selected one 42 tall against 40 for the rest.
 *
 * Two colours are deliberately NOT copied. Live paints the selected row
 * #beddff with #1952dc text, and neither is a Dew token — they are literals
 * that happen to sit near the info ramp. A starter built on Dew should not
 * hard-code them, so this uses the semantic pair the sidebar already uses.
 */
/**
 * A rail GROUP. Eight of the fifteen rail items are groups: the icon opens a
 * flyout naming the group and listing its views, rather than being a
 * destination in itself.
 *
 * Measured on the live flyout: 258x153 seated flush against the rail's edge and
 * top-aligned with the item that opened it, 8px radius over --shadow-xl. Its
 * heading is a 37px block bled out past the panel's own 12px inset, then 8px of
 * air before the first row and 8px between rows. Rows are 232 wide on a 12px
 * radius, the selected one 42 tall against 40.
 *
 * Two colours are deliberately NOT copied. Live paints the selected row #beddff
 * with #1952dc text, and neither is a Dew token -- they are literals sitting
 * near, but not on, the info ramp. This uses the semantic pair the Knowledge
 * Base sidebar already uses.
 *
 * FIXED, not absolute. The rail scrolls, so its container carries
 * overflow-x: hidden and an absolutely positioned panel gets clipped to the
 * rail's width -- only a sliver ever paints, and it reads as a z-index problem
 * right up until elementFromPoint shows the nav on top. A fixed panel escapes
 * ancestor overflow, which holds because nothing up the tree sets a transform.
 * The cost is that the position is measured off the trigger on enter.
 */
function GroupRailItem({ item }: { item: NavSection }) {
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const { pathname } = useLocation();

  const open = (event: React.MouseEvent<HTMLDivElement>) => {
    const r = event.currentTarget.getBoundingClientRect();
    setAnchor({ x: r.right, y: r.top });
  };

  return (
    <div style={{ position: 'relative' }} onMouseEnter={open} onMouseLeave={() => setAnchor(null)}>
      {/* "More" has nothing of its own to show, so its trigger is a button. */}
      {item.groupOnly ? <RailTrigger item={item} /> : <RailItem item={item} />}
      {anchor && (
        <div
          role="menu"
          aria-label={item.label}
          style={{
            position: 'fixed',
            insetInlineStart: `${anchor.x}px`,
            top: `${anchor.y}px`,
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '258px',
            boxSizing: 'border-box',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'var(--color-fill-surface)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* 37px tall on 8px/16px padding, bled out past the panel's own 12px
              inset with a negative margin. */}
          <p
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '37px',
              boxSizing: 'border-box',
              margin: '0 -12px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
            }}
          >
            {item.label}
          </p>
          {(item.children ?? []).map((child) => {
            const to = childHref(item, child);
            const active = pathname === to;
            return (
              <Link
                key={child.id}
                to={to}
                role="menuitem"
                className={active ? undefined : 'fs-rail-flyout-row'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-100)',
                  height: active ? '42px' : '40px',
                  paddingInline: '12px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  background: active ? 'var(--color-fill-semantic-info-mildest)' : undefined,
                  fontSize: '14px',
                  fontWeight: active ? 'var(--font-weight-semi-bold)' : 400,
                  color: active ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
                }}
              >
                <Icon
                  name={child.icon}
                  size="sm"
                  color={active ? 'var(--color-icon-selected)' : 'var(--color-icon-secondary)'}
                />
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** A group trigger with no page of its own: same box as RailItem, no link. */
function RailTrigger({ item }: { item: NavSection }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      aria-label={item.label}
      aria-haspopup="menu"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex shrink-0 items-center justify-center border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-mild"
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: hovered ? 'var(--color-fill-base)' : 'transparent',
        borderColor: 'transparent',
        cursor: 'pointer',
      }}
    >
      <Icon name={item.icon} size="md" color="var(--color-icon-secondary)" />
    </button>
  );
}

function RailItem({ item }: { item: NavSection }) {
  const [hovered, setHovered] = useState(false);
  return (
    <NavLink
      to={sectionHref(item)}
      aria-label={item.label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex shrink-0 items-center justify-center border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-mild"
      style={({ isActive }) => ({
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: isActive
          ? 'var(--color-fill-semantic-info-mildest)'
          : hovered
            ? 'var(--color-fill-base)'
            : 'transparent',
        borderColor: isActive ? 'var(--color-fill-semantic-info-mild)' : 'transparent',
        cursor: 'pointer',
      })}
    >
      {({ isActive }) => (
        <Icon
          name={isActive ? item.selectedIcon : item.icon}
          size="md"
          color={isActive ? undefined : 'var(--color-icon-secondary)'}
        />
      )}
    </NavLink>
  );
}

function RailNav() {
  return (
    <nav
      aria-label="Primary"
      style={{
        display: 'flex',
        height: '100%',
        width: '64px',
        flexShrink: 0,
        flexDirection: 'column',
        alignItems: 'center',
        // Same surface as the top bar — see --fs-app-chrome in the stylesheet.
        background: 'var(--fs-app-chrome)',
      }}
    >
      <Link
        to="/"
        aria-label="Freshservice home"
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-200)',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d={freshserviceLogoPaths.p3336b800} fill="#148FCC" />
          <path d={freshserviceLogoPaths.p8eb6d80} fill="white" />
        </svg>
      </Link>

      <div
        style={{
          display: 'flex',
          width: '100%',
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-100)',
          overflowY: 'auto',
          overflowX: 'clip',
          padding: 'var(--spacing-150)',
        }}
      >
        {NAV_SECTIONS.map((item) =>
          item.children ? <GroupRailItem key={item.id} item={item} /> : <RailItem key={item.id} item={item} />
        )}
      </div>

      <div
        style={{
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-100)',
          padding: 'var(--spacing-150)',
        }}
      >
        <div
          style={{
            height: '1px',
            width: '24px',
            background: 'var(--color-boundary-border-mildest)',
          }}
        />
        <button
          type="button"
          aria-label="Freshworks switcher"
          className="flex shrink-0 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-mild"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 19.3519 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d={omniswitcherPaths.p1da8ee80} fill="#56D4AC" />
            <path d={omniswitcherPaths.p10b4c800} fill="#47D3E9" />
            <path d={omniswitcherPaths.p781b100} fill="#5DCB79" />
            <path d={omniswitcherPaths.p23490100} fill="#3785C1" />
            <path d={omniswitcherPaths.p31d89df0} fill="#41C670" />
            <path d={omniswitcherPaths.p17448000} fill="#F9B705" />
            <path d={omniswitcherPaths.p19619c40} fill="#AB6FB6" />
            <path d={omniswitcherPaths.p1840a600} fill="#E54B3B" />
            <path d={omniswitcherPaths.p3dbb6d80} fill="#EEAD0C" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

function AppTopNav() {
  // Solutions has two views behind one section id, so the top bar reads the
  // path rather than the section to tell Knowledge Base from Recommended topics.
  const { pathname: topBarPath } = useLocation();
  const onRecommendedTopics = topBarPath.endsWith('/solutions/recommended-topics');
  const onPotentialServices = topBarPath.endsWith('/it-operations/potential-services');
  const active = useFreshserviceSection();
  const ticketCode = useTicketDetailCode();
  return (
    <TopNavigation aria-label="Application">
      <TopNavigation.Left>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-150)' }}>
          {!ticketCode && active?.id !== 'agent-studio' && (
          <button
            type="button"
            aria-label="Toggle navigation"
            style={{
              width: '16px',
              height: '16px',
              padding: 0,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <mask id="appshell-menu-mask" maskUnits="userSpaceOnUse" x="1" y="1" width="14" height="14" style={{ maskType: 'alpha' }}>
                <path d={topNavSvgPaths.p3349a880} fill="#276CF0" />
              </mask>
              <g mask="url(#appshell-menu-mask)">
                <rect x="1.06667" y="1.86719" width="13.6" height="2.04688" rx="1.02344" fill="var(--color-icon-primary)" />
                <rect x="1.06667" y="6.9751" width="13.6" height="2.04688" rx="1.02344" fill="var(--color-icon-primary)" />
                <rect x="1.06667" y="12.083" width="8.76444" height="2.04688" rx="1.02344" fill="var(--color-icon-primary)" />
              </g>
            </svg>
          </button>
          )}
          {active?.id === 'agent-studio' ? null : ticketCode ? (
            <Breadcrumb
              ariaLabel="Page breadcrumb"
              /* Routes live after the "#" (hash routing), so a bare path would
                 leave the app and land on its start page instead of the list. */
              items={[{ label: 'Tickets', href: '#/freshservice/tickets' }, { label: `#${ticketCode}` }]}
            />
          ) : active?.id === 'admin' ? (
            /* Admin names the WORKSPACE, not the page — measured as a 24x24
               rounded chip carrying the workspace initials on an info-mildest
               fill, then the name at 14px/600. "IT" is Freshservice's default
               workspace, which is what a fresh account gets. */
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)' }}>
              <span
                aria-hidden
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: 'var(--border-radius-small)',
                  backgroundColor: 'var(--color-fill-semantic-info-mildest)',
                  fontSize: '12px',
                  fontWeight: 'var(--font-weight-semi-bold)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {WORKSPACE}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
                {WORKSPACE}
              </span>
            </span>
          ) : active?.id === 'dashboard' ? (
            <DashboardTopBar />
          ) : active && MODULE_VIEWS[active.id] ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', fontSize: '14px' }}>
              <span style={{ fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
                {MODULE_VIEWS[active.id].module}
              </span>
              <span style={{ color: 'var(--color-text-secondary)' }}>-</span>
              {/* One section, two views: the catalogue and its potential
                  services. The view half reads the path. */}
              <span style={{ color: 'var(--color-text-primary)' }}>
                {onPotentialServices ? POTENTIAL_TITLE : MODULE_VIEWS[active.id].view}
              </span>
            </span>
          ) : active?.id === 'solutions' ? (
            /* Solutions names the VIEW it is showing, not the section, and does
               it in secondary rather than primary — measured at 14px/600
               #485a68, where Tickets and Admin both use #12334c. Recommended
               topics adds a sparkle and a Beta tag; Knowledge Base has neither. */
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)' }}>
              {onRecommendedTopics && <Icon name="Ai" size="md" color="var(--color-icon-selected)" />}
              <span style={{ fontSize: '14px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-secondary)' }}>
                {onRecommendedTopics ? TOPICS_TITLE : KB_TITLE}
              </span>
              {onRecommendedTopics && <Tag variant="yellow">{TOPICS_BETA}</Tag>}
            </span>
          ) : (
            <Breadcrumb
              ariaLabel="Page breadcrumb"
              items={[{ label: 'Freshservice', href: '#' }, { label: active?.label ?? 'Freshservice' }]}
            />
          )}
        </div>
      </TopNavigation.Left>
      <TopNavigation.Right
        search={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '32px',
              flex: '1 1 auto',
              width: '380px',
              maxWidth: '100%',
              minWidth: '120px',
              padding: '0 8px',
              background: 'var(--color-fill-surface)',
              border: '1px solid var(--color-boundary-border-mildest)',
              borderRadius: '8px',
            }}
          >
            <div style={{ position: 'relative', width: '24px', height: '24px', flexShrink: 0 }}>
              <div style={{ position: 'absolute', inset: '20.83% 19.17% 19.17% 20.83%' }}>
                <svg width="100%" height="100%" viewBox="0 0 14.4 14.4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d={topNavSvgPaths.p5c1a800}
                    fill="var(--color-icon-primary)"
                  />
                </svg>
              </div>
            </div>
            <input
              type="text"
              aria-label="Global search"
              placeholder="Search"
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '14px',
                lineHeight: '20px',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--base-font-family)',
              }}
            />
            <span
              aria-hidden
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 6px',
                borderRadius: '4px',
                background: 'var(--color-fill-container)',
                color: 'var(--color-text-secondary)',
                fontSize: '14px',
                lineHeight: '20px',
                flexShrink: 0,
              }}
            >
              /
            </span>
          </div>
        }
        buttons={
          <TextButton variant="secondary" prefixIcon="CirclePlus">
            Create
          </TextButton>
        }
        icons={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)' }}>
            <button
              type="button"
              aria-label="Help"
              style={{
                width: '20px',
                height: '20px',
                padding: 0,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name="Help" size="md" color="var(--color-icon-secondary)" />
            </button>
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <button
                type="button"
                aria-label="Notifications"
                style={{
                  width: '20px',
                  height: '20px',
                  padding: 0,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name="Notification" size="md" color="var(--color-icon-secondary)" />
              </button>
              <Badge style={{ position: 'absolute', top: '0', right: '0' }} />
            </div>
            <button
              type="button"
              aria-label="Marketplace"
              style={{
                width: '20px',
                height: '20px',
                padding: 0,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name="Marketplace" size="md" color="var(--color-icon-secondary)" />
            </button>
          </div>
        }
        avatar={<ProfileMenu />}
      />
    </TopNavigation>
  );
}

/** The profile icon opens the account menu; Theme lives here, as in the Dew starter pack. */
function ProfileMenu() {
  const mode = useThemeMode();
  const option = (value: ThemeMode, label: string): IMenuOption => ({
    value,
    label,
    suffixIcon: mode === value ? 'Tick' : undefined,
  });
  return (
    <Menu
      aria-label="Profile and settings"
      options={[
        {
          label: 'Theme',
          options: [option('light', 'Light'), option('dark', 'Dark'), option('system', 'System default')],
        },
      ]}
      onClick={(picked: IMenuOption) => setThemeMode(picked.value as ThemeMode)}
      slots={{
        trigger: (
          <button
            type="button"
            aria-label="Profile and theme"
            style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', display: 'inline-flex', borderRadius: '50%' }}
          >
            <Avatar name="Sam Taylor" imageUrl={agentAvatar} size="sm" shape="round" colorVariant="info" />
          </button>
        ),
      }}
    />
  );
}

function MainContent() {
  const active = useFreshserviceSection();
  // The product has no page-title row in these modules. Tickets names itself
  // in the top bar (list) or the breadcrumb (detail); Admin leads straight
  // into its search band. Either way a second title is duplicated chrome.
  const hideTitleRow =
    active?.id === 'tickets' ||
    active?.id === 'admin' ||
    active?.id === 'agent-studio' ||
    active?.id === 'dashboard' ||
    active?.id === 'solutions' ||
    active?.id === 'assets' ||
    active?.id === 'reports-insights' ||
    active?.id === 'changes' ||
    active?.id === 'problems' ||
    active?.id === 'it-operations';
  // Sections that lay themselves out edge to edge — a full-height side panel
  // cannot sit inside the outlet's padding.
  const isFullBleed =
    active?.id === 'agent-studio' ||
    active?.id === 'tickets' ||
    active?.id === 'solutions' ||
    active?.id === 'assets' ||
    active?.id === 'reports-insights' ||
    active?.id === 'changes' ||
    active?.id === 'problems' ||
    active?.id === 'it-operations';

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        background: 'var(--color-fill-surface)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        marginRight: '5px',
        border: '1px solid var(--color-boundary-border-mildest)',
      }}
    >
      {!hideTitleRow && (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 32px',
          borderBottom: '1px solid var(--color-boundary-border-mild)',
          background: 'var(--color-fill-surface)',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-150)' }}>
          <h1
            style={{
              margin: 0,
              fontSize: '16px',
              lineHeight: '24px',
              fontWeight: 'var(--font-weight-semi-bold)',
              color: 'var(--color-text-primary)',
            }}
          >
            {active?.label ?? 'Freshservice'}
          </h1>
          <Tag variant="gray">Prototype</Tag>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-150)' }}>
          <TextButton variant="primary" prefixIcon="CirclePlus" size="default">
            Create
          </TextButton>
          <IconButton iconName="MoreVertical" aria-label="More options" size="default" />
        </div>
      </div>
      )}

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: isFullBleed ? 'hidden' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          padding: isFullBleed ? 0 : 'var(--spacing-300)',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default function Freshservice() {
  useThemeMode();

  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      const first = args[0];
      if (
        typeof first === 'string' &&
        first.includes('The `render` prop received a function named') &&
        first.includes('that starts with an uppercase letter')
      ) {
        return;
      }
      originalWarn(...args);
    };
    return () => {
      console.warn = originalWarn;
    };
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100vh',
        width: '100%',
        background: 'var(--color-fill-container)',
        fontFamily: 'var(--base-font-family)',
        color: 'var(--color-text-primary)',
        display: 'flex',
      }}
    >
      <RailNav />
      <div style={{ display: 'flex', minWidth: 0, flex: 1, flexDirection: 'column' }}>
        <AppTopNav />
        <div style={{ display: 'flex', minHeight: 0, flex: 1, background: 'transparent' }}>
          <MainContent />
          <div id={SIDE_DOCK_ID} style={{ display: 'contents' }} />
        </div>
      </div>
    </div>
  );
}
