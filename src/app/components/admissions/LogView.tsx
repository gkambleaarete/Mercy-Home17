import { useState, useMemo } from "react";
import { Eye, FileText, X } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  type AttestationRecord,
  type ColumnFilter,
  type LogEntry,
  type SortDir,
  type ViewMode,
  COMMENTS_COLS,
  COUNTS_COLS,
  GENERAL_COLS,
  logTypeBadge,
  LogDetailDialog,
  LogGridTable,
  columnValuesFor,
  matchesColumnFilters,
  timeOf,
  toISO,
  toLogEntry,
} from "../medications/medicationLogGrid";
import { EmptyState } from "../ui/empty-state";
import { AlertCircle } from "@/app/lib/lucide-icons";
import {
  getAttestationsForYouth,
  getLogsForYouth,
  useMedicationLogState,
} from "../../data/medicationLogStore";
import { formatMdy } from "../../lib/dateFormat";

// ── Component ─────────────────────────────────────────────────────────────────

export function LogView({
  youthId,
}: {
  youthId: string | null;
}) {
  const logState = useMedicationLogState();
  const { BASE_ENTRIES, YOUTH_ATTESTATIONS } = useMemo(() => {
    if (!youthId)
      return {
        BASE_ENTRIES: [] as LogEntry[],
        YOUTH_ATTESTATIONS: [] as AttestationRecord[],
      };
    const atts = getAttestationsForYouth(logState, youthId);
    const byId = new Map(atts.map((a) => [a.id, a]));
    const logs = getLogsForYouth(logState, youthId);
    const numberOf = new Map(
      logs.map((l) => [l.id, l.recordNumber]),
    );
    const entries = logs
      .map((l) => toLogEntry(l, byId.get(l.attestationId)))
      .sort(
        (a, b) =>
          toISO(b.doseDate).localeCompare(toISO(a.doseDate)) ||
          b.id - a.id,
      );
    const rows: AttestationRecord[] = atts
      .map((a) => ({
        id: a.id,
        date: formatMdy(a.attestedAt),
        time: timeOf(a.attestedAt),
        logType: a.logType,
        staff: a.staff,
        logEntryIds: a.logIds
          .map((id) => numberOf.get(id))
          .filter((n): n is number => n != null),
        at: a.attestedAt,
      }))
      .sort((a, b) => b.at.localeCompare(a.at));
    return { BASE_ENTRIES: entries, YOUTH_ATTESTATIONS: rows };
  }, [logState, youthId]);
  const [view, setView] = useState<ViewMode>("general");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    new Set(),
  );
  const [sortField, setSortField] = useState<string | null>(
    null,
  );
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [columnFilters, setColumnFilters] = useState<
    Record<string, ColumnFilter>
  >({});
  const [viewModalEntry, setViewModalEntry] =
    useState<LogEntry | null>(null);
  const [attestModalOpen, setAttestModalOpen] = useState(false);

  const columns =
    view === "general"
      ? GENERAL_COLS
      : view === "counts"
        ? COUNTS_COLS
        : COMMENTS_COLS;

  // AC9: unique values per column for value-select, including "(Blank)" when applicable
  const columnValues = useMemo(
    () => columnValuesFor(BASE_ENTRIES, columns),
    [columns, BASE_ENTRIES],
  );

  // Filter entries — handles value-select "(Blank)" sentinel and "custom" text op
  const filteredEntries = useMemo(
    () =>
      BASE_ENTRIES.filter((entry) =>
        matchesColumnFilters(entry, columnFilters),
      ),
    [columnFilters, BASE_ENTRIES],
  );

  const sortedEntries = useMemo(() => {
    if (!sortField) return filteredEntries;
    return [...filteredEntries].sort((a, b) => {
      const av = String(
        (a as Record<string, unknown>)[sortField] ?? "",
      );
      const bv = String(
        (b as Record<string, unknown>)[sortField] ?? "",
      );
      let cmp = 0;
      if (
        sortField === "doseDate" ||
        sortField === "attestationDate"
      ) {
        cmp = toISO(av).localeCompare(toISO(bv));
      } else if (sortField === "seq") {
        cmp = Number(av) - Number(bv);
      } else {
        cmp = av.localeCompare(bv);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredEntries, sortField, sortDir]);

  const allVisibleIds = sortedEntries.map((e) => e.id);
  const allSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.has(id));
  const someSelected =
    allVisibleIds.some((id) => selectedIds.has(id)) &&
    !allSelected;

  function toggleSelectAll() {
    setSelectedIds(
      allSelected ? new Set() : new Set(allVisibleIds),
    );
  }
  function toggleRow(id: number) {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function handleSort(key: string) {
    if (sortField === key) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortField(null);
        setSortDir("desc");
      }
    } else {
      setSortField(key);
      setSortDir("asc");
    }
  }

  const attestationsToShow = useMemo(() => {
    if (selectedIds.size === 0) return YOUTH_ATTESTATIONS;
    return YOUTH_ATTESTATIONS.filter((a) =>
      a.logEntryIds.some((lid) => selectedIds.has(lid)),
    );
  }, [selectedIds, YOUTH_ATTESTATIONS]);

  const activeFilterCount = Object.keys(columnFilters).length;

  // ── Render ──────────────────────────────────────────────────────────────────

  if (!youthId) {
    return (
      <EmptyState
        icon={AlertCircle}
        tone="warning"
        title="Medication Log unavailable"
        description="This profile isn't linked to a Youth Constituent, so no medication logs can be shown here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <label
            className="slds-text-3 font-semibold whitespace-nowrap"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            View:
          </label>
          <select
            value={view}
            onChange={(e) => {
              setView(e.target.value as ViewMode);
              setColumnFilters({});
              setSortField(null);
              setSortDir("desc");
            }}
            className="h-8 px-2 rounded slds-text-4"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
              color: "var(--slds-g-color-text-default)",
              minWidth: "130px",
            }}
            aria-label="View filter"
          >
            <option value="general">General</option>
            <option value="counts">Counts</option>
            <option value="comments">Comments</option>
          </select>
          {activeFilterCount > 0 && (
            <button
              onClick={() => setColumnFilters({})}
              className="h-8 px-3 rounded-full slds-text-3 flex items-center gap-1.5"
              style={{
                backgroundColor: "#FEF3C7",
                color: "#92400E",
                border: "1px solid #FCD34D",
                cursor: "pointer",
              }}
            >
              <X className="h-3 w-3" />
              Clear {activeFilterCount} filter
              {activeFilterCount !== 1 ? "s" : ""}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              if (selectedIds.size === 1) {
                const entry = sortedEntries.find((e) =>
                  selectedIds.has(e.id),
                );
                if (entry) setViewModalEntry(entry);
              }
            }}
            disabled={selectedIds.size !== 1}
            className="h-8 rounded-full px-4 slds-text-4 font-semibold flex items-center gap-1.5"
            style={{
              backgroundColor:
                selectedIds.size === 1
                  ? "#145F33"
                  : "var(--slds-g-color-neutral-95)",
              color:
                selectedIds.size === 1
                  ? "white"
                  : "var(--slds-g-color-text-weak)",
              border: "none",
            }}
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
          <Button
            onClick={() => setAttestModalOpen(true)}
            className="h-8 rounded-full px-4 slds-text-4 font-semibold flex items-center gap-1.5"
            style={{
              backgroundColor:
                "var(--slds-g-color-background-base)",
              color: "var(--slds-g-color-text-default)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <FileText className="h-3.5 w-3.5" />
            Attestation
          </Button>
        </div>
      </div>

      {/* ── Grid ── */}
      <LogGridTable
        columns={columns}
        rows={sortedEntries}
        columnValues={columnValues}
        columnFilters={columnFilters}
        onFilterChange={(key, f) =>
          setColumnFilters((prev) => {
            const n = { ...prev };
            if (f) n[key] = f;
            else delete n[key];
            return n;
          })
        }
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        selectedIds={selectedIds}
        allSelected={allSelected}
        someSelected={someSelected}
        onToggleAll={toggleSelectAll}
        onToggleRow={toggleRow}
        onOpen={setViewModalEntry}
      />

      {/* ── Record count ── */}
      <div className="mt-2">
        <p
          className="slds-text-3"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          {sortedEntries.length} record
          {sortedEntries.length !== 1 ? "s" : ""}
          {selectedIds.size > 0 &&
            ` · ${selectedIds.size} selected`}
          {activeFilterCount > 0 &&
            ` · ${activeFilterCount} filter${activeFilterCount !== 1 ? "s" : ""} active`}
        </p>
      </div>

      {/* ── View Modal (AC11–AC16) ── */}
      <LogDetailDialog
        entry={viewModalEntry}
        onClose={() => setViewModalEntry(null)}
      />

      {/* ── Attestation Modal (AC18–AC22) ── */}
      <Dialog
        open={attestModalOpen}
        onOpenChange={(open) => {
          if (!open) setAttestModalOpen(false);
        }}
      >
        <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] max-h-[80vh] overflow-y-auto">
          <DialogHeader
            className="pb-3"
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
              Attestations
            </DialogTitle>
            <p
              className="slds-text-3 mt-0.5"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {selectedIds.size > 0
                ? `Showing attestations for ${selectedIds.size} selected record${selectedIds.size !== 1 ? "s" : ""}`
                : "Showing all attestations for this youth"}
            </p>
          </DialogHeader>
          <DialogDescription className="sr-only">
            Attestation records for this youth's medication log
            entries.
          </DialogDescription>

          <div className="py-3">
            {attestationsToShow.length === 0 ? (
              <p
                className="slds-text-4 text-center py-8"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                No attestations found for the selected records.
              </p>
            ) : (
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
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
                    {/* AC20: Attestation Date, Time, Type, Staff */}
                    {[
                      "Attestation Date",
                      "Time",
                      "Type",
                      "Staff",
                    ].map((h) => (
                      <th
                        key={h}
                        className="slds-text-3 font-semibold"
                        style={{
                          padding: "8px",
                          textAlign: "left",
                          color:
                            "var(--slds-g-color-text-weak)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attestationsToShow.map((a, idx) => (
                    <tr
                      key={a.id}
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          idx % 2 === 0
                            ? "var(--slds-g-color-background-base)"
                            : "var(--slds-g-color-background-alt)",
                      }}
                    >
                      <td
                        className="slds-text-4"
                        style={{
                          padding: "8px",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {a.date}
                      </td>
                      <td
                        className="slds-text-4"
                        style={{
                          padding: "8px",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {a.time}
                      </td>
                      <td
                        className="slds-text-4"
                        style={{
                          padding: "8px",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        <span
                          className="inline-flex px-2 py-0.5 rounded-full slds-text-3 font-semibold"
                          style={{
                            backgroundColor: logTypeBadge(
                              a.logType,
                            ).bg,
                            color: logTypeBadge(a.logType)
                              .color,
                            border: `1px solid ${logTypeBadge(a.logType).border}`,
                          }}
                        >
                          {a.logType}
                        </span>
                      </td>
                      <td
                        className="slds-text-4"
                        style={{
                          padding: "8px",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {a.staff}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}