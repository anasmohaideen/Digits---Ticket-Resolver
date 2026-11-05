import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { sortRows } from '../sortRows';
import { Avatar, Checkbox, Icon, IconButton, Menu, Select, Table, Tag, TextButton } from '@freshworks/dew-components';
import ExportTicketsSheet from './ExportTicketsSheet';
import ViewControls from './ViewControls';
import ViewSwitcher from './ViewSwitcher';
import { VIEW_TICKETS, ticketHref } from './ticketViews';
import { DIGIT_AVATAR, DIGIT_AVATAR_MAX_PX, DIGIT_AVATAR_STYLE } from './details/details.tokens';
import AssignPicker from './AssignPicker';
import HandOverDialog from './HandOverDialog';
import {
  AGENTS,
  COLUMN_FIELDS,
  DEFAULT_COLUMNS,
  FILTER_FACETS,
  MANDATORY_COLUMNS,
  PERIOD_PLACEHOLDER,
  PRIORITIES,
  PRIORITY_COLOR,
  SORTABLE_KEYS,
  SORT_FIELDS,
  STATES,
  STATE_VARIANT,
  STATUSES,
  initials
} from './tickets.data';
import type { Agent, Priority, Status, Ticket } from './tickets.data';

/**
 * Structural stand-ins for the two table types. Dew re-exports both from
 * TanStack, but only through a subpath TypeScript will not resolve, and
 * type-importing @tanstack/react-table directly would mean depending on a
 * package this repo does not declare. These shapes are assignable to what
 * Table expects, and cost the project no new dependency.
 */
type SortingState = { id: string; desc: boolean }[];

type ColumnDef<T> = {
  id: string;
  accessorKey?: Extract<keyof T, string>;
  header: string;
  size?: number;
  cell?: (context: { row: { original: T } }) => React.ReactNode;
};

/** What the sidebar is editing. The table reads the applied copy, not this. */
export type FilterDraft = {
  facets: Record<string, string[]>;
  selects: Record<string, string[]>;
};

export const EMPTY_DRAFT: FilterDraft = { facets: {}, selects: {} };

export type Condition = {
  field: 'status' | 'priority' | 'state' | 'assignee';
  /** A list, because the product shows values as removable chips: "Agent
      includes [Unassigned x] [Me x]". */
  values: string[];
};

/**
 * Structural match for Dew's IField. Declared here rather than imported: Dew
 * re-exports the type only from a subpath TypeScript will not resolve, and the
 * index signature makes the shape assignable either way. That signature also
 * carries `locked` and `editable`, which Dew reads to mark a column mandatory.
 */
type ColumnField = {
  [key: string]: unknown;
  id: string;
  name: string;
  label: string;
  checked?: boolean;
  position?: number;
};

/* ------------------------------------------------------------------ */
/* Cell editors                                                        */
/*                                                                     */
/* Status, Priority and Assigned-to are edited IN the row rather than  */
/* on a detail page — that is how the product behaves, and it is the   */
/* reason these are Selects and not text. Each writes back through     */
/* onChange so the table is genuinely stateful.                        */
/* ------------------------------------------------------------------ */

function InlineSelect<T extends string>({
  value,
  values,
  onChange,
  ariaLabel,
  dot,
  icon
}: {
  value: T;
  values: readonly T[];
  onChange: (next: T) => void;
  ariaLabel: string;
  dot?: (value: T) => string;
  /** An avatar for a value, shown in the list and, for the chosen value, in the trigger. */
  icon?: (value: T) => ReactNode;
}) {
  const options = useMemo(
    () =>
      values.map((option) => ({
        value: option,
        label: option,
        startIcon: icon?.(option) ?? (dot ? <ColorDot color={dot(option)} /> : undefined)
      })),
    [values, dot, icon]
  );
  /* Dew draws an option's startIcon in the list but not on the trigger, so the
     chosen value's avatar sits over the trigger's start padding. It ignores
     the pointer, so the trigger still takes every click. */
  const leading = icon?.(value);

  /* Borderless at rest, as in production; the pill shows on hover and focus. */
  return (
    <span className={`tr-list-inline-select${leading ? ' has-leading' : ''}`}>
      <Select
        aria-label={ariaLabel}
        options={options}
        value={options.find((option) => option.value === value) ?? null}
        onValueChange={(next) => {
          if (next) onChange(next.value as T);
        }}
      />
      {/* After the Select, so it paints over its own trigger without a z-index
          that would also lift it over another row's open list. */}
      {leading && <span className="tr-list-inline-select-leading" aria-hidden>{leading}</span>}
    </span>
  );
}

/** Ticket Resolver is the one assignee with an avatar in the list: its own artwork, 20px max. */
function agentAvatar(agent: Agent): ReactNode {
  if (agent !== 'Ticket Resolver') return undefined;
  const artwork = DIGIT_AVATAR['ticket-resolver'];
  return artwork ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: DIGIT_AVATAR_MAX_PX, height: DIGIT_AVATAR_MAX_PX }}>
      <img src={artwork} alt="" style={DIGIT_AVATAR_STYLE} />
    </span>
  ) : undefined;
}

