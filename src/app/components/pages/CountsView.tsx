import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { toast } from "sonner@2.0.3";
import { countStore } from "../../shared/countStore";
import { formatMdy } from "../../lib/dateFormat";
import { getDemoUserName } from "../../lib/demoIdentity";

// ── Types ──────────────────────────────────────────────────────────────────────

type CountType = "Units" | "Volume";
type DosePeriod =
  "Morning" | "Afternoon" | "Evening" | "Bedtime";

const VOLUME_OPTIONS = [
  "Full",
  "3/4",
  "1/2",
  "1/4",
  "Empty",
] as const;

interface CountMedication {
  id: number;
  dosePeriod: DosePeriod;
  medication: string;
  dose: string;
  countType: CountType;
  /** Last committed count — "0" when no prior log exists (AC5) */
  lastCount: string;
}

interface CountLogRecord {
  id: number;
  logType: "Count";
  date: string;
  medicationId: number;
  medication: string;
  dose: string;
  dosePeriod: DosePeriod;
  countType: CountType;
  quantity: string;
  comment: string;
  attestationDate: string;
  attestationText: string;
  attestationStaff: string;
}

interface CountAttestationRecord {
  id: number;
  date: string;
  attestationDate: string;
  attestationText: string;
  attestationStaff: string;
  recordCount: number;
}

interface CountRow extends CountMedication {
  currentCount: string;
  comment: string;
}

// ── Mock data — Prescription + Supplemental OTC only (AC1, AC2) ──────────────

const MOCK_MEDS: CountMedication[] = [
  {
    id: 1,
    dosePeriod: "Morning",
    medication: "Adderall XR",
    dose: "20mg",
    countType: "Units",
    lastCount: "14",
  },
  {
    id: 2,
    dosePeriod: "Morning",
    medication: "Prozac",
    dose: "20mg",
    countType: "Units",
    lastCount: "28",
  },
  {
    id: 3,
    dosePeriod: "Morning",
    medication: "Melatonin (Supp.)",
    dose: "5mg",
    countType: "Units",
    lastCount: "0",
  },
  {
    id: 4,
    dosePeriod: "Afternoon",
    medication: "Ritalin",
    dose: "10mg",
    countType: "Units",
    lastCount: "7",
  },
  {
    id: 5,
    dosePeriod: "Afternoon",
    medication: "Amoxicillin Susp.",
    dose: "250mg/5ml",
    countType: "Volume",
    lastCount: "0",
  },
  {
    id: 6,
    dosePeriod: "Evening",
    medication: "Concerta",
    dose: "27mg",
    countType: "Units",
    lastCount: "3",
  },
  {
    id: 7,
    dosePeriod: "Evening",
    medication: "Zoloft",
    dose: "50mg",
    countType: "Units",
    lastCount: "21",
  },
  {
    id: 8,
    dosePeriod: "Evening",
    medication: "Ibuprofen Susp.",
    dose: "100mg/5ml",
    countType: "Volume",
    lastCount: "0",
  },
  {
    id: 9,
    dosePeriod: "Bedtime",
    medication: "Clonidine",
    dose: "0.1mg",
    countType: "Units",
    lastCount: "12",
  },
  {
    id: 10,
    dosePeriod: "Bedtime",
    medication: "Risperidone",
    dose: "0.5mg",
    countType: "Units",
    lastCount: "0",
  },
];

const ATTESTATION_TEXT =
  "I attest that I have followed the policies and procedure of Medicine Dispensation & Documentation.";

const DOSE_PERIOD_ORDER: Record<DosePeriod, number> = {
  Morning: 0,
  Afternoon: 1,
  Evening: 2,
  Bedtime: 3,
};

type SortField =
  "dosePeriod" | "medication" | "countType" | "lastCount";

// countStore scope for this screen's own MOCK_MEDS (program-level sample
// list, not any youth's inventory) — its ids never mix with other scopes.
const COUNT_SCOPE = "medications-count-page-fixture";

