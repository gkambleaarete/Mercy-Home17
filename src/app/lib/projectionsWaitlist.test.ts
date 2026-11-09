import { describe, expect, it } from "vitest";
import {
  PROJECTION_CODES,
  RESIDENTIAL_HOMES,
  type ProgramEnrollment,
  type ResidentialHome,
  type WaitlistCandidate,
} from "../../src/app/data/mockProjectionsWaitlistData";
import {
  PROJECTIONS_ROLES,
  buildBedProjections,
  filterWaitlist,
  formatOccupancy,
  getActiveWaitlist,
  getProjectionMonths,
  getProjectionsPermissions,
  overrideKey,
  referralRangeError,
  sortWaitlist,
  type WaitlistCriteria,
} from "../../src/app/lib/projectionsWaitlist";
import {
  getCandidateFullProfile,
  getResidentFullProfile,
} from "../../src/app/lib/youthIdentity";

// Fixed clock: 10/16/2026 → window Oct 2026 … Mar 2027.
const TODAY = new Date(2026, 9, 16);
const TODAY_ISO = "2026-10-16";
const months = getProjectionMonths(TODAY);

const HOMES: ResidentialHome[] = [
  {
    id: "fx",
    name: "Fixture Home",
    campus: "West Loop",
    defaultCapacity: 10,
  },
  {
    id: "src",
    name: "Source Home",
    campus: "West Loop",
    defaultCapacity: 4,
  },
  {
    id: "walsh",
    name: "Walsh Home",
    campus: "Walsh",
    defaultCapacity: 3,
  },
];

const enr = (
  id: string,
  homeId: string,
  moveIn = "2026-01-01",
  extra: Partial<ProgramEnrollment> = {},
): ProgramEnrollment => ({
  id,
  youthName: `Youth ${id}`,
  dateOfBirth: "2010-01-01",
  homeId,
  actualMoveInDate: moveIn,
  ...extra,
});

const cand = (
  id: string,
  extra: Partial<WaitlistCandidate> = {},
): WaitlistCandidate => ({
  id,
  name: `Cand ${id}`,
  dateOfBirth: "2011-01-01",
  ageGroup: "High School",
  youthType: "External",
  category: "Program Waitlist",
  categoryEnteredAt: "2026-09-01",
  caseManager: "Sarah Williams",
  referralDate: "2026-08-01",
  grade: "",
  guardianshipDetails: "",
  medicalNotes: "",
  comments: "",
  history: [],
  ...extra,
});

/** 10 beds, 5 residents, 2 incoming internal transitions, 1 applicant. */
function fixture(
  over: Partial<Parameters<typeof buildBedProjections>[0]> = {},
) {
  return buildBedProjections({
    months,
    enrollments: [
      ...["r1", "r2", "r3", "r4", "r5"].map((id) =>
        enr(id, "fx"),
      ),
      enr("t1", "src"),
      enr("t2", "src"),
    ],
    candidates: [
      cand("C1", {
        anticipatedProgram: "fx",
        anticipatedMoveInDate: "2026-10-20",
      }),
    ],
    residentPlans: {
      t1: {
        status: "Transitioning",
        anticipatedProgram: "fx",
        anticipatedMoveInDate: "2026-10-25",
        history: [],
      },
      t2: {
        status: "Active",
        anticipatedProgram: "fx",
        anticipatedMoveInDate: "2026-10-28",
        history: [],
      },
    },
    ranks: {},
    overrides: {},
    capacitySnapshots: [],
    todayIso: TODAY_ISO,
    homes: HOMES,
    ...over,
  });
}
const home = (p: ReturnType<typeof fixture>, id: string) =>
  p.campuses
    .flatMap((c) => c.homes)
    .find((h) => h.home.id === id)!;

