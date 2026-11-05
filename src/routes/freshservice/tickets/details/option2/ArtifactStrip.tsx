import { Icon } from '@freshworks/dew-components';
import { SparkleIcon } from '../AiCardChrome';
import { ARTIFACT_LABEL, type ArtifactKind } from './responseTimeline';

/**
 * Option 2 · the brief bar (21 Oct review).
 *
 * One line, pinned under the sticky ticket tabs once the top card has scrolled
 * away: "Root cause: Wi-Fi certificate not renewed after CHG-2187". The whole
 * bar is the button, and it goes back to the card. It replaces the earlier
 * strip's chips and "Expand", which were more than a glance needs.
 */
export default function ArtifactStrip({
  kind,
  line,
  visible,
  onExpand
}: {
  kind: ArtifactKind;
  line: string;
  visible: boolean;
  onExpand: () => void;
}) {
  const label = ARTIFACT_LABEL[kind];

  return (
    <div className="tr-o2-strip-slot" aria-hidden={!visible}>
      <div className={`tr-o2-strip ${visible ? 'is-visible' : ''}`}>
        <button
          type="button"
          className="tr-o2-strip-line"
          onClick={onExpand}
          tabIndex={visible ? undefined : -1}
          title={`${label}: ${line}`}
          aria-label={`${label}: ${line}. Go to the ${label.toLowerCase()}`}
        >
          <SparkleIcon />
          <span className="tr-o2-strip-text">
            <strong style={{ fontWeight: 'var(--font-weight-semi-bold)' }}>{label}:</strong> {line}
          </span>
          <Icon name="ChevronUp" size="sm" color="var(--color-icon-secondary)" />
        </button>
      </div>
    </div>
  );
}
