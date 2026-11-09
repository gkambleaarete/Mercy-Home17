import React, { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  ChevronDown,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Check,
  Hash,
  Circle,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  X,
  Bell,
  Info,
  Star,
  Settings,
  Eye,
  ExternalLink,
  FileText,
  Calendar as CalendarIcon,
} from "@/app/lib/lucide-icons";
import {
  RadioGroup,
  RadioGroupItem,
} from "../../ui/radio-group";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { DatePicker } from "../../ui/date-picker";
import { Calendar } from "../../ui/calendar";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../ui/accordion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "../../ui/dropdown-menu";
import {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "../../ui/drawer";
import { Slider } from "../../ui/slider";
import { TablePaginationBar } from "../../ui/table-toolbar";
import { Toggle } from "../../ui/toggle";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../ui/toggle-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../../ui/input-otp";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "../../ui/alert-dialog";
import { toast } from "sonner@2.0.3";
import { ShowcaseCard, CopyCSSBtn, FieldLabel, SizeCaption, ErrorMessage } from "./ShowcaseCard";

export function RadioSection() {
  const [radioValue, setRadioValue] = useState("Boys Program");
  return (
    <div id="sec-radio">
      <h3 className="slds-section-title mb-2">Radio</h3>
      <p className="mb-4 text-[length:var(--slds-g-font-size-4)] text-[var(--slds-g-color-text-weak)]">
        Single-choice selection via{" "}
        <code className="font-mono">RadioGroup</code>{" "}
        /{" "}
        <code className="font-mono">RadioGroupItem</code>{" "}
        (Radix).
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShowcaseCard
          id="RAD-01"
          title="Vertical Group"
          description="Default stacked orientation with labels"
        >
          <RadioGroup
            value={radioValue}
            onValueChange={setRadioValue}
            className="space-y-2"
          >
            {[
              "Boys Program",
              "Girls Program",
              "Transitional Housing",
            ].map((opt) => (
              <div
                key={opt}
                className="group/item flex flex-col gap-1"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value={opt}
                    id={`radio-v-${opt}`}
                  />
                  <Label
                    htmlFor={`radio-v-${opt}`}
                    className="font-normal text-[length:var(--slds-g-font-size-4)] cursor-pointer"
                  >
                    {opt}
                  </Label>
                </div>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <CopyCSSBtn css=".radio-item { display: flex; align-items: center; gap: 8px; }\n[data-state=checked] .radio-indicator { background-color: #145F33; border-color: #145F33; }" />
                </div>
              </div>
            ))}
          </RadioGroup>
          <p className="mt-2 text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
            Selected: {radioValue}
          </p>
        </ShowcaseCard>

        <ShowcaseCard
          id="RAD-02"
          title="Horizontal Group"
          description="Inline orientation for short option lists"
        >
          <RadioGroup value="yes" className="flex gap-4">
            {["Yes", "No", "Unknown"].map((opt) => (
              <div
                key={opt}
                className="group/item flex flex-col gap-1"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value={opt.toLowerCase()}
                    id={`radio-h-${opt}`}
                  />
                  <Label
                    htmlFor={`radio-h-${opt}`}
                    className="font-normal text-[length:var(--slds-g-font-size-4)] cursor-pointer"
                  >
                    {opt}
                  </Label>
                </div>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <CopyCSSBtn css=".radio-item { display: flex; align-items: center; gap: 8px; }\n[data-state=checked] .radio-indicator { background-color: #145F33; border-color: #145F33; }" />
                </div>
              </div>
            ))}
          </RadioGroup>
        </ShowcaseCard>

        <ShowcaseCard
          title="States"
          description="Checked, unchecked, disabled, disabled-checked"
        >
          <RadioGroup defaultValue="a" className="space-y-2">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="a" id="r-checked" />
              <Label htmlFor="r-checked" className="font-normal text-[length:var(--slds-g-font-size-4)] cursor-pointer">
                Checked
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="b" id="r-unchecked" />
              <Label htmlFor="r-unchecked" className="font-normal text-[length:var(--slds-g-font-size-4)] cursor-pointer">
                Unchecked
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="c"
                id="r-disabled"
                disabled
              />
              <Label
                htmlFor="r-disabled"
                className="font-normal text-[length:var(--slds-g-font-size-4)] text-[var(--slds-g-color-text-weak)] cursor-not-allowed"
              >
                Disabled
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="d"
                id="r-disabled-checked"
                disabled
              />
              <Label
                htmlFor="r-disabled-checked"
                className="font-normal text-[length:var(--slds-g-font-size-4)] text-[var(--slds-g-color-text-weak)] cursor-not-allowed"
              >
                Disabled (cannot select)
              </Label>
            </div>
          </RadioGroup>
        </ShowcaseCard>

        <ShowcaseCard
          title="With Description"
          description="Labels with supporting helper text"
        >
          <RadioGroup
            defaultValue="standard"
            className="space-y-3"
          >
            {[
              {
                value: "standard",
                label: "Standard Referral",
                desc: "Referred by a caseworker or agency.",
              },
              {
                value: "self",
                label: "Self-Referral",
                desc: "Youth or guardian initiated contact.",
              },
            ].map((opt) => (
              <div
                key={opt.value}
                className="flex items-start gap-2"
              >
                <RadioGroupItem
                  value={opt.value}
                  id={`radio-d-${opt.value}`}
                  className="mt-0.5"
                />
                <div>
                  <Label
                    htmlFor={`radio-d-${opt.value}`}
                    className="block text-[length:var(--slds-g-font-size-4)] cursor-pointer"
                  >
                    {opt.label}
                  </Label>
                  <span className="text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
                    {opt.desc}
                  </span>
                </div>
              </div>
            ))}
          </RadioGroup>
        </ShowcaseCard>
      </div>
    </div>
  );
}

export function TextareaSection() {
  const [textareaValue, setTextareaValue] = useState("");
  const [bioValue, setBioValue] = useState(
    "Marcus enjoys basketball and is working toward his GED.",
  );
  const [incidentValue, setIncidentValue] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in",
  );
  const maxLen = 250;
  return (
    <div id="sec-textarea">
      <h3 className="slds-section-title mb-4">Textarea</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShowcaseCard
          id="TXA-01"
          title="Textarea States"
          description="Multi-line input built on the Textarea primitive — default, placeholder, read-only, disabled, error, and focus states."
          cssCode={`.textarea {\n  width: 100%;\n  min-height: 64px;\n  padding: 8px 12px;\n  border: 1px solid #dddbda;\n  border-radius: 4px;\n  font-size: 13px;\n  background-color: #ffffff;\n  resize: none;\n}\n.textarea:focus {\n  border-color: #145F33;\n  box-shadow: 0 0 0 3px rgba(20,95,51,0.2);\n  outline: none;\n}\n.textarea--readonly {\n  background-color: #fafaf9;\n  cursor: not-allowed;\n}\n.textarea--disabled {\n  background-color: #f3f2f2;\n  cursor: not-allowed;\n  opacity: 0.6;\n}\n.textarea--error {\n  border-color: #A82031;\n}\n.textarea-error-msg {\n  font-size: 11px;\n  color: #A82031;\n  margin-top: 4px;\n}`}
        >
          <div className="space-y-4">
            {/* Default with value */}
            <div>
              <FieldLabel>Notes</FieldLabel>
              <Textarea
                value={bioValue}
                onChange={(e) => setBioValue(e.target.value)}
                rows={3}
                size="md"
                className="w-full"
              />
              <div className="mt-1">
                <CopyCSSBtn css=".textarea { width: 100%; min-height: 64px; padding: 8px 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #ffffff; resize: none; }" />
              </div>
            </div>
            {/* Placeholder */}
            <div>
              <FieldLabel>Comments</FieldLabel>
              <Textarea
                placeholder="Enter comments..."
                rows={3}
                size="md"
                className="w-full"
              />
              <div className="mt-1">
                <CopyCSSBtn css=".textarea--placeholder { width: 100%; min-height: 64px; padding: 8px 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; color: #9e9e9c; resize: none; }" />
              </div>
            </div>
            {/* Error */}
            <div>
              <FieldLabel error required>Incident Summary</FieldLabel>
              <Textarea
                readOnly
                rows={3}
                aria-invalid
                size="md"
                className="w-full"
              />
              <ErrorMessage>This field is required</ErrorMessage>
              <div className="mt-1">
                <CopyCSSBtn css=".textarea--error { width: 100%; min-height: 64px; padding: 8px 12px; border: 1px solid #A82031; border-radius: 4px; font-size: 13px; resize: none; }\n.textarea-error-msg { font-size: 11px; color: #A82031; margin-top: 4px; }" />
              </div>
            </div>
            {/* Error — live, tied to character count */}
            <div>
              <FieldLabel error={incidentValue.length >= 225} required>
                Incident Summary
              </FieldLabel>
              <Textarea
                rows={3}
                value={incidentValue}
                onChange={(e) =>
                  setIncidentValue(e.target.value.slice(0, 255))
                }
                aria-invalid={incidentValue.length >= 225}
                size="md"
                className="w-full"
              />
              {incidentValue.length >= 255 && (
                <ErrorMessage>You have reached the 255 character limit.</ErrorMessage>
              )}
              <div className="mt-1">
                <CopyCSSBtn css=".textarea--error { width: 100%; min-height: 64px; padding: 8px 12px; border: 1px solid #A82031; border-radius: 4px; font-size: 13px; resize: none; }\n.textarea-error-msg { font-size: 11px; color: #A82031; margin-top: 4px; }" />
              </div>
            </div>
            {/* Read-Only */}
            <div>
              <FieldLabel note="(read-only)">Case History</FieldLabel>
              <Textarea
                defaultValue="Transferred from Boys Program on 03/12/2026."
                readOnly
                rows={3}
                size="md"
                className="w-full"
              />
              <div className="mt-1">
                <CopyCSSBtn css=".textarea--readonly { width: 100%; min-height: 64px; padding: 8px 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #fafaf9; cursor: not-allowed; resize: none; }" />
              </div>
            </div>
            {/* Disabled */}
            <div>
              <FieldLabel>Discharge Notes</FieldLabel>
              <Textarea
                disabled
                placeholder="Not available"
                rows={3}
                size="md"
                className="w-full"
              />
              <div className="mt-1">
                <CopyCSSBtn css=".textarea--disabled { width: 100%; min-height: 64px; padding: 8px 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #f3f2f2; cursor: not-allowed; opacity: 0.6; resize: none; }" />
              </div>
            </div>
            {/* Focus */}
            <div>
              <FieldLabel note="(focus state)">Search Notes</FieldLabel>
              <Textarea
                defaultValue="Youth showed improvement..."
                readOnly
                rows={3}
                focused
                size="md"
                className="w-full"
              />
              <div className="mt-1">
                <CopyCSSBtn css=".textarea:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }" />
              </div>
            </div>
          </div>
        </ShowcaseCard>

        <ShowcaseCard
          id="TXA-02"
          title="Textarea with Character Counter"
          description="Same textarea, with a live character count anchored bottom-right — useful for capped fields like case summaries."
          cssCode={`.textarea-wrap {\n  position: relative;\n}\n.textarea-char-count {\n  position: absolute;\n  bottom: 8px;\n  right: 12px;\n  font-size: 11px;\n  color: #706e6b;\n  background-color: #ffffff;\n  padding: 0 2px;\n}\n.textarea-char-count--limit {\n  color: #A82031;\n  font-weight: 500;\n}`}
        >
          <div>
            <FieldLabel>Case Summary</FieldLabel>
            <div className="relative">
              <Textarea
                value={textareaValue}
                onChange={(e) =>
                  e.target.value.length <= maxLen &&
                  setTextareaValue(e.target.value)
                }
                placeholder="Summarize the case..."
                rows={4}
                size="md"
                className="w-full pb-6"
              />
              <span
                className={`absolute bottom-2 right-3 bg-[var(--slds-g-color-background-base)] px-0.5 text-[length:var(--slds-g-font-size-2)] ${
                  textareaValue.length >= maxLen
                    ? "font-medium text-[#A82031]"
                    : "text-[#706e6b]"
                }`}
              >
                {textareaValue.length}/{maxLen}
              </span>
            </div>
            <div className="mt-1">
              <CopyCSSBtn css=".textarea-wrap { position: relative; }\n.textarea-char-count { position: absolute; bottom: 8px; right: 12px; font-size: 11px; color: #706e6b; background-color: #ffffff; padding: 0 2px; }\n.textarea-char-count--limit { color: #A82031; font-weight: 500; }" />
            </div>
          </div>
        </ShowcaseCard>
      </div>
    </div>
  );
}

