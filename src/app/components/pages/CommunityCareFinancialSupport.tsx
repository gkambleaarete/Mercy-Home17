// Record Financial Support (Community Care member page). Built from Mercy Home
// design-system components. PROTOTYPE: records live in page memory and the
// starting rows are mock data, not real payments.

import { useMemo, useState } from "react";
import { OverflowList } from "../ui/overflow-list";
import { Eye, Info, Pencil, Plus, Wallet } from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DateInput } from "../ui/date-input";
import { FieldError, FieldLabel } from "../ui/field";
import { EmptyState } from "../ui/empty-state";
import { PaginationInfo, PaginationPageLabel } from "../ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { MultiSelect } from "../ui/multi-select";

const CATEGORIES = [
  ["rentPaymentsLoans", "Rent payments/loans"],
  ["giftCards", "Gift cards"],
  ["housingGrant", "Housing grant"],
  ["therapyGrant", "Therapy grant"],
  ["cellPhoneBills", "Cell phone bills"],
  ["transportation", "Transportation"],
] as const;
type CategoryKey = (typeof CATEGORIES)[number][0];

type SupportRecord = {
  id: number;
  date: string; // MM/DD/YYYY
  notes?: string;
  member?: string; // "A (Role), B (Role)"
} & Record<CategoryKey, number>;

const PAGE_SIZE = 10;
const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const toTime = (mdy: string) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(mdy);
  return m ? new Date(+m[3], +m[1] - 1, +m[2]).getTime() : 0;
};
const totalOf = (r: SupportRecord) =>
  CATEGORIES.reduce((sum, [k]) => sum + (r[k] || 0), 0);
const emptyAmounts = () =>
  Object.fromEntries(CATEGORIES.map(([k]) => [k, 0])) as Record<CategoryKey, number>;

// MOCK starting rows (prototype only), dated relative to today.
function mockRecords(): SupportRecord[] {
  const at = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
  };
  return [
    { id: 1, notes: "Rent for November and a transit card for job interviews.", date: at(3), rentPaymentsLoans: 650, giftCards: 75, housingGrant: 400, therapyGrant: 120, cellPhoneBills: 55, transportation: 60 },
    { id: 2, date: at(24), rentPaymentsLoans: 250, giftCards: 50, housingGrant: 0, therapyGrant: 120, cellPhoneBills: 55, transportation: 45 },
    { id: 3, date: at(52), rentPaymentsLoans: 650, giftCards: 0, housingGrant: 300, therapyGrant: 0, cellPhoneBills: 55, transportation: 70 },
    { id: 4, date: at(140), rentPaymentsLoans: 500, giftCards: 100, housingGrant: 0, therapyGrant: 90, cellPhoneBills: 50, transportation: 40 },
  ];
}

type Range = "all" | "30" | "90" | "year";

