import { useState } from 'react';
import { Plus, AlertCircle, Pill, CheckCircle2, FileText, Upload, Calendar as CalendarIcon, X, Eye, RotateCw, Pencil } from '@/app/lib/lucide-icons';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../../lib/utils';
import { Textarea } from '../ui/textarea';
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy, localTodayIso, toLocalIso, parseIsoLocal } from "../../lib/dateFormat";

// Standardized OTC Medication List (maintained by System Administrators)
const STANDARDIZED_OTC_MEDICATIONS = [
  { id: 'otc-001', name: 'Tylenol (Acetaminophen)', genericName: 'Acetaminophen 500mg', category: 'Pain Relief' },
  { id: 'otc-002', name: 'Advil (Ibuprofen)', genericName: 'Ibuprofen 200mg', category: 'Pain Relief' },
  { id: 'otc-003', name: 'Benadryl', genericName: 'Diphenhydramine 25mg', category: 'Allergy' },
  { id: 'otc-004', name: 'Claritin', genericName: 'Loratadine 10mg', category: 'Allergy' },
  { id: 'otc-005', name: 'Tums', genericName: 'Calcium Carbonate 750mg', category: 'Digestive' },
  { id: 'otc-006', name: 'Pepto-Bismol', genericName: 'Bismuth subsalicylate 262mg', category: 'Digestive' },
  { id: 'otc-007', name: 'Vitamin D3', genericName: 'Cholecalciferol 1000 IU', category: 'Vitamin/Supplement' },
  { id: 'otc-008', name: 'Multivitamin', genericName: 'Daily Multivitamin', category: 'Vitamin/Supplement' },
  { id: 'otc-009', name: 'Neosporin', genericName: 'Triple Antibiotic Ointment', category: 'Topical' },
  { id: 'otc-010', name: 'Hydrocortisone Cream', genericName: 'Hydrocortisone 1%', category: 'Topical' },
  { id: 'otc-011', name: 'Cough Syrup', genericName: 'Dextromethorphan 10mg/5mL', category: 'Cough/Cold' },
  { id: 'otc-012', name: 'Throat Lozenges', genericName: 'Menthol 5mg', category: 'Cough/Cold' },
];

interface OTCConsentManagementProps {
  youthId: string;
  youthName: string;
}

interface OTCConsent {
  id: string;
  executionMethod: 'docusign' | 'manual';
  selectedOtcMedications: string[];
  approvedMedications: typeof STANDARDIZED_OTC_MEDICATIONS;
  startDate: string;
  endDate: string;
  executedDate: string;
  status: 'Draft' | 'Sent' | 'Executed' | 'Active' | 'Expired';
  documentUrl?: string;
  createdBy: string;
  createdDate: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
}