function ColorDot({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: 'var(--border-radius-2xsmall)',
        backgroundColor: color
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Bulk actions                                                        */
/*                                                                     */
/* Selecting rows REPLACES the toolbar's left half in the real product */
/* — sort-by disappears and these take its place. Dew's Table drives   */
/* that swap for us via the bulkActionsToolbar slot.                   */
/* ------------------------------------------------------------------ */

const BULK_ACTIONS = ['Pick up', 'Assign to', 'Bulk update', 'Merge', 'Execute scenario'];

/**
 * The five visible actions are followed by a More overflow — a 32x32 trigger
 * holding the three destructive-ish ones, which the product keeps out of the
 * bar rather than in it.
 */
const BULK_MORE_ACTIONS = ['Close', 'Mark as spam', 'Delete'];

function BulkActionsToolbar({
  selectedRows,
  resetSelection
}: {
  selectedRows: Ticket[];
  resetSelection: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginInlineEnd: 'var(--spacing-100)' }}>
        {selectedRows.length} selected
      </span>
      {BULK_ACTIONS.map((action) => (
        <TextButton key={action} type="button" variant="secondary" size="default" onClick={resetSelection}>
          {action}
        </TextButton>
      ))}
      <Menu
        aria-label="More bulk actions"
        options={BULK_MORE_ACTIONS.map((action) => ({ value: action, label: action }))}
        onClick={resetSelection}
        slots={{
          trigger: (
            <IconButton iconName="MoreHorizontal" aria-label="More button" size="default" />
          )
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Filter sidebar                                                      */
/* ------------------------------------------------------------------ */

/**
 * A checkbox facet. The product renders these as a real checkbox group
 * (measured: each group carries class `checkbox-group`), not as pill toggles,
 * so this uses Dew's Checkbox and drops the hand-rolled buttons that were here.
 */
function CheckboxFacet({
  label,
  options,
  active,
  onToggle
}: {
  label: string;
  options: readonly string[];
  active: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-050)' }}>
      <legend style={FACET_LABEL}>{label}</legend>
      {options.map((option) => (
        <Checkbox
          key={option}
          checked={active.includes(option)}
          onChange={() => onToggle(option)}
          label={option}
        />
      ))}
    </fieldset>
  );
}

/**
 * A select facet. These are MULTI-selects in the product: the "Remove
 * Unassigned" / "Remove Me" buttons in a live sidebar are the chips a
 * multi-select draws for its chosen values, inside the Agents field — not a
 * separate applied-filters bar, which is what they look like from the outside.
 *
 * On a real account most of them sit empty, so an empty select is the faithful
 * resting state rather than a gap.
 */
function SelectFacet({
  label,
  options,
  values,
  onChange,
  placeholder
}: {
  label: string;
  options?: readonly string[];
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const opts = (options ?? []).map((option) => ({ value: option, label: option }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-050)' }}>
      <span style={FACET_LABEL}>{label}</span>
      <Select
        multiple
        aria-label={label}
        options={opts}
        placeholder={placeholder ?? 'Select'}
        value={opts.filter((o) => values.includes(o.value))}
        onValueChange={(next) => onChange(next.map((o) => o.value as string))}
      />
    </div>
  );
}

const FACET_LABEL: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text-secondary)',
  padding: 0
};

/**
 * Advanced filter, measured against the product rather than sketched.
 *
 * The structure that matters, and what the first pass had wrong:
 *
 *   - A description sits under the toggle, and there is no Filters/Clear
 *     header in this mode.
 *   - The match control is ONE pill carrying the whole sentence — "Match ALL
 *     of the below conditions" — not the word Match, a bare ALL dropdown, and
 *     a trailing fragment.
 *   - A condition row reads ACROSS: a grey chip naming the field, the plain
 *     word "includes", then the values as removable chips. It was stacked
 *     vertically as three full-width controls.
 *   - The two icons carry colour and are the point of the row: a RED
 *     circle-minus removes, a GREEN circle-plus adds. Both were rendering
 *     mono, because colour set on a wrapping button does not reach a Dew Icon
 *     — it takes a `color` prop.
 *   - "Add association" sits below the card and was missing.
 *
 * Note every `fill-neutral` token is a DARK navy in the light theme, so the
 * chips take `--color-fill-container` for their grey.
 */
function AdvancedFilter({
  match,
  onMatchChange,
  conditions,
  onChange
}: {
  match: 'all' | 'any';
  onMatchChange: (m: 'all' | 'any') => void;
  conditions: Condition[];
  onChange: (next: Condition[]) => void;
}) {
  const fieldOptions = [
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'state', label: 'State' },
    { value: 'assignee', label: 'Agent' }
  ];
  const valuesFor = (field: Condition['field']): readonly string[] =>
    field === 'status' ? STATUSES : field === 'priority' ? PRIORITIES : field === 'state' ? STATES : AGENTS;

  const patchRow = (i: number, changes: Partial<Condition>) =>
    onChange(conditions.map((c, idx) => (idx === i ? { ...c, ...changes } : c)));

  const matchOptions = [
    { value: 'all', label: 'Match ALL of the below conditions' },
    { value: 'any', label: 'Match ANY of the below conditions' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
      <p style={{ margin: 0, fontSize: '14px', lineHeight: '20px', color: 'var(--color-text-secondary)' }}>
        Conditional form filter allow to apply complex criteria and conditions to filter data
      </p>

      <div style={{ alignSelf: 'flex-start' }}>
        <Select
          aria-label="Match all or any condition"
          options={matchOptions}
          value={matchOptions.find((o) => o.value === match) ?? null}
          onValueChange={(next) => next && onMatchChange(next.value as 'all' | 'any')}
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-200)',
          padding: 'var(--spacing-200)',
          backgroundColor: 'var(--color-fill-surface)',
          border: '1px solid var(--color-boundary-border-mildest)',
          borderRadius: 'var(--border-radius-medium)'
        }}
      >
        <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>
          Filter by <strong style={{ fontWeight: 'var(--font-weight-semi-bold)' }}>Ticket fields</strong>
        </span>

        {conditions.map((condition, i) => {
          const options = valuesFor(condition.field).map((v) => ({ value: v, label: v }));
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-150)' }}>
              <button
                type="button"
                aria-label={`Remove condition ${i + 1}`}
                onClick={() => onChange(conditions.filter((_, idx) => idx !== i))}
                style={ICON_BUTTON}
              >
                <Icon name="CircleMinus" size="md" color="var(--color-icon-semantic-error)" />
              </button>

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-150)',
                  padding: 'var(--spacing-100)',
                  border: '1px solid var(--color-boundary-border-mildest)',
                  borderRadius: 'var(--border-radius-small)'
                }}
              >
                <Menu
                  aria-label={`Field for condition ${i + 1}`}
                  options={fieldOptions}
                  onClick={(option) => {
                    const field = option.value as Condition['field'];
                    patchRow(i, { field, values: [] });
                  }}
                  slots={{
                    trigger: (
                      <button type="button" style={FIELD_CHIP}>
                        {fieldOptions.find((f) => f.value === condition.field)?.label}
                      </button>
                    )
                  }}
                />
                <span style={{ fontSize: '14px', color: 'var(--color-text-primary)', flexShrink: 0 }}>includes</span>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <Select
                    multiple
                    aria-label={`Values for condition ${i + 1}`}
                    options={options}
                    placeholder="Select"
                    value={options.filter((o) => condition.values.includes(o.value))}
                    onValueChange={(next) => patchRow(i, { values: next.map((o) => o.value as string) })}
                  />
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => onChange([...conditions, { field: 'status', values: [] }])}
          style={LINK_WITH_ICON}
        >
          <Icon name="CirclePlus" size="md" color="var(--color-icon-semantic-success)" />
          Add
        </button>
      </div>

      <button type="button" style={{ ...LINK_WITH_ICON, fontWeight: 'var(--font-weight-semi-bold)' }}>
        <Icon name="CirclePlus" size="md" color="var(--color-icon-semantic-success)" />
        Add association
      </button>
    </div>
  );
}

