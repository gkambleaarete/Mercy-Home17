import { useState, useEffect } from "react";
import { ArrowUpDown } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner@2.0.3";
import { AlertCircle } from "@/app/lib/lucide-icons";
import { EmptyState } from "../ui/empty-state";
import {
  countValueLabel,
  formatUnitsInput,
  getLatestCount,
  submitCounts,
  useMedicationLogState,
} from "../../data/medicationLogStore";
import { getAssignmentsForYouth } from "../../data/youthMedicationAssignments";
import { getCurrentProgramIdForYouth } from "../../data/mockYouthProgramData";
import {
  can,
  getMedicationLogAccess,
  useMedicationLogAccessVersion,
} from "../../data/medicationLogAccess";
import { getDemoUserName } from "../../lib/demoIdentity";

interface MedicationCountRow {
  id: string;
  dosePeriod: string;
  medicationName: string;
  dose: string;
  countType: "Units" | "Volume";
  lastCount: string;
  currentCount: string;
  comments: string;
  medicationId: string;
  hasChanges: boolean;
}

type SortField =
  "dosePeriod" | "medicationName" | "countType" | "lastCount";
type SortDirection = "asc" | "desc";

const VOLUME_OPTIONS = ["Full", "3/4", "1/2", "1/4", "Empty"];

