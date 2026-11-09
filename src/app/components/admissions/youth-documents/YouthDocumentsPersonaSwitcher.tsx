import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
} from "react";
import { Alert } from "../../ui/alert";
import { FieldLabel } from "../../ui/field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  DEMO_PERSONAS,
  setDemoPersona,
  useDemoPersonaId,
  type DemoPersonaId,
} from "../../../data/demo/youthDocumentPersonas";

// Development-only demo persona switching (US 20147). The Area renders the
// provider and the switchers only when `import.meta.env.DEV` is true.
//
// ONE guarded handler serves every switcher instance (page header, Upload /
// Edit, Document Record, Preview). The active persona changes only after the
// handler has checked for a pending write and, when there are unsaved edits,
// after the user confirmed discarding them. Until then every switcher keeps
// showing the current persona.

interface PersonaSwitchContextValue {
  busy: boolean;
  requestSwitch: (
    next: DemoPersonaId,
    /** The control to return focus to if the user keeps editing. */
    trigger?: HTMLElement | null,
  ) => void;
}

const PersonaSwitchContext =
  createContext<PersonaSwitchContextValue | null>(null);

export function PersonaSwitchProvider({
  dirty,
  busy,
  onSwitched,
  children,
}: {
  dirty: boolean;
  busy: boolean;
  /** Runs after the persona changed: close dialogs, clear their state. */
  onSwitched: () => void;
  children: React.ReactNode;
}) {
  const current = useDemoPersonaId();
  const [pending, setPending] = useState<DemoPersonaId | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const apply = (next: DemoPersonaId) => {
    setDemoPersona(next);
    onSwitched();
  };
  const requestSwitch = (
    next: DemoPersonaId,
    trigger?: HTMLElement | null,
  ) => {
    if (busy || next === current) return; // never during a pending write
    returnFocus.current = trigger ?? null;
    if (dirty) setPending(next); // persona unchanged until confirmed
    else apply(next);
  };

  return (
    <PersonaSwitchContext.Provider value={{ busy, requestSwitch }}>
      {children}
      <AlertDialog
        open={pending !== null}
        onOpenChange={(o) => !o && setPending(null)}
      >
        <AlertDialogContent
          data-testid="persona-discard-dialog"
          onCloseAutoFocus={(e) => {
            // Keep Editing: put focus back on the switcher that asked. After
            // Discard the control is gone, so the default applies.
            const el = returnFocus.current;
            returnFocus.current = null;
            if (el?.isConnected) {
              e.preventDefault();
              el.focus();
            }
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your changes have not been saved. Switching persona will
              discard them and close the open document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                const next = pending;
                setPending(null);
                if (next) apply(next);
              }}
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PersonaSwitchContext.Provider>
  );
}

/** A switcher instance. Renders nothing outside development or outside a
 *  provider. */
export function YouthDocumentsPersonaSwitcher({
  variant = "page",
}: {
  /** "page" = boxed block in the page; "dialog" = compact, inside a modal. */
  variant?: "page" | "dialog";
}) {
  const id = useId();
  const current = useDemoPersonaId();
  const ctx = useContext(PersonaSwitchContext);
  const triggerRef = useRef<HTMLButtonElement>(null);
  if (!import.meta.env.DEV || !ctx) return null;
  const description = DEMO_PERSONAS.find((p) => p.id === current)
    ?.description;

  return (
    <Alert
      variant="warning"
      role="group"
      aria-label="Demo persona"
      className={
        variant === "page"
          ? "mx-4 mt-3 block w-auto border-dashed border-[#92400e] bg-[#fffbeb]"
          : "mb-4 block border-dashed border-[#92400e] bg-[#fffbeb]"
      }
      data-testid="demo-persona-switcher"
      data-variant={variant}
    >
      <FieldLabel
        htmlFor={id}
        className="mb-1 block text-[#92400e]"
      >
        Demo persona (development only, fictional)
      </FieldLabel>
      <div className="max-w-md">
        <Select
          value={current}
          disabled={ctx.busy}
          onValueChange={(v) =>
            ctx.requestSwitch(v as DemoPersonaId, triggerRef.current)
          }
        >
          <SelectTrigger
            ref={triggerRef}
            id={id}
            surface="base"
            aria-describedby={`${id}-help`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent wrapOptions>
            {DEMO_PERSONAS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p
        id={`${id}-help`}
        className="slds-text-3 mt-1 text-[#92400e]"
      >
        {ctx.busy
          ? "Switching is disabled while a document is being saved."
          : description}{" "}
        This is not a real role policy.
      </p>
    </Alert>
  );
}