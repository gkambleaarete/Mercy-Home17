import { FileText, Calendar, User, CheckCircle2, XCircle, Download } from "@/app/lib/lucide-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { OTCConsent } from "./OTCConsentsView";
import { STANDARDIZED_OTC_LIST } from "./CreateOTCConsentModal";
import { formatMdy } from "../../lib/dateFormat";

interface OTCConsentDetailsModalProps {
  consent: OTCConsent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OTCConsentDetailsModal({ consent, open, onOpenChange }: OTCConsentDetailsModalProps) {
  // Get not approved OTCs
  const notApprovedOTCs = STANDARDIZED_OTC_LIST.filter(otc => !consent.selectedOTCs.includes(otc));

  // Calculate system status
  const getSystemStatus = () => {
    if (consent.status !== "Executed") return consent.status;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(consent.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(consent.endDate);
    end.setHours(0, 0, 0, 0);

    if (today >= start && today <= end) {
      return "Active";
    } else if (today > end) {
      return "Expired";
    }
    return "Executed";
  };

  const systemStatus = getSystemStatus();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Active":
        return { color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" };
      case "Executed":
        return { color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200" };
      case "Sent":
        return { color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" };
      case "Draft":
        return { color: "text-gray-700", bgColor: "bg-gray-50", borderColor: "border-gray-200" };
      case "Expired":
        return { color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200" };
      default:
        return { color: "text-gray-700", bgColor: "bg-gray-50", borderColor: "border-gray-200" };
    }
  };

  const statusConfig = getStatusConfig(systemStatus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold flex items-center gap-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
            <FileText className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
            OTC Consent Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Banner */}
          <div 
            className="rounded-lg p-4"
            style={{ 
              border: '1px solid #d8dde6'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  Consent Status
                </p>
                <p className={`text-[15px] font-semibold ${statusConfig.color}`}>
                  {systemStatus}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  Execution Method
                </p>
                <Badge variant="outline" className="text-[12px]">
                  {consent.executionMethod}
                </Badge>
              </div>
            </div>
          </div>

          {/* Consent Information */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Executed Date
              </Label>
              <p className="text-[13px] mt-1 flex items-center gap-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                <Calendar className="h-4 w-4" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                {formatMdy(new Date(consent.executedDate))}
              </p>
            </div>
            <div>
              <Label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Start Date
              </Label>
              <p className="text-[13px] mt-1 flex items-center gap-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                <Calendar className="h-4 w-4" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                {formatMdy(new Date(consent.startDate))}
              </p>
            </div>
            <div>
              <Label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                End Date (Inclusive)
              </Label>
              <p className="text-[13px] mt-1 flex items-center gap-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                <Calendar className="h-4 w-4" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                {formatMdy(new Date(consent.endDate))}
              </p>
            </div>
          </div>

          {/* Document Link */}
          {consent.documentUrl && (
            <div 
              className="rounded-lg p-4 border"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-neutral-base-95)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                  >
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Signed Consent Document
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      {consent.documentUrl.split('/').pop()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(consent.documentUrl, '_blank')}
                  className="h-8 px-3 text-[13px] gap-2"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            </div>
          )}

          {/* Approved OTC Medications */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <Label className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Approved OTC Medications ({consent.selectedOTCs.length})
              </Label>
            </div>
            <div 
              className="rounded-lg border p-4"
              style={{
                border: '1px solid rgba(195, 230, 203, 0.5)',
                backgroundColor: 'rgba(212, 237, 218, 0.25)'
              }}
            >
              <div className="grid grid-cols-2 gap-2">
                {consent.selectedOTCs.map((otc) => (
                  <div key={otc} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-[13px] text-[#155724]">{otc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Not Approved OTC Medications */}
          {notApprovedOTCs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <Label className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Not Approved OTC Medications ({notApprovedOTCs.length})
                </Label>
              </div>
              <div 
                className="rounded-lg border p-4"
                style={{
                  border: '1px solid rgba(245, 198, 203, 0.5)',
                  backgroundColor: 'rgba(248, 215, 218, 0.25)'
                }}
              >
                <div className="grid grid-cols-2 gap-2">
                  {notApprovedOTCs.map((otc) => (
                    <div key={otc} className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      <span className="text-[13px] text-[#721c24]">{otc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                These medications are not available for use under this consent.
              </p>
            </div>
          )}

          {/* Audit Information */}
          <div 
            className="rounded-lg p-4 border"
            style={{
              border: '1px solid var(--slds-g-color-border-base-1)',
              backgroundColor: 'var(--slds-g-color-neutral-base-95)'
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Audit Trail
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                  <p className="text-[11px] font-medium" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Created By
                  </p>
                </div>
                <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  {consent.createdBy}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  {formatMdy(new Date(consent.createdDate))}
                </p>
              </div>
              {consent.lastModifiedBy && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                    <p className="text-[11px] font-medium" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      Last Modified By
                    </p>
                  </div>
                  <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    {consent.lastModifiedBy}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    {consent.lastModifiedDate && formatMdy(new Date(consent.lastModifiedDate))}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Data Integrity Notice */}
          <div 
            className="rounded-lg p-3 border"
            style={{
              border: '1px solid rgba(209, 236, 241, 0.5)',
              backgroundColor: 'rgba(209, 236, 241, 0.25)'
            }}
          >
            <p className="text-[12px] text-[#0c5460]">
              <strong>Note:</strong> OTC consent records are fully auditable and cannot be deleted. OTC selections cannot be directly edited after execution. Any changes require creating a new consent record.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 text-[13px] rounded-full"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}