const ICON_BUTTON: React.CSSProperties = {
  flexShrink: 0,
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  display: 'flex'
};

/** Grey chip naming the field. `fill-container`, never `fill-neutral` — that
    one is a dark navy in the light theme. */
const FIELD_CHIP: React.CSSProperties = {
  flexShrink: 0,
  padding: 'var(--spacing-050) var(--spacing-100)',
  backgroundColor: 'var(--color-fill-container)',
  border: 'none',
  borderRadius: 'var(--border-radius-xsmall)',
  fontSize: '14px',
  fontWeight: 'var(--font-weight-semi-bold)',
  color: 'var(--color-text-primary)',
  cursor: 'pointer'
};

const LINK_WITH_ICON: React.CSSProperties = {
  alignSelf: 'flex-start',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-100)',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  fontSize: '14px',
  color: 'var(--color-text-brand)'
};

/**
 * Basic / Advanced segmented toggle. Measured off the product: a 352x40
 * bordered container with 6/4 padding holding two 32px segments; the selected
 * one takes the brand tint, a mild info border and a small shadow rather than
 * a filled background.
 */
function FilterModeToggle({
  mode,
  onChange
}: {
  mode: 'basic' | 'advanced';
  onChange: (mode: 'basic' | 'advanced') => void;
}) {
  const segment = (active: boolean) => ({
    flex: 1,
    height: '32px',
    padding: '2px 12px',
    fontSize: '12px',
    lineHeight: '18px',
    fontWeight: active ? 'var(--font-weight-semi-bold)' : 'var(--font-weight-regular)',
    color: active ? 'var(--color-text-brand)' : 'var(--color-text-primary)',
    backgroundColor: active ? 'var(--color-fill-semantic-info-mildest)' : 'transparent',
    border: active ? '1px solid var(--color-boundary-semantic-info-mild)' : '1px solid transparent',
    borderRadius: 'var(--border-radius-xsmall)',
    boxShadow: active ? 'var(--shadow-xs)' : 'none',
    cursor: 'pointer'
  });

  return (
    <div
      role="tablist"
      aria-label="Filter mode"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-200)',
        padding: '6px 4px',
        backgroundColor: 'var(--color-fill-surface)',
        border: '1px solid var(--color-boundary-border-mildest)',
        borderRadius: 'var(--border-radius-medium)'
      }}
    >
      <button type="button" role="tab" aria-selected={mode === 'basic'} onClick={() => onChange('basic')} style={segment(mode === 'basic')}>
        Basic filter
      </button>
      <button type="button" role="tab" aria-selected={mode === 'advanced'} onClick={() => onChange('advanced')} style={segment(mode === 'advanced')}>
        Advanced filter
      </button>
    </div>
  );
}

