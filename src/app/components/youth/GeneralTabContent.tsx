import { useState } from "react";
import { User, Phone, Briefcase, Target, Users, Home, FileText, Link, File, MessageSquare, AlertTriangle, Edit2, Save, Plus, X, Calendar } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "../../lib/utils";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

export function GeneralTabContent() {
  const [activeSubTab, setActiveSubTab] = useState("constituent-details");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "Aaron Ace",
    dateOfBirth: "2010-01-15",
    gender: "male",
    pronouns: "He/Him"
  });

  const subTabs = [
    { id: "constituent-details", label: "Constituent Details", icon: User },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "roles", label: "Constituent Roles", icon: Briefcase },
    { id: "program-enrollment", label: "Program Enrollment", icon: Target },
    { id: "cpi-eligibility", label: "CPI Eligibility", icon: FileText },
    { id: "household", label: "Household Details", icon: Home },
    { id: "admissions", label: "Admissions", icon: FileText },
    { id: "relationships", label: "Relationships", icon: Users },
    { id: "connections", label: "Connections", icon: Link },
    { id: "documents", label: "Documents", icon: File },
    { id: "notes", label: "Notes", icon: MessageSquare },
    { id: "restrictions", label: "Campus Restrictions", icon: AlertTriangle },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Horizontal Tab Navigation */}
      <div 
        className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto"
      >
        <nav className="flex items-center gap-6 border-b min-w-max" style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'white' }}>
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id);
                  setIsEditing(false); // Reset editing state when switching tabs
                }}
                className="flex items-center gap-2 px-4 py-3 text-[13px] font-semibold whitespace-nowrap relative transition-colors"
                style={{
                  color: activeSubTab === tab.id ? 'var(--color-brand-primary)' : 'var(--slds-g-color-text-default)',
                  borderBottom: activeSubTab === tab.id ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
                  marginBottom: '-1px'
                }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-6 pb-8">
          
          {/* Constituent Details */}
          {activeSubTab === "constituent-details" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[16px]">Constituent Details</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="h-8 rounded-full text-[13px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)'
                  }}
                >
                  {isEditing ? (
                    <>
                      <Save className="h-3.5 w-3.5 mr-1.5" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                      Edit Details
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-[13px] font-medium mb-1.5">Full Name</Label>
                    {isEditing ? (
                      <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="h-9 text-[13px]" />
                    ) : (
                      <div className="text-[14px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{formData.fullName}</div>
                    )}
                  </div>
                  <div>
                    <Label className="text-[13px] font-medium mb-1.5">Date of Birth</Label>
                    {isEditing ? (
                      <DateInput
value={isoToMdy(formData.dateOfBirth)} onChange={(v) => ((e) => setFormData({ ...formData, dateOfBirth: e.target.value }))({ target: { value: mdyToIso(v) } })} className="h-9 text-[13px]" />
                    ) : (
                      <div className="text-[14px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{formData.dateOfBirth}</div>
                    )}
                  </div>
                  <div>
                    <Label className="text-[13px] font-medium mb-1.5">Gender (Optional)</Label>
                    {isEditing ? (
                      <Select defaultValue={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                        <SelectTrigger className="h-9 text-[13px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-[14px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{formData.gender}</div>
                    )}
                  </div>
                  <div>
                    <Label className="text-[13px] font-medium mb-1.5">Preferred Pronouns</Label>
                    {isEditing ? (
                      <Input value={formData.pronouns} onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })} className="h-9 text-[13px]" />
                    ) : (
                      <div className="text-[14px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{formData.pronouns}</div>
                    )}
                  </div>
                  <div>
                    <Label className="text-[13px] font-medium mb-1.5">Status</Label>
                    <Badge 
                      className="text-[11px] font-medium px-2.5 py-0.5"
                      style={{
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      Active
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-[13px] font-medium mb-1.5">Admission Date</Label>
                    <div className="text-[14px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>03/04/2025</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact */}
          {activeSubTab === "contact" && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-[16px]">Contact Information</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 rounded-full text-[13px]"
                    style={{
                      backgroundColor: 'var(--slds-g-color-background-base)',
                      border: '1px solid var(--slds-g-color-border-base-1)'
                    }}
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                    Edit Contact
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-[13px] font-medium mb-1.5">Phone</Label>
                      <div className="text-[14px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>(555) 123-4567</div>
                    </div>
                    <div>
                      <Label className="text-[13px] font-medium mb-1.5">Email</Label>
                      <div className="text-[14px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>aaron.ace@example.com</div>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[13px] font-medium mb-1.5">Address</Label>
                      <div className="text-[14px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        123 Main Street<br />
                        Chicago, IL 60601
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-[16px]">Emergency Contact</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 rounded-full text-[13px]"
                    style={{
                      backgroundColor: 'var(--slds-g-color-background-base)',
                      border: '1px solid var(--slds-g-color-border-base-1)'
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Contact
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-[13px] font-medium mb-1.5">Name</Label>
                      <div className="text-[14px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>John Ace</div>
                    </div>
                    <div>
                      <Label className="text-[13px] font-medium mb-1.5">Phone</Label>
                      <div className="text-[14px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>(555) 987-6543</div>
                    </div>
                    <div>
                      <Label className="text-[13px] font-medium mb-1.5">Relationship</Label>
                      <div className="text-[14px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>Guardian</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Constituent Roles */}
          {activeSubTab === "roles" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[16px]">Constituent Roles</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 rounded-full text-[13px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)'
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Role
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-[14px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Youth</div>
                        <div className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Active Role</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-[13px]">
                      <div>
                        <Label className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Start Date</Label>
                        <div className="font-medium mt-1" style={{ color: 'var(--slds-g-color-text-default)' }}>03/04/2025</div>
                      </div>
                      <div>
                        <Label className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>End Date</Label>
                        <div className="font-medium mt-1" style={{ color: 'var(--slds-g-color-text-default)' }}>—</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Program Enrollment */}
          {activeSubTab === "program-enrollment" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[16px]">Program Enrollment</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 rounded-full text-[13px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)'
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Enroll in Program
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-[14px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Brandon</div>
                        <Badge 
                          className="text-[10px] font-medium px-2 py-0.5"
                          style={{
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none'
                          }}
                        >
                          Active
                        </Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 rounded-full text-[11px]"
                        style={{
                          backgroundColor: 'var(--slds-g-color-background-base)',
                          border: '1px solid var(--slds-g-color-border-base-1)'
                        }}
                      >
                        Update Status
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-[13px]">
                      <div>
                        <Label className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Enrollment Date</Label>
                        <div className="font-medium mt-1" style={{ color: 'var(--slds-g-color-text-default)' }}>03/04/2025</div>
                      </div>
                      <div>
                        <Label className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Program Type</Label>
                        <div className="font-medium mt-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Residential</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CPI Eligibility */}
          {activeSubTab === "cpi-eligibility" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[16px]">CPI Eligibility</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 rounded-full text-[13px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)'
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                  Update Eligibility
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-[13px] font-medium mb-1.5">Eligibility Status</Label>
                    <Badge 
                      className="text-[11px] font-medium px-2.5 py-0.5"
                      style={{
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      Yes - Eligible
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-[13px] font-medium mb-1.5">Review Date</Label>
                    <div className="text-[14px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>06/01/2025</div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[13px] font-medium mb-1.5">Notes</Label>
                    <div className="text-[14px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      Eligibility verified and approved on 03/04/2025. Next review scheduled for 06/01/2025.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Household Details */}
          {activeSubTab === "household" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[16px]">Household Details</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 rounded-full text-[13px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)'
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Member
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Label className="text-[13px] font-medium mb-1.5">Household Size</Label>
                  <div className="text-[14px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>4 members</div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>HOUSEHOLD MEMBERS</h4>
                  
                  <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[14px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>John Ace</div>
                        <div className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Guardian</div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 rounded-full text-[11px]"
                        style={{
                          backgroundColor: 'var(--slds-g-color-background-base)',
                          border: '1px solid var(--slds-g-color-border-base-1)'
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[14px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>Jane Ace</div>
                        <div className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Sibling</div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 rounded-full text-[11px]"
                        style={{
                          backgroundColor: 'var(--slds-g-color-background-base)',
                          border: '1px solid var(--slds-g-color-border-base-1)'
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admissions */}
          {activeSubTab === "admissions" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-[16px]">Admissions Workflow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Workflow Timeline */}
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-brand-primary)' }}
                      >
                        <span className="text-white text-[12px] font-semibold">✓</span>
                      </div>
                      <div className="text-[11px] font-medium mt-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Intake</div>
                    </div>
                    <div className="flex-1 h-0.5" style={{ backgroundColor: 'var(--color-brand-primary)' }} />
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-brand-primary)' }}
                      >
                        <span className="text-white text-[12px] font-semibold">✓</span>
                      </div>
                      <div className="text-[11px] font-medium mt-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Assessment</div>
                    </div>
                    <div className="flex-1 h-0.5" style={{ backgroundColor: 'var(--color-brand-primary)' }} />
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-brand-primary)' }}
                      >
                        <span className="text-white text-[12px] font-semibold">✓</span>
                      </div>
                      <div className="text-[11px] font-medium mt-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Approved</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-[13px] font-medium mb-1.5">Intake Date</Label>
                      <div className="text-[14px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>02/20/2025</div>
                    </div>
                    <div>
                      <Label className="text-[13px] font-medium mb-1.5">Approval Status</Label>
                      <Badge 
                        className="text-[11px] font-medium px-2.5 py-0.5"
                        style={{
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none'
                        }}
                      >
                        Approved
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[13px] font-medium mb-1.5">Assessment Notes</Label>
                      <div className="text-[14px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        Initial assessment completed. Candidate meets all program requirements and has been approved for admission.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Relationships */}
          {activeSubTab === "relationships" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[16px]">Relationships</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 rounded-full text-[13px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)'
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Relationship
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-[14px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>John Ace</div>
                        <div className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Guardian</div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 rounded-full text-[11px]"
                        style={{
                          backgroundColor: 'var(--slds-g-color-background-base)',
                          border: '1px solid var(--slds-g-color-border-base-1)'
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="h-3.5 w-3.5" />
                        (555) 987-6543
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connections */}
          {activeSubTab === "connections" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[16px]">Connections</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 rounded-full text-[13px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)'
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Connection
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-[14px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Community Volunteer</div>
                        <Badge 
                          variant="outline"
                          className="text-[10px] font-medium px-2 py-0.5"
                        >
                          Volunteer
                        </Badge>
                      </div>
                    </div>
                    <div className="text-[13px] mt-2" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      Weekly check-ins every Monday at 3:00 PM
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {activeSubTab === "documents" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[16px]">Documents</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 rounded-full text-[13px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)'
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Upload Document
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
                      <div>
                        <div className="text-[14px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>Birth Certificate</div>
                        <div className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Uploaded 03/01/2025</div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
                      <div>
                        <div className="text-[14px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>Medical Records</div>
                        <div className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Uploaded 03/02/2025</div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {activeSubTab === "notes" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[16px]">Notes</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 rounded-full text-[13px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)'
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Note
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Initial intake completed</div>
                      <div className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>03/04/2025</div>
                    </div>
                    <div className="text-[13px] mb-2" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      Youth and guardian completed intake process. All required documentation received and verified.
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      By Sarah Johnson, LCSW
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campus Restrictions */}
          {activeSubTab === "restrictions" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[16px]">Campus Restrictions</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 rounded-full text-[13px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)'
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Restriction
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border-l-4" style={{ borderLeftColor: '#ff9800', backgroundColor: '#fff8e1' }}>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-[14px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Library Access Limited</div>
                        <div className="text-[13px] mb-2" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                          Restricted access until further notice due to behavioral incident.
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-[12px]">
                          <div>
                            <span className="font-medium">Start Date:</span> 03/10/2025
                          </div>
                          <div>
                            <span className="font-medium">End Date:</span> 03/24/2025
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}