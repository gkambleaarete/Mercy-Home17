// Document Checklist (US 20040), shown after Youth Matching Questions.
// Lists the nine documents that apply to the mentee's Sub-Program; each is
// tracked manually as Complete/Incomplete and saved immediately. No upload
// is required. Completion of documents that become hidden after a
// Sub-Program change is kept.

import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import type { FFMentee } from "../../data/mockFriendsFirstData";
import {
  applicableDocuments,
  documentCompletion,
} from "../../data/ffMenteeIntake";
import { setFFMenteeDocument } from "../../data/ffMenteeStore";
import { GroupSection } from "./IntakeQuestionnaire";

export function MenteeDocumentChecklist({
  mentee,
}: {
  mentee: FFMentee;
}) {
  const docs = applicableDocuments(mentee.programme);
  const { done, total } = documentCompletion(
    mentee.documents,
    mentee.programme,
  );

  const toggle = (
    id: string,
    label: string,
    complete: boolean,
  ) => {
    if (!setFFMenteeDocument(mentee.id, id, complete))
      toast.error(`${label} not updated`, {
        description:
          "The change could not be saved, so the checklist was left as it was. Try again.",
      });
    else
      toast.success(
        `${label} marked ${complete ? "complete" : "incomplete"}`,
      );
  };

  return (
    <GroupSection title="Document Checklist">
      <p
        className="mb-3 text-[13px]"
        style={{ color: "var(--slds-g-color-text-weak)" }}
        role="status"
      >
        {done} of {total} required documents complete for{" "}
        {mentee.programme}. Changes save immediately.
      </p>
      <ul
        className="divide-y rounded-lg"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        {docs.map((d) => {
          const st = mentee.documents?.[d.id];
          const complete = !!st?.complete;
          return (
            <li
              key={d.id}
              className="flex items-center gap-3 px-3 py-2.5 flex-wrap"
            >
              <Checkbox
                id={`doc-${d.id}`}
                surface="base"
                checked={complete}
                onCheckedChange={(v) =>
                  toggle(d.id, d.label, v === true)
                }
              />
              <label
                htmlFor={`doc-${d.id}`}
                className="flex-1 min-w-[200px] text-[13px]"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {d.label}
              </label>
              <Badge variant={complete ? "success" : "outline"}>
                {complete ? "Complete" : "Incomplete"}
              </Badge>
              {st?.updatedAt && (
                <span
                  className="text-[12px]"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Updated {st.updatedAt}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </GroupSection>
  );
}