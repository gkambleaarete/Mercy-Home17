import { useState } from "react";
import { Plus } from "@/app/lib/lucide-icons";
import { MedicationsTabContent } from "./MedicationsTabContent";
import { MedicationsView } from "./MedicationsView";
import { StandardOTCView } from "./StandardOTCView";
import { OTCConsentDashboard } from "./OTCConsentDashboard";
import { CountView } from "./CountView";
import { PackMedsView } from "./PackMedsView";
import { LogView } from "./LogView";
import { getYouthName } from "../../data/mockYouthProgramData";

// youthId (20042): the profile's Youth Constituent ID — Pack Meds then shows
// and saves that youth's Pack Med records. Omitted where no youth is known.
// medicationYouthId (US 20100 / 20102): the resolved Youth Constituent ID
// for Log and Count — null/undefined shows their unavailable state.
export function MedicationsSection({
  hideOtcDashboard = false,
  youthId,
  medicationYouthId = null,
  youthDisplayName,
}: {
  hideOtcDashboard?: boolean;
  youthId?: string;
  medicationYouthId?: string | null;
  /** Name shown on Pack Med labels/checklists when no youthId is known. */
  youthDisplayName?: string;
} = {}) {
  const [activeMedicationSection, setActiveMedicationSection] =
    useState<string>("history");

  // Mock consent data for dashboard - In production this would come from API
  const mockDashboardConsents = [
    {
      id: 1,
      youthName: "John Smith",
      program: "Residential Treatment",
      campus: "Main Campus",
      status: "Active" as const,
      startDate: "2026-01-15",
      endDate: "2027-01-14",
      executedDate: "2026-01-10",
      approvedMedications: [1, 2, 3, 6, 7, 9, 10],
      programTherapist: "Dr. Sarah Johnson",
      programDayCoordinator: "Michael Chen",
    },
    {
      id: 2,
      youthName: "Emily Rodriguez",
      program: "Residential Treatment",
      campus: "North Campus",
      status: "Active" as const,
      startDate: "2026-04-10",
      endDate: "2026-05-10", // Expiring soon (17 days from today - April 23, 2026)
      executedDate: "2026-04-05",
      approvedMedications: [1, 3, 6, 7, 9],
      programTherapist: "Dr. Sarah Johnson",
      programDayCoordinator: "Michael Chen",
    },
    {
      id: 3,
      youthName: "Marcus Thompson",
      program: "Day Treatment",
      campus: "South Campus",
      status: "Expired" as const,
      startDate: "2023-01-15",
      endDate: "2024-01-14",
      executedDate: "2023-01-10",
      approvedMedications: [1, 2, 3, 4, 5],
      programTherapist: "Dr. Emily Rodriguez",
      programDayCoordinator: "Lisa Martinez",
    },
    {
      id: 4,
      youthName: "Sarah Williams",
      program: "Residential Treatment",
      campus: "Main Campus",
      status: "Sent" as const,
      startDate: "2026-05-01",
      endDate: "2027-04-30",
      executedDate: null,
      approvedMedications: [1, 2, 3, 6, 7, 8, 9, 10],
      programTherapist: "Dr. Sarah Johnson",
      programDayCoordinator: "Michael Chen",
    },
    {
      id: 5,
      youthName: "David Chen",
      program: "Day Treatment",
      campus: "North Campus",
      status: "Draft" as const,
      startDate: "2026-06-01",
      endDate: "2027-05-31",
      executedDate: null,
      approvedMedications: [1, 3, 6, 9, 10],
      programTherapist: "Dr. Emily Rodriguez",
      programDayCoordinator: "Lisa Martinez",
    },
    {
      id: 6,
      youthName: "Jessica Martinez",
      program: "Residential Treatment",
      campus: "Main Campus",
      status: "Active" as const,
      startDate: "2026-03-01",
      endDate: "2026-05-05", // Expiring soon (12 days from today - April 23, 2026)
      executedDate: "2026-02-28",
      approvedMedications: [1, 2, 3, 4, 5, 6, 7],
      programTherapist: "Dr. Sarah Johnson",
      programDayCoordinator: "Michael Chen",
    },
    {
      id: 7,
      youthName: "Brandon Lee",
      program: "Day Treatment",
      campus: "South Campus",
      status: "Active" as const,
      startDate: "2026-04-01",
      endDate: "2027-03-31",
      executedDate: "2026-03-28",
      approvedMedications: [1, 3, 6, 9],
      programTherapist: "Dr. Emily Rodriguez",
      programDayCoordinator: "Lisa Martinez",
    },
  ];

  const handleViewConsentFromDashboard = (
    consentId: number,
  ) => {
    // In production, navigate to consent detail view
    console.log(`Navigating to consent ${consentId}`);
    // Could set a state to show consent details or navigate to youth profile
  };

  const handleRenewConsentFromDashboard = (
    consentId: number,
  ) => {
    // In production, open renewal modal
    console.log(`Renewing consent ${consentId}`);
    // Switch to OTC tab and trigger renewal modal
    setActiveMedicationSection("otcs");
  };

  return (
    <div
      className="overflow-hidden"
      style={{
        border: "1px solid var(--slds-g-color-border-base-1)",
        borderRadius: "var(--slds-c-card-radius-border)",
        backgroundColor: "var(--slds-g-color-background-base)",
      }}
    >
      {/* Horizontal Sub-tabs for Medication */}
      <div
        className="flex overflow-x-auto overflow-y-hidden border-b"
        style={{
          borderColor: "var(--slds-g-color-border-base-1)",
          backgroundColor: "var(--slds-g-color-background-alt)",
        }}
      >
        <button
          onClick={() =>
            setActiveMedicationSection("medications")
          }
          className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
            activeMedicationSection === "medications"
              ? "text-[#145F33]"
              : "text-[#706e6b] hover:text-[#080707]"
          }`}
          style={
            activeMedicationSection === "medications"
              ? {
                  borderBottom: "3px solid #145F33",
                  marginBottom: "-1px",
                }
              : {}
          }
        >
          Medications
        </button>
        <button
          onClick={() => setActiveMedicationSection("otcs")}
          className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
            activeMedicationSection === "otcs"
              ? "text-[#145F33]"
              : "text-[#706e6b] hover:text-[#080707]"
          }`}
          style={
            activeMedicationSection === "otcs"
              ? {
                  borderBottom: "3px solid #145F33",
                  marginBottom: "-1px",
                }
              : {}
          }
        >
          OTCs
        </button>
        {/* AC8: OTC Dashboard Tab */}
        {!hideOtcDashboard && (
          <button
            onClick={() =>
              setActiveMedicationSection("otc-dashboard")
            }
            className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
              activeMedicationSection === "otc-dashboard"
                ? "text-[#145F33]"
                : "text-[#706e6b] hover:text-[#080707]"
            }`}
            style={
              activeMedicationSection === "otc-dashboard"
                ? {
                    borderBottom: "3px solid #145F33",
                    marginBottom: "-1px",
                  }
                : {}
            }
          >
            OTC Dashboard
          </button>
        )}
        <button
          onClick={() => setActiveMedicationSection("packmeds")}
          className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
            activeMedicationSection === "packmeds"
              ? "text-[#145F33]"
              : "text-[#706e6b] hover:text-[#080707]"
          }`}
          style={
            activeMedicationSection === "packmeds"
              ? {
                  borderBottom: "3px solid #145F33",
                  marginBottom: "-1px",
                }
              : {}
          }
        >
          Pack Meds
        </button>
        <button
          onClick={() => setActiveMedicationSection("count")}
          className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
            activeMedicationSection === "count"
              ? "text-[#145F33]"
              : "text-[#706e6b] hover:text-[#080707]"
          }`}
          style={
            activeMedicationSection === "count"
              ? {
                  borderBottom: "3px solid #145F33",
                  marginBottom: "-1px",
                }
              : {}
          }
        >
          Count
        </button>
        <button
          onClick={() => setActiveMedicationSection("log")}
          className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
            activeMedicationSection === "log"
              ? "text-[#145F33]"
              : "text-[#706e6b] hover:text-[#080707]"
          }`}
          style={
            activeMedicationSection === "log"
              ? {
                  borderBottom: "3px solid #145F33",
                  marginBottom: "-1px",
                }
              : {}
          }
        >
          Log
        </button>
        <button
          onClick={() => setActiveMedicationSection("overview")}
          className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
            activeMedicationSection === "overview"
              ? "text-[#145F33]"
              : "text-[#706e6b] hover:text-[#080707]"
          }`}
          style={
            activeMedicationSection === "overview"
              ? {
                  borderBottom: "3px solid #145F33",
                  marginBottom: "-1px",
                }
              : {}
          }
        >
          Overview
        </button>
        <button
          onClick={() => setActiveMedicationSection("history")}
          className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
            activeMedicationSection === "history"
              ? "text-[#145F33]"
              : "text-[#706e6b] hover:text-[#080707]"
          }`}
          style={
            activeMedicationSection === "history"
              ? {
                  borderBottom: "3px solid #145F33",
                  marginBottom: "-1px",
                }
              : {}
          }
        >
          Medication History
        </button>
      </div>

      {/* Medication Content */}
      <div
        className={
          activeMedicationSection === "packmeds"
            ? ""
            : "p-3 sm:p-6"
        }
      >
        {activeMedicationSection === "medications" ? (
          <MedicationsView />
        ) : activeMedicationSection === "otcs" ? (
          <StandardOTCView />
        ) : activeMedicationSection === "otc-dashboard" &&
          !hideOtcDashboard ? (
          <OTCConsentDashboard
            consents={mockDashboardConsents}
            onViewConsent={handleViewConsentFromDashboard}
            onRenewConsent={handleRenewConsentFromDashboard}
          />
        ) : activeMedicationSection === "packmeds" ? (
          <PackMedsView
            youthId={youthId}
            youthDisplayName={
              youthId ? getYouthName(youthId) : youthDisplayName
            }
          />
        ) : activeMedicationSection === "count" ? (
          <CountView youthId={medicationYouthId} />
        ) : activeMedicationSection === "log" ? (
          <LogView youthId={medicationYouthId} />
        ) : activeMedicationSection === "history" ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="slds-text-6 font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Medication History
              </h2>
              <button
                className="flex items-center h-7 rounded-full slds-text-4 font-medium text-white transition-colors px-[12px] py-[0px]"
                style={{ backgroundColor: "#145F33" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "#0e4524")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "#145F33")
                }
                onClick={() => {
                  /* TODO: open Add Medication History modal */
                }}
              >
                <Plus className="h-3 w-4" />
                Add
              </button>
            </div>
            <MedicationsTabContent activeSubTab="history" />
          </div>
        ) : (
          <MedicationsTabContent
            activeSubTab={
              activeMedicationSection || "medications"
            }
          />
        )}
      </div>
    </div>
  );
}