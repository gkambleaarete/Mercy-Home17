import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Bell, AlertTriangle, X, CheckCircle2 } from "@/app/lib/lucide-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { formatMdy } from "../../lib/dateFormat";

interface ConsentRecord {
  id: number;
  youthName: string;
  program: string;
  campus: string;
  status: string;
  startDate: string;
  endDate: string;
  executedDate: string | null;
  programTherapist?: string;
  programDayCoordinator?: string;
}

interface AlertNotification {
  id: number;
  consentId: number;
  youthName: string;
  program: string;
  endDate: string;
  daysUntilExpiration: number;
  weekNumber: number; // Which week of reminders (1, 2, 3)
  recipients: string[]; // Program Therapist, Program Day Coordinator
  createdAt: string;
  dismissed: boolean;
}

interface OTCConsentAlertsProps {
  consents: ConsentRecord[];
  onViewConsent: (consentId: number) => void;
  onRenewConsent: (consentId: number) => void;
}

export function OTCConsentAlerts({
  consents,
  onViewConsent,
  onRenewConsent,
}: OTCConsentAlertsProps) {
  const [showAlertCenter, setShowAlertCenter] = useState(false);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);

  // Defensive check for undefined props
  const safeConsents = consents || [];

  // AC5, AC6, AC7: Generate alerts for consents expiring within 3 weeks
  useEffect(() => {
    const generateAlerts = () => {
      const newAlerts: AlertNotification[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      safeConsents.forEach((consent) => {
        // Only generate alerts for active consents
        if (consent.status !== "Active" && consent.status !== "Executed") {
          return;
        }

        const endDate = new Date(consent.endDate);
        endDate.setHours(23, 59, 59, 999);

        const daysUntilExpiration = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // AC5: Identify consents 3 weeks (21 days) prior to expiration
        if (daysUntilExpiration > 0 && daysUntilExpiration <= 21) {
          // AC6: Determine which week of reminders (weekly reminders)
          let weekNumber = 3; // Default to week 3 (1-7 days)
          if (daysUntilExpiration > 14) {
            weekNumber = 1; // Week 1 (15-21 days)
          } else if (daysUntilExpiration > 7) {
            weekNumber = 2; // Week 2 (8-14 days)
          }

          // AC7: Alert recipients - Program Therapist and Program Day Coordinator
          const recipients = [];
          if (consent.programTherapist) {
            recipients.push(consent.programTherapist);
          }
          if (consent.programDayCoordinator) {
            recipients.push(consent.programDayCoordinator);
          }

          newAlerts.push({
            id: Date.now() + consent.id,
            consentId: consent.id,
            youthName: consent.youthName,
            program: consent.program,
            endDate: consent.endDate,
            daysUntilExpiration,
            weekNumber,
            recipients,
            createdAt: new Date().toISOString(),
            dismissed: false,
          });
        }
      });

      setAlerts(newAlerts);
    };

    generateAlerts();
  }, [safeConsents]);

  const activeAlerts = alerts.filter((alert) => !alert.dismissed);

  const handleDismissAlert = (alertId: number) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === alertId ? { ...alert, dismissed: true } : alert))
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatMdy(date);
  };

  const getPriorityLevel = (daysUntilExpiration: number) => {
    if (daysUntilExpiration <= 7) return "high";
    if (daysUntilExpiration <= 14) return "medium";
    return "low";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return { bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" };
      case "medium":
        return { bg: "#FEF3C7", border: "#FED7AA", text: "#D97706" };
      case "low":
        return { bg: "#F0F9FF", border: "#BAE6FD", text: "#0369A1" };
      default:
        return { bg: "#F8F9FA", border: "#E5E7EB", text: "#6B7280" };
    }
  };

  return (
    <>
      {/* Alert Bell Icon - AC7: Task notifications */}
      <div className="relative">
        <button
          onClick={() => setShowAlertCenter(true)}
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          style={{ border: "1px solid var(--slds-g-color-border-base-1)" }}
        >
          <Bell className="h-5 w-5" style={{ color: "#145F33" }} />
          {activeAlerts.length > 0 && (
            <span
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: "#DC2626" }}
            >
              {activeAlerts.length}
            </span>
          )}
        </button>
      </div>

      {/* Alert Center Modal */}
      <Dialog open={showAlertCenter} onOpenChange={setShowAlertCenter}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>OTC Consent Alerts & Notifications</DialogTitle>
            <DialogDescription>
              Task notifications for consents requiring attention. Weekly reminders are sent until consents are renewed or expire.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-12" style={{ color: "var(--slds-g-color-text-weak)" }}>
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-[14px] font-medium">No Active Alerts</p>
                <p className="text-[12px] mt-1">All consents are in good standing</p>
              </div>
            ) : (
              activeAlerts.map((alert) => {
                const priority = getPriorityLevel(alert.daysUntilExpiration);
                const colors = getPriorityColor(priority);

                return (
                  <div
                    key={alert.id}
                    className="rounded-lg overflow-hidden"
                    style={{
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.bg,
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: colors.text }} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-[14px] font-semibold" style={{ color: colors.text }}>
                                OTC Consent Expiring Soon
                              </h3>
                              <Badge
                                className="text-[10px] uppercase"
                                style={{
                                  backgroundColor: colors.text,
                                  color: "white",
                                  borderRadius: "8px",
                                  padding: "2px 6px",
                                }}
                              >
                                Week {alert.weekNumber} Reminder
                              </Badge>
                            </div>

                            <div className="space-y-2 mb-3">
                              <div className="text-[13px]" style={{ color: colors.text }}>
                                <strong>Youth:</strong> {alert.youthName}
                              </div>
                              <div className="text-[13px]" style={{ color: colors.text }}>
                                <strong>Program:</strong> {alert.program}
                              </div>
                              <div className="text-[13px]" style={{ color: colors.text }}>
                                <strong>End Date:</strong> {formatDate(alert.endDate)}
                              </div>
                              <div className="text-[13px] font-semibold" style={{ color: colors.text }}>
                                <strong>Days Until Expiration:</strong> {alert.daysUntilExpiration} days
                              </div>
                            </div>

                            {/* AC7: Recipients */}
                            <div className="text-[12px] mb-3" style={{ color: colors.text }}>
                              <strong>Assigned To:</strong>{" "}
                              {alert.recipients.length > 0 ? alert.recipients.join(", ") : "Program Staff"}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-[12px]"
                                onClick={() => {
                                  onViewConsent(alert.consentId);
                                  setShowAlertCenter(false);
                                }}
                              >
                                View Consent
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 px-3 text-[12px]"
                                style={{ backgroundColor: "#145F33", color: "white" }}
                                onClick={() => {
                                  onRenewConsent(alert.consentId);
                                  setShowAlertCenter(false);
                                  handleDismissAlert(alert.id);
                                }}
                              >
                                Renew Consent
                              </Button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <X className="h-4 w-4" style={{ color: colors.text }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Info Note */}
          {activeAlerts.length > 0 && (
            <div
              className="p-4 rounded-lg mt-4"
              style={{
                backgroundColor: "#F0F9FF",
                border: "1px solid #BAE6FD",
              }}
            >
              <p className="text-[12px]" style={{ color: "#0C4A6E" }}>
                <strong>Note:</strong> These alerts are automatically generated 3 weeks before consent expiration. 
                Weekly reminders will continue until the consent is renewed or expires.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}