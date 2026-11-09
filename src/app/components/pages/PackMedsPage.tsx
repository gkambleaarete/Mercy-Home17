import { YOUTH_MEDICATIONS as MOCK_YOUTH_MEDICATIONS } from "../../data/mockPackMedData";
import { packingSummary } from "../../lib/packingSummary";
import { PackMedRecordsSection } from "../medications/PackMedRecordsSection";
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Package,
  AlertCircle,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Clock,
  FileText,
  ChevronDown,
  User,
  Users,
  GraduationCap,
  UserCircle,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

// The checklist's PRN / As Needed rows (Ibuprofen, Benadryl below).
const PRN_ITEMS = ["Ibuprofen", "Benadryl"];

interface Medication {
  name: string;
  dose: string;
  frequency: string;
  prescriber: string;
  quantity?: number;
}

// Youth medication list now lives in the canonical Pack Med data module
// (shared with the Pack Meds dialog) — same records as before.

export function PackMedsPage() {
  const navigate = useNavigate();

  // State for date/time selection
  const [startDate, setStartDate] = useState("12/12/2025");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  // State for packed medications
  const [packedMedications, setPackedMedications] = useState<
    Set<string>
  >(new Set());

  // State for handoff dialog
  const [handoffDialogOpen, setHandoffDialogOpen] =
    useState(false);
  const [handoffRecipient, setHandoffRecipient] = useState("");
  const [handoffComment, setHandoffComment] = useState("");

  // Helper function to determine medication time period
  const getTimePeriod = (frequency: string): string => {
    const freq = frequency.toLowerCase();
    if (freq.includes("morning") || freq.includes("am"))
      return "Morning";
    if (freq.includes("afternoon") || freq.includes("midday"))
      return "Afternoon";
    if (
      freq.includes("evening") ||
      freq.includes("pm") ||
      freq.includes("twice daily")
    )
      return "Evening";
    if (freq.includes("bedtime") || freq.includes("night"))
      return "Bedtime";
    return "Morning";
  };

  // Toggle individual medication
  const handleToggleMedication = (medName: string) => {
    setPackedMedications((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(medName)) {
        newSet.delete(medName);
      } else {
        newSet.add(medName);
      }
      return newSet;
    });
  };

  // Pack all medications for a specific period
  const handlePackAllByPeriod = (period: string) => {
    const medsInPeriod: string[] = [];
    MOCK_YOUTH_MEDICATIONS.forEach((youth) => {
      youth.medications.forEach((med) => {
        if (getTimePeriod(med.frequency) === period) {
          medsInPeriod.push(med.name);
        }
      });
    });

    setPackedMedications((prev) => {
      const newSet = new Set(prev);
      medsInPeriod.forEach((medName) => newSet.add(medName));
      return newSet;
    });
  };

  // Summary counts — one shared definition (lib/packingSummary): scheduled
  // rows and PRN items are counted separately, so Remaining never mixes them.
  const summary = packingSummary(
    MOCK_YOUTH_MEDICATIONS,
    packedMedications,
    PRN_ITEMS,
  );
  const getTotalScheduledCount = () => summary.scheduledTotal;
  const getPackedCount = () => summary.scheduledPacked;
  const getRemainingCount = () => summary.scheduledRemaining;

  // Handle complete packing
  // Bulk pack-out checklist for every youth on the list — an operational
  // action, intentionally NOT a Pack Med record (no single youth, nothing
  // persisted), so it never takes part in Pass association. Individual Pack
  // Med records are saved through the Pack Medication workflow into the
  // canonical store (data/mockPackMedData.ts) — see "Pack Med Records".
  const handleCompletePacking = () => {
    if (packedMedications.size === 0) {
      return;
    }

    // Navigate back to medications page
    setTimeout(() => {
      navigate("/medications");
    }, 1000);
  };

  // Handle handoff
  const handleHandoff = () => {
    if (packedMedications.size === 0) {
      return;
    }

    setHandoffDialogOpen(true);
  };

  // Get packed medications list
  const getPackedMedicationsList = () => {
    const packedMedsList: any[] = [];
    MOCK_YOUTH_MEDICATIONS.forEach((youth) => {
      youth.medications.forEach((med) => {
        if (packedMedications.has(med.name)) {
          packedMedsList.push({
            ...med,
            youth: youth.name,
            program: youth.program,
          });
        }
      });
    });
    return packedMedsList;
  };

  // Handle handoff confirmation
  const handleConfirmHandoff = () => {
    if (!handoffRecipient) {
      return;
    }

    setHandoffDialogOpen(false);
    setHandoffRecipient("");
    setHandoffComment("");
  };

  // Handle print packing list
  const handlePrintPackingList = () => {
    if (packedMedications.size === 0) {
      return;
    }

    const packedMedsList: any[] = [];
    MOCK_YOUTH_MEDICATIONS.forEach((youth) => {
      youth.medications.forEach((med) => {
        if (packedMedications.has(med.name)) {
          packedMedsList.push({
            ...med,
            youth: youth.name,
            program: youth.program,
          });
        }
      });
    });

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medication Packing List</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px;
              color: #333;
            }
            h1 { 
              color: #145F33;
              border-bottom: 3px solid #145F33;
              padding-bottom: 10px;
            }
            .header-info {
              margin: 20px 0;
              font-size: 14px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left;
            }
            th { 
              background-color: #145F33;
              color: white;
            }
            .checkbox-cell {
              width: 40px;
              text-align: center;
            }
            .checkbox {
              width: 18px;
              height: 18px;
              border: 2px solid #333;
              display: inline-block;
            }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Medication Packing List</h1>
          <div class="header-info">
            <p><strong>Date Range:</strong> ${startDate || "Not specified"} ${startTime ? `at ${startTime}` : ""} - ${endDate || "Not specified"} ${endTime ? `at ${endTime}` : ""}</p>
            <p><strong>Total Medications:</strong> ${packedMedsList.length}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th class="checkbox-cell">✓</th>
                <th>Medication</th>
                <th>Dose</th>
                <th>Frequency</th>
                <th>Youth</th>
                <th>Program</th>
                <th>Prescriber</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${packedMedsList
                .map(
                  (med) => `
                <tr>
                  <td class="checkbox-cell"><span class="checkbox"></span></td>
                  <td><strong>${med.name}</strong></td>
                  <td>${med.dose}</td>
                  <td>${med.frequency}</td>
                  <td>${med.youth}</td>
                  <td>${med.program}</td>
                  <td>${med.prescriber}</td>
                  <td>${med.quantity || "N/A"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          <div style="margin-top: 40px; page-break-before: avoid;">
            <p><strong>Packed by:</strong> _________________________</p>
            <p><strong>Date/Time:</strong> _________________________</p>
            <p><strong>Verified by:</strong> _________________________</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Page Header */}
      <div
        className="px-6 py-4 border-b"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          borderColor: "var(--slds-g-color-border-base-1)",
        }}
      >
        {/* Breadcrumbs */}
        <nav
          className="flex items-center text-xs mb-3"
          style={{ color: "var(--slds-g-color-text-weak)" }}
          aria-label="Breadcrumb"
        >
          <span
            className="hover:underline cursor-pointer"
            onClick={() => navigate("/medications")}
          >
            Medications
          </span>
          <span className="mx-1">/</span>
          <span
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Pack Meds
          </span>
        </nav>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0"
              style={{
                backgroundColor: "var(--color-brand-primary)",
              }}
            >
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1
                className="text-lg font-bold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Pack Medications
              </h1>
              <p
                className="text-xs mt-1"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Organize medications for all youth across
                programs
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full h-9"
            onClick={() => navigate("/medications")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Medications
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-5 max-w-6xl mx-auto">
          {/* Saved Pack Med records + their Pass links (20042) */}
          <PackMedRecordsSection />

          {/* Packing Summary - First Section */}
          <div
            className="rounded-lg overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-3"
              style={{
                backgroundColor: "#f0fdf4",
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <h3
                className="font-semibold text-[15px]"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Packing Summary
              </h3>
            </div>

            {/* KPI Tiles */}
            <div className="grid grid-cols-3 gap-4 p-5">
              <div
                className="rounded-lg p-4 text-center"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor: "#fefefe",
                }}
              >
                <div
                  className="text-[28px] font-bold mb-1"
                  style={{
                    color: "var(--color-brand-primary)",
                  }}
                >
                  {getTotalScheduledCount()}
                </div>
                <div
                  className="text-[11px] uppercase tracking-wide"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Scheduled Total
                </div>
              </div>
              <div
                className="rounded-lg p-4 text-center"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor: "#fefefe",
                }}
              >
                <div className="text-[28px] font-bold text-green-600 mb-1">
                  {getPackedCount()}
                </div>
                <div
                  className="text-[11px] uppercase tracking-wide"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Scheduled Packed
                </div>
              </div>
              <div
                className="rounded-lg p-4 text-center"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor: "#fefefe",
                }}
              >
                <div className="text-[28px] font-bold text-orange-600 mb-1">
                  {getRemainingCount()}
                </div>
                <div
                  className="text-[11px] uppercase tracking-wide"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Scheduled Remaining
                </div>
              </div>
            </div>

            <p
              className="px-5 -mt-2 pb-4 slds-text-3"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              PRN / As Needed packed: {summary.prnPacked} of{" "}
              {summary.prnTotal} (not counted in scheduled
              totals)
            </p>
            {/* Action Buttons */}
            <div className="px-5 pb-5">
              <div className="flex items-center gap-3">
                <Button
                  className="flex-1 rounded-full"
                  style={{
                    backgroundColor:
                      "var(--color-brand-primary)",
                  }}
                  onClick={handleCompletePacking}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Complete Packing
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={handleHandoff}
                  style={{
                    borderColor: "var(--color-brand-primary)",
                    color: "var(--color-brand-primary)",
                  }}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Handoff
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={handlePrintPackingList}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Print List
                </Button>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div
            className="rounded-lg p-5"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
          >
            <h3
              className="font-semibold text-[15px] mb-4"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Select Packing Period
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="packStartDate"
                  className="text-[13px] mb-1.5 block"
                >
                  Start Date
                </Label>
                <DateInput
                  id="packStartDate"
                  value={isoToMdy(startDate)}
                  onChange={(v) =>
                    ((e) => setStartDate(e.target.value))({
                      target: { value: mdyToIso(v) },
                    })
                  }
                  className="h-9"
                />
              </div>
              <div>
                <Label
                  htmlFor="packStartTime"
                  className="text-[13px] mb-1.5 block"
                >
                  Start Time
                </Label>
                <Input
                  id="packStartTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <Label
                  htmlFor="packEndDate"
                  className="text-[13px] mb-1.5 block"
                >
                  End Date
                </Label>
                <DateInput
                  id="packEndDate"
                  value={isoToMdy(endDate)}
                  onChange={(v) =>
                    ((e) => setEndDate(e.target.value))({
                      target: { value: mdyToIso(v) },
                    })
                  }
                  className="h-9"
                />
              </div>
              <div>
                <Label
                  htmlFor="packEndTime"
                  className="text-[13px] mb-1.5 block"
                >
                  End Time
                </Label>
                <Input
                  id="packEndTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          </div>

          {/* Medications by Time Period */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3
                className="font-semibold text-[16px]"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Medications to Pack
              </h3>
              <Badge
                className="bg-blue-100 text-blue-800 border-blue-300"
                style={{
                  borderRadius: "12px",
                  padding: "4px 12px",
                }}
              >
                {getTotalScheduledCount()} scheduled doses
              </Badge>
            </div>

            {/* Morning Medications */}
            {MOCK_YOUTH_MEDICATIONS.some((y) =>
              y.medications.some(
                (m) => getTimePeriod(m.frequency) === "Morning",
              ),
            ) && (
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              >
                <div
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ backgroundColor: "#FFA500" }}
                >
                  <Sunrise className="h-5 w-5 text-white" />
                  <h4 className="font-semibold text-[14px] text-white">
                    Morning
                  </h4>
                </div>
                <div className="p-4 space-y-2">
                  {MOCK_YOUTH_MEDICATIONS.map((youth) =>
                    youth.medications
                      .filter(
                        (m) =>
                          getTimePeriod(m.frequency) ===
                          "Morning",
                      )
                      .map((med, idx) => (
                        <div
                          key={`${youth.id}-${idx}`}
                          className="flex items-center gap-4 p-3 rounded-md bg-white"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <input
                            type="checkbox"
                            className="h-5 w-5 rounded cursor-pointer"
                            style={{
                              accentColor:
                                "var(--color-brand-primary)",
                            }}
                            checked={packedMedications.has(
                              med.name,
                            )}
                            onChange={() =>
                              handleToggleMedication(med.name)
                            }
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-[13px]">
                              {med.name}
                            </div>
                            <div className="text-[12px] text-gray-600">
                              {med.dose} - {med.frequency} •{" "}
                              {youth.name}
                            </div>
                          </div>
                          <div
                            className="text-[13px] font-semibold"
                            style={{
                              color:
                                "var(--color-brand-primary)",
                            }}
                          >
                            Qty: {med.quantity || 7}
                          </div>
                        </div>
                      )),
                  )}
                </div>
                <div
                  className="px-5 py-3 border-t"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full px-4 h-8 text-[12px]"
                    onClick={() =>
                      handlePackAllByPeriod("Morning")
                    }
                  >
                    Pack All Morning Meds
                  </Button>
                </div>
              </div>
            )}

            {/* Afternoon Medications */}
            {MOCK_YOUTH_MEDICATIONS.some((y) =>
              y.medications.some(
                (m) =>
                  getTimePeriod(m.frequency) === "Afternoon",
              ),
            ) && (
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              >
                <div
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ backgroundColor: "#2CAB2C" }}
                >
                  <Sun className="h-5 w-5 text-white" />
                  <h4 className="font-semibold text-[14px] text-white">
                    Afternoon
                  </h4>
                </div>
                <div className="p-4 space-y-2">
                  {MOCK_YOUTH_MEDICATIONS.map((youth) =>
                    youth.medications
                      .filter(
                        (m) =>
                          getTimePeriod(m.frequency) ===
                          "Afternoon",
                      )
                      .map((med, idx) => (
                        <div
                          key={`${youth.id}-${idx}`}
                          className="flex items-center gap-4 p-3 rounded-md bg-white"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <input
                            type="checkbox"
                            className="h-5 w-5 rounded cursor-pointer"
                            style={{
                              accentColor:
                                "var(--color-brand-primary)",
                            }}
                            checked={packedMedications.has(
                              med.name,
                            )}
                            onChange={() =>
                              handleToggleMedication(med.name)
                            }
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-[13px]">
                              {med.name}
                            </div>
                            <div className="text-[12px] text-gray-600">
                              {med.dose} - {med.frequency} •{" "}
                              {youth.name}
                            </div>
                          </div>
                          <div
                            className="text-[13px] font-semibold"
                            style={{
                              color:
                                "var(--color-brand-primary)",
                            }}
                          >
                            Qty: {med.quantity || 7}
                          </div>
                        </div>
                      )),
                  )}
                </div>
                <div
                  className="px-5 py-3 border-t"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full px-4 h-8 text-[12px]"
                    onClick={() =>
                      handlePackAllByPeriod("Afternoon")
                    }
                  >
                    Pack All Afternoon Meds
                  </Button>
                </div>
              </div>
            )}

            {/* Evening Medications */}
            {MOCK_YOUTH_MEDICATIONS.some((y) =>
              y.medications.some(
                (m) => getTimePeriod(m.frequency) === "Evening",
              ),
            ) && (
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              >
                <div
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ backgroundColor: "#FFFF49" }}
                >
                  <Sunset className="h-5 w-5 text-gray-800" />
                  <h4 className="font-semibold text-[14px] text-gray-800">
                    Evening
                  </h4>
                </div>
                <div className="p-4 space-y-2">
                  {MOCK_YOUTH_MEDICATIONS.map((youth) =>
                    youth.medications
                      .filter(
                        (m) =>
                          getTimePeriod(m.frequency) ===
                          "Evening",
                      )
                      .map((med, idx) => (
                        <div
                          key={`${youth.id}-${idx}`}
                          className="flex items-center gap-4 p-3 rounded-md bg-white"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <input
                            type="checkbox"
                            className="h-5 w-5 rounded cursor-pointer"
                            style={{
                              accentColor:
                                "var(--color-brand-primary)",
                            }}
                            checked={packedMedications.has(
                              med.name,
                            )}
                            onChange={() =>
                              handleToggleMedication(med.name)
                            }
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-[13px]">
                              {med.name}
                            </div>
                            <div className="text-[12px] text-gray-600">
                              {med.dose} - {med.frequency} •{" "}
                              {youth.name}
                            </div>
                          </div>
                          <div
                            className="text-[13px] font-semibold"
                            style={{
                              color:
                                "var(--color-brand-primary)",
                            }}
                          >
                            Qty: {med.quantity || 7}
                          </div>
                        </div>
                      )),
                  )}
                </div>
                <div
                  className="px-5 py-3 border-t"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full px-4 h-8 text-[12px]"
                    onClick={() =>
                      handlePackAllByPeriod("Evening")
                    }
                  >
                    Pack All Evening Meds
                  </Button>
                </div>
              </div>
            )}

            {/* Bedtime Medications */}
            {MOCK_YOUTH_MEDICATIONS.some((y) =>
              y.medications.some(
                (m) => getTimePeriod(m.frequency) === "Bedtime",
              ),
            ) && (
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              >
                <div
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ backgroundColor: "#3333FF" }}
                >
                  <Moon className="h-5 w-5 text-white" />
                  <h4 className="font-semibold text-[14px] text-white">
                    Bedtime
                  </h4>
                </div>
                <div className="p-4 space-y-2">
                  {MOCK_YOUTH_MEDICATIONS.map((youth) =>
                    youth.medications
                      .filter(
                        (m) =>
                          getTimePeriod(m.frequency) ===
                          "Bedtime",
                      )
                      .map((med, idx) => (
                        <div
                          key={`${youth.id}-${idx}`}
                          className="flex items-center gap-4 p-3 rounded-md bg-white"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <input
                            type="checkbox"
                            className="h-5 w-5 rounded cursor-pointer"
                            style={{
                              accentColor:
                                "var(--color-brand-primary)",
                            }}
                            checked={packedMedications.has(
                              med.name,
                            )}
                            onChange={() =>
                              handleToggleMedication(med.name)
                            }
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-[13px]">
                              {med.name}
                            </div>
                            <div className="text-[12px] text-gray-600">
                              {med.dose} - {med.frequency} •{" "}
                              {youth.name}
                            </div>
                          </div>
                          <div
                            className="text-[13px] font-semibold"
                            style={{
                              color:
                                "var(--color-brand-primary)",
                            }}
                          >
                            Qty: {med.quantity || 7}
                          </div>
                        </div>
                      )),
                  )}
                </div>
                <div
                  className="px-5 py-3 border-t"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full px-4 h-8 text-[12px]"
                    onClick={() =>
                      handlePackAllByPeriod("Bedtime")
                    }
                  >
                    Pack All Bedtime Meds
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* PRN/As Needed Medications */}
          <div
            className="rounded-lg p-5"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor: "#fefce8",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3
                className="font-semibold text-[15px]"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                PRN / As Needed Medications
              </h3>
              <Badge
                className="bg-amber-100 text-amber-800 border-amber-300"
                style={{
                  borderRadius: "12px",
                  padding: "2px 10px",
                  fontSize: "11px",
                }}
              >
                Optional
              </Badge>
            </div>
            <p className="text-[13px] text-gray-600 mb-4">
              These medications should be packed for emergency
              or as-needed use during the selected period.
            </p>
            <div className="space-y-2">
              <div
                className="flex items-center gap-4 p-3 rounded-md bg-white"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded cursor-pointer"
                  style={{
                    accentColor: "var(--color-brand-primary)",
                  }}
                  checked={packedMedications.has("Ibuprofen")}
                  onChange={() =>
                    handleToggleMedication("Ibuprofen")
                  }
                />
                <div className="flex-1">
                  <div className="font-semibold text-[13px]">
                    Ibuprofen
                  </div>
                  <div className="text-[12px] text-gray-600">
                    400mg - As needed for pain/fever
                  </div>
                </div>
                <div
                  className="text-[13px] font-semibold"
                  style={{
                    color: "var(--color-brand-primary)",
                  }}
                >
                  Qty: 10
                </div>
              </div>
              <div
                className="flex items-center gap-4 p-3 rounded-md bg-white"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded cursor-pointer"
                  style={{
                    accentColor: "var(--color-brand-primary)",
                  }}
                  checked={packedMedications.has("Benadryl")}
                  onChange={() =>
                    handleToggleMedication("Benadryl")
                  }
                />
                <div className="flex-1">
                  <div className="font-semibold text-[13px]">
                    Benadryl
                  </div>
                  <div className="text-[12px] text-gray-600">
                    25mg - As needed for allergic reactions
                  </div>
                </div>
                <div
                  className="text-[13px] font-semibold"
                  style={{
                    color: "var(--color-brand-primary)",
                  }}
                >
                  Qty: 5
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Handoff Dialog */}
      <Dialog
        open={handoffDialogOpen}
        onOpenChange={setHandoffDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Handoff Medications</DialogTitle>
            <DialogDescription>
              Review the packed medications and confirm the
              recipient.
            </DialogDescription>
          </DialogHeader>

          {/* Medication Summary List - Scrollable */}
          <div
            className="flex-1 overflow-y-auto rounded-lg mb-4"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
          >
            <div className="p-4 space-y-2">
              {getPackedMedicationsList().length === 0 ? (
                <p
                  className="text-center text-[13px]"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  No medications selected for handoff
                </p>
              ) : (
                getPackedMedicationsList().map((med, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-md"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div
                          className="font-semibold text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {med.name}
                        </div>
                        <div
                          className="text-[12px] mt-1"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {med.dose} • {med.frequency}
                        </div>
                        <div
                          className="text-[12px] mt-1"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {med.youth} • {med.program}
                        </div>
                      </div>
                      <div
                        className="text-[12px] font-semibold"
                        style={{
                          color: "var(--color-brand-primary)",
                        }}
                      >
                        Qty: {med.quantity || "N/A"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Comment Section - Only show when "other" is selected */}
          {handoffRecipient === "other" && (
            <div className="space-y-1.5 mb-4">
              <Label
                htmlFor="handoffComment"
                className="text-[13px]"
              >
                Additional Comments
              </Label>
              <Textarea
                id="handoffComment"
                value={handoffComment}
                onChange={(e) =>
                  setHandoffComment(e.target.value)
                }
                placeholder="Enter details about the recipient..."
                className="h-20"
              />
            </div>
          )}

          {/* Action Buttons */}
          <DialogFooter className="gap-2 sm:gap-3">
            {handoffRecipient !== "other" ? (
              <>
                <Button
                  type="button"
                  className="rounded-full"
                  style={{
                    backgroundColor:
                      "var(--color-brand-primary)",
                  }}
                  onClick={() => {
                    setHandoffRecipient("youth");
                    handleConfirmHandoff();
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Youth Received
                </Button>
                <Select
                  value={handoffRecipient}
                  onValueChange={(value) => {
                    setHandoffRecipient(value);
                    if (value !== "other") {
                      handleConfirmHandoff();
                    }
                  }}
                >
                  <SelectTrigger
                    className="w-[140px] rounded-full"
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    <SelectValue placeholder="Other" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Parent
                      </div>
                    </SelectItem>
                    <SelectItem value="guardian">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4" />
                        Guardian
                      </div>
                    </SelectItem>
                    <SelectItem value="school">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        School
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Other
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setHandoffRecipient("");
                    setHandoffComment("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="rounded-full"
                  style={{
                    backgroundColor:
                      "var(--color-brand-primary)",
                  }}
                  onClick={handleConfirmHandoff}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Confirm Handoff
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}