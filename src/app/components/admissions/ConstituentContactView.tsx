import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";
import { Label } from "../ui/label";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
  id: number;
  type: string;
  status: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  country: string;
  startDate: string;
  endDate: string;
  preferred: boolean;
}

interface Phone {
  id: number;
  number: string;
  extension: string;
  type: string;
  status: string;
  preferred: boolean;
  startDate: string;
  endDate: string;
  notes: string;
}

interface Email {
  id: number;
  address: string;
  type: string;
  status: string;
  preferred: boolean;
  startDate: string;
  endDate: string;
  notes: string;
}

interface Website {
  id: number;
  url: string;
  type: string;
  status: string;
  preferred: boolean;
  startDate: string;
  endDate: string;
  notes: string;
}

type MailPref = "Mail Allowed" | "Do Not Mail" | "Homeless";

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTACT_PREFERENCE_OPTIONS = [
  "No Preference",
  "Phone Preferred",
  "Email Preferred",
  "Mail Preferred",
];

const MAIL_PREF_OPTIONS: MailPref[] = [
  "Mail Allowed",
  "Do Not Mail",
  "Homeless",
];

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];
const COUNTRIES = [
  "United States",
  "Canada",
  "Mexico",
  "United Kingdom",
  "Australia",
  "Other",
];

const ADDRESS_TYPES = [
  "Home",
  "Business",
  "School",
  "Seasonal",
  "Unknown",
];
const ADDRESS_STATUSES = ["Good Address", "Bad Address"];

const PHONE_TYPES = [
  "Home",
  "Business",
  "Mobile",
  "Fax",
  "School",
  "Unknown",
  "General",
  "Hotline",
];
const PHONE_STATUSES = ["Good Phone", "Bad Phone"];

const EMAIL_TYPES = ["Home", "Business", "School", "Unknown"];
const EMAIL_STATUSES = ["Good Email", "Bad Email"];

const WEBSITE_TYPES = [
  "Portal",
  "School",
  "Business",
  "Personal",
  "Appointment",
  "Facebook",
  "Twitter",
];
const WEBSITE_STATUSES = ["Good Website", "Bad Website"];

// ─── ID counter ───────────────────────────────────────────────────────────────

