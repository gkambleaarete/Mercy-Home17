import { useState } from "react";
import { ArrowLeft, Search, Filter, Plus, MoreHorizontal, AlertTriangle, Phone, Mail, MapPin, Clock, Calendar, User, FileText, CheckCircle, MessageSquare, Upload, XCircle } from "@/app/lib/lucide-icons";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { AdmissionsStageBadge } from "./AdmissionsStageBadge";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ALL_LEADS, getLeadsWithAlerts, getTotalAlertCount, type Lead } from "../../data/mockLeadsData";
import { getAlertsKpiTotal, useLeadsWithSavedCategories } from "../../data/admissionsCategoryStore";
import { AdmissionsCategoryNotice } from "./AdmissionsCategoryNotice";

interface AlertsViewProps {
  onBack: () => void;
  onViewLead: (lead: Lead) => void;
  /** The leads to show, before saved categories are applied (default: the
   *  seed). Saved categories are applied here, by lead.id. */
  baseLeads?: Lead[];
}

export function AlertsView({ onBack, onViewLead, baseLeads }: AlertsViewProps) {
  const { leads, categoryRead, categoryError } = useLeadsWithSavedCategories(baseLeads ?? ALL_LEADS);
  // Membership is still the existing alert records only — a category comment never adds a lead here.
  const LEADS_WITH_ALERTS_MOCK = getLeadsWithAlerts(leads);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const filteredLeads = LEADS_WITH_ALERTS_MOCK.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.guardian.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.alerts.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesProgram = filterProgram === "all" || lead.program === filterProgram;
    const matchesSeverity = filterSeverity === "all" || lead.alertSeverity === filterSeverity.toLowerCase();
    const matchesStage = filterStage === "all" || lead.stage === filterStage;
    
    return matchesSearch && matchesProgram && matchesSeverity && matchesStage;
  });

  const severityBreakdown = {
    high: LEADS_WITH_ALERTS_MOCK.filter(l => l.alertSeverity === "high").length,
    medium: LEADS_WITH_ALERTS_MOCK.filter(l => l.alertSeverity === "medium").length,
    low: LEADS_WITH_ALERTS_MOCK.filter(l => l.alertSeverity === "low").length
  };

  // Same shared calculation as the Pipeline Alerts KPI: alerts + category-change comments.
  const totalAlerts = getAlertsKpiTotal(leads, categoryRead);

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
              <div className="h-10 w-10 rounded-[8px] bg-red-600 flex items-center justify-center text-white shadow-sm">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Admissions</div>
                <h1 className="text-2xl font-medium text-[var(--color-text-main)] tracking-tight">Leads with Alerts</h1>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#706e6b]" />
                <Input 
                  placeholder="Search by name, guardian, ID, or alert..." 
                  className="pl-9 h-[32px] rounded-full border-[#dddbda] bg-white text-[13px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="h-[32px] w-[120px] rounded-full border-[#dddbda] bg-white text-[13px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStage} onValueChange={setFilterStage}>
                <SelectTrigger className="h-[32px] w-[140px] rounded-full border-[#dddbda] bg-white text-[13px]">
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="Lead Intake">Lead Intake</SelectItem>
                  <SelectItem value="Info Session">Info Session</SelectItem>
                  <SelectItem value="Assessments">Assessments</SelectItem>
                  <SelectItem value="Shadow & FPM">Shadow & FPM</SelectItem>
                  <SelectItem value="Staffing">Staffing</SelectItem>
                  <SelectItem value="Move-In">Move-In</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterProgram} onValueChange={setFilterProgram}>
                <SelectTrigger className="h-[32px] w-[140px] rounded-full border-[#dddbda] bg-white text-[13px]">
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  <SelectItem value="Bosco Home">Bosco Home</SelectItem>
                  <SelectItem value="Mercy Home">Mercy Home</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                className="h-[32px] rounded-full text-[13px]"
                onClick={() => setViewMode("table")}
              >
                Table
              </Button>
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
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
                  <p className="text-xs text-[#706e6b] font-medium uppercase tracking-wide">Total Alerts &amp; Comments</p>
                  <p className="text-2xl font-bold text-[#3e3e3c] mt-1">{totalAlerts}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#dddbda] rounded-[8px] bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#706e6b] font-medium uppercase tracking-wide">High Priority</p>
                  <p className="text-2xl font-bold text-[#3e3e3c] mt-1">{severityBreakdown.high}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#dddbda] rounded-[8px] bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#706e6b] font-medium uppercase tracking-wide">Medium Priority</p>
                  <p className="text-2xl font-bold text-[#3e3e3c] mt-1">{severityBreakdown.medium}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#dddbda] rounded-[8px] bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#706e6b] font-medium uppercase tracking-wide">Low Priority</p>
                  <p className="text-2xl font-bold text-[#3e3e3c] mt-1">{severityBreakdown.low}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
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
                  Leads with Alerts ({filteredLeads.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-[#fafaf9]">
                  <TableRow className="hover:bg-transparent border-[#dddbda]">
                    <TableHead className="font-semibold text-[#3e3e3c]">Lead</TableHead>
                    <TableHead className="font-semibold text-[#3e3e3c]">Guardian</TableHead>
                    <TableHead className="font-semibold text-[#3e3e3c]">Program</TableHead>
                    <TableHead className="font-semibold text-[#3e3e3c]">Stage</TableHead>
                    <TableHead className="font-semibold text-[#3e3e3c]">Alerts</TableHead>
                    <TableHead className="font-semibold text-[#3e3e3c]">Severity</TableHead>
                    <TableHead className="font-semibold text-[#3e3e3c]">Case Manager</TableHead>
                    <TableHead className="font-semibold text-[#3e3e3c]">Alert Age</TableHead>
                    <TableHead className="text-right font-semibold text-[#3e3e3c]">Actions</TableHead>
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
                            {lead.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-bold text-[#3e3e3c]">{lead.name}</div>
                            <div className="text-xs text-[#706e6b]">{lead.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#3e3e3c]">{lead.guardian}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 rounded-sm">
                          {lead.program}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <AdmissionsStageBadge stage={lead.stage} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {lead.alerts.slice(0, 2).map((alert, idx) => (
                            <div key={idx} className="text-xs text-[#3e3e3c] flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                              <span className="truncate max-w-[200px]">{alert}</span>
                            </div>
                          ))}
                          {lead.alerts.length > 2 && (
                            <span className="text-xs text-[#706e6b]">+{lead.alerts.length - 2} more</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "rounded-sm capitalize",
                            lead.alertSeverity === "high" ? "bg-red-50 text-red-700 border-red-200" :
                            lead.alertSeverity === "medium" ? "bg-orange-50 text-orange-700 border-orange-200" :
                            "bg-yellow-50 text-yellow-700 border-yellow-200"
                          )}
                        >
                          {lead.alertSeverity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#3e3e3c]">{lead.caseManager}</TableCell>
                      <TableCell className="text-xs text-[#706e6b]">{lead.alertAge}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
            {filteredLeads.map(lead => (
              <Card 
                key={lead.id}
                className="border border-[#dddbda] rounded-[8px] bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => onViewLead(lead)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-[#145F33] flex items-center justify-center text-white font-bold shrink-0">
                      {lead.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#3e3e3c] truncate">{lead.name}</h3>
                      <p className="text-xs text-[#706e6b]">ID: {lead.id}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "rounded-full text-[10px] capitalize shrink-0",
                        lead.alertSeverity === "high" ? "bg-red-50 text-red-700 border-red-200" :
                        lead.alertSeverity === "medium" ? "bg-orange-50 text-orange-700 border-orange-200" :
                        "bg-yellow-50 text-yellow-700 border-yellow-200"
                      )}
                    >
                      {lead.alertSeverity}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2.5 mb-4 text-xs">
                    <div className="flex items-center gap-1.5 text-[#706e6b]">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{lead.guardian}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#706e6b]">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{lead.program}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#706e6b]">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">CM: {lead.caseManager}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#706e6b] font-medium">Active Alerts ({lead.alerts.length})</span>
                      <span className="text-[#706e6b]">{lead.alertAge} old</span>
                    </div>
                    {lead.alerts.map((alert, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 px-2 py-1.5 rounded-[8px]">
                        <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                        <span className="flex-1">{alert}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-[#dddbda]">
                    <AdmissionsStageBadge stage={lead.stage} />
                    <span className="text-[11px] text-[#706e6b]">{lead.daysInStage}d in stage</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredLeads.length === 0 && (
          <div className="text-center py-12 bg-white rounded-[8px] border border-[#dddbda]">
            <AlertTriangle className="h-12 w-12 text-[#706e6b] mx-auto mb-4" />
            <p className="text-[#3e3e3c] font-medium">No alerts found</p>
            <p className="text-sm text-[#706e6b] mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}