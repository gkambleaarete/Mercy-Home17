import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  X,
} from "@/app/lib/lucide-icons";

interface HRAPlanDetailsProps {
  planForm: any;
  setPlanForm: (updater: any) => void;
}

export function HRAPlanDetails({ planForm, setPlanForm }: HRAPlanDetailsProps) {
  const typeOfHarm = planForm.hra_typeOfHarm;

  const harmLabel =
    typeOfHarm === "Self – Suicide"
      ? "Killing Self"
      : typeOfHarm === "Self – Harm"
        ? "Harming Self"
        : typeOfHarm === "Others – Harm"
          ? "Harming Others"
          : "[Select Type of Harm]";

  const thoughtLabel =
    typeOfHarm === "Self – Suicide"
      ? "Thoughts About Suicide"
      : typeOfHarm === "Self – Harm"
        ? "Thoughts About Harming Self"
        : typeOfHarm === "Others – Harm"
          ? "Thoughts About Harming Others"
          : "Thoughts";

  const fieldStyle = { borderColor: "#dddbda" };
  const selectStyle = {
    border: "1px solid #dddbda",
    backgroundColor: "var(--slds-g-color-background-base)",
    color: "var(--slds-g-color-text-default)",
  };

  const YNUField = ({
    label,
    fieldKey,
    detailsKey,
    required,
  }: {
    label: string;
    fieldKey: "hra_planToHarm" | "hra_weaponAccess" | "hra_verbalSafetyPlan" | "hra_planToHarmOthers";
    detailsKey: "hra_planToHarmDetails" | "hra_weaponAccessDetails" | "hra_verbalSafetyPlanDetails" | "hra_dutyToWarnDetails";
    required?: boolean;
  }) => (
    <div className="space-y-1.5">
      <Label className="slds-form-label" style={{ color: "#706e6b" }}>
        {label}
        {required && <span className="text-red-600">*</span>}
      </Label>
      <div className="flex gap-3">
        {(["Yes", "No", "Unknown"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() =>
              setPlanForm((f: any) => ({
                ...f,
                [fieldKey]: f[fieldKey] === opt ? "" : opt,
              }))
            }
            className="h-8 px-4 rounded-full slds-text-4 font-medium transition-colors"
            style={{
              border: `1px solid ${planForm[fieldKey] === opt ? "#145F33" : "#dddbda"}`,
              backgroundColor: planForm[fieldKey] === opt ? "#e6f2eb" : "var(--slds-g-color-background-base)",
              color: planForm[fieldKey] === opt ? "#145F33" : "var(--slds-g-color-text-default)",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
      {planForm[fieldKey] !== "" && (
        <Textarea
          value={planForm[detailsKey]}
          onChange={(e) => setPlanForm((f: any) => ({ ...f, [detailsKey]: e.target.value }))}
          placeholder="Details…"
          className="slds-text-4 min-h-[60px] resize-y mt-1.5 bg-white"
          style={fieldStyle}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 1. Type of Harm */}
      <div className="space-y-1.5">
        <Label className="slds-form-label" style={{ color: "#706e6b" }}>
          TYPE OF HARM <span className="text-red-600">*</span>
        </Label>
        <select
          value={planForm.hra_typeOfHarm}
          onChange={(e) =>
            setPlanForm((f: any) => ({ ...f, hra_typeOfHarm: e.target.value }))
          }
          className="h-9 w-full px-3 rounded slds-text-4"
          style={{
            ...selectStyle,
            color: planForm.hra_typeOfHarm ? "var(--slds-g-color-text-default)" : "#706e6b",
          }}
        >
          <option value="">Select type of harm…</option>
          <option value="Self – Suicide">Self – Suicide</option>
          <option value="Self – Harm">Self – Harm</option>
          <option value="Others – Harm">Others – Harm</option>
        </select>
      </div>

      {typeOfHarm && (
        <>
          <div className="border-t" style={{ borderColor: "#dddbda" }} />

          {/* 2. Thought History */}
          <div className="space-y-4">
            <p className="slds-text-4 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              Thought History
            </p>
            {[
              { key: "hra_firstTimeThoughts", label: `FIRST TIME HAD ${thoughtLabel.toUpperCase()}` },
              { key: "hra_lastTimeThoughts", label: `LAST TIME HAD ${thoughtLabel.toUpperCase()}` },
              { key: "hra_frequencyThoughts", label: `FREQUENCY OF ${thoughtLabel.toUpperCase()}` },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label className="slds-form-label" style={{ color: "#706e6b" }}>{label}</Label>
                <Input
                  value={planForm[key] ?? ""}
                  onChange={(e) => setPlanForm((f: any) => ({ ...f, [key]: e.target.value }))}
                  className="h-9 slds-text-4"
                  style={fieldStyle}
                />
              </div>
            ))}
          </div>

          {/* 3. Triggers */}
          <div className="space-y-3">
            <p className="slds-text-4 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              TRIGGERS FOR{" "}
              {typeOfHarm === "Self – Suicide"
                ? "THOUGHTS ABOUT KILLING SELF"
                : typeOfHarm === "Self – Harm"
                  ? "THOUGHTS ABOUT HARMING SELF"
                  : "THOUGHTS ABOUT HARMING OTHERS"}
            </p>
            <div className="flex gap-2">
              <Input
                value={planForm.hra_newTrigger}
                onChange={(e) => setPlanForm((f: any) => ({ ...f, hra_newTrigger: e.target.value }))}
                placeholder="Add trigger…"
                className="h-9 slds-text-4 flex-1"
                style={fieldStyle}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && planForm.hra_newTrigger.trim()) {
                    e.preventDefault();
                    setPlanForm((f: any) => ({
                      ...f,
                      hra_triggers: [
                        ...f.hra_triggers,
                        { id: Date.now(), text: f.hra_newTrigger.trim(), editing: false, draft: "" },
                      ],
                      hra_newTrigger: "",
                    }));
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (!planForm.hra_newTrigger.trim()) return;
                  setPlanForm((f: any) => ({
                    ...f,
                    hra_triggers: [
                      ...f.hra_triggers,
                      { id: Date.now(), text: f.hra_newTrigger.trim(), editing: false, draft: "" },
                    ],
                    hra_newTrigger: "",
                  }));
                }}
                className="h-9 px-3 rounded-full slds-text-4 text-white"
                style={{ backgroundColor: "#145F33" }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>
            {planForm.hra_triggers.length > 0 && (
              <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #dddbda" }}>
                {planForm.hra_triggers.map((t: any, idx: number) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 px-3 py-2"
                    style={{
                      borderBottom: idx < planForm.hra_triggers.length - 1 ? "1px solid #dddbda" : "none",
                    }}
                  >
                    {t.editing ? (
                      <>
                        <Input
                          value={t.draft}
                          onChange={(e) =>
                            setPlanForm((f: any) => ({
                              ...f,
                              hra_triggers: f.hra_triggers.map((x: any) =>
                                x.id === t.id ? { ...x, draft: e.target.value } : x
                              ),
                            }))
                          }
                          className="h-8 slds-text-4 flex-1"
                          style={fieldStyle}
                          autoFocus
                        />
                        <button
                          onClick={() =>
                            setPlanForm((f: any) => ({
                              ...f,
                              hra_triggers: f.hra_triggers.map((x: any) =>
                                x.id === t.id ? { ...x, text: x.draft, editing: false } : x
                              ),
                            }))
                          }
                          className="p-1 rounded hover:bg-green-50"
                        >
                          <CheckCircle2 className="h-4 w-4" style={{ color: "#145F33" }} />
                        </button>
                        <button
                          onClick={() =>
                            setPlanForm((f: any) => ({
                              ...f,
                              hra_triggers: f.hra_triggers.map((x: any) =>
                                x.id === t.id ? { ...x, editing: false, draft: x.text } : x
                              ),
                            }))
                          }
                          className="p-1 rounded hover:bg-red-50"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="slds-text-4 flex-1" style={{ color: "var(--slds-g-color-text-default)" }}>
                          {t.text}
                        </span>
                        <button
                          onClick={() =>
                            setPlanForm((f: any) => ({
                              ...f,
                              hra_triggers: f.hra_triggers.map((x: any) =>
                                x.id === t.id ? { ...x, editing: true, draft: x.text } : x
                              ),
                            }))
                          }
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          <Pencil className="h-3.5 w-3.5" style={{ color: "#0176d3" }} />
                        </button>
                        <button
                          onClick={() =>
                            setPlanForm((f: any) => ({
                              ...f,
                              hra_triggers: f.hra_triggers.filter((x: any) => x.id !== t.id),
                            }))
                          }
                          className="p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Intensity */}
          <div className="space-y-1.5">
            <Label className="slds-form-label" style={{ color: "#706e6b" }}>
              INTENSITY OF {thoughtLabel.toUpperCase()} (0–10)
            </Label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={planForm.hra_intensity || "0"}
                onChange={(e) => setPlanForm((f: any) => ({ ...f, hra_intensity: e.target.value }))}
                className="flex-1 accent-[#145F33]"
              />
              <span className="slds-text-4 font-semibold w-6 text-center" style={{ color: "var(--slds-g-color-text-default)" }}>
                {planForm.hra_intensity || "0"}
              </span>
            </div>
            <div className="flex justify-between slds-text-3" style={{ color: "#706e6b" }}>
              <span>0 – None</span>
              <span>5 – Moderate</span>
              <span>10 – Severe</span>
            </div>
          </div>

          <div className="border-t" style={{ borderColor: "#dddbda" }} />

          {/* 5. Risk Indicators */}
          <div className="space-y-4">
            <p className="slds-text-4 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              Risk Indicators
            </p>
            <YNUField
              label={`IS THERE A PLAN TO ${harmLabel.toUpperCase()}?`}
              fieldKey="hra_planToHarm"
              detailsKey="hra_planToHarmDetails"
            />
            <YNUField
              label="CURRENT ACCESS TO WEAPONS?"
              fieldKey="hra_weaponAccess"
              detailsKey="hra_weaponAccessDetails"
            />

            {/* Hopelessness */}
            <div className="space-y-1.5">
              <Label className="slds-form-label" style={{ color: "#706e6b" }}>
                CURRENT LEVEL OF HOPELESSNESS
              </Label>
              <div className="flex flex-wrap gap-2">
                {(["None", "Mild", "Moderate", "Severe", "Unknown"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setPlanForm((f: any) => ({
                        ...f,
                        hra_hopelessnessLevel: f.hra_hopelessnessLevel === opt ? "" : opt,
                      }))
                    }
                    className="h-8 px-4 rounded-full slds-text-4 font-medium transition-colors"
                    style={{
                      border: `1px solid ${planForm.hra_hopelessnessLevel === opt ? "#145F33" : "#dddbda"}`,
                      backgroundColor: planForm.hra_hopelessnessLevel === opt ? "#e6f2eb" : "var(--slds-g-color-background-base)",
                      color: planForm.hra_hopelessnessLevel === opt ? "#145F33" : "var(--slds-g-color-text-default)",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {planForm.hra_hopelessnessLevel !== "" && (
                <Textarea
                  value={planForm.hra_hopelessnessDetails}
                  onChange={(e) => setPlanForm((f: any) => ({ ...f, hra_hopelessnessDetails: e.target.value }))}
                  placeholder="Details…"
                  className="slds-text-4 min-h-[60px] resize-y mt-1.5 bg-white"
                  style={fieldStyle}
                />
              )}
            </div>

            {/* Others – Harm only */}
            {typeOfHarm === "Others – Harm" && (
              <>
                <YNUField
                  label="IS THERE A PLAN TO HARM OTHERS?"
                  fieldKey="hra_planToHarmOthers"
                  detailsKey="hra_dutyToWarnDetails"
                />

                {planForm.hra_planToHarmOthers === "Yes" && (
                  <div
                    className="space-y-4 rounded-lg p-4"
                    style={{ backgroundColor: "#fff8e1", border: "1px solid #fde68a" }}
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#92400e" }} />
                      <p className="slds-text-4" style={{ color: "#92400e" }}>
                        Youth has indicated a plan to harm others. Complete all required fields below.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="slds-form-label" style={{ color: "#706e6b" }}>
                        WHO DOES THE YOUTH PLAN TO HARM?{" "}
                        <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        value={planForm.hra_whoYouthPlansToHarm}
                        onChange={(e) => setPlanForm((f: any) => ({ ...f, hra_whoYouthPlansToHarm: e.target.value }))}
                        placeholder="Describe the intended target…"
                        className="h-9 slds-text-4"
                        style={fieldStyle}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="slds-form-label" style={{ color: "#706e6b" }}>
                        DOES THE SITUATION TRIGGER DUTY TO WARN?{" "}
                        <span className="text-red-600">*</span>
                      </Label>
                      <div className="flex gap-3">
                        {(["Yes", "No"] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setPlanForm((f: any) => ({
                                ...f,
                                hra_dutyToWarn: f.hra_dutyToWarn === opt ? "" : opt,
                              }))
                            }
                            className="h-8 px-5 rounded-full slds-text-4 font-medium transition-colors"
                            style={{
                              border: `1px solid ${planForm.hra_dutyToWarn === opt ? "#c23934" : "#dddbda"}`,
                              backgroundColor: planForm.hra_dutyToWarn === opt ? "#fef2f2" : "var(--slds-g-color-background-base)",
                              color: planForm.hra_dutyToWarn === opt ? "#c23934" : "var(--slds-g-color-text-default)",
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 flex-shrink-0" style={{ color: "#0176d3" }} />
                      <a
                        href="#"
                        className="slds-text-4 font-medium"
                        style={{ color: "#0176d3" }}
                        onClick={(e) => e.preventDefault()}
                      >
                        Instructions – Duty to Warn Protocol
                      </a>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="slds-form-label" style={{ color: "#706e6b" }}>DETAILS</Label>
                      <Textarea
                        value={planForm.hra_dutyToWarnDetails}
                        onChange={(e) => setPlanForm((f: any) => ({ ...f, hra_dutyToWarnDetails: e.target.value }))}
                        placeholder="Document duty-to-warn details, actions taken, and notifications made…"
                        className="slds-text-4 min-h-[100px] resize-y bg-white"
                        style={fieldStyle}
                      />
                    </div>
                  </div>
                )}

                {/* Likelihood */}
                <div className="space-y-1.5">
                  <Label className="slds-form-label" style={{ color: "#706e6b" }}>
                    CURRENT LEVEL OF LIKELIHOOD YOUTH WILL CARRY OUT PLAN
                  </Label>
                  <select
                    value={planForm.hra_likelihood}
                    onChange={(e) => setPlanForm((f: any) => ({ ...f, hra_likelihood: e.target.value }))}
                    className="h-9 w-full px-3 rounded slds-text-4"
                    style={{
                      ...selectStyle,
                      color: planForm.hra_likelihood ? "var(--slds-g-color-text-default)" : "#706e6b",
                    }}
                  >
                    <option value="">Select likelihood…</option>
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Imminent">Imminent</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="border-t" style={{ borderColor: "#dddbda" }} />

          {/* 6. Protective Factors */}
          <div className="space-y-5">
            <p className="slds-text-4 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              Protective Factors & Safety Planning
            </p>

            {(
              [
                { listKey: "hra_strengths", newKey: "hra_newStrength", label: "CURRENT STRENGTHS", placeholder: "Add a strength…" },
                { listKey: "hra_resources", newKey: "hra_newResource", label: "CURRENT RESOURCES", placeholder: "Add a resource…" },
              ] as const
            ).map(({ listKey, newKey, label, placeholder }) => (
              <div key={listKey} className="space-y-2">
                <Label className="slds-form-label" style={{ color: "#706e6b" }}>{label}</Label>
                <div className="flex gap-2">
                  <Input
                    value={planForm[newKey] ?? ""}
                    onChange={(e) => setPlanForm((f: any) => ({ ...f, [newKey]: e.target.value }))}
                    placeholder={placeholder}
                    className="h-9 slds-text-4 flex-1"
                    style={fieldStyle}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && planForm[newKey]?.trim()) {
                        e.preventDefault();
                        const val = planForm[newKey].trim();
                        setPlanForm((f: any) => ({
                          ...f,
                          [listKey]: [...(f[listKey] ?? []), { id: Date.now(), text: val, editing: false, draft: "" }],
                          [newKey]: "",
                        }));
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      const val = planForm[newKey]?.trim();
                      if (!val) return;
                      setPlanForm((f: any) => ({
                        ...f,
                        [listKey]: [...(f[listKey] ?? []), { id: Date.now(), text: val, editing: false, draft: "" }],
                        [newKey]: "",
                      }));
                    }}
                    className="h-9 px-3 rounded-full slds-text-4 text-white"
                    style={{ backgroundColor: "#145F33" }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>
                {(planForm[listKey] ?? []).length > 0 && (
                  <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #dddbda" }}>
                    {(planForm[listKey] ?? []).map((item: any, idx: number) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-2"
                        style={{
                          borderBottom: idx < planForm[listKey].length - 1 ? "1px solid #dddbda" : "none",
                        }}
                      >
                        {item.editing ? (
                          <>
                            <Input
                              value={item.draft}
                              onChange={(e) =>
                                setPlanForm((f: any) => ({
                                  ...f,
                                  [listKey]: f[listKey].map((x: any) =>
                                    x.id === item.id ? { ...x, draft: e.target.value } : x
                                  ),
                                }))
                              }
                              className="h-8 slds-text-4 flex-1"
                              style={fieldStyle}
                              autoFocus
                            />
                            <button
                              onClick={() =>
                                setPlanForm((f: any) => ({
                                  ...f,
                                  [listKey]: f[listKey].map((x: any) =>
                                    x.id === item.id ? { ...x, text: x.draft, editing: false } : x
                                  ),
                                }))
                              }
                              className="p-1 rounded hover:bg-green-50"
                              title="Save"
                            >
                              <CheckCircle2 className="h-4 w-4" style={{ color: "#145F33" }} />
                            </button>
                            <button
                              onClick={() =>
                                setPlanForm((f: any) => ({
                                  ...f,
                                  [listKey]: f[listKey].map((x: any) =>
                                    x.id === item.id ? { ...x, editing: false, draft: x.text } : x
                                  ),
                                }))
                              }
                              className="p-1 rounded hover:bg-red-50"
                              title="Cancel"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="slds-text-4 flex-1" style={{ color: "var(--slds-g-color-text-default)" }}>
                              {item.text}
                            </span>
                            <button
                              onClick={() =>
                                setPlanForm((f: any) => ({
                                  ...f,
                                  [listKey]: f[listKey].map((x: any) =>
                                    x.id === item.id ? { ...x, editing: true, draft: x.text } : x
                                  ),
                                }))
                              }
                              className="p-1 rounded hover:bg-gray-100"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" style={{ color: "#0176d3" }} />
                            </button>
                            <button
                              onClick={() =>
                                setPlanForm((f: any) => ({
                                  ...f,
                                  [listKey]: f[listKey].filter((x: any) => x.id !== item.id),
                                }))
                              }
                              className="p-1 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {[
              { key: "hra_keepYouthNow", label: `WHAT CAN KEEP YOUTH FROM ${harmLabel.toUpperCase()} NOW?` },
              { key: "hra_keepYouthTomorrow", label: `WHAT CAN KEEP YOUTH FROM ${harmLabel.toUpperCase()} TOMORROW?` },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label className="slds-form-label" style={{ color: "#706e6b" }}>{label}</Label>
                <Textarea
                  value={planForm[key] ?? ""}
                  onChange={(e) => setPlanForm((f: any) => ({ ...f, [key]: e.target.value }))}
                  className="slds-text-4 min-h-[72px] resize-y bg-white"
                  style={fieldStyle}
                />
              </div>
            ))}
          </div>

          <div className="border-t" style={{ borderColor: "#dddbda" }} />

          {/* 7. Commitment */}
          <div className="space-y-4">
            <p className="slds-text-4 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              Commitment
            </p>
            <YNUField
              label="CAN YOUTH COMMIT TO A VERBAL SAFETY PLAN?"
              fieldKey="hra_verbalSafetyPlan"
              detailsKey="hra_verbalSafetyPlanDetails"
            />
          </div>

          {/* 8. Associated Agreement */}
          <div className="space-y-1.5">
            <Label className="slds-form-label" style={{ color: "#706e6b" }}>ASSOCIATED AGREEMENT</Label>
            <select
              value={planForm.hra_associatedAgreement}
              onChange={(e) => setPlanForm((f: any) => ({ ...f, hra_associatedAgreement: e.target.value }))}
              className="h-9 w-full px-3 rounded slds-text-4"
              style={{
                ...selectStyle,
                color: planForm.hra_associatedAgreement ? "var(--slds-g-color-text-default)" : "#706e6b",
              }}
            >
              <option value="">Select associated agreement…</option>
              <option value="No Harm Contract">No Harm Contract</option>
              <option value="Safety Plan">Safety Plan</option>
              <option value="Suicide Prevention Agreement">Suicide Prevention Agreement</option>
              <option value="Self Harm Safety Plan">Self Harm Safety Plan</option>
              <option value="Relapse Prevention Plan">Relapse Prevention Plan</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}