// Admissions → Health Overview → Medication → Count (US 20102, Chunk 1).
// Rows are the resolved youth's own medication assignments; Last Count is
// the latest committed Count log for that assignment + dose period; Submit
// writes Count logs + one shared Attestation through the medication log
// repository in one commit. Without a resolved youth (or an active Program)
// nothing is shown and nothing can be saved.
export function CountView({
  youthId,
}: {
  youthId: string | null;
}) {
  // Get current date
  const getCurrentDate = () => {
    const today = new Date();
    return `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${today.getFullYear()}`;
  };

  const currentDate = getCurrentDate();

  // Sorting state
  const [sortField, setSortField] =
    useState<SortField>("dosePeriod");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  // Drafts by youth medication record id — only touched rows are submitted.
  const [drafts, setDrafts] = useState<
    Record<string, { currentCount: string; comments: string }>
  >({});
  const [rowErrors, setRowErrors] = useState<
    Record<string, string>
  >({});
  const hasUnsavedChanges = Object.keys(drafts).length > 0;

  const logState = useMedicationLogState();
  // UI reflects the count permission; the shared service enforces it too.
  useMedicationLogAccessVersion();
  const canSubmitCount = can(
    getMedicationLogAccess(),
    "submitCount",
  );
  const programId = youthId
    ? getCurrentProgramIdForYouth(youthId)
    : null;
  const medications: MedicationCountRow[] = youthId
    ? getAssignmentsForYouth(youthId).map((a) => {
        const latest = getLatestCount(
          logState,
          youthId,
          a.id,
          a.dosePeriod,
        );
        const d = drafts[a.id];
        return {
          id: a.id,
          dosePeriod: a.dosePeriod,
          medicationName: a.medicationName,
          dose: a.dose,
          countType: a.countType,
          lastCount: latest ? countValueLabel(latest) : "",
          currentCount: d?.currentCount ?? "",
          comments: d?.comments ?? "",
          medicationId: a.id,
          hasChanges: !!d,
        };
      })
    : [];

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === "asc" ? "desc" : "asc",
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort medications
  const sortedMedications = [...medications].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Convert to numbers for lastCount comparison
    if (sortField === "lastCount") {
      const aNum = parseFloat(aValue) || 0;
      const bNum = parseFloat(bValue) || 0;
      return sortDirection === "asc"
        ? aNum - bNum
        : bNum - aNum;
    }

    // String comparison
    if (
      typeof aValue === "string" &&
      typeof bValue === "string"
    ) {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  // Update medication field
  const updateMedication = (
    id: string,
    field: "currentCount" | "comments",
    value: string,
  ) => {
    setDrafts((prev) => {
      const cur = prev[id] ?? {
        currentCount: "",
        comments: "",
      };
      const next = { ...cur, [field]: value };
      const out = { ...prev, [id]: next };
      // A row cleared back to empty is untouched again.
      if (!next.currentCount && !next.comments) delete out[id];
      return out;
    });
    setRowErrors((prev) => {
      if (!prev[id]) return prev;
      const out = { ...prev };
      delete out[id];
      return out;
    });
  };

  // Handle current count change
  const handleCurrentCountChange = (
    id: string,
    value: string,
    countType: "Units" | "Volume",
  ) => {
    if (countType === "Units") {
      const formatted = formatUnitsInput(value);
      updateMedication(id, "currentCount", formatted);
    } else {
      updateMedication(id, "currentCount", value);
    }
  };

  // Handle submit — validate everything, then one repository commit.
  const handleSubmit = () => {
    if (!youthId || programId === null) return;
    const result = submitCounts({
      youthId,
      programId,
      staff: getDemoUserName(),
      rows: Object.entries(drafts).map(
        ([youthMedicationId, d]) => ({
          youthMedicationId,
          currentCount: d.currentCount,
          comment: d.comments,
        }),
      ),
    });
    if (!result.ok) {
      // Entered values stay; nothing was written.
      setRowErrors(result.rowErrors);
      toast.error(result.error);
      return;
    }
    setDrafts({});
    setRowErrors({});
    toast.success("Count records submitted successfully");
  };

  // Handle cancel — discard drafts; nothing is written.
  const handleCancel = () => {
    setDrafts({});
    setRowErrors({});
  };

  // Warn on navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload,
      );
  }, [hasUnsavedChanges]);

  // Check if submit should be enabled
  const isSubmitEnabled = medications.some(
    (med) => med.hasChanges,
  );

  if (!canSubmitCount) {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertCircle}
          tone="warning"
          title="Medication Count unavailable"
          description="You don't have permission to record medication counts."
        />
      </div>
    );
  }

  if (!youthId || programId === null) {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertCircle}
          tone="warning"
          title="Medication Count unavailable"
          description={
            !youthId
              ? "This profile isn't linked to a Youth Constituent, so no medications can be counted here."
              : "This youth has no active Program enrollment, so counts can't be recorded."
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Current Date Display */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <h3
            className="slds-text-6 font-semibold mb-0"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Medication Count
          </h3>
          <p
            className="text-[11px]"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Current Date: {currentDate}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div
          className="rounded-lg overflow-hidden m-4"
          style={{
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-base)",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          }}
        >
          <div className="overflow-x-auto">
            <table
              className="w-full"
              style={{ borderCollapse: "collapse" }}
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
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                    onClick={() => handleSort("dosePeriod")}
                  >
                    <div className="flex items-center gap-2">
                      Dose Period
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer  transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                    onClick={() => handleSort("medicationName")}
                  >
                    <div className="flex items-center gap-2">
                      Medication / Dose
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider cursor-pointer  transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                    onClick={() => handleSort("countType")}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Count Type
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider cursor-pointer  transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                    onClick={() => handleSort("lastCount")}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Last Count
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Current Count
                  </th>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Comments
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedMedications.map((med) => (
                  <tr
                    key={med.id}
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <td
                      className="px-3 py-2.5 slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {med.dosePeriod}
                    </td>
                    <td
                      className="px-3 py-2.5 slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      <div className="font-medium">
                        {med.medicationName}
                      </div>
                      <div
                        className="text-[11px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {med.dose}
                      </div>
                    </td>
                    <td
                      className="px-3 py-2.5 text-center slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {med.countType}
                    </td>
                    <td
                      className="px-3 py-2.5 text-center slds-text-4 font-medium"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {med.lastCount || "0"}
                    </td>
                    <td className="px-3 py-2.5 text-center align-top">
                      {med.countType === "Units" ? (
                        <Input
                          type="text"
                          value={med.currentCount}
                          onChange={(e) =>
                            handleCurrentCountChange(
                              med.id,
                              e.target.value,
                              med.countType,
                            )
                          }
                          aria-invalid={!!rowErrors[med.id]}
                          className="h-8 w-24 text-center slds-text-4"
                          placeholder="-"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        />
                      ) : (
                        <Select
                          value={med.currentCount}
                          onValueChange={(value) =>
                            updateMedication(
                              med.id,
                              "currentCount",
                              value,
                            )
                          }
                        >
                          <SelectTrigger
                            aria-invalid={!!rowErrors[med.id]}
                            className="h-8 w-28 slds-text-4"
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                            }}
                          >
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            {VOLUME_OPTIONS.map((option) => (
                              <SelectItem
                                key={option}
                                value={option}
                              >
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {rowErrors[med.id] && (
                        <p
                          role="alert"
                          className="slds-text-3 mt-1 text-[#c23934]"
                        >
                          {rowErrors[med.id]}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <Input
                        type="text"
                        value={med.comments}
                        onChange={(e) =>
                          updateMedication(
                            med.id,
                            "comments",
                            e.target.value,
                          )
                        }
                        className="h-8 slds-text-4"
                        placeholder="Enter comments"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer with Attestation and Actions */}
      <div className="px-4 py-3 flex items-center justify-end gap-3">
        <p
          className="slds-text-3 italic"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          I attest that I have followed the policies and
          procedure of Medicine Dispensation & Documentation
        </p>
        <Button
          onClick={handleCancel}
          disabled={!isSubmitEnabled}
          className="h-8 px-6 rounded-full slds-text-4 font-medium"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            color: isSubmitEnabled
              ? "var(--slds-g-color-text-default)"
              : "var(--slds-g-color-text-weak)",
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            opacity: isSubmitEnabled ? 1 : 0.5,
            cursor: isSubmitEnabled ? "pointer" : "not-allowed",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isSubmitEnabled}
          className="h-8 px-6 rounded-full slds-text-4 font-semibold text-white"
          style={{
            backgroundColor: "#145F33",
            opacity: isSubmitEnabled ? 1 : 0.5,
            cursor: isSubmitEnabled ? "pointer" : "not-allowed",
          }}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}