export function DatePickerSection() {
  const [datePickerValue, setDatePickerValue] =
    useState<string>("");
  return (
    <div id="sec-date-picker">
      <h3 className="slds-section-title mb-2">Date Picker</h3>
      <p className="mb-4 text-[length:var(--slds-g-font-size-4)] text-[var(--slds-g-color-text-weak)]">
        Calendar popover for date selection. Displays
        MM/DD/YYYY. Backed by{" "}
        <code className="font-mono">react-day-picker</code>.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShowcaseCard
          id="DPK-01"
          title="Default — No Selection"
          cssCode={`.date-picker-trigger { display: flex; align-items: center; justify-content: space-between; width: 100%; height: 36px; padding: 0 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background: #ffffff; cursor: pointer; }\n.date-picker-trigger--sm { height: 28px; padding: 0 10px; font-size: 12px; }\n.date-picker-trigger:hover { border-color: #145F33; }`}
        >
          <div className="space-y-1.5">
            <FieldLabel htmlFor="dp-default">REFERRAL DATE</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <SizeCaption>Medium — 36px</SizeCaption>
                <DatePicker
                  id="dp-default"
                  value={datePickerValue}
                  onChange={setDatePickerValue}
                  placeholder="Pick a date"
                />
                {datePickerValue && (
                  <p className="text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
                    Selected: {datePickerValue}
                  </p>
                )}
                <div className="mt-1">
                  <CopyCSSBtn
                    css={`
                      .date-picker-trigger {
                        height: 36px;
                        padding: 0 12px;
                        width: 100%;
                        border: 1px solid #dddbda;
                        border-radius: 4px;
                        font-size: 13px;
                        background: #ffffff;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: space-between;
                      }
                    `}
                  />
                </div>
              </div>
              <div>
                <SizeCaption>Small — 28px</SizeCaption>
                <DatePicker
                  placeholder="Pick a date"
                  size="sm"
                />
                <div className="mt-1">
                  <CopyCSSBtn
                    css={`
                      .date-picker-trigger--sm {
                        height: 28px;
                        padding: 0 10px;
                        width: 100%;
                        border: 1px solid #dddbda;
                        border-radius: 4px;
                        font-size: 12px;
                        background: #ffffff;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: space-between;
                      }
                    `}
                  />
                </div>
              </div>
            </div>
          </div>
        </ShowcaseCard>

        <ShowcaseCard
          id="DPK-02"
          title="Pre-selected Date"
          cssCode={`.date-picker-trigger { height: 36px; padding: 0 12px; width: 100%; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background: #ffffff; cursor: pointer; display: inline-flex; align-items: center; justify-content: space-between; }\n.date-picker-trigger--sm { height: 28px; padding: 0 10px; font-size: 12px; }`}
        >
          <div className="space-y-1.5">
            <FieldLabel htmlFor="dp-selected">ADMISSION DATE</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <SizeCaption>Medium — 36px</SizeCaption>
                <DatePicker
                  id="dp-selected"
                  value="2026-07-15"
                  placeholder="Pick a date"
                />
                <div className="mt-1">
                  <CopyCSSBtn
                    css={`
                      .date-picker-trigger {
                        height: 36px;
                        padding: 0 12px;
                        width: 100%;
                        border: 1px solid #dddbda;
                        border-radius: 4px;
                        font-size: 13px;
                        background: #ffffff;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: space-between;
                      }
                    `}
                  />
                </div>
              </div>
              <div>
                <SizeCaption>Small — 28px</SizeCaption>
                <DatePicker
                  value="2026-07-15"
                  placeholder="Pick a date"
                  size="sm"
                />
                <div className="mt-1">
                  <CopyCSSBtn
                    css={`
                      .date-picker-trigger--sm {
                        height: 28px;
                        padding: 0 10px;
                        width: 100%;
                        border: 1px solid #dddbda;
                        border-radius: 4px;
                        font-size: 12px;
                        background: #ffffff;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: space-between;
                      }
                    `}
                  />
                </div>
              </div>
            </div>
          </div>
        </ShowcaseCard>

        <ShowcaseCard
          id="DPK-03"
          title="Disabled"
          cssCode={`.date-picker-trigger[aria-disabled="true"] { opacity: 0.5; cursor: not-allowed; pointer-events: none; }\n.date-picker-trigger--sm[aria-disabled="true"] { opacity: 0.5; cursor: not-allowed; pointer-events: none; }`}
        >
          <div className="space-y-1.5">
            <FieldLabel htmlFor="dp-disabled">DISCHARGE DATE</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <SizeCaption>Medium — 36px</SizeCaption>
                <DatePicker
                  id="dp-disabled"
                  disabled
                  placeholder="Not available"
                />
                <div className="mt-1">
                  <CopyCSSBtn
                    css={`
                      .date-picker-trigger[aria-disabled="true"] {
                        opacity: 0.5;
                        cursor: not-allowed;
                        pointer-events: none;
                      }
                    `}
                  />
                </div>
              </div>
              <div>
                <SizeCaption>Small — 28px</SizeCaption>
                <DatePicker
                  disabled
                  placeholder="Not available"
                  size="sm"
                />
                <div className="mt-1">
                  <CopyCSSBtn
                    css={`
                      .date-picker-trigger--sm[aria-disabled="true"] {
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
        </ShowcaseCard>

        <ShowcaseCard
          id="DPK-04"
          title="With Required Label"
          note="Required asterisk uses #c23934 per SLDS 2 spec."
          cssCode={`.date-picker-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #706e6b; }\n.date-picker-required { color: #c23934; }`}
        >
          <div className="space-y-1.5">
            <FieldLabel htmlFor="dp-req" required>DATE OF BIRTH</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <SizeCaption>Medium — 36px</SizeCaption>
                <DatePicker
                  id="dp-req"
                  placeholder="MM/DD/YYYY"
                />
                <div className="mt-1">
                  <CopyCSSBtn
                    css={`
                      .date-picker-trigger {
                        height: 36px;
                        padding: 0 12px;
                        width: 100%;
                        border: 1px solid #dddbda;
                        border-radius: 4px;
                        font-size: 13px;
                        background: #ffffff;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: space-between;
                      }
                    `}
                  />
                </div>
              </div>
              <div>
                <SizeCaption>Small — 28px</SizeCaption>
                <DatePicker
                  placeholder="MM/DD/YYYY"
                  size="sm"
                />
                <div className="mt-1">
                  <CopyCSSBtn
                    css={`
                      .date-picker-trigger--sm {
                        height: 28px;
                        padding: 0 10px;
                        width: 100%;
                        border: 1px solid #dddbda;
                        border-radius: 4px;
                        font-size: 12px;
                        background: #ffffff;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: space-between;
                      }
                    `}
                  />
                </div>
              </div>
            </div>
          </div>
        </ShowcaseCard>

        <ShowcaseCard
          id="DPK-05"
          title="Focused"
          note="Static visual — shows focus ring when trigger receives keyboard or click focus."
          cssCode={`.date-picker-trigger:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }`}
        >
          <div className="space-y-1.5">
            <FieldLabel htmlFor="dp-focused">REFERRAL DATE</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <SizeCaption>Medium — 36px</SizeCaption>
                <DatePicker
                  id="dp-focused"
                  value="2026-04-15"
                  focused
                />
                <div className="mt-1">
                  <CopyCSSBtn
                    css={`
                      .date-picker-trigger:focus {
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
                <DatePicker
                  value="2026-04-15"
                  focused
                  size="sm"
                />
                <div className="mt-1">
                  <CopyCSSBtn
                    css={`
                      .date-picker-trigger--sm:focus {
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
        </ShowcaseCard>

        <ShowcaseCard
          id="DPK-06"
          title="Read-Only"
          note="Field displays a locked date. Clicking does not open the calendar."
          cssCode={`.date-picker-trigger--readonly { height: 36px; padding: 0 12px; width: 100%; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #fafaf9; cursor: not-allowed; color: #080707; display: inline-flex; align-items: center; justify-content: space-between; }\n.date-picker-trigger--readonly--sm { height: 28px; padding: 0 10px; font-size: 12px; }`}
        >
          <div className="space-y-1.5">
            <FieldLabel htmlFor="dp-readonly" note="(read-only)">ADMISSION DATE</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <SizeCaption>Medium — 36px</SizeCaption>
                <DatePicker
                  id="dp-readonly"
                  value="2026-07-15"
                  readOnly
                />
                <div className="mt-1">
                  <CopyCSSBtn
                    css={`
                      .date-picker-trigger--readonly {
                        height: 36px;
                        padding: 0 12px;
                        width: 100%;
                        border: 1px solid #dddbda;
                        border-radius: 4px;
                        font-size: 13px;
                        background-color: #fafaf9;
                        cursor: not-allowed;
                        display: inline-flex;
                        align-items: center;
                        justify-content: space-between;
                      }
                    `}
                  />
                </div>
              </div>
              <div>
                <SizeCaption>Small — 28px</SizeCaption>
                <DatePicker
                  value="2026-07-15"
                  readOnly
                  size="sm"
                />
                <div className="mt-1">
                  <CopyCSSBtn
                    css={`
                      .date-picker-trigger--readonly--sm {
                        height: 28px;
                        padding: 0 10px;
                        width: 100%;
                        border: 1px solid #dddbda;
                        border-radius: 4px;
                        font-size: 12px;
                        background-color: #fafaf9;
                        cursor: not-allowed;
                        display: inline-flex;
                        align-items: center;
                        justify-content: space-between;
                      }
                    `}
                  />
                </div>
              </div>
            </div>
          </div>
        </ShowcaseCard>
      </div>
    </div>
  );
}

export function CalendarSection() {
  const [calSingle, setCalSingle] = useState<Date | undefined>(
    undefined,
  );
  const [calMultiple, setCalMultiple] = useState<
    Date[] | undefined
  >(undefined);
  const [calRange, setCalRange] = useState<
    DateRange | undefined
  >(undefined);
  return (
    <div id="sec-calendar">
      <h3
        className="mb-2"
        style={{
          fontSize: "var(--slds-g-font-size-6)",
          fontWeight: 500,
        }}
      >
        Calendar
      </h3>
      <p
        className="mb-4"
        style={{
          fontSize: "var(--slds-g-font-size-4)",
          color: "var(--slds-g-color-text-weak)",
        }}
      >
        Inline calendar via{" "}
        <code style={{ fontFamily: "monospace" }}>
          react-day-picker
        </code>
        . Supports single, multiple, and range modes.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ShowcaseCard
          id="CAL-01"
          title="Single Selection"
          description="mode='single' — one date at a time"
          cssCode={`.calendar-day--selected { background-color: #145F33; color: #ffffff; border-radius: 4px; }\n.calendar-day:hover:not(.calendar-day--selected):not(.calendar-day--disabled) { background-color: #f3f2f2; border-radius: 4px; }\n.calendar-day--disabled { opacity: 0.4; cursor: not-allowed; }`}
        >
          <Calendar
            mode="single"
            selected={calSingle}
            onSelect={setCalSingle}
          />
          {calSingle && (
            <p
              className="mt-2"
              style={{
                fontSize: "var(--slds-g-font-size-3)",
                color: "var(--slds-g-color-text-weak)",
              }}
            >
              Selected: {calSingle.toLocaleDateString("en-US")}
            </p>
          )}
        </ShowcaseCard>

        <ShowcaseCard
          id="CAL-02"
          title="Multiple Selection"
          description="mode='multiple' — click to toggle dates"
          cssCode={`.calendar-day--selected { background-color: #145F33; color: #ffffff; border-radius: 4px; }\n.calendar-day:hover:not(.calendar-day--selected):not(.calendar-day--disabled) { background-color: #f3f2f2; border-radius: 4px; }`}
        >
          <Calendar
            mode="multiple"
            selected={calMultiple}
            onSelect={setCalMultiple}
          />
          {calMultiple && (
            <p
              className="mt-2"
              style={{
                fontSize: "var(--slds-g-font-size-3)",
                color: "var(--slds-g-color-text-weak)",
              }}
            >
              {calMultiple.length} date
              {calMultiple.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </ShowcaseCard>

        <ShowcaseCard
          id="CAL-03"
          title="Range Selection"
          description="mode='range' — click start then end date"
          cssCode={`.calendar-day--range-start, .calendar-day--range-end { background-color: #145F33; color: #ffffff; border-radius: 4px; }\n.calendar-day--range-middle { background-color: rgba(20,95,51,0.1); border-radius: 0; }`}
        >
          <Calendar
            mode="range"
            selected={calRange}
            onSelect={setCalRange}
          />
          <p
            className="mt-2"
            style={{
              fontSize: "var(--slds-g-font-size-3)",
              color: "var(--slds-g-color-text-weak)",
            }}
          >
            {calRange?.from
              ? `From: ${calRange.from.toLocaleDateString("en-US")}`
              : "No start"}
            {calRange?.to
              ? ` → ${calRange.to.toLocaleDateString("en-US")}`
              : ""}
          </p>
        </ShowcaseCard>

        <ShowcaseCard
          id="CAL-04"
          title="Disabled Dates"
          description="Weekends disabled via matcher function"
          cssCode={`.calendar-day--disabled { opacity: 0.4; cursor: not-allowed; pointer-events: none; }\n.calendar-day:not(.calendar-day--disabled):hover { background-color: #f3f2f2; border-radius: 4px; }`}
        >
          <Calendar
            mode="single"
            disabled={{ dayOfWeek: [0, 6] }}
          />
          <p
            className="mt-2"
            style={{
              fontSize: "var(--slds-g-font-size-3)",
              color: "var(--slds-g-color-text-weak)",
            }}
          >
            Weekends disabled
          </p>
        </ShowcaseCard>
      </div>
    </div>
  );
}

export function OtpSection() {
  const [otpValue, setOtpValue] = useState("");
  return (
    <div id="sec-otp">
      <h3 className="slds-section-title mb-2">OTP Input</h3>
      <p className="mb-4 text-[length:var(--slds-g-font-size-4)] text-[var(--slds-g-color-text-weak)]">
        One-time password input with auto-advance, paste
        support, and visual slot indicators.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShowcaseCard
          id="OTP-01"
          title="6-Digit OTP"
          description="Standard authentication code entry with separator"
          cssCode={`.otp-slot { width: 44px; height: 44px; border: 1px solid #dddbda; border-radius: 6px; font-size: 18px; font-weight: 500; text-align: center; display: flex; align-items: center; justify-content: center; }\n.otp-slot--focused { border-color: #145F33; box-shadow: 0 0 0 2px rgba(20,95,51,0.2); }\n.otp-separator { font-size: 18px; color: #706e6b; padding: 0 4px; }`}
        >
          <div className="space-y-3">
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={setOtpValue}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {otpValue.length > 0 && (
              <p className="text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
                Entered: {otpValue} ({otpValue.length}/6)
              </p>
            )}
          </div>
        </ShowcaseCard>

        <ShowcaseCard
          id="OTP-02"
          title="4-Digit PIN"
          description="Compact PIN entry without separator"
          cssCode={`.otp-slot { width: 44px; height: 44px; border: 1px solid #dddbda; border-radius: 6px; font-size: 18px; font-weight: 500; text-align: center; display: flex; align-items: center; justify-content: center; }\n.otp-slot--focused { border-color: #145F33; box-shadow: 0 0 0 2px rgba(20,95,51,0.2); }`}
        >
          <InputOTP maxLength={4}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </ShowcaseCard>

        <ShowcaseCard
          id="OTP-03"
          title="Filled State"
          description="All 6 slots populated"
          cssCode={`.otp-slot { width: 44px; height: 44px; border: 1px solid #dddbda; border-radius: 6px; font-size: 18px; font-weight: 500; text-align: center; display: flex; align-items: center; justify-content: center; }\n.otp-slot--filled { border-color: #145F33; }\n.otp-separator { font-size: 18px; color: #706e6b; padding: 0 4px; }`}
        >
          <InputOTP maxLength={6} value="482910">
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </ShowcaseCard>

        <ShowcaseCard
          id="OTP-04"
          title="Developer Notes"
          note="Paste support: pasting a full code auto-fills all slots. Uses input-otp library internally."
        >
          <div className="space-y-2">
            <p className="text-[length:var(--slds-g-font-size-4)]">
              Key props:
            </p>
            <ul className="space-y-1 text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
              <li>
                <code className="font-mono">maxLength</code>{" "}
                — total digit count
              </li>
              <li>
                <code className="font-mono">value / onChange</code>{" "}
                — controlled state
              </li>
              <li>
                <code className="font-mono">InputOTPSlot index</code>{" "}
                — required, 0-based
              </li>
              <li>
                <code className="font-mono">InputOTPSeparator</code>{" "}
                — renders a dash between groups
              </li>
            </ul>
          </div>
        </ShowcaseCard>
      </div>
    </div>
  );
}

export function AccordionSection() {
  return (
    <div id="sec-accordion">
      <h3
        className="mb-2"
        style={{
          fontSize: "var(--slds-g-font-size-6)",
          fontWeight: 500,
        }}
      >
        Accordion
      </h3>
      <p
        className="mb-4"
        style={{
          fontSize: "var(--slds-g-font-size-4)",
          color: "var(--slds-g-color-text-weak)",
        }}
      >
        Collapsible content panels via Radix. Supports single or
        multiple open items.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShowcaseCard
          id="ACC-01"
          title="Single (Collapsible)"
          description="Only one panel open at a time — type='single' collapsible"
          cssCode={`.accordion-item {
  border-bottom: 1px solid #dddbda;
}
.accordion-item:last-child {
  border-bottom: none;
}

.accordion-trigger {
  display: flex;
  flex: 1;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-radius: 6px;
  padding: 16px 0;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.accordion-trigger:hover {
  text-decoration: underline;
}

.accordion-trigger-icon {
  width: 16px;
  height: 16px;
  color: #717182;
  flex-shrink: 0;
  transform: translateY(2px);
  transition: transform 0.2s ease;
}

.accordion-trigger[data-state="open"] .accordion-trigger-icon {
  transform: translateY(2px) rotate(180deg);
}

.accordion-content {
  overflow: hidden;
  font-size: 13px;
  color: #706e6b;
}

.accordion-content-inner {
  padding-top: 0;
  padding-bottom: 16px;
}`}
        >
          <Accordion
            type="single"
            collapsible
            className="w-full"
          >
            <AccordionItem value="a1">
              <AccordionTrigger
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                }}
              >
                Constituent Details
              </AccordionTrigger>
              <AccordionContent
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Name, date of birth, contact information, and
                demographic data for the youth record.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="a2">
              <AccordionTrigger
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                }}
              >
                Program Enrollment
              </AccordionTrigger>
              <AccordionContent
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Active program placements, enrollment dates, and
                bed assignment history.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="a3">
              <AccordionTrigger
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                }}
              >
                Clinical Notes
              </AccordionTrigger>
              <AccordionContent
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Treatment plans, progress notes, and clinical
                assessments.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ShowcaseCard>

        <ShowcaseCard
          id="ACC-02"
          title="Multiple"
          description="Multiple panels can be open simultaneously — type='multiple'"
          cssCode={`.accordion-item {
  border-bottom: 1px solid #dddbda;
}
.accordion-item:last-child {
  border-bottom: none;
}

.accordion-trigger {
  display: flex;
  flex: 1;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-radius: 6px;
  padding: 16px 0;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.accordion-trigger:hover {
  text-decoration: underline;
}

.accordion-trigger-icon {
  width: 16px;
  height: 16px;
  color: #717182;
  flex-shrink: 0;
  transform: translateY(2px);
  transition: transform 0.2s ease;
}

.accordion-trigger[data-state="open"] .accordion-trigger-icon {
  transform: translateY(2px) rotate(180deg);
}

.accordion-content {
  overflow: hidden;
  font-size: 13px;
  color: #706e6b;
}

.accordion-content-inner {
  padding-top: 0;
  padding-bottom: 16px;
}`}
        >
          <Accordion
            type="multiple"
            defaultValue={["b1", "b3"]}
            className="w-full"
          >
            <AccordionItem value="b1">
              <AccordionTrigger
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                }}
              >
                Health Overview
              </AccordionTrigger>
              <AccordionContent
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Medical conditions, medications, allergies, and
                insurance information.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b2">
              <AccordionTrigger
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                }}
              >
                Education
              </AccordionTrigger>
              <AccordionContent
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                School enrollment, grade level, and academic
                goals.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b3">
              <AccordionTrigger
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                }}
              >
                Relationships
              </AccordionTrigger>
              <AccordionContent
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Family contacts, guardians, caseworkers, and
                support network.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ShowcaseCard>
      </div>
    </div>
  );
}

