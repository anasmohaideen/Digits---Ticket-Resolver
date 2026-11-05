import type { EventNode, MessageNode, StreamNode } from './types';

/** Public conversation and artifacts are peers; operational events belong to work logs. */
export function buildConversationTimeline(stream: StreamNode[]) {
  if (!stream.some((node) => node.kind === 'group' && node.level === 'run')) {
    return { nodes: stream, workByMessageId: {} as Record<string, EventNode[]> };
  }
  const nodes: StreamNode[] = [];
  const workByMessageId: Record<string, EventNode[]> = {};
  let pendingWork: EventNode[] = [];

  const visit = (node: StreamNode) => {
    if (node.kind === 'group') {
      node.children.forEach(visit);
      return;
    }
    if (node.kind === 'event') {
      if (node.type === 'summary-updated' || node.type === 'root-cause-added') nodes.push(node);
      else if (node.actor.kind === 'digit') pendingWork.push(node);
      return;
    }
    if (node.kind === 'message') {
      nodes.push(node);
      if (node.actor.kind === 'digit' && pendingWork.length) {
        workByMessageId[node.id] = pendingWork;
        pendingWork = [];
      }
      return;
    }
    nodes.push(node);
  };

  stream.forEach(visit);
  // A run may end with an action and no further worker reply. Keep that work
  // attached to the latest worker response instead of silently dropping it.
  if (pendingWork.length) {
    const lastWorker = [...nodes].reverse().find((node): node is MessageNode =>
      node.kind === 'message' && node.actor.kind === 'digit');
    if (lastWorker) workByMessageId[lastWorker.id] = [...(workByMessageId[lastWorker.id] ?? []), ...pendingWork];
    else nodes.push(...pendingWork);
  }
  return { nodes, workByMessageId };
}
