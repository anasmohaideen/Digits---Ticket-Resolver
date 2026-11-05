import { useState } from 'react';
import {
  Icon,
  IconButton,
  InputField,
  Menu,
  Modal,
  Popover,
  TextButton,
  useToast,
  type IMenuOption,
} from '@freshworks/dew-components';
import {
  DASHBOARDS,
  DASHBOARD_ALLOWANCE,
  DASHBOARD_CLONED_TOAST,
  DASHBOARD_MENU_OPTIONS,
  DASHBOARD_NAME,
  DASHBOARD_RENAMED_TOAST,
  EDIT_DIALOG_TITLE,
  EDIT_NAME_LABEL,
  cloneNameFor,
} from './dashboard.data';

/**
 * The Dashboard's top bar. A dashboard names ITSELF, not its section, and every
 * part of it is interactive: the name opens a switcher over every saved
 * dashboard, and the kebab beside it opens the dashboard's own overflow.
 *
 * Measured on live: the name is a 127x28 button at 14px/600, its kebab a 32x32
 * trigger 223px in. The switcher panel is 296 wide and leads with a New action
 * over a quota line; the overflow is 150x90 and holds exactly Edit and Clone.
 *
 * This is the only part of the prototype that owns state a user can change, so
 * it holds the whole set rather than a current name: cloning ADDS to the list
 * the switcher renders and to the count the quota line subtracts from, and a
 * clone that did not appear in the switcher would be a clone you could never
 * get back to.
 */
export default function DashboardTopBar() {
  const [dashboards, setDashboards] = useState<string[]>(DASHBOARDS);
  const [current, setCurrent] = useState(DASHBOARD_NAME);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [draftName, setDraftName] = useState(DASHBOARD_NAME);
  const { addSuccessToast } = useToast();

  const remaining = DASHBOARD_ALLOWANCE - dashboards.length;

  /**
   * Clone acts immediately — no dialog, no confirmation — and the product tells
   * you what happened in three places at once: the header takes the new name,
   * the switcher grows a row, and a toast names the copy. The header alone
   * would be ambiguous, since "Copy of X" appearing up there could equally mean
   * you had switched to a copy that already existed.
   */
  const clone = () => {
    const name = cloneNameFor(current, dashboards);
    setDashboards((all) => [...all, name]);
    setCurrent(name);
    addSuccessToast({ message: DASHBOARD_CLONED_TOAST(name) });
  };

  const openEdit = () => {
    setDraftName(current);
    setEditOpen(true);
  };

  const saveEdit = () => {
    const name = draftName.trim();
    setDashboards((all) => all.map((d) => (d === current ? name : d)));
    setCurrent(name);
    setEditOpen(false);
    addSuccessToast({ message: DASHBOARD_RENAMED_TOAST(name) });
  };

  const onMenuClick = (option: IMenuOption) => {
    if (option.value === 'clone') clone();
    if (option.value === 'edit') openEdit();
  };

  /* A dashboard cannot be saved nameless, and the guard belongs on the action
     rather than in an error message after the fact. */
  const canSave = draftName.trim().length > 0;

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)' }}>
      <Popover open={switcherOpen} onOpenChange={setSwitcherOpen} placement="bottom-start" mode="click">
        <Popover.Trigger asChild>
          <button
            type="button"
            onClick={() => setSwitcherOpen((open) => !open)}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: 0,
              fontSize: '14px',
              fontWeight: 'var(--font-weight-semi-bold)',
              color: 'var(--color-text-primary)',
            }}
          >
            {current}
          </button>
        </Popover.Trigger>
        <Popover.Content>
          <div style={{ width: '296px', boxSizing: 'border-box', padding: 'var(--spacing-100)' }}>
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-100)',
                width: '100%',
                padding: 'var(--spacing-150)',
                cursor: 'pointer',
                borderRadius: 'var(--border-radius-small)',
                border: '1px solid var(--color-boundary-border-mildest)',
                background: 'var(--color-fill-surface)',
                fontSize: '14px',
                fontWeight: 'var(--font-weight-semi-bold)',
                color: 'var(--color-text-brand)',
              }}
            >
              <Icon name="CirclePlus" size="sm" color="var(--color-icon-selected)" />
              New
            </button>
            {/* Live counts DOWN from the plan's dashboard allowance, so this
                moves every time Clone runs. */}
            <p
              style={{
                margin: 'var(--spacing-100) 0 var(--spacing-150)',
                paddingInline: 'var(--spacing-150)',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
              }}
            >
              <strong style={{ color: 'var(--color-text-primary)' }}>{remaining}</strong> more to go before you use them
              all
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {dashboards.map((name) => {
                const selected = name === current;
                return (
                  <li key={name}>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrent(name);
                        setSwitcherOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 'var(--spacing-100)',
                        width: '100%',
                        padding: 'var(--spacing-150)',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: 'var(--border-radius-small)',
                        fontSize: '14px',
                        textAlign: 'start',
                        /* The current dashboard is marked twice over: brand text
                           on an info-mildest row, and a tick on the right. */
                        background: selected ? 'var(--color-fill-semantic-info-mildest)' : 'transparent',
                        color: selected ? 'var(--color-text-brand)' : 'var(--color-text-primary)',
                      }}
                    >
                      {name}
                      {selected && <Icon name="Check" size="sm" color="var(--color-icon-selected)" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </Popover.Content>
      </Popover>

      <Menu
        aria-label="Dashboard options"
        options={DASHBOARD_MENU_OPTIONS}
        onClick={onMenuClick}
        slots={{ trigger: <IconButton iconName="MoreVertical" aria-label="Dashboard options" size="mini" /> }}
      />

      {/* Edit is a centred dialog rather than a sheet, so Modal is the right
          component here and its top-down entry is the correct motion — the
          thing the two right-hand panels needed a SliderPanel to get away
          from. */}
      <Modal open={editOpen} onOpenChange={setEditOpen}>
        <Modal.Content size="sm">
          <Modal.Header title={EDIT_DIALOG_TITLE} />
          <Modal.Body>
            <InputField>
              <InputField.Label required>{EDIT_NAME_LABEL}</InputField.Label>
              <InputField.Field>
                {/* Dew hands the VALUE first and the event second, which is
                    the opposite way round from a plain <input>. */}
                <InputField.Input
                  value={draftName}
                  onChange={(value) => setDraftName(String(value ?? ''))}
                  placeholder={DASHBOARD_NAME}
                />
              </InputField.Field>
            </InputField>
          </Modal.Body>
          <Modal.Footer>
            <TextButton variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </TextButton>
            <TextButton variant="primary" disabled={!canSave} onClick={saveEdit}>
              Save
            </TextButton>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </span>
  );
}