export function DropdownSection() {
  const [dropdownChecked, setDropdownChecked] = useState(true);
  const [dropdownRadio, setDropdownRadio] = useState("pedro");
  return (
    <div id="sec-dropdown">
      <h3 className="slds-section-title mb-2">Dropdown Menu</h3>
      <p className="mb-4 text-[length:var(--slds-g-font-size-4)] text-[var(--slds-g-color-text-weak)]">
        Context menus and action dropdowns via Radix. Supports
        icons, separators, checkboxes, radio groups, and
        submenus.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ShowcaseCard
          id="DRP-01"
          title="Basic with Icons"
          description="Standard action menu with separators and destructive item"
          cssCode={`.dropdown-trigger { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; cursor: pointer; background: #ffffff; }\n.dropdown-content { min-width: 200px; border: 1px solid #dddbda; border-radius: 8px; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 4px; }\n.dropdown-item { padding: 6px 12px; font-size: 13px; border-radius: 4px; cursor: pointer; }\n.dropdown-item:hover { background-color: #f3f2f2; }`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded border border-[var(--slds-g-color-border-base-1)] px-4 py-2 text-[length:var(--slds-g-font-size-4)]">
                Actions <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>
                Record Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4" /> Edit Record
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4" /> Open in
                Salesforce
                <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ShowcaseCard>

        <ShowcaseCard
          id="DRP-02"
          title="Checkbox Items"
          description="Toggle options within a dropdown"
          cssCode={`.dropdown-trigger { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; cursor: pointer; background: #ffffff; }\n.dropdown-checkbox-item { display: flex; align-items: center; gap: 8px; padding: 6px 12px; font-size: 13px; border-radius: 4px; cursor: pointer; }\n.dropdown-checkbox-item:hover { background-color: #f3f2f2; }\n.dropdown-checkbox-item[data-state=checked]::before { content: "✓"; color: #145F33; font-weight: 600; }`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded border border-[var(--slds-g-color-border-base-1)] px-4 py-2 text-[length:var(--slds-g-font-size-4)]">
                View Options <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={dropdownChecked}
                onCheckedChange={setDropdownChecked}
              >
                Show Status
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>
                Show Caseworker
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>
                Show Program
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ShowcaseCard>

        <ShowcaseCard
          id="DRP-03"
          title="Radio Items"
          description="Exclusive selection within a dropdown group"
          cssCode={`.dropdown-trigger { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; cursor: pointer; background: #ffffff; }\n.dropdown-radio-item { display: flex; align-items: center; gap: 8px; padding: 6px 12px; font-size: 13px; border-radius: 4px; cursor: pointer; }\n.dropdown-radio-item:hover { background-color: #f3f2f2; }\n.dropdown-radio-item[data-state=checked] { font-weight: 500; color: #145F33; }`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded border border-[var(--slds-g-color-border-base-1)] px-4 py-2 text-[length:var(--slds-g-font-size-4)]">
                Sort By <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>
                Sort Direction
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={dropdownRadio}
                onValueChange={setDropdownRadio}
              >
                <DropdownMenuRadioItem value="asc">
                  Ascending
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="desc">
                  Descending
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="none">
                  None
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <p className="mt-2 text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
            Sort: {dropdownRadio}
          </p>
        </ShowcaseCard>

        <ShowcaseCard
          id="DRP-04"
          title="Submenu"
          description="Nested navigation for grouped actions"
          cssCode={`.dropdown-trigger { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; cursor: pointer; background: #ffffff; }\n.dropdown-sub-trigger { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 12px; font-size: 13px; border-radius: 4px; cursor: pointer; }\n.dropdown-sub-trigger:hover { background-color: #f3f2f2; }\n.dropdown-sub-content { border: 1px solid #dddbda; border-radius: 8px; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 4px; }`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded border border-[var(--slds-g-color-border-base-1)] px-4 py-2 text-[length:var(--slds-g-font-size-4)]">
                More <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <FileText className="h-4 w-4" /> Generate Report
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Download className="h-4 w-4" /> Export As
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>PDF</DropdownMenuItem>
                  <DropdownMenuItem>CSV</DropdownMenuItem>
                  <DropdownMenuItem>Excel</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <Settings className="h-4 w-4" /> Settings
                (Disabled)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ShowcaseCard>
      </div>
    </div>
  );
}

export function DrawerSection() {
  const [drawerBottom, setDrawerBottom] = useState(false);
  const [drawerRight, setDrawerRight] = useState(false);
  const [drawerTop, setDrawerTop] = useState(false);
  const [drawerLeft, setDrawerLeft] = useState(false);
  return (
    <div id="sec-drawer">
      <h3
        className="mb-2"
        style={{
          fontSize: "var(--slds-g-font-size-6)",
          fontWeight: 500,
        }}
      >
        Drawer / Sheet
      </h3>
      <p
        className="mb-4"
        style={{
          fontSize: "var(--slds-g-font-size-4)",
          color: "var(--slds-g-color-text-weak)",
        }}
      >
        Slide-over panels via vaul. Supports four placements:
        bottom, top, left, right.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShowcaseCard
          id="DRW-01"
          title="Placements"
          description="Click each button to see the drawer slide in from that direction"
        >
          <div className="flex flex-wrap gap-2">
            {[
              {
                label: "Bottom",
                dir: "bottom" as const,
                open: drawerBottom,
                setOpen: setDrawerBottom,
              },
              {
                label: "Right",
                dir: "right" as const,
                open: drawerRight,
                setOpen: setDrawerRight,
              },
              {
                label: "Top",
                dir: "top" as const,
                open: drawerTop,
                setOpen: setDrawerTop,
              },
              {
                label: "Left",
                dir: "left" as const,
                open: drawerLeft,
                setOpen: setDrawerLeft,
              },
            ].map(({ label, dir, open, setOpen }) => (
              <div
                key={dir}
                className="group/item flex flex-col items-center gap-1"
              >
                <Drawer
                  direction={dir}
                  open={open}
                  onOpenChange={setOpen}
                >
                  <DrawerTrigger asChild>
                    <button
                      className="px-3 py-1.5 rounded"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        fontSize: "var(--slds-g-font-size-4)",
                      }}
                    >
                      {label}
                    </button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>
                        Drawer — {label}
                      </DrawerTitle>
                      <DrawerDescription>
                        This is the {dir} drawer. Content slides
                        in from the {dir}.
                      </DrawerDescription>
                    </DrawerHeader>
                    <div
                      className="p-4"
                      style={{
                        fontSize: "var(--slds-g-font-size-4)",
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Drawer content goes here. Use this for
                      filters, detail panels, or forms.
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <button
                          className="px-4 py-2 rounded-full text-white"
                          style={{
                            backgroundColor: "#145F33",
                            fontSize:
                              "var(--slds-g-font-size-4)",
                          }}
                        >
                          Confirm
                        </button>
                      </DrawerClose>
                      <DrawerClose asChild>
                        <button
                          className="px-4 py-2 rounded-full"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            fontSize:
                              "var(--slds-g-font-size-4)",
                          }}
                        >
                          Cancel
                        </button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity mt-1">
                  <CopyCSSBtn css=".drawer-overlay { position: fixed; inset: 0; background-color: rgba(0,0,0,0.4); }\n.drawer-content { position: fixed; bottom: 0; left: 0; right: 0; background-color: #ffffff; border-radius: 12px 12px 0 0; padding: 24px; max-height: 85vh; overflow-y: auto; }\n.drawer-handle { width: 48px; height: 4px; border-radius: 9999px; background-color: #dddbda; margin: 0 auto 16px; }" />
                </div>
              </div>
            ))}
          </div>
        </ShowcaseCard>

        <ShowcaseCard
          id="DRW-02"
          title="Developer Notes"
          note="direction prop is set on the <Drawer> root, not DrawerContent."
        >
          <ul
            className="space-y-1.5"
            style={{
              fontSize: "var(--slds-g-font-size-4)",
              color: "var(--slds-g-color-text-weak)",
            }}
          >
            <li>
              <strong>bottom</strong>: 80vh max-height, drag
              handle visible
            </li>
            <li>
              <strong>top</strong>: 80vh max-height, slides from
              top
            </li>
            <li>
              <strong>left / right</strong>: 3/4 width,
              sm:max-w-sm cap
            </li>
            <li>
              Use{" "}
              <code style={{ fontFamily: "monospace" }}>
                DrawerFooter
              </code>{" "}
              for action buttons
            </li>
            <li>
              Overlay auto-included in{" "}
              <code style={{ fontFamily: "monospace" }}>
                DrawerContent
              </code>
            </li>
          </ul>
        </ShowcaseCard>
      </div>
    </div>
  );
}

export function SliderSection() {
  const [sliderSingle, setSliderSingle] = useState([40]);
  const [sliderRange, setSliderRange] = useState([20, 70]);
  return (
    <div id="sec-slider">
      <h3
        className="mb-2"
        style={{
          fontSize: "var(--slds-g-font-size-6)",
          fontWeight: 500,
        }}
      >
        Slider
      </h3>
      <p
        className="mb-4"
        style={{
          fontSize: "var(--slds-g-font-size-4)",
          color: "var(--slds-g-color-text-weak)",
        }}
      >
        Range input via Radix. Supports single value, range,
        vertical orientation, and disabled state.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShowcaseCard
          id="SLD-01"
          title="Single Value"
          description="Track a single numeric value"
          cssCode={`.slider-track { height: 6px; border-radius: 9999px; background-color: #dddbda; position: relative; }\n.slider-range { height: 100%; background-color: #145F33; border-radius: 9999px; }\n.slider-thumb { width: 18px; height: 18px; border-radius: 9999px; background-color: #145F33; border: 2px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); cursor: pointer; }`}
        >
          <div className="space-y-3 px-1">
            <Slider
              value={sliderSingle}
              onValueChange={setSliderSingle}
              min={0}
              max={100}
            />
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontSize: "var(--slds-g-font-size-3)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                0
              </span>
              <span
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                  fontWeight: 500,
                }}
              >
                {sliderSingle[0]}
              </span>
              <span
                style={{
                  fontSize: "var(--slds-g-font-size-3)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                100
              </span>
            </div>
          </div>
        </ShowcaseCard>

        <ShowcaseCard
          id="SLD-02"
          title="Range"
          description="Two-thumb range selection"
          cssCode={`.slider-track { height: 6px; border-radius: 9999px; background-color: #dddbda; position: relative; }\n.slider-range { height: 100%; background-color: #145F33; border-radius: 9999px; }\n.slider-thumb { width: 18px; height: 18px; border-radius: 9999px; background-color: #145F33; border: 2px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); cursor: pointer; }`}
        >
          <div className="space-y-3 px-1">
            <Slider
              value={sliderRange}
              onValueChange={setSliderRange}
              min={0}
              max={100}
            />
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                  fontWeight: 500,
                }}
              >
                {sliderRange[0]}
              </span>
              <span
                style={{
                  fontSize: "var(--slds-g-font-size-3)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                range
              </span>
              <span
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                  fontWeight: 500,
                }}
              >
                {sliderRange[1]}
              </span>
            </div>
          </div>
        </ShowcaseCard>

        <ShowcaseCard
          id="SLD-03"
          title="Disabled"
          cssCode={`.slider-track { height: 6px; border-radius: 9999px; background-color: #dddbda; position: relative; opacity: 0.5; }\n.slider-thumb { width: 18px; height: 18px; border-radius: 9999px; background-color: #145F33; border: 2px solid #ffffff; cursor: not-allowed; }`}
        >
          <div className="px-1">
            <Slider
              defaultValue={[60]}
              disabled
              min={0}
              max={100}
            />
          </div>
        </ShowcaseCard>

        <ShowcaseCard
          id="SLD-04"
          title="Vertical Orientation"
          description="orientation='vertical' — min-h-44"
          cssCode={`.slider-track--vertical { width: 6px; height: 100%; border-radius: 9999px; background-color: #dddbda; position: relative; }\n.slider-range--vertical { width: 100%; background-color: #145F33; border-radius: 9999px; }\n.slider-thumb { width: 18px; height: 18px; border-radius: 9999px; background-color: #145F33; border: 2px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); cursor: pointer; }`}
        >
          <div className="flex items-center justify-center h-44">
            <Slider
              defaultValue={[35]}
              orientation="vertical"
              min={0}
              max={100}
              className="h-full"
            />
          </div>
        </ShowcaseCard>
      </div>
    </div>
  );
}

