/**
 * OrganizationConstituentDetailPage
 *
 * Detail page for Organization-type and qualifying Individual-type constituents.
 * Reuses the same page shell (header, breadcrumb, left nav, content area) and
 * SLDS tokens as LeadDetailView, but exposes only the relevant sections.
 */

import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ChevronRight,
  Building2,
  User,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Briefcase,
  Eye,
  Link2,
  Pencil,
  Plus,
} from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";
import { ConnectionFormDialog } from "../admissions/ConnectionFormDialog";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { ConstituentContactView } from "../admissions/ConstituentContactView";
import { LeadDetailCredentialsTab } from "../admissions/LeadDetailCredentialsTab";
import { LeadDetailSpecialtyTab } from "../admissions/LeadDetailSpecialtyTab";
import { DocumentsSection } from "../admissions/DocumentsSection";
import { CPIEligibilitySection } from "../admissions/CPIEligibilitySection";
import {
  ActivityTimeline,
  type TimelineActivity,
} from "../ActivityTimeline";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { InstructorClassSessionsTab } from "../admissions/InstructorClassSessionsTab";
import { LeadDetailTutorMatchesTab } from "../admissions/LeadDetailTutorMatchesTab";
import { LeadDetailTutorScheduledSessionsTab } from "../admissions/LeadDetailTutorScheduledSessionsTab";
import { CampusRestrictionsSection } from "../youth/CampusRestrictionsSection";
import { TreatmentPlanningView } from "../admissions/TreatmentPlanningView";
import { YouthAcademicsView } from "../admissions/YouthAcademicsView";
import {
  DCFSInvolvementDialog,
  DCFSInvolvementRecord,
} from "../dialogs/DCFSInvolvementDialog";
import { ITPModule } from "../pages/ITPModule";
import { TransitionPlanningSection } from "../youth/TransitionPlanningSection";
import { formatMdy, localTodayIso } from "../../lib/dateFormat";
import { ContactLogDialogSLDS } from "../ContactLogDialogSLDS";
import { CONTACT_LOGS } from "../../data/mockContactLogs";
import { getDemoUserName } from "../../lib/demoIdentity";
import { EducationCareerView } from "../admissions/EducationCareerView";
import { AcademicCoursesView } from "../admissions/AcademicCoursesView";
import { AcademicLevelsView } from "../admissions/AcademicLevelsView";
import { AcademicTermsView } from "../admissions/AcademicTermsView";
import { PostSecondaryOptionsView } from "../admissions/PostSecondaryOptionsView";
import { CommunityReferralGeneralView } from "../admissions/CommunityReferralGeneralView";
import { Constituent, hasRole } from "../../data/mockConstituents";
import {
  CommunityCareSection,
  discardCommunityCareNotes,
  saveCommunityCareNotes,
} from "../admissions/CommunityCareSection";
import { ContractorSection } from "../admissions/ContractorSection";
import { StaffTitleAssignmentsSection } from "../admissions/StaffTitleAssignmentsSection";
import { useNotesDraft } from "../../data/communityNeedsStore";
import {
  getBirthName,
  saveBirthName,
} from "../../data/birthNameStore";
import {
  AGENCY_DIVISION_OPTIONS,
  CAMPUS_OPTIONS,
  PROGRAM_TEAM_OPTIONS,
  getStaffDetails,
  saveStaffDetails,
  type StaffDetails,
} from "../../data/staffDetailsStore";
import { ConstituentPassWorkspace } from "../passes/ConstituentPassWorkspace";
import { isPassTabConstituent } from "../../lib/constituentPassContext";

// Same email-format convention as ConstituentContactView / Employment tab.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STAFF_SELECTS = [
  { key: "campus", label: "Campus", options: CAMPUS_OPTIONS },
  {
    key: "agencyDivision",
    label: "Agency Division",
    options: AGENCY_DIVISION_OPTIONS,
  },
  {
    key: "programTeam",
    label: "Program/Team",
    options: PROGRAM_TEAM_OPTIONS,
  },
] as const;

// ── Types ────────────────────────────────────────────────────────────────────

interface OrgRole {
  id: string;
  role: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Inactive";
}

// ── Constants ────────────────────────────────────────────────────────────────

const SCHOOL_TYPES = [
  "Private",
  "Public",
  "Charter",
  "Therapeutic/Day School",
  "Neighborhood",
  "Selective Enrollment",
  "Magnet",
  "Military",
  "Alternative",
  "College Prep",
  "Technical",
  "Career Academy",
  "Virtual",
];

const SCHOOL_LEVELS = [
  "High School - Traditional Grades 9-12",
  "Elementary Grades K-8",
  "Middle Grades 6-8",
  "High School - Alternative",
  "College - 2 Year",
  "College - 4 Year",
  "GED Program",
  "Therapeutic - K-21yr",
  "Therapeutic - Grades K-8",
  "Therapeutic - Grades 9-12",
  "Middle and High School - Traditional Grades 6-12",
];

// ── Nav section helper ───────────────────────────────────────────────────────

type NavTab =
  | "constituentDetails"
  | "cpi"
  | "contactLog"
  | "contact"
  | "roles"
  | "relationships"
  | "connections"
  | "documents"
  | "credentials"
  | "specialty"
  | "classSessions"
  | "tutorMatches"
  | "tutorScheduledSessions"
  | "education"
  | "academicCourses"
  | "academicLevels"
  | "academicTerms"
  | "postSecondaryOptions"
  | "employment"
  | "communityReferralDetails"
  // Community Care Manager of Care Coordination tabs
  | "campusRestrictions"
  | "dcfsInvolvement"
  | "ptp"
  | "goals"
  | "copingSkills"
  | "triggers"
  | "strengths"
  | "supplementalPlans"
  | "itp"
  | "transitionPlanning"
  | "academics"
  // Constituent Pass (Youth / Community Care Member only)
  | "pass";

const EDUCATION_CHILDREN: NavTab[] = [
  "academicCourses",
  "academicLevels",
  "academicTerms",
  "postSecondaryOptions",
  "employment",
];

// Community Care Member profiles (Community Care Chunk 3): the six horizontal
// tabs, in this order. Configured for that role only; the shared General
// navigation and every other role's tabs are unchanged.
const COMMUNITY_CARE_MEMBER_TABS: { id: NavTab; label: string }[] = [
  { id: "constituentDetails", label: "Constituent Details" },
  { id: "cpi", label: "CPI" },
  { id: "relationships", label: "Relationships" },
  { id: "connections", label: "Connections" },
  { id: "contactLog", label: "Contact Log" },
  { id: "documents", label: "Documents" },
];

const GENERAL_TABS: { id: NavTab; label: string }[] = [
  { id: "constituentDetails", label: "Constituent Details" },
  { id: "contact", label: "Contact" },
  { id: "roles", label: "Constituent Roles" },
  { id: "relationships", label: "Relationships" },
  { id: "connections", label: "Connections" },
];

// Contractor (US 20097) and Instructor (US 20096): the shared General items
// plus Documents. Resolved per role so other roles' General navigation is
// unchanged.
const GENERAL_TABS_WITH_DOCUMENTS: {
  id: NavTab;
  label: string;
}[] = [
  ...GENERAL_TABS,
  { id: "documents", label: "Documents" },
];

// ── Constituent Details (Organization) ───────────────────────────────────────

const ETHNICITY_OPTIONS = [
  "White",
  "Hispanic/Latino",
  "Asian/Pacific Islander",
  "Native American",
  "Other",
  "African",
  "Unknown",
  "African American",
  "Belizian",
  "Haitian",
  "Jamaican",
  "Middle Eastern",
  "Multiracial",
  "Black",
];
const RELIGION_OPTIONS = [
  "Christian",
  "Catholic",
  "Muslim",
  "Jewish",
  "Hindu",
  "Buddhist",
  "Atheist",
  "Agnostic",
  "Other",
  "Prefer not to say",
];

/** A value mapped from another record that isn't one of the listed options
 *  stays selectable instead of being dropped or turned into another option. */
function extraOption(
  current: string,
  listed: readonly string[],
) {
  return current && !listed.includes(current) ? (
    <SelectItem value={current}>{current}</SelectItem>
  ) : null;
}

/** Contact rows mapped from a mentor application (address, preferred phone
 *  and email). Types/statuses the application doesn't state use the list's
 *  own "Unknown" / default values; no dates are invented. */
export function mentorContactSeed(c: Constituent) {
  const md = c.mentorDetails;
  if (!md) return undefined;
  const a = md.address;
  return {
    addresses: [a.line1, a.city, a.state, a.zip].some(Boolean)
      ? [
          {
            line1: a.line1,
            line2: "",
            city: a.city,
            state: a.state,
            zip: a.zip,
          },
        ]
      : [],
    phones: c.phone ? [{ number: c.phone }] : [],
    emails: c.email ? [{ address: c.email }] : [],
  };
}

