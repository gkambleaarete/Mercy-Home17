import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Pencil, Plus, Trash2 } from "@/app/lib/lucide-icons";

interface StrengthsAssessmentPlanDetailsProps {
  planForm: any;
  setPlanForm: (updater: any) => void;
  SA_CATEGORIES: any;
}

export function StrengthsAssessmentPlanDetails({
  planForm,
  setPlanForm,
  SA_CATEGORIES,
}: StrengthsAssessmentPlanDetailsProps) {
  const fieldStyle = { borderColor: "#dddbda" };
  const selectStyle = {
    border: "1px solid #dddbda",
    backgroundColor: "var(--slds-g-color-background-base)",
    color: "var(--slds-g-color-text-default)",
  };

  const openAddEntry = () =>
    setPlanForm((f: any) => ({
      ...f,
      sa_entryModalOpen: true,
      sa_editingEntryId: null,
      sa_entryCategory: "",
      sa_entryMember: "",
      sa_entryFamily: "",
    }));

  const openModifyEntry = (e: { id: number; category: string; member: string; family: string }) =>
    setPlanForm((f: any) => ({
      ...f,
      sa_entryModalOpen: true,
      sa_editingEntryId: e.id,
      sa_entryCategory: e.category,
      sa_entryMember: e.member,
      sa_entryFamily: e.family,
    }));

  const saveEntry = () => {
    if (!planForm.sa_entryCategory) return;
    if (planForm.sa_editingEntryId !== null) {
      setPlanForm((f: any) => ({
        ...f,
        sa_entries: f.sa_entries.map((x: any) =>
          x.id === f.sa_editingEntryId
            ? { ...x, category: f.sa_entryCategory, member: f.sa_entryMember, family: f.sa_entryFamily }
            : x
        ),
        sa_entryModalOpen: false,
      }));
    } else {
      setPlanForm((f: any) => ({
        ...f,
        sa_entries: [
          ...f.sa_entries,
          { id: Date.now(), category: f.sa_entryCategory, member: f.sa_entryMember, family: f.sa_entryFamily },
        ],
        sa_entryModalOpen: false,
      }));
    }
  };

  const removeEntry = (id: number) =>
    setPlanForm((f: any) => ({ ...f, sa_entries: f.sa_entries.filter((x: any) => x.id !== id) }));

  const openAddPriority = () =>
    setPlanForm((f: any) => ({
      ...f,
      sa_priorityModalOpen: true,
      sa_editingPriorityId: null,
      sa_priorityOrder: String(f.sa_priorities.length + 1),
      sa_priorityDetails: "",
    }));

  const openModifyPriority = (p: { id: number; order: number; details: string }) =>
    setPlanForm((f: any) => ({
      ...f,
      sa_priorityModalOpen: true,
      sa_editingPriorityId: p.id,
      sa_priorityOrder: String(p.order),
      sa_priorityDetails: p.details,
    }));

  const savePriority = () => {
    if (!planForm.sa_priorityDetails.trim()) return;
    const order = parseInt(planForm.sa_priorityOrder) || planForm.sa_priorities.length + 1;
    if (planForm.sa_editingPriorityId !== null) {
      setPlanForm((f: any) => ({
        ...f,
        sa_priorities: f.sa_priorities
          .map((x: any) =>
            x.id === f.sa_editingPriorityId ? { ...x, order, details: f.sa_priorityDetails } : x
          )
          .sort((a: any, b: any) => a.order - b.order),
        sa_priorityModalOpen: false,
      }));
    } else {
      setPlanForm((f: any) => ({
        ...f,
        sa_priorities: [
          ...f.sa_priorities,
          { id: Date.now(), order, details: f.sa_priorityDetails },
        ].sort((a: any, b: any) => a.order - b.order),
        sa_priorityModalOpen: false,
      }));
    }
  };

  const removePriority = (id: number) =>
    setPlanForm((f: any) => ({
      ...f,
      sa_priorities: f.sa_priorities.filter((x: any) => x.id !== id),
    }));

  return (
    <div className="space-y-6">
      {/* ── 1. Strength Assessment Grid ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="slds-text-4 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
            Strength Assessment
          </p>
          <Button
            onClick={openAddEntry}
            className="h-8 px-3 rounded-full slds-text-4 text-white"
            style={{ backgroundColor: "#145F33" }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>

        {planForm.sa_entryModalOpen && (
          <div
            className="rounded-lg p-4 space-y-4"
            style={{ backgroundColor: "var(--slds-g-color-background-alt)", border: "1px solid #dddbda" }}
          >
            <p className="slds-text-4 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              {planForm.sa_editingEntryId !== null ? "Modify Entry" : "Add Entry"}
            </p>
            <div className="space-y-1.5">
              <Label className="slds-form-label" style={{ color: "#706e6b" }}>
                CATEGORY <span className="text-red-600">*</span>
              </Label>
              <select
                value={planForm.sa_entryCategory}
                onChange={(e) => setPlanForm((f: any) => ({ ...f, sa_entryCategory: e.target.value }))}
                className="h-9 w-full px-3 rounded slds-text-4"
                style={{
                  ...selectStyle,
                  color: planForm.sa_entryCategory ? "var(--slds-g-color-text-default)" : "#706e6b",
                }}
              >
                <option value="">Select category…</option>
                {SA_CATEGORIES.map((c: string) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="slds-form-label" style={{ color: "#706e6b" }}>MEMBER</Label>
              <Textarea
                value={planForm.sa_entryMember}
                onChange={(e) => setPlanForm((f: any) => ({ ...f, sa_entryMember: e.target.value }))}
                placeholder="Strengths identified for youth…"
                className="slds-text-4 min-h-[72px] resize-y bg-white"
                style={fieldStyle}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="slds-form-label" style={{ color: "#706e6b" }}>FAMILY</Label>
              <Textarea
                value={planForm.sa_entryFamily}
                onChange={(e) => setPlanForm((f: any) => ({ ...f, sa_entryFamily: e.target.value }))}
                placeholder="Strengths identified for family…"
                className="slds-text-4 min-h-[72px] resize-y bg-white"
                style={fieldStyle}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setPlanForm((f: any) => ({ ...f, sa_entryModalOpen: false }))}
                className="h-8 px-4 rounded-full slds-text-4"
                style={{ borderColor: "#dddbda", color: "#706e6b" }}
              >
                Cancel
              </Button>
              <Button
                onClick={saveEntry}
                disabled={!planForm.sa_entryCategory}
                className="h-8 px-4 rounded-full slds-text-4 text-white"
                style={{
                  backgroundColor: planForm.sa_entryCategory ? "#145F33" : "var(--slds-g-color-neutral-95)",
                  color: planForm.sa_entryCategory ? "white" : "#706e6b",
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        )}

        {planForm.sa_entries.length > 0 ? (
          <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #dddbda" }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--slds-g-color-background-alt)", borderBottom: "1px solid #dddbda" }}>
                  {["CATEGORY", "MEMBER", "FAMILY", ""].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left slds-text-3 font-semibold" style={{ color: "#706e6b" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {planForm.sa_entries.map((e: any, idx: number) => (
                  <tr
                    key={e.id}
                    style={{ borderBottom: idx < planForm.sa_entries.length - 1 ? "1px solid #dddbda" : "none" }}
                  >
                    <td className="px-3 py-2.5 slds-text-4 font-medium" style={{ color: "var(--slds-g-color-text-default)", minWidth: "140px" }}>
                      {e.category}
                    </td>
                    <td className="px-3 py-2.5 slds-text-4" style={{ color: "var(--slds-g-color-text-default)", whiteSpace: "pre-wrap" }}>
                      {e.member || "—"}
                    </td>
                    <td className="px-3 py-2.5 slds-text-4" style={{ color: "var(--slds-g-color-text-default)", whiteSpace: "pre-wrap" }}>
                      {e.family || "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openModifyEntry(e)} className="p-1 rounded hover:bg-gray-100" title="Modify">
                          <Pencil className="h-3.5 w-3.5" style={{ color: "#0176d3" }} />
                        </button>
                        <button onClick={() => removeEntry(e.id)} className="p-1 rounded hover:bg-red-50" title="Remove">
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 rounded-lg" style={{ border: "2px dashed #dddbda" }}>
            <p className="slds-text-4" style={{ color: "#706e6b" }}>No strength entries yet.</p>
            <p className="slds-text-3 mt-0.5" style={{ color: "#706e6b" }}>
              Click "Add" to record a strength across a category.
            </p>
          </div>
        )}
      </div>

      <div className="border-t" style={{ borderColor: "#dddbda" }} />

      {/* ── 2. Summary ── */}
      <div className="space-y-5">
        <p className="slds-text-4 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Summary</p>
        <div className="space-y-1.5">
          <Label className="slds-form-label" style={{ color: "#706e6b" }}>SUMMARY / IMPRESSIONS</Label>
          <Textarea
            value={planForm.sa_summaryImpressions}
            onChange={(e) => setPlanForm((f: any) => ({ ...f, sa_summaryImpressions: e.target.value }))}
            placeholder="Enter summary and clinical impressions…"
            className="slds-text-4 min-h-[100px] resize-y bg-white"
            style={fieldStyle}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="slds-form-label" style={{ color: "#706e6b" }}>
            COLLATERAL INFORMATION NOT INCLUDED IN DISCHARGE SUMMARY
          </Label>
          <Textarea
            value={planForm.sa_collateralInfo}
            onChange={(e) => setPlanForm((f: any) => ({ ...f, sa_collateralInfo: e.target.value }))}
            placeholder="Document collateral information not captured in discharge summary…"
            className="slds-text-4 min-h-[100px] resize-y"
            style={fieldStyle}
          />
        </div>
      </div>

      <div className="border-t" style={{ borderColor: "#dddbda" }} />

      {/* ── 3. Priorities ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="slds-text-4 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Priorities</p>
          <Button
            onClick={openAddPriority}
            className="h-8 px-3 rounded-full slds-text-4 text-white"
            style={{ backgroundColor: "#145F33" }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>

        {planForm.sa_priorityModalOpen && (
          <div
            className="rounded-lg p-4 space-y-4"
            style={{ backgroundColor: "var(--slds-g-color-background-alt)", border: "1px solid #dddbda" }}
          >
            <p className="slds-text-4 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              {planForm.sa_editingPriorityId !== null ? "Modify Priority" : "Add Priority"}
            </p>
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="slds-form-label" style={{ color: "#706e6b" }}>ORDER</Label>
                <input
                  type="number"
                  min={1}
                  value={planForm.sa_priorityOrder}
                  onChange={(e) => setPlanForm((f: any) => ({ ...f, sa_priorityOrder: e.target.value }))}
                  className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                  style={{ border: "1px solid #dddbda", backgroundColor: "var(--slds-g-color-background-base)" }}
                />
              </div>
              <div className="col-span-3 space-y-1.5">
                <Label className="slds-form-label" style={{ color: "#706e6b" }}>
                  DETAILS <span className="text-red-600">*</span>
                </Label>
                <input
                  type="text"
                  value={planForm.sa_priorityDetails}
                  onChange={(e) => setPlanForm((f: any) => ({ ...f, sa_priorityDetails: e.target.value }))}
                  placeholder="Describe the priority…"
                  className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                  style={{ border: "1px solid #dddbda", backgroundColor: "var(--slds-g-color-background-base)" }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setPlanForm((f: any) => ({ ...f, sa_priorityModalOpen: false }))}
                className="h-8 px-4 rounded-full slds-text-4"
                style={{ borderColor: "#dddbda", color: "#706e6b" }}
              >
                Cancel
              </Button>
              <Button
                onClick={savePriority}
                disabled={!planForm.sa_priorityDetails.trim()}
                className="h-8 px-4 rounded-full slds-text-4 text-white"
                style={{
                  backgroundColor: planForm.sa_priorityDetails.trim() ? "#145F33" : "var(--slds-g-color-neutral-95)",
                  color: planForm.sa_priorityDetails.trim() ? "white" : "#706e6b",
                }}
              >
                Save
              </Button>
            </div>
          </div>
        )}

        {planForm.sa_priorities.length > 0 ? (
          <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #dddbda" }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--slds-g-color-background-alt)", borderBottom: "1px solid #dddbda" }}>
                  {["ORDER", "DETAILS", ""].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left slds-text-3 font-semibold" style={{ color: "#706e6b" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {planForm.sa_priorities.map((p: any, idx: number) => (
                  <tr
                    key={p.id}
                    style={{ borderBottom: idx < planForm.sa_priorities.length - 1 ? "1px solid #dddbda" : "none" }}
                  >
                    <td className="px-3 py-2.5 slds-text-4 font-semibold" style={{ color: "var(--slds-g-color-text-default)", width: "64px" }}>
                      {p.order}
                    </td>
                    <td className="px-3 py-2.5 slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>
                      {p.details}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openModifyPriority(p)} className="p-1 rounded hover:bg-gray-100" title="Modify">
                          <Pencil className="h-3.5 w-3.5" style={{ color: "#0176d3" }} />
                        </button>
                        <button onClick={() => removePriority(p.id)} className="p-1 rounded hover:bg-red-50" title="Remove">
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 rounded-lg" style={{ border: "2px dashed #dddbda" }}>
            <p className="slds-text-4" style={{ color: "#706e6b" }}>No priorities added yet.</p>
            <p className="slds-text-3 mt-0.5" style={{ color: "#706e6b" }}>Click "Add" to record a priority item.</p>
          </div>
        )}
      </div>
    </div>
  );
}
