// @ts-nocheck
import React from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { FileText } from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";
import { MedCodePicker } from "./MedCodePicker";

const MED_CODES_LOCAL = [
    { code: "DRA", label: "Adjusted Dose - Medical Orders", type: "Coded - Routine" },
    { code: "PRN", label: "No Dose - Decline PRN", type: "Coded - Routine" },
    { code: "MED", label: "No Dose - Medical Orders", type: "Coded - Routine" },
    { code: "HOS", label: "No Dose - Youth Hospitalized", type: "Coded - Routine" },
    { code: "PAK", label: "Packed - Pass/Outing", type: "Coded - Routine" },
    { code: "SCH", label: "Packed - School", type: "Coded - Routine" },
    { code: "WTA", label: "Wrong Time - Approved", type: "Coded - Routine" },
    { code: "ADS", label: "Adjusted Dose - Staff Error", type: "Coded - Staff Concern" },
    { code: "MDS", label: "Missed Dose - Staff Error", type: "Coded - Staff Concern" },
    { code: "EMP", label: "No Dose - Out of Stock", type: "Coded - Staff Concern" },
    { code: "UNS", label: "Unapproved Dose - Staff Error", type: "Coded - Staff Concern" },
    { code: "WTU", label: "Wrong Time - Unapproved", type: "Coded - Staff Concern" },
    { code: "MPM", label: "Missed Packed Med", type: "Coded - Youth Concern" },
    { code: "ABS", label: "No Dose - Youth Absent", type: "Coded - Youth Concern" },
    { code: "CON", label: "No Dose - Youth Condition", type: "Coded - Youth Concern" },
    { code: "REF", label: "No Dose - Youth Refusal", type: "Coded - Youth Concern" },
    { code: "OTH", label: "Other Reason Not Given", type: "Other" },
];