let _nextId = 1;
function uid() {
  return _nextId++;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function toInputDate(s: string): string {
  if (!s) return "";
  const [m, d, y] = s.split("/");
  return `${y}-${m}-${d}`;
}
function fromInputDate(s: string): string {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${m}/${d}/${y}`;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const good = status.startsWith("Good") || status === "Active";
  return (
    <span
      className="text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
      style={{
        backgroundColor: good
          ? "rgba(20,95,51,0.1)"
          : "rgba(100,100,100,0.08)",
        color: good
          ? "#145F33"
          : "var(--slds-g-color-text-weak)",
      }}
    >
      {status}
    </span>
  );
}

function PreferredBadge({ preferred }: { preferred: boolean }) {
  if (!preferred)
    return (
      <span
        className="text-[13px]"
        style={{ color: "var(--slds-g-color-text-weak)" }}
      >
        —
      </span>
    );
  return (
    <span
      className="text-[11px] px-2 py-0.5 rounded-full font-medium"
      style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}
    >
      Preferred
    </span>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden"
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
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="px-4 py-3"
      style={{
        borderBottom:
          "1px solid var(--slds-g-color-border-base-1)",
        backgroundColor: "var(--slds-g-color-background-alt)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Buttons ──────────────────────────────────────────────────────────────────

function SecBtn({
  children,
  onClick,
  disabled = false,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-8 px-3 rounded-full text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        border: "1px solid var(--slds-g-color-border-base-1)",
        backgroundColor: "var(--slds-g-color-background-base)",
        color: "var(--slds-g-color-text-default)",
      }}
    >
      {children}
    </button>
  );
}

function PrimaryBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="h-8 px-3 rounded-full text-[12px] font-medium text-white"
      style={{ backgroundColor: "#145F33" }}
    >
      {children}
    </button>
  );
}

// ─── Table helpers ────────────────────────────────────────────────────────────

function EmptyRow({
  colSpan,
  message,
}: {
  colSpan: number;
  message: string;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-6 py-10 text-center text-[13px]"
        style={{ color: "var(--slds-g-color-text-weak)" }}
      >
        {message}
      </td>
    </tr>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
      style={{ color: "var(--slds-g-color-text-weak)" }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <td
      className="px-3 py-2.5 text-[13px]"
      style={{
        color: muted
          ? "var(--slds-g-color-text-weak)"
          : "var(--slds-g-color-text-default)",
      }}
    >
      {children}
    </td>
  );
}

function TableFooter({
  count,
  selected,
}: {
  count: number;
  selected: boolean;
}) {
  if (count === 0) return null;
  return (
    <div
      className="px-4 py-2"
      style={{
        borderTop:
          "1px solid var(--slds-g-color-border-base-1)",
        backgroundColor: "var(--slds-g-color-background-alt)",
      }}
    >
      <span
        className="text-[12px]"
        style={{ color: "var(--slds-g-color-text-weak)" }}
      >
        {count} record{count !== 1 ? "s" : ""}
        {selected ? " · 1 selected" : ""}
      </span>
    </div>
  );
}

function rowStyle(
  id: number,
  selId: number | null,
  idx: number,
): React.CSSProperties {
  const sel = id === selId;
  return {
    borderBottom: "1px solid var(--slds-g-color-border-base-1)",
    backgroundColor: sel
      ? "rgba(20,95,51,0.05)"
      : idx % 2 === 0
        ? "var(--slds-g-color-background-base)"
        : "var(--slds-g-color-background-alt)",
    outline: sel ? "2px solid #145F33" : "none",
    outlineOffset: "-2px",
    cursor: "pointer",
  };
}

// ─── Multi-select (Contact Preferences) ──────────────────────────────────────

function MultiSelect({
  id,
  options,
  selected,
  onChange,
  placeholder = "Select...",
}: {
  id: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-9 w-full px-3 flex items-center justify-between rounded text-[13px] text-left"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
          color:
            selected.length === 0
              ? "var(--slds-g-color-text-weak)"
              : "var(--slds-g-color-text-default)",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">
          {selected.length === 0
            ? placeholder
            : selected.join(", ")}
        </span>
        {open ? (
          <ChevronUp
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          />
        ) : (
          <ChevronDown
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          />
        )}
      </button>
      {open && (
        <div
          className="absolute z-20 left-0 mt-1 w-full rounded shadow-lg"
          style={{
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-base)",
          }}
          role="listbox"
          aria-multiselectable="true"
        >
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-[#f3f3f3] text-[13px]"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() =>
                  onChange(
                    selected.includes(opt)
                      ? selected.filter((s) => s !== opt)
                      : [...selected, opt],
                  )
                }
                style={{ accentColor: "#145F33" }}
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Modal form primitives ────────────────────────────────────────────────────

function FL({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="slds-form-label"
      style={{ color: "var(--slds-g-color-text-weak)" }}
    >
      {children}
      {required && <span className="text-red-600">*</span>}
    </label>
  );
}

function FE({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p
      className="text-[11px]"
      style={{ color: "#c23934" }}
      role="alert"
    >
      {msg}
    </p>
  );
}

function FSel({
  id,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
      style={{
        border: `1px solid ${error ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
        backgroundColor: "var(--slds-g-color-background-base)",
        color: value
          ? "var(--slds-g-color-text-default)"
          : "var(--slds-g-color-text-weak)",
      }}
      aria-invalid={!!error}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function FIn({
  id,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
      style={{
        border: `1px solid ${error ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
        backgroundColor: "var(--slds-g-color-background-base)",
        color: "var(--slds-g-color-text-default)",
      }}
      aria-invalid={!!error}
    />
  );
}

function FDate({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <DateInput
      id={id}
      value={isoToMdy(toInputDate(value))}
      onChange={(v) =>
        ((e) => onChange(fromInputDate(e.target.value)))({
          target: { value: mdyToIso(v) },
        })
      }
      className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
      style={{
        border: "1px solid var(--slds-g-color-border-base-1)",
        backgroundColor: "var(--slds-g-color-background-base)",
        color: "var(--slds-g-color-text-default)",
      }}
    />
  );
}

function FTa({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded text-[13px] focus:outline-none resize-y"
      style={{
        border: "1px solid var(--slds-g-color-border-base-1)",
        backgroundColor: "var(--slds-g-color-background-base)",
        color: "var(--slds-g-color-text-default)",
        minHeight: "72px",
      }}
    />
  );
}

function FCb({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 cursor-pointer text-[13px]"
      style={{ color: "var(--slds-g-color-text-default)" }}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          accentColor: "#145F33",
          width: 15,
          height: 15,
        }}
      />
      {label}
    </label>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────

function ModalShell({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="m-title"
    >
      <div
        className="rounded-lg w-full max-w-2xl mx-4 flex flex-col overflow-hidden"
        style={{
          maxHeight: "90vh",
          backgroundColor:
            "var(--slds-g-color-background-base)",
          border: "1px solid var(--slds-g-color-border-base-1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <h2
            id="m-title"
            className="text-[15px] font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-200"
            style={{ color: "var(--slds-g-color-text-weak)" }}
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
        {/* Footer */}
        <div
          className="px-6 py-4 flex justify-end gap-2 flex-shrink-0"
          style={{
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          {footer}
        </div>
      </div>
    </div>
  );
}

// ─── Add Address Modal ────────────────────────────────────────────────────────

const EMPTY_ADDR = {
  type: "",
  status: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
  county: "",
  country: "",
  startDate: "",
  endDate: "",
  preferred: false,
};

function AddAddressModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (v: Omit<Address, "id">) => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_ADDR });
  const [errs, setErrs] = useState<Record<string, string>>({});
  function set<K extends keyof typeof form>(
    k: K,
    v: (typeof form)[K],
  ) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrs((e) => ({ ...e, [k]: "" }));
  }
  function validate() {
    const e: Record<string, string> = {};
    if (!form.type) e.type = "Address Type is required.";
    if (!form.status) e.status = "Address Status is required.";
    if (!form.line1) e.line1 = "Address Line 1 is required.";
    if (!form.city) e.city = "City is required.";
    if (!form.state) e.state = "State is required.";
    if (!form.zip) e.zip = "Zip Code is required.";
    setErrs(e);
    return Object.keys(e).length === 0;
  }
  return (
    <ModalShell
      title="Add Address"
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-full text-[13px] font-medium"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              color: "var(--slds-g-color-text-default)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (validate()) onSave(form);
            }}
            className="h-9 px-4 rounded-full text-[13px] font-medium text-white"
            style={{ backgroundColor: "#145F33" }}
          >
            Save Address
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div className="space-y-1.5">
          <FL htmlFor="a-type" required>
            ADDRESS TYPE
          </FL>
          <FSel
            id="a-type"
            value={form.type}
            onChange={(v) => set("type", v)}
            options={ADDRESS_TYPES}
            placeholder="Please Select"
            error={errs.type}
          />
          <FE msg={errs.type} />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="a-status" required>
            ADDRESS STATUS
          </FL>
          <FSel
            id="a-status"
            value={form.status}
            onChange={(v) => set("status", v)}
            options={ADDRESS_STATUSES}
            placeholder="Please Select"
            error={errs.status}
          />
          <FE msg={errs.status} />
        </div>
        <div className="col-span-2 space-y-1.5">
          <FL htmlFor="a-line1" required>
            ADDRESS LINE 1
          </FL>
          <FIn
            id="a-line1"
            value={form.line1}
            onChange={(v) => set("line1", v)}
            placeholder="123 Main Street"
            error={errs.line1}
          />
          <FE msg={errs.line1} />
        </div>
        <div className="col-span-2 space-y-1.5">
          <FL htmlFor="a-line2">ADDRESS LINE 2</FL>
          <FIn
            id="a-line2"
            value={form.line2}
            onChange={(v) => set("line2", v)}
            placeholder="Apt, Suite, etc."
          />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="a-city" required>
            CITY
          </FL>
          <FIn
            id="a-city"
            value={form.city}
            onChange={(v) => set("city", v)}
            error={errs.city}
          />
          <FE msg={errs.city} />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="a-state" required>
            STATE
          </FL>
          <FSel
            id="a-state"
            value={form.state}
            onChange={(v) => set("state", v)}
            options={US_STATES}
            placeholder="Please Select"
            error={errs.state}
          />
          <FE msg={errs.state} />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="a-zip" required>
            ZIP CODE
          </FL>
          <FIn
            id="a-zip"
            value={form.zip}
            onChange={(v) => set("zip", v)}
            error={errs.zip}
          />
          <FE msg={errs.zip} />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="a-county">COUNTY</FL>
          <FIn
            id="a-county"
            value={form.county}
            onChange={(v) => set("county", v)}
          />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="a-country">COUNTRY</FL>
          <FSel
            id="a-country"
            value={form.country}
            onChange={(v) => set("country", v)}
            options={COUNTRIES}
            placeholder="Please Select"
          />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="a-start">START DATE</FL>
          <FDate
            id="a-start"
            value={form.startDate}
            onChange={(v) => set("startDate", v)}
          />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="a-end">END DATE</FL>
          <FDate
            id="a-end"
            value={form.endDate}
            onChange={(v) => set("endDate", v)}
          />
        </div>
        <div className="col-span-2">
          <FCb
            id="a-pref"
            checked={form.preferred}
            onChange={(v) => set("preferred", v)}
            label="Preferred Address"
          />
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Add Phone Modal ──────────────────────────────────────────────────────────

const EMPTY_PHONE = {
  number: "",
  extension: "",
  type: "",
  status: "",
  preferred: false,
  startDate: "",
  endDate: "",
  notes: "",
};

function AddPhoneModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (v: Omit<Phone, "id">) => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_PHONE });
  const [errs, setErrs] = useState<Record<string, string>>({});
  function set<K extends keyof typeof form>(
    k: K,
    v: (typeof form)[K],
  ) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrs((e) => ({ ...e, [k]: "" }));
  }
  function validate() {
    const e: Record<string, string> = {};
    if (!form.number) e.number = "Phone Number is required.";
    if (!form.type) e.type = "Phone Type is required.";
    if (!form.status) e.status = "Phone Status is required.";
    setErrs(e);
    return Object.keys(e).length === 0;
  }
  return (
    <ModalShell
      title="Add Phone"
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-full text-[13px] font-medium"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              color: "var(--slds-g-color-text-default)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (validate()) onSave(form);
            }}
            className="h-9 px-4 rounded-full text-[13px] font-medium text-white"
            style={{ backgroundColor: "#145F33" }}
          >
            Save Phone
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div className="space-y-1.5">
          <FL htmlFor="p-num" required>
            PHONE NUMBER
          </FL>
          <FIn
            id="p-num"
            value={form.number}
            onChange={(v) => set("number", v)}
            placeholder="(312) 555-0100"
            type="tel"
            error={errs.number}
          />
          <FE msg={errs.number} />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="p-ext">EXTENSION</FL>
          <FIn
            id="p-ext"
            value={form.extension}
            onChange={(v) => set("extension", v)}
            placeholder="e.g. 123"
          />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="p-type" required>
            PHONE TYPE
          </FL>
          <FSel
            id="p-type"
            value={form.type}
            onChange={(v) => set("type", v)}
            options={PHONE_TYPES}
            placeholder="Please Select"
            error={errs.type}
          />
          <FE msg={errs.type} />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="p-status" required>
            PHONE STATUS
          </FL>
          <FSel
            id="p-status"
            value={form.status}
            onChange={(v) => set("status", v)}
            options={PHONE_STATUSES}
            placeholder="Please Select"
            error={errs.status}
          />
          <FE msg={errs.status} />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="p-start">START DATE</FL>
          <FDate
            id="p-start"
            value={form.startDate}
            onChange={(v) => set("startDate", v)}
          />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="p-end">END DATE</FL>
          <FDate
            id="p-end"
            value={form.endDate}
            onChange={(v) => set("endDate", v)}
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <FL htmlFor="p-notes">NOTES</FL>
          <FTa
            id="p-notes"
            value={form.notes}
            onChange={(v) => set("notes", v)}
            placeholder="Add any relevant notes..."
          />
        </div>
        <div className="col-span-2">
          <FCb
            id="p-pref"
            checked={form.preferred}
            onChange={(v) => set("preferred", v)}
            label="Preferred Phone"
          />
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Add Email Modal ──────────────────────────────────────────────────────────

const EMPTY_EMAIL = {
  address: "",
  type: "",
  status: "",
  preferred: false,
  startDate: "",
  endDate: "",
  notes: "",
};

function AddEmailModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (v: Omit<Email, "id">) => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_EMAIL });
  const [errs, setErrs] = useState<Record<string, string>>({});
  function set<K extends keyof typeof form>(
    k: K,
    v: (typeof form)[K],
  ) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrs((e) => ({ ...e, [k]: "" }));
  }
  function validate() {
    const e: Record<string, string> = {};
    if (!form.address) {
      e.address = "Email Address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.address)
    ) {
      e.address = "Enter a valid email address.";
    }
    if (!form.type) e.type = "Email Type is required.";
    if (!form.status) e.status = "Email Status is required.";
    setErrs(e);
    return Object.keys(e).length === 0;
  }
  return (
    <ModalShell
      title="Add Email"
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-full text-[13px] font-medium"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              color: "var(--slds-g-color-text-default)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (validate()) onSave(form);
            }}
            className="h-9 px-4 rounded-full text-[13px] font-medium text-white"
            style={{ backgroundColor: "#145F33" }}
          >
            Save Email
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div className="col-span-2 space-y-1.5">
          <FL htmlFor="e-addr" required>
            EMAIL ADDRESS
          </FL>
          <FIn
            id="e-addr"
            value={form.address}
            onChange={(v) => set("address", v)}
            placeholder="name@example.com"
            type="email"
            error={errs.address}
          />
          <FE msg={errs.address} />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="e-type" required>
            EMAIL TYPE
          </FL>
          <FSel
            id="e-type"
            value={form.type}
            onChange={(v) => set("type", v)}
            options={EMAIL_TYPES}
            placeholder="Please Select"
            error={errs.type}
          />
          <FE msg={errs.type} />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="e-status" required>
            EMAIL STATUS
          </FL>
          <FSel
            id="e-status"
            value={form.status}
            onChange={(v) => set("status", v)}
            options={EMAIL_STATUSES}
            placeholder="Please Select"
            error={errs.status}
          />
          <FE msg={errs.status} />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="e-start">START DATE</FL>
          <FDate
            id="e-start"
            value={form.startDate}
            onChange={(v) => set("startDate", v)}
          />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="e-end">END DATE</FL>
          <FDate
            id="e-end"
            value={form.endDate}
            onChange={(v) => set("endDate", v)}
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <FL htmlFor="e-notes">NOTES</FL>
          <FTa
            id="e-notes"
            value={form.notes}
            onChange={(v) => set("notes", v)}
            placeholder="Add any relevant notes..."
          />
        </div>
        <div className="col-span-2">
          <FCb
            id="e-pref"
            checked={form.preferred}
            onChange={(v) => set("preferred", v)}
            label="Preferred Email"
          />
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Add Website Modal ────────────────────────────────────────────────────────

const EMPTY_WEBSITE = {
  url: "",
  type: "",
  status: "",
  preferred: false,
  startDate: "",
  endDate: "",
  notes: "",
};

function AddWebsiteModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (v: Omit<Website, "id">) => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_WEBSITE });
  const [errs, setErrs] = useState<Record<string, string>>({});
  function set<K extends keyof typeof form>(
    k: K,
    v: (typeof form)[K],
  ) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrs((e) => ({ ...e, [k]: "" }));
  }
  function validate() {
    const e: Record<string, string> = {};
    if (!form.url) {
      e.url = "Website URL is required.";
    } else {
      try {
        new URL(
          form.url.startsWith("http")
            ? form.url
            : `https://${form.url}`,
        );
      } catch {
        e.url = "Enter a valid website URL.";
      }
    }
    if (!form.status) e.status = "Website Status is required.";
    setErrs(e);
    return Object.keys(e).length === 0;
  }
  return (
    <ModalShell
      title="Add Website"
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-full text-[13px] font-medium"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              color: "var(--slds-g-color-text-default)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (validate()) onSave(form);
            }}
            className="h-9 px-4 rounded-full text-[13px] font-medium text-white"
            style={{ backgroundColor: "#145F33" }}
          >
            Save Website
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div className="col-span-2 space-y-1.5">
          <FL htmlFor="w-url" required>
            WEBSITE URL
          </FL>
          <FIn
            id="w-url"
            value={form.url}
            onChange={(v) => set("url", v)}
            placeholder="https://example.com"
            error={errs.url}
          />
          <FE msg={errs.url} />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="w-type" required>
            WEBSITE TYPE
          </FL>
          <FSel
            id="w-type"
            value={form.type}
            onChange={(v) => set("type", v)}
            options={WEBSITE_TYPES}
            placeholder="Please Select"
            error={errs.type}
          />
          <FE msg={errs.type} />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="w-status" required>
            WEBSITE STATUS
          </FL>
          <FSel
            id="w-status"
            value={form.status}
            onChange={(v) => set("status", v)}
            options={WEBSITE_STATUSES}
            placeholder="Please Select"
            error={errs.status}
          />
          <FE msg={errs.status} />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="w-start">START DATE</FL>
          <FDate
            id="w-start"
            value={form.startDate}
            onChange={(v) => set("startDate", v)}
          />
        </div>
        <div className="space-y-1.5">
          <FL htmlFor="w-end">END DATE</FL>
          <FDate
            id="w-end"
            value={form.endDate}
            onChange={(v) => set("endDate", v)}
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <FL htmlFor="w-notes">NOTES</FL>
          <FTa
            id="w-notes"
            value={form.notes}
            onChange={(v) => set("notes", v)}
            placeholder="Add any relevant notes..."
          />
        </div>
        <div className="col-span-2">
          <FCb
            id="w-pref"
            checked={form.preferred}
            onChange={(v) => set("preferred", v)}
            label="Preferred Website"
          />
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type ActiveModal =
  "none" | "addAddr" | "addPhone" | "addEmail" | "addWeb";

