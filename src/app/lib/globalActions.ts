// Global Actions (+) bridge (20004). Some global actions open workflows that
// are owned by app-shell components mounted once (e.g. UtilityBar's Add
// Connection modal). The header asks for them by name here; the owner opens
// its own existing UI. No workflow logic lives in this file.

export type GlobalActionName = "add-connection";

const EVENT = "mercy:global-action";

export function requestGlobalAction(
  name: GlobalActionName,
): void {
  window.dispatchEvent(
    new CustomEvent<GlobalActionName>(EVENT, { detail: name }),
  );
}

export function onGlobalAction(
  name: GlobalActionName,
  handler: () => void,
): () => void {
  const listener = (e: Event) => {
    if ((e as CustomEvent<GlobalActionName>).detail === name)
      handler();
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}