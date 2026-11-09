import { useState } from "react";
import {
  FileText,
  Calendar as CalendarIcon,
  Plus,
  ChevronDown,
  Phone,
  User,
  Stethoscope,
  BookOpen,
  ArrowRight,
} from "@/app/lib/lucide-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../../ui/dialog";
import {
  ShowcaseCard,
  CopyCSSBtn,
  PatternSection,
} from "./ShowcaseCard";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Checkbox } from "../../ui/checkbox";

export function DialogSection() {
  const [dialog1Open, setDialog1Open] = useState(false);
  const [dialog2Open, setDialog2Open] = useState(false);
  const [dialog3Open, setDialog3Open] = useState(false);

  return (
    <div id="sec-dialog">
      <h3
        className="mb-4"
        style={{
          fontSize: "var(--slds-g-font-size-6)",
          fontWeight: 500,
        }}
      >
        Dialog/Modal Patterns
      </h3>

      {/* ── Trigger buttons ── */}
      <ShowcaseCard id="DLG-01" title="Dialog Variants">
        <p
          className="mb-4"
          style={{
            fontSize: "var(--slds-g-font-size-3)",
            color: "var(--slds-g-color-text-weak)",
          }}
        >
          Click each button to open a live dialog. Three sizes —
          Medium, Large, Extra Large.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setDialog1Open(true)} className="text-[length:var(--slds-g-font-size-4)]">
            <Plus className="h-4 w-4" /> Dialog 1 — Add Relationship{" "}
            <span className="opacity-60 text-xs ml-1">MD</span>
          </Button>
          <Button
            variant="outline-primary"
            onClick={() => setDialog2Open(true)}
            className="text-[length:var(--slds-g-font-size-4)]"
          >
            <CalendarIcon className="h-4 w-4" /> Dialog 2 — Schedule Appointment{" "}
            <span className="opacity-60 text-xs ml-1">LG</span>
          </Button>
          <Button
            variant="neutral"
            onClick={() => setDialog3Open(true)}
            className="text-[length:var(--slds-g-font-size-4)]"
          >
            <FileText className="h-4 w-4" /> Dialog 3 — Intake Assessment{" "}
            <span className="opacity-60 text-xs ml-1">XL</span>
          </Button>
        </div>

        {/* ── Copy CSS — per size ── */}
        <div className="mt-4 flex flex-wrap gap-2">
          <CopyCSSBtn
            label="Copy CSS — MD"
            css={`
              /* ── Dialog MD (max-width: 448px) ── */

              /* Backdrop */
              .dialog-backdrop {
                position: fixed;
                inset: 0;
                z-index: 50;
                background-color: rgba(0, 0, 0, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
              }

              /* Modal container */
              .dialog {
                position: relative;
                z-index: 51;
                width: 100%;
                max-width: 448px;
                background-color: #ffffff;
                border: 1px solid #dddbda;
                border-radius: 8px;
                box-shadow:
                  0 10px 15px -3px rgba(0, 0, 0, 0.1),
                  0 4px 6px -2px rgba(0, 0, 0, 0.05);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                max-height: calc(100vh - 32px);
              }

              /* Header */
              .dialog__header {
                padding: 16px 20px;
                border-bottom: 1px solid #dddbda;
                flex-shrink: 0;
              }

              .dialog__title {
                font-size: 16px;
                font-weight: 500;
                line-height: 24px;
                color: #080707;
                margin: 0;
              }

              /* Body */
              .dialog__body {
                padding: 16px 20px;
                overflow-y: auto;
                flex: 1;
              }

              /* Footer */
              .dialog__footer {
                padding: 12px 20px;
                border-top: 1px solid #dddbda;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 8px;
                flex-shrink: 0;
                background-color: #ffffff;
              }

              /* Close button */
              .dialog__close {
                position: absolute;
                top: 14px;
                right: 16px;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none;
                background: transparent;
                cursor: pointer;
                border-radius: 4px;
                color: #706e6b;
                opacity: 0.7;
              }
              .dialog__close:hover {
                opacity: 1;
                background-color: #f3f2f2;
              }
            `}
          />
          <CopyCSSBtn
            label="Copy CSS — LG"
            css={`
              /* ── Dialog LG (max-width: 576px) ── */

              /* Backdrop */
              .dialog-backdrop {
                position: fixed;
                inset: 0;
                z-index: 50;
                background-color: rgba(0, 0, 0, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
              }

              /* Modal container */
              .dialog--lg {
                position: relative;
                z-index: 51;
                width: 100%;
                max-width: 576px;
                background-color: #ffffff;
                border: 1px solid #dddbda;
                border-radius: 8px;
                box-shadow:
                  0 10px 15px -3px rgba(0, 0, 0, 0.1),
                  0 4px 6px -2px rgba(0, 0, 0, 0.05);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                max-height: calc(100vh - 32px);
              }

              /* Header */
              .dialog--lg .dialog__header {
                padding: 20px 24px 16px;
                border-bottom: 1px solid #dddbda;
                flex-shrink: 0;
              }

              .dialog--lg .dialog__title {
                font-size: 16px;
                font-weight: 600;
                line-height: 24px;
                color: #080707;
                margin: 0 0 2px;
              }

              .dialog--lg .dialog__subtitle {
                font-size: 13px;
                color: #706e6b;
                margin: 0;
              }

              /* Body */
              .dialog--lg .dialog__body {
                padding: 20px 24px;
                overflow-y: auto;
                flex: 1;
              }

              /* Two-column grid inside LG dialog */
              .dialog--lg .dialog__grid-2 {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
              }

              /* Footer */
              .dialog--lg .dialog__footer {
                padding: 14px 24px;
                border-top: 1px solid #dddbda;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 8px;
                flex-shrink: 0;
                background-color: #ffffff;
              }

              /* Close button */
              .dialog--lg .dialog__close {
                position: absolute;
                top: 16px;
                right: 20px;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none;
                background: transparent;
                cursor: pointer;
                border-radius: 4px;
                color: #706e6b;
                opacity: 0.7;
              }
              .dialog--lg .dialog__close:hover {
                opacity: 1;
                background-color: #f3f2f2;
              }
            `}
          />
          <CopyCSSBtn
            label="Copy CSS — XL"
            css={`
              /* ── Dialog XL (max-width: 820px, scrollable long form) ── */

              /* Backdrop */
              .dialog-backdrop {
                position: fixed;
                inset: 0;
                z-index: 50;
                background-color: rgba(0, 0, 0, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
              }

              /* Modal container */
              .dialog--xl {
                position: relative;
                z-index: 51;
                width: 100%;
                max-width: 820px;
                background-color: #ffffff;
                border: 1px solid #dddbda;
                border-radius: 8px;
                box-shadow:
                  0 10px 15px -3px rgba(0, 0, 0, 0.1),
                  0 4px 6px -2px rgba(0, 0, 0, 0.05);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                max-height: 90vh;
              }

              /* Header */
              .dialog--xl .dialog__header {
                padding: 20px 24px 16px;
                border-bottom: 1px solid #dddbda;
                flex-shrink: 0;
              }

              .dialog--xl .dialog__title {
                font-size: 16px;
                font-weight: 600;
                line-height: 24px;
                color: #080707;
                margin: 0 0 2px;
              }

              .dialog--xl .dialog__subtitle {
                font-size: 13px;
                color: #706e6b;
                margin: 0;
              }

              /* Scrollable body */
              .dialog--xl .dialog__body {
                padding: 20px 24px;
                overflow-y: auto;
                flex: 1;
              }

              /* Footer */
              .dialog--xl .dialog__footer {
                padding: 14px 24px;
                border-top: 1px solid #dddbda;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 8px;
                flex-shrink: 0;
                background-color: #ffffff;
              }

              /* Close button */
              .dialog--xl .dialog__close {
                position: absolute;
                top: 16px;
                right: 20px;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none;
                background: transparent;
                cursor: pointer;
                border-radius: 4px;
                color: #706e6b;
                opacity: 0.7;
              }
              .dialog--xl .dialog__close:hover {
                opacity: 1;
                background-color: #f3f2f2;
              }

              /* Responsive — collapse grids on narrow viewports */
              @media (max-width: 640px) {
                .dialog--xl {
                  max-width: 100%;
                  max-height: 100vh;
                  border-radius: 0;
                }
                .dialog--xl .dialog__grid-3,
                .dialog--xl .dialog__grid-2 {
                  grid-template-columns: 1fr;
                }
              }
            `}
          />
        </div>
      </ShowcaseCard>

      {/* ── Dialog 1: MD — Simple form, no subtitle ── */}
      <Dialog open={dialog1Open} onOpenChange={setDialog1Open}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Add Relationship</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div>
              <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                Contact Name{" "}
                <span className="text-[#c23934]">*</span>
              </Label>
              <Input type="text" placeholder="Search contacts…" size="md" className="w-full" />
            </div>
            <div>
              <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                Relationship Type{" "}
                <span className="text-[#c23934]">*</span>
              </Label>
              <div className="relative">
                <select
                  className="w-full h-9 px-3 rounded appearance-none border border-[var(--slds-g-color-border-base-1)] text-[length:var(--slds-g-font-size-4)] bg-[var(--slds-g-color-background-base)]"
                >
                  <option>Parent / Guardian</option>
                  <option>Sibling</option>
                  <option>Case Worker</option>
                  <option>Other</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-[var(--slds-g-color-text-weak)]" />
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="text-[length:var(--slds-g-font-size-4)]">
                Cancel
              </Button>
            </DialogClose>
            <Button variant="outline-primary" className="text-[length:var(--slds-g-font-size-4)]">
              Add Another
            </Button>
            <Button className="text-[length:var(--slds-g-font-size-4)]">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog 2: LG — Header with subtitle, multi-field form ── */}
      <Dialog open={dialog2Open} onOpenChange={setDialog2Open}>
        <DialogContent size="lg">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div>
                <DialogTitle>Schedule Appointment</DialogTitle>
                <DialogDescription>
                  Book a meeting with the youth's care team. All
                  fields marked * are required.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogBody>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                  Appointment Type{" "}
                  <span className="text-[#c23934]">*</span>
                </Label>
                <div className="relative">
                  <select
                    className="w-full h-9 px-3 rounded appearance-none border border-[var(--slds-g-color-border-base-1)] text-[length:var(--slds-g-font-size-4)] bg-[var(--slds-g-color-background-base)]"
                  >
                    <option>Initial Intake</option>
                    <option>Follow-up</option>
                    <option>Medical Review</option>
                    <option>Family Meeting</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-[var(--slds-g-color-text-weak)]" />
                </div>
              </div>
              <div>
                <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                  Date{" "}
                  <span className="text-[#c23934]">*</span>
                </Label>
                <Input type="text" placeholder="MM/DD/YYYY" size="md" className="w-full" />
              </div>
              <div>
                <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                  Time{" "}
                  <span className="text-[#c23934]">*</span>
                </Label>
                <Input type="text" placeholder="hh:mm AM/PM" size="md" className="w-full" />
              </div>
              <div>
                <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                  Staff Member{" "}
                  <span className="text-[#c23934]">*</span>
                </Label>
                <div className="relative">
                  <select
                    className="w-full h-9 px-3 rounded appearance-none border border-[var(--slds-g-color-border-base-1)] text-[length:var(--slds-g-font-size-4)] bg-[var(--slds-g-color-background-base)]"
                  >
                    <option>— Select staff —</option>
                    <option>Dr. Maria Santos</option>
                    <option>James Okafor</option>
                    <option>Lisa Chen</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-[var(--slds-g-color-text-weak)]" />
                </div>
              </div>
              <div>
                <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                  Location
                </Label>
                <div className="relative">
                  <select
                    className="w-full h-9 px-3 rounded appearance-none border border-[var(--slds-g-color-border-base-1)] text-[length:var(--slds-g-font-size-4)] bg-[var(--slds-g-color-background-base)]"
                  >
                    <option>Main Office — Room 3B</option>
                    <option>Virtual (Video Call)</option>
                    <option>Off-site</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-[var(--slds-g-color-text-weak)]" />
                </div>
              </div>
              <div className="col-span-2">
                <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                  Notes
                </Label>
                <Textarea rows={3} placeholder="Add any preparation notes or context…" size="md" className="w-full" />
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="justify-between">
            <Label className="flex items-center gap-2 cursor-pointer text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
              <Checkbox /> Send reminder to youth
            </Label>
            <div className="flex items-center gap-2">
              <DialogClose asChild>
                <Button variant="outline" className="text-[length:var(--slds-g-font-size-4)]">
                  Cancel
                </Button>
              </DialogClose>
              <Button className="text-[length:var(--slds-g-font-size-4)]">Schedule</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog 3: XL — Scrollable long form ── */}
      <Dialog open={dialog3Open} onOpenChange={setDialog3Open}>
        <DialogContent size="xl">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)]">
                <FileText className="h-4 w-4 text-[var(--color-brand-primary)]" />
              </div>
              <div>
                <DialogTitle>Intake Assessment Form</DialogTitle>
                <DialogDescription>
                  Complete all required sections before
                  submitting. Progress is auto-saved as a draft.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogBody className="space-y-6">
            {/* Section: Personal Information */}
            <div>
              <h5 className="font-semibold mb-3 pb-2 flex items-center gap-2 text-[length:var(--slds-g-font-size-4)] border-b border-[var(--slds-g-color-border-base-1)]">
                <User
                  className="h-4 w-4 text-[var(--color-brand-primary)]"
                  />{" "}
                Personal Information
              </h5>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                    First Name{" "}
                    <span className="text-[#c23934]">*</span>
                  </Label>
                  <Input type="text" size="md" className="w-full" />
                </div>
                <div>
                  <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                    Last Name{" "}
                    <span className="text-[#c23934]">*</span>
                  </Label>
                  <Input type="text" size="md" className="w-full" />
                </div>
                <div>
                  <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                    Date of Birth{" "}
                    <span className="text-[#c23934]">*</span>
                  </Label>
                  <Input type="text" placeholder="MM/DD/YYYY" size="md" className="w-full" />
                </div>
                <div>
                  <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                    Gender Identity
                  </Label>
                  <div className="relative">
                    <select
                      className="w-full h-9 px-3 rounded appearance-none border border-[var(--slds-g-color-border-base-1)] text-[length:var(--slds-g-font-size-4)] bg-[var(--slds-g-color-background-base)]"
                    >
                      <option>— Select —</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-[var(--slds-g-color-text-weak)]" />
                  </div>
                </div>
                <div>
                  <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                    Race / Ethnicity
                  </Label>
                  <div className="relative">
                    <select
                      className="w-full h-9 px-3 rounded appearance-none border border-[var(--slds-g-color-border-base-1)] text-[length:var(--slds-g-font-size-4)] bg-[var(--slds-g-color-background-base)]"
                    >
                      <option>— Select —</option>
                      <option>Black or African American</option>
                      <option>Hispanic / Latino</option>
                      <option>White</option>
                      <option>Asian</option>
                      <option>Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-[var(--slds-g-color-text-weak)]" />
                  </div>
                </div>
                <div>
                  <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                    Primary Language
                  </Label>
                  <div className="relative">
                    <select
                      className="w-full h-9 px-3 rounded appearance-none border border-[var(--slds-g-color-border-base-1)] text-[length:var(--slds-g-font-size-4)] bg-[var(--slds-g-color-background-base)]"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>Polish</option>
                      <option>Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-[var(--slds-g-color-text-weak)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Medical History */}
            <div>
              <h5 className="font-semibold mb-3 pb-2 flex items-center gap-2 text-[length:var(--slds-g-font-size-4)] border-b border-[var(--slds-g-color-border-base-1)]">
                <Stethoscope
                  className="h-4 w-4 text-[var(--color-brand-primary)]"
                  />{" "}
                Medical History
              </h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                    Current Diagnoses
                  </Label>
                  <Textarea rows={2} placeholder="List any known diagnoses…" size="md" className="w-full" />
                </div>
                <div>
                  <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                    Known Allergies
                  </Label>
                  <Input type="text" placeholder="e.g. Penicillin, Peanuts" size="md" className="w-full" />
                </div>
                <div>
                  <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                    Current Medications
                  </Label>
                  <Input type="text" placeholder="List medications if any" size="md" className="w-full" />
                </div>
                <div className="col-span-2 flex items-center gap-6 text-[length:var(--slds-g-font-size-3)]">
                  <Label className="flex items-center gap-2 cursor-pointer text-[var(--slds-g-color-text-default)]">
                    <Checkbox /> Mental health
                    history
                  </Label>
                  <Label className="flex items-center gap-2 cursor-pointer text-[var(--slds-g-color-text-default)]">
                    <Checkbox /> Substance use
                    history
                  </Label>
                  <Label className="flex items-center gap-2 cursor-pointer text-[var(--slds-g-color-text-default)]">
                    <Checkbox /> Prior
                    hospitalizations
                  </Label>
                </div>
              </div>
            </div>

            {/* Section: Emergency Contact */}
            <div>
              <h5 className="font-semibold mb-3 pb-2 flex items-center gap-2 text-[length:var(--slds-g-font-size-4)] border-b border-[var(--slds-g-color-border-base-1)]">
                <Phone
                  className="h-4 w-4 text-[var(--color-brand-primary)]"
                  />{" "}
                Emergency Contact
              </h5>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                    Full Name{" "}
                    <span className="text-[#c23934]">*</span>
                  </Label>
                  <Input type="text" size="md" className="w-full" />
                </div>
                <div>
                  <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                    Relationship{" "}
                    <span className="text-[#c23934]">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      className="w-full h-9 px-3 rounded appearance-none border border-[var(--slds-g-color-border-base-1)] text-[length:var(--slds-g-font-size-4)] bg-[var(--slds-g-color-background-base)]"
                    >
                      <option>Parent</option>
                      <option>Guardian</option>
                      <option>Sibling</option>
                      <option>Case Worker</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-[var(--slds-g-color-text-weak)]" />
                  </div>
                </div>
                <div>
                  <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                    Phone{" "}
                    <span className="text-[#c23934]">*</span>
                  </Label>
                  <Input type="text" placeholder="(555) 000-0000" size="md" className="w-full" />
                </div>
              </div>
            </div>

            {/* Section: Placement Notes */}
            <div>
              <h5 className="font-semibold mb-3 pb-2 flex items-center gap-2 text-[length:var(--slds-g-font-size-4)] border-b border-[var(--slds-g-color-border-base-1)]">
                <BookOpen
                  className="h-4 w-4 text-[var(--color-brand-primary)]"
                  />{" "}
                Placement Notes
              </h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                    Referral Source
                  </Label>
                  <div className="relative">
                    <select
                      className="w-full h-9 px-3 rounded appearance-none border border-[var(--slds-g-color-border-base-1)] text-[length:var(--slds-g-font-size-4)] bg-[var(--slds-g-color-background-base)]"
                    >
                      <option>DCFS</option>
                      <option>Self-referral</option>
                      <option>Court</option>
                      <option>Hospital</option>
                      <option>Other Agency</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-[var(--slds-g-color-text-weak)]" />
                  </div>
                </div>
                <div>
                  <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                    Assigned Program
                  </Label>
                  <div className="relative">
                    <select
                      className="w-full h-9 px-3 rounded appearance-none border border-[var(--slds-g-color-border-base-1)] text-[length:var(--slds-g-font-size-4)] bg-[var(--slds-g-color-background-base)]"
                    >
                      <option>— Select program —</option>
                      <option>Therapeutic Foster Care</option>
                      <option>Residential</option>
                      <option>Transitional Living</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-[var(--slds-g-color-text-weak)]" />
                  </div>
                </div>
                <div className="col-span-2">
                  <Label className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                    Additional Notes
                  </Label>
                  <Textarea rows={3} placeholder="Any additional context relevant to this intake…" size="md" className="w-full" />
                </div>
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="justify-between">
            <DialogClose asChild>
              <Button variant="outline" className="text-[length:var(--slds-g-font-size-4)]">
                Cancel
              </Button>
            </DialogClose>
            <div className="flex items-center gap-2">
              <Button variant="outline-primary" className="text-[length:var(--slds-g-font-size-4)]">
                Save Draft
              </Button>
              <Button className="text-[length:var(--slds-g-font-size-4)]">
                Submit Assessment{" "}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}