// Unsaved-changes guard for an editor (US 20101, Internal Transition
// Summary). Active only while `dirty` is true and only while the editor is
// mounted; it confirms BEFORE anything that would unmount the editor runs:
//
//   • Route changes made with navigate()/<Link>: the app uses BrowserRouter
//     (no data router, so no useBlocker). navigate() always goes through the
//     router's navigator (push / replace / go), which is wrapped here and
//     restored on cleanup.
//   • Browser Back/Forward: the popstate is stopped before the router sees
//     it, the URL is put back, and the same step is replayed on Discard.
//     Listeners on window run in registration order, so one inert listener
//     is registered when this module loads (before BrowserRouter mounts and
//     adds its own); it only acts while a dirty editor has registered.
//   • In-page section navigation: clicks on buttons/links inside an element
//     marked `data-leave-guard` (profile sidebar, Treatment Planning tabs)
//     are held and replayed once on Discard. Disclosure toggles
//     (aria-expanded) and anything marked `data-leave-guard-ignore` pass.
//
// Reload/close keeps the native browser warning (beforeunload).

import { useContext, useEffect, useRef, useState } from "react";
import { UNSAFE_NavigationContext } from "react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

let activePopHandler: ((e: PopStateEvent) => void) | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", (e) => activePopHandler?.(e));
}

type Navigator = {
  push: (...args: unknown[]) => void;
  replace: (...args: unknown[]) => void;
  go: (delta: number) => void;
};

export function useUnsavedChangesGuard(
  dirty: boolean,
  /** Drops the unsaved draft just before the held navigation runs. */
  onDiscard: () => void,
  /** What the user is leaving, for the confirmation text. */
  subject = "this summary",
): React.ReactNode {
  const { navigator } = useContext(UNSAFE_NavigationContext) as unknown as {
    navigator: Navigator;
  };
  const [open, setOpen] = useState(false);
  const pending = useRef<(() => void) | null>(null);
  // Opened from code, not a trigger: remember what had focus so Keep
  // Editing / Escape can return to it.
  const returnFocus = useRef<HTMLElement | null>(null);
  const onDiscardRef = useRef(onDiscard);
  onDiscardRef.current = onDiscard;

  useEffect(() => {
    if (!dirty) return;
    let bypass = false; // true while a confirmed action is replayed
    let allowPop = false; // let the next popstate reach the router
    let restoring = false; // swallow the popstate caused by our undo
    const baseIdx = (window.history.state as { idx?: number } | null)?.idx;

    /** One confirmation at a time; later requests are ignored. */
    const hold = (action: () => void) => {
      if (pending.current) return;
      returnFocus.current = document.activeElement as HTMLElement | null;
      pending.current = () => {
        bypass = true;
        try {
          action();
        } finally {
          bypass = false;
        }
      };
      setOpen(true);
    };

    // Route changes
    const orig = {
      push: navigator.push,
      replace: navigator.replace,
      go: navigator.go,
    };
    navigator.push = (...a) =>
      bypass ? orig.push.apply(navigator, a) : hold(() => orig.push.apply(navigator, a));
    navigator.replace = (...a) =>
      bypass
        ? orig.replace.apply(navigator, a)
        : hold(() => orig.replace.apply(navigator, a));
    navigator.go = (n) =>
      bypass ? orig.go.call(navigator, n) : hold(() => orig.go.call(navigator, n));

    // Back / Forward — capture runs before the router's own listener.
    const onPop = (e: PopStateEvent) => {
      if (allowPop) {
        allowPop = false;
        return;
      }
      e.stopImmediatePropagation();
      if (restoring) {
        restoring = false;
        return;
      }
      const idx = (e.state as { idx?: number } | null)?.idx;
      if (typeof idx !== "number" || typeof baseIdx !== "number") return;
      const delta = idx - baseIdx;
      if (!delta) return;
      restoring = true;
      window.history.go(-delta);
      hold(() => {
        allowPop = true;
        window.history.go(delta);
      });
    };

    // In-page section navigation
    const onClick = (e: MouseEvent) => {
      if (bypass) return;
      const target = e.target as Element | null;
      const area = target?.closest("[data-leave-guard]");
      const el = target?.closest<HTMLElement>("button, a, [role='tab']");
      if (!area || !el || !area.contains(el)) return;
      if (el.closest("[data-leave-guard-ignore]")) return;
      if (el.hasAttribute("aria-expanded")) return;
      e.preventDefault();
      e.stopPropagation();
      hold(() => el.click());
    };

    const onUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    activePopHandler = onPop;
    document.addEventListener("click", onClick, true);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      Object.assign(navigator, orig);
      if (activePopHandler === onPop) activePopHandler = null;
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("beforeunload", onUnload);
      pending.current = null;
      setOpen(false);
    };
  }, [dirty, navigator]);

  const keepEditing = () => {
    pending.current = null;
    setOpen(false);
  };

  const discard = () => {
    const action = pending.current;
    pending.current = null;
    setOpen(false);
    if (!action) return;
    onDiscardRef.current();
    action();
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && keepEditing()}>
      <AlertDialogContent
        onCloseAutoFocus={(e) => {
          const el = returnFocus.current;
          returnFocus.current = null;
          if (el?.isConnected && el !== document.body) {
            e.preventDefault();
            el.focus();
          }
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>
            Your changes have not been saved. Leaving {subject} will
            discard them.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={keepEditing}>Keep Editing</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={discard}>
            Discard Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}