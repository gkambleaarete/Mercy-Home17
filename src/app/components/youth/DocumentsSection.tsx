import { useState } from "react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Edit2, Eye, RefreshCw, FileText } from "@/app/lib/lucide-icons";
import { cn } from "../../lib/utils";
import { formatMdy } from "../../lib/dateFormat";

interface Document {
  id: string;
  name: string;
  reference: string;
  date: string;
  expiration: string;
  notes: boolean;
  renewable: boolean;
  status: "received" | "pending" | "documented";
}

interface DocumentsSectionProps {
  documents: Document[];
  onMarkAsReceived: (id: string) => void;
  onMarkAsDocumented: (id: string) => void;
  onToggleNotes: (id: string) => void;
  onToggleRenewable: (id: string) => void;
}

export function DocumentsSection({
  documents,
  onMarkAsReceived,
  onMarkAsDocumented,
  onToggleNotes,
  onToggleRenewable,
}: DocumentsSectionProps) {
  const [documentProgram, setDocumentProgram] =
    useState("bernardin");
  const [documentType, setDocumentType] = useState("bernardin");
  const [isEditingDocument, setIsEditingDocument] =
    useState(false);

  return (
    <div className="space-y-5">
      {/* Header Section with Summary Stats */}
      <div
        className="rounded-lg p-4"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          border: "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div>
              <div
                className="text-[11px] uppercase font-semibold tracking-wide mb-1"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Total Documents
              </div>
              <div
                className="text-[20px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {documents.length}
              </div>
            </div>
            <div
              className="h-10 w-px"
              style={{
                backgroundColor:
                  "var(--slds-g-color-border-base-1)",
              }}
            />
            <div>
              <div
                className="text-[11px] uppercase font-semibold tracking-wide mb-1"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Pending
              </div>
              <div className="text-[20px] font-semibold text-orange-600">
                {
                  documents.filter(
                    (d) => d.status === "pending",
                  ).length
                }
              </div>
            </div>
            <div
              className="h-10 w-px"
              style={{
                backgroundColor:
                  "var(--slds-g-color-border-base-1)",
              }}
            />
            <div>
              <div
                className="text-[11px] uppercase font-semibold tracking-wide mb-1"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Expiring Soon
              </div>
              <div className="text-[20px] font-semibold text-red-600">
                {
                  documents.filter(
                    (d) => d.expiration !== "—" && d.renewable,
                  ).length
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Actions Bar */}
      <div
        className="rounded-lg p-4"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          border: "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Label
                className="text-[12px] font-semibold whitespace-nowrap"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Program:
              </Label>
              <Select
                value={documentProgram}
                onValueChange={setDocumentProgram}
              >
                <SelectTrigger
                  className="h-9 text-[13px] min-w-[180px] rounded-md"
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
                  <SelectItem value="bernardin">
                    Bernardin
                  </SelectItem>
                  <SelectItem value="all-programs">
                    All Programs
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setIsEditingDocument(!isEditingDocument)
              }
              className="h-9 rounded-full text-[12px] font-medium px-4 transition-all duration-200"
              style={{
                border: isEditingDocument
                  ? "1px solid var(--color-brand-primary)"
                  : "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor: isEditingDocument
                  ? "rgba(20, 95, 51, 0.08)"
                  : "var(--slds-g-color-background-base)",
                color: isEditingDocument
                  ? "var(--color-brand-primary)"
                  : "var(--slds-g-color-text-default)",
              }}
            >
              <Edit2 className="h-3.5 w-3.5 mr-1.5" />
              {isEditingDocument
                ? "Done Editing"
                : "Edit Details"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full text-[12px] font-medium px-4 transition-all duration-200 hover:bg-gray-50"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                color: "var(--slds-g-color-text-default)",
              }}
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full text-[12px] font-medium px-4 transition-all duration-200 hover:bg-gray-50"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                color: "var(--slds-g-color-text-default)",
              }}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Renew
            </Button>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div
        className="overflow-hidden rounded-lg shadow-sm"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
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
                }}
              >
                <th
                  className="px-4 py-3 text-left text-[11px] uppercase font-semibold tracking-wider"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    borderBottom:
                      "2px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  Document Name
                </th>
                <th
                  className="px-4 py-3 text-left text-[11px] uppercase font-semibold tracking-wider"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    borderBottom:
                      "2px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  Reference Number
                </th>
                <th
                  className="px-4 py-3 text-left text-[11px] uppercase font-semibold tracking-wider"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    borderBottom:
                      "2px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  Date
                </th>
                <th
                  className="px-4 py-3 text-left text-[11px] uppercase font-semibold tracking-wider"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    borderBottom:
                      "2px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  Expiration Date
                </th>
                <th
                  className="px-4 py-3 text-center text-[11px] uppercase font-semibold tracking-wider w-20"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    borderBottom:
                      "2px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  Notes
                </th>
                <th
                  className="px-4 py-3 text-center text-[11px] uppercase font-semibold tracking-wider w-24"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    borderBottom:
                      "2px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  Renewable
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => {
                // Check if expiring soon (renewable items with expiration dates)
                const isExpiringSoon =
                  doc.expiration !== "—" && doc.renewable;

                return (
                  <tr
                    key={doc.id}
                    className="group transition-colors duration-150 hover:bg-gray-50/50"
                    style={{
                      borderBottom:
                        index < documents.length - 1
                          ? "1px solid var(--slds-g-color-border-base-1)"
                          : "none",
                    }}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded"
                          style={{
                            backgroundColor:
                              doc.status === "received"
                                ? "rgba(76, 175, 80, 0.1)"
                                : doc.status === "documented"
                                  ? "rgba(33, 150, 243, 0.1)"
                                  : "rgba(255, 152, 0, 0.1)",
                          }}
                        >
                          <FileText
                            className="h-4 w-4"
                            style={{
                              color:
                                doc.status === "received"
                                  ? "#4caf50"
                                  : doc.status === "documented"
                                    ? "#2196f3"
                                    : "#ff9800",
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div
                              className="text-[13px] font-medium"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {doc.name}
                            </div>
                            {isExpiringSoon && (
                              <Badge
                                className="text-[10px] px-1.5 py-0 h-5"
                                style={{
                                  backgroundColor: "#fef3c7",
                                  color: "#92400e",
                                  border: "1px solid #fcd34d",
                                }}
                              >
                                Expiring Soon
                              </Badge>
                            )}
                          </div>
                          {doc.status === "pending" && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <button
                                onClick={() =>
                                  onMarkAsReceived(doc.id)
                                }
                                className="text-[11px] font-medium hover:underline transition-all"
                                style={{
                                  color:
                                    "var(--color-brand-primary)",
                                }}
                              >
                                Mark as Received
                              </button>
                              <span
                                className="text-[11px]"
                                style={{
                                  color:
                                    "var(--slds-g-color-border-base-1)",
                                }}
                              >
                                •
                              </span>
                              <button
                                onClick={() =>
                                  onMarkAsDocumented(doc.id)
                                }
                                className="text-[11px] font-medium hover:underline transition-all"
                                style={{
                                  color:
                                    "var(--color-brand-primary)",
                                }}
                              >
                                Mark as Documented
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div
                        className="text-[13px] font-mono"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {doc.reference}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {doc.date}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {doc.expiration}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={doc.notes}
                          disabled={!isEditingDocument}
                          onCheckedChange={() =>
                            isEditingDocument &&
                            onToggleNotes(doc.id)
                          }
                          className={cn(
                            !isEditingDocument &&
                              "opacity-50 cursor-not-allowed",
                          )}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={doc.renewable}
                          disabled={!isEditingDocument}
                          onCheckedChange={() =>
                            isEditingDocument &&
                            onToggleRenewable(doc.id)
                          }
                          className={cn(
                            !isEditingDocument &&
                              "opacity-50 cursor-not-allowed",
                          )}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Summary */}
      <div
        className="text-[12px] text-center"
        style={{ color: "var(--slds-g-color-text-weak)" }}
      >
        Showing {documents.length} document
        {documents.length !== 1 ? "s" : ""} • Last updated:{" "}
        {formatMdy(new Date())}
      </div>
    </div>
  );
}