// @vitest-environment jsdom
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import {
  ffResendBlock,
  resendFFReferenceRequest,
  setFFReferenceDeliveryAdapter,
  type FFReferenceRequestMessage,
} from "./ffReferenceRequests";
import {
  __reloadFFMentorApplicationsForTest,
  getFFMentorApplication,
  recordFFMentorApplicationSubmission,
} from "../data/ffMentorApplicationStore";
import { SEED_FF_MENTOR_APPLICATIONS } from "../data/mockFFMentorApplications";

// Mock delivery adapter only — no real email is ever sent from these tests.
const KEY = "mh.ffMentorApplications.v1";
const actor = { id: "staff-test", name: "Test Staff" };
let outbox: FFReferenceRequestMessage[] = [];

function setup() {
  const app = structuredClone(SEED_FF_MENTOR_APPLICATIONS[0]);
  app.applicationId = "T-REF";
  app.applicantId = "VOL-REF";
  app.references = [
    {
      id: "r1",
      relationship: "business",
      name: "Ok Ref",
      phone: "",
      email: "ok@example.org",
      permissionGranted: true,
      submitted: true,
      responseStatus: "awaiting",
    },
    {
      id: "r2",
      relationship: "personal",
      name: "No Perm",
      phone: "",
      email: "np@example.org",
      permissionGranted: false,
      submitted: true,
    },
    {
      id: "r3",
      relationship: "personal",
      name: "Bad Email",
      phone: "",
      email: "not-an-email",
      permissionGranted: true,
      submitted: true,
    },
    {
      id: "r4",
      relationship: "personal",
      name: "Done Ref",
      phone: "",
      email: "done@example.org",
      permissionGranted: true,
      submitted: true,
      responseStatus: "submitted",
    },
  ];
  expect(recordFFMentorApplicationSubmission(app)).toEqual({
    ok: true,
  });
}
const staff = () => {
  const r = getFFMentorApplication("T-REF");
  if (r.status !== "found") throw new Error(r.status);
  return r;
};

beforeEach(() => {
  localStorage.clear();
  __reloadFFMentorApplicationsForTest();
  outbox = [];
  setup();
});
afterEach(() => setFFReferenceDeliveryAdapter(null));

