import { useState } from 'react';
import { Checkbox, Modal, RadioGroup, Select, Tag, TextButton } from '@freshworks/dew-components';
import {
  EXPORT_DEFAULTS,
  EXPORT_FIELDS,
  EXPORT_FILTER_FIELDS,
  EXPORT_FILTER_PERIODS
} from './tickets.data';

/**
 * Export panel.
 *
 * It is a RIGHT-DOCKED SHEET, not a centred dialog — measured off the live
 * product, where it renders 600px wide, pinned to the right with an 8px gutter
 * on three sides, full height, over a translucent scrim:
 *
 *   position: fixed; top: 8px; right: 8px; bottom: 8px; left: 1312px
 *   border-radius: var(--border-radius-large); overlay rgba(18, 51, 76, 0.5)
 *
 * Worth stating because the first pass built it centred. A centred dialog and
 * a side sheet read as different interactions — one interrupts, the other sits
 * beside the list you are exporting — so this is not cosmetic.
 *
 * The field list and its eight defaults also come from the live product, as
 * does the guard: Export is disabled at zero fields with "Please choose
 * atleast one field to proceed" rather than exporting an empty file.
 */
export default function ExportTicketsSheet({
  open,
  onOpenChange,
  viewName,
  ticketCount
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewName: string;
  ticketCount: number;
}) {
  const [format, setFormat] = useState<'csv' | 'excel'>('csv');
  const [fields, setFields] = useState<Set<string>>(new Set(EXPORT_DEFAULTS));

  const toggle = (field: string) =>
    setFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });

  const allSelected = fields.size === EXPORT_FIELDS.length;
  const [filterField, setFilterField] = useState<string>(EXPORT_FILTER_FIELDS[0]);
  const [filterPeriod, setFilterPeriod] = useState<string>(EXPORT_FILTER_PERIODS[0]);

  // Dew's Select portals its popup to the body by default, and the Modal then
  // reads a click on an option as a click OUTSIDE itself — the popup closes and
  // the choice never commits. Portalling into the sheet keeps the click inside.
  // Held in state, not a ref: a ref is still null on the render that passes it
  // down, so the popup would get no target and never open.
  const [sheetEl, setSheetEl] = useState<HTMLDivElement | null>(null);

  const label = { font: 'var(--font-body)', color: 'var(--color-text-primary)', minWidth: '132px' } as const;
  const row = { display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)', marginBlockEnd: 'var(--spacing-200)' } as const;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <Modal.Content
        placement="right"
        containerHTMLProps={{
          style: {
            width: '600px',
            maxWidth: 'calc(100vw - 16px)',
            height: 'calc(100vh - 16px)',
            // Dew caps content at fw-max-h-[70vh]; a sheet is full height.
            maxHeight: 'calc(100vh - 16px)',
            marginInlineEnd: 'var(--spacing-100)',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Modal.Header>Export tickets</Modal.Header>
        <Modal.Body>
          <div ref={setSheetEl} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={row}>
              <span style={label}>Exporting :</span>
              <Tag variant="blue">{viewName}</Tag>
              <span style={{ font: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
                {ticketCount} ticket{ticketCount === 1 ? '' : 's'}
              </span>
            </div>

            <div style={row}>
              <span style={label}>Export as :</span>
              <RadioGroup
                name="export-format"
                value={format}
                orientation="horizontal"
                onChange={(_event, value) => setFormat(value as 'csv' | 'excel')}
                options={[
                  { value: 'csv', label: 'CSV' },
                  { value: 'excel', label: 'Excel' }
                ]}
              />
            </div>

            {/* Measured between "Export as" and the field picker: a date field
                then a period, two dropdowns side by side. */}
            <div style={row}>
              <span style={label}>Filter tickets by :</span>
              <div style={{ display: 'flex', gap: 'var(--spacing-150)' }}>
                <Select
                  aria-label="Filter tickets by field"
                  portalTarget={sheetEl}
                  options={FIELD_OPTIONS}
                  value={FIELD_OPTIONS.find((o) => o.value === filterField) ?? null}
                  onValueChange={(next) => next && setFilterField(next.value as string)}
                />
                <Select
                  aria-label="Filter tickets by period"
                  portalTarget={sheetEl}
                  options={PERIOD_OPTIONS}
                  value={PERIOD_OPTIONS.find((o) => o.value === filterPeriod) ?? null}
                  onValueChange={(next) => next && setFilterPeriod(next.value as string)}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBlock: 'var(--spacing-200)',
                marginBlockEnd: 'var(--spacing-200)',
                borderBlockStart: '1px solid var(--color-boundary-divider)'
              }}
            >
              <span style={{ font: 'var(--font-body-semibold)', color: 'var(--color-text-primary)' }}>
                Select fields to export <span style={{ color: 'var(--color-text-semantic-error)' }}>*</span>
              </span>
              <span style={{ font: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>{fields.size} Fields selected</span>
            </div>

            <div style={{ marginBlockEnd: 'var(--spacing-200)' }}>
              <Checkbox
                checked={allSelected}
                isIndeterminate={fields.size > 0 && !allSelected}
                onChange={() => setFields(allSelected ? new Set() : new Set(EXPORT_FIELDS))}
                label="Select All"
              />
            </div>

            {/* Two columns that fill DOWNWARDS, then across — the real picker
                reads Subject, Type, Source down the left, not across the row.
                A plain two-column grid flows row-major and would interleave
                them, so the row count is fixed and the flow made columnar. */}
            <div
              style={{
                display: 'grid',
                gridAutoFlow: 'column',
                gridTemplateRows: `repeat(${Math.ceil(EXPORT_FIELDS.length / 2)}, auto)`,
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--spacing-200)'
              }}
            >
              {EXPORT_FIELDS.map((field) => (
                <Checkbox key={field} checked={fields.has(field)} onChange={() => toggle(field)} label={field} />
              ))}
            </div>

            {fields.size === 0 && (
              <p style={{ margin: 'var(--spacing-200) 0 0', font: 'var(--font-body)', color: 'var(--color-text-semantic-error)' }}>
                Please choose atleast one field to proceed
              </p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <TextButton type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </TextButton>
          <TextButton type="button" variant="primary" disabled={fields.size === 0} onClick={() => onOpenChange(false)}>
            Export
          </TextButton>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

const FIELD_OPTIONS = EXPORT_FILTER_FIELDS.map((f) => ({ value: f, label: f }));
const PERIOD_OPTIONS = EXPORT_FILTER_PERIODS.map((p) => ({ value: p, label: p }));
