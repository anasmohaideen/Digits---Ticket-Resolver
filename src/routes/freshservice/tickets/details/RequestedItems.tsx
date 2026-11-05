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
        color: illustrator ? '#ff9a00' : undefined
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
            borderRadius: '3px',
            backgroundColor: '#330000',
            border: '1px solid #ff9a00',
            fontSize: '11px',
            fontWeight: 'var(--font-weight-semi-bold)'
          }}
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
            fontSize: '14px',
            lineHeight: '20px',
            fontWeight: 'var(--font-weight-semi-bold)',
            color: 'var(--color-text-primary)'
          }}
        >
          {item.name}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', minWidth: 0 }}>
          <span style={{ fontSize: '12px', lineHeight: '20px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
            Stage:
          </span>
          <Menu
            aria-label={`${item.name} stage`}
            options={STAGES.map((stage) => ({ value: stage, label: stage }))}
            onClick={(option) => onStageChange(option.value as RequestedItem['stage'])}
            slots={{
              trigger: (
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-050)',
                    padding: 0,
                    border: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '12px',
                    lineHeight: '20px',
                    fontWeight: 'var(--font-weight-semi-bold)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {item.stage}
                  <Icon name="ChevronDown" size="sm" />
                </button>
              )
            }}
          />
          <span aria-hidden style={{ width: '1px', height: '18px', backgroundColor: 'var(--color-boundary-divider-mildest)' }} />
          <TextButton type="button" variant="link" size="mini" style={{ padding: 0, fontSize: '12px' }}>
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
          style={{ fontSize: '14px' }}
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
            fontSize: '14px',
            lineHeight: '20px',
            fontWeight: 'var(--font-weight-semi-bold)',
            color: 'var(--color-text-primary)'
          }}
        >
          Requested items
        </h2>
        <Badge count={items.length} color="primary" />
        <span style={{ flex: 1 }} />
        <TextButton
          type="button"
          variant="link"
          size="mini"
          style={{ padding: 0, fontSize: '14px' }}
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
