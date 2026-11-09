// @ts-nocheck
import React from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { FileText, X } from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";

export function OtherTabsDisposalTab(props: any) {
    const {
        disposalMedRows = [], setDisposalMedRows,
        disposalPrnRows = [], setDisposalPrnRows,
        disposalOtcRows = [], setDisposalOtcRows,
        disposalLogEntries = [], setDisposalLogEntries,
        disposalInnerTab, setDisposalInnerTab,
        isMassDisposalModalOpen, setIsMassDisposalModalOpen,
        massDisposalModalRows = [], setMassDisposalModalRows,
        massDisposalDate, setMassDisposalDate,
        massDisposalCancelConfirmOpen, setMassDisposalCancelConfirmOpen,
    } = props;

    const allReviewedMed = disposalMedRows.filter(r => r.status === "Reviewed");
    const allReviewedPrn = disposalPrnRows.filter(r => r.status === "Reviewed");
    const allReviewedOtc = disposalOtcRows.filter(r => r.status === "Reviewed");
    const anyReviewedSelected =
        allReviewedMed.some(r => r.selected) ||
        allReviewedPrn.some(r => r.selected) ||
        allReviewedOtc.some(r => r.selected);

    const selectAllReviewed = () => {
        setDisposalMedRows(prev => prev.map(r => r.status === "Reviewed" ? { ...r, selected: true } : r));
        setDisposalPrnRows(prev => prev.map(r => r.status === "Reviewed" ? { ...r, selected: true } : r));
        setDisposalOtcRows(prev => prev.map(r => r.status === "Reviewed" ? { ...r, selected: true } : r));
    };
    const deselectAll = () => {
        setDisposalMedRows(prev => prev.map(r => ({ ...r, selected: false })));
        setDisposalPrnRows(prev => prev.map(r => ({ ...r, selected: false })));
        setDisposalOtcRows(prev => prev.map(r => ({ ...r, selected: false })));
    };

    const openMassDisposalModal = () => {
        const now = new Date();
        const today = `${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}/${now.getFullYear()}`;
        const selectedMed = disposalMedRows.filter(r => r.selected && r.status === "Reviewed");
        const selectedPrn = disposalPrnRows.filter(r => r.selected && r.status === "Reviewed");
        const selectedOtc = disposalOtcRows.filter(r => r.selected && r.status === "Reviewed");
        if (selectedMed.length + selectedPrn.length + selectedOtc.length === 0) {
            toast.error("Select at least one Reviewed medication row to add disposal.");
            return;
        }
        let nextId = 1;
        const rows = [
            ...selectedMed.map(r => ({ id: nextId++, medicationDosePeriod: `${r.medication} — ${r.dosePeriod}`, countType: r.countType, amountDisposed: "", comments: r.packComment, removePending: false })),
            ...selectedPrn.map(r => ({ id: nextId++, medicationDosePeriod: `${r.medication} — ${r.dosePeriod}`, countType: r.countType, amountDisposed: "", comments: r.packComment, removePending: false })),
            ...selectedOtc.map(r => ({ id: nextId++, medicationDosePeriod: `${r.medication} — ${r.dosePeriod}`, countType: r.countType, amountDisposed: "", comments: r.packComment, removePending: false })),
        ];
        setMassDisposalModalRows(rows);
        setMassDisposalDate(today);
        setIsMassDisposalModalOpen(true);
    };

    const handleMassDisposalSubmit = () => {
        if (!massDisposalDate) { toast.error("Date is required."); return; }
        const incomplete = massDisposalModalRows.filter(r => !r.amountDisposed.trim());
        if (incomplete.length > 0) { toast.error("Amount Disposed is required for all rows."); return; }
        const now = new Date();
        const ts = `${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}/${now.getFullYear()} ${String(now.getHours()%12||12).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} ${now.getHours()>=12?'PM':'AM'}`;
        const baseId = Date.now();
        const newEntries = massDisposalModalRows.map((r, i) => ({
            id: baseId + i,
            timestamp: ts,
            user: "Current User, RN",
            action: "Disposal",
            detail: `${r.medicationDosePeriod} — Amount: ${r.amountDisposed}${r.comments ? ` | Comment: ${r.comments}` : ''}`,
        }));
        const attestationEntries = massDisposalModalRows.map((r, i) => ({
            id: baseId + massDisposalModalRows.length + i,
            timestamp: ts,
            user: "Current User, RN",
            action: "Attestation",
            detail: `Attested disposal of ${r.medicationDosePeriod} — "I attest that I have followed the policies and procedure of Medicine Dispensation & Documentation."`,
        }));
        setDisposalLogEntries(prev => [...newEntries, ...attestationEntries, ...prev]);
        const submittedLabels = new Set(massDisposalModalRows.map(r => r.medicationDosePeriod));
        setDisposalMedRows(prev => prev.map(r => submittedLabels.has(`${r.medication} — ${r.dosePeriod}`) && r.selected ? { ...r, status: "Disposed", selected: false } : r));
        setDisposalPrnRows(prev => prev.map(r => submittedLabels.has(`${r.medication} — ${r.dosePeriod}`) && r.selected ? { ...r, status: "Disposed", selected: false } : r));
        setDisposalOtcRows(prev => prev.map(r => submittedLabels.has(`${r.medication} — ${r.dosePeriod}`) && r.selected ? { ...r, status: "Disposed", selected: false } : r));
        setIsMassDisposalModalOpen(false);
        setMassDisposalModalRows([]);
        toast.success(`${massDisposalModalRows.length} disposal record${massDisposalModalRows.length !== 1 ? 's' : ''} created.`);
    };

    const statusBadge = (status) => {
        const map = {
            Reviewed: { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' },
            Pending:  { bg: '#fef9ec', color: '#78520a', border: '#fde68a' },
            Disposed: { bg: '#f4f6f9', color: 'var(--slds-g-color-text-weak)', border: 'var(--slds-g-color-border-base-1)' },
        };
        const s = map[status] || map.Pending;
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full slds-text-3 font-medium whitespace-nowrap"
                style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                {status}
            </span>
        );
    };

    const statusOrder = { Reviewed: 0, Pending: 1, Disposed: 2 };
    const sortRows = (rows) =>
        [...rows].sort((a, b) => {
            const sd = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
            return sd !== 0 ? sd : a.medication.localeCompare(b.medication);
        });

    const medDateGroups = [...new Set(disposalMedRows.map(r => r.dateGroup))].sort();
    const sharedTh = "px-3 py-2.5 text-left slds-text-3 font-semibold";

    return (
        <div className="px-6 py-5 space-y-5">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={openMassDisposalModal}
                        disabled={!anyReviewedSelected}
                        className="h-9 px-4 rounded-full slds-text-4 font-medium transition-colors"
                        style={{
                            backgroundColor: anyReviewedSelected ? '#145F33' : 'var(--slds-g-color-neutral-95)',
                            color: anyReviewedSelected ? 'white' : 'var(--slds-g-color-text-weak)',
                            cursor: anyReviewedSelected ? 'pointer' : 'not-allowed',
                        }}
                    >
                        Add Disposal
                    </button>
                    <button
                        onClick={() => setDisposalInnerTab(disposalInnerTab === "log" ? "dispose" : "log")}
                        className="h-9 px-4 rounded-full slds-text-4 font-medium transition-colors flex items-center gap-1.5"
                        style={{
                            border: '1px solid var(--slds-g-color-border-base-1)',
                            color: disposalInnerTab === "log" ? '#145F33' : 'var(--slds-g-color-text-default)',
                            backgroundColor: disposalInnerTab === "log" ? '#f0faf4' : 'var(--slds-g-color-background-base)',
                        }}
                    >
                        <FileText className="h-3.5 w-3.5" />
                        Log
                    </button>
                </div>
                {disposalInnerTab === "dispose" && (
                    <div className="flex items-center gap-3">
                        <button className="slds-text-3 font-medium underline" style={{ color: '#145F33' }} onClick={selectAllReviewed}>
                            Select All Reviewed
                        </button>
                        <button className="slds-text-3 font-medium underline" style={{ color: 'var(--slds-g-color-text-weak)' }} onClick={deselectAll}>
                            Deselect All
                        </button>
                    </div>
                )}
            </div>

            {/* Dispose view */}
            {disposalInnerTab === "dispose" && (
                <div className="space-y-5">
                    {/* Medications */}
                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medications</span>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    <th className="px-3 py-2.5 w-10" />
                                    <th className={sharedTh} style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                    <th className={`${sharedTh} w-24`} style={{ color: 'var(--slds-g-color-text-default)' }}>Start</th>
                                    <th className={`${sharedTh} w-24`} style={{ color: 'var(--slds-g-color-text-default)' }}>Stop</th>
                                    <th className={`${sharedTh} w-28`} style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                    <th className={`${sharedTh} w-28`} style={{ color: 'var(--slds-g-color-text-default)' }}>Primary Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {disposalMedRows.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-6 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No medication rows available.</td></tr>
                                ) : (
                                    medDateGroups.map(dateGroup => {
                                        const rowsInGroup = disposalMedRows.filter(r => r.dateGroup === dateGroup);
                                        const dosePeriods = [...new Set(rowsInGroup.map(r => r.dosePeriod))].filter(dp => dp !== "AM" && dp !== "PM").sort();
                                        return (
                                            <React.Fragment key={dateGroup}>
                                                <tr style={{ backgroundColor: '#eef2f7' }}>
                                                    <td colSpan={6} className="px-3 py-1.5 slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                        {dateGroup}
                                                    </td>
                                                </tr>
                                                {dosePeriods.map(dp => {
                                                    const dpRows = rowsInGroup.filter(r => r.dosePeriod === dp);
                                                    return (
                                                        <React.Fragment key={dp}>
                                                            <tr style={{ backgroundColor: '#f8f9fb' }}>
                                                                <td colSpan={6} className="px-4 py-1 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)', borderBottom: '1px solid var(--slds-g-color-border-base-1)', paddingLeft: '32px' }}>
                                                                    {dp}
                                                                </td>
                                                            </tr>
                                                            {sortRows(dpRows).map(row => (
                                                                <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: row.selected ? '#f0faf4' : 'white' }}>
                                                                    <td className="px-3 py-2.5 text-center">
                                                                        {row.status === "Reviewed" ? (
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={row.selected}
                                                                                onChange={e => setDisposalMedRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))}
                                                                                className="w-4 h-4"
                                                                                style={{ accentColor: '#145F33', cursor: 'pointer' }}
                                                                            />
                                                                        ) : (
                                                                            <span className="inline-block w-4 h-4" />
                                                                        )}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.medication}</td>
                                                                    <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.start}</td>
                                                                    <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.stop}</td>
                                                                    <td className="px-3 py-2.5">{statusBadge(row.status)}</td>
                                                                    <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.primaryCode || '—'}</td>
                                                                </tr>
                                                            ))}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PRN */}
                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>PRN</span>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    <th className="px-3 py-2.5 w-10" />
                                    <th className={sharedTh} style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                    <th className={`${sharedTh} w-24`} style={{ color: 'var(--slds-g-color-text-default)' }}>Start</th>
                                    <th className={`${sharedTh} w-24`} style={{ color: 'var(--slds-g-color-text-default)' }}>Stop</th>
                                    <th className={`${sharedTh} w-28`} style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                    <th className={`${sharedTh} w-28`} style={{ color: 'var(--slds-g-color-text-default)' }}>Primary Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {disposalPrnRows.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-6 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No PRN rows available.</td></tr>
                                ) : (
                                    sortRows(disposalPrnRows).map(row => (
                                        <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: row.selected ? '#f0faf4' : 'white' }}>
                                            <td className="px-3 py-2.5 text-center">
                                                {row.status === "Reviewed" ? (
                                                    <input type="checkbox" checked={row.selected} onChange={e => setDisposalPrnRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))} className="w-4 h-4" style={{ accentColor: '#145F33', cursor: 'pointer' }} />
                                                ) : (
                                                    <span className="inline-block w-4 h-4" />
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.medication}</td>
                                            <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.start}</td>
                                            <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.stop}</td>
                                            <td className="px-3 py-2.5">{statusBadge(row.status)}</td>
                                            <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.primaryCode || '—'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* OTC */}
                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>OTC</span>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    <th className="px-3 py-2.5 w-10" />
                                    <th className={sharedTh} style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                    <th className={`${sharedTh} w-24`} style={{ color: 'var(--slds-g-color-text-default)' }}>Dose</th>
                                    <th className={`${sharedTh} w-24`} style={{ color: 'var(--slds-g-color-text-default)' }}>Quantity</th>
                                    <th className={`${sharedTh} w-28`} style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                    <th className={`${sharedTh} w-28`} style={{ color: 'var(--slds-g-color-text-default)' }}>Primary Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {disposalOtcRows.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-6 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No OTC rows available.</td></tr>
                                ) : (
                                    sortRows(disposalOtcRows).map(row => (
                                        <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: row.selected ? '#f0faf4' : 'white' }}>
                                            <td className="px-3 py-2.5 text-center">
                                                {row.status === "Reviewed" ? (
                                                    <input type="checkbox" checked={row.selected} onChange={e => setDisposalOtcRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))} className="w-4 h-4" style={{ accentColor: '#145F33', cursor: 'pointer' }} />
                                                ) : (
                                                    <span className="inline-block w-4 h-4" />
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.medication}</td>
                                            <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.dose}</td>
                                            <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.quantity}</td>
                                            <td className="px-3 py-2.5">{statusBadge(row.status)}</td>
                                            <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.primaryCode || '—'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Log Panel */}
            {disposalInnerTab === "log" && (
                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Disposal Log</span>
                        <button onClick={() => setDisposalInnerTab("dispose")} style={{ color: 'var(--slds-g-color-text-weak)' }} aria-label="Close log"><X className="h-4 w-4" /></button>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                <th className="px-4 py-2 text-left slds-text-3 font-semibold w-44" style={{ color: 'var(--slds-g-color-text-default)' }}>Timestamp</th>
                                <th className="px-4 py-2 text-left slds-text-3 font-semibold w-40" style={{ color: 'var(--slds-g-color-text-default)' }}>User</th>
                                <th className="px-4 py-2 text-left slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)' }}>Action</th>
                                <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {disposalLogEntries.length === 0 ? (
                                <tr><td colSpan={4} className="px-4 py-8 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No disposal records for this pack.</td></tr>
                            ) : (
                                disposalLogEntries.map(e => (
                                    <tr key={e.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <td className="px-4 py-2 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{e.timestamp}</td>
                                        <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{e.user}</td>
                                        <td className="px-4 py-2">
                                            {e.action === "Attestation" ? (
                                                <span className="inline-block slds-text-3 px-2 py-0.5 rounded-full" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>{e.action}</span>
                                            ) : (
                                                <span className="inline-block slds-text-3 px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fef2f2', color: '#c23934', border: '1px solid #f5c6c6' }}>{e.action}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{e.detail}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Mass Disposal Modal */}
            <Dialog open={isMassDisposalModalOpen} onOpenChange={() => {}}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0" aria-describedby="mass-disposal-desc" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <DialogHeader className="px-6 pt-5 pb-4 border-b flex-shrink-0" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                        <DialogTitle className="slds-text-6 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Add Disposal</DialogTitle>
                        <DialogDescription id="mass-disposal-desc" asChild>
                            <div className="mt-2 rounded px-4 py-3 slds-text-4" style={{ backgroundColor: '#fef9ec', border: '1px solid #fde68a', color: '#78520a' }}>
                                <p>Write the following info on coin envelope for disposal: DISCARD, staff initials, date, medication name, doses, and youth.</p>
                                <p className="mt-1">Please remember to notify a Med Admin that medications are in the disposal drawer.</p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-6 py-4 flex items-end gap-6 border-b flex-shrink-0" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                        <div className="space-y-1.5">
                            <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>DATE <span className="text-red-600">*</span></label>
                            <input
                                type="text"
                                placeholder="MM/DD/YYYY"
                                maxLength={10}
                                value={massDisposalDate}
                                onChange={e => {
                                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 8);
                                    let fmt = cleaned;
                                    if (cleaned.length > 4) fmt = `${cleaned.slice(0,2)}/${cleaned.slice(2,4)}/${cleaned.slice(4)}`;
                                    else if (cleaned.length > 2) fmt = `${cleaned.slice(0,2)}/${cleaned.slice(2)}`;
                                    setMassDisposalDate(fmt);
                                }}
                                className="h-9 w-36 px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>YOUTH</label>
                            <div className="h-9 px-3 flex items-center rounded slds-text-4" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)', color: 'var(--slds-g-color-text-default)', minWidth: '160px' }}>
                                Marcus Johnson
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <table className="w-full">
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <th className="px-3 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication — Dose Period</th>
                                        <th className="px-3 py-2.5 text-left slds-text-3 font-semibold w-40" style={{ color: 'var(--slds-g-color-text-default)' }}>Amount Disposed <span className="text-red-600">*</span></th>
                                        <th className="px-3 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Comments <span className="text-red-600">*</span></th>
                                        <th className="px-3 py-2.5 w-10" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {massDisposalModalRows.length === 0 ? (
                                        <tr><td colSpan={4} className="px-4 py-8 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>All rows removed.</td></tr>
                                    ) : (
                                        massDisposalModalRows.map(row => (
                                            <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: row.removePending ? '#fef2f2' : 'white' }}>
                                                <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.medicationDosePeriod}</td>
                                                <td className="px-3 py-2.5">
                                                    {row.countType === "Volume" ? (
                                                        <select
                                                            value={row.amountDisposed}
                                                            disabled={row.removePending}
                                                            onChange={e => setMassDisposalModalRows(prev => prev.map(r => r.id === row.id ? { ...r, amountDisposed: e.target.value } : r))}
                                                            className="h-8 w-full px-2 rounded slds-text-3 focus:outline-none focus:ring-2 focus:ring-[#145F33] disabled:opacity-40"
                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: row.amountDisposed ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            <option value="">Select...</option>
                                                            {["Full","3/4","1/2","1/4","Empty"].map(v => <option key={v} value={v}>{v}</option>)}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            placeholder="0.00"
                                                            value={row.amountDisposed}
                                                            disabled={row.removePending}
                                                            onChange={e => {
                                                                const val = e.target.value.replace(/[^0-9.]/g,'').slice(0,6);
                                                                setMassDisposalModalRows(prev => prev.map(r => r.id === row.id ? { ...r, amountDisposed: val } : r));
                                                            }}
                                                            className="h-8 w-full px-2 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33] disabled:opacity-40"
                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    {row.removePending ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="slds-text-3" style={{ color: '#c23934' }}>Remove this row?</span>
                                                            <button onClick={() => setMassDisposalModalRows(prev => prev.filter(r => r.id !== row.id))} className="h-7 px-3 rounded-full slds-text-3 font-medium text-white" style={{ backgroundColor: '#c23934' }}>Yes</button>
                                                            <button onClick={() => setMassDisposalModalRows(prev => prev.map(r => r.id === row.id ? { ...r, removePending: false } : r))} className="h-7 px-3 rounded-full slds-text-3 font-medium" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}>No</button>
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            placeholder="Required comment..."
                                                            value={row.comments}
                                                            onChange={e => setMassDisposalModalRows(prev => prev.map(r => r.id === row.id ? { ...r, comments: e.target.value } : r))}
                                                            className="h-8 w-full px-2 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                                                            style={{ border: `1px solid ${row.comments.trim() ? 'var(--slds-g-color-border-base-1)' : '#f5c6c6'}`, color: 'var(--slds-g-color-text-default)', backgroundColor: row.comments.trim() ? 'var(--slds-g-color-background-base)' : '#fff8f8' }}
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                    {!row.removePending && (
                                                        <button
                                                            onClick={() => setMassDisposalModalRows(prev => prev.map(r => r.id === row.id ? { ...r, removePending: true } : r))}
                                                            aria-label="Remove row"
                                                            className="rounded-full p-1 transition-colors hover:bg-red-50"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t flex items-center justify-end gap-4 flex-shrink-0" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                        <p className="slds-text-3 text-right flex-1" style={{ color: 'var(--slds-g-color-text-weak)', maxWidth: '340px' }}>
                            I attest that I have followed the policies and procedure of Medicine Dispensation &amp; Documentation.
                        </p>
                        <button
                            onClick={() => {
                                const missingComments = massDisposalModalRows.some(r => !r.removePending && !r.comments.trim());
                                if (missingComments) { toast.error("Comments are required for all rows."); return; }
                                handleMassDisposalSubmit();
                            }}
                            disabled={massDisposalModalRows.length === 0}
                            className="h-9 px-5 rounded-full slds-text-4 font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#145F33' }}
                        >
                            Submit
                        </button>
                        <button
                            onClick={() => setMassDisposalCancelConfirmOpen(true)}
                            className="h-9 px-4 rounded-full slds-text-4 font-medium"
                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-neutral-95)' }}
                        >
                            Cancel
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation Dialog */}
            <Dialog open={massDisposalCancelConfirmOpen} onOpenChange={setMassDisposalCancelConfirmOpen}>
                <DialogContent className="max-w-sm" aria-describedby="cancel-desc" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <DialogHeader>
                        <DialogTitle className="slds-text-6 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Cancel Disposal</DialogTitle>
                        <DialogDescription id="cancel-desc" className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            Are you sure you want to cancel?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={() => setMassDisposalCancelConfirmOpen(false)}
                            className="h-9 px-4 rounded-full slds-text-4 font-medium"
                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-neutral-95)' }}
                        >
                            No
                        </button>
                        <button
                            onClick={() => {
                                setMassDisposalCancelConfirmOpen(false);
                                setIsMassDisposalModalOpen(false);
                                setMassDisposalModalRows([]);
                                deselectAll();
                            }}
                            className="h-9 px-4 rounded-full slds-text-4 font-medium text-white"
                            style={{ backgroundColor: '#c23934' }}
                        >
                            Yes, Cancel
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