let _logId = 200;
let _attestId = 1000;

function getTodayDate() {
  return formatMdy(new Date());
}

// ── Component ──────────────────────────────────────────────────────────────────

export function CountsView() {
  const today = getTodayDate();

  const initialRows = useCallback(
    () =>
      MOCK_MEDS.map((m) => {
        // AC11, AC12: seed Last Count from countStore (entries from SYD)
        const stored = countStore.getLatest(
          COUNT_SCOPE,
          m.id,
          m.dosePeriod,
          today,
        );
        return {
          ...m,
          lastCount: stored ? stored.quantity : m.lastCount,
          currentCount: "",
          comment: "",
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [rows, setRows] = useState<CountRow[]>(initialRows);
  const [savedRows, setSavedRows] =
    useState<CountRow[]>(initialRows);
  const [countLogs, setCountLogs] = useState<CountLogRecord[]>([]);
  const [attestations, setAttestations] = useState<CountAttestationRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = useRef(false);
  const [submitError, setSubmitError] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(
    null,
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(
    null,
  );

  const hasChanges = useMemo(
    () =>
      rows.some(
        (r) =>
          r.currentCount.trim() !== "" ||
          r.comment.trim() !== "",
      ),
    [rows],
  );

  // AC21: warn on browser close/refresh when unsaved changes exist
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () =>
      window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);

  // AC11, AC12: Re-sync Last Count when countStore updates (e.g. SYD submitted a count)
  useEffect(() => {
    const unsubscribe = countStore.subscribe(() => {
      setRows((prev) =>
        prev.map((r) => {
          const stored = countStore.getLatest(
            COUNT_SCOPE,
            r.id,
            r.dosePeriod,
            today,
          );
          if (!stored) return r;
          // Only update lastCount (non-editable); preserve pending edits
          return { ...r, lastCount: stored.quantity };
        }),
      );
    });
    return unsubscribe;
  }, [today]);

  // ── Sorting ─────────────────────────────────────────────────────────────────

  const sorted = useMemo(() => {
    if (!sortField || !sortDir) return rows;
    return [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortField === "dosePeriod") {
        cmp =
          DOSE_PERIOD_ORDER[a.dosePeriod] -
          DOSE_PERIOD_ORDER[b.dosePeriod];
      } else if (sortField === "lastCount") {
        cmp =
          parseFloat(a.lastCount || "0") -
          parseFloat(b.lastCount || "0");
      } else {
        cmp = String(a[sortField]).localeCompare(
          String(b[sortField]),
        );
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortField, sortDir]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleSort(field: SortField) {
    if (sortField !== field) {
      setSortField(field);
      setSortDir("asc");
      return;
    }
    if (sortDir === "asc") {
      setSortDir("desc");
      return;
    }
    setSortField(null);
    setSortDir(null);
  }

  function updateRow(
    id: number,
    patch: Partial<Pick<CountRow, "currentCount" | "comment">>,
  ) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  }

  function handleSubmit() {
    if (submitLock.current) return;
    const updated = rows.filter(
      (r) =>
        r.currentCount.trim() !== "" || r.comment.trim() !== "",
    );
    if (!updated.length) {
      setSubmitError("Enter a count or comment before submitting.");
      return;
    }
    submitLock.current = true;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const now = new Date();
      const dateFmt = formatMdy(now);
      const timeFmt = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const stamp = `${dateFmt} ${timeFmt}`;
      const isoStamp = now.toISOString(); // for store ordering
      const actingUser = getDemoUserName();

      // AC17: One immutable Count log record per updated row
      const newLogs: CountLogRecord[] = updated.map((r) => ({
        id: ++_logId,
        logType: "Count",
        date: dateFmt,
        medicationId: r.id,
        medication: r.medication,
        dose: r.dose,
        dosePeriod: r.dosePeriod,
        countType: r.countType,
        quantity: r.currentCount,
        comment: r.comment,
        attestationDate: stamp,
        attestationText: ATTESTATION_TEXT,
        attestationStaff: actingUser,
      }));

      // AC18: One immutable Attestation record for the entire submission
      const attestation: CountAttestationRecord = {
        id: ++_attestId,
        date: dateFmt,
        attestationDate: stamp,
        attestationText: ATTESTATION_TEXT,
        attestationStaff: actingUser,
        recordCount: updated.length,
      };

      // AC10, AC12: Push counts to shared store so SYD can read them
      updated.forEach((r) => {
        if (r.currentCount.trim()) {
          countStore.upsert({
            scope: COUNT_SCOPE,
            date: dateFmt,
            dosePeriod: r.dosePeriod,
            medicationId: r.id,
            medication: r.medication,
            dose: r.dose,
            countType: r.countType,
            quantity: r.currentCount,
            attestationDate: isoStamp,
            source: "CountPage",
          });
        }
      });

      // Commit: update lastCount, clear editable fields
      const committed = rows.map((r) => ({
        ...r,
        lastCount:
          r.currentCount.trim() !== ""
            ? r.currentCount
            : r.lastCount,
        currentCount: "",
        comment: "",
      }));

      setRows(committed);
      setSavedRows(committed);
      setCountLogs((prev) => [...newLogs, ...prev]);
      setAttestations((prev) => [attestation, ...prev]);

      toast.success(
        `${updated.length} record${updated.length !== 1 ? "s" : ""} successfully updated.`,
      );
    } catch {
      // Entered values stay in the table so the user can retry.
      setSubmitError("Counts could not be saved. Your entries were kept; please try again.");
      toast.error("Counts could not be saved.");
    } finally {
      setTimeout(() => { submitLock.current = false; }, 400);
      setIsSubmitting(false);
    }
  }

  // AC20: Cancel — reset to last saved state
  function handleCancel() {
    setRows(savedRows);
    setSubmitError("");
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field)
      return (
        <ChevronsUpDown className="w-3 h-3 ml-1 opacity-40" />
      );
    return sortDir === "asc" ? (
      <ChevronUp
        className="w-3 h-3 ml-1"
        style={{ color: "#145F33" }}
      />
    ) : (
      <ChevronDown
        className="w-3 h-3 ml-1"
        style={{ color: "#145F33" }}
      />
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-2.5 flex-shrink-0"
        style={{
          backgroundColor: "var(--slds-g-color-background-alt)",
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <div className="flex items-center gap-2">
          {/* AC9: date is always today — read-only, no picker */}
          <span
            className="slds-text-3"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Date
          </span>
          <span
            className="slds-text-4 font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            {today}
          </span>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full slds-text-3 font-semibold ml-1"
            style={{
              backgroundColor: "#F0FDF4",
              color: "#14532D",
              border: "1px solid #86EFAC",
            }}
          >
            Today
          </span>
        </div>
        <span
          className="slds-text-3"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          {rows.length} medication{rows.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      {/* AC8: sortable by column header */}
      <div className="flex-1 overflow-auto">
        <table
          className="w-full"
          style={{
            borderCollapse: "collapse",
            minWidth: "900px",
          }}
        >
          <thead
            style={{ position: "sticky", top: 0, zIndex: 10 }}
          >
            <tr
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
                borderBottom:
                  "2px solid var(--slds-g-color-border-base-1)",
              }}
            >
              {(
                [
                  {
                    key: "dosePeriod" as SortField,
                    label: "Dose Period",
                    width: "140px",
                  },
                  {
                    key: "medication" as SortField,
                    label: "Medication / Dose",
                    width: "230px",
                  },
                  {
                    key: "countType" as SortField,
                    label: "Count Type",
                    width: "120px",
                  },
                  {
                    key: "lastCount" as SortField,
                    label: "Last Count",
                    width: "120px",
                  },
                ] as const
              ).map(({ key, label, width }) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left cursor-pointer select-none"
                  style={{
                    width,
                    color: "var(--slds-g-color-text-weak)",
                  }}
                  onClick={() => handleSort(key)}
                  aria-sort={
                    sortField === key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <div className="flex items-center text-[11px] font-semibold uppercase tracking-wider">
                    {label}
                    <SortIcon field={key} />
                  </div>
                </th>
              ))}
              {/* AC17: Current Count — editable (AC3: other cols non-editable) */}
              <th
                className="px-4 py-3 text-left"
                style={{
                  minWidth: "160px",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Current Count
                </span>
              </th>
              <th
                className="px-4 py-3 text-left"
                style={{
                  minWidth: "220px",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Comments
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-16 text-center"
                >
                  <p
                    className="slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    No medications to count.
                  </p>
                </td>
              </tr>
            ) : (
              sorted.map((row) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      row.currentCount || row.comment
                        ? "#F0FDF4"
                        : "var(--slds-g-color-background-base)",
                  }}
                >
                  {/* AC3: Dose Period — non-editable */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full slds-text-3 font-semibold whitespace-nowrap"
                      style={{
                        backgroundColor:
                          row.dosePeriod === "Morning"
                            ? "#FEF3C7"
                            : row.dosePeriod === "Afternoon"
                              ? "#ECFDF5"
                              : row.dosePeriod === "Evening"
                                ? "#EFF6FF"
                                : "#F5F3FF",
                        color:
                          row.dosePeriod === "Morning"
                            ? "#92400E"
                            : row.dosePeriod === "Afternoon"
                              ? "#065F46"
                              : row.dosePeriod === "Evening"
                                ? "#1D4ED8"
                                : "#5B21B6",
                        border:
                          row.dosePeriod === "Morning"
                            ? "1px solid #FCD34D"
                            : row.dosePeriod === "Afternoon"
                              ? "1px solid #6EE7B7"
                              : row.dosePeriod === "Evening"
                                ? "1px solid #BFDBFE"
                                : "1px solid #DDD6FE",
                      }}
                    >
                      {row.dosePeriod}
                    </span>
                  </td>

                  {/* AC3, AC4: Medication / Dose — concatenated, non-editable */}
                  <td className="px-4 py-3">
                    <p
                      className="slds-text-4 font-medium mb-0"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {row.medication}
                    </p>
                    <p
                      className="slds-text-3 mb-0"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {row.dose}
                    </p>
                  </td>

                  {/* AC3: Count Type — non-editable */}
                  <td
                    className="px-4 py-3 slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {row.countType}
                  </td>

                  {/* AC3, AC5: Last Count — non-editable; "—" when zero */}
                  <td className="px-4 py-3 slds-text-4 font-medium">
                    {row.lastCount === "0" ? (
                      <span
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        —
                      </span>
                    ) : (
                      <span
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {row.lastCount}
                      </span>
                    )}
                  </td>

                  {/* AC6: Units → numeric 999.99 | AC7: Volume → picklist */}
                  <td className="px-4 py-3">
                    {row.countType === "Units" ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.currentCount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (
                            val === "" ||
                            /^\d{0,3}(\.\d{0,2})?$/.test(val)
                          ) {
                            updateRow(row.id, {
                              currentCount: val,
                            });
                          }
                        }}
                        placeholder="0.00"
                        className="h-8 w-28 px-2.5 rounded slds-text-4 outline-none"
                        style={{
                          border: row.currentCount
                            ? "1px solid #145F33"
                            : "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                        aria-label={`Current count for ${row.medication} ${row.dose}`}
                      />
                    ) : (
                      <select
                        value={row.currentCount}
                        onChange={(e) =>
                          updateRow(row.id, {
                            currentCount: e.target.value,
                          })
                        }
                        className="h-8 px-2.5 rounded slds-text-4"
                        style={{
                          border: row.currentCount
                            ? "1px solid #145F33"
                            : "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          color: row.currentCount
                            ? "var(--slds-g-color-text-default)"
                            : "var(--slds-g-color-text-weak)",
                          minWidth: "110px",
                        }}
                        aria-label={`Current count for ${row.medication} ${row.dose}`}
                      >
                        <option value="">Select…</option>
                        {VOLUME_OPTIONS.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* Comments — editable, open text */}
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={row.comment}
                      onChange={(e) =>
                        updateRow(row.id, {
                          comment: e.target.value,
                        })
                      }
                      placeholder="Add comment… (optional)"
                      className="w-full h-8 px-2.5 rounded slds-text-4 outline-none"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                      aria-label={`Comment for ${row.medication} ${row.dose}`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {countLogs.length > 0 && (
        <div
          className="flex-shrink-0 overflow-auto"
          role="region"
          aria-label="Count log"
          style={{
            maxHeight: "180px",
            borderTop: "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor: "var(--slds-g-color-background-base)",
          }}
        >
          <div className="px-6 py-2 flex items-center gap-2">
            <span className="slds-text-4 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              Count log ({countLogs.length})
            </span>
            <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
              Read-only entries from this session · {attestations.length} attestation{attestations.length !== 1 ? "s" : ""} recorded
            </span>
          </div>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--slds-g-color-background-alt)" }}>
                {["Medication", "Dose period", "Count", "Comment", "Attested by", "Attested at"].map((h) => (
                  <th key={h} className="px-4 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--slds-g-color-text-weak)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {countLogs.map((l) => (
                <tr key={l.id} style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                  <td className="px-4 py-1.5 slds-text-3">{l.medication} {l.dose}</td>
                  <td className="px-4 py-1.5 slds-text-3">{l.dosePeriod}</td>
                  <td className="px-4 py-1.5 slds-text-3">{l.quantity || "—"}</td>
                  <td className="px-4 py-1.5 slds-text-3">{l.comment || "—"}</td>
                  <td className="px-4 py-1.5 slds-text-3">{l.attestationStaff}</td>
                  <td className="px-4 py-1.5 slds-text-3">{l.attestationDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Attestation + Submit Bar ──────────────────────────────────────────── */}
      {/* AC15, AC16: right-aligned italic text adjacent to Submit; no modal; matches SYD layout */}
      <div
        className="flex items-center justify-end gap-3 px-6 py-3 flex-shrink-0"
        style={{
          backgroundColor: "var(--slds-g-color-background-alt)",
          borderTop:
            "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        {submitError && (
          <p role="alert" className="slds-text-3 font-medium mb-0" style={{ color: "#c23934" }}>
            {submitError}
          </p>
        )}
        <p
          className="slds-text-3 italic mb-0"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          {ATTESTATION_TEXT}
        </p>
        {/* AC14: Cancel active only after user begins entering data */}
        <Button
          onClick={handleCancel}
          disabled={!hasChanges}
          className="h-8 rounded-full px-5 slds-text-4 font-semibold flex-shrink-0"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            color: hasChanges
              ? "var(--slds-g-color-text-default)"
              : "var(--slds-g-color-text-weak)",
            border:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          Cancel
        </Button>
        {/* AC14: Submit active only after user begins entering data */}
        <Button
          onClick={handleSubmit}
          disabled={!hasChanges || isSubmitting}
          aria-busy={isSubmitting}
          className="h-8 rounded-full px-5 slds-text-4 font-semibold flex-shrink-0"
          style={{
            backgroundColor: hasChanges
              ? "#145F33"
              : "var(--slds-g-color-neutral-95)",
            color: hasChanges
              ? "white"
              : "var(--slds-g-color-text-weak)",
            border: "none",
          }}
        >
          {isSubmitting ? "Submitting…" : "Submit"}
        </Button>
      </div>
    </div>
  );
}