/**
 * Basic filter. The real product also offers an Advanced mode building
 * condition rows (field / operator / value) joined by ALL or ANY — worth adding
 * next; this covers the facets people reach for first.
 */
/**
 * The Basic filter renders every one of the product's nineteen groups, in its
 * order, using the control kind each one actually uses. Ten of them filter
 * real data; the rest are selects with nothing chosen, which is exactly how
 * they sit on a live account.
 *
 * Filters STAGE. Verified against the live product: ticking Priority > Urgent
 * on a view of four Low-priority tickets left all four rows on screen, and the
 * list only changes when Apply is pressed. So the sidebar edits a draft and
 * the table reads the applied set — which is why Apply exists at all, pinned
 * to the bottom of the panel.
 */
export function FilterSidebar({
  draft,
  onDraftChange,
  onApply,
  onClear,
  activeCount,
  mode,
  onModeChange,
  match,
  onMatchChange,
  conditions,
  onConditionsChange
}: {
  draft: FilterDraft;
  onDraftChange: (next: FilterDraft) => void;
  onApply: () => void;
  onClear: () => void;
  activeCount: number;
  mode: 'basic' | 'advanced';
  onModeChange: (mode: 'basic' | 'advanced') => void;
  match: 'all' | 'any';
  onMatchChange: (m: 'all' | 'any') => void;
  conditions: Condition[];
  onConditionsChange: (next: Condition[]) => void;
}) {
  const toggleFacet = (facetId: string, value: string) => {
    const current = draft.facets[facetId] ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onDraftChange({ ...draft, facets: { ...draft.facets, [facetId]: next } });
  };

  const setSelect = (facetId: string, values: string[]) =>
    onDraftChange({ ...draft, selects: { ...draft.selects, [facetId]: values } });

  return (
    <aside
      aria-label="Filters"
      style={{
        // Measured: the product's filter sidebar is 416px, not the 280 a
        // sidebar 'feels like'. The segmented toggle needs the room.
        width: '416px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-fill-container)',
        borderInlineStart: '1px solid var(--color-boundary-divider)',
        minHeight: 0
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-300)',
          padding: 'var(--spacing-300)'
        }}
      >
        <FilterModeToggle mode={mode} onChange={onModeChange} />

        {/* Advanced leads with its own description instead of this header,
            which is how the product lays the two modes out. */}
        {mode === 'basic' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
              Filters{activeCount > 0 ? ` (${activeCount})` : ''}
            </h3>
            <TextButton type="button" variant="link" size="mini" disabled={activeCount === 0} onClick={onClear}>
              Clear
            </TextButton>
          </div>
        )}

        {mode === 'basic' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-300)' }}>
            {FILTER_FACETS.map((facet) =>
              facet.kind === 'checkbox' ? (
                <CheckboxFacet
                  key={facet.id}
                  label={facet.label}
                  options={facet.options ?? []}
                  active={draft.facets[facet.id] ?? EMPTY_LIST}
                  onToggle={(value) => toggleFacet(facet.id, value)}
                />
              ) : (
                <SelectFacet
                  key={facet.id}
                  label={facet.label}
                  options={facet.options}
                  values={draft.selects[facet.id] ?? EMPTY_LIST}
                  onChange={(values) => setSelect(facet.id, values)}
                  placeholder={facet.kind === 'period' ? PERIOD_PLACEHOLDER : 'Select'}
                />
              )
            )}
          </div>
        ) : (
          <AdvancedFilter
            match={match}
            onMatchChange={onMatchChange}
            conditions={conditions}
            onChange={onConditionsChange}
          />
        )}
      </div>

      {/* Pinned footer. Measured at the bottom-right of the live panel, and
          enabled even with nothing pending — so it is not gated here either. */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'flex-end',
          padding: 'var(--spacing-200) var(--spacing-300)',
          borderBlockStart: '1px solid var(--color-boundary-divider)'
        }}
      >
        <TextButton type="button" variant="primary" onClick={onApply}>
          Apply
        </TextButton>
      </div>
    </aside>
  );
}