describe("occupancy codes", () => {
  it("offers exactly the five revised codes and labels", () => {
    expect(PROJECTION_CODES).toEqual([
      { code: "S", label: "Stay in Program" },
      { code: "LV", label: "Agency Discharge" },
      { code: "T", label: "Internal Transition" },
      { code: "X", label: "Open Bed" },
      { code: "?", label: "Unsure of Plans" },
    ]);
  });

  it("only Admissions Team can edit codes; Admin keeps other write rights", () => {
    const p = Object.fromEntries(
      PROJECTIONS_ROLES.map((r) => [
        r,
        getProjectionsPermissions(r),
      ]),
    );
    expect(p["Admissions Team"]).toEqual({
      canEditProjections: true,
      canEditWaitlist: true,
      canEditOccupancyCodes: true,
    });
    expect(p["System Administrator"]).toEqual({
      canEditProjections: true,
      canEditWaitlist: true,
      canEditOccupancyCodes: false,
    });
    for (const r of [
      "Program Director",
      "Campus Leadership",
      "Quality Improvement",
    ] as const)
      expect(p[r]).toEqual({
        canEditProjections: false,
        canEditWaitlist: false,
        canEditOccupancyCodes: false,
      });
  });

  it("planning edits (Transitioning, Anticipated Program/date) never rewrite codes", () => {
    const p = fixture();
    const t1 = home(p, "src").youth.find(
      (y) => y.key === "enr:t1",
    )!;
    expect(t1.codes).toEqual(["S", "S", "S", "S", "S", "S"]);
    expect(t1.codeSources.every((s) => s === "seed")).toBe(
      true,
    );
    // The plan stays visible with the youth in the SOURCE Program.
    expect(t1.transitionToHomeId).toBe("fx");
    expect(t1.transitioning).toBe(true);
  });

  it("a staff T / LV code shows on the source row and releases the bed", () => {
    const p = fixture({
      overrides: {
        [overrideKey("enr:t1", months[0].key)]: "T",
        [overrideKey("enr:r1", months[0].key)]: "LV",
      },
    });
    const src = home(p, "src");
    const t1 = src.youth.find((y) => y.key === "enr:t1")!;
    expect(t1.codes[0]).toBe("T");
    expect(t1.codeSources[0]).toBe("staff");
    expect(t1.plannedTransition).toBe(true);
    expect(src.occupiedResidents[0]).toBe(1);
    expect(src.occupiedResidents[1]).toBe(2); // codes don't carry forward
    const fx = home(p, "fx");
    expect(
      fx.youth.find((y) => y.key === "enr:r1")!
        .plannedDischarge,
    ).toBe(true);
    expect(fx.occupiedResidents[0]).toBe(4);
    expect(fx.open[0]).toBe(3);
  });
});

