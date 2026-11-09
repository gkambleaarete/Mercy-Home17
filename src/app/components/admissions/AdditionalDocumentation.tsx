import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Plus, Pencil, Trash2, Search } from '@/app/lib/lucide-icons';
import { toast } from "sonner";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface DocumentationReceived {
  id: number;
  documentationType: string;
  organizationName: string;
  roi: string;
  sent: string;
  followUp: string;
  received: string;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  address?: string;
}

interface AdditionalDocumentationProps {
  // Optional: can pass initial data from parent
  initialDocumentation?: DocumentationReceived[];
  initialOrganizations?: Organization[];
}

export function AdditionalDocumentation({ 
  initialDocumentation = [],
  initialOrganizations = []
}: AdditionalDocumentationProps) {
  // Documentation State
  const [documentationReceived, setDocumentationReceived] = useState<DocumentationReceived[]>(
    initialDocumentation.length > 0 ? initialDocumentation : [
      { 
        id: 1, 
        documentationType: "Psychological Record", 
        organizationName: "Chicago Mental Health Center", 
        roi: "12/15/2024", 
        sent: "12/20/2024", 
        followUp: "Awaiting response from records dept", 
        received: "01/10/2025" 
      },
      { 
        id: 2, 
        documentationType: "School Record", 
        organizationName: "Lincoln Elementary", 
        roi: "12/18/2024", 
        sent: "12/22/2024", 
        followUp: "Contact principal if not received by 1/20", 
        received: "01/15/2025" 
      },
      { 
        id: 3, 
        documentationType: "Health Record", 
        organizationName: "St. Mary's Hospital", 
        roi: "01/05/2025", 
        sent: "01/08/2025", 
        followUp: "", 
        received: "" 
      }
    ]
  );

  // Organization State
  const [organizations, setOrganizations] = useState<Organization[]>(
    initialOrganizations.length > 0 ? initialOrganizations : [
      { id: "org-1", name: "Chicago Mental Health Center", type: "Hospital", address: "123 Health St, Chicago, IL" },
      { id: "org-2", name: "Lincoln Elementary", type: "School", address: "456 Education Ave, Chicago, IL" },
      { id: "org-3", name: "St. Mary's Hospital", type: "Hospital", address: "789 Medical Blvd, Chicago, IL" },
      { id: "org-4", name: "Roosevelt High School", type: "School", address: "321 Learning Ln, Chicago, IL" },
      { id: "org-5", name: "Washington Middle School", type: "School", address: "321 Learning Ln, Chicago, IL" },
      { id: "org-6", name: "Jefferson Academy", type: "School", address: "789 Academy Rd, Chicago, IL" },
      { id: "org-7", name: "Community Wellness Clinic", type: "Clinic", address: "654 Care Dr, Chicago, IL" },
      { id: "org-8", name: "Holy Cross Academy", type: "School", address: "987 Faith Blvd, Chicago, IL" }
    ]
  );

  // Dialog States
  const [docReceivedDialogOpen, setDocReceivedDialogOpen] = useState(false);
  const [editingDocReceivedId, setEditingDocReceivedId] = useState<number | null>(null);
  const [docReceivedFormData, setDocReceivedFormData] = useState({
    documentationType: "",
    organizationName: "",
    roi: "",
    sent: "",
    followUp: "",
    received: ""
  });

  // New Organization Modal States
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [newOrgFormData, setNewOrgFormData] = useState({
    name: "",
    type: "",
    address: ""
  });

  // Organization search
  const [orgSearchQuery, setOrgSearchQuery] = useState("");
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  // Filtered organizations based on search
  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(orgSearchQuery.toLowerCase()) ||
    org.type.toLowerCase().includes(orgSearchQuery.toLowerCase())
  );

  // Documentation Handlers
  const handleAddDocReceived = () => {
    setEditingDocReceivedId(null);
    setDocReceivedFormData({
      documentationType: "",
      organizationName: "",
      roi: "",
      sent: "",
      followUp: "",
      received: ""
    });
    setOrgSearchQuery("");
    setDocReceivedDialogOpen(true);
  };

  const handleEditDocReceived = (doc: DocumentationReceived) => {
    setEditingDocReceivedId(doc.id);
    setDocReceivedFormData({
      documentationType: doc.documentationType,
      organizationName: doc.organizationName,
      roi: doc.roi,
      sent: doc.sent,
      followUp: doc.followUp,
      received: doc.received
    });
    setOrgSearchQuery(doc.organizationName);
    setDocReceivedDialogOpen(true);
  };

  const handleDeleteDocReceived = (id: number) => {
    setDocumentationReceived(documentationReceived.filter(doc => doc.id !== id));
    toast.success("Documentation deleted successfully");
  };

  const handleSaveDocReceived = () => {
    // Validation
    if (!docReceivedFormData.documentationType) {
      toast.error("Documentation Type is required");
      return;
    }
    if (!docReceivedFormData.organizationName) {
      toast.error("Organization Name is required");
      return;
    }

    if (editingDocReceivedId !== null) {
      // Edit existing
      setDocumentationReceived(
        documentationReceived.map(doc =>
          doc.id === editingDocReceivedId
            ? { id: doc.id, ...docReceivedFormData }
            : doc
        )
      );
      toast.success("Documentation updated successfully");
    } else {
      // Add new
      const newId = Math.max(0, ...documentationReceived.map(d => d.id)) + 1;
      setDocumentationReceived([
        ...documentationReceived,
        { id: newId, ...docReceivedFormData }
      ]);
      toast.success("Documentation added successfully");
    }

    setDocReceivedDialogOpen(false);
    setEditingDocReceivedId(null);
    setDocReceivedFormData({
      documentationType: "",
      organizationName: "",
      roi: "",
      sent: "",
      followUp: "",
      received: ""
    });
    setOrgSearchQuery("");
  };

  // New Organization Handlers
  const handleOpenNewOrgModal = () => {
    setNewOrgFormData({ name: "", type: "", address: "" });
    setOrgModalOpen(true);
  };

  const handleSaveNewOrg = () => {
    if (!newOrgFormData.name || !newOrgFormData.type) {
      toast.error("Organization name and type are required");
      return;
    }

    const newOrgId = `org-${Date.now()}`;
    const newOrg: Organization = {
      id: newOrgId,
      name: newOrgFormData.name,
      type: newOrgFormData.type,
      address: newOrgFormData.address
    };

    setOrganizations([...organizations, newOrg]);
    
    // Auto-select the newly created organization
    setDocReceivedFormData({
      ...docReceivedFormData,
      organizationName: newOrg.name
    });
    setOrgSearchQuery(newOrg.name);
    
    setOrgModalOpen(false);
    setNewOrgFormData({ name: "", type: "", address: "" });
    toast.success("Organization added successfully");
  };

  // Truncate text helper
  const truncateText = (text: string, maxLength: number = 30) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <>
      {/* Additional Documentation Received Table */}
      <div 
        className="overflow-hidden"
        style={{
          border: '1px solid var(--slds-g-color-border-base-1)',
          borderRadius: 'var(--slds-c-card-radius-border)',
          backgroundColor: 'var(--slds-g-color-background-base)'
        }}
      >
        <div 
          className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
          style={{
            borderBottom: '1px solid var(--slds-g-color-border-base-1)',
            backgroundColor: 'var(--slds-g-color-background-alt)'
          }}
        >
          <h3 className="text-[13px] font-semibold text-[#080707]">
            Additional Documentation Received ({documentationReceived.length})
          </h3>
          <Button
            size="sm"
            onClick={handleAddDocReceived}
            className="h-7 text-[11px] rounded-full bg-[#145F33] hover:bg-[#0f4a26] text-white w-full sm:w-auto"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                  <th className="text-left py-2 px-3 text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    DOCUMENTATION TYPE
                  </th>
                  <th className="text-left py-2 px-3 text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    ORGANIZATION NAME
                  </th>
                  <th className="text-left py-2 px-3 text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    ROI
                  </th>
                  <th className="text-left py-2 px-3 text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    SENT
                  </th>
                  <th className="text-left py-2 px-3 text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    FOLLOW UP
                  </th>
                  <th className="text-left py-2 px-3 text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    RECEIVED
                  </th>
                  <th className="text-left py-2 px-3 text-[11px] font-semibold w-20" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {documentationReceived.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      No documentation received yet
                    </td>
                  </tr>
                ) : (
                  documentationReceived.map((doc, index) => (
                    <tr key={doc.id} style={{ borderBottom: index < documentationReceived.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                      <td className="py-3 px-3 text-[13px] text-[#080707]">
                        {doc.documentationType}
                      </td>
                      <td className="py-3 px-3 text-[13px] text-[#080707]">
                        {doc.organizationName}
                      </td>
                      <td className="py-3 px-3 text-[13px] text-[#080707]">
                        {doc.roi || '—'}
                      </td>
                      <td className="py-3 px-3 text-[13px] text-[#080707]">
                        {doc.sent || '—'}
                      </td>
                      <td className="py-3 px-3 text-[13px] text-[#080707]" title={doc.followUp}>
                        {truncateText(doc.followUp) || '—'}
                      </td>
                      <td className="py-3 px-3 text-[13px] text-[#080707]">
                        {doc.received || '—'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditDocReceived(doc)}
                            className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                            title="Edit"
                            aria-label="Edit documentation"
                          >
                            <Pencil className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                          </button>
                          <button
                            onClick={() => handleDeleteDocReceived(doc.id)}
                            className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                            title="Delete"
                            aria-label="Delete documentation"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-[#c23934]" />
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
      </div>

      {/* Add/Edit Documentation Dialog */}
      <Dialog open={docReceivedDialogOpen} onOpenChange={setDocReceivedDialogOpen}>
        <DialogContent 
          className="sm:max-w-[600px]"
          style={{
            backgroundColor: 'var(--slds-g-color-background-base)',
            border: '1px solid var(--slds-g-color-border-base-1)'
          }}
        >
          <DialogHeader style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', paddingBottom: '12px' }}>
            <DialogTitle className="text-[15px] font-semibold text-[#080707]">
              {editingDocReceivedId !== null ? 'Edit Documentation' : 'Add Documentation'}
            </DialogTitle>
            <DialogDescription className="text-[12px] mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              {editingDocReceivedId !== null 
                ? 'Update the documentation details below.' 
                : 'Enter documentation details for the organization.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Documentation Type - Required */}
            <div>
              <Label 
                htmlFor="doc-type" 
                className="block text-[11px] font-medium mb-1.5"
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                DOCUMENTATION TYPE <span className="text-red-600">*</span>
              </Label>
              <Select 
                value={docReceivedFormData.documentationType} 
                onValueChange={(value) => setDocReceivedFormData({...docReceivedFormData, documentationType: value})}
              >
                <SelectTrigger 
                  id="doc-type"
                  className="h-9 text-[13px] rounded"
                  style={{ borderColor: 'var(--slds-g-color-border-base-4)' }}
                >
                  <SelectValue placeholder="Select documentation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Psychological Record">Psychological Record</SelectItem>
                  <SelectItem value="School Record">School Record</SelectItem>
                  <SelectItem value="Health Record">Health Record</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Organization Name - Required with Search and New Button */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label 
                  htmlFor="org-name" 
                  className="text-[11px] font-medium"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  ORGANIZATION NAME <span className="text-red-600">*</span>
                </Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleOpenNewOrgModal}
                  className="h-7 text-[11px] px-2.5 rounded-full bg-[#145F33] hover:bg-[#0f4a26] text-white"
                  aria-label="Create new organization"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  New
                </Button>
              </div>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                  <Input
                    id="org-name"
                    value={orgSearchQuery}
                    onChange={(e) => {
                      setOrgSearchQuery(e.target.value);
                      setShowOrgDropdown(true);
                    }}
                    onFocus={() => setShowOrgDropdown(true)}
                    placeholder="Search organizations..."
                    className="h-9 text-[13px] rounded pl-9"
                    style={{ borderColor: 'var(--slds-g-color-border-base-4)' }}
                  />
                </div>
                {showOrgDropdown && orgSearchQuery && (
                  <div 
                    className="absolute z-50 w-full mt-1 rounded shadow-lg max-h-60 overflow-auto"
                    style={{
                      backgroundColor: 'var(--slds-g-color-background-base)',
                      border: '1px solid var(--slds-g-color-border-base-1)'
                    }}
                  >
                    {filteredOrganizations.length > 0 ? (
                      filteredOrganizations.map((org) => (
                        <button
                          key={org.id}
                          type="button"
                          onClick={() => {
                            setDocReceivedFormData({...docReceivedFormData, organizationName: org.name});
                            setOrgSearchQuery(org.name);
                            setShowOrgDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[#f3f3f3] transition-colors border-b"
                          style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                          <div className="text-[13px] text-[#080707] font-medium">{org.name}</div>
                          <div className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            {org.type} {org.address && `• ${org.address}`}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        No organizations found. Click "New" to add one.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ROI Date */}
            <div>
              <Label 
                htmlFor="roi-date" 
                className="block text-[11px] font-medium mb-1.5"
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                ROI (DATE)
              </Label>
              <DateInput
                id="roi-date"
value={isoToMdy(docReceivedFormData.roi)}
                onChange={(v) => ((e) => setDocReceivedFormData({...docReceivedFormData, roi: e.target.value}))({ target: { value: mdyToIso(v) } })}
                className="h-9 text-[13px] rounded"
                style={{ borderColor: 'var(--slds-g-color-border-base-4)' }}
              />
            </div>

            {/* Sent Date */}
            <div>
              <Label 
                htmlFor="sent-date" 
                className="block text-[11px] font-medium mb-1.5"
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                SENT (DATE)
              </Label>
              <DateInput
                id="sent-date"
value={isoToMdy(docReceivedFormData.sent)}
                onChange={(v) => ((e) => setDocReceivedFormData({...docReceivedFormData, sent: e.target.value}))({ target: { value: mdyToIso(v) } })}
                className="h-9 text-[13px] rounded"
                style={{ borderColor: 'var(--slds-g-color-border-base-4)' }}
              />
            </div>

            {/* Follow Up */}
            <div>
              <Label 
                htmlFor="follow-up" 
                className="block text-[11px] font-medium mb-1.5"
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                FOLLOW UP
              </Label>
              <Textarea
                id="follow-up"
                value={docReceivedFormData.followUp}
                onChange={(e) => setDocReceivedFormData({...docReceivedFormData, followUp: e.target.value})}
                className="text-[13px] rounded min-h-[60px]"
                style={{ borderColor: 'var(--slds-g-color-border-base-4)' }}
                placeholder="Enter follow-up notes..."
              />
            </div>

            {/* Received Date */}
            <div>
              <Label 
                htmlFor="received-date" 
                className="block text-[11px] font-medium mb-1.5"
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                RECEIVED (DATE)
              </Label>
              <DateInput
                id="received-date"
value={isoToMdy(docReceivedFormData.received)}
                onChange={(v) => ((e) => setDocReceivedFormData({...docReceivedFormData, received: e.target.value}))({ target: { value: mdyToIso(v) } })}
                className="h-9 text-[13px] rounded"
                style={{ borderColor: 'var(--slds-g-color-border-base-4)' }}
              />
            </div>
          </div>
          <DialogFooter 
            className="gap-2"
            style={{
              borderTop: '1px solid var(--slds-g-color-border-base-1)',
              paddingTop: '12px'
            }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDocReceivedDialogOpen(false);
                setOrgSearchQuery("");
              }}
              className="h-8 text-[13px] rounded"
              style={{ borderColor: 'var(--slds-g-color-border-base-4)' }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveDocReceived}
              className="h-8 text-[13px] rounded bg-[#145F33] hover:bg-[#0f4a26] text-white"
            >
              {editingDocReceivedId !== null ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Organization Dialog */}
      <Dialog open={orgModalOpen} onOpenChange={setOrgModalOpen}>
        <DialogContent 
          className="sm:max-w-[500px]"
          style={{
            backgroundColor: 'var(--slds-g-color-background-base)',
            border: '1px solid var(--slds-g-color-border-base-1)'
          }}
        >
          <DialogHeader style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', paddingBottom: '12px' }}>
            <DialogTitle className="text-[15px] font-semibold text-[#080707]">
              New Organization
            </DialogTitle>
            <DialogDescription className="text-[12px] mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Add a new organization to the system for future documentation requests.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Organization Name - Required */}
            <div>
              <Label 
                htmlFor="new-org-name" 
                className="block text-[11px] font-medium mb-1.5"
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                ORGANIZATION NAME <span className="text-red-600">*</span>
              </Label>
              <Input
                id="new-org-name"
                value={newOrgFormData.name}
                onChange={(e) => setNewOrgFormData({...newOrgFormData, name: e.target.value})}
                placeholder="Enter organization name"
                className="h-9 text-[13px] rounded"
                style={{ borderColor: 'var(--slds-g-color-border-base-4)' }}
              />
            </div>

            {/* Organization Type - Required */}
            <div>
              <Label 
                htmlFor="new-org-type" 
                className="block text-[11px] font-medium mb-1.5"
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                TYPE <span className="text-red-600">*</span>
              </Label>
              <Select 
                value={newOrgFormData.type} 
                onValueChange={(value) => setNewOrgFormData({...newOrgFormData, type: value})}
              >
                <SelectTrigger 
                  id="new-org-type"
                  className="h-9 text-[13px] rounded"
                  style={{ borderColor: 'var(--slds-g-color-border-base-4)' }}
                >
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="School">School</SelectItem>
                  <SelectItem value="Hospital">Hospital</SelectItem>
                  <SelectItem value="Clinic">Clinic</SelectItem>
                  <SelectItem value="Mental Health Center">Mental Health Center</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Address - Optional */}
            <div>
              <Label 
                htmlFor="new-org-address" 
                className="block text-[11px] font-medium mb-1.5"
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                ADDRESS
              </Label>
              <Input
                id="new-org-address"
                value={newOrgFormData.address}
                onChange={(e) => setNewOrgFormData({...newOrgFormData, address: e.target.value})}
                placeholder="Enter address (optional)"
                className="h-9 text-[13px] rounded"
                style={{ borderColor: 'var(--slds-g-color-border-base-4)' }}
              />
            </div>
          </div>
          <DialogFooter 
            className="gap-2"
            style={{
              borderTop: '1px solid var(--slds-g-color-border-base-1)',
              paddingTop: '12px'
            }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => setOrgModalOpen(false)}
              className="h-8 text-[13px] rounded"
              style={{ borderColor: 'var(--slds-g-color-border-base-4)' }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveNewOrg}
              className="h-8 text-[13px] rounded bg-[#145F33] hover:bg-[#0f4a26] text-white"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}