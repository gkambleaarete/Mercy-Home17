import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router";
import {
  PassRecordDialog,
  type PassCreateDefaults,
  type PassDialogRequest,
  type PassDialogTarget,
  type PassLaunchOptions,
} from "../components/passes/PassRecordDialog";

// Launch actions for the Pass record modal. One provider (inside the
// router, around the app content and outside <Routes>) owns the single modal
// host, so the page that launched it stays mounted — same component
// identity, same filters/scroll/selection — behind the overlay.

export type { PassCreateDefaults, PassLaunchOptions };

interface PassDialogApi {
  /** New Pass. Context defaults are optional; with none, Youth and Program
   *  start blank. */
  openCreate: (
    options?: PassCreateDefaults & PassLaunchOptions,
  ) => void;
  /** Edit Pass for an existing record. */
  openEdit: (id: number, launch?: PassLaunchOptions) => void;
  /** View Pass (read-only) for an existing record. */
  openView: (id: number, launch?: PassLaunchOptions) => void;
  /** Close the modal if it is open. */
  closePassDialog: () => void;
  /** A Constituent profile's Pass workspace announces it is on screen.
   *  Constituent-owned launches (`ownerLock`) are honored only while that
   *  workspace is mounted, and leaving it closes its modal — so a delayed
   *  callback (e.g. a toast's "View Pass") can never reopen a Pass for a
   *  Constituent the user has navigated away from. Returns the release. */
  registerOwnerScope: (constituentId: number) => () => void;
}

const PassDialogContext = createContext<PassDialogApi | null>(
  null,
);

export function usePassDialog(): PassDialogApi {
  const ctx = useContext(PassDialogContext);
  if (!ctx)
    throw new Error(
      "usePassDialog must be used inside <PassDialogProvider>",
    );
  return ctx;
}

export function PassDialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [request, setRequest] =
    useState<PassDialogRequest | null>(null);
  const counter = useRef(0);
  // Always the latest request, for callbacks that outlive a render (toast
  // actions call the stable API below).
  const requestRef = useRef<PassDialogRequest | null>(null);
  requestRef.current = request;

  // Constituent ids whose Pass workspace is currently mounted (counted, so
  // a remount's register/release ordering cannot drop an active scope).
  const ownerScopes = useRef(new Map<number, number>());
  const ownerActive = (
    launch: PassLaunchOptions | undefined,
  ): boolean =>
    !launch?.ownerLock ||
    (ownerScopes.current.get(launch.ownerLock.constituentId) ??
      0) > 0;

  const close = useCallback((silent = false) => {
    const current = requestRef.current;
    if (!current) return;
    setRequest(null);
    if (!silent) current.launch.onClose?.();
  }, []);

  const api = useMemo<PassDialogApi>(
    () => ({
      openCreate: (options = {}) => {
        const { returnFocusTo, onClose, ownerLock, ...defaults } =
          options;
        if (!ownerActive({ ownerLock })) return;
        counter.current += 1;
        setRequest({
          kind: "create",
          ...defaults,
          openId: counter.current,
          formKey: counter.current,
          launch: { returnFocusTo, onClose, ownerLock },
        });
      },
      openEdit: (id, launch = {}) => {
        if (!ownerActive(launch)) return;
        counter.current += 1;
        setRequest({
          kind: "edit",
          id,
          openId: counter.current,
          formKey: counter.current,
          launch,
        });
      },
      openView: (id, launch = {}) => {
        if (!ownerActive(launch)) return;
        counter.current += 1;
        setRequest({
          kind: "view",
          id,
          openId: counter.current,
          formKey: counter.current,
          launch,
        });
      },
      closePassDialog: () => close(),
      registerOwnerScope: (constituentId) => {
        const m = ownerScopes.current;
        m.set(constituentId, (m.get(constituentId) ?? 0) + 1);
        return () => {
          const n = (m.get(constituentId) ?? 1) - 1;
          if (n <= 0) m.delete(constituentId);
          else m.set(constituentId, n);
          // Leaving the profile closes its Constituent-owned modal.
          if (
            n <= 0 &&
            requestRef.current?.launch.ownerLock
              ?.constituentId === constituentId
          )
            close(true);
        };
      },
    }),
    [close],
  );

  // Switch the SAME modal to another mode/record (View → Edit, View → Copy):
  // the dialog stays mounted; only the form is reset.
  const switchTo = useCallback((target: PassDialogTarget) => {
    const current = requestRef.current;
    if (!current) return;
    counter.current += 1;
    setRequest({
      ...target,
      openId: current.openId,
      formKey: counter.current,
      launch: current.launch,
    });
  }, []);

  // A route change (e.g. the Pack Med link in View, browser Back) leaves
  // the page the modal belonged to, so the modal closes with it. Not the
  // user's own close: no onClose callback runs.
  const { pathname } = useLocation();
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    close(true);
  }, [pathname, close]);

  return (
    <PassDialogContext.Provider value={api}>
      {children}
      {request && (
        <PassRecordDialog
          key={request.openId}
          request={request}
          onClose={() => close()}
          onSwitch={switchTo}
          // The View Pass toast action keeps the Constituent lock (and is
          // dropped if that profile is no longer on screen).
          onOpenView={(id) =>
            api.openView(id, {
              ownerLock: request.launch.ownerLock,
            })
          }
        />
      )}
    </PassDialogContext.Provider>
  );
}
