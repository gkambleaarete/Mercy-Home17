import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { DateInput } from "../ui/date-input";
import {
  Upload,
  FileText,
  Eye,
  X as XIcon,
  AlertCircle,
} from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";

const INSURANCE_TYPES = [
  "Medical - Primary",
  "Medical - Secondary",
  "Dental",
  "Vision",
  "Other",
];
const PUBLIC_PRIVATE_OPTS = ["Private", "Public"];

const BLANK_FORM = {
  documentDate: "",
  dateReceived: "",
  insuranceType: "",
  otherTypeText: "",
  startDate: "",
  endDate: "",
  expirationDate: "",
  renewable: true,
  active: false,
  subscriber: "",
  provider: "",
  publicPrivate: "",
  policyNumber: "",
  groupNumber: "",
  notes: "",
  laserficheUrl: "",
};

type FormState = typeof BLANK_FORM;
type Errors = Partial<Record<keyof FormState, string>>;

function addDays(mdy: string, days: number): string {
  if (!mdy || mdy.length !== 10) return "";
  const [mm, dd, yyyy] = mdy.split("/");
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  d.setDate(d.getDate() + days);
  const nm = String(d.getMonth() + 1).padStart(2, "0");
  const nd = String(d.getDate()).padStart(2, "0");
  return `${nm}/${nd}/${d.getFullYear()}`;
}

function isDateInRange(
  mdy: string,
  startMdy: string,
  endMdy?: string,
): boolean {
  if (!mdy || !startMdy) return false;
  const parse = (s: string) => {
    const [mm, dd, yyyy] = s.split("/");
    return new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
    ).getTime();
  };
  const today = parse(mdy);
  const start = parse(startMdy);
  if (isNaN(today) || isNaN(start)) return false;
  if (today < start) return false;
  if (endMdy && endMdy.length === 10) {
    const end = parse(endMdy);
    if (!isNaN(end) && today > end) return false;
  }
  return true;
}

function todayMdy(): string {
  const n = new Date();
  return `${String(n.getMonth() + 1).padStart(2, "0")}/${String(n.getDate()).padStart(2, "0")}/${n.getFullYear()}`;
}

function policyToForm(policy: any): FormState {
  return {
    documentDate: policy.documentDate ?? "",
    dateReceived: policy.dateReceived ?? "",
    insuranceType: policy.insuranceType ?? policy.type ?? "",
    otherTypeText: policy.otherTypeText ?? "",
    startDate: policy.startDate ?? "",
    endDate: policy.endDate ?? "",
    expirationDate: policy.expirationDate ?? "",
    renewable: policy.renewable !== false,
    active: policy.active !== false,
    subscriber: policy.subscriber ?? "",
    provider: policy.provider ?? "",
    publicPrivate: policy.publicPrivate ?? "",
    policyNumber: policy.policyNumber ?? "",
    groupNumber: policy.groupNumber ?? "",
    notes: policy.notes ?? "",
    laserficheUrl: policy.laserficheUrl ?? "",
  };
}

