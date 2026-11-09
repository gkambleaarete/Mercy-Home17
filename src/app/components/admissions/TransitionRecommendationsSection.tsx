import { Pencil, Plus } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
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
import { Textarea } from "../ui/textarea";
import {
  RECOMMENDATION_TYPE_OPTIONS,
  type RecommendationType,
  type TransitionRecommendation,
} from "../../data/transitionSummaryStore";

// Internal Transition Summary → Summary → Recommendations (US 20101).
// Controlled like Contacts: rows and the open Add/Modify form live in the
// summary editor's draft; nothing here writes to the store.

export interface RecommendationFormState {
  mode: "add" | "modify";
  initial: RecommendationDraft;
  value: RecommendationDraft;
  errors: { type?: string; recommendation?: string };
}

/** Type is "" until chosen. */
type RecommendationDraft = Omit<
  TransitionRecommendation,
  "type"
> & {
  type: RecommendationType | "";
};

const newRecommendationId = () =>
  `TR-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export const recommendationFormDirty = (
  f: RecommendationFormState | null,
) =>
  !!f && JSON.stringify(f.value) !== JSON.stringify(f.initial);

function FieldError({ id, msg }: { id: string; msg?: string }) {
  return msg ? (
    <p
      id={id}
      role="alert"
      className="slds-text-3 text-destructive"
    >
      {msg}
    </p>
  ) : null;
}

export function TransitionRecommendationsSection({
  recommendations,
  readOnly,
  form,
  onFormChange,
  onApply,
}: {
  recommendations: TransitionRecommendation[];
  readOnly: boolean;
  form: RecommendationFormState | null;
  onFormChange: (f: RecommendationFormState | null) => void;
  /** Adds or replaces (by id) the validated row in the summary draft. */
  onApply: (r: TransitionRecommendation) => void;
}) {
  const v = form?.value;
  const e = form?.errors ?? {};
  const set = (patch: Partial<RecommendationDraft>) =>
    form &&
    onFormChange({
      ...form,
      value: { ...form.value, ...patch },
      errors: {},
    });

  const openAdd = () => {
    const initial: RecommendationDraft = {
      id: newRecommendationId(),
      type: "",
      recommendation: "",
    };
    onFormChange({
      mode: "add",
      initial,
      value: initial,
      errors: {},
    });
  };

  const apply = () => {
    if (!form) return;
    const text = form.value.recommendation.trim();
    const type = form.value.type;
    const errors: RecommendationFormState["errors"] = {};
    if (
      !type ||
      !(
        RECOMMENDATION_TYPE_OPTIONS as readonly string[]
      ).includes(type)
    )
      errors.type = "Select a type.";
    if (!text)
      errors.recommendation = "Enter a recommendation.";
    if (Object.keys(errors).length) {
      onFormChange({ ...form, errors });
      return;
    }
    onApply({
      id: form.value.id,
      type: type as RecommendationType,
      recommendation: text,
    });
    onFormChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4
          id="its-recommendations-heading"
          className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)]"
        >
          Recommendations
        </h4>
        {!readOnly && (
          <Button
            type="button"
            variant="outline-primary"
            size="sm"
            onClick={openAdd}
          >
            <Plus />
            Add Recommendation
          </Button>
        )}
      </div>
      <Card variant="container">
        <Table aria-labelledby="its-recommendations-heading">
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead variant="slds">Type</TableHead>
              <TableHead variant="slds">
                Recommendation
              </TableHead>
              {!readOnly && (
                <TableHead variant="slds">
                  <span className="sr-only">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {recommendations.length === 0 && (
              <TableRow hoverable={false}>
                <TableCell
                  tone="muted"
                  colSpan={readOnly ? 2 : 3}
                >
                  No recommendations added.
                </TableCell>
              </TableRow>
            )}
            {recommendations.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.type}</TableCell>
                <TableCell wrap>
                  <span className="whitespace-pre-wrap">
                    {r.recommendation}
                  </span>
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost-primary"
                      size="icon-xs"
                      aria-label={`Modify ${r.type} recommendation`}
                      onClick={() =>
                        onFormChange({
                          mode: "modify",
                          initial: r,
                          value: r,
                          errors: {},
                        })
                      }
                    >
                      <Pencil />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={!!form && !readOnly}
        onOpenChange={(o) => !o && onFormChange(null)}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {form?.mode === "modify"
                ? "Modify Recommendation"
                : "Add Recommendation"}
            </DialogTitle>
            <DialogDescription>
              Recommendations are saved with this summary when
              you save it.
            </DialogDescription>
          </DialogHeader>
          {v && (
            <DialogBody className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="its-rec-type"
                  className="slds-form-label"
                >
                  Type
                </Label>
                <Select
                  value={v.type}
                  onValueChange={(t) =>
                    set({ type: t as RecommendationType })
                  }
                >
                  <SelectTrigger
                    id="its-rec-type"
                    aria-invalid={e.type ? true : undefined}
                    aria-describedby={
                      e.type ? "its-rec-type-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECOMMENDATION_TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError
                  id="its-rec-type-error"
                  msg={e.type}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="its-rec-text"
                  className="slds-form-label"
                >
                  Recommendation
                </Label>
                <Textarea
                  id="its-rec-text"
                  value={v.recommendation}
                  onChange={(ev) =>
                    set({ recommendation: ev.target.value })
                  }
                  aria-invalid={
                    e.recommendation ? true : undefined
                  }
                  aria-describedby={
                    e.recommendation
                      ? "its-rec-text-error"
                      : undefined
                  }
                />
                <FieldError
                  id="its-rec-text-error"
                  msg={e.recommendation}
                />
              </div>
            </DialogBody>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onFormChange(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={apply}>
              {form?.mode === "modify"
                ? "Apply Changes"
                : "Add Recommendation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}