import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Users,
  RefreshCw,
  X,
  UserCheck,
  UserX,
  Clock,
  Plus,
  Building2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "@/app/lib/lucide-icons";
import { useNavigate } from "react-router";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { toast } from "sonner@2.0.3";
import {
  CONSTITUENTS,
  Constituent,
  getUniquePrograms,
  getUniqueTypes,
  getUniqueRoles,
  getUniqueStatuses,
  getConstituentStatus,
} from "../../data/mockConstituents";
import { formatMdy, localTodayIso } from "../../lib/dateFormat";
// Brings constituents created from Mentor Applications into CONSTITUENTS
// as soon as this page loads (side-effect import).
import "../../data/ffMentorApplicationStore";
import {
  contractorRoleLabel,
  useAllContractorDetails,
} from "../../data/contractorDetailsStore";
import { DateInput } from "../ui/date-input";
import { MultiSelect } from "../ui/multi-select";
import { OverflowList } from "../ui/overflow-list";
import {
  COMMUNITY_NEED_OPTIONS,
  distinctNeeds,
  useAllCommunityCare,
} from "../../data/communityNeedsStore";

const ORG_ROLES = [
  "Community Referral Organization",
  "Employer",
  "Organization",
  "PSO Organization",
  "School",
] as const;

const INDIVIDUAL_ROLES = [
  "Case Manager",
  "Community Care Member",
  //"Community Care Manager of Care Coordination",
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
  "Youth",
] as const;