describe("resend reference request", () => {
  it("with no delivery service, nothing is sent or recorded", async () => {
    expect(
      await resendFFReferenceRequest("T-REF", "r1", actor),
    ).toEqual({ ok: false, reason: "not_configured" });
    expect(staff().staff.referenceRequests).toEqual({});
  });

  it("requires confirmed permission and a valid email", async () => {
    setFFReferenceDeliveryAdapter({
      send: async (m) => (
        outbox.push(m),
        { status: "delivered" }
      ),
    });
    expect(
      await resendFFReferenceRequest("T-REF", "r2", actor),
    ).toEqual({ ok: false, reason: "no-permission" });
    expect(
      await resendFFReferenceRequest("T-REF", "r3", actor),
    ).toEqual({ ok: false, reason: "invalid-email" });
    expect(
      ffResendBlock({
        permissionGranted: undefined,
        email: "a@b.co",
      }),
    ).toBe("no-permission");
    expect(outbox).toHaveLength(0);
  });

  it("a confirmed delivery is recorded for the exact reference; response status unchanged", async () => {
    setFFReferenceDeliveryAdapter({
      send: async (m) => (
        outbox.push(m),
        { status: "delivered", messageId: "m-1" }
      ),
    });
    const before = structuredClone(staff().application);
    expect(
      await resendFFReferenceRequest("T-REF", "r1", actor),
    ).toEqual({
      ok: true,
      outcome: "delivered",
      tracked: true,
    });
    expect(outbox).toEqual([
      expect.objectContaining({
        applicationId: "T-REF",
        referenceId: "r1",
        to: "ok@example.org",
      }),
    ]);
    __reloadFFMentorApplicationsForTest();
    const { application, staff: s } = staff();
    expect(application).toEqual(before);
    expect(s.referenceRequests.r1).toEqual([
      expect.objectContaining({
        outcome: "delivered",
        by: "Test Staff",
        byId: "staff-test",
        messageId: "m-1",
      }),
    ]);
    expect(s.referenceRequests.r4).toBeUndefined();
    expect(s.referenceResponses).toEqual({});
  });

  it("resending to a reference that already responded keeps the response", async () => {
    setFFReferenceDeliveryAdapter({
      send: async () => ({ status: "accepted" }),
    });
    expect(
      await resendFFReferenceRequest("T-REF", "r4", actor),
    ).toEqual({ ok: true, outcome: "accepted", tracked: true });
    expect(
      staff().application.references[3].responseStatus,
    ).toBe("submitted");
    expect(staff().staff.referenceRequests.r4[0].outcome).toBe(
      "accepted",
    );
  });

  it("a failed send records nothing", async () => {
    setFFReferenceDeliveryAdapter({
      send: async () => ({ status: "failed", error: "bounce" }),
    });
    expect(
      await resendFFReferenceRequest("T-REF", "r1", actor),
    ).toEqual({ ok: false, reason: "send-failed" });
    setFFReferenceDeliveryAdapter({
      send: async () => {
        throw new Error("network");
      },
    });
    expect(
      await resendFFReferenceRequest("T-REF", "r1", actor),
    ).toEqual({ ok: false, reason: "send-failed" });
    expect(staff().staff.referenceRequests).toEqual({});
  });

  it("a second click while sending is refused; only one message goes out", async () => {
    let release!: () => void;
    setFFReferenceDeliveryAdapter({
      send: (m) =>
        new Promise((res) => {
          outbox.push(m);
          release = () => res({ status: "delivered" });
        }),
    });
    const first = resendFFReferenceRequest(
      "T-REF",
      "r1",
      actor,
    );
    expect(
      await resendFFReferenceRequest("T-REF", "r1", actor),
    ).toEqual({ ok: false, reason: "in-progress" });
    release();
    expect(await first).toMatchObject({ ok: true });
    expect(outbox).toHaveLength(1);
  });

  it("sent but not recorded is reported as sent with tracked=false", async () => {
    setFFReferenceDeliveryAdapter({
      send: async () => {
        Storage.prototype.setItem = () => {
          throw new Error("quota");
        };
        return { status: "delivered" };
      },
    });
    const orig = Storage.prototype.setItem;
    try {
      expect(
        await resendFFReferenceRequest("T-REF", "r1", actor),
      ).toEqual({
        ok: true,
        outcome: "delivered",
        tracked: false,
      });
    } finally {
      Storage.prototype.setItem = orig;
    }
    expect(
      JSON.parse(localStorage.getItem(KEY)!).staff?.["T-REF"]
        ?.referenceRequests ?? {},
    ).toEqual({});
  });

  it("a declined reference can't be resent", async () => {
    setFFReferenceDeliveryAdapter({
      send: async (m) => (
        outbox.push(m),
        { status: "delivered" }
      ),
    });
    expect(
      ffResendBlock({
        permissionGranted: true,
        email: "a@b.co",
        responseStatus: "declined",
      }),
    ).toBe("declined");
    expect(outbox).toHaveLength(0);
  });

  it("missing actor or reference is refused", async () => {
    setFFReferenceDeliveryAdapter({
      send: async () => ({ status: "delivered" }),
    });
    expect(
      await resendFFReferenceRequest("T-REF", "r1", null),
    ).toEqual({ ok: false, reason: "actor" });
    expect(
      await resendFFReferenceRequest("T-REF", "nope", actor),
    ).toEqual({ ok: false, reason: "missing" });
    expect(
      await resendFFReferenceRequest("VMS-9999", "r1", actor),
    ).toEqual({ ok: false, reason: "missing" });
  });
});