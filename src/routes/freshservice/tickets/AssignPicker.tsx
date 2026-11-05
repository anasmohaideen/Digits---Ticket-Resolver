import { useMemo, useState, type ReactNode } from 'react';
import { HorizontalTabs, Icon, Popover, Search } from '@freshworks/dew-components';
import { AGENTS, GROUPS, type Agent, type Group } from './tickets.data';

/**
 * Assign a ticket to a group or an agent, as the product's "Assigned to" picker
 * does: a search across both, "None" on top, then Groups and Agents tabs with
 * their counts, and the matching list.
 *
 * Built from Dew (Popover, Search, HorizontalTabs with its count badges); the
 * list rows use Dew's type and colour tokens. Digital workers are not people
 * you can hand a ticket to, so they are never offered: a ticket a Digit holds
 * shows it on the trigger, and the first change hands it over for good (the
 * caller confirms that with `HandOverDialog`).
 */

export type Assignment = { agent: Agent; group: Group };

/** People a ticket can be given to: never "None" (its own row) or a Digit. */
export const ASSIGNABLE_AGENTS = AGENTS.filter((agent) => agent !== 'None' && agent !== 'Ticket Resolver');

const countLabel = (n: number) => (n > 99 ? '99+' : n);

function Row({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" role="option" aria-selected={selected} className={`tr-assign-row${selected ? ' is-selected' : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

export default function AssignPicker({
  value,
  onChange,
  ariaLabel,
  leading
}: {
  value: Assignment;
  onChange: (next: Assignment) => void;
  ariaLabel: string;
  /** Drawn before the trigger's label, e.g. Ticket Resolver's avatar. */
  leading?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'groups' | 'agents'>('agents');

  const match = (name: string) => name.toLowerCase().includes(query.trim().toLowerCase());
  const groups = useMemo(() => GROUPS.filter(match), [query]); // eslint-disable-line react-hooks/exhaustive-deps
  const agents = useMemo(() => ASSIGNABLE_AGENTS.filter(match), [query]); // eslint-disable-line react-hooks/exhaustive-deps

  /* The trigger names who has it: the agent, or the group's queue when no one does. */
  const label = value.agent !== 'None' ? value.agent : value.group ?? 'None';

  const choose = (next: Assignment) => {
    setOpen(false);
    setQuery('');
    if (next.agent !== value.agent || next.group !== value.group) onChange(next);
  };

  return (
    <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) setQuery(''); }} placement="bottom-start" mainAxisDistance={4}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={`tr-assign-trigger${open ? ' is-open' : ''}`}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {leading}
          <span className="tr-assign-trigger-label">{label}</span>
          <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size="xs" color="var(--color-icon-secondary)" />
        </button>
      </Popover.Trigger>
      <Popover.Content className="tr-assign-popover" aria-label="Assign to a group or an agent">
        <div className="tr-assign-search">
          <Search
            aria-label="Search by group or agents"
            placeholder="Search by group or agents"
            value={query}
            onValueChange={setQuery}
            autoFocus
          />
        </div>

        <div role="listbox" aria-label="No assignee" className="tr-assign-none">
          <Row selected={value.agent === 'None'} onClick={() => choose({ ...value, agent: 'None' })}>None</Row>
        </div>

        <HorizontalTabs value={tab} onValueChange={(next) => setTab(next as 'groups' | 'agents')}>
          <HorizontalTabs.List aria-label="Assign to">
            <HorizontalTabs.Trigger value="groups" badge={countLabel(groups.length)}>Groups</HorizontalTabs.Trigger>
            <HorizontalTabs.Trigger value="agents" badge={countLabel(agents.length)}>Agents</HorizontalTabs.Trigger>
          </HorizontalTabs.List>
          <HorizontalTabs.Content value="groups">
            <div role="listbox" aria-label="Groups" className="tr-assign-list">
              {groups.length === 0 && <p className="tr-assign-empty">No groups match “{query}”</p>}
              {groups.map((group) => (
                <Row key={group} selected={value.agent === 'None' && value.group === group} onClick={() => choose({ group, agent: 'None' })}>
                  {group}
                </Row>
              ))}
            </div>
          </HorizontalTabs.Content>
          <HorizontalTabs.Content value="agents">
            <div role="listbox" aria-label="Agents" className="tr-assign-list">
              {agents.length === 0 && <p className="tr-assign-empty">No agents match “{query}”</p>}
              {agents.map((agent) => (
                <Row key={agent} selected={value.agent === agent} onClick={() => choose({ ...value, agent })}>
                  {agent}
                </Row>
              ))}
            </div>
          </HorizontalTabs.Content>
        </HorizontalTabs>
      </Popover.Content>
    </Popover>
  );
}
