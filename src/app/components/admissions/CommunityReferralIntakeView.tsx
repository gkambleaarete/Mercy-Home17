import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash2, Plus, X, ChevronUp, ChevronDown, Check } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner@2.0.3";

// ─── Master lists ─────────────────────────────────────────────────────────────

const DOCUMENT_OPTIONS = [
  "Birth Certificate",
  "DD-214 (Veteran)",
  "Documented IQ",
  "Driver's License",
  "Guardian ID",
  "HS Diploma/GED",
  "IEP",
  "Medical Card",
  "Photo ID",
  "Physical Exam for Child",
  "Physical Exam for Self",
  "Proof of Guardianship",
  "Proof of Income",
  "Psychological Evaluation",
  "Social Security Card",
  "State ID",
  "Transcripts",
  "Other",
];

const PAYMENT_OPTIONS = [
  "Flat Fee",
  "Medicaid",
  "Medicare",
  "No Cost",
  "Private Insurance",
  "Sliding Scale",
  "Other",
];

const ELIGIBILITY_OPTIONS = [
  "Access to a Lease Cosigner",
  "Autism Spectrum Disorder Diagnosis",
  "College Enrollment",
  "Cook County Resident",
  "Currently Unemployed",
  "Driver's License",
  "Enrolled in a Chicago Coordinated Entry System",
  "High School Diploma",
  "HMIS/CES System",
  "Homelessness",
  "Illinois DHS/DDD Child/Adult Waiver",
  "Illinois Resident",
  "Income Requirement",
  "IQ of 70 or Higher",
  "Juvenile Court Involved Youth",
  "Letter of Recommendation",
  "LGBTQ+",
  "Mental Illness",
  "No Outstanding Warrants",
  "No Violent Convictions",
  "Pass Background Check",
  "Pass Drug Test/Sober",
  "Pass Psychological Assessment",
  "Physically Capable/Stable",
  "Pregnant/Parenting",
  "Provide Security Deposit",
  "Referred by a Case Worker/Partner Organization",
  "Reliable Childcare",
  "Single Mother",
  "Stable Housing",
  "Other",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface IntakeRecord {
  id: number;
  value: string;
  isCustom: boolean;
}

type SectionConfig = {
  title: string;
  subtitle: string;
  addLabel: string;
  modalAddTitle: string;
  modalEditTitle: string;
  fieldLabel: string;
  otherFieldLabel: string;
  otherPlaceholder: string;
  columnLabel: string;
  placeholder: string;
  options: string[];
  emptyTitle: string;
  emptySubtitle: string;
  removeTitle: string;
  removeMessage: (value: string) => string;
  removeConfirmLabel: string;
  duplicateError: string;
  addSuccessOne: string;
  addSuccessMany: (n: number) => string;
  editSuccess: string;
  removeSuccess: string;
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--slds-g-color-border-base-1)",
  backgroundColor: "var(--slds-g-color-background-base)",
  color: "var(--slds-g-color-text-default)",
};

const errorInputStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: "#c23934",
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full slds-text-3"
      style={{
        backgroundColor: "#e8f5e9",
        color: "#145F33",
        border: "1px solid #b2dfdb",
      }}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="rounded-full hover:opacity-70"
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#145F33", lineHeight: 1 }}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// ─── Multi-select combobox (portal dropdown) ──────────────────────────────────

