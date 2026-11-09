import * as React from "react";

import { cn } from "./utils";

export interface ContactMetaItem {
  icon: React.ElementType;
  label: string;
}

export interface ContactMetaRowProps {
  items: ContactMetaItem[];
  className?: string;
}

// Icon + text pairs joined by a middle-dot separator (phone, email, address,
// etc. under a record header). Previously hand-copied identically in the
// Contact Meta Row showcase AND the Record Header composite -- one real
// consumer's worth of duplication already, likely more once record headers
// elsewhere in the app adopt it.
function ContactMetaRow({ items, className }: ContactMetaRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-[length:var(--slds-g-font-size-4)] text-[var(--slds-g-color-text-weak)]",
        className,
      )}
    >
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <span aria-hidden="true">•</span>}
          <span className="flex items-center gap-1.5">
            <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

export { ContactMetaRow };
