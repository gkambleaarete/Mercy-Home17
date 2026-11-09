import { Pencil, Plus } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { SearchableSelect } from "../ui/searchable-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Textarea } from "../ui/textarea";
import type { TransitionContact } from "../../data/transitionSummaryStore";
import {
  constituentContactInfo,
  contactConstituentOptions,
} from "../../data/transitionSummaryDetailsSources";

// Internal Transition Summary → Details → Contacts (US 20101).
// Fully controlled: the contact list and the open Add/Modify form live in
// the summary editor's draft, so nothing here writes to the store, and an
// unfinished form counts as an unsaved change for navigation protection.

// Same email-format convention as the Contact and Employment forms.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactFormErrors {
  constituentId?: string;
  name?: string;
  email?: string;
}

export interface ContactFormState {
  mode: "add" | "modify";
  /** The row as it was when the dialog opened (Modify) or a blank row. */
  initial: TransitionContact;
  value: TransitionContact;
  errors: ContactFormErrors;
}

export function newContactId(): string {
  return `TC-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const blankContact = (
  id: string,
  kind: TransitionContact["kind"],
): TransitionContact => ({
  id,
  kind,
  name: "",
  phone: "",
  email: "",
  address: "",
  description: "",
});

export function newContactForm(): ContactFormState {
  const initial = blankContact(newContactId(), "Constituent");
  return { mode: "add", initial, value: initial, errors: {} };
}

export function modifyContactForm(
  c: TransitionContact,
): ContactFormState {
  return { mode: "modify", initial: c, value: c, errors: {} };
}

export const contactFormDirty = (f: ContactFormState | null) =>
  !!f && JSON.stringify(f.value) !== JSON.stringify(f.initial);

const isAvailable = (id: number | undefined) =>
  id !== undefined &&
  contactConstituentOptions().some((o) => o.id === id);

/** Trimmed contact, or errors. A linked constituent that is no longer
 *  available may stay linked only if it was already saved on this row. */
export function validateContact(
  f: ContactFormState,
):
  | { contact: TransitionContact }
  | { errors: ContactFormErrors } {
  const v = f.value;
  const c: TransitionContact = {
    ...v,
    name: v.name.trim(),
    phone: v.phone.trim(),
    email: v.email.trim(),
    address: v.address.trim(),
    description: v.description.trim(),
  };
  const errors: ContactFormErrors = {};
  if (v.kind === "Constituent") {
    if (v.constituentId === undefined)
      errors.constituentId = "Select a constituent.";
    else if (
      !isAvailable(v.constituentId) &&
      v.constituentId !== f.initial.constituentId
    )
      errors.constituentId = "Select an available constituent.";
  } else if (!c.name) errors.name = "Enter a name.";
  if (c.email && !EMAIL_RE.test(c.email))
    errors.email = "Enter a valid email address.";
  return Object.keys(errors).length
    ? { errors }
    : { contact: c };
}

function personPlace(c: TransitionContact): string {
  if (c.kind === "Constituent" && !isAvailable(c.constituentId))
    return `${c.name || "Constituent"} (no longer available)`;
  return c.name;
}

function FieldError({ id, msg }: { id: string; msg?: string }) {
  return msg ? (
    <p
      id={id}
      role="alert"
      className="slds-text-3 text-destructive"
    >
      {msg}
    </p>
  ) : null;
}

export function TransitionContactsSection({
  contacts,
  readOnly,
  form,
  onFormChange,
  onApply,
}: {
  contacts: TransitionContact[];
  readOnly: boolean;
  form: ContactFormState | null;
  onFormChange: (f: ContactFormState | null) => void;
  /** Adds or replaces (by id) the validated row in the summary draft. */
  onApply: (c: TransitionContact) => void;
}) {
  const options = contactConstituentOptions();
  const v = form?.value;
  const set = (patch: Partial<TransitionContact>) =>
    form &&
    onFormChange({
      ...form,
      value: { ...form.value, ...patch },
      errors: {},
    });

  // A different identity never inherits the previous person's details.
  const changeKind = (kind: TransitionContact["kind"]) =>
    form &&
    onFormChange({
      ...form,
      value: blankContact(form.value.id, kind),
      errors: {},
    });
  const selectConstituent = (raw: string) => {
    if (!form) return;
    const id = Number(raw);
    const info = constituentContactInfo(id);
    onFormChange({
      ...form,
      value: {
        ...blankContact(form.value.id, "Constituent"),
        constituentId: id,
        name: info.name,
        phone: info.phone,
        email: info.email,
        address: info.address,
      },
      errors: {},
    });
  };
  const apply = () => {
    if (!form) return;
    const r = validateContact(form);
    if ("errors" in r)
      onFormChange({ ...form, errors: r.errors });
    else {
      onApply(r.contact);
      onFormChange(null);
    }
  };

  const selectorOptions = [
    ...(v?.constituentId !== undefined &&
    !isAvailable(v.constituentId)
      ? [
          {
            value: String(v.constituentId),
            label: `${v.name || "Constituent"} (no longer available)`,
          },
        ]
      : []),
    ...options.map((o) => ({
      value: String(o.id),
      label: o.label,
    })),
  ];
  const e = form?.errors ?? {};

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h5
          id="its-contacts-heading"
          className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)]"
        >
          Contacts
        </h5>
        {!readOnly && (
          <Button
            type="button"
            variant="outline-primary"
            size="sm"
            onClick={() => onFormChange(newContactForm())}
          >
            <Plus />
            Add Contact
          </Button>
        )}
      </div>
      <Card variant="container">
        <Table aria-labelledby="its-contacts-heading">
          <TableHeader>
            <TableRow hoverable={false}>
              {[
                "Person/Place",
                "Phone",
                "Email",
                "Address",
                "Description",
              ].map((h) => (
                <TableHead key={h} variant="slds">
                  {h}
                </TableHead>
              ))}
              {!readOnly && (
                <TableHead variant="slds">
                  <span className="sr-only">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 && (
              <TableRow hoverable={false}>
                <TableCell
                  tone="muted"
                  colSpan={readOnly ? 5 : 6}
                >
                  No contacts added.
                </TableCell>
              </TableRow>
            )}
            {contacts.map((c) => (
              <TableRow key={c.id}>
                <TableCell wrap>
                  {personPlace(c) || "—"}
                </TableCell>
                <TableCell>{c.phone || "—"}</TableCell>
                <TableCell wrap>{c.email || "—"}</TableCell>
                <TableCell wrap>{c.address || "—"}</TableCell>
                <TableCell wrap>
                  <span className="whitespace-pre-wrap">
                    {c.description || "—"}
                  </span>
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost-primary"
                      size="icon-xs"
                      aria-label={`Modify contact ${personPlace(c) || c.id}`}
                      onClick={() =>
                        onFormChange(modifyContactForm(c))
                      }
                    >
                      <Pencil />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={!!form && !readOnly}
        onOpenChange={(o) => !o && onFormChange(null)}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {form?.mode === "modify"
                ? "Modify Contact"
                : "Add Contact"}
            </DialogTitle>
            <DialogDescription>
              Contact details are saved with this summary when
              you save it. Changes here don't update the
              constituent's record.
            </DialogDescription>
          </DialogHeader>
          {v && (
            <DialogBody className="space-y-4">
              <RadioGroup
                aria-label="Contact type"
                value={v.kind}
                onValueChange={(k) =>
                  changeKind(k as TransitionContact["kind"])
                }
              >
                {(
                  ["Constituent", "Non-Constituent"] as const
                ).map((k) => (
                  <div
                    key={k}
                    className="flex items-center gap-2"
                  >
                    <RadioGroupItem
                      value={k}
                      id={`its-contact-kind-${k}`}
                    />
                    <Label htmlFor={`its-contact-kind-${k}`}>
                      {k}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {v.kind === "Constituent" && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="its-contact-constituent"
                    className="slds-form-label"
                  >
                    Constituent
                  </Label>
                  <SearchableSelect
                    id="its-contact-constituent"
                    value={
                      v.constituentId === undefined
                        ? ""
                        : String(v.constituentId)
                    }
                    onValueChange={selectConstituent}
                    options={selectorOptions}
                    placeholder="Select a constituent"
                    searchPlaceholder="Search constituents…"
                    aria-invalid={
                      e.constituentId ? true : undefined
                    }
                    aria-describedby={
                      e.constituentId
                        ? "its-contact-constituent-error"
                        : undefined
                    }
                  />
                  <FieldError
                    id="its-contact-constituent-error"
                    msg={e.constituentId}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label
                  htmlFor="its-contact-name"
                  className="slds-form-label"
                >
                  Name
                </Label>
                <Input
                  id="its-contact-name"
                  value={v.name}
                  readOnly={v.kind === "Constituent"}
                  onChange={(ev) =>
                    set({ name: ev.target.value })
                  }
                  placeholder={
                    v.kind === "Constituent"
                      ? "Filled from the selected constituent"
                      : "Enter a name or place"
                  }
                  aria-invalid={e.name ? true : undefined}
                  aria-describedby={
                    e.name
                      ? "its-contact-name-error"
                      : undefined
                  }
                />
                <FieldError
                  id="its-contact-name-error"
                  msg={e.name}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="its-contact-phone"
                    className="slds-form-label"
                  >
                    Phone
                  </Label>
                  <Input
                    id="its-contact-phone"
                    type="tel"
                    value={v.phone}
                    onChange={(ev) =>
                      set({ phone: ev.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="its-contact-email"
                    className="slds-form-label"
                  >
                    Email
                  </Label>
                  <Input
                    id="its-contact-email"
                    type="email"
                    value={v.email}
                    onChange={(ev) =>
                      set({ email: ev.target.value })
                    }
                    aria-invalid={e.email ? true : undefined}
                    aria-describedby={
                      e.email
                        ? "its-contact-email-error"
                        : undefined
                    }
                  />
                  <FieldError
                    id="its-contact-email-error"
                    msg={e.email}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="its-contact-address"
                  className="slds-form-label"
                >
                  Address
                </Label>
                <Input
                  id="its-contact-address"
                  value={v.address}
                  onChange={(ev) =>
                    set({ address: ev.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="its-contact-description"
                  className="slds-form-label"
                >
                  Description
                </Label>
                <Textarea
                  id="its-contact-description"
                  value={v.description}
                  onChange={(ev) =>
                    set({ description: ev.target.value })
                  }
                />
              </div>
            </DialogBody>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onFormChange(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={apply}>
              {form?.mode === "modify"
                ? "Apply Changes"
                : "Add Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}