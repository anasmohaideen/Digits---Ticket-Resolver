import { Navigate, useLocation } from 'react-router-dom';
import ListAi from './imports/ListAi/ListAi';
import { DEFAULT_SECTION, getChild, getSection } from './sections';

export default function SectionPage() {
  /* Read from the path rather than params: group children are declared as
     STATIC routes (see App.tsx), which carry no params, and a static route is
     what stops /tickets/board being swallowed by /tickets/:id. */
  const [, , section, child] = useLocation().pathname.split('/');
  const active = getSection(section);
  // A group child names itself; without one the section does.
  const named = getChild(section, child) ?? active;

  if (!active || (child && !named)) {
    return <Navigate to={`/freshservice/${DEFAULT_SECTION}`} replace />;
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-200)',
        textAlign: 'center',
        padding: 'var(--spacing-300)',
      }}
    >
      <div style={{ width: '160px', height: '160px' }}>
        <ListAi />
      </div>
      <h2
        style={{
          margin: 0,
          fontSize: '20px',
          lineHeight: '28px',
          fontWeight: 'var(--font-weight-semi-bold)',
          color: 'var(--color-text-primary)',
        }}
      >
        {named?.label ?? active.label}
      </h2>
      <p
        style={{
          margin: 0,
          maxWidth: '480px',
          fontSize: '14px',
          lineHeight: '20px',
          color: 'var(--color-text-secondary)',
        }}
      >
        This is the <strong>{named?.label ?? active.label}</strong> section. It is a blank Dew-powered
        canvas wired to the <code>/freshservice/{child ? `${active.id}/${child}` : active.id}</code> route. Drop in components and
        prototype the {(named?.label ?? active.label).toLowerCase()} experience with the same chrome your team ships.
      </p>
    </div>
  );
}
