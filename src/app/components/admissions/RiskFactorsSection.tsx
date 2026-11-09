import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Alert } from "../ui/alert";
import { Pencil, Trash2, Plus } from "@/app/lib/lucide-icons";
import {
  RISK_FACTOR_OPTIONS,
  createRiskFactor,
  deleteRiskFactor,
  riskFactorsForAdmissionsRecord,
  updateRiskFactor,
  useRiskFactors,
  type RiskFactorRecord,
} from "../../data/riskFactorStore";
import { deriveFullLifetimeRequirement } from "../../lib/cssrsRequirement";
import { CssrsRequirementNotice } from "./CssrsRequirementNotice";

type RiskFactor = RiskFactorRecord;

/** Identity of the Admissions record being viewed. Passed explicitly:
 *  without it nothing is read or written (no default youth is ever used). */
export interface RiskFactorOwner {
  /** null on a Constituent profile, which can't own Risk Factors. */
  admissionsRecordId: string | null;
  youthKey: string;
}

export function RiskFactorsSection({
  owner,
  onCompleteFullLifetime,
  fullLifetimeUnavailableReason,
}: {
  owner?: RiskFactorOwner;
  /** Opens the existing Add Standardized Test dialog on C-SSRS Full-Lifetime. */
  onCompleteFullLifetime?: () => void;
  /** The existing restriction that prevents adding a test, when one applies. */
  fullLifetimeUnavailableReason?: string | null;
}) {
  const read = useRiskFactors();
  const recordId = owner?.admissionsRecordId ?? null;
  const riskFactors = riskFactorsForAdmissionsRecord(
    read,
    recordId,
  );
  const unreadable = read.status === "error";
  const requirement = deriveFullLifetimeRequirement(
    read,
    recordId,
  );
  const canWrite = !!owner && recordId !== null && !unreadable;
  const [saveError, setSaveError] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(
    null,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRiskFactor, setEditingRiskFactor] =
    useState<RiskFactor | null>(null);
  const [formData, setFormData] = useState<
    Omit<RiskFactor, "id">
  >({
    riskFactor: "",
    lastOccurred: "",
    duration: "",
    frequency: "",
    details: "",
  });

  const handleOpenAddDialog = () => {
    setSaveError(null);
    setEditingRiskFactor(null);
    setFormData({
      riskFactor: "",
      lastOccurred: "",
      duration: "",
      frequency: "",
      details: "",
    });
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (riskFactor: RiskFactor) => {
    setSaveError(null);
    setEditingRiskFactor(riskFactor);
    setFormData({
      riskFactor: riskFactor.riskFactor,
      lastOccurred: riskFactor.lastOccurred,
      duration: riskFactor.duration,
      frequency: riskFactor.frequency,
      details: riskFactor.details,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!canWrite || !owner || recordId === null) return;
    const result = editingRiskFactor
      ? updateRiskFactor(
          recordId,
          editingRiskFactor.id,
          formData,
        )
      : createRiskFactor(
          {
            admissionsRecordId: recordId,
            youthKey: owner.youthKey,
          },
          formData,
        );
    if (!result.ok) {
      // The dialog and the entered values stay as they are.
      setSaveError(result.error);
      return;
    }
    setSaveError(null);
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!canWrite || recordId === null) return;
    const result = deleteRiskFactor(recordId, id);
    setActionError(result.ok ? null : result.error);
  };

  const updateFormField = (
    field: keyof Omit<RiskFactor, "id">,
    value: string,
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3
            className="text-[13px] font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Risk Factors
          </h3>
          <p
            className="text-[11px] mt-1"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Documented risk factors for this youth
          </p>
        </div>
        <Button
          onClick={handleOpenAddDialog}
          disabled={!canWrite}
          className="rounded-full h-8 px-4 text-[13px] font-medium"
          style={{
            backgroundColor: "#145F33",
            color: "white",
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Risk Factor
        </Button>
      </div>

      {!owner || recordId === null ? (
        <Alert variant="info">
          Risk Factors are recorded on an Admissions record.
          Open this youth's Admissions record to view or add
          them.
        </Alert>
      ) : unreadable ? (
        <Alert variant="error">
          Saved Risk Factor data can't be read, so Risk Factors
          can't be shown or changed. The saved data has been
          left as it is.
        </Alert>
      ) : null}
      {actionError && (
        <Alert variant="error">{actionError}</Alert>
      )}
      <CssrsRequirementNotice
        idPrefix="risk-factors"
        requirement={requirement}
        onComplete={onCompleteFullLifetime}
        unavailableReason={fullLifetimeUnavailableReason}
      />

      {/* Desktop/Tablet: Table View (hidden on mobile) */}
      <div
        className="overflow-hidden hidden md:block"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                  borderBottom:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <th
                  className="text-left px-4 py-3 text-[11px] font-semibold uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    minWidth: "200px",
                  }}
                >
                  Risk Factor
                </th>
                <th
                  className="text-left px-4 py-3 text-[11px] font-semibold uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    minWidth: "140px",
                  }}
                >
                  Last Occurred
                </th>
                <th
                  className="text-left px-4 py-3 text-[11px] font-semibold uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    minWidth: "120px",
                  }}
                >
                  Duration
                </th>
                <th
                  className="text-left px-4 py-3 text-[11px] font-semibold uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    minWidth: "140px",
                  }}
                >
                  Frequency
                </th>
                <th
                  className="text-left px-4 py-3 text-[11px] font-semibold uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    minWidth: "240px",
                  }}
                >
                  Details
                </th>
                <th
                  className="text-center px-4 py-3 text-[11px] font-semibold uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    width: "100px",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {riskFactors.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-[13px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    No risk factors recorded. Click "Add Risk
                    Factor" to add one.
                  </td>
                </tr>
              ) : (
                riskFactors.map((risk, index) => (
                  <tr
                    key={risk.id}
                    style={{
                      borderBottom:
                        index < riskFactors.length - 1
                          ? "1px solid var(--slds-g-color-border-base-1)"
                          : "none",
                    }}
                    className="hover:bg-[#fafaf9] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span
                        className="text-[13px] font-medium"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {risk.riskFactor}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {risk.lastOccurred || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {risk.duration || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {risk.frequency || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {risk.details || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            handleOpenEditDialog(risk)
                          }
                          className="p-1 rounded hover:bg-gray-200 transition-colors"
                          title="Edit"
                        >
                          <Pencil
                            className="h-4 w-4"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(risk.id)}
                          className="p-1 rounded hover:bg-gray-200 transition-colors"
                          title="Delete"
                        >
                          <Trash2
                            className="h-4 w-4"
                            style={{ color: "#c23934" }}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: Card View */}
      <div className="md:hidden space-y-3">
        {riskFactors.length === 0 ? (
          <div
            className="rounded p-6 text-center"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
          >
            <p
              className="text-[13px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              No risk factors recorded. Tap "Add Risk Factor" to
              add one.
            </p>
          </div>
        ) : (
          riskFactors.map((risk) => (
            <div
              key={risk.id}
              className="rounded p-4"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
              }}
            >
              {/* Header with actions */}
              <div className="flex items-start justify-between mb-3">
                <h4
                  className="text-[13px] font-medium flex-1"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {risk.riskFactor}
                </h4>
                <div className="flex items-center gap-2 ml-2">
                  <button
                    onClick={() => handleOpenEditDialog(risk)}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title="Edit"
                  >
                    <Pencil
                      className="h-4 w-4"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(risk.id)}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title="Delete"
                  >
                    <Trash2
                      className="h-4 w-4"
                      style={{ color: "#c23934" }}
                    />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-[13px]">
                <div>
                  <span
                    className="font-semibold text-[11px] uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Last Occurred:{" "}
                  </span>
                  <span
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {risk.lastOccurred || "—"}
                  </span>
                </div>
                <div>
                  <span
                    className="font-semibold text-[11px] uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Duration:{" "}
                  </span>
                  <span
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {risk.duration || "—"}
                  </span>
                </div>
                <div>
                  <span
                    className="font-semibold text-[11px] uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Frequency:{" "}
                  </span>
                  <span
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {risk.frequency || "—"}
                  </span>
                </div>
                {risk.details && (
                  <div>
                    <div
                      className="font-semibold text-[11px] uppercase mb-1"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Details:
                    </div>
                    <div
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {risk.details}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle
              className="text-[15px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {editingRiskFactor
                ? "Edit Risk Factor"
                : "Add Risk Factor"}
            </DialogTitle>
            <DialogDescription
              className="text-[13px] mt-1"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {editingRiskFactor
                ? "Update the details of this risk factor."
                : "Enter the details of the new risk factor."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {saveError && (
              <Alert variant="error">{saveError}</Alert>
            )}
            {/* Risk Factor */}
            <div>
              <Label
                htmlFor="risk-factor"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Risk Factor{" "}
                <span className="text-red-600">*</span>
              </Label>
              <select
                id="risk-factor"
                className="w-full text-[13px] px-3 py-2 rounded"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                }}
                value={formData.riskFactor}
                onChange={(e) =>
                  updateFormField("riskFactor", e.target.value)
                }
              >
                <option value="">
                  -- Select Risk Factor --
                </option>
                {RISK_FACTOR_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                {/* An earlier saved spelling stays selectable while editing it. */}
                {editingRiskFactor &&
                  !(
                    RISK_FACTOR_OPTIONS as readonly string[]
                  ).includes(editingRiskFactor.riskFactor) && (
                    <option
                      value={editingRiskFactor.riskFactor}
                    >
                      {editingRiskFactor.riskFactor}
                    </option>
                  )}
              </select>
            </div>

            {/* Last Occurred */}
            <div>
              <Label
                htmlFor="last-occurred"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Last Occurred
              </Label>
              <Input
                id="last-occurred"
                type="text"
                className="text-[13px]"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                }}
                value={formData.lastOccurred}
                onChange={(e) =>
                  updateFormField(
                    "lastOccurred",
                    e.target.value,
                  )
                }
                placeholder="e.g., January 15, 2024 or Last week"
              />
            </div>

            {/* Duration */}
            <div>
              <Label
                htmlFor="duration"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Duration
              </Label>
              <Input
                id="duration"
                type="text"
                className="text-[13px]"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                }}
                value={formData.duration}
                onChange={(e) =>
                  updateFormField("duration", e.target.value)
                }
                placeholder="e.g., 2 weeks, 3 days, Ongoing"
              />
            </div>

            {/* Frequency */}
            <div>
              <Label
                htmlFor="frequency"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Frequency
              </Label>
              <Input
                id="frequency"
                type="text"
                className="text-[13px]"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                }}
                value={formData.frequency}
                onChange={(e) =>
                  updateFormField("frequency", e.target.value)
                }
                placeholder="e.g., Daily, Weekly, Occasional"
              />
            </div>

            {/* Details */}
            <div>
              <Label
                htmlFor="details"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Details
              </Label>
              <Textarea
                id="details"
                className="text-[13px] rounded min-h-[100px]"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                }}
                value={formData.details}
                onChange={(e) =>
                  updateFormField("details", e.target.value)
                }
                placeholder="Provide additional details about this risk factor..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="rounded-full h-9 px-4 text-[13px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.riskFactor}
              className="rounded-full h-9 px-4 text-[13px] font-medium"
              style={{
                backgroundColor: formData.riskFactor
                  ? "#145F33"
                  : undefined,
                color: formData.riskFactor
                  ? "white"
                  : undefined,
              }}
            >
              {editingRiskFactor
                ? "Save Changes"
                : "Add Risk Factor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}