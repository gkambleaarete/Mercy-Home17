import { ChevronDown, Pencil } from "@/app/lib/lucide-icons"
import { cn } from "../../lib/utils"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"

// `id` is the stable identifier used for matching/routing; `label` is only
// ever rendered as display text. They're equal for every pre-existing item
// (kept that way so nothing else changes), but Friends First's "Applications"
// tab needs a distinct id since it shares a display label with Tutor's.
const NAV_ITEMS = [
  {
    label: "Admissions",
    id: "Admissions",
    active: false,
    disabled: false,
    module: "admissions",
    hasDropdown: false,
  },
  {
    label: "Contact Log",
    id: "Contact Log",
    active: false,
    disabled: false,
    module: "contact-log",
    hasDropdown: false,
  },
  {
    label: "Dashboard",
    id: "Dashboard",
    active: false,
    disabled: false,
    module: "admissions",
    hasDropdown: false,
  },
  {
    label: "Projections & Waitlist",
    id: "Projections & Waitlist",
    active: false,
    disabled: false,
    module: "admissions",
    hasDropdown: false,
  },
  {
    label: "Constituents",
    id: "Constituents",
    active: false,
    disabled: false,
    module: "constituents",
    hasDropdown: false,
  },
  {
    label: "Community Care",
    id: "Community Care",
    active: false,
    disabled: false,
    module: "community-care",
    hasDropdown: false,
  },
  {
    label: "My Members",
    id: "CC My Members",
    active: false,
    disabled: false,
    module: "community-care",
    hasDropdown: false,
  },
  {
    label: "My Tasks",
    id: "CC My Tasks",
    active: false,
    disabled: false,
    module: "community-care",
    hasDropdown: false,
  },
  {
    label: "Program",
    id: "Program",
    active: false,
    disabled: false,
    module: "program",
    hasDropdown: false,
  },
  {
    label: "Pass",
    id: "Pass",
    active: false,
    disabled: false,
    module: "program",
    hasDropdown: false,
  },
  {
    label: "Program Log",
    id: "Program Log",
    active: false,
    disabled: false,
    module: "program-log",
    hasDropdown: false,
  },
  {
    label: "Medications",
    id: "Medications",
    active: false,
    disabled: false,
    module: "medications",
    hasDropdown: false,
  },
  {
    label: "ITPs",
    id: "ITPs",
    active: false,
    disabled: false,
    module: "itps",
    hasDropdown: false,
  },
  {
    label: "Incident Reports",
    id: "Incident Reports",
    active: false,
    disabled: false,
    module: "ir",
    hasDropdown: false,
  },
  {
    label: "Classes",
    id: "Classes",
    active: false,
    disabled: false,
    module: "classes",
    hasDropdown: false,
  },
  {
    label: "Applications",
    id: "Applications",
    active: false,
    disabled: false,
    module: "tutor",
    hasDropdown: false,
  },
  {
    label: "Tutor Matches",
    id: "Tutor Matches",
    active: false,
    disabled: false,
    module: "tutor",
    hasDropdown: false,
  },
  {
    label: "Tutor Search",
    id: "Tutor Search",
    active: false,
    disabled: false,
    module: "tutor",
    hasDropdown: false,
  },
  {
    label: "Applications",
    id: "FF Applications",
    active: false,
    disabled: false,
    module: "friends-first",
    hasDropdown: false,
  },
  {
    label: "Mentee Referral",
    id: "Mentee Referral",
    active: false,
    disabled: false,
    module: "friends-first",
    hasDropdown: false,
  },
  {
    label: "Mentor Search",
    id: "Mentor Search",
    active: false,
    disabled: false,
    module: "friends-first",
    hasDropdown: false,
  },
  {
    label: "Mentee Search",
    id: "Mentee Search",
    active: false,
    disabled: false,
    module: "friends-first",
    hasDropdown: false,
  },
  {
    label: "Mentor Match",
    id: "Mentor Match",
    active: false,
    disabled: false,
    module: "friends-first",
    hasDropdown: false,
  },
  {
    label: "Reports",
    id: "Reports",
    active: false,
    disabled: false,
    module: "reports",
    hasDropdown: false,
  },
]

const MODULES = [
  { value: "admissions", label: "Admissions" },
  { value: "constituents", label: "Constituents" },
  { value: "community-care", label: "Community Care" },
  { value: "program", label: "Program" },
  { value: "program-log", label: "Program Log" },
  { value: "contact-log", label: "Contact Log" },
  { value: "medications", label: "Medications" },
  { value: "itps", label: "ITPs" },
  { value: "ir", label: "IR" },
  { value: "classes", label: "Classes" },
  { value: "tutor", label: "ECR Tutor" },
  { value: "friends-first", label: "Friends First" },
  { value: "reports", label: "Reports" },
]

