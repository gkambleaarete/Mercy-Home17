import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { usePassDialog } from "../../contexts/PassDialogContext";
import {
  ArrowLeft,
  Link2,
  Package,
  Pencil,
} from "@/app/lib/lucide-icons";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { SearchableSelect } from "../ui/searchable-select";
import { PackMedsView } from "../admissions/PackMedsView";
import { AssociationTakeoverDialog } from "../passes/AssociationTakeoverDialog";
import { usePackMeds } from "../../data/mockPackMedData";
import { usePasses } from "../../data/mockPassData";
import { getYouthName } from "../../data/mockYouthProgramData";
import { isoToMdy, time24To12 } from "../../lib/dateFormat";
import { linkPackMedToPass } from "../../lib/passPackMedAssociation";

// Pack Med record view (20042) at /pack-med/:id — the saved pack and its
// linked Pass. Edit opens the Pack Medication workflow (the same 8-step
// dialog as the youth's Medications → Pack Meds) for this record. The Pass
// link is set here through the shared association operation, with the same
// rules as the Pass form: same youth only, and taking a Pass that already
// has a Pack Med asks first.

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="slds-form-label mb-1.5 text-[var(--slds-g-color-text-weak)]">
        {label}
      </p>
      <div className="slds-text-4 text-[var(--slds-g-color-text-default)]">
        {children}
      </div>
    </div>
  );
}

export function PackMedRecordPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openView } = usePassDialog();
  const packMeds = usePackMeds();
  const passes = usePasses();
  const [editOpen, setEditOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [draftPassId, setDraftPassId] = useState("");
  const [takeover, setTakeover] = useState(false);
  const pack = packMeds.find((m) => m.id === Number(id));

  if (!pack) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Pack Med Not Found
          </h2>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft /> Go Back
          </Button>
        </div>
      </div>
    );
  }
  const youthName = getYouthName(pack.youthId);
  // Shown only when both sides agree (the association keeps them in sync).
  const linkedPass = passes.find(
    (p) => p.id === pack.passId && p.packMedId === pack.id,
  );
  // Same-youth Passes only; another youth's Pass is never offered.
  const passOptions = [
    { value: "none", label: "None" },
    ...passes
      .filter((p) => p.youthId === pack.youthId)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .map((p) => {
        const label = `${p.recordName} (${isoToMdy(p.startDate)} – ${isoToMdy(p.endDate)})`;
        return {
          value: String(p.id),
          label:
            p.packMedId != null && p.packMedId !== pack.id
              ? `${label} (linked to another Pack Med)`
              : label,
        };
      }),
  ];

  function openLink() {
    setDraftPassId(linkedPass ? String(linkedPass.id) : "");
    setLinkOpen(true);
  }
  function saveLink() {
    const target = draftPassId ? Number(draftPassId) : null;
    if (target === (linkedPass?.id ?? null)) {
      setLinkOpen(false);
      return;
    }
    const result = linkPackMedToPass(pack!.id, target);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(
      target
        ? "Pass linked to this Pack Med."
        : "Pass link removed.",
    );
    setLinkOpen(false);
  }
  function requestSave() {
    const target = passes.find(
      (p) => String(p.id) === draftPassId,
    );
    if (
      target &&
      target.packMedId != null &&
      target.packMedId !== pack!.id
    )
      setTakeover(true);
    else saveLink();
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pb-16 bg-[var(--slds-g-color-background-alt-2)]">
      <div className="px-6 py-4 bg-[var(--slds-g-color-background-base)] border-b border-border">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <Package className="h-8 w-8 mt-0.5 flex-shrink-0 text-[var(--color-brand-primary)]" />
            <div className="min-w-0">
              <p className="slds-text-3 uppercase tracking-widest font-semibold text-[var(--slds-g-color-text-weak)]">
                Pack Med
              </p>
              <h1 className="slds-page-header-title truncate text-[var(--slds-g-color-text-default)]">
                {pack.packName}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={openLink}>
              <Link2 /> Link Pass
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => setEditOpen(true)}
            >
              <Pencil /> Edit
            </Button>
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-6">
        <Card variant="section">
          <CardHeader size="sm" separated>
            <CardTitle size="sm">Pack Med Details</CardTitle>
          </CardHeader>
          <CardContent size="sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <Field label="YOUTH">{youthName}</Field>
              <Field label="STATUS">
                {pack.archived
                  ? "Archived"
                  : (pack.packStatus ?? pack.status)}
              </Field>
              <Field label="START">
                {isoToMdy(pack.startDate)}{" "}
                {time24To12(pack.startTime)}
              </Field>
              <Field label="END">
                {isoToMdy(pack.endDate)}{" "}
                {time24To12(pack.endTime)}
              </Field>
              <Field label="MEDICATIONS">
                {pack.medications
                  .map(
                    (m) =>
                      `${m.name} ${m.dose} (${m.frequency})`,
                  )
                  .join(", ") || "—"}
              </Field>
              <Field label="PASS">
                {linkedPass ? (
                  <Button
                    type="button"
                    variant="link-info"
                    size="sm"
                    className="px-0"
                    onClick={() => openView(linkedPass.id)}
                  >
                    {linkedPass.recordName} (
                    {isoToMdy(linkedPass.startDate)} –{" "}
                    {isoToMdy(linkedPass.endDate)})
                  </Button>
                ) : (
                  "None"
                )}
              </Field>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Link Pass</DialogTitle>
            <DialogDescription>
              Choose a Pass for {youthName}. Only this youth's
              Passes can be linked to this Pack Med.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <label
              htmlFor="pack-med-pass"
              className="slds-form-label mb-1.5 block text-[var(--slds-g-color-text-weak)]"
            >
              PASS
            </label>
            <SearchableSelect
              id="pack-med-pass"
              value={draftPassId || "none"}
              onValueChange={(v) =>
                setDraftPassId(v === "none" ? "" : v)
              }
              options={passOptions}
              searchPlaceholder="Search passes…"
              emptyMessage="No Passes for this youth."
            />
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLinkOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={requestSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AssociationTakeoverDialog
        open={takeover}
        message="This Pass is currently linked to another Pack Med. Linking it to this Pack Med will remove the existing association. Continue?"
        onCancel={() => setTakeover(false)}
        onContinue={() => {
          setTakeover(false);
          saveLink();
        }}
      />

      {editOpen && (
        <PackMedsView
          dialogOnly
          youthId={pack.youthId}
          youthDisplayName={youthName}
          launch={{ mode: "edit", packMedId: pack.id }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}