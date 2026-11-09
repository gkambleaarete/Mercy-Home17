// Constituent profile (Community Care Member + Youth): Program Enrollment and
// Admissions Attempt screens. Mercy Home DS components; records are kept in a
// session-only store per constituent (prototype, no backend).

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "@/app/lib/lucide-icons";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { DateInput } from "../ui/date-input";
import { TimeInput } from "../ui/time-input";
import { FieldError, FieldLabel } from "../ui/field";
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

/** Same program list as Admissions > Determination > Program Enrollment. */
export const PROFILE_PROGRAMS = [
  "A Program #2",
  "Bernardin",
  "Bosco",
  "Campbell",
  "Cooke",
  "Couderc",
  "Daley",
  "Kelly",
  "Mahoney",
  "Noha",
  "Other",
  "Quille",
  "Self-Awareness",
];

const cell = "px-4 py-2.5 text-[13px]";
const weak = { color: "var(--slds-g-color-text-weak)" } as const;

const mdyTime = (mdy: string): number => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(mdy);
  return m ? new Date(+m[3], +m[1] - 1, +m[2]).getTime() : NaN;
};
const isMdy = (v: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(v);
const todayMdy = () => {
  const t = new Date();
  return `${String(t.getMonth() + 1).padStart(2, "0")}/${String(t.getDate()).padStart(2, "0")}/${t.getFullYear()}`;
};

// ── Session stores ───────────────────────────────────────────────────────
type Enrollment = {
  id: number;
  program: string;
  moveInDate: string; // MM/DD/YYYY
  moveInTime: string;
  moveOutDate: string;
  moveOutTime: string;
};
type Attempt = {
  id: number;
  attemptDate: string; // MM/DD/YYYY
  program: string;
  referralSource: string;
  status: AttemptStatus;
  notes: string;
};
const ATTEMPT_STATUSES = ["In Progress", "Admitted", "Declined", "Withdrawn"] as const;
type AttemptStatus = (typeof ATTEMPT_STATUSES)[number];

const enrollmentStore = new Map<string, Enrollment[]>();
const attemptStore = new Map<string, Attempt[]>();

function useSessionList<T>(store: Map<string, T[]>, ownerId: string) {
  const [list, setListState] = useState<T[]>(() => store.get(ownerId) ?? []);
  const setList = (next: T[]) => {
    store.set(ownerId, next);
    setListState(next);
  };
  return [list, setList] as const;
}

function DeleteDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Program Enrollment ───────────────────────────────────────────────────
export function ProfileProgramEnrollment({ ownerId }: { ownerId: string }) {
  const [rows, setRows] = useSessionList(enrollmentStore, ownerId);
  const [dialog, setDialog] = useState<{ id?: number } | null>(null);
  const [form, setForm] = useState<Omit<Enrollment, "id">>({
    program: "",
    moveInDate: "",
    moveInTime: "",
    moveOutDate: "",
    moveOutTime: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [deleting, setDeleting] = useState<Enrollment | null>(null);

  const open = (rec?: Enrollment) => {
    setForm(
      rec
        ? { ...rec }
        : { program: "", moveInDate: todayMdy(), moveInTime: "", moveOutDate: "", moveOutTime: "" },
    );
    setSubmitted(false);
    setDialog({ id: rec?.id });
  };
  const errors = {
    program: !form.program ? "Select a program." : "",
    moveInDate: !isMdy(form.moveInDate) ? "Enter a move-in date (MM/DD/YYYY)." : "",
    moveOutDate:
      form.moveOutDate && !isMdy(form.moveOutDate)
        ? "Enter a valid move-out date (MM/DD/YYYY)."
        : form.moveOutDate && mdyTime(form.moveOutDate) < mdyTime(form.moveInDate)
          ? "Move-out date can't be before move-in date."
          : "",
  };
  const save = () => {
    setSubmitted(true);
    if (errors.program || errors.moveInDate || errors.moveOutDate) return;
    if (dialog?.id != null) {
      setRows(rows.map((r) => (r.id === dialog.id ? { ...r, ...form } : r)));
      toast.success("Program enrollment updated.");
    } else {
      setRows([...rows, { id: Date.now(), ...form }]);
      toast.success("Program enrollment added.");
    }
    setDialog(null);
  };
  const status = (r: Enrollment) =>
    !r.moveOutDate || mdyTime(r.moveOutDate) >= mdyTime(todayMdy()) ? "Active" : "Ended";
  const sorted = [...rows].sort((a, b) => mdyTime(b.moveInDate) - mdyTime(a.moveInDate));

  return (
    <>
      <Card variant="section">
        <CardHeader size="sm" separated className="flex items-center justify-between gap-2">
          <CardTitle size="sm">Program Enrollment</CardTitle>
          <Button size="sm" onClick={() => open()}>
            <Plus aria-hidden="true" />
            Add
          </Button>
        </CardHeader>
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-[16px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
            Constituent has not been assigned a Program.
          </p>
        ) : (
          <Table style={{ minWidth: "640px" }}>
            <TableHeader>
              <TableRow hoverable={false}>
                {["Program", "Move-In Date", "Move-Out Date", "Status", "Actions"].map((h) => (
                  <TableHead key={h} variant="slds" size="md" className={h === "Actions" ? "text-right" : undefined}>
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className={`${cell} font-medium`}>{r.program}</TableCell>
                  <TableCell className={cell} style={weak}>
                    {r.moveInDate}
                    {r.moveInTime ? ` ${r.moveInTime}` : ""}
                  </TableCell>
                  <TableCell className={cell} style={weak}>
                    {r.moveOutDate ? `${r.moveOutDate}${r.moveOutTime ? ` ${r.moveOutTime}` : ""}` : "—"}
                  </TableCell>
                  <TableCell className={cell}>
                    <Badge variant={status(r) === "Active" ? "success" : "neutral"} bordered>
                      {status(r)}
                    </Badge>
                  </TableCell>
                  <TableCell className={cell}>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-xs" aria-label={`Edit ${r.program} enrollment`} title="Edit" onClick={() => open(r)}>
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button variant="ghost-destructive" size="icon-xs" aria-label={`Delete ${r.program} enrollment`} title="Delete" onClick={() => setDeleting(r)}>
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{dialog?.id != null ? "Edit Program Enrollment" : "Add Program Enrollment"}</DialogTitle>
            <DialogDescription>Program placement with move-in and move-out details.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <FieldLabel required htmlFor="pe-program" error={submitted && !!errors.program}>
                Program
              </FieldLabel>
              <Select value={form.program || undefined} onValueChange={(v) => setForm({ ...form, program: v })}>
                <SelectTrigger id="pe-program" surface="base" aria-invalid={(submitted && !!errors.program) || undefined}>
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  {PROFILE_PROGRAMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {submitted && errors.program && <FieldError>{errors.program}</FieldError>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FieldLabel required htmlFor="pe-in-date" error={submitted && !!errors.moveInDate}>
                  Move-In Date
                </FieldLabel>
                <DateInput id="pe-in-date" value={form.moveInDate} onChange={(v) => setForm({ ...form, moveInDate: v })} />
                {submitted && errors.moveInDate && <FieldError>{errors.moveInDate}</FieldError>}
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="pe-in-time">Move-In Time</FieldLabel>
                <TimeInput id="pe-in-time" value={form.moveInTime} onChange={(v: string) => setForm({ ...form, moveInTime: v })} />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="pe-out-date" error={submitted && !!errors.moveOutDate}>
                  Move-Out Date
                </FieldLabel>
                <DateInput id="pe-out-date" value={form.moveOutDate} onChange={(v) => setForm({ ...form, moveOutDate: v })} />
                {submitted && errors.moveOutDate && <FieldError>{errors.moveOutDate}</FieldError>}
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="pe-out-time">Move-Out Time</FieldLabel>
                <TimeInput id="pe-out-time" value={form.moveOutTime} onChange={(v: string) => setForm({ ...form, moveOutTime: v })} />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={deleting !== null}
        title="Delete Program Enrollment"
        description={`Delete the ${deleting?.program ?? ""} enrollment? This can't be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) setRows(rows.filter((r) => r.id !== deleting.id));
          setDeleting(null);
          toast.success("Program enrollment deleted.");
        }}
      />
    </>
  );
}

// ── Admissions Attempt ───────────────────────────────────────────────────
export function ProfileAdmissionsAttempts({ ownerId }: { ownerId: string }) {
  const [rows, setRows] = useSessionList(attemptStore, ownerId);
  const [dialog, setDialog] = useState<{ id?: number } | null>(null);
  const empty: Omit<Attempt, "id"> = {
    attemptDate: "",
    program: "",
    referralSource: "",
    status: "In Progress",
    notes: "",
  };
  const [form, setForm] = useState<Omit<Attempt, "id">>(empty);
  const [submitted, setSubmitted] = useState(false);
  const [deleting, setDeleting] = useState<Attempt | null>(null);

  const open = (rec?: Attempt) => {
    setForm(rec ? { ...rec } : { ...empty, attemptDate: todayMdy() });
    setSubmitted(false);
    setDialog({ id: rec?.id });
  };
  const errors = {
    attemptDate: !isMdy(form.attemptDate) ? "Enter an attempt date (MM/DD/YYYY)." : "",
    program: !form.program ? "Select a program." : "",
  };
  const save = () => {
    setSubmitted(true);
    if (errors.attemptDate || errors.program) return;
    const clean = { ...form, referralSource: form.referralSource.trim(), notes: form.notes.trim() };
    if (dialog?.id != null) {
      setRows(rows.map((r) => (r.id === dialog.id ? { ...r, ...clean } : r)));
      toast.success("Admissions attempt updated.");
    } else {
      setRows([...rows, { id: Date.now(), ...clean }]);
      toast.success("Admissions attempt added.");
    }
    setDialog(null);
  };
  const badge = (s: AttemptStatus) =>
    s === "Admitted" ? "success" : s === "Declined" ? "error" : s === "Withdrawn" ? "neutral" : "info";
  const sorted = [...rows].sort((a, b) => mdyTime(b.attemptDate) - mdyTime(a.attemptDate));

  return (
    <>
      <Card variant="section">
        <CardHeader size="sm" separated className="flex items-center justify-between gap-2">
          <CardTitle size="sm">Admissions</CardTitle>
          <Button size="sm" onClick={() => open()}>
            <Plus aria-hidden="true" />
            Add
          </Button>
        </CardHeader>
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px]" style={weak}>
            No admission records found.
          </p>
        ) : (
          <Table style={{ minWidth: "760px" }}>
            <TableHeader>
              <TableRow hoverable={false}>
                {["Attempt Date", "Program", "Referral Source", "Status", "Outcome Notes", "Actions"].map((h) => (
                  <TableHead key={h} variant="slds" size="md" className={h === "Actions" ? "text-right" : undefined}>
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className={cell}>{r.attemptDate}</TableCell>
                  <TableCell className={`${cell} font-medium`}>{r.program}</TableCell>
                  <TableCell className={cell} style={weak}>
                    {r.referralSource || "—"}
                  </TableCell>
                  <TableCell className={cell}>
                    <Badge variant={badge(r.status)} bordered>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell wrap className={`${cell} max-w-[280px]`} style={weak}>
                    {r.notes || "—"}
                  </TableCell>
                  <TableCell className={cell}>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-xs" aria-label={`Edit attempt from ${r.attemptDate}`} title="Edit" onClick={() => open(r)}>
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button variant="ghost-destructive" size="icon-xs" aria-label={`Delete attempt from ${r.attemptDate}`} title="Delete" onClick={() => setDeleting(r)}>
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{dialog?.id != null ? "Edit Admissions Attempt" : "Add Admissions Attempt"}</DialogTitle>
            <DialogDescription>Record an admission attempt and its outcome.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FieldLabel required htmlFor="aa-date" error={submitted && !!errors.attemptDate}>
                  Attempt Date
                </FieldLabel>
                <DateInput id="aa-date" value={form.attemptDate} onChange={(v) => setForm({ ...form, attemptDate: v })} />
                {submitted && errors.attemptDate && <FieldError>{errors.attemptDate}</FieldError>}
              </div>
              <div className="space-y-1.5">
                <FieldLabel required htmlFor="aa-program" error={submitted && !!errors.program}>
                  Program
                </FieldLabel>
                <Select value={form.program || undefined} onValueChange={(v) => setForm({ ...form, program: v })}>
                  <SelectTrigger id="aa-program" surface="base" aria-invalid={(submitted && !!errors.program) || undefined}>
                    <SelectValue placeholder="Please Select" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[260px]">
                    {PROFILE_PROGRAMS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {submitted && errors.program && <FieldError>{errors.program}</FieldError>}
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="aa-source">Referral Source</FieldLabel>
                <Input id="aa-source" surface="base" value={form.referralSource} onChange={(e) => setForm({ ...form, referralSource: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <FieldLabel required htmlFor="aa-status">Status</FieldLabel>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as AttemptStatus })}>
                  <SelectTrigger id="aa-status" surface="base">
                    <SelectValue placeholder="Please Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTEMPT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="aa-notes">Outcome Notes</FieldLabel>
              <Textarea id="aa-notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={deleting !== null}
        title="Delete Admissions Attempt"
        description={`Delete the attempt from ${deleting?.attemptDate ?? ""}? This can't be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) setRows(rows.filter((r) => r.id !== deleting.id));
          setDeleting(null);
          toast.success("Admissions attempt deleted.");
        }}
      />
    </>
  );
}
