import { Component, createRef, type ReactNode } from 'react';

type Snapshot = { scroller: HTMLElement; scrollTop: number; height: number } | null;
type Props = { children: ReactNode; topInset: number };

/** Keep the conversation in place when an artifact above the reader changes size. */
export default class ArtifactViewportAnchor extends Component<Props, Record<string, never>, Snapshot> {
  private region = createRef<HTMLDivElement>();

  getSnapshotBeforeUpdate(): Snapshot {
    const region = this.region.current;
    const scroller = region?.closest<HTMLElement>('[data-ticket-conversation-scroller]');
    if (!region || !scroller || scroller.scrollTop === 0) return null;
    const bounds = region.getBoundingClientRect();
    if (bounds.height > 0 && bounds.top >= scroller.getBoundingClientRect().top + this.props.topInset) return null;
    return { scroller, scrollTop: scroller.scrollTop, height: bounds.height };
  }

  componentDidUpdate(_previousProps: Readonly<Props>, _previousState: Readonly<Record<string, never>>, snapshot: Snapshot) {
    if (!snapshot || !this.region.current) return;
    const delta = this.region.current.getBoundingClientRect().height - snapshot.height;
    if (delta) snapshot.scroller.scrollTop = snapshot.scrollTop + delta;
  }

  render() {
    return <div ref={this.region}>{this.props.children}</div>;
  }
}
