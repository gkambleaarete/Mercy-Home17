import { useRef, useState } from "react";
import {
  Search,
  Settings,
  Bell,
  HelpCircle,
  Plus,
  Grip,
  User,
  Palette,
  Ticket,
  MessageSquare,
  Link2,
} from "@/app/lib/lucide-icons";
import { ContactLogDialogSLDS } from "../ContactLogDialogSLDS";
import { addContactLogFromDialog } from "../../data/mockContactLogs";
import { requestGlobalAction } from "../../lib/globalActions";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { usePassDialog } from "../../contexts/PassDialogContext";
import { CURRENT_USER_CAN_CREATE_PASS } from "../../data/mockPassData";
import logoImage from "figma:asset/b68435cf54d0f1090d2e0f4c67d8cd752e193b0b.png";
import { useNavigate } from "react-router";

export function GlobalHeader() {
  const navigate = useNavigate();
  // Global Actions (+). The header sits outside <Routes>, so dialogs opened
  // here render over the current page without unmounting it.
  const { openCreate } = usePassDialog();
  const [contactLogOpen, setContactLogOpen] = useState(false);
  const globalActionsRef = useRef<HTMLButtonElement>(null);
  return (
    <header
      className="h-[50px] flex items-center justify-between sticky top-0 z-50"
      style={{
        backgroundColor: "var(--slds-g-color-background-base)",
        borderBottom:
          "1px solid var(--slds-g-color-border-base-1)",
        paddingLeft: "var(--slds-c-spacing-medium)",
        paddingRight: "var(--slds-c-spacing-medium)",
        boxShadow: "var(--slds-g-shadow-1)",
      }}
      role="banner"
    >
      {/* Left: App Launcher & Logo */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img
            src={logoImage}
            alt="Mercy Home for Boys & Girls"
            className="h-[40px] w-auto object-contain hidden md:block px-[4px] py-[2px]"
          />
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: "var(--slds-g-color-text-weak)" }}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search..."
            className="w-full rounded-full focus:outline-none focus:ring-2 transition-shadow"
            style={{
              paddingLeft: "2.5rem",
              paddingRight: "var(--slds-c-spacing-medium)",
              paddingTop: "var(--slds-c-spacing-xx-small)",
              paddingBottom: "var(--slds-c-spacing-xx-small)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              fontSize: "var(--slds-g-font-size-4)",
              color: "var(--slds-g-color-text-default)",
              borderRadius:
                "var(--slds-c-button-radius-border)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor =
                "var(--color-brand-primary)";
              e.currentTarget.style.outline =
                "2px solid var(--color-brand-primary)";
              e.currentTarget.style.outlineOffset = "0";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                "var(--slds-g-color-border-base-1)";
              e.currentTarget.style.outline = "none";
            }}
            aria-label="Global Search"
          />
        </div>
      </div>

      {/* Right: Global Actions */}
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              ref={globalActionsRef}
              variant="ghost"
              size="icon"
              title="Global Actions"
              aria-label="Global Actions"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              Global Actions
            </DropdownMenuLabel>
            {/* Existing New Contact Log dialog, saved through the shared
                Contact Log record path */}
            <DropdownMenuItem
              onSelect={() => setContactLogOpen(true)}
            >
              <MessageSquare /> New Contact Log
            </DropdownMenuItem>
            {/* Existing Add Connection modal, owned by the UtilityBar */}
            <DropdownMenuItem
              onSelect={() =>
                requestGlobalAction("add-connection")
              }
            >
              <Link2 /> Add Connection
            </DropdownMenuItem>
            {/* New Pass (20004) — only this item depends on Pass create access */}
            {CURRENT_USER_CAN_CREATE_PASS && (
              <DropdownMenuItem
                // Youth and Program start blank on every page; focus
                // returns to this Global Actions button on close.
                onSelect={() =>
                  openCreate({
                    returnFocusTo: () => globalActionsRef.current,
                  })
                }
              >
                <Ticket /> New Pass
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          title="Design Tokens & Brand Book"
          aria-label="Design Tokens & Brand Book"
          style={{ color: "var(--slds-g-color-text-weak)" }}
          onClick={() => navigate("/design-tokens")}
        >
          <Palette className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Help"
          aria-label="Help"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Setup"
          aria-label="Setup"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          <Settings className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Notifications"
          aria-label="Notifications"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          <Bell className="h-5 w-5" />
        </Button>

        <div className="ml-2">
          <button
            className="h-8 w-8 rounded-full flex items-center justify-center relative cursor-pointer transition-opacity hover:opacity-80"
            style={{
              backgroundColor: "rgb(208,223,214)",
              color: "#145F33",
            }}
            aria-label="User Profile"
          >
            <User className="h-5 w-5" />
            <div
              className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor:
                  "var(--slds-g-color-error-base-50)",
                border:
                  "2px solid var(--slds-g-color-background-base)",
              }}
              aria-label="Unread notifications"
            ></div>
          </button>
        </div>
      </div>
      <ContactLogDialogSLDS
        isOpen={contactLogOpen}
        onClose={() => setContactLogOpen(false)}
        // The dialog shows its own success toast, as on the Contact Log page.
        onSubmit={(data) => addContactLogFromDialog(data)}
      />
    </header>
  );
}