export function OrgconstituentDetailsView({
  constituent,
}: {
  constituent: Constituent;
}) {
  const [orgName, setOrgName] = useState(
    constituent.orgName ?? constituent.name,
  );
  const [schoolType, setSchoolType] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("");
  const [savedSchoolType, setSavedSchoolType] = useState("");
  const [savedSchoolLevel, setSavedSchoolLevel] = useState("");
  const [dirty, setDirty] = useState(false);

  // Individual name / demographics fields
  // Details mapped from a Friends First Mentor Application (if this record
  // was created from one) fill the fields that have a matching meaning.
  const md = constituent.mentorDetails;
  const nameParts = constituent.name.split(" ");
  const [prefix, setPrefix] = useState("");
  const [firstName, setFirstName] = useState(
    md?.firstName ?? nameParts[0] ?? "",
  );
  const [middleName, setMiddleName] = useState(
    md?.middleName ?? "",
  );
  const [lastName, setLastName] = useState(
    md?.lastName ?? nameParts.slice(1).join(" "),
  );
  const [suffix, setSuffix] = useState("");
  const [preferredName, setPreferredName] = useState("");
  // Birth Name / Maiden Name (US 20161): Community Care Member only.
  const isCcMember =
    constituent.type === "Individual" &&
    hasRole(constituent, "Community Care Member");
  const birthOwner = { constituentId: String(constituent.id) };
  const [savedBirthName, setSavedBirthName] = useState(() =>
    isCcMember ? getBirthName(birthOwner) : "",
  );
  const [birthName, setBirthName] = useState(savedBirthName);
  const birthNameDirty =
    isCcMember && birthName !== savedBirthName;
  const [sex, setSex] = useState(md?.sex ?? "");
  const [race, setRace] = useState(md?.ethnicity ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(md?.dob ?? "");
  const [maritalStatus, setMaritalStatus] = useState(
    md?.maritalStatus ?? "",
  );
  const [religion, setReligion] = useState(md?.religion ?? "");
  const [preferredPronouns, setPreferredPronouns] =
    useState("");
  const [deceased, setDeceased] = useState<
    boolean | "indeterminate"
  >(false);
  const [language, setLanguage] = useState("");

  const isSchool = constituent.role === "School";
  const isOrg = constituent.type === "Organization";
  // Unsaved Community Care Notes also show Save / Cancel (20092).
  const ccId = String(constituent.id);
  const notesDirty =
    useNotesDraft(isOrg ? "" : ccId) !== undefined;

  // MHBG Staff assignment fields (20098): saved baseline + draft.
  const isStaff =
    constituent.type === "Individual" &&
    constituent.role === "MHBG Staff";
  const [savedStaff, setSavedStaff] = useState<StaffDetails>(
    () => getStaffDetails(ccId, constituent.email),
  );
  const [staff, setStaff] = useState<StaffDetails>(savedStaff);
  const [emailError, setEmailError] = useState("");
  const staffDirty =
    isStaff &&
    (Object.keys(staff) as (keyof StaffDetails)[]).some(
      (k) => staff[k] !== savedStaff[k],
    );

  const handleSave = () => {
    if (birthNameDirty && !saveBirthName(birthOwner, birthName)) {
      toast.error("Birth Name / Maiden Name could not be saved.", {
        description:
          "Browser storage is unavailable. Your changes are still on the form — try again.",
      });
      return;
    }
    if (staffDirty) {
      const next = { ...staff, email: staff.email.trim() };
      if (next.email && !EMAIL_RE.test(next.email)) {
        setEmailError("Enter a valid email address.");
        toast.error("Changes not saved. Fix the Email field.");
        return;
      }
      if (!saveStaffDetails(ccId, next)) {
        toast.error("Staff details could not be saved.", {
          description:
            "Browser storage is unavailable. Your changes are still on the form — try again.",
        });
        return;
      }
      setSavedStaff(next);
      setStaff(next);
    }
    setEmailError("");
    if (birthNameDirty) {
      const next = birthName.trim();
      setSavedBirthName(next);
      setBirthName(next);
    }
    if (!isOrg) saveCommunityCareNotes(ccId);
    setSavedSchoolType(schoolType);
    setSavedSchoolLevel(schoolLevel);
    toast.success("Constituent details saved.");
    setDirty(false);
  };

  const handleCancel = () => {
    if (!isOrg) discardCommunityCareNotes(ccId);
    setStaff(savedStaff);
    setBirthName(savedBirthName);
    setEmailError("");
    setOrgName(constituent.orgName ?? constituent.name);
    setSchoolType(savedSchoolType);
    setSchoolLevel(savedSchoolLevel);
    setDirty(false);
  };

  const Card = ({
    children,
  }: {
    children: React.ReactNode;
  }) => (
    <div
      className="overflow-hidden"
      style={{
        border: "1px solid var(--slds-g-color-border-base-1)",
        borderRadius: "var(--slds-c-card-radius-border)",
        backgroundColor: "var(--slds-g-color-background-base)",
      }}
    >
      {children}
    </div>
  );

  const CardHeader = ({ title }: { title: string }) => (
    <div
      className="px-4 py-3"
      style={{
        borderBottom:
          "1px solid var(--slds-g-color-border-base-1)",
        backgroundColor: "var(--slds-g-color-background-alt)",
      }}
    >
      <h3
        className="text-[13px] font-semibold"
        style={{ color: "var(--slds-g-color-text-default)" }}
      >
        {title}
      </h3>
    </div>
  );

  const ReadRow = ({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) => (
    <div className="space-y-1.5">
      <p
        className="slds-form-label"
        style={{ color: "var(--slds-g-color-text-weak)" }}
      >
        {label}
      </p>
      <p
        className="slds-text-4"
        style={{ color: "var(--slds-g-color-text-default)" }}
      >
        {value || "—"}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* General Information */}
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        <div
          className="px-4 py-3"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <h3
            className="text-[13px] font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Constituent Details
          </h3>
        </div>

        {isOrg ? (
          /* ── Organization layout ── */
          <div className="p-4 space-y-4">
            {/* Organization Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="org-det-name"
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                ORGANIZATION NAME{" "}
                <span style={{ color: "#c23934" }}>*</span>
              </Label>
              <input
                id="org-det-name"
                value={orgName}
                onChange={(e) => {
                  setOrgName(e.target.value);
                  setDirty(true);
                }}
                className="h-9 w-full max-w-md px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </div>

            {/* Read-only fields */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="space-y-1.5">
                <p
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  CONSTITUENT TYPE
                </p>
                <p
                  className="slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Organization
                </p>
              </div>
              <div className="space-y-1.5">
                <p
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  ROLE
                </p>
                <p
                  className="slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {constituent.role || "—"}
                </p>
              </div>
              <div className="space-y-1.5">
                <p
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  STATUS
                </p>
                <p
                  className="slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {constituent.status || "—"}
                </p>
              </div>
              <div className="space-y-1.5">
                <p
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  START DATE
                </p>
                <p
                  className="slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {constituent.startDate ?? "—"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ── Individual layout ── */
          <div className="p-4 space-y-6">
            {/* 1. Name */}
            <div>
              <h4
                className="text-[12px] font-semibold mb-3"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Name
              </h4>
              <div className="space-y-4">
                {/* Row 1: Prefix, First Name, Middle Initial, Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-2">
                    <Label
                      htmlFor="prefix"
                      className="text-[11px] font-medium mb-1.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Prefix
                    </Label>
                    <Select
                      value={prefix}
                      onValueChange={setPrefix}
                    >
                      <SelectTrigger className="h-8 text-[13px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mr.">Mr.</SelectItem>
                        <SelectItem value="Mrs.">
                          Mrs.
                        </SelectItem>
                        <SelectItem value="Ms.">Ms.</SelectItem>
                        <SelectItem value="Miss">
                          Miss
                        </SelectItem>
                        <SelectItem value="Dr.">Dr.</SelectItem>
                        <SelectItem value="Rev.">
                          Rev.
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="lg:col-span-4">
                    <Label
                      htmlFor="firstName"
                      className="text-[11px] font-medium mb-1.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      First Name{" "}
                      <span style={{ color: "#c23934" }}>
                        *
                      </span>
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) =>
                        setFirstName(e.target.value)
                      }
                      className="h-8 text-[13px]"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Label
                      htmlFor="middleName"
                      className="text-[11px] font-medium mb-1.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Middle Initial
                    </Label>
                    <Input
                      id="middleName"
                      value={middleName}
                      onChange={(e) =>
                        setMiddleName(e.target.value)
                      }
                      className="h-8 text-[13px]"
                      placeholder="Enter middle initial"
                      maxLength={1}
                    />
                  </div>
                  <div className="lg:col-span-4">
                    <Label
                      htmlFor="lastName"
                      className="text-[11px] font-medium mb-1.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Last Name{" "}
                      <span style={{ color: "#c23934" }}>
                        *
                      </span>
                    </Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) =>
                        setLastName(e.target.value)
                      }
                      className="h-8 text-[13px]"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                {/* Row 2: Suffix, Preferred Name, Preferred Pronouns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-2">
                    <Label
                      htmlFor="suffix"
                      className="text-[11px] font-medium mb-1.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Suffix
                    </Label>
                    <Select
                      value={suffix}
                      onValueChange={setSuffix}
                    >
                      <SelectTrigger className="h-8 text-[13px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Jr.">Jr.</SelectItem>
                        <SelectItem value="Sr.">Sr.</SelectItem>
                        <SelectItem value="II">II</SelectItem>
                        <SelectItem value="III">III</SelectItem>
                        <SelectItem value="IV">IV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="lg:col-span-4">
                    <Label
                      htmlFor="preferredName"
                      className="text-[11px] font-medium mb-1.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Preferred Name
                    </Label>
                    <Input
                      id="preferredName"
                      value={preferredName}
                      onChange={(e) =>
                        setPreferredName(e.target.value)
                      }
                      className="h-8 text-[13px]"
                      placeholder="Enter preferred name"
                    />
                  </div>
                  <div className="lg:col-span-4">
                    <Label
                      htmlFor="preferredPronouns"
                      className="text-[11px] font-medium mb-1.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Preferred Pronouns
                    </Label>
                    <Select
                      value={preferredPronouns}
                      onValueChange={setPreferredPronouns}
                    >
                      <SelectTrigger className="h-8 text-[13px]">
                        <SelectValue placeholder="Select pronouns" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="He/Him">
                          He/Him
                        </SelectItem>
                        <SelectItem value="She/Her">
                          She/Her
                        </SelectItem>
                        <SelectItem value="They/Them">
                          They/Them
                        </SelectItem>
                        <SelectItem value="He/They">
                          He/They
                        </SelectItem>
                        <SelectItem value="She/They">
                          She/They
                        </SelectItem>
                        <SelectItem value="Ze/Zir">
                          Ze/Zir
                        </SelectItem>
                        <SelectItem value="Other">
                          Other
                        </SelectItem>
                        <SelectItem value="Prefer not to say">
                          Prefer not to say
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {isCcMember && (
                    <div className="lg:col-span-4">
                      <Label
                        htmlFor="birthName"
                        className="text-[11px] font-medium mb-1.5"
                        style={{
                          color: "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Birth Name / Maiden Name
                      </Label>
                      <Input
                        id="birthName"
                        value={birthName}
                        onChange={(e) =>
                          setBirthName(e.target.value)
                        }
                        className="h-8 text-[13px]"
                        placeholder="Enter birth name / maiden name"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Demographics & Identity */}
            <div>
              <h4
                className="text-[12px] font-semibold mb-3"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Demographics & Identity
              </h4>
              <div className="space-y-4">
                {/* Row 1: Gender, Ethnicity, Date of Birth */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="sex"
                      className="text-[11px] font-medium mb-1.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Gender
                    </Label>
                    <Select value={sex} onValueChange={setSex}>
                      <SelectTrigger className="h-8 text-[13px]">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {extraOption(sex, [
                          "Male",
                          "Female",
                          "Other",
                        ])}
                        <SelectItem value="Male">
                          Male
                        </SelectItem>
                        <SelectItem value="Female">
                          Female
                        </SelectItem>
                        <SelectItem value="Other">
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="race"
                      className="text-[11px] font-medium mb-1.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Ethnicity
                    </Label>
                    <Select
                      value={race}
                      onValueChange={setRace}
                    >
                      <SelectTrigger className="h-8 text-[13px]">
                        <SelectValue placeholder="Select ethnicity" />
                      </SelectTrigger>
                      <SelectContent>
                        {extraOption(race, ETHNICITY_OPTIONS)}
                        <SelectItem value="White">
                          White
                        </SelectItem>
                        <SelectItem value="Hispanic/Latino">
                          Hispanic/Latino
                        </SelectItem>
                        <SelectItem value="Asian/Pacific Islander">
                          Asian/Pacific Islander
                        </SelectItem>
                        <SelectItem value="Native American">
                          Native American
                        </SelectItem>
                        <SelectItem value="Other">
                          Other
                        </SelectItem>
                        <SelectItem value="African">
                          African
                        </SelectItem>
                        <SelectItem value="Unknown">
                          Unknown
                        </SelectItem>
                        <SelectItem value="African American">
                          African American
                        </SelectItem>
                        <SelectItem value="Belizian">
                          Belizian
                        </SelectItem>
                        <SelectItem value="Haitian">
                          Haitian
                        </SelectItem>
                        <SelectItem value="Jamaican">
                          Jamaican
                        </SelectItem>
                        <SelectItem value="Middle Eastern">
                          Middle Eastern
                        </SelectItem>
                        <SelectItem value="Multiracial">
                          Multiracial
                        </SelectItem>
                        <SelectItem value="Black">
                          Black
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="dateOfBirth"
                      className="text-[11px] font-medium mb-1.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      value={dateOfBirth}
                      onChange={(e) =>
                        setDateOfBirth(e.target.value)
                      }
                      placeholder="MM/DD/YYYY"
                      className="h-8 text-[13px]"
                      style={{
                        borderColor:
                          "var(--slds-g-color-border-base-1)",
                      }}
                    />
                  </div>
                </div>
                {/* Row 2: Marital Status, Religion, Status (Deceased) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="maritalStatus"
                      className="text-[11px] font-medium mb-1.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Marital Status
                    </Label>
                    <Select
                      value={maritalStatus}
                      onValueChange={setMaritalStatus}
                    >
                      <SelectTrigger className="h-8 text-[13px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {extraOption(maritalStatus, [
                          "Single",
                          "Married",
                          "Divorced",
                          "Widowed",
                          "Separated",
                          "Domestic Partnership",
                        ])}
                        <SelectItem value="Single">
                          Single
                        </SelectItem>
                        <SelectItem value="Married">
                          Married
                        </SelectItem>
                        <SelectItem value="Divorced">
                          Divorced
                        </SelectItem>
                        <SelectItem value="Widowed">
                          Widowed
                        </SelectItem>
                        <SelectItem value="Separated">
                          Separated
                        </SelectItem>
                        <SelectItem value="Domestic Partnership">
                          Domestic Partnership
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="religion"
                      className="text-[11px] font-medium mb-1.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Religion
                    </Label>
                    <Select
                      value={religion}
                      onValueChange={setReligion}
                    >
                      <SelectTrigger className="h-8 text-[13px]">
                        <SelectValue placeholder="Select religion" />
                      </SelectTrigger>
                      <SelectContent>
                        {extraOption(
                          religion,
                          RELIGION_OPTIONS,
                        )}
                        <SelectItem value="Christian">
                          Christian
                        </SelectItem>
                        <SelectItem value="Catholic">
                          Catholic
                        </SelectItem>
                        <SelectItem value="Muslim">
                          Muslim
                        </SelectItem>
                        <SelectItem value="Jewish">
                          Jewish
                        </SelectItem>
                        <SelectItem value="Hindu">
                          Hindu
                        </SelectItem>
                        <SelectItem value="Buddhist">
                          Buddhist
                        </SelectItem>
                        <SelectItem value="Atheist">
                          Atheist
                        </SelectItem>
                        <SelectItem value="Agnostic">
                          Agnostic
                        </SelectItem>
                        <SelectItem value="Other">
                          Other
                        </SelectItem>
                        <SelectItem value="Prefer not to say">
                          Prefer not to say
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="deceased"
                      className="text-[11px] font-medium mb-1.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Status
                    </Label>
                    <div className="flex items-center h-8">
                      <Checkbox
                        id="deceased"
                        checked={deceased}
                        onCheckedChange={setDeceased}
                        className="mr-2"
                      />
                      <Label
                        htmlFor="deceased"
                        className="text-[13px] font-normal cursor-pointer"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Deceased
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Communication */}
            <div>
              <h4
                className="text-[12px] font-semibold mb-3"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Communication
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label
                    htmlFor="language"
                    className="text-[11px] font-medium mb-1.5"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Language
                  </Label>
                  <Select
                    value={language}
                    onValueChange={setLanguage}
                  >
                    <SelectTrigger className="h-8 text-[13px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">
                        English
                      </SelectItem>
                      <SelectItem value="Spanish">
                        Spanish
                      </SelectItem>
                      <SelectItem value="French">
                        French
                      </SelectItem>
                      <SelectItem value="Mandarin">
                        Mandarin
                      </SelectItem>
                      <SelectItem value="Arabic">
                        Arabic
                      </SelectItem>
                      <SelectItem value="Portuguese">
                        Portuguese
                      </SelectItem>
                      <SelectItem value="Russian">
                        Russian
                      </SelectItem>
                      <SelectItem value="Other">
                        Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 4. Staff Assignment — MHBG Staff only (20098) */}
            {isStaff && (
              <div>
                <h4
                  className="text-[12px] font-semibold mb-3"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Staff Assignment
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {STAFF_SELECTS.map(
                    ({ key, label, options }) => (
                      <div key={key}>
                        <Label
                          htmlFor={`staff-${key}-${ccId}`}
                          className="text-[11px] font-medium mb-1.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {label}
                        </Label>
                        <Select
                          value={staff[key]}
                          onValueChange={(v) =>
                            setStaff((s) => ({
                              ...s,
                              [key]: v,
                            }))
                          }
                        >
                          <SelectTrigger
                            id={`staff-${key}-${ccId}`}
                          >
                            <SelectValue
                              placeholder={`Select ${label}`}
                            />
                          </SelectTrigger>
                          {/* Cap at the space Radix measures so the 34-item
                            Program/Team list scrolls inside the window
                            instead of opening past its top edge. */}
                          <SelectContent className="max-h-[var(--radix-select-content-available-height)]">
                            {options.map((o) => (
                              <SelectItem key={o} value={o}>
                                {o}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ),
                  )}
                  <div>
                    <Label
                      htmlFor={`staff-email-${ccId}`}
                      className="text-[11px] font-medium mb-1.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Email
                    </Label>
                    <Input
                      id={`staff-email-${ccId}`}
                      type="email"
                      value={staff.email}
                      onChange={(e) => {
                        const email = e.target.value;
                        setStaff((s) => ({ ...s, email }));
                        setEmailError("");
                      }}
                      placeholder="Enter email"
                      aria-invalid={
                        emailError ? true : undefined
                      }
                      aria-describedby={
                        emailError
                          ? `staff-email-error-${ccId}`
                          : undefined
                      }
                    />
                    {emailError && (
                      <p
                        id={`staff-email-error-${ccId}`}
                        role="alert"
                        className="slds-text-3 text-destructive mt-1"
                      >
                        {emailError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* School Details — only when role = School */}
      {isSchool && (
        <Card>
          <CardHeader title="School Details" />
          <div className="p-4">
            <div
              className="grid grid-cols-2 gap-4"
              style={{ maxWidth: 480 }}
            >
              <div className="space-y-1.5">
                <Label
                  htmlFor="org-school-type"
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  SCHOOL TYPE
                </Label>
                <Select
                  value={schoolType}
                  onValueChange={(v) => {
                    setSchoolType(v);
                    setDirty(true);
                  }}
                >
                  <SelectTrigger
                    id="org-school-type"
                    className="h-9 slds-text-4"
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <SelectValue placeholder="Select School Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOOL_TYPES.map((t) => (
                      <SelectItem
                        key={t}
                        value={t}
                        className="slds-text-4"
                      >
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="org-school-level"
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  SCHOOL LEVEL
                </Label>
                <Select
                  value={schoolLevel}
                  onValueChange={(v) => {
                    setSchoolLevel(v);
                    setDirty(true);
                  }}
                >
                  <SelectTrigger
                    id="org-school-level"
                    className="h-9 slds-text-4"
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <SelectValue placeholder="Select School Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOOL_LEVELS.map((l) => (
                      <SelectItem
                        key={l}
                        value={l}
                        className="slds-text-4"
                      >
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Contractor — Individual Contractors only (20119) */}
      {constituent.type === "Individual" &&
        constituent.role === "Contractor" && (
          <ContractorSection
            key={`contractor-${constituent.id}`}
            constituentId={String(constituent.id)}
          />
        )}

      {/* Community Care — every Individual role (20092) */}
      {!isOrg && (
        <CommunityCareSection
          key={constituent.id}
          constituentId={String(constituent.id)}
        />
      )}

      {/* Save / Cancel */}
      {(dirty || notesDirty || staffDirty || birthNameDirty) && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="h-9 px-5 rounded-full slds-text-4 font-medium"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
              color: "var(--slds-g-color-text-default)",
            }}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            className="h-9 px-5 rounded-full slds-text-4 font-medium text-white"
            style={{ backgroundColor: "#145F33" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0e4524";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#145F33";
            }}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Constituent Roles view (Organization) ────────────────────────────────────

const INDIVIDUAL_ROLE_OPTIONS = [
  "Case Manager",
  "Community Care Member",
  "Community Care Manager of Care Coordination",
  "Community Care Staff",
  "Contractor",
  "External Constituent",
  "Friends First Mentee",
  "Friends First Mentor",
  "Instructor",
  "Masters Level Administrative Staff",
  "MHBG Staff",
  "Nurse",
  "Residential Program Authorization Agent",
  "Tutor",
];

const ORGANIZATION_ROLE_OPTIONS = [
  "Organization",
  "Community Referral Organization",
  "Employer",
  "PSO Organization",
  "School",
];

export function OrgConstituentRolesView({
  constituent,
}: {
  constituent: Constituent;
}) {
  const [roles, setRoles] = useState<OrgRole[]>([
    {
      id: "1",
      role: constituent.role,
      startDate: constituent.startDate ?? "—",
      endDate: "—",
      status: "Active",
    },
  ]);
  const [addOpen, setAddOpen] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [newStart, setNewStart] = useState("");

  const handleAdd = () => {
    if (!newRole || !newStart) {
      toast.error("Role and Start Date are required.");
      return;
    }
    setRoles((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: newRole,
        startDate: newStart,
        endDate: "—",
        status: "Active",
      },
    ]);
    setAddOpen(false);
    setNewRole("");
    setNewStart("");
    toast.success("Role added.");
  };

  return (
    <div
      className="overflow-hidden"
      style={{
        border: "1px solid var(--slds-g-color-border-base-1)",
        borderRadius: "var(--slds-c-card-radius-border)",
        backgroundColor: "var(--slds-g-color-background-base)",
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
          backgroundColor: "var(--slds-g-color-background-alt)",
        }}
      >
        <h3
          className="text-[13px] font-semibold"
          style={{ color: "var(--slds-g-color-text-default)" }}
        >
          Constituent Roles
        </h3>
        <Button
          onClick={() => setAddOpen(true)}
          size="sm"
          className="h-7 px-3 text-[11px] rounded-full text-white"
          style={{ backgroundColor: "#145F33" }}
        >
          + New
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              {["Role", "Start Date", "End Date", "Status"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id}>
                <td
                  className="px-4 py-3 slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  {r.role}
                </td>
                <td
                  className="px-4 py-3 slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  {r.startDate}
                </td>
                <td
                  className="px-4 py-3 slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  {r.endDate}
                </td>
                <td
                  className="px-4 py-3"
                  style={{
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{
                      backgroundColor:
                        r.status === "Active"
                          ? "#e8f5e9"
                          : "#f5f5f5",
                      color:
                        r.status === "Active"
                          ? "#1b5e20"
                          : "#424242",
                      border: `1px solid ${r.status === "Active" ? "#a5d6a7" : "#bdbdbd"}`,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor:
                          r.status === "Active"
                            ? "#2e7d32"
                            : "#757575",
                        display: "inline-block",
                      }}
                    />
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          className="max-w-sm"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
          }}
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle
              className="slds-text-6 font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Add Constituent Role
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                ROLE <span className="text-red-600">*</span>
              </Label>
              <Select
                value={newRole}
                onValueChange={setNewRole}
              >
                <SelectTrigger
                  className="h-9 slds-text-4"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {(constituent.type === "Individual"
                    ? INDIVIDUAL_ROLE_OPTIONS
                    : ORGANIZATION_ROLE_OPTIONS
                  ).map((r) => (
                    <SelectItem
                      key={r}
                      value={r}
                      className="slds-text-4"
                    >
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="new-role-start"
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                START DATE{" "}
                <span className="text-red-600">*</span>
              </Label>
              <input
                id="new-role-start"
                type="text"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                placeholder="MM/DD/YYYY"
                className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              className="h-9 px-5 rounded-full slds-text-4"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
              }}
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="h-9 px-5 rounded-full slds-text-4 font-medium text-white"
              style={{ backgroundColor: "#145F33" }}
              onClick={handleAdd}
            >
              Add Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Employment view (Organization) ───────────────────────────────────────────

const EMPLOYMENT_TYPES = [
  "Full-Time",
  "Part-Time",
  "Contract",
  "Internship",
  "Volunteer",
];

interface OrgEmploymentRecord {
  id: string;
  constituentId: number;
  constituentName: string;
  constituentType: string;
  employmentType: string;
  jobTitle: string;
  startDate: string;
  endDate: string | null;
  orgId: number;
}

// Mock employment records — keyed by orgId so each org shows its own employees
const MOCK_EMPLOYMENT_RECORDS: OrgEmploymentRecord[] = [
  {
    id: "e1",
    constituentId: 1,
    constituentName: "Emily Johnson",
    constituentType: "Individual",
    employmentType: "Full-Time",
    jobTitle: "Case Coordinator",
    startDate: "01/15/2023",
    endDate: null,
    orgId: 7,
  },
  {
    id: "e2",
    constituentId: 3,
    constituentName: "Sarah Chen",
    constituentType: "Individual",
    employmentType: "Part-Time",
    jobTitle: "Program Specialist",
    startDate: "06/01/2022",
    endDate: "12/31/2024",
    orgId: 7,
  },
  {
    id: "e3",
    constituentId: 5,
    constituentName: "David Thompson",
    constituentType: "Individual",
    employmentType: "Contract",
    jobTitle: "Community Outreach Rep",
    startDate: "03/10/2024",
    endDate: null,
    orgId: 7,
  },
  {
    id: "e4",
    constituentId: 8,
    constituentName: "Robert Anderson",
    constituentType: "Individual",
    employmentType: "Full-Time",
    jobTitle: "Youth Advocate",
    startDate: "09/01/2021",
    endDate: null,
    orgId: 19,
  },
  {
    id: "e5",
    constituentId: 9,
    constituentName: "Maria Garcia",
    constituentType: "Individual",
    employmentType: "Part-Time",
    jobTitle: "Family Support Worker",
    startDate: "02/14/2023",
    endDate: null,
    orgId: 19,
  },
  {
    id: "e6",
    constituentId: 12,
    constituentName: "Patricia Lee",
    constituentType: "Individual",
    employmentType: "Volunteer",
    jobTitle: "Program Volunteer",
    startDate: "11/01/2023",
    endDate: null,
    orgId: 24,
  },
  {
    id: "e7",
    constituentId: 14,
    constituentName: "Christopher Davis",
    constituentType: "Individual",
    employmentType: "Full-Time",
    jobTitle: "Legal Advisor",
    startDate: "07/01/2022",
    endDate: null,
    orgId: 24,
  },
  {
    id: "e8",
    constituentId: 18,
    constituentName: "Lisa Taylor",
    constituentType: "Individual",
    employmentType: "Internship",
    jobTitle: "Research Intern",
    startDate: "01/08/2024",
    endDate: "08/31/2024",
    orgId: 13,
  },
  {
    id: "e9",
    constituentId: 25,
    constituentName: "Rachel Clark",
    constituentType: "Individual",
    employmentType: "Full-Time",
    jobTitle: "Education Coordinator",
    startDate: "04/01/2023",
    endDate: null,
    orgId: 13,
  },
];

function OrgEmploymentView({
  constituent,
  onSelectConstituent,
}: {
  constituent: Constituent;
  onSelectConstituent: (id: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const records = MOCK_EMPLOYMENT_RECORDS.filter(
    (r) => r.orgId === constituent.id,
  );

  const filtered = records.filter((r) => {
    const matchesSearch =
      !search.trim() ||
      r.constituentName
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesType =
      filterType === "all" || r.employmentType === filterType;
    return matchesSearch && matchesType;
  });

  const hasFilters =
    search.trim() !== "" || filterType !== "all";

  const clearFilters = () => {
    setSearch("");
    setFilterType("all");
  };

  return (
    <div className="space-y-5 px-4 py-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by constituent name"
            className="h-8 pl-8 pr-3 w-[220px] rounded-full slds-text-3"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
          />
        </div>

        <Select
          value={filterType}
          onValueChange={setFilterType}
        >
          <SelectTrigger
            className="h-8 w-[160px] rounded-full slds-text-3"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
          >
            <SelectValue placeholder="Employment Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="slds-text-3">
              All Types
            </SelectItem>
            {EMPLOYMENT_TYPES.map((t) => (
              <SelectItem
                key={t}
                value={t}
                className="slds-text-3"
              >
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="h-8 px-3 rounded-full flex items-center gap-1.5 slds-text-3 transition-colors"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
              color: "var(--slds-g-color-text-default)",
            }}
          >
            <X className="h-3 w-3" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Grid */}
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center px-6">
            <Briefcase
              className="h-9 w-9 mb-3"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            />
            <p
              className="slds-text-4 font-medium"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              No employment records found.
            </p>
            <p
              className="slds-text-3 mt-1.5 max-w-xs"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {hasFilters
                ? "Try adjusting your search or filter criteria."
                : "Employment records associated with this organization will appear here when they are added to Individual Constituent records."}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 h-8 px-4 rounded-full slds-text-3 font-medium transition-colors"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  {[
                    "Constituent Name",
                    "Constituent Type",
                    "Employment Type",
                    "Job Title",
                    "Start Date",
                    "End Date",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2.5 text-left text-[11px] font-semibold whitespace-nowrap"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom:
                        idx < filtered.length - 1
                          ? "1px solid var(--slds-g-color-border-base-1)"
                          : undefined,
                      backgroundColor:
                        idx % 2 === 0
                          ? "var(--slds-g-color-background-base)"
                          : "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          onSelectConstituent(r.constituentId)
                        }
                        className="slds-text-4 font-medium hover:underline text-left"
                        style={{ color: "#0176d3" }}
                      >
                        {r.constituentName}
                      </button>
                    </td>
                    <td
                      className="px-4 py-3 slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {r.constituentType}
                    </td>
                    <td
                      className="px-4 py-3 slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {r.employmentType}
                    </td>
                    <td
                      className="px-4 py-3 slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {r.jobTitle}
                    </td>
                    <td
                      className="px-4 py-3 slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {r.startDate}
                    </td>
                    <td
                      className="px-4 py-3 slds-text-4"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {r.endDate ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              className="px-4 py-2 slds-text-3"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-weak)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              {filtered.length} record
              {filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Relationships view (Organization) ────────────────────────────────────────

const RELATIONSHIP_TYPES = [
  "Admissions Clinician",
  "Adoptive Brother",
  "Adoptive Daughter",
  "Adoptive Father",
  "Adoptive Granddaughter",
  "Adoptive Grandfather",
  "Adoptive Grandmother",
  "Adoptive Grandson",
  "Adoptive Mother",
  "Adoptive Sister",
  "Adoptive Son",
  "Advisee",
  "Advisor",
  "Advocate",
  "Advocatee",
  "After School Programs Coordinator",
  "Asst. Principal",
  "Attendance Officer",
  "Aunt",
  "Brother",
  "Brother-in-law",
  "Business Associate",
  "Boyfriend",
  "Career Resources Coordinator",
  "Admissions Case Manager",
  "Case Worker",
  "Client",
  "Co-Worker",
  "Coach",
  "Counselee",
  "Counselor",
  "Cousin",
  "Daughter",
  "Dean",
  "Dentist",
  "Dependent",
  "Dietitian",
  "Employee",
  "Employer",
  "Eye Doctor",
  "Ex-boyfriend",
  "Ex-girlfriend",
  "Ex-husband",
  "Ex-wife",
  "Family Therapist",
  "Biological Father",
  "Father-in-law",
  "Fiancé",
  "Foster Brother",
  "Foster Daughter",
  "Foster Father",
  "Foster Granddaughter",
  "Foster Grandfather",
  "Foster Grandmother",
  "Foster Grandson",
  "Foster Mother",
  "Foster Sister",
  "Foster Son",
  "Friend",
  "Girlfriend",
  "Godchild",
  "Godparent",
  "Granddaughter",
  "Grandfather",
  "Grandmother",
  "Grandson",
  "Guardian",
  "Guardian ad Litem (GAL)",
  "Half Brother",
  "Half Sister",
  "Hearing Doctor",
  "Husband",
  "Intact Worker",
  "Lawyer/Attorney",
  "Medical Specialist",
  "Mentee",
  "Mentor",
  "Biological Mother",
  "Mother-in-law",
  "Nephew",
  "Niece",
  "Nutritionist",
  "Other",
  "Orthodontist",
  "Parole Officer",
  "Parolee",
  "Partner",
  "Patient",
  "Physician Assistant",
  "Primary Care Physician",
  "Principal",
  "Probation Officer",
  "Probationer",
  "PSO Coordinator",
  "PSO Organization",
  "PSO Participant",
  "Psychiatrist",
  "Psychologist",
  "School",
  "School Resources Coordinator",
  "Short-term Guardian",
  "Sister",
  "Sister-in-law",
  "Social Worker",
  "Son",
  "Step Brother",
  "Step Daughter",
  "Step Father",
  "Step Granddaughter",
  "Step Grandfather",
  "Step Grandmother",
  "Step Grandson",
  "Step Mother",
  "Step Sister",
  "Step Son",
  "Student",
  "Teacher",
  "Therapist",
  "Tutor",
  "Uncle",
  "Wife",
  "Youth",
  "Pharmacist",
  "Great Aunt",
  "Great Nephew",
  "Family Friend",
  "Great Grandmother",
  "Great Grandson",
  "Treatment Provider",
  "TASC officer",
  "Nurse Practitioner",
  "Community Care Care Manager",
  "Case Manager (External)",
  "Intake Coordinator",
  "Parent Organization",
  "Community Care Education Coordinator",
  "Community Care Therapeutic Supervisor",
  "Community Care Therapy Intern",
  "Community Care Manager of Coordinated Supports",
  "Community Care Tutor",
  "Mother of child",
  "Father of child",
  "Public Defender",
  "Spiritual Development Manager",
  "Friends First Coordinator",
  "Match Support Representative",
  "Program Contact",
  "Community Care Therapist",
  "Neurologist",
  "GI Specialist",
  "Community Care Housing Coordinator",
  "Community Care Vocational Coach",
  "Family Support Coordinator",
  "Admissions Clinical Coordinator",
  "Community Care Manager of Care Coordination",
];

const MOCK_CONSTITUENT_OPTIONS = [
  "Emily Johnson",
  "David Thompson",
  "Sarah Chen",
  "Robert Anderson",
  "Maria Garcia",
  "Patricia Lee",
  "Christopher Davis",
  "Rachel Clark",
  "Lisa Taylor",
  "James Wilson",
  "Amanda Martinez",
  "Kevin Brown",
  "Sandra Davis",
  "Thomas Moore",
  "Jennifer White",
];

interface OrgRelRecord {
  id: string;
  relatedConstituent: string;
  relationship: string;
  startDate: string;
  endDate: string;
  comments: string;
  orgId: number;
}

const MOCK_ORG_RELATIONSHIPS: OrgRelRecord[] = [
  {
    id: "R-001",
    orgId: 7,
    relatedConstituent: "Emily Johnson",
    relationship: "Case Worker",
    startDate: "01/15/2025",
    endDate: "",
    comments:
      "Primary case worker assigned to this organization.",
  },
  {
    id: "R-002",
    orgId: 7,
    relatedConstituent: "David Thompson",
    relationship: "Advisor",
    startDate: "03/01/2024",
    endDate: "12/31/2024",
    comments: "",
  },
  {
    id: "R-003",
    orgId: 7,
    relatedConstituent: "Sarah Chen",
    relationship: "Program Contact",
    startDate: "06/20/2025",
    endDate: "",
    comments: "Main liaison for program coordination.",
  },
  {
    id: "R-004",
    orgId: 19,
    relatedConstituent: "Robert Anderson",
    relationship: "Parent Organization",
    startDate: "01/01/2023",
    endDate: "",
    comments: "",
  },
  {
    id: "R-005",
    orgId: 24,
    relatedConstituent: "Maria Garcia",
    relationship: "PSO Coordinator",
    startDate: "09/10/2024",
    endDate: "09/10/2025",
    comments: "",
  },
];

const EMPTY_REL_FORM = {
  relatedConstituent: "",
  relationship: "",
  startDate: "",
  endDate: "",
  comments: "",
};

export function OrgRelationshipsView({
  constituent,
}: {
  constituent: Constituent;
}) {
  const navigate = useNavigate();
  const seedRels = MOCK_ORG_RELATIONSHIPS.filter(
    (r) => r.orgId === constituent.id,
  );

  const [records, setRecords] =
    useState<OrgRelRecord[]>(seedRels);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<
    "none" | "create" | "edit" | "view"
  >("none");
  const [editingId, setEditingId] = useState<string | null>(
    null,
  );
  const [form, setForm] = useState({ ...EMPTY_REL_FORM });
  const [errors, setErrors] = useState<{
    relatedConstituent?: string;
    relationship?: string;
    startDate?: string;
  }>({});
  const [relSearch, setRelSearch] = useState("");
  const [constituentSearch, setConstituentSearch] =
    useState("");
  const [relDropOpen, setRelDropOpen] = useState(false);
  const [constituentDropOpen, setConstituentDropOpen] =
    useState(false);
  const nextIdRef = useRef(6);

  // Add-new-constituent mini-flow
  const [addConstOpen, setAddConstOpen] = useState(false);
  const [newConstName, setNewConstName] = useState("");
  const [addConstError, setAddConstError] = useState("");
  const [constituentOptions, setConstituentOptions] = useState([
    ...MOCK_CONSTITUENT_OPTIONS,
  ]);

  const displayed = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.relatedConstituent.toLowerCase().includes(q) ||
      r.relationship.toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setForm({ ...EMPTY_REL_FORM });
    setErrors({});
    setRelSearch("");
    setConstituentSearch("");
    setEditingId(null);
    setModalMode("create");
  };

  const openEdit = (r: OrgRelRecord) => {
    setForm({
      relatedConstituent: r.relatedConstituent,
      relationship: r.relationship,
      startDate: r.startDate,
      endDate: r.endDate,
      comments: r.comments,
    });
    setErrors({});
    setRelSearch(r.relationship);
    setConstituentSearch(r.relatedConstituent);
    setEditingId(r.id);
    setModalMode("edit");
  };

  const openView = (r: OrgRelRecord) => {
    setForm({
      relatedConstituent: r.relatedConstituent,
      relationship: r.relationship,
      startDate: r.startDate,
      endDate: r.endDate,
      comments: r.comments,
    });
    setModalMode("view");
  };

  const closeModal = () => {
    setModalMode("none");
    setEditingId(null);
    setRelDropOpen(false);
    setConstituentDropOpen(false);
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.relatedConstituent)
      e.relatedConstituent = "Related To is required.";
    if (!form.relationship)
      e.relationship = "Relationship is required.";
    if (!form.startDate)
      e.startDate = "Start Date is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (modalMode === "create") {
      const newRec: OrgRelRecord = {
        id: `R-00${nextIdRef.current++}`,
        orgId: constituent.id,
        ...form,
      };
      setRecords((prev) => [...prev, newRec]);
      toast.success("Relationship created successfully.");
    } else if (modalMode === "edit" && editingId) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editingId ? { ...r, ...form } : r,
        ),
      );
      toast.success("Relationship updated successfully.");
    }
    closeModal();
  };

  const filteredRelTypes = RELATIONSHIP_TYPES.filter((t) =>
    t.toLowerCase().includes(relSearch.toLowerCase()),
  );
  const filteredConstituents = constituentOptions.filter((c) =>
    c.toLowerCase().includes(constituentSearch.toLowerCase()),
  );

  const handleAddNewConstituent = () => {
    if (!newConstName.trim()) {
      setAddConstError("Name is required.");
      return;
    }
    const name = newConstName.trim();
    setConstituentOptions((prev) => [...prev, name]);
    setForm((prev) => ({ ...prev, relatedConstituent: name }));
    setConstituentSearch(name);
    setNewConstName("");
    setAddConstError("");
    setAddConstOpen(false);
    toast.success(`Constituent "${name}" created and linked.`);
  };

  const inputStyle = {
    border: "1px solid var(--slds-g-color-border-base-1)",
    backgroundColor: "var(--slds-g-color-background-base)",
    color: "var(--slds-g-color-text-default)",
  };
  const errStyle = {
    color: "#c23934",
    fontSize: "11px",
    marginTop: "2px",
  };

  const isReadOnly = modalMode === "view";

  return (
    <>
      {/* Card header */}
      <div
        className="px-4 py-3 flex items-start justify-between"
        style={{
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
          backgroundColor: "var(--slds-g-color-background-alt)",
        }}
      >
        <div>
          <h3
            className="text-[13px] font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Relationships
          </h3>
          <p
            className="slds-text-3 mt-0.5"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            View and manage relationships associated with this
            organization.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="h-9 px-4 rounded-full slds-text-4 font-medium text-white flex-shrink-0 ml-4"
          style={{ backgroundColor: "#145F33" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0e4524";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#145F33";
          }}
        >
          + Create Relationship
        </Button>
      </div>

      {/* Search */}
      <div
        className="px-4 py-3"
        style={{
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <div className="relative max-w-sm">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search relationships..."
            className="h-9 w-full pl-8 pr-3 rounded slds-text-4 focus:outline-none"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Grid / empty states */}
      {records.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center px-6">
          <Link2
            className="h-9 w-9 mb-3"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          />
          <p
            className="slds-text-4 font-medium"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            No relationships found
          </p>
          <p
            className="slds-text-3 mt-1.5 max-w-xs"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Relationships associated with this organization will
            appear here.
          </p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center px-6">
          <Search
            className="h-9 w-9 mb-3"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          />
          <p
            className="slds-text-4 font-medium"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            No matching relationships found
          </p>
          <p
            className="slds-text-3 mt-1.5 max-w-xs"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Try adjusting your search criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                  borderBottom:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                {[
                  "Related Constituent",
                  "Relationship",
                  "Start Date",
                  "End Date",
                  "Actions",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2.5 text-left whitespace-nowrap text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((r, idx) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom:
                      idx < displayed.length - 1
                        ? "1px solid var(--slds-g-color-border-base-1)"
                        : undefined,
                    backgroundColor:
                      idx % 2 === 0
                        ? "var(--slds-g-color-background-base)"
                        : "var(--slds-g-color-background-alt)",
                  }}
                >
                  <td className="px-4 py-3 slds-text-4">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/constituents/${r.relatedConstituent.toLowerCase().replace(/\s+/g, "-")}`,
                        )
                      }
                      className="font-medium hover:underline focus:outline-none"
                      style={{ color: "#0176d3" }}
                    >
                      {r.relatedConstituent}
                    </button>
                  </td>
                  <td
                    className="px-4 py-3 slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {r.relationship}
                  </td>
                  <td
                    className="px-4 py-3 slds-text-4 whitespace-nowrap"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {r.startDate}
                  </td>
                  <td
                    className="px-4 py-3 slds-text-4 whitespace-nowrap"
                    style={{
                      color: r.endDate
                        ? "var(--slds-g-color-text-default)"
                        : "var(--slds-g-color-text-weak)",
                    }}
                  >
                    {r.endDate || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="View Relationship"
                        onClick={() => openView(r)}
                        className="p-1 rounded transition-colors"
                        style={{ color: "#0176d3" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--slds-g-color-background-alt)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "transparent";
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Edit Relationship"
                        onClick={() => openEdit(r)}
                        className="p-1 rounded transition-colors"
                        style={{ color: "#0176d3" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--slds-g-color-background-alt)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "transparent";
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Open Constituent Record"
                        onClick={() =>
                          navigate(
                            `/constituents/${r.relatedConstituent.toLowerCase().replace(/\s+/g, "-")}`,
                          )
                        }
                        className="p-1 rounded transition-colors"
                        style={{ color: "#0176d3" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--slds-g-color-background-alt)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "transparent";
                        }}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            className="px-4 py-2 slds-text-3"
            style={{
              borderTop:
                "1px solid var(--slds-g-color-border-base-1)",
              color: "var(--slds-g-color-text-weak)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            {displayed.length} record
            {displayed.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Create / Edit / View modal */}
      <Dialog
        open={modalMode !== "none"}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent
          className="max-w-lg"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
          }}
          aria-describedby={
            isReadOnly ? undefined : "rel-modal-desc"
          }
        >
          <DialogHeader>
            <DialogTitle
              className="text-[15px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {modalMode === "create"
                ? "Create New Relationship"
                : modalMode === "edit"
                  ? "Edit Relationship"
                  : "View Relationship"}
            </DialogTitle>
            {!isReadOnly && (
              <p
                id="rel-modal-desc"
                className="slds-text-3 mt-0.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {modalMode === "create"
                  ? "Create a relationship between this organization and another constituent."
                  : "Update the saved relationship information."}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Related To */}
            <div className="space-y-1.5">
              <label
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                RELATED TO{" "}
                {!isReadOnly && (
                  <span className="text-red-600">*</span>
                )}
              </label>
              {isReadOnly ? (
                <p
                  className="slds-text-4 py-1"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {form.relatedConstituent || "—"}
                </p>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={constituentSearch}
                    onChange={(e) => {
                      setConstituentSearch(e.target.value);
                      setForm((prev) => ({
                        ...prev,
                        relatedConstituent: "",
                      }));
                      setConstituentDropOpen(true);
                    }}
                    onFocus={() => setConstituentDropOpen(true)}
                    placeholder="Search or select a constituent"
                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                    style={{
                      ...inputStyle,
                      borderColor: errors.relatedConstituent
                        ? "#c23934"
                        : "var(--slds-g-color-border-base-1)",
                    }}
                  />
                  {constituentDropOpen &&
                    filteredConstituents.length > 0 && (
                      <div
                        className="absolute z-50 top-full left-0 right-0 mt-0.5 rounded border overflow-y-auto max-h-40"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          boxShadow:
                            "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        {filteredConstituents.map((c) => (
                          <button
                            key={c}
                            type="button"
                            className="w-full text-left px-3 py-2 slds-text-4 hover:bg-[var(--slds-g-color-background-alt)]"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                relatedConstituent: c,
                              }));
                              setConstituentSearch(c);
                              setConstituentDropOpen(false);
                              if (errors.relatedConstituent)
                                setErrors((prev) => ({
                                  ...prev,
                                  relatedConstituent: undefined,
                                }));
                            }}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              )}
              {errors.relatedConstituent && (
                <p style={errStyle}>
                  {errors.relatedConstituent}
                </p>
              )}
              {!isReadOnly && (
                <button
                  type="button"
                  className="slds-text-3 font-medium hover:underline"
                  style={{ color: "#145F33" }}
                  onClick={() => {
                    setConstituentDropOpen(false);
                    setAddConstOpen(true);
                  }}
                >
                  + Add New Constituent
                </button>
              )}
            </div>

            {/* Relationship */}
            <div className="space-y-1.5">
              <label
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                RELATIONSHIP{" "}
                {!isReadOnly && (
                  <span className="text-red-600">*</span>
                )}
              </label>
              {isReadOnly ? (
                <p
                  className="slds-text-4 py-1"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {form.relationship || "—"}
                </p>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={relSearch}
                    onChange={(e) => {
                      setRelSearch(e.target.value);
                      setForm((prev) => ({
                        ...prev,
                        relationship: "",
                      }));
                      setRelDropOpen(true);
                    }}
                    onFocus={() => setRelDropOpen(true)}
                    placeholder="Select relationship"
                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                    style={{
                      ...inputStyle,
                      borderColor: errors.relationship
                        ? "#c23934"
                        : "var(--slds-g-color-border-base-1)",
                    }}
                  />
                  {relDropOpen &&
                    filteredRelTypes.length > 0 && (
                      <div
                        className="absolute z-50 top-full left-0 right-0 mt-0.5 rounded border overflow-y-auto max-h-40"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          boxShadow:
                            "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        {filteredRelTypes.map((t) => (
                          <button
                            key={t}
                            type="button"
                            className="w-full text-left px-3 py-2 slds-text-4 hover:bg-[var(--slds-g-color-background-alt)]"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                relationship: t,
                              }));
                              setRelSearch(t);
                              setRelDropOpen(false);
                              if (errors.relationship)
                                setErrors((prev) => ({
                                  ...prev,
                                  relationship: undefined,
                                }));
                            }}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              )}
              {errors.relationship && (
                <p style={errStyle}>{errors.relationship}</p>
              )}
            </div>

            {/* Start Date / End Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  START DATE{" "}
                  {!isReadOnly && (
                    <span className="text-red-600">*</span>
                  )}
                </label>
                {isReadOnly ? (
                  <p
                    className="slds-text-4 py-1"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {form.startDate || "—"}
                  </p>
                ) : (
                  <input
                    type="text"
                    value={form.startDate}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }));
                      if (errors.startDate)
                        setErrors((prev) => ({
                          ...prev,
                          startDate: undefined,
                        }));
                    }}
                    placeholder="MM/DD/YYYY"
                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                    style={{
                      ...inputStyle,
                      borderColor: errors.startDate
                        ? "#c23934"
                        : "var(--slds-g-color-border-base-1)",
                    }}
                  />
                )}
                {errors.startDate && (
                  <p style={errStyle}>{errors.startDate}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  END DATE
                </label>
                {isReadOnly ? (
                  <p
                    className="slds-text-4 py-1"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {form.endDate || "—"}
                  </p>
                ) : (
                  <input
                    type="text"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    placeholder="MM/DD/YYYY"
                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                    style={inputStyle}
                  />
                )}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-1.5">
              <label
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                COMMENTS AND OTHER RELATIONSHIP DETAILS
              </label>
              {isReadOnly ? (
                <p
                  className="slds-text-4 py-1"
                  style={{
                    color: form.comments
                      ? "var(--slds-g-color-text-default)"
                      : "var(--slds-g-color-text-weak)",
                  }}
                >
                  {form.comments || "—"}
                </p>
              ) : (
                <textarea
                  value={form.comments}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      comments: e.target.value,
                    }))
                  }
                  placeholder="Enter comments or additional relationship details"
                  rows={3}
                  className="w-full px-3 py-2 rounded slds-text-4 focus:outline-none resize-none"
                  style={inputStyle}
                />
              )}
            </div>
          </div>

          <DialogFooter>
            {isReadOnly ? (
              <Button
                variant="outline"
                className="h-9 px-5 rounded-full slds-text-4"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                }}
                onClick={closeModal}
              >
                Close
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="h-9 px-5 rounded-full slds-text-4"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                  onClick={closeModal}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="h-9 px-5 rounded-full slds-text-4 font-medium text-white"
                  style={{ backgroundColor: "#145F33" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "#0e4524";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "#145F33";
                  }}
                >
                  {modalMode === "create"
                    ? "Create Relationship"
                    : "Save Changes"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Constituent mini-modal */}
      <Dialog
        open={addConstOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAddConstOpen(false);
            setNewConstName("");
            setAddConstError("");
          }
        }}
      >
        <DialogContent
          className="max-w-sm"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
          }}
          aria-describedby="add-const-desc"
        >
          <DialogHeader>
            <DialogTitle
              className="text-[14px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Add New Constituent
            </DialogTitle>
            <p
              id="add-const-desc"
              className="slds-text-3"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Create a new constituent and link them to this
              relationship.
            </p>
          </DialogHeader>
          <div className="space-y-1.5 py-1">
            <label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              CONSTITUENT NAME{" "}
              <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={newConstName}
              onChange={(e) => {
                setNewConstName(e.target.value);
                if (addConstError) setAddConstError("");
              }}
              placeholder="Enter constituent name"
              className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
              style={{
                ...inputStyle,
                borderColor: addConstError
                  ? "#c23934"
                  : "var(--slds-g-color-border-base-1)",
              }}
            />
            {addConstError && (
              <p style={errStyle}>{addConstError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="h-9 px-4 rounded-full slds-text-4"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
              }}
              onClick={() => {
                setAddConstOpen(false);
                setNewConstName("");
                setAddConstError("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNewConstituent}
              className="h-9 px-4 rounded-full slds-text-4 font-medium text-white"
              style={{ backgroundColor: "#145F33" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "#0e4524";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "#145F33";
              }}
            >
              Create & Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Connections view (Organization) ──────────────────────────────────────────

interface OrgConnRecord {
  id: string;
  type: string;
  status?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  attended: boolean;
  participants: string;
  programs: string;
  homeVisit: boolean;
  department?: string;
  location?: string;
  language?: string;
  languageOther?: string;
  summary?: string;
  transitionRelated?: boolean;
  serviceCoordination?: boolean;
  sessionType?: string;
  therapySessionVariant?: string;
  mood?: string;
  affect?: string;
  behavior?: string;
  themesAddressed?: string;
  description?: string;
  plan?: string;
  treatmentTargets?: string[];
  meetingSummary?: string;
  individualParticipantNotes?: any[];
  newMedicationPrescribed?: boolean;
  finalized?: boolean;
}

const ORG_CONN_TYPES = [
  "Individual Info Session",
  "Group Info Session",
  "Admissions Clinical Assessment",
  "Advocate Meeting",
  "Care Planning Meeting",
  "Collaborative Event",
  "Community Care Contact",
  "Employee Site Visit",
  "Family Event",
  "Family Partnership Meeting",
  "Staff Meeting",
  "Therapy Session",
  "Transition Meeting",
];
const ORG_CONN_PROGRAMS = [
  "Residential",
  "Family Services",
  "Foster Care",
  "Transitional Living",
  "Day Treatment",
];
const ORG_CONN_DEPARTMENTS = [
  "Clinical Services",
  "Family Services",
  "Admissions",
  "Education",
  "Administration",
];

const MOCK_ORG_CONNECTIONS: (OrgConnRecord & {
  orgId: number;
})[] = [
  {
    id: "C-20240101",
    orgId: 7,
    type: "Community Care Contact",
    status: "Completed",
    startDate: "04/15/2026",
    endDate: "04/15/2026",
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    attended: true,
    participants: "Emily Johnson, Sarah Chen",
    programs: "Residential",
    homeVisit: false,
    department: "Clinical Services",
  },
  {
    id: "C-20240102",
    orgId: 7,
    type: "Collaborative Event",
    status: "Scheduled",
    startDate: "05/01/2026",
    endDate: "05/01/2026",
    startTime: "02:00 PM",
    endTime: "04:00 PM",
    attended: false,
    participants: "David Thompson",
    programs: "Family Services",
    homeVisit: false,
    department: "Admissions",
  },
  {
    id: "C-20240103",
    orgId: 7,
    type: "Advocate Meeting",
    status: "Completed",
    startDate: "03/22/2026",
    endDate: "03/22/2026",
    startTime: "09:00 AM",
    endTime: "09:45 AM",
    attended: true,
    participants: "Emily Johnson",
    programs: "Residential",
    homeVisit: true,
    department: "Clinical Services",
  },
  {
    id: "C-20240104",
    orgId: 19,
    type: "Family Event",
    status: "Completed",
    startDate: "04/20/2026",
    endDate: "04/20/2026",
    startTime: "03:00 PM",
    endTime: "05:00 PM",
    attended: true,
    participants: "Robert Anderson, Maria Garcia",
    programs: "Family Services",
    homeVisit: false,
    department: "Family Services",
  },
  {
    id: "C-20240105",
    orgId: 24,
    type: "Staff Meeting",
    status: "Submitted/Finalized",
    startDate: "04/10/2026",
    endDate: "04/10/2026",
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    attended: true,
    participants: "Patricia Lee, Christopher Davis",
    programs: "Day Treatment",
    homeVisit: false,
    department: "Administration",
  },
  {
    id: "C-20240106",
    orgId: 13,
    type: "Transition Meeting",
    status: "Completed",
    startDate: "04/05/2026",
    endDate: "04/05/2026",
    startTime: "01:00 PM",
    endTime: "02:00 PM",
    attended: true,
    participants: "Rachel Clark, Lisa Taylor",
    programs: "Transitional Living",
    homeVisit: false,
    department: "Education",
  },
];

export function OrgConnectionsView({
  constituent,
}: {
  constituent: Constituent;
}) {
  const seedConns = MOCK_ORG_CONNECTIONS.filter(
    (c) => c.orgId === constituent.id,
  ).map(({ orgId: _o, ...rest }) => rest);

  const [connections, setConnections] =
    useState<OrgConnRecord[]>(seedConns);
  const [editingConnection, setEditingConnection] =
    useState<OrgConnRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewingConnection, setViewingConnection] =
    useState<OrgConnRecord | null>(null);
  const participantIdRef = useRef(100);
  const getNextParticipantId = () => ++participantIdRef.current;

  // Filter inputs
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterParticipant, setFilterParticipant] =
    useState("");
  const [filterConnection, setFilterConnection] =
    useState("all");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterDepartment, setFilterDepartment] =
    useState("all");
  const [filterKeyword, setFilterKeyword] = useState("");

  // Snapshot applied when Search is clicked
  const [applied, setApplied] = useState<{
    startDate: string;
    endDate: string;
    participant: string;
    connection: string;
    program: string;
    department: string;
    keyword: string;
  } | null>(null);

  const handleSearch = () => {
    setApplied({
      startDate: filterStartDate,
      endDate: filterEndDate,
      participant: filterParticipant,
      connection: filterConnection,
      program: filterProgram,
      department: filterDepartment,
      keyword: filterKeyword,
    });
  };

  const clearFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterParticipant("");
    setFilterConnection("all");
    setFilterProgram("all");
    setFilterDepartment("all");
    setFilterKeyword("");
    setApplied(null);
  };

  const hasActiveFilters =
    applied !== null &&
    Object.values(applied).some((v) => v !== "" && v !== "all");

  const filtered = applied
    ? connections.filter((c) => {
        if (
          applied.connection !== "all" &&
          c.type !== applied.connection
        )
          return false;
        if (
          applied.program !== "all" &&
          !c.programs.includes(applied.program)
        )
          return false;
        if (
          applied.department !== "all" &&
          c.department !== applied.department
        )
          return false;
        if (
          applied.participant &&
          !c.participants
            .toLowerCase()
            .includes(applied.participant.toLowerCase())
        )
          return false;
        if (applied.keyword) {
          const kw = applied.keyword.toLowerCase();
          if (
            !`${c.type} ${c.participants} ${c.programs} ${c.department ?? ""}`
              .toLowerCase()
              .includes(kw)
          )
            return false;
        }
        return true;
      })
    : connections;

  const noResults = applied !== null && filtered.length === 0;

  const inputStyle = {
    border: "1px solid var(--slds-g-color-border-base-1)",
    backgroundColor: "var(--slds-g-color-background-base)",
    color: "var(--slds-g-color-text-default)",
  };

  return (
    <>
      {/* Card header */}
      <div
        className="px-4 py-3 flex items-start justify-between"
        style={{
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
          backgroundColor: "var(--slds-g-color-background-alt)",
        }}
      >
        <div>
          <h3
            className="text-[13px] font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Connections
          </h3>
          <p
            className="slds-text-3 mt-0.5"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Create, manage, and search connections associated
            with this organization.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingConnection(null);
            setFormOpen(true);
          }}
          className="h-9 px-4 rounded-full slds-text-4 font-medium text-white flex-shrink-0 ml-4"
          style={{ backgroundColor: "#145F33" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0e4524";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#145F33";
          }}
        >
          + Create Connection
        </Button>
      </div>

      {/* Filter area */}
      <div
        className="px-4 py-4 space-y-4"
        style={{
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              START DATE
            </label>
            <input
              type="text"
              value={filterStartDate}
              onChange={(e) =>
                setFilterStartDate(e.target.value)
              }
              placeholder="MM/DD/YYYY"
              className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
              style={inputStyle}
            />
          </div>
          <div className="space-y-1.5">
            <label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              END DATE
            </label>
            <input
              type="text"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              placeholder="MM/DD/YYYY"
              className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
              style={inputStyle}
            />
          </div>
          <div className="space-y-1.5">
            <label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              PARTICIPANT
            </label>
            <input
              type="text"
              value={filterParticipant}
              onChange={(e) =>
                setFilterParticipant(e.target.value)
              }
              placeholder="Search participants"
              className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
              style={inputStyle}
            />
          </div>
          <div className="space-y-1.5">
            <label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              CONNECTION
            </label>
            <Select
              value={filterConnection}
              onValueChange={setFilterConnection}
            >
              <SelectTrigger
                className="h-9 slds-text-4"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <SelectValue placeholder="All Connections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="slds-text-4">
                  All Connections
                </SelectItem>
                {ORG_CONN_TYPES.map((t) => (
                  <SelectItem
                    key={t}
                    value={t}
                    className="slds-text-4"
                  >
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              PROGRAM
            </label>
            <Select
              value={filterProgram}
              onValueChange={setFilterProgram}
            >
              <SelectTrigger
                className="h-9 slds-text-4"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="slds-text-4">
                  All Programs
                </SelectItem>
                {ORG_CONN_PROGRAMS.map((p) => (
                  <SelectItem
                    key={p}
                    value={p}
                    className="slds-text-4"
                  >
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              DEPARTMENT
            </label>
            <Select
              value={filterDepartment}
              onValueChange={setFilterDepartment}
            >
              <SelectTrigger
                className="h-9 slds-text-4"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="slds-text-4">
                  All Departments
                </SelectItem>
                {ORG_CONN_DEPARTMENTS.map((d) => (
                  <SelectItem
                    key={d}
                    value={d}
                    className="slds-text-4"
                  >
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 lg:col-span-2">
            <label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              KEYWORD SEARCH
            </label>
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              />
              <input
                type="text"
                value={filterKeyword}
                onChange={(e) =>
                  setFilterKeyword(e.target.value)
                }
                placeholder="Search by keyword"
                className="h-9 w-full pl-8 pr-3 rounded slds-text-4 focus:outline-none"
                style={inputStyle}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSearch}
            className="h-9 px-5 rounded-full slds-text-4 font-medium text-white"
            style={{ backgroundColor: "#145F33" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0e4524";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#145F33";
            }}
          >
            Search
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="h-9 px-4 rounded-full slds-text-4 flex items-center gap-1.5"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
              }}
            >
              <X className="h-3 w-3" /> Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Grid / empty state */}
      {connections.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center px-6">
          <Link2
            className="h-9 w-9 mb-3"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          />
          <p
            className="slds-text-4 font-medium"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            No connections found
          </p>
          <p
            className="slds-text-3 mt-1.5 max-w-xs"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Connections associated with this organization will
            appear here.
          </p>
        </div>
      ) : noResults ? (
        <div className="py-16 flex flex-col items-center justify-center text-center px-6">
          <Search
            className="h-9 w-9 mb-3"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          />
          <p
            className="slds-text-4 font-medium"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            No matching connections found
          </p>
          <p
            className="slds-text-3 mt-1.5 max-w-xs"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Try adjusting or clearing your search filters.
          </p>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="mt-3 h-8 px-4 rounded-full slds-text-3"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                  borderBottom:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                {[
                  "ID",
                  "Start Date & Time",
                  "End Date & Time",
                  "Connection",
                  "Attended",
                  "Participants",
                  "Program(s)",
                  "Home Visit",
                  "Actions",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2.5 text-left whitespace-nowrap text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr
                  key={c.id}
                  style={{
                    borderBottom:
                      idx < filtered.length - 1
                        ? "1px solid var(--slds-g-color-border-base-1)"
                        : undefined,
                    backgroundColor:
                      idx % 2 === 0
                        ? "var(--slds-g-color-background-base)"
                        : "var(--slds-g-color-background-alt)",
                  }}
                >
                  <td
                    className="px-4 py-3 slds-text-4 whitespace-nowrap"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    {c.id}
                  </td>
                  <td
                    className="px-4 py-3 slds-text-4 whitespace-nowrap"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {c.startDate}
                    <br />
                    <span
                      className="slds-text-3"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {c.startTime}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 slds-text-4 whitespace-nowrap"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {c.endDate}
                    <br />
                    <span
                      className="slds-text-3"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {c.endTime}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {c.type}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{
                        backgroundColor: c.attended
                          ? "#e8f5e9"
                          : "#f5f5f5",
                        color: c.attended
                          ? "#1b5e20"
                          : "#424242",
                        border: `1px solid ${c.attended ? "#a5d6a7" : "#bdbdbd"}`,
                      }}
                    >
                      {c.attended ? "Yes" : "No"}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 slds-text-4 max-w-[160px]"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {c.participants}
                  </td>
                  <td
                    className="px-4 py-3 slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {c.programs}
                  </td>
                  <td className="px-4 py-3">
                    {c.homeVisit && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#1565c0",
                          border: "1px solid #90caf9",
                        }}
                      >
                        Yes
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="View Connection"
                        onClick={() => setViewingConnection(c)}
                        className="p-1 rounded transition-colors"
                        style={{ color: "#0176d3" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--slds-g-color-background-alt)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "transparent";
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Edit Connection"
                        onClick={() => {
                          setEditingConnection(c);
                          setFormOpen(true);
                        }}
                        className="p-1 rounded transition-colors"
                        style={{ color: "#0176d3" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--slds-g-color-background-alt)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "transparent";
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            className="px-4 py-2 slds-text-3 w-full d-block"
            style={{
              borderTop:
                "1px solid var(--slds-g-color-border-base-1)",
              color: "var(--slds-g-color-text-weak)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            {filtered.length} record
            {filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Connection create/edit form (reuses existing ConnectionFormDialog) */}
      <ConnectionFormDialog
        isOpen={formOpen}
        onOpenChange={setFormOpen}
        editingConnection={editingConnection as any}
        setEditingConnection={setEditingConnection as any}
        connections={connections as any}
        setConnections={setConnections as any}
        getNextParticipantId={getNextParticipantId}
        communityCareMemberContext={
          constituent.type === "Individual" &&
          hasRole(constituent, "Community Care Member")
        }
      />

      {/* View modal (read-only) */}
      {viewingConnection && (
        <Dialog
          open={!!viewingConnection}
          onOpenChange={(open) => {
            if (!open) setViewingConnection(null);
          }}
        >
          <DialogContent
            className="max-w-lg"
            style={{
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
            aria-describedby={undefined}
          >
            <DialogHeader>
              <DialogTitle
                className="text-[15px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                View Connection
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              {(
                [
                  ["ID", viewingConnection.id],
                  ["Connection Type", viewingConnection.type],
                  [
                    "Start",
                    `${viewingConnection.startDate} ${viewingConnection.startTime}`,
                  ],
                  [
                    "End",
                    `${viewingConnection.endDate} ${viewingConnection.endTime}`,
                  ],
                  [
                    "Attended",
                    viewingConnection.attended ? "Yes" : "No",
                  ],
                  [
                    "Participants",
                    viewingConnection.participants,
                  ],
                  ["Program(s)", viewingConnection.programs],
                  [
                    "Home Visit",
                    viewingConnection.homeVisit ? "Yes" : "No",
                  ],
                  [
                    "Department",
                    viewingConnection.department ?? "—",
                  ],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[140px_1fr] gap-2 items-start"
                >
                  <span
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    className="slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                className="h-9 px-5 rounded-full slds-text-4"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                }}
                onClick={() => setViewingConnection(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// ── Placeholder section ───────────────────────────────────────────────────────

function PlaceholderSection({ title }: { title: string }) {
  return (
    <div
      className="overflow-hidden"
      style={{
        border: "1px solid var(--slds-g-color-border-base-1)",
        borderRadius: "var(--slds-c-card-radius-border)",
        backgroundColor: "var(--slds-g-color-background-base)",
      }}
    >
      <div
        className="px-4 py-3"
        style={{
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
          backgroundColor: "var(--slds-g-color-background-alt)",
        }}
      >
        <h3
          className="text-[13px] font-semibold"
          style={{ color: "var(--slds-g-color-text-default)" }}
        >
          {title}
        </h3>
      </div>
      <div
        className="p-10 text-center"
        style={{ color: "var(--slds-g-color-text-weak)" }}
      >
        <p className="slds-text-4">
          No {title.toLowerCase()} on record.
        </p>
      </div>
    </div>
  );
}

// ── CCM DCFS Involvement tab (self-contained) ─────────────────────────────────

const INITIAL_DCFS_RECORDS: DCFSInvolvementRecord[] = [
  {
    id: 1,
    investigationDate: "2024-03-15",
    incidentSummary:
      "Allegation of neglect — inadequate supervision and unsafe living conditions. Home visit conducted by DCFS investigator.",
    relatedIncident: "IR-2024-0312",
    resolution: "Unsubstantiated",
    resolutionDate: "2024-04-20",
  },
  {
    id: 2,
    investigationDate: "2023-11-08",
    incidentSummary:
      "Report of physical abuse allegation. Youth disclosed during routine check-in.",
    relatedIncident: "IR-2023-1101",
    resolution: "Indicated",
    resolutionDate: "2023-12-15",
  },
];

function CcmDCFSInvolvementTab() {
  const [records, setRecords] = useState<
    DCFSInvolvementRecord[]
  >(INITIAL_DCFS_RECORDS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit" | "create">(
    "create",
  );
  const [editing, setEditing] =
    useState<DCFSInvolvementRecord | null>(null);

  function handleCreate() {
    setEditing(null);
    setMode("create");
    setDialogOpen(true);
  }

  function handleView(r: DCFSInvolvementRecord) {
    setEditing(r);
    setMode("view");
    setDialogOpen(true);
  }

  function handleEdit(r: DCFSInvolvementRecord) {
    setEditing(r);
    setMode("edit");
    setDialogOpen(true);
  }

  function handleDelete(id: number) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  function handleSave(
    record:
      Omit<DCFSInvolvementRecord, "id"> | DCFSInvolvementRecord,
  ) {
    if ("id" in record) {
      setRecords((prev) =>
        prev.map((r) => (r.id === record.id ? record : r)),
      );
    } else {
      const newId =
        Math.max(...records.map((r) => r.id), 0) + 1;
      setRecords((prev) => [...prev, { ...record, id: newId }]);
    }
    setDialogOpen(false);
  }

  return (
    <div
      className="overflow-hidden"
      style={{
        border: "1px solid var(--slds-g-color-border-base-1)",
        borderRadius: "var(--slds-c-card-radius-border)",
        backgroundColor: "var(--slds-g-color-background-base)",
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
          backgroundColor: "var(--slds-g-color-background-alt)",
        }}
      >
        <h3
          className="text-[13px] font-semibold"
          style={{ color: "var(--slds-g-color-text-default)" }}
        >
          DCFS Involvement
        </h3>
        <Button
          size="sm"
          onClick={handleCreate}
          className="h-7 text-[11px] rounded-full bg-[#145F33] hover:bg-[#0f4a26] text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          Create New
        </Button>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[900px]">
            <thead>
              <tr
                style={{
                  backgroundColor:
                    "var(--slds-g-color-neutral-95)",
                }}
              >
                {[
                  "Investigation Date",
                  "Incident Summary",
                  "Related Incident",
                  "Resolution",
                  "Resolution Date",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2.5 font-semibold uppercase text-[11px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-8 text-center"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    No DCFS involvement records found. Click
                    "Create New" to add a record.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr
                    key={r.id}
                    style={{
                      borderTop:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td
                      className="px-3 py-3 whitespace-nowrap"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {r.investigationDate
                        ? formatMdy(
                            new Date(r.investigationDate),
                          )
                        : "—"}
                    </td>
                    <td
                      className="px-3 py-3 max-w-[260px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      <div className="line-clamp-2">
                        {r.incidentSummary}
                      </div>
                    </td>
                    <td
                      className="px-3 py-3"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {r.relatedIncident || "—"}
                    </td>
                    <td
                      className="px-3 py-3"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {r.resolution || "—"}
                    </td>
                    <td
                      className="px-3 py-3 whitespace-nowrap"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {r.resolutionDate
                        ? formatMdy(new Date(r.resolutionDate))
                        : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(r)}
                          className="text-[11px] font-medium hover:underline"
                          style={{ color: "#0176d3" }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(r)}
                          className="text-[11px] font-medium hover:underline"
                          style={{ color: "#0176d3" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-[11px] font-medium hover:underline"
                          style={{ color: "#c23934" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <DCFSInvolvementDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        editingRecord={editing}
        mode={mode}
      />
    </div>
  );
}

// ── Main page component ───────────────────────────────────────────────────────

interface Props {
  constituent: Constituent;
  onBack: () => void;
  /** Deep link (?section=pass): open on the Pass section. Honored only when
   *  the saved record is eligible for it. */
  initialSection?: "pass";
}

export function OrganizationConstituentDetailPage({
  constituent,
  onBack,
  initialSection,
}: Props) {
  const navigate = useNavigate();
  // Pass is a General section for Individuals whose saved role is Youth or
  // Community Care Member only; navigation AND content are gated on it.
  const passEnabled = isPassTabConstituent(constituent);
  const [activeTab, setActiveTab] = useState<NavTab>(
    initialSection === "pass" && passEnabled
      ? "pass"
      : "constituentDetails",
  );
  const [generalExpanded, setGeneralExpanded] = useState(true);
  const [educationExpanded, setEducationExpanded] =
    useState(false);
  const [communityExpanded, setCommunityExpanded] =
    useState(false);
  const [
    educationVocationExpanded,
    setEducationVocationExpanded,
  ] = useState(false);
  const [programExpanded, setProgramExpanded] = useState(false);
  const [
    treatmentPlanningExpanded,
    setTreatmentPlanningExpanded,
  ] = useState(false);

  const isIndividual = constituent.type === "Individual";
  const isCommunityCareMember =
    isIndividual && hasRole(constituent, "Community Care Member");
  // Contact Log tab: the shared Activity Timeline (with its own Add Log),
  // held in this profile's state. The page is remounted per constituent, so
  // nothing carries over to another member.
  const [memberLogs, setMemberLogs] = useState<TimelineActivity[]>([]);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  // Add Log: the same Contact Log dialog the Youth profile opens (the
  // timeline's built-in dialog can't save). The entry goes to the existing
  // CONTACT_LOGS list, with this member as the candidate, and into this
  // profile's timeline.
  const handleMemberLogSubmit = (data: any) => {
    const caller =
      `${data.callerFirstName} ${data.callerLastName}`.trim();
    const details = `${data.contactType || "Contact"} - ${data.contactResult || "No result specified"}${data.notes ? "\n" + data.notes : ""}`;
    CONTACT_LOGS.unshift({
      id: `CL-${String(CONTACT_LOGS.length + 1).padStart(3, "0")}`,
      referralDate: data.contactDate,
      caller,
      candidate: constituent.name,
      phone: data.callerPhone,
      language: data.language,
      details,
      needsFollowUp: data.needsFollowUp ? "Yes" : "No",
      promoted: false,
      mostRecentHistory: localTodayIso(),
    });
    setMemberLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        type: "note",
        title: data.contactType || "Contact",
        description: `logged: "${data.notes || details}"`,
        user: getDemoUserName(),
        timestamp: `${data.contactDate}T12:00:00.000Z`,
        status: "completed",
        category: data.category
          ?.toLowerCase()
          .replace(/\s+/g, "_"),
      },
      ...prev,
    ]);
    toast.success("Contact log created successfully");
  };
  const isContractor =
    isIndividual && constituent.role === "Contractor";
  const isInstructor =
    isIndividual && constituent.role === "Instructor";
  const hasOwnedRecords = isContractor || isInstructor;
  const baseGeneralTabs = hasOwnedRecords
    ? GENERAL_TABS_WITH_DOCUMENTS
    : GENERAL_TABS;
  const generalTabs = passEnabled
    ? [
        ...baseGeneralTabs,
        { id: "pass" as NavTab, label: "Pass" },
      ]
    : baseGeneralTabs;
  // Stable owner identity for the owner-scoped Documents, Credentials and
  // Specialties tabs (Contractor, Instructor).
  const recordOwner = hasOwnedRecords
    ? { id: String(constituent.id), name: constituent.name }
    : undefined;
  // Documents: the same owner-scoped Documents area Contractors and
  // Instructors use, keyed by the stable Constituent ID.
  const documentsOwner =
    recordOwner ??
    (isCommunityCareMember
      ? { id: String(constituent.id), name: constituent.name }
      : undefined);

  const GENERAL_ACTIVE = generalTabs.some(
    (t) => t.id === activeTab,
  );

  const navBtn = (
    id: NavTab,
    label: string,
    isChild = false,
  ) => (
    <button
      key={id}
      onClick={() => setActiveTab(id)}
      className={`w-full text-left rounded transition-colors ${
        isChild
          ? `pl-6 pr-3 py-1.5 text-[12px] ${activeTab === id ? "text-[#145F33] font-semibold" : "font-medium"}`
          : `px-3 py-2 text-[13px] font-medium ${activeTab === id ? "bg-[#145F33] text-white" : "text-[#080707] hover:bg-[#f3f3f3]"}`
      }`}
      style={
        isChild && activeTab !== id
          ? { color: "var(--slds-g-color-text-weak)" }
          : undefined
      }
    >
      {label}
    </button>
  );

  const statusCfg = {
    Active: {
      dot: "#2e7d32",
      bg: "#e8f5e9",
      text: "#1b5e20",
      border: "#a5d6a7",
    },
    Inactive: {
      dot: "#757575",
      bg: "#f5f5f5",
      text: "#424242",
      border: "#bdbdbd",
    },
    Pending: {
      dot: "#e65100",
      bg: "#fff3e0",
      text: "#bf360c",
      border: "#ffcc80",
    },
  }[constituent.status] ?? {
    dot: "#546e7a",
    bg: "#eceff1",
    text: "#37474f",
    border: "#b0bec5",
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4"
      style={{
        backgroundColor: "var(--slds-g-color-background-alt-2)",
      }}
    >
      {/* ── Page Header ── */}
      <div
        className="px-6 py-4 shadow-sm shrink-0"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        {/* Breadcrumb */}
        <div
          className="flex items-center gap-2 text-[14px] mb-3"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          <span
            className="hover:text-[#014486] hover:underline cursor-pointer transition-colors"
            onClick={onBack}
          >
            Constituents
          </span>
          <ChevronRight className="h-3 w-3" />
          <span
            className="font-medium"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            {constituent.name}
          </span>
        </div>

        {/* Profile row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ backgroundColor: "#145F33" }}
            >
              {isIndividual ? (
                <User className="h-6 w-6" />
              ) : (
                <Building2 className="h-6 w-6" />
              )}
            </div>

            <div>
              {/* Name + status badge */}
              <div className="flex items-center gap-3 mb-1">
                <h1
                  className="text-[20px] font-bold"
                  style={{ color: "#080707" }}
                >
                  {constituent.name}
                </h1>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: statusCfg.bg,
                    border: `1px solid ${statusCfg.border}`,
                    fontSize: "11px",
                    fontWeight: 600,
                    color: statusCfg.text,
                    letterSpacing: "0.02em",
                    lineHeight: 1,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: statusCfg.dot,
                      display: "inline-block",
                    }}
                  />
                  {constituent.status}
                </span>
              </div>

              {/* Meta row */}
              <div
                className="flex items-center gap-2 text-[13px]"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {isIndividual ? (
                  <User className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                )}
                <span
                  className="font-medium"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {isIndividual ? "Individual" : "Organization"}
                </span>
                <span style={{ color: "#c9c7c5" }}>•</span>
                <span className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="font-medium text-[11px]"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {constituent.role}
                  </Badge>
                </span>
                {constituent.startDate && (
                  <>
                    <span style={{ color: "#c9c7c5" }}>•</span>
                    <span>Since {constituent.startDate}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content: left nav + main ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex h-full">
          {/* LEFT NAV */}
          <div
            className="w-52 lg:w-64 border-r overflow-y-auto shrink-0"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            {/* pb-12 clears the fixed UtilityBar (matches LeadDetailView). */}
            <div className="p-4 pb-12 space-y-1">
              {constituent.role ===
              "Community Care Manager of Care Coordination" ? (
                <>
                  {/* General → Campus Restrictions */}
                  <button
                    onClick={() =>
                      setGeneralExpanded((prev) => !prev)
                    }
                    className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium rounded transition-colors ${
                      activeTab === "campusRestrictions"
                        ? "bg-[#145F33] text-white"
                        : "text-[#080707] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    <span>General</span>
                    {generalExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                  {generalExpanded && (
                    <div className="mt-1 space-y-0.5">
                      {navBtn(
                        "campusRestrictions",
                        "Campus Restrictions",
                        true,
                      )}
                    </div>
                  )}

                  {/* Program → DCFS Involvement */}
                  <div className="pt-1">
                    <button
                      onClick={() =>
                        setProgramExpanded((prev) => !prev)
                      }
                      className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium rounded transition-colors ${
                        activeTab === "dcfsInvolvement"
                          ? "bg-[#145F33] text-white"
                          : "text-[#080707] hover:bg-[#f3f3f3]"
                      }`}
                    >
                      <span>Program</span>
                      {programExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                    </button>
                    {programExpanded && (
                      <div className="mt-1 space-y-0.5">
                        {navBtn(
                          "dcfsInvolvement",
                          "DCFS Involvement",
                          true,
                        )}
                      </div>
                    )}
                  </div>

                  {/* Treatment Planning */}
                  <div className="pt-1">
                    <button
                      onClick={() =>
                        setTreatmentPlanningExpanded(
                          (prev) => !prev,
                        )
                      }
                      className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium rounded transition-colors ${
                        activeTab === "ptp" ||
                        activeTab === "goals" ||
                        activeTab === "copingSkills" ||
                        activeTab === "triggers" ||
                        activeTab === "strengths" ||
                        activeTab === "supplementalPlans" ||
                        activeTab === "itp" ||
                        activeTab === "transitionPlanning"
                          ? "bg-[#145F33] text-white"
                          : "text-[#080707] hover:bg-[#f3f3f3]"
                      }`}
                    >
                      <span>Treatment Planning</span>
                      {treatmentPlanningExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                    </button>
                    {treatmentPlanningExpanded && (
                      <div className="mt-1 space-y-0.5">
                        {navBtn("ptp", "PTP", true)}
                        {navBtn("goals", "Goals", true)}
                        {navBtn(
                          "copingSkills",
                          "Coping Skills",
                          true,
                        )}
                        {navBtn("triggers", "Triggers", true)}
                        {navBtn("strengths", "Strengths", true)}
                        {navBtn(
                          "supplementalPlans",
                          "Supplemental Plans",
                          true,
                        )}
                        {navBtn("itp", "ITP", true)}
                        {navBtn(
                          "transitionPlanning",
                          "Transition Planning",
                          true,
                        )}
                      </div>
                    )}
                  </div>

                  {/* Education and Vocation */}
                  <div className="pt-1">
                    <button
                      onClick={() =>
                        setEducationVocationExpanded(
                          (prev) => !prev,
                        )
                      }
                      className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium rounded transition-colors ${
                        activeTab === "academics" ||
                        activeTab === "tutorMatches" ||
                        activeTab === "tutorScheduledSessions"
                          ? "bg-[#145F33] text-white"
                          : "text-[#080707] hover:bg-[#f3f3f3]"
                      }`}
                    >
                      <span>Education and Vocation</span>
                      {educationVocationExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                    </button>
                    {educationVocationExpanded && (
                      <div className="mt-1 space-y-0.5">
                        {navBtn("academics", "Academics", true)}
                        {navBtn(
                          "tutorMatches",
                          "Tutor Matches",
                          true,
                        )}
                        {navBtn(
                          "tutorScheduledSessions",
                          "Tutor Scheduled Sessions",
                          true,
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* General (expandable group) */}
                  <button
                    onClick={() =>
                      setGeneralExpanded((prev) => !prev)
                    }
                    className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium rounded transition-colors ${
                      GENERAL_ACTIVE
                        ? "bg-[#145F33] text-white"
                        : "text-[#080707] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    <span>General</span>
                    {generalExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {generalExpanded && (
                    <div className="mt-1 space-y-0.5">
                      {generalTabs.map((t) =>
                        navBtn(t.id, t.label, true),
                      )}
                    </div>
                  )}

                  {/* Education and Vocation — Organization only */}
                  {!isIndividual &&
                    (constituent.role === "School" ||
                    constituent.role === "PSO Organization" ? (
                      <div className="pt-1">
                        <button
                          onClick={() =>
                            setEducationExpanded(
                              (prev) => !prev,
                            )
                          }
                          className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium rounded transition-colors ${
                            EDUCATION_CHILDREN.includes(
                              activeTab,
                            )
                              ? "bg-[#145F33] text-white"
                              : "text-[#080707] hover:bg-[#f3f3f3]"
                          }`}
                        >
                          <span>Education and Vocation</span>
                          {educationExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                          )}
                        </button>
                        {educationExpanded && (
                          <div className="mt-1 space-y-0.5">
                            {navBtn(
                              "academicCourses",
                              "Academic Courses",
                              true,
                            )}
                            {navBtn(
                              "academicLevels",
                              "Academic Levels",
                              true,
                            )}
                            {navBtn(
                              "academicTerms",
                              "Academic Terms",
                              true,
                            )}
                            {constituent.role ===
                              "PSO Organization" &&
                              navBtn(
                                "postSecondaryOptions",
                                "Post Secondary Options",
                                true,
                              )}
                            {navBtn(
                              "employment",
                              "Employment",
                              true,
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="pt-1">
                        {navBtn(
                          "education",
                          "Education and Vocation",
                        )}
                      </div>
                    ))}

                  {/* Employment (non-School, non-PSO orgs only) — Organization only */}
                  {!isIndividual &&
                    constituent.role !== "School" &&
                    constituent.role !== "PSO Organization" && (
                      <div>
                        {navBtn("employment", "Employment")}
                      </div>
                    )}

                  {/* Community (Community Referral Organization only) */}
                  {!isIndividual &&
                    constituent.role ===
                      "Community Referral Organization" && (
                      <div className="pt-1">
                        <button
                          onClick={() =>
                            setCommunityExpanded(
                              (prev) => !prev,
                            )
                          }
                          className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium rounded transition-colors ${
                            activeTab ===
                            "communityReferralDetails"
                              ? "bg-[#145F33] text-white"
                              : "text-[#080707] hover:bg-[#f3f3f3]"
                          }`}
                        >
                          <span>Community</span>
                          {communityExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                          )}
                        </button>
                        {communityExpanded && (
                          <div className="mt-1 space-y-0.5">
                            {navBtn(
                              "communityReferralDetails",
                              "Community Referral Details",
                              true,
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  {/* Education and Vocation — Individual roles only */}
                  {isIndividual && (
                    <div className="pt-1">
                      <button
                        onClick={() =>
                          setEducationVocationExpanded(
                            (prev) => !prev,
                          )
                        }
                        className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium rounded transition-colors ${
                          activeTab === "credentials" ||
                          activeTab === "specialty" ||
                          activeTab === "classSessions" ||
                          activeTab === "tutorMatches" ||
                          activeTab === "tutorScheduledSessions"
                            ? "bg-[#145F33] text-white"
                            : "text-[#080707] hover:bg-[#f3f3f3]"
                        }`}
                      >
                        <span className="text-left">
                          Education and Vocation
                        </span>
                        {educationVocationExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                        )}
                      </button>
                      {educationVocationExpanded && (
                        <div className="mt-1 space-y-0.5">
                          {navBtn(
                            "credentials",
                            "Credentials",
                            true,
                          )}
                          {isInstructor &&
                            navBtn(
                              "classSessions",
                              "Class Sessions",
                              true,
                            )}
                          {navBtn(
                            "specialty",
                            hasOwnedRecords
                              ? "Specialties"
                              : "Specialty",
                            true,
                          )}
                          {constituent.role === "Tutor" && (
                            <>
                              {navBtn(
                                "tutorMatches",
                                "Tutor Matches",
                                true,
                              )}
                              {navBtn(
                                "tutorScheduledSessions",
                                "Tutor Scheduled Sessions",
                                true,
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* MAIN CONTENT. Extra bottom padding clears the fixed 40px
              UtilityBar (To Do List / History / Notes), which overlays the
              bottom of the viewport, so the last section (Community Care
              and Save Notes) is never hidden behind it — same approach as
              ProgramRecordPage / TutorModule. */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 pt-6 pb-16 w-full">
              {isCommunityCareMember && (
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as NavTab)}
                  className="mb-4"
                >
                  <TabsList
                    variant="underline"
                    aria-label="Community Care Member sections"
                  >
                    {COMMUNITY_CARE_MEMBER_TABS.map((t) => (
                      <TabsTrigger
                        key={t.id}
                        value={t.id}
                        variant="underline"
                        size="sm"
                      >
                        {t.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}
              {activeTab === "cpi" && isCommunityCareMember && (
                <CPIEligibilitySection />
              )}
              {activeTab === "contactLog" && isCommunityCareMember && (
                <div style={{ minHeight: "600px" }}>
                  <ActivityTimeline
                    activities={memberLogs}
                    onAddActivity={(a) =>
                      setMemberLogs((prev) => [a, ...prev])
                    }
                    onOpenNewLogDialog={() => setLogDialogOpen(true)}
                    embedded
                  />
                  <ContactLogDialogSLDS
                    isOpen={logDialogOpen}
                    onClose={() => setLogDialogOpen(false)}
                    onSubmit={handleMemberLogSubmit}
                  />
                </div>
              )}
              {activeTab === "constituentDetails" && (
                <OrgconstituentDetailsView
                  constituent={constituent}
                />
              )}
              {activeTab === "contact" && (
                <ConstituentContactView
                  seed={mentorContactSeed(constituent)}
                />
              )}
              {activeTab === "roles" && (
                <div className="space-y-4">
                  <OrgConstituentRolesView
                    constituent={constituent}
                  />
                  {/* MHBG Staff Title Assignments (20127): Individuals with
                      the saved MHBG Staff role only. Keyed by constituent so
                      no editor carries over to another profile. */}
                  {constituent.type === "Individual" &&
                    constituent.role === "MHBG Staff" && (
                      <StaffTitleAssignmentsSection
                        key={`title-assignments-${constituent.id}`}
                        constituentId={constituent.id}
                      />
                    )}
                </div>
              )}
              {activeTab === "relationships" && (
                <div
                  className="overflow-hidden"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    borderRadius:
                      "var(--slds-c-card-radius-border)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <OrgRelationshipsView
                    constituent={constituent}
                  />
                </div>
              )}
              {activeTab === "connections" && (
                <div
                  className="overflow-hidden"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    borderRadius:
                      "var(--slds-c-card-radius-border)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <OrgConnectionsView
                    constituent={constituent}
                  />
                </div>
              )}
              {activeTab === "pass" && passEnabled && (
                <ConstituentPassWorkspace
                  key={constituent.id}
                  constituentId={constituent.id}
                />
              )}
              {activeTab === "documents" && documentsOwner && (
                <DocumentsSection
                  ownerId={documentsOwner.id}
                  ownerName={documentsOwner.name}
                  scoped
                />
              )}
              {activeTab === "credentials" && (
                <LeadDetailCredentialsTab
                  owner={recordOwner}
                  allowDelete={isInstructor}
                  saveAndStay={isInstructor}
                />
              )}
              {activeTab === "classSessions" &&
                isInstructor && (
                  <InstructorClassSessionsTab
                    instructor={{
                      id: constituent.id,
                      name: constituent.name,
                    }}
                  />
                )}
              {activeTab === "specialty" && (
                <LeadDetailSpecialtyTab
                  owner={recordOwner}
                  dateLabel={isInstructor ? "Date" : undefined}
                />
              )}
              {activeTab === "tutorMatches" && (
                <LeadDetailTutorMatchesTab
                  tutor={{
                    id: `constituent:${constituent.id}`,
                    name: constituent.name,
                  }}
                />
              )}
              {activeTab === "tutorScheduledSessions" && (
                <LeadDetailTutorScheduledSessionsTab
                  tutor={{
                    id: `constituent:${constituent.id}`,
                    name: constituent.name,
                  }}
                />
              )}
              {/* Community Care Manager of Care Coordination tabs */}
              {activeTab === "campusRestrictions" && (
                <CampusRestrictionsSection />
              )}
              {activeTab === "dcfsInvolvement" && (
                <CcmDCFSInvolvementTab />
              )}
              {activeTab === "ptp" && (
                <TreatmentPlanningView
                  initialSubSection="ptp"
                  hiddenTabs={["traumaHistory"]}
                />
              )}
              {activeTab === "goals" && (
                <TreatmentPlanningView
                  initialSubSection="goals"
                  hiddenTabs={["traumaHistory"]}
                />
              )}
              {activeTab === "copingSkills" && (
                <TreatmentPlanningView
                  initialSubSection="copingSkills"
                  hiddenTabs={["traumaHistory"]}
                />
              )}
              {activeTab === "triggers" && (
                <TreatmentPlanningView
                  initialSubSection="triggers"
                  hiddenTabs={["traumaHistory"]}
                />
              )}
              {activeTab === "strengths" && (
                <TreatmentPlanningView
                  initialSubSection="strengths"
                  hiddenTabs={["traumaHistory"]}
                />
              )}
              {activeTab === "supplementalPlans" && (
                <TreatmentPlanningView
                  initialSubSection="supplementalPlans"
                  hiddenTabs={["traumaHistory"]}
                />
              )}
              {activeTab === "itp" && <ITPModule openInModal />}
              {activeTab === "transitionPlanning" && (
                <TransitionPlanningSection />
              )}
              {activeTab === "academics" && (
                <YouthAcademicsView />
              )}
              {activeTab === "education" && (
                <EducationCareerView />
              )}
              {activeTab === "academicCourses" && (
                <AcademicCoursesView />
              )}
              {activeTab === "academicLevels" && (
                <AcademicLevelsView />
              )}
              {activeTab === "academicTerms" && (
                <AcademicTermsView />
              )}
              {activeTab === "postSecondaryOptions" && (
                <PostSecondaryOptionsView />
              )}
              {activeTab === "communityReferralDetails" && (
                <CommunityReferralGeneralView
                  orgName={constituent.name}
                />
              )}
              {activeTab === "employment" && (
                <div
                  className="overflow-hidden"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    borderRadius:
                      "var(--slds-c-card-radius-border)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <div
                    className="px-4 py-3"
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <h3
                      className="text-[13px] font-semibold"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      Employment
                    </h3>
                    <p
                      className="slds-text-3 mt-0.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      View constituents employed by this
                      organization. Employment information is
                      maintained on the associated Individual
                      Constituent records.
                    </p>
                  </div>
                  <OrgEmploymentView
                    constituent={constituent}
                    onSelectConstituent={(id) =>
                      navigate(`/constituents/${id}`)
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}