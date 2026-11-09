// Overall Connections (US 20093) — prototype destination. Lists every
// Connection held by the shared stores (auto-created Tutor Sessions and
// each youth's saved connections) with the standard Connections table,
// filters, pagination and Connection/Details dialog. Proposed navigation:
// a "Connections" module in the main module selector at /connections.

import { ConnectionsSection } from "../admissions/ConnectionsSection";

export function ConnectionsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 pb-16 sm:p-6 sm:pb-16 space-y-4">
        <div>
          <h1 className="text-[20px] font-bold text-[var(--slds-g-color-text-default)]">
            Connections
          </h1>
          <p
            className="text-[13px]"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            All connections across youth, including Tutor
            Sessions created automatically from Tutor Matches.
          </p>
        </div>
        <ConnectionsSection mode="all" />
      </div>
    </div>
  );
}