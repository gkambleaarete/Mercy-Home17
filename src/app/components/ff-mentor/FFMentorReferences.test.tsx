// @vitest-environment jsdom
// Mock delivery adapter only — no real email is sent.
import { afterEach, beforeEach, expect, it } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { FFMentorReferences } from "./FFMentorReferences";
import {
  __reloadFFMentorApplicationsForTest,
  recordFFMentorApplicationSubmission,
  useFFMentorApplication,
} from "../../data/ffMentorApplicationStore";
import {
  setFFReferenceDeliveryAdapter,
  type FFDeliveryResult,
} from "../../lib/ffReferenceRequests";
import { SEED_FF_MENTOR_APPLICATIONS } from "../../data/mockFFMentorApplications";
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function Wrapper() {
  const r = useFFMentorApplication("T-UI");
  return r.status === "found" ? (
    <FFMentorReferences app={r.application} staff={r.staff} />
  ) : (
    <p>missing</p>
  );
}
let el: HTMLDivElement, root: any, sent: number;
const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
const btn = () =>
  el.querySelector(
    '[aria-label="Resend request to Ok Ref"]',
  ) as HTMLButtonElement;
beforeEach(() => {
  localStorage.clear();
  __reloadFFMentorApplicationsForTest();
  sent = 0;
  const app = structuredClone(SEED_FF_MENTOR_APPLICATIONS[0]);
  Object.assign(app, {
    applicationId: "T-UI",
    applicantId: "VOL-UI",
    subPrograms: ["work"],
  });
  app.references = [
    {
      id: "r1",
      relationship: "personal",
      name: "Ok Ref",
      phone: "",
      email: "ok@example.org",
      permissionGranted: true,
      submitted: true,
      responseStatus: "awaiting",
    },
  ];
  recordFFMentorApplicationSubmission(app);
});
afterEach(() => {
  act(() => root.unmount());
  el.remove();
  setFFReferenceDeliveryAdapter(null);
});
const render = () => {
  el = document.createElement("div");
  document.body.appendChild(el);
  root = createRoot(el);
  act(() => root.render(<Wrapper />));
};
const adapterReturning = (
  res: FFDeliveryResult | (() => FFDeliveryResult),
) =>
  setFFReferenceDeliveryAdapter({
    send: async () => {
      sent++;
      return typeof res === "function" ? res() : res;
    },
  });

it("delivered: recorded, shown as delivered, response status unchanged", async () => {
  adapterReturning({ status: "delivered" });
  render();
  await act(async () => btn().click());
  await flush();
  expect(sent).toBe(1);
  expect(el.textContent).toContain("Last request delivered");
  expect(el.textContent).toContain("Awaiting Response");
  expect(el.textContent).toContain("References Received0");
});
it("accepted only: not claimed as delivered", async () => {
  adapterReturning({ status: "accepted" });
  render();
  await act(async () => btn().click());
  await flush();
  expect(el.textContent).toContain(
    "Last request accepted for delivery",
  );
  expect(el.textContent).not.toContain(
    "Last request delivered",
  );
});
it("failure: error shown, nothing recorded", async () => {
  adapterReturning({ status: "failed" });
  render();
  await act(async () => btn().click());
  await flush();
  expect(el.textContent).toContain(
    "The request could not be sent",
  );
  expect(el.textContent).not.toContain("Last request");
});
it("double click sends once and button is disabled while sending", async () => {
  let release!: () => void;
  setFFReferenceDeliveryAdapter({
    send: () =>
      new Promise((res) => {
        sent++;
        release = () => res({ status: "delivered" });
      }),
  });
  render();
  await act(async () => {
    btn().click();
    btn().click();
  });
  expect(btn().disabled).toBe(true);
  expect(btn().textContent).toBe("Sending…");
  await act(async () => release());
  await flush();
  expect(sent).toBe(1);
});
it("sent but tracking failed: says it was sent and warns not to resend", async () => {
  const orig = Storage.prototype.setItem;
  adapterReturning(() => {
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
    return { status: "delivered" };
  });
  render();
  try {
    await act(async () => btn().click());
    await flush();
  } finally {
    Storage.prototype.setItem = orig;
  }
  expect(el.textContent).toContain(
    "Delivered to ok@example.org.",
  );
  expect(el.textContent).toContain("don't resend");
  expect(el.textContent).not.toContain("could not be sent");
});