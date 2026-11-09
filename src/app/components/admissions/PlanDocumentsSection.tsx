// Supplemental Plan "Documents" card (same look and behavior as the IEP /
// 504 plan Documents section): a count, "+ Upload Document", and a table of
// Document Name / Upload Date / Uploaded By / Size / Actions. Upload is the
// prototype mock used by the IEP section — no real file is stored.

import React from "react";
import { Download, Eye, FileText, Plus, Trash2 } from "@/app/lib/lucide-icons";

export interface PlanDocument {
  id: number;
  name: string;
  uploadDate: string;
  uploadedBy: string;
  size: string;
}

const mdy = () =>
  new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

export function PlanDocumentsSection({
  documents,
  onChange,
  filePrefix,
  sectionCard,
  readOnly = false,
}: {
  documents: PlanDocument[];
  onChange: (next: PlanDocument[]) => void;
  /** e.g. "Scholarship_Agreement" → Scholarship_Agreement_11092026.pdf */
  filePrefix: string;
  /** The host plan's section-card wrapper, so the card matches its siblings. */
  sectionCard: (title: string, children: React.ReactNode) => React.ReactNode;
  /** View mode: no Upload / Remove. */
  readOnly?: boolean;
}) {
  const upload = () =>
    onChange([
      ...documents,
      {
        id: Date.now(),
        name: `${filePrefix}_${mdy().replace(/\//g, "")}.pdf`,
        uploadDate: mdy(),
        uploadedBy: "Current User",
        size: "1.2 MB",
      },
    ]);

  const cell: React.CSSProperties = { color: "var(--slds-g-color-text-default)" };

  return (
    <>
      {sectionCard(
        "Documents",
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
              {documents.length} document{documents.length !== 1 ? "s" : ""}
            </span>
            {!readOnly && <button
              type="button"
              onClick={upload}
              className="h-7 px-3 rounded-full text-[11px] font-medium flex items-center gap-1"
              style={{ backgroundColor: "#145F33", color: "white" }}
            >
              <Plus className="h-3 w-3" /> Upload Document
            </button>}
          </div>
          {documents.length === 0 ? (
            <div
              className="py-6 text-center text-[13px] border-2 border-dashed rounded"
              style={{ color: "var(--slds-g-color-text-weak)", borderColor: "var(--slds-g-color-border-base-1)" }}
            >
              No documents uploaded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "var(--slds-g-color-background-alt)" }}>
                    {["Document Name", "Upload Date", "Uploaded By", "Size", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase"
                        style={{
                          color: "var(--slds-g-color-text-weak)",
                          borderBottom: "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2" style={cell}>
                          <FileText className="h-4 w-4 flex-shrink-0" style={{ color: "var(--slds-g-color-text-weak)" }} />
                          {doc.name}
                        </div>
                      </td>
                      <td className="px-3 py-2.5" style={cell}>{doc.uploadDate}</td>
                      <td className="px-3 py-2.5" style={cell}>{doc.uploadedBy}</td>
                      <td className="px-3 py-2.5" style={cell}>{doc.size}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button type="button" className="p-1 rounded hover:bg-gray-100 transition-colors" title="View" aria-label={`View ${doc.name}`}>
                            <Eye className="h-3.5 w-3.5" style={{ color: "#0176d3" }} />
                          </button>
                          <button type="button" className="p-1 rounded hover:bg-gray-100 transition-colors" title="Download" aria-label={`Download ${doc.name}`}>
                            <Download className="h-3.5 w-3.5" style={{ color: "#0176d3" }} />
                          </button>
                          {!readOnly && <button
                            type="button"
                            onClick={() => onChange(documents.filter((d) => d.id !== doc.id))}
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                            title="Remove"
                            aria-label={`Remove ${doc.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" style={{ color: "#c23934" }} />
                          </button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>,
      )}
    </>
  );
}
