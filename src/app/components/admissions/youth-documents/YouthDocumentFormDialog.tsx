import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FileText } from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";
import { Alert, AlertDescription } from "../../ui/alert";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { DateInput } from "../../ui/date-input";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { FieldError, FieldLabel } from "../../ui/field";
import { FileUpload } from "../../ui/file-upload";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";
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
import { isoToMdy, mdyToIso } from "../../../lib/dateFormat";
import { uploadAvailability } from "../../../lib/youthDocumentsAvailability";
import { useUnsavedChangesGuard } from "../../../lib/useUnsavedChangesGuard";
import {
  calculateExpiration,
  findEntryByTypeAndName,
  getCatalog,
  isValidIsoDate,
  namesForType,
  restrictedFolder,
} from "../../../data/youthDocumentCatalog";
import {
  can,
  currentDocumentAccess,
} from "../../../data/youthDocumentAccess";
import {
  gatewaySupportsAdmissionOwner,
  getDocumentGateway,
} from "../../../data/youthDocumentGateway";
import {
  createYouthDocument,
  defaultDateFiled,
  updateYouthDocument,
  type FieldErrors,
} from "../../../data/youthDocumentStore";
import {
  ACCEPTED_MEDIA_TYPES,
  DOCUMENT_TYPES,
  type DocumentOwnerScope,
  type YouthDocument,
} from "../../../data/youthDocumentTypes";

// Upload Document / Edit Document modal (US 20147). One form, two modes.
//
// Edit mode keeps the stable id, Youth, audit-creation fields, Date Filed and
// the CURRENT FILE: choosing a replacement file is not offered because the
// replace-vs-new-record policy is unconfirmed (reported as pending).

const ACCEPT = [
  ".png",
  ".jpg",
  ".jpeg",
  ".pdf",
  ...ACCEPTED_MEDIA_TYPES,
].join(",");

interface Draft {
  documentType: string;
  documentName: string;
  restricted: boolean;
  dateFiled: string; // ISO
  dateExecuted: string; // ISO (or partial text while typing)
  /** Staff override of a calculated expiration (only if the rule allows). */
  expirationOverride: string | null;
  descriptor: string;
}

function initialDraft(doc: YouthDocument | null): Draft {
  return doc
    ? {
        documentType: doc.documentType,
        documentName: doc.documentName,
        restricted: doc.restricted,
        dateFiled: doc.dateFiled,
        dateExecuted: doc.dateExecuted ?? "",
        // The saved value is shown and resubmitted unchanged; it is only
        // recalculated when the classification or the rule's base date
        // changes (those handlers reset it to null).
        expirationOverride: doc.expirationDate,
        descriptor: doc.descriptor,
      }
    : {
        documentType: "",
        documentName: "",
        restricted: false,
        dateFiled: defaultDateFiled(),
        dateExecuted: "",
        expirationOverride: null,
        descriptor: "",
      };
}

const NO_BASE_DATE =
  "Expiration cannot be calculated without a valid base date.";

function Help({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p
      id={id}
      className="slds-text-3 mt-1 text-[var(--slds-g-color-text-weak)]"
    >
      {children}
    </p>
  );
}

