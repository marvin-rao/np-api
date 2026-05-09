import { ReactNode, useEffect, useRef } from "react";

/**
 * SpaceOS app bridge.
 *
 * Embedded apps respond to OS commands declaratively, by rendering an
 * `<ActionsProvider>` anywhere in their tree. Each provider owns its own
 * postMessage listener and ready handshake — there is no required global
 * setup. A typical app mounts one provider next to the component that owns
 * the relevant state:
 *
 *   <ActionsProvider<NotesMessage>
 *     actions={[
 *       { type: 'notes:new',  function: () => addNote() },
 *       { type: 'notes:open', function: ({ id }) => setActive(id) },
 *     ]}
 *   >
 *     {children}
 *   </ActionsProvider>
 *
 * Multiple providers may coexist; each only reacts to the `type`s it
 * declares.
 *
 * Wire protocol
 * -------------
 * Iframe → parent (sent once on mount):
 *   { source: "os-app-iframe", type: "ready" }
 *
 * Parent → iframe (delivered after the iframe announces ready):
 *   { source: "os-app", appId, type, ...payload }
 *
 * Standalone (non-embedded) apps silently no-op.
 */

/** Minimal shape every command must satisfy. */
export type OsAppMessageBase = { type: string };

/**
 * One declarative action entry. `type` is the command name; `function`
 * receives the message payload (the message object minus `type`).
 *
 * When typed against an app's message union the payload is exhaustive:
 *
 *   type NotesMessage =
 *     | { type: 'notes:new' }
 *     | { type: 'notes:open'; id: string };
 *
 *   const actions: OsAction<NotesMessage>[] = [
 *     { type: 'notes:new',  function: () => {} },          // payload: {}
 *     { type: 'notes:open', function: ({ id }) => {} },    // payload: { id }
 *   ];
 */
export type OsAction<TMessage extends OsAppMessageBase = OsAppMessageBase> = {
  [K in TMessage["type"]]: {
    type: K;
    function: (
      payload: Omit<Extract<TMessage, { type: K }>, "type">,
    ) => void;
  };
}[TMessage["type"]];

const READY_SIGNAL = { source: "os-app-iframe", type: "ready" } as const;

const announceReady = (): void => {
  if (typeof window === "undefined") return;
  if (window.parent === window) return;
  try {
    window.parent.postMessage(READY_SIGNAL, "*");
  } catch {
    // Cross-origin or detached parent — best-effort only.
  }
};

interface ActionsProviderProps<TMessage extends OsAppMessageBase> {
  actions: ReadonlyArray<OsAction<TMessage>>;
  children?: ReactNode;
}

export const ActionsProvider = <TMessage extends OsAppMessageBase>({
  actions,
  children,
}: ActionsProviderProps<TMessage>) => {
  // Hold the latest actions in a ref so the listener installs once and still
  // sees current handlers (which are typically inline arrows that capture
  // surrounding state).
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      const env = data as { source?: string; type?: string; appId?: string };
      if (env.source !== "os-app") return;
      if (typeof env.type !== "string") return;

      const match = actionsRef.current.find((a) => a.type === env.type);
      if (!match) return;

      // Strip envelope fields; pass the rest to the action's function.
      const rest: Record<string, unknown> = { ...(env as Record<string, unknown>) };
      delete rest.source;
      delete rest.appId;
      delete rest.type;
      (match.function as (p: unknown) => void)(rest);
    };

    window.addEventListener("message", onMessage);
    announceReady();

    return () => window.removeEventListener("message", onMessage);
  }, []);

  return <>{children}</>;
};
