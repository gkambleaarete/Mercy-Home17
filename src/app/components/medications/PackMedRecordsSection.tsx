import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, Plus } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
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
import { SearchableSelect } from "../ui/searchable-select";
import { PackMedsView } from "../admissions/PackMedsView";
import { usePackMeds } from "../../data/mockPackMedData";
import { usePasses } from "../../data/mockPassData";
import {
  getActiveYouth,
  getYouthName,
} from "../../data/mockYouthProgramData";
import { isoToMdy } from "../../lib/dateFormat";

// Saved Pack Med records (20042) from the canonical store, with each one's
// linked Pass. "New Pack Med" asks for the youth, then opens the Pack
// Medication workflow (8-step dialog) for that youth.
export function PackMedRecordsSection() {
  const navigate = useNavigate();
  const packMeds = usePackMeds();
  const passes = usePasses();
  const [chooseOpen, setChooseOpen] = useState(false);
  const [youthId, setYouthId] = useState("");
  const [workflowYouthId, setWorkflowYouthId] = useState<
    string | null
  >(null);
  const youthOptions = getActiveYouth().map((y) => ({
    value: y.youthId,
    label: y.youthName,
  }));
  const rows = [...packMeds].sort((a, b) =>
    b.startDate.localeCompare(a.startDate),
  );

  return (
    <Card variant="section">
      <CardHeader size="sm" separated>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle size="sm">
            Pack Med Records ({rows.length})
          </CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setYouthId("");
              setChooseOpen(true);
            }}
          >
            <Plus /> New Pack Med
          </Button>
        </div>
      </CardHeader>
      <CardContent size="sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow hoverable={false}>
                <TableHead variant="slds">Youth</TableHead>
                <TableHead variant="slds">Pack</TableHead>
                <TableHead variant="slds">Period</TableHead>
                <TableHead variant="slds">
                  Medications
                </TableHead>
                <TableHead variant="slds">Pass</TableHead>
                <TableHead variant="slds">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m) => {
                const pass = passes.find(
                  (p) => p.id === m.passId,
                );
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      {getYouthName(m.youthId)}
                    </TableCell>
                    <TableCell>{m.packName}</TableCell>
                    <TableCell>
                      {isoToMdy(m.startDate)} –{" "}
                      {isoToMdy(m.endDate)}
                    </TableCell>
                    <TableCell>
                      {m.medications.length}
                    </TableCell>
                    <TableCell>
                      {pass ? pass.recordName : "None"}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost-primary"
                        size="icon-xs"
                        aria-label={`View ${m.packName}`}
                        title="View Pack Med"
                        onClick={() =>
                          navigate(`/pack-med/${m.id}`)
                        }
                      >
                        <Eye />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <Dialog open={chooseOpen} onOpenChange={setChooseOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>New Pack Med</DialogTitle>
            <DialogDescription>
              Choose the youth this Pack Med is for.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <label
              htmlFor="new-pack-med-youth"
              className="slds-form-label mb-1.5 block text-[var(--slds-g-color-text-weak)]"
            >
              YOUTH
            </label>
            <SearchableSelect
              id="new-pack-med-youth"
              value={youthId}
              onValueChange={setYouthId}
              options={youthOptions}
              placeholder="Select youth"
              searchPlaceholder="Search youth…"
            />
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChooseOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={!youthId}
              onClick={() => {
                setChooseOpen(false);
                setWorkflowYouthId(youthId);
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {workflowYouthId && (
        <PackMedsView
          dialogOnly
          youthId={workflowYouthId}
          youthDisplayName={getYouthName(workflowYouthId)}
          launch={{ mode: "create" }}
          onClose={() => setWorkflowYouthId(null)}
        />
      )}
    </Card>
  );
}