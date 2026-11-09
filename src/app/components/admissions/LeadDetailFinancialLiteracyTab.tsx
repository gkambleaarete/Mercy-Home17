import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  BarChart2,
  X,
  AlertCircle,
} from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";

// ─── Types ────────────────────────────────────────────────────────────────────

type CurriculumStatus = "Enrolled" | "In Progress" | "Complete";
type CurriculumVersion =
  | "EverFi Classic"
  | "EverFi New"
  | "EverFi Vault";

interface CurriculumRecord {
  id: number;
  version: CurriculumVersion;
  dateRegistered: string; // MM/DD/YYYY
  dateCertified: string; // MM/DD/YYYY or ""
  status: CurriculumStatus;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VERSION_OPTIONS: CurriculumVersion[] = [
  "EverFi Classic",
  "EverFi New",
  "EverFi Vault",
];
const STATUS_OPTIONS: CurriculumStatus[] = [
  "Enrolled",
  "In Progress",
  "Complete",
];

const STATUS_BADGE: Record<
  CurriculumStatus,
  { bg: string; color: string; border: string }
> = {
  Enrolled: {
    bg: "#eff6ff",
    color: "#1d4ed8",
    border: "#bfdbfe",
  },
  "In Progress": {
    bg: "#fff7ed",
    color: "#92400e",
    border: "#fed7aa",
  },
  Complete: {
    bg: "#f0fdf4",
    color: "#145F33",
    border: "#bbf7d0",
  },
};

const EVERFI_MODULES: Record<CurriculumVersion, string[]> = {
  "EverFi Classic": [
    "Savings",
    "Banking",
    "Payment, Interest Rates & CCs",
    "Credit Scores",
    "Financing Higher Education",
    "Renting Vs. Owning",
    "Taxes & Insurance",
    "Consumer Fraud",
    "Investing",
  ],
  "EverFi New": [
    "Banking",
    "Consumer Protection",
    "Credit Scores",
    "Higher Education",
    "Insurance & Taxes",
    "Investing",
    "Payment Types",
    "Renting Vs. Owning",
    "Savings",
  ],
  "EverFi Vault": [
    "Responsible Money Choices",
    "Income and Careers",
    "Making Plans with Money",
    "Credit and Borrowing",
    "Insurance and Safety",
    "Savings and Investing",
  ],
};

const EMPTY_SCORE_FORM = {
  module: "",
  date: "",
  time: "",
  score: "",
  pretest: false,
};

interface ScoreRecord {
  id: number;
  module: string;
  date: string;
  time: string;
  score: string;
  pretest: boolean;
}

const EMPTY_FORM = {
  version: "" as CurriculumVersion | "",
  dateRegistered: "",
  dateCertified: "",
  status: "Enrolled" as CurriculumStatus,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toInputDate(mmddyyyy: string) {
  if (!mmddyyyy) return "";
  const [m, d, y] = mmddyyyy.split("/");
  return y && m && d ? `${y}-${m}-${d}` : "";
}

function fromInputDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

function formatDisplayDate(mmddyyyy: string) {
  if (!mmddyyyy) return "—";
  const [m, d, y] = mmddyyyy.split("/");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EducationIllustration() {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="14"
        y="26"
        width="68"
        height="50"
        rx="5"
        fill="#f0fdf4"
        stroke="#bbf7d0"
        strokeWidth="1.5"
      />
      <rect
        x="22"
        y="36"
        width="28"
        height="4"
        rx="2"
        fill="#86efac"
      />
      <rect
        x="22"
        y="44"
        width="44"
        height="3"
        rx="1.5"
        fill="#dcfce7"
      />
      <rect
        x="22"
        y="51"
        width="36"
        height="3"
        rx="1.5"
        fill="#dcfce7"
      />
      <rect
        x="22"
        y="58"
        width="40"
        height="3"
        rx="1.5"
        fill="#dcfce7"
      />
      <rect
        x="22"
        y="65"
        width="26"
        height="3"
        rx="1.5"
        fill="#dcfce7"
      />
      <circle cx="48" cy="24" r="12" fill="#145F33" />
      <path
        d="M42 24l4 4 8-9"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse px-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex gap-6 py-3 border-b"
          style={{
            borderColor: "var(--slds-g-color-border-base-1)",
          }}
        >
          {[100, 110, 110, 72].map((w, j) => (
            <div
              key={j}
              className="h-4 rounded"
              style={{
                width: w,
                backgroundColor:
                  "var(--slds-g-color-border-base-1)",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LeadDetailFinancialLiteracyTab() {
  const [records, setRecords] = useState<CurriculumRecord[]>(
    [],
  );
  const [selectedId, setSelectedId] = useState<number | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formErrors, setFormErrors] = useState<{
    version?: string;
    dateRegistered?: string;
  }>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const hasCurriculum = records.length > 0;
  const selectedRecord =
    records.find((r) => r.id === selectedId) ?? null;
  const hasSelection = selectedRecord !== null;

  function setField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    setFormErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleCreate() {
    if (hasCurriculum) return;
    setModalMode("create");
    setForm({ ...EMPTY_FORM });
    setFormErrors({});
    setModalOpen(true);
  }

  function handleEdit() {
    if (!selectedRecord) return;
    setModalMode("edit");
    setForm({
      version: selectedRecord.version,
      dateRegistered: selectedRecord.dateRegistered,
      dateCertified: selectedRecord.dateCertified,
      status: selectedRecord.status,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function validate() {
    const errs: typeof formErrors = {};
    if (!form.version) errs.version = "Version is required.";
    if (!form.dateRegistered)
      errs.dateRegistered = "Date Registered is required.";
    return errs;
  }

  function handleSave(closeAfter: boolean) {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    if (modalMode === "create") {
      const rec: CurriculumRecord = {
        id: Date.now(),
        version: form.version as CurriculumVersion,
        dateRegistered: form.dateRegistered,
        dateCertified: form.dateCertified,
        status: form.status,
      };
      setRecords([rec]);
      setSelectedId(rec.id);
      toast.success("Financial Literacy curriculum created.");
    } else if (selectedRecord) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === selectedRecord.id
            ? {
                ...r,
                version: form.version as CurriculumVersion,
                dateRegistered: form.dateRegistered,
                dateCertified: form.dateCertified,
                status: form.status,
              }
            : r,
        ),
      );
      toast.success("Financial Literacy curriculum updated.");
    }

    if (closeAfter) setModalOpen(false);
    else {
      setForm({ ...EMPTY_FORM });
      setFormErrors({});
    }
  }

  function handleDeleteConfirm() {
    setRecords([]);
    setSelectedId(null);
    setDeleteConfirmOpen(false);
    toast.success("Financial Literacy curriculum deleted.");
  }

  // ── Score modal state ────────────────────────────────────────────────────────
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [scoreForm, setScoreForm] = useState({
    ...EMPTY_SCORE_FORM,
  });
  const [scoreErrors, setScoreErrors] = useState<
    Record<string, string>
  >({});
  const [scoreRecords, setScoreRecords] = useState<
    ScoreRecord[]
  >([]);
  const [editingScoreId, setEditingScoreId] = useState<number | null>(null);

  const availableModules = selectedRecord
    ? EVERFI_MODULES[selectedRecord.version]
    : [];

  function setScoreField<
    K extends keyof typeof EMPTY_SCORE_FORM,
  >(key: K, value: (typeof EMPTY_SCORE_FORM)[K]) {
    setScoreForm((f) => ({ ...f, [key]: value }));
    setScoreErrors((e) => {
      const n = { ...e };
      delete n[key];
      return n;
    });
  }

  function validateScore() {
    const errs: Record<string, string> = {};
    if (!scoreForm.module)
      errs.module = "EverFi Module is required.";
    if (!scoreForm.date) errs.date = "Date is required.";
    if (!scoreForm.time) errs.time = "Time is required.";
    if (!scoreForm.score) errs.score = "Score is required.";
    else if (isNaN(Number(scoreForm.score)))
      errs.score = "Enter a valid numeric score.";
    return errs;
  }

  function handleScoreSave(closeAfter: boolean) {
    const errs = validateScore();
    if (Object.keys(errs).length > 0) {
      setScoreErrors(errs);
      return;
    }
    if (editingScoreId !== null) {
      setScoreRecords((prev) =>
        prev.map((sr) =>
          sr.id === editingScoreId
            ? { ...sr, module: scoreForm.module, date: scoreForm.date, time: scoreForm.time, score: scoreForm.score, pretest: scoreForm.pretest }
            : sr
        )
      );
      toast.success("Score updated successfully.");
      setEditingScoreId(null);
    } else {
      const newScore: ScoreRecord = {
        id: Date.now(),
        module: scoreForm.module,
        date: scoreForm.date,
        time: scoreForm.time,
        score: scoreForm.score,
        pretest: scoreForm.pretest,
      };
      setScoreRecords((prev) => [...prev, newScore]);
      toast.success("Score recorded successfully.");
    }
    setScoreForm({ ...EMPTY_SCORE_FORM });
    setScoreErrors({});
    if (closeAfter) setScoreModalOpen(false);
  }

  function handleScoreCancel() {
    setEditingScoreId(null);
    setScoreForm({ ...EMPTY_SCORE_FORM });
    setScoreErrors({});
    setScoreModalOpen(false);
  }

  function openScoreModal() {
    setScoreForm({ ...EMPTY_SCORE_FORM });
    setScoreErrors({});
    setEditingScoreId(null);
    setScoreModalOpen(true);
  }

  function handleRowClick(id: number) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  // ── Toolbar button shared style helpers ─────────────────────────────────────
  const secondaryBtn = {
    base: "h-8 px-3 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-colors",
    style: {
      border: "1px solid var(--slds-g-color-border-base-1)",
      backgroundColor: "var(--slds-g-color-background-base)",
      color: "var(--slds-g-color-text-default)",
    } as React.CSSProperties,
  };

  return (
    <>
      {/* ── Single Card Container ──────────────────────────────────────────── */}
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        {/* Card Header — title + supporting text + Scores button */}
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
              Financial Literacy
            </h3>
            <p
              className="slds-text-3 mt-0.5"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Manage a youth's Financial Literacy curriculum
              enrollment and completion.
            </p>
          </div>
          <button
            onClick={openScoreModal}
            disabled={!hasSelection}
            className="flex-shrink-0 h-8 px-3 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
              color: "var(--slds-g-color-text-default)",
            }}
            title={
              hasSelection
                ? "Record a score"
                : "Select a curriculum row to record a score"
            }
          >
            <BarChart2
              className="h-3.5 w-3.5"
              style={{ color: "#0176d3" }}
            />
            Scores
          </button>
        </div>

        {/* Table / Empty State */}
        {isLoading ? (
          <div className="py-4">
            <TableSkeleton />
          </div>
        ) : hasCurriculum ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  {[
                    "Version",
                    "Date Registered",
                    "Date Certified",
                    "Status",
                    "Action",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2.5 text-left font-semibold whitespace-nowrap"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((row) => {
                  const badge = STATUS_BADGE[row.status];
                  const isSelected = row.id === selectedId;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => handleRowClick(row.id)}
                      className="cursor-pointer transition-colors"
                      style={{
                        backgroundColor: isSelected
                          ? "rgba(20,95,51,0.06)"
                          : undefined,
                        outline: isSelected
                          ? "2px solid rgba(20,95,51,0.3)"
                          : undefined,
                        outlineOffset: "-2px",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.backgroundColor =
                            "var(--slds-g-color-background-alt)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.backgroundColor =
                            "";
                      }}
                    >
                      <td
                        className="px-4 py-3 font-medium"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {row.version}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {formatDisplayDate(row.dateRegistered)}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {formatDisplayDate(row.dateCertified)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(row.id);
                              handleEdit();
                            }}
                            className="p-1.5 rounded transition-colors hover:bg-[#f3f3f3]"
                            title="Edit"
                          >
                            <Pencil
                              className="h-3.5 w-3.5"
                              style={{ color: "#0176d3" }}
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(row.id);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 rounded transition-colors hover:bg-[#f3f3f3]"
                            title="Delete"
                          >
                            <Trash2
                              className="h-3.5 w-3.5"
                              style={{ color: "#c23934" }}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
            <EducationIllustration />
            <h3
              className="mt-4 text-[14px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              No Financial Literacy Curriculum Found
            </h3>
            <p
              className="mt-1.5 slds-text-4 max-w-xs"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Track curriculum enrollment and completion by
              creating the first curriculum record.
            </p>
            <button
              onClick={handleCreate}
              className="mt-4 h-8 px-4 rounded-full text-[12px] font-medium text-white flex items-center gap-1.5 transition-colors"
              style={{ backgroundColor: "#145F33" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#0e4524")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#145F33")
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Create New Curriculum
            </button>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget)
              setModalOpen(false);
          }}
        >
          <div
            className="w-full flex flex-col shadow-2xl rounded-xl overflow-hidden"
            style={{
              maxWidth: 640,
              maxHeight: "90vh",
              backgroundColor:
                "var(--slds-g-color-background-base)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            {/* Modal Header */}
            <div
              className="px-6 py-4 flex items-start justify-between flex-shrink-0"
              style={{
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <div>
                <h2
                  className="text-[15px] font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {modalMode === "create"
                    ? "Create Financial Literacy Curriculum"
                    : "Edit Financial Literacy Curriculum"}
                </h2>
                <p
                  className="slds-text-3 mt-0.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  {modalMode === "create"
                    ? "Enter the curriculum information for this youth."
                    : "Update the curriculum information."}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded hover:bg-gray-200 transition-colors flex-shrink-0 ml-4 mt-0.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Duplicate warning */}
              {modalMode === "create" && hasCurriculum && (
                <div
                  className="flex items-start gap-2 px-3 py-3 rounded-lg slds-text-3"
                  style={{
                    backgroundColor: "#fef3c7",
                    border: "1px solid #fcd34d",
                    color: "#92400e",
                  }}
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Only one Financial Literacy curriculum can
                    be added at a time. Delete the existing
                    curriculum before adding a new one.
                  </span>
                </div>
              )}

              {/* Version */}
              <div className="space-y-1.5">
                <label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  VERSION{" "}
                  <span className="text-red-600">*</span>
                </label>
                <select
                  value={form.version}
                  onChange={(e) =>
                    setField(
                      "version",
                      e.target.value as CurriculumVersion,
                    )
                  }
                  className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                  style={{
                    border: `1px solid ${formErrors.version ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: form.version
                      ? "var(--slds-g-color-text-default)"
                      : "var(--slds-g-color-text-weak)",
                  }}
                >
                  <option value="">Select Version</option>
                  {VERSION_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                {formErrors.version && (
                  <p
                    className="slds-text-3 flex items-center gap-1"
                    style={{ color: "#c23934" }}
                  >
                    <AlertCircle className="h-3 w-3" />{" "}
                    {formErrors.version}
                  </p>
                )}
              </div>

              {/* Date Registered */}
              <div className="space-y-1.5">
                <label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  DATE REGISTERED{" "}
                  <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.dateRegistered}
                  onChange={(e) =>
                    setField("dateRegistered", e.target.value)
                  }
                  placeholder="MM/DD/YYYY"
                  className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                  style={{
                    border: `1px solid ${formErrors.dateRegistered ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
                {formErrors.dateRegistered && (
                  <p
                    className="slds-text-3 flex items-center gap-1"
                    style={{ color: "#c23934" }}
                  >
                    <AlertCircle className="h-3 w-3" />{" "}
                    {formErrors.dateRegistered}
                  </p>
                )}
              </div>

              {/* Date Certified */}
              <div className="space-y-1.5">
                <label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  DATE CERTIFIED
                  <span
                    className="ml-1 slds-text-3 normal-case font-normal"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    (Optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.dateCertified}
                  onChange={(e) =>
                    setField("dateCertified", e.target.value)
                  }
                  placeholder="MM/DD/YYYY"
                  className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  STATUS
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setField(
                      "status",
                      e.target.value as CurriculumStatus,
                    )
                  }
                  className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  <option value="">Select Status</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="px-6 py-3.5 flex items-center justify-end gap-2 flex-shrink-0"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <button
                onClick={() => setModalOpen(false)}
                className="h-9 px-4 rounded-full text-[13px] font-medium transition-colors"
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
                onClick={() => handleSave(true)}
                className="h-9 px-4 rounded-full text-[13px] font-medium text-white transition-colors"
                style={{ backgroundColor: "#145F33" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "#0e4524")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "#145F33")
                }
              >
                {modalMode === "create"
                  ? "Create Curriculum"
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ────────────────────────────────────────────── */}
      {deleteConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="rounded-xl w-full max-w-sm overflow-hidden shadow-2xl"
            style={{
              backgroundColor:
                "var(--slds-g-color-background-base)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <h3
                className="text-[14px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Delete Financial Literacy Curriculum?
              </h3>
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 py-5">
              <div
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{
                  backgroundColor: "rgba(194,57,52,0.06)",
                  border: "1px solid rgba(194,57,52,0.2)",
                }}
              >
                <AlertCircle
                  className="h-4 w-4 flex-shrink-0 mt-0.5"
                  style={{ color: "#c23934" }}
                />
                <p
                  className="slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  This action permanently removes the Financial
                  Literacy curriculum for this youth.
                </p>
              </div>
              <p
                className="slds-text-3 mt-3"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                After deletion, a new curriculum can be added.
              </p>
            </div>

            <div
              className="px-5 py-3.5 flex justify-end gap-2"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="h-9 px-4 rounded-full text-[13px] font-medium transition-colors"
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
                onClick={handleDeleteConfirm}
                className="h-9 px-4 rounded-full text-[13px] font-medium text-white transition-colors"
                style={{ backgroundColor: "#c23934" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "#a63028")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "#c23934")
                }
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create New Score Modal ─────────────────────────────────────────── */}
      {scoreModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget)
              setScoreModalOpen(false);
          }}
        >
          <div
            className="w-full flex flex-col shadow-2xl rounded-xl overflow-hidden"
            style={{
              maxWidth: 680,
              maxHeight: "90vh",
              backgroundColor:
                "var(--slds-g-color-background-base)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 flex items-start justify-between flex-shrink-0"
              style={{
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <div>
                <h2
                  className="text-[15px] font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {editingScoreId !== null ? "Edit Score" : "Create New Score"}
                </h2>
                <p
                  className="slds-text-3 mt-0.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  {editingScoreId !== null
                    ? "Update the selected score record."
                    : "Record a Financial Literacy module score for the selected youth constituent."}
                </p>
              </div>
              <button
                onClick={handleScoreCancel}
                className="p-1.5 rounded hover:bg-gray-200 transition-colors flex-shrink-0 ml-4 mt-0.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Edit mode indicator */}
              {editingScoreId !== null && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded mb-4 slds-text-3 font-medium"
                  style={{
                    backgroundColor: "#EAF3EC",
                    border: "1px solid #145F33",
                    color: "#145F33",
                  }}
                >
                  <Pencil className="h-3.5 w-3.5 flex-shrink-0" />
                  Editing existing score — make your changes and click Save Changes.
                </div>
              )}
              {/* Two-column form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {/* EverFi Module */}
                <div className="space-y-1.5">
                  <label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    EVERFI MODULE{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={scoreForm.module}
                    onChange={(e) =>
                      setScoreField("module", e.target.value)
                    }
                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                    style={{
                      border: `1px solid ${scoreErrors.module ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: scoreForm.module
                        ? "var(--slds-g-color-text-default)"
                        : "var(--slds-g-color-text-weak)",
                    }}
                  >
                    <option value="">
                      Select EverFi Module
                    </option>
                    {availableModules.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  {scoreErrors.module ? (
                    <p
                      className="slds-text-3 flex items-center gap-1"
                      style={{ color: "#c23934" }}
                    >
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />{" "}
                      {scoreErrors.module}
                    </p>
                  ) : (
                    <p
                      className="slds-text-3"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Available modules are based on the
                      associated Financial Literacy Curriculum
                      Version.
                    </p>
                  )}
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    DATE{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={scoreForm.date}
                    onChange={(e) =>
                      setScoreField("date", e.target.value)
                    }
                    placeholder="MM/DD/YYYY"
                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                    style={{
                      border: `1px solid ${scoreErrors.date ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  />
                  {scoreErrors.date && (
                    <p
                      className="slds-text-3 flex items-center gap-1"
                      style={{ color: "#c23934" }}
                    >
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />{" "}
                      {scoreErrors.date}
                    </p>
                  )}
                </div>

                {/* Score */}
                <div className="space-y-1.5">
                  <label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    SCORE{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={scoreForm.score}
                    onChange={(e) =>
                      setScoreField("score", e.target.value)
                    }
                    placeholder="Enter Score"
                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                    style={{
                      border: `1px solid ${scoreErrors.score ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  />
                  {scoreErrors.score && (
                    <p
                      className="slds-text-3 flex items-center gap-1"
                      style={{ color: "#c23934" }}
                    >
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />{" "}
                      {scoreErrors.score}
                    </p>
                  )}
                </div>

                {/* Time */}
                <div className="space-y-1.5">
                  <label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    TIME{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="time"
                    value={scoreForm.time}
                    onChange={(e) =>
                      setScoreField("time", e.target.value)
                    }
                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                    style={{
                      border: `1px solid ${scoreErrors.time ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  />
                  {scoreErrors.time && (
                    <p
                      className="slds-text-3 flex items-center gap-1"
                      style={{ color: "#c23934" }}
                    >
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />{" "}
                      {scoreErrors.time}
                    </p>
                  )}
                </div>

                {/* Pretest */}
                <div className="flex items-center gap-2.5 pb-6">
                  <input
                    type="checkbox"
                    id="score-pretest"
                    checked={scoreForm.pretest}
                    onChange={(e) =>
                      setScoreField("pretest", e.target.checked)
                    }
                    className="h-4 w-4 rounded"
                    style={{ accentColor: "#145F33" }}
                  />
                  <label
                    htmlFor="score-pretest"
                    className="slds-text-4 cursor-pointer select-none"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Pretest
                  </label>
                </div>
              </div>
              {/* No-curriculum blocking state */}
              {!hasCurriculum ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <AlertCircle
                    className="h-8 w-8 mb-3"
                    style={{ color: "#c23934" }}
                  />
                  <p
                    className="slds-text-4 font-medium"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    No Financial Literacy Curriculum Found
                  </p>
                  <p
                    className="slds-text-3 mt-1.5 max-w-xs"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    A Financial Literacy Curriculum record must
                    exist before scores can be added.
                  </p>
                </div>
              ) : (
                <>
                  {/* Scores grid — shows previously saved scores */}
                  {scoreRecords.length > 0 && (
                    <div className="mb-5">
                      <p
                        className="slds-form-label mb-2"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        RECORDED SCORES
                      </p>
                      <div
                        className="overflow-hidden"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          borderRadius:
                            "var(--slds-c-card-radius-border)",
                        }}
                      >
                        <table className="w-full text-[13px]">
                          <thead>
                            <tr
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-alt)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              {[
                                "EverFi Module",
                                "Date",
                                "Time",
                                "Score",
                              ].map((col) => (
                                <th
                                  key={col}
                                  className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                    fontSize: 11,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                  }}
                                >
                                  {col}
                                </th>
                              ))}
                              <th
                                className="px-3 py-2 text-right font-semibold whitespace-nowrap"
                                style={{
                                  color: "var(--slds-g-color-text-weak)",
                                  fontSize: 11,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {scoreRecords.map((sr, idx) => (
                              <tr
                                key={sr.id}
                                style={{
                                  borderBottom:
                                    idx <
                                    scoreRecords.length - 1
                                      ? "1px solid var(--slds-g-color-border-base-1)"
                                      : undefined,
                                  backgroundColor:
                                    idx % 2 === 0
                                      ? "var(--slds-g-color-background-base)"
                                      : "var(--slds-g-color-background-alt)",
                                }}
                              >
                                <td
                                  className="px-3 py-2"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {sr.module}
                                </td>
                                <td
                                  className="px-3 py-2"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {sr.date}
                                </td>
                                <td
                                  className="px-3 py-2"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {sr.time}
                                </td>
                                <td
                                  className="px-3 py-2"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {sr.score}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <button
                                    type="button"
                                    title="Edit score"
                                    onClick={() => {
                                      setEditingScoreId(sr.id);
                                      setScoreForm({
                                        module: sr.module,
                                        date: sr.date,
                                        time: sr.time,
                                        score: sr.score,
                                        pretest: sr.pretest,
                                      });
                                      setScoreErrors({});
                                    }}
                                    className="p-1 rounded transition-colors"
                                    style={{ color: "#0176d3" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-alt)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-6 py-3.5 flex items-center justify-end gap-2 flex-shrink-0"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <button
                onClick={handleScoreCancel}
                className="h-9 px-4 rounded-full text-[13px] font-medium transition-colors"
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
              {hasCurriculum && (
                <>
                  {editingScoreId !== null ? (
                    <button
                      onClick={() => handleScoreSave(false)}
                      className="h-9 px-4 rounded-full text-[13px] font-medium text-white transition-colors"
                      style={{ backgroundColor: "#145F33" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#0e4524")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#145F33")
                      }
                    >
                      Save Changes
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleScoreSave(false)}
                        className="h-9 px-4 rounded-full text-[13px] font-medium transition-colors"
                        style={{
                          border: "1.5px solid #145F33",
                          color: "#145F33",
                          backgroundColor: "transparent",
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleScoreSave(true)}
                        className="h-9 px-4 rounded-full text-[13px] font-medium text-white transition-colors"
                        style={{ backgroundColor: "#145F33" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#0e4524")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#145F33")
                        }
                      >
                        Save &amp; Close
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}