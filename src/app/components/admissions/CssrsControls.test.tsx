// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DescriptionField,
  ReadOnlyResponse,
  YesNoQuestionGroup,
} from "./CssrsControls";

const idsOf = (html: string) =>
  [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);

describe("CssrsControls", () => {
  const periods = [
    { key: "lifetime", label: "Lifetime" },
    { key: "past1Month", label: "Past 1 Month" },
  ];

  it("gives every question and period unique control ids", () => {
    const html = ["a", "b"]
      .map((p) =>
        renderToStaticMarkup(
          <YesNoQuestionGroup
            idPrefix={`q-${p}`}
            question="Question"
            help="Help"
            periods={periods}
            value={{
              lifetime: "unanswered",
              past1Month: "unanswered",
            }}
            onChange={() => {}}
          />,
        ),
      )
      .join("");
    const ids = idsOf(html);
    expect(ids.length).toBeGreaterThan(8);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("leaves both radios unselected when unanswered, selects only the answer", () => {
    const render = (value: "yes" | "no" | "unanswered") =>
      renderToStaticMarkup(
        <YesNoQuestionGroup
          idPrefix="q"
          question="Question"
          periods={[{ key: "lifetime" }]}
          value={{ lifetime: value }}
          onChange={() => {}}
        />,
      );
    expect(render("unanswered")).not.toMatch(
      /aria-checked="true"/,
    );
    const checked = (html: string, id: string) =>
      html.match(
        new RegExp(
          `<button[^>]*aria-checked="(true|false)"[^>]*id="${id}"`,
        ),
      )?.[1];
    const no = render("no");
    expect(checked(no, "q-lifetime-no")).toBe("true");
    expect(checked(no, "q-lifetime-yes")).toBe("false");
  });

  it("labels each group by its question and period", () => {
    const html = renderToStaticMarkup(
      <YesNoQuestionGroup
        idPrefix="q"
        question="Question"
        periods={periods}
        value={{}}
        onChange={() => {}}
      />,
    );
    expect(html).toContain(
      'aria-labelledby="q-question q-lifetime-label"',
    );
    expect(html).toContain(
      'aria-labelledby="q-question q-past1Month-label"',
    );
  });

  it("links the description label and help text", () => {
    const html = renderToStaticMarkup(
      <DescriptionField
        id="d"
        label="Description"
        value=""
        onChange={() => {}}
        help="Hint"
      />,
    );
    expect(html).toContain('for="d"');
    expect(html).toContain('aria-describedby="d-help"');
    expect(html).toContain('id="d-help"');
  });

  it("read-only display distinguishes 0, No and not answered", () => {
    const show = (
      v: Parameters<typeof ReadOnlyResponse>[0]["value"],
    ) =>
      renderToStaticMarkup(
        <ReadOnlyResponse label="L" value={v} />,
      );
    expect(show(0)).toContain(">0<");
    expect(show("no")).toContain(">No<");
    expect(show("unanswered")).toContain("Not answered");
    expect(show(null)).toContain("Not answered");
  });
});