export function YouthDocumentFormDialog({
  mode,
  scope,
  document: doc,
  open,
  onClose,
  onSaved,
  onActivityChange,
}: {
  mode: "create" | "edit";
  /** Verified owner scope: new uploads go to `scope.primary`; edits are
   *  limited to records inside the scope. */
  scope: DocumentOwnerScope;
  /** The record being edited (edit mode). */
  document: YouthDocument | null;
  open: boolean;
  onClose: () => void;
  onSaved: (doc: YouthDocument) => void;
  /** Reports unsaved edits / a write in flight (persona switching). */
  onActivityChange?: (a: { dirty: boolean; busy: boolean }) => void;
}) {
  const base = useId();
  const initial = useMemo(() => initialDraft(doc), [doc]);
  const [draft, setDraft] = useState<Draft>(initial);
  const [file, setFile] = useState<File | null>(null);
  // Set only while a Date Executed edit has reset a saved expiration because
  // the rule's base date changed: lets "undo" restore it. Cleared by a manual
  // expiration edit or any classification change.
  const undoExpiration = useRef<{
    dateExecuted: string;
    override: string | null;
    classKey: string;
  } | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  // One id per user action: duplicate clicks and retries reuse it.
  const requestId = useRef(
    `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const [directUploadUrl, setDirectUploadUrl] = useState<
    string | null
  >(null);

  const access = currentDocumentAccess();
  const catalog = getCatalog();
  const catalogReady = catalog.status === "available";
  const restrictedFolderName = restrictedFolder();

  useEffect(() => {
    if (!open) return;
    Promise.resolve(getDocumentGateway()?.getUploadPolicy())
      .then((p) => setDirectUploadUrl(p?.directUploadUrl ?? null))
      .catch(() => setDirectUploadUrl(null));
  }, [open]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  // ── Derived catalog state ─────────────────────────────────────────────
  const entries = draft.documentType
    ? namesForType(draft.documentType)
    : [];
  const entry = findEntryByTypeAndName(
    draft.documentType,
    draft.documentName,
  );
  // A legacy value (absent from the catalog) is preserved and shown while
  // the classification is unchanged.
  const legacyKept =
    mode === "edit" &&
    !!doc &&
    !entry &&
    draft.documentType === doc.documentType &&
    draft.documentName === doc.documentName;
  const rule = entry?.renewal;
  const calculated = calculateExpiration(rule, {
    dateExecuted: draft.dateExecuted || null,
    dateFiled: draft.dateFiled || null,
  });
  const overridable =
    rule?.kind === "recurring" && rule.staffOverride === true;
  const expirationShown = legacyKept
    ? (doc?.expirationDate ?? "")
    : draft.expirationOverride !== null
      ? draft.expirationOverride
      : rule?.kind === "recurring"
        ? (calculated ?? "")
        : "";
  const baseFolder = legacyKept
    ? (doc?.baseFolder ?? "")
    : (entry?.folder ?? "");
  const folderShown = draft.restricted
    ? (restrictedFolderName ?? baseFolder)
    : baseFolder;

  // ── Restricted checkbox availability ──────────────────────────────────
  const wasRestricted = !!doc?.restricted;
  const canToggleRestricted =
    restrictedFolderName !== null &&
    (draft.restricted
      ? wasRestricted && mode === "edit"
        ? can(access, "unrestrict")
        : true
      : can(access, "mark-restricted"));
  const restrictedHelp =
    restrictedFolderName === null
      ? "Restricting documents is unavailable: the restricted folder is not configured."
      : !canToggleRestricted
        ? "You do not have permission to change this setting."
        : "Restricted documents are filed under the restricted folder.";

  // ── Dirty tracking ────────────────────────────────────────────────────
  const dirty =
    file !== null ||
    draft.documentType !== initial.documentType ||
    draft.documentName !== initial.documentName ||
    draft.restricted !== initial.restricted ||
    draft.dateExecuted !== initial.dateExecuted ||
    draft.expirationOverride !== initial.expirationOverride ||
    draft.descriptor !== initial.descriptor;

  // Guards navigation (back/forward, section links) while editing.
  const guard = useUnsavedChangesGuard(
    open && dirty,
    () => {},
    "document",
  );

  useEffect(() => {
    onActivityChange?.({ dirty, busy: submitting });
  }, [dirty, submitting]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(
    () => () => onActivityChange?.({ dirty: false, busy: false }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const requestClose = () => {
    if (submittingRef.current) return;
    if (dirty) setConfirmDiscard(true);
    else onClose();
  };

  // ── Submit ────────────────────────────────────────────────────────────
  // Same decision as the page's Upload action.
  const availability = uploadAvailability({
    hasOwner: !!scope,
    canUpload: can(access, "upload"),
    catalogReady,
    storageReady: getDocumentGateway() !== null,
    ownerIsAdmission: scope.primary.kind === "admission",
    admissionFilingReady: gatewaySupportsAdmissionOwner(),
  });
  const blocked =
    mode === "create" &&
    (availability.state !== "enabled" ||
      (!!draft.documentType && entries.length === 0));

  async function submit() {
    if (submittingRef.current) return;
    setFormError(null);
    // Instant client check; the service re-validates everything.
    const local: FieldErrors = {};
    if (!draft.documentType) local.documentType = "Select a Document Type.";
    if (!draft.documentName) local.documentName = "Select a Document Name.";
    // PROVISIONAL (pending the confirmed edit policy): an existing populated
    // Date Executed cannot be cleared. Blank legacy dates may stay blank.
    if (mode === "edit" && initial.dateExecuted && !draft.dateExecuted)
      local.dateExecuted =
        "Date Executed cannot be cleared once it has been entered.";
    if (mode === "create") {
      if (!draft.dateExecuted) local.dateExecuted = "Date Executed is required.";
      if (!file) local.file = "Select a document file.";
    }
    if (overridable) {
      // The effective date is what the field shows: an emptied override is
      // the calculated date (which must exist); typed text must be valid.
      const ov = draft.expirationOverride;
      if (ov === "") {
        if (!calculated) local.expirationDate = NO_BASE_DATE;
      } else if (ov && !isValidIsoDate(ov)) {
        local.expirationDate = "Enter a valid date.";
      }
    }
    if (Object.keys(local).length) {
      setErrors(local);
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const values = {
        documentType: draft.documentType,
        documentName: draft.documentName,
        restricted: draft.restricted,
        dateFiled: draft.dateFiled,
        dateExecuted: draft.dateExecuted,
        expirationDate:
          draft.expirationOverride === ""
            ? (calculated ?? "")
            : (draft.expirationOverride ?? expirationShown ?? ""),
        descriptor: draft.descriptor,
      };
      const r =
        mode === "create"
          ? await createYouthDocument({
              ...values,
              owner: scope.primary,
              requestId: requestId.current,
              file,
            })
          : await updateYouthDocument(doc!.id, {
              scope,
              documentType: values.documentType,
              documentName: values.documentName,
              restricted: values.restricted,
              dateExecuted: values.dateExecuted,
              expirationDate: values.expirationDate,
              descriptor: values.descriptor,
            });
      if (r.ok) {
        toast.success(
          mode === "create"
            ? "Document uploaded."
            : "Document updated.",
        );
        onSaved(r.value);
        return;
      }
      // Keep everything the user typed.
      setErrors(r.fieldErrors ?? {});
      setFormError(
        r.fieldErrors && !r.message
          ? "Review the highlighted fields."
          : (r.message ?? "The document could not be saved."),
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  const tooLarge = errors.file === "TOO_LARGE";
  const ids = {
    type: `${base}-type`,
    name: `${base}-name`,
    folder: `${base}-folder`,
    restricted: `${base}-restricted`,
    file: `${base}-file`,
    filed: `${base}-filed`,
    executed: `${base}-executed`,
    expiration: `${base}-expiration`,
    descriptor: `${base}-descriptor`,
  };
  const nameOptions = [
    ...entries.map((e) => e.documentName),
    ...(legacyKept && !entries.some((e) => e.documentName === doc!.documentName)
      ? [doc!.documentName]
      : []),
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && requestClose()}>
        <DialogContent
          size="xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Upload Document" : "Edit Document"}
            </DialogTitle>
            <DialogDescription>
              Fields marked * are required.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <form
              id={`${base}-form`}
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
              className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2"
            >
              {formError && (
                <Alert variant="error" className="sm:col-span-2">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              {mode === "create" && availability.state === "disabled" && (
                <Alert
                  variant="info"
                  role="status"
                  className="sm:col-span-2"
                >
                  <AlertDescription>{availability.reason}</AlertDescription>
                </Alert>
              )}

              <div>
                <FieldLabel htmlFor={ids.type} required>Document Type</FieldLabel>
                <Select
                  value={draft.documentType}
                  onValueChange={(v) => {
                    // A new type invalidates name, folder and expiration.
                    undoExpiration.current = null;
                    setDraft((d) => ({
                      ...d,
                      documentType: v,
                      documentName: "",
                      expirationOverride: null,
                    }));
                    setErrors((e) => ({
                      ...e,
                      documentType: undefined,
                      documentName: undefined,
                    }));
                  }}
                >
                  <SelectTrigger
                    id={ids.type}
                    surface="base"
                    aria-required
                    disabled={submitting}
                    aria-invalid={!!errors.documentType}
                    aria-describedby={errors.documentType ? `${ids.type}-err` : undefined}
                  >
                    <SelectValue placeholder="Select a type…" />
                  </SelectTrigger>
                  <SelectContent wrapOptions>
                    {DOCUMENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError id={`${ids.type}-err`} role="alert">{errors.documentType}</FieldError>
              </div>

              {draft.documentType && (
                <>
                  <div>
                    <FieldLabel htmlFor={ids.name} required>Document Name</FieldLabel>
                    <Select
                      value={draft.documentName}
                      onValueChange={(v) => {
                        undoExpiration.current = null;
                        setDraft((d) => ({
                          ...d,
                          documentName: v,
                          expirationOverride: null,
                        }));
                        setErrors((e) => ({ ...e, documentName: undefined }));
                      }}
                    >
                      <SelectTrigger
                        id={ids.name}
                        surface="base"
                        aria-required
                        aria-invalid={!!errors.documentName}
                        aria-describedby={`${ids.name}-help ${ids.name}-err`}
                        disabled={nameOptions.length === 0 || submitting}
                      >
                        <SelectValue placeholder="Select a name…" />
                      </SelectTrigger>
                      <SelectContent wrapOptions>
                        {nameOptions.map((n) => (
                          <SelectItem key={n} value={n}>
                            {n}
                            {legacyKept && n === doc!.documentName && !entries.some((e) => e.documentName === n)
                              ? " (not in current catalog)"
                              : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {nameOptions.length === 0 && (
                      <Help id={`${ids.name}-help`}>
                        Configuration for this Document Type is
                        unavailable, so no Document Name can be
                        selected.
                      </Help>
                    )}
                    <FieldError id={`${ids.name}-err`} role="alert">{errors.documentName}</FieldError>
                  </div>

                  <div>
                    <FieldLabel htmlFor={ids.folder}>Folder</FieldLabel>
                    <Input
                      id={ids.folder}
                      readOnly
                      value={draft.documentName ? folderShown : ""}
                      aria-describedby={`${ids.folder}-help`}
                    />
                    {draft.restricted && baseFolder && (
                      <Help id={`${ids.folder}-help`}>
                        Mapped folder: {baseFolder}
                      </Help>
                    )}
                  </div>

                  <div className="flex flex-col justify-end">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={ids.restricted}
                        checked={draft.restricted}
                        disabled={!canToggleRestricted || submitting}
                        aria-describedby={`${ids.restricted}-help`}
                        onCheckedChange={(c) => set("restricted", c === true)}
                      />
                      <label htmlFor={ids.restricted} className="slds-form-label">
                        Document Restricted
                      </label>
                    </div>
                    <Help id={`${ids.restricted}-help`}>{restrictedHelp}</Help>
                    <FieldError id={`${ids.restricted}-err`} role="alert">{errors.restricted}</FieldError>
                  </div>

                  <div className="min-w-0 sm:col-span-2">
                    <FieldLabel htmlFor={ids.file} required={mode === "create"}>Document File</FieldLabel>
                    {mode === "create" ? (
                      <>
                        <FileUpload
                          variant="browse"
                          id={ids.file}
                          aria-required
                          disabled={submitting}
                          rejectedMessage="Unsupported file type. Select a PNG, JPG/JPEG or PDF."
                          accept={ACCEPT}
                          fileName={file?.name}
                          placeholder="Drag & drop a file here, or click to upload"
                          state={errors.file ? "error" : undefined}
                          aria-describedby={
                            errors.file
                              ? `${ids.file}-help ${ids.file}-err`
                              : `${ids.file}-help`
                          }
                          onFilesSelected={(files) => {
                            setFile(files[0] ?? null);
                            setErrors((e) => ({ ...e, file: undefined }));
                          }}
                        />
                        <Help id={`${ids.file}-help`}>PNG, JPG/JPEG or PDF.</Help>
                        {tooLarge ? (
                          <FieldError id={`${ids.file}-err`} role="alert">
                            This file is larger than the maximum upload size. The
                            document must be uploaded directly to Laserfiche.{" "}
                            {directUploadUrl && (
                              <a
                                href={directUploadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline"
                              >
                                Open Laserfiche
                              </a>
                            )}
                          </FieldError>
                        ) : (
                          <FieldError id={`${ids.file}-err`} role="alert">{errors.file}</FieldError>
                        )}
                      </>
                    ) : (
                      <>
                        <p
                          id={ids.file}
                          className="flex items-center gap-2 font-medium break-all"
                        >
                          <FileText
                            className="h-4 w-4 shrink-0 text-[#145F33]"
                            aria-hidden
                          />
                          {doc?.file.name}
                        </p>
                        <Help>
                          The current file is kept. Replacing the file is not
                          available yet.
                        </Help>
                      </>
                    )}
                  </div>

                  <div>
                    <FieldLabel htmlFor={ids.filed} required>Date Filed</FieldLabel>
                    {/* Salesforce filing date: set at upload and not editable
                        here (correction/backdating policy is unconfirmed). */}
                    <DateInput
                      id={ids.filed}
                      value={isoToMdy(draft.dateFiled)}
                      onChange={() => {}}
                      disabled
                      aria-describedby={`${ids.filed}-help`}
                    />
                    <Help id={`${ids.filed}-help`}>
                      Supplied by the system: the date the document was
                      filed in Salesforce.
                    </Help>
                  </div>

                  <div>
                    <FieldLabel htmlFor={ids.executed} required={mode === "create"}>Date Executed</FieldLabel>
                    <DateInput
                      id={ids.executed}
                      value={isoToMdy(draft.dateExecuted)}
                      onChange={(v) => {
                        const iso = mdyToIso(v);
                        // Only a rule based on Date Executed is affected by
                        // this field; with a Date Filed base (or no
                        // recurring rule) the expiration is left alone.
                        const baseIsExecuted =
                          rule?.kind === "recurring" &&
                          rule.base === "dateExecuted";
                        let next = draft.expirationOverride;
                        if (baseIsExecuted && iso !== draft.dateExecuted) {
                          const u = undoExpiration.current;
                          const classKey = `${draft.documentType}|${draft.documentName}`;
                          if (
                            u &&
                            u.classKey === classKey &&
                            u.dateExecuted === iso
                          ) {
                            // genuinely undoing the base-date change
                            next = u.override;
                            undoExpiration.current = null;
                          } else {
                            if (!u)
                              undoExpiration.current = {
                                dateExecuted: draft.dateExecuted,
                                override: draft.expirationOverride,
                                classKey,
                              };
                            next = null; // recalculate from the new date
                          }
                        }
                        setDraft((d) => ({
                          ...d,
                          dateExecuted: iso,
                          expirationOverride: next,
                        }));
                        setErrors((e) => ({ ...e, dateExecuted: undefined }));
                      }}
                      disabled={submitting}
                      aria-invalid={!!errors.dateExecuted}
                      aria-describedby={`${ids.executed}-err`}
                    />
                    <FieldError id={`${ids.executed}-err`} role="alert">{errors.dateExecuted}</FieldError>
                  </div>

                  <div>
                    <FieldLabel htmlFor={ids.expiration}>Expiration Date</FieldLabel>
                    <DateInput
                      id={ids.expiration}
                      value={isoToMdy(expirationShown)}
                      onChange={(v) => {
                        // Blank or partial text is allowed while typing.
                        undoExpiration.current = null;
                        setDraft((d) => ({
                          ...d,
                          expirationOverride: mdyToIso(v),
                        }));
                        setErrors((e) => ({
                          ...e,
                          expirationDate: undefined,
                        }));
                      }}
                      onBlur={() => {
                        const ov = draft.expirationOverride;
                        if (ov === "") {
                          // An emptied override reverts to the calculation.
                          setDraft((d) => ({ ...d, expirationOverride: null }));
                          setErrors((e) => ({
                            ...e,
                            expirationDate: calculated
                              ? undefined
                              : NO_BASE_DATE,
                          }));
                        } else if (ov && !isValidIsoDate(ov)) {
                          setErrors((e) => ({
                            ...e,
                            expirationDate: "Enter a valid date.",
                          }));
                        }
                      }}
                      disabled={!overridable || submitting}
                      aria-invalid={!!errors.expirationDate}
                      aria-describedby={`${ids.expiration}-help ${ids.expiration}-err`}
                    />
                    <Help id={`${ids.expiration}-help`}>
                      {legacyKept
                        ? "This document is not in the current catalog; its existing value is kept."
                        : !draft.documentName
                          ? "Set by the selected document's renewal rule."
                          : rule?.kind === "recurring"
                            ? overridable
                              ? "Calculated from the renewal rule; you may change it."
                              : "Calculated from the renewal rule."
                            : rule?.kind === "one-time"
                              ? "No expiration (one-time document)."
                              : "The renewal rule for this document has not been configured, so the expiration date cannot be determined yet."}
                    </Help>
                    <FieldError id={`${ids.expiration}-err`} role="alert">{errors.expirationDate}</FieldError>
                  </div>

                  <div className="sm:col-span-2">
                    <FieldLabel htmlFor={ids.descriptor}>Descriptor</FieldLabel>
                    <Textarea
                      id={ids.descriptor}
                      value={draft.descriptor}
                      maxLength={255}
                      disabled={submitting}
                      aria-describedby={`${ids.descriptor}-help`}
                      onChange={(e) => set("descriptor", e.target.value)}
                    />
                    <Help id={`${ids.descriptor}-help`}>
                      {draft.descriptor.length}/255 characters
                    </Help>
                  </div>
                </>
              )}
            </form>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={requestClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={`${base}-form`}
              disabled={submitting || blocked}
            >
              {submitting
                ? mode === "create"
                  ? "Uploading…"
                  : "Saving…"
                : mode === "create"
                  ? "Upload Document"
                  : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your changes have not been saved. Leaving this document will
              discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setConfirmDiscard(false);
                onClose();
              }}
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {guard}
    </>
  );
}