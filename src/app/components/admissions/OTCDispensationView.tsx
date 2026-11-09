import { useState } from "react";
import { Calendar, FileText, Filter, Search } from "@/app/lib/lucide-icons";
import { Input } from "@/components/ui/input";
import { OTCDispensation } from "./OTCDispensationModal";
import { cn } from "@/lib/utils";
import { formatMdy } from "../../lib/dateFormat";

interface OTCDispensationViewProps {
  dispensations: OTCDispensation[];
}

type SortColumn = "administrationDate" | "otcMedication" | "dosage" | "recordedDate";
type SortDirection = "asc" | "desc";

export function OTCDispensationView({ dispensations }: OTCDispensationViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<SortColumn>("administrationDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Handle sort
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  // Filter and sort dispensations
  const getFilteredAndSortedDispensations = () => {
    let filtered = [...dispensations];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(disp =>
        disp.otcMedication.toLowerCase().includes(search) ||
        disp.dosage.toLowerCase().includes(search) ||
        disp.consentReference.toLowerCase().includes(search) ||
        disp.recordedBy.toLowerCase().includes(search) ||
        disp.notes?.toLowerCase().includes(search) ||
        formatMdy(new Date(disp.administrationDate)).includes(search)
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case "administrationDate":
          comparison = new Date(a.administrationDate).getTime() - new Date(b.administrationDate).getTime();
          break;
        case "otcMedication":
          comparison = a.otcMedication.localeCompare(b.otcMedication);
          break;
        case "dosage":
          comparison = a.dosage.localeCompare(b.dosage);
          break;
        case "recordedDate":
          comparison = new Date(a.recordedDate).getTime() - new Date(b.recordedDate).getTime();
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  };

  const filteredDispensations = getFilteredAndSortedDispensations();

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-md relative">
          <Input
            type="text"
            placeholder="Search dispensations by medication, dosage, consent, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 pl-3 pr-3 text-[13px]"
            style={{
              border: '1px solid var(--slds-g-color-border-base-1)',
              backgroundColor: 'var(--slds-g-color-background-base)'
            }}
          />
        </div>
        <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
          <FileText className="h-4 w-4" />
          {filteredDispensations.length} record{filteredDispensations.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div 
        className="rounded-lg overflow-hidden"
        style={{
          border: '1px solid var(--slds-g-color-border-base-1)',
          backgroundColor: 'var(--slds-g-color-background-base)'
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr 
                style={{ 
                  backgroundColor: 'var(--slds-g-color-background-alt)',
                  borderBottom: '2px solid var(--slds-g-color-border-base-1)'
                }}
              >
                <th 
                  className="px-4 py-3 text-left text-[12px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                  onClick={() => handleSort("administrationDate")}
                >
                  <div className="flex items-center gap-1">
                    Administration Date
                    {sortColumn === "administrationDate" && (
                      <span className="text-[10px]">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-[12px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                  onClick={() => handleSort("otcMedication")}
                >
                  <div className="flex items-center gap-1">
                    OTC Medication
                    {sortColumn === "otcMedication" && (
                      <span className="text-[10px]">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-[12px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                  onClick={() => handleSort("dosage")}
                >
                  <div className="flex items-center gap-1">
                    Dosage
                    {sortColumn === "dosage" && (
                      <span className="text-[10px]">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-[12px] font-semibold"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                >
                  Consent Used
                </th>
                <th 
                  className="px-4 py-3 text-left text-[12px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                  onClick={() => handleSort("recordedDate")}
                >
                  <div className="flex items-center gap-1">
                    Recorded
                    {sortColumn === "recordedDate" && (
                      <span className="text-[10px]">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDispensations.map(disp => {
                const adminDate = new Date(disp.administrationDate);
                const recordedDate = new Date(disp.recordedDate);
                const isBackdated = adminDate < new Date(disp.recordedDate.split('T')[0]);
                const isFutureDated = adminDate > new Date();

                return (
                  <tr 
                    key={disp.id}
                    className="hover:bg-gray-50/50 transition-colors"
                    style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                  >
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          {formatMdy(adminDate)}
                        </span>
                        {isBackdated && (
                          <span className="text-[10px] text-blue-600 font-medium mt-0.5">BACKDATED</span>
                        )}
                        {isFutureDated && (
                          <span className="text-[10px] text-amber-600 font-medium mt-0.5">FUTURE-DATED</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        {disp.otcMedication}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        {disp.dosage}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          {disp.consentReference}
                        </span>
                        {disp.consentId === "NO-CONSENT" && (
                          <span className="text-[10px] text-red-600 font-medium mt-0.5">NO CONSENT</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          {formatMdy(recordedDate)}
                        </span>
                        <span className="text-[11px] mt-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                          by {disp.recordedBy}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredDispensations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className="h-8 w-8" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                      <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        {searchTerm ? 'No dispensations found matching your search' : 'No dispensations recorded yet'}
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        {!searchTerm && 'Click "Record Dispensation" to add a new entry'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes Section - Show if any dispensation has notes */}
      {filteredDispensations.some(d => d.notes) && (
        <div className="space-y-2">
          <h4 className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
            Dispensation Notes
          </h4>
          <div className="space-y-2">
            {filteredDispensations
              .filter(d => d.notes)
              .map(disp => (
                <div 
                  key={`note-${disp.id}`}
                  className="rounded-lg p-3 border"
                  style={{
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    backgroundColor: 'rgba(243, 243, 243, 0.3)'
                  }}
                >
                  <div className="flex items-start gap-2 mb-1">
                    <FileText className="h-3.5 w-3.5 mt-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {disp.otcMedication} - {formatMdy(new Date(disp.administrationDate))}
                    </span>
                  </div>
                  <p className="text-[12px] ml-5" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    {disp.notes}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
