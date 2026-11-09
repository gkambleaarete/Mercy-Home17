import { useState } from "react";
import { 
  ArrowLeft,
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Activity,
  Briefcase,
  GraduationCap,
  Heart,
  Users,
  Target,
  ClipboardList,
  Download,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit
} from "@/app/lib/lucide-icons";
import { ResidentProfile as ResidentProfileType } from "../data/mockResidentData";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { formatMdy } from "../lib/dateFormat";

interface ResidentProfileProps {
  resident: ResidentProfileType;
  onClose: () => void;
}

export function ResidentProfile({ resident, onClose }: ResidentProfileProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Calculate avatar initials
  const initials = resident.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Define program phases based on current phase
  const phases = [
    { name: "Intake", status: "completed" },
    { name: "Orientation", status: "completed" },
    { name: resident.caseManagement.currentPhase || "Stabilization", status: "current" },
    { name: "Transition", status: "inactive" },
    { name: "Exit Ready", status: "inactive" }
  ];

  // Calculate days in current stage (mock calculation)
  const daysInStage = 45;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "case-management", label: "Case Management" },
    { id: "assessments", label: "Assessments" },
    { id: "schedule", label: "Schedule" }
  ];

  return (
    <div 
      className="h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}
    >
      {/* Header */}
      <div 
        className="px-6 py-4 shrink-0"
        style={{
          backgroundColor: 'var(--slds-g-color-background-base)',
          borderBottom: '1px solid var(--slds-g-color-border-base-1)'
        }}
      >
        {/* Breadcrumbs */}
        <nav className="flex items-center slds-text-3 mb-3" style={{ color: 'var(--slds-g-color-text-weak)' }} aria-label="Breadcrumb">
          <span 
            className="hover:underline cursor-pointer" 
            onClick={onClose}
          >
            Dashboard
          </span>
          <ChevronRight className="h-3 w-3 mx-1" />
          <span 
            className="hover:underline cursor-pointer"
            onClick={onClose}
          >
            Current Residents
          </span>
          <ChevronRight className="h-3 w-3 mx-1" />
          <span style={{ color: 'var(--slds-g-color-text-default)' }}>{resident.name}</span>
        </nav>

        {/* Main Header Content */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div 
              className="flex items-center justify-center flex-shrink-0 rounded-full"
              style={{
                width: '56px',
                height: '56px',
                backgroundColor: 'var(--color-brand-primary)',
                color: 'white'
              }}
            >
              <User className="h-6 w-6" />
            </div>

            {/* Name and Info */}
            <div>
              <h1 className="slds-text-heading-medium text-[var(--slds-g-color-text-default)]">
                {resident.name}
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="slds-text-5 text-[var(--slds-g-color-text-weak)]">
                  {resident.programName}
                </span>
                {resident.personalInfo.phone && (
                  <div className="flex items-center gap-1.5 slds-text-5 text-[var(--slds-g-color-text-weak)]">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{resident.personalInfo.phone}</span>
                  </div>
                )}
                {resident.personalInfo.email && (
                  <div className="flex items-center gap-1.5 slds-text-5 text-[var(--slds-g-color-text-weak)]">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{resident.personalInfo.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-sm h-9 slds-text-4"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Log Activity
            </Button>
            <Button 
              size="sm" 
              className="rounded-sm text-white h-9 slds-text-4"
              style={{ 
                backgroundColor: 'var(--color-brand-primary)',
                border: 'none'
              }}
            >
              <Edit className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Pipeline Progress */}
      <div 
        className="px-6 py-4 shrink-0"
        style={{
          backgroundColor: 'var(--slds-g-color-background-base)',
          borderBottom: '1px solid var(--slds-g-color-border-base-1)'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="slds-form-label text-[var(--slds-g-color-text-weak)]">
            Pipeline Progress
          </h3>
          <span className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
            {daysInStage} Days in {resident.caseManagement.currentPhase || "Current Stage"}
          </span>
        </div>

        {/* Chevron Pipeline */}
        <div className="flex items-center">
          {phases.map((phase, index) => (
            <div key={phase.name} className="flex items-center flex-1">
              <div 
                className="relative flex items-center justify-center h-12 flex-1 slds-text-4 font-medium uppercase tracking-wider"
                style={{
                  backgroundColor: 
                    phase.status === 'completed' ? '#A0E8DE' :
                    phase.status === 'current' ? '#003366' : 
                    '#E5E5E5',
                  color: 
                    phase.status === 'completed' ? '#065F46' :
                    phase.status === 'current' ? 'white' : 
                    '#706e6b',
                  clipPath: index === phases.length - 1 
                    ? 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)'
                    : 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)',
                  marginRight: index === phases.length - 1 ? '0' : '-12px',
                  zIndex: phases.length - index
                }}
              >
                {phase.status === 'completed' && (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                <span>{phase.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div 
        className="px-6 shrink-0"
        style={{
          backgroundColor: 'var(--slds-g-color-background-base)',
          borderBottom: '1px solid var(--slds-g-color-border-base-1)'
        }}
      >
        <div className="flex gap-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative py-3 slds-text-5 font-medium transition-colors"
                style={{
                  color: isActive ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                  borderBottom: isActive ? '3px solid var(--color-brand-primary)' : '3px solid transparent'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Main Content */}
          <div className="col-span-8 min-w-0 space-y-6">
            
            {/* Resident Details Card */}
            <Card 
              className="shadow-sm"
              style={{
                borderRadius: 'var(--slds-c-card-radius-border)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              <CardContent className="p-6">
                <h3 className="slds-section-title mb-4 text-[var(--slds-g-color-text-default)]">
                  Resident Details
                </h3>
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                      Case Manager
                    </p>
                    <p className="slds-text-6 text-[var(--slds-g-color-text-default)]">
                      {resident.caseManager}
                    </p>
                  </div>

                  <div>
                    <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                      Admission Date
                    </p>
                    <p className="slds-text-6 text-[var(--slds-g-color-text-default)]">
                      {formatMdy(new Date(resident.admissionDate))}
                    </p>
                  </div>

                  <div>
                    <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                      Current Living Situation
                    </p>
                    <p className="slds-text-6 text-[var(--slds-g-color-text-default)]">
                      {resident.addressInfo.current.city}, {resident.addressInfo.current.state}
                    </p>
                  </div>

                  <div>
                    <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                      Length of Stay
                    </p>
                    <p className="slds-text-6 text-[var(--slds-g-color-text-default)]">
                      {resident.lengthOfStay}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card 
              className="shadow-sm"
              style={{
                borderRadius: 'var(--slds-c-card-radius-border)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              <CardContent className="p-6">
                <h3 className="slds-section-title mb-4 text-[var(--slds-g-color-text-default)]">
                  Recent Activity
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-[var(--color-brand-primary)] mt-2 shrink-0" />
                    <div className="flex-1">
                      <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                        Case plan updated 2 hours ago
                      </p>
                      <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1">
                        by {resident.caseManager}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-[var(--slds-g-color-border-base-2)] mt-2 shrink-0" />
                    <div className="flex-1">
                      <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                        Medical appointment completed
                      </p>
                      <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1">
                        3 days ago
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-[var(--slds-g-color-border-base-2)] mt-2 shrink-0" />
                    <div className="flex-1">
                      <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                        Goal milestone achieved: Educational Progress
                      </p>
                      <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1">
                        1 week ago
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information Card */}
            <Card 
              className="shadow-sm"
              style={{
                borderRadius: 'var(--slds-c-card-radius-border)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              <CardContent className="p-6">
                <h3 className="slds-section-title mb-4 text-[var(--slds-g-color-text-default)]">
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                      Date of Birth
                    </p>
                    <p className="slds-text-6 text-[var(--slds-g-color-text-default)]">
                      {formatMdy(new Date(resident.dateOfBirth))}
                    </p>
                  </div>

                  <div>
                    <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                      Age
                    </p>
                    <p className="slds-text-6 text-[var(--slds-g-color-text-default)]">
                      {resident.age} years
                    </p>
                  </div>

                  <div>
                    <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                      Gender
                    </p>
                    <p className="slds-text-6 text-[var(--slds-g-color-text-default)]">
                      {resident.personalInfo.gender}
                    </p>
                  </div>

                  <div>
                    <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                      Preferred Language
                    </p>
                    <p className="slds-text-6 text-[var(--slds-g-color-text-default)]">
                      {resident.personalInfo.preferredLanguage}
                    </p>
                  </div>

                  <div>
                    <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                      Race
                    </p>
                    <p className="slds-text-6 text-[var(--slds-g-color-text-default)]">
                      {resident.personalInfo.race}
                    </p>
                  </div>

                  <div>
                    <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                      Ethnicity
                    </p>
                    <p className="slds-text-6 text-[var(--slds-g-color-text-default)]">
                      {resident.personalInfo.ethnicity}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Analytics & Widgets */}
          <div className="col-span-4 min-w-0 space-y-6">
            
            {/* Progress Analytics Card */}
            <Card 
              className="shadow-sm"
              style={{
                borderRadius: 'var(--slds-c-card-radius-border)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              <CardContent className="p-6">
                <h3 className="slds-section-title mb-4 text-[var(--slds-g-color-text-default)]">
                  Program Progress
                </h3>
                
                <div className="space-y-4">
                  {/* Overall Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="slds-text-4 text-[var(--slds-g-color-text-default)]">
                        Overall Progress
                      </span>
                      <span className="slds-text-4 font-semibold text-[var(--color-brand-primary)]">
                        {resident.caseManagement.overallProgress}%
                      </span>
                    </div>
                    <div 
                      className="h-2 rounded-full"
                      style={{ backgroundColor: 'var(--slds-g-color-neutral-base-90)' }}
                    >
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${resident.caseManagement.overallProgress}%`,
                          backgroundColor: 'var(--color-brand-primary)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Active Goals Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="slds-text-4 text-[var(--slds-g-color-text-default)]">
                        Active Goals
                      </span>
                      <span className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)]">
                        {resident.goals.filter(g => g.status === 'In Progress').length}/{resident.goals.length}
                      </span>
                    </div>
                    <div 
                      className="h-2 rounded-full"
                      style={{ backgroundColor: 'var(--slds-g-color-neutral-base-90)' }}
                    >
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${(resident.goals.filter(g => g.status === 'In Progress').length / resident.goals.length) * 100}%`,
                          backgroundColor: '#FFA500'
                        }}
                      />
                    </div>
                  </div>

                  {/* Supervision Level */}
                  <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-2">
                      Current Status
                    </p>
                    <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                      Supervision Level: <span className="font-semibold">{resident.caseManagement.supervisionLevel}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card 
              className="shadow-sm"
              style={{
                borderRadius: 'var(--slds-c-card-radius-border)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              <CardContent className="p-6">
                <h3 className="slds-section-title mb-4 text-[var(--slds-g-color-text-default)]">
                  Quick Stats
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                      Active Services
                    </p>
                    <p className="slds-text-7 font-semibold text-[var(--slds-g-color-text-default)]">
                      {resident.services.filter(s => s.status === 'Active').length}
                    </p>
                  </div>

                  <div>
                    <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                      Active Medications
                    </p>
                    <p className="slds-text-7 font-semibold text-[var(--slds-g-color-text-default)]">
                      {resident.medicalInfo.medications.length}
                    </p>
                  </div>

                  <div>
                    <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                      Upcoming Appointments
                    </p>
                    <p className="slds-text-7 font-semibold text-[var(--slds-g-color-text-default)]">
                      3
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact Card */}
            <Card 
              className="shadow-sm"
              style={{
                borderRadius: 'var(--slds-c-card-radius-border)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              <CardContent className="p-6">
                <h3 className="slds-section-title mb-4 text-[var(--slds-g-color-text-default)]">
                  Emergency Contact
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                      Name
                    </p>
                    <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                      {resident.personalInfo.emergencyContact.name}
                    </p>
                  </div>

                  <div>
                    <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                      Relationship
                    </p>
                    <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                      {resident.personalInfo.emergencyContact.relationship}
                    </p>
                  </div>

                  <div>
                    <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                      Phone
                    </p>
                    <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                      {resident.personalInfo.emergencyContact.phone}
                    </p>
                  </div>

                  {resident.personalInfo.emergencyContact.email && (
                    <div>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                        Email
                      </p>
                      <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                        {resident.personalInfo.emergencyContact.email}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
        )}

        {/* Case Management Tab */}
        {activeTab === "case-management" && (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="col-span-8 min-w-0 space-y-6">
              
              {/* Case Details Card */}
              <Card 
                className="shadow-sm"
                style={{
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="slds-section-title text-[var(--slds-g-color-text-default)]">
                      Case Details
                    </h3>
                    <Button 
                      size="sm" 
                      className="rounded-sm h-8 slds-text-4"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-base)',
                        border: '1px solid var(--slds-g-color-border-base-1)',
                        color: 'var(--slds-g-color-text-default)'
                      }}
                    >
                      <Edit className="h-3.5 w-3.5 mr-2" /> Edit Case
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                        Intake Date
                      </p>
                      <p className="slds-text-6 text-[var(--slds-g-color-text-default)]">
                        {formatMdy(new Date(resident.caseManagement.intakeDate))}
                      </p>
                    </div>

                    <div>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                        Assessment Date
                      </p>
                      <p className="slds-text-6 text-[var(--slds-g-color-text-default)]">
                        {formatMdy(new Date(resident.caseManagement.assessmentDate))}
                      </p>
                    </div>

                    <div>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                        Service Start Date
                      </p>
                      <p className="slds-text-6 text-[var(--slds-g-color-text-default)]">
                        {formatMdy(new Date(resident.caseManagement.serviceStartDate))}
                      </p>
                    </div>

                    <div>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                        Projected Exit Date
                      </p>
                      <p className="slds-text-6 text-[var(--slds-g-color-text-default)]">
                        {formatMdy(new Date(resident.caseManagement.projectedExitDate))}
                      </p>
                    </div>

                    <div>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                        Current Phase
                      </p>
                      <p className="slds-text-6 text-[var(--slds-g-color-text-default)]">
                        {resident.caseManagement.currentPhase}
                      </p>
                    </div>

                    <div>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                        Supervision Level
                      </p>
                      <Badge
                        className="slds-text-4 rounded-sm"
                        style={{
                          backgroundColor: '#FEF3C7',
                          borderColor: '#F59E0B',
                          color: '#92400E'
                        }}
                      >
                        {resident.caseManagement.supervisionLevel}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Goals & Objectives Card */}
              <Card 
                className="shadow-sm"
                style={{
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="slds-section-title text-[var(--slds-g-color-text-default)]">
                      Goals & Objectives
                    </h3>
                    <Button 
                      size="sm" 
                      className="rounded-sm h-8 slds-text-4"
                      style={{
                        backgroundColor: 'var(--color-brand-primary)',
                        border: 'none',
                        color: 'white'
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-2" /> Add Goal
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {resident.goals.map((goal) => (
                      <div 
                        key={goal.id}
                        className="p-4 rounded"
                        style={{
                          backgroundColor: 'var(--slds-g-color-background-alt)',
                          border: '1px solid var(--slds-g-color-border-base-1)'
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                className="slds-text-3 rounded-sm"
                                style={{
                                  backgroundColor: '#EEF4FF',
                                  borderColor: '#3B82F6',
                                  color: '#1E40AF'
                                }}
                              >
                                {goal.category}
                              </Badge>
                              <Badge
                                className="slds-text-3 rounded-sm"
                                style={{
                                  backgroundColor: 
                                    goal.status === 'Completed' ? '#D1FAE5' :
                                    goal.status === 'In Progress' ? '#FEF3C7' : '#F3F4F6',
                                  borderColor: 
                                    goal.status === 'Completed' ? '#10B981' :
                                    goal.status === 'In Progress' ? '#F59E0B' : '#9CA3AF',
                                  color: 
                                    goal.status === 'Completed' ? '#065F46' :
                                    goal.status === 'In Progress' ? '#92400E' : '#4B5563'
                                }}
                              >
                                {goal.status}
                              </Badge>
                            </div>
                            <p className="slds-text-5 text-[var(--slds-g-color-text-default)] mb-2">
                              {goal.description}
                            </p>
                            <div className="flex items-center gap-4 slds-text-3 text-[var(--slds-g-color-text-weak)]">
                              <span>Target: {formatMdy(new Date(goal.targetDate))}</span>
                              <span>•</span>
                              <span>Assigned to: {goal.assignedTo}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="slds-text-3 text-[var(--slds-g-color-text-weak)]">Progress</span>
                            <span className="slds-text-3 font-semibold text-[var(--slds-g-color-text-default)]">{goal.progress}%</span>
                          </div>
                          <div 
                            className="h-2 rounded-full"
                            style={{ backgroundColor: 'var(--slds-g-color-neutral-base-90)' }}
                          >
                            <div 
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${goal.progress}%`,
                                backgroundColor: 
                                  goal.progress === 100 ? '#10B981' :
                                  goal.progress >= 50 ? '#3B82F6' : '#F59E0B'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Services Card */}
              <Card 
                className="shadow-sm"
                style={{
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="slds-section-title text-[var(--slds-g-color-text-default)]">
                      Active Services
                    </h3>
                    <Button 
                      size="sm" 
                      className="rounded-sm h-8 slds-text-4"
                      style={{
                        backgroundColor: 'var(--color-brand-primary)',
                        border: 'none',
                        color: 'white'
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-2" /> Add Service
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {resident.services.map((service) => (
                      <div 
                        key={service.id}
                        className="flex items-center justify-between p-3 rounded"
                        style={{
                          backgroundColor: 'var(--slds-g-color-background-alt)',
                          border: '1px solid var(--slds-g-color-border-base-1)'
                        }}
                      >
                        <div className="flex-1">
                          <p className="slds-text-5 font-medium text-[var(--slds-g-color-text-default)] mb-1">
                            {service.serviceName}
                          </p>
                          <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                            {service.provider} • {service.frequency} • Started {formatMdy(new Date(service.startDate))}
                          </p>
                        </div>
                        <Badge
                          className="slds-text-3 rounded-sm"
                          style={{
                            backgroundColor: service.status === 'Active' ? '#D1FAE5' : '#F3F4F6',
                            borderColor: service.status === 'Active' ? '#10B981' : '#9CA3AF',
                            color: service.status === 'Active' ? '#065F46' : '#4B5563'
                          }}
                        >
                          {service.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right Column */}
            <div className="col-span-4 min-w-0 space-y-6">
              
              {/* Case Manager Info Card */}
              <Card 
                className="shadow-sm"
                style={{
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-6">
                  <h3 className="slds-section-title mb-4 text-[var(--slds-g-color-text-default)]">
                    Case Manager
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                        Name
                      </p>
                      <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                        {resident.caseManager}
                      </p>
                    </div>

                    <div>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                        Email
                      </p>
                      <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                        {resident.caseManagement.caseManagerEmail}
                      </p>
                    </div>

                    <div>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                        Phone
                      </p>
                      <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                        {resident.caseManagement.caseManagerPhone}
                      </p>
                    </div>

                    <Button 
                      className="w-full rounded-sm mt-4 h-9 slds-text-4"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-base)',
                        border: '1px solid var(--slds-g-color-border-base-1)',
                        color: 'var(--slds-g-color-text-default)'
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" /> Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Information Card */}
              <Card 
                className="shadow-sm"
                style={{
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-6">
                  <h3 className="slds-section-title mb-4 text-[var(--slds-g-color-text-default)]">
                    Medical Summary
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                        Primary Physician
                      </p>
                      <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                        {resident.medicalInfo.primaryPhysician}
                      </p>
                    </div>

                    <div>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                        Insurance Provider
                      </p>
                      <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                        {resident.medicalInfo.insuranceProvider}
                      </p>
                    </div>

                    <div>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                        Active Medications
                      </p>
                      <p className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)]">
                        {resident.medicalInfo.medications.length}
                      </p>
                    </div>

                    <div>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                        Known Allergies
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {resident.medicalInfo.allergies.map((allergy) => (
                          <Badge
                            key={allergy}
                            className="slds-text-3 rounded-sm"
                            style={{
                              backgroundColor: '#FEE2E2',
                              borderColor: '#EF4444',
                              color: '#991B1B'
                            }}
                          >
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Education & Employment Card */}
              <Card 
                className="shadow-sm"
                style={{
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-6">
                  <h3 className="slds-section-title mb-4 text-[var(--slds-g-color-text-default)]">
                    Education & Employment
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                        Education Level
                      </p>
                      <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                        {resident.educationEmployment.educationLevel}
                      </p>
                    </div>

                    {resident.educationEmployment.currentSchool && (
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                          Current School
                        </p>
                        <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                          {resident.educationEmployment.currentSchool}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                        Employment Status
                      </p>
                      <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                        {resident.educationEmployment.employmentStatus}
                      </p>
                    </div>

                    {resident.educationEmployment.employer && (
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                          Employer
                        </p>
                        <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                          {resident.educationEmployment.employer}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        )}

        {/* Assessments Tab */}
        {activeTab === "assessments" && (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="col-span-8 min-w-0 space-y-6">
              
              {/* Assessment Overview Card */}
              <Card 
                className="shadow-sm"
                style={{
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="slds-section-title text-[var(--slds-g-color-text-default)]">
                      Assessment History
                    </h3>
                    <Button 
                      size="sm" 
                      className="rounded-sm h-8 slds-text-4"
                      style={{
                        backgroundColor: 'var(--color-brand-primary)',
                        border: 'none',
                        color: 'white'
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-2" /> New Assessment
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Initial Assessment */}
                    <div 
                      className="p-4 rounded"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-alt)',
                        border: '1px solid var(--slds-g-color-border-base-1)'
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)] mb-1">
                            Initial Assessment
                          </h4>
                          <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                            Completed on {formatMdy(new Date(resident.caseManagement.assessmentDate))}
                          </p>
                        </div>
                        <Badge
                          className="slds-text-3 rounded-sm"
                          style={{
                            backgroundColor: '#D1FAE5',
                            borderColor: '#10B981',
                            color: '#065F46'
                          }}
                        >
                          Complete
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <div>
                          <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mb-1">Risk Level</p>
                          <Badge
                            className="slds-text-3 rounded-sm"
                            style={{
                              backgroundColor: '#FEF3C7',
                              borderColor: '#F59E0B',
                              color: '#92400E'
                            }}
                          >
                            Moderate
                          </Badge>
                        </div>
                        <div>
                          <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mb-1">Completed By</p>
                          <p className="slds-text-4 text-[var(--slds-g-color-text-default)]">{resident.caseManager}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full rounded-sm mt-3 h-8 slds-text-4"
                        style={{
                          backgroundColor: 'var(--slds-g-color-background-base)',
                          border: '1px solid var(--slds-g-color-border-base-1)',
                          color: 'var(--slds-g-color-text-default)'
                        }}
                      >
                        <FileText className="h-3.5 w-3.5 mr-2" /> View Full Assessment
                      </Button>
                    </div>

                    {/* 30-Day Assessment */}
                    <div 
                      className="p-4 rounded"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-alt)',
                        border: '1px solid var(--slds-g-color-border-base-1)'
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)] mb-1">
                            30-Day Progress Assessment
                          </h4>
                          <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                            Completed 2 weeks ago
                          </p>
                        </div>
                        <Badge
                          className="slds-text-3 rounded-sm"
                          style={{
                            backgroundColor: '#D1FAE5',
                            borderColor: '#10B981',
                            color: '#065F46'
                          }}
                        >
                          Complete
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <div>
                          <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mb-1">Progress Rating</p>
                          <Badge
                            className="slds-text-3 rounded-sm"
                            style={{
                              backgroundColor: '#D1FAE5',
                              borderColor: '#10B981',
                              color: '#065F46'
                            }}
                          >
                            Good Progress
                          </Badge>
                        </div>
                        <div>
                          <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mb-1">Completed By</p>
                          <p className="slds-text-4 text-[var(--slds-g-color-text-default)]">{resident.caseManager}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full rounded-sm mt-3 h-8 slds-text-4"
                        style={{
                          backgroundColor: 'var(--slds-g-color-background-base)',
                          border: '1px solid var(--slds-g-color-border-base-1)',
                          color: 'var(--slds-g-color-text-default)'
                        }}
                      >
                        <FileText className="h-3.5 w-3.5 mr-2" /> View Full Assessment
                      </Button>
                    </div>

                    {/* Upcoming Assessment */}
                    <div 
                      className="p-4 rounded"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-alt)',
                        border: '1px solid var(--slds-g-color-border-base-1)'
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)] mb-1">
                            90-Day Progress Assessment
                          </h4>
                          <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                            Due in 2 weeks
                          </p>
                        </div>
                        <Badge
                          className="slds-text-3 rounded-sm"
                          style={{
                            backgroundColor: '#FEF3C7',
                            borderColor: '#F59E0B',
                            color: '#92400E'
                          }}
                        >
                          Pending
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <div>
                          <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mb-1">Assigned To</p>
                          <p className="slds-text-4 text-[var(--slds-g-color-text-default)]">{resident.caseManager}</p>
                        </div>
                        <div>
                          <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mb-1">Due Date</p>
                          <p className="slds-text-4 text-[var(--slds-g-color-text-default)]">Dec 23, 2024</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full rounded-sm mt-3 h-8 slds-text-4"
                        style={{
                          backgroundColor: 'var(--color-brand-primary)',
                          border: 'none',
                          color: 'white'
                        }}
                      >
                        <Plus className="h-3.5 w-3.5 mr-2" /> Start Assessment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assessment Areas Card */}
              <Card 
                className="shadow-sm"
                style={{
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-6">
                  <h3 className="slds-section-title mb-4 text-[var(--slds-g-color-text-default)]">
                    Assessment Areas - Latest Scores
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                          Behavioral Health
                        </span>
                        <span className="slds-text-4 font-semibold text-[var(--color-brand-primary)]">
                          85/100
                        </span>
                      </div>
                      <div 
                        className="h-2 rounded-full"
                        style={{ backgroundColor: 'var(--slds-g-color-neutral-base-90)' }}
                      >
                        <div 
                          className="h-2 rounded-full"
                          style={{
                            width: '85%',
                            backgroundColor: '#10B981'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                          Academic Performance
                        </span>
                        <span className="slds-text-4 font-semibold text-[var(--color-brand-primary)]">
                          72/100
                        </span>
                      </div>
                      <div 
                        className="h-2 rounded-full"
                        style={{ backgroundColor: 'var(--slds-g-color-neutral-base-90)' }}
                      >
                        <div 
                          className="h-2 rounded-full"
                          style={{
                            width: '72%',
                            backgroundColor: '#3B82F6'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                          Social Skills
                        </span>
                        <span className="slds-text-4 font-semibold text-[var(--color-brand-primary)]">
                          90/100
                        </span>
                      </div>
                      <div 
                        className="h-2 rounded-full"
                        style={{ backgroundColor: 'var(--slds-g-color-neutral-base-90)' }}
                      >
                        <div 
                          className="h-2 rounded-full"
                          style={{
                            width: '90%',
                            backgroundColor: '#10B981'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                          Life Skills
                        </span>
                        <span className="slds-text-4 font-semibold text-[var(--color-brand-primary)]">
                          68/100
                        </span>
                      </div>
                      <div 
                        className="h-2 rounded-full"
                        style={{ backgroundColor: 'var(--slds-g-color-neutral-base-90)' }}
                      >
                        <div 
                          className="h-2 rounded-full"
                          style={{
                            width: '68%',
                            backgroundColor: '#3B82F6'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                          Family Relationships
                        </span>
                        <span className="slds-text-4 font-semibold text-[var(--color-brand-primary)]">
                          58/100
                        </span>
                      </div>
                      <div 
                        className="h-2 rounded-full"
                        style={{ backgroundColor: 'var(--slds-g-color-neutral-base-90)' }}
                      >
                        <div 
                          className="h-2 rounded-full"
                          style={{
                            width: '58%',
                            backgroundColor: '#F59E0B'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right Column */}
            <div className="col-span-4 min-w-0 space-y-6">
              
              {/* Assessment Schedule Card */}
              <Card 
                className="shadow-sm"
                style={{
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-6">
                  <h3 className="slds-section-title mb-4 text-[var(--slds-g-color-text-default)]">
                    Assessment Schedule
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-[var(--color-brand-primary)]" />
                        <p className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)]">
                          Weekly Check-in
                        </p>
                      </div>
                      <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                        Every Monday at 2:00 PM
                      </p>
                    </div>

                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-[var(--color-brand-primary)]" />
                        <p className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)]">
                          Monthly Review
                        </p>
                      </div>
                      <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                        First Friday of each month
                      </p>
                    </div>

                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-[var(--color-brand-primary)]" />
                        <p className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)]">
                          Quarterly Assessment
                        </p>
                      </div>
                      <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                        Next due: Dec 23, 2024
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Assessment Card */}
              <Card 
                className="shadow-sm"
                style={{
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-6">
                  <h3 className="slds-section-title mb-4 text-[var(--slds-g-color-text-default)]">
                    Current Risk Assessment
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-2">
                        Overall Risk Level
                      </p>
                      <Badge
                        className="slds-text-4 rounded-sm"
                        style={{
                          backgroundColor: '#FEF3C7',
                          borderColor: '#F59E0B',
                          color: '#92400E'
                        }}
                      >
                        Moderate
                      </Badge>
                    </div>

                    <div className="pt-3" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-2">
                        Risk Factors
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-[#F59E0B] mt-0.5 shrink-0" />
                          <span className="slds-text-4 text-[var(--slds-g-color-text-default)]">
                            History of truancy
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-[#F59E0B] mt-0.5 shrink-0" />
                          <span className="slds-text-4 text-[var(--slds-g-color-text-default)]">
                            Limited family support
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-3" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-2">
                        Protective Factors
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-[#10B981] mt-0.5 shrink-0" />
                          <span className="slds-text-4 text-[var(--slds-g-color-text-default)]">
                            Strong peer relationships
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-[#10B981] mt-0.5 shrink-0" />
                          <span className="slds-text-4 text-[var(--slds-g-color-text-default)]">
                            Engaged in counseling
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes Card */}
              <Card 
                className="shadow-sm"
                style={{
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-6">
                  <h3 className="slds-section-title mb-4 text-[var(--slds-g-color-text-default)]">
                    Assessment Notes
                  </h3>
                  
                  <p className="slds-text-4 text-[var(--slds-g-color-text-default)] mb-3">
                    Resident shows consistent improvement in behavioral health metrics. Recommend continued focus on family relationship building.
                  </p>
                  
                  <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                    Last updated 2 weeks ago by {resident.caseManager}
                  </p>
                </CardContent>
              </Card>

            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="col-span-8 min-w-0 space-y-6">
              
              {/* This Week's Schedule Card */}
              <Card 
                className="shadow-sm"
                style={{
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="slds-section-title text-[var(--slds-g-color-text-default)]">
                      This Week&apos;s Schedule
                    </h3>
                    <Button 
                      size="sm" 
                      className="rounded-sm h-8 slds-text-4"
                      style={{
                        backgroundColor: 'var(--color-brand-primary)',
                        border: 'none',
                        color: 'white'
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-2" /> Add Event
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Monday */}
                    <div>
                      <p className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)] mb-2">
                        Monday, December 9
                      </p>
                      <div className="space-y-2 ml-4">
                        <div 
                          className="flex items-start gap-3 p-3 rounded"
                          style={{
                            backgroundColor: 'var(--slds-g-color-background-alt)',
                            borderLeft: '3px solid #3B82F6'
                          }}
                        >
                          <Clock className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#3B82F6' }} />
                          <div className="flex-1">
                            <p className="slds-text-5 font-medium text-[var(--slds-g-color-text-default)]">
                              Individual Counseling Session
                            </p>
                            <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1">
                              2:00 PM - 3:00 PM • with Dr. Sarah Williams
                            </p>
                          </div>
                          <Badge
                            className="slds-text-3 rounded-sm"
                            style={{
                              backgroundColor: '#EEF4FF',
                              borderColor: '#3B82F6',
                              color: '#1E40AF'
                            }}
                          >
                            Counseling
                          </Badge>
                        </div>

                        <div 
                          className="flex items-start gap-3 p-3 rounded"
                          style={{
                            backgroundColor: 'var(--slds-g-color-background-alt)',
                            borderLeft: '3px solid #10B981'
                          }}
                        >
                          <Clock className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#10B981' }} />
                          <div className="flex-1">
                            <p className="slds-text-5 font-medium text-[var(--slds-g-color-text-default)]">
                              Group Recreation Activity
                            </p>
                            <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1">
                              4:00 PM - 5:00 PM • Recreation Room
                            </p>
                          </div>
                          <Badge
                            className="slds-text-3 rounded-sm"
                            style={{
                              backgroundColor: '#D1FAE5',
                              borderColor: '#10B981',
                              color: '#065F46'
                            }}
                          >
                            Recreation
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Tuesday */}
                    <div>
                      <p className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)] mb-2">
                        Tuesday, December 10
                      </p>
                      <div className="space-y-2 ml-4">
                        <div 
                          className="flex items-start gap-3 p-3 rounded"
                          style={{
                            backgroundColor: 'var(--slds-g-color-background-alt)',
                            borderLeft: '3px solid #8B5CF6'
                          }}
                        >
                          <Clock className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#8B5CF6' }} />
                          <div className="flex-1">
                            <p className="slds-text-5 font-medium text-[var(--slds-g-color-text-default)]">
                              Academic Tutoring - Math
                            </p>
                            <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1">
                              3:00 PM - 4:00 PM • Study Hall
                            </p>
                          </div>
                          <Badge
                            className="slds-text-3 rounded-sm"
                            style={{
                              backgroundColor: '#F3E8FF',
                              borderColor: '#8B5CF6',
                              color: '#5B21B6'
                            }}
                          >
                            Education
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Wednesday */}
                    <div>
                      <p className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)] mb-2">
                        Wednesday, December 11
                      </p>
                      <div className="space-y-2 ml-4">
                        <div 
                          className="flex items-start gap-3 p-3 rounded"
                          style={{
                            backgroundColor: 'var(--slds-g-color-background-alt)',
                            borderLeft: '3px solid #EF4444'
                          }}
                        >
                          <Clock className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#EF4444' }} />
                          <div className="flex-1">
                            <p className="slds-text-5 font-medium text-[var(--slds-g-color-text-default)]">
                              Medical Appointment
                            </p>
                            <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1">
                              10:00 AM - 11:00 AM • {resident.medicalInfo.primaryPhysician}
                            </p>
                          </div>
                          <Badge
                            className="slds-text-3 rounded-sm"
                            style={{
                              backgroundColor: '#FEE2E2',
                              borderColor: '#EF4444',
                              color: '#991B1B'
                            }}
                          >
                            Medical
                          </Badge>
                        </div>

                        <div 
                          className="flex items-start gap-3 p-3 rounded"
                          style={{
                            backgroundColor: 'var(--slds-g-color-background-alt)',
                            borderLeft: '3px solid #3B82F6'
                          }}
                        >
                          <Clock className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#3B82F6' }} />
                          <div className="flex-1">
                            <p className="slds-text-5 font-medium text-[var(--slds-g-color-text-default)]">
                              Group Therapy Session
                            </p>
                            <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1">
                              5:00 PM - 6:00 PM • Conference Room B
                            </p>
                          </div>
                          <Badge
                            className="slds-text-3 rounded-sm"
                            style={{
                              backgroundColor: '#EEF4FF',
                              borderColor: '#3B82F6',
                              color: '#1E40AF'
                            }}
                          >
                            Counseling
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Thursday */}
                    <div>
                      <p className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)] mb-2">
                        Thursday, December 12
                      </p>
                      <div className="space-y-2 ml-4">
                        <div 
                          className="flex items-start gap-3 p-3 rounded"
                          style={{
                            backgroundColor: 'var(--slds-g-color-background-alt)',
                            borderLeft: '3px solid #F59E0B'
                          }}
                        >
                          <Clock className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#F59E0B' }} />
                          <div className="flex-1">
                            <p className="slds-text-5 font-medium text-[var(--slds-g-color-text-default)]">
                              Life Skills Workshop
                            </p>
                            <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1">
                              3:00 PM - 4:30 PM • Community Room
                            </p>
                          </div>
                          <Badge
                            className="slds-text-3 rounded-sm"
                            style={{
                              backgroundColor: '#FEF3C7',
                              borderColor: '#F59E0B',
                              color: '#92400E'
                            }}
                          >
                            Life Skills
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Friday */}
                    <div>
                      <p className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)] mb-2">
                        Friday, December 13
                      </p>
                      <div className="space-y-2 ml-4">
                        <div 
                          className="flex items-start gap-3 p-3 rounded"
                          style={{
                            backgroundColor: 'var(--slds-g-color-background-alt)',
                            borderLeft: '3px solid #8B5CF6'
                          }}
                        >
                          <Clock className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#8B5CF6' }} />
                          <div className="flex-1">
                            <p className="slds-text-5 font-medium text-[var(--slds-g-color-text-default)]">
                              Career Planning Session
                            </p>
                            <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1">
                              1:00 PM - 2:00 PM • with Career Counselor
                            </p>
                          </div>
                          <Badge
                            className="slds-text-3 rounded-sm"
                            style={{
                              backgroundColor: '#F3E8FF',
                              borderColor: '#8B5CF6',
                              color: '#5B21B6'
                            }}
                          >
                            Education
                          </Badge>
                        </div>

                        <div 
                          className="flex items-start gap-3 p-3 rounded"
                          style={{
                            backgroundColor: 'var(--slds-g-color-background-alt)',
                            borderLeft: '3px solid #10B981'
                          }}
                        >
                          <Clock className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#10B981' }} />
                          <div className="flex-1">
                            <p className="slds-text-5 font-medium text-[var(--slds-g-color-text-default)]">
                              Weekly Recreation Outing
                            </p>
                            <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1">
                              4:00 PM - 6:00 PM • Local Community Center
                            </p>
                          </div>
                          <Badge
                            className="slds-text-3 rounded-sm"
                            style={{
                              backgroundColor: '#D1FAE5',
                              borderColor: '#10B981',
                              color: '#065F46'
                            }}
                          >
                            Recreation
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right Column */}
            <div className="col-span-4 min-w-0 space-y-6">
              
              {/* Upcoming Appointments Card */}
              <Card 
                className="shadow-sm"
                style={{
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-6">
                  <h3 className="slds-section-title mb-4 text-[var(--slds-g-color-text-default)]">
                    Upcoming Appointments
                  </h3>
                  
                  <div className="space-y-3">
                    <div 
                      className="p-3 rounded"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-alt)',
                        borderLeft: '3px solid var(--color-brand-primary)'
                      }}
                    >
                      <p className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)] mb-1">
                        Case Review Meeting
                      </p>
                      <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                        Dec 16, 2024 at 10:00 AM
                      </p>
                      <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                        with {resident.caseManager}
                      </p>
                    </div>

                    <div 
                      className="p-3 rounded"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-alt)',
                        borderLeft: '3px solid #EF4444'
                      }}
                    >
                      <p className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)] mb-1">
                        Dental Checkup
                      </p>
                      <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                        Dec 18, 2024 at 2:00 PM
                      </p>
                      <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                        at Mercy Dental Clinic
                      </p>
                    </div>

                    <div 
                      className="p-3 rounded"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-alt)',
                        borderLeft: '3px solid #3B82F6'
                      }}
                    >
                      <p className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)] mb-1">
                        Family Therapy Session
                      </p>
                      <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                        Dec 20, 2024 at 3:00 PM
                      </p>
                      <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                        with Dr. Sarah Williams
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Summary Card */}
              <Card 
                className="shadow-sm"
                style={{
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-6">
                  <h3 className="slds-section-title mb-4 text-[var(--slds-g-color-text-default)]">
                    Weekly Summary
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                        Total Events
                      </span>
                      <span className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)]">
                        10
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                        Counseling Sessions
                      </span>
                      <span className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)]">
                        3
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                        Medical Appointments
                      </span>
                      <span className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)]">
                        1
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                        Educational Activities
                      </span>
                      <span className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)]">
                        3
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                        Recreation
                      </span>
                      <span className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)]">
                        3
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recurring Events Card */}
              <Card 
                className="shadow-sm"
                style={{
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-6">
                  <h3 className="slds-section-title mb-4 text-[var(--slds-g-color-text-default)]">
                    Recurring Events
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#3B82F6] mt-2 shrink-0" />
                      <div>
                        <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                          Individual Counseling
                        </p>
                        <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                          Mondays at 2:00 PM
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#8B5CF6] mt-2 shrink-0" />
                      <div>
                        <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                          Academic Tutoring
                        </p>
                        <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                          Tuesdays & Thursdays at 3:00 PM
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#10B981] mt-2 shrink-0" />
                      <div>
                        <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                          Group Recreation
                        </p>
                        <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                          Mondays & Fridays at 4:00 PM
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#F59E0B] mt-2 shrink-0" />
                      <div>
                        <p className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                          Life Skills Workshop
                        </p>
                        <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                          Thursdays at 3:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}