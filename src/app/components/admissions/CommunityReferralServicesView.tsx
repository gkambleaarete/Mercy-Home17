import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash2, Plus, ChevronUp, ChevronDown } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner@2.0.3";

// ─── Master list ──────────────────────────────────────────────────────────────

const COMMUNITY_SERVICES = [
  "Academic Resources",
  "Advocacy",
  "After School Programs",
  "Benefit Enrollment",
  "Case Management",
  "CCBYS Crisis Workers",
  "Child Abuse Resources",
  "Child Care Assistance",
  "Clothing Donations",
  "Community Engagement",
  "Department of Human Services, City of Chicago 311",
  "Developmental Disability Services",
  "Domestic Violence Services",
  "Drop In Center",
  "Emergency Shelter",
  "English as a Second Language Programs",
  "Family Housing",
  "Financial Literacy",
  "Food Assistance",
  "Food Pantries",
  "Foster Care Services",
  "Health Care",
  "HIV/STD Services",
  "Housing Resources",
  "Hygiene Facility",
  "Immigration Services",
  "Inpatient Psychiatric Care",
  "Legal Assistance",
  "LGBTQ+ Resources",
  "Life Skills Classes",
  "Medical Centers",
  "Mental Health Care",
  "Mentorship Programming",
  "Parent Training",
  "Pregnant/Parenting Resources",
  "Psychiatric/Medication Care",
  "Residential Programs 17 and Under",
  "Residential Programs Over 18",
  "Residential Programs Pregnant Parenting",
  "Substance Abuse Treatment",
  "Vocational Training",
  "Women's Health",
  "Youth Access Points",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceRecord {
  id: number;
  service: string;
}

const INITIAL_SERVICES: ServiceRecord[] = [
  { id: 1, service: "Housing Resources" },
  { id: 2, service: "Mental Health Care" },
  { id: 3, service: "Mentorship Programming" },
  { id: 4, service: "Vocational Training" },
];

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--slds-g-color-border-base-1)",
  backgroundColor: "var(--slds-g-color-background-base)",
  color: "var(--slds-g-color-text-default)",
};

const errorInputStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: "#c23934",
};

// ─── Service Combobox ─────────────────────────────────────────────────────────

