import { AlertCircle, Package } from "@/app/lib/lucide-icons";
import { cn } from "../../lib/utils";

/**
 * Shared type definitions for medication overview display
 */
export interface ActiveMedication {
  id: number;
  dosePeriod: "Morning" | "Afternoon" | "Evening" | "Bedtime" | "PRN";
  medication: string;
  genericName?: string;
  dose: string;
  startTime: string;
  endTime: string;
  prescriptionStart?: string; // MM/DD/YYYY
  prescriptionEnd?: string;   // MM/DD/YYYY
}

export interface OTCConsent {
  id: string;
  status: "Active" | "Expired" | "Revoked";
  selectedOTCs: string[];
}

interface MedicationOverviewSectionsProps {
  activeMedications: ActiveMedication[];
  otcConsents: OTCConsent[];
}

/**
 * MedicationOverviewSections - Reusable component for displaying medication overview
 *
 * Displays medications in six sections:
 * - Morning, Afternoon, Evening, Bedtime (with colored headers)
 * - Standard OTC (50% gray header, always visible)
 * - PRN (black header)
 *
 * Sections are hidden when empty (except Standard OTC which always shows).
 * Medications are filtered by date range to show only active prescriptions.
 */
export function MedicationOverviewSections({ activeMedications, otcConsents }: MedicationOverviewSectionsProps) {
  // Fixed list of 11 standard OTC medications (AC6)
  const STANDARD_OTC_LIST = [
    { id: 1,  name: "Acetaminophen 325mg",        genericName: "Acetaminophen" },
    { id: 2,  name: "Ibuprofen 200mg",            genericName: "Ibuprofen" },
    { id: 3,  name: "Diphenhydramine 25mg",       genericName: "Diphenhydramine HCl" },
    { id: 4,  name: "Cetirizine 10mg",            genericName: "Cetirizine HCl" },
    { id: 5,  name: "Loratadine 10mg",            genericName: "Loratadine" },
    { id: 6,  name: "Calcium Carbonate 500mg",    genericName: "Calcium Carbonate" },
    { id: 7,  name: "Guaifenesin 600mg",          genericName: "Guaifenesin" },
    { id: 8,  name: "Bismuth Subsalicylate",      genericName: "Bismuth Subsalicylate" },
    { id: 9,  name: "Naproxen Sodium 220mg",      genericName: "Naproxen Sodium" },
    { id: 10, name: "Hydrocortisone 1% Cream",    genericName: "Hydrocortisone" },
    { id: 11, name: "Polyethylene Glycol 3350",   genericName: "Polyethylene Glycol 3350" },
  ];

  return (
    <div className="space-y-4">
      {/* Scheduled dose-period sections — hidden when empty (AC7, AC8: date-range filtered) */}
      {(["Morning", "Afternoon", "Evening", "Bedtime"] as const).map(dosePeriod => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const medsInPeriod = activeMedications.filter(med => {
          if (med.dosePeriod !== dosePeriod) return false;
          if (!med.prescriptionStart || !med.prescriptionEnd) return true;
          const [sm, sd, sy] = med.prescriptionStart.split("/").map(Number);
          const [em, ed, ey] = med.prescriptionEnd.split("/").map(Number);
          const start = new Date(sy, sm - 1, sd);
          const end = new Date(ey, em - 1, ed);
          return today >= start && today <= end;
        });
        if (medsInPeriod.length === 0) return null;

        const isLight = dosePeriod === "Evening";
        const headerBg =
          dosePeriod === "Morning" ? "#FFA500" :
          dosePeriod === "Afternoon" ? "#00CC99" :
          dosePeriod === "Evening" ? "#FFFF49" :
          "#3333FF";
        const textColor = isLight ? "#1E1E1E" : "white";

        return (
          <div
            key={dosePeriod}
            className="rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: headerBg }}
            >
              <div className="flex items-center gap-2">
                <h3 className="slds-text-4 font-semibold" style={{ color: textColor }}>{dosePeriod}</h3>
              </div>
              <span
                className="px-2 py-0.5 rounded slds-text-3 font-medium"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: textColor,
                  border: isLight ? '1px solid rgba(30,30,30,0.2)' : '1px solid rgba(255,255,255,0.3)'
                }}
              >
                {medsInPeriod.length} {medsInPeriod.length === 1 ? 'medication' : 'medications'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>MEDICATION</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>DOSE</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>START TIME</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>END TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {medsInPeriod.map((med, index) => (
                    <tr
                      key={med.id}
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: index < medsInPeriod.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                    >
                      <td className="px-4 py-3">
                        <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          {med.medication}
                          {med.genericName && (
                            <span className="font-normal" style={{ color: 'var(--slds-g-color-text-weak)' }}> [({med.genericName})]</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3"><span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.dose}</span></td>
                      <td className="px-4 py-3"><span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.startTime}</span></td>
                      <td className="px-4 py-3"><span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.endTime}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Standard OTC Section — always visible; fixed list of 11 canonical medications (AC3, AC6, AC9) */}
      {(() => {
        const activeConsent = otcConsents.find(c => c.status === 'Active');
        const approvedNames: string[] = activeConsent?.selectedOTCs ?? [];
        const approvedCount = STANDARD_OTC_LIST.filter(m => approvedNames.includes(m.name)).length;

        return (
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: '#808080' }}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-white" />
                <h3 className="slds-text-4 font-semibold text-white">Standard OTC</h3>
              </div>
              <span
                className="px-2 py-0.5 rounded slds-text-3 font-medium text-white"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                {activeConsent ? `${approvedCount} of 11 approved` : 'No active consent'}
              </span>
            </div>
            {!activeConsent && (
              <div
                className="px-4 py-2 slds-text-3"
                style={{ backgroundColor: '#FEF3C7', color: '#92400E', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
              >
                No active OTC consent on file. All medications shown as Not Approved.
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>MEDICATION</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {STANDARD_OTC_LIST.map((otc, index) => {
                    const isApproved = activeConsent && approvedNames.includes(otc.name);
                    return (
                      <tr
                        key={otc.id}
                        className="hover:bg-gray-50/50 transition-colors"
                        style={{ borderBottom: index < STANDARD_OTC_LIST.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                      >
                        <td className="px-4 py-3">
                          <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            {otc.name}
                            <span className="font-normal" style={{ color: 'var(--slds-g-color-text-weak)' }}> [({otc.genericName})]</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full slds-text-3 font-semibold",
                              isApproved ? "bg-green-100 text-green-800" : "bg-red-50 text-red-700"
                            )}
                          >
                            {isApproved ? "Approved" : "Not Approved"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* PRN section — hidden when empty (AC4, AC7, AC8: date-range filtered) */}
      {(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const prnMeds = activeMedications.filter(med => {
          if (med.dosePeriod !== "PRN") return false;
          if (!med.prescriptionStart || !med.prescriptionEnd) return true;
          const [sm, sd, sy] = med.prescriptionStart.split("/").map(Number);
          const [em, ed, ey] = med.prescriptionEnd.split("/").map(Number);
          const start = new Date(sy, sm - 1, sd);
          const end = new Date(ey, em - 1, ed);
          return today >= start && today <= end;
        });
        if (prnMeds.length === 0) return null;
        return (
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: '#000000' }}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-white" />
                <h3 className="slds-text-4 font-semibold text-white">PRN (As Needed)</h3>
              </div>
              <span
                className="px-2 py-0.5 rounded slds-text-3 font-medium text-white"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                {prnMeds.length} {prnMeds.length === 1 ? 'medication' : 'medications'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>MEDICATION</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>DOSE</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>START TIME</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>END TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {prnMeds.map((med, index) => (
                    <tr
                      key={med.id}
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: index < prnMeds.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                    >
                      <td className="px-4 py-3">
                        <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          {med.medication}
                          {med.genericName && (
                            <span className="font-normal" style={{ color: 'var(--slds-g-color-text-weak)' }}> [({med.genericName})]</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3"><span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.dose}</span></td>
                      <td className="px-4 py-3"><span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.startTime || '—'}</span></td>
                      <td className="px-4 py-3"><span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.endTime || '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
