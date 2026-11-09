import type { ReactNode } from "react";
import { ShieldAlert, Clock } from "@/app/lib/lucide-icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { EmptyState } from "../ui/empty-state";

interface MedicationGlobalDestinationProps {
  title: string;
  /** Whether the user's authorized Program scope allows this worklist. */
  canView: boolean;
  onBackToHome: () => void;
  /** Buttons shown at the right of the title, vertically centered. */
  actions?: ReactNode;
  /** The worklist shows its own title inside its card; keep the page
   *  heading for screen readers only. */
  hideTitle?: boolean;
  /** The worklist itself. Until it exists, a "not yet available" notice
   *  shows — never fabricated rows, counts or an all-clear. */
  children?: ReactNode;
}

// Shared frame of the two global Medication worklists: breadcrumb, title
// (the breadcrumb links back to Medication Home).
export function MedicationGlobalDestination({
  title,
  canView,
  onBackToHome,
  actions,
  hideTitle,
  children,
}: MedicationGlobalDestinationProps) {
  return (
    <div className="app-page-x pb-6 pt-4 flex flex-col gap-[var(--app-content-gap)]">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button type="button" onClick={onBackToHome}>
                  Medication Home
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {hideTitle ? (
        <h2 className="sr-only">{title}</h2>
      ) : (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="slds-page-header-title">{title}</h2>
          {canView && actions}
        </div>
      )}
      {canView ? (
        (children ?? (
          <EmptyState
            icon={Clock}
            title="Not yet available"
            description="This worklist hasn't been built yet."
          />
        ))
      ) : (
        <EmptyState
          icon={ShieldAlert}
          title="No access to this worklist"
          description="You don't have access to medication records for any Program."
        />
      )}
    </div>
  );
}