describe("availability vs occupancy", () => {
  it("10 beds / 5 residents / 2 reserved / 1 anticipated → 2 open, 50.00%", () => {
    const fx = home(fixture(), "fx");
    expect(fx.capacity[0]).toBe(10);
    expect(fx.occupiedResidents[0]).toBe(5);
    expect(fx.reserved[0]).toBe(2);
    expect(fx.anticipated[0]).toBe(1);
    expect(fx.open[0]).toBe(2);
    expect(fx.overcommitted[0]).toBe(0);
    expect(
      formatOccupancy(fx.occupiedResidents[0], fx.capacity[0]),
    ).toBe("50.00%");
  });

  it("campus and agency totals use the same derivation", () => {
    const p = fixture();
    const wl = p.campuses.find(
      (c) => c.campus === "West Loop",
    )!;
    // fx (10 cap, 5 res, 2 R, 1 A) + src (4 cap, 2 res still coded S)
    expect(wl.capacity[0]).toBe(14);
    expect(wl.occupiedResidents[0]).toBe(7);
    expect(wl.reserved[0]).toBe(2);
    expect(wl.anticipated[0]).toBe(1);
    expect(wl.open[0]).toBe(4);
    expect(p.agency.capacity[0]).toBe(17);
    expect(p.agency.open[0]).toBe(7);
    expect(
      formatOccupancy(
        p.agency.occupiedResidents[0],
        p.agency.capacity[0],
      ),
    ).toBe("41.18%");
  });

  it("commitments count from the move month (provisional policy)", () => {
    const fx = home(
      fixture({
        candidates: [
          cand("C1", {
            anticipatedProgram: "fx",
            anticipatedMoveInDate: "2026-12-05",
          }),
        ],
      }),
      "fx",
    );
    expect(fx.anticipated.slice(0, 3)).toEqual([0, 0, 1]);
  });

  it("cancellation and closure update counts immediately", () => {
    const cancelled = home(
      fixture({ candidates: [cand("C1")] }),
      "fx",
    );
    expect(cancelled.anticipated[0]).toBe(0);
    expect(cancelled.open[0]).toBe(3);
    const closed = home(
      fixture({ closedCaseIds: new Set(["C1"]) }),
      "fx",
    );
    expect(closed.anticipated[0]).toBe(0);
    expect(closed.youth.some((y) => y.key === "cand:C1")).toBe(
      false,
    );
  });

  it("choosing the current Program reserves nothing", () => {
    const p = fixture({
      residentPlans: {
        r1: {
          status: "Active",
          anticipatedProgram: "fx",
          anticipatedMoveInDate: "2026-10-25",
          history: [],
        },
      },
    });
    const fx = home(p, "fx");
    expect(fx.reserved[0]).toBe(0);
    expect(
      fx.youth.filter((y) => y.source.id === "r1"),
    ).toHaveLength(1);
  });

  it("never double counts one youth in a Program/month", () => {
    // A candidate who is already enrolled here (lead L-9) is not projected.
    const p = fixture({
      enrollments: [
        enr("r1", "fx", "2026-01-01", { leadId: "L-9" }),
      ],
      candidates: [
        cand("L-9", {
          anticipatedProgram: "fx",
          anticipatedMoveInDate: "2026-10-20",
        }),
      ],
      residentPlans: {},
    });
    const fx = home(p, "fx");
    expect(
      fx.occupiedResidents[0] +
        fx.reserved[0] +
        fx.anticipated[0],
    ).toBe(1);
  });

  it("overcommitment is reported, Open never goes negative", () => {
    const p = fixture({
      enrollments: Array.from({ length: 9 }, (_, i) =>
        enr(`r${i}`, "fx"),
      ),
      candidates: [
        cand("C1", {
          anticipatedProgram: "fx",
          anticipatedMoveInDate: "2026-10-20",
        }),
        cand("C2", {
          anticipatedProgram: "fx",
          anticipatedMoveInDate: "2026-10-20",
        }),
      ],
      residentPlans: {},
    });
    const fx = home(p, "fx");
    expect(fx.open[0]).toBe(0);
    expect(fx.overcommitted[0]).toBe(1);
    expect(
      fx.youth.filter((y) => y.kind === "anticipated"),
    ).toHaveLength(2);
  });

  it("zero capacity is coherent", () => {
    const p = fixture({
      homes: [
        {
          id: "fx",
          name: "Zero",
          campus: "Walsh",
          defaultCapacity: 0,
        },
      ],
      enrollments: [],
      residentPlans: {},
    });
    const fx = home(p, "fx");
    expect(fx.open[0]).toBe(0);
    expect(fx.overcommitted[0]).toBe(1);
    expect(formatOccupancy(0, 0)).toBe("0.00%");
  });
});

describe("ordering", () => {
  it("residents sort by actual move-in date with a stable tie-breaker", () => {
    const p = fixture({
      enrollments: [
        enr("b", "fx", "2026-05-01"),
        enr("a", "fx", "2026-02-01"),
        enr("d", "fx", "2026-05-01"),
        enr("c", "fx", "2026-03-01"),
      ],
      residentPlans: {},
    });
    expect(
      home(p, "fx")
        .youth.filter((y) => y.kind === "resident")
        .map((y) => y.source.id),
    ).toEqual(["a", "c", "b", "d"]);
  });

  it("manual ranks of anticipated youth are preserved", () => {
    const p = fixture({
      ranks: { "cand:C1": 1, "xfer:t2": 2, "xfer:t1": 3 },
    });
    expect(
      home(p, "fx")
        .youth.filter((y) => y.kind === "anticipated")
        .map((y) => y.key),
    ).toEqual(["cand:C1", "xfer:t2", "xfer:t1"]);
  });

  it("default waitlist order stays Referral Date ascending; priority bump still works", () => {
    const list = [
      cand("A", { referralDate: "2026-03-01" }),
      cand("B", { referralDate: "2026-01-01" }),
      cand("C", {
        referralDate: "2026-02-01",
        priorityRank: "High",
      }),
    ];
    expect(
      sortWaitlist(list, "referral").map((c) => c.id),
    ).toEqual(["B", "C", "A"]);
    expect(
      sortWaitlist(list, "priority").map((c) => c.id),
    ).toEqual(["C", "B", "A"]);
  });
});