const EMPTY_LIST: string[] = [];

/** Dew renders the multi-select checkbox column itself; measured at 56px. */
const SELECT_COLUMN_WIDTH = 56;

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

/**
 * The product ships TWO empty states, not one, and the wording of both is
 * lifted from its own strings rather than written fresh:
 *
 *   nothing in this view   "You don't have anything to see in this view."
 *                          then: View [New & Open Tickets] or [All Tickets]
 *   nothing at all         "Great going! You're done with all your tickets!"
 *                          then: [New Ticket]
 *
 * The branch is `showCreateTicketEmptyState` in the product; here it is
 * whether any ticket exists behind the filters at all. The two links would
 * switch saved view — this prototype has one, so they clear the filters,
 * which lands on the same place the product's "All Tickets" would.
 */
function NoTickets({ hasAnyTickets, onClearFilters }: { hasAnyTickets: boolean; onClearFilters: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-100)',
        padding: 'var(--spacing-600) var(--spacing-300)',
        textAlign: 'center'
      }}
    >
      {/* The product draws empty-tickets.svg here; Dew's own icon stands in. */}
      <Icon name="Tickets" size="xl" />

      {hasAnyTickets ? (
        <>
          <p style={EMPTY_MSG}>You don&apos;t have anything to see in this view.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-050)' }}>
            <span style={EMPTY_SUB}>View</span>
            <TextButton type="button" variant="link" size="mini" onClick={onClearFilters}>
              New &amp; Open Tickets
            </TextButton>
            <span style={EMPTY_SUB}>or</span>
            <TextButton type="button" variant="link" size="mini" onClick={onClearFilters}>
              All Tickets
            </TextButton>
          </div>
        </>
      ) : (
        <>
          <p style={EMPTY_MSG}>Great going! You&apos;re done with all your tickets!</p>
          <TextButton type="button" variant="link" size="mini" prefixIcon="Plus">
            New Ticket
          </TextButton>
        </>
      )}
    </div>
  );
}

const EMPTY_MSG: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
  fontWeight: 'var(--font-weight-semi-bold)',
  color: 'var(--color-text-primary)'
};

const EMPTY_SUB: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--color-text-secondary)'
};

/* ------------------------------------------------------------------ */
/* Sort by                                                             */
/*                                                                     */
/* One menu holding both the field and the direction, which is how the */
/* product does it — 23 sortable fields then Ascending / Descending.    */
/* The field list is deliberately NOT the column list: Assigned to and  */
/* State are columns you cannot sort by, and Department and Source are  */
/* sortable without being default columns.                             */
/* ------------------------------------------------------------------ */

export function SortMenu({
  field,
  direction,
  onChange
}: {
  field: string;
  direction: 'asc' | 'desc';
  onChange: (field: string, direction: 'asc' | 'desc') => void;
}) {
  const options = [
    { label: 'Sort by', options: SORT_FIELDS.map((f) => ({ value: 'f:' + f, label: f })) },
    {
      label: 'Order',
      showDivider: true,
      options: [
        { value: 'd:asc', label: 'Ascending' },
        { value: 'd:desc', label: 'Descending' }
      ]
    }
  ];

  return (
    <Menu
      aria-label="Sort tickets"
      options={options}
      onClick={(option) => {
        const [kind, value] = option.value.split(':');
        if (kind === 'f') onChange(value, direction);
        else onChange(field, value as 'asc' | 'desc');
      }}
      slots={{
        trigger: (
          <TextButton type="button" variant="link" size="default" suffixIcon="ChevronDown">
            {`Sort by: ${field}`}
          </TextButton>
        )
      }}
    />
  );
}

/** The three tickets this prototype opens; every view lists the same three. */
const PROTOTYPE_TICKETS = VIEW_TICKETS;

/**
 * The tickets a filter lets through. Advanced replaces the facets rather than
 * stacking with them — the two modes are alternatives in the product, not
 * layers. Shared by the table and the split view's list.
 */
