import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "@/app/lib/lucide-icons";

export interface MedCode {
    code: string;
    label: string;
    type: string;
    tooltip: string;
}

interface MedCodePickerProps {
    codes: MedCode[];
    value: string;
    onChange: (value: string) => void;
    allowNull?: boolean;
    placeholder?: string;
    id?: string;
    hasError?: boolean;
}

export function MedCodePicker({
    codes,
    value,
    onChange,
    allowNull = false,
    placeholder = "Select a code...",
    id,
    hasError = false,
}: MedCodePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredCode, setHoveredCode] = useState<string | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
                setHoveredCode(null);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const selectedCode = codes.find(c => `${c.code} -- ${c.label}` === value);
    const tooltipText = hoveredCode ? codes.find(c => c.code === hoveredCode)?.tooltip : null;

    const borderColor = hasError ? "#c23934" : isOpen ? "#145F33" : "var(--slds-g-color-border-base-1)";

    return (
        <div ref={ref} className="relative" id={id}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(o => !o)}
                className="h-9 w-full px-3 flex items-center justify-between rounded slds-text-4 focus:outline-none"
                style={{
                    border: `1px solid ${borderColor}`,
                    backgroundColor: "var(--slds-g-color-background-base)",
                    color: value ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)",
                    boxShadow: isOpen ? "0 0 0 2px #145F3340" : "none",
                }}
            >
                <span className="truncate">
                    {selectedCode
                        ? <><span className="font-semibold" style={{ color: "#0176d3" }}>{selectedCode.code}</span> — {selectedCode.label}</>
                        : value || placeholder
                    }
                </span>
                <ChevronDown
                    className="h-4 w-4 flex-shrink-0 ml-2 transition-transform"
                    style={{ color: "var(--slds-g-color-text-weak)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div
                    className="absolute left-0 right-0 top-full mt-1 z-50 rounded shadow-lg"
                    style={{
                        border: "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: "var(--slds-g-color-background-base)",
                    }}
                >
                    {/* Scrollable list */}
                    <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                        {allowNull && (
                            <button
                                type="button"
                                onClick={() => { onChange(""); setIsOpen(false); setHoveredCode(null); }}
                                className="w-full px-3 py-2 text-left slds-text-4 transition-colors"
                                style={{
                                    borderBottom: "1px solid var(--slds-g-color-border-base-1)",
                                    color: "var(--slds-g-color-text-weak)",
                                    backgroundColor: value === "" ? "#f0faf4" : "transparent",
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#f9f9f9"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = value === "" ? "#f0faf4" : "transparent"; }}
                            >
                                — No code —
                            </button>
                        )}
                        {codes.map(c => {
                            const fullValue = `${c.code} -- ${c.label}`;
                            const isSelected = value === fullValue;
                            return (
                                <button
                                    key={c.code}
                                    type="button"
                                    onClick={() => { onChange(fullValue); setIsOpen(false); setHoveredCode(null); }}
                                    onMouseEnter={() => setHoveredCode(c.code)}
                                    onMouseLeave={() => setHoveredCode(null)}
                                    className="w-full px-3 py-2 text-left slds-text-4 transition-colors flex items-center gap-2"
                                    style={{
                                        backgroundColor: isSelected ? "#f0faf4" : hoveredCode === c.code ? "#f5f5f5" : "transparent",
                                        borderBottom: "1px solid var(--slds-g-color-border-base-1)",
                                        color: isSelected ? "#145F33" : "var(--slds-g-color-text-default)",
                                    }}
                                >
                                    <span
                                        className="font-mono font-semibold flex-shrink-0"
                                        style={{ fontSize: "11px", color: isSelected ? "#145F33" : "#0176d3", width: "36px" }}
                                    >
                                        {c.code}
                                    </span>
                                    <span className="flex-1 truncate">{c.label}</span>
                                    {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#145F33" }} />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tooltip bar — sticky at bottom of dropdown */}
                    <div
                        className="px-3 py-2 slds-text-3 transition-all"
                        style={{
                            borderTop: "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor: tooltipText ? "#145F33" : "var(--slds-g-color-background-alt)",
                            color: tooltipText ? "white" : "var(--slds-g-color-text-weak)",
                            minHeight: "30px",
                        }}
                    >
                        {tooltipText || "Hover over a code to see its description"}
                    </div>
                </div>
            )}
        </div>
    );
}
