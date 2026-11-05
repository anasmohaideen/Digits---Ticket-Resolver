/**
 * The empty state every quiet view shares, across Knowledge Base, Changes and
 * the service catalogue.
 *
 * Measured on the Announcements-style states: a 175px illustration centred over
 * a 16px/400 --color-text-secondary line. The artwork is the product's own,
 * lifted verbatim rather than substituted with an icon.
 */
export default function EmptyState({
  art,
  message,
  children,
}: {
  art: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-200)',
        padding: 'var(--spacing-500)',
      }}
    >
      <img src={art} alt="" width={175} height={175} />
      <p style={{ margin: 0, fontSize: '16px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
        {message}
      </p>
      {children}
    </div>
  );
}
