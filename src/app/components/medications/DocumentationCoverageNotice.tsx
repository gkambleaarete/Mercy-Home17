import { TriangleAlert } from "@/app/lib/lucide-icons";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import type {
  UnresolvedItem,
  UnresolvedKind,
} from "../../data/medDocumentationIssues";

// Persistent notice for an INCOMPLETE evaluation of Missing or Incomplete
// Medication Documentation. It separates what could not be evaluated (no
// scheduling source, unresolved rules) from the documentation defects in
// the table, so an incomplete result is never read as an all-clear.

const MESSAGE: Record<UnresolvedKind, (n: number) => string> = {
  "expected-dose-source-unavailable": () =>
    "Doses with no documentation cannot currently be identified: no expected-dose (scheduling) source is available. Only doses that already have documentation are checked.",
  "invalid-now": () => "The evaluation time was not valid.",
  "deadline-unknown": (n) =>
    `${n} dose${n === 1 ? "" : "s"} could not be checked for missing attestations because the deadline is not known (not treated as overdue).`,
  "attestation-redacted": (n) =>
    `${n} dose${n === 1 ? "" : "s"} could not be checked for missing attestations because attestation details are restricted for you.`,
  "attestation-unavailable": (n) =>
    `${n} dose${n === 1 ? "" : "s"} could not be checked because an attestation record is unavailable.`,
  "attestation-stage-unrecorded": (n) =>
    `${n} dose${n === 1 ? "" : "s"} could not be checked for missing attestations because the attestation stage (preparation or final) is not recorded.`,
  "code-unknown": (n) =>
    `${n} dose${n === 1 ? " has" : "s have"} a medication code with no established meaning, so they could not be checked for inconsistencies.`,
  "code-rule-undefined": (n) =>
    `${n} dose${n === 1 ? " has" : "s have"} a packed medication code with no defined rule, so they could not be checked.`,
  "link-mismatch": (n) =>
    `${n} dose${n === 1 ? " is" : "s are"} linked to a log from a different Program or Youth, which was not used.`,
  "evidence-unavailable": (n) =>
    `Some documentation values could not be read${n ? ` for ${n} dose${n === 1 ? "" : "s"}` : ""}.`,
};

export function DocumentationCoverageNotice({
  unresolved,
}: {
  unresolved: UnresolvedItem[];
}) {
  const kinds = [...new Set(unresolved.map((u) => u.kind))];
  const countOf = (k: UnresolvedKind) =>
    new Set(
      unresolved
        .filter((u) => u.kind === k && u.doseKey !== null)
        .map((u) => u.doseKey),
    ).size;
  // A source-level detail (e.g. unreadable corrections) is shown as written.
  const globalDetail = (k: UnresolvedKind) =>
    unresolved.find((u) => u.kind === k && u.doseKey === null)?.detail;
  return (
    <Alert variant="warning">
      <TriangleAlert />
      <AlertTitle>Partial evaluation — results are known issues only</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-4">
          {kinds.map((k) => (
            <li key={k}>
              {k === "evidence-unavailable" && globalDetail(k)
                ? globalDetail(k)
                : MESSAGE[k](countOf(k))}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}