export function PaginationSection() {
  const [paginationPage, setPaginationPage] = useState(1);
  const totalPages = 10;
  return (
    <div id="sec-pagination">
      <h3
        className="mb-2"
        style={{
          fontSize: "var(--slds-g-font-size-6)",
          fontWeight: 500,
        }}
      >
        Pagination
      </h3>
      <p
        className="mb-4"
        style={{
          fontSize: "var(--slds-g-font-size-4)",
          color: "var(--slds-g-color-text-weak)",
        }}
      >
        Navigation across multiple pages with ellipsis for large
        page sets.
      </p>
      <div className="grid grid-cols-1 gap-4">
        {/* Interactive */}
        <ShowcaseCard
          id="PGN-01"
          title="Interactive Pagination"
          description="Click prev/next or type a page number"
          cssCode={`.pagination { display: flex; align-items: center; gap: 4px; }\n.pagination-btn { width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: 1px solid #dddbda; cursor: pointer; font-size: 13px; }\n.pagination-btn--active { background-color: #145F33; color: #ffffff; border-color: #145F33; }\n.pagination-btn:hover:not(.pagination-btn--active) { background-color: #f3f2f2; }`}
        >
          <TablePaginationBar
            className="px-1"
            start={1}
            end={10}
            total={240}
            countLabel="records"
            currentPage={paginationPage}
            totalPages={totalPages}
            onPrevious={() => setPaginationPage((p) => Math.max(1, p - 1))}
            onNext={() => setPaginationPage((p) => Math.min(totalPages, p + 1))}
          />
        </ShowcaseCard>

        {/* Static states */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ShowcaseCard
            id="PGN-02"
            title="Beginning (page 1)"
            description="Previous disabled"
            cssCode={`.pagination { display: flex; align-items: center; gap: 4px; }\n.pagination-btn { width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: 1px solid #dddbda; cursor: pointer; font-size: 13px; }\n.pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }`}
          >
            <TablePaginationBar className="px-1" start={1} end={10} total={240} currentPage={1} totalPages={24} />
          </ShowcaseCard>

          <ShowcaseCard
            id="PGN-03"
            title="Middle (page 12)"
            description="Both directions available"
            cssCode={`.pagination { display: flex; align-items: center; gap: 4px; }\n.pagination-btn { width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: 1px solid #dddbda; cursor: pointer; font-size: 13px; }\n.pagination-btn:hover { background-color: #f3f2f2; }`}
          >
            <TablePaginationBar className="px-1" start={111} end={120} total={240} currentPage={12} totalPages={24} />
          </ShowcaseCard>

          <ShowcaseCard
            id="PGN-04"
            title="End (page 24)"
            description="Next disabled"
            cssCode={`.pagination { display: flex; align-items: center; gap: 4px; }\n.pagination-btn { width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: 1px solid #dddbda; cursor: pointer; font-size: 13px; }\n.pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }`}
          >
            <TablePaginationBar className="px-1" start={231} end={240} total={240} currentPage={24} totalPages={24} />
          </ShowcaseCard>
        </div>
      </div>
    </div>
  );
}

export function ToggleSection() {
  const [toggleDefault, setToggleDefault] = useState(false);
  const [toggleOutline, setToggleOutline] = useState(true);
  return (
    <div id="sec-toggle">
      <h3 className="slds-section-title mb-2">Toggle</h3>
      <p className="mb-4 text-[length:var(--slds-g-font-size-4)] text-[var(--slds-g-color-text-weak)]">
        Single-state on/off button. Variants: default, outline.
        Sizes: sm, default, lg.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShowcaseCard
          id="TGL-01"
          title="Variants"
          description="default and outline variants"
          cssCode={`.toggle-btn { padding: 6px 12px; border-radius: 4px; font-size: 13px; cursor: pointer; border: 1px solid #dddbda; background: none; }\n.toggle-btn[data-state=on] { background-color: #f3f2f2; font-weight: 500; border-color: #c9c7c5; }`}
        >
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex flex-col items-center gap-1">
              <Toggle
                pressed={toggleDefault}
                onPressedChange={setToggleDefault}
                variant="default"
              >
                <Bold className="h-4 w-4" />
              </Toggle>
              <span className="text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
                default {toggleDefault ? "on" : "off"}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Toggle
                pressed={toggleOutline}
                onPressedChange={setToggleOutline}
                variant="outline"
              >
                <Italic className="h-4 w-4" />
              </Toggle>
              <span className="text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
                outline {toggleOutline ? "on" : "off"}
              </span>
            </div>
          </div>
        </ShowcaseCard>

        <ShowcaseCard
          id="TGL-02"
          title="Sizes"
          description="sm, default, lg"
          cssCode={`.toggle-btn { padding: 6px 12px; border-radius: 4px; font-size: 13px; cursor: pointer; border: 1px solid #dddbda; background: none; }\n.toggle-btn--sm { padding: 4px 8px; font-size: 12px; }\n.toggle-btn--lg { padding: 8px 16px; font-size: 14px; }`}
        >
          <div className="flex flex-wrap gap-3 items-end">
            {[
              { size: "sm" as const, label: "sm" },
              {
                size: "default" as const,
                label: "default",
              },
              { size: "lg" as const, label: "lg" },
            ].map(({ size, label }) => (
              <div
                key={size}
                className="flex flex-col items-center gap-1"
              >
                <Toggle size={size} variant="outline">
                  <Underline className="h-4 w-4" />
                </Toggle>
                <span className="text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </ShowcaseCard>

        <ShowcaseCard
          id="TGL-03"
          title="With Text Labels"
          cssCode={`.toggle-btn { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 4px; font-size: 13px; cursor: pointer; border: 1px solid #dddbda; background: none; }\n.toggle-btn[data-state=on] { background-color: #f3f2f2; font-weight: 500; }`}
        >
          <div className="flex flex-wrap gap-2">
            <Toggle variant="outline">
              <Bold className="h-4 w-4 mr-1" /> Bold
            </Toggle>
            <Toggle variant="outline" pressed>
              <Italic className="h-4 w-4 mr-1" /> Italic (on)
            </Toggle>
            <Toggle variant="outline">
              <Underline className="h-4 w-4 mr-1" /> Underline
            </Toggle>
          </div>
        </ShowcaseCard>

        <ShowcaseCard
          id="TGL-04"
          title="Disabled States"
          cssCode={`.toggle-btn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }\n.toggle-btn[data-state=on]:disabled { background-color: #f3f2f2; }`}
        >
          <div className="flex gap-3 items-center">
            <Toggle variant="outline" disabled>
              <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle variant="outline" disabled pressed>
              <Italic className="h-4 w-4" />
            </Toggle>
            <span className="text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
              disabled off / disabled on
            </span>
          </div>
        </ShowcaseCard>
      </div>
    </div>
  );
}

export function ToggleGroupSection() {
  const [alignValue, setAlignValue] = useState("left");
  const [formatValues, setFormatValues] = useState<string[]>([
    "bold",
  ]);
  return (
    <div id="sec-toggle-group">
      <h3 className="slds-section-title mb-2">Toggle Group</h3>
      <p className="mb-4 text-[length:var(--slds-g-font-size-4)] text-[var(--slds-g-color-text-weak)]">
        Connected button group for exclusive or multi-select
        state. Inherits Toggle variants and sizes.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShowcaseCard
          id="TGG-01"
          title="Single Selection"
          description="type='single' — one value selected at a time"
          cssCode={`.toggle-group { display: flex; border: 1px solid #dddbda; border-radius: 4px; overflow: hidden; }\n.toggle-group-item { padding: 6px 12px; font-size: 13px; border-right: 1px solid #dddbda; background: none; cursor: pointer; }\n.toggle-group-item:last-child { border-right: none; }\n.toggle-group-item[data-state=on] { background-color: #145F33; color: #ffffff; }`}
        >
          <div className="space-y-3">
            <ToggleGroup
              type="single"
              value={alignValue}
              onValueChange={(v) => v && setAlignValue(v)}
              variant="outline"
            >
              <ToggleGroupItem
                value="left"
                aria-label="Align left"
              >
                <AlignLeft className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="center"
                aria-label="Align center"
              >
                <AlignCenter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="right"
                aria-label="Align right"
              >
                <AlignRight className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <p className="text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
              Alignment: {alignValue}
            </p>
          </div>
        </ShowcaseCard>

        <ShowcaseCard
          id="TGG-02"
          title="Multiple Selection"
          description="type='multiple' — toggle each item independently"
          cssCode={`.toggle-group { display: flex; border: 1px solid #dddbda; border-radius: 4px; overflow: hidden; }\n.toggle-group-item { padding: 6px 12px; font-size: 13px; border-right: 1px solid #dddbda; background: none; cursor: pointer; }\n.toggle-group-item:last-child { border-right: none; }\n.toggle-group-item[data-state=on] { background-color: #145F33; color: #ffffff; }`}
        >
          <div className="space-y-3">
            <ToggleGroup
              type="multiple"
              value={formatValues}
              onValueChange={setFormatValues}
              variant="outline"
            >
              <ToggleGroupItem value="bold" aria-label="Bold">
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="italic"
                aria-label="Italic"
              >
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="underline"
                aria-label="Underline"
              >
                <Underline className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <p className="text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
              Active: {formatValues.join(", ") || "none"}
            </p>
          </div>
        </ShowcaseCard>

        <ShowcaseCard
          id="TGG-03"
          title="Text Labels — Single"
          cssCode={`.toggle-group { display: flex; border: 1px solid #dddbda; border-radius: 4px; overflow: hidden; }\n.toggle-group-item { padding: 6px 16px; font-size: 13px; border-right: 1px solid #dddbda; background: none; cursor: pointer; }\n.toggle-group-item:last-child { border-right: none; }\n.toggle-group-item[data-state=on] { background-color: #145F33; color: #ffffff; font-weight: 500; }`}
        >
          <ToggleGroup
            type="single"
            defaultValue="active"
            variant="outline"
          >
            <ToggleGroupItem value="active">
              Active
            </ToggleGroupItem>
            <ToggleGroupItem value="inactive">
              Inactive
            </ToggleGroupItem>
            <ToggleGroupItem value="pending">
              Pending
            </ToggleGroupItem>
          </ToggleGroup>
        </ShowcaseCard>

        <ShowcaseCard
          id="TGG-04"
          title="Sizes (sm / default / lg)"
          cssCode={`.toggle-group { display: flex; border: 1px solid #dddbda; border-radius: 4px; overflow: hidden; }\n.toggle-group-item--sm { padding: 4px 8px; font-size: 12px; }\n.toggle-group-item--default { padding: 6px 12px; font-size: 13px; }\n.toggle-group-item--lg { padding: 8px 16px; font-size: 14px; }\n.toggle-group-item[data-state=on] { background-color: #145F33; color: #ffffff; }`}
        >
          <div className="space-y-2">
            {(["sm", "default", "lg"] as const).map((sz) => (
              <div key={sz} className="flex items-center gap-3">
                <span className="w-14 text-right text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
                  {sz}
                </span>
                <ToggleGroup
                  type="single"
                  defaultValue="a"
                  size={sz}
                  variant="outline"
                >
                  <ToggleGroupItem value="a">
                    <AlignLeft className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="b">
                    <AlignCenter className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="c">
                    <AlignRight className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            ))}
          </div>
        </ShowcaseCard>
      </div>
    </div>
  );
}

export function AlertDialogSection() {
  return (
    <div id="sec-alert-dialog">
      <h3
        className="mb-2"
        style={{
          fontSize: "var(--slds-g-font-size-6)",
          fontWeight: 500,
        }}
      >
        Alert Dialog
      </h3>
      <p
        className="mb-4"
        style={{
          fontSize: "var(--slds-g-font-size-4)",
          color: "var(--slds-g-color-text-weak)",
        }}
      >
        Blocking confirmation dialogs via Radix. Requires
        explicit user action to dismiss.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShowcaseCard
          id="ALD-01"
          title="Confirmation"
          description="Standard confirm/cancel pattern"
          cssCode={`.alert-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: rgba(0, 0, 0, 0.5);
}

.alert-dialog-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 50;
  display: grid;
  gap: 16px;
  width: 100%;
  max-width: calc(100% - 2rem);
  padding: 24px;
  background-color: #f9fafb;
  border: 1px solid #dddbda;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
}
@media (min-width: 640px) {
  .alert-dialog-content { max-width: 32rem; }
}

.alert-dialog-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}
@media (min-width: 640px) {
  .alert-dialog-header { text-align: left; }
}

.alert-dialog-title {
  font-size: 18px;
  font-weight: 600;
}

.alert-dialog-description {
  font-size: 13px;
  color: #717182;
}

.alert-dialog-footer {
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
}
@media (min-width: 640px) {
  .alert-dialog-footer { flex-direction: row; justify-content: flex-end; }
}`}
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="px-4 py-2 rounded-full text-white"
                style={{
                  backgroundColor: "#145F33",
                  fontSize: "var(--slds-g-font-size-4)",
                }}
              >
                Confirm Action
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Submit Youth Record?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will submit the intake record for
                  YTH-001. All required fields must be completed
                  before submission. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>
                  Submit Record
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </ShowcaseCard>

        <ShowcaseCard
          id="ALD-02"
          title="Destructive"
          description="Permanent delete with destructive styling"
          cssCode={`.alert-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: rgba(0, 0, 0, 0.5);
}

.alert-dialog-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 50;
  display: grid;
  gap: 16px;
  width: 100%;
  max-width: calc(100% - 2rem);
  padding: 24px;
  background-color: #f9fafb;
  border: 1px solid #dddbda;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
}
@media (min-width: 640px) {
  .alert-dialog-content { max-width: 32rem; }
}

.alert-dialog-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}
@media (min-width: 640px) {
  .alert-dialog-header { text-align: left; }
}

.alert-dialog-title {
  font-size: 18px;
  font-weight: 600;
}

.alert-dialog-description {
  font-size: 13px;
  color: #717182;
}

.alert-dialog-footer {
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
}
@media (min-width: 640px) {
  .alert-dialog-footer { flex-direction: row; justify-content: flex-end; }
}`}
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="px-4 py-2 rounded-full text-white"
                style={{
                  backgroundColor: "#A82031",
                  fontSize: "var(--slds-g-font-size-4)",
                }}
              >
                Delete Record
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete Contact Log Entry?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the contact log
                  entry from 02/15/2026. This action cannot be
                  undone and cannot be recovered.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  Keep Entry
                </AlertDialogCancel>
                <AlertDialogAction
                  style={{ backgroundColor: "#A82031" }}
                >
                  Delete Permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </ShowcaseCard>

        <ShowcaseCard
          id="ALD-03"
          title="Warning"
          description="Caution before proceeding with a risky action"
          cssCode={`.alert-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: rgba(0, 0, 0, 0.5);
}

.alert-dialog-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 50;
  display: grid;
  gap: 16px;
  width: 100%;
  max-width: calc(100% - 2rem);
  padding: 24px;
  background-color: #f9fafb;
  border: 1px solid #dddbda;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
}
@media (min-width: 640px) {
  .alert-dialog-content { max-width: 32rem; }
}

.alert-dialog-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}
@media (min-width: 640px) {
  .alert-dialog-header { text-align: left; }
}

.alert-dialog-title {
  font-size: 18px;
  font-weight: 600;
}

.alert-dialog-description {
  font-size: 13px;
  color: #717182;
}

.alert-dialog-footer {
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
}
@media (min-width: 640px) {
  .alert-dialog-footer { flex-direction: row; justify-content: flex-end; }
}`}
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="px-4 py-2 rounded-full"
                style={{
                  border: "1px solid #E86C24",
                  color: "#E86C24",
                  fontSize: "var(--slds-g-font-size-4)",
                }}
              >
                Transfer Program
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Transfer Youth to Another Program?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Transferring to "Transitional Housing" will
                  close the current "Boys Program" enrollment.
                  The youth will need to be re-enrolled manually
                  if this was done in error.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Go Back</AlertDialogCancel>
                <AlertDialogAction>
                  Proceed with Transfer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </ShowcaseCard>

        <ShowcaseCard
          id="ALD-04"
          title="Developer Notes"
          note="AlertDialogAction uses default buttonVariants(), AlertDialogCancel uses outline. Override style prop for destructive actions."
        >
          <ul
            className="space-y-1.5"
            style={{
              fontSize: "var(--slds-g-font-size-4)",
              color: "var(--slds-g-color-text-weak)",
            }}
          >
            <li>
              Always include{" "}
              <code style={{ fontFamily: "monospace" }}>
                AlertDialogDescription
              </code>
            </li>
            <li>
              Dialog cannot be dismissed by clicking the overlay
            </li>
            <li>
              Add{" "}
              <code style={{ fontFamily: "monospace" }}>
                aria-describedby
              </code>{" "}
              for screen readers
            </li>
            <li>Use for irreversible operations only</li>
          </ul>
        </ShowcaseCard>
      </div>
    </div>
  );
}

export function ToastSection() {
  return (
    <div id="sec-toast">
      <h3
        className="mb-2"
        style={{
          fontSize: "var(--slds-g-font-size-6)",
          fontWeight: 500,
        }}
      >
        Toast (Sonner)
      </h3>
      <p
        className="mb-4"
        style={{
          fontSize: "var(--slds-g-font-size-4)",
          color: "var(--slds-g-color-text-weak)",
        }}
      >
        Non-blocking notifications via Sonner. Supports success,
        error, warning, info, loading, promise, action, and
        dismiss.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShowcaseCard
          id="TST-01"
          title="Toast Types"
          description="Click each button to trigger a toast notification"
        >
          <div className="flex flex-wrap gap-2">
            <div className="group/item flex flex-col items-center gap-1">
              <button
                className="px-3 py-1.5 rounded-full text-white"
                style={{
                  backgroundColor: "#145F33",
                  fontSize: "var(--slds-g-font-size-4)",
                }}
                onClick={() =>
                  toast.success("Record saved successfully.", {
                    description: "YTH-001 has been updated.",
                  })
                }
              >
                Success
              </button>
              <div className="opacity-0 group-hover/item:opacity-100 transition-opacity mt-1">
                <CopyCSSBtn css=".toast--success { background-color: #ffffff; border: 1px solid #a8d5b8; border-left: 4px solid #145F33; border-radius: 8px; padding: 12px 16px; display: flex; align-items: flex-start; gap: 12px; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }\n.toast-icon--success { color: #145F33; }" />
              </div>
            </div>
            <div className="group/item flex flex-col items-center gap-1">
              <button
                className="px-3 py-1.5 rounded-full text-white"
                style={{
                  backgroundColor: "#A82031",
                  fontSize: "var(--slds-g-font-size-4)",
                }}
                onClick={() =>
                  toast.error("Failed to save record.", {
                    description:
                      "Check required fields and try again.",
                  })
                }
              >
                Error
              </button>
              <div className="opacity-0 group-hover/item:opacity-100 transition-opacity mt-1">
                <CopyCSSBtn css=".toast--error { border-left-color: #A82031; border-color: #f48fb1; }\n.toast-icon--error { color: #A82031; }" />
              </div>
            </div>
            <div className="group/item flex flex-col items-center gap-1">
              <button
                className="px-3 py-1.5 rounded-full"
                style={{
                  border: "1px solid #E86C24",
                  color: "#E86C24",
                  fontSize: "var(--slds-g-font-size-4)",
                }}
                onClick={() =>
                  toast.warning("Unsaved changes detected.", {
                    description:
                      "Your changes will be lost if you navigate away.",
                  })
                }
              >
                Warning
              </button>
              <div className="opacity-0 group-hover/item:opacity-100 transition-opacity mt-1">
                <CopyCSSBtn css=".toast--warning { border-left-color: #E86C24; border-color: #fcd34d; }\n.toast-icon--warning { color: #E86C24; }" />
              </div>
            </div>
            <div className="group/item flex flex-col items-center gap-1">
              <button
                className="px-3 py-1.5 rounded-full"
                style={{
                  border: "1px solid #005EA2",
                  color: "#005EA2",
                  fontSize: "var(--slds-g-font-size-4)",
                }}
                onClick={() =>
                  toast.info("Info session scheduled.", {
                    description: "Feb 28, 2026 at 10:00 AM.",
                  })
                }
              >
                Info
              </button>
              <div className="opacity-0 group-hover/item:opacity-100 transition-opacity mt-1">
                <CopyCSSBtn css=".toast--info { border-left-color: #005EA2; border-color: #7dd3fc; }\n.toast-icon--info { color: #005EA2; }" />
              </div>
            </div>
          </div>
        </ShowcaseCard>

        <ShowcaseCard
          id="TST-02"
          title="Advanced Toast Types"
          description="Loading, Promise, Action, and Dismiss"
        >
          <div className="flex flex-wrap gap-2">
            <button
              className="px-3 py-1.5 rounded-full"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                fontSize: "var(--slds-g-font-size-4)",
              }}
              onClick={() => {
                const id = toast.loading("Saving record...");
                setTimeout(
                  () => toast.success("Record saved!", { id }),
                  2000,
                );
              }}
            >
              Loading → Success
            </button>
            <button
              className="px-3 py-1.5 rounded-full"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                fontSize: "var(--slds-g-font-size-4)",
              }}
              onClick={() =>
                toast.promise(
                  new Promise((resolve) =>
                    setTimeout(resolve, 2000),
                  ),
                  {
                    loading: "Submitting referral...",
                    success: "Referral submitted!",
                    error: "Failed to submit referral.",
                  },
                )
              }
            >
              Promise
            </button>
            <button
              className="px-3 py-1.5 rounded-full"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                fontSize: "var(--slds-g-font-size-4)",
              }}
              onClick={() =>
                toast("Youth record deleted.", {
                  action: {
                    label: "Undo",
                    onClick: () =>
                      toast.success("Deletion undone."),
                  },
                })
              }
            >
              Action (Undo)
            </button>
            <button
              className="px-3 py-1.5 rounded-full"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                fontSize: "var(--slds-g-font-size-4)",
              }}
              onClick={() => {
                const id = toast("Persistent notification.");
                setTimeout(() => toast.dismiss(id), 500);
              }}
            >
              Dismiss
            </button>
          </div>
        </ShowcaseCard>

        <ShowcaseCard
          id="TST-03"
          title="Developer Notes"
          note="CRITICAL: always import from 'sonner@2.0.3', never bare 'sonner'. Include <Toaster> once at the top of your component tree."
        >
          <ul
            className="space-y-1.5"
            style={{
              fontSize: "var(--slds-g-font-size-4)",
              color: "var(--slds-g-color-text-weak)",
            }}
          >
            <li>
              <code style={{ fontFamily: "monospace" }}>
                toast.success(msg, options)
              </code>
            </li>
            <li>
              <code style={{ fontFamily: "monospace" }}>
                toast.error(msg, options)
              </code>
            </li>
            <li>
              <code style={{ fontFamily: "monospace" }}>
                toast.warning(msg, options)
              </code>
            </li>
            <li>
              <code style={{ fontFamily: "monospace" }}>
                toast.info(msg, options)
              </code>
            </li>
            <li>
              <code style={{ fontFamily: "monospace" }}>
                toast.loading(msg)
              </code>{" "}
              → returns id
            </li>
            <li>
              <code style={{ fontFamily: "monospace" }}>
                toast.promise(promise, labels)
              </code>
            </li>
            <li>
              <code style={{ fontFamily: "monospace" }}>
                toast.dismiss(id)
              </code>
            </li>
          </ul>
        </ShowcaseCard>
      </div>
    </div>
  );
}