import { useState } from "react";
import {
  Check,
  ChevronDown,
  EyeOff,
  Hash,
  Lock,
  Mail,
  Search,
  X,
} from "@/app/lib/lucide-icons";
import {
  ShowcaseCard,
  CopyCSSBtn,
  FieldLabel,
  SizeCaption,
  ErrorMessage,
} from "./ShowcaseCard";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "../../ui/select";
import { Input } from "../../ui/input";
import { FilterField } from "../../ui/field";
import { Checkbox } from "../../ui/checkbox";
import { Switch } from "../../ui/switch";
import {
  FileUpload,
  type FileUploadState,
} from "../../ui/file-upload";

// "Copy CSS" buttons should hand back portable CSS a consumer can paste
// anywhere — not var(--slds-g-*) references that only resolve inside this
// app's own stylesheet. The live demos below keep using the real tokens
// (so they still update if a token changes); this map is only consulted
// when building the copy-to-clipboard string.
// Note: --slds-g-color-neutral-95 isn't actually defined anywhere in
// globals.css/default_theme.css — it's a dead reference already present in
// this file's live styles. #f3f2f2 is the same "disabled surface" value
// every other raw snippet in this file already uses, so it's the closest
// faithful stand-in, not a guess pulled from nowhere.
const RAW_CSS_VALUE: Record<string, string> = {
  "var(--slds-g-color-border-base-1)": "#dddbda",
  "var(--slds-g-color-background-base)": "#ffffff",
  "var(--slds-g-color-background-alt)": "#fafaf9",
  "var(--slds-g-color-neutral-95)": "#f3f2f2",
  "var(--slds-g-color-text-weak)": "#706e6b",
  "var(--slds-g-color-text-default)": "#080707",
  "var(--slds-c-input-radius-border)": "0.25rem",
};
const toRawCss = (value: string) =>
  RAW_CSS_VALUE[value] ?? value;

// Each demo row below is driven by one of these tokens (the same handful of
// real state colors used throughout Form Controls) -- this maps that token
// to the Tailwind class carrying it, so the live preview and the Copy CSS
// string are always generated from one source of truth instead of the
// class being hand-typed separately per row.
const BORDER_CLASS: Record<string, string> = {
  "var(--slds-g-color-border-base-1)":
    "border-[var(--slds-g-color-border-base-1)]",
  "#b0adab": "border-[#b0adab]",
  "#145F33": "border-[#145F33]",
  "#A82031": "border-[#A82031]",
};
const TEXT_COLOR_CLASS: Record<string, string> = {
  "var(--slds-g-color-text-weak)":
    "text-[var(--slds-g-color-text-weak)]",
  "#145F33": "text-[#145F33]",
  "#A82031": "text-[#A82031]",
};
const BG_CLASS: Record<string, string> = {
  "#ffffff": "",
  "var(--slds-g-color-background-alt)":
    "bg-[var(--slds-g-color-background-alt)]",
  "var(--slds-g-color-neutral-95)": "bg-[#f3f2f2]",
};

interface FieldState {
  state: string;
  note: string;
  border: string;
  iconColor: string;
  bg: string;
  cursor: string;
  val: string;
  readOnly: boolean;
  disabled: boolean;
  focused?: boolean;
  errorMsg: string;
}

const SIZES = [
  { size: "md", label: "Medium — 36px" },
  { size: "sm", label: "Small — 28px" },
] as const;

