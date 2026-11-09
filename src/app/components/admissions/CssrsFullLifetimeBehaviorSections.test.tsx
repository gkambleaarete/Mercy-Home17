// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  FullLifetimeAttemptDetailsSection,
  FullLifetimeBehaviorAttemptDetails,
  FullLifetimeBehaviorSection,
} from "./CssrsFullLifetimeBehaviorSections";
import {
  CssrsFullLifetimeDetails,
  CssrsFullLifetimeFields,
  fullLifetimeFieldFocusId,
} from "./CssrsFullLifetimeFields";
import {
  setAttemptField,
  setBehaviorAnswer,
  setBehaviorCount,
  setBehaviorDescription,
  setFollowUpAnswer,
} from "../../data/cssrsFullLifetimeBehavior";
import { validFullLifetime } from "../../data/cssrsTestFixtures";
import { emptyFullLifetimeResponses } from "../../data/cssrsTypes";

const idsOf = (html: string) =>
  [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const noop = () => {};

describe("Behavior section (edit)", () => {
  it("always renders, with guidance, definition and prompts visible", () => {
    const html = renderToStaticMarkup(
      <FullLifetimeBehaviorSection
        idPrefix="x"
        responses={emptyFullLifetimeResponses()}
        onChange={noop}
      />,
    );
    expect(html).toContain(
      "Check all that apply, so long as these are separate events; must ask about all types.",
    );
    expect(html).toContain(
      "A potentially self-injurious act undertaken with at least some wish to die",
    );
    expect(html).toContain("Inferring Intent:");
    expect(html).toContain("Have you made a suicide attempt?");
    expect(html).toContain("Past 3 Months");
    expect(html).not.toContain("Past 1 Month");
    // unanswered: no description fields; only the Actual Attempt totals exist
    // (disabled until Question 1 is Yes), no count for other categories.
    expect(html).not.toContain(
      "preparatoryActs-lifetime-count",
    );
    expect(html).not.toContain("-description");
  });

  it("shows description and count only for Yes, per period, and no count for self-injury", () => {
    let r = setBehaviorAnswer(
      emptyFullLifetimeResponses(),
      "preparatoryActs",
      "lifetime",
      "yes",
    );
    r = setBehaviorAnswer(
      r,
      "nonSuicidalSelfInjury",
      "lifetime",
      "yes",
    );
    const html = renderToStaticMarkup(
      <FullLifetimeBehaviorSection
        idPrefix="x"
        responses={r}
        onChange={noop}
      />,
    );
    expect(html).toContain(
      'id="x-behavior-preparatoryActs-lifetime-count"',
    );
    expect(html).toContain(
      'id="x-behavior-preparatoryActs-lifetime-description"',
    );
    expect(html).not.toContain(
      "x-behavior-preparatoryActs-past3Months-count",
    );
    expect(html).not.toContain(
      "x-behavior-nonSuicidalSelfInjury-lifetime-count",
    );
    expect(html).not.toContain(
      "x-behavior-nonSuicidalSelfInjury-lifetime-description",
    );
    expect(html).toContain("Total Number of Preparatory Acts");
  });

  it("uses unique ids across assessments and ties errors to controls", () => {
    const r = setBehaviorAnswer(
      emptyFullLifetimeResponses(),
      "actualAttempt",
      "lifetime",
      "yes",
    );
    const html = ["a", "b"]
      .map((p) =>
        renderToStaticMarkup(
          <FullLifetimeBehaviorSection
            idPrefix={p}
            responses={r}
            onChange={noop}
            errors={{
              "behavior.actualAttempt.lifetime.count":
                "Enter a whole number greater than 0.",
            }}
          />,
        ),
      )
      .join("");
    const ids = idsOf(html);
    expect(new Set(ids).size).toBe(ids.length);
    expect(html).toMatch(
      /id="a-behavior-actualAttempt-lifetime-count"[^>]*aria-describedby="a-behavior-actualAttempt-lifetime-count-error"/,
    );
  });
});

describe("Attempt Details section (edit)", () => {
  it("is hidden unless Actual Attempt is Yes", () => {
    expect(
      renderToStaticMarkup(
        <FullLifetimeAttemptDetailsSection
          idPrefix="x"
          responses={emptyFullLifetimeResponses()}
          onChange={noop}
        />,
      ),
    ).toBe("");
    const r = setBehaviorAnswer(
      emptyFullLifetimeResponses(),
      "interruptedAttempt",
      "lifetime",
      "yes",
    );
    expect(
      renderToStaticMarkup(
        <FullLifetimeAttemptDetailsSection
          idPrefix="x"
          responses={r}
          onChange={noop}
        />,
      ),
    ).toBe("");
  });

  it("shows three labelled groups with date and Actual Lethality; Potential only for 0", () => {
    let r = setBehaviorAnswer(
      emptyFullLifetimeResponses(),
      "actualAttempt",
      "past3Months",
      "yes",
    );
    r = setAttemptField(r, "mostLethal", {
      actualLethality: 0,
    });
    r = setAttemptField(r, "initial", { actualLethality: 2 });
    const html = renderToStaticMarkup(
      <FullLifetimeAttemptDetailsSection
        idPrefix="x"
        responses={r}
        onChange={noop}
      />,
    );
    for (const label of [
      "Most Recent Attempt",
      "Most Lethal Attempt",
      "Initial/First Attempt",
    ])
      expect(html).toContain(label);
    for (const g of ["mostRecent", "mostLethal", "initial"]) {
      expect(html).toContain(`id="x-attempts-${g}-date"`);
      expect(html).toContain(`id="x-attempts-${g}-actual"`);
    }
    expect(html).toContain(
      'id="x-attempts-mostLethal-potential"',
    );
    expect(html).not.toContain(
      'id="x-attempts-initial-potential"',
    );
    expect(html).not.toContain(
      'id="x-attempts-mostRecent-potential"',
    );
    expect(html).toContain(
      "Likely lethality of actual attempt if no medical damage.",
    );
    expect(html).toContain("MM/DD/YYYY");
  });
});

describe("read-only details", () => {
  const r = (() => {
    let x = validFullLifetime();
    x = setBehaviorDescription(
      x,
      "actualAttempt",
      "lifetime",
      "Took pills",
    );
    x = setBehaviorAnswer(
      x,
      "preparatoryActs",
      "past3Months",
      "yes",
    );
    x = setBehaviorCount(
      x,
      "preparatoryActs",
      "past3Months",
      4,
    );
    x = setAttemptField(x, "initial", { actualLethality: 3 });
    return x;
  })();
  const html = renderToStaticMarkup(
    <FullLifetimeBehaviorAttemptDetails responses={r} />,
  );

  it("matches the edited payload", () => {
    expect(html).toContain("Took pills");
    expect(html).toContain("Total Number of Attempts");
    expect(html).toContain("Total Number of Preparatory Acts");
    expect(html).toContain("01/02/2026");
    expect(html).toContain(
      "0 – No physical damage or very minor physical damage.",
    );
    expect(html).toContain(
      "3 – Moderately severe physical damage",
    );
    expect(html).toContain(
      "1 – Behavior likely to result in injury but not likely to cause death.",
    );
    expect(html).not.toMatch(/risk/i);
  });

  it("omits Attempt Details when no Actual Attempt, and the full details compose all sections", () => {
    const none = renderToStaticMarkup(
      <FullLifetimeBehaviorAttemptDetails
        responses={setBehaviorAnswer(
          validFullLifetime(),
          "actualAttempt",
          "lifetime",
          "no",
        )}
      />,
    );
    expect(none).not.toContain("Attempt Details and Lethality");
    const all = renderToStaticMarkup(
      <CssrsFullLifetimeDetails
        responses={validFullLifetime()}
      />,
    );
    expect(all).toContain("Suicidal Ideation");
    expect(all).toContain("Suicidal Behavior");
  });
});

describe("form composition", () => {
  it("renders all sections and maps every error key to a control id", () => {
    const html = renderToStaticMarkup(
      <CssrsFullLifetimeFields
        idPrefix="p"
        responses={validFullLifetime()}
        onResponsesChange={noop}
        errors={{}}
        saveError="Could not be saved"
      />,
    );
    for (const h of [
      "Suicidal Ideation",
      "Intensity of Ideation",
      "Suicidal Behavior",
      "Attempt Details and Lethality",
    ])
      expect(html).toContain(h);
    expect(html).toContain("Could not be saved");
    const ids = new Set(idsOf(html));
    for (const k of [
      "behavior.actualAttempt.lifetime",
      "behavior.actualAttempt.lifetime.count",
      "attempts.mostRecent.date",
      "attempts.mostLethal.actualLethality",
      "attempts.initial.potentialLethality",
      "ideation.wishToBeDead.lifetime",
      "intensity.lifetime.frequency",
    ]) {
      const id = fullLifetimeFieldFocusId("p", k)!;
      expect(id, k).toBeTruthy();
      expect(ids.has(id), `${k} → ${id}`).toBe(true);
    }
    expect(
      fullLifetimeFieldFocusId("p", "assessmentDate"),
    ).toBe("test-date");
  });
});

describe("Actual Attempt: nine questions", () => {
  const html = (r = emptyFullLifetimeResponses()) =>
    renderToStaticMarkup(
      <FullLifetimeBehaviorSection
        idPrefix="x"
        responses={r}
        onChange={noop}
      />,
    );

  it("renders all nine questions and 18 uniquely id'd Yes/No groups, with one pair of totals", () => {
    const h = html();
    for (const t of [
      "Have you made a suicide attempt?",
      "What did you do?",
      "Did you______ as a way to end your life?",
      "Or Did you think it was possible you could have died from_____?",
    ])
      expect(h).toContain(t.replace(/&/g, "&amp;"));
    const yes = idsOf(h).filter((id) =>
      /^x-behavior-actualAttempt-.*-yes$/.test(id),
    );
    expect(yes).toHaveLength(18);
    expect(new Set(idsOf(h)).size).toBe(idsOf(h).length);
    expect(h).not.toContain("Interview prompts");
    expect(
      h.match(/Total Number of Attempts: Lifetime/g),
    ).toHaveLength(1);
    expect(
      h.match(/Total Number of Attempts: Past 3 Months/g),
    ).toHaveLength(1);
  });

  it("shows a description only under its own Yes", () => {
    let r = setFollowUpAnswer(
      emptyFullLifetimeResponses(),
      "wantedToDie",
      "lifetime",
      "yes",
    );
    const h = html(r);
    expect(h).toContain(
      'id="x-behavior-actualAttempt-wantedToDie-lifetime-description"',
    );
    expect(h).not.toContain(
      "wantedToDie-past3Months-description",
    );
    expect(h).not.toContain(
      "harmYourself-lifetime-description",
    );
  });

  it("read-only shows all nine for both periods; legacy shows 'Not captured in this assessment' for 2–9", () => {
    const h = renderToStaticMarkup(
      <FullLifetimeBehaviorAttemptDetails
        responses={validFullLifetime()}
      />,
    );
    expect(
      h.match(/data-actual-attempt-question=/g),
    ).toHaveLength(9);
    expect(h).not.toContain("Not captured in this assessment");
    const legacy: any = structuredClone(validFullLifetime());
    legacy.version = 1;
    delete legacy.actualAttemptQuestions;
    const l = renderToStaticMarkup(
      <FullLifetimeBehaviorAttemptDetails responses={legacy} />,
    );
    expect(
      l.match(/Not captured in this assessment/g),
    ).toHaveLength(16);
  });

  it("focuses the first missing follow-up control", () => {
    expect(
      fullLifetimeFieldFocusId(
        "x",
        "actualAttempt.harmYourself.lifetime",
      ),
    ).toBe(
      "x-behavior-actualAttempt-harmYourself-lifetime-yes",
    );
  });
});