export function CommunityCareFinancialSupport({
  memberName,
  memberRole = "Community Care Member",
  memberOptions,
  readOnly: viewOnly = false,
}: {
  /** View only: two smaller sample records, no Record Support / Edit. */
  readOnly?: boolean;
  memberName: string;
  memberRole?: string;
  /** Community Care My Members: MEMBER column (second) + Members multi-select. */
  memberOptions?: string[];
}) {
  const [records, setRecords] = useState<SupportRecord[]>(() =>
    (viewOnly
      ? mockRecords()
          .slice(0, 2)
          .map((r) => ({
            ...r,
            rentPaymentsLoans: 150,
            giftCards: 25,
            housingGrant: r.housingGrant ? 100 : 0,
            therapyGrant: 40,
            cellPhoneBills: 20,
            transportation: 15,
          }))
      : mockRecords()
    ).map((r, i) =>
      memberOptions ? { ...r, member: memberOptions[i % memberOptions.length] } : r,
    ),
  );
  const [draftMembers, setDraftMembers] = useState<string[]>([]);
  const [range, setRange] = useState<Range>("all");
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<{ mode: "add" | "edit" | "view"; id?: number } | null>(null);
  const [draftDate, setDraftDate] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [draft, setDraft] = useState<Record<CategoryKey, string>>(
    () => Object.fromEntries(CATEGORIES.map(([k]) => [k, ""])) as Record<CategoryKey, string>,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sorted = useMemo(
    () => [...records].sort((a, b) => toTime(b.date) - toTime(a.date)),
    [records],
  );
  const filtered = useMemo(() => {
    if (range === "all") return sorted;
    const now = new Date();
    const from =
      range === "year"
        ? new Date(now.getFullYear(), 0, 1).getTime()
        : now.getTime() - Number(range) * 24 * 3600e3;
    return sorted.filter((r) => toTime(r.date) >= from);
  }, [sorted, range]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const columnTotals = Object.fromEntries(
    CATEGORIES.map(([k]) => [k, filtered.reduce((s, r) => s + r[k], 0)]),
  ) as Record<CategoryKey, number>;
  const grandTotal = filtered.reduce((s, r) => s + totalOf(r), 0);
  const allTotal = records.reduce((s, r) => s + totalOf(r), 0);
  const latest = sorted[0];

  const open = (mode: "add" | "edit" | "view", rec?: SupportRecord) => {
    const t = new Date();
    setDraftDate(
      rec?.date ??
        `${String(t.getMonth() + 1).padStart(2, "0")}/${String(t.getDate()).padStart(2, "0")}/${t.getFullYear()}`,
    );
    setDraft(
      Object.fromEntries(
        CATEGORIES.map(([k]) => [k, rec && rec[k] ? rec[k].toFixed(2) : ""]),
      ) as Record<CategoryKey, string>,
    );
    setDraftNotes(rec?.notes ?? "");
    setDraftMembers(rec?.member ? rec.member.split(", ") : []);
    setErrors({});
    setDialog({ mode, id: rec?.id });
  };
  const readOnly = dialog?.mode === "view";
  const draftTotal = CATEGORIES.reduce((s, [k]) => s + (parseFloat(draft[k]) || 0), 0);

  const save = () => {
    const e: Record<string, string> = {};
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(draftDate)) e.date = "Enter a valid date (MM/DD/YYYY).";
    for (const [k] of CATEGORIES) {
      const v = draft[k].trim();
      if (v && (isNaN(Number(v)) || Number(v) < 0)) e[k] = "Enter an amount of 0 or more.";
    }
    if (!e.date && draftTotal <= 0) e.total = "Enter at least one amount.";
    if (memberOptions && draftMembers.length === 0) e.member = "Select at least one member.";
    setErrors(e);
    if (Object.keys(e).length) return;
    const amounts = Object.fromEntries(
      CATEGORIES.map(([k]) => [k, Math.round((parseFloat(draft[k]) || 0) * 100) / 100]),
    ) as Record<CategoryKey, number>;
    if (dialog?.mode === "edit" && dialog.id != null) {
      setRecords((rs) => rs.map((r) => (r.id === dialog.id ? { ...r, date: draftDate, notes: draftNotes.trim(), member: draftMembers.join(", ") || r.member, ...amounts } : r)));
      toast.success("Financial support updated.");
    } else {
      setRecords((rs) => [...rs, { id: Date.now(), date: draftDate, notes: draftNotes.trim(), member: draftMembers.join(", ") || undefined, ...emptyAmounts(), ...amounts }]);
      toast.success(`Financial support recorded for ${memberName}.`);
    }
    setDialog(null);
  };

  const stat = (label: string, value: string, sub?: string) => (
    <div className="p-4 min-w-0">
      <div className="text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>{label}</div>
      <div className="text-[22px] font-semibold mt-1" style={{ color: "var(--color-brand-primary)" }}>{value}</div>
      {sub && <div className="text-[12px] mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>{sub}</div>}
    </div>
  );

  return (
    <div className="space-y-4">
      <Card variant="section">
        <CardHeader size="sm" separated className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle size="sm">Financial Support</CardTitle>
            <CardDescription className="text-[12px]">Resources and donations provided to this member.</CardDescription>
          </div>
          {!viewOnly && (
            <Button size="sm" onClick={() => open("add")}>
              <Plus aria-hidden="true" />
              Record Support
            </Button>
          )}
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border border-b border-border">
          {stat("Total support provided", usd(allTotal))}
          {stat("Support records", String(records.length))}
          {stat("Most recent support", latest ? usd(totalOf(latest)) : "—", latest?.date)}
        </div>

        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-border">
          <div className="flex items-baseline gap-2">
            <h3 className="text-[13px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Support history</h3>
            <span className="text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
              {filtered.length} {filtered.length === 1 ? "record" : "records"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>Amounts in USD</span>
            <Select value={range} onValueChange={(v) => { setRange(v as Range); setPage(1); }}>
              <SelectTrigger surface="base" size="sm" className="w-[150px]" aria-label="Filter by date">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Wallet}
              title={records.length === 0 ? "No financial support recorded yet" : "No support in this date range"}
              description={records.length === 0 ? "Use Record Support to add the first entry." : "Choose another date range."}
              className="py-6"
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table style={{ minWidth: memberOptions ? "1240px" : "1040px" }}>
                <TableHeader>
                  <TableRow>
                    <TableHead variant="slds" size="md">DATE PROVIDED</TableHead>
                    {memberOptions && <TableHead variant="slds" size="md">MEMBERS</TableHead>}
                    {CATEGORIES.map(([k, label]) => (
                      <TableHead key={k} variant="slds" size="md" className="text-right whitespace-normal">
                        {label.toUpperCase()}
                      </TableHead>
                    ))}
                    <TableHead variant="slds" size="md" className="text-right whitespace-normal">TOTAL SUPPORT</TableHead>
                    <TableHead variant="slds" size="md" className="text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="px-4 whitespace-nowrap">{r.date}</TableCell>
                      {memberOptions && (
                        <TableCell className="px-4 min-w-[200px] max-w-[260px]"><OverflowList maxVisible={1} label="Members" items={(r.member ?? "").split(", ").filter(Boolean)} /></TableCell>
                      )}
                      {CATEGORIES.map(([k]) => (
                        <TableCell key={k} className="px-4 text-right tabular-nums" style={{ color: r[k] ? undefined : "var(--slds-g-color-text-weak)" }}>
                          {usd(r[k])}
                        </TableCell>
                      ))}
                      <TableCell className="px-4 text-right font-semibold tabular-nums">{usd(totalOf(r))}</TableCell>
                      <TableCell className="px-4">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-xs" aria-label={`View support from ${r.date}`} title="View" onClick={() => open("view", r)}>
                            <Eye aria-hidden="true" />
                          </Button>
                          {!viewOnly && (
                            <Button variant="ghost" size="icon-xs" aria-label={`Edit support from ${r.date}`} title="Edit" onClick={() => open("edit", r)}>
                              <Pencil aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow style={{ backgroundColor: "var(--slds-g-color-background-alt)" }}>
                    <TableCell className="px-4 font-semibold">Total</TableCell>
                    {memberOptions && <TableCell />}
                    {CATEGORIES.map(([k]) => (
                      <TableCell key={k} className="px-4 text-right font-semibold tabular-nums">{usd(columnTotals[k])}</TableCell>
                    ))}
                    <TableCell className="px-4 text-right font-semibold tabular-nums" style={{ color: "var(--color-brand-primary)" }}>
                      {usd(grandTotal)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-t border-border">
              <PaginationInfo
                start={(safePage - 1) * PAGE_SIZE + 1}
                end={Math.min(safePage * PAGE_SIZE, filtered.length)}
                total={filtered.length}
                label="records"
              />
              {totalPages > 1 && <PaginationPageLabel current={safePage} total={totalPages} />}
            </div>
          </>
        )}
      </Card>

      <p className="flex items-center gap-2 text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
        <Info className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        Scholar payments are pending discussion and are not included in totals.
      </p>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>
              {dialog?.mode === "view" ? "Financial Support" : dialog?.mode === "edit" ? "Edit Financial Support" : "Record Financial Support"}
            </DialogTitle>
            <DialogDescription>Track resources and donations provided to this member.</DialogDescription>
          </DialogHeader>
          <DialogBody className="max-h-[65vh] overflow-y-auto">
            <fieldset disabled={readOnly} className="space-y-5 min-w-0">
              {memberOptions && (
                <div className="space-y-1.5">
                  <FieldLabel required htmlFor="fs-members" error={!!errors.member}>Members</FieldLabel>
                  <MultiSelect
                    id="fs-members"
                    value={draftMembers}
                    onValueChange={(v) => {
                      setDraftMembers(v);
                      if (v.length) setErrors(({ member: _m, ...rest }) => rest);
                    }}
                    options={memberOptions}
                    placeholder="Please Select"
                    disabled={readOnly}
                  />
                  {errors.member && <FieldError>{errors.member}</FieldError>}
                </div>
              )}
              {/* Member + date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:items-end">
                {!memberOptions && (
                  <div className="space-y-1.5 min-w-0">
                    <FieldLabel>Member</FieldLabel>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[18px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>{memberName}</span>
                      <Badge variant="success">{memberRole}</Badge>
                    </div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <FieldLabel required htmlFor="fs-date" error={!!errors.date}>Date Provided</FieldLabel>
                  <DateInput id="fs-date" value={draftDate} onChange={setDraftDate} disabled={readOnly} aria-invalid={!!errors.date} />
                  {errors.date && <FieldError>{errors.date}</FieldError>}
                </div>
              </div>

              {/* Resources & Donations */}
              <Card variant="section">
                <CardHeader size="sm" separated>
                  <CardTitle size="sm">Resources &amp; Donations</CardTitle>
                  <CardDescription className="text-[12px]">Enter the amount provided for each resource. All amounts in USD.</CardDescription>
                </CardHeader>
                <CardContent size="sm" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CATEGORIES.map(([k, label]) => (
                      <div key={k} className="space-y-1.5">
                        <FieldLabel htmlFor={`fs-${k}`} error={!!errors[k]}>{label}</FieldLabel>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] z-10" style={{ color: "var(--slds-g-color-text-weak)" }} aria-hidden="true">$</span>
                          <Input
                            id={`fs-${k}`}
                            surface="base"
                            inputMode="decimal"
                            className="pl-7 tabular-nums"
                            placeholder="0.00"
                            value={draft[k]}
                            onChange={(e) => {
                              setDraft((d) => ({ ...d, [k]: e.target.value }));
                              setErrors(({ [k]: _a, total: _b, ...rest }) => rest);
                            }}
                            onBlur={() => {
                              const n = parseFloat(draft[k]);
                              if (!isNaN(n) && n >= 0) setDraft((d) => ({ ...d, [k]: n.toFixed(2) }));
                            }}
                            aria-invalid={!!errors[k] || undefined}
                            aria-describedby={k === "transportation" ? "fs-transportation-help" : undefined}
                          />
                        </div>
                        {k === "transportation" && (
                          <p id="fs-transportation-help" className="text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>Uber rides, Ventra cards</p>
                        )}
                        {errors[k] && <FieldError>{errors[k]}</FieldError>}
                      </div>
                    ))}
                    <div className="space-y-1.5">
                      <FieldLabel htmlFor="fs-scholar">Scholar Payments</FieldLabel>
                      <Input id="fs-scholar" surface="base" value="Pending discussion" disabled readOnly aria-describedby="fs-scholar-help" />
                      <p id="fs-scholar-help" className="text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>Not included in total.</p>
                    </div>
                  </div>
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--slds-c-card-radius-border)] px-4 py-3"
                    style={{ backgroundColor: "#e6f4ea" }}
                    aria-live="polite"
                  >
                    <div>
                      <div className="text-[14px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Total support provided</div>
                      <div className="text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>Automatically calculated from entered amounts.</div>
                    </div>
                    <span className="text-[24px] font-bold tabular-nums" style={{ color: "var(--color-brand-primary)" }}>{usd(draftTotal)}</span>
                  </div>
                  {errors.total && <FieldError>{errors.total}</FieldError>}
                </CardContent>
              </Card>

              {/* Notes */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="fs-notes" note="Optional">Notes</FieldLabel>
                <Textarea
                  id="fs-notes"
                  rows={3}
                  value={draftNotes}
                  onChange={(e) => setDraftNotes(e.target.value)}
                  placeholder="Add details about the resources provided…"
                />
              </div>
            </fieldset>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>{readOnly ? "Close" : "Cancel"}</Button>
            {readOnly ? (
              viewOnly ? null : (
              <Button
                onClick={() => {
                  const rec = records.find((r) => r.id === dialog?.id);
                  if (rec) open("edit", rec);
                }}
              >
                <Pencil aria-hidden="true" />
                Edit
              </Button>
              )
            ) : (
              <Button onClick={save}>Save Support</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