describe("waitlist filters", () => {
  const base: WaitlistCriteria = {
    search: "",
    ageGroup: "all",
    category: "all",
    caseManager: "all",
    youthType: "all",
    referralFrom: "",
    referralTo: "",
  };
  const list = [
    cand("A", {
      referralDate: "2026-01-10",
      youthType: "Readmit",
      ageGroup: "Middle School",
      caseManager: "David Chen",
    }),
    cand("B", {
      referralDate: "2026-02-10",
      youthType: "External",
      ageGroup: "Middle School",
      caseManager: "David Chen",
    }),
    cand("C", {
      referralDate: "2026-03-10",
      youthType: "Readmit",
      ageGroup: "High School",
    }),
  ];
  it("inclusive Referral Date range combined with type/age/manager", () => {
    expect(
      filterWaitlist(list, {
        ...base,
        referralFrom: "2026-01-10",
        referralTo: "2026-02-10",
      }).map((c) => c.id),
    ).toEqual(["A", "B"]);
    expect(
      filterWaitlist(list, {
        ...base,
        youthType: "Readmit",
      }).map((c) => c.id),
    ).toEqual(["A", "C"]);
    expect(
      filterWaitlist(list, {
        ...base,
        youthType: "Readmit",
        ageGroup: "Middle School",
        caseManager: "David Chen",
        referralFrom: "2026-01-01",
      }).map((c) => c.id),
    ).toEqual(["A"]);
    expect(filterWaitlist(list, base)).toHaveLength(3); // reset = defaults
  });
  it("an inverted range is reported and not applied", () => {
    expect(
      referralRangeError("2026-03-01", "2026-01-01"),
    ).not.toBe("");
    expect(referralRangeError("2026-01-01", "2026-01-01")).toBe(
      "",
    );
    expect(
      filterWaitlist(list, {
        ...base,
        referralFrom: "2026-03-01",
        referralTo: "2026-01-01",
      }),
    ).toHaveLength(3);
  });
});

describe("closure leaves the active waitlist immediately", () => {
  it("excludes Closed and in-closure cases", () => {
    const list = [
      cand("A"),
      cand("B", { category: "Closed" }),
      cand("C"),
    ];
    expect(
      getActiveWaitlist(list, [], new Set(["C"])).map(
        (c) => c.id,
      ),
    ).toEqual(["A"]);
  });
});

describe("Program choices", () => {
  it("Quille exists once, under West Loop, and every Program is offered", () => {
    const quille = RESIDENTIAL_HOMES.filter(
      (h) => h.id === "quille",
    );
    expect(quille).toHaveLength(1);
    expect(quille[0].campus).toBe("West Loop");
    expect(
      new Set(RESIDENTIAL_HOMES.map((h) => h.campus)),
    ).toEqual(new Set(["West Loop", "Walsh"]));
  });
});

describe("Full Profile links", () => {
  it("candidates resolve only to real Admissions cases", () => {
    expect(getCandidateFullProfile("L-001")).toEqual({
      path: "/?leadId=L-001",
      target: "Admissions profile",
    });
    expect(getCandidateFullProfile("W-101")).toBeNull();
  });
  it("residents resolve via explicit Constituent or lead links only", () => {
    expect(getResidentFullProfile({ leadId: "L-010" })).toEqual(
      { path: "/?leadId=L-010", target: "Admissions profile" },
    );
    expect(
      getResidentFullProfile({ constituentId: 1 }),
    ).toEqual({
      path: "/constituents/1",
      target: "Constituent profile",
    });
    expect(
      getResidentFullProfile({ constituentId: 999999 }),
    ).toBeNull();
    expect(getResidentFullProfile({})).toBeNull();
  });
});