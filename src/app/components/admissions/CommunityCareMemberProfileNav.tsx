import { useState } from "react";
import { ChevronDown, ChevronUp } from "@/app/lib/lucide-icons";

// Left navigation for a Community Care Member's profile (shared constituent
// profile, LeadDetailView). Seven top-level items in this order; every child
// opens the screen LeadDetailView already renders for that tab id. Styling and
// the active state match the existing profile sidebar.

type Item = {
  key: string;
  label: string;
  /** True when this child is the current screen. */
  selected: boolean;
  onSelect: () => void;
  /** Nested items, shown while this child is selected. */
  children?: { key: string; label: string; selected: boolean; onSelect: () => void }[];
};

type Group = {
  key: string;
  label: string;
  /** Direct entries have no children. */
  direct?: { active: boolean; onSelect: () => void };
  active: boolean;
  items?: Item[];
};

export function CommunityCareMemberProfileNav({
  activeTab,
  setActiveTab,
  activeOverviewSection,
  setActiveOverviewSection,
  activeHealthSection,
  setActiveHealthSection,
  activeMedicationSection,
  setActiveMedicationSection,
  activeIncidentSection,
  setActiveIncidentSection,
  activeClinicalSection,
  setActiveClinicalSection,
  hasPass,
  ariaLabel = "Community Care Member sections",
  showReferrals = false,
}: {
  ariaLabel?: string;
  /** Treatment > Referrals (Constituents page only). */
  showReferrals?: boolean;
  activeTab: string;
  setActiveTab: (t: string) => void;
  activeOverviewSection: string;
  setActiveOverviewSection: (s: string) => void;
  activeHealthSection: string | null;
  setActiveHealthSection: (s: string) => void;
  activeMedicationSection: string | null;
  setActiveMedicationSection: (s: string) => void;
  activeIncidentSection: string | null;
  setActiveIncidentSection: (s: string) => void;
  activeClinicalSection: string;
  setActiveClinicalSection: (s: string) => void;
  hasPass: boolean;
}) {
  const [manual, setManual] = useState<Record<string, boolean>>({
    general: true,
  });

  const tab = (id: string) => activeTab === id;
  const go = (id: string, after?: () => void) => () => {
    setActiveTab(id);
    after?.();
  };

  const EDU_TABS = [
    "academics",
    "classes",
    "educationVocation",
    "financialLiteracy",
    "postSecondaryOptions",
    "specialty",
    "employment",
    "tutorMatches",
    "tutorScheduledSessions",
    "financialSupport",
  ];
  const edu = (id: string, label: string): Item => ({
    key: id,
    label,
    selected: tab(id),
    onSelect: go(id),
  });
  const clinical = (key: string, label: string) => ({
    key,
    label,
    selected: tab("clinical") && activeClinicalSection === key,
    onSelect: go("clinical", () => setActiveClinicalSection(key)),
  });
  const health = (key: string, label: string): Item => ({
    key,
    label,
    selected: tab("healthOverview") && activeHealthSection === key,
    onSelect: go("healthOverview", () => {
      setActiveHealthSection(key);
      if (key === "medication" && !activeMedicationSection)
        setActiveMedicationSection("prescriptions");
    }),
  });

  const groups: Group[] = [
    {
      key: "general",
      label: "General",
      active:
        tab("overview") ||
        tab("programEnrollment") ||
        tab("campusRestrictions"),
      items: [
        {
          key: "details",
          label: "Constituent Details",
          selected: tab("overview") && activeOverviewSection !== "pass",
          onSelect: go("overview", () => {
            if (activeOverviewSection === "pass")
              setActiveOverviewSection("constituent-details");
          }),
        },
        {
          key: "programEnrollment",
          label: "Program Enrollment",
          selected: tab("programEnrollment"),
          onSelect: go("programEnrollment"),
        },
        {
          key: "campusRestrictions",
          label: "Campus Restrictions",
          selected: tab("campusRestrictions"),
          onSelect: go("campusRestrictions"),
        },
        ...(hasPass
          ? [
              {
                key: "pass",
                label: "Pass",
                selected: tab("overview") && activeOverviewSection === "pass",
                onSelect: go("overview", () =>
                  setActiveOverviewSection("pass"),
                ),
              },
            ]
          : []),
      ],
    },
    {
      key: "education",
      label: "Education and Vocation",
      active: EDU_TABS.some(tab),
      items: [
        edu("academics", "Academics"),
        edu("educationVocation", "Credentials"),
        edu("classes", "Classes"),
        edu("employment", "Employment"),
        edu("financialLiteracy", "Financial Literacy"),
        edu("postSecondaryOptions", "Post Secondary Options"),
        edu("specialty", "Specialties"),
        edu("tutorMatches", "Tutor Matches"),
        edu("tutorScheduledSessions", "Tutor Scheduled Sessions"),
        ...(showReferrals ? [edu("financialSupport", "Financial Support")] : []),
      ],
    },
    {
      key: "treatment",
      label: "Treatment",
      active: tab("treatmentPlanning") || tab("itp") || tab("transitionSummary") || tab("referrals"),
      items: [
        {
          key: "treatmentPlanning",
          label: "Treatment Planning",
          selected: tab("treatmentPlanning"),
          onSelect: go("treatmentPlanning"),
        },
        {
          key: "itp",
          label: "ITP",
          selected: tab("itp"),
          onSelect: go("itp"),
        },
        {
          key: "transitionSummary",
          label: "Transition Summary",
          selected: tab("transitionSummary"),
          onSelect: go("transitionSummary"),
        },
        ...(showReferrals
          ? [
              {
                key: "referrals",
                label: "Referrals",
                selected: tab("referrals"),
                onSelect: go("referrals"),
              },
            ]
          : []),
      ],
    },
    {
      key: "incidents",
      label: "Incidents",
      active: tab("incidents"),
      direct: {
        active: tab("incidents"),
        onSelect: go("incidents", () => {
          if (!activeIncidentSection) setActiveIncidentSection("all");
        }),
      },
    },
    {
      key: "health",
      label: "Health Overview",
      active: tab("healthOverview"),
      items: [
        health("medication", "Medication"),
        health("physical", "Physical Health"),
        health("mental", "Mental Health"),
        health("substance", "Substance Use"),
      ],
    },
    {
      key: "testing",
      label: "Testing & Assessments",
      active: tab("testing"),
      direct: { active: tab("testing"), onSelect: go("testing") },
    },
    {
      key: "admissions",
      label: "Admissions",
      active:
        tab("admissionsAttempt") ||
        tab("caseDetails") ||
        tab("presentingNeeds") ||
        tab("clinical") ||
        tab("education") ||
        tab("determination"),
      items: [
        {
          key: "admissionsAttempt",
          label: "Admissions Attempt",
          selected: tab("admissionsAttempt"),
          onSelect: go("admissionsAttempt"),
        },
        {
          key: "caseDetails",
          label: "Case Details",
          selected: tab("caseDetails"),
          onSelect: go("caseDetails"),
        },
        {
          key: "presentingNeeds",
          label: "Presenting Needs",
          selected: tab("presentingNeeds"),
          onSelect: go("presentingNeeds"),
        },
        {
          key: "education",
          label: "Education & Career Snapshot",
          selected: tab("education"),
          onSelect: go("education"),
        },
        {
          key: "clinical",
          label: "Clinical Assessments",
          selected:
            tab("clinical") && activeClinicalSection !== "clinical-summary",
          onSelect: go("clinical", () =>
            setActiveClinicalSection(
              activeClinicalSection && activeClinicalSection !== "clinical-summary"
                ? activeClinicalSection
                : "health-medical",
            ),
          ),
          children: [
            clinical("health-medical", "Health & Medical History"),
            clinical("social-family", "Social & Family"),
            clinical("risk-legal", "Risk & Legal"),
          ],
        },
        {
          key: "clinicalSummary",
          label: "Clinical Summary",
          selected:
            tab("clinical") && activeClinicalSection === "clinical-summary",
          onSelect: go("clinical", () =>
            setActiveClinicalSection("clinical-summary"),
          ),
        },
        {
          key: "determination",
          label: "Determination",
          selected: tab("determination"),
          onSelect: go("determination"),
        },
      ],
    },
  ];

  const topClass = (active: boolean) =>
    `w-full text-left px-3 py-2 text-[13px] font-medium rounded transition-colors mt-2 flex items-center justify-between outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
      active
        ? "bg-[#145F33] text-white"
        : "text-[#080707] hover:bg-[#f3f3f3]"
    }`;
  const childClass = (selected: boolean, nested = false) =>
    `w-full text-left ${nested ? "pl-9" : "pl-6"} pr-3 py-1.5 text-[12px] rounded border-l-[3px] transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
      selected
        ? "border-[#145F33] bg-[#f3f3f3] text-[#145F33] font-semibold"
        : "border-transparent font-medium text-[#706e6b] hover:bg-[#f3f3f3]"
    }`;

  return (
    <nav aria-label={ariaLabel}>
      {groups.map((g) => {
        if (g.direct) {
          return (
            <button
              key={g.key}
              type="button"
              onClick={g.direct.onSelect}
              aria-current={g.direct.active ? "page" : undefined}
              className={topClass(g.direct.active)}
            >
              {g.label}
            </button>
          );
        }
        const open = manual[g.key] ?? g.active;
        return (
          <div key={g.key}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`ccm-nav-${g.key}`}
              onClick={() =>
                setManual((m) => ({ ...m, [g.key]: !open }))
              }
              className={topClass(g.active)}
            >
              {g.label}
              {open ? (
                <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              )}
            </button>
            {open && (
              <ul
                id={`ccm-nav-${g.key}`}
                className="space-y-0.5 pt-1"
                aria-label={`${g.label} sections`}
              >
                {g.items?.map((it) => (
                  <li key={it.key}>
                    <button
                      type="button"
                      onClick={it.onSelect}
                      aria-current={it.selected ? "page" : undefined}
                      className={childClass(it.selected)}
                    >
                      {it.label}
                    </button>
                    {it.children && it.selected && (
                      <ul className="space-y-0.5 pt-0.5">
                        {it.children.map((c) => (
                          <li key={c.key}>
                            <button
                              type="button"
                              onClick={c.onSelect}
                              aria-current={c.selected ? "page" : undefined}
                              className={childClass(c.selected, true)}
                            >
                              {c.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
