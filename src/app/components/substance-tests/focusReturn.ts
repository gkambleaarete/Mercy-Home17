// Focus return for Substance Test dialogs opened from state (not from a
// Radix Dialog.Trigger — Radix would otherwise drop focus on <body>).
// Focus goes back to the control that opened the dialog; if that control is
// gone or disabled, to a stable fallback (e.g. the list's table, which has
// tabIndex={-1}), never to <body>.

const usable = (
  el: HTMLElement | null | undefined,
): el is HTMLElement =>
  !!el && el.isConnected && !(el as HTMLButtonElement).disabled;

export function restoreFocus(
  trigger: HTMLElement | null | undefined,
  fallbackId?: string,
): void {
  const fallback = () =>
    fallbackId ? document.getElementById(fallbackId) : null;
  (usable(trigger) ? trigger : fallback())?.focus();
  // The list may still update right after a save (e.g. a filtered-out row
  // clears the selection and disables the trigger), which drops focus to
  // <body>. Re-check once that has settled.
  const guard = () => {
    if (
      document.activeElement &&
      document.activeElement !== document.body
    )
      return;
    (usable(trigger) ? trigger : fallback())?.focus();
  };
  requestAnimationFrame(() => setTimeout(guard, 0));
  setTimeout(guard, 150);
}

/** True while any dialog is open (a closing dialog animating out is
 *  `data-state="closed"` and does not count). */
export function anyDialogOpen(): boolean {
  return !!document.querySelector(
    '[role="dialog"][data-state="open"]',
  );
}