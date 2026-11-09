import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  ChevronDown,
  MessageSquare,
  Search,
} from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { DateInput } from "../ui/date-input";

interface ROIRecord {
  id: number;
  recipientType: string;
  organization: string;
  otherOrganization: string;
  recipient: string;
  otherRecipient: string;
  roiType: string;
  signedDate: string;
  passedDate: string;
  dateSent: string;
  receivedDate: string;
  status: string;
  linkedDocument: string | null;
  followUpNotes: string;
}

const ACCOUNT_OPTIONS = [
  "City of Chicago - DCFS",
  "Cook County Juvenile Court",
  "Department of Police",
  "Holy Family Clinic",
  "Lincoln Elementary School",
  "Rush University Medical Center",
  "Upgrade Pharmacy #100",
  "Other",
];

const CONSTITUENT_OPTIONS = [
  "Dr. James Wilson",
  "Maria Garcia",
  "Officer James Rodriguez",
  "Rev. Thomas Hayes",
  "Sarah Johnson",
  "Other",
];

const ROI_TYPES = [
  "School (New & Old School ROI)",
  "Hospital",
  "Employer",
  "Law Enforcement / Missing Persons",
  "Significant Others",
  "Upgrade Pharmacy #100",
  "Mercy Home",
  "Blank",
];

const STATUS_OPTIONS = [
  "Executed",
  "Passed",
  "Sent",
  "Partially Received",
  "Completed",
];

const STATUS_STYLES: Record<
  string,
  { bg: string; color: string }
> = {
  Executed: { bg: "#f3f2f2", color: "#706e6b" },
  Signed: { bg: "#fef3c7", color: "#92400e" },
  Sent: { bg: "#dbeafe", color: "#1e40af" },
  "Partially Received": { bg: "#fff7ed", color: "#9a3412" },
  Completed: { bg: "#d4edda", color: "#155724" },
};

const EMPTY_FORM: Omit<ROIRecord, "id"> = {
  recipientType: "Organization",
  organization: "",
  otherOrganization: "",
  recipient: "",
  otherRecipient: "",
  roiType: "",
  signedDate: "",
  passedDate: "",
  dateSent: "",
  receivedDate: "",
  status: "Signed",
  linkedDocument: null,
  followUpNotes: "",
};

const INITIAL_RECORDS: ROIRecord[] = [
  {
    id: 1,
    recipientType: "Organization",
    organization: "Lincoln Elementary School",
    otherOrganization: "",
    recipient: "",
    otherRecipient: "",
    roiType: "School (New & Old School ROI)",
    signedDate: "01/15/2025",
    passedDate: "01/17/2025",
    dateSent: "01/20/2025",
    receivedDate: "02/05/2025",
    status: "Completed",
    linkedDocument: "ROI_School_Lincoln.pdf",
    followUpNotes: "Records received in full.",
  },
  {
    id: 2,
    recipientType: "Organization",
    organization: "Rush University Medical Center",
    otherOrganization: "",
    recipient: "",
    otherRecipient: "",
    roiType: "Hospital",
    signedDate: "01/15/2025",
    passedDate: "01/17/2025",
    dateSent: "01/22/2025",
    receivedDate: "",
    status: "Sent",
    linkedDocument: null,
    followUpNotes: "Follow up call placed 02/01.",
  },
  {
    id: 3,
    recipientType: "Individual",
    organization: "",
    otherOrganization: "",
    recipient: "Officer James Rodriguez",
    otherRecipient: "",
    roiType: "Law Enforcement / Missing Persons",
    signedDate: "01/20/2025",
    passedDate: "",
    dateSent: "",
    receivedDate: "",
    status: "Signed",
    linkedDocument: null,
    followUpNotes: "",
  },
  {
    id: 4,
    recipientType: "Organization",
    organization: "Upgrade Pharmacy #100",
    otherOrganization: "",
    recipient: "",
    otherRecipient: "",
    roiType: "Upgrade Pharmacy #100",
    signedDate: "01/15/2025",
    passedDate: "01/17/2025",
    dateSent: "01/25/2025",
    receivedDate: "",
    status: "Partially Received",
    linkedDocument: "ROI_Pharmacy_Partial.pdf",
    followUpNotes: "Awaiting remaining records.",
  },
];

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? {
    bg: "#f3f2f2",
    color: "#3e3e3c",
  };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