function ServiceCombobox({
  value,
  onChange,
  assignedServices,
  excludeId,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  assignedServices: string[];
  excludeId?: number;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const triggerRef = useRef<HTMLInputElement>(null);
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const filtered = COMMUNITY_SERVICES.filter(
    (s) => !search.trim() || s.toLowerCase().includes(search.toLowerCase())
  );

  function openDrop() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDropPos({ top: rect.bottom + 2, left: rect.left, width: rect.width });
    setOpen(true);
  }

  function select(svc: string) {
    onChange(svc);
    setSearch(svc);
    setOpen(false);
  }

  React.useEffect(() => { setSearch(value); }, [value]);

  return (
    <div>
      <input
        ref={triggerRef}
        type="text"
        value={search}
        onChange={(e) => { setSearch(e.target.value); openDrop(); }}
        onFocus={openDrop}
        onBlur={() =>
          setTimeout(() => {
            setOpen(false);
            if (!COMMUNITY_SERVICES.includes(search)) setSearch(value);
          }, 150)
        }
        placeholder="Search or select a service"
        autoComplete="off"
        className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
        style={error ? errorInputStyle : inputStyle}
      />
      {error && (
        <p className="slds-text-3 mt-0.5" style={{ color: "#c23934" }}>{error}</p>
      )}
      {open && dropPos && createPortal(
        <div
          style={{
            position: "fixed",
            top: dropPos.top,
            left: dropPos.left,
            width: dropPos.width,
            zIndex: 9999,
            backgroundColor: "var(--slds-g-color-background-base)",
            border: "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: 4,
            maxHeight: 220,
            overflowY: "auto",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          }}
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2 slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
              No results
            </div>
          ) : (
            filtered.map((svc) => {
              const isAlreadyAdded = assignedServices.includes(svc) && svc !== value;
              const isSelected = svc === value;
              return (
                <div
                  key={svc}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!isAlreadyAdded) select(svc);
                  }}
                  className="px-3 py-1.5 slds-text-4 flex items-center justify-between"
                  style={{
                    cursor: isAlreadyAdded ? "not-allowed" : "pointer",
                    backgroundColor: isSelected ? "#e8f5e9" : undefined,
                    color: isAlreadyAdded
                      ? "var(--slds-g-color-text-weak)"
                      : "var(--slds-g-color-text-default)",
                    opacity: isAlreadyAdded ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isAlreadyAdded && !isSelected)
                      (e.currentTarget as HTMLDivElement).style.backgroundColor =
                        "var(--slds-g-color-background-alt)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isAlreadyAdded && !isSelected)
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = "";
                  }}
                >
                  <span>{svc}</span>
                  {isAlreadyAdded && (
                    <span className="slds-text-3 ml-3 flex-shrink-0" style={{ color: "var(--slds-g-color-text-weak)" }}>
                      Already added
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Add / Edit Service Modal ─────────────────────────────────────────────────

function ServiceModal({
  open,
  mode,
  initial,
  assignedServices,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: "add" | "edit";
  initial?: ServiceRecord;
  assignedServices: string[];
  onClose: () => void;
  onSave: (service: string) => void;
}) {
  const [selected, setSelected] = useState(initial?.service ?? "");
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (open) {
      setSelected(initial?.service ?? "");
      setError("");
    }
  }, [open, initial]);

  function handleSave() {
    if (!selected) { setError("Please select a service."); return; }
    const isDuplicate =
      assignedServices.includes(selected) &&
      (mode === "add" || selected !== initial?.service);
    if (isDuplicate) {
      setError("This service has already been added to this organization.");
      return;
    }
    onSave(selected);
  }

  const hasChanged = mode === "edit" && selected === initial?.service;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-md p-0 gap-0"
        style={{
          backgroundColor: "var(--slds-g-color-background-base)",
          borderColor: "var(--slds-g-color-border-base-1)",
        }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-[15px] font-semibold"
              style={{ color: "var(--slds-g-color-text-default)" }}
            >
              {mode === "add" ? "Add Service" : "Edit Service"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="space-y-1.5">
            <label
              className="slds-form-label block"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              SERVICE <span className="text-red-600">*</span>
            </label>
            <ServiceCombobox
              value={selected}
              onChange={(v) => { setSelected(v); setError(""); }}
              assignedServices={assignedServices}
              excludeId={initial?.id}
              error={error}
            />
            {!error && (
              <p className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
                Select a service from the Community Services Master List.
              </p>
            )}
          </div>
        </div>

        <div
          className="px-5 py-3 flex items-center justify-end gap-3"
          style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}
        >
          <Button
            variant="outline"
            className="h-9 rounded-full slds-text-4 shadow-none"
            style={{
              border: "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor: "var(--slds-g-color-background-base)",
              color: "var(--slds-g-color-text-default)",
            }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="h-9 rounded-full slds-text-4 text-white shadow-none"
            style={{
              backgroundColor: !selected || hasChanged ? "var(--slds-g-color-neutral-95)" : "#145F33",
              color: !selected || hasChanged ? "var(--slds-g-color-text-weak)" : "white",
              cursor: !selected || hasChanged ? "not-allowed" : "pointer",
            }}
            disabled={!selected || hasChanged}
            onClick={handleSave}
          >
            {mode === "add" ? "Add Service" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Remove Confirm Dialog ────────────────────────────────────────────────────

function RemoveDialog({
  open,
  serviceName,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  serviceName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-sm p-0 gap-0"
        style={{
          backgroundColor: "var(--slds-g-color-background-base)",
          borderColor: "var(--slds-g-color-border-base-1)",
        }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-[15px] font-semibold"
              style={{ color: "var(--slds-g-color-text-default)" }}
            >
              Remove Service?
            </DialogTitle>
          </DialogHeader>
          <p className="slds-text-4 mt-2" style={{ color: "var(--slds-g-color-text-default)" }}>
            Are you sure you want to remove{" "}
            <span className="font-medium">"{serviceName}"</span> from this Community Referral
            Organization?
          </p>
          <p className="slds-text-3 mt-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
            This removes the service association from this organization.
          </p>
        </div>
        <div className="px-5 py-3 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            className="h-9 rounded-full slds-text-4 shadow-none"
            style={{
              border: "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor: "var(--slds-g-color-background-base)",
              color: "var(--slds-g-color-text-default)",
            }}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="h-9 rounded-full slds-text-4 text-white shadow-none"
            style={{ backgroundColor: "#c23934" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a52b27")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c23934")}
            onClick={onConfirm}
          >
            Remove Service
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CommunityReferralServicesView() {
  const [services, setServices] = useState<ServiceRecord[]>(INITIAL_SERVICES);
  const [nextId, setNextId] = useState(10);
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState<{ open: boolean; mode: "add" | "edit"; record?: ServiceRecord }>({
    open: false,
    mode: "add",
  });
  const [removeTarget, setRemoveTarget] = useState<ServiceRecord | null>(null);

  const assignedNames = services.map((s) => s.service);

  const displayed = services
    .filter((s) => !search || s.service.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortAsc ? a.service.localeCompare(b.service) : b.service.localeCompare(a.service));

  function handleSave(service: string) {
    if (modal.record) {
      setServices((prev) => prev.map((s) => s.id === modal.record!.id ? { ...s, service } : s));
      toast.success("Service updated successfully.");
    } else {
      if (assignedNames.includes(service)) {
        toast.error("This service has already been added to this organization.");
        return;
      }
      setServices((prev) => [...prev, { id: nextId, service }]);
      setNextId((n) => n + 1);
      toast.success("Service added successfully.");
    }
    setModal((p) => ({ ...p, open: false }));
  }

  function handleRemove() {
    if (!removeTarget) return;
    setServices((prev) => prev.filter((s) => s.id !== removeTarget.id));
    setRemoveTarget(null);
    toast.success("Service removed successfully.");
  }

  const showSearch = services.length > 6;

  return (
    <div className="space-y-5 w-full pb-8">
      {/* Services Card */}
      <div
        className="overflow-hidden w-full"
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
              Services
            </h3>
            <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
              Manage the services offered by this Community Referral Organization.
            </p>
          </div>
          <Button
            className="h-8 rounded-full slds-text-4 text-white shadow-none flex items-center gap-1.5 flex-shrink-0"
            style={{ backgroundColor: "#145F33" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")}
            onClick={() => setModal({ open: true, mode: "add" })}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Service
          </Button>
        </div>

        {/* Search (visible when list is large) */}
        {showSearch && (
          <div
            className="px-4 py-2"
            style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full h-8 px-3 rounded slds-text-4 focus:outline-none"
              style={{
                border: "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor: "var(--slds-g-color-background-base)",
                color: "var(--slds-g-color-text-default)",
              }}
            />
          </div>
        )}

        {/* Table */}
        {services.length === 0 ? (
          /* Empty state */
          <div className="px-6 py-12 flex flex-col items-center gap-2 text-center">
            <p className="slds-text-4 font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
              No services added yet
            </p>
            <p className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
              Add the services offered by this Community Referral Organization.
            </p>
            <Button
              className="mt-3 h-8 rounded-full slds-text-4 text-white shadow-none flex items-center gap-1.5"
              style={{ backgroundColor: "#145F33" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")}
              onClick={() => setModal({ open: true, mode: "add" })}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Service
            </Button>
          </div>
        ) : displayed.length === 0 && search ? (
          /* No search results */
          <div className="px-6 py-10 flex flex-col items-center gap-2 text-center">
            <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
              No services match your search.
            </p>
            <button
              onClick={() => setSearch("")}
              className="slds-text-4 underline"
              style={{ color: "#0176d3", background: "none", border: "none", cursor: "pointer" }}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "var(--slds-g-color-background-alt)", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                <th className="px-4 py-2 text-left" style={{ width: "100%" }}>
                  <button
                    className="flex items-center gap-1 slds-text-3 font-semibold"
                    style={{ color: "var(--slds-g-color-text-weak)", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => setSortAsc((v) => !v)}
                    title={sortAsc ? "Sort Z–A" : "Sort A–Z"}
                  >
                    SERVICE
                    {sortAsc ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th
                  className="px-4 py-2 text-right slds-text-3 font-semibold"
                  style={{ color: "var(--slds-g-color-text-weak)", whiteSpace: "nowrap" }}
                >
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((svc, i) => (
                <tr
                  key={svc.id}
                  style={{
                    borderBottom:
                      i < displayed.length - 1
                        ? "1px solid var(--slds-g-color-border-base-1)"
                        : undefined,
                  }}
                >
                  <td
                    className="px-4 py-2.5 slds-text-4"
                    style={{ color: "var(--slds-g-color-text-default)" }}
                  >
                    {svc.service}
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <button
                      title="Edit Service"
                      aria-label={`Edit ${svc.service}`}
                      onClick={() => setModal({ open: true, mode: "edit", record: svc })}
                      className="p-1 rounded hover:opacity-70 transition-opacity"
                      style={{ color: "#0176d3", background: "none", border: "none", cursor: "pointer" }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Remove Service"
                      aria-label={`Remove ${svc.service}`}
                      onClick={() => setRemoveTarget(svc)}
                      className="p-1 rounded hover:opacity-70 transition-opacity ml-1"
                      style={{ color: "#c23934", background: "none", border: "none", cursor: "pointer" }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      <ServiceModal
        open={modal.open}
        mode={modal.mode}
        initial={modal.record}
        assignedServices={assignedNames}
        onClose={() => setModal((p) => ({ ...p, open: false }))}
        onSave={handleSave}
      />

      {/* Remove Confirm */}
      <RemoveDialog
        open={removeTarget !== null}
        serviceName={removeTarget?.service ?? ""}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
      />
    </div>
  );
}
