import { useState } from "react";
import { useNavigate } from "react-router";
import { RefreshCw, Download, Plus, TrendingDown, AlertCircle, ArrowLeft, Users, Bed, Calendar, TrendingUp, CheckCircle, XCircle } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { 
  PROGRAM_CAPACITY, 
  MONTHLY_MOVE_INS, 
  FUNNEL_DATA, 
  KPI_DATA,
  ProgramCapacity,
  ZIP_CODE_DATA 
} from "../../data/mockDashboardData";
import { GeoLocationMap } from "../GeoLocationMap";
import { getResidentByName } from "../../data/mockResidentData";
import { formatMdy } from "../../lib/dateFormat";

export function Dashboard() {
  const navigate = useNavigate();
  const [fiscalYear, setFiscalYear] = useState("FY26");
  const [quarter, setQuarter] = useState("Q1");
  const [selectedProgram, setSelectedProgram] = useState<ProgramCapacity | null>(null);

  // Calculate average occupancy
  const avgOccupancy = PROGRAM_CAPACITY.reduce((sum, prog) => sum + prog.occupancyPercent, 0) / PROGRAM_CAPACITY.length;

  // Helper function to determine occupancy color (more nuanced than just red/green)
  const getOccupancyColor = (occupancy: number, goal: number) => {
    if (occupancy >= goal) return '#2E844A'; // Green - meeting or exceeding goal
    if (occupancy >= goal - 10) return '#FFB75D'; // Amber - within 10% of goal
    return '#EA001E'; // Red - significantly below goal
  };

  // Helper function to get icon for occupancy status
  const getOccupancyIcon = (occupancy: number, goal: number) => {
    if (occupancy >= goal) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (occupancy >= goal - 10) return <AlertCircle className="h-5 w-5 text-amber-600" />;
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };

  // Mock data for program details
  const getProgramDetails = (program: ProgramCapacity) => {
    const occupiedBeds = Math.round((program.occupancyPercent / 100) * program.totalBeds);
    
    // Comprehensive program information
    const programData: { [key: string]: any } = {
      'Couderc': {
        address: '1125 W Jackson Blvd, Chicago, IL 60607',
        phone: '(312) 738-7560',
        programType: 'RTC',
        director: 'Sarah Martinez',
        assistantDirector: 'Michael Chen',
        ageRange: '14-18',
        avgLengthOfStay: 14,
        recentMoveIns: 4,
        recentMoveOuts: 2,
        pendingAdmissions: 3,
        established: '1887',
        accreditation: 'CARF Accredited',
        specializations: ['Trauma-Informed Care', 'Educational Support', 'Mental Health Services'],
        residents: [
          { id: 'C001', name: 'James Anderson', age: 16, admissionDate: '2024-03-15', status: 'Active', caseManager: 'Lisa Johnson', lengthOfStay: '8 months' },
          { id: 'C002', name: 'Michael Brown', age: 15, admissionDate: '2024-05-20', status: 'Active', caseManager: 'David Martinez', lengthOfStay: '6 months' },
          { id: 'C003', name: 'Robert Wilson', age: 17, admissionDate: '2024-02-10', status: 'Active', caseManager: 'Lisa Johnson', lengthOfStay: '9 months' },
          { id: 'C004', name: 'William Davis', age: 16, admissionDate: '2024-06-01', status: 'Active', caseManager: 'Sarah Chen', lengthOfStay: '5 months' },
          { id: 'C005', name: 'Thomas Garcia', age: 15, admissionDate: '2024-04-12', status: 'On Leave', caseManager: 'David Martinez', lengthOfStay: '7 months' },
          { id: 'C006', name: 'Christopher Lee', age: 17, admissionDate: '2024-01-08', status: 'Active', caseManager: 'Lisa Johnson', lengthOfStay: '11 months' },
          { id: 'C007', name: 'Daniel Taylor', age: 16, admissionDate: '2024-07-15', status: 'Active', caseManager: 'Sarah Chen', lengthOfStay: '4 months' },
          { id: 'C008', name: 'Matthew White', age: 15, admissionDate: '2024-03-22', status: 'Active', caseManager: 'David Martinez', lengthOfStay: '8 months' },
          { id: 'C009', name: 'Anthony Martinez', age: 17, admissionDate: '2024-05-05', status: 'Active', caseManager: 'Lisa Johnson', lengthOfStay: '6 months' },
          { id: 'C010', name: 'Joshua Robinson', age: 16, admissionDate: '2024-02-28', status: 'Active', caseManager: 'Sarah Chen', lengthOfStay: '9 months' }
        ]
      },
      'Kelly': {
        address: '725 W Sheridan Rd, Chicago, IL 60613',
        phone: '(773) 561-2984',
        programType: 'RTC',
        director: 'James Wilson',
        assistantDirector: 'Patricia O\'Brien',
        ageRange: '14-18',
        avgLengthOfStay: 12,
        recentMoveIns: 3,
        recentMoveOuts: 1,
        pendingAdmissions: 2,
        established: '1956',
        accreditation: 'CARF Accredited',
        specializations: ['Behavioral Health', 'Family Reunification', 'Academic Excellence'],
        residents: [
          { id: 'K001', name: 'David Johnson', age: 16, admissionDate: '2024-04-10', status: 'Active', caseManager: 'Emily Davis', lengthOfStay: '7 months' },
          { id: 'K002', name: 'Joseph Miller', age: 15, admissionDate: '2024-06-15', status: 'Active', caseManager: 'Robert Smith', lengthOfStay: '5 months' },
          { id: 'K003', name: 'Richard Thompson', age: 17, admissionDate: '2024-01-20', status: 'Active', caseManager: 'Emily Davis', lengthOfStay: '10 months' },
          { id: 'K004', name: 'Charles Jackson', age: 16, admissionDate: '2024-05-08', status: 'Active', caseManager: 'Maria Gonzalez', lengthOfStay: '6 months' },
          { id: 'K005', name: 'Paul Harris', age: 15, admissionDate: '2024-03-18', status: 'Active', caseManager: 'Robert Smith', lengthOfStay: '8 months' },
          { id: 'K006', name: 'Mark Clark', age: 17, admissionDate: '2024-07-01', status: 'On Leave', caseManager: 'Emily Davis', lengthOfStay: '4 months' },
          { id: 'K007', name: 'Steven Lewis', age: 16, admissionDate: '2024-02-14', status: 'Active', caseManager: 'Maria Gonzalez', lengthOfStay: '9 months' }
        ]
      },
      'West Loop': {
        address: '1140 W Jackson Blvd, Chicago, IL 60607',
        phone: '(312) 738-7825',
        programType: 'RTC',
        director: 'Maria Garcia',
        assistantDirector: 'John Patterson',
        ageRange: '14-18',
        avgLengthOfStay: 10,
        recentMoveIns: 2,
        recentMoveOuts: 3,
        pendingAdmissions: 1,
        established: '1978',
        accreditation: 'CARF Accredited',
        specializations: ['Life Skills Training', 'Vocational Programs', 'Independent Living'],
        residents: [
          { id: 'W001', name: 'Andrew Walker', age: 17, admissionDate: '2024-05-12', status: 'Active', caseManager: 'Jennifer Lee', lengthOfStay: '6 months' },
          { id: 'W002', name: 'Kenneth Hall', age: 16, admissionDate: '2024-03-25', status: 'Active', caseManager: 'Thomas Brown', lengthOfStay: '8 months' },
          { id: 'W003', name: 'Brian Allen', age: 15, admissionDate: '2024-06-30', status: 'Active', caseManager: 'Jennifer Lee', lengthOfStay: '5 months' },
          { id: 'W004', name: 'George Young', age: 17, admissionDate: '2024-02-18', status: 'Active', caseManager: 'Amanda White', lengthOfStay: '9 months' },
          { id: 'W005', name: 'Edward King', age: 16, admissionDate: '2024-04-05', status: 'On Leave', caseManager: 'Thomas Brown', lengthOfStay: '7 months' },
          { id: 'W006', name: 'Ronald Wright', age: 15, admissionDate: '2024-07-20', status: 'Active', caseManager: 'Jennifer Lee', lengthOfStay: '4 months' }
        ]
      },
      'Walsh': {
        address: '7110 N Ridge Blvd, Chicago, IL 60645',
        phone: '(773) 262-4744',
        programType: 'RTC',
        director: 'David Thompson',
        assistantDirector: 'Rachel Kim',
        ageRange: '14-18',
        avgLengthOfStay: 13,
        recentMoveIns: 5,
        recentMoveOuts: 2,
        pendingAdmissions: 4,
        established: '1965',
        accreditation: 'CARF Accredited',
        specializations: ['Crisis Intervention', 'Therapeutic Recreation', 'Peer Mentoring'],
        residents: [
          { id: 'WA001', name: 'Timothy Scott', age: 16, admissionDate: '2024-03-08', status: 'Active', caseManager: 'Kevin Martinez', lengthOfStay: '8 months' },
          { id: 'WA002', name: 'Jason Green', age: 15, admissionDate: '2024-05-15', status: 'Active', caseManager: 'Nicole Anderson', lengthOfStay: '6 months' },
          { id: 'WA003', name: 'Jeffrey Baker', age: 17, admissionDate: '2024-01-12', status: 'Active', caseManager: 'Kevin Martinez', lengthOfStay: '10 months' },
          { id: 'WA004', name: 'Ryan Adams', age: 16, admissionDate: '2024-06-22', status: 'Active', caseManager: 'Laura Chen', lengthOfStay: '5 months' },
          { id: 'WA005', name: 'Jacob Nelson', age: 15, admissionDate: '2024-04-18', status: 'Active', caseManager: 'Nicole Anderson', lengthOfStay: '7 months' }
        ]
      },
      'Mahoney': {
        address: '2822 W Jackson Blvd, Chicago, IL 60612',
        phone: '(773) 722-3945',
        programType: 'RTC',
        director: 'Jennifer Lee',
        assistantDirector: 'Carlos Rivera',
        ageRange: '14-18',
        avgLengthOfStay: 11,
        recentMoveIns: 3,
        recentMoveOuts: 2,
        pendingAdmissions: 2,
        established: '1972',
        accreditation: 'CARF Accredited',
        specializations: ['Substance Abuse Prevention', 'Anger Management', 'Cultural Competency'],
        residents: [
          { id: 'M001', name: 'Nicholas Carter', age: 17, admissionDate: '2024-02-05', status: 'Active', caseManager: 'Diana Lopez', lengthOfStay: '9 months' },
          { id: 'M002', name: 'Brandon Mitchell', age: 16, admissionDate: '2024-04-20', status: 'Active', caseManager: 'Marcus Johnson', lengthOfStay: '7 months' },
          { id: 'M003', name: 'Eric Perez', age: 15, admissionDate: '2024-06-10', status: 'Active', caseManager: 'Diana Lopez', lengthOfStay: '5 months' },
          { id: 'M004', name: 'Samuel Roberts', age: 17, admissionDate: '2024-03-15', status: 'On Leave', caseManager: 'Sophia Taylor', lengthOfStay: '8 months' },
          { id: 'M005', name: 'Gregory Turner', age: 16, admissionDate: '2024-05-28', status: 'Active', caseManager: 'Marcus Johnson', lengthOfStay: '6 months' },
          { id: 'M006', name: 'Frank Phillips', age: 15, admissionDate: '2024-07-08', status: 'Active', caseManager: 'Diana Lopez', lengthOfStay: '4 months' }
        ]
      },
      'Advocacy': {
        address: '1140 W Jackson Blvd, Chicago, IL 60607',
        phone: '(312) 738-7590',
        programType: 'TLP',
        director: 'Michael Brown',
        assistantDirector: 'Angela Davis',
        ageRange: '18-21',
        avgLengthOfStay: 18,
        recentMoveIns: 2,
        recentMoveOuts: 1,
        pendingAdmissions: 1,
        established: '1995',
        accreditation: 'CARF Accredited',
        specializations: ['Independent Living Skills', 'Employment Readiness', 'Higher Education Support'],
        residents: [
          { id: 'A001', name: 'Jonathan Campbell', age: 19, admissionDate: '2024-01-15', status: 'Active', caseManager: 'Rachel Green', lengthOfStay: '10 months' },
          { id: 'A002', name: 'Alexander Parker', age: 20, admissionDate: '2024-03-22', status: 'Active', caseManager: 'Monica Lewis', lengthOfStay: '8 months' },
          { id: 'A003', name: 'Nathan Evans', age: 18, admissionDate: '2024-05-10', status: 'Active', caseManager: 'Rachel Green', lengthOfStay: '6 months' },
          { id: 'A004', name: 'Jeremy Edwards', age: 21, admissionDate: '2023-11-28', status: 'Active', caseManager: 'Monica Lewis', lengthOfStay: '12 months' }
        ]
      }
    };

    const progData = programData[program.programName] || programData['Couderc'];
    
    return {
      ...program,
      occupiedBeds,
      ...progData
    };
  };

  // If a program is selected, show detail view
  if (selectedProgram) {
    const details = getProgramDetails(selectedProgram);
    
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Header */}
        <div 
          className="px-4 sm:px-6 py-4 flex-shrink-0"
          style={{
            backgroundColor: 'var(--slds-g-color-background-base)',
            borderBottom: '1px solid var(--slds-g-color-border-base-1)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h2 
                className="text-xl font-semibold"
                style={{ color: 'var(--slds-g-color-text-default)' }}
              >
                {selectedProgram.programName} Program
              </h2>
              <p 
                className="text-sm mt-1"
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                {details.address}
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-xs rounded-sm"
              style={{
                backgroundColor: selectedProgram.occupancyPercent >= 90 
                  ? '#D1FAE5' 
                  : selectedProgram.occupancyPercent >= 70 
                  ? '#DBEAFE' 
                  : selectedProgram.occupancyPercent >= 60 
                  ? '#FEF3C7'
                  : '#FEE2E2',
                borderColor: selectedProgram.occupancyPercent >= 90 
                  ? '#10B981' 
                  : selectedProgram.occupancyPercent >= 70 
                  ? '#3B82F6' 
                  : selectedProgram.occupancyPercent >= 60 
                  ? '#F59E0B'
                  : '#EF4444',
                color: selectedProgram.occupancyPercent >= 90 
                  ? '#065F46' 
                  : selectedProgram.occupancyPercent >= 70 
                  ? '#1E40AF' 
                  : selectedProgram.occupancyPercent >= 60 
                  ? '#92400E'
                  : '#991B1B'
              }}
            >
              {selectedProgram.occupancyPercent}% Occupied
            </Badge>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              className="h-[32px] text-[13px] rounded-full gap-2"
              variant="outline"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)',
                color: 'var(--slds-g-color-text-default)'
              }}
              onClick={() => setSelectedProgram(null)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              className="h-[32px] text-[13px] rounded-full gap-2"
              variant="outline"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)',
                color: 'var(--slds-g-color-text-default)'
              }}
            >
              <CheckCircle className="h-4 w-4" />
              Save Changes
            </Button>
            <Button
              className="h-[32px] text-[13px] rounded-full gap-2"
              variant="outline"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)',
                color: 'var(--slds-g-color-text-default)'
              }}
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-auto px-4 sm:px-6 py-6"
          style={{
            backgroundColor: '#F3F3F3'
          }}
        >
          <div className="max-w-[1400px] mx-auto space-y-4">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Beds Card */}
              <Card 
                className="shadow-sm"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p 
                        className="text-xs font-semibold uppercase tracking-wide mb-1"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Total Beds
                      </p>
                      <p 
                        className="text-3xl font-bold"
                        style={{ color: 'var(--slds-g-color-text-default)' }}
                      >
                        {details.totalBeds}
                      </p>
                    </div>
                    <div 
                      className="h-12 w-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#DBEAFE' }}
                    >
                      <Bed className="h-6 w-6" style={{ color: '#0176D3' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Occupied Beds Card */}
              <Card 
                className="shadow-sm"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p 
                        className="text-xs font-semibold uppercase tracking-wide mb-1"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Occupied Beds
                      </p>
                      <p 
                        className="text-3xl font-bold"
                        style={{ color: '#10B981' }}
                      >
                        {details.occupiedBeds}
                      </p>
                    </div>
                    <div 
                      className="h-12 w-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#D1FAE5' }}
                    >
                      <Users className="h-6 w-6" style={{ color: '#10B981' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Beds Card */}
              <Card 
                className="shadow-sm"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p 
                        className="text-xs font-semibold uppercase tracking-wide mb-1"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Available Beds
                      </p>
                      <p 
                        className="text-3xl font-bold"
                        style={{ 
                          color: details.bedsAvailable > 5 ? '#F59E0B' : details.bedsAvailable > 0 ? '#EF4444' : '#6B7280'
                        }}
                      >
                        {details.bedsAvailable}
                      </p>
                    </div>
                    <div 
                      className="h-12 w-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: details.bedsAvailable > 5 ? '#FEF3C7' : '#FEE2E2' }}
                    >
                      <Bed className="h-6 w-6" style={{ color: details.bedsAvailable > 5 ? '#F59E0B' : '#EF4444' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Occupancy Rate Card */}
              <Card 
                className="shadow-sm"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p 
                        className="text-xs font-semibold uppercase tracking-wide mb-1"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Occupancy Rate
                      </p>
                      <p 
                        className="text-3xl font-bold"
                        style={{ color: '#9333EA' }}
                      >
                        {details.occupancyPercent}%
                      </p>
                    </div>
                    <div 
                      className="h-12 w-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#E9D5FF' }}
                    >
                      <TrendingUp className="h-6 w-6" style={{ color: '#9333EA' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Program Information */}
            <Card 
              className="shadow-sm"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                borderRadius: 'var(--slds-c-card-radius-border)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              <CardHeader 
                className="px-6 py-4"
                style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
              >
                <CardTitle 
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                >
                  Program Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label 
                      className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Phone
                    </label>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {details.phone}
                    </p>
                  </div>
                  <div>
                    <label 
                      className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Program Type
                    </label>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {details.programType}
                    </p>
                  </div>
                  <div>
                    <label 
                      className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Established
                    </label>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {details.established}
                    </p>
                  </div>
                  <div>
                    <label 
                      className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Program Director
                    </label>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {details.director}
                    </p>
                  </div>
                  <div>
                    <label 
                      className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Assistant Director
                    </label>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {details.assistantDirector}
                    </p>
                  </div>
                  <div>
                    <label 
                      className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Accreditation
                    </label>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {details.accreditation}
                    </p>
                  </div>
                  <div>
                    <label 
                      className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Age Range
                    </label>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {details.ageRange} years
                    </p>
                  </div>
                  <div>
                    <label 
                      className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Avg Length of Stay
                    </label>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {details.avgLengthOfStay} months
                    </p>
                  </div>
                  <div>
                    <label 
                      className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Pending Admissions
                    </label>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: '#0176D3' }}
                    >
                      {details.pendingAdmissions}
                    </p>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label 
                      className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Specializations
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {details.specializations.map((spec: string, idx: number) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs rounded-sm bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

{/* Capacity Overview & Recent Activity - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Capacity Visualization */}
              <Card 
                className="shadow-sm"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardContent className="p-6">
                  <h3 
                    className="text-sm font-semibold uppercase tracking-wide mb-4"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Capacity Overview
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-sm font-medium"
                        style={{ color: 'var(--slds-g-color-text-default)' }}
                      >
                        {details.occupiedBeds} of {details.totalBeds} beds occupied
                      </span>
                      <span 
                        className="font-semibold"
                        style={{ color: 'var(--slds-g-color-text-default)' }}
                      >
                        {details.occupancyPercent}%
                      </span>
                    </div>
                    <div 
                      className="h-6 rounded-full overflow-hidden"
                      style={{ backgroundColor: '#E5E7EB' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${details.occupancyPercent}%`,
                          backgroundColor: details.occupancyPercent >= 90 
                            ? '#2E844A' 
                            : details.occupancyPercent >= 70 
                            ? '#0176D3' 
                            : details.occupancyPercent >= 60 
                            ? '#F59E0B' 
                            : '#EA001E'
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card 
                className="shadow-sm"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <CardHeader 
                  className="px-6 py-4"
                  style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                >
                  <CardTitle 
                    className="text-sm font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Recent Activity (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p 
                        className="text-xs font-semibold uppercase tracking-wide mb-2"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Move-Ins
                      </p>
                      <p 
                        className="text-3xl font-bold"
                        style={{ color: '#10B981' }}
                      >
                        {details.recentMoveIns}
                      </p>
                    </div>
                    <div className="text-center">
                      <p 
                        className="text-xs font-semibold uppercase tracking-wide mb-2"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Move-Outs
                      </p>
                      <p 
                        className="text-3xl font-bold"
                        style={{ color: '#EF4444' }}
                      >
                        {details.recentMoveOuts}
                      </p>
                    </div>
                    <div className="text-center">
                      <p 
                        className="text-xs font-semibold uppercase tracking-wide mb-2"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Net Change
                      </p>
                      <p 
                        className="text-3xl font-bold"
                        style={{ color: details.recentMoveIns - details.recentMoveOuts >= 0 ? '#10B981' : '#EF4444' }}
                      >
                        {details.recentMoveIns - details.recentMoveOuts >= 0 ? '+' : ''}{details.recentMoveIns - details.recentMoveOuts}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Residents */}
            <Card 
              className="shadow-sm"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                borderRadius: 'var(--slds-c-card-radius-border)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              <CardHeader 
                className="px-6 py-4"
                style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
              >
                <CardTitle 
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                >
                  Current Residents ({details.residents.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr 
                        className="text-left"
                        style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                      >
                        <th 
                          className="pb-2 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                          Resident
                        </th>
                        <th 
                          className="pb-2 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                          Age
                        </th>
                        <th 
                          className="pb-2 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                          Admission Date
                        </th>
                        <th 
                          className="pb-2 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                          Length of Stay
                        </th>
                        <th 
                          className="pb-2 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                          Case Manager
                        </th>
                        <th 
                          className="pb-2 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.residents.slice(0, 10).map((resident, index) => {
                        // Generate initials from name
                        const initials = resident.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2);
                        
                        // SLDS 2 avatar color palette - cycling through colors
                        const avatarColors = [
                          { bg: '#E3ABEC', text: '#3D0F3F' },
                          { bg: '#C2DBFA', text: '#001639' },
                          { bg: '#9FD6FF', text: '#001639' },
                          { bg: '#9FEFDF', text: '#071A12' },
                          { bg: '#FED49A', text: '#4A2413' },
                          { bg: '#FFAAC1', text: '#4F0F1F' },
                          { bg: '#57B8D9', text: '#001C28' },
                          { bg: '#BAAC93', text: '#201702' }
                        ];
                        const colorIndex = index % avatarColors.length;
                        const avatarColor = avatarColors[colorIndex];

                        return (
                          <tr 
                            key={resident.id}
                            className="cursor-pointer transition-all"
                            style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                            onClick={() => {
                              const residentProfile = getResidentByName(resident.name);
                              if (residentProfile) {
                                navigate(`/resident/${residentProfile.id}`);
                              } else {
                                console.log(`Profile not found for: ${resident.name}`);
                                alert(`Detailed profile for ${resident.name} is being prepared. Please check back later.`);
                              }
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-row-hover)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <td 
                              className="py-3 text-sm font-medium"
                              style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                              <div className="flex items-center gap-2">
                                {/* SLDS 2 Avatar */}
                                <div 
                                  className="flex items-center justify-center flex-shrink-0 rounded-full"
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    backgroundColor: avatarColor.bg,
                                    color: avatarColor.text,
                                    fontSize: '0.75rem',
                                    fontWeight: '400',
                                    lineHeight: '1'
                                  }}
                                  title={resident.name}
                                >
                                  {initials}
                                </div>
                                <span>{resident.name}</span>
                              </div>
                            </td>
                            <td 
                              className="py-3 text-sm"
                              style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                              {resident.age}
                            </td>
                            <td 
                              className="py-3 text-sm"
                              style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                              {formatMdy(new Date(resident.admissionDate))}
                            </td>
                            <td 
                              className="py-3 text-sm"
                              style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                              {resident.lengthOfStay}
                            </td>
                            <td 
                              className="py-3 text-sm"
                              style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                              {resident.caseManager}
                            </td>
                            <td className="py-3">
                              <Badge
                                variant="outline"
                                className="text-xs rounded-sm"
                                style={{
                                  backgroundColor: resident.status === 'Active' ? '#D1FAE5' : '#FEF3C7',
                                  borderColor: resident.status === 'Active' ? '#10B981' : '#F59E0B',
                                  color: resident.status === 'Active' ? '#065F46' : '#92400E'
                                }}
                              >
                                {resident.status}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {details.residents.length > 10 && (
                    <div className="mt-4 text-center">
                      <button
                        className="text-sm font-semibold hover:underline"
                        style={{ color: '#0176D3' }}
                      >
                        View All {details.residents.length} Residents →
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Header - SLDS Style */}
      <div 
        className="px-4 sm:px-6 py-4 flex-shrink-0"
        style={{
          backgroundColor: 'var(--slds-g-color-background-base)',
          borderBottom: '1px solid var(--slds-g-color-border-base-1)'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title Section */}
          <div>
            <h1 
              className="font-semibold mb-1"
              style={{
                fontSize: '1.5rem',
                color: 'var(--slds-g-color-text-default)'
              }}
            >
              FY26 Q1 Performance Overview
            </h1>
            <p 
              className="text-sm"
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Last refreshed: Nov 18, 2025
            </p>
          </div>

          {/* Filter and Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filters */}
            <Select value={fiscalYear} onValueChange={setFiscalYear}>
              <SelectTrigger 
                className="w-[120px] h-[32px] text-[13px]"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FY24">FY24</SelectItem>
                <SelectItem value="FY25">FY25</SelectItem>
                <SelectItem value="FY26">FY26</SelectItem>
              </SelectContent>
            </Select>

            <Select value={quarter} onValueChange={setQuarter}>
              <SelectTrigger 
                className="w-[100px] h-[32px] text-[13px]"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1">Q1</SelectItem>
                <SelectItem value="Q2">Q2</SelectItem>
                <SelectItem value="Q3">Q3</SelectItem>
                <SelectItem value="Q4">Q4</SelectItem>
              </SelectContent>
            </Select>

            {/* Action Buttons */}
            <Button
              className="h-[32px] text-[13px] rounded-full gap-2"
              variant="outline"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)',
                color: 'var(--slds-g-color-text-default)'
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>

            <Button
              className="h-[32px] text-[13px] rounded-full gap-2"
              variant="outline"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)',
                color: 'var(--slds-g-color-text-default)'
              }}
            >
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div 
        className="flex-1 overflow-auto px-4 sm:px-6 py-6"
        style={{ backgroundColor: '#F3F3F3' }}
      >
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* KPI Summary Band - 3 FlexCards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Occupancy Health */}
            <div 
              className="rounded-lg p-6"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--slds-g-color-border-base-1)',
                boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.07)'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p 
                    className="text-xs font-semibold uppercase tracking-wide mb-2"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                  >
                    Agency Occupancy
                  </p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span 
                      className="font-bold"
                      style={{ 
                        fontSize: '2.5rem',
                        color: getOccupancyColor(KPI_DATA.occupancy.overall, KPI_DATA.occupancy.goal),
                        lineHeight: '1'
                      }}
                    >
                      {KPI_DATA.occupancy.overall}%
                    </span>
                    {getOccupancyIcon(KPI_DATA.occupancy.overall, KPI_DATA.occupancy.goal)}
                  </div>
                  <p 
                    className="text-xs mb-3"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                  >
                    Goal: {KPI_DATA.occupancy.goal}%
                  </p>
                </div>
                
                {/* Circular Progress Ring */}
                <div className="relative flex items-center justify-center" style={{ width: '80px', height: '80px' }}>
                  <svg className="transform -rotate-90" width="80" height="80">
                    {/* Background circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                      fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke={getOccupancyColor(KPI_DATA.occupancy.overall, KPI_DATA.occupancy.goal)}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(KPI_DATA.occupancy.overall / 100) * 201} 201`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span 
                    className="absolute font-semibold"
                    style={{ fontSize: '0.75rem', color: 'var(--slds-g-color-text-default)' }}
                  >
                    {KPI_DATA.occupancy.overall}%
                  </span>
                </div>
              </div>
              
              <div 
                className="pt-3 text-sm"
                style={{ 
                  borderTop: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
              >
                <span style={{ color: getOccupancyColor(KPI_DATA.occupancy.walsh, KPI_DATA.occupancy.goal) }}>
                  {KPI_DATA.occupancy.walsh}% Walsh
                </span>
                {' | '}
                <span style={{ color: getOccupancyColor(KPI_DATA.occupancy.westLoop, KPI_DATA.occupancy.goal) }}>
                  {KPI_DATA.occupancy.westLoop}% West Loop
                </span>
              </div>
            </div>

            {/* Card 2: Admissions Volume */}
            <div 
              className="rounded-lg p-6"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--slds-g-color-border-base-1)',
                boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.07)'
              }}
            >
              <p 
                className="text-xs font-semibold uppercase tracking-wide mb-2"
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                Q1 Move-Ins
              </p>
              <div className="flex items-baseline gap-3 mb-3">
                <span 
                  className="font-bold"
                  style={{ 
                    fontSize: '2.5rem',
                    color: 'var(--slds-g-color-text-default)',
                    lineHeight: '1'
                  }}
                >
                  {KPI_DATA.moveIns.q1Total}
                </span>
                <div className="flex items-center gap-1 text-orange-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-xs font-semibold">Trending Down</span>
                </div>
              </div>
              
              {/* Mini Sparkline */}
              <div className="h-12" style={{ marginTop: '1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MONTHLY_MOVE_INS}>
                    <Line 
                      key="moveins-sparkline"
                      type="monotone" 
                      dataKey="moveIns" 
                      stroke="#0176D3" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 3: Pipeline Potential */}
            <div 
              className="rounded-lg p-6"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--slds-g-color-border-base-1)',
                boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.07)'
              }}
            >
              <p 
                className="text-xs font-semibold uppercase tracking-wide mb-2"
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                Initial Contacts
              </p>
              <span 
                className="font-bold block mb-3"
                style={{ 
                  fontSize: '2.5rem',
                  color: 'var(--slds-g-color-text-default)',
                  lineHeight: '1'
                }}
              >
                {KPI_DATA.initialContacts.total}
              </span>
              <div 
                className="pt-3 text-sm"
                style={{ 
                  borderTop: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
              >
                <span style={{ color: 'var(--slds-g-color-text-weak)' }}>Conversion Rate: </span>
                <span className="font-semibold">{KPI_DATA.initialContacts.conversionRate}%</span>
              </div>
            </div>
          </div>

          {/* Main Content Area - 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Admissions & Funnel (8/12 width) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Admissions Funnel Analysis */}
              <div 
                className="rounded-lg"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.07)'
                }}
              >
                <div 
                  className="px-6 py-4"
                  style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                >
                  <h2 
                    className="font-semibold"
                    style={{ 
                      fontSize: '1.125rem',
                      color: 'var(--slds-g-color-text-default)'
                    }}
                  >
                    Admissions Funnel Analysis
                  </h2>
                </div>
                
                <div className="p-6">
                  {/* Horizontal Funnel Chart */}
                  <div className="space-y-3">
                    {FUNNEL_DATA.map((stage, index) => {
                      const percentage = index === 0 ? 100 : (stage.count / FUNNEL_DATA[0].count) * 100;
                      return (
                        <div key={stage.stage} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span 
                              className="font-medium"
                              style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                              {stage.stage}
                            </span>
                            <span 
                              className="font-semibold"
                              style={{ color: stage.color }}
                            >
                              {stage.count}
                            </span>
                          </div>
                          <div 
                            className="h-12 rounded-md flex items-center justify-between px-4 transition-all hover:opacity-80 cursor-pointer"
                            style={{ 
                              backgroundColor: stage.color,
                              width: `${Math.max(percentage, 20)}%`
                            }}
                          >
                            <span className="text-white font-semibold">{stage.count}</span>
                            {index < FUNNEL_DATA.length - 1 && (
                              <span className="text-white text-xs">
                                {((FUNNEL_DATA[index + 1].count / stage.count) * 100).toFixed(1)}% →
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Move-In Trends by Month */}
              <div 
                className="rounded-lg"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.07)'
                }}
              >
                <div 
                  className="px-6 py-4"
                  style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                >
                  <h2 
                    className="font-semibold"
                    style={{ 
                      fontSize: '1.125rem',
                      color: 'var(--slds-g-color-text-default)'
                    }}
                  >
                    Move-In Trends by Month
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={MONTHLY_MOVE_INS}>
                        <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          key="xaxis"
                          dataKey="month" 
                          stroke="#6B7280"
                          style={{ fontSize: '0.75rem' }}
                        />
                        <YAxis 
                          key="yaxis"
                          stroke="#6B7280"
                          style={{ fontSize: '0.75rem' }}
                        />
                        <Tooltip 
                          key="tooltip"
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid var(--slds-g-color-border-base-1)',
                            borderRadius: '0.375rem',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                          }}
                        />
                        <Line 
                          key="moveins-line"
                          type="monotone" 
                          dataKey="moveIns" 
                          stroke="#0176D3" 
                          strokeWidth={3}
                          dot={{ fill: '#0176D3', r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Program Occupancy & Capacity (4/12 width) */}
            <div className="lg:col-span-4">
              <div 
                className="rounded-lg"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.07)'
                }}
              >
                <div 
                  className="px-6 py-4"
                  style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                >
                  <h2 
                    className="font-semibold"
                    style={{ 
                      fontSize: '1.125rem',
                      color: 'var(--slds-g-color-text-default)'
                    }}
                  >
                    Program Capacity Snapshot
                  </h2>
                </div>
                
                <div className="p-6 space-y-4">
                  {PROGRAM_CAPACITY.map((program) => (
                    <div 
                      key={program.id}
                      className="space-y-2 pb-4 cursor-pointer transition-all"
                      style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                      onClick={() => setSelectedProgram(program)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-row-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span 
                          className="font-semibold"
                          style={{ color: 'var(--slds-g-color-text-default)' }}
                        >
                          {program.programName}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs rounded-sm"
                          style={{
                            backgroundColor: program.bedsAvailable > 5 
                              ? '#FEF3C7' 
                              : program.bedsAvailable > 0 
                              ? '#FEE2E2' 
                              : '#F3F4F6',
                            borderColor: program.bedsAvailable > 5 
                              ? '#F59E0B' 
                              : program.bedsAvailable > 0 
                              ? '#EF4444' 
                              : '#9CA3AF',
                            color: program.bedsAvailable > 5 
                              ? '#92400E' 
                              : program.bedsAvailable > 0 
                              ? '#991B1B' 
                              : '#4B5563'
                          }}
                        >
                          {program.bedsAvailable} Avail
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Progress Bar */}
                        <div 
                          className="flex-1 h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: '#E5E7EB' }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${program.occupancyPercent}%`,
                              backgroundColor: program.occupancyPercent >= 90 
                                ? '#2E844A' 
                                : program.occupancyPercent >= 70 
                                ? '#0176D3' 
                                : program.occupancyPercent >= 60 
                                ? '#F59E0B' 
                                : '#EA001E'
                            }}
                          />
                        </div>
                        
                        {/* Percentage */}
                        <span 
                          className="text-sm font-semibold tabular-nums"
                          style={{ 
                            color: program.occupancyPercent >= 90 
                              ? '#2E844A' 
                              : program.occupancyPercent >= 60 
                              ? 'var(--slds-g-color-text-default)' 
                              : '#EA001E',
                            minWidth: '48px',
                            textAlign: 'right'
                          }}
                        >
                          {program.occupancyPercent}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div 
                  className="px-6 py-4"
                  style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}
                >
                  <button
                    className="text-sm font-semibold hover:underline"
                    style={{ color: '#0176D3' }}
                  >
                    View All Programs →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Section: Geographic Distribution */}
          <div 
            className="rounded-lg"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--slds-g-color-border-base-1)',
              boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.07)'
            }}
          >
            <div 
              className="px-6 py-4"
              style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
            >
              <h2 
                className="font-semibold"
                style={{ 
                  fontSize: '1.125rem',
                  color: 'var(--slds-g-color-text-default)'
                }}
              >
                Geographic Distribution by Zip Code
              </h2>
              <p 
                className="text-xs mt-1"
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                Interactive map showing referrals and candidates across Chicago communities
              </p>
            </div>
            
            <div className="p-6">
              <GeoLocationMap data={ZIP_CODE_DATA} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}