export interface ContactSeed {
  addresses: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    zip: string;
  }[];
  phones: { number: string }[];
  emails: { address: string }[];
}

export function ConstituentContactView({
  seed,
}: { seed?: ContactSeed } = {}) {
  // Preferences
  const [savedPrefs, setSavedPrefs] = useState({
    contactPref: "No Preference",
    mailPrefs: [] as MailPref[],
  });
  const [contactPref, setContactPref] =
    useState("No Preference");
  const [mailPrefs, setMailPrefs] = useState<MailPref[]>([]);

  // Data
  const [addresses, setAddresses] = useState<Address[]>(() =>
    (seed?.addresses ?? []).map((a, i) => ({
      id: uid(),
      type: "Unknown",
      status: "Good Address",
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      state: a.state,
      zip: a.zip,
      county: "",
      country: "United States",
      startDate: "",
      endDate: "",
      preferred: i === 0,
    })),
  );
  const [phones, setPhones] = useState<Phone[]>(() =>
    (seed?.phones ?? []).map((p, i) => ({
      id: uid(),
      number: p.number,
      extension: "",
      type: "Unknown",
      status: "Good Phone",
      preferred: i === 0,
      startDate: "",
      endDate: "",
      notes: "",
    })),
  );
  const [emails, setEmails] = useState<Email[]>(() =>
    (seed?.emails ?? []).map((e, i) => ({
      id: uid(),
      address: e.address,
      type: "Unknown",
      status: "Good Email",
      preferred: i === 0,
      startDate: "",
      endDate: "",
      notes: "",
    })),
  );
  const [websites, setWebsites] = useState<Website[]>([]);

  // Selection
  const [selAddrId, setSelAddrId] = useState<number | null>(
    null,
  );
  const [selPhoneId, setSelPhoneId] = useState<number | null>(
    null,
  );
  const [selEmailId, setSelEmailId] = useState<number | null>(
    null,
  );
  const [selWebId, setSelWebId] = useState<number | null>(null);

  // Active modal
  const [activeModal, setActiveModal] =
    useState<ActiveModal>("none");

  // Dirty check
  const hasChanges =
    contactPref !== savedPrefs.contactPref ||
    JSON.stringify([...mailPrefs].sort()) !==
      JSON.stringify([...savedPrefs.mailPrefs].sort());

  function handleSave() {
    setSavedPrefs({ contactPref, mailPrefs });
    toast.success("Contact information updated successfully.");
  }
  function handleCancel() {
    setContactPref(savedPrefs.contactPref);
    setMailPrefs(savedPrefs.mailPrefs);
    toast.success("Changes discarded successfully.");
  }

  const selAddr =
    addresses.find((a) => a.id === selAddrId) ?? null;
  const selPhone =
    phones.find((p) => p.id === selPhoneId) ?? null;
  const selEmail =
    emails.find((e) => e.id === selEmailId) ?? null;
  const selWeb =
    websites.find((w) => w.id === selWebId) ?? null;

  return (
    <>
      <div className="space-y-4 w-full">
        {/* Page header card */}
        <div
          className="overflow-hidden"
          style={{
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: "var(--slds-c-card-radius-border)",
            backgroundColor:
              "var(--slds-g-color-background-base)",
          }}
        >
          <div
            className="px-4 py-3 flex items-start justify-between gap-4"
            style={{
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <div>
              <h3
                className="text-[13px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Contact
              </h3>
              <p
                className="slds-text-3 mt-0.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Manage communication preferences, addresses,
                phone numbers, email addresses, and websites for
                this Organization constituent.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <SecBtn onClick={handleCancel}>Cancel</SecBtn>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="h-8 px-4 rounded-full text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-white"
                style={{ backgroundColor: "#145F33" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Contact Preferences */}
        <Card>
          <CardHeader>
            <h3
              className="text-[13px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Contact Preferences
            </h3>
            <p
              className="slds-text-3 mt-0.5"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Configure preferred communication methods for this
              organization.
            </p>
          </CardHeader>
          <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 max-w-2xl">
            <div className="space-y-1.5">
              <Label
                htmlFor="contactPref"
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                CONTACT PREFERENCE
              </Label>
              <select
                id="contactPref"
                value={contactPref}
                onChange={(e) => setContactPref(e.target.value)}
                className="h-9 w-full px-3 rounded text-[13px]"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {CONTACT_PREFERENCE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="mailPref"
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                MAIL PREFERENCE
              </Label>
              <MultiSelect
                id="mailPref"
                options={MAIL_PREF_OPTIONS}
                selected={mailPrefs}
                onChange={(vals) =>
                  setMailPrefs(vals as MailPref[])
                }
                placeholder="Select preferences..."
              />
              <p
                className="slds-text-3"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                You may select multiple mail preferences.
              </p>
            </div>
          </div>
        </Card>

        {/* Addresses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className="text-[13px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Addresses
                  </h3>
                  {addresses.length > 0 && (
                    <span
                      className="text-[12px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: "rgba(20,95,51,0.1)",
                        color: "#145F33",
                      }}
                    >
                      {addresses.length}
                    </span>
                  )}
                </div>
                <p
                  className="slds-text-3 mt-0.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Manage mailing and physical addresses
                  associated with this organization.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <SecBtn
                  disabled={!selAddr}
                  title={
                    selAddr
                      ? "Edit selected address"
                      : "Select a row to edit"
                  }
                >
                  Edit
                </SecBtn>
                <SecBtn
                  disabled={!selAddr}
                  title={
                    selAddr
                      ? "Delete selected address"
                      : "Select a row to delete"
                  }
                >
                  Delete
                </SecBtn>
                <SecBtn
                  disabled={!selAddr}
                  title={
                    selAddr
                      ? "View history"
                      : "Select a row to view history"
                  }
                >
                  History
                </SecBtn>
                <PrimaryBtn
                  onClick={() => setActiveModal("addAddr")}
                >
                  + Add Address
                </PrimaryBtn>
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table
              className="w-full"
              style={{
                borderCollapse: "collapse",
                minWidth: 820,
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                    borderBottom:
                      "2px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <th className="px-1 py-2.5 w-10" />
                  <Th>Address Type</Th>
                  <Th>Address Line 1</Th>
                  <Th>City</Th>
                  <Th>State</Th>
                  <Th>Zip Code</Th>
                  <Th>Status</Th>
                  <Th>Preferred</Th>
                  <Th>Start Date</Th>
                  <Th>End Date</Th>
                </tr>
              </thead>
              <tbody>
                {addresses.length === 0 ? (
                  <EmptyRow
                    colSpan={10}
                    message="No addresses have been added."
                  />
                ) : (
                  addresses.map((a, idx) => (
                    <tr
                      key={a.id}
                      onClick={() =>
                        setSelAddrId(
                          a.id === selAddrId ? null : a.id,
                        )
                      }
                      style={rowStyle(a.id, selAddrId, idx)}
                    >
                      <td className="px-1 py-2.5 text-center">
                        <input
                          type="radio"
                          checked={a.id === selAddrId}
                          onChange={() => setSelAddrId(a.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ accentColor: "#145F33" }}
                          aria-label={`Select address ${a.line1}`}
                        />
                      </td>
                      <Td>{a.type}</Td>
                      <Td>{a.line1}</Td>
                      <Td>{a.city}</Td>
                      <Td>{a.state}</Td>
                      <Td>{a.zip}</Td>
                      <Td>
                        {a.status ? (
                          <StatusBadge status={a.status} />
                        ) : (
                          <span
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            —
                          </span>
                        )}
                      </Td>
                      <Td>
                        <PreferredBadge
                          preferred={a.preferred}
                        />
                      </Td>
                      <Td muted={!a.startDate}>
                        {a.startDate || "—"}
                      </Td>
                      <Td muted={!a.endDate}>
                        {a.endDate || "—"}
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <TableFooter
            count={addresses.length}
            selected={!!selAddr}
          />
        </Card>

        {/* Phone Numbers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className="text-[13px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Phone Numbers
                  </h3>
                  {phones.length > 0 && (
                    <span
                      className="text-[12px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: "rgba(20,95,51,0.1)",
                        color: "#145F33",
                      }}
                    >
                      {phones.length}
                    </span>
                  )}
                </div>
                <p
                  className="slds-text-3 mt-0.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Manage phone numbers associated with this
                  organization.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <SecBtn
                  disabled={!selPhone}
                  title={
                    selPhone ? "Edit" : "Select a row to edit"
                  }
                >
                  Edit
                </SecBtn>
                <SecBtn
                  disabled={!selPhone}
                  title={
                    selPhone
                      ? "Delete"
                      : "Select a row to delete"
                  }
                >
                  Delete
                </SecBtn>
                <PrimaryBtn
                  onClick={() => setActiveModal("addPhone")}
                >
                  + Add Phone
                </PrimaryBtn>
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table
              className="w-full"
              style={{
                borderCollapse: "collapse",
                minWidth: 700,
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                    borderBottom:
                      "2px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <th className="px-1 py-2.5 w-10" />
                  <Th>Phone Number</Th>
                  <Th>Extension</Th>
                  <Th>Phone Type</Th>
                  <Th>Status</Th>
                  <Th>Preferred</Th>
                  <Th>Start Date</Th>
                  <Th>End Date</Th>
                </tr>
              </thead>
              <tbody>
                {phones.length === 0 ? (
                  <EmptyRow
                    colSpan={8}
                    message="No phone numbers have been added."
                  />
                ) : (
                  phones.map((p, idx) => (
                    <tr
                      key={p.id}
                      onClick={() =>
                        setSelPhoneId(
                          p.id === selPhoneId ? null : p.id,
                        )
                      }
                      style={rowStyle(p.id, selPhoneId, idx)}
                    >
                      <td className="px-1 py-2.5 text-center">
                        <input
                          type="radio"
                          checked={p.id === selPhoneId}
                          onChange={() => setSelPhoneId(p.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ accentColor: "#145F33" }}
                          aria-label={`Select phone ${p.number}`}
                        />
                      </td>
                      <Td>{p.number}</Td>
                      <Td muted={!p.extension}>
                        {p.extension || "—"}
                      </Td>
                      <Td>{p.type}</Td>
                      <Td>
                        {p.status ? (
                          <StatusBadge status={p.status} />
                        ) : (
                          <span
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            —
                          </span>
                        )}
                      </Td>
                      <Td>
                        <PreferredBadge
                          preferred={p.preferred}
                        />
                      </Td>
                      <Td muted={!p.startDate}>
                        {p.startDate || "—"}
                      </Td>
                      <Td muted={!p.endDate}>
                        {p.endDate || "—"}
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <TableFooter
            count={phones.length}
            selected={!!selPhone}
          />
        </Card>

        {/* Email Addresses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className="text-[13px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Email Addresses
                  </h3>
                  {emails.length > 0 && (
                    <span
                      className="text-[12px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: "rgba(20,95,51,0.1)",
                        color: "#145F33",
                      }}
                    >
                      {emails.length}
                    </span>
                  )}
                </div>
                <p
                  className="slds-text-3 mt-0.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Manage email addresses associated with this
                  organization.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <SecBtn
                  disabled={!selEmail}
                  title={
                    selEmail ? "Edit" : "Select a row to edit"
                  }
                >
                  Edit
                </SecBtn>
                <SecBtn
                  disabled={!selEmail}
                  title={
                    selEmail
                      ? "Delete"
                      : "Select a row to delete"
                  }
                >
                  Delete
                </SecBtn>
                <PrimaryBtn
                  onClick={() => setActiveModal("addEmail")}
                >
                  + Add Email
                </PrimaryBtn>
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table
              className="w-full"
              style={{
                borderCollapse: "collapse",
                minWidth: 660,
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                    borderBottom:
                      "2px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <th className="px-1 py-2.5 w-10" />
                  <Th>Email Address</Th>
                  <Th>Email Type</Th>
                  <Th>Status</Th>
                  <Th>Preferred</Th>
                  <Th>Start Date</Th>
                  <Th>End Date</Th>
                </tr>
              </thead>
              <tbody>
                {emails.length === 0 ? (
                  <EmptyRow
                    colSpan={7}
                    message="No email addresses have been added."
                  />
                ) : (
                  emails.map((em, idx) => (
                    <tr
                      key={em.id}
                      onClick={() =>
                        setSelEmailId(
                          em.id === selEmailId ? null : em.id,
                        )
                      }
                      style={rowStyle(em.id, selEmailId, idx)}
                    >
                      <td className="px-1 py-2.5 text-center">
                        <input
                          type="radio"
                          checked={em.id === selEmailId}
                          onChange={() => setSelEmailId(em.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ accentColor: "#145F33" }}
                          aria-label={`Select email ${em.address}`}
                        />
                      </td>
                      <Td>{em.address}</Td>
                      <Td>{em.type}</Td>
                      <Td>
                        {em.status ? (
                          <StatusBadge status={em.status} />
                        ) : (
                          <span
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            —
                          </span>
                        )}
                      </Td>
                      <Td>
                        <PreferredBadge
                          preferred={em.preferred}
                        />
                      </Td>
                      <Td muted={!em.startDate}>
                        {em.startDate || "—"}
                      </Td>
                      <Td muted={!em.endDate}>
                        {em.endDate || "—"}
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <TableFooter
            count={emails.length}
            selected={!!selEmail}
          />
        </Card>

        {/* Websites */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className="text-[13px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Websites
                  </h3>
                  {websites.length > 0 && (
                    <span
                      className="text-[12px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: "rgba(20,95,51,0.1)",
                        color: "#145F33",
                      }}
                    >
                      {websites.length}
                    </span>
                  )}
                </div>
                <p
                  className="slds-text-3 mt-0.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Manage website links associated with this
                  organization.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <SecBtn
                  disabled={!selWeb}
                  title={
                    selWeb ? "Edit" : "Select a row to edit"
                  }
                >
                  Edit
                </SecBtn>
                <SecBtn
                  disabled={!selWeb}
                  title={
                    selWeb ? "Delete" : "Select a row to delete"
                  }
                >
                  Delete
                </SecBtn>
                <PrimaryBtn
                  onClick={() => setActiveModal("addWeb")}
                >
                  + Add Website
                </PrimaryBtn>
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table
              className="w-full"
              style={{
                borderCollapse: "collapse",
                minWidth: 620,
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                    borderBottom:
                      "2px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <th className="px-1 py-2.5 w-10" />
                  <Th>Website URL</Th>
                  <Th>Website Type</Th>
                  <Th>Status</Th>
                  <Th>Preferred</Th>
                  <Th>Start Date</Th>
                  <Th>End Date</Th>
                </tr>
              </thead>
              <tbody>
                {websites.length === 0 ? (
                  <EmptyRow
                    colSpan={7}
                    message="No websites have been added."
                  />
                ) : (
                  websites.map((w, idx) => (
                    <tr
                      key={w.id}
                      onClick={() =>
                        setSelWebId(
                          w.id === selWebId ? null : w.id,
                        )
                      }
                      style={rowStyle(w.id, selWebId, idx)}
                    >
                      <td className="px-1 py-2.5 text-center">
                        <input
                          type="radio"
                          checked={w.id === selWebId}
                          onChange={() => setSelWebId(w.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ accentColor: "#145F33" }}
                          aria-label={`Select website ${w.url}`}
                        />
                      </td>
                      <Td>{w.url}</Td>
                      <Td>{w.type}</Td>
                      <Td>
                        {w.status ? (
                          <StatusBadge status={w.status} />
                        ) : (
                          <span
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            —
                          </span>
                        )}
                      </Td>
                      <Td>
                        <PreferredBadge
                          preferred={w.preferred}
                        />
                      </Td>
                      <Td muted={!w.startDate}>
                        {w.startDate || "—"}
                      </Td>
                      <Td muted={!w.endDate}>
                        {w.endDate || "—"}
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <TableFooter
            count={websites.length}
            selected={!!selWeb}
          />
        </Card>
      </div>

      {/* Add modals */}
      {activeModal === "addAddr" && (
        <AddAddressModal
          onClose={() => setActiveModal("none")}
          onSave={(data) => {
            const rec: Address = { id: uid(), ...data };
            setAddresses((p) => [...p, rec]);
            setSelAddrId(rec.id);
            setActiveModal("none");
            toast.success("Address added successfully.");
          }}
        />
      )}

      {activeModal === "addPhone" && (
        <AddPhoneModal
          onClose={() => setActiveModal("none")}
          onSave={(data) => {
            const rec: Phone = { id: uid(), ...data };
            setPhones((p) => [...p, rec]);
            setSelPhoneId(rec.id);
            setActiveModal("none");
            toast.success("Phone added successfully.");
          }}
        />
      )}

      {activeModal === "addEmail" && (
        <AddEmailModal
          onClose={() => setActiveModal("none")}
          onSave={(data) => {
            const rec: Email = { id: uid(), ...data };
            setEmails((p) => [...p, rec]);
            setSelEmailId(rec.id);
            setActiveModal("none");
            toast.success("Email added successfully.");
          }}
        />
      )}

      {activeModal === "addWeb" && (
        <AddWebsiteModal
          onClose={() => setActiveModal("none")}
          onSave={(data) => {
            const rec: Website = { id: uid(), ...data };
            setWebsites((p) => [...p, rec]);
            setSelWebId(rec.id);
            setActiveModal("none");
            toast.success("Website added successfully.");
          }}
        />
      )}
    </>
  );
}