// Local, tiny class-join helper -- this file doesn't otherwise need the
// shared cn() util wired in, and pulling it in just for the few conditional
// classes below would be more import surface than the one-liner here.
function cn_(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// Shared by the Number Input (FRM-06), Search Box (FRM-07) and Combobox
// (FRM-08) demos: all three fields use this same default/hover/focus/
// readonly/disabled/error border+background+cursor palette, so it's hoisted
// here (rather than left as a local literal per-section) and reused by
// generateFieldStateCSS() below to produce the exact per-state/per-size
// "Copy CSS" text without retyping it a third time.
const fieldInteractionStates: FieldState[] = [
  {
    state: "default",
    note: "",
    border: "var(--slds-g-color-border-base-1)",
    iconColor: "var(--slds-g-color-text-weak)",
    bg: "#ffffff",
    cursor: "auto",
    val: "15",
    readOnly: true,
    disabled: false,
    errorMsg: "",
  },
  {
    state: "hover",
    note: " (hover state)",
    border: "#b0adab",
    iconColor: "var(--slds-g-color-text-weak)",
    bg: "#ffffff",
    cursor: "auto",
    val: "15",
    readOnly: true,
    disabled: false,
    errorMsg: "",
  },
  {
    state: "focus",
    note: " (focus state)",
    border: "#145F33",
    iconColor: "#145F33",
    bg: "#ffffff",
    cursor: "auto",
    val: "15",
    readOnly: true,
    disabled: false,
    focused: true,
    errorMsg: "",
  },
  {
    state: "readonly",
    note: " (read-only)",
    border: "var(--slds-g-color-border-base-1)",
    iconColor: "var(--slds-g-color-text-weak)",
    bg: "var(--slds-g-color-background-alt)",
    cursor: "not-allowed",
    val: "15",
    readOnly: true,
    disabled: false,
    errorMsg: "",
  },
  {
    state: "disabled",
    note: "",
    border: "var(--slds-g-color-border-base-1)",
    iconColor: "var(--slds-g-color-text-weak)",
    bg: "var(--slds-g-color-neutral-95)",
    cursor: "not-allowed",
    val: "",
    readOnly: false,
    disabled: true,
    errorMsg: "",
  },
  {
    state: "error",
    note: "",
    border: "#A82031",
    iconColor: "#A82031",
    bg: "#ffffff",
    cursor: "auto",
    val: "999",
    readOnly: true,
    disabled: false,
    errorMsg: "Age must be between 0 and 21",
  },
];

// Reused by the "All CSS Files" download (componentsCssRegistry.ts) to
// produce the exact same per-state/per-size rules the Copy CSS buttons on
// FRM-06/07/08 hand back, instead of a hand-copied (and driftable) snapshot.
export function generateFieldStateCSS(): string {
  const selectors = [
    ".form-input--number--",
    ".form-input--search--",
    ".combobox-trigger--",
  ];
  const parts: string[] = [];
  selectors.forEach((selector) => {
    fieldInteractionStates.forEach((s) => {
      SIZES.forEach((sz) => {
        const suffix = sz.size === "sm" ? "--sm" : "";
        const cursorLine =
          s.cursor === "not-allowed"
            ? "\n  cursor: not-allowed;"
            : "";
        parts.push(
          `${selector}${s.state}${suffix} {\n  border: 1px solid ${toRawCss(s.border)};\n  background-color: ${toRawCss(s.bg)};${cursorLine}\n}`,
        );
      });
    });
  });
  return parts.join("\n\n");
}

export function FormControlsSection() {
  const [selectVal, setSelectVal] = useState("");

  const searchStates: (FieldState & { showClear: boolean })[] =
    [
      {
        state: "default",
        note: "",
        border: "var(--slds-g-color-border-base-1)",
        iconColor: "var(--slds-g-color-text-weak)",
        bg: "#ffffff",
        cursor: "auto",
        val: "Marcus Johnson",
        readOnly: true,
        disabled: false,
        showClear: true,
        errorMsg: "",
      },
      {
        state: "hover",
        note: " (hover state)",
        border: "#b0adab",
        iconColor: "var(--slds-g-color-text-weak)",
        bg: "#ffffff",
        cursor: "auto",
        val: "Marcus Johnson",
        readOnly: true,
        disabled: false,
        showClear: true,
        errorMsg: "",
      },
      {
        state: "focus",
        note: " (focus state)",
        border: "#145F33",
        iconColor: "#145F33",
        bg: "#ffffff",
        cursor: "auto",
        val: "Marcus Johnson",
        readOnly: true,
        disabled: false,
        focused: true,
        showClear: true,
        errorMsg: "",
      },
      {
        state: "readonly",
        note: " (read-only)",
        border: "var(--slds-g-color-border-base-1)",
        iconColor: "var(--slds-g-color-text-weak)",
        bg: "var(--slds-g-color-background-alt)",
        cursor: "not-allowed",
        val: "Marcus Johnson",
        readOnly: true,
        disabled: false,
        showClear: false,
        errorMsg: "",
      },
      {
        state: "disabled",
        note: "",
        border: "var(--slds-g-color-border-base-1)",
        iconColor: "var(--slds-g-color-text-weak)",
        bg: "var(--slds-g-color-neutral-95)",
        cursor: "not-allowed",
        val: "",
        readOnly: false,
        disabled: true,
        showClear: false,
        errorMsg: "",
      },
      {
        state: "error",
        note: "",
        border: "#A82031",
        iconColor: "#A82031",
        bg: "#ffffff",
        cursor: "auto",
        val: "",
        readOnly: true,
        disabled: false,
        showClear: false,
        errorMsg: "No results — check spelling",
      },
    ];

  const fileStates: {
    state: FileUploadState;
    note: string;
    fileName: string;
    placeholder: string;
    helperText: string;
    disabled: boolean;
    errorMsg: string;
  }[] = [
    {
      state: "default",
      note: "",
      fileName: "",
      placeholder: "Drag & drop or click to upload",
      helperText: "PDF, PNG, JPG up to 10MB",
      disabled: false,
      errorMsg: "",
    },
    {
      state: "hover",
      note: " (hover state)",
      fileName: "",
      placeholder: "Drag & drop or click to upload",
      helperText: "PDF, PNG, JPG up to 10MB",
      disabled: false,
      errorMsg: "",
    },
    {
      state: "focus",
      note: " (focus state)",
      fileName: "",
      placeholder: "Drag & drop or click to upload",
      helperText: "PDF, PNG, JPG up to 10MB",
      disabled: false,
      errorMsg: "",
    },
    {
      state: "default",
      note: " (read-only, file attached)",
      fileName: "birth-certificate.pdf",
      placeholder: "",
      helperText: "",
      disabled: false,
      errorMsg: "",
    },
    {
      state: "default",
      note: "",
      fileName: "",
      placeholder: "",
      helperText: "",
      disabled: true,
      errorMsg: "",
    },
    {
      state: "error",
      note: "",
      fileName: "",
      placeholder: "Drag & drop or click to upload",
      helperText: "",
      disabled: false,
      errorMsg: "File exceeds 10MB limit",
    },
  ];

  return (
    <div id="sec-form-controls">
      <h3 className="slds-section-title mb-4">Form Controls</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShowcaseCard
          id="FRM-01"
          title="Text Inputs"
          cssCode={`.form-label { display: block; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.025em; color: #706e6b; margin-bottom: 6px; }\n.form-input { width: 100%; padding: 8px 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #ffffff; }\n.form-input:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }\n.form-input--readonly { background-color: #fafaf9; cursor: not-allowed; }\n.form-input--disabled { background-color: #f3f2f2; cursor: not-allowed; }\n.form-input--error { border-color: #A82031; }\n.form-error-msg { font-size: 11px; color: #A82031; margin-top: 4px; }`}
        >
          <div className="space-y-4">
            {/* Label — no size variant */}
            <div>
              <div className="flex flex-wrap items-baseline gap-4 mb-1">
                <FieldLabel>Label</FieldLabel>
                <FieldLabel required>Required Label</FieldLabel>
              </div>
              <CopyCSSBtn
                css={`
                  .form-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                    color: #706e6b;
                    margin-bottom: 6px;
                  }
                  \n.form-label--required .required-asterisk {
                    color: #c23934;
                  }
                `}
              />
            </div>
            {/* Default */}
            <div>
              <FieldLabel required>First Name</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SizeCaption>Medium — 36px</SizeCaption>
                  <Input size="md" defaultValue="Marcus" />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input {
                          height: 36px;
                          padding: 0 12px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 13px;
                          background-color: #ffffff;
                        }
                      `}
                    />
                  </div>
                </div>
                <div>
                  <SizeCaption>Small — 28px</SizeCaption>
                  <Input size="sm" defaultValue="Marcus" />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--sm {
                          height: 28px;
                          padding: 0 10px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 12px;
                          background-color: #ffffff;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Placeholder */}
            <div>
              <FieldLabel>Email</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SizeCaption>Medium — 36px</SizeCaption>
                  <Input
                    size="md"
                    placeholder="Enter email address"
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--placeholder {
                          height: 36px;
                          padding: 0 12px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 13px;
                          color: #9e9e9c;
                        }
                      `}
                    />
                  </div>
                </div>
                <div>
                  <SizeCaption>Small — 28px</SizeCaption>
                  <Input size="sm" placeholder="Enter email" />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--placeholder--sm {
                          height: 28px;
                          padding: 0 10px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 12px;
                          color: #9e9e9c;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Error */}
            <div>
              <FieldLabel error required>
                Phone
              </FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SizeCaption>Medium — 36px</SizeCaption>
                  <Input size="md" readOnly aria-invalid />
                  <ErrorMessage>
                    This field is required
                  </ErrorMessage>
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--error {
                          height: 36px;
                          padding: 0 12px;
                          width: 100%;
                          border: 1px solid #a82031;
                          border-radius: 4px;
                          font-size: 13px;
                        }
                        \n.form-error-msg {
                          font-size: 11px;
                          color: #a82031;
                          margin-top: 4px;
                        }
                      `}
                    />
                  </div>
                </div>
                <div>
                  <SizeCaption>Small — 28px</SizeCaption>
                  <Input size="sm" readOnly aria-invalid />
                  <ErrorMessage>
                    This field is required
                  </ErrorMessage>
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--error--sm {
                          height: 28px;
                          padding: 0 10px;
                          width: 100%;
                          border: 1px solid #a82031;
                          border-radius: 4px;
                          font-size: 12px;
                        }
                        \n.form-error-msg {
                          font-size: 11px;
                          color: #a82031;
                          margin-top: 4px;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Read-Only */}
            <div>
              <FieldLabel note="(read-only)">
                Organization
              </FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SizeCaption>Medium — 36px</SizeCaption>
                  <Input
                    size="md"
                    defaultValue="Mercy Home"
                    readOnly
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--readonly {
                          height: 36px;
                          padding: 0 12px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 13px;
                          background-color: #fafaf9;
                          cursor: not-allowed;
                        }
                      `}
                    />
                  </div>
                </div>
                <div>
                  <SizeCaption>Small — 28px</SizeCaption>
                  <Input
                    size="sm"
                    defaultValue="Mercy Home"
                    readOnly
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--readonly--sm {
                          height: 28px;
                          padding: 0 10px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 12px;
                          background-color: #fafaf9;
                          cursor: not-allowed;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Disabled */}
            <div>
              <FieldLabel>Assigned Worker</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SizeCaption>Medium — 36px</SizeCaption>
                  <Input
                    size="md"
                    disabled
                    placeholder="Not available"
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--disabled {
                          height: 36px;
                          padding: 0 12px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 13px;
                          background-color: #f3f2f2;
                          cursor: not-allowed;
                        }
                      `}
                    />
                  </div>
                </div>
                <div>
                  <SizeCaption>Small — 28px</SizeCaption>
                  <Input
                    size="sm"
                    disabled
                    placeholder="Not available"
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--disabled--sm {
                          height: 28px;
                          padding: 0 10px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 12px;
                          background-color: #f3f2f2;
                          cursor: not-allowed;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Focus */}
            <div>
              <FieldLabel note="(focus state)">
                Search
              </FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SizeCaption>Medium — 36px</SizeCaption>
                  <Input
                    size="md"
                    defaultValue="Youth name..."
                    readOnly
                    focused
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input:focus {
                          border-color: #145f33;
                          box-shadow: 0 0 0 3px
                            rgba(20, 95, 51, 0.2);
                          outline: none;
                        }
                      `}
                    />
                  </div>
                </div>
                <div>
                  <SizeCaption>Small — 28px</SizeCaption>
                  <Input
                    size="sm"
                    defaultValue="Youth name..."
                    readOnly
                    focused
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--sm:focus {
                          border-color: #145f33;
                          box-shadow: 0 0 0 3px
                            rgba(20, 95, 51, 0.2);
                          outline: none;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseCard>
        <ShowcaseCard
          id="FRM-01B"
          title="Filter Field"
          description="FieldLabel stacked over a 36px control (Input size=md or Select). Search and filter bars lay out with FilterField so label spacing and type match everywhere."
        >
          <div className="flex flex-wrap items-end gap-[var(--app-content-gap)]">
            <FilterField
              label="Mentee Name"
              htmlFor="frm-01b-name"
            >
              <Input
                id="frm-01b-name"
                size="md"
                className="w-56"
                placeholder="Search"
              />
            </FilterField>
            <FilterField label="Age" htmlFor="frm-01b-age">
              <Select defaultValue="all">
                <SelectTrigger
                  id="frm-01b-age"
                  className="w-36"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="5-10">5-10</SelectItem>
                </SelectContent>
              </Select>
            </FilterField>
          </div>
        </ShowcaseCard>
        <ShowcaseCard
          id="FRM-02"
          title="Select, Checkbox & Toggle"
          cssCode={`.form-select { appearance: none; width: 100%; padding: 8px 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #ffffff; }\n.form-select:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }\n.form-select--disabled { background-color: #f3f2f2; cursor: not-allowed; opacity: 0.6; }\n.checkbox { width: 16px; height: 16px; border-radius: 4px; }\n.checkbox--checked { background-color: #145F33; }\n.checkbox--unchecked { border: 1px solid #c9c7c5; }\n.checkbox--disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }\n.toggle { width: 36px; height: 20px; border-radius: 9999px; position: relative; }\n.toggle--on { background-color: #145F33; }\n.toggle--off { background-color: #9e9e9c; }\n.toggle-thumb { position: absolute; top: 2px; width: 16px; height: 16px; border-radius: 9999px; background-color: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }\n.toggle--disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }`}
        >
          <div className="space-y-4">
            {/* Select — 3 states */}
            <div>
              <p className="slds-form-label mb-2 text-[var(--slds-g-color-text-weak)]">
                Select
              </p>
              <div className="space-y-3">
                {/* Default */}
                <div>
                  <label className="block mb-1 text-[11px] text-[var(--slds-g-color-text-weak)]">
                    Default
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <SizeCaption>Medium — 36px</SizeCaption>
                      <Select
                        value={selectVal}
                        onValueChange={(v) => setSelectVal(v)}
                      >
                        <SelectTrigger
                          size="default"
                          className="w-full"
                        >
                          <SelectValue placeholder="Please Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Boys Program">
                            Boys Program
                          </SelectItem>
                          <SelectItem value="Girls Program">
                            Girls Program
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="mt-1">
                        <CopyCSSBtn
                          css={`
                            .form-select {
                              display: flex;
                              align-items: center;
                              justify-content: space-between;
                              gap: 8px;
                              height: 36px;
                              padding: 8px 12px;
                              width: 100%;
                              border: 1px solid #dddbda;
                              border-radius: 4px;
                              font-size: 13px;
                              color: #212529;
                              background-color: #ffffff;
                              cursor: pointer;
                            }
                            .form-select__chevron {
                              width: 16px;
                              height: 16px;
                              flex-shrink: 0;
                              color: #54595f;
                              opacity: 0.5;
                            }
                          `}
                        />
                      </div>
                    </div>
                    <div>
                      <SizeCaption>Small — 28px</SizeCaption>
                      <Select
                        value={selectVal}
                        onValueChange={(v) => setSelectVal(v)}
                      >
                        <SelectTrigger
                          size="sm"
                          className="w-full"
                        >
                          <SelectValue placeholder="Please Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Boys Program">
                            Boys Program
                          </SelectItem>
                          <SelectItem value="Girls Program">
                            Girls Program
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="mt-1">
                        <CopyCSSBtn
                          css={`
                            .form-select--sm {
                              display: flex;
                              align-items: center;
                              justify-content: space-between;
                              gap: 6px;
                              height: 28px;
                              padding: 4px 10px;
                              width: 100%;
                              border: 1px solid #dddbda;
                              border-radius: 0.25rem;
                              font-size: 12px;
                              color: #212529;
                              background-color: #ffffff;
                              cursor: pointer;
                            }
                            .form-select__chevron {
                              width: 16px;
                              height: 16px;
                              flex-shrink: 0;
                              color: #54595f;
                              opacity: 0.5;
                            }
                          `}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Focus — real Select, ring forced on via the same border-ring/ring-ring/50 classes
                    SelectTrigger applies under focus-visible, so the color always tracks the
                    real --ring token instead of a hand-copied hex value. */}
                <div>
                  <label className="block mb-1 text-[11px] text-[var(--slds-g-color-text-weak)]">
                    Focus
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <SizeCaption>Medium — 36px</SizeCaption>
                      <Select defaultValue="Boys Program">
                        <SelectTrigger
                          size="default"
                          focused
                          className="w-full"
                        >
                          <SelectValue placeholder="Please Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Boys Program">
                            Boys Program
                          </SelectItem>
                          <SelectItem value="Girls Program">
                            Girls Program
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="mt-1">
                        <CopyCSSBtn
                          css={`
                            .form-select:focus {
                              border-color: #145f33;
                              box-shadow: 0 0 0 3px
                                rgba(20, 95, 51, 0.5);
                              outline: none;
                            }
                          `}
                        />
                      </div>
                    </div>
                    <div>
                      <SizeCaption>Small — 28px</SizeCaption>
                      <Select defaultValue="Boys Program">
                        <SelectTrigger
                          size="sm"
                          focused
                          className="w-full"
                        >
                          <SelectValue placeholder="Please Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Boys Program">
                            Boys Program
                          </SelectItem>
                          <SelectItem value="Girls Program">
                            Girls Program
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="mt-1">
                        <CopyCSSBtn
                          css={`
                            .form-select--sm:focus {
                              border-color: #145f33;
                              box-shadow: 0 0 0 3px
                                rgba(20, 95, 51, 0.5);
                              outline: none;
                            }
                          `}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Disabled — real Select with the `disabled` prop; SelectTrigger's own
                    disabled:cursor-not-allowed disabled:opacity-50 classes handle the look. */}
                <div>
                  <label className="block mb-1 text-[11px] text-[var(--slds-g-color-text-weak)]">
                    Disabled
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <SizeCaption>Medium — 36px</SizeCaption>
                      <Select
                        defaultValue="Boys Program"
                        disabled
                      >
                        <SelectTrigger
                          size="default"
                          className="w-full"
                        >
                          <SelectValue placeholder="Please Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Boys Program">
                            Boys Program
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="mt-1">
                        <CopyCSSBtn
                          css={`
                            .form-select--disabled {
                              height: 36px;
                              padding: 8px 12px;
                              width: 100%;
                              border: 1px solid #dddbda;
                              border-radius: 4px;
                              font-size: 13px;
                              color: #212529;
                              background-color: #ffffff;
                              cursor: not-allowed;
                              opacity: 0.5;
                            }
                          `}
                        />
                      </div>
                    </div>
                    <div>
                      <SizeCaption>Small — 28px</SizeCaption>
                      <Select
                        defaultValue="Boys Program"
                        disabled
                      >
                        <SelectTrigger
                          size="sm"
                          className="w-full"
                        >
                          <SelectValue placeholder="Please Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Boys Program">
                            Boys Program
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="mt-1">
                        <CopyCSSBtn
                          css={`
                            .form-select--disabled--sm {
                              height: 28px;
                              padding: 4px 10px;
                              width: 100%;
                              border: 1px solid #dddbda;
                              border-radius: 4px;
                              font-size: 12px;
                              color: #212529;
                              background-color: #ffffff;
                              cursor: not-allowed;
                              opacity: 0.5;
                            }
                          `}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Dropdown — the popover panel + option rows shown when the
                    trigger opens. SelectContent only renders while open, so
                    this is a static preview built from the same colors/spacing
                    the real component computes (bg-popover, --accent hover,
                    rounded-sm items) — not a separate invented look. */}
                <div>
                  <label className="block mb-1 text-[11px] text-[var(--slds-g-color-text-weak)]">
                    Dropdown (Options List)
                  </label>
                  <div className="max-w-xs rounded border border-[var(--slds-g-color-border-base-1)] bg-[var(--slds-g-color-background-base)] p-1 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-2 rounded-sm bg-[#f9fafb] px-2 py-1.5 text-[14px] text-[#145F33]">
                      <Check className="h-4 w-4" />
                      Boys Program
                    </div>
                    <div className="flex items-center rounded-sm py-1.5 pl-8 pr-2 text-[14px] text-[#212529]">
                      Girls Program
                    </div>
                  </div>
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        /* Popover panel */
                        .form-select__content {
                          position: absolute;
                          z-index: 50;
                          min-width: 128px;
                          max-height: 96vh;
                          overflow: hidden;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          background-color: #ffffff;
                          color: #212529;
                          box-shadow:
                            0 4px 6px -1px rgba(0, 0, 0, 0.1),
                            0 2px 4px -2px rgba(0, 0, 0, 0.1);
                          padding: 4px;
                        }

                        /* Each option row */
                        .form-select__item {
                          position: relative;
                          display: flex;
                          align-items: center;
                          gap: 8px;
                          width: 100%;
                          padding: 6px 32px 6px 8px;
                          border-radius: 2px;
                          font-size: 14px;
                          cursor: default;
                          user-select: none;
                        }
                        .form-select__item:hover,
                        .form-select__item--highlighted {
                          background-color: #f9fafb;
                          color: #145f33;
                        }
                        .form-select__item--disabled {
                          pointer-events: none;
                          opacity: 0.5;
                        }

                        /* Checkmark on the currently-selected option */
                        .form-select__item-check {
                          position: absolute;
                          right: 8px;
                          top: 50%;
                          transform: translateY(-50%);
                          width: 16px;
                          height: 16px;
                        }

                        /* The real open/close motion comes from Radix's data-state attribute
   plus an animation plugin, and isn't reproduced exactly — this is a
   close, portable approximation of it: */
                        .form-select__content[data-state="open"] {
                          animation: form-select-in 150ms
                            ease-out;
                        }
                        @keyframes form-select-in {
                          from {
                            opacity: 0;
                            transform: scale(0.95);
                          }
                          to {
                            opacity: 1;
                            transform: scale(1);
                          }
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Checkbox — 4 states, each with its own CopyCSSBtn */}
            <div>
              <p className="slds-form-label mb-2 text-[var(--slds-g-color-text-weak)]">
                Checkbox
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="group/item flex flex-col items-center gap-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[length:var(--slds-g-font-size-4)]">
                    <Checkbox checked />
                    Checked
                  </label>
                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <CopyCSSBtn
                      css={`
                        .checkbox--checked {
                          width: 16px;
                          height: 16px;
                          border-radius: 4px;
                          background-color: #145f33;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                        }
                      `}
                    />
                  </div>
                </div>
                <div className="group/item flex flex-col items-center gap-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[length:var(--slds-g-font-size-4)]">
                    <Checkbox />
                    Unchecked
                  </label>
                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <CopyCSSBtn
                      css={`
                        .checkbox--unchecked {
                          width: 16px;
                          height: 16px;
                          border-radius: 4px;
                          border: 1px solid #c9c7c5;
                        }
                      `}
                    />
                  </div>
                </div>
                <div className="group/item flex flex-col items-center gap-1">
                  <label className="flex items-center gap-2 text-[length:var(--slds-g-font-size-4)]">
                    <Checkbox checked disabled />
                    Disabled On
                  </label>
                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <CopyCSSBtn
                      css={`
                        .checkbox--disabled {
                          opacity: 0.5;
                          cursor: not-allowed;
                          pointer-events: none;
                        }
                      `}
                    />
                  </div>
                </div>
                <div className="group/item flex flex-col items-center gap-1">
                  <label className="flex items-center gap-2 text-[length:var(--slds-g-font-size-4)]">
                    <Checkbox disabled />
                    Disabled Off
                  </label>
                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <CopyCSSBtn
                      css={`
                        .checkbox--disabled {
                          opacity: 0.5;
                          cursor: not-allowed;
                          pointer-events: none;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Toggle — 4 states, each with its own CopyCSSBtn */}
            <div>
              <p className="slds-form-label mb-2 text-[var(--slds-g-color-text-weak)]">
                Toggle
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="group/item flex flex-col items-center gap-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[length:var(--slds-g-font-size-4)]">
                    <Switch checked />
                    On
                  </label>
                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <CopyCSSBtn
                      css={`
                        .toggle--on {
                          width: 36px;
                          height: 20px;
                          border-radius: 9999px;
                          position: relative;
                          background-color: #145f33;
                        }
                        \n.toggle-thumb {
                          position: absolute;
                          top: 2px;
                          right: 2px;
                          width: 16px;
                          height: 16px;
                          border-radius: 9999px;
                          background-color: #ffffff;
                          box-shadow: 0 1px 3px
                            rgba(0, 0, 0, 0.2);
                        }
                      `}
                    />
                  </div>
                </div>
                <div className="group/item flex flex-col items-center gap-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[length:var(--slds-g-font-size-4)]">
                    <Switch />
                    Off
                  </label>
                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <CopyCSSBtn
                      css={`
                        .toggle--off {
                          width: 36px;
                          height: 20px;
                          border-radius: 9999px;
                          position: relative;
                          background-color: #9e9e9c;
                        }
                        \n.toggle-thumb {
                          position: absolute;
                          top: 2px;
                          left: 2px;
                          width: 16px;
                          height: 16px;
                          border-radius: 9999px;
                          background-color: #ffffff;
                          box-shadow: 0 1px 3px
                            rgba(0, 0, 0, 0.2);
                        }
                      `}
                    />
                  </div>
                </div>
                <div className="group/item flex flex-col items-center gap-1">
                  <label className="flex items-center gap-2 text-[length:var(--slds-g-font-size-4)]">
                    <Switch checked disabled />
                    Disabled On
                  </label>
                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <CopyCSSBtn
                      css={`
                        .toggle--disabled {
                          opacity: 0.5;
                          cursor: not-allowed;
                          pointer-events: none;
                        }
                      `}
                    />
                  </div>
                </div>
                <div className="group/item flex flex-col items-center gap-1">
                  <label className="flex items-center gap-2 text-[length:var(--slds-g-font-size-4)]">
                    <Switch disabled />
                    Disabled Off
                  </label>
                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <CopyCSSBtn
                      css={`
                        .toggle--disabled {
                          opacity: 0.5;
                          cursor: not-allowed;
                          pointer-events: none;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseCard>

        {/* FRM-04 — Password Input */}
        <ShowcaseCard
          id="FRM-04"
          title="Password Input"
          description="Same token family as Text Inputs (FRM-01) — leading lock icon, trailing show/hide toggle. Hover is a new state added for consistency across all input types (FRM-01 didn't demo it): border darkens from #dddbda to #b0adab before focus."
          cssCode={`.form-input--password { height: 36px; padding: 0 36px; width: 100%; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #ffffff; }\n.form-input--password:hover { border-color: #b0adab; }\n.form-input--password:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }\n.form-input--password--readonly { background-color: #fafaf9; cursor: not-allowed; }\n.form-input--password--disabled { background-color: #f3f2f2; cursor: not-allowed; }\n.form-input--password--error { border-color: #A82031; }`}
        >
          <div className="space-y-4">
            {/* Default */}
            <div>
              <FieldLabel required>Password</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SizeCaption>Medium — 36px</SizeCaption>
                  <Input
                    type="password"
                    size="md"
                    defaultValue="MercyHome!23"
                    readOnly
                    leadingIcon={
                      <Lock className="h-4 w-4 text-[var(--slds-g-color-text-weak)]" />
                    }
                    trailingIcon={
                      <EyeOff className="h-4 w-4 cursor-pointer text-[var(--slds-g-color-text-weak)]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--password {
                          height: 36px;
                          padding: 0 36px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 13px;
                          background-color: #ffffff;
                        }
                      `}
                    />
                  </div>
                </div>
                <div>
                  <SizeCaption>Small — 28px</SizeCaption>
                  <Input
                    type="password"
                    size="sm"
                    defaultValue="MercyHome!23"
                    readOnly
                    leadingIcon={
                      <Lock className="h-3.5 w-3.5 text-[var(--slds-g-color-text-weak)]" />
                    }
                    trailingIcon={
                      <EyeOff className="h-3.5 w-3.5 cursor-pointer text-[var(--slds-g-color-text-weak)]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--password--sm {
                          height: 28px;
                          padding: 0 30px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 12px;
                          background-color: #ffffff;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Hover */}
            <div>
              <FieldLabel note="(hover state)">
                Password
              </FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SizeCaption>Medium — 36px</SizeCaption>
                  <Input
                    type="password"
                    size="md"
                    defaultValue="MercyHome!23"
                    readOnly
                    hovered
                    leadingIcon={
                      <Lock className="h-4 w-4 text-[var(--slds-g-color-text-weak)]" />
                    }
                    trailingIcon={
                      <EyeOff className="h-4 w-4 text-[var(--slds-g-color-text-weak)]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--password:hover {
                          border-color: #b0adab;
                        }
                      `}
                    />
                  </div>
                </div>
                <div>
                  <SizeCaption>Small — 28px</SizeCaption>
                  <Input
                    type="password"
                    size="sm"
                    defaultValue="MercyHome!23"
                    readOnly
                    hovered
                    leadingIcon={
                      <Lock className="h-3.5 w-3.5 text-[var(--slds-g-color-text-weak)]" />
                    }
                    trailingIcon={
                      <EyeOff className="h-3.5 w-3.5 text-[var(--slds-g-color-text-weak)]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--password--sm:hover {
                          border-color: #b0adab;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Focused */}
            <div>
              <FieldLabel note="(focus state)">
                Password
              </FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SizeCaption>Medium — 36px</SizeCaption>
                  <Input
                    type="password"
                    size="md"
                    defaultValue="MercyHome!23"
                    readOnly
                    focused
                    leadingIcon={
                      <Lock className="h-4 w-4 text-[#145F33]" />
                    }
                    trailingIcon={
                      <EyeOff className="h-4 w-4 text-[var(--slds-g-color-text-weak)]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--password:focus {
                          border-color: #145f33;
                          box-shadow: 0 0 0 3px
                            rgba(20, 95, 51, 0.2);
                          outline: none;
                        }
                      `}
                    />
                  </div>
                </div>
                <div>
                  <SizeCaption>Small — 28px</SizeCaption>
                  <Input
                    type="password"
                    size="sm"
                    defaultValue="MercyHome!23"
                    readOnly
                    focused
                    leadingIcon={
                      <Lock className="h-3.5 w-3.5 text-[#145F33]" />
                    }
                    trailingIcon={
                      <EyeOff className="h-3.5 w-3.5 text-[var(--slds-g-color-text-weak)]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--password--sm:focus {
                          border-color: #145f33;
                          box-shadow: 0 0 0 3px
                            rgba(20, 95, 51, 0.2);
                          outline: none;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Read-only */}
            <div>
              <FieldLabel note="(read-only)">
                Password
              </FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SizeCaption>Medium — 36px</SizeCaption>
                  <Input
                    type="password"
                    size="md"
                    defaultValue="MercyHome!23"
                    readOnly
                    leadingIcon={
                      <Lock className="h-4 w-4 text-[var(--slds-g-color-text-weak)]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--password--readonly {
                          background-color: #fafaf9;
                          cursor: not-allowed;
                        }
                      `}
                    />
                  </div>
                </div>
                <div>
                  <SizeCaption>Small — 28px</SizeCaption>
                  <Input
                    type="password"
                    size="sm"
                    defaultValue="MercyHome!23"
                    readOnly
                    leadingIcon={
                      <Lock className="h-3.5 w-3.5 text-[var(--slds-g-color-text-weak)]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--password--readonly--sm {
                          background-color: #fafaf9;
                          cursor: not-allowed;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Disabled */}
            <div>
              <FieldLabel>Password</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SizeCaption>Medium — 36px</SizeCaption>
                  <Input
                    type="password"
                    size="md"
                    disabled
                    placeholder="Not available"
                    leadingIcon={
                      <Lock className="h-4 w-4 text-[var(--slds-g-color-text-weak)]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--password--disabled {
                          background-color: #f3f2f2;
                          cursor: not-allowed;
                        }
                      `}
                    />
                  </div>
                </div>
                <div>
                  <SizeCaption>Small — 28px</SizeCaption>
                  <Input
                    type="password"
                    size="sm"
                    disabled
                    placeholder="Not available"
                    leadingIcon={
                      <Lock className="h-3.5 w-3.5 text-[var(--slds-g-color-text-weak)]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--password--disabled--sm {
                          background-color: #f3f2f2;
                          cursor: not-allowed;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Error */}
            <div>
              <FieldLabel error required>
                Password
              </FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SizeCaption>Medium — 36px</SizeCaption>
                  <Input
                    type="password"
                    size="md"
                    readOnly
                    aria-invalid
                    leadingIcon={
                      <Lock className="h-4 w-4 text-[#A82031]" />
                    }
                  />
                  <ErrorMessage>
                    Must be at least 8 characters
                  </ErrorMessage>
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--password--error {
                          border: 1px solid #a82031;
                        }
                        \n.form-error-msg {
                          font-size: 11px;
                          color: #a82031;
                          margin-top: 4px;
                        }
                      `}
                    />
                  </div>
                </div>
                <div>
                  <SizeCaption>Small — 28px</SizeCaption>
                  <Input
                    type="password"
                    size="sm"
                    readOnly
                    aria-invalid
                    leadingIcon={
                      <Lock className="h-3.5 w-3.5 text-[#A82031]" />
                    }
                  />

                  <ErrorMessage>
                    Must be at least 8 characters
                  </ErrorMessage>
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--password--error--sm {
                          border: 1px solid #a82031;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseCard>

        {/* FRM-05 — Email Input */}
        <ShowcaseCard
          id="FRM-05"
          title="Email Input"
          description='Same token family as Text Inputs — leading Mail icon, native type="email" validation. Error state shown as it appears after a failed email-format check.'
          cssCode={`.form-input--email { height: 36px; padding: 0 12px 0 36px; width: 100%; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #ffffff; }\n.form-input--email:hover { border-color: #b0adab; }\n.form-input--email:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }\n.form-input--email--readonly { background-color: #fafaf9; cursor: not-allowed; }\n.form-input--email--disabled { background-color: #f3f2f2; cursor: not-allowed; }\n.form-input--email--error { border-color: #A82031; }`}
        >
          <div className="space-y-4">
            {/* Default */}
            <div>
              <FieldLabel required>Guardian Email</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SizeCaption>Medium — 36px</SizeCaption>
                  <Input
                    type="email"
                    size="md"
                    defaultValue="guardian@example.com"
                    readOnly
                    leadingIcon={
                      <Mail className="h-4 w-4 text-[var(--slds-g-color-text-weak)]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--email {
                          height: 36px;
                          padding: 0 12px 0 36px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 13px;
                          background-color: #ffffff;
                        }
                      `}
                    />
                  </div>
                </div>
                <div>
                  <SizeCaption>Small — 28px</SizeCaption>
                  <Input
                    type="email"
                    size="sm"
                    defaultValue="guardian@example.com"
                    readOnly
                    leadingIcon={
                      <Mail className="h-3.5 w-3.5 text-[var(--slds-g-color-text-weak)]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--email--sm {
                          height: 28px;
                          padding: 0 10px 0 30px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 12px;
                          background-color: #ffffff;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Hover */}
            <div>
              <FieldLabel note="(hover state)">
                Guardian Email
              </FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SizeCaption>Medium — 36px</SizeCaption>
                  <Input
                    type="email"
                    size="md"
                    defaultValue="guardian@example.com"
                    readOnly
                    hovered
                    leadingIcon={
                      <Mail className="h-4 w-4 text-[var(--slds-g-color-text-weak)]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--email:hover {
                          border-color: #b0adab;
                        }
                      `}
                    />
                  </div>
                </div>
                <div>
                  <SizeCaption>Small — 28px</SizeCaption>
                  <Input
                    type="email"
                    size="sm"
                    defaultValue="guardian@example.com"
                    readOnly
                    hovered
                    leadingIcon={
                      <Mail className="h-3.5 w-3.5 text-[var(--slds-g-color-text-weak)]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--email--sm:hover {
                          border-color: #b0adab;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Focused */}
            <div>
              <FieldLabel note="(focus state)">
                Guardian Email
              </FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SizeCaption>Medium — 36px</SizeCaption>
                  <Input
                    type="email"
                    size="md"
                    defaultValue="guardian@example.com"
                    readOnly
                    focused
                    leadingIcon={
                      <Mail className="h-4 w-4 text-[#145F33]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--email:focus {
                          border-color: #145f33;
                          box-shadow: 0 0 0 3px
                            rgba(20, 95, 51, 0.2);
                          outline: none;
                        }
                      `}
                    />
                  </div>
                </div>
                <div>
                  <SizeCaption>Small — 28px</SizeCaption>
                  <Input
                    type="email"
                    size="sm"
                    defaultValue="guardian@example.com"
                    readOnly
                    focused
                    leadingIcon={
                      <Mail className="h-3.5 w-3.5 text-[#145F33]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--email--sm:focus {
                          border-color: #145f33;
                          box-shadow: 0 0 0 3px
                            rgba(20, 95, 51, 0.2);
                          outline: none;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Read-only */}
            <div>
              <FieldLabel note="(read-only)">
                Guardian Email
              </FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SizeCaption>Medium — 36px</SizeCaption>
                  <Input
                    type="email"
                    size="md"
                    defaultValue="guardian@example.com"
                    readOnly
                    leadingIcon={
                      <Mail className="h-4 w-4 text-[var(--slds-g-color-text-weak)]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--email--readonly {
                          background-color: #fafaf9;
                          cursor: not-allowed;
                        }
                      `}
                    />
                  </div>
                </div>
                <div>
                  <SizeCaption>Small — 28px</SizeCaption>
                  <Input
                    type="email"
                    size="sm"
                    defaultValue="guardian@example.com"
                    readOnly
                    leadingIcon={
                      <Mail className="h-3.5 w-3.5 text-[var(--slds-g-color-text-weak)]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--email--readonly--sm {
                          background-color: #fafaf9;
                          cursor: not-allowed;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Disabled */}
            <div>
              <FieldLabel>Guardian Email</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SizeCaption>Medium — 36px</SizeCaption>
                  <Input
                    type="email"
                    size="md"
                    disabled
                    placeholder="Not available"
                    leadingIcon={
                      <Mail className="h-4 w-4 text-[var(--slds-g-color-text-weak)]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--email--disabled {
                          background-color: #f3f2f2;
                          cursor: not-allowed;
                        }
                      `}
                    />
                  </div>
                </div>
                <div>
                  <SizeCaption>Small — 28px</SizeCaption>
                  <Input
                    type="email"
                    size="sm"
                    disabled
                    placeholder="Not available"
                    leadingIcon={
                      <Mail className="h-3.5 w-3.5 text-[var(--slds-g-color-text-weak)]" />
                    }
                  />
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--email--disabled--sm {
                          background-color: #f3f2f2;
                          cursor: not-allowed;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Error */}
            <div>
              <FieldLabel error required>
                Guardian Email
              </FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SizeCaption>Medium — 36px</SizeCaption>
                  <Input
                    type="email"
                    size="md"
                    defaultValue="not-an-email"
                    readOnly
                    aria-invalid
                    leadingIcon={
                      <Mail className="h-4 w-4 text-[#A82031]" />
                    }
                  />
                  <ErrorMessage>
                    Enter a valid email address
                  </ErrorMessage>
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--email--error {
                          border: 1px solid #a82031;
                        }
                        \n.form-error-msg {
                          font-size: 11px;
                          color: #a82031;
                          margin-top: 4px;
                        }
                      `}
                    />
                  </div>
                </div>
                <div>
                  <SizeCaption>Small — 28px</SizeCaption>
                  <Input
                    type="email"
                    size="sm"
                    defaultValue="not-an-email"
                    readOnly
                    aria-invalid
                    leadingIcon={
                      <Mail className="h-3.5 w-3.5 text-[#A82031]" />
                    }
                  />
                  <ErrorMessage>
                    Enter a valid email address
                  </ErrorMessage>
                  <div className="mt-1">
                    <CopyCSSBtn
                      css={`
                        .form-input--email--error--sm {
                          border: 1px solid #a82031;
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseCard>

        {/* FRM-06 — Number Input */}
        <ShowcaseCard
          id="FRM-06"
          title="Number Input"
          description='Same token family — leading Hash icon, type="number" (native browser spinner arrows apply). Error state shown for an out-of-range value.'
          cssCode={`.form-input--number { height: 36px; padding: 0 12px 0 36px; width: 100%; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #ffffff; }\n.form-input--number:hover { border-color: #b0adab; }\n.form-input--number:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }\n.form-input--number--readonly { background-color: #fafaf9; cursor: not-allowed; }\n.form-input--number--disabled { background-color: #f3f2f2; cursor: not-allowed; }\n.form-input--number--error { border-color: #A82031; }`}
        >
          <div className="space-y-4">
            {fieldInteractionStates.map((s) => (
              <div key={s.state}>
                <FieldLabel
                  error={s.state === "error"}
                  required={
                    s.state === "default" || s.state === "error"
                  }
                  note={s.note || undefined}
                >
                  Age
                </FieldLabel>
                <div className="grid grid-cols-2 gap-3">
                  {SIZES.map((sz) => (
                    <div key={sz.size}>
                      <SizeCaption>{sz.label}</SizeCaption>
                      <Input
                        type="number"
                        size={sz.size}
                        placeholder={
                          s.disabled
                            ? "Not available"
                            : undefined
                        }
                        defaultValue={s.val || undefined}
                        readOnly={s.readOnly}
                        disabled={s.disabled}
                        focused={s.focused}
                        hovered={s.state === "hover"}
                        aria-invalid={s.state === "error"}
                        leadingIcon={
                          <Hash
                            className={cn_(
                              sz.size === "md"
                                ? "h-4 w-4"
                                : "h-3.5 w-3.5",
                              TEXT_COLOR_CLASS[s.iconColor],
                            )}
                          />
                        }
                      />
                      {s.errorMsg && (
                        <ErrorMessage>
                          {s.errorMsg}
                        </ErrorMessage>
                      )}
                      <div className="mt-1">
                        <CopyCSSBtn
                          css={`
                            .form-input--number--${s.state}${sz.size === "sm" ? "--sm" : ""} {
                              border: 1px solid
                                ${toRawCss(s.border)};
                              background-color: ${toRawCss(s.bg)};
                              ${s.cursor === "not-allowed" ? "cursor: not-allowed;" : ""}
                            }
                          `}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ShowcaseCard>

        {/* FRM-07 — Search Box */}
        <ShowcaseCard
          id="FRM-07"
          title="Search Box"
          description="Same token family — leading Search icon, trailing clear (X) button when there's a value. Note: the global header search uses this same 4px radius under the hood (its 'rounded-full' class is overridden inline), so it's the same family, not a separate one."
          cssCode={`.form-input--search { height: 36px; padding: 0 36px 0 36px; width: 100%; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #ffffff; }\n.form-input--search:hover { border-color: #b0adab; }\n.form-input--search:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }\n.form-input--search--readonly { background-color: #fafaf9; cursor: not-allowed; }\n.form-input--search--disabled { background-color: #f3f2f2; cursor: not-allowed; }\n.form-input--search--error { border-color: #A82031; }`}
        >
          <div className="space-y-4">
            {searchStates.map((s) => (
              <div key={s.state}>
                <FieldLabel
                  error={s.state === "error"}
                  note={s.note || undefined}
                >
                  Search Youth
                </FieldLabel>
                <div className="grid grid-cols-2 gap-3">
                  {SIZES.map((sz) => (
                    <div key={sz.size}>
                      <SizeCaption>{sz.label}</SizeCaption>
                      <Input
                        type="search"
                        size={sz.size}
                        placeholder={
                          s.disabled
                            ? "Not available"
                            : "Search by name..."
                        }
                        defaultValue={s.val || undefined}
                        readOnly={s.readOnly}
                        disabled={s.disabled}
                        focused={s.focused}
                        hovered={s.state === "hover"}
                        aria-invalid={s.state === "error"}
                        leadingIcon={
                          <Search
                            className={cn_(
                              sz.size === "md"
                                ? "h-4 w-4"
                                : "h-3.5 w-3.5",
                              TEXT_COLOR_CLASS[s.iconColor],
                            )}
                          />
                        }
                        trailingIcon={
                          s.showClear ? (
                            <X
                              className={cn_(
                                "cursor-pointer text-[var(--slds-g-color-text-weak)]",
                                sz.size === "md"
                                  ? "h-4 w-4"
                                  : "h-3.5 w-3.5",
                              )}
                            />
                          ) : undefined
                        }
                      />
                      {s.errorMsg && (
                        <ErrorMessage>
                          {s.errorMsg}
                        </ErrorMessage>
                      )}
                      <div className="mt-1">
                        <CopyCSSBtn
                          css={`
                            .form-input--search--${s.state}${sz.size === "sm" ? "--sm" : ""} {
                              border: 1px solid
                                ${toRawCss(s.border)};
                              background-color: ${toRawCss(s.bg)};
                              ${s.cursor === "not-allowed" ? "cursor: not-allowed;" : ""}
                            }
                          `}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ShowcaseCard>

        {/* FRM-08 — Combobox (searchable select) */}
        <ShowcaseCard
          id="FRM-08"
          title="Combobox"
          description="Searchable select — same input token family as the trigger, with a search icon (typeahead) and chevron (opens a list). Not the same as the shadcn Command/cmdk component used elsewhere in the app (different radius/color tokens) — this version matches Form Controls. The open-list demo below sits outside the 6-state grid since it's a distinct interaction, not a field state."
          cssCode={`.combobox-trigger { height: 36px; padding: 0 36px 0 36px; width: 100%; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #ffffff; display: flex; align-items: center; }\n.combobox-trigger:hover { border-color: #b0adab; }\n.combobox-trigger:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }\n.combobox-trigger--readonly { background-color: #fafaf9; cursor: not-allowed; }\n.combobox-trigger--disabled { background-color: #f3f2f2; cursor: not-allowed; }\n.combobox-trigger--error { border-color: #A82031; }\n.combobox-list { border: 1px solid #dddbda; border-radius: 8px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 4px 0; margin-top: 4px; }\n.combobox-option { padding: 6px 12px; font-size: 13px; cursor: pointer; }\n.combobox-option:hover { background-color: #f3f2f2; }\n.combobox-option--selected { background-color: rgba(20,95,51,0.08); color: #145F33; }`}
        >
          <div className="space-y-4">
            {[
              {
                state: "default",
                note: "",
                border: "var(--slds-g-color-border-base-1)",
                iconColor: "var(--slds-g-color-text-weak)",
                bg: "#ffffff",
                cursor: "auto",
                val: "West Campus Program",
                isPlaceholder: false,
                disabled: false,
                focused: false,
                errorMsg: "",
              },
              {
                state: "hover",
                note: " (hover state)",
                border: "#b0adab",
                iconColor: "var(--slds-g-color-text-weak)",
                bg: "#ffffff",
                cursor: "auto",
                val: "West Campus Program",
                isPlaceholder: false,
                disabled: false,
                focused: false,
                errorMsg: "",
              },
              {
                state: "focus",
                note: " (focus state)",
                border: "#145F33",
                iconColor: "#145F33",
                bg: "#ffffff",
                cursor: "auto",
                val: "West Campus Program",
                isPlaceholder: false,
                disabled: false,
                focused: true,
                errorMsg: "",
              },
              {
                state: "readonly",
                note: " (read-only)",
                border: "var(--slds-g-color-border-base-1)",
                iconColor: "var(--slds-g-color-text-weak)",
                bg: "var(--slds-g-color-background-alt)",
                cursor: "not-allowed",
                val: "West Campus Program",
                isPlaceholder: false,
                disabled: false,
                focused: false,
                errorMsg: "",
              },
              {
                state: "disabled",
                note: "",
                border: "var(--slds-g-color-border-base-1)",
                iconColor: "var(--slds-g-color-text-weak)",
                bg: "var(--slds-g-color-neutral-95)",
                cursor: "not-allowed",
                val: "Select a program...",
                isPlaceholder: true,
                disabled: true,
                focused: false,
                errorMsg: "",
              },
              {
                state: "error",
                note: "",
                border: "#A82031",
                iconColor: "#A82031",
                bg: "#ffffff",
                cursor: "auto",
                val: "Select a program...",
                isPlaceholder: true,
                disabled: false,
                focused: false,
                errorMsg: "Program selection is required",
              },
            ].map((s) => (
              <div key={s.state}>
                <FieldLabel
                  error={s.state === "error"}
                  required={
                    s.state === "default" || s.state === "error"
                  }
                  note={s.note || undefined}
                >
                  Program
                </FieldLabel>
                <div className="grid grid-cols-2 gap-3">
                  {SIZES.map((sz) => (
                    <div key={sz.size}>
                      <SizeCaption>{sz.label}</SizeCaption>
                      <div
                        className={cn_(
                          "relative flex items-center rounded-md border bg-[var(--slds-g-color-background-base)]",
                          sz.size === "md" ? "h-9" : "h-7",
                          BORDER_CLASS[s.border],
                          BG_CLASS[s.bg],
                          s.cursor === "not-allowed" &&
                            "cursor-not-allowed",
                          s.focused &&
                            "shadow-[0_0_0_3px_rgba(20,95,51,0.2)]",
                        )}
                      >
                        <Search
                          className={cn_(
                            "pointer-events-none absolute",
                            sz.size === "md"
                              ? "left-3 h-4 w-4"
                              : "left-2.5 h-3.5 w-3.5",
                            TEXT_COLOR_CLASS[s.iconColor],
                          )}
                        />
                        <span
                          className={cn_(
                            "flex-1 overflow-hidden whitespace-nowrap text-ellipsis",
                            sz.size === "md"
                              ? "pl-9 pr-9 text-[length:var(--slds-g-font-size-4)]"
                              : "pl-[30px] pr-[30px] text-[length:var(--slds-g-font-size-3)]",
                            s.isPlaceholder
                              ? "text-[#9e9e9c]"
                              : "text-[var(--slds-g-color-text-default)]",
                          )}
                        >
                          {s.val}
                        </span>
                        <ChevronDown
                          className={cn_(
                            "pointer-events-none absolute text-[var(--slds-g-color-text-weak)]",
                            sz.size === "md"
                              ? "right-3 h-4 w-4"
                              : "right-2.5 h-3.5 w-3.5",
                          )}
                        />
                      </div>
                      {s.errorMsg && (
                        <ErrorMessage>
                          {s.errorMsg}
                        </ErrorMessage>
                      )}
                      <div className="mt-1">
                        <CopyCSSBtn
                          css={`
                            .combobox-trigger--${s.state}${sz.size === "sm" ? "--sm" : ""} {
                              border: 1px solid
                                ${toRawCss(s.border)};
                              background-color: ${toRawCss(s.bg)};
                              ${s.cursor === "not-allowed" ? "cursor: not-allowed;" : ""}
                            }
                          `}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {/* Open state with results list — bonus, not a field state */}
            <div>
              <FieldLabel note="(open, with results)">
                Program
              </FieldLabel>
              <div className="relative max-w-xs">
                <div className="relative flex h-9 items-center rounded-md border border-[#145F33] bg-[var(--slds-g-color-background-base)] shadow-[0_0_0_3px_rgba(20,95,51,0.2)]">
                  <Search className="absolute left-3 h-4 w-4 pointer-events-none text-[#145F33]" />
                  <span className="pl-9 pr-3 text-[length:var(--slds-g-font-size-4)] text-[#9e9e9c]">
                    West...
                  </span>
                </div>
                <div className="mt-1 rounded-lg border border-[var(--slds-g-color-border-base-1)] bg-[var(--slds-g-color-background-base)] py-1 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                  {[
                    "East Campus Program",
                    "West Campus Program",
                    "West Loop Program",
                  ].map((opt, i) => (
                    <div
                      key={opt}
                      className={cn_(
                        "px-3 py-1.5 text-[length:var(--slds-g-font-size-4)]",
                        i === 1
                          ? "bg-[rgba(20,95,51,0.08)] text-[#145F33]"
                          : "text-[var(--slds-g-color-text-default)]",
                      )}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
                <div className="mt-1">
                  <CopyCSSBtn
                    css={`
                      .combobox-list {
                        border: 1px solid #dddbda;
                        border-radius: 8px;
                        background-color: #ffffff;
                        box-shadow: 0 4px 12px
                          rgba(0, 0, 0, 0.1);
                        padding: 4px 0;
                      }
                      \n.combobox-option--selected {
                        background-color: rgba(
                          20,
                          95,
                          51,
                          0.08
                        );
                        color: #145f33;
                      }
                    `}
                  />
                </div>
              </div>
            </div>
          </div>
        </ShowcaseCard>

        {/* FRM-09 — File Upload */}
        <ShowcaseCard
          id="FRM-09"
          title="File Upload"
          description="Adapted to the family rather than copied literally — a real file input can't visually be a one-line text box the same way password/email/number can. Medium size is a dashed dropzone (border color/radius still match the family); small size is a compact 'Choose File' button + filename row, for use inside tight table cells or side panels."
          cssCode={`.file-dropzone { border: 1px dashed #dddbda; border-radius: 4px; background-color: #ffffff; padding: 20px; text-align: center; }\n.file-dropzone:hover { border-color: #b0adab; background-color: #fafaf9; }\n.file-dropzone:focus-within { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); }\n.file-dropzone--readonly { background-color: #fafaf9; cursor: not-allowed; }\n.file-dropzone--disabled { background-color: #f3f2f2; cursor: not-allowed; opacity: 0.6; }\n.file-dropzone--error { border-color: #A82031; border-style: solid; }\n.file-upload-compact { height: 28px; display: inline-flex; align-items: center; gap: 8px; }\n.file-upload-compact__btn { height: 28px; padding: 0 10px; border: 1px solid #dddbda; border-radius: 4px; font-size: 12px; background-color: #ffffff; }`}
        >
          <div className="space-y-4">
            {fileStates.map((s, i) => (
              <div key={i}>
                <FieldLabel
                  error={s.state === "error"}
                  required={!s.note && !s.disabled}
                  note={s.note || undefined}
                >
                  Supporting Document
                </FieldLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <SizeCaption>Medium — Dropzone</SizeCaption>
                    <FileUpload
                      state={s.state}
                      disabled={s.disabled}
                      fileName={s.fileName}
                      placeholder={s.placeholder}
                      helperText={s.helperText}
                    />
                    {s.errorMsg && (
                      <ErrorMessage>{s.errorMsg}</ErrorMessage>
                    )}
                  </div>
                  <div>
                    <SizeCaption>Small — Compact</SizeCaption>
                    <FileUpload
                      variant="compact"
                      state={s.state}
                      disabled={s.disabled}
                      fileName={s.fileName}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ShowcaseCard>
      </div>
    </div>
  );
}