import React, { useState, useMemo } from "react";
import {
  Search,
  RefreshCw,
  BookOpen,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronLeft,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const MODULE_CATEGORIES = [
  "Steps for Job Preparation Program",
  "Financial Literacy EverFi Curriculum Version",
  "EverFi Classic Import Scores",
] as const;

const MODULE_CODES = [
  "Career Cruising",
  "My Plan",
  "Professional Introduction",
  "References",
  "Resume",
  "Application",
  "Application Tracking",
  "Interview",
  "Work Ethic",
  "EverFi Classic",
  "EverFi New",
  "Savings",
  "Banking",
  "Payment, Interest Rates, and Credit Cards",
  "Credit Scores",
  "Financing Higher Education",
  "Renting vs. Owning",
  "Taxes and Insurance",
  "Consumer Fraud",
  "Investing",
  "EverFi Vault",
] as const;

const ALL_DEPARTMENTS = [
  "Information Technology",
  "Academy",
  "ASP",
  "Spiritual Development",
  "Career Resources",
  "Friends First Development",
  "Organizational Development",
  "Youth Programs",
  "Admissions",
  "Community Care",
  "Ridgeland",
] as const;

const ALL_OUTCOMES: Outcome[] = [
  {
    id: "out1",
    category: "Domain",
    name: "Education & Vocation",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Outcome {
  id: string;
  category: string;
  name: string;
}

export interface LearningModule {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  sponsors: string[];
  outcomes: Outcome[];
  active: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

let _idCounter = 4;
const nextId = () => `lm${++_idCounter}`;

const INITIAL_MODULES: LearningModule[] = [
  {
    id: "lm1",
    name: "Resume Writing & Job Applications",
    description:
      "Crafting effective resumes, cover letters, and tracking job applications.",
    category: "Steps for Job Preparation Program",
    code: "Resume",
    sponsors: ["Career Resources", "Youth Programs"],
    outcomes: [ALL_OUTCOMES[1]],
    active: true,
  },
  {
    id: "lm2",
    name: "Financial Budgeting Basics",
    description:
      "Introduction to household budgeting, savings goals, and responsible spending.",
    category: "Financial Literacy EverFi Curriculum Version",
    code: "Savings",
    sponsors: ["Academy"],
    outcomes: [ALL_OUTCOMES[0]],
    active: true,
  },
  {
    id: "lm3",
    name: "Interview Preparation",
    description:
      "Mock interview sessions, professional presence coaching, and follow-up etiquette.",
    category: "Steps for Job Preparation Program",
    code: "Interview",
    sponsors: ["Career Resources"],
    outcomes: [ALL_OUTCOMES[1]],
    active: true,
  },
  {
    id: "lm4",
    name: "EverFi Credit Score Module",
    description:
      "Understanding credit scores, reports, and responsible credit use.",
    category: "EverFi Classic Import Scores",
    code: "Credit Scores",
    sponsors: ["Academy", "Admissions"],
    outcomes: [],
    active: false,
  },
];

// ─── Shared helpers ────────────────────────────────────────────────────────────

const inputCls = (err?: boolean): React.CSSProperties => ({
  height: "36px",
  width: "100%",
  padding: "0 12px",
  borderRadius: "4px",
  border: `1px solid ${err ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
  color: "var(--slds-g-color-text-default)",
  backgroundColor: "var(--slds-g-color-background-base)",
  fontSize: "13px",
  outline: "none",
});

const textareaCls = (err?: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "8px 12px",
  borderRadius: "4px",
  border: `1px solid ${err ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
  color: "var(--slds-g-color-text-default)",
  backgroundColor: "var(--slds-g-color-background-base)",
  fontSize: "13px",
  outline: "none",
  resize: "vertical" as const,
  lineHeight: "1.5",
  minHeight: "80px",
});

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      className="slds-form-label block mb-1.5"
      style={{ color: "var(--slds-g-color-text-weak)" }}
    >
      {children}
      {required && <span style={{ color: "#c23934" }}> *</span>}
    </label>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full slds-text-3 font-medium whitespace-nowrap"
      style={{
        backgroundColor: active ? "#D0E9DA" : "#FCE4E4",
        color: active ? "#1B5E20" : "#C62828",
        border: `1px solid ${active ? "#A3D4B5" : "#F5A5A5"}`,
      }}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ─── Outcomes Picker Modal ─────────────────────────────────────────────────────

function OutcomesPickerModal({
  open,
  onClose,
  selectedIds,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  onApply: (ids: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [localSelected, setLocalSelected] = useState<string[]>(
    [],
  );

  React.useEffect(() => {
    if (open) {
      setLocalSelected([...selectedIds]);
      setQ("");
      setFilterCat("all");
    }
  }, [open, selectedIds]);

  const filtered = useMemo(
    () =>
      ALL_OUTCOMES.filter((o) => {
        const ms =
          !q ||
          o.name.toLowerCase().includes(q.toLowerCase()) ||
          o.category.toLowerCase().includes(q.toLowerCase());
        const mc =
          filterCat === "all" || o.category === filterCat;
        return ms && mc;
      }),
    [q, filterCat],
  );

  const toggle = (id: string) =>
    setLocalSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id],
    );

  const outcomeCats = Array.from(
    new Set(ALL_OUTCOMES.map((o) => o.category)),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-xl max-h-[calc(100vh-32px)] flex flex-col gap-0 p-0 rounded-lg shadow-lg"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #dddbda",
        }}
      >
        <DialogHeader
          className="px-6 py-4"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <DialogTitle
            className="slds-text-6 font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Select Outcomes
          </DialogTitle>
          <DialogDescription
            className="slds-text-3 mt-0.5"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Choose one or more outcomes to associate with this
            module.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-6 space-y-6">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search outcomes…"
                style={{ ...inputCls(), paddingLeft: "32px" }}
              />
            </div>
            <Select
              value={filterCat}
              onValueChange={setFilterCat}
            >
              <SelectTrigger
                className="h-9 w-[140px] rounded slds-text-4"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Categories
                </SelectItem>
                {outcomeCats.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto">
            <Table
              className=""
              style={{ tableLayout: "fixed", width: "100%" }}
            >
              <TableHeader
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <TableRow
                  className="hover:bg-transparent"
                  style={{
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <TableHead
                    className="w-10 pl-4 h-9"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  />
                  <TableHead
                    className=" pr-4 h-10"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      width: "210px",
                    }}
                  >
                    CATEGORY
                  </TableHead>
                  <TableHead
                    className=" pr-4 h-10"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      width: "210px",
                    }}
                  >
                    OUTCOME NAME
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-10 text-center slds-text-4"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      No outcomes found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((o, idx) => {
                    const selected = localSelected.includes(
                      o.id,
                    );
                    return (
                      <TableRow
                        key={o.id}
                        className="cursor-pointer h-[40px]"
                        style={{
                          borderBottom:
                            idx < filtered.length - 1
                              ? "1px solid var(--slds-g-color-border-base-1)"
                              : "none",
                          backgroundColor: selected
                            ? "#f0faf4"
                            : "transparent",
                        }}
                        onClick={() => toggle(o.id)}
                        onMouseEnter={(e) => {
                          if (!selected)
                            e.currentTarget.style.backgroundColor =
                              "var(--slds-g-color-background-alt-2)";
                        }}
                        onMouseLeave={(e) => {
                          if (!selected)
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                        }}
                      >
                        <TableCell className="pl-4 py-2">
                          <div
                            className="h-4 w-4 rounded flex items-center justify-center"
                            style={{
                              border: `1.5px solid ${selected ? "#145F33" : "var(--slds-g-color-border-base-1)"}`,
                              backgroundColor: selected
                                ? "#145F33"
                                : "transparent",
                            }}
                          >
                            {selected && (
                              <Check className="h-2.5 w-2.5 text-white" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell
                          className="px-2 py-2 slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {o.category}
                        </TableCell>
                        <TableCell
                          className="px-2 py-2 slds-text-4 font-medium"
                          style={{
                            color: selected
                              ? "#145F33"
                              : "var(--slds-g-color-text-default)",
                          }}
                        >
                          {o.name}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <DialogFooter
          className="px-6 py-3 flex items-center justify-between"
          style={{
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <span
            className="hidden slds-text-3"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            {localSelected.length} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-full slds-text-4 font-medium"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
              }}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-9 px-4 rounded-full slds-text-4 font-medium text-white"
              style={{ backgroundColor: "#145F33" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#0e4524")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#145F33")
              }
              onClick={() => {
                onApply(localSelected);
                onClose();
              }}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sponsors Picker Modal ─────────────────────────────────────────────────────

function SponsorsPickerModal({
  open,
  onClose,
  selected,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  selected: string[];
  onApply: (depts: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const [localSelected, setLocalSelected] = useState<string[]>(
    [],
  );

  React.useEffect(() => {
    if (open) {
      setLocalSelected([...selected]);
      setQ("");
    }
  }, [open, selected]);

  const filtered = useMemo(
    () =>
      ALL_DEPARTMENTS.filter(
        (d) => !q || d.toLowerCase().includes(q.toLowerCase()),
      ),
    [q],
  );

  const toggle = (d: string) =>
    setLocalSelected((prev) =>
      prev.includes(d)
        ? prev.filter((x) => x !== d)
        : [...prev, d],
    );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-xl max-h-[calc(100vh-32px)] flex flex-col gap-0 p-0 rounded-lg shadow-lg"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #dddbda",
        }}
      >
        <DialogHeader
          className="px-6 py-4"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <DialogTitle
            className="slds-text-6 font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Select Sponsors
          </DialogTitle>
          <DialogDescription
            className="slds-text-3 mt-0.5"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Choose the departments sponsoring this module.
          </DialogDescription>
        </DialogHeader>
        <div
          className="px-5 pt-3 pb-2"
          style={{
            backgroundColor: "#ffffff",
          }}
        >
          <div className="px-5 pt-3 pb-2">
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search departments…"
                style={{ ...inputCls(), paddingLeft: "32px" }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-1 pt-1">
            {filtered.length === 0 ? (
              <p
                className="py-6 text-center slds-text-4"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                No departments found.
              </p>
            ) : (
              filtered.map((d) => {
                const sel = localSelected.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggle(d)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors text-left"
                    style={{
                      backgroundColor: sel
                        ? "#f0faf4"
                        : "transparent",
                      border: `1px solid ${sel ? "#a3d4b5" : "var(--slds-g-color-border-base-1)"}`,
                    }}
                    onMouseEnter={(e) => {
                      if (!sel)
                        (
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor =
                          "var(--slds-g-color-background-alt-2)";
                    }}
                    onMouseLeave={(e) => {
                      if (!sel)
                        (
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor = "transparent";
                    }}
                  >
                    <div
                      className="h-4 w-4 rounded flex items-center justify-center flex-shrink-0"
                      style={{
                        border: `1.5px solid ${sel ? "#145F33" : "var(--slds-g-color-border-base-1)"}`,
                        backgroundColor: sel
                          ? "#145F33"
                          : "transparent",
                      }}
                    >
                      {sel && (
                        <Check className="h-2.5 w-2.5 text-white" />
                      )}
                    </div>
                    <span
                      className="slds-text-4 font-medium"
                      style={{
                        color: sel
                          ? "#145F33"
                          : "var(--slds-g-color-text-default)",
                      }}
                    >
                      {d}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
        <DialogFooter
          className="px-6 py-3 flex items-center justify-between"
          style={{
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <span
            className="hidden slds-text-3"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            {localSelected.length} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-full slds-text-4 font-medium"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
              }}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-9 px-4 rounded-full slds-text-4 font-medium text-white"
              style={{ backgroundColor: "#145F33" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#0e4524")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#145F33")
              }
              onClick={() => {
                onApply(localSelected);
                onClose();
              }}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteConfirmModal({
  open,
  onClose,
  moduleName,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  moduleName: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        className="max-w-sm p-0"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          border: "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <DialogHeader
          className="px-6 pt-6 pb-4"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <DialogTitle
            className="slds-text-6 font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Delete Learning Module?
          </DialogTitle>
          <DialogDescription
            className="slds-text-4 mt-1"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Are you sure you want to delete{" "}
            <strong
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {moduleName}
            </strong>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter
          className="px-6 py-4 flex justify-end gap-2"
          style={{
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <Button
            variant="outline"
            className="h-9 px-4 rounded-full slds-text-4 font-medium"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              color: "var(--slds-g-color-text-default)",
            }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="h-9 px-4 rounded-full slds-text-4 font-medium text-white"
            style={{ backgroundColor: "#c23934" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#a81e1a")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#c23934")
            }
            onClick={onConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Module Form Modal (New / Edit) ───────────────────────────────────────────

export function ModuleModal({
  open,
  onClose,
  editing,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  editing: LearningModule | null;
  onSave: (m: LearningModule) => void;
}) {
  const empty = (): Partial<LearningModule> => ({
    name: "",
    description: "",
    category: undefined,
    code: undefined,
    sponsors: [],
    outcomes: [],
    active: true,
  });

  const [form, setForm] =
    useState<Partial<LearningModule>>(empty());
  const [errors, setErrors] = useState<Record<string, boolean>>(
    {},
  );
  const [outcomesOpen, setOutcomesOpen] = useState(false);
  const [sponsorsOpen, setSponsorsOpen] = useState(false);

  React.useEffect(() => {
    if (open) {
      setForm(
        editing
          ? {
              ...editing,
              sponsors: [...(editing.sponsors ?? [])],
              outcomes: [...(editing.outcomes ?? [])],
            }
          : empty(),
      );
      setErrors({});
    }
  }, [open, editing]);

  const set = (k: keyof LearningModule, v: unknown) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: false }));
  };

  const handleSave = () => {
    const errs: Record<string, boolean> = {};
    if (!form.name?.trim()) errs.name = true;
    if (!form.description?.trim()) errs.description = true;
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSave({
      id: editing?.id ?? nextId(),
      name: form.name!,
      description: form.description!,
      category: form.category ?? "",
      code: form.code ?? "",
      sponsors: form.sponsors ?? [],
      outcomes: form.outcomes ?? [],
      active: form.active ?? true,
    });
    onClose();
  };

  const selectedOutcomeIds = (form.outcomes ?? []).filter(Boolean).map(
    (o) => o!.id,
  );

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) onClose();
        }}
      >
        <DialogContent
          className="sm:max-w-xl max-h-[calc(100vh-32px)] flex flex-col gap-0 p-0 rounded-lg shadow-lg"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dddbda",
          }}
        >
          <DialogHeader
            className="px-6 py-4"
            style={{
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 flex items-center justify-center text-white flex-shrink-0"
                style={{
                  borderRadius: "6px",
                  backgroundColor: "#145F33",
                }}
              >
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle
                  className="slds-text-6 font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {editing
                    ? "Edit Learning Module"
                    : "New Learning Module"}
                </DialogTitle>
                <DialogDescription
                  className="slds-text-3 mt-0.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  {editing
                    ? `Editing: ${editing.name}`
                    : "Complete the fields below to create a new module."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {/* General Information */}
            <div className="space-y-4">
              <div>
                <FieldLabel required>Name</FieldLabel>
                <input
                  value={form.name ?? ""}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Enter module name…"
                  style={inputCls(errors.name)}
                />
                {errors.name && (
                  <p
                    className="slds-text-3 mt-1"
                    style={{ color: "#c23934" }}
                  >
                    Name is required.
                  </p>
                )}
              </div>

              <div>
                <FieldLabel required>Description</FieldLabel>
                <textarea
                  value={form.description ?? ""}
                  onChange={(e) =>
                    set("description", e.target.value)
                  }
                  placeholder="Brief description of the module content…"
                  rows={3}
                  style={textareaCls(errors.description)}
                />
                {errors.description && (
                  <p
                    className="slds-text-3 mt-1"
                    style={{ color: "#c23934" }}
                  >
                    Description is required.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Category</FieldLabel>
                  <Select
                    value={form.category ?? ""}
                    onValueChange={(v) => set("category", v)}
                  >
                    <SelectTrigger
                      className="h-9 slds-text-4"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                      }}
                    >
                      <SelectValue placeholder="Select category…" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODULE_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <FieldLabel>Code</FieldLabel>
                  <Select
                    value={form.code ?? ""}
                    onValueChange={(v) => set("code", v)}
                  >
                    <SelectTrigger
                      className="h-9 slds-text-4"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                      }}
                    >
                      <div className="min-w-0 flex-1 truncate text-left">
                        <SelectValue placeholder="Select code" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {MODULE_CODES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Status</FieldLabel>
                  <Select
                    value={form.active ? "active" : "inactive"}
                    onValueChange={(v) =>
                      set("active", v === "active")
                    }
                  >
                    <SelectTrigger
                      className="h-9 slds-text-4"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        Active
                      </SelectItem>
                      <SelectItem value="inactive">
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div></div>
            </div>
            {/* Associated Outcomes */}
            <div
              className="rounded overflow-hidden"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                  borderBottom:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <span
                  className="slds-text-4 font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Associated Outcomes
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 rounded-full slds-text-3 font-medium"
                  style={{
                    border:
                      "1px solid var(--color-brand-primary)",
                    color: "var(--color-brand-primary)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(20,95,51,0.06)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "transparent")
                  }
                  onClick={() => setOutcomesOpen(true)}
                >
                  <Plus className="h-3 w-3 mr-1" /> Select
                  Outcomes
                </Button>
              </div>
              {(form.outcomes ?? []).length === 0 ? (
                <div className="py-6 text-center">
                  <p
                    className="slds-text-3"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    No outcomes selected.
                  </p>
                </div>
              ) : (
                <Table
                  style={{
                    tableLayout: "fixed",
                    width: "100%",
                  }}
                >
                  <TableHeader
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <TableRow
                      className="hover:bg-transparent"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <TableHead
                        className="font-semibold pl-4 h-8 slds-text-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          width: "35%",
                        }}
                      >
                        Category
                      </TableHead>
                      <TableHead
                        className="font-semibold px-2 h-8 slds-text-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Outcome Name
                      </TableHead>
                      <TableHead className="w-10 h-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(form.outcomes ?? []).filter(Boolean).map((o, idx) => (
                      <TableRow
                        key={o.id}
                        className="h-[38px]"
                        style={{
                          borderBottom:
                            idx <
                            (form.outcomes ?? []).filter(Boolean).length - 1
                              ? "1px solid var(--slds-g-color-border-base-1)"
                              : "none",
                        }}
                      >
                        <TableCell
                          className="pl-4 py-1.5 slds-text-3"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {o.category}
                        </TableCell>
                        <TableCell
                          className="px-2 py-1.5 slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {o.name}
                        </TableCell>
                        <TableCell className="w-16 px-2 py-1.5">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() =>
                                set(
                                  "outcomes",
                                  (form.outcomes ?? []).filter(
                                    (x) => x.id !== o.id,
                                  ),
                                )
                              }
                              className="p-2 rounded transition-colors"
                              style={{
                                color: "#c23934",
                                backgroundColor: "transparent",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#fef2f2")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Sponsoring Departments */}
            <div
              className="rounded overflow-hidden"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                  borderBottom:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <span
                  className="slds-text-4 font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Sponsoring Departments
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 rounded-full slds-text-3 font-medium"
                  style={{
                    border:
                      "1px solid var(--color-brand-primary)",
                    color: "var(--color-brand-primary)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(20,95,51,0.06)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "transparent")
                  }
                  onClick={() => setSponsorsOpen(true)}
                >
                  <Plus className="h-3 w-3 mr-1" /> Select
                  Sponsors
                </Button>
              </div>
              {(form.sponsors ?? []).length === 0 ? (
                <div className="py-6 text-center">
                  <p
                    className="slds-text-3"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    No sponsoring departments selected.
                  </p>
                </div>
              ) : (
                <Table
                  style={{
                    tableLayout: "fixed",
                    width: "100%",
                  }}
                >
                  <TableHeader
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <TableRow
                      className="hover:bg-transparent"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <TableHead
                        className="font-semibold pl-4 h-8 slds-text-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Department
                      </TableHead>
                      <TableHead className="w-10 h-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(form.sponsors ?? []).map((dept, idx) => (
                      <TableRow
                        key={dept}
                        className="h-[38px]"
                        style={{
                          borderBottom:
                            idx <
                            (form.sponsors ?? []).length - 1
                              ? "1px solid var(--slds-g-color-border-base-1)"
                              : "none",
                        }}
                      >
                        <TableCell
                          className="pl-4 py-1.5 slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {dept}
                        </TableCell>
                        <TableCell className="w-16 px-2 py-1.5">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() =>
                                set(
                                  "sponsors",
                                  (form.sponsors ?? []).filter(
                                    (x) => x !== dept,
                                  ),
                                )
                              }
                              className="p-2 rounded transition-colors"
                              style={{
                                color: "#c23934",
                                backgroundColor: "transparent",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#fef2f2")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          <DialogFooter
            className="px-6 py-3 flex items-center justify-between"
            style={{
              borderTop:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <Button
              variant="outline"
              className="h-9 px-4 rounded-full slds-text-4"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
                fontWeight: 500,
              }}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="h-9 px-5 rounded-full slds-text-4 font-medium text-white"
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
              {editing ? "Save" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OutcomesPickerModal
        open={outcomesOpen}
        onClose={() => setOutcomesOpen(false)}
        selectedIds={selectedOutcomeIds}
        onApply={(ids) => {
          const chosen = ALL_OUTCOMES.filter((o) =>
            ids.includes(o.id),
          );
          set("outcomes", chosen);
        }}
      />

      <SponsorsPickerModal
        open={sponsorsOpen}
        onClose={() => setSponsorsOpen(false)}
        selected={form.sponsors ?? []}
        onApply={(depts) => set("sponsors", depts)}
      />
    </>
  );
}

// ─── View Module Modal ─────────────────────────────────────────────────────────

function ViewModuleModal({
  open,
  onClose,
  module: m,
}: {
  open: boolean;
  onClose: () => void;
  module: LearningModule | null;
}) {
  if (!m) return null;
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        className="max-w-xl max-h-[90vh] flex flex-col p-0"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          border: "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <DialogHeader
          className="px-6 pt-6 pb-4 flex-shrink-0"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 flex items-center justify-center text-white flex-shrink-0"
              style={{
                borderRadius: "6px",
                backgroundColor: "#145F33",
              }}
            >
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle
                className="slds-text-6 font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {m.name}
              </DialogTitle>
              <DialogDescription
                className="slds-text-3 mt-0.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {m.id}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {[
              { label: "Category", value: m.category || "—" },
              { label: "Code", value: m.code || "—" },
              {
                label: "Status",
                value: <StatusBadge active={m.active} />,
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <p
                  className="slds-form-label mb-1"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  {label}
                </p>
                <p
                  className="slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div>
            <p
              className="slds-form-label mb-1"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Description
            </p>
            <p
              className="slds-text-4"
              style={{
                color: "var(--slds-g-color-text-default)",
                lineHeight: "1.6",
              }}
            >
              {m.description || "—"}
            </p>
          </div>

          {/* Outcomes */}
          <div
            className="rounded overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <div
              className="px-4 py-2.5"
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <span
                className="slds-text-4 font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Associated Outcomes
              </span>
            </div>
            {m.outcomes.length === 0 ? (
              <p
                className="px-4 py-4 slds-text-3"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                No outcomes associated.
              </p>
            ) : (
              <Table
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <TableHeader
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <TableRow
                    className="hover:bg-transparent"
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <TableHead
                      className="font-semibold pl-4 h-8 slds-text-3"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        width: "35%",
                      }}
                    >
                      Category
                    </TableHead>
                    <TableHead
                      className="font-semibold px-2 h-8 slds-text-3"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      Outcome Name
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {m.outcomes.map((o, idx) => (
                    <TableRow
                      key={o.id}
                      className="h-[38px]"
                      style={{
                        borderBottom:
                          idx < m.outcomes.length - 1
                            ? "1px solid var(--slds-g-color-border-base-1)"
                            : "none",
                      }}
                    >
                      <TableCell
                        className="pl-4 py-1.5 slds-text-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {o.category}
                      </TableCell>
                      <TableCell
                        className="px-2 py-1.5 slds-text-4"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {o.name}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Sponsors */}
          <div
            className="rounded overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <div
              className="px-4 py-2.5"
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <span
                className="slds-text-4 font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Sponsoring Departments
              </span>
            </div>
            {m.sponsors.length === 0 ? (
              <p
                className="px-4 py-4 slds-text-3"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                No sponsors assigned.
              </p>
            ) : (
              <Table
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <TableHeader
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <TableRow
                    className="hover:bg-transparent"
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <TableHead
                      className="font-semibold pl-4 h-8 slds-text-3"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      Department
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {m.sponsors.map((dept, idx) => (
                    <TableRow
                      key={dept}
                      className="h-[38px]"
                      style={{
                        borderBottom:
                          idx < m.sponsors.length - 1
                            ? "1px solid var(--slds-g-color-border-base-1)"
                            : "none",
                      }}
                    >
                      <TableCell
                        className="pl-4 py-1.5 slds-text-4"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {dept}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <DialogFooter
          className="px-6 py-4 flex-shrink-0"
          style={{
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <Button
            variant="outline"
            className="h-9 px-4 rounded-full slds-text-4 font-medium"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              color: "var(--slds-g-color-text-default)",
            }}
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function LearningModules({
  onBack,
}: { onBack?: () => void } = {}) {
  const [modules, setModules] =
    useState<LearningModule[]>(INITIAL_MODULES);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterCode, setFilterCode] = useState("all");
  const [filterSponsor, setFilterSponsor] = useState("all");
  const [filterActive, setFilterActive] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<LearningModule | null>(
    null,
  );
  const [viewing, setViewing] = useState<LearningModule | null>(
    null,
  );
  const [deleting, setDeleting] =
    useState<LearningModule | null>(null);

  const filtered = useMemo(
    () =>
      modules.filter((m) => {
        const q = search.toLowerCase();
        const ms =
          !search ||
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q);
        const mc =
          filterCat === "all" || m.category === filterCat;
        const mk =
          filterCode === "all" || m.code === filterCode;
        const msp =
          filterSponsor === "all" ||
          m.sponsors.includes(filterSponsor);
        const ma =
          filterActive === "all" ||
          (filterActive === "active" ? m.active : !m.active);
        return ms && mc && mk && msp && ma;
      }),
    [
      modules,
      search,
      filterCat,
      filterCode,
      filterSponsor,
      filterActive,
    ],
  );

  const hasFilters =
    search ||
    filterCat !== "all" ||
    filterCode !== "all" ||
    filterSponsor !== "all" ||
    filterActive !== "all";
  const clearFilters = () => {
    setSearch("");
    setFilterCat("all");
    setFilterCode("all");
    setFilterSponsor("all");
    setFilterActive("all");
  };

  const [sortCol, setSortCol] = useState<
    | "name"
    | "description"
    | "category"
    | "code"
    | "sponsors"
    | "active"
    | null
  >(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (
    col:
      | "name"
      | "description"
      | "category"
      | "code"
      | "sponsors"
      | "active",
  ) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const sortedFiltered = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      let aVal: string;
      let bVal: string;
      if (sortCol === "active") {
        aVal = a.active ? "Active" : "Inactive";
        bVal = b.active ? "Active" : "Inactive";
      } else if (sortCol === "sponsors") {
        aVal = a.sponsors[0] ?? "";
        bVal = b.sponsors[0] ?? "";
      } else {
        aVal = (a[sortCol] as string) ?? "";
        bVal = (b[sortCol] as string) ?? "";
      }
      const cmp = aVal.localeCompare(bVal);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const openNew = () => {
    setEditing(null);
    setIsModalOpen(true);
  };
  const openEdit = (m: LearningModule) => {
    setEditing(m);
    setIsModalOpen(true);
  };
  const openView = (m: LearningModule) => setViewing(m);

  const saveModule = (m: LearningModule) => {
    setModules((prev) =>
      prev.find((x) => x.id === m.id)
        ? prev.map((x) => (x.id === m.id ? m : x))
        : [m, ...prev],
    );
    toast.success(
      editing
        ? "Module updated successfully."
        : "Module created successfully.",
    );
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setModules((prev) =>
      prev.filter((m) => m.id !== deleting.id),
    );
    toast.success("Module deleted.");
    setDeleting(null);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: "var(--slds-g-color-background-alt-2)",
      }}
    >
      {/* Page header */}
      <div
        className="app-page-x py-4 flex items-center justify-between flex-shrink-0"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="h-8 w-8 flex items-center justify-center rounded-full transition-colors"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
                backgroundColor: "white",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--slds-g-color-background-alt-2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "white")
              }
              title="Back to Classes"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <div
            className="h-10 w-10 flex items-center justify-center text-white flex-shrink-0"
            style={{
              borderRadius: "8px",
              backgroundColor: "#145F33",
            }}
          >
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div
              className="text-xs font-medium uppercase tracking-wide flex items-center gap-1.5"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              <span
                className={
                  onBack
                    ? "cursor-pointer hover:underline"
                    : undefined
                }
                onClick={onBack}
              >
                Classes
              </span>
              {onBack && <span>›</span>}
            </div>
            <h1
              className="text-2xl font-medium tracking-tight"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Learning Modules
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            style={{
              backgroundColor: "white",
              borderRadius: "50%",
            }}
            onClick={() => window.location.reload()}
          >
            <RefreshCw
              className="h-4 w-4"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            />
          </Button>
          <Button
            size="sm"
            className="h-8 px-4 rounded-full slds-text-4 font-medium text-white flex items-center gap-1.5"
            style={{ backgroundColor: "#145F33" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#0e4524")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#145F33")
            }
            onClick={openNew}
          >
            <Plus className="h-3.5 w-3.5" /> New Module
          </Button>
        </div>
      </div>

      {/* Table section */}
      <div className="flex-1 min-h-0 overflow-y-auto app-page-x pt-4 pb-8">
        <Card
          className="shadow-sm overflow-hidden"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: "var(--slds-c-card-radius-border)",
          }}
        >
          <CardHeader
            className="pb-0 px-4 pt-3 -mb-6"
            style={{
              backgroundColor: "#ffffff",
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap pb-1">
              {/* Left — title + search + clear */}
              <div className="flex items-center gap-3">
                <span
                  className="text-[13px] font-semibold whitespace-nowrap"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  All Modules ({filtered.length})
                </span>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="h-9 w-72 text-[13px] pl-9 pr-8"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                    aria-label="Search modules"
                  />
                  {search && (
                    <button
                      className="absolute right-2.5 top-1/2 -translate-y-1/2"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                    >
                      <X
                        className="h-3 w-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      />
                    </button>
                  )}
                </div>
                {hasFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="h-[28px] px-3 rounded-full text-[12px] flex items-center gap-1.5"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    <X className="h-3 w-3" /> Clear Filters
                  </Button>
                )}
              </div>

              {/* Right — filter dropdowns */}
              <div className="flex items-center gap-2 flex-wrap">
                <Select
                  value={filterCat}
                  onValueChange={setFilterCat}
                >
                  <SelectTrigger
                    className="
                      relative
                      h-9
                      w-[200px]
                      overflow-hidden
                      text-[13px]
                      pl-3
                      pr-9
                      [&>span]:block
                      [&>span]:min-w-0
                      [&>span]:max-w-full
                      [&>span]:truncate
                      [&>svg]:absolute
                      [&>svg]:right-3
                      [&>svg]:left-auto
                    "
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <SelectValue
                      placeholder="Category"
                      className="text-left"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Categories
                    </SelectItem>
                    {MODULE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterCode}
                  onValueChange={setFilterCode}
                >
                  <SelectTrigger
                    className="
                      relative
                      h-9
                      w-[200px]
                      overflow-hidden
                      text-[13px]
                      pl-3
                      pr-9
                      [&>span]:block
                      [&>span]:min-w-0
                      [&>span]:max-w-full
                      [&>span]:truncate
                      [&>svg]:absolute
                      [&>svg]:right-3
                      [&>svg]:left-auto
                    "
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <SelectValue
                      placeholder="Code"
                      className="text-left"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Codes
                    </SelectItem>
                    {MODULE_CODES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterSponsor}
                  onValueChange={setFilterSponsor}
                >
                  <SelectTrigger
                    className="
                      relative
                      h-9
                      w-[200px]
                      overflow-hidden
                      text-[13px]
                      pl-3
                      pr-9
                      [&>span]:block
                      [&>span]:min-w-0
                      [&>span]:max-w-full
                      [&>span]:truncate
                      [&>svg]:absolute
                      [&>svg]:right-3
                      [&>svg]:left-auto
                    "
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <SelectValue
                      placeholder="Sponsor"
                      className="text-left"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Sponsors
                    </SelectItem>
                    {ALL_DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterActive}
                  onValueChange={setFilterActive}
                >
                  <SelectTrigger
                    className="
                      relative
                      h-9
                      w-[120px]
                      overflow-hidden
                      text-[13px]
                      pl-3
                      pr-9
                      [&>span]:block
                      [&>span]:min-w-0
                      [&>span]:max-w-full
                      [&>span]:truncate
                      [&>svg]:absolute
                      [&>svg]:right-3
                      [&>svg]:left-auto
                    "
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <SelectValue
                      placeholder="Status"
                      className="text-left"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Status
                    </SelectItem>
                    <SelectItem value="active">
                      Active
                    </SelectItem>
                    <SelectItem value="inactive">
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table
              style={{ tableLayout: "fixed", width: "100%" }}
            >
              <TableHeader
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <TableRow
                  className="hover:bg-transparent h-10"
                  style={{
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <TableHead
                    className="pl-4 h-10"
                    onClick={() => handleSort("name")}
                    style={{
                      color:
                        sortCol === "name"
                          ? "#145F33"
                          : "var(--slds-g-color-text-weak)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      width: "22%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      MODULE NAME
                      <ChevronDown
                        className="h-3 w-3"
                        style={
                          sortCol === "name"
                            ? {
                                transform:
                                  sortDir === "asc"
                                    ? "rotate(180deg)"
                                    : undefined,
                              }
                            : { opacity: 0.3 }
                        }
                      />
                    </span>
                  </TableHead>
                  <TableHead
                    className="pl-4 h-10"
                    onClick={() => handleSort("description")}
                    style={{
                      color:
                        sortCol === "description"
                          ? "#145F33"
                          : "var(--slds-g-color-text-weak)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      width: "22%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      DESCRIPTION
                      <ChevronDown
                        className="h-3 w-3"
                        style={
                          sortCol === "description"
                            ? {
                                transform:
                                  sortDir === "asc"
                                    ? "rotate(180deg)"
                                    : undefined,
                              }
                            : { opacity: 0.3 }
                        }
                      />
                    </span>
                  </TableHead>
                  <TableHead
                    className="pl-4 h-10"
                    onClick={() => handleSort("category")}
                    style={{
                      color:
                        sortCol === "category"
                          ? "#145F33"
                          : "var(--slds-g-color-text-weak)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      width: "22%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      CATEGORY
                      <ChevronDown
                        className="h-3 w-3"
                        style={
                          sortCol === "category"
                            ? {
                                transform:
                                  sortDir === "asc"
                                    ? "rotate(180deg)"
                                    : undefined,
                              }
                            : { opacity: 0.3 }
                        }
                      />
                    </span>
                  </TableHead>
                  <TableHead
                    className="pl-4 h-10"
                    onClick={() => handleSort("code")}
                    style={{
                      color:
                        sortCol === "code"
                          ? "#145F33"
                          : "var(--slds-g-color-text-weak)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      width: "22%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      CODE
                      <ChevronDown
                        className="h-3 w-3"
                        style={
                          sortCol === "code"
                            ? {
                                transform:
                                  sortDir === "asc"
                                    ? "rotate(180deg)"
                                    : undefined,
                              }
                            : { opacity: 0.3 }
                        }
                      />
                    </span>
                  </TableHead>
                  <TableHead
                    className="pl-4 h-10"
                    onClick={() => handleSort("sponsors")}
                    style={{
                      color:
                        sortCol === "sponsors"
                          ? "#145F33"
                          : "var(--slds-g-color-text-weak)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      width: "22%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      SPONSOR
                      <ChevronDown
                        className="h-3 w-3"
                        style={
                          sortCol === "sponsors"
                            ? {
                                transform:
                                  sortDir === "asc"
                                    ? "rotate(180deg)"
                                    : undefined,
                              }
                            : { opacity: 0.3 }
                        }
                      />
                    </span>
                  </TableHead>
                  <TableHead
                    className="pl-4 h-10"
                    onClick={() => handleSort("active")}
                    style={{
                      color:
                        sortCol === "active"
                          ? "#145F33"
                          : "var(--slds-g-color-text-weak)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      width: "22%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      STATUS
                      <ChevronDown
                        className="h-3 w-3"
                        style={
                          sortCol === "active"
                            ? {
                                transform:
                                  sortDir === "asc"
                                    ? "rotate(180deg)"
                                    : undefined,
                              }
                            : { opacity: 0.3 }
                        }
                      />
                    </span>
                  </TableHead>
                  <TableHead
                    className="pl-4 h-10 text-right"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      width: "22%",
                    }}
                  >
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-16 text-center"
                    >
                      <Search
                        className="h-8 w-8 mx-auto mb-2"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      />
                      <p
                        className="text-sm font-medium"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        No modules found
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Adjust your search or filters
                      </p>
                      {hasFilters && (
                        <button
                          className="mt-2 text-xs underline"
                          style={{ color: "#145F33" }}
                          onClick={clearFilters}
                        >
                          Clear filters
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedFiltered.map((m, idx) => (
                    <TableRow
                      key={m.id}
                      className="transition-colors h-[44px]"
                      style={{
                        borderBottom:
                          idx < sortedFiltered.length - 1
                            ? "1px solid var(--slds-g-color-border-base-1)"
                            : "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--slds-g-color-background-row-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "transparent")
                      }
                    >
                      <TableCell className="pl-4 py-2">
                        <p
                          className="text-sm font-bold truncate"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                          title={m.name}
                        >
                          {m.name}
                        </p>
                        <p
                          className="hidden text-xs truncate"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {m.id}
                        </p>
                      </TableCell>
                      <TableCell className="px-2 py-2">
                        <p
                          className="text-sm truncate"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                          title={m.description}
                        >
                          {m.description || "—"}
                        </p>
                      </TableCell>
                      <TableCell className="px-2 py-2">
                        <span
                          className="text-xs block truncate"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                          title={m.category}
                        >
                          {m.category || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="px-2 py-2">
                        <span
                          className="text-xs block truncate"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                          title={m.code}
                        >
                          {m.code || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="px-2 py-2">
                        {m.sponsors.length === 0 ? (
                          <span
                            className="text-xs"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            —
                          </span>
                        ) : (
                          <span
                            className="text-xs block truncate"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                            title={m.sponsors.join(", ")}
                          >
                            {m.sponsors[0]}
                            {m.sponsors.length > 1 && (
                              <span
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              ></span>
                            )}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-2 py-2">
                        <StatusBadge active={m.active} />
                      </TableCell>
                      <TableCell className="pr-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                          <button
                            title="View"
                            onClick={() => openView(m)}
                            className="cursor-pointer p-2 rounded transition-colors flex items-center justify-center flex-shrink-0"
                            style={{
                              color: "#145F33",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#e6f2eb")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            title="Edit"
                            onClick={() => openEdit(m)}
                            className="cursor-pointer p-2 rounded transition-colors flex items-center justify-center flex-shrink-0"
                            style={{
                              color: "#145F33",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#e6f2eb")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => setDeleting(m)}
                            className="cursor-pointer p-1.5 rounded transition-colors flex-shrink-0"
                            style={{
                              color: "#c23934",
                              backgroundColor: "transparent",
                              border: "none",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.color = "#c23934";
                              (
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor =
                                "rgba(194, 57, 52, 0.08)";
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.color = "#c23934";
                              (
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor =
                                "transparent";
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ModuleModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editing={editing}
        onSave={saveModule}
      />
      <ViewModuleModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        module={viewing}
      />
      <DeleteConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        moduleName={deleting?.name ?? ""}
        onConfirm={confirmDelete}
      />
    </div>
  );
}