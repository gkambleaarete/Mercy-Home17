import React from "react";
import { Plus, Trash2, Pencil, Printer } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { PlanDocumentsSection } from "./PlanDocumentsSection";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { FieldLabel } from "../ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export function ScholarshipAgreementPlanDetails({
  planForm,
  setPlanForm,
  useDesignSystem = false,
}: {
  planForm: any;
  setPlanForm: (updater: any) => void;
  /** Community Care mode: render with Mercy Home design-system components. */
  useDesignSystem?: boolean;
}) {
  const REL_CONDUCT_OPTIONS = [
    "Review and sign documents",
    "Provide username/password login",
    "Maintain a minimum of weekly contact",
    "Maintain a minimum of bi-monthly contact",
    "Meet in-person or virtually a minimum of 1x/term",
    "Attend mandatory meetings, enrichment opportunities, and activities",
    "Attend mandatory meetings, enrichment opportunities, and activities (HS)",
    "Meet with academic tutors",
    "Build and maintain a mentor relationship",
    "Maintain an acceptable standard of behavior",
    "Write thank you notes",
    "Other",
  ];
  const GRADES_LOGISTICS_OPTIONS = [
    "Obtain a C grade or better in each class",
    "Communicate any anticipated changes in scholarship status",
    "Any classes withdrawn from without pre-approval may require the scholar to return funds",
    "Submit all final grades to care manager at the end of each term",
    "Other",
  ];
  const EXPENSES_OPTIONS = [
    "Provide advance notice for all requests for monetary support",
    "Other",
  ];
  const DEGREE_OPTIONS = ["GED", "High School Diploma", "Certification", "Associate's", "Bachelor's", "Master's", "Ph.D."];
  const TERM_STATUS_OPTIONS = ["Good Standing", "Probation", "Dismissed"];
  const SCHOOL_OPTIONS = ["Lincoln High School", "Roosevelt Middle School", "Jefferson Elementary", "St. Mary Catholic School", "Chicago Academy Charter"];
  const ACADEMIC_TERM_OPTIONS = ["Fall 2023", "Spring 2024", "Summer 2024", "Fall 2024", "Spring 2025", "Summer 2025", "Fall 2025", "Spring 2026", "Summer 2026"];
  const GRADE_OPTIONS = ["Pre-K", "Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

  const inputStyle = {
    border: "1px solid var(--slds-g-color-border-base-1)",
    backgroundColor: "var(--slds-g-color-background-base)",
    color: "var(--slds-g-color-text-default)",
  };
  const readOnlyStyle = {
    border: "1px solid var(--slds-g-color-border-base-1)",
    backgroundColor: "var(--slds-g-color-neutral-95)",
    color: "var(--slds-g-color-text-default)",
  };
  const helperText = (text: string) => (
    <p className="text-[11px] mt-1" style={{ color: "var(--slds-g-color-text-weak)" }}>{text}</p>
  );
  const fl = (label: string, required?: boolean) => (
    <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
      {label}{required && <span style={{ color: "#c23934" }}> *</span>}
    </label>
  );
  const sectionCard = (title: string, children: React.ReactNode, action?: React.ReactNode) => (
    <div className="overflow-hidden" style={{ border: "1px solid var(--slds-g-color-border-base-1)", borderRadius: "var(--slds-c-card-radius-border, 4px)", backgroundColor: "var(--slds-g-color-background-base)" }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-alt)" }}>
        <h3 className="text-[13px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>{title}</h3>
        {action}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );

  // Add-New-capable dropdown
  const addNewDropdown = (
    fieldKey: string,
    customListKey: string,
    addingKey: string,
    inputKey: string,
    baseOptions: string[],
    placeholder: string,
  ) => {
    const currentVal: string = planForm[fieldKey] ?? "";
    const customList: string[] = planForm[customListKey] ?? [];
    const isAdding: boolean = planForm[addingKey] ?? false;
    const inputVal: string = planForm[inputKey] ?? "";
    const allOptions = [...baseOptions, ...customList];
    return (
      <div className="space-y-1.5">
        <select
          value={isAdding ? "__add_new__" : currentVal}
          onChange={(e) => {
            if (e.target.value === "__add_new__") {
              setPlanForm((f: any) => ({ ...f, [addingKey]: true, [inputKey]: "" }));
            } else {
              setPlanForm((f: any) => ({ ...f, [fieldKey]: e.target.value, [addingKey]: false }));
            }
          }}
          className="h-9 w-full px-3 rounded text-[13px]"
          style={{ ...inputStyle, color: currentVal ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)" }}
        >
          <option value="">{placeholder}</option>
          {allOptions.map(o => <option key={o} value={o}>{o}</option>)}
          <option value="__add_new__">+ Add New…</option>
        </select>
        {isAdding && (
          <div className="flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setPlanForm((f: any) => ({ ...f, [inputKey]: e.target.value }))}
              placeholder="Enter new value…"
              className="h-8 flex-1 px-3 rounded text-[13px]"
              style={inputStyle}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputVal.trim()) {
                  const val = inputVal.trim();
                  setPlanForm((f: any) => ({ ...f, [customListKey]: [...(f[customListKey] ?? []), val], [fieldKey]: val, [addingKey]: false, [inputKey]: "" }));
                }
              }}
            />
            <button
              onClick={() => {
                if (!inputVal.trim()) return;
                const val = inputVal.trim();
                setPlanForm((f: any) => ({ ...f, [customListKey]: [...(f[customListKey] ?? []), val], [fieldKey]: val, [addingKey]: false, [inputKey]: "" }));
              }}
              className="h-8 px-3 rounded-full text-[12px] font-medium"
              style={{ backgroundColor: "#145F33", color: "white" }}
            >Create</button>
            <button
              onClick={() => setPlanForm((f: any) => ({ ...f, [addingKey]: false, [inputKey]: "" }))}
              className="h-8 px-3 rounded-full text-[12px] font-medium"
              style={{ backgroundColor: "var(--slds-g-color-neutral-95)", color: "var(--slds-g-color-text-default)", border: "1px solid var(--slds-g-color-border-base-1)" }}
            >Cancel</button>
          </div>
        )}
      </div>
    );
  };

  // Financial field numbers
  const finNum = (key: string) => {
    const v = planForm[key];
    return v !== undefined && v !== "" ? Number(v) : 0;
  };
  const schAmount = finNum("sch_books") + finNum("sch_housing") + finNum("sch_mealAssistance") + finNum("sch_transportation") + finNum("sch_tuition") + finNum("sch_miscellaneous") + finNum("sch_meritAward");
  const printOpen: boolean = planForm.sch_printModalOpen ?? false;
  const probationChecked: boolean = planForm.sch_probationContractInPlace ?? false;

  // Requirement section renderer
  const renderReqSection = (
    title: string,
    predefined: string[],
    listKey: string,
    modalKey: string,
    editIdKey: string,
    selectedKey: string,
    customKey: string,
    confirmKey: string,
  ) => {
    const items: { id: number; text: string }[] = planForm[listKey] ?? [];
    const modalOpen: boolean = planForm[modalKey] ?? false;
    const editingId: number | null = planForm[editIdKey] ?? null;
    const selectedItems: string[] = planForm[selectedKey] ?? [];
    const customText: string = planForm[customKey] ?? "";
    const confirmId: number | null = planForm[confirmKey] ?? null;
    const hasValue = selectedItems.length > 0 || customText.trim().length > 0;

    return sectionCard(title, (
      <>
        {confirmId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
            <div className="w-full max-w-sm rounded-lg shadow-xl p-6 space-y-4" style={{ backgroundColor: "var(--slds-g-color-background-base)", border: "1px solid var(--slds-g-color-border-base-1)" }}>
              <h3 className="text-[15px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Remove Requirement</h3>
              <p className="text-[13px]" style={{ color: "var(--slds-g-color-text-weak)" }}>Are you sure you want to remove this requirement?</p>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setPlanForm((f: any) => ({ ...f, [confirmKey]: null }))} className="h-9 px-5 rounded-full text-[13px] font-medium" style={{ backgroundColor: "var(--slds-g-color-neutral-95)", color: "var(--slds-g-color-text-default)", border: "1px solid var(--slds-g-color-border-base-1)" }}>Cancel</button>
                <button onClick={() => setPlanForm((f: any) => ({ ...f, [listKey]: (f[listKey] ?? []).filter((x: any) => x.id !== confirmId), [confirmKey]: null }))} className="h-9 px-5 rounded-full text-[13px] font-medium" style={{ backgroundColor: "#c23934", color: "white" }}>Remove</button>
              </div>
            </div>
          </div>
        )}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
            <div className="w-full max-w-md rounded-lg shadow-xl p-6 space-y-4" style={{ backgroundColor: "var(--slds-g-color-background-base)", border: "1px solid var(--slds-g-color-border-base-1)", maxHeight: "80vh", overflowY: "auto" }}>
              <h3 className="text-[15px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>{editingId !== null ? `Modify ${title} Requirement` : `Add ${title} Requirement`}</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  {fl("Select requirement(s)")}
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {predefined.map(opt => (
                      <label key={opt} className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type={editingId !== null ? "radio" : "checkbox"}
                          name={editingId !== null ? `req-mod-${listKey}` : undefined}
                          checked={selectedItems.includes(opt)}
                          onChange={() => setPlanForm((f: any) => {
                            const cur: string[] = f[selectedKey] ?? [];
                            if (editingId !== null) return { ...f, [selectedKey]: [opt], [customKey]: "" };
                            return { ...f, [selectedKey]: cur.includes(opt) ? cur.filter((s: string) => s !== opt) : [...cur, opt] };
                          })}
                          className="mt-0.5 h-4 w-4 flex-shrink-0"
                          style={{ accentColor: "#145F33" }}
                        />
                        <span className="text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {fl("Custom requirement")}
                  <input type="text" value={customText} onChange={(e) => setPlanForm((f: any) => ({ ...f, [customKey]: e.target.value, ...(editingId !== null && e.target.value ? { [selectedKey]: [] } : {}) }))} placeholder="Enter a custom requirement…" className="h-9 w-full px-3 rounded text-[13px]" style={inputStyle} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setPlanForm((f: any) => ({ ...f, [modalKey]: false, [editIdKey]: null, [selectedKey]: [], [customKey]: "" }))} className="h-9 px-5 rounded-full text-[13px] font-medium" style={{ backgroundColor: "var(--slds-g-color-neutral-95)", color: "var(--slds-g-color-text-default)", border: "1px solid var(--slds-g-color-border-base-1)" }}>Cancel</button>
                <button disabled={!hasValue} onClick={() => {
                  const texts: string[] = [...selectedItems];
                  if (customText.trim()) texts.push(customText.trim());
                  if (texts.length === 0) return;
                  if (editingId !== null) {
                    setPlanForm((f: any) => ({ ...f, [listKey]: (f[listKey] ?? []).map((x: any) => x.id === editingId ? { ...x, text: texts[0] } : x), [modalKey]: false, [editIdKey]: null, [selectedKey]: [], [customKey]: "" }));
                  } else {
                    const newItems = texts.map((text, i) => ({ id: Date.now() + i, text }));
                    setPlanForm((f: any) => ({ ...f, [listKey]: [...(f[listKey] ?? []), ...newItems], [modalKey]: false, [selectedKey]: [], [customKey]: "" }));
                  }
                }} className="h-9 px-5 rounded-full text-[13px] font-medium" style={{ backgroundColor: hasValue ? "#145F33" : "var(--slds-g-color-neutral-95)", color: hasValue ? "white" : "var(--slds-g-color-text-weak)" }}>Save</button>
              </div>
            </div>
          </div>
        )}
        {items.length === 0 ? (
          <div className="py-6 text-center text-[13px] border-2 border-dashed rounded" style={{ color: "var(--slds-g-color-text-weak)", borderColor: "var(--slds-g-color-border-base-1)" }}>No requirements added.</div>
        ) : (
          <table className="w-full text-[13px]" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--slds-g-color-background-alt)" }}>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase" style={{ color: "var(--slds-g-color-text-weak)", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>Requirement</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase w-24" style={{ color: "var(--slds-g-color-text-weak)", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                  <td className="px-3 py-2.5" style={{ color: "var(--slds-g-color-text-default)" }}>{item.text}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { const isPredefined = predefined.includes(item.text); setPlanForm((f: any) => ({ ...f, [modalKey]: true, [editIdKey]: item.id, [selectedKey]: isPredefined ? [item.text] : [], [customKey]: isPredefined ? "" : item.text })); }} className="p-1 rounded hover:bg-gray-100 transition-colors" title="Modify"><Pencil className="h-3.5 w-3.5" style={{ color: "#0176d3" }} /></button>
                      <button onClick={() => setPlanForm((f: any) => ({ ...f, [confirmKey]: item.id }))} className="p-1 rounded hover:bg-gray-100 transition-colors" title="Remove"><Trash2 className="h-3.5 w-3.5" style={{ color: "#c23934" }} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </>
    ), (
      <button onClick={() => setPlanForm((f: any) => ({ ...f, [modalKey]: true, [editIdKey]: null, [selectedKey]: [], [customKey]: "" }))} className="h-7 px-3 rounded-full text-[11px] font-medium flex items-center gap-1" style={{ backgroundColor: "#145F33", color: "white" }}>
        <Plus className="h-3 w-3" /> Add
      </button>
    ));
  };

  // Print modal (shared by legacy and design-system renders)
  const printModal = printOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-2xl rounded-lg shadow-2xl flex flex-col" style={{ backgroundColor: "var(--slds-g-color-background-base)", border: "1px solid var(--slds-g-color-border-base-1)", maxHeight: "90vh" }}>
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-alt)" }}>
              <h2 className="text-[15px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Scholarship Agreement</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="h-8 px-4 rounded-full text-[12px] font-medium" style={{ backgroundColor: "#145F33", color: "white" }}>Print</button>
                <button onClick={() => setPlanForm((f: any) => ({ ...f, sch_printModalOpen: false }))} className="h-8 px-4 rounded-full text-[12px] font-medium" style={{ backgroundColor: "var(--slds-g-color-neutral-95)", color: "var(--slds-g-color-text-default)", border: "1px solid var(--slds-g-color-border-base-1)" }}>Close</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
              <div className="text-center space-y-1 pb-4" style={{ borderBottom: "2px solid var(--slds-g-color-border-base-1)" }}>
                <p className="text-[18px] font-bold">Mercy Home for Boys &amp; Girls</p>
                <p className="text-[14px] font-semibold">Scholarship Agreement</p>
              </div>
              {/* Header info */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                {[
                  ["Parent/Guardian", "Johnson, Sarah (Parent/Guardian)"],
                  ["School", planForm.sch_school || "—"],
                  ["Academic Term", planForm.sch_academicTerm || "—"],
                  ["Grade", planForm.sch_grade || "—"],
                  ["Degree Pursuing", planForm.sch_degreePursuing || "—"],
                  ["Scholar Donor Match", planForm.sch_scholarDonorMatch || "—"],
                ].map(([label, val]) => (
                  <div key={label} className="flex gap-2">
                    <span className="font-semibold text-[11px] uppercase w-36 flex-shrink-0" style={{ color: "var(--slds-g-color-text-weak)" }}>{label}:</span>
                    <span>{val}</span>
                  </div>
                ))}
              </div>
              {/* Financial */}
              <div>
                <p className="font-semibold text-[12px] uppercase mb-2" style={{ color: "var(--slds-g-color-text-weak)" }}>Financial</p>
                <table className="w-full text-[13px]" style={{ borderCollapse: "collapse" }}>
                  <tbody>
                    {[
                      ["Books/Uniforms/Laptop", "sch_books"],
                      ["Housing", "sch_housing"],
                      ["Meal Assistance", "sch_mealAssistance"],
                      ["Transportation", "sch_transportation"],
                      ["Tuition", "sch_tuition"],
                      ["Miscellaneous", "sch_miscellaneous"],
                      ["Merit Award", "sch_meritAward"],
                    ].map(([label, key]) => (
                      <tr key={key} style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                        <td className="py-1.5 pr-4" style={{ color: "var(--slds-g-color-text-weak)" }}>{label}</td>
                        <td className="py-1.5 text-right">${(planForm[key] || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-1.5 pr-4 font-semibold">Scholarship Amount</td>
                      <td className="py-1.5 text-right font-semibold">${schAmount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* Requirements */}
              {[
                { title: "Relationship/Conduct", key: "sch_relationships" },
                { title: "Grades/Logistics", key: "sch_gradesLogistics" },
                { title: "Expenses", key: "sch_expenses" },
              ].map(({ title, key }) => {
                const reqs: { id: number; text: string }[] = planForm[key] ?? [];
                return reqs.length > 0 ? (
                  <div key={key}>
                    <p className="font-semibold text-[12px] uppercase mb-1" style={{ color: "var(--slds-g-color-text-weak)" }}>{title}</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {reqs.map(r => <li key={r.id}>{r.text}</li>)}
                    </ul>
                  </div>
                ) : null;
              })}
              {/* Additional */}
              <div className="space-y-2">
                <p className="font-semibold text-[12px] uppercase" style={{ color: "var(--slds-g-color-text-weak)" }}>Additional Information</p>
                {planForm.sch_comments && <p><span className="font-semibold">Comments: </span>{planForm.sch_comments}</p>}
                {planForm.sch_academicTermStatus && <p><span className="font-semibold">Academic Term Status: </span>{planForm.sch_academicTermStatus}</p>}
                <p><span className="font-semibold">Matriculation Status: </span>Junior – Lincoln High School (2025–2026)</p>
                <p><span className="font-semibold">Probation Contract in Place: </span>{probationChecked ? "Yes" : "No"}</p>
                {probationChecked && planForm.sch_probationContractComments && <p><span className="font-semibold">Probation Contract Comments: </span>{planForm.sch_probationContractComments}</p>}
              </div>
              {/* Signature lines */}
              <div className="space-y-5 pt-4" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}>
                <p className="font-semibold text-[12px] uppercase" style={{ color: "var(--slds-g-color-text-weak)" }}>Signatures</p>
                {["Youth/Member", "Guardian", "Care Manager", "Director"].map(role => (
                  <div key={role} className="flex items-end gap-6">
                    <div className="flex-1" style={{ borderBottom: "1px solid var(--slds-g-color-text-default)" }} />
                    <span className="text-[12px] w-40 flex-shrink-0" style={{ color: "var(--slds-g-color-text-weak)" }}>{role}</span>
                    <div className="w-28" style={{ borderBottom: "1px solid var(--slds-g-color-text-default)" }} />
                    <span className="text-[12px] flex-shrink-0" style={{ color: "var(--slds-g-color-text-weak)" }}>Date</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null;

  // ───────── Design-system (Community Care) render ─────────
  function renderDesignSystem() {
    const dsHelper = (text: string) => (
      <p className="slds-text-3 mt-1 text-[var(--slds-g-color-text-weak)]">{text}</p>
    );
    const dsSection = (title: string, children: React.ReactNode, action?: React.ReactNode) => (
      <Card variant="section">
        <CardHeader size="sm" separated className="flex flex-row items-center justify-between">
          <CardTitle size="sm">{title}</CardTitle>
          {action}
        </CardHeader>
        <CardContent size="sm">{children}</CardContent>
      </Card>
    );
    const dsSelect = (
      id: string,
      value: string,
      options: string[],
      placeholder: string,
      onChange: (v: string) => void,
      extra?: React.ReactNode,
    ) => (
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger id={id} surface="base" className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
          {extra}
        </SelectContent>
      </Select>
    );
    const dsAddNewDropdown = (
      id: string,
      fieldKey: string,
      customListKey: string,
      addingKey: string,
      inputKey: string,
      baseOptions: string[],
      placeholder: string,
    ) => {
      const currentVal: string = planForm[fieldKey] ?? "";
      const customList: string[] = planForm[customListKey] ?? [];
      const isAdding: boolean = planForm[addingKey] ?? false;
      const inputVal: string = planForm[inputKey] ?? "";
      const allOptions = [...baseOptions, ...customList];
      const create = () => {
        if (!inputVal.trim()) return;
        const val = inputVal.trim();
        setPlanForm((f: any) => ({ ...f, [customListKey]: [...(f[customListKey] ?? []), val], [fieldKey]: val, [addingKey]: false, [inputKey]: "" }));
      };
      return (
        <div className="space-y-1.5">
          {dsSelect(
            id,
            isAdding ? "__add_new__" : currentVal,
            allOptions,
            placeholder,
            (v) => {
              if (v === "__add_new__") {
                setPlanForm((f: any) => ({ ...f, [addingKey]: true, [inputKey]: "" }));
              } else {
                setPlanForm((f: any) => ({ ...f, [fieldKey]: v, [addingKey]: false }));
              }
            },
            <SelectItem value="__add_new__">+ Add New…</SelectItem>,
          )}
          {isAdding && (
            <div className="flex gap-2">
              <Input
                surface="base"
                aria-label="New value"
                value={inputVal}
                onChange={(e) => setPlanForm((f: any) => ({ ...f, [inputKey]: e.target.value }))}
                placeholder="Enter new value…"
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") create();
                }}
              />
              <Button size="sm" onClick={create} disabled={!inputVal.trim()}>Create</Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPlanForm((f: any) => ({ ...f, [addingKey]: false, [inputKey]: "" }))}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      );
    };

    const dsReqSection = (
      title: string,
      predefined: string[],
      listKey: string,
      modalKey: string,
      editIdKey: string,
      selectedKey: string,
      customKey: string,
      confirmKey: string,
    ) => {
      const items: { id: number; text: string }[] = planForm[listKey] ?? [];
      const modalOpen: boolean = planForm[modalKey] ?? false;
      const editingId: number | null = planForm[editIdKey] ?? null;
      const selectedItems: string[] = planForm[selectedKey] ?? [];
      const customText: string = planForm[customKey] ?? "";
      const confirmId: number | null = planForm[confirmKey] ?? null;
      const hasValue = selectedItems.length > 0 || customText.trim().length > 0;
      const customId = `sch-${listKey}-custom`;

      return dsSection(title, (
        <>
          {confirmId !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-lg shadow-xl p-6 space-y-4 bg-[var(--slds-g-color-background-base)] border border-[var(--slds-g-color-border-base-1)]">
                <h3 className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)]">Remove Requirement</h3>
                <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">Are you sure you want to remove this requirement?</p>
                <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => setPlanForm((f: any) => ({ ...f, [confirmKey]: null }))}>Cancel</Button>
                  <Button size="sm" variant="destructive" onClick={() => setPlanForm((f: any) => ({ ...f, [listKey]: (f[listKey] ?? []).filter((x: any) => x.id !== confirmId), [confirmKey]: null }))}>Remove</Button>
                </div>
              </div>
            </div>
          )}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-md rounded-lg shadow-xl p-6 space-y-4 max-h-[80vh] overflow-y-auto bg-[var(--slds-g-color-background-base)] border border-[var(--slds-g-color-border-base-1)]">
                <h3 className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)]">{editingId !== null ? `Modify ${title} Requirement` : `Add ${title} Requirement`}</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <FieldLabel>Select requirement(s)</FieldLabel>
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {predefined.map((opt, oi) => {
                        const optId = `sch-${listKey}-opt-${oi}`;
                        const toggle = () => setPlanForm((f: any) => {
                          const cur: string[] = f[selectedKey] ?? [];
                          if (editingId !== null) return { ...f, [selectedKey]: [opt], [customKey]: "" };
                          return { ...f, [selectedKey]: cur.includes(opt) ? cur.filter((s: string) => s !== opt) : [...cur, opt] };
                        });
                        return (
                          <div key={opt} className="flex items-start gap-2.5">
                            {editingId !== null ? (
                              <input
                                id={optId}
                                type="radio"
                                name={`req-mod-${listKey}`}
                                checked={selectedItems.includes(opt)}
                                onChange={toggle}
                                className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#145F33]"
                              />
                            ) : (
                              <Checkbox
                                id={optId}
                                checked={selectedItems.includes(opt)}
                                onCheckedChange={toggle}
                                className="mt-0.5"
                              />
                            )}
                            <label htmlFor={optId} className="slds-text-4 cursor-pointer text-[var(--slds-g-color-text-default)]">{opt}</label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel htmlFor={customId}>Custom requirement</FieldLabel>
                    <Input id={customId} surface="base" value={customText} onChange={(e) => setPlanForm((f: any) => ({ ...f, [customKey]: e.target.value, ...(editingId !== null && e.target.value ? { [selectedKey]: [] } : {}) }))} placeholder="Enter a custom requirement…" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => setPlanForm((f: any) => ({ ...f, [modalKey]: false, [editIdKey]: null, [selectedKey]: [], [customKey]: "" }))}>Cancel</Button>
                  <Button size="sm" disabled={!hasValue} onClick={() => {
                    const texts: string[] = [...selectedItems];
                    if (customText.trim()) texts.push(customText.trim());
                    if (texts.length === 0) return;
                    if (editingId !== null) {
                      setPlanForm((f: any) => ({ ...f, [listKey]: (f[listKey] ?? []).map((x: any) => x.id === editingId ? { ...x, text: texts[0] } : x), [modalKey]: false, [editIdKey]: null, [selectedKey]: [], [customKey]: "" }));
                    } else {
                      const newItems = texts.map((text, i) => ({ id: Date.now() + i, text }));
                      setPlanForm((f: any) => ({ ...f, [listKey]: [...(f[listKey] ?? []), ...newItems], [modalKey]: false, [selectedKey]: [], [customKey]: "" }));
                    }
                  }}>Save</Button>
                </div>
              </div>
            </div>
          )}
          {items.length === 0 ? (
            <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">No requirements added.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead variant="slds" size="md">Requirement</TableHead>
                  <TableHead variant="slds" size="md" className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-normal">{item.text}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-xs" aria-label="Modify requirement" onClick={() => { const isPredefined = predefined.includes(item.text); setPlanForm((f: any) => ({ ...f, [modalKey]: true, [editIdKey]: item.id, [selectedKey]: isPredefined ? [item.text] : [], [customKey]: isPredefined ? "" : item.text })); }}><Pencil /></Button>
                        <Button variant="ghost" size="icon-xs" aria-label="Remove requirement" onClick={() => setPlanForm((f: any) => ({ ...f, [confirmKey]: item.id }))}><Trash2 /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      ), (
        <Button size="sm" onClick={() => setPlanForm((f: any) => ({ ...f, [modalKey]: true, [editIdKey]: null, [selectedKey]: [], [customKey]: "" }))}>
          <Plus /> Add
        </Button>
      ));
    };

    return (
      <div className="space-y-4">
        {printModal}

        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setPlanForm((f: any) => ({ ...f, sch_printModalOpen: true }))}>
            <Printer />
            Print Scholarship Agreement
          </Button>
        </div>

        {dsSection("Scholarship Information", (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="sch-parent-guardian">Parent/Guardian</FieldLabel>
              <Input id="sch-parent-guardian" surface="base" value="Johnson, Sarah (Parent/Guardian)" readOnly />
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="sch-school">School</FieldLabel>
              {dsAddNewDropdown("sch-school", "sch_school", "sch_customSchools", "sch_addingNewSchool", "sch_newSchoolInput", SCHOOL_OPTIONS, "Select school…")}
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="sch-academic-term">Academic Term</FieldLabel>
              {dsAddNewDropdown("sch-academic-term", "sch_academicTerm", "sch_customTerms", "sch_addingNewTerm", "sch_newTermInput", ACADEMIC_TERM_OPTIONS, "Select academic term…")}
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="sch-grade">Grade</FieldLabel>
              {dsAddNewDropdown("sch-grade", "sch_grade", "sch_customGrades", "sch_addingNewGrade", "sch_newGradeInput", GRADE_OPTIONS, "Select grade…")}
            </div>
            <div className="col-span-full space-y-1.5">
              <FieldLabel htmlFor="sch-degree">Degree Pursuing</FieldLabel>
              {dsSelect("sch-degree", planForm.sch_degreePursuing ?? "", DEGREE_OPTIONS, "Select degree…", (v) => setPlanForm((f: any) => ({ ...f, sch_degreePursuing: v })))}
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="sch-donor-match">Scholar Donor Match</FieldLabel>
              <Input
                id="sch-donor-match"
                surface="base"
                value={planForm.sch_scholarDonorMatch ?? ""}
                onChange={(e) => setPlanForm((f: any) => ({ ...f, sch_scholarDonorMatch: e.target.value }))}
                placeholder="Enter scholar donor match…"
              />
            </div>
          </div>
        ))}

        {dsSection("Financial", (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { key: "sch_books", label: "Books/Uniforms/Laptop" },
                { key: "sch_housing", label: "Housing" },
                { key: "sch_mealAssistance", label: "Meal Assistance" },
                { key: "sch_transportation", label: "Transportation" },
                { key: "sch_tuition", label: "Tuition" },
                { key: "sch_miscellaneous", label: "Miscellaneous" },
              ] as { key: string; label: string }[]).map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <FieldLabel htmlFor={`sch-fin-${key}`}>{label}</FieldLabel>
                  <Input
                    id={`sch-fin-${key}`}
                    surface="base"
                    type="number"
                    min={0}
                    value={planForm[key] ?? ""}
                    onChange={(e) => setPlanForm((f: any) => ({ ...f, [key]: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              ))}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="sch-merit-award">Merit Award</FieldLabel>
                <Input
                  id="sch-merit-award"
                  surface="base"
                  type="number"
                  min={0}
                  value={planForm.sch_meritAward ?? ""}
                  onChange={(e) => setPlanForm((f: any) => ({ ...f, sch_meritAward: e.target.value }))}
                  placeholder="0"
                />
                {dsHelper("To be eligible for a Merit Award, the scholar must have all 'B's or higher for the school year.")}
              </div>
            </div>
            <div className="space-y-1.5 pt-4 border-t border-[var(--slds-g-color-border-base-1)]">
              <FieldLabel htmlFor="sch-amount">Scholarship Amount</FieldLabel>
              <Input id="sch-amount" surface="base" value={`$${schAmount.toLocaleString()}`} readOnly className="font-semibold" />
            </div>
          </div>
        ))}

        {dsReqSection("Relationship/Conduct", REL_CONDUCT_OPTIONS, "sch_relationships", "sch_rel_modal", "sch_rel_editId", "sch_rel_selected", "sch_rel_custom", "sch_rel_confirm")}
        {dsReqSection("Grades/Logistics", GRADES_LOGISTICS_OPTIONS, "sch_gradesLogistics", "sch_gl_modal", "sch_gl_editId", "sch_gl_selected", "sch_gl_custom", "sch_gl_confirm")}
        {dsReqSection("Expenses", EXPENSES_OPTIONS, "sch_expenses", "sch_exp_modal", "sch_exp_editId", "sch_exp_selected", "sch_exp_custom", "sch_exp_confirm")}

        {dsSection("Additional Information", (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="sch-comments">Comments</FieldLabel>
              <Textarea
                id="sch-comments"
                value={planForm.sch_comments ?? ""}
                onChange={(e) => setPlanForm((f: any) => ({ ...f, sch_comments: e.target.value }))}
                placeholder="Enter comments…"
                rows={4}
                className="min-h-[100px] resize-y"
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="sch-term-status">Academic Term Status</FieldLabel>
              {dsSelect("sch-term-status", planForm.sch_academicTermStatus ?? "", TERM_STATUS_OPTIONS, "Select status…", (v) => setPlanForm((f: any) => ({ ...f, sch_academicTermStatus: v })))}
              {dsHelper("This should be updated at the end of the academic term.")}
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="sch-matriculation">Matriculation Status</FieldLabel>
              <Input id="sch-matriculation" surface="base" value="Junior – Lincoln High School (2025–2026)" readOnly />
              {dsHelper("This should be updated at the end of the school year.")}
            </div>
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="sch-probation-contract"
                  checked={probationChecked}
                  onCheckedChange={(c) => setPlanForm((f: any) => ({ ...f, sch_probationContractInPlace: c === true }))}
                />
                <label htmlFor="sch-probation-contract" className="slds-text-4 font-medium cursor-pointer text-[var(--slds-g-color-text-default)]">
                  Probation Contract in Place
                </label>
              </div>
              {probationChecked && (
                <div className="space-y-1.5 pl-7">
                  <FieldLabel htmlFor="sch-probation-comments">Probation Contract Comments</FieldLabel>
                  <Textarea
                    id="sch-probation-comments"
                    value={planForm.sch_probationContractComments ?? ""}
                    onChange={(e) => setPlanForm((f: any) => ({ ...f, sch_probationContractComments: e.target.value }))}
                    placeholder="Enter probation contract comments…"
                    rows={3}
                    className="min-h-[72px] resize-y"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* ── Documents ── */}
        <PlanDocumentsSection
          documents={planForm.sch_documents ?? []}
          onChange={(next) => setPlanForm((f: any) => ({ ...f, sch_documents: next }))}
          filePrefix="Scholarship_Agreement"
          sectionCard={dsSection}
        />
      </div>
    );
  }

  if (useDesignSystem) return renderDesignSystem();

  return (
    <div className="space-y-4">
      {printModal}

      {/* ── Print button ── */}
      <div className="flex justify-end">
        <button
          onClick={() => setPlanForm((f: any) => ({ ...f, sch_printModalOpen: true }))}
          className="h-8 px-4 rounded-full text-[12px] font-medium flex items-center gap-1.5"
          style={{ backgroundColor: "var(--slds-g-color-neutral-95)", color: "var(--slds-g-color-text-default)", border: "1px solid var(--slds-g-color-border-base-1)" }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3.5 5.25V1.75h7v3.5M3.5 10.5H2.333A.583.583 0 0 1 1.75 9.917V6.417c0-.322.261-.584.583-.584h9.334c.322 0 .583.262.583.584v3.5a.583.583 0 0 1-.583.583H10.5M3.5 8.167h7V12.25h-7z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.1"/></svg>
          Print Scholarship Agreement
        </button>
      </div>

      {/* ── 1. Scholarship Information ── */}
      {sectionCard("Scholarship Information", (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            {fl("Parent/Guardian")}
            <input type="text" value="Johnson, Sarah (Parent/Guardian)" readOnly className="h-9 w-full px-3 rounded text-[13px]" style={readOnlyStyle} />
          </div>
          <div className="space-y-1.5">
            {fl("School")}
            {addNewDropdown("sch_school", "sch_customSchools", "sch_addingNewSchool", "sch_newSchoolInput", SCHOOL_OPTIONS, "Select school…")}
          </div>
          <div className="space-y-1.5">
            {fl("Academic Term")}
            {addNewDropdown("sch_academicTerm", "sch_customTerms", "sch_addingNewTerm", "sch_newTermInput", ACADEMIC_TERM_OPTIONS, "Select academic term…")}
          </div>
          <div className="space-y-1.5">
            {fl("Grade")}
            {addNewDropdown("sch_grade", "sch_customGrades", "sch_addingNewGrade", "sch_newGradeInput", GRADE_OPTIONS, "Select grade…")}
          </div>
          <div className="col-span-full space-y-1.5">
            {fl("Degree Pursuing")}
            <select
              value={planForm.sch_degreePursuing ?? ""}
              onChange={(e) => setPlanForm((f: any) => ({ ...f, sch_degreePursuing: e.target.value }))}
              className="h-9 w-full px-3 rounded text-[13px]"
              style={{ ...inputStyle, color: planForm.sch_degreePursuing ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)" }}
            >
              <option value="">Select degree…</option>
              {DEGREE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            {fl("Scholar Donor Match")}
            <input
              type="text"
              value={planForm.sch_scholarDonorMatch ?? ""}
              onChange={(e) => setPlanForm((f: any) => ({ ...f, sch_scholarDonorMatch: e.target.value }))}
              placeholder="Enter scholar donor match…"
              className="h-9 w-full px-3 rounded text-[13px]"
              style={inputStyle}
            />
          </div>
        </div>
      ))}

      {/* ── 2. Financial ── */}
      {sectionCard("Financial", (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              { key: "sch_books", label: "Books/Uniforms/Laptop" },
              { key: "sch_housing", label: "Housing" },
              { key: "sch_mealAssistance", label: "Meal Assistance" },
              { key: "sch_transportation", label: "Transportation" },
              { key: "sch_tuition", label: "Tuition" },
              { key: "sch_miscellaneous", label: "Miscellaneous" },
            ] as { key: string; label: string }[]).map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                {fl(label)}
                <input
                  type="number"
                  min={0}
                  value={planForm[key] ?? ""}
                  onChange={(e) => setPlanForm((f: any) => ({ ...f, [key]: e.target.value }))}
                  placeholder="0"
                  className="h-9 w-full px-3 rounded text-[13px]"
                  style={inputStyle}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              {fl("Merit Award")}
              <input
                type="number"
                min={0}
                value={planForm.sch_meritAward ?? ""}
                onChange={(e) => setPlanForm((f: any) => ({ ...f, sch_meritAward: e.target.value }))}
                placeholder="0"
                className="h-9 w-full px-3 rounded text-[13px]"
                style={inputStyle}
              />
              {helperText("To be eligible for a Merit Award, the scholar must have all 'B's or higher for the school year.")}
            </div>
          </div>
          <div className="space-y-1.5 pt-2" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}>
            {fl("Scholarship Amount")}
            <input
              type="text"
              value={`$${schAmount.toLocaleString()}`}
              readOnly
              className="h-9 w-full px-3 rounded text-[13px] font-semibold"
              style={readOnlyStyle}
            />
          </div>
        </div>
      ))}

      {/* ── 3. Relationship/Conduct ── */}
      {renderReqSection("Relationship/Conduct", REL_CONDUCT_OPTIONS, "sch_relationships", "sch_rel_modal", "sch_rel_editId", "sch_rel_selected", "sch_rel_custom", "sch_rel_confirm")}

      {/* ── 4. Grades/Logistics ── */}
      {renderReqSection("Grades/Logistics", GRADES_LOGISTICS_OPTIONS, "sch_gradesLogistics", "sch_gl_modal", "sch_gl_editId", "sch_gl_selected", "sch_gl_custom", "sch_gl_confirm")}

      {/* ── 5. Expenses ── */}
      {renderReqSection("Expenses", EXPENSES_OPTIONS, "sch_expenses", "sch_exp_modal", "sch_exp_editId", "sch_exp_selected", "sch_exp_custom", "sch_exp_confirm")}

      {/* ── 6. Additional Information ── */}
      {sectionCard("Additional Information", (
        <div className="space-y-4">
          <div className="space-y-1.5">
            {fl("Comments")}
            <textarea
              value={planForm.sch_comments ?? ""}
              onChange={(e) => setPlanForm((f: any) => ({ ...f, sch_comments: e.target.value }))}
              placeholder="Enter comments…"
              rows={4}
              className="w-full px-3 py-2 rounded text-[13px] resize-y"
              style={{ ...inputStyle, minHeight: "100px" }}
            />
          </div>
          <div className="space-y-1.5">
            {fl("Academic Term Status")}
            <select
              value={planForm.sch_academicTermStatus ?? ""}
              onChange={(e) => setPlanForm((f: any) => ({ ...f, sch_academicTermStatus: e.target.value }))}
              className="h-9 w-full px-3 rounded text-[13px]"
              style={{ ...inputStyle, color: planForm.sch_academicTermStatus ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)" }}
            >
              <option value="">Select status…</option>
              {TERM_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {helperText("This should be updated at the end of the academic term.")}
          </div>
          <div className="space-y-1.5">
            {fl("Matriculation Status")}
            <input type="text" value="Junior – Lincoln High School (2025–2026)" readOnly className="h-9 w-full px-3 rounded text-[13px]" style={readOnlyStyle} />
            {helperText("This should be updated at the end of the school year.")}
          </div>
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-3">
              <input
                id="sch-probation-contract"
                type="checkbox"
                checked={probationChecked}
                onChange={(e) => setPlanForm((f: any) => ({ ...f, sch_probationContractInPlace: e.target.checked }))}
                className="h-4 w-4 rounded flex-shrink-0"
                style={{ accentColor: "#145F33" }}
              />
              <label htmlFor="sch-probation-contract" className="text-[13px] font-medium cursor-pointer" style={{ color: "var(--slds-g-color-text-default)" }}>
                Probation Contract in Place
              </label>
            </div>
            {probationChecked && (
              <div className="space-y-1.5 pl-7">
                {fl("Probation Contract Comments")}
                <textarea
                  value={planForm.sch_probationContractComments ?? ""}
                  onChange={(e) => setPlanForm((f: any) => ({ ...f, sch_probationContractComments: e.target.value }))}
                  placeholder="Enter probation contract comments…"
                  rows={3}
                  className="w-full px-3 py-2 rounded text-[13px] resize-y"
                  style={{ ...inputStyle, minHeight: "72px" }}
                />
              </div>
            )}
          </div>
        </div>
      ))}

      {/* ── Documents ── */}
      <PlanDocumentsSection
        documents={planForm.sch_documents ?? []}
        onChange={(next) => setPlanForm((f: any) => ({ ...f, sch_documents: next }))}
        filePrefix="Scholarship_Agreement"
        sectionCard={sectionCard}
      />
    </div>
  );
}