export function OtherTabsReviewTab(props: any) {
    const {
        reviewMedRows = [], setReviewMedRows,
        reviewPrnRows = [], setReviewPrnRows,
        reviewOtcRows = [], setReviewOtcRows,
        reviewLogEntries = [], setReviewLogEntries,
        reviewInnerTab, setReviewInnerTab,
        isSetReviewStatusModalOpen, setIsSetReviewStatusModalOpen,
        reviewModalPrimaryCode, setReviewModalPrimaryCode,
        reviewModalComment, setReviewModalComment,
        reviewModalCommentError, setReviewModalCommentError,
        isReviewMedHistoryOpen, setIsReviewMedHistoryOpen,
        reviewHistoryMedication, setReviewHistoryMedication,
    } = props;

    const allReceivedMed = reviewMedRows.filter(r => r.status === "Received");
    const allReceivedPrn = reviewPrnRows.filter(r => r.status === "Received");
    const allReceivedOtc = reviewOtcRows.filter(r => r.status === "Received");
    const anyReceivedSelected =
        allReceivedMed.some(r => r.selected) ||
        allReceivedPrn.some(r => r.selected) ||
        allReceivedOtc.some(r => r.selected);

    const selectAllReceived = () => {
        setReviewMedRows(prev => prev.map(r => r.status === "Received" ? { ...r, selected: true } : r));
        setReviewPrnRows(prev => prev.map(r => r.status === "Received" ? { ...r, selected: true } : r));
        setReviewOtcRows(prev => prev.map(r => r.status === "Received" ? { ...r, selected: true } : r));
    };
    const deselectAll = () => {
        setReviewMedRows(prev => prev.map(r => ({ ...r, selected: false })));
        setReviewPrnRows(prev => prev.map(r => ({ ...r, selected: false })));
        setReviewOtcRows(prev => prev.map(r => ({ ...r, selected: false })));
    };

    const openSetReviewModal = () => {
        setReviewModalPrimaryCode("MPM -- Missed Packed Med");
        setReviewModalComment("");
        setReviewModalCommentError(false);
        setIsSetReviewStatusModalOpen(true);
    };

    const submitSetReview = () => {
        if (!reviewModalComment.trim()) {
            setReviewModalCommentError(true);
            return;
        }
        const now = new Date();
        const ts = `${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}/${now.getFullYear()} ${String(now.getHours() % 12 || 12).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
        const newEntries = [];
        const auditFlag = false;

        const processRows = (rows, label) => {
            rows.filter(r => r.selected).forEach(r => {
                newEntries.push({
                    id: Date.now() + r.id,
                    timestamp: ts,
                    user: "Current Staff",
                    action: "Review",
                    originalCode: r.primaryCode,
                    primaryCode: reviewModalPrimaryCode,
                    comment: reviewModalComment,
                    detail: `Pack Status set to Reviewed — ${r.medication}${label ? ` (${label})` : ""}${auditFlag ? " | Audit Flag: Yes" : ""}`,
                    medication: r.medication,
                });
                newEntries.push({
                    id: Date.now() + r.id + 10000,
                    timestamp: ts,
                    user: "Current Staff",
                    action: "Attestation",
                    originalCode: r.primaryCode,
                    primaryCode: reviewModalPrimaryCode,
                    comment: reviewModalComment,
                    detail: `Attestation recorded — ${r.medication}`,
                    medication: r.medication,
                });
            });
        };

        processRows(reviewMedRows.filter(r => r.selected), "");
        processRows(reviewPrnRows.filter(r => r.selected), "PRN");
        processRows(reviewOtcRows.filter(r => r.selected), "OTC");

        setReviewLogEntries(prev => [...prev, ...newEntries]);
        setReviewMedRows(prev => prev.map(r => r.selected ? { ...r, selected: false, status: "Reviewed", primaryCode: reviewModalPrimaryCode } : r));
        setReviewPrnRows(prev => prev.map(r => r.selected ? { ...r, selected: false, status: "Reviewed", primaryCode: reviewModalPrimaryCode } : r));
        setReviewOtcRows(prev => prev.map(r => r.selected ? { ...r, selected: false, status: "Reviewed", primaryCode: reviewModalPrimaryCode } : r));
        setIsSetReviewStatusModalOpen(false);
    };

    const sortReviewRows = (rows) => {
        const order = { "Received": 0, "Dispensed": 1, "Reviewed": 2 };
        return [...rows].sort((a, b) => {
            const so = (order[a.status] ?? 9) - (order[b.status] ?? 9);
            if (so !== 0) return so;
            return a.medication.localeCompare(b.medication);
        });
    };

    const medByDate = {};
    sortReviewRows(reviewMedRows).forEach(r => {
        if (!medByDate[r.dateGroup]) medByDate[r.dateGroup] = {};
        if (!medByDate[r.dateGroup][r.dosePeriod]) medByDate[r.dateGroup][r.dosePeriod] = [];
        medByDate[r.dateGroup][r.dosePeriod].push(r);
    });

    const statusBadge = (status) => {
        if (status === "Reviewed") return { bg: "#f3f4f6", color: "#374151", border: "#d1d5db" };
        if (status === "Received") return { bg: "#fef9ec", color: "#92400e", border: "#fde68a" };
        return { bg: "var(--slds-g-color-background-alt)", color: "var(--slds-g-color-text-weak)", border: "var(--slds-g-color-border-base-1)" };
    };

    const thStyle = {
        backgroundColor: "#f4f6f9",
        color: "var(--slds-g-color-text-default)",
        borderBottom: "1px solid var(--slds-g-color-border-base-1)",
        padding: "8px 12px",
        textAlign: "left",
        whiteSpace: "nowrap",
        fontWeight: 600,
    };
    const tdStyle = {
        padding: "8px 12px",
        borderBottom: "1px solid var(--slds-g-color-border-base-1)",
        color: "var(--slds-g-color-text-default)",
        verticalAlign: "middle",
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div
                className="flex items-center justify-between px-6 py-3 flex-shrink-0"
                style={{ backgroundColor: "var(--slds-g-color-background-base)" }}
            >
                <div className="flex items-center gap-3">
                    <Button
                        onClick={openSetReviewModal}
                        disabled={!anyReceivedSelected}
                        className="rounded-full h-9 slds-text-4 font-medium px-5 text-white transition-colors"
                        style={{
                            backgroundColor: anyReceivedSelected ? "#145F33" : "var(--slds-g-color-neutral-95)",
                            color: anyReceivedSelected ? "#fff" : "var(--slds-g-color-text-weak)",
                            cursor: anyReceivedSelected ? "pointer" : "not-allowed",
                        }}
                    >
                        Set Review Status
                    </Button>
                    <button
                        onClick={() => setReviewInnerTab(prev => prev === "log" ? "review" : "log")}
                        className="h-9 px-4 rounded-full slds-text-4 font-medium transition-colors flex items-center gap-1.5"
                        style={{
                            border: "1px solid var(--slds-g-color-border-base-1)",
                            color: reviewInnerTab === "log" ? "#145F33" : "var(--slds-g-color-text-default)",
                            backgroundColor: reviewInnerTab === "log" ? "#f0faf4" : "var(--slds-g-color-background-base)",
                        }}
                    >
                        <FileText className="h-3.5 w-3.5" />
                        Log
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={selectAllReceived}
                        className="slds-text-3 font-medium underline"
                        style={{ color: "#145F33", background: "none", border: "none", cursor: "pointer" }}
                    >
                        Select All Received
                    </button>
                    <button
                        onClick={deselectAll}
                        className="slds-text-3 font-medium underline"
                        style={{ color: "var(--slds-g-color-text-weak)", background: "none", border: "none", cursor: "pointer" }}
                    >
                        Deselect All
                    </button>
                </div>
            </div>

            {/* Content area */}
            {reviewInnerTab === "log" ? (
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <p className="slds-form-label mb-3" style={{ color: "var(--slds-g-color-text-weak)" }}>LOG RECORDS</p>
                    {reviewLogEntries.length === 0 ? (
                        <div className="flex items-center justify-center h-32 rounded-lg border-2 border-dashed slds-text-4" style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-weak)" }}>
                            No log entries yet.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {[...reviewLogEntries].reverse().map(entry => {
                                const isAttestation = entry.action === "Attestation";
                                return (
                                    <div key={entry.id} className="flex items-start gap-3 rounded-lg px-4 py-3" style={{ backgroundColor: "var(--slds-g-color-background-alt)", border: "1px solid var(--slds-g-color-border-base-1)" }}>
                                        <span className="inline-flex items-center justify-center rounded-full px-2 py-0.5 slds-text-3 font-semibold flex-shrink-0 mt-0.5" style={{
                                            backgroundColor: isAttestation ? "#e8f3fc" : "#e6f2eb",
                                            color: isAttestation ? "#0176d3" : "#145F33",
                                            border: `1px solid ${isAttestation ? "#0176d3" : "#145F33"}`,
                                        }}>
                                            {entry.action}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{entry.detail}</p>
                                            {!isAttestation && (
                                                <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                                                    Code: <span style={{ textDecoration: "line-through", marginRight: 4 }}>{entry.originalCode || "None"}</span>
                                                    <span style={{ color: "#145F33" }}>→ {entry.primaryCode || "None"}</span>
                                                </p>
                                            )}
                                            {entry.comment && <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>Comment: {entry.comment}</p>}
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>{entry.timestamp}</p>
                                            <p className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>{entry.user}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {/* Medications Section */}
                    <div>
                        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--slds-g-color-border-base-1)" }}>
                        <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medications</span>
                        </div>
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th style={{ ...thStyle, width: 40 }}></th>
                                        <th className="slds-text-3" style={thStyle}>Medication</th>
                                        <th className="slds-text-3" style={thStyle}>Start</th>
                                        <th className="slds-text-3" style={thStyle}>Stop</th>
                                        <th className="slds-text-3" style={thStyle}>Status</th>
                                        <th className="slds-text-3" style={thStyle}>Primary Code</th>
                                        <th style={{ ...thStyle, width: 36 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(medByDate).sort().map(dateGroup => (
                                        <React.Fragment key={dateGroup}>
                                            <tr>
                                                <td colSpan={7} style={{ padding: "6px 12px", backgroundColor: "#eef2f7", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                                                    <span className="slds-text-3 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>{dateGroup}</span>
                                                </td>
                                            </tr>
                                            {Object.keys(medByDate[dateGroup]).map(dosePeriod => (
                                                <React.Fragment key={dosePeriod}>
                                                    <tr>
                                                        <td colSpan={7} style={{ padding: "4px 20px", backgroundColor: "#f8f9fb", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                                                            <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>{dosePeriod}</span>
                                                        </td>
                                                    </tr>
                                                    {medByDate[dateGroup][dosePeriod].map(row => {
                                                        const isReviewed = row.status === "Reviewed";
                                                        const isSelectable = row.status === "Received";
                                                        const badge = statusBadge(row.status);
                                                        const rowHistory = reviewLogEntries.filter(e => e.medication === row.medication && e.action === "Review");
                                                        return (
                                                            <tr key={row.id} style={{ opacity: isReviewed ? 0.55 : 1 }}>
                                                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={row.selected}
                                                                        disabled={!isSelectable}
                                                                        onChange={e => setReviewMedRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))}
                                                                        className="h-4 w-4 rounded"
                                                                        style={{ accentColor: "#145F33", cursor: isSelectable ? "pointer" : "not-allowed" }}
                                                                    />
                                                                </td>
                                                                <td className="slds-text-4" style={tdStyle}>{row.medication}</td>
                                                                <td className="slds-text-4" style={{ ...tdStyle, color: "var(--slds-g-color-text-weak)" }}>
                                                                    {({"Morning":"8:00 AM","AM":"8:00 AM","Afternoon":"12:00 PM","Evening":"6:00 PM","PM":"6:00 PM","Bedtime":"9:00 PM"})[row.dosePeriod] ?? "—"}
                                                                </td>
                                                                <td className="slds-text-4" style={{ ...tdStyle, color: "var(--slds-g-color-text-weak)" }}>
                                                                    {({"Morning":"9:00 AM","AM":"9:00 AM","Afternoon":"1:00 PM","Evening":"7:00 PM","PM":"7:00 PM","Bedtime":"10:00 PM"})[row.dosePeriod] ?? "—"}
                                                                </td>
                                                                <td style={tdStyle}>
                                                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 slds-text-3 font-medium whitespace-nowrap" style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                                                                        {row.status}
                                                                    </span>
                                                                </td>
                                                                <td className="slds-text-4" style={{ ...tdStyle, color: "var(--slds-g-color-text-weak)" }}>{row.primaryCode || "—"}</td>
                                                                <td style={{ ...tdStyle, textAlign: "center", padding: "8px 6px" }}>
                                                                    {rowHistory.length > 0 && (
                                                                        <button
                                                                            title="View change log"
                                                                            onClick={() => { setReviewHistoryMedication(row.medication); setIsReviewMedHistoryOpen(true); }}
                                                                            className="inline-flex items-center justify-center h-6 w-6 rounded transition-colors"
                                                                            style={{ color: "#0176d3", background: "none", border: "none", cursor: "pointer" }}
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                    {reviewMedRows.length === 0 && (
                                        <tr><td colSpan={7} className="slds-text-4 text-center py-6" style={{ color: "var(--slds-g-color-text-weak)" }}>No medications.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* PRN Section */}
                    <div>
                        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--slds-g-color-border-base-1)" }}>
                        <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>PRN</span>
                        </div>
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th style={{ ...thStyle, width: 40 }}></th>
                                        <th className="slds-text-3" style={thStyle}>Medication</th>
                                        <th className="slds-text-3" style={thStyle}>Start</th>
                                        <th className="slds-text-3" style={thStyle}>Stop</th>
                                        <th className="slds-text-3" style={thStyle}>Status</th>
                                        <th className="slds-text-3" style={thStyle}>Primary Code</th>
                                        <th style={{ ...thStyle, width: 36 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortReviewRows(reviewPrnRows).map(row => {
                                        const isReviewed = row.status === "Reviewed";
                                        const isSelectable = row.status === "Received";
                                        const badge = statusBadge(row.status);
                                        const rowHistory = reviewLogEntries.filter(e => e.medication === row.medication && e.action === "Review");
                                        return (
                                            <tr key={row.id} style={{ opacity: isReviewed ? 0.55 : 1 }}>
                                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={row.selected}
                                                        disabled={!isSelectable}
                                                        onChange={e => setReviewPrnRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))}
                                                        className="h-4 w-4 rounded"
                                                        style={{ accentColor: "#145F33", cursor: isSelectable ? "pointer" : "not-allowed" }}
                                                    />
                                                </td>
                                                <td className="slds-text-4" style={tdStyle}>{row.medication}</td>
                                                <td className="slds-text-4" style={{ ...tdStyle, color: "var(--slds-g-color-text-weak)" }}>12:00 AM</td>
                                                <td className="slds-text-4" style={{ ...tdStyle, color: "var(--slds-g-color-text-weak)" }}>11:59 PM</td>
                                                <td style={tdStyle}>
                                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 slds-text-3 font-medium whitespace-nowrap" style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="slds-text-4" style={{ ...tdStyle, color: "var(--slds-g-color-text-weak)" }}>{row.primaryCode || "—"}</td>
                                                <td style={{ ...tdStyle, textAlign: "center", padding: "8px 6px" }}>
                                                    {rowHistory.length > 0 && (
                                                        <button
                                                            title="View change log"
                                                            onClick={() => { setReviewHistoryMedication(row.medication); setIsReviewMedHistoryOpen(true); }}
                                                            className="inline-flex items-center justify-center h-6 w-6 rounded transition-colors"
                                                            style={{ color: "#0176d3", background: "none", border: "none", cursor: "pointer" }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {reviewPrnRows.length === 0 && (
                                        <tr><td colSpan={7} className="slds-text-4 text-center py-6" style={{ color: "var(--slds-g-color-text-weak)" }}>No PRN medications.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* OTC Section */}
                    <div>
                        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--slds-g-color-border-base-1)" }}>
                        <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>OTC</span>
                        </div>
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th style={{ ...thStyle, width: 40 }}></th>
                                        <th className="slds-text-3" style={thStyle}>Medication</th>
                                        <th className="slds-text-3" style={thStyle}>Dose</th>
                                        <th className="slds-text-3" style={thStyle}>Quantity</th>
                                        <th className="slds-text-3" style={thStyle}>Status</th>
                                        <th className="slds-text-3" style={thStyle}>Primary Code</th>
                                        <th style={{ ...thStyle, width: 36 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortReviewRows(reviewOtcRows).map(row => {
                                        const isReviewed = row.status === "Reviewed";
                                        const isSelectable = row.status === "Received";
                                        const badge = statusBadge(row.status);
                                        const rowHistory = reviewLogEntries.filter(e => e.medication === row.medication && e.action === "Review");
                                        return (
                                            <tr key={row.id} style={{ opacity: isReviewed ? 0.55 : 1 }}>
                                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={row.selected}
                                                        disabled={!isSelectable}
                                                        onChange={e => setReviewOtcRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))}
                                                        className="h-4 w-4 rounded"
                                                        style={{ accentColor: "#145F33", cursor: isSelectable ? "pointer" : "not-allowed" }}
                                                    />
                                                </td>
                                                <td className="slds-text-4" style={tdStyle}>{row.medication}</td>
                                                <td className="slds-text-4" style={{ ...tdStyle, color: "var(--slds-g-color-text-weak)" }}>{row.dose}</td>
                                                <td className="slds-text-4" style={{ ...tdStyle, color: "var(--slds-g-color-text-weak)" }}>{row.quantity}</td>
                                                <td style={tdStyle}>
                                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 slds-text-3 font-medium whitespace-nowrap" style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="slds-text-4" style={{ ...tdStyle, color: "var(--slds-g-color-text-weak)" }}>{row.primaryCode || "—"}</td>
                                                <td style={{ ...tdStyle, textAlign: "center", padding: "8px 6px" }}>
                                                    {rowHistory.length > 0 && (
                                                        <button
                                                            title="View change log"
                                                            onClick={() => { setReviewHistoryMedication(row.medication); setIsReviewMedHistoryOpen(true); }}
                                                            className="inline-flex items-center justify-center h-6 w-6 rounded transition-colors"
                                                            style={{ color: "#0176d3", background: "none", border: "none", cursor: "pointer" }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {reviewOtcRows.length === 0 && (
                                        <tr><td colSpan={7} className="slds-text-4 text-center py-6" style={{ color: "var(--slds-g-color-text-weak)" }}>No OTC medications.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Set Review Status Modal */}
            <Dialog open={isSetReviewStatusModalOpen} onOpenChange={open => { if (!open) setIsSetReviewStatusModalOpen(false); }}>
                <DialogContent className="max-w-2xl" style={{ maxHeight: "90vh", overflowY: "auto" }}>
                    <DialogHeader>
                        <DialogTitle className="slds-text-6 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
                            Set Review Status
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        <div className="rounded-lg px-4 py-3" style={{ backgroundColor: "var(--slds-g-color-background-alt)", border: "1px solid var(--slds-g-color-border-base-1)" }}>
                            <p className="slds-form-label mb-1.5" style={{ color: "var(--slds-g-color-text-weak)" }}>SELECTED MEDICATIONS</p>
                            <ul className="space-y-0.5">
                                {reviewMedRows.filter(r => r.selected).map(r => (
                                    <li key={r.id} className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{r.medication} — {r.dosePeriod}</li>
                                ))}
                                {reviewPrnRows.filter(r => r.selected).map(r => (
                                    <li key={r.id} className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{r.medication} (PRN)</li>
                                ))}
                                {reviewOtcRows.filter(r => r.selected).map(r => (
                                    <li key={r.id} className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{r.medication} (OTC)</li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-1.5">
                            <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                                SELECT PRIMARY MEDICATION CODE
                            </label>
                            <MedCodePicker
                                codes={MED_CODES_LOCAL}
                                value={reviewModalPrimaryCode}
                                onChange={setReviewModalPrimaryCode}
                                allowNull={true}
                                placeholder="— No code —"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                                PACK COMMENT (MEDICATION COMMENT) <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                value={reviewModalComment}
                                onChange={e => { setReviewModalComment(e.target.value); if (e.target.value.trim()) setReviewModalCommentError(false); }}
                                placeholder="Enter required comment..."
                                rows={3}
                                className="w-full rounded-md px-3 py-2 slds-text-4 resize-none"
                                style={{
                                    border: `1px solid ${reviewModalCommentError ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                                    color: "var(--slds-g-color-text-default)",
                                    backgroundColor: "var(--slds-g-color-background-base)",
                                }}
                            />
                            {reviewModalCommentError && (
                                <p className="slds-text-3" style={{ color: "#c23934" }}>Pack Comment is required.</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="flex items-center justify-end gap-3 pt-2">
                        <p className="slds-text-3 text-right flex-1" style={{ color: "var(--slds-g-color-text-weak)", fontStyle: "italic" }}>
                            I attest that I have followed the policies and procedure of Medicine Dispensation &amp; Documentation.
                        </p>
                        <Button
                            onClick={submitSetReview}
                            className="rounded-full h-9 slds-text-4 font-medium px-5 text-white flex-shrink-0"
                            style={{ backgroundColor: "#145F33" }}
                        >
                            Submit
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsSetReviewStatusModalOpen(false)}
                            className="rounded-full h-9 slds-text-4 font-medium px-5 flex-shrink-0"
                            style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-default)" }}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Medication Change Log Modal */}
            <Dialog open={isReviewMedHistoryOpen} onOpenChange={open => { if (!open) setIsReviewMedHistoryOpen(false); }}>
                <DialogContent className="max-w-xl" style={{ maxHeight: "80vh", overflowY: "auto" }}>
                    <DialogHeader>
                        <DialogTitle className="slds-text-6 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
                            Change Log — {reviewHistoryMedication}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        {reviewLogEntries.filter(e => e.medication === reviewHistoryMedication && e.action === "Review").length === 0 ? (
                            <p className="slds-text-4 text-center py-6" style={{ color: "var(--slds-g-color-text-weak)" }}>No change log entries for this medication.</p>
                        ) : (
                            reviewLogEntries.filter(e => e.medication === reviewHistoryMedication && e.action === "Review").reverse().map(entry => (
                                <div key={entry.id} className="rounded-lg px-4 py-3 space-y-1" style={{ backgroundColor: "var(--slds-g-color-background-alt)", border: "1px solid var(--slds-g-color-border-base-1)" }}>
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="slds-text-4 font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>{entry.detail}</p>
                                        <p className="slds-text-3 flex-shrink-0" style={{ color: "var(--slds-g-color-text-weak)" }}>{entry.timestamp}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>Original code:</span>
                                        <span className="slds-text-3 font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>{entry.originalCode || "None"}</span>
                                        <span style={{ color: "#145F33" }}>→</span>
                                        <span className="slds-text-3 font-medium" style={{ color: "#145F33" }}>{entry.primaryCode || "None"}</span>
                                    </div>
                                    {entry.comment && <p className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>Comment: {entry.comment}</p>}
                                    <p className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>Staff: {entry.user}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsReviewMedHistoryOpen(false)}
                            className="rounded-full h-9 slds-text-4 font-medium px-5"
                            style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-default)" }}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
