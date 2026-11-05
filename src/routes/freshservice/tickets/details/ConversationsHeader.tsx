import type { ReactNode } from 'react';
import { HEADING } from './details.styles';

export default function ConversationsHeader({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <section aria-label="Conversations">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-150)', marginBottom: 'var(--spacing-150)' }}>
        <h2 style={{ ...HEADING, margin: 0 }}>Conversations</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
