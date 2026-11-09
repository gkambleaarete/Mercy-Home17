import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { X as XIcon } from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

export interface DCFSInvolvementRecord {
  id: number;
  investigationDate: string;
  incidentSummary: string;
  relatedIncident: string;
  resolution: string;
  resolutionDate: string;
}

interface DCFSInvolvementDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    record:
      Omit<DCFSInvolvementRecord, "id"> | DCFSInvolvementRecord,
  ) => void;
  editingRecord?: DCFSInvolvementRecord | null;
  mode: "view" | "edit" | "create";
}

export function DCFSInvolvementDialog({
  open,
  onClose,
  onSave,
  editingRecord,
  mode,
}: DCFSInvolvementDialogProps) {
  const [formData, setFormData] = useState({
    investigationDate: "",
    incidentSummary: "",
    relatedIncident: "",
    resolution: "",
    resolutionDate: "",
  });

  const [errors, setErrors] = useState({
    investigationDate: "",
    incidentSummary: "",
    resolution: "",
    resolutionDate: "",
  });

  useEffect(() => {
    if (editingRecord) {
      setFormData({
        investigationDate: editingRecord.investigationDate,
        incidentSummary: editingRecord.incidentSummary,
        relatedIncident: editingRecord.relatedIncident,
        resolution: editingRecord.resolution,
        resolutionDate: editingRecord.resolutionDate,
      });
    } else {
      setFormData({
        investigationDate: "",
        incidentSummary: "",
        relatedIncident: "",
        resolution: "",
        resolutionDate: "",
      });
    }
    setErrors({
      investigationDate: "",
      incidentSummary: "",
      resolution: "",
      resolutionDate: "",
    });
  }, [editingRecord, open]);

  const validateForm = () => {
    const newErrors = {
      investigationDate: "",
      incidentSummary: "",
      resolution: "",
      resolutionDate: "",
    };

    if (!formData.investigationDate.trim()) {
      newErrors.investigationDate =
        "Investigation Date is required";
    }
    if (!formData.incidentSummary.trim()) {
      newErrors.incidentSummary =
        "Incident Summary is required";
    }
    if (!formData.resolution.trim()) {
      newErrors.resolution = "Resolution is required";
    }

    if (
      formData.resolutionDate.trim() &&
      formData.investigationDate.trim() &&
      formData.resolutionDate < formData.investigationDate
    ) {
      newErrors.resolutionDate =
        "Resolution Date must be on or after Investigation Date.";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(
      (error) => error !== "",
    );
  };

  const handleSave = () => {
    if (mode === "view") {
      onClose();
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (editingRecord) {
      onSave({ ...editingRecord, ...formData });
    } else {
      onSave(formData);
    }
    onClose();
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle
              className="text-[15px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {mode === "create"
                ? "Create DCFS Involvement"
                : mode === "edit"
                  ? "Edit DCFS Involvement"
                  : "View DCFS Involvement"}
            </DialogTitle>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            ></button>
          </div>
          <DialogDescription className="sr-only">
            {mode === "create"
              ? "Create a new DCFS involvement record"
              : mode === "edit"
                ? "Edit DCFS involvement details"
                : "View DCFS involvement details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Investigation Date */}
          <div>
            <Label
              htmlFor="investigation-date"
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Investigation Date{" "}
              <span className="text-red-600">*</span>
            </Label>
            <DateInput
              id="investigation-date"
              value={isoToMdy(formData.investigationDate)}
              onChange={(v) =>
                ((e) =>
                  setFormData({
                    ...formData,
                    investigationDate: e.target.value,
                  }))({ target: { value: mdyToIso(v) } })
              }
              disabled={isReadOnly}
              className="text-[13px] h-9 rounded"
              style={{
                backgroundColor: isReadOnly
                  ? "var(--slds-g-color-neutral-95)"
                  : "var(--slds-g-color-background-base)",
                border: `1px solid ${errors.investigationDate ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                color: "var(--slds-g-color-text-default)",
              }}
            />
            {errors.investigationDate && (
              <p className="text-[11px] text-red-600 mt-1">
                {errors.investigationDate}
              </p>
            )}
          </div>

          {/* Incident Summary */}
          <div>
            <Label
              htmlFor="incident-summary"
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Incident Summary{" "}
              <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="incident-summary"
              value={formData.incidentSummary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  incidentSummary: e.target.value,
                })
              }
              disabled={isReadOnly}
              className="text-[13px] rounded min-h-[100px]"
              style={{
                backgroundColor: isReadOnly
                  ? "var(--slds-g-color-neutral-95)"
                  : "var(--slds-g-color-background-base)",
                border: `1px solid ${errors.incidentSummary ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                color: "var(--slds-g-color-text-default)",
              }}
              placeholder="Provide a summary of the incident..."
            />
            {errors.incidentSummary && (
              <p className="text-[11px] text-red-600 mt-1">
                {errors.incidentSummary}
              </p>
            )}
          </div>

          {/* Related Incident */}
          <div>
            <Label
              htmlFor="related-incident"
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Related Incident
            </Label>
            <Input
              id="related-incident"
              type="text"
              value={formData.relatedIncident}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  relatedIncident: e.target.value,
                })
              }
              disabled={isReadOnly}
              className="text-[13px] h-9 rounded"
              style={{
                backgroundColor: isReadOnly
                  ? "var(--slds-g-color-neutral-95)"
                  : "var(--slds-g-color-background-base)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
              }}
              placeholder="Enter related incident reference..."
            />
          </div>

          {/* Resolution */}
          <div>
            <Label
              htmlFor="resolution"
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Resolution <span className="text-red-600">*</span>
            </Label>
            <select
              id="resolution"
              value={formData.resolution}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  resolution: e.target.value,
                })
              }
              disabled={isReadOnly}
              className="text-[13px] h-9 rounded w-full px-3"
              style={{
                backgroundColor: isReadOnly
                  ? "var(--slds-g-color-neutral-95)"
                  : "var(--slds-g-color-background-base)",
                border: `1px solid ${errors.resolution ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                color: "var(--slds-g-color-text-default)",
              }}
            >
              <option value="">Select Resolution</option>
              <option value="Indicated">Indicated</option>
              <option value="Unfounded">Unfounded</option>
              <option value="Undetermined">Undetermined</option>
              <option value="Pending">Pending</option>
            </select>
            {errors.resolution && (
              <p className="text-[11px] text-red-600 mt-1">
                {errors.resolution}
              </p>
            )}
          </div>

          {/* Resolution Date */}
          <div>
            <Label
              htmlFor="resolution-date"
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Resolution Date
            </Label>
            <DateInput
              id="resolution-date"
              value={isoToMdy(formData.resolutionDate)}
              onChange={(v) => {
                const iso = mdyToIso(v);
                setFormData({
                  ...formData,
                  resolutionDate: iso,
                });
                if (errors.resolutionDate) {
                  setErrors({ ...errors, resolutionDate: "" });
                }
              }}
              disabled={isReadOnly}
              className="text-[13px] h-9 rounded"
              style={{
                backgroundColor: isReadOnly
                  ? "var(--slds-g-color-neutral-95)"
                  : "var(--slds-g-color-background-base)",
                border: `1px solid ${errors.resolutionDate ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                color: "var(--slds-g-color-text-default)",
              }}
            />
            {errors.resolutionDate && (
              <p className="text-[11px] text-red-600 mt-1">
                {errors.resolutionDate}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 pt-6 border-t"
          style={{
            borderColor: "var(--slds-g-color-border-base-1)",
          }}
        >
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 px-6 text-[13px] font-medium rounded-full"
            style={{
              backgroundColor: "var(--slds-g-color-neutral-95)",
              color: "var(--slds-g-color-text-default)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            {mode === "view" ? "Close" : "Cancel"}
          </Button>
          {mode !== "view" && (
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}