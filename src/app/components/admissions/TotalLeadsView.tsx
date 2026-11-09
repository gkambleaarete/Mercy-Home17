import { useState } from "react";
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Users,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  CheckCircle,
  MessageSquare,
  Upload,
} from "@/app/lib/lucide-icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  ALL_LEADS,
  ADMISSION_STAGES,
  type Lead,
} from "../../data/mockLeadsData";
import { useLeadsWithSavedCategories } from "../../data/admissionsCategoryStore";
import { AdmissionsCategoryNotice } from "./AdmissionsCategoryNotice";
import { AdmissionsCategoryBadge } from "./AdmissionsCategoryBadge";
import { AdmissionsStageBadge } from "./AdmissionsStageBadge";

interface TotalLeadsViewProps {
  onBack: () => void;
  onViewLead: (lead: Lead) => void;
  /** The leads to show, before saved categories are applied (default: the
   *  seed). Saved categories are applied here, by lead.id. */
  baseLeads?: Lead[];
}

export function TotalLeadsView({
  onBack,
  onViewLead,
  baseLeads,
}: TotalLeadsViewProps) {
  const { leads: ALL_CURRENT_LEADS, categoryError } =
    useLeadsWithSavedCategories(baseLeads ?? ALL_LEADS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">(
    "table",
  );

  const filteredLeads = ALL_CURRENT_LEADS.filter((lead) => {
    const matchesSearch =
      lead.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      lead.guardian
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      lead.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage =
      filterStage === "all" || lead.stage === filterStage;
    const matchesProgram =
      filterProgram === "all" || lead.program === filterProgram;
    const matchesStatus =
      filterStatus === "all" || lead.status === filterStatus;

    return (
      matchesSearch &&
      matchesStage &&
      matchesProgram &&
      matchesStatus
    );
  });

  const statusBreakdown = {
    new: ALL_CURRENT_LEADS.filter((l) => l.status === "New")
      .length,
    inProgress: ALL_CURRENT_LEADS.filter(
      (l) => l.status === "In Progress",
    ).length,
    withAlerts: ALL_CURRENT_LEADS.filter(
      (l) => l.alerts.length > 0,
    ).length,
  };

  return (
    <div className="flex flex-col h-full bg-[#f3f4f6]">
      {categoryError && (
        <div className="px-6 pt-4">
          <AdmissionsCategoryNotice error={categoryError} />
        </div>
      )}
      {/* Header */}
      <div className="bg-white border-b border-[#dddbda] px-6 py-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full h-8 w-8 p-0"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="h-10 w-10 rounded-[8px] bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Admissions
                </div>
                <h1 className="text-2xl font-medium text-[var(--color-text-main)] tracking-tight">
                  All Leads
                </h1>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#706e6b]" />
                <Input
                  placeholder="Search by name, guardian, or ID..."
                  className="pl-9 h-[32px] rounded-full border-[#dddbda] bg-white text-[13px]"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />
              </div>

              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger className="h-[32px] w-[140px] rounded-full border-[#dddbda] bg-white text-[13px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Status
                  </SelectItem>
                  <SelectItem value="Referral">
                    Referral
                  </SelectItem>
                  <SelectItem value="Info Session">
                    Info Session
                  </SelectItem>
                  <SelectItem value="Program Waitlist">
                    Program Waitlist
                  </SelectItem>
                  <SelectItem value="Delayed">
                    Delayed
                  </SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterStage}
                onValueChange={setFilterStage}
              >
                <SelectTrigger className="h-[32px] w-[140px] rounded-full border-[#dddbda] bg-white text-[13px]">
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Stages
                  </SelectItem>
                  {ADMISSION_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterProgram}
                onValueChange={setFilterProgram}
              >
                <SelectTrigger className="h-[32px] w-[140px] rounded-full border-[#dddbda] bg-white text-[13px]">
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Programs
                  </SelectItem>
                  <SelectItem value="Bosco Home">
                    Bosco Home
                  </SelectItem>
                  <SelectItem value="Mercy Home">
                    Mercy Home
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={
                  viewMode === "table" ? "default" : "outline"
                }
                size="sm"
                className="h-[32px] rounded-full text-[13px]"
                onClick={() => setViewMode("table")}
              >
                Table
              </Button>
              <Button
                variant={
                  viewMode === "cards" ? "default" : "outline"
                }
                size="sm"
                className="h-[32px] rounded-full text-[13px]"
                onClick={() => setViewMode("cards")}
              >
                Cards
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="px-6 pt-6 pb-4 bg-[#f3f4f6]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-[#dddbda] rounded-[8px] bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#706e6b] font-medium uppercase tracking-wide">
                    Total Leads
                  </p>
                  <p className="text-2xl font-bold text-[#3e3e3c] mt-1">
                    {ALL_CURRENT_LEADS.length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#dddbda] rounded-[8px] bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#706e6b] font-medium uppercase tracking-wide">
                    New Youth
                  </p>
                  <p className="text-2xl font-bold text-[#3e3e3c] mt-1">
                    {statusBreakdown.new}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#dddbda] rounded-[8px] bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#706e6b] font-medium uppercase tracking-wide">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-[#3e3e3c] mt-1">
                    {statusBreakdown.inProgress}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#dddbda] rounded-[8px] bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#706e6b] font-medium uppercase tracking-wide">
                    With Alerts
                  </p>
                  <p className="text-2xl font-bold text-[#3e3e3c] mt-1">
                    {statusBreakdown.withAlerts}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 bg-[#f3f4f6]">
        {viewMode === "table" ? (
          <Card className="bg-white shadow-sm border-[#dddbda] rounded-[8px] overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#dddbda] bg-[#fafaf9] px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-[#3e3e3c]">
                  All Leads ({filteredLeads.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-[#fafaf9]">
                  <TableRow className="hover:bg-transparent border-[#dddbda]">
                    <TableHead className="font-semibold text-[#3e3e3c]">
                      Lead
                    </TableHead>
                    <TableHead className="font-semibold text-[#3e3e3c]">
                      Guardian
                    </TableHead>
                    <TableHead className="font-semibold text-[#3e3e3c]">
                      Gender
                    </TableHead>
                    <TableHead className="font-semibold text-[#3e3e3c]">
                      Age
                    </TableHead>
                    <TableHead className="font-semibold text-[#3e3e3c]">
                      Program
                    </TableHead>
                    <TableHead className="font-semibold text-[#3e3e3c]">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-[#3e3e3c]">
                      Stage
                    </TableHead>
                    <TableHead className="font-semibold text-[#3e3e3c]">
                      Progress
                    </TableHead>
                    <TableHead className="font-semibold text-[#3e3e3c]">
                      Case Manager
                    </TableHead>
                    <TableHead className="font-semibold text-[#3e3e3c]">
                      Days in Stage
                    </TableHead>
                    <TableHead className="text-right font-semibold text-[#3e3e3c]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className="border-[#dddbda] hover:bg-[#f3f2f2] cursor-pointer"
                      onClick={() => onViewLead(lead)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-[var(--color-brand-primary)] flex items-center justify-center text-white text-xs font-bold">
                            {lead.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <div className="font-bold text-[#3e3e3c]">
                              {lead.name}
                            </div>
                            <div className="text-xs text-[#706e6b]">
                              {lead.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#3e3e3c]">
                        {lead.guardian}
                      </TableCell>
                      <TableCell className="text-[#3e3e3c]">
                        {lead.gender || "N/A"}
                      </TableCell>
                      <TableCell className="text-[#3e3e3c]">
                        {lead.ageGroup || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 rounded-sm"
                        >
                          {lead.program}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <AdmissionsCategoryBadge
                          category={lead.status}
                        />
                      </TableCell>
                      <TableCell>
                        <AdmissionsStageBadge
                          stage={lead.stage}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--color-brand-primary)] rounded-full transition-all"
                              style={{
                                width: `${lead.progress}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-[#706e6b] font-medium">
                            {lead.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#3e3e3c]">
                        {lead.caseManager}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-sm",
                            lead.daysInStage > 5
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-gray-50 text-gray-700 border-gray-200",
                          )}
                        >
                          {lead.daysInStage}d
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map((lead) => (
              <Card
                key={lead.id}
                className="border border-[#dddbda] rounded-[8px] bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => onViewLead(lead)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-[#145F33] flex items-center justify-center text-white font-bold shrink-0">
                      {lead.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#3e3e3c] truncate">
                        {lead.name}
                      </h3>
                      <p className="text-xs text-[#706e6b]">
                        ID: {lead.id}
                      </p>
                    </div>
                    <MoreHorizontal className="h-4 w-4 text-[#706e6b] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="space-y-2.5 mb-4 text-xs">
                    <div className="flex items-center gap-1.5 text-[#706e6b]">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {lead.guardian}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#706e6b]">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {lead.program}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#706e6b]">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        CM: {lead.caseManager}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#706e6b]">
                        Progress
                      </span>
                      <span className="font-medium text-[#3e3e3c]">
                        {lead.progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-brand-primary)] rounded-full transition-all"
                        style={{ width: `${lead.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#dddbda]">
                    <AdmissionsCategoryBadge
                      category={lead.status}
                    />
                    <AdmissionsStageBadge stage={lead.stage} />
                  </div>

                  {lead.alerts.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2 py-1.5 rounded-[8px]">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {lead.alerts[0]}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredLeads.length === 0 && (
          <div className="text-center py-12 bg-white rounded-[8px] border border-[#dddbda]">
            <Users className="h-12 w-12 text-[#706e6b] mx-auto mb-4" />
            <p className="text-[#3e3e3c] font-medium">
              No leads found
            </p>
            <p className="text-sm text-[#706e6b] mt-1">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}