export function ROITrackingSection() {
  const [records, setRecords] =
    useState<ROIRecord[]>(INITIAL_RECORDS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(
    null,
  );
  const [formData, setFormData] =
    useState<Omit<ROIRecord, "id">>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orgOpen, setOrgOpen] = useState(false);
  const [orgSearch, setOrgSearch] = useState("");
  const [recipientOpen, setRecipientOpen] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState("");

  const openNew = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setOrgSearch("");
    setRecipientSearch("");
    setDialogOpen(true);
  };

  const openEdit = (record: ROIRecord) => {
    setEditingId(record.id);
    setFormData({
      recipientType: record.recipientType,
      organization: record.organization,
      otherOrganization: record.otherOrganization,
      recipient: record.recipient,
      otherRecipient: record.otherRecipient,
      roiType: record.roiType,
      signedDate: record.signedDate,
      passedDate: record.passedDate,
      dateSent: record.dateSent,
      receivedDate: record.receivedDate,
      status: record.status,
      linkedDocument: record.linkedDocument,
      followUpNotes: record.followUpNotes,
    });
    setOrgSearch("");
    setRecipientSearch("");
    setDialogOpen(true);
  };

  const deleteRecord = (id: number) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    toast.success("ROI record deleted.");
  };

  const save = () => {
    if (!formData.recipientType) {
      toast.error("Recipient Type is required.");
      return;
    }
    if (
      formData.recipientType === "Organization" &&
      !formData.organization
    ) {
      toast.error("Organization is required.");
      return;
    }
    if (
      formData.organization === "Other" &&
      !formData.otherOrganization.trim()
    ) {
      toast.error("Other Organization is required.");
      return;
    }
    if (
      formData.recipientType === "Individual" &&
      !formData.recipient
    ) {
      toast.error("Recipient is required.");
      return;
    }
    if (
      formData.recipient === "Other" &&
      !formData.otherRecipient.trim()
    ) {
      toast.error("Other Recipient is required.");
      return;
    }
    if (!formData.roiType) {
      toast.error("ROI Type is required.");
      return;
    }
    if (editingId !== null) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editingId ? { ...r, ...formData } : r,
        ),
      );
      toast.success("ROI record updated.");
    } else {
      const newId =
        Math.max(0, ...records.map((r) => r.id)) + 1;
      setRecords((prev) => [
        ...prev,
        { id: newId, ...formData },
      ]);
      toast.success("ROI record added.");
    }
    setDialogOpen(false);
  };

  const set = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K],
  ) => setFormData((prev) => ({ ...prev, [key]: value }));

  const filtered = records.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      (!q ||
        r.organization.toLowerCase().includes(q) ||
        r.roiType.toLowerCase().includes(q)) &&
      (typeFilter === "all" || r.roiType === typeFilter) &&
      (statusFilter === "all" || r.status === statusFilter)
    );
  });

  const [sortCol, setSortCol] = useState<"roiType" | null>(
    null,
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const handleSort = (col: "roiType") => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };
  const sortedFiltered = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a.roiType ?? "";
      const bVal = b.roiType ?? "";
      const cmp = aVal.localeCompare(bVal);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  return (
    <>
      {/* Card */}
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        {/* Card Header */}
        <div
          className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <div>
            <h3 className="text-[13px] font-semibold text-[#080707]">
              Release of Information (ROI) Tracking
            </h3>
            {/*<p
              className="text-[12px] mt-0.5"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Track ROI requests and their status from signed
              through completed.
            </p>
            <p
              className="text-[11px] mt-0.5 italic"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Status values are proposed placeholders and
              require Admissions confirmation.
            </p>*/}
          </div>
          <Button
            size="sm"
            onClick={openNew}
            className="h-7 text-[11px] rounded-full bg-[#145F33] hover:bg-[#0f4a26] text-white flex-shrink-0"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Search organization or type…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-[13px] rounded px-3 border flex-1 min-w-[180px]"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                outline: "none",
              }}
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-8 text-[12px] rounded px-2 border"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
              }}
            >
              <option value="all">All Types</option>
              {[...ROI_TYPES]
                .sort((a, b) => a.localeCompare(b))
                .map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 text-[12px] rounded px-2 border"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
              }}
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Table / Empty State */}
          {filtered.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 rounded-lg"
              style={{
                border:
                  "1.5px dashed var(--slds-g-color-border-base-1)",
              }}
            >
              <FileText
                className="h-8 w-8 mb-2"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              />
              <p
                className="text-[13px] font-medium"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {records.length === 0
                  ? "No ROI records yet"
                  : "No records match your filters"}
              </p>
              {records.length === 0 && (
                <>
                  <p
                    className="text-[12px] mt-1 text-center max-w-[280px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Create an ROI record to begin tracking
                    release activity for this youth.
                  </p>
                  <Button
                    size="sm"
                    onClick={openNew}
                    className="mt-4 h-7 text-[11px] rounded-full bg-[#145F33] hover:bg-[#0f4a26] text-white"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    {[
                      "ORGANIZATION / INDIVIDUAL",
                      "ROI TYPE",
                      "EXECUTED DATE",
                      "ROI PASSED",
                      "DATE SENT",
                      "RECEIVED",
                      "STATUS",
                      "FOLLOW UP NOTES",
                      "LINKED DOCUMENT",
                      "ACTIONS",
                    ].map((col) => (
                      <th
                        key={col}
                        className="text-left py-2 px-3 text-[11px] whitespace-nowrap"
                        style={{
                          color:
                            sortCol === "roiType" &&
                            col === "ROI TYPE"
                              ? "#145F33"
                              : "#706e6b",
                          letterSpacing: "0.025em",
                          fontWeight: "500",
                          cursor:
                            col === "ROI TYPE"
                              ? "pointer"
                              : "default",
                          userSelect:
                            col === "ROI TYPE"
                              ? "none"
                              : undefined,
                        }}
                        onClick={
                          col === "ROI TYPE"
                            ? () => handleSort("roiType")
                            : undefined
                        }
                      >
                        {col === "ROI TYPE" ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            {col}
                            <ChevronDown
                              className="h-3 w-3"
                              style={{
                                opacity:
                                  sortCol === "roiType"
                                    ? 1
                                    : 0.3,
                                transform:
                                  sortCol === "roiType" &&
                                  sortDir === "asc"
                                    ? "rotate(180deg)"
                                    : "none",
                                color:
                                  sortCol === "roiType"
                                    ? "#145F33"
                                    : "#706e6b",
                              }}
                            />
                          </span>
                        ) : (
                          col
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedFiltered.map((record, idx) => (
                    <tr
                      key={record.id}
                      style={{
                        borderBottom:
                          idx < sortedFiltered.length - 1
                            ? "1px solid var(--slds-g-color-border-base-1)"
                            : "none",
                      }}
                    >
                      <td className="py-3 px-3 text-[13px] text-[#080707] font-medium max-w-[160px]">
                        {(() => {
                          const org = record.organization === "Other" ? record.otherOrganization : record.organization;
                          const rec = record.recipient === "Other" ? record.otherRecipient : record.recipient;
                          const display = org && rec ? `${org} · ${rec}` : org || rec || "—";
                          return (
                            <span className="block truncate" title={display}>
                              {display}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-3 text-[13px] text-[#080707] max-w-[140px]">
                        <span
                          className="block truncate"
                          title={record.roiType}
                        >
                          {record.roiType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[13px] text-[var(--slds-g-color-text-weak)] whitespace-nowrap">
                        {record.signedDate || "—"}
                      </td>
                      <td className="py-3 px-3 text-[13px] text-[var(--slds-g-color-text-weak)] whitespace-nowrap">
                        {record.passedDate || "—"}
                      </td>
                      <td className="py-3 px-3 text-[13px] text-[var(--slds-g-color-text-weak)] whitespace-nowrap">
                        {record.dateSent || "—"}
                      </td>
                      <td className="py-3 px-3 text-[13px] text-[var(--slds-g-color-text-weak)] whitespace-nowrap">
                        {record.receivedDate || "—"}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="py-3 px-3">
                        {record.followUpNotes ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="p-1 hover:bg-[#f3f2f2] rounded transition-colors"
                                title="View follow-up notes"
                              >
                                <MessageSquare
                                  className="h-3.5 w-3.5"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[260px] p-3"
                              align="start"
                              style={{
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                              }}
                            >
                              <p
                                className="text-[11px] font-medium mb-1.5 uppercase"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Follow Up Notes
                              </p>
                              <p
                                className="text-[13px]"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {record.followUpNotes}
                              </p>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <span
                            className="text-[13px]"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {record.linkedDocument ? (
                          <button
                            type="button"
                            className="flex items-center gap-1.5 text-[12px] text-[#145F33] hover:underline max-w-[140px]"
                            title={record.linkedDocument}
                          >
                            <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">
                              {record.linkedDocument}
                            </span>
                          </button>
                        ) : (
                          <span
                            className="text-[13px]"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(record)}
                            className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                            title="Edit ROI"
                          >
                            <Pencil
                              className="h-3.5 w-3.5"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            />
                          </button>
                          <button
                            onClick={() =>
                              deleteRecord(record.id)
                            }
                            className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                            title="Delete ROI"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-[#c23934]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="sm:max-w-[560px] rounded-[8px] bg-white border border-[#dddbda] p-0 gap-0 overflow-hidden"
          aria-describedby={undefined}
        >
          <DialogHeader className="px-5 py-4 border-b border-[#dddbda]">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              {editingId ? "Edit ROI Record" : "New ROI Record"}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b]">
              {editingId
                ? "Update release of information details and status."
                : "Record a new release of information request for this youth."}
            </DialogDescription>
          </DialogHeader>

          <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
            {/* Recipient Type */}
            <div>
              <Label
                htmlFor="roi-recipient-type"
                className="block text-[11px] font-medium mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Recipient Type{" "}
                <span style={{ color: "#c23934" }}>*</span>
              </Label>
              <Select
                value={formData.recipientType}
                onValueChange={(v) => {
                  setFormData((prev) => ({ ...prev, recipientType: v }));
                }}
              >
                <SelectTrigger
                  id="roi-recipient-type"
                  className="h-9 text-[13px]"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <SelectValue placeholder="Select recipient type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Organization">
                    Organization
                  </SelectItem>
                  <SelectItem value="Individual">
                    Individual
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Organization (Account lookup) — always visible; required when Recipient Type = Organization */}
            <div>
              <Label
                className="block text-[11px] font-medium mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Organization{" "}
                {formData.recipientType === "Organization" && (
                  <span style={{ color: "#c23934" }}>*</span>
                )}
              </Label>
              <Popover open={orgOpen} onOpenChange={setOrgOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full h-9 rounded px-3 text-[13px] text-left flex items-center"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: formData.organization
                        ? "var(--slds-g-color-text-default)"
                        : "var(--slds-g-color-text-placeholder)",
                    }}
                  >
                    <Search
                      className="h-3.5 w-3.5 flex-shrink-0 mr-2"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    />

                    <span className="truncate">
                      {formData.organization ||
                        "Search accounts"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0"
                  align="start"
                  style={{
                    width: "var(--radix-popover-trigger-width)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <div
                    className="px-3 py-2 border-b"
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <div className="relative">
                      <Search
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      />
                      <input
                        type="text"
                        value={orgSearch}
                        onChange={(e) =>
                          setOrgSearch(e.target.value)
                        }
                        placeholder="Search accounts…"
                        className="w-full h-7 pl-7 pr-2 text-[12px] rounded"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          outline: "none",
                        }}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {ACCOUNT_OPTIONS.filter((a) =>
                      a
                        .toLowerCase()
                        .includes(orgSearch.toLowerCase()),
                    ).map((account) => (
                      <button
                        key={account}
                        type="button"
                        className="w-full text-left px-3 py-2 text-[13px] hover:bg-[#f3f2f2] transition-colors"
                        style={{
                          color:
                            formData.organization === account
                              ? "#145F33"
                              : "var(--slds-g-color-text-default)",
                          fontWeight:
                            formData.organization === account
                              ? 600
                              : 400,
                        }}
                        onClick={() => {
                          set("organization", account);
                          if (account !== "Other")
                            set("otherOrganization", "");
                          setOrgOpen(false);
                          setOrgSearch("");
                        }}
                      >
                        {account}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {formData.organization === "Other" && (
                <div className="mt-2">
                  <Label
                    className="block text-[11px] font-medium mb-1.5 uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Other Organization{" "}
                    <span style={{ color: "#c23934" }}>*</span>
                  </Label>
                  <input
                    type="text"
                    value={formData.otherOrganization}
                    onChange={(e) =>
                      set("otherOrganization", e.target.value)
                    }
                    placeholder="Enter organization name"
                    className="w-full h-9 rounded px-3 text-[13px]"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      outline: "none",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Recipient (Constituent lookup) — always visible; required when Recipient Type = Individual */}
            <div>
              <Label
                className="block text-[11px] font-medium mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Recipient{" "}
                {formData.recipientType === "Individual" && (
                  <span style={{ color: "#c23934" }}>*</span>
                )}
              </Label>
              <Popover
                open={recipientOpen}
                onOpenChange={setRecipientOpen}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full h-9 rounded px-3 text-[13px] text-left flex items-center"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: formData.recipient
                        ? "var(--slds-g-color-text-default)"
                        : "var(--slds-g-color-text-placeholder)",
                    }}
                  >
                    <Search
                      className="h-3.5 w-3.5 flex-shrink-0 mr-2"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    />

                    <span className="truncate">
                      {formData.recipient ||
                        "Search constituents"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0"
                  align="start"
                  style={{
                    width: "var(--radix-popover-trigger-width)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <div
                    className="px-3 py-2 border-b"
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <div className="relative">
                      <Search
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      />
                      <input
                        type="text"
                        value={recipientSearch}
                        onChange={(e) =>
                          setRecipientSearch(e.target.value)
                        }
                        placeholder="Search constituents…"
                        className="w-full h-7 pl-7 pr-2 text-[12px] rounded"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          outline: "none",
                        }}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {CONSTITUENT_OPTIONS.filter((c) =>
                      c
                        .toLowerCase()
                        .includes(
                          recipientSearch.toLowerCase(),
                        ),
                    ).map((constituent) => (
                      <button
                        key={constituent}
                        type="button"
                        className="w-full text-left px-3 py-2 text-[13px] hover:bg-[#f3f2f2] transition-colors"
                        style={{
                          color:
                            formData.recipient === constituent
                              ? "#145F33"
                              : "var(--slds-g-color-text-default)",
                          fontWeight:
                            formData.recipient === constituent
                              ? 600
                              : 400,
                        }}
                        onClick={() => {
                          set("recipient", constituent);
                          if (constituent !== "Other")
                            set("otherRecipient", "");
                          setRecipientOpen(false);
                          setRecipientSearch("");
                        }}
                      >
                        {constituent}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {formData.recipient === "Other" && (
                <div className="mt-2">
                  <Label
                    className="block text-[11px] font-medium mb-1.5 uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Other Recipient{" "}
                    <span style={{ color: "#c23934" }}>*</span>
                  </Label>
                  <input
                    type="text"
                    value={formData.otherRecipient}
                    onChange={(e) =>
                      set("otherRecipient", e.target.value)
                    }
                    placeholder="Enter recipient name"
                    className="w-full h-9 rounded px-3 text-[13px]"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      outline: "none",
                    }}
                  />
                </div>
              )}
            </div>

            {/* ROI Type */}
            <div>
              <Label
                htmlFor="roi-type"
                className="block text-[11px] font-medium mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                ROI Type{" "}
                <span style={{ color: "#c23934" }}>*</span>
              </Label>
              <Select
                value={formData.roiType}
                onValueChange={(v) => set("roiType", v)}
              >
                <SelectTrigger
                  id="roi-type"
                  className="h-9 text-[13px]"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <SelectValue placeholder="Select ROI type" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Blank",
                    "Employer",
                    "Hospital",
                    "Law Enforcement / Missing Persons",
                    "Mercy Home",
                    "School",
                    "Significant Others",
                    "Upgrade Pharmacy #100",
                  ].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates row 1 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label
                  htmlFor="roi-signed"
                  className="block text-[11px] font-medium mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Executed Date
                </Label>
                <DateInput
                  id="roi-signed"
                  value={formData.signedDate}
                  onChange={(v) => set("signedDate", v)}
                  className="h-9 text-[13px] rounded"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                />
              </div>
              <div>
                <Label
                  htmlFor="roi-passed"
                  className="block text-[11px] font-medium mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Passed Date
                </Label>
                <DateInput
                  id="roi-passed"
                  value={formData.passedDate}
                  onChange={(v) => set("passedDate", v)}
                  className="h-9 text-[13px] rounded"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                />
              </div>
            </div>

            {/* Dates row 2 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label
                  htmlFor="roi-sent"
                  className="block text-[11px] font-medium mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Date Sent
                </Label>
                <DateInput
                  id="roi-sent"
                  value={formData.dateSent}
                  onChange={(v) => set("dateSent", v)}
                  className="h-9 text-[13px] rounded"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                />
              </div>
              <div>
                <Label
                  htmlFor="roi-received"
                  className="block text-[11px] font-medium mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Received Date
                </Label>
                <DateInput
                  id="roi-received"
                  value={formData.receivedDate}
                  onChange={(v) => set("receivedDate", v)}
                  className="h-9 text-[13px] rounded"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <Label
                htmlFor="roi-status"
                className="block text-[11px] font-medium mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(v) => set("status", v)}
              >
                <SelectTrigger
                  id="roi-status"
                  className="h-9 text-[13px]"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Follow Up Notes */}
            <div>
              <Label
                htmlFor="roi-notes"
                className="block text-[11px] font-medium mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Follow Up Notes
              </Label>
              <Textarea
                id="roi-notes"
                value={formData.followUpNotes}
                onChange={(e) =>
                  set("followUpNotes", e.target.value)
                }
                placeholder="Enter any follow-up notes…"
                className="text-[13px] rounded min-h-[72px]"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              />
            </div>

            {/* Linked Document — placeholder */}
            <div>
              <Label
                className="block text-[11px] font-medium mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Linked Document
              </Label>
              <div
                className="h-9 rounded px-3 flex items-center text-[13px]"
                style={{
                  border:
                    "1px dashed var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                Document linking — pending Laserfiche
                integration
              </div>
            </div>
          </div>

          <DialogFooter className="px-5 py-3 flex items-center justify-end gap-2 border-t border-[#dddbda]">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="h-9 rounded-full text-[13px] border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
            >
              Cancel
            </Button>
            <Button
              className="h-9 rounded-full text-[13px] bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
              onClick={save}
            >
              {editingId ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}