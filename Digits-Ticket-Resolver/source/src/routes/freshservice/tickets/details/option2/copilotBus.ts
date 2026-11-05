/**
 * Edit with Copilot: the reply editor lives deep in the Details tab, the panel
 * docks beside the whole ticket. A tiny bus carries the selection out and the
 * accepted text back, so neither side needs to know about the other.
 */
export interface CopilotEditRequest {
  text: string;
  accept: (newText: string) => void;
}

let listener: ((request: CopilotEditRequest) => void) | null = null;

export const copilotBus = {
  open: (request: CopilotEditRequest) => listener?.(request),
  subscribe: (fn: (request: CopilotEditRequest) => void) => {
    listener = fn;
    return () => {
      if (listener === fn) listener = null;
    };
  }
};
