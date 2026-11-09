import { useState, useMemo } from "react";
import {
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  X,
  AlertCircle,
  Download,
  RefreshCw,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Card, CardFooter, CardHeader } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { TablePaginationBar } from "../ui/table-toolbar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const PACKAGING_OPTIONS = [
  "Pill/Tablet",
  "Pill Card",
  "MultiPack",
  "Pill Bottle",
  "Box",
  "Liquid Bottle",
  "Injectable",
  "Inhaler",
  "Inhalation Powder",
  "Nebulizer",
  "Tube",
  "Spray",
  "Drop",
  "Powder",
  "Cough Drop",
  "Envelope",
  "Patch",
  "Implant",
  "Internal Insert",
  "Bag",
];

const OTC_REFERENCE_OPTIONS = [
  "Acetaminophen (Tylenol)",
  "Diphenhydramine (Benadryl)",
  "Ibuprofen (Advil, Motrin)",
  "Guaifenesin Oral Solution (Cough Medicine - Non-DM only)",
  "Oral Anesthetic Cough Drops (Halls)",
  "Bismuth Subsalicylate (Pepto Bismol)",
  "Calcium Carbonate Antacid (Tums)",
  "Antibiotic Ointment (Neosporin)",
  "Hydrocortisone 1%",
  "Magnesium Sulfate USP (Epsom Salt)",
  "Naproxen/Naproxen Sodium (Aleve)",
];

const FEATURE_OPTIONS = [
  "Psychotropic",
  "Risk of false positive for Amphetamines exists due to active prescription",
  "Off-Label Use",
  "Prescribed Medication",
  "Additional Supplement/OTC",
  "Available Over the Counter",
];

type GenericBrandType = "Generic Formulation" | "Brand Name";
type UserRole =
  "Med Leader" | "Agency Nurse" | "Staff" | "Case Manager";