export function OTCConsentManagement({ youthId, youthName }: OTCConsentManagementProps) {
  // State management
  const [otcConsents, setOtcConsents] = useState<OTCConsent[]>([
    {
      id: 'consent-001',
      executionMethod: 'docusign',
      selectedOtcMedications: ['otc-001', 'otc-002', 'otc-005', 'otc-007'],
      approvedMedications: STANDARDIZED_OTC_MEDICATIONS.filter(m =>
        ['otc-001', 'otc-002', 'otc-005', 'otc-007'].includes(m.id)
      ),
      startDate: '2024-01-15',
      endDate: '2025-01-14',
      executedDate: '2024-01-15',
      status: 'Active',
      createdBy: 'Sarah Martinez',
      createdDate: '2024-01-10',
      lastModifiedBy: 'John Smith',
      lastModifiedDate: '2024-01-12'
    }
  ]);

  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [manualUploadModalOpen, setManualUploadModalOpen] = useState(false);
  const [viewConsentModalOpen, setViewConsentModalOpen] = useState(false);
  const [editingConsent, setEditingConsent] = useState<OTCConsent | null>(null);
  const [viewingConsent, setViewingConsent] = useState<OTCConsent | null>(null);
  
  const [consentFormData, setConsentFormData] = useState({
    executionMethod: 'docusign' as 'docusign' | 'manual',
    selectedOtcMedications: new Set<string>(),
    startDate: '',
    endDate: '',
    executedDate: '',
    documentFile: null as File | null,
  });

  // Calculate end date (1 year minus 1 day from start date) - AC9
  const calculateEndDate = (startDateStr: string): string => {
    if (!startDateStr) return '';
    const startDate = parseIsoLocal(startDateStr);
    const endDate = parseIsoLocal(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    endDate.setDate(endDate.getDate() - 1);
    return toLocalIso(endDate);
  };

  // Check for overlapping consents - AC17
  const hasOverlappingConsent = (startDate: string, endDate: string, excludeId?: string): boolean => {
    return otcConsents.some(consent => {
      if (excludeId && consent.id === excludeId) return false;
      if (consent.status === 'Expired') return false;
      
      const existingStart = new Date(consent.startDate);
      const existingEnd = new Date(consent.endDate);
      const newStart = parseIsoLocal(startDate);
      const newEnd = new Date(endDate);
      
      return (newStart <= existingEnd && newEnd >= existingStart);
    });
  };

  // Calculate consent status - AC14, AC16
  const calculateConsentStatus = (consent: Partial<OTCConsent>): OTCConsent['status'] => {
    if (!consent.executedDate) {
      return consent.executionMethod === 'docusign' && consent.startDate ? 'Sent' : 'Draft';
    }
    
    if (!consent.startDate || !consent.endDate) return 'Executed';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(consent.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(consent.endDate);
    endDate.setHours(23, 59, 59, 999); // End date is inclusive - AC10
    
    if (today < startDate) return 'Executed';
    if (today > endDate) return 'Expired';
    
    // Check if another consent is active - AC15 (only one active at a time)
    const hasOtherActive = otcConsents.some(c => 
      c.id !== consent.id && c.status === 'Active'
    );
    
    if (hasOtherActive) return 'Executed';
    
    return 'Active';
  };

  // Handle form submission - AC1
  const handleCreateConsent = () => {
    if (consentFormData.executionMethod === 'manual') {
      // For manual upload, open upload modal first
      setConsentModalOpen(false);
      setManualUploadModalOpen(true);
    } else {
      // For DocuSign, create consent and send - AC11
      handleDocuSignConsent();
    }
  };

  const handleDocuSignConsent = () => {
    const newConsent: OTCConsent = {
      id: `consent-${Date.now()}`,
      executionMethod: 'docusign',
      selectedOtcMedications: Array.from(consentFormData.selectedOtcMedications),
      approvedMedications: STANDARDIZED_OTC_MEDICATIONS.filter(m => 
        consentFormData.selectedOtcMedications.has(m.id)
      ),
      startDate: consentFormData.startDate,
      endDate: consentFormData.endDate,
      executedDate: '',
      status: 'Sent',
      createdBy: 'Current User',
      createdDate: localTodayIso()
    };

    setOtcConsents([...otcConsents, newConsent]);
    setConsentModalOpen(false);
    resetForm();
    
    // Simulate DocuSign sent notification
    alert('DocuSign invitation sent to youth/guardian for signature.');
  };

  // Handle manual upload - AC12, AC13
  const handleManualUploadConfirmation = () => {
    if (!consentFormData.executedDate) {
      alert('Please enter the Executed Date from the document before proceeding.');
      return;
    }

    if (consentFormData.selectedOtcMedications.size === 0) {
      alert('Please select at least one OTC medication that was approved on the consent form.');
      return;
    }

    // Check for overlapping consents
    if (hasOverlappingConsent(consentFormData.startDate, consentFormData.endDate)) {
      alert('This consent overlaps with an existing consent. Please adjust the date range.');
      return;
    }

    const newConsent: OTCConsent = {
      id: `consent-${Date.now()}`,
      executionMethod: 'manual',
      selectedOtcMedications: Array.from(consentFormData.selectedOtcMedications),
      approvedMedications: STANDARDIZED_OTC_MEDICATIONS.filter(m => 
        consentFormData.selectedOtcMedications.has(m.id)
      ),
      startDate: consentFormData.startDate,
      endDate: consentFormData.endDate,
      executedDate: consentFormData.executedDate,
      status: 'Executed',
      documentUrl: 'uploaded-document.pdf',
      createdBy: 'Current User',
      createdDate: localTodayIso()
    };

    // Recalculate status to check if it should be Active
    newConsent.status = calculateConsentStatus(newConsent);

    setOtcConsents([...otcConsents, newConsent]);
    setManualUploadModalOpen(false);
    resetForm();
    
    alert('OTC Consent successfully uploaded and confirmed!');
  };

  const resetForm = () => {
    setConsentFormData({
      executionMethod: 'docusign',
      selectedOtcMedications: new Set(),
      startDate: '',
      endDate: '',
      executedDate: '',
      documentFile: null,
    });
    setEditingConsent(null);
  };

  const handleToggleMedication = (medicationId: string) => {
    const newSelected = new Set(consentFormData.selectedOtcMedications);
    if (newSelected.has(medicationId)) {
      newSelected.delete(medicationId);
    } else {
      newSelected.add(medicationId);
    }
    setConsentFormData({ ...consentFormData, selectedOtcMedications: newSelected });
  };

  const handleViewConsent = (consent: OTCConsent) => {
    setViewingConsent(consent);
    setViewConsentModalOpen(true);
  };

  const handleEditConsent = (consent: OTCConsent) => {
    setEditingConsent(consent);
    setConsentFormData({
      executionMethod: consent.executionMethod,
      selectedOtcMedications: new Set(consent.selectedOtcMedications),
      startDate: consent.startDate,
      endDate: consent.endDate,
      executedDate: consent.executedDate,
      documentFile: null,
    });
    setConsentModalOpen(true);
  };

  const handleRenewConsent = (consent: OTCConsent) => {
    // Pre-fill form with existing consent data for renewal
    const today = localTodayIso();
    const endDate = calculateEndDate(today);
    
    setConsentFormData({
      executionMethod: 'docusign',
      selectedOtcMedications: new Set(consent.selectedOtcMedications),
      startDate: today,
      endDate: endDate,
      executedDate: '',
      documentFile: null,
    });
    setConsentModalOpen(true);
  };

  // Get active consent for determining OTC availability - AC18, AC19, AC20
  const activeConsent = otcConsents.find(c => c.status === 'Active');

  return (
    <div className="space-y-5">
      {/* Header with Create Consent Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[18px] mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
            OTC Consent Management
          </h2>
          <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
            Manage over-the-counter medication consents and approvals for {youthName}
          </p>
        </div>
        <Button
          onClick={() => {
            setConsentModalOpen(true);
            setEditingConsent(null);
            const today = localTodayIso();
            setConsentFormData({
              executionMethod: 'docusign',
              selectedOtcMedications: new Set(),
              startDate: today,
              endDate: calculateEndDate(today),
              executedDate: '',
              documentFile: null,
            });
          }}
          className="h-9 px-4 text-[13px] font-medium rounded-full gap-2"
          style={{
            backgroundColor: '#145F33',
            color: 'white'
          }}
        >
          <Plus className="w-4 h-4" />
          Create OTC Consent
        </Button>
      </div>

      {/* Consent Status Overview Dashboard */}
      <div
        className="rounded-lg p-5"
        style={{
          border: '1px solid var(--slds-g-color-border-base-1)',
          backgroundColor: 'var(--slds-g-color-background-alt)'
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <h3 className="text-[15px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
            Consent Status Overview
          </h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'white',
              border: '1px solid var(--slds-g-color-border-base-1)'
            }}
          >
            <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Active Consents
            </div>
            <div className="text-2xl font-bold" style={{ color: '#16A34A' }}>
              {otcConsents.filter(c => c.status === 'Active').length}
            </div>
          </div>
          <div 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'white',
              border: '1px solid var(--slds-g-color-border-base-1)'
            }}
          >
            <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Expiring Soon (30 days)
            </div>
            <div className="text-2xl font-bold" style={{ color: '#F59E0B' }}>
              {otcConsents.filter(c => {
                const today = new Date();
                const endDate = new Date(c.endDate);
                const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return c.status === 'Active' && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
              }).length}
            </div>
          </div>
          <div 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'white',
              border: '1px solid var(--slds-g-color-border-base-1)'
            }}
          >
            <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Expired
            </div>
            <div className="text-2xl font-bold" style={{ color: '#DC2626' }}>
              {otcConsents.filter(c => c.status === 'Expired').length}
            </div>
          </div>
          <div 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'white',
              border: '1px solid var(--slds-g-color-border-base-1)'
            }}
          >
            <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Pending
            </div>
            <div className="text-2xl font-bold" style={{ color: '#6366F1' }}>
              {otcConsents.filter(c => c.status === 'Sent' || c.status === 'Draft').length}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t-2" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}></div>

      {/* OTC Consents Table */}
      <div>
        <h3 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
          OTC Consent Records
        </h3>
        <p className="text-[13px] mb-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
          View and manage consent forms for over-the-counter medication administration
        </p>
        <div 
          className="rounded-lg overflow-hidden"
          style={{
            border: '1px solid var(--slds-g-color-border-base-1)',
            backgroundColor: 'var(--slds-g-color-background-base)'
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr 
                  style={{ 
                    backgroundColor: 'var(--slds-g-color-background-alt)',
                    borderBottom: '2px solid var(--slds-g-color-border-base-1)'
                  }}
                >
                  <th className="px-4 py-3 text-left text-[12px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Execution Method
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Start Date
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    End Date (Inclusive)
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Executed Date
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Approved OTCs
                  </th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {otcConsents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      No OTC consent records found. Click "Create OTC Consent" to begin.
                    </td>
                  </tr>
                ) : (
                  otcConsents.map(consent => (
                    <tr 
                      key={consent.id}
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                      <td className="px-4 py-4">
                        <span 
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold",
                            consent.status === "Active" && "bg-green-100 text-green-800",
                            consent.status === "Executed" && "bg-blue-100 text-blue-800",
                            consent.status === "Sent" && "bg-purple-100 text-purple-800",
                            consent.status === "Draft" && "bg-gray-100 text-gray-800",
                            consent.status === "Expired" && "bg-red-100 text-red-800"
                          )}
                        >
                          {consent.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        {consent.executionMethod === 'docusign' ? 'DocuSign' : 'Manual Upload'}
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        {consent.startDate ? formatMdy(new Date(consent.startDate)) : '-'}
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        {consent.endDate ? formatMdy(new Date(consent.endDate)) : '-'}
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        {consent.executedDate ? formatMdy(new Date(consent.executedDate)) : '-'}
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4" style={{ color: '#145F33' }} />
                          <span className="font-semibold">{consent.approvedMedications?.length || 0}</span>
                          <span style={{ color: 'var(--slds-g-color-text-weak)' }}>medications</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md transition-colors inline-flex items-center justify-center"
                            style={{ color: '#0176d3' }}
                            onClick={() => handleViewConsent(consent)}
                            title="View Record Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {consent.status === 'Active' && (
                            <button
                              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md transition-colors inline-flex items-center justify-center"
                              style={{ color: '#145F33' }}
                              onClick={() => handleRenewConsent(consent)}
                              title="Renew Consent"
                            >
                              <RotateCw className="h-4 w-4" />
                            </button>
                          )}
                          {(consent.status === 'Draft' || consent.status === 'Sent') && (
                            <button
                              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md transition-colors inline-flex items-center justify-center"
                              style={{ color: '#145F33' }}
                              onClick={() => handleEditConsent(consent)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}></div>

      {/* Available OTC Medications (Based on Active Consent) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
              Available OTC Medications
            </h3>
            <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Medications approved for dispensation based on active consent
            </p>
          </div>
        </div>

        {!activeConsent ? (
          <div 
            className="rounded-lg p-8 text-center"
            style={{
              border: '1px solid var(--slds-g-color-border-base-1)',
              backgroundColor: '#FEF3C7'
            }}
          >
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-amber-600" />
            <h4 className="font-semibold text-[15px] mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
              No Active OTC Consent
            </h4>
            <p className="text-[13px] mb-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              An active OTC consent is required before medications can be dispensed. Please create or activate a consent to proceed.
            </p>
            <Button
              onClick={() => {
                setConsentModalOpen(true);
                const today = localTodayIso();
                setConsentFormData({
                  executionMethod: 'docusign',
                  selectedOtcMedications: new Set(),
                  startDate: today,
                  endDate: calculateEndDate(today),
                  executedDate: '',
                  documentFile: null,
                });
              }}
              className="h-9 px-4 text-[13px] font-medium rounded-full gap-2"
              style={{
                backgroundColor: '#145F33',
                color: 'white'
              }}
            >
              <Plus className="w-4 h-4" />
              Create OTC Consent
            </Button>
          </div>
        ) : (
          <div 
            className="rounded-lg overflow-hidden"
            style={{
              border: '1px solid var(--slds-g-color-border-base-1)',
              backgroundColor: 'var(--slds-g-color-background-base)'
            }}
          >
            {/* Active Consent Info */}
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{
                backgroundColor: 'var(--slds-g-color-background-alt)',
                borderBottom: '1px solid var(--slds-g-color-border-base-1)'
              }}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Active Consent Period
                  </div>
                  <div className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    {formatMdy(new Date(activeConsent.startDate))} - {formatMdy(new Date(activeConsent.endDate))} (inclusive)
                  </div>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-300" style={{ borderRadius: '12px', padding: '4px 12px' }}>
                {activeConsent.approvedMedications?.length || 0} Approved
              </Badge>
            </div>

            {/* Approved Medications Grid */}
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                {activeConsent.approvedMedications && activeConsent.approvedMedications.length > 0 ? (
                  activeConsent.approvedMedications.map((med, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{
                        border: '1px solid var(--slds-g-color-border-base-1)',
                        backgroundColor: 'white'
                      }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold truncate" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          {med.name}
                        </div>
                        <div className="text-[12px] truncate" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                          {med.genericName}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-6 text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    No medications approved in this consent
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Consent Modal */}
      <Dialog open={consentModalOpen} onOpenChange={setConsentModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[18px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
              {editingConsent ? 'Edit OTC Consent' : 'Create OTC Consent'}
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Select approved OTC medications and configure consent execution method
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Execution Method Selection */}
            <div>
              <Label className="text-[13px] font-semibold mb-1.5 block">Execution Method *</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConsentFormData({ ...consentFormData, executionMethod: 'docusign' })}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-left",
                    consentFormData.executionMethod === 'docusign'
                      ? "border-[#145F33] bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-5 w-5" style={{ color: '#145F33' }} />
                    <span className="font-semibold text-[14px]">DocuSign</span>
                  </div>
                  <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Send consent electronically for digital signature
                  </p>
                </button>
                
                <button
                  onClick={() => setConsentFormData({ ...consentFormData, executionMethod: 'manual' })}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-left",
                    consentFormData.executionMethod === 'manual'
                      ? "border-[#145F33] bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Upload className="h-5 w-5" style={{ color: '#145F33' }} />
                    <span className="font-semibold text-[14px]">Manual Upload</span>
                  </div>
                  <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Upload a signed consent document manually
                  </p>
                </button>
              </div>
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-[13px] font-semibold mb-1.5 block">
                  Start Date * 
                  {consentFormData.executionMethod === 'manual' && (
                    <span className="font-normal text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      {' '}(Adjustable)
                    </span>
                  )}
                </Label>
                <DateInput
                  id="startDate"
value={isoToMdy(consentFormData.startDate)}
                  onChange={(v) => ((e) => {
                    const newStartDate = e.target.value;
                    const newEndDate = calculateEndDate(newStartDate);
                    setConsentFormData({ 
                      ...consentFormData, 
                      startDate: newStartDate,
                      endDate: newEndDate
                    });
                  })({ target: { value: mdyToIso(v) } })}
                  className="h-9"
                />
              </div>
              
              <div>
                <Label htmlFor="endDate" className="text-[13px] font-semibold mb-1.5 block">
                  End Date (Inclusive) *
                  <span className="font-normal text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    {' '}(1 year - 1 day)
                  </span>
                </Label>
                <DateInput
                  id="endDate"
value={isoToMdy(consentFormData.endDate)}
                  onChange={(v) => ((e) => setConsentFormData({ ...consentFormData, endDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                  className="h-9"
                  disabled={!consentFormData.startDate}
                />
                <p className="text-[11px] mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  Default: {consentFormData.startDate ? calculateEndDate(consentFormData.startDate) : 'Select start date'}
                </p>
              </div>
            </div>

            {/* Standardized OTC Medication List - AC2 */}
            <div>
              <Label className="text-[13px] font-semibold mb-1.5 block">
                Select Approved OTC Medications * 
                <span className="font-normal" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  {' '}({consentFormData.selectedOtcMedications.size} selected)
                </span>
              </Label>
              <p className="text-[12px] mb-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Check all medications that are approved for over-the-counter dispensation. Unselected medications will not be available.
              </p>
              
              <div 
                className="rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: '#F9FAFB'
                }}
              >
                {Object.entries(
                  STANDARDIZED_OTC_MEDICATIONS.reduce((acc, med) => {
                    if (!acc[med.category]) acc[med.category] = [];
                    acc[med.category].push(med);
                    return acc;
                  }, {} as Record<string, typeof STANDARDIZED_OTC_MEDICATIONS>)
                ).map(([category, meds]) => (
                  <div key={category}>
                    <div className="text-[11px] font-bold uppercase tracking-wide mb-1.5 mt-2" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      {category}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {meds.map(med => (
                        <label
                          key={med.id}
                          className="flex items-start gap-2 p-2 rounded cursor-pointer hover:bg-white transition-colors"
                        >
                          <Checkbox
                            checked={consentFormData.selectedOtcMedications.has(med.id)}
                            onCheckedChange={() => handleToggleMedication(med.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium truncate">{med.name}</div>
                            <div className="text-[11px] truncate" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                              {med.genericName}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConsentModalOpen(false);
                resetForm();
              }}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateConsent}
              className="rounded-full"
              style={{ backgroundColor: '#145F33' }}
              disabled={!consentFormData.startDate || !consentFormData.endDate || consentFormData.selectedOtcMedications.size === 0}
            >
              {consentFormData.executionMethod === 'docusign' ? 'Send via DocuSign' : 'Upload Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Upload Confirmation Modal - AC13 */}
      <Dialog open={manualUploadModalOpen} onOpenChange={setManualUploadModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[18px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
              Confirm OTC Selections from Uploaded Document
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Review the uploaded consent document and confirm the OTC medication selections and executed date
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Document Upload/Preview */}
            <div>
              <Label className="text-[13px] font-semibold mb-1.5 block">Upload Signed Consent Document *</Label>
              <div 
                className="rounded-lg p-8 border-2 border-dashed text-center"
                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
              >
                <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-[13px] mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Drag and drop file here, or click to browse
                </p>
                <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  Accepted formats: PDF, JPG, PNG (Max 10MB)
                </p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id="consent-upload"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setConsentFormData({ ...consentFormData, documentFile: e.target.files[0] });
                    }
                  }}
                />
                <Button
                  onClick={() => document.getElementById('consent-upload')?.click()}
                  className="mt-3 rounded-full"
                  variant="outline"
                >
                  Select File
                </Button>
                {consentFormData.documentFile && (
                  <div className="mt-3 text-[13px]" style={{ color: '#145F33' }}>
                    ✓ {consentFormData.documentFile.name}
                  </div>
                )}
              </div>
            </div>

            {/* Executed Date - AC7 */}
            <div>
              <Label htmlFor="executedDate" className="text-[13px] font-semibold mb-1.5 block">
                Executed Date * 
                <span className="font-normal" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  {' '}(Date document was signed)
                </span>
              </Label>
              <DateInput
                id="executedDate"
value={isoToMdy(consentFormData.executedDate)}
                onChange={(v) => ((e) => setConsentFormData({ ...consentFormData, executedDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                className="h-9 max-w-xs"
              />
              <p className="text-[12px] mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Enter the date shown on the signed consent document
              </p>
            </div>

            {/* Confirm OTC Selections */}
            <div>
              <Label className="text-[13px] font-semibold mb-1.5 block">
                Confirm Selected OTC Medications *
                <span className="font-normal" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  {' '}({consentFormData.selectedOtcMedications.size} selected)
                </span>
              </Label>
              <div 
                className="rounded-lg p-4"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: '#FFFBEB'
                }}
              >
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Review the uploaded document and confirm that the medications checked below match those approved on the signed consent form.
                  </p>
                </div>
              </div>
              
              <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
                {Array.from(consentFormData.selectedOtcMedications).map(medId => {
                  const med = STANDARDIZED_OTC_MEDICATIONS.find(m => m.id === medId);
                  if (!med) return null;
                  return (
                    <div 
                      key={medId}
                      className="flex items-center gap-2 p-2 rounded"
                      style={{ backgroundColor: '#F3F4F6' }}
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-[13px] font-medium">{med.name}</span>
                      <span className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        ({med.genericName})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setManualUploadModalOpen(false);
                setConsentModalOpen(true);
              }}
              className="rounded-full"
            >
              Back to Edit
            </Button>
            <Button
              onClick={handleManualUploadConfirmation}
              className="rounded-full"
              style={{ backgroundColor: '#145F33' }}
              disabled={!consentFormData.documentFile || !consentFormData.executedDate || consentFormData.selectedOtcMedications.size === 0}
            >
              Confirm and Activate Consent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Consent Details Modal - Read Only */}
      <Dialog open={viewConsentModalOpen} onOpenChange={setViewConsentModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[18px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
              OTC Consent Record (Read-Only)
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Review complete consent information including dates, status, approved medications, and audit history
            </DialogDescription>
          </DialogHeader>

          {viewingConsent && (
            <div className="space-y-4 py-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[11px] uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Status
                  </Label>
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-semibold",
                      viewingConsent.status === "Active" && "bg-green-100 text-green-800",
                      viewingConsent.status === "Executed" && "bg-blue-100 text-blue-800",
                      viewingConsent.status === "Sent" && "bg-purple-100 text-purple-800",
                      viewingConsent.status === "Draft" && "bg-gray-100 text-gray-800",
                      viewingConsent.status === "Expired" && "bg-red-100 text-red-800"
                    )}
                  >
                    {viewingConsent.status}
                  </span>
                </div>
              </div>

              {/* Consent Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Execution Method
                  </Label>
                  <p className="text-[13px] mt-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    {viewingConsent.executionMethod === 'docusign' ? 'DocuSign' : 'Manual Upload'}
                  </p>
                </div>

                <div>
                  <Label className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Executed Date
                  </Label>
                  <p className="text-[13px] mt-1" style={{ color: viewingConsent.executedDate ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>
                    {viewingConsent.executedDate ? formatMdy(new Date(viewingConsent.executedDate)) : '—'}
                  </p>
                </div>

                <div>
                  <Label className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Start Date
                  </Label>
                  <p className="text-[13px] mt-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    {formatMdy(new Date(viewingConsent.startDate))}
                  </p>
                </div>

                <div>
                  <Label className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    End Date (Inclusive)
                  </Label>
                  <p className="text-[13px] mt-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    {formatMdy(new Date(viewingConsent.endDate))}
                  </p>
                </div>

                <div>
                  <Label className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Approved Medications
                  </Label>
                  <p className="text-[13px] mt-1 font-semibold" style={{ color: '#145F33' }}>
                    {viewingConsent.approvedMedications?.length || 0} medications
                  </p>
                </div>
              </div>

              {/* Audit Information Section - Always Visible */}
              <div
                className="mt-4 pt-4 space-y-3"
                style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}
              >
                <Label className="text-[12px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Audit Information
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      Created By
                    </Label>
                    <p className="text-[13px] mt-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {viewingConsent.createdBy}
                    </p>
                  </div>

                  <div>
                    <Label className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      Created Date
                    </Label>
                    <p className="text-[13px] mt-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {formatMdy(new Date(viewingConsent.createdDate))}
                    </p>
                  </div>

                  <div>
                    <Label className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      Last Modified By
                    </Label>
                    <p className="text-[13px] mt-1" style={{ color: viewingConsent.lastModifiedBy ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>
                      {viewingConsent.lastModifiedBy || '—'}
                    </p>
                  </div>

                  <div>
                    <Label className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      Last Modified Date
                    </Label>
                    <p className="text-[13px] mt-1" style={{ color: viewingConsent.lastModifiedDate ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>
                      {viewingConsent.lastModifiedDate ? formatMdy(new Date(viewingConsent.lastModifiedDate)) : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Approved Medications List */}
              <div
                className="pt-4"
                style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}
              >
                <Label className="text-[13px] font-semibold mb-1.5 block">Approved OTC Medications</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {viewingConsent.approvedMedications?.map((med, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{
                        border: '1px solid var(--slds-g-color-border-base-1)',
                        backgroundColor: 'var(--slds-g-color-background-alt)'
                      }}
                    >
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0" style={{ color: '#145F33' }} />
                      <div>
                        <div className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.name}</div>
                        <div className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                          {med.genericName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attached Document Access - Always Visible */}
              <div
                className="pt-4"
                style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}
              >
                <Label className="text-[13px] font-semibold mb-1.5 block">Attached Document</Label>
                {viewingConsent.documentUrl ? (
                  <Button
                    variant="outline"
                    className="rounded-full w-full"
                    style={{
                      borderColor: '#145F33',
                      color: '#145F33'
                    }}
                    onClick={() => window.open(viewingConsent.documentUrl, '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Consent Document
                  </Button>
                ) : (
                  <p className="text-[13px] text-center py-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    No document attached
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewConsentModalOpen(false)}
              className="rounded-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}