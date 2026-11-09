// The ONE Pass create algorithm (19998), shared by every create entry point:
// the shared Pass record modal (New Pass from the list, calendar, Program,
// Constituent Profile and the Global Actions menu).
// Builds the record(s) from the form, generates recurring occurrences, saves
// them to the canonical store, and applies the optional Pack Med link to the
// first occurrence through the association helper.

import {
  type PassRecord,
  nextPassId,
  nextSeriesId,
  savePasses,
} from "../data/mockPassData";
import { CURRENT_USER_NAME } from "../data/mockProgramsData";
import { getYouthName } from "../data/mockYouthProgramData";
import {
  type PassFormValues,
  buildPassRecordName,
  formToPassFields,
  formToRecurrence,
  generateOccurrenceDates,
} from "./passes";
import { linkPassToPackMed } from "./passPackMedAssociation";

export interface PassCreateResult {
  /** Every Pass created (one, or each occurrence of a series), in order. */
  created: PassRecord[];
  /** Set if the Pack Med link was rejected (the Passes are still saved). */
  packMedError?: string;
}

export function createPassesFromForm(
  values: PassFormValues,
): PassCreateResult {
  const fields = formToPassFields(values);
  const now = new Date().toISOString();
  const recurrence = formToRecurrence(values);
  // Canonical Constituent name (any eligible role, active or not) — never
  // blank for a Community Care Member.
  const youth = getYouthName(fields.youthId);
  const firstId = nextPassId();
  const seriesId = recurrence ? nextSeriesId() : null;
  const dates = recurrence
    ? generateOccurrenceDates(
        fields.startDate,
        fields.endDate,
        recurrence,
      )
    : [
        {
          startDate: fields.startDate,
          endDate: fields.endDate,
        },
      ];
  const created: PassRecord[] = dates.map((d, i) => ({
    ...fields,
    ...d,
    // Every generated occurrence starts Pending.
    status: recurrence ? "Pending" : fields.status,
    id: firstId + i,
    recordName: buildPassRecordName(youth, d.startDate),
    seriesId,
    recurrence,
    packMedId: null,
    createdBy: CURRENT_USER_NAME,
    createdAt: now,
    updatedAt: now,
  }));
  savePasses(created);
  // Pack Med links to the first (or only) Pass — never to every occurrence.
  let packMedError: string | undefined;
  if (values.packMedId) {
    const result = linkPassToPackMed(
      firstId,
      Number(values.packMedId),
    );
    if (!result.ok) packMedError = result.error;
  }
  return { created, packMedError };
}