interface NavbarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const [selectedModule, setSelectedModule] = useState<string>("admissions")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [tabDropdownOpen, setTabDropdownOpen] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const tabDropdownRef = useRef<HTMLDivElement>(null)
  const tabButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
  })
  const [tabDropdownPosition, setTabDropdownPosition] = useState({
    top: 0,
    left: 0,
  })

  // Update selected module based on active tab
  useEffect(() => {
    const activeNavItem = NAV_ITEMS.find((item) => item.id === activeTab)
    if (activeNavItem && activeNavItem.module !== selectedModule) {
      setSelectedModule(activeNavItem.module)
    }
  }, [activeTab, selectedModule])

  // Update dropdown position when it opens
  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
      })
    }
  }, [isDropdownOpen])

  // Update tab dropdown position when it opens
  useEffect(() => {
    if (tabDropdownOpen) {
      const buttonEl = tabButtonRefs.current.get(tabDropdownOpen)
      if (buttonEl) {
        const rect = buttonEl.getBoundingClientRect()
        setTabDropdownPosition({
          top: rect.bottom + 4,
          left: rect.left,
        })
      }
    }
  }, [tabDropdownOpen])

  // Keyboard: opening the module menu focuses the current module, so a
  // keyboard user lands inside the portaled menu (it isn't in Tab order).
  useEffect(() => {
    if (!isDropdownOpen) return
    const menu = dropdownRef.current
    const items = menu?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')
    ;(
      menu?.querySelector<HTMLButtonElement>('[aria-current="true"]') ??
      items?.[0]
    )?.focus()
  }, [isDropdownOpen])

  const handleModuleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'),
    )
    const i = items.indexOf(document.activeElement as HTMLButtonElement)
    const move = (next: number) => {
      e.preventDefault()
      items[(next + items.length) % items.length]?.focus()
    }
    if (e.key === "ArrowDown") move(i + 1)
    else if (e.key === "ArrowUp") move(i - 1)
    else if (e.key === "Home") move(0)
    else if (e.key === "End") move(items.length - 1)
    else if (e.key === "Escape" || e.key === "Tab") {
      e.preventDefault()
      setIsDropdownOpen(false)
      buttonRef.current?.focus()
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node

      // Handle module dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsDropdownOpen(false)
      }

      // Handle tab dropdown
      if (tabDropdownOpen) {
        const buttonEl = tabButtonRefs.current.get(tabDropdownOpen)
        if (
          tabDropdownRef.current &&
          !tabDropdownRef.current.contains(target) &&
          buttonEl &&
          !buttonEl.contains(target)
        ) {
          setTabDropdownOpen(null)
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [tabDropdownOpen])

  // Filter nav items based on selected module
  const filteredNavItems = NAV_ITEMS.filter(
    (item) => item.module === selectedModule,
  )

  const handleModuleChange = (moduleValue: string) => {
    setSelectedModule(moduleValue)
    setIsDropdownOpen(false)

    // Switch to the first tab of the selected module
    const firstTabOfModule = NAV_ITEMS.find(
      (item) => item.module === moduleValue,
    )
    if (firstTabOfModule) {
      onTabChange(firstTabOfModule.id)
    }
  }

  const currentModule = MODULES.find((m) => m.value === selectedModule)

  // Tutor and Friends First get their sibling tabs on their own row below
  // the module dropdown, instead of inline with it like every other module.
  const showTabsOnSecondRow =
    selectedModule === "tutor" ||
    selectedModule === "friends-first" ||
    selectedModule === "community-care"

  const moduleDropdown = (
    <div className="relative mr-4" ref={dropdownRef}>
      <button
        ref={buttonRef}
        className="flex items-center gap-1 px-3 py-1 transition-colors whitespace-nowrap rounded"
        style={{
          fontSize: "var(--slds-g-font-size-5)",
          fontWeight: 600,
          color: "var(--slds-g-color-text-default)",
          backgroundColor: isDropdownOpen
            ? "var(--slds-g-color-background-alt-2)"
            : "transparent",
        }}
        onMouseEnter={(e) => {
          if (!isDropdownOpen) {
            e.currentTarget.style.backgroundColor =
              "var(--slds-g-color-background-alt-2)"
          }
        }}
        onMouseLeave={(e) => {
          if (!isDropdownOpen) {
            e.currentTarget.style.backgroundColor = "transparent"
          }
        }}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-haspopup="menu"
        aria-expanded={isDropdownOpen}
      >
        {currentModule?.label}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isDropdownOpen && "rotate-180",
          )}
        />
      </button>
      {isDropdownOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            role="menu"
            aria-label="Modules"
            onKeyDown={handleModuleMenuKeyDown}
            className="fixed bg-white rounded-md overflow-hidden"
            style={{
              minWidth: "180px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              border: "1px solid var(--slds-g-color-border-base-1)",
              zIndex: 9999,
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            {MODULES.map((module, index) => (
              <button
                key={module.value}
                role="menuitem"
                aria-current={
                  selectedModule === module.value ? "true" : undefined
                }
                className={cn(
                  // inset ring: the menu is overflow-hidden
                  "block w-full px-4 py-2.5 text-left transition-colors text-[13px] focus-visible:outline-offset-[-2px]",
                  selectedModule === module.value
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50",
                )}
                onClick={() => handleModuleChange(module.value)}
                style={{
                  borderBottom:
                    index < MODULES.length - 1
                      ? "1px solid var(--slds-g-color-border-base-1)"
                      : "none",
                }}
              >
                {module.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  )

  const tabsList = (
    <ul className="flex items-center h-full gap-1">
      {filteredNavItems.map((item) => {
        // Check if this tab or any of its dropdown items are active
        const isActive = item.hasDropdown
          ? item.dropdownItems?.some(
              (dropItem) => dropItem.value === activeTab,
            ) || false
          : activeTab === item.id

        const isDropdownOpenForThisTab = tabDropdownOpen === item.id

        return (
          <li key={item.id} className="h-full relative">
            <button
              ref={(el) => {
                if (el) {
                  tabButtonRefs.current.set(item.id, el)
                }
              }}
              onClick={() => {
                if (item.disabled) return

                if (item.hasDropdown) {
                  // Toggle dropdown for this tab
                  setTabDropdownOpen(isDropdownOpenForThisTab ? null : item.id)
                } else {
                  // Navigate to regular tab
                  onTabChange(item.id)
                }
              }}
              disabled={item.disabled}
              className={cn(
                "h-full flex items-center gap-1 transition-colors relative whitespace-nowrap",
                !item.disabled &&
                  !isActive &&
                  "hover:bg-[var(--slds-g-color-background-alt-2)]",
                item.disabled ? "opacity-50 cursor-not-allowed" : "",
              )}
              style={{
                paddingLeft: "var(--slds-c-spacing-small)",
                paddingRight: "var(--slds-c-spacing-small)",
                fontSize: "var(--slds-g-font-size-4)",
                fontWeight: 500,
                color: isActive
                  ? "var(--color-brand-primary)"
                  : "var(--slds-g-color-text-default)",
              }}
              aria-current={isActive ? "page" : undefined}
              aria-haspopup={item.hasDropdown ? "true" : undefined}
              aria-expanded={
                item.hasDropdown ? isDropdownOpenForThisTab : undefined
              }
            >
              {item.label}
              {item.hasDropdown && (
                <ChevronDown
                  className={cn(
                    "h-3 w-3 opacity-50 ml-1 transition-transform",
                    isDropdownOpenForThisTab && "rotate-180",
                  )}
                />
              )}

              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-sm"
                  style={{
                    backgroundColor: "var(--color-brand-primary)",
                  }}
                />
              )}
            </button>

            {/* Tab Dropdown Menu */}
            {item.hasDropdown &&
              isDropdownOpenForThisTab &&
              createPortal(
                <div
                  ref={tabDropdownRef}
                  className="fixed bg-white rounded-md overflow-hidden"
                  style={{
                    minWidth: "200px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    border: "1px solid var(--slds-g-color-border-base-1)",
                    zIndex: 9999,
                    top: `${tabDropdownPosition.top}px`,
                    left: `${tabDropdownPosition.left}px`,
                  }}
                >
                  {item.dropdownItems?.map((dropItem, index) => (
                    <button
                      key={dropItem.value}
                      className={cn(
                        "block w-full px-4 py-2.5 text-left transition-colors text-[13px]",
                        activeTab === dropItem.value
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50",
                      )}
                      onClick={() => {
                        onTabChange(dropItem.value)
                        setTabDropdownOpen(null)
                      }}
                      style={{
                        borderBottom:
                          index < (item.dropdownItems?.length || 0) - 1
                            ? "1px solid var(--slds-g-color-border-base-1)"
                            : "none",
                      }}
                    >
                      {dropItem.label}
                    </button>
                  ))}
                </div>,
                document.body,
              )}
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="relative">
      <nav
        className={cn(
          "h-[40px] app-scroll-strip items-center px-4 relative",
          !showTabsOnSecondRow && "shadow-sm",
        )}
        style={{
          backgroundColor: "var(--slds-g-color-background-base)",
          borderBottom: "1px solid var(--slds-g-color-border-base-1)",
          zIndex: 10,
        }}
        role="navigation"
        aria-label="Primary Navigation"
      >
        {moduleDropdown}
        {!showTabsOnSecondRow && tabsList}
      </nav>

      {showTabsOnSecondRow && (
        <nav
          className="h-[40px] app-scroll-strip items-center px-4 shadow-sm relative"
          style={{
            backgroundColor: "var(--slds-g-color-background-base)",
            borderBottom: "1px solid var(--slds-g-color-border-base-1)",
            zIndex: 9,
          }}
          role="navigation"
          aria-label="Tutor Tabs"
        >
          {tabsList}
        </nav>
      )}
    </div>
  )
}