interface MedicationRecord {
  id: number;
  name: string;
  genericBrandType: GenericBrandType;
  genericEquivalentId: number | null;
  description: string;
  active: boolean;
  packaging: string[];
  otcReference: string | null;
  doses: string[];
  minHoursBetweenDoses: string;
  maxDailyDose: string;
  features: string[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_MEDICATIONS: MedicationRecord[] = [
  {
    id: 1,
    name: "Abilify",
    genericBrandType: "Generic Formulation",
    genericEquivalentId: null,
    description: "Atypical antipsychotic",
    active: true,
    packaging: ["Pill/Tablet", "Liquid Bottle"],
    otcReference: null,
    doses: [],
    minHoursBetweenDoses: "",
    maxDailyDose: "",
    features: ["Psychotropic", "Prescribed Medication"],
  },
  {
    id: 2,
    name: "Adderall XR",
    genericBrandType: "Brand Name",
    genericEquivalentId: 3,
    description: "Extended-release mixed amphetamine salts",
    active: true,
    packaging: ["Pill/Tablet", "Pill Bottle"],
    otcReference: null,
    doses: [],
    minHoursBetweenDoses: "",
    maxDailyDose: "",
    features: [
      "Prescribed Medication",
      "Risk of false positive for Amphetamines exists due to active prescription",
    ],
  },
  {
    id: 3,
    name: "Amphetamine Salts",
    genericBrandType: "Generic Formulation",
    genericEquivalentId: null,
    description: "",
    active: true,
    packaging: ["Pill/Tablet"],
    otcReference: null,
    doses: [],
    minHoursBetweenDoses: "",
    maxDailyDose: "",
    features: ["Prescribed Medication"],
  },
  {
    id: 4,
    name: "Clonidine",
    genericBrandType: "Generic Formulation",
    genericEquivalentId: null,
    description:
      "Alpha-2 agonist used for ADHD and hypertension",
    active: true,
    packaging: ["Pill/Tablet", "Patch"],
    otcReference: null,
    doses: [],
    minHoursBetweenDoses: "",
    maxDailyDose: "",
    features: ["Prescribed Medication"],
  },
  {
    id: 5,
    name: "Ibuprofen",
    genericBrandType: "Generic Formulation",
    genericEquivalentId: null,
    description: "Non-steroidal anti-inflammatory (OTC)",
    active: true,
    packaging: ["Pill/Tablet", "Liquid Bottle"],
    otcReference: "Ibuprofen (Advil, Motrin)",
    doses: ["200mg", "400mg"],
    minHoursBetweenDoses: "4",
    maxDailyDose: "4",
    features: ["Available Over the Counter"],
  },
  {
    id: 6,
    name: "Lexapro",
    genericBrandType: "Brand Name",
    genericEquivalentId: 7,
    description: "SSRI antidepressant",
    active: true,
    packaging: ["Pill/Tablet", "Liquid Bottle"],
    otcReference: null,
    doses: [],
    minHoursBetweenDoses: "",
    maxDailyDose: "",
    features: ["Prescribed Medication"],
  },
  {
    id: 7,
    name: "Escitalopram",
    genericBrandType: "Generic Formulation",
    genericEquivalentId: null,
    description: "",
    active: true,
    packaging: ["Pill/Tablet", "Liquid Bottle"],
    otcReference: null,
    doses: [],
    minHoursBetweenDoses: "",
    maxDailyDose: "",
    features: ["Prescribed Medication"],
  },
  {
    id: 8,
    name: "Melatonin",
    genericBrandType: "Generic Formulation",
    genericEquivalentId: null,
    description: "Sleep supplement",
    active: true,
    packaging: ["Pill/Tablet", "Liquid Bottle", "Pill Bottle"],
    otcReference: null,
    doses: [],
    minHoursBetweenDoses: "",
    maxDailyDose: "",
    features: [
      "Additional Supplement/OTC",
      "Available Over the Counter",
    ],
  },
  {
    id: 9,
    name: "Tylenol",
    genericBrandType: "Brand Name",
    genericEquivalentId: 10,
    description: "OTC pain reliever / fever reducer",
    active: false,
    packaging: ["Pill/Tablet"],
    otcReference: "Acetaminophen (Tylenol)",
    doses: ["325mg", "500mg", "650mg"],
    minHoursBetweenDoses: "4",
    maxDailyDose: "6",
    features: ["Available Over the Counter"],
  },
  {
    id: 10,
    name: "Acetaminophen",
    genericBrandType: "Generic Formulation",
    genericEquivalentId: null,
    description: "",
    active: true,
    packaging: ["Pill/Tablet", "Liquid Bottle"],
    otcReference: "Acetaminophen (Tylenol)",
    doses: ["325mg", "500mg"],
    minHoursBetweenDoses: "4",
    maxDailyDose: "6",
    features: ["Available Over the Counter"],
  },
];

// ─── Blank form ───────────────────────────────────────────────────────────────

const blankForm = (): Omit<MedicationRecord, "id"> => ({
  name: "",
  genericBrandType: "Generic Formulation",
  genericEquivalentId: null,
  description: "",
  active: true,
  packaging: [],
  otcReference: null,
  doses: [""],
  minHoursBetweenDoses: "",
  maxDailyDose: "",
  features: [],
});

const PAGE_SIZE = 10;

// ─── Sort icon helper ─────────────────────────────────────────────────────────

function SortIcon({
  col,
  sortCol,
  dir,
}: {
  col: string;
  sortCol: string;
  dir: "asc" | "desc";
}) {
  if (sortCol !== col)
    return (
      <ChevronsUpDown className="w-3 h-3 ml-1 inline opacity-40" />
    );
  return dir === "asc" ? (
    <ChevronUp className="w-3 h-3 ml-1 inline" />
  ) : (
    <ChevronDown className="w-3 h-3 ml-1 inline" />
  );
}

// ─── Multi-select checkbox group ──────────────────────────────────────────────

function MultiCheckGroup({
  options,
  selected,
  onChange,
  columns = 2,
}: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  columns?: number;
}) {
  const toggle = (opt: string) =>
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt],
    );

  return (
    <div
      className={`grid gap-2`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {options.map((opt) => (
        <div key={opt} className="flex items-start gap-2">
          <Checkbox
            id={`opt-${opt}`}
            checked={selected.includes(opt)}
            onCheckedChange={() => toggle(opt)}
            className="mt-0.5"
          />
          <Label
            htmlFor={`opt-${opt}`}
            className="cursor-pointer text-[12px] leading-tight font-normal"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            {opt}
          </Label>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MedicationCatalogView() {
  // Role gate — in production this would come from an auth context
  const [currentRole] = useState<UserRole>("Med Leader");
  const hasAccess =
    currentRole === "Med Leader" ||
    currentRole === "Agency Nurse";

  const [medications, setMedications] = useState<
    MedicationRecord[]
  >(INITIAL_MEDICATIONS);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "active" | "inactive" | "all"
  >("active");
  const [sortCol, setSortCol] = useState<
    | "name"
    | "genericBrandType"
    | "packaging"
    | "otcReference"
    | "active"
  >("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(blankForm());

  // Deactivation warning
  const [deactivationWarningOpen, setDeactivationWarningOpen] =
    useState(false);
  const [pendingSave, setPendingSave] =
    useState<MedicationRecord | null>(null);

  // ── Derived ──────────────────────────────────────────────────────────────

  const activeGenericFormulations = useMemo(
    () =>
      medications.filter(
        (m) =>
          m.genericBrandType === "Generic Formulation" &&
          m.active,
      ),
    [medications],
  );

  const filtered = useMemo(() => {
    let list = medications.filter((m) => {
      const matchesSearch =
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.packaging
          .join(", ")
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesActive =
        activeFilter === "all" ||
        (activeFilter === "active" && m.active) ||
        (activeFilter === "inactive" && !m.active);
      return matchesSearch && matchesActive;
    });

    list = [...list].sort((a, b) => {
      let aVal: string, bVal: string;
      if (sortCol === "name") {
        aVal = a.name;
        bVal = b.name;
      } else if (sortCol === "genericBrandType") {
        aVal = a.genericBrandType;
        bVal = b.genericBrandType;
      } else if (sortCol === "packaging") {
        aVal = a.packaging.join(", ");
        bVal = b.packaging.join(", ");
      } else if (sortCol === "otcReference") {
        aVal = a.otcReference ?? "";
        bVal = b.otcReference ?? "";
      } else {
        aVal = String(a.active);
        bVal = String(b.active);
      }
      const cmp = aVal.localeCompare(bVal);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [medications, search, activeFilter, sortCol, sortDir]);

  // Data Table pagination (DTB-05 footer band)
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // ── Helpers ───────────────────────────────────────────────────────────────

  const handleSort = (
    col:
      | "name"
      | "genericBrandType"
      | "packaging"
      | "otcReference"
      | "active",
  ) => {
    if (sortCol === col)
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const openCreate = () => {
    setIsEditing(false);
    setEditId(null);
    setForm(blankForm());
    setDialogOpen(true);
  };

  const openEdit = (med: MedicationRecord) => {
    setIsEditing(true);
    setEditId(med.id);
    setForm({
      name: med.name,
      genericBrandType: med.genericBrandType,
      genericEquivalentId: med.genericEquivalentId,
      description: med.description,
      active: med.active,
      packaging: [...med.packaging],
      otcReference: med.otcReference,
      doses: med.doses.length > 0 ? [...med.doses] : [""],
      minHoursBetweenDoses: med.minHoursBetweenDoses,
      maxDailyDose: med.maxDailyDose,
      features: [...med.features],
    });
    setDialogOpen(true);
  };

  const isInActiveUse = (id: number) => {
    // In production this checks active youth medication records
    return [1, 2, 4, 6, 8].includes(id);
  };

  const validate = (): boolean => {
    if (!form.name.trim()) {
      toast.error("Medication name is required");
      return false;
    }
    if (!form.genericBrandType) {
      toast.error("Generic / Brand Name selection is required");
      return false;
    }
    if (form.packaging.length === 0) {
      toast.error("At least one packaging option is required");
      return false;
    }
    if (form.otcReference) {
      const validDoses = form.doses.filter((d) => d.trim());
      if (validDoses.length === 0) {
        toast.error(
          "At least one dose is required when OTC Reference is set",
        );
        return false;
      }
      const minHrs = Number(form.minHoursBetweenDoses);
      if (
        !form.minHoursBetweenDoses ||
        !Number.isInteger(minHrs) ||
        minHrs <= 0
      ) {
        toast.error(
          "Min Hours Between Doses must be a positive whole number",
        );
        return false;
      }
      const maxDose = Number(form.maxDailyDose);
      if (
        !form.maxDailyDose ||
        !Number.isInteger(maxDose) ||
        maxDose <= 0
      ) {
        toast.error(
          "Max Daily Dose must be a positive whole number",
        );
        return false;
      }
    }
    return true;
  };

  const commitSave = (record: MedicationRecord) => {
    if (isEditing && editId !== null) {
      setMedications((prev) =>
        prev.map((m) => (m.id === editId ? record : m)),
      );
      toast.success(`"${record.name}" updated`);
    } else {
      setMedications((prev) => [...prev, record]);
      toast.success(
        `"${record.name}" created and is now available in medication lookups`,
      );
    }
    setDialogOpen(false);
    setDeactivationWarningOpen(false);
    setPendingSave(null);
  };

  const handleSave = () => {
    if (!validate()) return;

    const record: MedicationRecord = {
      id:
        isEditing && editId !== null
          ? editId
          : Math.max(...medications.map((m) => m.id), 0) + 1,
      name: form.name.trim(),
      genericBrandType: form.genericBrandType,
      genericEquivalentId:
        form.genericBrandType === "Brand Name"
          ? form.genericEquivalentId
          : null,
      description: form.description.trim(),
      active: form.active,
      packaging: [...form.packaging],
      otcReference: form.otcReference || null,
      doses: form.otcReference
        ? form.doses.filter((d) => d.trim())
        : [],
      minHoursBetweenDoses: form.otcReference
        ? form.minHoursBetweenDoses
        : "",
      maxDailyDose: form.otcReference ? form.maxDailyDose : "",
      features: [...form.features],
    };

    // Check deactivation warning
    if (isEditing && editId !== null) {
      const prev = medications.find((m) => m.id === editId);
      if (
        prev?.active &&
        !form.active &&
        isInActiveUse(editId)
      ) {
        setPendingSave(record);
        setDeactivationWarningOpen(true);
        return;
      }
    }

    commitSave(record);
  };

  const updateDose = (idx: number, val: string) => {
    setForm((f) => {
      const doses = [...f.doses];
      doses[idx] = val;
      return { ...f, doses };
    });
  };

  const addDose = () =>
    setForm((f) => ({ ...f, doses: [...f.doses, ""] }));

  const removeDose = (idx: number) =>
    setForm((f) => ({
      ...f,
      doses: f.doses.filter((_, i) => i !== idx),
    }));

  // ── Access guard ──────────────────────────────────────────────────────────

  if (!hasAccess) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 rounded-lg"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        <AlertCircle
          className="w-10 h-10 mb-3"
          style={{ color: "#c23934" }}
        />
        <p
          className="slds-text-6 font-semibold mb-1"
          style={{ color: "var(--slds-g-color-text-default)" }}
        >
          Access Restricted
        </p>
        <p
          className="slds-text-4 text-center max-w-sm"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          The Medication Catalog is accessible only to users
          with the Med Leader or Agency Nurse profile.
        </p>
      </div>
    );
  }

  // ── Label style ───────────────────────────────────────────────────────────

  const labelStyle = { color: "var(--slds-g-color-text-weak)" };
  const inputStyle = {
    borderColor: "var(--slds-g-color-border-base-1)",
  };
  const req = <span className="text-red-600">*</span>;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Card variant="container">
      {/* Toolbar — Data Table header band */}
      <CardHeader
        size="sm"
        separated
        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 min-w-0"
      >
        {/* Left — title + count, then Active / Inactive / All */}
        <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <h2 className="slds-text-5 font-semibold m-0 whitespace-nowrap text-[var(--slds-g-color-text-default)]">
            Medication Library
          </h2>
          <Badge variant="success">{filtered.length}</Badge>
        </div>
        <ToggleGroup
          type="single"
          variant="brand"
          value={activeFilter}
          onValueChange={(v) => v && setActiveFilter(v as typeof activeFilter)}
          aria-label="Record status"
        >
          <ToggleGroupItem value="active" className="px-4">Active</ToggleGroupItem>
          <ToggleGroupItem value="inactive" className="px-4">Inactive</ToggleGroupItem>
          <ToggleGroupItem value="all" className="px-4">All</ToggleGroupItem>
        </ToggleGroup>

        </div>

        {/* Right — Count, Search, Create */}
        <div className="flex items-center gap-2">

          {/* Refresh — sample data lives in page state, so this returns to
              page 1; it re-fetches once the library reads a real source. */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Refresh"
                onClick={() => setPage(1)}
              >
                <RefreshCw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
          {/* Search */}
          <div className="w-64">
            <Input
              size="md"
              surface="base"
              leadingIcon={<Search className="h-3.5 w-3.5" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medications…"
              aria-label="Search medications"
            />
          </div>

          {/* Export to Excel */}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const escape = (v: string) =>
                `"${String(v ?? "").replace(/"/g, '""')}"`;
              const headers = [
                "Name",
                "Type",
                "Status",
                "Packaging",
                "Doses",
                "Min Hrs Between Doses",
                "Max Daily Dose",
                "Features",
                "Description",
              ];
              const rows = filtered.map((r) => [
                r.name,
                r.genericBrandType,
                r.active ? "Active" : "Inactive",
                r.packaging.join("; "),
                r.doses.join("; "),
                r.minHoursBetweenDoses,
                r.maxDailyDose,
                r.features.join("; "),
                r.description,
              ]);
              const csv = [headers, ...rows]
                .map((row) => row.map(escape).join(","))
                .join("\r\n");
              const blob = new Blob([csv], {
                type: "text/csv;charset=utf-8;",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "medication-library.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download />
            Export to Excel
          </Button>

          {/* Create */}
          <Button type="button" onClick={openCreate}>
            <Plus />
            Create
          </Button>
        </div>
      </CardHeader>

        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
                <TableHead
                  variant="slds"
                  active={sortCol === "name"}
                  aria-sort={sortCol === "name" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                >
                  <button
                    type="button"
                    onClick={() => handleSort("name")}
                    className="inline-flex items-center gap-1 uppercase [font-size:inherit] [font-weight:inherit] [letter-spacing:inherit]"
                  >
                    Name
                    <SortIcon col="name" sortCol={sortCol} dir={sortDir} />
                  </button>
                </TableHead>
                <TableHead
                  variant="slds"
                  active={sortCol === "genericBrandType"}
                  aria-sort={sortCol === "genericBrandType" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                >
                  <button
                    type="button"
                    onClick={() => handleSort("genericBrandType")}
                    className="inline-flex items-center gap-1 uppercase [font-size:inherit] [font-weight:inherit] [letter-spacing:inherit]"
                  >
                    Generic Name
                    <SortIcon col="genericBrandType" sortCol={sortCol} dir={sortDir} />
                  </button>
                </TableHead>
                <TableHead
                  variant="slds"
                  active={sortCol === "packaging"}
                  aria-sort={sortCol === "packaging" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                >
                  <button
                    type="button"
                    onClick={() => handleSort("packaging")}
                    className="inline-flex items-center gap-1 uppercase [font-size:inherit] [font-weight:inherit] [letter-spacing:inherit]"
                  >
                    Available Packaging
                    <SortIcon col="packaging" sortCol={sortCol} dir={sortDir} />
                  </button>
                </TableHead>
                <TableHead
                  variant="slds"
                  active={sortCol === "otcReference"}
                  aria-sort={sortCol === "otcReference" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                >
                  <button
                    type="button"
                    onClick={() => handleSort("otcReference")}
                    className="inline-flex items-center gap-1 uppercase [font-size:inherit] [font-weight:inherit] [letter-spacing:inherit]"
                  >
                    OTC Reference
                    <SortIcon col="otcReference" sortCol={sortCol} dir={sortDir} />
                  </button>
                </TableHead>
                <TableHead
                  variant="slds"
                  active={sortCol === "active"}
                  aria-sort={sortCol === "active" ? (sortDir === "asc" ? "ascending" : "descending") : "none"} className="text-center"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("active")}
                    className="inline-flex items-center gap-1 uppercase [font-size:inherit] [font-weight:inherit] [letter-spacing:inherit]"
                  >
                    Active
                    <SortIcon col="active" sortCol={sortCol} dir={sortDir} />
                  </button>
                </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow hoverable={false}>
                <TableCell colSpan={5} className="px-4 py-10 text-center">
                  <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
                    No medication records found
                  </p>
                  {search && (
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-1"
                      onClick={() => setSearch("")}
                    >
                      Clear search
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((med) => (
                <TableRow
                  key={med.id}
                  className="group cursor-pointer"
                  onClick={() => openEdit(med)}
                >
                  <TableCell wrap className="px-4 py-3">
                    <button
                      type="button"
                      className="slds-text-4 font-medium text-left text-[var(--color-link-blue)] group-hover:underline"
                      style={{ color: "var(--color-link-blue)" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(med);
                      }}
                    >
                      {med.name}
                    </button>
                    {med.description && (
                      <p className="slds-text-3 mt-0.5 text-[var(--slds-g-color-text-weak)]">
                        {med.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 slds-text-4 text-[var(--slds-g-color-text-default)]">
                    {med.genericBrandType === "Brand Name" ? (
                      <>
                        {med.genericEquivalentId
                          ? (medications.find(
                              (m) => m.id === med.genericEquivalentId,
                            )?.name ?? "—")
                          : "—"}
                        <p className="slds-text-3 mt-0.5 text-[var(--slds-g-color-text-weak)]">
                          Brand Name
                        </p>
                      </>
                    ) : (
                      med.name
                    )}
                  </TableCell>
                  <TableCell wrap className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {med.packaging.map((p) => (
                        <Badge key={p} variant="neutral">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 slds-text-4 text-[var(--slds-g-color-text-default)]">
                    {med.otcReference || (
                      <span className="text-[var(--slds-g-color-text-weak)]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <Badge variant={med.active ? "success" : "neutral"} bordered>
                      {med.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <CardFooter size="sm" separated>
          <TablePaginationBar
            className="w-full"
            start={filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}
            end={Math.min(safePage * PAGE_SIZE, filtered.length)}
            total={filtered.length}
            countLabel="records"
            currentPage={safePage}
            totalPages={totalPages}
            onPrevious={() => setPage(safePage - 1)}
            onNext={() => setPage(safePage + 1)}
          />
        </CardFooter>
      </Card>

      {/* ── Create / Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
          }
        }}
      >
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? `Edit Medication — ${form.name || "…"}`
                : "Create Medication"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the medication record details below."
                : "Complete all required fields to create a new medication record. Active records become immediately available in medication lookup fields."}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="grid gap-5">
            {/* Row: Name + Generic / Brand */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="med-name"
                  className="slds-form-label"
                  style={labelStyle}
                >
                  Medication Name {req}
                </Label>
                <Input
                  id="med-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter medication name"
                  className="h-9 slds-text-4"
                  style={inputStyle}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="med-gbn"
                  className="slds-form-label"
                  style={labelStyle}
                >
                  Generic / Brand Name {req}
                </Label>
                <Select
                  value={form.genericBrandType}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      genericBrandType: v as GenericBrandType,
                      genericEquivalentId: null,
                    }))
                  }
                >
                  <SelectTrigger
                    id="med-gbn"
                    className="h-9 slds-text-4"
                    style={inputStyle}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Generic Formulation">
                      Generic Formulation
                    </SelectItem>
                    <SelectItem value="Brand Name">
                      Brand Name
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row: Generic Equivalent (Brand Name only) */}
            {form.genericBrandType === "Brand Name" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="med-ge"
                    className="slds-form-label"
                    style={labelStyle}
                  >
                    Generic Equivalent
                  </Label>
                  <Select
                    value={
                      form.genericEquivalentId?.toString() ?? ""
                    }
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        genericEquivalentId: v
                          ? parseInt(v)
                          : null,
                      }))
                    }
                  >
                    <SelectTrigger
                      id="med-ge"
                      className="h-9 slds-text-4"
                      style={inputStyle}
                    >
                      <SelectValue placeholder="Select generic equivalent" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeGenericFormulations
                        .filter((m) => m.id !== editId)
                        .map((m) => (
                          <SelectItem
                            key={m.id}
                            value={m.id.toString()}
                          >
                            {m.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p
                    className="text-[11px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Only active Generic Formulation records are
                    shown.
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <Label
                htmlFor="med-desc"
                className="slds-form-label"
                style={labelStyle}
              >
                Description
              </Label>
              <Textarea
                id="med-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                placeholder="Optional description"
                rows={2}
                className="slds-text-4 resize-none"
                style={inputStyle}
              />
            </div>

            {/* Active */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="med-active"
                checked={form.active}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, active: !!v }))
                }
              />
              <Label
                htmlFor="med-active"
                className="cursor-pointer slds-text-4"
              >
                Active
              </Label>
              <span
                className="slds-text-3 ml-1"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                (Active records appear in all medication lookup
                fields)
              </span>
            </div>

            {/* Available Packaging */}
            <div className="space-y-2">
              <Label
                className="slds-form-label"
                style={labelStyle}
              >
                Available Medication Packaging {req}
              </Label>
              <div
                className="p-3 rounded-md"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <MultiCheckGroup
                  options={PACKAGING_OPTIONS}
                  selected={form.packaging}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, packaging: v }))
                  }
                  columns={3}
                />
              </div>
              {form.packaging.length > 0 && (
                <p
                  className="text-[11px]"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Selected: {form.packaging.join(", ")}
                </p>
              )}
            </div>

            {/* OTC Reference */}
            <div className="space-y-1.5">
              <Label
                htmlFor="med-otc"
                className="slds-form-label"
                style={labelStyle}
              >
                OTC Reference
              </Label>
              <Select
                value={form.otcReference ?? "__none__"}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    otcReference: v === "__none__" ? null : v,
                    doses: v === "__none__" ? [""] : f.doses,
                    minHoursBetweenDoses:
                      v === "__none__"
                        ? ""
                        : f.minHoursBetweenDoses,
                    maxDailyDose:
                      v === "__none__" ? "" : f.maxDailyDose,
                  }))
                }
              >
                <SelectTrigger
                  id="med-otc"
                  className="h-9 slds-text-4"
                  style={inputStyle}
                >
                  <SelectValue placeholder="None (not an OTC medication)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {OTC_REFERENCE_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* OTC conditional fields */}
            {form.otcReference && (
              <div
                className="space-y-4 p-4 rounded-md"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <p
                  className="slds-form-label font-semibold"
                  style={labelStyle}
                >
                  OTC DOSING INFORMATION
                </p>

                {/* Dose entries */}
                <div className="space-y-2">
                  <Label
                    className="slds-form-label"
                    style={labelStyle}
                  >
                    Dose {req}
                  </Label>
                  {form.doses.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2"
                    >
                      <Input
                        value={d}
                        onChange={(e) =>
                          updateDose(i, e.target.value)
                        }
                        placeholder="e.g. 200mg"
                        className="h-9 slds-text-4 flex-1"
                        style={inputStyle}
                      />
                      {form.doses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDose(i)}
                          className="h-7 w-7 flex items-center justify-center rounded hover:bg-red-50 transition-colors"
                          style={{ color: "#c23934" }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addDose}
                    className="text-[12px] font-medium flex items-center gap-1 mt-1 hover:underline"
                    style={{ color: "#145F33" }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add another
                    dose
                  </button>
                  <p
                    className="text-[11px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Add one entry per available dose strength.
                  </p>
                </div>

                {/* Min / Max */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="med-minhrs"
                      className="slds-form-label"
                      style={labelStyle}
                    >
                      Min Hours Between Doses {req}
                    </Label>
                    <Input
                      id="med-minhrs"
                      type="number"
                      min="1"
                      step="1"
                      value={form.minHoursBetweenDoses}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          minHoursBetweenDoses: e.target.value,
                        }))
                      }
                      placeholder="e.g. 4"
                      className="h-9 slds-text-4"
                      style={inputStyle}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="med-maxdose"
                      className="slds-form-label"
                      style={labelStyle}
                    >
                      Max Daily Dose {req}
                    </Label>
                    <Input
                      id="med-maxdose"
                      type="number"
                      min="1"
                      step="1"
                      value={form.maxDailyDose}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          maxDailyDose: e.target.value,
                        }))
                      }
                      placeholder="e.g. 4"
                      className="h-9 slds-text-4"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Medication Feature */}
            <div className="space-y-2">
              <Label
                className="slds-form-label"
                style={labelStyle}
              >
                Medication Feature
              </Label>
              <div
                className="p-3 rounded-md"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <MultiCheckGroup
                  options={FEATURE_OPTIONS}
                  selected={form.features}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, features: v }))
                  }
                  columns={1}
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              {isEditing ? "Save Changes" : "Create Medication"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Deactivation Warning Dialog ──────────────────────────────────────── */}
      <Dialog
        open={deactivationWarningOpen}
        onOpenChange={setDeactivationWarningOpen}
      >
        <DialogContent aria-describedby="deact-desc">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Medication Currently In Use
            </DialogTitle>
            <DialogDescription id="deact-desc">
              This medication is currently referenced on one or
              more active youth medication or OTC records.
              Setting it to inactive will remove it from all
              medication lookup fields. This action cannot be
              undone without reactivating the record.
            </DialogDescription>
          </DialogHeader>
          <div
            className="flex items-start gap-2.5 px-3 py-2.5 rounded-md my-1"
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FCA5A5",
            }}
          >
            <AlertCircle
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              style={{ color: "#c23934" }}
            />
            <div className="flex-1 min-w-0">
              <p
                className="slds-text-4 font-semibold leading-tight"
                style={{ color: "#c23934" }}
              >
                Medication is currently in use.
              </p>
              <p
                className="slds-text-3 mt-0.5"
                style={{ color: "#9B1C1C" }}
              >
                Existing active youth medication records will
                remain on record but this medication will no
                longer appear in new lookups.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full h-9"
              onClick={() => {
                setDeactivationWarningOpen(false);
                setPendingSave(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full h-9"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
              onClick={() =>
                pendingSave && commitSave(pendingSave)
              }
            >
              Acknowledge &amp; Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}