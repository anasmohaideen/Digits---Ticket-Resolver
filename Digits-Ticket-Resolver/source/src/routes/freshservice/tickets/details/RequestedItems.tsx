import { useState } from 'react';
import { Badge, Icon, IconButton, Menu, TextButton } from '@freshworks/dew-components';

export type RequestedItem = {
  id: string;
  name: string;
  artwork: string;
  artworkLabel: string;
  stage: 'Requested' | 'In progress' | 'Fulfilled';
};

export const INITIAL_ITEMS: RequestedItem[] = [
  { id: 'illustrator-1', name: 'Adobe Illustrator CC', artwork: 'Ai', artworkLabel: 'Adobe Illustrator', stage: 'Requested' },
  { id: 'cash-request', name: 'Advance Cash Request', artwork: '🪙', artworkLabel: 'Cash advance', stage: 'Requested' },
  { id: 'benefits-change', name: 'Benefits Change Request', artwork: '🏝️', artworkLabel: 'Benefits change', stage: 'Requested' }
];

export const STAGES: RequestedItem['stage'][] = ['Requested', 'In progress', 'Fulfilled'];

export function ItemArtwork({ item }: { item: RequestedItem }) {
  const illustrator = item.artwork === 'Ai';

  return (
    <span
      role="img"
      aria-label={item.artworkLabel}
      style={{
        width: '40px',
        height: '40px',
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--border-radius-small)',
        backgroundColor: 'var(--color-fill-semantic-info-mildest)',
        fontSize: illustrator ? '12px' : '18px',
        lineHeight: 1,
        color: illustrator ? 'var(--color-text-semantic-warning)' : undefined
      }}
    >
      {illustrator ? (
        <span
          aria-hidden
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '22px',
            height: '22px',
            borderRadius: 'var(--border-radius-xsmall)',
            backgroundColor: 'var(--color-fill-semantic-warning-mildest)',
            border: '1px solid var(--color-boundary-semantic-warning-mild)',
            font: 'var(--font-caption)' }}
        >
          Ai
        </span>
      ) : item.artwork}
    </span>
  );
}

function RequestedItemRow({
  item,
  onStageChange
}: {
  item: RequestedItem;
  onStageChange: (stage: RequestedItem['stage']) => void;
}) {
  return (
    <article
      style={{
        minHeight: '78px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-200)',
        padding: 'var(--spacing-200)',
        border: '1px solid var(--color-boundary-border-mildest)',
        borderRadius: 'var(--border-radius-large)',
        backgroundColor: 'var(--color-fill-surface)'
      }}
    >
      <ItemArtwork item={item} />

      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            marginBlockEnd: 'var(--spacing-050)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            font: 'var(--font-body-semibold)',
            color: 'var(--color-text-primary)' }}
        >
          {item.name}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', minWidth: 0 }}>
          <span style={{ font: 'var(--font-caption-regular)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
            Stage:
          </span>
          <Menu
            aria-label={`${item.name} stage`}
            options={STAGES.map((stage) => ({ value: stage, label: stage }))}
            onClick={(option) => onStageChange(option.value as RequestedItem['stage'])}
            slots={{
              trigger: (
                <TextButton type="button" variant="link" size="mini" suffixIcon="ChevronDown" style={{ padding: 0, font: 'var(--font-caption-regular)', color: 'var(--color-text-primary)' }}>
                  {item.stage}
                </TextButton>
              )
            }}
          />
          <span aria-hidden style={{ width: '1px', height: '18px', backgroundColor: 'var(--color-boundary-divider-mildest)' }} />
          <TextButton type="button" variant="link" size="mini" style={{ padding: 0, font: 'var(--font-caption-regular)' }}>
            More Info
          </TextButton>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', flexShrink: 0 }}>
        <TextButton
          type="button"
          variant="secondary"
          size="default"
          prefixIcon="CircleCheck"
          disabled={item.stage === 'Fulfilled'}
          onClick={() => onStageChange('Fulfilled')}
          style={{ font: 'var(--font-body)' }}
        >
          {item.stage === 'Fulfilled' ? 'Request fulfilled' : 'Fulfill request'}
        </TextButton>
        <Menu
          aria-label={`${item.name} actions`}
          options={[
            { value: 'edit', label: 'Edit item' },
            { value: 'remove', label: 'Remove item' }
          ]}
          onClick={() => {}}
          slots={{
            trigger: <IconButton iconName="MoreVertical" aria-label={`${item.name} actions`} size="default" withBackground />
          }}
        />
      </div>
    </article>
  );
}

export default function RequestedItems({ initialItems = INITIAL_ITEMS }: { initialItems?: RequestedItem[] } = {}) {
  const [items, setItems] = useState(initialItems);

  const updateStage = (id: string, stage: RequestedItem['stage']) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, stage } : item));
  };

  return (
    <section aria-labelledby="requested-items-heading" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-150)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)' }}>
        <h2
          id="requested-items-heading"
          style={{
            margin: 0,
            font: 'var(--font-body-semibold)',
            color: 'var(--color-text-primary)' }}
        >
          Requested items
        </h2>
        <Badge count={items.length} color="primary" />
        <span style={{ flex: 1 }} />
        <TextButton
          type="button"
          variant="link"
          size="mini"
          style={{ padding: 0, font: 'var(--font-body)' }}
          onClick={() => setItems((current) => [
            ...current,
            {
              id: `new-item-${current.length + 1}`,
              name: 'New requested item',
              artwork: '📦',
              artworkLabel: 'Requested item',
              stage: 'Requested'
            }
          ])}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-050)' }}>
            <Icon name="CirclePlus" size="sm" color="var(--color-icon-semantic-success)" />
            Add item
          </span>
        </TextButton>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-150)' }}>
        {items.map((item) => (
          <RequestedItemRow key={item.id} item={item} onStageChange={(stage) => updateStage(item.id, stage)} />
        ))}
      </div>
    </section>
  );
}