export function filterTickets(
  tickets: Ticket[],
  { applied, filterMode, conditions, match }: {
    applied: FilterDraft;
    filterMode: 'basic' | 'advanced';
    conditions: Condition[];
    match: 'all' | 'any';
  }
): Ticket[] {
  if (filterMode === 'advanced') {
    if (conditions.length === 0) return tickets;
    // An empty condition constrains nothing, rather than emptying the list
    // while someone is still choosing its values.
    const test = (t: Ticket, c: Condition) =>
      c.values.length === 0 || c.values.includes(String(t[c.field]));
    return tickets.filter((t) =>
      match === 'all' ? conditions.every((c) => test(t, c)) : conditions.some((c) => test(t, c))
    );
  }
  // Every facet narrows, and only the ten wired to a ticket field can. The
  // rest are rendered because the product renders them; selecting nothing in
  // them is the resting state, so they never exclude a row.
  return tickets.filter((ticket) =>
    FILTER_FACETS.every((facet) => {
      if (!facet.field) return true;
      const chosen =
        facet.kind === 'checkbox' ? applied.facets[facet.id] : applied.selects[facet.id];
      return !chosen || chosen.length === 0 || chosen.includes(String(ticket[facet.field]));
    })
  );
}

/** Sort-menu order. Only four fields map onto data the prototype holds. */
export function sortTickets(tickets: Ticket[], field: string, direction: 'asc' | 'desc'): Ticket[] {
  const key = SORTABLE_KEYS[field];
  if (!key) return tickets;
  const sorted = [...tickets].sort((a, b) => String(a[key]).localeCompare(String(b[key])));
  return direction === 'asc' ? sorted : sorted.reverse();
}

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>(PROTOTYPE_TICKETS);
  /** A change to a ticket Ticket Resolver is working on, waiting on the take-over confirmation. */
  const [handOver, setHandOver] = useState<{ id: string; changes: Partial<Ticket> } | undefined>();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [sortField, setSortField] = useState('Created Date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 30 });
  const [selectedIds, setSelectedIds] = useState<Set<Ticket['id']>>(new Set());
  // Two copies, because the product stages: the sidebar edits `draft` and the
  // table reads `applied`. Apply is what moves one onto the other.
  const [draft, setDraft] = useState<FilterDraft>(EMPTY_DRAFT);
  const [applied, setApplied] = useState<FilterDraft>(EMPTY_DRAFT);
  const [showFilters, setShowFilters] = useState(true);
  // Columns redistribute to fill whatever width is going — measured on the
  // product, where the same six columns came back 390/200/136/120/144/220 at a
  // 1250px table and 407/217/153/136/161/237 at 1351. Closing the filter panel
  // gives back 416px, and the table has to take it rather than leave it blank.
  const [tableWrapEl, setTableWrapEl] = useState<HTMLDivElement | null>(null);
  const [wrapWidth, setWrapWidth] = useState(0);
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});
  const [filterMode, setFilterMode] = useState<'basic' | 'advanced'>('basic');
  const [match, setMatch] = useState<'all' | 'any'>('all');
  const [conditions, setConditions] = useState<Condition[]>([{ field: 'status', values: ['Open'] }]);
  const [exportOpen, setExportOpen] = useState(false);
  const [density, setDensity] = useState<'default' | 'compact'>('default');
  // Mirrors the real Customize columns panel: 31 available, six on by default.
  const [fields, setFields] = useState<ColumnField[]>(() =>
    COLUMN_FIELDS.map((f, i) => {
      const mandatory = (MANDATORY_COLUMNS as readonly string[]).includes(f.id);
      return {
        ...f,
        name: f.label,
        position: i,
        checked: (DEFAULT_COLUMNS as readonly string[]).includes(f.id),
        // Dew derives the customizer's two locks from these: `locked` makes a
        // column non-removable from the reorder list, `editable: false` makes
        // its checkbox non-interactive. Subject and Requester need both.
        locked: mandatory,
        editable: !mandatory
      };
    })
  );
  // Dew's Table takes a component, not an element, so the two props are bound
  // here. Memoised on what it actually reads, or the table remounts every keystroke.
  const emptyState = useMemo(
    () => () => <NoTickets hasAnyTickets={tickets.length > 0} onClearFilters={clearFilters} />,
    [tickets.length]
  );

  useEffect(() => {
    if (!tableWrapEl) return;
    const observer = new ResizeObserver(([entry]) => setWrapWidth(entry.contentRect.width));
    observer.observe(tableWrapEl);
    return () => observer.disconnect();
  }, [tableWrapEl]);

  const activeColumnIds = useMemo(
    () => new Set(fields.filter((f) => f.checked).map((f) => f.id)),
    [fields]
  );

  const clearFilters = () => {
    setDraft(EMPTY_DRAFT);
    setApplied(EMPTY_DRAFT);
    setConditions([]);
  };

  const patch = (id: string, changes: Partial<Ticket>) =>
    setTickets((rows) => rows.map((row) => (row.id === id ? { ...row, ...changes } : row)));
  /* Any change to a ticket Ticket Resolver is working on asks first; going ahead
     unassigns it (unless the change itself names a new assignee). */
  const change = (row: Ticket, changes: Partial<Ticket>) => {
    if (row.assignee !== 'Ticket Resolver') {
      patch(row.id, changes);
      return;
    }
    setHandOver({ id: row.id, changes: { assignee: 'None', ...changes } });
  };

  const activeFilterCount =
    filterMode === 'advanced'
      ? conditions.length
      : Object.values(applied.facets).reduce((n, list) => n + list.length, 0) +
        Object.values(applied.selects).reduce((n, list) => n + list.length, 0);

  const visible = useMemo(
    () => filterTickets(tickets, { applied, filterMode, conditions, match }),
    [tickets, applied, filterMode, conditions, match]
  );

  /** Sort menu drives the order. */
  const rows = useMemo(() => sortTickets(visible, sortField, sortDir), [visible, sortField, sortDir]);

  const allColumns = useMemo<ColumnDef<Ticket>[]>(
    () => [
      {
        id: 'subject',
        accessorKey: 'subject',
        header: 'Subject',
        size: 380,
        cell: ({ row }) => (
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', minWidth: 0 }}>
            <Link
              to={ticketHref(row.original)}
              style={{ color: 'var(--color-text-primary)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {row.original.subject}
            </Link>
            <span style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }}>#{row.original.code}</span>
          </span>
        )
      },
      {
        id: 'requester',
        accessorKey: 'requester',
        header: 'Requester',
        size: 200,
        cell: ({ row }) => (
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', minWidth: 0 }}>
            <Avatar size="xxs" imageUrl={row.original.requesterAvatarUrl} initials={initials(row.original.requester).slice(0, 1)} name={row.original.requester} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.original.requester}
            </span>
          </span>
        )
      },
      {
        id: 'state',
        accessorKey: 'state',
        header: 'State',
        size: 130,
        cell: ({ row }) => <Tag variant={STATE_VARIANT[row.original.state]}>{row.original.state}</Tag>
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        size: 150,
        cell: ({ row }) => (
          <InlineSelect<Status>
            ariaLabel={`Status for ${row.original.code}`}
            value={row.original.status}
            values={STATUSES}
            onChange={(status) => change(row.original, { status })}
          />
        )
      },
      {
        id: 'priority',
        accessorKey: 'priority',
        header: 'Priority',
        size: 150,
        cell: ({ row }) => (
          <InlineSelect<Priority>
            ariaLabel={`Priority for ${row.original.code}`}
            value={row.original.priority}
            values={PRIORITIES}
            dot={(p) => PRIORITY_COLOR[p]}
            onChange={(priority) => change(row.original, { priority })}
          />
        )
      },
      {
        id: 'assignee',
        accessorKey: 'assignee',
        header: 'Assigned to',
        size: 190,
        cell: ({ row }) => (
          <AssignPicker
            ariaLabel={`Assignee for ${row.original.code}`}
            value={{ agent: row.original.assignee, group: row.original.group }}
            leading={agentAvatar(row.original.assignee)}
            onChange={(next) => change(row.original, { assignee: next.agent, group: next.group })}
          />
        )
      }
    ],
    []
  );

  const columns = useMemo(
    () => allColumns.filter((c) => activeColumnIds.has(String(c.id))),
    [allColumns, activeColumnIds]
  );

  const pageCount = Math.max(1, Math.ceil(rows.length / pagination.pageSize));
  /**
   * Dew's Table does NOT slice — it renders whatever `data` holds and uses
   * `rowCount` only to size its own controls. Passing the full set left every
   * page showing all ten rows while the range label counted up, which the old
   * 30-per-page default hid because ten rows never filled a second page.
   */
  /* Sort BEFORE slicing. Dew's Table draws the arrows and sets aria-sort but
     never reorders a controlled sort, and applying it after the slice would
     only shuffle the page you are already on. */
  const pageRows = useMemo(
    () =>
      sortRows(rows, sorting).slice(
        pagination.pageIndex * pagination.pageSize,
        (pagination.pageIndex + 1) * pagination.pageSize
      ),
    [rows, sorting, pagination.pageIndex, pagination.pageSize]
  );
  const allVisibleSelected = rows.length > 0 && selectedIds.size === rows.length;
  /** "1 - 4 of 4", the product's wording. */
  const rangeLabel = (() => {
    if (rows.length === 0) return '0 - 0 of 0';
    const first = pagination.pageIndex * pagination.pageSize + 1;
    const last = Math.min(rows.length, first + pagination.pageSize - 1);
    return `${first} - ${last} of ${rows.length}`;
  })();

  /**
   * Scale the declared sizes so they add up to the space available. Keyed on
   * width and the visible column set only — NOT on the sizing it produces, so
   * a manual column drag survives until the panel is toggled again.
   */
  useEffect(() => {
    if (wrapWidth === 0) return;
    const base = columns.map((c) => ({ id: String(c.id), size: c.size ?? 150 }));
    const total = base.reduce((sum, c) => sum + c.size, 0);
    if (total === 0) return;
    // The select checkbox column is Dew's own and is not in `columns`; measured
    // at 56px. The 2px keeps a rounding overflow from raising a scrollbar.
    const available = wrapWidth - SELECT_COLUMN_WIDTH - 2;
    if (available <= 0) return;
    const scale = available / total;
    setColumnSizing(Object.fromEntries(base.map((c) => [c.id, Math.floor(c.size * scale)])));
  }, [wrapWidth, columns]);

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0, minHeight: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, padding: 'var(--spacing-300)', gap: 'var(--spacing-200)' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-200)' }}>
          {/* No page title here — the Freshservice shell already renders the
              section name and the Prototype tag above the outlet. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-150)', minWidth: 0 }}>
            <ViewSwitcher current="table" />
            <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <Checkbox
                checked={allVisibleSelected}
                isIndeterminate={selectedIds.size > 0 && !allVisibleSelected}
                onChange={() =>
                  setSelectedIds(allVisibleSelected ? new Set() : new Set(rows.map((r) => r.id)))
                }
                label="Select all"
              />
            </span>
            <SortMenu
              field={sortField}
              direction={sortDir}
              onChange={(f, d) => {
                setSortField(f);
                setSortDir(d);
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)' }}>
            <TextButton type="button" variant="secondary" size="default" prefixIcon="Export" onClick={() => setExportOpen(true)}>
              Export
            </TextButton>
            {/* The product paginates from the TOP bar — a range then two
                arrows — and leaves only the per-page dropdown at the foot. */}
            <span style={{ fontSize: '14px', color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
              {rangeLabel}
            </span>
            <IconButton
              iconName="ChevronLeft"
              aria-label="Previous page"
              size="default"
              disabled={pagination.pageIndex === 0}
              onClick={() => setPagination((p) => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }))}
            />
            <IconButton
              iconName="ChevronRight"
              aria-label="Next page"
              size="default"
              disabled={pagination.pageIndex >= pageCount - 1}
              onClick={() =>
                setPagination((p) => ({ ...p, pageIndex: Math.min(pageCount - 1, p.pageIndex + 1) }))
              }
            />
            {/* Icon only, as in the product — the funnel carries no label, and
                sits in a sustained active state while the panel is open. */}
            <IconButton
              iconName="Filter"
              size="default"
              active={showFilters}
              aria-label={
                activeFilterCount > 0 ? `Filters (${activeFilterCount} applied)` : 'Filters'
              }
              onClick={() => setShowFilters((open) => !open)}
            />
          </div>
        </header>

        <div ref={setTableWrapEl} className="fs-tickets-table" style={{ minWidth: 0 }}>
        <Table<Ticket>
          data={pageRows}
          columns={columns}
          enableMultiSelect
          enableSorting
          enableColumnResizing
          sortingState={sorting}
          onSortChange={setSorting}
          selectedRows={selectedIds}
          onSelectedRowsChange={setSelectedIds}
          showBulkActionsToolbar
          bulkActionsToolbar={BulkActionsToolbar}
          defaultStateComponent={emptyState}
          paginationState={pagination}
          onPaginationChange={setPagination}
          rowCount={rows.length}
          paginationMeta={{
            total: rows.length,
            page: pagination.pageIndex + 1,
            per_page: pagination.pageSize,
            // The range lives in the top bar, as it does in the product; the
            // foot keeps only the per-page dropdown.
            showItemCount: false,
            showPerPageDropdown: true,
            // Measured on the live foot: 30 / 50 / 80 / 100, not the 10 this
            // started with. Dew renders them as "30 / items"; the product says
            // "30 / page", and the Table does not expose perPageLabel to
            // change it.
            perPageOptions: [30, 50, 80, 100]
          }}
          rowDensity={density}
          columnSizing={columnSizing}
          onColumnSizingChange={setColumnSizing}
          columnCustomizer={{
            show: true,
            displayHeaderList: fields,
            onHeaderViewChange: setFields,
            rowDensity: density,
            onRowDensityChange: setDensity,
            showSelectAllColumns: true
          }}
        />
        </div>
      </div>

      <ViewControls />

      <HandOverDialog
        open={Boolean(handOver)}
        digit="Ticket Resolver"
        onCancel={() => setHandOver(undefined)}
        onConfirm={() => {
          if (handOver) patch(handOver.id, handOver.changes);
          setHandOver(undefined);
        }}
      />

      <ExportTicketsSheet
        open={exportOpen}
        onOpenChange={setExportOpen}
        viewName="New & My Open Tickets"
        ticketCount={visible.length}
      />

      {showFilters && (
        <FilterSidebar
          draft={draft}
          onDraftChange={setDraft}
          onApply={() => setApplied(draft)}
          activeCount={activeFilterCount}
          mode={filterMode}
          onModeChange={setFilterMode}
          match={match}
          onMatchChange={setMatch}
          conditions={conditions}
          onConditionsChange={setConditions}
          onClear={clearFilters}
        />
      )}
    </div>
  );
}
