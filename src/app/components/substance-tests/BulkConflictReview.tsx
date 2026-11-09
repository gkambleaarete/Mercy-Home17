import { useId } from "react";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import type { BulkSubstanceTestConflict } from "../../data/mockSubstanceTestData";
import type { BulkTestRow } from "./BulkTestDefinitionDialog";
import {
  type BulkYouthRow,
  getResult,
  substancesForTest,
} from "./bulkYouthResults";
import { formatSampleDateTime } from "./substanceTestDateTime";

// Bulk Modify — review of linked tests edited individually after the last
// Bulk save (20066). For every one that stays in the group the user must
// choose Keep Individual Changes or Overwrite with Bulk Changes; there is no
// default. Shows the stored individual values next to what this Bulk change
// would write, and — for Overwrite — exactly which values would be replaced.

export type ConflictChoice = "keep" | "overwrite";

type ResultItem = {
  substance: string;
  result: string;
  level: string;
  units: string;
};
type DetailLine = { label: string; items: string[] };

const itemText = (r: ResultItem) =>
  [r.substance, r.result, r.level, r.units]
    .filter(Boolean)
    .join(" ");
const lineText = (d: DetailLine) =>
  `${d.label}: ${d.items.length ? d.items.join(", ") : "Not entered"}`;
/** Order-insensitive, so the same results in another order are "same". */
const sameDetails = (a: DetailLine[], b: DetailLine[]) =>
  JSON.stringify(
    a.map((d) => [d.label, [...d.items].sort()]),
  ) ===
  JSON.stringify(b.map((d) => [d.label, [...d.items].sort()]));

/** The individual test's stored results — every one listed. */
function storedDetails(
  details: BulkSubstanceTestConflict["current"]["testDetails"],
): DetailLine[] {
  return details.map((d) => ({
    label: d.testPanel
      ? `${d.testType} — ${d.testPanel}`
      : d.testType,
    items: d.testResults.map(itemText),
  }));
}

/** What Overwrite would store, in the same form: the entered panel results
 *  plus the stored results the store keeps (those outside the panel, while
 *  the test keeps its original Type and Panel). */
function proposedDetails(
  youth: BulkYouthRow,
  tests: BulkTestRow[],
  originalTests: BulkTestRow[],
  stored: BulkSubstanceTestConflict["current"]["testDetails"],
): DetailLine[] {
  return tests.map((t) => {
    const subs = substancesForTest(t);
    const entered = subs.flatMap((s) => {
      const r = getResult(youth.results, t.id, s);
      return r.result ? [itemText({ substance: s, ...r })] : [];
    });
    const i = originalTests.findIndex((o) => o.id === t.id);
    const old = i >= 0 ? stored[i] : undefined;
    const keptOld =
      old &&
      old.testType === t.testType &&
      old.testPanel === t.testPanel
        ? old.testResults.filter(
            (r) => !subs.includes(r.substance),
          )
        : [];
    return {
      label: t.testPanel
        ? `${t.testType} — ${t.testPanel}`
        : t.testType,
      items: [...entered, ...keptOld.map(itemText)],
    };
  });
}

