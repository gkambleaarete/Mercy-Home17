import { useState, useMemo } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  AlertTriangle,
  XCircle,
  Clock,
  CheckCircle2,
  Eye,
  Copy,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
} from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy } from "../../lib/dateFormat";


interface ConsentRecord {
  id: number;
  youthName: string;
  program: string;
  campus: string;
  status: "Draft" | "Sent" | "Executed" | "Active" | "Expired";
  startDate: string;
  endDate: string;
  executedDate: string | null;
  approvedMedications: number[];
  programTherapist?: string;
  programDayCoordinator?: string;
}

interface OTCConsentDashboardProps {
  consents: ConsentRecord[];
  onViewConsent: (consentId: number) => void;
  onRenewConsent: (consentId: number) => void;
}

type ActiveFilter = "all" | "expiring" | "expired" | "pending" | "active";

export function OTCConsentDashboard({
  consents,
  onViewConsent,
  onRenewConsent,
}: OTCConsentDashboardProps) {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterCampus, setFilterCampus] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const safeConsents = consents || [];

  const getConsentMetrics = (consent: ConsentRecord) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(consent.endDate);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(consent.startDate);
    startDate.setHours(0, 0, 0, 0);

    const daysUntilExpiration = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    let calculatedStatus = consent.status;

    if (
      consent.status === "Executed" ||
      consent.status === "Active" ||
      consent.status === "Expired"
    ) {
      if (today > endDate) {
        calculatedStatus = "Expired";
      } else if (today >= startDate && today <= endDate && consent.executedDate) {
        calculatedStatus = "Active";
      } else if (consent.executedDate) {
        calculatedStatus = "Executed";
      }
    }

    const isExpiringSoon =
      daysUntilExpiration > 0 &&
      daysUntilExpiration <= 21 &&
      calculatedStatus === "Active";

    return { calculatedStatus, daysUntilExpiration, isExpiringSoon };
  };

  // Base filtered by program/campus/status/dates
  const baseFiltered = useMemo(() => {
    return safeConsents.filter((c) => {
      // Program filter
      if (filterProgram && c.program !== filterProgram) return false;
      
      // Campus filter
      if (filterCampus && c.campus !== filterCampus) return false;
      
      // Status filter
      if (filterStatus) {
        const metrics = getConsentMetrics(c);
        if (filterStatus !== metrics.calculatedStatus) return false;
      }
      
      // Date range overlap logic
      // If user selects a start date, show consents whose end date is >= selected start date
      if (filterStartDate) {
        const selectedStart = new Date(filterStartDate);
        selectedStart.setHours(0, 0, 0, 0);
        const consentEnd = new Date(c.endDate);
        consentEnd.setHours(23, 59, 59, 999);
        if (consentEnd < selectedStart) return false;
      }
      
      // If user selects an end date, show consents whose start date is <= selected end date
      if (filterEndDate) {
        const selectedEnd = new Date(filterEndDate);
        selectedEnd.setHours(23, 59, 59, 999);
        const consentStart = new Date(c.startDate);
        consentStart.setHours(0, 0, 0, 0);
        if (consentStart > selectedEnd) return false;
      }
      
      return true;
    });
  }, [safeConsents, filterProgram, filterCampus, filterStatus, filterStartDate, filterEndDate]);

  // KPI counts (always from base filtered)
  const expiringSoonCount = baseFiltered.filter((c) => getConsentMetrics(c).isExpiringSoon).length;
  const expiredCount = baseFiltered.filter(
    (c) => getConsentMetrics(c).calculatedStatus === "Expired"
  ).length;
  const pendingCount = baseFiltered.filter(
    (c) => c.status === "Draft" || c.status === "Sent"
  ).length;
  const activeCount = baseFiltered.filter(
    (c) =>
      getConsentMetrics(c).calculatedStatus === "Active" &&
      !getConsentMetrics(c).isExpiringSoon
  ).length;

  // Table rows based on active KPI filter
  const tableConsents = useMemo(() => {
    switch (activeFilter) {
      case "expiring":
        return baseFiltered.filter((c) => getConsentMetrics(c).isExpiringSoon);
      case "expired":
        return baseFiltered.filter(
          (c) => getConsentMetrics(c).calculatedStatus === "Expired"
        );
      case "pending":
        return baseFiltered.filter(
          (c) => c.status === "Draft" || c.status === "Sent"
        );
      case "active":
        return baseFiltered.filter(
          (c) =>
            getConsentMetrics(c).calculatedStatus === "Active" &&
            !getConsentMetrics(c).isExpiringSoon
        );
      default:
        return baseFiltered;
    }
  }, [baseFiltered, activeFilter]);

  const uniquePrograms = Array.from(new Set(safeConsents.map((c) => c.program)));
  const uniqueCampuses = Array.from(new Set(safeConsents.map((c) => c.campus)));

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return formatMdy(new Date(dateString));
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Active":
        return { backgroundColor: "#DCFCE7", color: "#166534", border: "1px solid #BBF7D0" };
      case "Expired":
        return { backgroundColor: "#F3F4F6", color: "#4B5563", border: "1px solid #D1D5DB" };
      case "Sent":
        return { backgroundColor: "#F3E8FF", color: "#7E22CE", border: "1px solid #E9D5FF" };
      case "Draft":
        return { backgroundColor: "#F9FAFB", color: "#374151", border: "1px solid #E5E7EB" };
      case "Executed":
        return { backgroundColor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" };
      default:
        return { backgroundColor: "#F3F4F6", color: "#4B5563", border: "1px solid #D1D5DB" };
    }
  };

  const filterLabel: Record<ActiveFilter, string> = {
    all: "All Consents",
    expiring: "Expiring Soon",
    expired: "Expired",
    pending: "Pending",
    active: "Active",
  };

  const kpiCards = [
    {
      key: "expiring" as ActiveFilter,
      label: "Expiring Soon",
      count: expiringSoonCount,
      icon: <AlertTriangle className="h-5 w-5" style={{ color: "#D97706" }} />,
      activeStyle: {
        border: "2px solid #F59E0B",
        backgroundColor: "#FFFBEB",
      },
      inactiveStyle: {
        border: "1px solid #FDE68A",
        backgroundColor: "#FEFCE8",
      },
      countColor: "#D97706",
      labelColor: "#92400E",
    },
    {
      key: "expired" as ActiveFilter,
      label: "Expired",
      count: expiredCount,
      icon: <XCircle className="h-5 w-5" style={{ color: "#DC2626" }} />,
      activeStyle: {
        border: "2px solid #EF4444",
        backgroundColor: "#FFF5F5",
      },
      inactiveStyle: {
        border: "1px solid #FECACA",
        backgroundColor: "#FFF5F5",
      },
      countColor: "#DC2626",
      labelColor: "#991B1B",
    },
    {
      key: "pending" as ActiveFilter,
      label: "Pending",
      count: pendingCount,
      icon: <Clock className="h-5 w-5" style={{ color: "#145F33" }} />,
      activeStyle: {
        border: "2px solid #145F33",
        backgroundColor: "#F0FDF4",
      },
      inactiveStyle: {
        border: "1px solid #BBF7D0",
        backgroundColor: "#F0FDF4",
      },
      countColor: "#145F33",
      labelColor: "#14532D",
    },
    {
      key: "active" as ActiveFilter,
      label: "Active",
      count: activeCount,
      icon: <CheckCircle2 className="h-5 w-5" style={{ color: "#145F33" }} />,
      activeStyle: {
        border: "2px solid #145F33",
        backgroundColor: "#F0FDF4",
      },
      inactiveStyle: {
        border: "1px solid #D1FAE5",
        backgroundColor: "#F9FAFB",
      },
      countColor: "#145F33",
      labelColor: "#374151",
    },
  ];

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiCards.map((card) => {
          const isSelected = activeFilter === card.key;
          return (
            <button
              key={card.key}
              onClick={() =>
                setActiveFilter(isSelected ? "all" : card.key)
              }
              className="text-left rounded-lg p-4 transition-all"
              style={{
                ...(isSelected ? card.activeStyle : card.inactiveStyle),
                cursor: "pointer",
                outline: "none",
                boxShadow: isSelected ? "0 0 0 1px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                {card.icon}
                {isSelected && (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: "rgba(0,0,0,0.06)", color: card.countColor }}
                  >
                    Active
                  </span>
                )}
              </div>
              <div
                className="text-[26px] font-bold leading-none mb-1"
                style={{ color: card.countColor }}
              >
                {card.count}
              </div>
              <div className="text-[12px] font-medium" style={{ color: card.labelColor }}>
                {card.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Table with integrated filters */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          backgroundColor: "var(--slds-g-color-background-base)",
        }}
      >
        {/* Table Header with Filters */}
        <div
          style={{
            backgroundColor: "var(--slds-g-color-background-alt)",
            borderBottom: "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          {/* Title Bar */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
                {filterLabel[activeFilter]}
              </span>
              <span
                className="text-[12px] px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#E5E7EB", color: "#6B7280" }}
              >
                {tableConsents.length}
              </span>
              {activeFilter !== "all" && (
                <button
                  onClick={() => setActiveFilter("all")}
                  className="flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full transition-colors"
                  style={{ color: "#DC2626", backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filter Panel - Always Visible */}
          <div className="px-5 pb-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[160px]">
              <label
                className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: "var(--slds-g-color-text-weak)" }}
              >
                Program
              </label>
              <select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                className="w-full text-[13px] rounded-full pl-3 pr-9 py-1.5"
                style={{
                  border: "1px solid #D1D5DB",
                  backgroundColor: "white",
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                <option value="">All Programs</option>
                {uniquePrograms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[160px]">
              <label
                className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: "var(--slds-g-color-text-weak)" }}
              >
                Campus
              </label>
              <select
                value={filterCampus}
                onChange={(e) => setFilterCampus(e.target.value)}
                className="w-full px-3 py-1.5 pr-8 text-[13px] rounded-full"
                style={{
                  border: "1px solid #D1D5DB",
                  backgroundColor: "white",
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                <option value="">All Campuses</option>
                {uniqueCampuses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[160px]">
              <label
                className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: "var(--slds-g-color-text-weak)" }}
              >
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-1.5 pr-8 text-[13px] rounded-full"
                style={{
                  border: "1px solid #D1D5DB",
                  backgroundColor: "white",
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                <option value="">All</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Executed">Executed</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <div className="flex-1 min-w-[160px]">
              <label
                className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: "var(--slds-g-color-text-weak)" }}
              >
                Start Date
              </label>
              <DateInput
value={isoToMdy(filterStartDate)}
                onChange={(v) => ((e) => setFilterStartDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                className="w-full px-3 py-1.5 pr-3 text-[13px] rounded-full"
                style={{
                  border: "1px solid #D1D5DB",
                  backgroundColor: "white",
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </div>

            <div className="flex-1 min-w-[160px]">
              <label
                className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: "var(--slds-g-color-text-weak)" }}
              >
                End Date
              </label>
              <DateInput
value={isoToMdy(filterEndDate)}
                onChange={(v) => ((e) => setFilterEndDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                className="w-full px-3 py-1.5 pr-3 text-[13px] rounded-full"
                style={{
                  border: "1px solid #D1D5DB",
                  backgroundColor: "white",
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </div>

            {(filterProgram || filterCampus || filterStatus || filterStartDate || filterEndDate) && (
              <button
                onClick={() => {
                  setFilterProgram("");
                  setFilterCampus("");
                  setFilterStatus("");
                  setFilterStartDate("");
                  setFilterEndDate("");
                }}
                className="text-[12px] px-3 py-1.5 rounded-full transition-colors"
                style={{ color: "#6B7280", border: "1px solid #D1D5DB", backgroundColor: "white" }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        {tableConsents.length === 0 ? (
          <div className="text-center py-12">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: "#F3F4F6" }}
            >
              <CheckCircle2 className="h-5 w-5" style={{ color: "#9CA3AF" }} />
            </div>
            <p className="text-[13px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
              No consents match this filter
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: "var(--slds-g-color-background-alt)",
                    borderBottom: "2px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  {[
                    "Youth",
                    "Program / Campus",
                    "Start Date",
                    "End Date",
                    "Status",
                    "Actions",
                  ].map((col) => (
                    <th
                      key={col}
                      className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wider ${col === "Status" || col === "Actions" ? "text-center" : "text-left"}`}
                      style={{ color: "var(--slds-g-color-text-weak)" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableConsents.map((consent) => {
                  const metrics = getConsentMetrics(consent);
                  return (
                    <tr
                      key={consent.id}
                      className="hover:bg-gray-50/80 transition-colors"
                      style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
                    >
                      <td className="px-5 py-3.5">
                        <span
                          className="text-[13px] font-medium"
                          style={{ color: "var(--slds-g-color-text-default)" }}
                        >
                          {consent.youthName}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div
                          className="text-[13px]"
                          style={{ color: "var(--slds-g-color-text-default)" }}
                        >
                          {consent.program}
                        </div>
                        <div
                          className="text-[11px] mt-0.5"
                          style={{ color: "var(--slds-g-color-text-weak)" }}
                        >
                          {consent.campus}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-[13px]"
                          style={{ color: "var(--slds-g-color-text-default)" }}
                        >
                          {formatDate(consent.startDate)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-[13px]"
                          style={{ color: "var(--slds-g-color-text-default)" }}
                        >
                          {formatDate(consent.endDate)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                          style={getStatusBadgeStyle(metrics.calculatedStatus)}
                        >
                          {metrics.isExpiringSoon ? "Expiring Soon" : metrics.calculatedStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <div className="relative group">
                            <button
                              onClick={() => onViewConsent(consent.id)}
                              className="p-1.5 rounded transition-colors"
                              style={{
                                color: "var(--slds-g-color-text-default)",
                                backgroundColor: "transparent",
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F3F4F6";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <div
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              style={{
                                backgroundColor: "#145F33",
                                color: "white",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                              }}
                            >
                              View consent
                              <div
                                className="absolute top-full left-1/2 -translate-x-1/2 -mt-1"
                                style={{
                                  width: 0,
                                  height: 0,
                                  borderLeft: "4px solid transparent",
                                  borderRight: "4px solid transparent",
                                  borderTop: "4px solid #145F33",
                                }}
                              />
                            </div>
                          </div>
                          <div className="relative group">
                            <button
                              onClick={() => onRenewConsent(consent.id)}
                              className="p-1.5 rounded transition-colors"
                              style={{
                                color: "#145F33",
                                backgroundColor: "transparent",
                                visibility: (metrics.isExpiringSoon || metrics.calculatedStatus === "Expired") ? "visible" : "hidden",
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F0FDF4";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <div
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              style={{
                                backgroundColor: "#145F33",
                                color: "white",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                              }}
                            >
                              Renew consent
                              <div
                                className="absolute top-full left-1/2 -translate-x-1/2 -mt-1"
                                style={{
                                  width: 0,
                                  height: 0,
                                  borderLeft: "4px solid transparent",
                                  borderRight: "4px solid transparent",
                                  borderTop: "4px solid #145F33",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}