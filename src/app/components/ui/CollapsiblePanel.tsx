import { useState } from "react";
import { ChevronDown } from "@/app/lib/lucide-icons";
import { cn } from "../../lib/utils";

interface CollapsiblePanelProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsiblePanel({ title, children, defaultOpen = true, className }: CollapsiblePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("bg-white rounded-[18px] shadow-sm border border-border", className)}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center px-4 py-3 bg-[#f3f4f6] hover:bg-gray-200 transition-colors rounded-t-[18px] border-b border-border text-left focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-gray-300"
      >
        <ChevronDown className={cn("h-4 w-4 mr-2 transition-transform text-gray-500", !isOpen && "-rotate-90")} />
        <div className="text-base font-medium text-gray-900 flex items-center gap-2 flex-1">{title}</div>
      </button>
      {isOpen && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