function MultiSelectCombobox({
  options,
  selected,
  onToggle,
  assignedValues,
  placeholder,
  error,
}: {
  options: string[];
  selected: string[];
  onToggle: (opt: string) => void;
  assignedValues: string[];
  placeholder: string;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const nonOtherOptions = options.filter((o) => o !== "Other");
  const filtered = nonOtherOptions.filter(
    (o) => !search.trim() || o.toLowerCase().includes(search.toLowerCase())
  );
  // Always show "Other" at bottom if it passes search or search is empty
  const showOther = options.includes("Other") && (!search.trim() || "other".includes(search.toLowerCase()));

  function openDrop() {
    const rect = inputRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDropPos({ top: rect.bottom + 2, left: rect.left, width: rect.width });
    setOpen(true);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={(e) => { setSearch(e.target.value); openDrop(); }}
        onFocus={openDrop}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
        style={error ? errorInputStyle : inputStyle}
      />
      {error && <p className="slds-text-3 mt-0.5" style={{ color: "#c23934" }}>{error}</p>}

      {open && dropPos && createPortal(
        <div
          style={{
            position: "fixed",
            top: dropPos.top,
            left: dropPos.left,
            width: dropPos.width,
            zIndex: 9999,
            backgroundColor: "var(--slds-g-color-background-base)",
            border: "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: 4,
            maxHeight: 240,
            overflowY: "auto",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          }}
        >
          {filtered.length === 0 && !showOther ? (
            <div className="px-3 py-2 slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
              No results
            </div>
          ) : (
            <>
              {filtered.map((opt) => {
                const isAdded = assignedValues.includes(opt) && !selected.includes(opt);
                const isChecked = selected.includes(opt);
                return (
                  <div
                    key={opt}
                    onMouseDown={(e) => { e.preventDefault(); if (!isAdded) onToggle(opt); }}
                    className="px-3 py-1.5 slds-text-4 flex items-center justify-between gap-2"
                    style={{
                      cursor: isAdded ? "not-allowed" : "pointer",
                      backgroundColor: isChecked ? "#f0faf2" : undefined,
                      color: isAdded ? "var(--slds-g-color-text-weak)" : "var(--slds-g-color-text-default)",
                      opacity: isAdded ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => { if (!isAdded && !isChecked) (e.currentTarget as HTMLDivElement).style.backgroundColor = "var(--slds-g-color-background-alt)"; }}
                    onMouseLeave={(e) => { if (!isAdded && !isChecked) (e.currentTarget as HTMLDivElement).style.backgroundColor = ""; }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                        style={{
                          border: isChecked ? "none" : "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor: isChecked ? "#145F33" : "var(--slds-g-color-background-base)",
                        }}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span>{opt}</span>
                    </div>
                    {isAdded && (
                      <span className="slds-text-3 flex-shrink-0" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        Already added
                      </span>
                    )}
                  </div>
                );
              })}
              {showOther && (
                <div
                  onMouseDown={(e) => { e.preventDefault(); onToggle("Other"); }}
                  className="px-3 py-1.5 slds-text-4 flex items-center gap-2"
                  style={{
                    cursor: "pointer",
                    backgroundColor: selected.includes("Other") ? "#f0faf2" : undefined,
                    borderTop: "1px solid var(--slds-g-color-border-base-1)",
                  }}
                  onMouseEnter={(e) => { if (!selected.includes("Other")) (e.currentTarget as HTMLDivElement).style.backgroundColor = "var(--slds-g-color-background-alt)"; }}
                  onMouseLeave={(e) => { if (!selected.includes("Other")) (e.currentTarget as HTMLDivElement).style.backgroundColor = ""; }}
                >
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      border: selected.includes("Other") ? "none" : "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor: selected.includes("Other") ? "#145F33" : "var(--slds-g-color-background-base)",
                    }}
                  >
                    {selected.includes("Other") && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span style={{ color: "var(--slds-g-color-text-default)" }}>Other</span>
                </div>
              )}
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Single-select combobox (for Edit modal) ──────────────────────────────────

function SingleSelectCombobox({
  options,
  value,
  onChange,
  assignedValues,
  editingValue,
  placeholder,
  error,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  assignedValues: string[];
  editingValue?: string;
  placeholder: string;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value === "Other" ? "Other" : value);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => { setSearch(value === "Other" ? "Other" : value); }, [value]);

  const nonOtherOptions = options.filter((o) => o !== "Other");
  const filtered = nonOtherOptions.filter(
    (o) => !search.trim() || o.toLowerCase().includes(search.toLowerCase())
  );
  const showOther = options.includes("Other") && (!search.trim() || "other".includes(search.toLowerCase()));

  function openDrop() {
    const rect = inputRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDropPos({ top: rect.bottom + 2, left: rect.left, width: rect.width });
    setOpen(true);
  }

  function select(opt: string) {
    onChange(opt);
    setSearch(opt);
    setOpen(false);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={(e) => { setSearch(e.target.value); openDrop(); }}
        onFocus={openDrop}
        onBlur={() => setTimeout(() => { setOpen(false); if (!options.includes(search)) { setSearch(value === "Other" ? "Other" : value); } }, 150)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
        style={error ? errorInputStyle : inputStyle}
      />
      {error && <p className="slds-text-3 mt-0.5" style={{ color: "#c23934" }}>{error}</p>}

      {open && dropPos && createPortal(
        <div
          style={{
            position: "fixed",
            top: dropPos.top,
            left: dropPos.left,
            width: dropPos.width,
            zIndex: 9999,
            backgroundColor: "var(--slds-g-color-background-base)",
            border: "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: 4,
            maxHeight: 240,
            overflowY: "auto",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          }}
        >
          {filtered.length === 0 && !showOther ? (
            <div className="px-3 py-2 slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>No results</div>
          ) : (
            <>
              {filtered.map((opt) => {
                const isAdded = assignedValues.includes(opt) && opt !== editingValue;
                const isSelected = value === opt;
                return (
                  <div
                    key={opt}
                    onMouseDown={(e) => { e.preventDefault(); if (!isAdded) select(opt); }}
                    className="px-3 py-1.5 slds-text-4 flex items-center justify-between"
                    style={{
                      cursor: isAdded ? "not-allowed" : "pointer",
                      backgroundColor: isSelected ? "#f0faf2" : undefined,
                      color: isAdded ? "var(--slds-g-color-text-weak)" : "var(--slds-g-color-text-default)",
                      opacity: isAdded ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => { if (!isAdded && !isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = "var(--slds-g-color-background-alt)"; }}
                    onMouseLeave={(e) => { if (!isAdded && !isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = ""; }}
                  >
                    <span>{opt}</span>
                    {isAdded && <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>Already added</span>}
                  </div>
                );
              })}
              {showOther && (
                <div
                  onMouseDown={(e) => { e.preventDefault(); select("Other"); }}
                  className="px-3 py-1.5 slds-text-4"
                  style={{
                    cursor: "pointer",
                    backgroundColor: value === "Other" ? "#f0faf2" : undefined,
                    color: "var(--slds-g-color-text-default)",
                    borderTop: "1px solid var(--slds-g-color-border-base-1)",
                  }}
                  onMouseEnter={(e) => { if (value !== "Other") (e.currentTarget as HTMLDivElement).style.backgroundColor = "var(--slds-g-color-background-alt)"; }}
                  onMouseLeave={(e) => { if (value !== "Other") (e.currentTarget as HTMLDivElement).style.backgroundColor = ""; }}
                >
                  Other
                </div>
              )}
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Add Modal (multi-select) ─────────────────────────────────────────────────

function AddModal({
  open,
  config,
  assignedValues,
  onClose,
  onSave,
}: {
  open: boolean;
  config: SectionConfig;
  assignedValues: string[];
  onClose: () => void;
  onSave: (items: { value: string; isCustom: boolean }[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const [errors, setErrors] = useState<{ select?: string; other?: string }>({});

  useEffect(() => {
    if (open) { setSelected([]); setOtherText(""); setErrors({}); }
  }, [open]);

  function toggleOpt(opt: string) {
    setSelected((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
    setErrors({});
  }

  function removeChip(opt: string) {
    setSelected((prev) => prev.filter((o) => o !== opt));
  }

  const hasOther = selected.includes("Other");
  const displaySelected = selected.filter((s) => s !== "Other");

  function validate(): boolean {
    const errs: { select?: string; other?: string } = {};
    if (selected.length === 0) { errs.select = "Please select at least one option."; }
    if (hasOther && !otherText.trim()) { errs.other = "This field is required."; }
    if (hasOther && otherText.trim()) {
      const normalized = normalize(otherText);
      const dupInAssigned = assignedValues.some((v) => normalize(v) === normalized);
      const dupInSelected = displaySelected.some((v) => normalize(v) === normalized);
      if (dupInAssigned || dupInSelected) { errs.other = config.duplicateError; }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const items: { value: string; isCustom: boolean }[] = [];
    displaySelected.forEach((v) => items.push({ value: v, isCustom: false }));
    if (hasOther && otherText.trim()) items.push({ value: otherText.trim(), isCustom: true });
    onSave(items);
  }

  const count = displaySelected.length + (hasOther && otherText.trim() ? 1 : 0);
  const btnLabel = count === 0
    ? config.addLabel
    : count === 1
    ? config.addLabel
    : `Add ${count} ${config.addLabel.replace("+ Add ", "")}s`;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-md p-0 gap-0"
        style={{ backgroundColor: "var(--slds-g-color-background-base)", borderColor: "var(--slds-g-color-border-base-1)" }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              {config.modalAddTitle}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Chips */}
          {(displaySelected.length > 0 || (hasOther && otherText.trim())) && (
            <div className="flex flex-wrap gap-1.5">
              {displaySelected.map((v) => (
                <Chip key={v} label={v} onRemove={() => removeChip(v)} />
              ))}
              {hasOther && otherText.trim() && (
                <Chip label={otherText.trim()} onRemove={() => { removeChip("Other"); setOtherText(""); }} />
              )}
            </div>
          )}

          {/* Multi-select combobox */}
          <div className="space-y-1.5">
            <label className="slds-form-label block" style={{ color: "var(--slds-g-color-text-weak)" }}>
              {config.fieldLabel} <span className="text-red-600">*</span>
            </label>
            <MultiSelectCombobox
              options={config.options}
              selected={selected}
              onToggle={toggleOpt}
              assignedValues={assignedValues}
              placeholder={config.placeholder}
              error={errors.select}
            />
          </div>

          {/* Other free-text */}
          {hasOther && (
            <div className="space-y-1.5">
              <label className="slds-form-label block" style={{ color: "var(--slds-g-color-text-weak)" }}>
                {config.otherFieldLabel} <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={otherText}
                onChange={(e) => { setOtherText(e.target.value); setErrors((p) => ({ ...p, other: undefined })); }}
                placeholder={config.otherPlaceholder}
                className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
                style={errors.other ? errorInputStyle : inputStyle}
                autoFocus
              />
              {errors.other && <p className="slds-text-3 mt-0.5" style={{ color: "#c23934" }}>{errors.other}</p>}
            </div>
          )}
        </div>

        <div className="px-5 py-3 flex items-center justify-end gap-3" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}>
          <Button
            variant="outline"
            className="h-9 rounded-full slds-text-4 shadow-none"
            style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="h-9 rounded-full slds-text-4 text-white shadow-none"
            style={{ backgroundColor: "#145F33" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")}
            onClick={handleSave}
          >
            {btnLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Modal (single-select) ───────────────────────────────────────────────

function EditModal({
  open,
  record,
  config,
  assignedValues,
  onClose,
  onSave,
}: {
  open: boolean;
  record: IntakeRecord | null;
  config: SectionConfig;
  assignedValues: string[];
  onClose: () => void;
  onSave: (value: string, isCustom: boolean) => void;
}) {
  const [selected, setSelected] = useState("");
  const [otherText, setOtherText] = useState("");
  const [errors, setErrors] = useState<{ select?: string; other?: string }>({});

  useEffect(() => {
    if (open && record) {
      if (record.isCustom) {
        setSelected("Other");
        setOtherText(record.value);
      } else {
        setSelected(record.value);
        setOtherText("");
      }
      setErrors({});
    }
  }, [open, record]);

  const hasOther = selected === "Other";

  function validate(): boolean {
    const errs: { select?: string; other?: string } = {};
    if (!selected) { errs.select = "Please select a value."; }
    if (hasOther && !otherText.trim()) { errs.other = "This field is required."; }
    if (hasOther && otherText.trim()) {
      const normalized = normalize(otherText);
      const dupInAssigned = assignedValues
        .filter((v) => v !== record?.value)
        .some((v) => normalize(v) === normalized);
      if (dupInAssigned) { errs.other = config.duplicateError; }
    }
    if (!hasOther && selected && assignedValues.includes(selected) && selected !== record?.value) {
      errs.select = config.duplicateError;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    if (hasOther) {
      onSave(otherText.trim(), true);
    } else {
      onSave(selected, false);
    }
  }

  const unchanged = record
    ? (record.isCustom ? selected === "Other" && otherText.trim() === record.value : selected === record.value)
    : false;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-md p-0 gap-0"
        style={{ backgroundColor: "var(--slds-g-color-background-base)", borderColor: "var(--slds-g-color-border-base-1)" }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              {config.modalEditTitle}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="space-y-1.5">
            <label className="slds-form-label block" style={{ color: "var(--slds-g-color-text-weak)" }}>
              {config.fieldLabel} <span className="text-red-600">*</span>
            </label>
            <SingleSelectCombobox
              options={config.options}
              value={selected}
              onChange={(v) => { setSelected(v); setErrors({}); }}
              assignedValues={assignedValues}
              editingValue={record?.value}
              placeholder={config.placeholder}
              error={errors.select}
            />
          </div>

          {hasOther && (
            <div className="space-y-1.5">
              <label className="slds-form-label block" style={{ color: "var(--slds-g-color-text-weak)" }}>
                {config.otherFieldLabel} <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={otherText}
                onChange={(e) => { setOtherText(e.target.value); setErrors((p) => ({ ...p, other: undefined })); }}
                placeholder={config.otherPlaceholder}
                className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
                style={errors.other ? errorInputStyle : inputStyle}
              />
              {errors.other && <p className="slds-text-3 mt-0.5" style={{ color: "#c23934" }}>{errors.other}</p>}
            </div>
          )}
        </div>

        <div className="px-5 py-3 flex items-center justify-end gap-3" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}>
          <Button
            variant="outline"
            className="h-9 rounded-full slds-text-4 shadow-none"
            style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            disabled={unchanged}
            className="h-9 rounded-full slds-text-4 text-white shadow-none"
            style={{
              backgroundColor: unchanged ? "var(--slds-g-color-neutral-95)" : "#145F33",
              color: unchanged ? "var(--slds-g-color-text-weak)" : "white",
              cursor: unchanged ? "not-allowed" : "pointer",
            }}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Remove Confirm ───────────────────────────────────────────────────────────

function RemoveConfirm({
  open,
  config,
  record,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  config: SectionConfig;
  record: IntakeRecord | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-sm p-0 gap-0"
        style={{ backgroundColor: "var(--slds-g-color-background-base)", borderColor: "var(--slds-g-color-border-base-1)" }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              {config.removeTitle}
            </DialogTitle>
          </DialogHeader>
          <p className="slds-text-4 mt-2" style={{ color: "var(--slds-g-color-text-default)" }}>
            {record ? config.removeMessage(record.value) : ""}
          </p>
        </div>
        <div className="px-5 py-3 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            className="h-9 rounded-full slds-text-4 shadow-none"
            style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="h-9 rounded-full slds-text-4 text-white shadow-none"
            style={{ backgroundColor: "#c23934" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a52b27")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c23934")}
            onClick={onConfirm}
          >
            {config.removeConfirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Intake Section Card ──────────────────────────────────────────────────────

function IntakeSection({ config, initialRecords }: { config: SectionConfig; initialRecords: IntakeRecord[] }) {
  const [records, setRecords] = useState<IntakeRecord[]>(initialRecords);
  const [nextId, setNextId] = useState(100);
  const [sortAsc, setSortAsc] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<IntakeRecord | null>(null);
  const [removeRecord, setRemoveRecord] = useState<IntakeRecord | null>(null);

  const assignedValues = records.map((r) => r.value);

  const sorted = [...records].sort((a, b) =>
    sortAsc ? a.value.localeCompare(b.value) : b.value.localeCompare(a.value)
  );

  function handleAdd(items: { value: string; isCustom: boolean }[]) {
    const newRecords = items.map((item, i) => ({ id: nextId + i, ...item }));
    setRecords((prev) => [...prev, ...newRecords]);
    setNextId((n) => n + items.length);
    setAddOpen(false);
    const count = items.length;
    toast.success(count === 1 ? config.addSuccessOne : config.addSuccessMany(count));
  }

  function handleEdit(value: string, isCustom: boolean) {
    if (!editRecord) return;
    setRecords((prev) => prev.map((r) => r.id === editRecord.id ? { ...r, value, isCustom } : r));
    setEditRecord(null);
    toast.success(config.editSuccess);
  }

  function handleRemove() {
    if (!removeRecord) return;
    setRecords((prev) => prev.filter((r) => r.id !== removeRecord.id));
    setRemoveRecord(null);
    toast.success(config.removeSuccess);
  }

  return (
    <>
      <div
        className="overflow-hidden w-full"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor: "var(--slds-g-color-background-base)",
        }}
      >
        {/* Card Header */}
        <div
          className="px-4 py-3 flex items-start justify-between gap-4"
          style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-alt)" }}
        >
          <div>
            <h3 className="text-[13px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              {config.title}
            </h3>
            <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
              {config.subtitle}
            </p>
          </div>
          <Button
            className="h-8 rounded-full slds-text-4 text-white shadow-none flex items-center gap-1.5 flex-shrink-0"
            style={{ backgroundColor: "#145F33" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")}
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            {config.addLabel.replace("+ ", "")}
          </Button>
        </div>

        {/* Body */}
        {records.length === 0 ? (
          <div className="px-6 py-12 flex flex-col items-center gap-2 text-center">
            <p className="slds-text-4 font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
              {config.emptyTitle}
            </p>
            <p className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
              {config.emptySubtitle}
            </p>
            <Button
              className="mt-3 h-8 rounded-full slds-text-4 text-white shadow-none flex items-center gap-1.5"
              style={{ backgroundColor: "#145F33" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")}
              onClick={() => setAddOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              {config.addLabel.replace("+ ", "")}
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "var(--slds-g-color-background-alt)", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                <th className="px-4 py-2 text-left" style={{ width: "100%" }}>
                  <button
                    onClick={() => setSortAsc((v) => !v)}
                    className="flex items-center gap-1 slds-text-3 font-semibold"
                    style={{ color: "var(--slds-g-color-text-weak)", background: "none", border: "none", cursor: "pointer" }}
                    title={sortAsc ? "Sort Z–A" : "Sort A–Z"}
                  >
                    {config.columnLabel}
                    {sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </th>
                <th className="px-4 py-2 text-right slds-text-3 font-semibold" style={{ color: "var(--slds-g-color-text-weak)", whiteSpace: "nowrap" }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((rec, i) => (
                <tr
                  key={rec.id}
                  style={{ borderBottom: i < sorted.length - 1 ? "1px solid var(--slds-g-color-border-base-1)" : undefined }}
                >
                  <td className="px-4 py-2.5 slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>
                    <span>{rec.value}</span>
                    {rec.isCustom && (
                      <span className="ml-2 slds-text-3 px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--slds-g-color-background-alt)", color: "var(--slds-g-color-text-weak)", border: "1px solid var(--slds-g-color-border-base-1)" }}>
                        Custom
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <button
                      title={`Edit ${config.title.replace(" Requirements", "").replace("Required ", "")}`}
                      aria-label={`Edit ${rec.value}`}
                      onClick={() => setEditRecord(rec)}
                      className="p-1 rounded hover:opacity-70 transition-opacity"
                      style={{ color: "#0176d3", background: "none", border: "none", cursor: "pointer" }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title={`Remove ${config.title.replace(" Requirements", "").replace("Required ", "")}`}
                      aria-label={`Remove ${rec.value}`}
                      onClick={() => setRemoveRecord(rec)}
                      className="p-1 rounded hover:opacity-70 transition-opacity ml-1"
                      style={{ color: "#c23934", background: "none", border: "none", cursor: "pointer" }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddModal
        open={addOpen}
        config={config}
        assignedValues={assignedValues}
        onClose={() => setAddOpen(false)}
        onSave={handleAdd}
      />
      <EditModal
        open={editRecord !== null}
        record={editRecord}
        config={config}
        assignedValues={assignedValues}
        onClose={() => setEditRecord(null)}
        onSave={handleEdit}
      />
      <RemoveConfirm
        open={removeRecord !== null}
        config={config}
        record={removeRecord}
        onCancel={() => setRemoveRecord(null)}
        onConfirm={handleRemove}
      />
    </>
  );
}

// ─── Section configs ──────────────────────────────────────────────────────────

const DOCUMENTS_CONFIG: SectionConfig = {
  title: "Required Documents",
  subtitle: "Manage documents required before services can be received.",
  addLabel: "Add Document",
  modalAddTitle: "Add Required Document",
  modalEditTitle: "Edit Required Document",
  fieldLabel: "REQUIRED DOCUMENT",
  otherFieldLabel: "OTHER DOCUMENT",
  otherPlaceholder: "Enter document name",
  columnLabel: "REQUIRED DOCUMENT",
  placeholder: "Search or select required documents",
  options: DOCUMENT_OPTIONS,
  emptyTitle: "No required documents added",
  emptySubtitle: "Add documents required before constituents can receive services.",
  removeTitle: "Remove Required Document?",
  removeMessage: (v) => `Are you sure you want to remove "${v}" from the required documents?`,
  removeConfirmLabel: "Remove Document",
  duplicateError: "This document has already been added.",
  addSuccessOne: "Document added successfully.",
  addSuccessMany: (n) => `${n} documents added successfully.`,
  editSuccess: "Document updated successfully.",
  removeSuccess: "Document removed successfully.",
};

const PAYMENTS_CONFIG: SectionConfig = {
  title: "Payments Accepted",
  subtitle: "Manage payment methods accepted by this Community Referral Organization.",
  addLabel: "Add Payment",
  modalAddTitle: "Add Payment Method",
  modalEditTitle: "Edit Payment Method",
  fieldLabel: "PAYMENTS ACCEPTED",
  otherFieldLabel: "OTHER PAYMENT ACCEPTED",
  otherPlaceholder: "Enter payment method",
  columnLabel: "PAYMENT METHOD",
  placeholder: "Search or select payment methods",
  options: PAYMENT_OPTIONS,
  emptyTitle: "No payment methods added",
  emptySubtitle: "Add the payment methods accepted by this organization.",
  removeTitle: "Remove Payment Method?",
  removeMessage: (v) => `Are you sure you want to remove "${v}" from the accepted payment methods?`,
  removeConfirmLabel: "Remove Payment",
  duplicateError: "This payment method has already been added.",
  addSuccessOne: "Payment method added successfully.",
  addSuccessMany: (n) => `${n} payment methods added successfully.`,
  editSuccess: "Payment method updated successfully.",
  removeSuccess: "Payment method removed successfully.",
};

const ELIGIBILITY_CONFIG: SectionConfig = {
  title: "Eligibility Requirements",
  subtitle: "Manage requirements constituents must satisfy to receive services.",
  addLabel: "Add Eligibility",
  modalAddTitle: "Add Eligibility Requirements",
  modalEditTitle: "Edit Eligibility Requirement",
  fieldLabel: "ELIGIBILITY REQUIREMENT",
  otherFieldLabel: "OTHER ELIGIBILITY",
  otherPlaceholder: "Enter eligibility requirement",
  columnLabel: "ELIGIBILITY REQUIREMENT",
  placeholder: "Search or select eligibility requirements",
  options: ELIGIBILITY_OPTIONS,
  emptyTitle: "No eligibility requirements added",
  emptySubtitle: "Add requirements constituents must satisfy to receive services.",
  removeTitle: "Remove Eligibility Requirement?",
  removeMessage: (v) => `Are you sure you want to remove "${v}" from the eligibility requirements?`,
  removeConfirmLabel: "Remove Requirement",
  duplicateError: "This eligibility requirement has already been added.",
  addSuccessOne: "Eligibility requirement added successfully.",
  addSuccessMany: (n) => `${n} eligibility requirements added successfully.`,
  editSuccess: "Eligibility requirement updated successfully.",
  removeSuccess: "Eligibility requirement removed successfully.",
};

// ─── Sample data ──────────────────────────────────────────────────────────────

const INITIAL_DOCUMENTS: IntakeRecord[] = [
  { id: 1, value: "Birth Certificate", isCustom: false },
  { id: 2, value: "Photo ID", isCustom: false },
  { id: 3, value: "Proof of Income", isCustom: false },
];

const INITIAL_PAYMENTS: IntakeRecord[] = [
  { id: 1, value: "Medicaid", isCustom: false },
  { id: 2, value: "Private Insurance", isCustom: false },
  { id: 3, value: "Sliding Scale", isCustom: false },
];

const INITIAL_ELIGIBILITY: IntakeRecord[] = [
  { id: 1, value: "Illinois Resident", isCustom: false },
  { id: 2, value: "Income Requirement", isCustom: false },
  { id: 3, value: "Stable Housing", isCustom: false },
];

// ─── Main Export ──────────────────────────────────────────────────────────────

export function CommunityReferralIntakeView() {
  return (
    <div className="space-y-5 w-full pb-8">
      <IntakeSection config={DOCUMENTS_CONFIG} initialRecords={INITIAL_DOCUMENTS} />
      <IntakeSection config={PAYMENTS_CONFIG} initialRecords={INITIAL_PAYMENTS} />
      <IntakeSection config={ELIGIBILITY_CONFIG} initialRecords={INITIAL_ELIGIBILITY} />
    </div>
  );
}
