import { useState } from "react";
import { toast } from "sonner@2.0.3";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

const INITIAL_ORG_NAME = "Mercy Home for Boys & Girls";
const MAX_ORG_NAME_LENGTH = 255;

const KNOWN_ORGANIZATIONS = [
    "Mercy Home",
    "Illinois DCFS",
    "Catholic Charities",
    "Youth Advocate Programs",
    "Chicago Commons",
];

export function ConstituentDetailsView() {
    const [savedOrgName, setSavedOrgName] = useState(INITIAL_ORG_NAME);
    const [orgName, setOrgName] = useState(INITIAL_ORG_NAME);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);

    const hasChanges = orgName !== savedOrgName;

    function validate(): boolean {
        if (!orgName.trim()) {
            setError("Organization Name is required.");
            return false;
        }
        if (orgName.length > MAX_ORG_NAME_LENGTH) {
            setError("Organization Name exceeds maximum allowed length.");
            return false;
        }
        setError(null);
        return true;
    }

    function checkDuplicate(name: string) {
        const trimmed = name.trim();
        const isDuplicate = KNOWN_ORGANIZATIONS.some(
            (o) => o.toLowerCase() === trimmed.toLowerCase() && trimmed.toLowerCase() !== savedOrgName.toLowerCase()
        );
        setWarning(isDuplicate ? "An organization with the same name already exists." : null);
    }

    function handleOrgNameChange(value: string) {
        setOrgName(value);
        setError(null);
        checkDuplicate(value);
    }

    function handleSave() {
        if (!validate()) return;
        setSavedOrgName(orgName);
        setWarning(null);
        toast.success("Organization updated successfully.");
    }

    function handleCancel() {
        if (hasChanges) {
            setShowDiscardDialog(true);
        } else {
            setOrgName(savedOrgName);
            setError(null);
            setWarning(null);
        }
    }

    function handleDiscard() {
        setOrgName(savedOrgName);
        setError(null);
        setWarning(null);
        setShowDiscardDialog(false);
        toast.success("Changes discarded successfully.");
    }

    return (
        <>
            {/* ── Card Container ──────────────────────────────────────────── */}
            <div
                className="overflow-hidden"
                style={{
                    border: "1px solid var(--slds-g-color-border-base-1)",
                    borderRadius: "var(--slds-c-card-radius-border)",
                    backgroundColor: "var(--slds-g-color-background-base)",
                }}
            >
                {/* Card Header */}
                <div
                    className="px-4 py-3 flex items-start justify-between gap-4"
                    style={{
                        borderBottom: "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: "var(--slds-g-color-background-alt)",
                    }}
                >
                    <div>
                        <h3
                            className="text-[13px] font-semibold"
                            style={{ color: "var(--slds-g-color-text-default)" }}
                        >
                            Constituent Details
                        </h3>
                        <p
                            className="slds-text-3 mt-0.5"
                            style={{ color: "var(--slds-g-color-text-weak)" }}
                        >
                            View and maintain general information for the selected Organization constituent.
                        </p>
                    </div>

                    {/* Save / Cancel toolbar */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={handleCancel}
                            className="h-8 px-4 rounded-full text-[12px] font-medium transition-colors"
                            style={{
                                border: "1px solid var(--slds-g-color-border-base-1)",
                                backgroundColor: "var(--slds-g-color-background-base)",
                                color: "var(--slds-g-color-text-default)",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges}
                            className="h-8 px-4 rounded-full text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: "#145F33",
                                color: "white",
                                border: "1px solid transparent",
                            }}
                        >
                            Save
                        </button>
                    </div>
                </div>

                {/* Duplicate warning banner */}
                {warning && (
                    <div
                        className="px-4 py-2.5 flex items-center gap-2 slds-text-3 font-medium"
                        style={{
                            backgroundColor: "#fffbeb",
                            borderBottom: "1px solid var(--slds-g-color-border-base-1)",
                            color: "#92400e",
                        }}
                        role="alert"
                    >
                        {warning}
                    </div>
                )}

                {/* Card Body */}
                <div className="px-4 py-4">
                    {/* General Information section label */}
                    <p
                        className="text-[11px] font-semibold uppercase tracking-wide mb-4"
                        style={{ color: "var(--slds-g-color-text-weak)" }}
                    >
                        General Information
                    </p>

                    <div className="max-w-sm space-y-1.5">
                        <Label
                            htmlFor="orgName"
                            className="slds-form-label"
                            style={{ color: "var(--slds-g-color-text-weak)" }}
                        >
                            ORGANIZATION NAME{" "}
                            <span className="text-red-600">*</span>
                        </Label>
                        <Input
                            id="orgName"
                            value={orgName}
                            onChange={(e) => handleOrgNameChange(e.target.value)}
                            placeholder="Enter organization name"
                            maxLength={MAX_ORG_NAME_LENGTH}
                            aria-required="true"
                            aria-invalid={!!error}
                            aria-describedby={error ? "orgName-error" : undefined}
                            className="h-9 slds-text-4"
                            style={{ borderColor: error ? "#c23934" : "var(--slds-g-color-border-base-1)" }}
                        />
                        {error && (
                            <p
                                id="orgName-error"
                                className="slds-text-3"
                                style={{ color: "#c23934" }}
                                role="alert"
                            >
                                {error}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Discard Changes Dialog */}
            <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
                <DialogContent
                    className="max-w-sm"
                    aria-describedby="discard-dialog-desc"
                >
                    <DialogHeader>
                        <DialogTitle style={{ color: "var(--slds-g-color-text-default)" }}>
                            Discard Changes?
                        </DialogTitle>
                        <DialogDescription id="discard-dialog-desc" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            You have unsaved changes. Do you want to discard them?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 justify-end">
                        <button
                            onClick={() => setShowDiscardDialog(false)}
                            className="h-8 px-4 rounded-full text-[12px] font-medium transition-colors"
                            style={{
                                border: "1px solid var(--slds-g-color-border-base-1)",
                                backgroundColor: "var(--slds-g-color-background-base)",
                                color: "var(--slds-g-color-text-default)",
                            }}
                        >
                            Continue Editing
                        </button>
                        <button
                            onClick={handleDiscard}
                            className="h-8 px-4 rounded-full text-[12px] font-medium transition-colors"
                            style={{ backgroundColor: "#145F33", color: "white", border: "1px solid transparent" }}
                        >
                            Discard Changes
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
