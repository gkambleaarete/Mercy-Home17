import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Check,
} from "@/app/lib/lucide-icons";
import { CommunityReferralServicesView } from "./CommunityReferralServicesView";
import { CommunityReferralIntakeView } from "./CommunityReferralIntakeView";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { toast } from "sonner@2.0.3";
import { DateInput } from "../ui/date-input";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScheduleRecord {
  id: number;
  dayOfWeek: string;
  opensAt: string;
  closesAt: string;
  startDate: string;
  endDate: string;
  additionalInfo: string;
}

interface LanguageRecord {
  id: number;
  language: string;
  otherLanguage: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RELATIONSHIP_TYPES = [
  "Referral Agency",
  "In Kind Donor",
  "Community Partner Collective Member",
  "School Placement Site",
  "Other",
];

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ADDITIONAL_INFO_OPTIONS = [
  "First Come First Serve",
  "By Appointment Only",
];

const GENDER_OPTIONS = ["Male", "Female", "All Genders"];

const LANGUAGE_OPTIONS = [
  "English",
  "Spanish",
  "Polish",
  "Other",
];

// Mock parent org options
const PARENT_ORG_OPTIONS = [
  "Catholic Charities USA",
  "Chicago Archdiocese",
  "United Way of Metro Chicago",
  "Archdiocese of Chicago",
  "Greater Chicago Food Depository",
];

// ─── Shared card wrapper ──────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden w-full"
      style={{
        border: "1px solid var(--slds-g-color-border-base-1)",
        borderRadius: "var(--slds-c-card-radius-border)",
        backgroundColor: "var(--slds-g-color-background-base)",
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="px-4 py-3 flex items-center justify-between gap-4"
      style={{
        borderBottom:
          "1px solid var(--slds-g-color-border-base-1)",
        backgroundColor: "var(--slds-g-color-background-alt)",
      }}
    >
      <div>
        <h3
          className="text-[13px] font-semibold"
          style={{ color: "var(--slds-g-color-text-default)" }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className="slds-text-3 mt-0.5"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function FormLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="slds-form-label block"
      style={{ color: "var(--slds-g-color-text-weak)" }}
    >
      {children}
      {required && <span className="text-red-600">*</span>}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--slds-g-color-border-base-1)",
  backgroundColor: "var(--slds-g-color-background-base)",
  color: "var(--slds-g-color-text-default)",
};

const disabledInputStyle: React.CSSProperties = {
  ...inputStyle,
  backgroundColor: "var(--slds-g-color-background-alt)",
  opacity: 0.6,
};

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  error,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
        style={
          disabled
            ? disabledInputStyle
            : error
              ? { ...inputStyle, border: "1px solid #c23934" }
              : inputStyle
        }
      />
      {error && (
        <p
          className="slds-text-3 mt-0.5"
          style={{ color: "#c23934" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function NativeSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  error,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none appearance-none"
        style={{
          ...(disabled
            ? disabledInputStyle
            : error
              ? { ...inputStyle, border: "1px solid #c23934" }
              : inputStyle),
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23706e6b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
          paddingRight: "2rem",
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && (
        <p
          className="slds-text-3 mt-0.5"
          style={{ color: "#c23934" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Searchable combobox for Parent Org ──────────────────────────────────────

function OrgCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const [dropPos, setDropPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const filtered = PARENT_ORG_OPTIONS.filter(
    (o) =>
      !search.trim() ||
      o.toLowerCase().includes(search.toLowerCase()),
  );

  function openDrop() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDropPos({
      top: rect.bottom + 2,
      left: rect.left,
      width: rect.width,
    });
    setOpen(true);
  }

  function select(v: string) {
    onChange(v);
    setSearch(v);
    setOpen(false);
  }

  React.useEffect(() => {
    setSearch(value);
  }, [value]);

  return (
    <div ref={triggerRef}>
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          openDrop();
        }}
        onFocus={openDrop}
        onBlur={() =>
          setTimeout(() => {
            setOpen(false);
            if (!PARENT_ORG_OPTIONS.includes(search))
              setSearch(value);
          }, 150)
        }
        placeholder="Search organization..."
        autoComplete="off"
        className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
        style={inputStyle}
      />
      {open &&
        dropPos &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: dropPos.top,
              left: dropPos.left,
              width: dropPos.width,
              zIndex: 9999,
              backgroundColor:
                "var(--slds-g-color-background-base)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: 4,
              maxHeight: 200,
              overflowY: "auto",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }}
          >
            {filtered.length === 0 ? (
              <div
                className="px-3 py-2 slds-text-4"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                No results
              </div>
            ) : (
              filtered.map((o) => (
                <div
                  key={o}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    select(o);
                  }}
                  className="px-3 py-1.5 slds-text-4 cursor-pointer"
                  style={{
                    backgroundColor:
                      o === value ? "#e8f5e9" : undefined,
                    color: "var(--slds-g-color-text-default)",
                  }}
                  onMouseEnter={(e) => {
                    if (o !== value)
                      (
                        e.currentTarget as HTMLDivElement
                      ).style.backgroundColor =
                        "var(--slds-g-color-background-alt)";
                  }}
                  onMouseLeave={(e) => {
                    if (o !== value)
                      (
                        e.currentTarget as HTMLDivElement
                      ).style.backgroundColor = "";
                  }}
                >
                  {o}
                </div>
              ))
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

// ─── Action button row ────────────────────────────────────────────────────────

function ActionIconBtn({
  title,
  onClick,
  color,
  children,
}: {
  title: string;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="p-1 rounded hover:opacity-70 transition-opacity"
      style={{
        color: color ?? "#0176d3",
        background: "none",
        border: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

// ─── Discard guard dialog ─────────────────────────────────────────────────────

function DiscardDialog({
  open,
  onKeep,
  onDiscard,
}: {
  open: boolean;
  onKeep: () => void;
  onDiscard: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onKeep()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-sm p-0 gap-0"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          borderColor: "var(--slds-g-color-border-base-1)",
        }}
      >
        <div
          className="px-5 py-4"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-[15px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Discard unsaved changes?
            </DialogTitle>
          </DialogHeader>
          <p
            className="slds-text-4 mt-1"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            You have unsaved changes. Are you sure you want to
            leave?
          </p>
        </div>
        <div className="px-5 py-3 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            className="h-9 rounded-full slds-text-4 shadow-none"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
              color: "var(--slds-g-color-text-default)",
            }}
            onClick={onKeep}
          >
            Keep Editing
          </Button>
          <Button
            className="h-9 rounded-full slds-text-4 text-white shadow-none"
            style={{ backgroundColor: "#c23934" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#a52b27")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#c23934")
            }
            onClick={onDiscard}
          >
            Discard Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────

function DeleteConfirmDialog({
  open,
  message,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-sm p-0 gap-0"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          borderColor: "var(--slds-g-color-border-base-1)",
        }}
      >
        <div
          className="px-5 py-4"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-[15px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <p
            className="slds-text-4 mt-1"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            {message}
          </p>
        </div>
        <div className="px-5 py-3 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            className="h-9 rounded-full slds-text-4 shadow-none"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
              color: "var(--slds-g-color-text-default)",
            }}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="h-9 rounded-full slds-text-4 text-white shadow-none"
            style={{ backgroundColor: "#c23934" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#a52b27")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#c23934")
            }
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Schedule Modal ───────────────────────────────────────────────────────────

function ScheduleModal({
  open,
  mode,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: "add" | "edit" | "view";
  initial?: ScheduleRecord;
  onClose: () => void;
  onSave: (r: Omit<ScheduleRecord, "id">) => void;
}) {
  const [dayOfWeek, setDayOfWeek] = useState(
    initial?.dayOfWeek ?? "",
  );
  const [opensAt, setOpensAt] = useState(
    initial?.opensAt ?? "",
  );
  const [closesAt, setClosesAt] = useState(
    initial?.closesAt ?? "",
  );
  const [startDate, setStartDate] = useState(
    initial?.startDate ?? "",
  );
  const [endDate, setEndDate] = useState(
    initial?.endDate ?? "",
  );
  const [additionalInfo, setAdditionalInfo] = useState(
    initial?.additionalInfo ?? "",
  );
  const [errors, setErrors] = useState<Record<string, string>>(
    {},
  );

  const isView = mode === "view";

  function validate() {
    const e: Record<string, string> = {};
    if (!dayOfWeek) e.dayOfWeek = "Day of Week is required.";
    if (endDate && startDate && endDate < startDate)
      e.endDate = "End Date cannot be earlier than Start Date.";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave({
      dayOfWeek,
      opensAt,
      closesAt,
      startDate,
      endDate,
      additionalInfo,
    });
    onClose();
  }

  const fieldRow = (
    label: string,
    content: React.ReactNode,
  ) => (
    <div className="space-y-1.5">
      {label && <FormLabel>{label}</FormLabel>}
      {content}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-lg p-0 gap-0"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          borderColor: "var(--slds-g-color-border-base-1)",
        }}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div
          className="px-5 py-4"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-[16px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {mode === "add"
                ? "Add Regular Schedule"
                : mode === "edit"
                  ? "Edit Regular Schedule"
                  : "View Regular Schedule"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Day of Week */}
          {fieldRow(
            "DAY OF WEEK",
            isView ? (
              <p
                className="slds-text-4"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {initial?.dayOfWeek || "—"}
              </p>
            ) : (
              <NativeSelect
                value={dayOfWeek}
                onChange={(v) => {
                  setDayOfWeek(v);
                  setErrors((p) => {
                    const n = { ...p };
                    delete n.dayOfWeek;
                    return n;
                  });
                }}
                options={DAYS_OF_WEEK}
                placeholder="Select day"
                error={errors.dayOfWeek}
              />
            ),
          )}

          {/* Opens At / Closes At */}
          <div className="grid grid-cols-2 gap-4">
            {fieldRow(
              "OPENS AT",
              isView ? (
                <p
                  className="slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {initial?.opensAt || "—"}
                </p>
              ) : (
                <input
                  type="time"
                  value={opensAt}
                  onChange={(e) => setOpensAt(e.target.value)}
                  className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
                  style={inputStyle}
                />
              ),
            )}
            {fieldRow(
              "CLOSES AT",
              isView ? (
                <p
                  className="slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {initial?.closesAt || "—"}
                </p>
              ) : (
                <input
                  type="time"
                  value={closesAt}
                  onChange={(e) => setClosesAt(e.target.value)}
                  className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
                  style={inputStyle}
                />
              ),
            )}
          </div>

          {/* Start / End Date */}
          <div className="grid grid-cols-2 gap-4">
            {fieldRow(
              "START DATE",
              isView ? (
                <p
                  className="slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {initial?.startDate || "—"}
                </p>
              ) : (
                <TextInput
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="MM/DD/YYYY"
                />
              ),
            )}
            {fieldRow(
              "END DATE",
              isView ? (
                <p
                  className="slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {initial?.endDate || "—"}
                </p>
              ) : (
                <TextInput
                  value={endDate}
                  onChange={(v) => {
                    setEndDate(v);
                    setErrors((p) => {
                      const n = { ...p };
                      delete n.endDate;
                      return n;
                    });
                  }}
                  placeholder="MM/DD/YYYY"
                  error={errors.endDate}
                />
              ),
            )}
          </div>

          {/* Additional Info */}
          {fieldRow(
            "ADDITIONAL INFORMATION",
            isView ? (
              <p
                className="slds-text-4"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {initial?.additionalInfo || "—"}
              </p>
            ) : (
              <NativeSelect
                value={additionalInfo}
                onChange={setAdditionalInfo}
                options={ADDITIONAL_INFO_OPTIONS}
                placeholder="Select"
              />
            ),
          )}
        </div>

        <div
          className="px-5 py-3 flex items-center justify-end gap-3"
          style={{
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <Button
            variant="outline"
            className="h-9 rounded-full slds-text-4 shadow-none"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
              color: "var(--slds-g-color-text-default)",
            }}
            onClick={onClose}
          >
            {isView ? "Close" : "Cancel"}
          </Button>
          {!isView && (
            <Button
              className="h-9 rounded-full slds-text-4 text-white shadow-none"
              style={{ backgroundColor: "#145F33" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#0e4524")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#145F33")
              }
              onClick={handleSave}
            >
              Save
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Language Modal ───────────────────────────────────────────────────────────

function LanguageModal({
  open,
  onClose,
  onSave,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (language: string, other: string) => void;
  existing: LanguageRecord[];
}) {
  const [lang, setLang] = useState("");
  const [other, setOther] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>(
    {},
  );

  const isOther = lang === "Other";

  function handleSave() {
    const e: Record<string, string> = {};
    if (!lang) e.lang = "Language is required.";
    if (isOther && !other.trim())
      e.other = "Please specify the language.";
    const display = isOther ? other : lang;
    if (
      existing.some(
        (r) =>
          r.language === lang &&
          r.otherLanguage === (isOther ? other : ""),
      )
    ) {
      e.lang = "This language has already been added.";
    }
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave(lang, isOther ? other : "");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-sm p-0 gap-0"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          borderColor: "var(--slds-g-color-border-base-1)",
        }}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div
          className="px-5 py-4"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-[16px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Add Language
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="space-y-1.5">
            <FormLabel required>LANGUAGE</FormLabel>
            <NativeSelect
              value={lang}
              onChange={(v) => {
                setLang(v);
                setErrors({});
              }}
              options={LANGUAGE_OPTIONS}
              placeholder="Select language"
              error={errors.lang}
            />
          </div>
          {isOther && (
            <div className="space-y-1.5">
              <FormLabel required>SPECIFY LANGUAGE</FormLabel>
              <TextInput
                value={other}
                onChange={(v) => {
                  setOther(v);
                  setErrors((p) => {
                    const n = { ...p };
                    delete n.other;
                    return n;
                  });
                }}
                placeholder="Enter language"
                error={errors.other}
              />
            </div>
          )}
        </div>

        <div
          className="px-5 py-3 flex items-center justify-end gap-3"
          style={{
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <Button
            variant="outline"
            className="h-9 rounded-full slds-text-4 shadow-none"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
              color: "var(--slds-g-color-text-default)",
            }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="h-9 rounded-full slds-text-4 text-white shadow-none"
            style={{ backgroundColor: "#145F33" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#0e4524")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#145F33")
            }
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

// ─── Add Organization Modal ───────────────────────────────────────────────────

const ADD_ORG_ROLES = [
  "Community Referral Organization",
  "Employer",
  "Organization",
  "PSO Organization",
  "School",
];

function AddOrganizationModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [role, setRole] = useState("Organization");
  const [orgName, setOrgName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>(
    {},
  );

  function handleClose() {
    setRole("Organization");
    setOrgName("");
    setStartDate("");
    setErrors({});
    onClose();
  }

  function handleSave() {
    const e: Record<string, string> = {};
    if (!orgName.trim())
      e.orgName = "Organization Name is required.";
    if (!startDate) e.startDate = "Start Date is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    toast.success(
      `Organization "${orgName}" created successfully.`,
    );
    handleClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && handleClose()}
    >
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-md p-0 gap-0 overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
        }}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader
          className="px-5 py-4"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <DialogTitle
            style={{
              fontSize: "var(--slds-g-font-size-6)",
              fontWeight: 500,
            }}
          >
            Create New Organization
          </DialogTitle>
          <p
            className="slds-text-4 my-0"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Required fields are marked with *.
          </p>
        </DialogHeader>

        {/* Body */}
        <div
          className="px-5 py-4 space-y-4"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
          }}
        >
          {/* Row 1: Constituent Type + Role */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FormLabel required>CONSTITUENT TYPE </FormLabel>
              <NativeSelect
                value="Organization"
                onChange={() => {}}
                options={["Organization"]}
                disabled
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel required>ROLE </FormLabel>
              <NativeSelect
                value={role}
                onChange={(v) => setRole(v)}
                options={ADD_ORG_ROLES}
              />
            </div>
          </div>

          {/* Organization Name */}
          <div className="space-y-1.5">
            <FormLabel required>ORGANIZATION NAME </FormLabel>
            <TextInput
              value={orgName}
              onChange={(v) => {
                setOrgName(v);
                setErrors((p) => {
                  const n = { ...p };
                  delete n.orgName;
                  return n;
                });
              }}
              error={errors.orgName}
            />
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <FormLabel required>START DATE </FormLabel>
            <DateInput
              value={startDate}
              onChange={(v) => {
                setStartDate(v);
                setErrors((p) => {
                  const n = { ...p };
                  delete n.startDate;
                  return n;
                });
              }}
              className="h-9 slds-text-4 rounded"
              style={
                errors.startDate
                  ? {
                      ...inputStyle,
                      border: "1px solid #c23934",
                    }
                  : inputStyle
              }
            />
            {errors.startDate && (
              <p
                className="slds-text-3 mt-0.5"
                style={{ color: "#c23934" }}
              >
                {errors.startDate}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter
          className="px-5 py-3 flex items-center justify-end gap-2"
          style={{
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <Button
            variant="outline"
            className="h-9 rounded-full slds-text-4 shadow-none"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
              color: "var(--slds-g-color-text-default)",
            }}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            className="h-9 rounded-full slds-text-4 text-white shadow-none"
            style={{ backgroundColor: "#145F33" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#0e4524")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#145F33")
            }
            onClick={handleSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CommunityReferralGeneralViewProps {
  orgName?: string;
}

export function CommunityReferralGeneralView({
  orgName = "St. Joseph Community Services",
}: CommunityReferralGeneralViewProps) {
  // ── Card 1: Organization Information ──────────────────────────────────────
  const [activeCRTab, setActiveCRTab] = useState<
    "General" | "Services" | "Intake"
  >("General");
  const [addOrgOpen, setAddOrgOpen] = useState(false);

  const [parentOrg, setParentOrg] = useState("");
  const [description, setDescription] = useState("");

  // ── Card 2: Nature of Relationship (inline form) ─────────────────────────
  const [relTypes, setRelTypes] = useState<string[]>([]);
  const [relOtherType, setRelOtherType] = useState("");
  const [relComments, setRelComments] = useState("");
  const [relDropOpen, setRelDropOpen] = useState(false);
  const relDropRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!relDropOpen) return;
    function handleOutside(e: MouseEvent) {
      if (
        relDropRef.current &&
        !relDropRef.current.contains(e.target as Node)
      ) {
        setRelDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () =>
      document.removeEventListener("mousedown", handleOutside);
  }, [relDropOpen]);

  // ── Card 3: Memorandum of Understanding ───────────────────────────────────
  const [hasMou, setHasMou] = useState<"Yes" | "No">("No");
  const [mouStartDate, setMouStartDate] = useState("");
  const [mouExpDate, setMouExpDate] = useState("");
  const [mouDetails, setMouDetails] = useState("");
  const [mouErrors, setMouErrors] = useState<
    Record<string, string>
  >({});

  // ── Card 4: Demographics ──────────────────────────────────────────────────
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [ageErrors, setAgeErrors] = useState<
    Record<string, string>
  >({});
  const [gender, setGender] = useState("All Genders");

  // ── Card 5: Regular Schedule ──────────────────────────────────────────────
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([
    {
      id: 1,
      dayOfWeek: "Monday",
      opensAt: "09:00",
      closesAt: "17:00",
      startDate: "01/06/2025",
      endDate: "",
      additionalInfo: "By Appointment Only",
    },
    {
      id: 2,
      dayOfWeek: "Wednesday",
      opensAt: "09:00",
      closesAt: "17:00",
      startDate: "01/08/2025",
      endDate: "",
      additionalInfo: "First Come First Serve",
    },
  ]);
  const [schedModal, setSchedModal] = useState<{
    open: boolean;
    mode: "add" | "edit" | "view";
    record?: ScheduleRecord;
  }>({ open: false, mode: "add" });
  const [schedDeleteId, setSchedDeleteId] = useState<
    number | null
  >(null);
  const [nextSchedId, setNextSchedId] = useState(10);

  // ── Card 6: Languages ─────────────────────────────────────────────────────
  const [languages, setLanguages] = useState<LanguageRecord[]>([
    { id: 1, language: "English", otherLanguage: "" },
    { id: 2, language: "Spanish", otherLanguage: "" },
  ]);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [langDeleteId, setLangDeleteId] = useState<
    number | null
  >(null);
  const [nextLangId, setNextLangId] = useState(10);

  // ── Page-level save ───────────────────────────────────────────────────────
  const [dirty, setDirty] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  function mark() {
    setDirty(true);
  }

  function validatePage() {
    let valid = true;
    const mErr: Record<string, string> = {};
    if (
      hasMou === "Yes" &&
      mouExpDate &&
      mouStartDate &&
      mouExpDate < mouStartDate
    ) {
      mErr.mouExpDate =
        "Expiration Date cannot be earlier than Start Date.";
      valid = false;
    }
    setMouErrors(mErr);

    const aErr: Record<string, string> = {};
    if (minAge && isNaN(Number(minAge))) {
      aErr.minAge = "Must be a number.";
      valid = false;
    }
    if (maxAge && isNaN(Number(maxAge))) {
      aErr.maxAge = "Must be a number.";
      valid = false;
    }
    if (minAge && maxAge && Number(minAge) > Number(maxAge)) {
      aErr.minAge = "Minimum Age cannot exceed Maximum Age.";
      valid = false;
    }
    if (minAge && Number(minAge) < 0) {
      aErr.minAge = "Cannot be negative.";
      valid = false;
    }
    if (maxAge && Number(maxAge) < 0) {
      aErr.maxAge = "Cannot be negative.";
      valid = false;
    }
    setAgeErrors(aErr);
    return valid;
  }

  function handleSaveChanges() {
    if (!validatePage()) return;
    toast.success(
      "Community referral details updated successfully.",
    );
    setDirty(false);
  }

  function handleCancel() {
    if (dirty) {
      setDiscardOpen(true);
    } else {
      toast.info("Changes cancelled.");
    }
  }

  // ── Schedule handlers ─────────────────────────────────────────────────────
  function saveSchedule(data: Omit<ScheduleRecord, "id">) {
    if (schedModal.record) {
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === schedModal.record!.id
            ? { ...s, ...data }
            : s,
        ),
      );
      toast.success("Schedule updated.");
    } else {
      setSchedules((prev) => [
        ...prev,
        { id: nextSchedId, ...data },
      ]);
      setNextSchedId((n) => n + 1);
      toast.success("Schedule added.");
    }
  }

  function deleteSchedule(id: number) {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    setSchedDeleteId(null);
    toast.success("Schedule removed.");
  }

  // ── Language handlers ─────────────────────────────────────────────────────
  function addLanguage(language: string, other: string) {
    setLanguages((prev) => [
      ...prev,
      { id: nextLangId, language, otherLanguage: other },
    ]);
    setNextLangId((n) => n + 1);
    toast.success("Language added.");
  }

  function removeLanguage(id: number) {
    setLanguages((prev) => prev.filter((l) => l.id !== id));
    setLangDeleteId(null);
    toast.success("Language removed.");
  }

  // ── Time display helper ───────────────────────────────────────────────────
  function fmtTime(t: string) {
    if (!t) return "—";
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hr = h % 12 || 12;
    return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
  }

  // ─────────────────────────────────────────────────────────────────────────

  const addBtn = (label: string, onClick: () => void) => (
    <Button
      className="h-8 rounded-full slds-text-4 text-white shadow-none flex items-center gap-1.5"
      style={{ backgroundColor: "#145F33" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = "#0e4524")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "#145F33")
      }
      onClick={onClick}
    >
      <Plus className="w-3.5 h-3.5" />
      {label}
    </Button>
  );

  const tableHeadStyle: React.CSSProperties = {
    backgroundColor: "var(--slds-g-color-background-alt)",
    borderBottom: "1px solid var(--slds-g-color-border-base-1)",
  };

  const th = (label: string, width?: string | number) => (
    <th
      className="px-4 py-2 text-left slds-text-3 font-semibold"
      style={{ color: "var(--slds-g-color-text-weak)", width }}
    >
      {label}
    </th>
  );

  return (
    <div className="space-y-5 w-full pb-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            className="text-[18px] font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Community Referral Details
          </h2>
          <p
            className="slds-text-4 mt-0.5"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            General · {orgName}
          </p>
        </div>
        <Button
          variant="outline"
          className="font-medium flex items-center gap-2 bh-filled-primary"
          style={{
            height: 36,
            padding: "0 16px",
            backgroundColor: "#145F33",
            color: "#ffffff",
            borderRadius: "9999px",
            fontSize: "13px",
            border: "none",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
          }}
          onClick={() => setAddOrgOpen(true)}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Organization
        </Button>
      </div>

      {/* Sub-tabs */}
      <div
        className="flex gap-0"
        style={{
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        {(["General", "Services", "Intake"] as const).map(
          (tab) => {
            const isActive = activeCRTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveCRTab(tab)}
                className="px-4 py-2 slds-text-4 font-medium transition-colors"
                style={{
                  color: isActive
                    ? "#145F33"
                    : "var(--slds-g-color-text-weak)",
                  background: "none",
                  border: "none",
                  borderBottomWidth: 2,
                  borderBottomStyle: "solid",
                  borderBottomColor: isActive
                    ? "#145F33"
                    : "transparent",
                  cursor: "pointer",
                }}
              >
                {tab}
              </button>
            );
          },
        )}
      </div>

      {/* ── Services Tab ──────────────────────────────────────────────────── */}
      {activeCRTab === "Services" && (
        <CommunityReferralServicesView />
      )}

      {/* ── Intake Tab ────────────────────────────────────────────────────── */}
      {activeCRTab === "Intake" && (
        <CommunityReferralIntakeView />
      )}

      {/* ── General Tab ───────────────────────────────────────────────────── */}
      {activeCRTab === "General" && (
        <>
          {/* ── Card 1: Organization Information ─────────────────────────────── */}
          <Card>
            <CardHeader title="Organization Information" />
            <div className="px-4 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {/* Org Name (read-only) */}
                <div className="space-y-1.5">
                  <FormLabel>ORGANIZATION NAME</FormLabel>
                  <div
                    className="h-9 px-3 flex items-center rounded slds-text-4"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {orgName}
                  </div>
                </div>

                {/* Parent Organization */}
                <div className="space-y-1.5">
                  <FormLabel htmlFor="parentOrg">
                    PARENT ORGANIZATION
                  </FormLabel>
                  <OrgCombobox
                    value={parentOrg}
                    onChange={(v) => {
                      setParentOrg(v);
                      mark();
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <FormLabel htmlFor="description">
                  DESCRIPTION
                </FormLabel>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    mark();
                  }}
                  rows={4}
                  placeholder="Enter organization description"
                  className="w-full px-3 py-2 rounded slds-text-4 focus:outline-none resize-none"
                  style={inputStyle}
                />
              </div>
            </div>
          </Card>

          {/* ── Card 2: Nature of Relationship (inline form) ─────────────────── */}
          <div
            className="w-full"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3"
              style={{
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <h3
                className="text-[13px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Nature of Relationship
              </h3>
              <p
                className="slds-text-3 mt-0.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Manage relationship types between this
                organization and Mercy Home.
              </p>
            </div>

            {/* Form body */}
            <div
              className="px-4 py-4 space-y-4"
              style={{ position: "relative" }}
            >
              {/* RELATIONSHIP TYPE — multi-select */}
              <div className="space-y-1.5">
                <label
                  className="slds-form-label block"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  RELATIONSHIP TYPE
                  <span style={{ color: "#c23934" }}>*</span>
                </label>
                <div
                  ref={relDropRef}
                  style={{ position: "relative" }}
                >
                  {/* Trigger button */}
                  <button
                    type="button"
                    onClick={() => setRelDropOpen((v) => !v)}
                    className="w-full h-9 px-3 rounded slds-text-4 text-left flex items-center justify-between focus:outline-none"
                    style={inputStyle}
                  >
                    <span
                      className="truncate"
                      style={{
                        color: relTypes.length
                          ? "var(--slds-g-color-text-default)"
                          : "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {relTypes.length
                        ? relTypes.join(", ")
                        : "Select type"}
                    </span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#706e6b"
                      strokeWidth="2"
                      className="flex-shrink-0 ml-2"
                      style={{
                        transform: relDropOpen
                          ? "rotate(180deg)"
                          : undefined,
                        transition: "transform 0.15s",
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Dropdown panel */}
                  {relDropOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 2px)",
                        left: 0,
                        right: 0,
                        zIndex: 200,
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        borderRadius: 4,
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        boxShadow:
                          "0 4px 12px rgba(0,0,0,0.12)",
                      }}
                    >
                      {RELATIONSHIP_TYPES.map((opt) => {
                        const checked = relTypes.includes(opt);
                        return (
                          <label
                            key={opt}
                            className="flex items-center gap-2.5 px-3 py-2 cursor-pointer slds-text-4 select-none"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                              backgroundColor: checked
                                ? "var(--slds-g-color-background-alt)"
                                : undefined,
                            }}
                            onMouseEnter={(e) => {
                              if (!checked)
                                (
                                  e.currentTarget as HTMLElement
                                ).style.backgroundColor =
                                  "var(--slds-g-color-background-alt)";
                            }}
                            onMouseLeave={(e) => {
                              if (!checked)
                                (
                                  e.currentTarget as HTMLElement
                                ).style.backgroundColor = "";
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setRelTypes((prev) =>
                                  prev.includes(opt)
                                    ? prev.filter(
                                        (t) => t !== opt,
                                      )
                                    : [...prev, opt],
                                )
                              }
                              style={{
                                accentColor: "#145F33",
                                width: 14,
                                height: 14,
                                flexShrink: 0,
                              }}
                            />
                            {opt}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* SPECIFY RELATIONSHIP TYPE — conditional on "Other" */}
              {relTypes.includes("Other") && (
                <div className="space-y-1.5">
                  <label
                    className="slds-form-label block"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    SPECIFY RELATIONSHIP TYPE
                    <span style={{ color: "#c23934" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={relOtherType}
                    onChange={(e) =>
                      setRelOtherType(e.target.value)
                    }
                    placeholder="Enter relationship type"
                    className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
                    style={inputStyle}
                  />
                </div>
              )}

              {/* RELATIONSHIP COMMENTS */}
              <div className="space-y-1.5">
                <label
                  className="slds-form-label block"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  RELATIONSHIP COMMENTS
                </label>
                <textarea
                  value={relComments}
                  onChange={(e) =>
                    setRelComments(e.target.value)
                  }
                  rows={3}
                  placeholder="Enter comments"
                  className="w-full px-3 py-2 rounded slds-text-4 focus:outline-none resize-none"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* ── Card 3: Memorandum of Understanding ──────────────────────────── */}
          <Card>
            <CardHeader title="Memorandum of Understanding (MOU)" />
            <div className="px-4 py-4 space-y-4">
              {/* Yes/No toggle */}
              <div className="space-y-1.5">
                <FormLabel>
                  DO WE HAVE A MEMO OF UNDERSTANDING WITH THIS
                  AGENCY?
                </FormLabel>
                <div
                  className="flex gap-0 overflow-hidden rounded-full border w-fit"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                >
                  {(["Yes", "No"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setHasMou(opt);
                        mark();
                      }}
                      className="px-4 py-1.5 slds-text-4 font-medium transition-colors"
                      style={{
                        backgroundColor:
                          hasMou === opt
                            ? "#145F33"
                            : "var(--slds-g-color-background-base)",
                        color:
                          hasMou === opt
                            ? "#fff"
                            : "var(--slds-g-color-text-default)",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {hasMou === "Yes" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1.5">
                      <FormLabel>START DATE</FormLabel>
                      <TextInput
                        value={mouStartDate}
                        onChange={(v) => {
                          setMouStartDate(v);
                          mark();
                        }}
                        placeholder="MM/DD/YYYY"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <FormLabel>EXPIRATION DATE</FormLabel>
                      <TextInput
                        value={mouExpDate}
                        onChange={(v) => {
                          setMouExpDate(v);
                          setMouErrors({});
                          mark();
                        }}
                        placeholder="MM/DD/YYYY"
                        error={mouErrors.mouExpDate}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <FormLabel>
                      MEMO OF UNDERSTANDING DETAILS
                    </FormLabel>
                    <textarea
                      value={mouDetails}
                      onChange={(e) => {
                        setMouDetails(e.target.value);
                        mark();
                      }}
                      rows={4}
                      placeholder="Enter terms, conditions, notes, and additional MOU information"
                      className="w-full px-3 py-2 rounded slds-text-4 focus:outline-none resize-none"
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* ── Card 4: Demographics Accepted ────────────────────────────────── */}
          <Card>
            <CardHeader title="Demographics Accepted" />
            <div className="px-4 py-4 space-y-5">
              {/* Accepted Age subsection */}
              <div>
                <p
                  className="text-[12px] font-semibold uppercase tracking-wide mb-3"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Accepted Age
                </p>
                <div
                  className="grid grid-cols-2 gap-x-6 gap-y-4"
                  style={{ maxWidth: 480 }}
                >
                  <div className="space-y-1.5">
                    <FormLabel htmlFor="minAge">
                      MINIMUM AGE
                    </FormLabel>
                    <input
                      id="minAge"
                      type="number"
                      min="0"
                      value={minAge}
                      onChange={(e) => {
                        setMinAge(e.target.value);
                        setAgeErrors({});
                        mark();
                      }}
                      placeholder="0"
                      className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
                      style={
                        ageErrors.minAge
                          ? {
                              ...inputStyle,
                              border: "1px solid #c23934",
                            }
                          : inputStyle
                      }
                    />
                    {ageErrors.minAge && (
                      <p
                        className="slds-text-3 mt-0.5"
                        style={{ color: "#c23934" }}
                      >
                        {ageErrors.minAge}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <FormLabel htmlFor="maxAge">
                      MAXIMUM AGE
                    </FormLabel>
                    <input
                      id="maxAge"
                      type="number"
                      min="0"
                      value={maxAge}
                      onChange={(e) => {
                        setMaxAge(e.target.value);
                        setAgeErrors({});
                        mark();
                      }}
                      placeholder="0"
                      className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
                      style={
                        ageErrors.maxAge
                          ? {
                              ...inputStyle,
                              border: "1px solid #c23934",
                            }
                          : inputStyle
                      }
                    />
                    {ageErrors.maxAge && (
                      <p
                        className="slds-text-3 mt-0.5"
                        style={{ color: "#c23934" }}
                      >
                        {ageErrors.maxAge}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  borderTop:
                    "1px solid var(--slds-g-color-border-base-1)",
                  paddingTop: "1.25rem",
                }}
              >
                <p
                  className="text-[12px] font-semibold uppercase tracking-wide mb-3"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Accepted Gender
                </p>
                <div className="flex gap-4 flex-wrap">
                  {GENDER_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      <input
                        type="checkbox"
                        value={opt}
                        checked={gender === opt}
                        onChange={() => {
                          setGender(gender === opt ? "" : opt);
                          mark();
                        }}
                        style={{
                          accentColor: "#145F33",
                          width: 16,
                          height: 16,
                        }}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* ── Card 5: Regular Schedule ──────────────────────────────────────── */}
          <Card>
            <CardHeader
              title="Regular Schedule"
              subtitle="Manage regular operating hours for this organization."
              action={addBtn("Add Schedule", () =>
                setSchedModal({
                  open: true,
                  mode: "add",
                  record: undefined,
                }),
              )}
            />
            {schedules.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p
                  className="slds-text-4 mb-3"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  No regular schedules have been added.
                </p>
                {addBtn("Add Schedule", () =>
                  setSchedModal({
                    open: true,
                    mode: "add",
                    record: undefined,
                  }),
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr style={tableHeadStyle}>
                      {th("DAY OF WEEK")}
                      {th("OPENS AT")}
                      {th("CLOSES AT")}
                      {th("START DATE")}
                      {th("END DATE")}
                      {th("ADDITIONAL INFO")}
                      {th("ACTIONS", 100)}
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((s, idx) => (
                      <tr
                        key={s.id}
                        style={{
                          borderBottom:
                            idx < schedules.length - 1
                              ? "1px solid var(--slds-g-color-border-base-1)"
                              : undefined,
                        }}
                      >
                        <td
                          className="px-4 py-2.5 slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {s.dayOfWeek}
                        </td>
                        <td
                          className="px-4 py-2.5 slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {fmtTime(s.opensAt)}
                        </td>
                        <td
                          className="px-4 py-2.5 slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {fmtTime(s.closesAt)}
                        </td>
                        <td
                          className="px-4 py-2.5 slds-text-4"
                          style={{
                            color: s.startDate
                              ? "var(--slds-g-color-text-default)"
                              : "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {s.startDate || "—"}
                        </td>
                        <td
                          className="px-4 py-2.5 slds-text-4"
                          style={{
                            color: s.endDate
                              ? "var(--slds-g-color-text-default)"
                              : "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {s.endDate || "—"}
                        </td>
                        <td
                          className="px-4 py-2.5 slds-text-4"
                          style={{
                            color: s.additionalInfo
                              ? "var(--slds-g-color-text-default)"
                              : "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {s.additionalInfo || "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-0.5">
                            <ActionIconBtn
                              title="View"
                              onClick={() =>
                                setSchedModal({
                                  open: true,
                                  mode: "view",
                                  record: s,
                                })
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </ActionIconBtn>
                            <ActionIconBtn
                              title="Edit"
                              onClick={() =>
                                setSchedModal({
                                  open: true,
                                  mode: "edit",
                                  record: s,
                                })
                              }
                            >
                              <Pencil className="w-4 h-4" />
                            </ActionIconBtn>
                            <ActionIconBtn
                              title="Delete"
                              color="#c23934"
                              onClick={() =>
                                setSchedDeleteId(s.id)
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </ActionIconBtn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* ── Card 6: Languages ─────────────────────────────────────────────── */}
          <Card>
            <CardHeader
              title="Languages"
              subtitle="Languages supported by this organization."
              action={addBtn("Add Language", () =>
                setLangModalOpen(true),
              )}
            />
            <div className="px-4 py-4">
              {languages.length === 0 ? (
                <p
                  className="slds-text-4 py-4 text-center"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  No languages have been added.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {languages.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full slds-text-4"
                      style={{
                        backgroundColor: "#e8f5e9",
                        border: "1px solid #c8e6c9",
                        color: "#145F33",
                      }}
                    >
                      <span>
                        {l.language === "Other" &&
                        l.otherLanguage
                          ? l.otherLanguage
                          : l.language}
                      </span>
                      <button
                        title={`Remove ${l.language}`}
                        onClick={() => setLangDeleteId(l.id)}
                        style={{
                          color: "#145F33",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* ── Page-level Save / Cancel ──────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              className="h-9 rounded-full slds-text-4 shadow-none"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                color: "var(--slds-g-color-text-default)",
              }}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              className="h-9 rounded-full slds-text-4 text-white shadow-none"
              style={{ backgroundColor: "#145F33" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#0e4524")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#145F33")
              }
              onClick={handleSaveChanges}
            >
              Save Changes
            </Button>
          </div>

          {/* ── Modals ────────────────────────────────────────────────────────── */}
          <ScheduleModal
            open={schedModal.open}
            mode={schedModal.mode}
            initial={schedModal.record}
            onClose={() =>
              setSchedModal((p) => ({ ...p, open: false }))
            }
            onSave={saveSchedule}
          />

          <LanguageModal
            open={langModalOpen}
            onClose={() => setLangModalOpen(false)}
            onSave={addLanguage}
            existing={languages}
          />

          <DeleteConfirmDialog
            open={schedDeleteId !== null}
            message="Are you sure you want to delete this schedule?"
            onCancel={() => setSchedDeleteId(null)}
            onConfirm={() =>
              schedDeleteId !== null &&
              deleteSchedule(schedDeleteId)
            }
          />

          <DeleteConfirmDialog
            open={langDeleteId !== null}
            message="Are you sure you want to remove this language?"
            onCancel={() => setLangDeleteId(null)}
            onConfirm={() =>
              langDeleteId !== null &&
              removeLanguage(langDeleteId)
            }
          />

          <DiscardDialog
            open={discardOpen}
            onKeep={() => setDiscardOpen(false)}
            onDiscard={() => {
              setDiscardOpen(false);
              toast.info("Changes discarded.");
              setDirty(false);
            }}
          />
        </>
      )}

      <AddOrganizationModal
        open={addOrgOpen}
        onClose={() => setAddOrgOpen(false)}
      />
    </div>
  );
}