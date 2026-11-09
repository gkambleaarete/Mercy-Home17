// @vitest-environment jsdom
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CategoryCommentsPopover } from "./CategoryCommentsPopover";
import { AdmissionsCategoryNotice } from "./AdmissionsCategoryNotice";
import { AdmissionsCategoryBadge } from "./AdmissionsCategoryBadge";
import { AdmissionsStageBadge } from "./AdmissionsStageBadge";
import type { AdmissionsCategoryChange } from "../../data/admissionsCategoryStore";

const entry = (
  n: number,
  over: Partial<AdmissionsCategoryChange> = {},
): AdmissionsCategoryChange => ({
  id: `CC-${String(n).padStart(6, "0")}`,
  admissionId: "L-001",
  previousCategory: "Referral",
  newCategory: "Delayed",
  comment: `comment ${n}`,
  changedAt: new Date(2026, 0, n, 9).toISOString(),
  ...over,
});
const html = (history: AdmissionsCategoryChange[]) =>
  renderToStaticMarkup(
    createElement(CategoryCommentsPopover, {
      youthName: "Ada <b>Lovelace</b>",
      history,
    }),
  );

describe("CategoryCommentsPopover trigger", () => {
  it("renders nothing when there is no history", () => {
    expect(html([])).toBe("");
  });

  it("is a labelled button naming the youth and the comment count, with a visible '1 comment' / 'N comments'", () => {
    const one = html([entry(1)]);
    expect(one).toContain("<button");
    expect(one).toContain(
      'aria-label="View category change comments for Ada &lt;b&gt;Lovelace&lt;/b&gt;, 1 comment"',
    );
    expect(one).toContain(">1 comment<");
    const many = html([entry(1), entry(2), entry(3)]);
    expect(many).toContain(
      'aria-label="View category change comments for Ada &lt;b&gt;Lovelace&lt;/b&gt;, 3 comments"',
    );
    expect(many).toContain(">3 comments<");
  });

  it("starts closed, so no comment text is in the page until opened", () => {
    expect(html([entry(1, { comment: "secret text" })])).not.toContain("secret text");
  });

  it("never renders HTML from names or comments", () => {
    expect(html([entry(1)])).not.toContain("<b>Lovelace</b>");
  });
});

describe("AdmissionsCategoryNotice", () => {
  const out = (error: "corrupt" | "unsupported-version" | null) =>
    renderToStaticMarkup(createElement(AdmissionsCategoryNotice, { error }));
  it("renders nothing when categories were read", () => {
    expect(out(null)).toBe("");
  });
  it("says the shown categories are not the saved ones", () => {
    for (const e of ["corrupt", "unsupported-version"] as const) {
      const text = out(e);
      expect(text).toContain('role="alert"');
      expect(text).toContain("not your saved changes");
    }
  });
});

describe("AdmissionsCategoryBadge", () => {
  const badge = (category: string) =>
    renderToStaticMarkup(
      createElement(AdmissionsCategoryBadge, { category }),
    );
  it("gives each Pipeline category its own design-system tone", () => {
    expect(badge("Program Waitlist")).toContain("bg-[#e6f4ea]"); // success (green)
    expect(badge("Delayed")).toContain("bg-[#fce4ec]"); // error (red)
    expect(badge("Info Session Scheduled")).toContain("bg-[#e0f2fe]"); // info (blue)
    expect(badge("Referral")).toContain("bg-purple-100"); // purple
    expect(badge("Closed")).toContain("bg-[#f3f2f2]"); // neutral
  });
  it("keeps an unknown category neutral and shows its text", () => {
    const out = badge("Something Else");
    expect(out).toContain("bg-[#f3f2f2]");
    expect(out).toContain("Something Else");
  });
});

describe("AdmissionsStageBadge", () => {
  const badge = (stage: string) =>
    renderToStaticMarkup(createElement(AdmissionsStageBadge, { stage }));
  it("gives each pipeline stage its design-system tone", () => {
    expect(badge("Referral")).toContain("bg-[#f3f2f2]"); // neutral
    expect(badge("Info Session")).toContain("bg-purple-100");
    expect(badge("Assessments")).toContain("color-brand-accent"); // orange
    expect(badge("Staffing")).toContain("bg-[#e0f2fe]"); // info
    expect(badge("Move-In")).toContain("bg-[#e6f4ea]"); // success
    expect(badge("Shadow & FPM")).toContain("neutral-base-10"); // dark
  });
  it("keeps an unknown stage neutral and shows its text", () => {
    const out = badge("Something Else");
    expect(out).toContain("bg-[#f3f2f2]");
    expect(out).toContain("Something Else");
  });
});