export interface InsurancePolicyDialogProps {
  open: boolean;
  mode: "create" | "edit" | "view";
  initialData?: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function InsurancePolicyDialog({
  open,
  mode,
  initialData,
  onClose,
  onSave,
}: InsurancePolicyDialogProps) {
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [activeWarning, setActiveWarning] = useState(false);
  const [cardFrontFile, setCardFrontFile] =
    useState<string>("");
  const [cardBackFile, setCardBackFile] = useState<string>("");
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  const isView = mode === "view";
  const isCreate = mode === "create";

  useEffect(() => {
    if (!open) return;
    if (mode === "create") {
      setForm(BLANK_FORM);
      setErrors({});
      setActiveWarning(false);
      setCardFrontFile("");
      setCardBackFile("");
    } else if (initialData) {
      const f = policyToForm(initialData);
      if (
        !f.active &&
        f.startDate &&
        f.startDate.length === 10
      ) {
        f.active = isDateInRange(
          todayMdy(),
          f.startDate,
          f.endDate,
        );
      }
      setForm(f);
      setCardFrontFile(initialData.cardFrontFile ?? "");
      setCardBackFile(initialData.cardBackFile ?? "");
      setErrors({});
      setActiveWarning(false);
    }
  }, [open, mode, initialData]);

  function set<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (
        key === "startDate" &&
        typeof value === "string" &&
        value.length === 10
      ) {
        const auto = addDays(value, 364);
        if (!prev.expirationDate) next.expirationDate = auto;
        const nowActive = isDateInRange(
          todayMdy(),
          value,
          next.endDate,
        );
        next.active = nowActive;
        setActiveWarning(false);
      }
      if (key === "endDate") {
        const nowActive = isDateInRange(
          todayMdy(),
          next.startDate,
          typeof value === "string" ? value : "",
        );
        next.active = nowActive;
        setActiveWarning(false);
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleActiveChange(checked: boolean) {
    const inRange = isDateInRange(
      todayMdy(),
      form.startDate,
      form.endDate,
    );
    if (!checked && inRange) {
      setActiveWarning(true);
    } else {
      setActiveWarning(false);
    }
    setForm((prev) => ({ ...prev, active: checked }));
  }

  function validate(): boolean {
    const e: Errors = {};
    if (!form.documentDate) e.documentDate = "Required";
    if (!form.dateReceived) e.dateReceived = "Required";
    if (!form.insuranceType) e.insuranceType = "Required";
    if (form.insuranceType === "Other" && !form.otherTypeText)
      e.otherTypeText = "Required when Insurance Type is Other";
    if (!form.startDate) e.startDate = "Required";
    if (!form.expirationDate) e.expirationDate = "Required";
    if (!form.subscriber) e.subscriber = "Required";
    if (!form.provider) e.provider = "Required";
    if (!form.publicPrivate) e.publicPrivate = "Required";
    if (!form.policyNumber) e.policyNumber = "Required";
    if (!form.active) {
      const inRange = isDateInRange(
        todayMdy(),
        form.startDate,
        form.endDate,
      );
      if (inRange) {
        e.endDate =
          "Update End Date before deactivating this policy while dates are in range";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const data = { ...form, cardFrontFile, cardBackFile };
    onSave(data);
    const msg = isCreate
      ? "Insurance policy created successfully."
      : "Insurance policy updated successfully.";
    toast.success(msg);
    onClose();
  }

  const fBorder = (field: keyof FormState) =>
    errors[field]
      ? { border: "1px solid #c23934" }
      : {
          border: "1px solid var(--slds-g-color-border-base-1)",
        };

  const labelCls =
    "block text-[11px] font-semibold uppercase mb-1.5";
  const labelStyle = { color: "var(--slds-g-color-text-weak)" };
  const req = <span style={{ color: "#c23934" }}>*</span>;
  const readInput = (val: string) => (
    <div
      className="h-9 px-3 flex items-center text-[13px] rounded"
      style={{
        border: "1px solid var(--slds-g-color-border-base-1)",
        backgroundColor: "var(--slds-g-color-background-alt)",
        color: val
          ? "var(--slds-g-color-text-default)"
          : "var(--slds-g-color-text-weak)",
      }}
    >
      {val || "—"}
    </div>
  );

  const title = isView
    ? "View Insurance Policy"
    : isCreate
      ? "Add Insurance Policy"
      : "Edit Insurance Policy";
  const desc = isView
    ? "Read-only view of this insurance policy."
    : isCreate
      ? "Add a new insurance policy for this constituent."
      : "Update insurance policy details.";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent
        className="flex flex-col gap-0 p-0"
        style={{
          maxWidth: isView ? "860px" : "680px",
          width: "90vw",
          maxHeight: "90vh",
          backgroundColor:
            "var(--slds-g-color-background-base)",
          border: "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        {/* Header */}
        <DialogHeader
          className="px-6 py-4 flex-shrink-0"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <DialogTitle
            className="text-[16px] font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            {title}
          </DialogTitle>
          <DialogDescription
            className="text-[13px]"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            {desc}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          {isView ? (
            /* ── VIEW MODE: spacious read-only layout ── */
            <div className="space-y-6">
              {/* Dates: 2-col — Left: Document Date, Start Date, Expiration Date | Right: Date Received, End Date */}
              <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                <div className="space-y-5">
                  <div className="space-y-0.5">
                    <p className={labelCls} style={labelStyle}>
                      Document Date
                    </p>
                    <p
                      className="text-[13px]"
                      style={{
                        color: form.documentDate
                          ? "var(--slds-g-color-text-default)"
                          : "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {form.documentDate || "—"}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className={labelCls} style={labelStyle}>
                      Start Date
                    </p>
                    <p
                      className="text-[13px]"
                      style={{
                        color: form.startDate
                          ? "var(--slds-g-color-text-default)"
                          : "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {form.startDate || "—"}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className={labelCls} style={labelStyle}>
                      Expiration Date
                    </p>
                    <p
                      className="text-[13px]"
                      style={{
                        color: form.expirationDate
                          ? "var(--slds-g-color-text-default)"
                          : "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {form.expirationDate || "—"}
                    </p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="space-y-0.5">
                    <p className={labelCls} style={labelStyle}>
                      Date Received
                    </p>
                    <p
                      className="text-[13px]"
                      style={{
                        color: form.dateReceived
                          ? "var(--slds-g-color-text-default)"
                          : "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {form.dateReceived || "—"}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className={labelCls} style={labelStyle}>
                      End Date
                    </p>
                    <p
                      className="text-[13px]"
                      style={{
                        color: form.endDate
                          ? "var(--slds-g-color-text-default)"
                          : "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {form.endDate || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Insurance Type */}
              <div className="space-y-0.5">
                <p className={labelCls} style={labelStyle}>
                  Insurance Type
                </p>
                <p
                  className="text-[13px]"
                  style={{
                    color: form.insuranceType
                      ? "var(--slds-g-color-text-default)"
                      : "var(--slds-g-color-text-weak)",
                  }}
                >
                  {form.insuranceType
                    ? form.insuranceType === "Other"
                      ? `Other — ${form.otherTypeText}`
                      : form.insuranceType
                    : "—"}
                </p>
              </div>

              {/* Status: Renewable + Active — visual read-only checkboxes */}
              <div className="flex items-center gap-8">
                {(
                  [
                    {
                      label: "Renewable",
                      checked: form.renewable,
                    },
                    { label: "Active", checked: form.active },
                  ] as const
                ).map(({ label, checked }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="h-4 w-4 rounded border flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: checked
                          ? "#145F33"
                          : "transparent",
                        borderColor: checked
                          ? "#145F33"
                          : "var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {checked && (
                        <span
                          className="text-white font-bold"
                          style={{
                            fontSize: "10px",
                            lineHeight: 1,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <span
                      className="text-[13px] font-medium"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Section: Policy Details */}
              <div>
                <p
                  className="text-[13px] font-semibold pb-2"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  Policy Details
                </p>
                <div className="space-y-5 mt-5">
                  <div className="grid grid-cols-2 gap-x-10">
                    <div className="space-y-0.5">
                      <p
                        className={labelCls}
                        style={labelStyle}
                      >
                        Subscriber
                      </p>
                      <p
                        className="text-[13px]"
                        style={{
                          color: form.subscriber
                            ? "var(--slds-g-color-text-default)"
                            : "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {form.subscriber || "—"}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p
                        className={labelCls}
                        style={labelStyle}
                      >
                        Provider
                      </p>
                      <p
                        className="text-[13px]"
                        style={{
                          color: form.provider
                            ? "var(--slds-g-color-text-default)"
                            : "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {form.provider || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className={labelCls} style={labelStyle}>
                      Public / Private
                    </p>
                    <p
                      className="text-[13px]"
                      style={{
                        color: form.publicPrivate
                          ? "var(--slds-g-color-text-default)"
                          : "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {form.publicPrivate || "—"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-10">
                    <div className="space-y-0.5">
                      <p
                        className={labelCls}
                        style={labelStyle}
                      >
                        Policy Number
                      </p>
                      <p
                        className="text-[13px]"
                        style={{
                          color: form.policyNumber
                            ? "var(--slds-g-color-text-default)"
                            : "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {form.policyNumber || "—"}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p
                        className={labelCls}
                        style={labelStyle}
                      >
                        Group Number
                      </p>
                      <p
                        className="text-[13px]"
                        style={{
                          color: form.groupNumber
                            ? "var(--slds-g-color-text-default)"
                            : "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {form.groupNumber || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className={labelCls} style={labelStyle}>
                      Notes
                    </p>
                    <p
                      className="text-[13px] leading-relaxed"
                      style={{
                        color: form.notes
                          ? "var(--slds-g-color-text-default)"
                          : "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {form.notes || "—"}
                    </p>
                  </div>
                </div>
              </div>
              {/* Section: Insurance Card */}
              {/*<div>
                <p
                  className="text-[13px] font-semibold pb-2"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                    borderBottom: "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  Insurance Card
                </p>
                <div className="grid grid-cols-2 gap-6 mt-5">
                  {(
                    [
                      { label: "Front of Card", file: cardFrontFile },
                      { label: "Back of Card", file: cardBackFile },
                    ] as const
                  ).map(({ label, file }) => (
                    <div key={label} className="space-y-2">
                      <p className={labelCls} style={labelStyle}>{label}</p>
                      {file ? (
                        <div
                          className="flex items-center gap-2 px-3 py-2 rounded"
                          style={{ backgroundColor: "#f0f9f4", border: "1px solid #a8d5bc" }}
                        >
                          <FileText className="h-4 w-4 flex-shrink-0" style={{ color: "#145F33" }} />
                          <span className="text-[12px] flex-1 truncate" style={{ color: "#145F33" }}>
                            {file}
                          </span>
                        </div>
                      ) : (
                        <div
                          className="flex items-center justify-center h-20 rounded"
                          style={{
                            border: "1px dashed var(--slds-g-color-border-base-1)",
                            backgroundColor: "var(--slds-g-color-background-alt)",
                          }}
                        >
                          <p className="text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            No image available
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>*/}

              {/* Laserfiche Document URL */}
              {/*<div className="space-y-1.5">
                <p className={labelCls} style={labelStyle}>Laserfiche Document URL</p>
                {form.laserficheUrl ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[13px] flex-1 break-all"
                      style={{ color: "var(--slds-g-color-text-default)" }}
                    >
                      {form.laserficheUrl}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2.5 rounded-full text-[11px] flex-shrink-0 flex items-center gap-1"
                      style={{ color: "#0176d3" }}
                      onClick={() => toast.success("Opening Laserfiche document")}
                    >
                      <Eye className="h-3 w-3" /> Open
                    </Button>
                  </div>
                ) : (
                  <p className="text-[13px]" style={{ color: "var(--slds-g-color-text-weak)" }}>—</p>
                )}
              </div>*/}
            </div>
          ) : (
            /* ── CREATE / EDIT MODE: form layout (unchanged) ── */
            <div className="space-y-5">
              {/* Row 1: Document Date | Date Received */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    className={labelCls}
                    style={labelStyle}
                  >
                    Document Date {req}
                  </Label>
                  <DateInput
                    value={form.documentDate}
                    onChange={(v) => set("documentDate", v)}
                    style={fBorder("documentDate")}
                  />
                  {errors.documentDate && (
                    <p
                      className="text-[11px]"
                      style={{ color: "#c23934" }}
                    >
                      {errors.documentDate}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label
                    className={labelCls}
                    style={labelStyle}
                  >
                    Date Received {req}
                  </Label>
                  <DateInput
                    value={form.dateReceived}
                    onChange={(v) => set("dateReceived", v)}
                    style={fBorder("dateReceived")}
                  />
                  {errors.dateReceived && (
                    <p
                      className="text-[11px]"
                      style={{ color: "#c23934" }}
                    >
                      {errors.dateReceived}
                    </p>
                  )}
                </div>
              </div>

              {/* Insurance Type */}
              <div className="space-y-1.5">
                <Label className={labelCls} style={labelStyle}>
                  Insurance Type {req}
                </Label>
                <Select
                  value={form.insuranceType}
                  onValueChange={(v) => set("insuranceType", v)}
                >
                  <SelectTrigger
                    className="h-9 text-[13px] rounded"
                    style={{
                      ...fBorder("insuranceType"),
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    <SelectValue placeholder="Select insurance type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSURANCE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.insuranceType && (
                  <p
                    className="text-[11px]"
                    style={{ color: "#c23934" }}
                  >
                    {errors.insuranceType}
                  </p>
                )}
                {form.insuranceType === "Other" && (
                  <div className="mt-2 space-y-1.5">
                    <Label
                      className={labelCls}
                      style={labelStyle}
                    >
                      Other {req}
                    </Label>
                    <Input
                      value={form.otherTypeText}
                      onChange={(e) =>
                        set("otherTypeText", e.target.value)
                      }
                      placeholder="Specify insurance type..."
                      className="h-9 text-[13px] rounded"
                      style={fBorder("otherTypeText")}
                    />
                    {errors.otherTypeText && (
                      <p
                        className="text-[11px]"
                        style={{ color: "#c23934" }}
                      >
                        {errors.otherTypeText}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Start Date | End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    className={labelCls}
                    style={labelStyle}
                  >
                    Start Date {req}
                  </Label>
                  <DateInput
                    value={form.startDate}
                    onChange={(v) => set("startDate", v)}
                    style={fBorder("startDate")}
                  />
                  {errors.startDate && (
                    <p
                      className="text-[11px]"
                      style={{ color: "#c23934" }}
                    >
                      {errors.startDate}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label
                    className={labelCls}
                    style={labelStyle}
                  >
                    End Date
                  </Label>
                  <DateInput
                    value={form.endDate}
                    onChange={(v) => set("endDate", v)}
                    style={fBorder("endDate")}
                  />
                  {errors.endDate && (
                    <p
                      className="text-[11px]"
                      style={{ color: "#c23934" }}
                    >
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Expiration Date */}
              <div className="space-y-1.5">
                <Label className={labelCls} style={labelStyle}>
                  Expiration Date {req}
                  <span
                    className="ml-2 text-[10px] font-normal normal-case"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Auto-filled 364 days after Start Date
                  </span>
                </Label>
                <DateInput
                  value={form.expirationDate}
                  onChange={(v) => set("expirationDate", v)}
                  style={fBorder("expirationDate")}
                />
                {errors.expirationDate && (
                  <p
                    className="text-[11px]"
                    style={{ color: "#c23934" }}
                  >
                    {errors.expirationDate}
                  </p>
                )}
              </div>

              {/* Renewable + Active */}
              <div className="flex items-center gap-6 rounded p-[0px]">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="ins-renewable"
                    checked={form.renewable}
                    onCheckedChange={(v) =>
                      set("renewable", !!v)
                    }
                    style={{ accentColor: "#145F33" }}
                  />
                  <Label
                    htmlFor="ins-renewable"
                    className="text-[13px] font-medium cursor-pointer"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Renewable
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="ins-active"
                    checked={form.active}
                    onCheckedChange={(v) =>
                      handleActiveChange(!!v)
                    }
                    style={{ accentColor: "#145F33" }}
                  />
                  <Label
                    htmlFor="ins-active"
                    className="text-[13px] font-medium cursor-pointer"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Active
                  </Label>
                </div>
              </div>
              {activeWarning && (
                <div
                  className="flex items-start gap-2 px-3 py-2.5 rounded"
                  style={{
                    backgroundColor: "#FEF3CD",
                    border: "1px solid #F0C040",
                  }}
                >
                  <AlertCircle
                    className="h-4 w-4 flex-shrink-0 mt-0.5"
                    style={{ color: "#7A5600" }}
                  />
                  <p
                    className="text-[12px]"
                    style={{ color: "#7A5600" }}
                  >
                    The current date falls within the policy
                    Start and End dates. Update the End Date
                    before deactivating this policy.
                  </p>
                </div>
              )}

              {/* Subscriber | Provider */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    className={labelCls}
                    style={labelStyle}
                  >
                    Subscriber {req}
                  </Label>
                  <Input
                    value={form.subscriber}
                    onChange={(e) =>
                      set("subscriber", e.target.value)
                    }
                    placeholder="Enter Subscriber Name"
                    className="h-9 text-[13px] rounded"
                    style={{
                      ...fBorder("subscriber"),
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  />
                  {errors.subscriber && (
                    <p
                      className="text-[11px]"
                      style={{ color: "#c23934" }}
                    >
                      {errors.subscriber}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label
                    className={labelCls}
                    style={labelStyle}
                  >
                    Provider {req}
                  </Label>
                  <Input
                    value={form.provider}
                    onChange={(e) =>
                      set("provider", e.target.value)
                    }
                    placeholder="Enter Provider Name"
                    className="h-9 text-[13px] rounded"
                    style={{
                      ...fBorder("provider"),
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  />
                  {errors.provider && (
                    <p
                      className="text-[11px]"
                      style={{ color: "#c23934" }}
                    >
                      {errors.provider}
                    </p>
                  )}
                </div>
              </div>

              {/* Public / Private */}
              <div className="space-y-1.5">
                <Label className={labelCls} style={labelStyle}>
                  Public / Private {req}
                </Label>
                <Select
                  value={form.publicPrivate}
                  onValueChange={(v) => set("publicPrivate", v)}
                >
                  <SelectTrigger
                    className="h-9 text-[13px] rounded"
                    style={{
                      ...fBorder("publicPrivate"),
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {PUBLIC_PRIVATE_OPTS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.publicPrivate && (
                  <p
                    className="text-[11px]"
                    style={{ color: "#c23934" }}
                  >
                    {errors.publicPrivate}
                  </p>
                )}
              </div>

              {/* Policy Number | Group Number */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    className={labelCls}
                    style={labelStyle}
                  >
                    Policy Number {req}
                  </Label>
                  <Input
                    value={form.policyNumber}
                    onChange={(e) =>
                      set("policyNumber", e.target.value)
                    }
                    className="h-9 text-[13px] rounded"
                    placeholder="Enter Policy Number"
                    style={{
                      ...fBorder("policyNumber"),
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  />
                  {errors.policyNumber && (
                    <p
                      className="text-[11px]"
                      style={{ color: "#c23934" }}
                    >
                      {errors.policyNumber}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label
                    className={labelCls}
                    style={labelStyle}
                  >
                    Group Number
                  </Label>
                  <Input
                    value={form.groupNumber}
                    onChange={(e) =>
                      set("groupNumber", e.target.value)
                    }
                    placeholder="Enter Group Number"
                    className="h-9 text-[13px] rounded"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label className={labelCls} style={labelStyle}>
                  Notes
                </Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Enter notes"
                  rows={3}
                  className="text-[13px] rounded resize-none"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter
          className="px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0"
          style={{
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          {isView ? (
            <Button
              onClick={onClose}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor:
                  "var(--slds-g-color-neutral-95)",
                color: "var(--slds-g-color-text-default)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                onClick={onClose}
                className="h-9 px-6 text-[13px] font-medium rounded-full"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-neutral-95)",
                  color: "var(--slds-g-color-text-default)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="h-9 px-6 text-[13px] font-medium rounded-full"
                style={{
                  backgroundColor: "#145F33",
                  color: "white",
                }}
              >
                Save
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}