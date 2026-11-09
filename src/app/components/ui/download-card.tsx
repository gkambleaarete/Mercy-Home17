import * as React from "react";

import { cn } from "./utils";
import { Card } from "./card";
import { Button } from "./button";
import { Download } from "@/app/lib/lucide-icons";

export interface DownloadCardProps {
  title: string;
  description: string;
  /** File extension shown on the button, e.g. "json". */
  format: string;
  onDownload: () => void;
  className?: string;
}

// Zero real consumers -- was a page-local helper (DlCard) living inside the
// showcase file itself rather than the component library, so nothing else
// in the app could actually import it.
function DownloadCard({
  title,
  description,
  format,
  onDownload,
  className,
}: DownloadCardProps) {
  return (
    <Card
      variant="section"
      surface="alt"
      className={cn("flex-row items-center justify-between p-4 gap-4", className)}
    >
      <div>
        <p className="text-[length:var(--slds-g-font-size-5)] font-medium">
          {title}
        </p>
        <p className="text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
          {description}
        </p>
      </div>
      <Button
        variant="default"
        size="sm"
        onClick={onDownload}
        className="text-[length:var(--slds-g-font-size-4)]"
      >
        <Download className="h-4 w-4" />.{format}
      </Button>
    </Card>
  );
}

export { DownloadCard };