export default function Constituents() {
  const navigate = useNavigate();

  // ── Create modal state ──────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<
    "Individual" | "Organization"
  >("Individual");

  // Individual fields
  const [createFirstName, setCreateFirstName] = useState("");
  const [createLastName, setCreateLastName] = useState("");
  const [createIndividualRole, setCreateIndividualRole] =
    useState("");

  // Organization fields
  const [createOrgName, setCreateOrgName] = useState("");
  const [createOrgRole, setCreateOrgRole] = useState("");
  const [createStartDate, setCreateStartDate] = useState("");

  const [createErrors, setCreateErrors] = useState<
    Record<string, string>
  >({});
  const [createTouched, setCreateTouched] = useState<
    Record<string, boolean>
  >({});
  const [createSaving, setCreateSaving] = useState(false);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const orgNameRef = useRef<HTMLInputElement>(null);

  // ── Duplicate detection modal ───────────────────────────────────────
  const [dupOpen, setDupOpen] = useState(false);
  const [dupMatches, setDupMatches] = useState<Constituent[]>(
    [],
  );
  const [dupSelected, setDupSelected] = useState<number | null>(
    null,
  );

  const resetCreateForm = () => {
    setCreateType("Individual");
    setCreateFirstName("");
    setCreateLastName("");
    setCreateIndividualRole("");
    setCreateOrgName("");
    setCreateOrgRole("");
    setCreateStartDate("");
    setCreateErrors({});
    setCreateTouched({});
    setCreateSaving(false);
  };

  const openCreateModal = () => {
    resetCreateForm();
    setCreateOpen(true);
  };

  useEffect(() => {
    if (createOpen) {
      setTimeout(() => {
        if (createType === "Organization")
          orgNameRef.current?.focus();
        else firstNameRef.current?.focus();
      }, 50);
    }
  }, [createOpen, createType]);

  // ── Validation ──────────────────────────────────────────────────────
  const validateIndividual = () => ({
    firstName: createFirstName.trim()
      ? ""
      : "First Name is required.",
    lastName: createLastName.trim()
      ? ""
      : "Last Name is required.",
    individualRole: createIndividualRole.trim()
      ? ""
      : "Role is required.",
  });

  const validateOrganization = () => ({
    constituentType: "",
    orgName: createOrgName.trim()
      ? ""
      : "Organization Name is required.",
    orgRole: createOrgRole.trim() ? "" : "Role is required.",
    startDate: createStartDate.trim()
      ? ""
      : "Start Date is required.",
  });

  const handleBlur = (field: string) => {
    setCreateTouched((prev) => ({ ...prev, [field]: true }));
    const errs =
      createType === "Organization"
        ? validateOrganization()
        : validateIndividual();
    setCreateErrors(errs);
  };

  // ── Persist a new record and navigate ──────────────────────────────
  const doCreateOrg = () => {
    const newId =
      Math.max(...CONSTITUENTS.map((c) => c.id)) + 1;
    const today = localTodayIso();
    const newConstituent: Constituent = {
      id: newId,
      name: createOrgName.trim(),
      orgName: createOrgName.trim(),
      type: "Organization",
      role: createOrgRole as Constituent["role"],
      status: "Active",
      program: "—",
      lastUpdated: today,
      startDate: createStartDate.trim(),
    };
    CONSTITUENTS.unshift(newConstituent);
    setCreateOpen(false);
    setDupOpen(false);
    toast.success(
      "Organization constituent created successfully.",
    );
    navigate(`/constituents/${newId}`);
  };

  // ── Save handler ────────────────────────────────────────────────────
  const handleCreateSave = async () => {
    if (createType === "Organization") {
      const allTouched = {
        orgName: true,
        orgRole: true,
        startDate: true,
      };
      setCreateTouched(allTouched);
      const errs = validateOrganization();
      setCreateErrors(errs);
      if (Object.values(errs).some(Boolean)) return;

      // Duplicate check (case-insensitive name match)
      const needle = createOrgName.trim().toLowerCase();
      const matches = CONSTITUENTS.filter(
        (c) =>
          c.type === "Organization" &&
          c.name.toLowerCase() === needle,
      );
      if (matches.length > 0) {
        setDupMatches(matches);
        setDupSelected(null);
        setDupOpen(true);
        return;
      }

      setCreateSaving(true);
      await new Promise((r) => setTimeout(r, 600));
      doCreateOrg();
    } else {
      // Individual flow
      const allTouched = {
        firstName: true,
        lastName: true,
        individualRole: true,
      };
      setCreateTouched(allTouched);
      const errs = validateIndividual();
      setCreateErrors(errs);
      if (Object.values(errs).some(Boolean)) return;

      setCreateSaving(true);
      await new Promise((r) => setTimeout(r, 800));

      const newId =
        Math.max(...CONSTITUENTS.map((c) => c.id)) + 1;
      const newConstituent: Constituent = {
        id: newId,
        name: `${createFirstName.trim()} ${createLastName.trim()}`,
        type: "Individual",
        role: createIndividualRole as Constituent["role"],
        status: "Active",
        program: "Residential Treatment",
        lastUpdated: localTodayIso(),
      };
      CONSTITUENTS.unshift(newConstituent);
      setCreateOpen(false);
      toast.success(
        "Individual constituent created successfully.",
      );
      navigate(`/constituents/${newId}`);
    }
  };

  // ── Duplicate modal: Use Existing ───────────────────────────────────
  const handleUseExisting = () => {
    if (dupSelected === null) return;
    setDupOpen(false);
    setCreateOpen(false);
    navigate(`/constituents/${dupSelected}`);
  };

  // ── Duplicate modal: Continue Creating ─────────────────────────────
  const handleContinueCreating = async () => {
    setDupOpen(false);
    setCreateSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    doCreateOrg();
  };

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProgram, setFilterProgram] =
    useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] =
    useState<string>("all");
  // Community Need (20092): match-any; empty = no filtering.
  const [filterCommunityNeeds, setFilterCommunityNeeds] =
    useState<string[]>([]);
  const communityCare = useAllCommunityCare();
  // Role column label only; filtering still uses the base role (20119).
  const contractorDetails = useAllContractorDetails();
  const roleLabel = (c: Constituent) =>
    c.type === "Individual" && c.role === "Contractor"
      ? contractorRoleLabel(contractorDetails[String(c.id)])
      : [c.role, ...(c.additionalRoles ?? [])].join(", ");
  const needsFor = (id: number) => {
    const record = communityCare[String(id)];
    return record ? distinctNeeds(record) : [];
  };

  // Pagination
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);

  // Get unique values for filter dropdowns
  const programs = getUniquePrograms();
  const types = getUniqueTypes();
  const roles = getUniqueRoles();
  const statuses = getUniqueStatuses();

  // Filtered constituents based on search and filters
  const filteredConstituents = useMemo(() => {
    return CONSTITUENTS.filter((constituent) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        constituent.name.toLowerCase().includes(searchLower) ||
        constituent.email
          ?.toLowerCase()
          .includes(searchLower) ||
        constituent.phone?.toLowerCase().includes(searchLower);

      // Program filter
      const matchesProgram =
        filterProgram === "all" ||
        constituent.program === filterProgram;

      // Type filter
      const matchesType =
        filterType === "all" || constituent.type === filterType;

      // Role filter
      const matchesRole =
        filterRole === "all" ||
        constituent.role === filterRole ||
        !!constituent.additionalRoles?.includes(filterRole as Constituent["role"]);

      // Status filter
      const matchesStatus =
        filterStatus === "all" ||
        constituent.status === filterStatus;

      // Community Need filter (match any selected)
      const matchesCommunityNeed =
        filterCommunityNeeds.length === 0 ||
        needsFor(constituent.id).some((n) =>
          filterCommunityNeeds.includes(n),
        );

      return (
        matchesSearch &&
        matchesProgram &&
        matchesType &&
        matchesRole &&
        matchesStatus &&
        matchesCommunityNeed
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchTerm,
    filterProgram,
    filterType,
    filterRole,
    filterStatus,
    filterCommunityNeeds,
    communityCare,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredConstituents.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredConstituents.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    filterProgram,
    filterType,
    filterRole,
    filterStatus,
    filterCommunityNeeds,
  ]);

  // Navigate to constituent profile
  const handleRefresh = () => {
    setSearchTerm("");
    setFilterProgram("all");
    setFilterType("all");
    setFilterRole("all");
    setFilterStatus("all");
    setFilterCommunityNeeds([]);
  };

  const handleViewProfile = (constituentId: number) => {
    // For now, navigate to a placeholder route
    // This can be updated to the actual constituent profile route
    navigate(`/constituents/${constituentId}`);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatMdy(date);
  };

  // KPI Metrics
  const totalConstituents = CONSTITUENTS.length;
  const activeConstituents = CONSTITUENTS.filter(
    (c) => getConstituentStatus(c) === "Active",
  ).length;
  const inactiveConstituents = CONSTITUENTS.filter(
    (c) => getConstituentStatus(c) === "Inactive",
  ).length;
  const pendingConstituents = CONSTITUENTS.filter(
    (c) => c.status === "Pending",
  ).length;

  return (
    <>
      <div
        className="flex-1 min-h-0 overflow-y-auto"
        style={{
          backgroundColor: "var(--slds-g-color-background-alt)",
        }}
      >
      <div className="flex flex-col min-h-full">
        {/* Page Header */}
        <div
          className="px-6 py-4"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-alt-2)",
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            boxShadow: "var(--slds-g-shadow-1)",
          }}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Left: Title Section */}
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 flex items-center justify-center text-white"
                style={{
                  borderRadius:
                    "var(--slds-c-card-radius-border)",
                  backgroundColor: "var(--color-brand-primary)",
                  boxShadow: "var(--slds-g-shadow-1)",
                }}
              >
                <Users className="h-6 w-6" />
              </div>
              <div>
                <div
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Dashboard
                </div>
                <h1
                  className="text-2xl font-medium tracking-tight"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Constituents
                </h1>
              </div>
            </div>

            {/* Right: Action Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Refresh"
                onClick={handleRefresh}
                style={{
                  backgroundColor: "white",
                  borderRadius: "50%",
                }}
              >
                <RefreshCw
                  className="h-4 w-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              </Button>

              {/* Divider */}
              <div
                className="h-6 w-px mx-1"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-border-base-1)",
                }}
              />
              <Button
                size="sm"
                className="h-9 px-4 rounded-full slds-text-4 font-medium text-white flex items-center gap-1.5"
                style={{ backgroundColor: "#145F33" }}
                onClick={openCreateModal}
              >
                <Plus className="h-4 w-4" />
                New Constituent
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Metrics */}
        <div
          className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-alt-2)",
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
            {/* Total Constituents */}
            <Card
              className="shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                borderRadius:
                  "var(--slds-c-card-radius-border)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
              }}
              onClick={() => {
                setFilterStatus("all");
                setFilterProgram("all");
                setFilterType("all");
                setFilterRole("all");
                setFilterCommunityNeeds([]);
                setSearchTerm("");
              }}
              role="button"
              tabIndex={0}
              aria-label="View all constituents"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide group-hover:text-blue-700 transition-colors"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Total Constituents
                    </p>
                    <p
                      className="text-2xl font-bold mt-1 group-hover:text-blue-700 transition-colors"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {totalConstituents}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Users className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Constituents */}
            <Card
              className="shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                borderRadius:
                  "var(--slds-c-card-radius-border)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
              }}
              onClick={() =>
                setFilterStatus(
                  filterStatus === "Active" ? "all" : "Active",
                )
              }
              role="button"
              tabIndex={0}
              aria-label="View active constituents"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide group-hover:text-green-700 transition-colors"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Active
                    </p>
                    <p
                      className="text-2xl font-bold mt-1 group-hover:text-green-700 transition-colors"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {activeConstituents}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <UserCheck className="h-5 w-5 text-green-600 group-hover:text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inactive */}
            <Card
              className="shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                borderRadius:
                  "var(--slds-c-card-radius-border)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
              }}
              onClick={() =>
                setFilterStatus(
                  filterStatus === "Inactive"
                    ? "all"
                    : "Inactive",
                )
              }
              role="button"
              tabIndex={0}
              aria-label="View inactive constituents"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide group-hover:text-red-700 transition-colors"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Inactive
                    </p>
                    <p
                      className="text-2xl font-bold mt-1 group-hover:text-red-700 transition-colors"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {inactiveConstituents}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <UserX className="h-5 w-5 text-red-600 group-hover:text-red-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending */}
            <Card
              className="shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                borderRadius:
                  "var(--slds-c-card-radius-border)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
              }}
              onClick={() =>
                setFilterStatus(
                  filterStatus === "Pending"
                    ? "all"
                    : "Pending",
                )
              }
              role="button"
              tabIndex={0}
              aria-label="View pending constituents"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide group-hover:text-orange-700 transition-colors"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Pending
                    </p>
                    <p
                      className="text-2xl font-bold mt-1 group-hover:text-orange-700 transition-colors"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {pendingConstituents}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <Clock className="h-5 w-5 text-orange-600 group-hover:text-orange-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Table Container with Integrated Filters */}
        <div
          className="px-4 sm:px-6 pb-4 sm:pb-6"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-alt-2)",
          }}
        >
          <div
            className="rounded-lg border shadow-sm overflow-hidden"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
          >
            {/* Filters Section - Integrated into List View */}
            <div
              className="min-h-[50px] px-4 sm:px-6 py-[7px] flex items-center gap-2 flex-wrap"
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              {/* Title — own line below xl so the filters wrap the same way
                  whatever the result count's width is */}
              <h2
                className="text-base font-bold basis-full xl:basis-auto"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                All Constituents ({filteredConstituents.length})
              </h2>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Program Filter */}
              <Select
                value={filterProgram}
                onValueChange={setFilterProgram}
              >
                <SelectTrigger
                  className="h-9 w-full sm:w-[180px] text-[13px]"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    borderRadius:
                      "var(--slds-c-input-radius-border)",
                  }}
                >
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Programs
                  </SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program} value={program}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select
                value={filterType}
                onValueChange={setFilterType}
              >
                <SelectTrigger
                  className="h-9 w-full sm:w-[150px] text-[13px]"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    borderRadius:
                      "var(--slds-c-input-radius-border)",
                  }}
                >
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Role Filter */}
              <Select
                value={filterRole}
                onValueChange={setFilterRole}
              >
                <SelectTrigger
                  className="h-9 w-full sm:w-[160px] text-[13px]"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    borderRadius:
                      "var(--slds-c-input-radius-border)",
                  }}
                >
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger
                  className="h-9 w-full sm:w-[140px] text-[13px]"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    borderRadius:
                      "var(--slds-c-input-radius-border)",
                  }}
                >
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Statuses
                  </SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Community Need Filter */}
              <div className="w-full sm:w-[190px]">
                <MultiSelect
                  value={filterCommunityNeeds}
                  onValueChange={setFilterCommunityNeeds}
                  options={COMMUNITY_NEED_OPTIONS}
                  placeholder="All Community Needs"
                  display="inline"
                  aria-label="Community Need"
                />
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-auto">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 z-10"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                />
                <Input
                  placeholder="Search"
                  className="pl-9 pr-9 h-9 w-full sm:w-40 text-[13px]"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    borderRadius:
                      "var(--slds-c-input-radius-border)",
                  }}
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  aria-label="Search constituents"
                />
                {searchTerm && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center z-10 transition-colors"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--slds-g-color-neutral-base-90)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "transparent";
                    }}
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    <X
                      className="h-3 w-3"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    />
                  </button>
                )}
              </div>
            </div>
            {/* Table — horizontal scroll on narrow screens */}
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader
                  className="sticky top-0 z-10"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <TableRow
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <TableHead
                      className="pl-4 sm:pl-6 text-left text-[12px]"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      NAME
                    </TableHead>
                    <TableHead
                      className="text-left text-[12px]"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      TYPE
                    </TableHead>
                    <TableHead
                      className="text-left text-[12px]"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      ROLE
                    </TableHead>
                    <TableHead
                      className="text-left text-[12px]"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      COMMUNITY NEED
                    </TableHead>
                    <TableHead
                      className="text-left text-[12px]"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      STATUS
                    </TableHead>
                    <TableHead
                      className="text-left text-[12px]"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      LAST UPDATED
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConstituents.length > 0 ? (
                    pageRows.map((constituent) => (
                      <TableRow
                        key={constituent.id}
                        className="hover:bg-opacity-50 transition-colors"
                        style={{
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--slds-g-color-background-row-hover)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "transparent";
                        }}
                      >
                        <TableCell className="font-medium pl-4 sm:pl-6">
                          <button
                            onClick={() =>
                              handleViewProfile(constituent.id)
                            }
                            className="text-left hover:underline focus:outline-none focus:underline"
                            style={{
                              color: "var(--color-link-blue)",
                              cursor: "pointer",
                              background: "none",
                              border: "none",
                              padding: 0,
                              fontSize: "inherit",
                              fontWeight: "inherit",
                            }}
                            title={`View profile for ${constituent.name}`}
                          >
                            {constituent.name}
                          </button>
                        </TableCell>
                        <TableCell
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {constituent.type}
                        </TableCell>
                        <TableCell
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {roleLabel(constituent)}
                        </TableCell>
                        <TableCell
                          className="w-[240px] max-w-[240px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          <OverflowList
                            items={needsFor(constituent.id)}
                            label="Community Needs"
                          />
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const derived =
                              getConstituentStatus(constituent);
                            return (
                              <Badge
                                variant="outline"
                                className="rounded-full text-xs font-medium px-2.5"
                                style={{
                                  backgroundColor:
                                    derived === "Active"
                                      ? "#D0E9DA"
                                      : "#F4C7C3",
                                  color:
                                    derived === "Active"
                                      ? "#1B5E20"
                                      : "#C23934",
                                  border: "none",
                                }}
                              >
                                {derived}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {formatDate(constituent.lastUpdated)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-12"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <Search
                            className="h-12 w-12"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          />
                          <div>
                            <p
                              className="font-medium text-sm"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              No constituents found
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              Try adjusting your search or
                              filters
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div
              className="flex items-center justify-between"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
                padding: "12px 16px 12px 4px",
              }}
            >
              {/* Showing X–Y of Z records */}
              <p
                style={{
                  color: "var(--slds-g-color-text-weak)",
                  fontSize: 12,
                  lineHeight: "18px",
                  whiteSpace: "nowrap",
                }}
              >
                {"Showing "}
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {filteredConstituents.length === 0
                    ? "0"
                    : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(
                        safePage * PAGE_SIZE,
                        filteredConstituents.length,
                      )}`}
                </span>

                {" of "}

                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {filteredConstituents.length}
                </span>

                {" records"}
              </p>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center gap-3">
                  {/* Previous */}
                  <button
                    type="button"
                    onClick={() =>
                      setPage((p) => Math.max(1, p - 1))
                    }
                    disabled={safePage === 1}
                    className="flex items-center justify-center rounded-full disabled:opacity-40"
                    style={{
                      width: 28,
                      height: 28,
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      flexShrink: 0,
                    }}
                    aria-label="Previous page"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M8.75 10.5L5.25 7L8.75 3.5"
                        stroke="#706E6B"
                        strokeWidth="1.16667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Current Page */}
                  <p
                    style={{
                      fontSize: 12,
                      lineHeight: "18px",
                      color: "var(--slds-g-color-text-default)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {"Page "}
                    <span style={{ fontWeight: 600 }}>
                      {safePage}
                    </span>
                    {" of "}
                    <span style={{ fontWeight: 600 }}>
                      {totalPages}
                    </span>
                  </p>

                  {/* Next */}
                  <button
                    type="button"
                    onClick={() =>
                      setPage((p) =>
                        Math.min(totalPages, p + 1),
                      )
                    }
                    disabled={safePage === totalPages}
                    className="flex items-center justify-center rounded-full disabled:opacity-40"
                    style={{
                      width: 28,
                      height: 28,
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      flexShrink: 0,
                    }}
                    aria-label="Next page"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M5.25 10.5L8.75 7L5.25 3.5"
                        stroke="#706E6B"
                        strokeWidth="1.16667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
      {/* ── Create New Constituent Modal ── */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!createSaving) setCreateOpen(open);
        }}
      >
        <DialogContent
          aria-describedby={undefined}
          className="sm:max-w-md p-0 gap-0 overflow-hidden"
          style={{
            border:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          {/* Header */}
          <DialogHeader
            className="px-5 py-4"
            style={{
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <DialogTitle
              style={{
                fontSize: "var(--slds-g-font-size-6)",
                fontWeight: 500,
              }}
            >
              Create New Constituent
            </DialogTitle>
            <p
              className="slds-text-4 my-0"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Required fields are marked with *.
            </p>
          </DialogHeader>

          {/* Body */}
          <div
            className="px-5 py-4 space-y-4"
            style={{
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
          >
            {/* Row 1: Constituent Type + (org) Role */}
            <div className="grid grid-cols-2 gap-4">
              {/* Constituent Type */}
              <div className="space-y-1.5">
                <label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  CONSTITUENT TYPE{" "}
                  <span className="text-red-600">*</span>
                </label>
                <Select
                  value={createType}
                  onValueChange={(v) => {
                    setCreateType(
                      v as "Individual" | "Organization",
                    );
                    setCreateErrors({});
                    setCreateTouched({});
                  }}
                >
                  <SelectTrigger
                    className="h-9 slds-text-4"
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="Individual"
                      className="slds-text-4"
                    >
                      Individual
                    </SelectItem>
                    <SelectItem
                      value="Organization"
                      className="slds-text-4"
                    >
                      Organization
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Role — shown for Organization */}
              {createType === "Organization" && (
                <div className="space-y-1.5">
                  <label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    ROLE <span className="text-red-600">*</span>
                  </label>
                  <Select
                    value={createOrgRole}
                    onValueChange={(v) => {
                      setCreateOrgRole(v);
                      if (createTouched.orgRole)
                        setCreateErrors((prev) => ({
                          ...prev,
                          orgRole: v ? "" : "Role is required.",
                        }));
                    }}
                  >
                    <SelectTrigger
                      className="h-9 slds-text-4"
                      style={{
                        borderColor:
                          createTouched.orgRole &&
                          createErrors.orgRole
                            ? "#c23934"
                            : "var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                      }}
                    >
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORG_ROLES.map((r) => (
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
                  {createTouched.orgRole &&
                    createErrors.orgRole && (
                      <p
                        className="slds-text-3 mt-0.5"
                        style={{ color: "#c23934" }}
                      >
                        {createErrors.orgRole}
                      </p>
                    )}
                </div>
              )}

              {/* Individual: Role */}
              {createType === "Individual" && (
                <div className="space-y-1.5">
                  <label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    ROLE <span className="text-red-600">*</span>
                  </label>
                  <Select
                    value={createIndividualRole}
                    onValueChange={(v) => {
                      setCreateIndividualRole(v);
                      if (createTouched.individualRole)
                        setCreateErrors((prev) => ({
                          ...prev,
                          individualRole: v
                            ? ""
                            : "Role is required.",
                        }));
                    }}
                  >
                    <SelectTrigger
                      className="h-9 slds-text-4"
                      style={{
                        borderColor:
                          createTouched.individualRole &&
                          createErrors.individualRole
                            ? "#c23934"
                            : "var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <SelectValue
                        placeholder="Select role"
                        style={{
                          display: "block",
                          minWidth: 0,
                          maxWidth: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIVIDUAL_ROLES.map((r) => (
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
                  {createTouched.individualRole &&
                    createErrors.individualRole && (
                      <p
                        className="slds-text-3 mt-0.5"
                        style={{ color: "#c23934" }}
                      >
                        {createErrors.individualRole}
                      </p>
                    )}
                </div>
              )}
            </div>

            {/* Organization Name — Organization only */}
            {createType === "Organization" && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="cc-org-name"
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  ORGANIZATION NAME{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <input
                  id="cc-org-name"
                  ref={orgNameRef}
                  value={createOrgName}
                  onChange={(e) => {
                    setCreateOrgName(e.target.value);
                    if (createTouched.orgName)
                      setCreateErrors((prev) => ({
                        ...prev,
                        orgName: e.target.value.trim()
                          ? ""
                          : "Organization Name is required.",
                      }));
                  }}
                  onBlur={() => handleBlur("orgName")}
                  placeholder="Enter organization name"
                  className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                  style={{
                    border: `1px solid ${createTouched.orgName && createErrors.orgName ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  aria-required="true"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateSave();
                  }}
                />
                {createTouched.orgName &&
                  createErrors.orgName && (
                    <p
                      className="slds-text-3 mt-0.5"
                      style={{ color: "#c23934" }}
                    >
                      {createErrors.orgName}
                    </p>
                  )}
              </div>
            )}

            {/* Individual: First + Last Name */}
            {createType === "Individual" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="cc-first-name"
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    FIRST NAME{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <input
                    id="cc-first-name"
                    ref={firstNameRef}
                    value={createFirstName}
                    onChange={(e) => {
                      setCreateFirstName(e.target.value);
                      if (createTouched.firstName)
                        setCreateErrors((prev) => ({
                          ...prev,
                          firstName: e.target.value.trim()
                            ? ""
                            : "First Name is required.",
                        }));
                    }}
                    onBlur={() => handleBlur("firstName")}
                    placeholder="First Name"
                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                    style={{
                      border: `1px solid ${createTouched.firstName && createErrors.firstName ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                    aria-required="true"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateSave();
                    }}
                  />
                  {createTouched.firstName &&
                    createErrors.firstName && (
                      <p
                        className="slds-text-3 mt-0.5"
                        style={{ color: "#c23934" }}
                      >
                        {createErrors.firstName}
                      </p>
                    )}
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="cc-last-name"
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    LAST NAME{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <input
                    id="cc-last-name"
                    value={createLastName}
                    onChange={(e) => {
                      setCreateLastName(e.target.value);
                      if (createTouched.lastName)
                        setCreateErrors((prev) => ({
                          ...prev,
                          lastName: e.target.value.trim()
                            ? ""
                            : "Last Name is required.",
                        }));
                    }}
                    onBlur={() => handleBlur("lastName")}
                    placeholder="Last Name"
                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                    style={{
                      border: `1px solid ${createTouched.lastName && createErrors.lastName ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                    aria-required="true"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateSave();
                    }}
                  />
                  {createTouched.lastName &&
                    createErrors.lastName && (
                      <p
                        className="slds-text-3 mt-0.5"
                        style={{ color: "#c23934" }}
                      >
                        {createErrors.lastName}
                      </p>
                    )}
                </div>
              </div>
            )}

            {/* Start Date — Organization only */}
            {createType === "Organization" && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="cc-start-date"
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  START DATE{" "}
                  <span className="text-red-600">*</span>
                </Label>

                <DateInput
                  id="cc-start-date"
                  value={createStartDate}
                  onChange={(v) => {
                    setCreateStartDate(v);
                    if (createTouched.startDate)
                      setCreateErrors((prev) => ({
                        ...prev,
                        startDate: v.trim()
                          ? ""
                          : "Start Date is required.",
                      }));
                  }}
                  onBlur={() => handleBlur("startDate")}
                  className="h-9 w-full rounded slds-text-4"
                  style={{
                    border: `1px solid ${createTouched.startDate && createErrors.startDate ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
                {createTouched.startDate &&
                  createErrors.startDate && (
                    <p
                      className="slds-text-3 mt-0.5"
                      style={{ color: "#c23934" }}
                    >
                      {createErrors.startDate}
                    </p>
                  )}
              </div>
            )}
          </div>

          <DialogFooter
            className="px-5 py-3 flex items-center justify-end gap-2"
            style={{
              borderTop:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <Button
              variant="outline"
              className="h-9 px-5 rounded-full slds-text-4"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
              }}
              onClick={() => setCreateOpen(false)}
              disabled={createSaving}
            >
              Cancel
            </Button>
            <Button
              className="h-9 px-5 rounded-full slds-text-4 font-medium text-white"
              style={{
                backgroundColor: "#145F33",
                opacity: createSaving ? 0.7 : 1,
              }}
              onClick={handleCreateSave}
              disabled={createSaving}
            >
              {createSaving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Possible Duplicate Organization Modal ── */}
      <Dialog
        open={dupOpen}
        onOpenChange={(open) => {
          if (!createSaving) setDupOpen(open);
        }}
      >
        <DialogContent
          className="max-w-2xl"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
          }}
          aria-describedby="dup-desc"
        >
          <DialogHeader>
            <DialogTitle
              className="slds-text-6 font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Possible Duplicate Organization
            </DialogTitle>
            <p
              id="dup-desc"
              className="slds-text-4 mt-1"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              An organization with the same name already exists.
              You may use the existing organization or continue
              creating a new one.
            </p>
          </DialogHeader>

          {/* Duplicate matches table */}
          <div
            className="overflow-hidden mt-2"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "6px",
            }}
          >
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  {[
                    "",
                    "Organization Name",
                    "Role",
                    "Constituent Type",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-[11px] font-semibold"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dupMatches.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setDupSelected(c.id)}
                    className="cursor-pointer"
                    style={{
                      backgroundColor:
                        dupSelected === c.id
                          ? "rgba(20,95,51,0.05)"
                          : "var(--slds-g-color-background-base)",
                      outline:
                        dupSelected === c.id
                          ? "2px solid #145F33"
                          : "none",
                      outlineOffset: "-2px",
                    }}
                  >
                    <td
                      className="px-4 py-3"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <input
                        type="radio"
                        checked={dupSelected === c.id}
                        onChange={() => setDupSelected(c.id)}
                        className="h-3.5 w-3.5 accent-[#145F33]"
                        aria-label={`Select ${c.name}`}
                      />
                    </td>
                    <td
                      className="px-4 py-3 slds-text-4 font-medium"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {c.name}
                    </td>
                    <td
                      className="px-4 py-3 slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {c.role}
                    </td>
                    <td
                      className="px-4 py-3 slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {c.type}
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
                            c.status === "Active"
                              ? "#e8f5e9"
                              : "#f5f5f5",
                          color:
                            c.status === "Active"
                              ? "#1b5e20"
                              : "#424242",
                          border: `1px solid ${c.status === "Active" ? "#a5d6a7" : "#bdbdbd"}`,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor:
                              c.status === "Active"
                                ? "#2e7d32"
                                : "#757575",
                            display: "inline-block",
                            flexShrink: 0,
                          }}
                        />
                        {c.status}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/constituents/${c.id}`);
                        }}
                        className="flex items-center gap-1 slds-text-3 font-medium hover:underline"
                        style={{ color: "#0176d3" }}
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              className="h-9 px-5 rounded-full slds-text-4"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
              }}
              onClick={handleContinueCreating}
              disabled={createSaving}
            >
              {createSaving
                ? "Creating…"
                : "Continue Creating New"}
            </Button>
            <Button
              className="h-9 px-5 rounded-full slds-text-4 font-medium text-white"
              style={{
                backgroundColor: "#145F33",
                opacity: dupSelected === null ? 0.5 : 1,
              }}
              onClick={handleUseExisting}
              disabled={dupSelected === null}
            >
              Use Existing Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}