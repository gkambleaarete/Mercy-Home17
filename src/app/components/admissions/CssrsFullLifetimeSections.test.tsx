// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  FullLifetimeIdeationIntensityDetails,
  FullLifetimeIdeationSection,
  FullLifetimeIntensitySection,
  fullLifetimeFocusId,
} from "./CssrsFullLifetimeSections";
import {
  setIdeationAnswer,
  setIdeationDescription,
  setIntensityRating,
  setMostSevereIdeation,
} from "../../data/cssrsFullLifetime";
import { emptyFullLifetimeResponses } from "../../data/cssrsTypes";

const idsOf = (html: string) => [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const noop = () => {};
const sample = () => {
  let r = emptyFullLifetimeResponses();
  r = setIdeationAnswer(r, "wishToBeDead", "lifetime", "yes");
  r = setIdeationDescription(r, "wishToBeDead", "lifetime", "Felt hopeless at age 12");
  r = setIdeationAnswer(r, "nonSpecificActiveThoughts", "lifetime", "no");
  r = setIdeationAnswer(r, "wishToBeDead", "past1Month", "no");
  r = setIdeationAnswer(r, "nonSpecificActiveThoughts", "past1Month", "yes");
  r = setIdeationAnswer(r, "methodsWithoutPlan", "past1Month", "yes");
  r = setMostSevereIdeation(r, "lifetime", { typeNumber: 1, description: "Passive" });
  r = setMostSevereIdeation(r, "recent", { typeNumber: 3 });
  r = setIntensityRating(r, "controllability", "lifetime", 0);
  r = setIntensityRating(r, "frequency", "recent", 3);
  return r;
};

describe("editing sections", () => {
  it("renders unique ids per assessment, question and period", () => {
    const r = sample();
    const html = ["a", "b"]
      .map((p) =>
        renderToStaticMarkup(
          <>
            <FullLifetimeIdeationSection idPrefix={p} responses={r} onChange={noop} />
            <FullLifetimeIntensitySection idPrefix={p} responses={r} onChange={noop} />
          </>,
        ),
      )
      .join("");
    const ids = idsOf(html);
    expect(ids.length).toBeGreaterThan(30);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("labels both periods, and shows Not applicable for the other period", () => {
    const html = renderToStaticMarkup(
      <FullLifetimeIdeationSection idPrefix="x" responses={sample()} onChange={noop} />,
    );
    expect(html).toContain("Lifetime: Time the individual felt most suicidal");
    expect(html).toContain("Past 1 Month");
    // Q3 is applicable for Past 1 Month only
    expect(html).toContain("x-ideation-methodsWithoutPlan-past1Month-yes");
    expect(html).not.toContain("x-ideation-methodsWithoutPlan-lifetime-yes");
    expect(html).toContain("Not applicable");
  });

  it("shows help text visibly and a description only for a Yes", () => {
    const html = renderToStaticMarkup(
      <FullLifetimeIdeationSection idPrefix="x" responses={sample()} onChange={noop} />,
    );
    expect(html).toContain("Person endorses thoughts about a wish to be dead");
    expect(html).toContain("x-ideation-wishToBeDead-lifetime-description");
    expect(html).not.toContain("x-ideation-wishToBeDead-past1Month-description");
    expect(html).toContain("If Yes, Describe");
  });

  it("hides Intensity entirely when no period qualifies; shows only qualifying inputs", () => {
    expect(
      renderToStaticMarkup(
        <FullLifetimeIntensitySection idPrefix="x" responses={emptyFullLifetimeResponses()} onChange={noop} />,
      ),
    ).toBe("");
    let r = setIdeationAnswer(emptyFullLifetimeResponses(), "wishToBeDead", "lifetime", "yes");
    r = setIdeationAnswer(r, "nonSpecificActiveThoughts", "past1Month", "no");
    const html = renderToStaticMarkup(
      <FullLifetimeIntensitySection idPrefix="x" responses={r} onChange={noop} />,
    );
    expect(html).toContain('id="x-intensity-lifetime-frequency"');
    expect(html).not.toContain('id="x-intensity-recent-frequency"');
    expect(html).toContain("Not applicable");
    expect(html).toContain("The ratings relate to the most severe ideation type");
  });

  it("ties errors to their controls", () => {
    const html = renderToStaticMarkup(
      <FullLifetimeIdeationSection
        idPrefix="x"
        responses={emptyFullLifetimeResponses()}
        onChange={noop}
        errors={{ "ideation.wishToBeDead.lifetime": "Select Yes or No." }}
      />,
    );
    expect(html).toContain('id="x-ideation-wishToBeDead-lifetime-error"');
    expect(html).toMatch(/aria-describedby="[^"]*x-ideation-wishToBeDead-lifetime-error/);
    expect(fullLifetimeFocusId("x", "ideation.wishToBeDead.lifetime")).toBe("x-ideation-wishToBeDead-lifetime-yes");
    expect(fullLifetimeFocusId("x", "intensity.recent.frequency")).toBe("x-intensity-recent-frequency");
  });
});

describe("read-only details", () => {
  const html = renderToStaticMarkup(<FullLifetimeIdeationIntensityDetails responses={sample()} />);

  it("matches the edited payload", () => {
    expect(html).toContain("Felt hopeless at age 12");
    expect(html).toContain("1 – Wish to Be Dead");
    expect(html).toContain("3 – Active Suicidal Ideation with a Method but No Plan or Intent");
    expect(html).toContain("0 – Does not attempt to control thoughts");
    expect(html).toContain("3 – Two to five times in a week");
    expect(html).toContain("Passive");
  });

  it("distinguishes not answered from not applicable, and shows no risk output", () => {
    expect(html).toContain("Not answered"); // e.g. unanswered Q4/Q5 and unrated items
    expect(html).toContain("Not applicable"); // e.g. Q3 Lifetime
    expect(html).not.toMatch(/Risk|total|sum/i);
  });

  it("omits Intensity when nothing qualifies", () => {
    const empty = renderToStaticMarkup(
      <FullLifetimeIdeationIntensityDetails responses={emptyFullLifetimeResponses()} />,
    );
    expect(empty).not.toContain("Intensity of Ideation");
  });
});