function ValueList({ lines }: { lines: string[] }) {
  if (lines.length === 0) return <>—</>;
  return (
    <ul>
      {lines.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  );
}

function ConflictRow({
  conflict,
  youth,
  tests,
  originalTests,
  proposedDateTime,
  proposedReason,
  newUseShown,
  choice,
  onChoose,
  errors,
}: {
  conflict: BulkSubstanceTestConflict;
  youth?: BulkYouthRow;
  tests: BulkTestRow[];
  originalTests: BulkTestRow[];
  proposedDateTime: string;
  proposedReason: string;
  newUseShown: boolean;
  choice?: ConflictChoice;
  onChoose: (c: ConflictChoice) => void;
  errors: string[];
}) {
  const uid = useId();
  const name =
    youth?.name ?? `Constituent ${conflict.constituentId}`;
  const current = conflict.current;
  const nowDetails = storedDetails(current.testDetails);
  const newDetails = youth
    ? proposedDetails(
        youth,
        tests,
        originalTests,
        current.testDetails,
      )
    : [];
  const rows: {
    label: string;
    now: string[];
    proposed: string[];
    same?: boolean;
  }[] = [
    {
      label: "Sample Date / Time",
      now: [
        formatSampleDateTime(current.sampleDateTime) || "—",
      ],
      proposed: [formatSampleDateTime(proposedDateTime) || "—"],
    },
    {
      label: "Reason",
      now: [current.reason || "—"],
      proposed: [proposedReason || "—"],
    },
    {
      label: "New Use",
      now: [current.newUse || "—"],
      proposed: [
        youth
          ? newUseShown
            ? youth.newUse
            : "Not applicable"
          : "—",
      ],
    },
    {
      label: "Results",
      now: nowDetails.map(lineText),
      proposed: youth ? newDetails.map(lineText) : ["—"],
      same: sameDetails(nowDetails, newDetails),
    },
  ];
  const replaced = rows.filter((r) =>
    r.same !== undefined
      ? !r.same
      : r.now.join("\n") !== r.proposed.join("\n"),
  );

  return (
    <section
      aria-labelledby={`${uid}-name`}
      className="space-y-3 rounded-[var(--slds-c-card-radius-border)] border border-border p-4"
    >
      <h4
        id={`${uid}-name`}
        className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)]"
      >
        {name}
      </h4>
      <p className="slds-text-4 text-[var(--slds-g-color-text-default)]">
        This youth's individual Substance Test was edited after
        the last Bulk save (now revision{" "}
        {conflict.currentRevision}; the Bulk save wrote revision{" "}
        {conflict.baselineRevision}).
      </p>
      {!youth ? (
        <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
          Removed from this Bulk Substance Test — no choice
          needed. The individual test is kept as it is.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table
              aria-label={`${name}: individual test and Bulk change`}
            >
              <TableHeader>
                <TableRow hoverable={false}>
                  <TableHead variant="slds">Value</TableHead>
                  <TableHead variant="slds">
                    Individual test now
                  </TableHead>
                  <TableHead variant="slds">
                    This Bulk change
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.label} hoverable={false}>
                    {/* A body cell (same padding as the values, so label
                        and value align) that is still the row's header. */}
                    <TableCell
                      role="rowheader"
                      className="align-top"
                    >
                      <span className="font-medium">
                        {r.label}
                      </span>
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      <ValueList lines={r.now} />
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      <ValueList lines={r.proposed} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <RadioGroup
            value={choice ?? ""}
            onValueChange={(v: string) =>
              onChoose(v as ConflictChoice)
            }
            aria-label={`Resolution for ${name}`}
            aria-required
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem id={`${uid}-keep`} value="keep" />
              <Label htmlFor={`${uid}-keep`}>
                Keep Individual Changes
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id={`${uid}-overwrite`}
                value="overwrite"
              />
              <Label htmlFor={`${uid}-overwrite`}>
                Overwrite with Bulk Changes
              </Label>
            </div>
          </RadioGroup>
          {choice === "overwrite" && (
            <p className="slds-text-4 text-[var(--slds-g-color-text-default)]">
              {replaced.length
                ? `Saving will replace: ${replaced.map((r) => r.label).join(", ")}.`
                : "The Bulk values match the individual test; nothing visible will change."}
            </p>
          )}
          {choice === "keep" && (
            <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
              This individual test will not be changed, and it
              will be flagged again the next time this Bulk
              Substance Test is modified.
            </p>
          )}
        </>
      )}
      {errors.map((m, i) => (
        <p
          key={i}
          role="alert"
          className="slds-text-3 text-[#c23934]"
        >
          {m}
        </p>
      ))}
    </section>
  );
}

export function BulkConflictReview({
  headingId,
  conflicts,
  youths,
  tests,
  originalTests,
  proposedDateTime,
  proposedReason,
  newUseShown,
  choices,
  onChoose,
  errorsFor,
}: {
  headingId: string;
  conflicts: BulkSubstanceTestConflict[];
  youths: BulkYouthRow[];
  tests: BulkTestRow[];
  /** The group's Test(s) as saved — to know which stored results stay. */
  originalTests: BulkTestRow[];
  proposedDateTime: string;
  proposedReason: string;
  newUseShown: boolean;
  choices: Record<number, ConflictChoice | undefined>;
  onChoose: (testId: number, c: ConflictChoice) => void;
  errorsFor: (testId: number) => string[];
}) {
  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <h3
        id={headingId}
        className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)]"
      >
        Individually Edited Tests ({conflicts.length})
      </h3>
      <p
        role="status"
        className="slds-text-4 text-[var(--slds-g-color-text-default)]"
      >
        {conflicts.length === 1
          ? "One linked test was"
          : `${conflicts.length} linked tests were`}{" "}
        edited individually after this Bulk Substance Test was
        last saved. Choose how to handle each one before saving.
        Nothing is overwritten unless you choose Overwrite.
      </p>
      {conflicts.map((c) => (
        <ConflictRow
          key={c.testId}
          conflict={c}
          youth={youths.find(
            (y) => y.constituentId === c.constituentId,
          )}
          tests={tests}
          originalTests={originalTests}
          proposedDateTime={proposedDateTime}
          proposedReason={proposedReason}
          newUseShown={newUseShown}
          choice={choices[c.testId]}
          onChoose={(v) => onChoose(c.testId, v)}
          errors={errorsFor(c.testId)}
        />
      ))}
    </section>
  );
}