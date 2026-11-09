// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FullLifetimeIdeationIntensityDetails } from "./CssrsFullLifetimeSections";
import { setIdeationAnswer } from "../../data/cssrsFullLifetime";
import { emptyFullLifetimeResponses } from "../../data/cssrsTypes";

const render = (r: ReturnType<typeof emptyFullLifetimeResponses>) => {
  const el = document.createElement("div");
  el.innerHTML = renderToStaticMarkup(<FullLifetimeIdeationIntensityDetails responses={r} />);
  return el;
};
/** Text of one question-and-period cell. Fails loudly if the cell is missing. */
const cell = (root: HTMLElement, question: string, period: string) => {
  const el = root.querySelector(`[data-question="${question}"] [data-period="${period}"]`);
  if (!el) throw new Error(`no cell for ${question} / ${period}`);
  return el.textContent ?? "";
};

describe("read-only: Not answered vs Not applicable, per question and period", () => {
  it("Q4: Past 1 Month is applicable but unanswered; Lifetime is not applicable", () => {
    let r = emptyFullLifetimeResponses();
    r = setIdeationAnswer(r, "wishToBeDead", "lifetime", "yes");
    r = setIdeationAnswer(r, "nonSpecificActiveThoughts", "lifetime", "no"); // Lifetime Q3–Q5 do not apply
    r = setIdeationAnswer(r, "wishToBeDead", "past1Month", "no");
    r = setIdeationAnswer(r, "nonSpecificActiveThoughts", "past1Month", "yes"); // Q3–Q5 apply
    r = setIdeationAnswer(r, "methodsWithoutPlan", "past1Month", "yes");
    // Q4 Past 1 Month deliberately left unanswered.
    const root = render(r);
    const past = cell(root, "intentWithoutPlan", "past1Month");
    const life = cell(root, "intentWithoutPlan", "lifetime");
    expect(past).toContain("Not answered");
    expect(past).not.toContain("Not applicable");
    expect(life).toContain("Not applicable");
    expect(life).not.toContain("Not answered");
    // The answered neighbour shows its real answer, not a placeholder.
    const q3 = cell(root, "methodsWithoutPlan", "past1Month");
    expect(q3).toContain("Yes");
    expect(q3).not.toContain("Not answered");
  });

  it("Frequency: Lifetime is applicable but unrated; Recent is not applicable", () => {
    let r = emptyFullLifetimeResponses();
    r = setIdeationAnswer(r, "wishToBeDead", "lifetime", "yes"); // Lifetime Intensity applies
    r = setIdeationAnswer(r, "wishToBeDead", "past1Month", "no");
    r = setIdeationAnswer(r, "nonSpecificActiveThoughts", "past1Month", "no"); // Recent does not
    r.intensity.duration.lifetime = 3; // an answered rating, for contrast
    const root = render(r);
    const lifetime = cell(root, "frequency", "lifetime");
    const recent = cell(root, "frequency", "recent");
    expect(lifetime).toContain("Not answered");
    expect(lifetime).not.toContain("Not applicable");
    expect(recent).toContain("Not applicable");
    expect(recent).not.toContain("Not answered");
    const duration = cell(root, "duration", "lifetime");
    expect(duration).toContain("3 – One to four hours or a lot of the time");
    expect(duration).not.toContain("Not answered");
  });

  it("the cell lookup fails (is not vacuous) for a cell that does not exist", () => {
    expect(() => cell(render(emptyFullLifetimeResponses()), "intentWithPlan", "lifetime")).toThrow(/no cell/);
  });
});
